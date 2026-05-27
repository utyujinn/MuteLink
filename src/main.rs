use std::{
    io::{self, Write},
    thread,
    time::Duration,
};
use windows::{
    core::*,
    Foundation::TypedEventHandler,
    Media::SpeechRecognition::*,
    Win32::System::Com::{CoInitializeEx, COINIT_MULTITHREADED},
};

fn main() {
    if let Err(e) = run() {
        // 0x80045509 = SPERR_SPEECH_PRIVACY_POLICY_NOT_ACCEPTED
        if e.code() == HRESULT(0x80045509u32 as i32) {
            eprintln!("エラー: 音声認識のプライバシーポリシーが未承認です。");
            eprintln!("  設定 → プライバシーとセキュリティ → 音声認識");
            eprintln!("  → 「オンライン音声認識」をオンにしてください。");
        } else {
            eprintln!("エラー: {e}");
        }
    }
}

fn run() -> Result<()> {
    // WinRT は MTA（マルチスレッド）で初期化する
    unsafe { CoInitializeEx(None, COINIT_MULTITHREADED).ok()? };

    eprintln!("[1] SpeechRecognizer 作成");
    // デフォルトコンストラクタ = システムの言語を使用（日本語等に自動対応）
    let recognizer = SpeechRecognizer::new()?;

    eprintln!("[2] ディクテーション制約を追加");
    let constraint = SpeechRecognitionTopicConstraint::Create(
        SpeechRecognitionScenario::Dictation,
        &HSTRING::from("dictation"),
    )?;
    recognizer.Constraints()?.Append(&constraint)?;

    eprintln!("[3] 制約をコンパイル（音声モデル読み込み）");
    let compile = recognizer.CompileConstraintsAsync()?.get()?;
    if compile.Status()? != SpeechRecognitionResultStatus::Success {
        eprintln!("制約コンパイル失敗: {:?}", compile.Status()?);
        return Err(Error::empty());
    }

    let session = recognizer.ContinuousRecognitionSession()?;

    eprintln!("[4] イベントハンドラ登録");

    // 認識中の仮テキスト（SpeechRecognizer に直接登録）
    let hyp_handler: TypedEventHandler<
        SpeechRecognizer,
        SpeechRecognitionHypothesisGeneratedEventArgs,
    > = TypedEventHandler::new(
        |_, ev: Ref<'_, SpeechRecognitionHypothesisGeneratedEventArgs>| {
            if let Some(ev) = ev.as_ref() {
                if let Ok(hyp) = ev.Hypothesis() {
                    if let Ok(text) = hyp.Text() {
                        print!("\r[...] {:<60}", text);
                        io::stdout().flush().ok();
                    }
                }
            }
            Ok(())
        },
    );
    recognizer.HypothesisGenerated(&hyp_handler)?;

    // 確定テキスト（セッションに登録）
    let result_handler: TypedEventHandler<
        SpeechContinuousRecognitionSession,
        SpeechContinuousRecognitionResultGeneratedEventArgs,
    > = TypedEventHandler::new(
        |_, ev: Ref<'_, SpeechContinuousRecognitionResultGeneratedEventArgs>| {
            if let Some(ev) = ev.as_ref() {
                if let Ok(result) = ev.Result() {
                    if let Ok(text) = result.Text() {
                        print!("\r");
                        println!("{}", text);
                        io::stdout().flush().ok();
                    }
                }
            }
            Ok(())
        },
    );
    session.ResultGenerated(&result_handler)?;

    eprintln!("[5] 連続認識を開始");
    session.StartAsync()?.get()?;

    println!("リアルタイム音声認識開始。話しかけてください... (Ctrl+C で終了)");
    io::stdout().flush().ok();

    loop {
        thread::sleep(Duration::from_secs(3600));
    }
}

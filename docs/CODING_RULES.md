# コーディング規約

## ディレクトリ構成(正本)

```text
Mutelink/
  tauri-src/
    src/                       # フロントエンド(フレームワーク無し、素のHTML/JS/CSS)
      index.html                # 全画面のマークアップ(メイン画面+設定モーダル)
      main.js                   # 全ロジック。1ファイルに集約(2900行超だが機能ごとに
                                 # セクションコメントで区切られている)。I18N辞書もここ。
      styles.css
      assets/
    src-tauri/
      src/
        lib.rs                   # エントリポイント。VOICEVOX合成、OSC送信、OpenVR初期化、
                                   # ホットキー状態、invoke_handler![]でのコマンド登録
        main.rs                  # `fn main() { tauri_src_lib::run() }` のみ
        sense_voice.rs            # ローカルSTT(SenseVoice/Whisper、sherpa-onnx経由)。
                                   # モデルのダウンロード・ロード・推論
        audio_device.rs           # Windows既定の録音/再生デバイス切り替え(COM経由)
        overlay.rs / overlay_gpu.rs  # VR内HUD(Direct3D11)の描画
      build.rs                   # tauri_build::build() + onnxruntime.dllの差し替え
                                   # (sherpa-onnx-sysが同梱するバージョンがAPI不一致で
                                   # クラッシュするための回避策。理由はbuild.rs内コメント参照)
      capabilities/default.json   # Tauri v2のパーミッション定義
      tauri.conf.json             # bundle.resources、バージョン、identifier等
      voicevox_core/               # gitignore対象。VOICEVOXのONNXモデル一式(README参照)
      sense_voice/                 # gitignore対象。ダウンロードしたSTTモデル(開発時はここ、
                                   # 配布ビルドではexe相対、詳細はsense_voice.rsのコメント)
  python/                          # 使われていない過去の実験コード(FunASR検討時の名残、参考のみ)
  docs/
  TASK.md
  CLAUDE.md
  README.md
```

新しいRustコマンド/モジュールを追加するときは、既存の粒度(1機能=1ファイル、
`sense_voice.rs`・`audio_device.rs` のような)に合わせる。`lib.rs` に何でも足さない。

## コメントの書き方

- **「何をしているか」ではなく「なぜそうしているか」を書く。** 変数名・関数名で分かることを
  コメントで繰り返さない。
- 非自明な制約・過去に踏んだ罠・回避策には必ず理由を残す。例:
  - なぜ `sherpa-onnx` を `"shared"` フィーチャーでリンクしているか(CRTリンク衝突)
  - なぜ `build.rs` でonnxruntime.dllを上書きしているか(APIバージョン不一致でクラッシュ)
  - なぜ `hotkey_state` が(中身は同期処理なのに)`async fn` なのか(メインスレッドの
    Win32メッセージポンプを圧迫しないため)
- 過去に取り組んだタスクや修正した不具合の名前をコメントに残さない(「〜のfixで追加」等)。
  それはコミットメッセージに書く内容で、コードは将来腐る参照を持つべきではない。
- デバッグ用の `eprintln!`/`console.log` は原因特定後に必ず削除する(残したまま次のタスクに
  進まない)。

## I18N(多言語対応)

- UI文言は `main.js` の `I18N` オブジェクトに `{ ja, en, zh, ko }` の4言語すべてを必ず追加する。
  1言語でも欠けるとその言語のUIで英語キー名がそのまま表示される。
- HTML側は `data-i18n="キー名"` (テキスト)または `data-i18n-*` (属性)で参照する。
- キーを追加・削除したら、HTML側の参照とJS辞書のキーが一致しているか確認する。手作業ではなく、
  以下のようなワンライナーで機械的に突き合わせるとよい(このセッションで実際に使った方法):

  ```sh
  node -e "
  const fs = require('fs');
  const html = fs.readFileSync('tauri-src/src/index.html', 'utf8');
  const js = fs.readFileSync('tauri-src/src/main.js', 'utf8');
  const htmlKeys = new Set([...html.matchAll(/data-i18n(?:-\w+)?=\"([^\"]+)\"/g)].map(m => m[1]));
  // I18N辞書をブレース深さで抽出してキー一覧を取り、htmlKeysとの差分を見る
  "
  ```

- 表示テキストに動的な数値(ファイルサイズ等)を埋め込む場合、文言側にハードコードするか
  (このプロジェクトの既存パターン)、Rust側を単一のソースにしてJSがフォーマットするかを
  一貫させる。混在させない。

## Rust側のパターン

- **重い/ブロッキングな処理は `spawn_blocking` に包む。** `async fn` コマンドの中で直接CPU拘束の
  同期処理(ONNX Runtimeのモデルロード等)を呼ぶと、そのタスクを実行しているスレッドを長時間止め、
  結果的にアプリ全体が固まって見える。`tauri::async_runtime::spawn_blocking` に包み、`State` は
  `'static` にできないので `AppHandle` を渡してクロージャ内で `app.state::<T>()` を取り直す。
- **exe相対パスの解決は `voicevox_dir()`/`stt_models_dir()` と同じパターンに合わせる**:
  デバッグビルドでは `CARGO_MANIFEST_DIR` 基準、リリースビルドでは `current_exe()` の親ディレクトリ
  基準。ビルド時の絶対パスを焼き込まない(過去に踏んだ不具合、TASK.md 4番参照)。
- ダウンロードするモデル/リソースは `.gitignore` に必ず追加する。追加を忘れると、`tauri dev`の
  ファイル監視がダウンロード中のファイルをソース変更と誤認し、ダウンロード中にアプリが再起動して
  中断する(このセッションで実際に踏んだ不具合)。
- 非同期コマンドのUIハング調査で分かったこと: WebView2への応答配信はメインスレッドのWin32
  メッセージポンプ経由(`tao`の`EventLoopProxy`)で行われる。メインスレッドを塞ぐ可能性のある
  同期処理(GPU呼び出し・高頻度ポーリング等)は疑ってかかること。ただし実際の原因はコード側の
  バグではなくCSSの詳細度(`[hidden]`がクラスの`display`に負けていた)だったケースもあるため、
  「応答が返ってこないように見える」ときはRust側のログ(`eprintln!`)とJS側両方を疑う。

## フロントエンド側のパターン

- 表示/非表示の切り替えは要素の `.hidden` プロパティで行う。ただしCSS側で対象要素のクラスが
  `display` を明示的に指定している場合、`[hidden] { display: none }` (UAスタイルシート)が
  負けて見た目上消えないことがある。新しく `hidden` を使う要素を追加したら、対応するクラスに
  `.クラス名[hidden] { display: none; }` を明示しておくと安全。
- Windows + Git Bash環境で `node -e "..."` にファイルパスを渡すときは、Windows形式のパス
  (`C:/Users/...`)を使う。`/c/Users/...` 形式(Git Bashの表記)をそのまま渡すと、ネイティブの
  Windows版Nodeが解決に失敗する。
- ヘッドレスEdge (`msedge --headless --dump-dom`) やPowerShellでの `Get-Process` (CPU使用率の
  差分・`.Responding`)は、実機で動かさずにレンダリング結果やハング状態を確認する手段として有効。

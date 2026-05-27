use std::sync::mpsc::{Receiver, Sender};
use windows::{
    core::*,
    Foundation::TypedEventHandler,
    Globalization::Language,
    Media::SpeechRecognition::*,
    Win32::System::Com::{CoInitializeEx, COINIT_MULTITHREADED},
};

pub enum Command {
    Start { lang: String, punct: bool },
    Stop,
}

pub enum SpeechEvent {
    Languages(Vec<(String, String)>),
    Hypothesis(String),
    Final(String),
    Started,
    Stopped,
    SessionEnded,
    State(SpeechRecognizerState),
    Error(String),
}

#[derive(Clone, Copy, PartialEq)]
pub enum SpeechRecognizerState {
    Idle,
    Capturing,
    Processing,
    SoundStarted,
    SoundEnded,
    SpeechDetected,
    Paused,
    Unknown,
}

pub fn run_thread(rx: Receiver<Command>, tx: Sender<SpeechEvent>) {
    unsafe { let _ = CoInitializeEx(None, COINIT_MULTITHREADED); };

    match available_languages() {
        Ok(langs) => { tx.send(SpeechEvent::Languages(langs)).ok(); }
        Err(e) => { tx.send(SpeechEvent::Error(e.to_string())).ok(); }
    }

    let mut active: Option<ActiveSession> = None;

    while let Ok(cmd) = rx.recv() {
        drop(active.take()); // stop previous session (Drop calls StopAsync)
        match cmd {
            Command::Start { lang: lang_tag, punct } => {
                eprintln!("[speech] Starting session for {lang_tag} punct={punct}");
                match ActiveSession::new(&lang_tag, punct, tx.clone()) {
                    Ok(s) => {
                        eprintln!("[speech] Session started OK");
                        tx.send(SpeechEvent::Started).ok();
                        active = Some(s);
                    }
                    Err(e) => {
                        eprintln!("[speech] Session start error: {e}");
                        tx.send(SpeechEvent::Error(e.to_string())).ok();
                    }
                }
            }
            Command::Stop => {
                tx.send(SpeechEvent::Stopped).ok();
            }
        }
    }
}

fn available_languages() -> Result<Vec<(String, String)>> {
    let view = SpeechRecognizer::SupportedTopicLanguages()?;
    let count = view.Size()?;
    let mut result = Vec::with_capacity(count as usize);
    for i in 0..count {
        let lang = view.GetAt(i)?;
        let tag = lang.LanguageTag()?.to_string();
        let name = lang.DisplayName()?.to_string();
        result.push((tag, name));
    }
    Ok(result)
}

struct ActiveSession {
    recognizer: SpeechRecognizer,
    session: SpeechContinuousRecognitionSession,
    hyp_token: i64,
    result_token: i64,
    state_token: i64,
    completed_token: i64,
}

impl ActiveSession {
    fn new(lang_tag: &str, punct: bool, tx: Sender<SpeechEvent>) -> Result<Self> {
        let lang = Language::CreateLanguage(&HSTRING::from(lang_tag))?;
        let recognizer = SpeechRecognizer::Create(&lang)?;

        let scenario = if punct {
            SpeechRecognitionScenario::Dictation
        } else {
            SpeechRecognitionScenario::WebSearch
        };
        let constraint = SpeechRecognitionTopicConstraint::Create(
            scenario,
            &HSTRING::from("dictation"),
        )?;
        recognizer.Constraints()?.Append(&constraint)?;

        let compiled = recognizer.CompileConstraintsAsync()?.get()?;
        if compiled.Status()? != SpeechRecognitionResultStatus::Success {
            return Err(Error::empty());
        }

        let session = recognizer.ContinuousRecognitionSession()?;

        // 無音タイムアウトを 1 時間に延ばす（デフォルト数秒で止まるのを防ぐ）
        session.SetAutoStopSilenceTimeout(windows::Foundation::TimeSpan {
            Duration: 36_000_000_000, // 1 hour in 100-ns ticks
        })?;

        let tx1 = tx.clone();
        let hyp_token = recognizer.HypothesisGenerated(&TypedEventHandler::new(
            move |_, ev: Ref<'_, SpeechRecognitionHypothesisGeneratedEventArgs>| {
                if let Some(ev) = ev.as_ref() {
                    if let Ok(h) = ev.Hypothesis() {
                        if let Ok(text) = h.Text() {
                            tx1.send(SpeechEvent::Hypothesis(text.to_string())).ok();
                        }
                    }
                }
                Ok(())
            },
        ))?;

        let tx2 = tx.clone();
        let result_token = session.ResultGenerated(&TypedEventHandler::new(
            move |_, ev: Ref<'_, SpeechContinuousRecognitionResultGeneratedEventArgs>| {
                if let Some(ev) = ev.as_ref() {
                    if let Ok(result) = ev.Result() {
                        if let Ok(text) = result.Text() {
                            let s = text.to_string();
                            if !s.is_empty() {
                                tx2.send(SpeechEvent::Final(s)).ok();
                            }
                        }
                    }
                }
                Ok(())
            },
        ))?;

        let tx_comp = tx.clone();
        let completed_token = session.Completed(&TypedEventHandler::new(
            move |_, ev: Ref<'_, SpeechContinuousRecognitionCompletedEventArgs>| {
                if let Some(ev) = ev.as_ref() {
                    let status = ev.Status().unwrap_or(SpeechRecognitionResultStatus::Unknown);
                    eprintln!("[speech] Completed status={}", status.0);
                    tx_comp.send(SpeechEvent::SessionEnded).ok();
                }
                Ok(())
            },
        ))?;

        let tx3 = tx;
        let state_token = recognizer.StateChanged(&TypedEventHandler::new(
            move |_, ev: Ref<'_, SpeechRecognizerStateChangedEventArgs>| {
                if let Some(ev) = ev.as_ref() {
                    let state = match ev.State().unwrap_or(windows::Media::SpeechRecognition::SpeechRecognizerState::Idle) {
                        windows::Media::SpeechRecognition::SpeechRecognizerState::Idle         => SpeechRecognizerState::Idle,
                        windows::Media::SpeechRecognition::SpeechRecognizerState::Capturing    => SpeechRecognizerState::Capturing,
                        windows::Media::SpeechRecognition::SpeechRecognizerState::Processing   => SpeechRecognizerState::Processing,
                        windows::Media::SpeechRecognition::SpeechRecognizerState::SoundStarted => SpeechRecognizerState::SoundStarted,
                        windows::Media::SpeechRecognition::SpeechRecognizerState::SoundEnded   => SpeechRecognizerState::SoundEnded,
                        windows::Media::SpeechRecognition::SpeechRecognizerState::SpeechDetected => SpeechRecognizerState::SpeechDetected,
                        windows::Media::SpeechRecognition::SpeechRecognizerState::Paused       => SpeechRecognizerState::Paused,
                        _                                                                       => SpeechRecognizerState::Unknown,
                    };
                    tx3.send(SpeechEvent::State(state)).ok();
                }
                Ok(())
            },
        ))?;

        session.StartAsync()?.get()?;

        Ok(Self { recognizer, session, hyp_token, result_token, state_token, completed_token })
    }
}

impl Drop for ActiveSession {
    fn drop(&mut self) {
        self.session.RemoveCompleted(self.completed_token).ok();
        self.recognizer.RemoveHypothesisGenerated(self.hyp_token).ok();
        self.recognizer.RemoveStateChanged(self.state_token).ok();
        self.session.RemoveResultGenerated(self.result_token).ok();
        self.session.StopAsync().ok(); // fire and forget — don't block on already-stopped session
    }
}

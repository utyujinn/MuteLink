use std::sync::mpsc::{Receiver, Sender};
use windows::{
    core::*,
    Foundation::TypedEventHandler,
    Globalization::Language,
    Media::SpeechRecognition::*,
    Win32::System::Com::{CoInitializeEx, COINIT_MULTITHREADED},
};

pub enum Command {
    Start(String),
    Stop,
    Restart,
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

pub fn run_thread(rx: Receiver<Command>, self_tx: Sender<Command>, tx: Sender<SpeechEvent>) {
    unsafe { let _ = CoInitializeEx(None, COINIT_MULTITHREADED); };

    match available_languages() {
        Ok(langs) => { tx.send(SpeechEvent::Languages(langs)).ok(); }
        Err(e)    => { tx.send(SpeechEvent::Error(e.to_string())).ok(); }
    }

    let mut active: Option<ActiveSession> = None;

    while let Ok(cmd) = rx.recv() {
        match cmd {
            Command::Start(lang_tag) => {
                drop(active.take());
                eprintln!("[speech] Starting session for {lang_tag}");
                std::thread::sleep(std::time::Duration::from_millis(300));
                match ActiveSession::new(&lang_tag, tx.clone(), self_tx.clone()) {
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
            Command::Restart => {
                let lang_tag = active.take().map(|s| s.lang_tag.clone());
                if let Some(lang_tag) = lang_tag {
                    // Drop (above) awaits StopAsync; add delay so Windows fully releases resources
                    std::thread::sleep(std::time::Duration::from_millis(300));
                    match ActiveSession::new(&lang_tag, tx.clone(), self_tx.clone()) {
                        Ok(s) => {
                            eprintln!("[speech] Session restarted for {lang_tag}");
                            active = Some(s);
                        }
                        Err(e) => {
                            eprintln!("[speech] Restart error: {e}");
                            tx.send(SpeechEvent::Error(e.to_string())).ok();
                        }
                    }
                }
            }
            Command::Stop => {
                drop(active.take());
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
        result.push((lang.LanguageTag()?.to_string(), lang.DisplayName()?.to_string()));
    }
    Ok(result)
}

struct ActiveSession {
    lang_tag: String,
    recognizer: SpeechRecognizer,
    session: SpeechContinuousRecognitionSession,
    hyp_token: i64,
    result_token: i64,
    state_token: i64,
    completed_token: i64,
}

impl ActiveSession {
    fn new(lang_tag: &str, tx: Sender<SpeechEvent>, self_tx: Sender<Command>) -> Result<Self> {
        let lang = Language::CreateLanguage(&HSTRING::from(lang_tag))?;
        let recognizer = SpeechRecognizer::Create(&lang)?;

        let constraint = SpeechRecognitionTopicConstraint::Create(
            SpeechRecognitionScenario::Dictation,
            &HSTRING::from("dictation"),
        )?;
        recognizer.Constraints()?.Append(&constraint)?;

        let compiled = recognizer.CompileConstraintsAsync()?.get()?;
        if compiled.Status()? != SpeechRecognitionResultStatus::Success {
            return Err(Error::empty());
        }

        let session = recognizer.ContinuousRecognitionSession()?;
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
                        let status = result.Status().map(|s| s.0).unwrap_or(-1);
                        if let Ok(text) = result.Text() {
                            let s = text.to_string();
                            eprintln!("[speech] Result status={status} text='{s}'");
                            if !s.is_empty() {
                                tx2.send(SpeechEvent::Final(s)).ok();
                            }
                        }
                    }
                }
                Ok(())
            },
        ))?;

        // Completed fires when session stops (focus loss = UserCanceled).
        // Send Command::Restart directly to speech thread — no UI roundtrip needed.
        let tx_comp = tx.clone();
        let completed_token = session.Completed(&TypedEventHandler::new(
            move |_, ev: Ref<'_, SpeechContinuousRecognitionCompletedEventArgs>| {
                if let Some(ev) = ev.as_ref() {
                    eprintln!("[speech] Completed status={}", ev.Status().map(|s| s.0).unwrap_or(-1));
                    self_tx.send(Command::Restart).ok();
                    tx_comp.send(SpeechEvent::SessionEnded).ok();
                }
                Ok(())
            },
        ))?;

        let tx3 = tx;
        let state_token = recognizer.StateChanged(&TypedEventHandler::new(
            move |_, ev: Ref<'_, SpeechRecognizerStateChangedEventArgs>| {
                use windows::Media::SpeechRecognition::SpeechRecognizerState as WinState;
                if let Some(ev) = ev.as_ref() {
                    let state = match ev.State().unwrap_or(WinState::Idle) {
                        WinState::Idle          => SpeechRecognizerState::Idle,
                        WinState::Capturing     => SpeechRecognizerState::Capturing,
                        WinState::Processing    => SpeechRecognizerState::Processing,
                        WinState::SoundStarted  => SpeechRecognizerState::SoundStarted,
                        WinState::SoundEnded    => SpeechRecognizerState::SoundEnded,
                        WinState::SpeechDetected=> SpeechRecognizerState::SpeechDetected,
                        WinState::Paused        => SpeechRecognizerState::Paused,
                        _                       => SpeechRecognizerState::Unknown,
                    };
                    tx3.send(SpeechEvent::State(state)).ok();
                }
                Ok(())
            },
        ))?;

        session.StartAsync()?.get()?;

        Ok(Self { lang_tag: lang_tag.to_string(), recognizer, session, hyp_token, result_token, state_token, completed_token })
    }

}

impl Drop for ActiveSession {
    fn drop(&mut self) {
        self.session.RemoveCompleted(self.completed_token).ok();
        self.recognizer.RemoveHypothesisGenerated(self.hyp_token).ok();
        self.recognizer.RemoveStateChanged(self.state_token).ok();
        self.session.RemoveResultGenerated(self.result_token).ok();
        // Await stop so COM resources are released before next session is created
        if let Ok(op) = self.session.StopAsync() { op.get().ok(); }
    }
}

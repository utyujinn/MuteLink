use std::net::TcpListener;
use std::sync::{Arc, Mutex};
use tauri::AppHandle;
use tungstenite::{accept, Message};

const IPC_PORT: u16 = 19998;

type Clients = Arc<Mutex<Vec<tungstenite::WebSocket<std::net::TcpStream>>>>;

static CLIENTS: std::sync::OnceLock<Clients> = std::sync::OnceLock::new();

pub fn start_server(_app: AppHandle) {
    let clients: Clients = Arc::new(Mutex::new(Vec::new()));
    CLIENTS.set(clients.clone()).ok();

    std::thread::spawn(move || {
        let listener = match TcpListener::bind(("127.0.0.1", IPC_PORT)) {
            Ok(l) => l,
            Err(e) => { eprintln!("[ipc] bind failed: {e}"); return; }
        };
        eprintln!("[ipc] overlay server listening on port {IPC_PORT}");
        for stream in listener.incoming() {
            let stream = match stream { Ok(s) => s, Err(_) => continue };
            stream.set_nonblocking(false).ok();
            match accept(stream) {
                Ok(ws) => {
                    eprintln!("[ipc] overlay client connected");
                    clients.lock().unwrap().push(ws);
                }
                Err(e) => eprintln!("[ipc] ws handshake failed: {e}"),
            }
        }
    });
}

pub fn broadcast_state(app: &AppHandle, state: &crate::speech::SpeechState) {
    let json = match serde_json::to_string(state) {
        Ok(j) => j,
        Err(_) => return,
    };
    let msg = format!(r#"{{"type":"state","payload":{}}}"#, json);

    // フロントエンドへ emit
    use tauri::Emitter;
    app.emit("app-state", state).ok();

    // オーバーレイクライアントへ broadcast
    if let Some(clients) = CLIENTS.get() {
        let mut guard = clients.lock().unwrap();
        guard.retain_mut(|ws| {
            ws.send(Message::Text(msg.clone().into())).is_ok()
        });
    }
}

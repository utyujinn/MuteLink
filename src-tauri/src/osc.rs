use std::net::UdpSocket;

const VRC_PORT: u16 = 9000;

/// VRChat チャットボックスにテキストを即時送信する
pub fn send_chatbox(text: &str) {
    if let Ok(socket) = UdpSocket::bind("0.0.0.0:0") {
        let mut packet = Vec::new();
        packet.extend(osc_str("/chatbox/input"));
        packet.extend(osc_str(",sTF")); // (string, True=即時送信, False=通知音なし)
        packet.extend(osc_str(text));
        socket.send_to(&packet, ("127.0.0.1", VRC_PORT)).ok();
    }
}

/// タイピングインジケーターを表示/非表示する
pub fn set_typing(typing: bool) {
    if let Ok(socket) = UdpSocket::bind("0.0.0.0:0") {
        let mut packet = Vec::new();
        packet.extend(osc_str("/chatbox/typing"));
        packet.extend(osc_str(if typing { ",T" } else { ",F" }));
        socket.send_to(&packet, ("127.0.0.1", VRC_PORT)).ok();
    }
}

/// OSC 文字列エンコード（null 終端 + 4バイト境界パディング）
fn osc_str(s: &str) -> Vec<u8> {
    let mut v = s.as_bytes().to_vec();
    v.push(0);
    while v.len() % 4 != 0 { v.push(0); }
    v
}

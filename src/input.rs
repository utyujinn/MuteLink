use std::mem::size_of;
use windows::Win32::Foundation::HWND;
use windows::Win32::UI::Input::KeyboardAndMouse::*;
use windows::Win32::UI::WindowsAndMessaging::{
    GetForegroundWindow, GetWindowThreadProcessId, SetForegroundWindow,
};
use windows::Win32::System::Threading::GetCurrentProcessId;

pub fn get_foreground_hwnd() -> isize {
    unsafe { GetForegroundWindow().0 as isize }
}

pub fn foreground_is_ours() -> bool {
    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.0.is_null() {
            return false;
        }
        let mut pid = 0u32;
        GetWindowThreadProcessId(hwnd, Some(&mut pid));
        pid == GetCurrentProcessId()
    }
}

/// Focus `hwnd_raw` then send `text` as Unicode key events.
pub fn send_text_to(hwnd_raw: isize, text: String) {
    std::thread::spawn(move || {
        if hwnd_raw != 0 {
            unsafe { let _ = SetForegroundWindow(raw_hwnd(hwnd_raw)); }
            std::thread::sleep(std::time::Duration::from_millis(150));
        }
        send_unicode(&text);
    });
}

/// Focus `hwnd_raw`, send Ctrl+A → Delete, then return focus to `our_hwnd`
/// so the speech recognizer keeps running without interruption.
pub fn reset_external(hwnd_raw: isize, our_hwnd: isize) {
    std::thread::spawn(move || {
        if hwnd_raw == 0 {
            return;
        }
        unsafe { let _ = SetForegroundWindow(raw_hwnd(hwnd_raw)); }
        std::thread::sleep(std::time::Duration::from_millis(150));
        unsafe {
            let ctrl_a = [
                vkey(VK_CONTROL.0, false),
                vkey(0x41, false), // A
                vkey(0x41, true),
                vkey(VK_CONTROL.0, true),
            ];
            SendInput(&ctrl_a, size_of::<INPUT>() as i32);
        }
        std::thread::sleep(std::time::Duration::from_millis(50));
        unsafe {
            let del = [vkey(VK_DELETE.0, false), vkey(VK_DELETE.0, true)];
            SendInput(&del, size_of::<INPUT>() as i32);
        }
        if our_hwnd != 0 {
            std::thread::sleep(std::time::Duration::from_millis(50));
            unsafe { let _ = SetForegroundWindow(raw_hwnd(our_hwnd)); }
        }
    });
}

fn send_unicode(text: &str) {
    let utf16: Vec<u16> = text.encode_utf16().collect();
    if utf16.is_empty() {
        return;
    }
    let mut inputs = Vec::with_capacity(utf16.len() * 2);
    for &wchar in &utf16 {
        inputs.push(ukey(wchar, false));
        inputs.push(ukey(wchar, true));
    }
    unsafe { SendInput(&inputs, size_of::<INPUT>() as i32); }
}

fn raw_hwnd(raw: isize) -> HWND {
    HWND(raw as *mut std::ffi::c_void)
}

fn ukey(wchar: u16, up: bool) -> INPUT {
    INPUT {
        r#type: INPUT_KEYBOARD,
        Anonymous: INPUT_0 {
            ki: KEYBDINPUT {
                wVk: VIRTUAL_KEY(0),
                wScan: wchar,
                dwFlags: if up { KEYEVENTF_UNICODE | KEYEVENTF_KEYUP } else { KEYEVENTF_UNICODE },
                time: 0,
                dwExtraInfo: 0,
            },
        },
    }
}

fn vkey(vk: u16, up: bool) -> INPUT {
    INPUT {
        r#type: INPUT_KEYBOARD,
        Anonymous: INPUT_0 {
            ki: KEYBDINPUT {
                wVk: VIRTUAL_KEY(vk),
                wScan: 0,
                dwFlags: if up { KEYEVENTF_KEYUP } else { KEYBD_EVENT_FLAGS(0) },
                time: 0,
                dwExtraInfo: 0,
            },
        },
    }
}

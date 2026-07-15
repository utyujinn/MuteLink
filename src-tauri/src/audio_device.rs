use windows::{
    core::*,
    Win32::{
        Media::Audio::{IMMDeviceEnumerator, MMDeviceEnumerator, eCapture, eConsole},
        System::Com::{CoCreateInstance, CoTaskMemFree, CLSCTX_ALL},
    },
};

const CLSID_POLICY_CONFIG: GUID = GUID {
    data1: 0x870AF99C, data2: 0x171D, data3: 0x4F9E,
    data4: [0xAF, 0x0D, 0xE6, 0x3D, 0xF4, 0x0C, 0x2B, 0xC9],
};
const IID_POLICY_CONFIG: GUID = GUID {
    data1: 0xF8679F50, data2: 0x850A, data3: 0x41CF,
    data4: [0x9C, 0x72, 0x43, 0x0F, 0x29, 0x02, 0x90, 0xC8],
};

type SetDefaultEndpointFn =
    unsafe extern "system" fn(*mut std::ffi::c_void, *const u16, u32) -> i32;

pub fn get_default_capture_endpoint_id() -> Option<String> {
    unsafe {
        let enumerator: IMMDeviceEnumerator =
            CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL).ok()?;
        let device = enumerator.GetDefaultAudioEndpoint(eCapture, eConsole).ok()?;
        let id_ptr = device.GetId().ok()?;
        let id = id_ptr.to_string().ok()?;
        CoTaskMemFree(Some(id_ptr.0 as _));
        Some(id)
    }
}

pub fn set_default_capture_endpoint_id(endpoint_id: &str) -> bool {
    unsafe {
        let unk: IUnknown =
            match CoCreateInstance(&CLSID_POLICY_CONFIG, None, CLSCTX_ALL) {
                Ok(u) => u,
                Err(_) => return false,
            };

        let raw = unk.as_raw();
        let vtable = *(raw as *const *const *const ());
        type QIFn = unsafe extern "system" fn(
            *mut std::ffi::c_void, *const GUID, *mut *mut std::ffi::c_void,
        ) -> i32;
        let qi: QIFn = std::mem::transmute(*vtable);

        let mut policy_raw: *mut std::ffi::c_void = std::ptr::null_mut();
        if qi(raw, &IID_POLICY_CONFIG, &mut policy_raw) != 0 || policy_raw.is_null() {
            return false;
        }

        let policy_vtable = *(policy_raw as *const *const *const ());
        let set_fn: SetDefaultEndpointFn = std::mem::transmute(*policy_vtable.add(13));

        let id_wide: Vec<u16> = endpoint_id.encode_utf16().chain(std::iter::once(0)).collect();
        let ok1 = set_fn(policy_raw, id_wide.as_ptr(), 0) == 0;
        let ok2 = set_fn(policy_raw, id_wide.as_ptr(), 2) == 0;

        type ReleaseFn = unsafe extern "system" fn(*mut std::ffi::c_void) -> u32;
        let release: ReleaseFn = std::mem::transmute(*policy_vtable.add(2));
        release(policy_raw);

        ok1 || ok2
    }
}

fn winrt_id_to_endpoint_id(winrt_id: &str) -> Option<String> {
    let after = winrt_id.strip_prefix(r"\\?\SWD#MMDEVAPI#")?;
    let endpoint_id = after.rsplitn(2, '#').last()?;
    if endpoint_id.is_empty() { None } else { Some(endpoint_id.to_string()) }
}

pub fn list_capture_devices() -> Option<Vec<(String, String)>> {
    use windows::{Devices::Enumeration::DeviceInformation, Media::Devices::MediaDevice};
    let selector = MediaDevice::GetAudioCaptureSelector().ok()?;
    let collection = DeviceInformation::FindAllAsyncAqsFilter(&selector).ok()?.get().ok()?;
    let count = collection.Size().ok()?;
    let mut result = Vec::with_capacity(count as usize + 1);
    result.push((String::new(), "デフォルト".to_string()));
    for i in 0..count {
        let info = collection.GetAt(i).ok()?;
        result.push((info.Id().ok()?.to_string(), info.Name().ok()?.to_string()));
    }
    Some(result)
}

pub fn switch_capture_device(winrt_id: &str) -> Option<String> {
    if winrt_id.is_empty() { return None; }
    let ep_id = winrt_id_to_endpoint_id(winrt_id)?;
    let saved = get_default_capture_endpoint_id();
    if set_default_capture_endpoint_id(&ep_id) {
        saved
    } else {
        None
    }
}

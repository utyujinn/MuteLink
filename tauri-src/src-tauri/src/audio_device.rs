// Windows' Web Speech API (used for STT — see createRecognition() in
// main.js) has no way to target a specific microphone: it always captures
// from whatever Windows currently considers the default recording device,
// full stop. So the only way for Mutelink's own mic picker to actually
// affect what gets recognized is to change that system-wide default
// ourselves when the user picks a device — this module is what does that.
//
// The only supported way to do this is IPolicyConfig, an undocumented COM
// interface (stable since Vista, still the only game in town on Windows
// 11). There's no safe wrapper for it in the `windows` crate, so its vtable
// is hand-defined here the same way overlay_gpu.rs hand-defines OpenVR's
// SetOverlayTexture — every method that comes before SetDefaultEndpoint in
// the real interface still needs its own vtable slot for the layout to
// line up, even though nothing here ever calls them.

use std::ffi::c_void;

use serde::Serialize;
use windows::core::{GUID, HRESULT, PCWSTR};
use windows::Win32::Devices::FunctionDiscovery::PKEY_Device_FriendlyName;
use windows::Win32::Media::Audio::{
    eCapture, eCommunications, eConsole, eMultimedia, IMMDeviceEnumerator, MMDeviceEnumerator, DEVICE_STATE_ACTIVE,
};
use windows::Win32::System::Com::StructuredStorage::PropVariantToStringAlloc;
use windows::Win32::System::Com::{
    CoCreateInstance, CoInitializeEx, CoTaskMemFree, CLSCTX_ALL, COINIT_APARTMENTTHREADED, STGM_READ,
};

const CLSID_POLICY_CONFIG: GUID = GUID::from_u128(0x870af99c_171d_4f9e_af0d_e63df40c2bc9);

windows::core::imp::define_interface!(IPolicyConfig, IPolicyConfig_Vtbl, 0xf8679f50_850a_41cf_9c72_430f290290c8);
windows::core::imp::interface_hierarchy!(IPolicyConfig, windows::core::IUnknown);

// Placeholder slots (`usize`, never called) stand in for the 10 real
// methods that come before SetDefaultEndpoint — GetMixFormat,
// GetDeviceFormat, ResetDeviceFormat, SetDeviceFormat,
// GetProcessingPeriod, SetProcessingPeriod, GetShareMode, SetShareMode,
// GetPropertyValue, SetPropertyValue — plus one after it
// (SetEndpointVisibility) purely so the struct's total size matches the
// real vtable, in case anything ever validates that; none of them are ever
// read.
#[repr(C)]
#[allow(dead_code)]
pub struct IPolicyConfig_Vtbl {
    base__: windows::core::IUnknown_Vtbl,
    get_mix_format: usize,
    get_device_format: usize,
    reset_device_format: usize,
    set_device_format: usize,
    get_processing_period: usize,
    set_processing_period: usize,
    get_share_mode: usize,
    set_share_mode: usize,
    get_property_value: usize,
    set_property_value: usize,
    set_default_endpoint: unsafe extern "system" fn(*mut c_void, PCWSTR, i32) -> HRESULT,
    set_endpoint_visibility: usize,
}

impl IPolicyConfig {
    unsafe fn set_default_endpoint(&self, device_id: PCWSTR, role: i32) -> windows::core::Result<()> {
        unsafe { (windows::core::Interface::vtable(self).set_default_endpoint)(windows::core::Interface::as_raw(self), device_id, role).ok() }
    }
}

#[derive(Serialize, Clone)]
pub struct AudioInputDevice {
    id: String,
    name: String,
    #[serde(rename = "isDefault")]
    is_default: bool,
}

fn err(e: windows::core::Error) -> String {
    e.to_string()
}

// COM must be initialized on whatever thread calls into it; Tauri commands
// aren't guaranteed to always land on the same thread WebView2 already
// initialized COM on, so each entry point below does this itself.
// RPC_E_CHANGED_MODE (already initialized with a different concurrency
// model on this thread) and S_FALSE (already initialized, same model) are
// both fine here — either way COM is usable — so only a genuine failure is
// treated as an error.
unsafe fn ensure_com_initialized() {
    let hr = unsafe { CoInitializeEx(None, COINIT_APARTMENTTHREADED) };
    if hr.is_err() && hr != windows::Win32::Foundation::RPC_E_CHANGED_MODE {
        eprintln!("[audio_device] CoInitializeEx failed: {hr:?}");
    }
}

unsafe fn pwstr_to_string_and_free(pwstr: windows::core::PWSTR) -> Result<String, String> {
    unsafe {
        let s = pwstr.to_string().map_err(|e| e.to_string());
        CoTaskMemFree(Some(pwstr.0 as *const c_void));
        s
    }
}

#[tauri::command]
pub fn list_input_devices() -> Result<Vec<AudioInputDevice>, String> {
    unsafe {
        ensure_com_initialized();

        let enumerator: IMMDeviceEnumerator = CoCreateInstance(&MMDeviceEnumerator, None, CLSCTX_ALL).map_err(err)?;
        let collection = enumerator.EnumAudioEndpoints(eCapture, DEVICE_STATE_ACTIVE).map_err(err)?;
        let count = collection.GetCount().map_err(err)?;

        // eConsole is the role Windows' own Sound Settings shows/edits as
        // "the" default input device — good enough as the single id to
        // compare against for highlighting the current pick in the UI, even
        // though set_default_input_device() below sets all three roles.
        let default_id = enumerator
            .GetDefaultAudioEndpoint(eCapture, eConsole)
            .ok()
            .and_then(|d| d.GetId().ok())
            .and_then(|p| pwstr_to_string_and_free(p).ok());

        let mut devices = Vec::with_capacity(count as usize);
        for i in 0..count {
            let device = collection.Item(i).map_err(err)?;
            let id = pwstr_to_string_and_free(device.GetId().map_err(err)?)?;

            let store = device.OpenPropertyStore(STGM_READ).map_err(err)?;
            let name = match store.GetValue(&PKEY_Device_FriendlyName) {
                Ok(variant) => match PropVariantToStringAlloc(&variant) {
                    Ok(pwstr) => pwstr_to_string_and_free(pwstr).unwrap_or_else(|_| id.clone()),
                    Err(_) => id.clone(),
                },
                Err(_) => id.clone(),
            };

            let is_default = default_id.as_deref() == Some(id.as_str());
            devices.push(AudioInputDevice { id, name, is_default });
        }
        Ok(devices)
    }
}

#[tauri::command]
pub fn set_default_input_device(device_id: String) -> Result<(), String> {
    unsafe {
        ensure_com_initialized();

        let policy_config: IPolicyConfig = CoCreateInstance(&CLSID_POLICY_CONFIG, None, CLSCTX_ALL).map_err(err)?;

        let wide: Vec<u16> = device_id.encode_utf16().chain(std::iter::once(0)).collect();
        let pcwstr = PCWSTR(wide.as_ptr());

        // All three roles, not just the one SpeechRecognition likely uses —
        // WebView2's speech backend doesn't document which ERole it queries,
        // and setting only one would leave the OS's other "default mic"
        // slots pointing at the old device, which is confusing regardless.
        for role in [eConsole, eMultimedia, eCommunications] {
            policy_config.set_default_endpoint(pcwstr, role.0).map_err(err)?;
        }
        Ok(())
    }
}

// Registers one small D3D11 texture with SteamVR via
// IVROverlay::SetOverlayTexture and rewrites its contents each update via a
// GPU-side copy, instead of IVROverlay::SetOverlayRaw.
//
// SetOverlayRaw re-registers a brand new shared texture with the compositor
// on every single call — fine for an occasional update, but calling it at
// hotkey-poll frequency (20/s) exhausts something on the compositor side
// after a few holds, and every call starts failing with RequestFailed for
// the rest of the session. SetOverlayTexture just hands the compositor a
// pointer to a texture it already knows about, so it's cheap enough to call
// on every frame.
//
// The `openvr` crate doesn't expose SetOverlayTexture (only SetOverlayRaw
// and SetOverlayFromFile), and its safe `Overlay` wrapper keeps the function
// table behind a private field, so this loads its own reference the same
// way the crate does internally (a plain, documented OpenVR API call) and
// invokes the raw function pointer directly.

use std::ffi::c_void;

use openvr_sys as sys;
use windows::Win32::Graphics::Direct3D::D3D_DRIVER_TYPE_HARDWARE;
use windows::Win32::Graphics::Direct3D11::{
    D3D11CreateDevice, ID3D11Device, ID3D11DeviceContext, ID3D11Texture2D, D3D11_BIND_SHADER_RESOURCE,
    D3D11_CPU_ACCESS_WRITE, D3D11_CREATE_DEVICE_BGRA_SUPPORT, D3D11_MAP_WRITE_DISCARD, D3D11_MAPPED_SUBRESOURCE,
    D3D11_RESOURCE_MISC_SHARED, D3D11_SDK_VERSION, D3D11_TEXTURE2D_DESC, D3D11_USAGE_DEFAULT, D3D11_USAGE_DYNAMIC,
};
use windows::Win32::Foundation::HMODULE;
use windows::Win32::Graphics::Dxgi::Common::{DXGI_FORMAT_R8G8B8A8_UNORM, DXGI_SAMPLE_DESC};
use windows::core::Interface;

pub struct GpuOverlay {
    width: usize,
    height: usize,
    context: ID3D11DeviceContext,
    staging: ID3D11Texture2D,
    shared: ID3D11Texture2D,
    overlay_fn_table: &'static sys::VR_IVROverlay_FnTable,
}

// SAFETY: only ever touched from behind the same Mutex<Option<VrHandles>>
// that already guards every other OpenVR call in lib.rs.
unsafe impl Send for GpuOverlay {}

fn load_overlay_fn_table() -> Result<&'static sys::VR_IVROverlay_FnTable, String> {
    let mut magic = Vec::from(b"FnTable:".as_ref());
    magic.extend_from_slice(sys::IVROverlay_Version.as_ref());
    let mut error = sys::EVRInitError_VRInitError_None;
    let ptr = unsafe { sys::VR_GetGenericInterface(magic.as_ptr().cast(), &mut error) };
    if error != sys::EVRInitError_VRInitError_None {
        return Err(format!("VR_GetGenericInterface error {error}"));
    }
    if ptr == 0 {
        return Err("VR_GetGenericInterface returned null".to_string());
    }
    Ok(unsafe { &*(ptr as *const sys::VR_IVROverlay_FnTable) })
}

impl GpuOverlay {
    /// `width`/`height` are the exact pixel dimensions of whatever texture
    /// this instance will manage — callers pass a different size per
    /// overlay (the main HUD box vs. the small language tag).
    pub fn new(width: usize, height: usize) -> Result<Self, String> {
        let overlay_fn_table = load_overlay_fn_table()?;

        let mut device: Option<ID3D11Device> = None;
        let mut context: Option<ID3D11DeviceContext> = None;
        unsafe {
            D3D11CreateDevice(
                None,
                D3D_DRIVER_TYPE_HARDWARE,
                HMODULE(std::ptr::null_mut()),
                D3D11_CREATE_DEVICE_BGRA_SUPPORT,
                None,
                D3D11_SDK_VERSION,
                Some(&mut device),
                None,
                Some(&mut context),
            )
            .map_err(|e| format!("D3D11CreateDevice failed: {e}"))?;
        }
        let device = device.ok_or("D3D11CreateDevice returned no device")?;
        let context = context.ok_or("D3D11CreateDevice returned no context")?;

        let base_desc = D3D11_TEXTURE2D_DESC {
            Width: width as u32,
            Height: height as u32,
            MipLevels: 1,
            ArraySize: 1,
            Format: DXGI_FORMAT_R8G8B8A8_UNORM,
            SampleDesc: DXGI_SAMPLE_DESC { Count: 1, Quality: 0 },
            ..Default::default()
        };

        // The texture SteamVR actually samples from.
        let shared_desc = D3D11_TEXTURE2D_DESC {
            Usage: D3D11_USAGE_DEFAULT,
            BindFlags: D3D11_BIND_SHADER_RESOURCE.0 as u32,
            MiscFlags: D3D11_RESOURCE_MISC_SHARED.0 as u32,
            ..base_desc
        };
        let mut shared: Option<ID3D11Texture2D> = None;
        unsafe {
            device
                .CreateTexture2D(&shared_desc, None, Some(&mut shared))
                .map_err(|e| format!("CreateTexture2D (shared) failed: {e}"))?
        };

        // A CPU-writable scratch texture; each update writes here, then a
        // GPU-side CopyResource pushes it into `shared`. D3D11_USAGE_DYNAMIC
        // textures are only valid with D3D11_BIND_SHADER_RESOURCE — leaving
        // BindFlags at 0 (inherited from base_desc) is what CreateTexture2D
        // was rejecting with E_INVALIDARG.
        let staging_desc = D3D11_TEXTURE2D_DESC {
            Usage: D3D11_USAGE_DYNAMIC,
            BindFlags: D3D11_BIND_SHADER_RESOURCE.0 as u32,
            CPUAccessFlags: D3D11_CPU_ACCESS_WRITE.0 as u32,
            ..base_desc
        };
        let mut staging: Option<ID3D11Texture2D> = None;
        unsafe {
            device
                .CreateTexture2D(&staging_desc, None, Some(&mut staging))
                .map_err(|e| format!("CreateTexture2D (staging) failed: {e}"))?
        };

        Ok(GpuOverlay {
            width,
            height,
            context,
            staging: staging.ok_or("CreateTexture2D (staging) returned no texture")?,
            shared: shared.ok_or("CreateTexture2D (shared) returned no texture")?,
            overlay_fn_table,
        })
    }

    /// Uploads `pixels` (tightly packed RGBA8, width*height*4 bytes, using
    /// the dimensions passed to `new()`) into the shared texture and tells
    /// SteamVR it's ready.
    pub fn update(&self, overlay_handle: sys::VROverlayHandle_t, pixels: &[u8]) -> Result<(), String> {
        unsafe {
            let mut mapped = D3D11_MAPPED_SUBRESOURCE::default();
            self.context
                .Map(&self.staging, 0, D3D11_MAP_WRITE_DISCARD, 0, Some(&mut mapped))
                .map_err(|e| e.to_string())?;

            let row_bytes = self.width * 4;
            for y in 0..self.height {
                let src = &pixels[y * row_bytes..(y + 1) * row_bytes];
                let dst = (mapped.pData as *mut u8).add(y * mapped.RowPitch as usize);
                std::ptr::copy_nonoverlapping(src.as_ptr(), dst, row_bytes);
            }
            self.context.Unmap(&self.staging, 0);
            self.context.CopyResource(&self.shared, &self.staging);
            // Without this, the driver can batch/delay actually submitting
            // the copy to the GPU. That's invisible for the box (redrawn
            // continuously while held), but the language tag sits static for
            // a full 1.5s between abrupt content changes — long enough for
            // SteamVR's compositor (a separate process reading the same
            // shared texture) to sample a still-pending old frame, which
            // shows up as the previous label briefly flashing before the
            // new one appears. Flush forces the copy onto the GPU timeline
            // now instead of whenever the driver next feels like it.
            self.context.Flush();

            let mut texture = sys::Texture_t {
                handle: self.shared.as_raw() as *mut c_void,
                eType: sys::ETextureType_TextureType_DirectX,
                eColorSpace: sys::EColorSpace_ColorSpace_Auto,
            };
            let set_texture = self.overlay_fn_table.SetOverlayTexture.expect("SetOverlayTexture missing from FnTable");
            let err = set_texture(overlay_handle, &mut texture);
            if err != sys::EVROverlayError_VROverlayError_None {
                return Err(format!("{err:?}"));
            }
        }
        Ok(())
    }
}

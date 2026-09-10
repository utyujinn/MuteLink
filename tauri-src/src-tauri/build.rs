use std::env;
use std::ffi::OsStr;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

fn main() {
    tauri_build::build();

    if env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("windows") {
        if let Err(e) = fix_onnxruntime_dlls() {
            println!("cargo:warning=Failed to fetch a matching onnxruntime.dll for sherpa-onnx: {e}");
        }
    }
}

// sherpa-onnx-sys bundles onnxruntime.dll/onnxruntime_providers_shared.dll
// alongside sherpa-onnx-c-api.dll (see the `sherpa-onnx` dependency comment
// in Cargo.toml) — but as of sherpa-onnx-sys 1.13.7, the bundled
// onnxruntime.dll (1.17.3, OrtApi version 17) is too old for what that same
// release's sherpa-onnx-c-api.dll actually calls (OrtApi version 27),
// causing a hard crash (STATUS_ACCESS_VIOLATION) the moment
// OfflineRecognizer::create() runs (see sense_voice.rs). Confirmed
// empirically by swapping in a genuinely newer onnxruntime.dll and seeing
// model loading go from "instant crash" to "works in under 2 seconds".
//
// This downloads Microsoft's own official onnxruntime release (any version
// >= ~1.27 satisfies OrtApi 27) and overwrites sherpa-onnx-sys's mismatched
// copy in target/<profile>/ (and target/<profile>/examples/, which
// sherpa-onnx-sys also populates) after it runs — dependency build scripts
// execute before the dependent crate's own, so sherpa-onnx-sys's (wrong)
// copy is already in place by the time this runs. Drop this once a
// sherpa-onnx-sys release ships a matching onnxruntime — already fixed
// upstream but unreleased as of writing (see sherpa-onnx's CHANGELOG.md,
// the 1.13.8 entry "ONNX Runtime updated to v1.28.2").
fn fix_onnxruntime_dlls() -> Result<(), Box<dyn std::error::Error>> {
    const ORT_VERSION: &str = "1.29.1";
    const ORT_FILES: &[&str] = &["onnxruntime.dll", "onnxruntime_providers_shared.dll"];

    let url = format!(
        "https://github.com/microsoft/onnxruntime/releases/download/v{ORT_VERSION}/onnxruntime-win-x64-{ORT_VERSION}.zip"
    );

    let out_dir = PathBuf::from(env::var("OUT_DIR")?);
    let target_dir = out_dir
        .ancestors()
        .find(|p| p.file_name() == Some(OsStr::new("target")))
        .ok_or("could not locate the target/ directory from OUT_DIR")?
        .to_path_buf();

    let cache_dir = target_dir.join(format!("onnxruntime-fix-{ORT_VERSION}"));
    let lib_dir = cache_dir.join(format!("onnxruntime-win-x64-{ORT_VERSION}")).join("lib");

    if !lib_dir.join("onnxruntime.dll").is_file() {
        fs::create_dir_all(&cache_dir)?;
        let zip_path = cache_dir.join("onnxruntime.zip");

        let status = Command::new("curl").args(["-sL", "-o"]).arg(&zip_path).arg(&url).status()?;
        if !status.success() {
            return Err(format!("curl exited with {status} downloading {url}").into());
        }

        // Windows' built-in tar.exe (bsdtar) auto-detects and extracts zip
        // archives too, not just tarballs — no extra crate/tool needed.
        let status = Command::new("tar").args(["-xf"]).arg(&zip_path).arg("-C").arg(&cache_dir).status()?;
        if !status.success() {
            return Err(format!("tar exited with {status} extracting {}", zip_path.display()).into());
        }
    }

    let profile_dir = target_dir.join(env::var("PROFILE")?);
    for dest_dir in [profile_dir.clone(), profile_dir.join("examples")] {
        if !dest_dir.is_dir() {
            continue;
        }
        for file in ORT_FILES {
            let src = lib_dir.join(file);
            if src.is_file() {
                fs::copy(&src, dest_dir.join(file))?;
            }
        }
    }

    Ok(())
}

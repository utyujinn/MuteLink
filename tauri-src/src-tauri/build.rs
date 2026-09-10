use std::env;
use std::ffi::OsStr;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::Duration;

fn main() {
    // Must run BEFORE build_tauri_with_retry(): see fix_onnxruntime_dlls()'s
    // own comment for why tauri_build::build() must never be the first thing
    // to touch target/<profile>/onnxruntime.dll.
    if env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("windows") {
        if let Err(e) = fix_onnxruntime_dlls() {
            println!("cargo:warning=Failed to fetch a matching onnxruntime.dll for sherpa-onnx: {e}");
        }
    }

    build_tauri_with_retry();
}

// tauri_build::build() itself copies bundle.resources into its own
// resource-staging directory as part of processing the config. On the
// GitHub Actions Windows runner, when one of those resources was
// target/<profile>/onnxruntime.dll (the file sherpa-onnx-sys's own build
// script — a dependency, guaranteed to run and fully finish before ours
// starts — had just written), this consistently failed reading it with
// "os error 32" (ERROR_SHARING_VIOLATION), on every single retry across a
// full 60-second budget, never once succeeding — inconsistent with a
// transient AV scan (which cleared within ~28s the one time this was
// reproduced locally) and more consistent with something holding that
// exact file for the entire build. fix_onnxruntime_dlls() below no longer
// routes bundle.resources through that contested path at all (see its own
// comment) as the real fix; this retry is kept as cheap defense in depth
// for whatever residual, genuinely transient locks (e.g. on the
// voicevox_core resources, a large fixed set of files nothing else in this
// build touches) might still occur. tauri_build::build() itself panics
// (std::process::exit(1)) on any error with no retry of its own, so this
// calls its non-panicking sibling (try_build) directly instead —
// copy_resources()'s file copy is a plain overwrite with no other state,
// so retrying the whole call is safe.
fn build_tauri_with_retry() {
    const ATTEMPTS: u32 = 120;
    const DELAY: Duration = Duration::from_millis(500);
    for attempt in 1..=ATTEMPTS {
        match tauri_build::try_build(tauri_build::Attributes::default()) {
            Ok(()) => return,
            Err(e) if attempt < ATTEMPTS => {
                println!("cargo:warning=tauri_build::try_build failed (attempt {attempt}/{ATTEMPTS}): {e:#}");
                std::thread::sleep(DELAY);
            }
            Err(e) => {
                println!("{e:#}");
                std::process::exit(1);
            }
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
//
// ALSO copies both files into <crate_root>/ort-resource/ — a directory
// nothing else in this build ever writes to — and that path (not
// target/<profile>/onnxruntime.dll directly) is what tauri.conf.json's
// bundle.resources points at. This exists specifically so that
// tauri_build::build() (called after this function — see main()) never has
// to read target/<profile>/onnxruntime.dll itself: on the GitHub Actions
// Windows runner, that exact file being read by tauri_build right after
// sherpa-onnx-sys's build script had just written it consistently failed
// with "os error 32" (ERROR_SHARING_VIOLATION) on every retry across a full
// 60s budget — see build_tauri_with_retry()'s comment. Routing the
// bundle.resources copy through this untouched-by-anyone-else path sidesteps
// that contention entirely rather than just retrying against it for longer.
//
// Deliberately crate-root-relative (like voicevox_core/ below it in
// tauri.conf.json's own resources map), not target/<profile>/-relative: an
// earlier version of this pointed bundle.resources at
// target/release/ort-resource/, which is hardcoded to "release" the same
// way the original target/release/onnxruntime.dll reference was — and while
// that's fine for the actual release builds this all exists for, it silently
// broke `cargo check`/`bun run tauri dev` (PROFILE=debug), which populated
// target/debug/ort-resource/ instead of the hardcoded target/release/ path
// tauri_build was looking for.
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
    let resource_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR")?).join("ort-resource");
    fs::create_dir_all(&resource_dir)?;

    for dest_dir in [profile_dir.clone(), profile_dir.join("examples"), resource_dir] {
        if !dest_dir.is_dir() {
            continue;
        }
        for file in ORT_FILES {
            let src = lib_dir.join(file);
            if src.is_file() {
                copy_with_retry(&src, &dest_dir.join(file))?;
            }
        }
    }

    Ok(())
}

// Defense in depth: build_tauri_with_retry() above hit this same class of
// transient "os error 32" (ERROR_SHARING_VIOLATION) failure copying this
// exact file on the GitHub Actions Windows runner (see its own comment) —
// this copy is a plain overwrite with nothing else depending on its state,
// so retrying it too costs nothing and guards against the same race
// happening here instead, whether or not it ever actually does.
fn copy_with_retry(src: &Path, dest: &Path) -> Result<(), Box<dyn std::error::Error>> {
    const ATTEMPTS: u32 = 120;
    const DELAY: Duration = Duration::from_millis(500);
    let mut last_err = None;
    for attempt in 1..=ATTEMPTS {
        match fs::copy(src, dest) {
            Ok(_) => return Ok(()),
            Err(e) => {
                println!("cargo:warning=copying {} to {} failed (attempt {attempt}/{ATTEMPTS}): {e}", src.display(), dest.display());
                last_err = Some(e);
                std::thread::sleep(DELAY);
            }
        }
    }
    Err(last_err.unwrap().into())
}

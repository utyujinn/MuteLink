# Mutelink

VRChat向けの音声パイプラインの実験プロジェクト。マイク入力を音声認識でテキスト化し、VOICEVOX(小夜/SAYO)で読み上げ直して VB-Audio Virtual Cable 経由で VRChat のマイク入力に流す。

## 現在の実装

すべて `tauri-src/` の中で完結している。

- フロントエンド(`tauri-src/src/`)
  - ブラウザ内蔵の音声認識(Web Speech API)でマイクの発話をテキスト化
  - 無音が続くと自動で一時停止し、また話し出すと自動で再開する
  - 確定したテキストをそのままVOICEVOXに渡して読み上げ
  - 読み上げ音声の出力先(複数選択可)をデバイス一覧から選べる。`CABLE Input`があればデフォルトで選択される
- Rustバックエンド(`tauri-src/src-tauri/`)
  - VOICEVOX CORE をアプリに直接組み込み(外部プロセスやHTTPサーバーを使わない)、テキストからWAVを合成する`synthesize`コマンドを提供

`python/` はFunASRベースのローカル音声認識を検討していた頃の実験コードで、現在は未使用(参考として残置)。

## 必要なもの (Windows専用)

- [Rust](https://rustup.rs/)(1.89以上)
- [Bun](https://bun.sh/)
- Visual Studio Build Tools 2022(C++ ビルドツール一式。OpenJTalkのビルドに必要)
- [CMake](https://cmake.org/)(`winget install Kitware.CMake` でも可。OpenJTalkのビルドに必要)
- [VB-Audio Virtual Cable](https://vb-audio.com/Cable/)(インストールすると `CABLE Input` / `CABLE Output` が音声デバイスとして追加される)

## セットアップ

### 1. VOICEVOX CORE のリソースを取得

`tauri-src/src-tauri/voicevox_core/` はgitignore対象なので、初回のみ手動でダウンロードする。

```sh
cd tauri-src/src-tauri
curl -Lo download.exe https://github.com/VOICEVOX/voicevox_core/releases/download/0.16.4/download-windows-x64.exe
./download.exe --exclude c-api --models-pattern "15.vvm" --devices cpu
```

`15.vvm` が小夜/SAYOのモデル(他のキャラを使う場合はモデル対応表を参照してVVM番号を変更し、`src-tauri/src/lib.rs`の`SAYO_NORMAL_STYLE_ID`とVVMパスも合わせて変更する)。利用規約への同意を聞かれたら `y` で進める。

### 2. フロントエンドの依存関係をインストール

```sh
cd tauri-src
bun install
```

## 起動

```sh
cd tauri-src
bun run tauri dev
```

初回はマイク使用許可のダイアログが出るので許可する。ビルド(特にOpenJTalk/VOICEVOX CORE周り)は数分かかる。

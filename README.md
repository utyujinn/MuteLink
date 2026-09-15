# Mutelink

自分の声を出さずにVRChatでコミュニケーションするためのWindowsデスクトップアプリ。マイク入力を音声認識でテキスト化し、VOICEVOX(小夜/SAYO)で読み上げ直して VB-Audio Virtual Cable 経由で VRChat のマイク入力に流す。VRChatのチャットボックスへの直接送信にも対応。

## 使い方(利用者向け)

### 必要なもの

- Windows 10/11
- [VB-Audio Virtual Cable](https://vb-audio.com/Cable/)(無料) — VOICEVOXで読み上げた音声をVRChatのマイク入力に流すために必要
- VRChat — チャットボックスへの送信機能を使う場合はOSCを有効にする(後述)
- SteamVR(任意) — VR内HUDとコントローラーのボタンで確認・送信・破棄を操作するホットキー機能を使う場合のみ必要。無くてもアプリ自体は動作する
- マイク設定は常にONを推奨する

### インストール

1. [Releases](https://github.com/utyujinn/MuteLink/releases)ページから最新のインストーラ(`Mutelink_x.x.x_x64-setup.exe`)をダウンロードして実行する(管理者権限は不要)
   - コード署名を行っていないため、初回はWindows SmartScreenが「発行元不明」の警告を表示することがある。「詳細情報」→「実行」で進められる
2. 初回起動時、マイクの使用許可を求められたら許可する

### セットアップ

1. [VB-Audio Virtual Cable](https://vb-audio.com/Cable/)をインストールする(`CABLE Input` / `CABLE Output` が音声デバイスとして追加される)
2. Mutelinkの設定 > Device > スピーカーで、読み上げ音声の出力先に `CABLE Input` を選択する(接続されていれば自動で選択される)
3. VRChat側のマイク入力デバイスを `CABLE Output` に設定する
4. チャットボックスへの送信機能を使う場合は、VRChat側でOSCを有効にする(リングメニュー > Options > OSC > Enabled)
5. (任意)VR内で確認・送信・破棄をコントローラーで操作したい場合は、SteamVRを起動した状態でMutelinkを起動する

### 基本の使い方

- マイクに向かって話すと自動で音声認識され、テキスト化される
- 確定したテキストは設定に応じてVOICEVOXで読み上げ直され、および/またはVRChatのチャットボックスに送信される
- 読み上げキャラクター・語尾・言語・ホットキーなどは、タイトルバーの設定アイコンから開く設定画面でカスタマイズできる
- 追加の読み上げキャラクターは設定画面からダウンロードできるが、キャラクターごとに個別の利用規約があるため、ダウンロード前に確認すること

### ローカル音声認識モデルについて

音声認識エンジンを設定 > General でローカルに切り替えると、以下の4モデルから選べる(いずれも初回選択時にダウンロードが必要)。

- **SenseVoice(軽量版/標準版)**: 日本語・英語・中国語・韓国語に対応、高速。軽量版でもそれなりの精度で動く。ただし日本語の文中に混ざる英単語(「VR」「AI」など)を認識できず、丸ごと欠落することがある。
- **Whisper turbo**: 多言語対応だが、他のモデルに比べて認識に時間がかかる。
- **Parakeet**: 日本語専用。多言語対応ではない代わりに、そこそこ高速かつ高精度。

## 開発・ビルド手順

以下はソースコードからビルドして開発したい人向けの手順。

### 現在の実装

すべて `tauri-src/` の中で完結している。

- フロントエンド(`tauri-src/src/`)
  - 音声認識エンジンはWeb Speech API(オンライン)とローカル(SenseVoice/Whisper/Parakeet、`sherpa-onnx`経由)から設定で選択可能。ローカルはモデルを設定画面から個別にダウンロードする方式(VOICEVOXのキャラクター追加と同様)。各モデルの特徴は上記「ローカル音声認識モデルについて」を参照
  - ローカル音声認識は発話の区切りごとにまとめて認識する方式だが、発話中も一定間隔で再認識してプレビュー表示する(Web Speech APIのinterim resultsを模したもの。負荷の高いモデル向けに設定でオフも可)
  - 無音が続くと自動で一時停止し、また話し出すと自動で再開する
  - 確定したテキストをそのままVOICEVOXに渡して読み上げ
  - 読み上げ音声の出力先(複数選択可)をデバイス一覧から選べる。`CABLE Input`があればデフォルトで選択される
- Rustバックエンド(`tauri-src/src-tauri/`)
  - VOICEVOX CORE をアプリに直接組み込み(外部プロセスやHTTPサーバーを使わない)、テキストからWAVを合成する`synthesize`コマンドを提供
  - `sense_voice.rs`: ローカル音声認識モデル(SenseVoice軽量/標準、Whisper turbo、Parakeet)のダウンロード・ロード・推論

`python/` はFunASRベースのローカル音声認識を検討していた頃の実験コードで、現在は未使用(参考として残置)。

### ビルドに必要なもの (Windows専用)

- [Rust](https://rustup.rs/)(1.89以上)
- [Bun](https://bun.sh/)
- Visual Studio Build Tools 2022(C++ ビルドツール一式。OpenJTalkのビルドに必要)
- [CMake](https://cmake.org/)(`winget install Kitware.CMake` でも可。OpenJTalkのビルドに必要)
- [VB-Audio Virtual Cable](https://vb-audio.com/Cable/)(インストールすると `CABLE Input` / `CABLE Output` が音声デバイスとして追加される)

### 開発環境のセットアップ

#### 1. VOICEVOX CORE のリソースを取得

`tauri-src/src-tauri/voicevox_core/` はgitignore対象なので、初回のみ手動でダウンロードする。

```sh
cd tauri-src/src-tauri
curl -Lo download.exe https://github.com/VOICEVOX/voicevox_core/releases/download/0.16.4/download-windows-x64.exe
./download.exe --exclude c-api --models-pattern "15.vvm" --devices cpu
```

`15.vvm` が小夜/SAYOのモデル(他のキャラを使う場合はモデル対応表を参照してVVM番号を変更し、`src-tauri/src/lib.rs`の`SAYO_NORMAL_STYLE_ID`とVVMパスも合わせて変更する)。利用規約への同意を聞かれたら `y` で進める。

#### 2. フロントエンドの依存関係をインストール

```sh
cd tauri-src
bun install
```

### 起動

```sh
cd tauri-src
bun run tauri dev
```

初回はマイク使用許可のダイアログが出るので許可する。ビルド(特にOpenJTalk/VOICEVOX CORE周り)は数分かかる。

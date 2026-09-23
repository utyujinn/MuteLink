１．アップデーターの導入
　`tauri-plugin-updater`を追加し、署名鍵を生成、更新マニフェスト(latest.json的なもの)をGitHub Releasesなどで配信する仕組みを作る。

２．インストーラの準備
　`tauri.conf.json`の`productName`が今も`"tauri-src"`のまま(インストーラ名・Start Menuの表示名・アンインストーラ一覧の表示名に影響するので変更必須)。`identifier`も`com.utyujin.tauri-src`のままなので実際のGitHubユーザー名(utyujinn)等に合わせて見直す。

３．アンインストーラの準備・動作確認
　NSIS/MSIには標準でアンインストーラが付くが、インストール先に残るファイル(ダウンロードしたキャラクターデータなど)の後片付けを含めて実際に動作確認する。

４．今の環境専用になっているコードの一般化
　- `VOICEVOX_DIR`(`src-tauri/src/lib.rs`)がビルド時の絶対パス(`CARGO_MANIFEST_DIR`)に焼き込まれていて、配布先のPCでは動かない。実行ファイル自身の場所を基準に解決するよう修正が必要。
　- `voicevox_core`(約296MB、`.gitignore`対象)を`tauri.conf.json`の`bundle.resources`に追加してインストーラに同梱する必要がある。今のままビルドするとVOICEVOX抜きのインストーラになる。
　- キャラクター追加ダウンロード機能(`download_character`)が`{VOICEVOX_DIR}/models/vvms/`に書き込む実装なので、`Program Files`など書き込み制限のある場所にインストールされると失敗する。書き込み先をAppDataなど per-user な場所に分けるか、per-userインストールにする。

５．LICENSEファイルの整備
　現在の`LISENCE`はファイル名が誤字な上、中身が無関係な別プロジェクト("WisTex TechSero Ltd. Co.")のMITライセンスのコピーになっている。正しい著作者表示の内容に直し、ファイル名も`LICENSE`にする。

６．VOICEVOXキャラクター利用規約の遵守確認
　バンドルしている小夜/SAYOモデルや、アプリ内からの追加キャラクターダウンロード機能について、配布・クレジット表記などの利用規約を満たしているか確認する。

７．READMEの一般ユーザー向け整備
　現状は開発者向けのビルド手順のみなので、「インストーラをダウンロードして実行するだけ」の利用者向けセットアップ説明(VB-Audio Virtual CableやSteamVRなど外部依存の案内含む)を追加する。

８．コード署名の検討(任意)
　未署名のままだとWindows SmartScreenに警告が出る。証明書を用意するかどうかを判断する。

９．リリース自動化
　タグを打ったらビルド・署名・GitHub Releasesへの公開・更新マニフェストの更新までを自動化するCI(GitHub Actions)を整備する。アップデーター導入と合わせて構築すると良い。

10．公開前の最終動作確認
　開発環境が一切入っていないクリーンなPC(別マシンや仮想マシン)で、実際にインストーラから動作するか確認する。

11．リポジトリの整理
　未使用の`python/`ディレクトリ(実験コード)の扱いを決める。バージョン番号(現在0.1.0のまま)を見直す。

---

追加機能・不具合対応。

12．デスクトップ(VR無し)でも使えるようにする
　現状、確認・破棄などのホットキー操作がSteamVRのコントローラー入力(`hotkey_state`/`update_overlay`)に依存している。VRを使わないデスクトップ勢のVRChatユーザーでも同等の操作ができるように、キーボードショートカットなど非VR環境向けの操作手段を用意する。

13．音声認識で発話の先頭文字が欠落する不具合の修正
　無音が`SILENCE_TIMEOUT_MS`続くと`recognition.stop()`し、次に音量(RMS)がしきい値を超えたところで`recognition.start()`して再開する実装(`main.js`の`startVoiceMonitor`/`resumeRecognition`)になっている。Web Speech APIの`start()`には起動レイテンシがあり、それを「発話が始まってから」呼んでいるため、発話冒頭がレイテンシの間に失われて認識されない。

14．認識済みテキストの後からの編集
　確定したテキストを送信・読み上げする前(あるいは後でも)に、内容を編集できるようにしたい。

15．SenseVoiceで言語を日本語に固定すると文中の英語が消える不具合の修正
　`senseVoiceLangCode()`(`main.js`)経由でSenseVoice/Whisperに`language: "ja"`を明示指定しているため(直近のタスクで「auto」から固定に変更した際の副作用)、文中に混ざる英語(VRなど、日本語の文脈でもそのまま使われる単語)がまるごと出力されなくなる。

16．無音/呼吸音の誤認識を防ぐしきい値を設定画面から調整できるようにする
　`VOICE_RMS_THRESHOLD`(`main.js`、現在0.01固定)が低く、マイクに入った小さい息や物音だけで「あ。」「う。」のような短い誤認識が発生する。この音量しきい値を設定画面から調整できるようにする。

17．ローカル設定をデフォルト状態にリセットする機能の見直し
　既存の「設定を全てリセット」ボタン(`#settings-reset-btn`)は実装当初のキーしかクリアしておらず、以降追加された設定(STTエンジン/モデル、チャットボックス/TTS有効、送信モード、UI/VRモード、キャラクター選択、TTS言語、STT言語サイクルなど)が対象に含まれていない。逆に`DEVICE_SETTINGS_KEY`(マイク/スピーカー選択、端末固有)が誤ってクリア対象に含まれている。対象を洗い出して修正する。

18．SenseVoiceの語彙不足(VR/AIなど日本語文中の英単語)の調査
　15番で「自動」言語モードを追加した後も、日本語での使用時に「VR」「AI」のような(日本語の文脈でも普通に使われる)英単語がSenseVoiceで認識されない/欠落することがある。速度は良好なので維持しつつ、より語彙が広い(日本語特化のモデルでも可)代替のローカルSTTエンジン/モデルを調査する。sense_voice.rsのMODELS配列は複数モデルを切り替えられる設計になっている(現状SenseVoice軽量/標準・Whisper turbo/medium)ので、有望なものが見つかれば同じ仕組みに追加できる。
　→ ReazonSpeech-k2-v2-ja-en・NVIDIA Parakeet-ja(NeMo CTC)を追加して解決。reazon-research/reazonspeech-nemo-v2も試したが、ONNX化はできたもののONNX Runtimeのバージョン競合(既存モデルはOrtApi 27以降必須、この export はORT 1.20.x以下でしかロードできない、上流のグラフ最適化まわりの既知不具合)で統合不可と判断し見送り。

19．ローカルSTTのモデル選択・言語対応の整理
　Whisper medium・ReazonSpeech-k2-v2-ja-en(Transducer系、約73MB)をモデル選択肢から削除する(sense_voice.rsのMODELS配列・ModelFiles::Transducerサポートごと)。ReazonSpeech側の削除により、sherpa-onnxのhotwords(単語ブースト)機能が使える唯一のモデルも無くなるが、hotwords自体は現時点では見送りでよいとのこと。
　また、選択中のローカルSTTモデルが対応していない言語(例: Parakeet-jaは日本語のみ)を、設定画面の言語サイクル欄でグレーアウトして選べないようにする。
　あわせて、発話中のプレビュー表示(interim)のオン/オフを設定で切り替えられるようにする(デフォルトはON。Whisperなど処理が重いモデルで負荷を避けたい場合向け)。

20．ローカルSTTの発話区切り判定をSilero VADに置き換える
　現状、ローカルSTT(SenseVoice/Whisper/Parakeet)の発話区切り判定は`main.js`の単純なRMS(音量)しきい値のみ(`voiceRmsThresholdCache`)で、呼吸音・気流音(布団に寝転んで使用時など)や環境ノイズを誤って発話開始と判定しやすい。`sherpa-onnx`クレートには既にSilero VAD(`VoiceActivityDetector`/`SileroVadModelConfig`)が組み込まれているので、新規の重い依存追加無しで使える。Rust側にVADを実装し、生の音声をRustへ継続的に送って区切りを判定する方式に置き換える(WebSpeech APIは対象外、独自のエンドポイント検出を持つため変更不要)。

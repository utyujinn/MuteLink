// UI localization (independent of STT/TTS recognition language — this is
// the app's own chrome: labels, hints, buttons, dynamic status text). Each
// entry is one distinct source string, keyed by a short id and reused
// everywhere that exact string appeared before this existed. Language *names*
// themselves (日本語/English/中文/한국어, and font family names) are
// deliberately left untranslated — those are proper nouns that always read
// the same regardless of UI language, matching how language pickers work
// almost everywhere.
const I18N = {
  minimize: { ja: "最小化", en: "Minimize", zh: "最小化", ko: "최소화" },
  maximize: { ja: "最大化", en: "Maximize", zh: "最大化", ko: "최대화" },
  close: { ja: "閉じる", en: "Close", zh: "关闭", ko: "닫기" },

  navGeneral: { ja: "一般", en: "General", zh: "常规", ko: "일반" },
  navCharacter: { ja: "キャラクター", en: "Character", zh: "角色", ko: "캐릭터" },
  navEndings: { ja: "語尾", en: "Endings", zh: "语尾", ko: "어미" },
  navTemplates: { ja: "テンプレート", en: "Templates", zh: "模板", ko: "템플릿" },
  navDevice: { ja: "デバイス", en: "Device", zh: "设备", ko: "장치" },
  navAppearance: { ja: "外観", en: "Appearance", zh: "外观", ko: "외관" },
  navHotkey: { ja: "ホットキー", en: "Hotkey", zh: "快捷键", ko: "단축키" },
  navOther: { ja: "その他", en: "Other", zh: "其他", ko: "기타" },

  micSensitivityHeading: { ja: "マイク感度", en: "Microphone sensitivity", zh: "麦克风灵敏度", ko: "마이크 감도" },
  micSensitivityLabel: {
    ja: "無音判定のしきい値",
    en: "Silence detection threshold",
    zh: "静音判定阈值",
    ko: "무음 판정 임계값",
  },
  micSensitivityHint: {
    ja: "値を大きくすると、息や物音などの小さな音を発話と誤認識しにくくなります。大きくしすぎると、小さな声を拾えなくなることがあります。ローカル音声認識(SenseVoice/Whisper/Parakeet)の発話区切り判定にはこの値ではなくVADモデルが使われるため、その誤認識対策としてはあまり効きません。",
    en: "A higher value makes quiet sounds (breathing, background noise) less likely to be misread as speech. Too high, though, and quiet speech itself may go undetected. Local speech recognition (SenseVoice/Whisper/Parakeet) uses a VAD model rather than this value to detect utterance boundaries, so raising it won't help much against false triggers there.",
    zh: "数值越大，呼吸声等微小声音越不容易被误判为说话；但过大可能导致较小的说话声也无法被识别。本地语音识别(SenseVoice/Whisper/Parakeet)的发话区间判定使用的是VAD模型而非此数值，因此对本地识别的误判帮助有限。",
    ko: "값을 높이면 숨소리 등 작은 소리를 발화로 오인식하기 어려워집니다. 너무 높이면 작은 목소리를 인식하지 못할 수 있습니다. 로컬 음성 인식(SenseVoice/Whisper/Parakeet)의 발화 구간 판정은 이 값이 아니라 VAD 모델을 사용하므로, 그쪽 오인식 대책으로는 큰 효과가 없습니다.",
  },

  resetHeading: { ja: "リセット", en: "Reset", zh: "重置", ko: "초기화" },
  resetButton: { ja: "設定を全てリセット", en: "Reset all settings", zh: "重置所有设置", ko: "모든 설정 초기화" },
  resetConfirm: {
    ja: "設定を全てリセットします。よろしいですか？",
    en: "This will reset all settings. Continue?",
    zh: "将重置所有设置，确定吗？",
    ko: "모든 설정을 초기화합니다. 계속하시겠습니까?",
  },

  characterHeading: {
    ja: "出力音声キャラクター",
    en: "Output Voice Character",
    zh: "输出语音角色",
    ko: "출력 음성 캐릭터",
  },
  loading: { ja: "読み込み中...", en: "Loading...", zh: "加载中...", ko: "불러오는 중..." },
  characterLoadFailedPrefix: {
    ja: "読み込みに失敗しました: ",
    en: "Failed to load: ",
    zh: "加载失败：",
    ko: "불러오기 실패: ",
  },
  currentVoicePrefix: { ja: "現在の音声: ", en: "Current voice: ", zh: "当前语音：", ko: "현재 음성: " },
  currentVoiceUnset: { ja: "未設定", en: "Not set", zh: "未设置", ko: "미설정" },
  downloaded: { ja: "追加済み", en: "Added", zh: "已添加", ko: "추가됨" },
  notDownloaded: { ja: "未追加", en: "Not added", zh: "未添加", ko: "추가 안 됨" },
  addSiblingsHintPrefix: {
    ja: "追加すると同じ音声データに含まれる次のキャラも一緒に追加されます: ",
    en: "Adding this will also add these characters bundled in the same voice data: ",
    zh: "添加后将同时添加同一语音数据中包含的以下角色：",
    ko: "추가하면 같은 음성 데이터에 포함된 다음 캐릭터도 함께 추가됩니다: ",
  },
  addAloneHint: {
    ja: "このキャラクターはまだ追加されていません。",
    en: "This character hasn't been added yet.",
    zh: "此角色尚未添加。",
    ko: "이 캐릭터는 아직 추가되지 않았습니다.",
  },
  addButton: { ja: "追加", en: "Add", zh: "添加", ko: "추가" },
  downloadingButton: { ja: "ダウンロード中...", en: "Downloading...", zh: "下载中...", ko: "다운로드 중..." },

  endingsHint: {
    ja: "語尾は1〜10の番号で固定されたスロットです。ホットキーは番号で語尾を参照するので、ここでテキストを書き換えると、その番号を割り当てているホットキーの内容もすぐに切り替わります。番号がすでにどこかのホットキーに割り当てられている場合、行に「→ 右手: トリガーのみ」のように表示されます。語尾ごとに、送信時にVOICEVOXでその語尾を読み上げるかどうかと、読み上げる場合の読み方も設定できます(既定はオフ = 元のテキストだけ読み上げ)。絵文字や顔文字はそのままだと発音が崩れるので、読み方欄にひらがな/カタカナなどを入力してください。",
    en: 'Endings are 10 fixed slots numbered 1-10. Hotkeys reference an ending by its number, so editing the text here immediately updates any hotkey assigned to that number. If a number is already assigned to a hotkey, the row shows it directly, e.g. "→ Right hand: Trigger only". For each ending you can also choose whether VOICEVOX reads it aloud when sent, and what to read instead (off by default — only the original text is read). Emoji and kaomoji tend to be mispronounced as-is, so enter a phonetic reading (hiragana/katakana, etc.) in the reading field.',
    zh: "语尾固定为1〜10号共10个位置。快捷键通过编号引用语尾，所以在这里修改文本后，指定该编号的快捷键内容也会立即更新。如果某个编号已被某个快捷键使用，该行会直接显示，例如「→ 右手：仅扳机」。每个语尾还可以单独设置发送时VOICEVOX是否朗读该语尾，以及朗读时使用的读音(默认关闭 = 只朗读原文)。表情符号和颜文字直接朗读容易发音错误，请在读音栏中输入平假名/片假名等。",
    ko: "어미는 1~10번으로 고정된 슬롯입니다. 단축키는 번호로 어미를 참조하므로, 여기서 텍스트를 수정하면 그 번호가 할당된 단축키의 내용도 바로 바뀝니다. 번호가 이미 어떤 단축키에 할당되어 있으면 행에 「→ 오른손: 트리거만」과 같이 바로 표시됩니다. 어미별로 전송 시 VOICEVOX가 그 어미를 읽을지 여부와, 읽을 경우의 읽는 방법도 설정할 수 있습니다(기본값은 꺼짐 = 원문만 읽음). 이모지나 이모티콘은 그대로면 발음이 깨지므로, 읽는 방법 칸에 히라가나/가타카나 등을 입력하세요.",
  },

  endingTextFieldLabel: { ja: "テキスト", en: "Text", zh: "文本", ko: "텍스트" },
  endingSpeakLabel: { ja: "読み上げる", en: "Speak aloud", zh: "朗读", ko: "읽어주기" },
  endingReadingLabel: { ja: "読み方", en: "Reading", zh: "读音", ko: "읽는 방법" },
  paramSpeed: { ja: "話速", en: "Speed", zh: "语速", ko: "속도" },
  paramPitch: { ja: "音高", en: "Pitch", zh: "音高", ko: "음높이" },
  paramIntonation: { ja: "抑揚", en: "Intonation", zh: "抑扬", ko: "억양" },
  paramVolume: { ja: "音量", en: "Volume", zh: "音量", ko: "음량" },

  micHeading: { ja: "マイク", en: "Microphone", zh: "麦克风", ko: "마이크" },
  micDeviceHint: {
    ja: "ここで選んだマイクは、Windowsの既定の録音デバイスとして設定されます(音声認識は常にWindowsの既定デバイスを使うため)。他のアプリのマイク入力にも影響する点にご注意ください。",
    en: "Picking a mic here sets it as Windows' default recording device (speech recognition always uses whatever that is). Note that this also affects the microphone input of other apps.",
    zh: "在此选择的麦克风会被设为Windows的默认录音设备(语音识别始终使用该设备)。请注意，这也会影响其他应用的麦克风输入。",
    ko: "여기서 선택한 마이크는 Windows의 기본 녹음 장치로 설정됩니다(음성 인식은 항상 이 기본 장치를 사용합니다). 다른 앱의 마이크 입력에도 영향을 준다는 점에 유의하세요.",
  },
  autoSelect: { ja: "自動選択", en: "Auto-select", zh: "自动选择", ko: "자동 선택" },
  speakerHeading: { ja: "スピーカー", en: "Speaker", zh: "扬声器", ko: "스피커" },

  colorModeLabel: { ja: "カラーモード", en: "Color mode", zh: "颜色模式", ko: "색상 모드" },
  themeSystem: { ja: "システム既定", en: "System default", zh: "系统默认", ko: "시스템 기본값" },
  themeLight: { ja: "ライト", en: "Light", zh: "浅色", ko: "라이트" },
  themeDark: { ja: "ダーク", en: "Dark", zh: "深色", ko: "다크" },
  accentColorLabel: { ja: "アクセントカラー", en: "Accent color", zh: "强调色", ko: "강조 색상" },
  uiScaleLabel: { ja: "UIサイズ", en: "UI size", zh: "界面大小", ko: "UI 크기" },
  fontScaleLabel: { ja: "フォントサイズ", en: "Font size", zh: "字体大小", ko: "글꼴 크기" },
  fontFamilyLabel: { ja: "フォント", en: "Font", zh: "字体", ko: "글꼴" },
  fontDefault: { ja: "既定", en: "Default", zh: "默认", ko: "기본값" },

  vrKeyOpacityLabel: { ja: "キーの不透明度", en: "Key opacity", zh: "按键不透明度", ko: "키 불투명도" },
  keySoundVolumeLabel: { ja: "キー入力音の音量", en: "Key click volume", zh: "按键音量", ko: "키 클릭 음량" },
  vrOverlayBackgroundHeading: {
    ja: "VRオーバーレイの背景画像",
    en: "VR Overlay Background Images",
    zh: "VR叠加层背景图片",
    ko: "VR 오버레이 배경 이미지",
  },
  vrOverlayBackgroundHint: {
    ja: "VRキーボード(カーソル操作ブロックを含む)と確認/破棄プレビューに、別々の背景画像と不透明度を設定できます。選んだ画像はそれぞれの縦横比に合わせて切り取ってから設定します。",
    en: "Set a separate background image and opacity for the VR keyboard (including its cursor-control block) and the confirm/discard preview window. Each image is cropped to that surface's own aspect ratio before it's applied.",
    zh: "可以为VR键盘(含光标操作区)和确认/放弃预览窗口分别设置不同的背景图片和不透明度。所选图片会先按各自的宽高比裁剪，然后再应用。",
    ko: "VR 키보드(커서 조작 블록 포함)와 확인/취소 미리보기 창에 각각 별도의 배경 이미지와 불투명도를 설정할 수 있습니다. 선택한 이미지는 각 화면의 가로세로 비율에 맞게 잘린 후 적용됩니다.",
  },
  vrKeyboardBgOpacityLabel: {
    ja: "キーボード背景の不透明度",
    en: "Keyboard background opacity",
    zh: "键盘背景不透明度",
    ko: "키보드 배경 불투명도",
  },
  vrKeyboardBgImageLabel: { ja: "キーボード背景", en: "Keyboard background", zh: "键盘背景", ko: "키보드 배경" },
  vrBoxBgOpacityLabel: {
    ja: "プレビュー部の不透明度",
    en: "Preview background opacity",
    zh: "预览区背景不透明度",
    ko: "미리보기 배경 불투명도",
  },
  vrBoxBgImageLabel: { ja: "プレビュー部背景", en: "Preview background", zh: "预览区背景", ko: "미리보기 배경" },
  chooseImageButton: { ja: "画像を選ぶ", en: "Choose Image", zh: "选择图片", ko: "이미지 선택" },
  removeImageButton: { ja: "削除", en: "Remove", zh: "删除", ko: "삭제" },
  vrKeyboardBackgroundSetStatus: { ja: "設定済み", en: "Set", zh: "已设置", ko: "설정됨" },
  vrKeyboardBackgroundUnsetStatus: { ja: "未設定", en: "Not set", zh: "未设置", ko: "설정 안 됨" },
  imageCropHint: {
    ja: "ドラッグで位置を調整、スライダーで拡大できます。",
    en: "Drag to reposition, use the slider to zoom in.",
    zh: "拖动可调整位置，使用滑块可放大。",
    ko: "드래그로 위치를 조정하고, 슬라이더로 확대할 수 있습니다.",
  },
  applyButton: { ja: "適用", en: "Apply", zh: "应用", ko: "적용" },

  holdDurationLabel: { ja: "保持時間", en: "Hold duration", zh: "按住时长", ko: "유지 시간" },
  secondsSuffix: { ja: "秒", en: "s", zh: "秒", ko: "초" },
  priorityHandLabel: { ja: "優先する手", en: "Priority hand", zh: "优先手", ko: "우선 손" },
  hotkeyProfileMovedHint: {
    ja: "どのプロファイルの割り当てを編集するかは、プロファイルメニューで選べます。下の割り当ては選んだプロファイルの内容です。メイン画面の「P1/P2/...」ボタンでも切り替えられます。",
    en: "Which profile's assignments you're editing is chosen from the Profile menu. The assignments below belong to whichever profile is selected there. The \"P1/P2/...\" button on the main screen switches too.",
    zh: "在哪个配置文件中编辑分配，请在配置文件菜单中选择。下方的分配对应在那里选中的配置文件。主界面的「P1/P2/...」按钮也可以切换。",
    ko: "어느 프로필의 할당을 편집할지는 프로필 메뉴에서 선택합니다. 아래 할당은 거기서 선택한 프로필의 내용입니다. 메인 화면의 「P1/P2/...」 버튼으로도 전환할 수 있습니다.",
  },
  navProfile: { ja: "プロファイル", en: "Profile", zh: "配置文件", ko: "프로필" },
  profileMenuHint: {
    ja: "プロファイルは話すキャラクター・語尾・テンプレート・ホットキーの割り当てをまとめて切り替えます(General/Device/Appearanceはプロファイルに関わらず共通です)。ここでアクティブなプロファイルを選んだり、プロファイル数(1〜5)を変えたり、あるプロファイルの内容を別のプロファイルにコピーできます。",
    en: "A profile bundles the speaking character, endings, templates, and hotkey assignments together — General/Device/Appearance stay the same regardless of profile. Here you can pick the active profile, change how many exist (1-5), and copy one profile's contents into another.",
    zh: "配置文件会把发声角色、语尾、模板和快捷键分配打包在一起切换(General/Device/Appearance 与配置文件无关，始终通用)。在这里可以选择当前使用的配置文件、更改配置文件数量(1〜5)、以及把某个配置文件的内容复制到另一个配置文件。",
    ko: "프로필은 발화 캐릭터・어미・템플릿・단축키 할당을 함께 전환합니다(General/Device/Appearance는 프로필과 무관하게 공통입니다). 여기서 활성 프로필을 선택하거나, 프로필 개수(1~5)를 바꾸거나, 한 프로필의 내용을 다른 프로필로 복사할 수 있습니다.",
  },
  profileCountLabel: { ja: "プロファイル数", en: "Profile count", zh: "配置文件数量", ko: "프로필 개수" },
  profileCountShrinkConfirm: {
    ja: "プロファイル数を減らすと、はみ出したプロファイルの内容(キャラクター・語尾・テンプレート・ホットキー)は失われます。よろしいですか?",
    en: "Reducing the profile count permanently discards the contents (character/endings/templates/hotkeys) of the profiles beyond the new count. Continue?",
    zh: "减少配置文件数量会永久丢失超出部分的配置文件内容(角色・语尾・模板・快捷键)。确定要继续吗?",
    ko: "프로필 개수를 줄이면 범위를 벗어난 프로필의 내용(캐릭터・어미・템플릿・단축키)이 사라집니다. 계속하시겠습니까?",
  },
  profileCharacterLabel: { ja: "キャラクター", en: "Character", zh: "角色", ko: "캐릭터" },
  profileDetailsButton: { ja: "詳細", en: "Details", zh: "详情", ko: "상세" },
  profileCopyButton: { ja: "コピー", en: "Copy", zh: "复制", ko: "복사" },
  profilePasteButton: { ja: "貼り付け", en: "Paste", zh: "粘贴", ko: "붙여넣기" },
  hotkeyProfileSwitchLabel: {
    ja: "ホットキープロファイル切替",
    en: "Switch hotkey profile",
    zh: "切换快捷键配置",
    ko: "단축키 프로필 전환",
  },
  uiModeToggleLabel: {
    ja: "デスクトップ/VR切替",
    en: "Switch Desktop/VR mode",
    zh: "切换桌面/VR模式",
    ko: "데스크톱/VR 전환",
  },
  langCycleButtonLabel: {
    ja: "言語切替",
    en: "Switch language",
    zh: "切换语言",
    ko: "언어 전환",
  },
  discardTextButtonLabel: {
    ja: "破棄",
    en: "Discard",
    zh: "清除",
    ko: "취소",
  },
  pendingTextEditorPlaceholder: {
    ja: "認識されたテキストがここに表示されます。編集できます。",
    en: "Recognized text appears here. You can edit it.",
    zh: "识别出的文字会显示在这里，可以编辑。",
    ko: "인식된 텍스트가 여기에 표시됩니다. 편집할 수 있습니다.",
  },
  handRight: { ja: "右手", en: "Right hand", zh: "右手", ko: "오른손" },
  handLeft: { ja: "左手", en: "Left hand", zh: "左手", ko: "왼손" },
  hotkeyHint: {
    ja: "SteamVR経由で両手のグリップ/トリガー/スティック押し込みの状態を読み取ります。左右の手にそれぞれ別々の語尾(または送信取り消し)を割り当てられます。手動モードでFinalが確定した状態で、割り当てた組み合わせを保持時間ぶん押し続けるとその語尾で即送信、または送信取り消しが実行されます(スティックは押した瞬間に発火)。両手を同時に保持している場合、優先する手の状態がオーバーレイに表示されます。左手下側のボタンを押すたびに、認識言語が日本語→English→中文→한국어→OFF→日本語…の順に切り替わります(OFFは音声認識停止)。",
    en: "Reads both controllers' grip/trigger/stick-press state via SteamVR. Each hand can be assigned its own ending (or cancel-send). In manual mode, once a Final is confirmed, holding the assigned combo for the hold duration immediately sends that ending, or cancels (stick fires the instant it's pressed). If both hands are held at once, the priority hand's state is shown in the overlay. Pressing the lower button on the left controller cycles the recognition language: Japanese → English → Chinese → Korean → OFF → Japanese... (OFF stops recognition).",
    zh: "通过SteamVR读取双手手柄的握把/扳机/摇杆按下状态。可以为左右手分别指定不同的语尾(或取消发送)。在手动模式下，Final确定后，按住指定的组合达到按住时长即可立即发送该语尾，或执行取消发送(摇杆按下的瞬间触发)。双手同时按住时，优先手的状态会显示在悬浮窗中。按左手下方按钮可依次切换识别语言：日语→英语→中文→韩语→关闭→日语……(关闭会停止语音识别)。",
    ko: "SteamVR을 통해 양손 컨트롤러의 그립/트리거/스틱 누름 상태를 읽습니다. 좌우 손에 각각 다른 어미(또는 전송 취소)를 할당할 수 있습니다. 수동 모드에서 Final이 확정된 상태로, 할당한 조합을 유지 시간만큼 누르고 있으면 그 어미로 즉시 전송되거나 전송이 취소됩니다(스틱은 누르는 순간 발동). 양손을 동시에 누르고 있으면 우선 손의 상태가 오버레이에 표시됩니다. 왼손 아래쪽 버튼을 누를 때마다 인식 언어가 일본어→English→中文→한국어→OFF→일본어…순으로 전환됩니다(OFF는 음성 인식 정지).",
  },
  vrStatusDisconnected: { ja: "VR: 未接続", en: "VR: Disconnected", zh: "VR：未连接", ko: "VR: 연결 안 됨" },
  vrStatusConnected: { ja: "VR: 接続済み", en: "VR: Connected", zh: "VR：已连接", ko: "VR: 연결됨" },
  vrStatusConnecting: { ja: "VR: 接続試行中...", en: "VR: Connecting...", zh: "VR：正在连接...", ko: "VR: 연결 시도 중..." },
  reconnectButton: { ja: "再接続", en: "Reconnect", zh: "重新连接", ko: "재연결" },

  vrKeyboardHeading: {
    ja: "VRキーボード(開発中)",
    en: "VR keyboard (in development)",
    zh: "VR键盘(开发中)",
    ko: "VR 키보드(개발 중)",
  },
  vrKeyboardHint: {
    ja: "右トリガーのダブルクリック(既定)でVR内キーボードの表示/非表示を切り替え、編集後は画面上の送信ボタンで送信します。右スティック押し込み(単押し、既定)で入力中の文章を全消しします。グリップ/トリガーの単押し・長押し・ダブルクリックはすべて下の欄で割り当てを変更できます(表示中は既定でグリップ/トリガーの長押しによる送信は無効になりますが、下の「キーボード表示中もホットキーを有効にする」をオンにすると有効化できます)。開発中の機能です。",
    en: "A right-trigger double-click (default) toggles the in-VR keyboard; send from its own on-screen Send button after editing. A short right-stick press (default) clears whatever's pending. Every grip/trigger gesture (hold, double-click) is reassignable below (grip/trigger-hold sending is disabled by default while the keyboard is shown — enable \"Keep hotkeys active while the keyboard is open\" below to allow it too). Still in development.",
    zh: "双击右扳机(默认)可切换VR内键盘的显示/隐藏，编辑后用屏幕上的发送按钮发送。短按右摇杆(默认)会清空当前输入内容。握把/扳机的按住、双击均可在下方重新分配(显示键盘时默认禁用握把/扳机长按发送，可在下方开启「键盘显示时也启用热键」来允许)。此功能仍在开发中。",
    ko: "오른쪽 트리거 더블클릭(기본값)으로 VR 키보드 표시/숨김을 전환하고, 편집 후에는 화면의 전송 버튼으로 전송합니다. 오른쪽 스틱 짧게 누름(기본값)으로 입력 중인 내용을 모두 지웁니다. 그립/트리거의 길게 누름·더블클릭은 모두 아래에서 재할당할 수 있습니다(키보드 표시 중에는 기본적으로 그립/트리거 길게 누름 전송이 비활성화되지만, 아래 「키보드가 열려 있어도 단축키 유지」를 켜면 활성화할 수 있습니다). 아직 개발 중인 기능입니다.",
  },
  // The VR keyboard's own on-screen send button — rendered inside the
  // SteamVR overlay texture by Rust (see overlay.rs's render_keyboard), not
  // an HTML element, so this can't just be a data-i18n attribute like most
  // UI text; computeVrKeyboardLayout() reads it directly via t().
  // VR keyboard mode buttons (same t()-in-layout situation as above).
  // vrKbModeKana is what an active mode's own button relabels to — it
  // names the destination (back to kana input) rather than a generic
  // "back", since the other mode buttons jump sideways, not back.
  vrKbModeTemplate: { ja: "テンプレ", en: "Phrases", zh: "模板", ko: "템플릿" },
  // Same label in every language — a digit+symbol combo reads as "numbers
  // and symbols" regardless of UI language, matching the convention phone
  // keyboards already use for this exact combined mode (see
  // VR_KB_NUMSYM_ROWS' own comment for why number/symbol merged into one).
  vrKbModeNumber: { ja: "?123", en: "?123", zh: "?123", ko: "?123" },
  vrKbModeEnglish: { ja: "英字", en: "ABC", zh: "英文", ko: "영문" },
  vrKbModeKana: { ja: "かな", en: "Kana", zh: "假名", ko: "가나" },
  vrKbNewlineButton: { ja: "改行", en: "Newline", zh: "换行", ko: "줄바꿈" },
  vrKbSpaceButton: { ja: "空白", en: "Space", zh: "空格", ko: "스페이스" },
  // Column 5's 確定 button (see computeVrKeyboardLayout) — ends 変換
  // conversion mode without also typing, moving the cursor, or sending.
  vrKbConfirmButton: { ja: "確定", en: "Confirm", zh: "确定", ko: "확정" },

  vrKeyboardTemplatesHeading: {
    ja: "テンプレート入力(最大12個)",
    en: "Quick-phrase templates (up to 12)",
    zh: "模板输入(最多12个)",
    ko: "템플릿 입력(최대 12개)",
  },
  vrKeyboardTemplatesHint: {
    ja: "VRキーボードの「テンプレ」モードでワンタップ入力できるフレーズを登録できます。空欄のスロットはキーボード上でも空欄(入力なし)として表示されます。",
    en: "Register phrases you can insert with one tap from the VR keyboard's template mode. A slot left blank here shows as blank (does nothing) on the keyboard too.",
    zh: "注册可在VR键盘的「模板」模式下一键输入的短语。留空的位置在键盘上也会显示为空白(无操作)。",
    ko: "VR 키보드의 「템플릿」 모드에서 한 번에 입력할 수 있는 문구를 등록합니다. 비워둔 슬롯은 키보드에서도 빈칸(동작 없음)으로 표시됩니다.",
  },

  presetHeading: { ja: "プリセット", en: "Preset", zh: "预设", ko: "프리셋" },
  presetHint: {
    ja: "現在の語尾とホットキー割り当てをJSONとしてコピーできます。他の人から受け取ったJSONを下の欄に貼り付けて「JSONを読み込む」を押すと、その内容で上書きされます。",
    en: 'Copy the current endings and hotkey assignments as JSON. Paste JSON you received from someone else into the box below and press "Load JSON" to overwrite your current settings with it.',
    zh: "可以将当前的语尾和快捷键分配复制为JSON。将他人分享的JSON粘贴到下方文本框并点击「读取JSON」，即可用其内容覆盖当前设置。",
    ko: "현재 어미와 단축키 할당을 JSON으로 복사할 수 있습니다. 다른 사람에게 받은 JSON을 아래 칸에 붙여넣고 「JSON 불러오기」를 누르면 그 내용으로 덮어씁니다.",
  },
  presetCopyButton: { ja: "JSONをコピー", en: "Copy JSON", zh: "复制JSON", ko: "JSON 복사" },
  presetLoadButton: { ja: "JSONを読み込む", en: "Load JSON", zh: "读取JSON", ko: "JSON 불러오기" },
  presetCopiedStatus: { ja: "コピーしました", en: "Copied", zh: "已复制", ko: "복사했습니다" },
  presetLoadedStatus: { ja: "読み込みました", en: "Loaded", zh: "已加载", ko: "불러왔습니다" },
  presetInvalidStatus: { ja: "JSONが不正です", en: "Invalid JSON", zh: "JSON格式无效", ko: "JSON이 올바르지 않습니다" },
  presetLoadConfirm: {
    ja: "現在の語尾とホットキー設定を、貼り付けたJSONの内容で上書きします。よろしいですか？",
    en: "This will overwrite your current endings and hotkey settings with the pasted JSON. Continue?",
    zh: "将用粘贴的JSON内容覆盖当前的语尾和快捷键设置，确定吗？",
    ko: "현재 어미와 단축키 설정을 붙여넣은 JSON 내용으로 덮어씁니다. 계속하시겠습니까?",
  },

  slotBoth: { ja: "グリップ+トリガー", en: "Grip + Trigger", zh: "握把+扳机", ko: "그립+트리거" },
  slotGrip: { ja: "グリップのみ", en: "Grip only", zh: "仅握把", ko: "그립만" },
  slotGripDouble: { ja: "グリップ ダブルクリック", en: "Grip double-click", zh: "握把双击", ko: "그립 더블클릭" },
  slotTrigger: { ja: "トリガーのみ", en: "Trigger only", zh: "仅扳机", ko: "트리거만" },
  slotTriggerDouble: { ja: "トリガー ダブルクリック", en: "Trigger double-click", zh: "扳机双击", ko: "트리거 더블클릭" },
  slotADouble: {
    ja: "言語切替ボタン ダブルクリック",
    en: "Language-switch button double-click",
    zh: "语言切换按钮 双击",
    ko: "언어 전환 버튼 더블클릭",
  },
  slotNone: { ja: "どちらも押していない", en: "Neither pressed", zh: "都未按下", ko: "아무것도 안 누름" },
  slotStick: { ja: "スティック押し込み", en: "Stick press", zh: "摇杆按下", ko: "스틱 누름" },
  slotStickLong: {
    ja: "スティック押し込み(長押し)",
    en: "Stick press (long)",
    zh: "摇杆按下(长按)",
    ko: "스틱 누름(길게)",
  },

  unset: { ja: "(未設定)", en: "(Unset)", zh: "（未设置）", ko: "(미설정)" },
  cancelSend: { ja: "送信取り消し", en: "Cancel send", zh: "取消发送", ko: "전송 취소" },
  hotkeyKeyboardToggleOption: {
    ja: "VRキーボード表示切替",
    en: "Toggle VR keyboard",
    zh: "切换VR键盘显示",
    ko: "VR 키보드 표시 전환",
  },

  sttCycleLangHeading: { ja: "言語サイクル", en: "Language Cycle", zh: "语言循环", ko: "언어 순환" },
  sttCycleLangListLabel: {
    ja: "ボタンでループする言語",
    en: "Languages cycled by the button",
    zh: "按钮循环的语言",
    ko: "버튼으로 순환할 언어",
  },
  sttCycleLangHint: {
    ja: "左手下側のボタン(またはメイン画面の丸ボタン)を押すたびに、ここでチェックした言語を順番に切り替えます(OFFも必ず含まれます)。チェックを外した言語はサイクルから除外されます。",
    en: "Pressing the left controller's lower button (or the round button on the main screen) cycles through the languages checked here, in order (OFF is always included). Unchecked languages are skipped.",
    zh: "每次按下左手下方按钮(或主界面的圆形按钮)，会依次切换到这里勾选的语言(始终包含关闭)。未勾选的语言会被跳过。",
    ko: "왼손 아래쪽 버튼(또는 메인 화면의 둥근 버튼)을 누를 때마다 여기서 선택한 언어를 순서대로 전환합니다(OFF는 항상 포함됩니다). 선택하지 않은 언어는 건너뜁니다.",
  },
  ttsLangHeading: { ja: "読み上げ言語", en: "Read-aloud languages", zh: "朗读语言", ko: "읽어주기 언어" },
  ttsLangListLabel: {
    ja: "VOICEVOXで読み上げる言語",
    en: "Languages VOICEVOX reads aloud",
    zh: "由VOICEVOX朗读的语言",
    ko: "VOICEVOX가 읽어줄 언어",
  },
  ttsLangHint: {
    ja: "オフにした言語は認識結果をVOICEVOXに送らず、読み上げをスキップします。English/中文/한국어はOpenJTalk(VOICEVOXのテキスト解析)が対応していないため発音が崩れますが、そのまま送信されます。",
    en: "Languages turned off won't have their recognized text sent to VOICEVOX at all — read-aloud is skipped. English/中文/한국어 aren't supported by OpenJTalk (VOICEVOX's text analyzer), so pronunciation may be off, but the text is still sent as-is.",
    zh: "关闭的语言不会将识别结果发送给VOICEVOX，会跳过朗读。English/中文/한국어由于OpenJTalk(VOICEVOX的文本解析器)不支持，发音可能会不准确，但仍会照常发送。",
    ko: "꺼진 언어는 인식 결과를 VOICEVOX로 보내지 않고 읽어주기를 건너뜁니다. English/中文/한국어는 OpenJTalk(VOICEVOX의 텍스트 분석기)가 지원하지 않아 발음이 깨질 수 있지만, 그대로 전송됩니다.",
  },

  voicevoxTestHeading: { ja: "VOICEVOXテスト", en: "VOICEVOX Test", zh: "VOICEVOX测试", ko: "VOICEVOX 테스트" },
  speakButton: { ja: "Speak", en: "Speak", zh: "朗读", ko: "말하기" },
  voicevoxSynthesizing: { ja: "音声合成中...", en: "Synthesizing...", zh: "合成中...", ko: "합성 중..." },
  voicevoxPlaying: { ja: "再生中", en: "Playing", zh: "播放中", ko: "재생 중" },

  pronunciationDictHeading: { ja: "発音辞書", en: "Pronunciation Dictionary", zh: "发音词典", ko: "발음 사전" },
  pronunciationDictHint: {
    ja: "VOICEVOXが単語を間違って読む場合(例:「は」を助詞の「わ」として読んでしまう等)、正しい読み方を登録できます。読み方はカタカナで入力してください。",
    en: "If VOICEVOX mispronounces a word (e.g. reading は as the わ particle sound), register the correct reading here. The reading must be entered in katakana.",
    zh: "如果VOICEVOX读错某个单词(例如把「は」读成助词「わ」的发音),可以在这里登记正确的读法。读法请用片假名输入。",
    ko: "VOICEVOX가 단어를 잘못 읽는 경우(예: 「は」를 조사 「わ」로 읽는 등) 올바른 읽는 법을 등록할 수 있습니다. 읽는 법은 가타카나로 입력하세요.",
  },
  pronunciationDictSurfacePlaceholder: { ja: "単語(例: はわはわ)", en: "Word (e.g. はわはわ)", zh: "单词(例: はわはわ)", ko: "단어(예: はわはわ)" },
  pronunciationDictReadingPlaceholder: {
    ja: "読み方 カタカナ(例: ハワハワ)",
    en: "Reading, katakana (e.g. ハワハワ)",
    zh: "读法 片假名(例: ハワハワ)",
    ko: "읽는 법, 가타카나(예: ハワハワ)",
  },
  pronunciationDictAddButton: { ja: "追加", en: "Add", zh: "添加", ko: "추가" },
  pronunciationDictRemoveAriaLabel: { ja: "削除", en: "Remove", zh: "删除", ko: "삭제" },

  logHeading: { ja: "ログ", en: "Log", zh: "日志", ko: "로그" },

  updateHeading: { ja: "アップデート", en: "Update", zh: "更新", ko: "업데이트" },
  updateCurrentVersionLabel: { ja: "現在のバージョン", en: "Current version", zh: "当前版本", ko: "현재 버전" },
  updateCheckButton: { ja: "アップデートを確認", en: "Check for updates", zh: "检查更新", ko: "업데이트 확인" },
  updateInstallButton: {
    ja: "更新をインストールして再起動",
    en: "Install update and restart",
    zh: "安装更新并重启",
    ko: "업데이트 설치 후 재시작",
  },
  updateCheckingStatus: { ja: "確認中...", en: "Checking...", zh: "正在检查...", ko: "확인 중..." },
  updateUpToDateStatus: { ja: "最新版です", en: "Up to date", zh: "已是最新版本", ko: "최신 버전입니다" },
  updateAvailableStatus: { ja: "新しいバージョンがあります", en: "New version available", zh: "有新版本", ko: "새 버전이 있습니다" },
  updateDownloadingStatus: {
    ja: "ダウンロード中...",
    en: "Downloading...",
    zh: "下载中...",
    ko: "다운로드 중...",
  },
  updateCheckFailedStatus: {
    ja: "更新の確認に失敗しました",
    en: "Failed to check for updates",
    zh: "检查更新失败",
    ko: "업데이트 확인 실패",
  },
  updateInstallFailedStatus: {
    ja: "更新のインストールに失敗しました",
    en: "Failed to install update",
    zh: "安装更新失败",
    ko: "업데이트 설치 실패",
  },

  aboutHeading: { ja: "情報", en: "About", zh: "关于", ko: "정보" },
  aboutCreatorLabel: { ja: "作成者", en: "Creator", zh: "作者", ko: "제작자" },
  aboutRepoLabel: { ja: "GitHubリポジトリ", en: "GitHub Repository", zh: "GitHub 仓库", ko: "GitHub 저장소" },
  aboutComingSoon: { ja: "準備中", en: "Coming soon", zh: "即将上线", ko: "준비 중" },
  aboutVoiceCreditLabel: { ja: "音声", en: "Voice", zh: "语音", ko: "음성" },

  characterLicenseNotice: {
    ja: "追加でダウンロードするキャラクターには、それぞれ個別の利用規約があります。ダウンロード前にご確認ください。",
    en: "Each additional downloadable character has its own individual license terms. Please review them before downloading.",
    zh: "每个可下载的追加角色都有各自独立的使用条款,下载前请务必确认。",
    ko: "추가로 다운로드하는 캐릭터에는 각각 개별 이용약관이 있습니다. 다운로드 전에 확인해 주세요.",
  },
  characterLicenseLinkLabel: {
    ja: "利用規約を確認",
    en: "View license terms",
    zh: "查看使用条款",
    ko: "이용약관 확인",
  },

  cancelButton: { ja: "キャンセル", en: "Cancel", zh: "取消", ko: "취소" },

  settingsLabel: { ja: "設定", en: "Settings", zh: "设置", ko: "설정" },
  autoLabel: { ja: "Auto", en: "Auto", zh: "自动", ko: "자동" },
  startButton: { ja: "開始", en: "Start", zh: "开始", ko: "시작" },
  stopButton: { ja: "停止", en: "Stop", zh: "停止", ko: "정지" },

  statusIdle: { ja: "待機中", en: "Idle", zh: "空闲", ko: "대기 중" },
  statusListening: { ja: "認識中", en: "Listening", zh: "识别中", ko: "인식 중" },
  statusConnecting: { ja: "接続中...", en: "Connecting...", zh: "连接中...", ko: "연결 중..." },
  statusReconnecting: { ja: "再接続中...", en: "Reconnecting...", zh: "重新连接中...", ko: "재연결 중..." },
  statusDisconnectedRetrying: {
    ja: "切断されました。再試行中...",
    en: "Disconnected, retrying...",
    zh: "已断开，正在重试...",
    ko: "연결 끊김, 재시도 중...",
  },
  // Shown once retries have failed repeatedly in a row without ever
  // reaching onstart (see GOOGLE_STUCK_THRESHOLD) — deliberately doesn't
  // flip back to statusReconnecting/statusListening between attempts the
  // way the earlier retries do, so it stays legible instead of flickering.
  statusWebSpeechUnavailable: {
    ja: "音声認識サービスに接続できません。しばらく経っても直らない場合、設定でローカル音声認識に切り替えてください。",
    en: "Can't connect to the speech recognition service. If this doesn't clear up on its own, try switching to local speech recognition in Settings.",
    zh: "无法连接语音识别服务。如长时间未恢复，请在设置中切换到本地语音识别。",
    ko: "음성 인식 서비스에 연결할 수 없습니다. 시간이 지나도 해결되지 않으면 설정에서 로컬 음성 인식으로 전환해 보세요.",
  },
  statusWaitingForVoice: { ja: "発話待ち...", en: "Waiting for voice...", zh: "等待语音...", ko: "음성 대기 중..." },
  statusSpeechNotSupported: {
    ja: "エラー: 音声認識に対応していません",
    en: "Error: Speech recognition not supported",
    zh: "错误：不支持语音识别",
    ko: "오류: 음성 인식이 지원되지 않습니다",
  },
  statusTranscribing: { ja: "認識処理中...", en: "Transcribing...", zh: "识别处理中...", ko: "인식 처리 중..." },
  statusSenseVoiceLoading: {
    ja: "モデルを読み込み中...",
    en: "Loading model...",
    zh: "正在加载模型...",
    ko: "모델 불러오는 중...",
  },
  statusSenseVoiceNotDownloaded: {
    ja: "エラー: SenseVoiceモデルが未ダウンロードです(設定 > General)",
    en: "Error: SenseVoice model not downloaded yet (Settings > General)",
    zh: "错误：尚未下载SenseVoice模型(设置 > General)",
    ko: "오류: SenseVoice 모델이 다운로드되지 않았습니다(설정 > General)",
  },
  statusErrorPrefix: { ja: "エラー: ", en: "Error: ", zh: "错误：", ko: "오류: " },

  uiLangLabel: { ja: "UIの言語", en: "UI Language", zh: "界面语言", ko: "UI 언어" },
  sttOff: { ja: "オフ", en: "Off", zh: "关闭", ko: "꺼짐" },
  // Not a language's own native name (unlike the ja-JP/en-US/zh-CN/ko-KR
  // radio labels, which are deliberately not translated by UI language —
  // see this dict's own top comment) — "auto" is a mode, so it goes through
  // t() like sttOff above instead of a fixed native-name lookup table.
  sttAuto: { ja: "自動", en: "Auto", zh: "自动", ko: "자동" },

  sttEngineHeading: { ja: "音声認識エンジン", en: "Speech Recognition Engine", zh: "语音识别引擎", ko: "음성 인식 엔진" },
  sttEngineLabel: { ja: "エンジン", en: "Engine", zh: "引擎", ko: "엔진" },
  sttEngineWebSpeechOption: {
    ja: "Web Speech API(オンライン)",
    en: "Web Speech API (online)",
    zh: "Web Speech API(在线)",
    ko: "Web Speech API(온라인)",
  },
  sttEngineSenseVoiceOption: {
    ja: "ローカル(SenseVoice / Whisper)",
    en: "Local (SenseVoice / Whisper)",
    zh: "本地(SenseVoice / Whisper)",
    ko: "로컬(SenseVoice / Whisper)",
  },
  sttEngineHint: {
    ja: "ローカル音声認識は発話の区切りごとにまとめて認識しますが、発話中も一定間隔で再認識してプレビュー表示します(下の設定でオフにできます)。選んだモデルは初回利用時にダウンロードが必要です。",
    en: "Local speech recognition recognizes one whole utterance at a time, but also re-recognizes the in-progress audio periodically to show a preview while you're still talking (can be turned off below). The selected model needs to be downloaded the first time you use it.",
    zh: "本地语音识别按发话段落整体识别，但发话过程中也会定期重新识别以显示预览(可在下方设置关闭)。所选模型首次使用需要下载。",
    ko: "로컬 음성 인식은 발화 구간 단위로 한꺼번에 인식하지만, 말하는 중에도 일정 간격으로 재인식하여 미리보기를 표시합니다(아래 설정에서 끌 수 있습니다). 선택한 모델은 처음 사용할 때 다운로드가 필요합니다.",
  },
  sttModelLabel: { ja: "モデル", en: "Model", zh: "模型", ko: "모델" },
  sttModelSenseVoiceInt8Option: {
    ja: "SenseVoice 軽量版(約240MB)",
    en: "SenseVoice, lightweight (about 240MB)",
    zh: "SenseVoice 轻量版(约240MB)",
    ko: "SenseVoice 경량판(약 240MB)",
  },
  sttModelSenseVoiceFp32Option: {
    ja: "SenseVoice 標準版(約940MB)",
    en: "SenseVoice, standard (about 940MB)",
    zh: "SenseVoice 标准版(约940MB)",
    ko: "SenseVoice 표준판(약 940MB)",
  },
  sttModelWhisperTurboOption: {
    ja: "Whisper turbo(約1.0GB)",
    en: "Whisper turbo (about 1.0GB)",
    zh: "Whisper turbo(约1.0GB)",
    ko: "Whisper turbo(약 1.0GB)",
  },
  // NVIDIA Parakeet TDT-CTC 0.6B, Japanese-only — much bigger/slower than
  // SenseVoice, in exchange for better vocabulary coverage on Japanese
  // (see TASK.md #18).
  sttModelParakeetOption: {
    ja: "Parakeet 日本語 高精度(約660MB)",
    en: "Parakeet, Japanese, high accuracy (about 660MB)",
    zh: "Parakeet 日语 高精度(约660MB)",
    ko: "Parakeet 일본어 고정밀(약 660MB)",
  },
  sttEngineDownloadLabel: {
    ja: "モデルのダウンロード",
    en: "Model download",
    zh: "模型下载",
    ko: "모델 다운로드",
  },
  sttEngineDownloadButton: { ja: "ダウンロード", en: "Download", zh: "下载", ko: "다운로드" },
  sttEngineDownloadingButton: {
    ja: "ダウンロード中...",
    en: "Downloading...",
    zh: "下载中...",
    ko: "다운로드 중...",
  },
  sttEngineLoadingButton: {
    ja: "モデルを読み込み中...",
    en: "Loading model...",
    zh: "正在加载模型...",
    ko: "모델 불러오는 중...",
  },
  sttModelDeleteLabel: {
    ja: "ダウンロード済みモデル",
    en: "Downloaded model",
    zh: "已下载的模型",
    ko: "다운로드된 모델",
  },
  sttModelDeleteButton: { ja: "削除", en: "Delete", zh: "删除", ko: "삭제" },
  sttModelDeleteConfirm: {
    ja: "このモデルを削除します。よろしいですか？",
    en: "This will delete this model. Continue?",
    zh: "将删除此模型，确定吗？",
    ko: "이 모델을 삭제합니다. 계속하시겠습니까?",
  },
  sttModelCancelButton: { ja: "キャンセル", en: "Cancel", zh: "取消", ko: "취소" },
  sttInterimPreviewLabel: {
    ja: "発話中のプレビュー表示",
    en: "Preview while speaking",
    zh: "发话中的预览显示",
    ko: "발화 중 미리보기 표시",
  },
  sttInterimPreviewHint: {
    ja: "オフにすると、確定するまで再認識を行わなくなります。Whisperなど処理が重いモデルで負荷を抑えたい場合に。",
    en: "When off, nothing gets re-recognized until the utterance is Final. Useful for keeping the load down with a slower model like Whisper.",
    zh: "关闭后，在确定之前不会重新识别。可用于Whisper等处理较重的模型以降低负载。",
    ko: "끄면 확정될 때까지 재인식을 하지 않습니다. Whisper처럼 처리가 무거운 모델에서 부하를 줄이고 싶을 때 사용하세요.",
  },
  hotkeyActiveDuringKeyboardLabel: {
    ja: "キーボード表示中もホットキーを有効にする",
    en: "Keep hotkeys active while the keyboard is open",
    zh: "键盘显示时也启用热键",
    ko: "키보드가 열려 있어도 단축키 유지",
  },
  hotkeyActiveDuringKeyboardHint: {
    ja: "オンにすると、VRキーボードを開いている間もグリップ/トリガーの長押しによる語尾送信・送信取り消しが有効になります(既定はオフ — キーボード自身の送信ボタン/スティック/ダブルクリックと競合しないように)。",
    en: "When on, holding grip/trigger still sends an ending or cancels even while the VR keyboard is open (off by default, so it doesn't race the keyboard's own Send button/stick/double-click).",
    zh: "开启后，即使VR键盘处于打开状态，长按握把/扳机发送语尾或取消发送依然有效(默认关闭，避免与键盘自身的发送按钮/摇杆/双击冲突)。",
    ko: "켜면 VR 키보드가 열려 있는 동안에도 그립/트리거를 길게 눌러 어미 전송·전송 취소를 할 수 있습니다(기본값은 꺼짐 — 키보드 자체의 전송 버튼/스틱/더블클릭과 겹치지 않도록).",
  },
  vrKeyboardAutoCloseOnSendLabel: {
    ja: "送信でキーボードを自動的に閉じる",
    en: "Close the keyboard automatically on send",
    zh: "发送时自动关闭键盘",
    ko: "전송 시 키보드 자동으로 닫기",
  },
  vrKeyboardAutoCloseOnSendHint: {
    ja: "オフにすると、VRキーボード表示中に送信ボタンや画面下の語尾ボタンを押しても、キーボードが開いたままになります(続けて入力したいときに)。",
    en: "When off, pressing the Send button or one of the ending buttons at the bottom of the VR keyboard sends the text but leaves the keyboard open instead of closing it — useful when you want to keep typing right after.",
    zh: "关闭后，在VR键盘显示时按下发送按钮或下方的语尾按钮会发送文本，但不会关闭键盘(便于继续输入)。",
    ko: "끄면 VR 키보드가 열려 있을 때 전송 버튼이나 아래쪽 어미 버튼을 눌러도 텍스트는 전송되지만 키보드는 닫히지 않고 열린 채로 유지됩니다(계속 입력하고 싶을 때 유용).",
  },
  vrKeyboardPositionModeLabel: {
    ja: "キーボードの位置",
    en: "Keyboard position",
    zh: "键盘位置",
    ko: "키보드 위치",
  },
  vrKeyboardPositionCentered: {
    ja: "視界の中央に追従",
    en: "Follow your view",
    zh: "跟随视野中央",
    ko: "시야 중앙에 따라가기",
  },
  vrKeyboardPositionFixed: {
    ja: "開いた位置に固定",
    en: "Stay where opened",
    zh: "固定在打开时的位置",
    ko: "열었던 위치에 고정",
  },
  vrKeyboardPositionModeHint: {
    ja: "「開いた位置に固定」では、開いたときの正面に表示され、頭を動かしてもその場に留まります。キーボードにポインターを当ててグリップを握るとつかんで動かせます(離した位置に固定)。閉じて開き直すと、また正面に表示されます。",
    en: "With “Stay where opened”, the keyboard appears in front of you when opened and stays put as you move your head. Point at it and squeeze grip to grab and move it (it stays wherever you let go). Reopening it brings it back in front of you.",
    zh: "选择“固定在打开时的位置”时，键盘会显示在打开时的正前方，转头也会留在原处。将指针对准键盘并按住握把即可抓住移动(松开后固定在该位置)。关闭后重新打开，会再次显示在正前方。",
    ko: "'열었던 위치에 고정'을 선택하면 키보드를 열 때 정면에 나타나고, 고개를 돌려도 그 자리에 머뭅니다. 포인터를 키보드에 맞추고 그립을 쥐면 잡아서 옮길 수 있습니다(놓은 위치에 고정). 닫았다가 다시 열면 다시 정면에 나타납니다.",
  },
};

const UI_LANGS = ["ja", "en", "zh", "ko"];
const UI_LANG_KEY = "mutelink.uiLang";

function loadUiLang() {
  const raw = localStorage.getItem(UI_LANG_KEY);
  return UI_LANGS.includes(raw) ? raw : "ja";
}

function saveUiLang(lang) {
  localStorage.setItem(UI_LANG_KEY, lang);
}

// Overwritten from storage by applyUiLang() before anything else runs —
// module-load-time default only matters for code that (incorrectly) called
// t() before that, which would be a bug worth seeing as broken Japanese
// rather than silently falling back.
let uiLang = "ja";

function t(key) {
  return I18N[key]?.[uiLang] ?? I18N[key]?.ja ?? key;
}

// Applies `lang` to every static [data-i18n]/[data-i18n-title]/
// [data-i18n-aria-label] element and re-runs whatever dynamic renderers
// exist at call time (endings list, hotkey dropdowns, character panel, VR
// hotkey-status/google-status text) so already-visible text updates
// immediately instead of only affecting new content going forward.
function applyUiLang(lang) {
  uiLang = UI_LANGS.includes(lang) ? lang : "ja";
  document.documentElement.lang = uiLang;

  for (const el of document.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll("[data-i18n-title]")) el.title = t(el.dataset.i18nTitle);
  for (const el of document.querySelectorAll("[data-i18n-aria-label]")) el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));

  refreshDynamicI18nText();
}

// True once every setup*() call in DOMContentLoaded has run — guards
// refreshDynamicI18nText() against running (and erroring on missing
// state/DOM) during the very first applyUiLang() call, which happens before
// any of that exists yet. That first call still translates static
// [data-i18n] text fine; the dynamic pieces below just render correctly the
// first time on their own once their own setup*() runs, using the uiLang
// applyUiLang() already set — no re-render needed until the user actually
// changes the language later, once appReady is true.
let appReady = false;

function refreshDynamicI18nText() {
  if (!appReady) return;
  // googleStatusKey is null while a one-off raw error message (e.g. a
  // getUserMedia() failure's own .message) is being shown instead of a
  // translatable state — leave it alone rather than blowing it away.
  if (googleStatusEl && googleStatusKey) googleStatusEl.textContent = t(googleStatusKey);
  if (googleBtn) googleBtn.textContent = t(armed ? "stopButton" : "startButton");
  if (sttStateLabelEl) {
    sttStateLabelEl.textContent = sttStateLabel(sttStateValue);
  }
  const hotkeyStatusEl = document.querySelector("#hotkey-status");
  if (hotkeyStatusEl) hotkeyStatusEl.textContent = t(hotkeyStatusKey);
  const holdVal = document.querySelector("#hotkey-hold-duration-val");
  if (holdVal) holdVal.textContent = `${(loadHotkeyHoldMs() / 1000).toFixed(1)}${t("secondsSuffix")}`;
  renderGeneralEndingsList();
  // renderVrKeyboardTemplatesList() isn't here — templates have no
  // translatable text of their own (see setupTemplatesPanel, called once at
  // startup instead), so there's nothing for a language change to refresh.
  renderHotkeyAssignmentOptions();
  setupCharacterPanel();
  renderProfileMenuList(); // its own labels/buttons (キャラクター/コピー/貼り付け) are translated text too
  renderMergedText(); // re-translates the pending-text placeholder when it's showing (see its own comment)
}

const GOOGLE_RETRY_MS = 3000;
// How long a pause has to last before "nothing's being said at all" desktop
// status / webspeech watchdog kicks in — separate from Silero VAD's own
// min_silence_duration (vad.rs) that decides the equivalent for SenseVoice's
// utterance-end-and-transcribe timing.
const SILENCE_TIMEOUT_MS = 5000;
const SILENCE_CHECK_MS = 150;
// Silero VAD's own internal chunking runs at 16kHz regardless of what rate
// the browser's mic capture happens to be — the SpeechSegment samples
// vad_process_chunk hands back (see handleVadResult) are already in that
// domain, so dispatchSenseVoiceSegment needs this instead of
// monitorCtx.sampleRate. Must match vad.rs's VAD_SAMPLE_RATE.
const VAD_SEGMENT_SAMPLE_RATE = 16000;
// How often to re-run SenseVoice against the in-progress utterance buffer
// while the user is still talking, purely to drive the same 入力中 preview
// the Web Speech API gives for free via interimResults — SenseVoice itself
// has no concept of interim results (see startVoiceMonitor's comment), so
// this fakes it by just re-transcribing the growing buffer from scratch on
// an interval. Short enough to feel live, long enough that a full decode
// pass (which grows with buffer length as the utterance goes on) reliably
// finishes before the next one fires (see senseVoiceInterimInFlight below).
const SENSE_VOICE_INTERIM_INTERVAL_MS = 600;

const VOICE_RMS_THRESHOLD_KEY = "mutelink.voiceRmsThreshold";
const DEFAULT_VOICE_RMS_THRESHOLD = 0.1;

function loadVoiceRmsThreshold() {
  // Distinguish "never saved" (missing key, use the default) from a
  // deliberately-saved 0 (allowed since the slider's min is 0 — see
  // index.html — meaning "treat the mic as always voiced"): Number(null)
  // is 0, so a plain `raw > 0` check couldn't tell those apart.
  const stored = localStorage.getItem(VOICE_RMS_THRESHOLD_KEY);
  if (stored === null) return DEFAULT_VOICE_RMS_THRESHOLD;
  const raw = Number(stored);
  return Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_VOICE_RMS_THRESHOLD;
}

function saveVoiceRmsThreshold(value) {
  localStorage.setItem(VOICE_RMS_THRESHOLD_KEY, String(value));
}

// Set by setupMicSensitivitySettings() (from storage on load, then live as
// the slider moves) and read by startVoiceMonitor()'s onaudioprocess — a
// plain module-level variable rather than re-reading localStorage on every
// audio callback (onaudioprocess fires many times a second).
let voiceRmsThresholdCache = DEFAULT_VOICE_RMS_THRESHOLD;
// If this long passes with zero detected voice, proactively cycle the
// recognition session (see refreshRecognitionSession()) rather than trust
// the backend to notify us its own idle session went stale.
const RECOGNITION_WATCHDOG_MS = 60000;

let recognition;
let sttEngine = "webspeech"; // "webspeech" | "sensevoice" — overwritten from storage on load, see loadSttEngine()
let sttModel = "sense-voice-fp32"; // which local model backs "sensevoice" above — overwritten from storage on load, see loadSttModel()
// Whether runSenseVoiceInterim() runs at all — unlike sttEngine/sttModel
// above, this is also updated live from the settings checkbox itself (see
// setupSttEngineSettings()), not just re-read on the next startGoogleStt(),
// since toggling it doesn't need a mic re-arm to take effect.
let sttInterimPreviewEnabled = true; // overwritten from storage on load, see loadSttInterimPreviewEnabled()
let armed = false; // Start/Stop button state; survives pause/resume cycles
let recognizing = false; // true while a recognition session is supposed to be running
let googleHadError = false;
let googleRetryTimer;
let googleRetryFailures = 0; // consecutive failed restarts of the *current* recognition object; reset on a successful onstart
const GOOGLE_RETRY_RECREATE_AFTER = 3; // after this many, rebuild the SpeechRecognition object instead of retrying a possibly-wedged one forever
// After this many, stop flashing statusDisconnectedRetrying/statusReconnecting
// (which onend's immediate setTimeout(0) restart can cycle through fast
// enough — no delay at all until this kicks in — to look almost stuck on
// statusListening instead, e.g. a confirmed WebView2 Runtime regression
// where every restart attempt fails with a "network" error near-instantly)
// and switch to a status that's actually legible: a fixed message saying
// the connection itself is failing, paced by scheduleGoogleRetry() instead
// of retried instantly forever.
const GOOGLE_STUCK_THRESHOLD = 5;
let googleBtn;
let googleStatusEl;
let googleStatusKey = "statusIdle"; // tracks the *key*, not just the rendered text, so refreshDynamicI18nText() can re-translate whatever's currently shown
function setGoogleStatus(key) {
  googleStatusKey = key;
  googleStatusEl.textContent = t(key);
}
let hotkeyStatusKey = "vrStatusDisconnected"; // same idea as googleStatusKey, for #hotkey-status
let statusDotEl;
let sttStateLabelEl;
let chatboxEnabled = true; // overwritten from storage on load — see loadChatboxEnabled()
let ttsEnabled = true; // overwritten from storage on load — see loadTtsEnabled()
let sendMode = "manual"; // "auto" | "manual", mirrors the old <select id="send-mode">; overwritten from storage on load — see loadSendMode()
let finalTextPartEl;
let interimTextPartEl;
let pendingTextEditorEl;
let pendingTextFinalPartEl;
let pendingTextInterimPartEl;
let pendingFinalText = "";
let currentInterimText = ""; // live, not-yet-Final recognition result; read by both the desktop merged block and the VR overlay render loop
let logEl;

// The STT language is a radio group (image.png), not a <select> — its 4th
// option, "off", isn't a real BCP-47 code; it's only ever read here while
// something is actually armed (see setSttState), so callers that need an
// actual language (creating a SpeechRecognition, looking up TTS-per-language
// settings) never see it.
function getSttLang() {
  return document.querySelector('input[name="stt-lang"]:checked').value;
}

// Keeps the merged 入力中/Final desktop display in sync with
// pendingFinalText/currentInterimText — call after either changes instead of
// poking the DOM directly, so there's one source of truth (the VR overlay
// render loop reads the same two variables independently).
function renderMergedText() {
  finalTextPartEl.textContent = pendingFinalText;
  interimTextPartEl.textContent = pendingFinalText && currentInterimText ? ` ${currentInterimText}` : currentInterimText;

  // #pending-text-overlay's copy — same merge, but as two separately-styled
  // spans (see #pending-text-interim-part's opacity in styles.css) so the
  // not-yet-final tail visibly reads as "still being recognized" instead of
  // looking identical to already-confirmed text. When there's nothing at
  // all, show the hint text here instead of relying on the textarea's own
  // native placeholder — that placeholder renders in its own UA color
  // regardless of the textarea's `color: transparent`, so it would sit
  // underneath (and visibly clash with) whatever this overlay draws on top
  // of it the moment interim text starts coming in.
  if (pendingFinalText || currentInterimText) {
    pendingTextFinalPartEl.classList.remove("pending-text-placeholder");
    pendingTextFinalPartEl.textContent = pendingFinalText;
    pendingTextInterimPartEl.textContent = pendingFinalText && currentInterimText ? ` ${currentInterimText}` : currentInterimText;
  } else {
    pendingTextFinalPartEl.classList.add("pending-text-placeholder");
    pendingTextFinalPartEl.textContent = t("pendingTextEditorPlaceholder");
    pendingTextInterimPartEl.textContent = "";
  }

  // The real textarea underneath only ever holds pendingFinalText — the
  // interim tail is preview-only (see the overlay above), not something you
  // can select/edit directly, since it can be replaced wholesale the moment
  // more speech comes in. Guarded so the editor's own "input" listener
  // (which already updated pendingFinalText and calls this right back)
  // doesn't reset the cursor to the end on every keystroke.
  if (pendingTextEditorEl.value !== pendingFinalText) pendingTextEditorEl.value = pendingFinalText;
}

async function sendChatbox(text) {
  try {
    await window.__TAURI__.core.invoke("send_chatbox", { text });
    log(`[chatbox] sent: ${text}`);
  } catch (err) {
    log(`[chatbox] error: ${err}`);
  }
}

const CHATBOX_ENABLED_KEY = "mutelink.chatboxEnabled";
const TTS_ENABLED_KEY = "mutelink.ttsEnabled";

// Both default on (unlike most localStorage-backed settings here, where a
// missing key means "first run, use the default") — absence specifically
// means "never saved yet", so it's distinguished from an explicit "false"
// rather than just falling back to a fixed default via `?? true`.
function loadChatboxEnabled() {
  const raw = localStorage.getItem(CHATBOX_ENABLED_KEY);
  return raw === null ? true : raw === "true";
}

function saveChatboxEnabled(value) {
  localStorage.setItem(CHATBOX_ENABLED_KEY, String(value));
}

function loadTtsEnabled() {
  const raw = localStorage.getItem(TTS_ENABLED_KEY);
  return raw === null ? true : raw === "true";
}

function saveTtsEnabled(value) {
  localStorage.setItem(TTS_ENABLED_KEY, String(value));
}

const SEND_MODE_KEY = "mutelink.sendMode";

// Defaults to "manual" (Auto off) — unlike Chatbox/TTS above, "auto" isn't
// treated as a distinct "never saved yet" case since there's no reason to
// ever want a different default than plain "manual".
function loadSendMode() {
  return localStorage.getItem(SEND_MODE_KEY) === "auto" ? "auto" : "manual";
}

function saveSendMode(mode) {
  localStorage.setItem(SEND_MODE_KEY, mode);
}

// Single entry points for Auto/Chatbox/TTS, same reasoning as
// setActiveProfileIndex further down — the desktop toggle buttons and the VR
// keyboard's own copies of these (see computeVrKeyboardLayout's cursor-block
// rows) both need to flip the same state and stay visually in sync,
// regardless of which one was actually pressed.
function setSendMode(mode) {
  sendMode = mode;
  saveSendMode(mode);
  const btn = document.querySelector("#mode-toggle-btn");
  if (btn) {
    btn.classList.toggle("active", mode === "auto");
    btn.setAttribute("aria-pressed", String(mode === "auto"));
  }
}

function setChatboxEnabled(value) {
  chatboxEnabled = value;
  saveChatboxEnabled(value);
  const btn = document.querySelector("#chatbox-toggle-btn");
  if (btn) {
    btn.classList.toggle("active", value);
    btn.setAttribute("aria-pressed", String(value));
  }
}

function setTtsEnabled(value) {
  ttsEnabled = value;
  saveTtsEnabled(value);
  const btn = document.querySelector("#tts-toggle-btn");
  if (btn) {
    btn.classList.toggle("active", value);
    btn.setAttribute("aria-pressed", String(value));
  }
}

const UI_MODE_KEY = "mutelink.uiMode";

// Defaults to "vr" — existing users keep the exact screen they already had
// (see #desktop-controls-row's default `display: none`) until they
// deliberately opt into Desktop mode via the button.
function loadUiMode() {
  return localStorage.getItem(UI_MODE_KEY) === "desktop" ? "desktop" : "vr";
}

function saveUiMode(mode) {
  localStorage.setItem(UI_MODE_KEY, mode);
}

const STT_ENGINE_KEY = "mutelink.sttEngine";

// "webspeech" (the browser/WebView2 built-in, see createRecognition()) or
// "sensevoice" (local, see the SenseVoice buffering in startVoiceMonitor()
// and sense_voice.rs). Defaults to "webspeech" since it needs nothing extra
// downloaded — existing users keep working exactly as before until they
// deliberately switch in Settings.
function loadSttEngine() {
  return localStorage.getItem(STT_ENGINE_KEY) === "sensevoice" ? "sensevoice" : "webspeech";
}

function saveSttEngine(engine) {
  localStorage.setItem(STT_ENGINE_KEY, engine);
}

const STT_MODEL_KEY = "mutelink.sttModel";
const STT_MODEL_IDS = ["sense-voice-int8", "sense-voice-fp32", "whisper-turbo", "parakeet-ja"];
const DEFAULT_STT_MODEL = "sense-voice-fp32";

// Local models with no per-utterance `language` concept in sherpa-onnx at
// all (see cache_key_language() in sense_voice.rs) always transcribe their
// one fixed language regardless of what's selected in this app's STT
// language UI — listed here (as an override; anything absent supports the
// full STT_CYCLE_LANGS_ALL set) so the language-cycle settings/hotkey can
// skip languages that would be a no-op for whichever model is actually
// loaded. See supportedSttLangs() below.
const STT_MODEL_SUPPORTED_LANGS = {
  "parakeet-ja": ["ja-JP"],
};

// `engine`/`modelId` are passed in rather than read from the live
// sttEngine/sttModel globals so this can answer for either "what's actually
// armed right now" (see currentSttSupportedLangs()) or "whatever's
// currently selected in the Settings dropdowns, before it's armed" (see
// setupSttEngineSettings()) with the same logic.
function supportedSttLangs(engine, modelId) {
  if (engine !== "sensevoice") return STT_CYCLE_LANGS_ALL;
  return STT_MODEL_SUPPORTED_LANGS[modelId] ?? STT_CYCLE_LANGS_ALL;
}

function currentSttSupportedLangs() {
  return supportedSttLangs(sttEngine, sttModel);
}

const STT_INTERIM_PREVIEW_KEY = "mutelink.sttInterimPreviewEnabled";

// Defaults on — see loadChatboxEnabled()'s own comment for why a missing
// key means "on" here instead of falling back through `?? true`.
function loadSttInterimPreviewEnabled() {
  const raw = localStorage.getItem(STT_INTERIM_PREVIEW_KEY);
  return raw === null ? true : raw === "true";
}

function saveSttInterimPreviewEnabled(value) {
  localStorage.setItem(STT_INTERIM_PREVIEW_KEY, String(value));
}

// Which local model backs the "sensevoice" engine above — see MODELS in
// sense_voice.rs for what each id actually downloads/loads. Defaults to the
// full-precision SenseVoice model: noticeably more accurate than the int8
// one (especially on Japanese) for only ~4x the download size, without
// Whisper's slower autoregressive decode.
function loadSttModel() {
  const saved = localStorage.getItem(STT_MODEL_KEY);
  return STT_MODEL_IDS.includes(saved) ? saved : DEFAULT_STT_MODEL;
}

function saveSttModel(modelId) {
  localStorage.setItem(STT_MODEL_KEY, modelId);
}

// The one place that actually delivers a confirmed piece of text — called
// either immediately (Auto mode / picking an ending) or from the manual send
// button (手動 mode, no ending). `outputText` is what goes to the chatbox;
// `spokenText` is what VOICEVOX actually reads (the plain Final sentence,
// even when an ending was attached to the output). `params` carries a
// specific ending's VOICEVOX scales; omitted when there's no ending.
function dispatchText(outputText, spokenText, params) {
  if (chatboxEnabled) sendChatbox(outputText);
  if (!ttsEnabled) return;
  // Everything gets sent to VOICEVOX regardless of recognition language —
  // English/中文 come out fairly broken since OpenJTalk (VOICEVOX's text
  // analyzer) isn't built for those scripts, but that's accepted. There used
  // to be a per-language gate here too (settings > Other's checkboxes, via
  // loadTtsLangEnabled) — read-aloud is ttsEnabled-only for now, so that
  // settings UI still exists and still saves, it's just not consulted in
  // this decision at the moment; revisit if/when the per-language behavior
  // comes back.
  //
  // Spaces (half- or full-width) in the recognized text read as an
  // unnatural pause/silence through VOICEVOX, so close them up before
  // speaking — outputText (chatbox) keeps them untouched.
  speak(spokenText.replace(/\s+/g, ""), params);
}

// SpeechRecognition owns mic capture internally and doesn't expose audio
// levels, so voice activity is measured by a second, independent mic stream
// that only ever computes RMS locally — nothing from it is sent anywhere.
// It's purely a "listening" vs "waiting for voice" status indicator now —
// it used to also stop()/start() the recognizer across silence, but
// SpeechRecognition.start() has real startup latency, and calling it
// reactively *after* RMS had already detected speech meant the first
// syllable was spoken into that startup gap and never got recognized. The
// recognizer instead just stays running continuously for as long as the
// Stop button hasn't been pressed (see startGoogleStt/stopGoogleStt);
// `continuous: true` (see createRecognition) is what lets it sit idle
// across silence without needing to be restarted.
let monitorStream;
let monitorCtx;
let monitorSource;
let monitorProcessor;
let lastVoiceAt = 0;
let silenceCheckTimer;
let lastRecognitionRefreshAt = 0;

function log(line) {
  const p = document.createElement("p");
  p.textContent = line;
  logEl.prepend(p);
}

function rms(float32) {
  let sum = 0;
  for (let i = 0; i < float32.length; i++) sum += float32[i] * float32[i];
  return Math.sqrt(sum / float32.length);
}

async function startVoiceMonitor() {
  // No per-device constraint here on purpose: which mic this (and
  // SpeechRecognition itself) actually captures from is controlled by
  // Windows' default recording device, which the Device settings panel's
  // mic list sets directly via set_default_input_device() — see
  // setupDevicePanel(). A getUserMedia deviceId constraint can't do
  // anything SpeechRecognition would also respect, so there's no reason to
  // add one just for this monitor stream.
  monitorStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  monitorCtx = new AudioContext();
  monitorSource = monitorCtx.createMediaStreamSource(monitorStream);
  monitorProcessor = monitorCtx.createScriptProcessor(4096, 1, 1);

  monitorProcessor.onaudioprocess = (event) => {
    const chunk = event.inputBuffer.getChannelData(0);
    const voiced = rms(chunk) >= voiceRmsThresholdCache;

    // Utterance segmentation for local STT is handled by Silero VAD on the
    // Rust side now (see vad.rs) — this just forwards the raw chunk there
    // and reacts to what comes back (see enqueueVadChunk/handleVadResult).
    // Used to be a plain RMS-threshold buffer/preroll scheme entirely in
    // JS; a trained VAD tells actual speech apart from breath/airflow noise
    // far better than an amplitude threshold does (see TASK.md #20).
    if (sttEngine === "sensevoice" && recognizing) {
      const chunkCopy = chunk.slice(); // copy — the browser reuses this buffer next callback
      // Only while NOT mid-utterance (per the last VAD result we heard back
      // — see senseVoiceInterimPrerollBuffer's own comment), so the ring
      // naturally never holds the chunk that ends up tipping detection over
      // — no need to separately exclude it when it's spliced in later.
      if (!vadInSpeech) {
        senseVoiceInterimPrerollBuffer.push(chunkCopy);
        if (senseVoiceInterimPrerollBuffer.length > SENSE_VOICE_INTERIM_PREROLL_CHUNKS) senseVoiceInterimPrerollBuffer.shift();
      }
      enqueueVadChunk(chunkCopy, monitorCtx.sampleRate);
    }

    if (!voiced) return;
    lastVoiceAt = Date.now();
    if (recognizing) setGoogleStatus("statusListening");
  };

  monitorSource.connect(monitorProcessor);
  monitorProcessor.connect(monitorCtx.destination);

  lastVoiceAt = Date.now();
  lastRecognitionRefreshAt = Date.now();
  silenceCheckTimer = setInterval(() => {
    if (!recognizing) return;
    const silentFor = Date.now() - lastVoiceAt;
    if (sttEngine === "sensevoice") {
      // Flushing to Final on silence used to be a plain wall-clock timer
      // here — now Silero VAD (min_silence_duration, see vad.rs) decides
      // that on the Rust side and hands back a completed segment via
      // handleVadResult() instead, so all that's left for this timer is
      // the interim-preview trigger.
      if (
        vadInSpeech &&
        sttInterimPreviewEnabled &&
        !senseVoiceInterimInFlight &&
        Date.now() - senseVoiceLastInterimAt >= SENSE_VOICE_INTERIM_INTERVAL_MS
      ) {
        runSenseVoiceInterim();
      }
    } else if (silentFor >= SILENCE_TIMEOUT_MS) {
      setGoogleStatus("statusWaitingForVoice");
    }
    if (sttEngine !== "webspeech") return;
    // The backend's own idle session can go stale without ever telling us —
    // recognition.onend doesn't reliably fire for a cloud-side timeout the
    // way it does for a local stop()/error, so waiting on it alone means an
    // extended silence can leave the connection dead with no signal that
    // anything's wrong until the user starts talking again and nothing
    // happens. Proactively cycling the session periodically during long
    // silences avoids depending on that notification at all. SenseVoice has
    // no persistent backend session to go stale, so this doesn't apply to it.
    if (Date.now() - lastRecognitionRefreshAt >= RECOGNITION_WATCHDOG_MS) refreshRecognitionSession();
  }, SILENCE_CHECK_MS);
}

// Whether Rust's Silero VAD currently considers us mid-utterance — mirrors
// vad_process_chunk's own detected() state (see vad.rs), kept here purely
// so runSenseVoiceInterim's trigger and the interim-preview buffer below
// know when an utterance is in progress without an extra round-trip.
let vadInSpeech = false;
// Raw chunks (at monitorCtx.sampleRate, NOT the 16kHz Silero resamples to
// internally) accumulated while vadInSpeech is true, for
// runSenseVoiceInterim() only — the actual Final segment boundary comes
// from Rust (see handleVadResult), this is just a live snapshot to
// re-transcribe for the 入力中 preview.
let senseVoiceInterimBuffer = [];
// A short rolling lookback of recent raw chunks, kept regardless of
// vadInSpeech (updated only while it's false — see onaudioprocess) and
// spliced onto the front of senseVoiceInterimBuffer the instant vadInSpeech
// flips true (see handleVadResult) — same idea (and same size) as the
// pre-VAD RMS approach's own senseVoicePrerollBuffer. This exists purely so
// the 入力中 preview doesn't visibly start clipped: Final's own onset
// margin comes from vad.rs's own pre-roll (anchored to the Rust-side VAD's
// segment start, see extra_pre_roll_for), which isn't available until an
// utterance *ends* and its segment is popped — too late for a preview
// that's by definition shown mid-utterance. Nothing here affects what's
// actually sent to VOICEVOX/OSC; that's still vad.rs's own segment.
const SENSE_VOICE_INTERIM_PREROLL_CHUNKS = 3;
let senseVoiceInterimPrerollBuffer = [];
// Bumped every time a new utterance starts (see handleVadResult) so a
// runSenseVoiceInterim() call that was in flight when the utterance ended
// (flushed to Final, or superseded by the next utterance already starting)
// can tell its result is stale and drop it instead of clobbering
// currentInterimText after the fact.
let senseVoiceUtteranceId = 0;
let senseVoiceInterimInFlight = false;
let senseVoiceLastInterimAt = 0;

// vad_process_chunk() feeds a single stateful Silero VAD instance on the
// Rust side (see vad.rs) — chunks MUST reach it in the same order
// onaudioprocess produced them, or the segmentation it's tracking
// internally gets scrambled. A plain per-chunk invoke() with no queue would
// let round-trips race/reorder if one call ever took longer than the next
// chunk's arrival; this pump drains a FIFO one invoke() at a time instead.
let vadChunkQueue = [];
let vadPumping = false;

function enqueueVadChunk(chunk, sampleRate) {
  vadChunkQueue.push({ chunk, sampleRate });
  pumpVadQueue();
}

async function pumpVadQueue() {
  if (vadPumping) return;
  vadPumping = true;
  try {
    while (vadChunkQueue.length > 0) {
      const { chunk, sampleRate } = vadChunkQueue.shift();
      // Stopped or switched engines while this was queued — stale, drop it
      // rather than feeding a now-irrelevant chunk into a VAD state nothing
      // will read the result of.
      if (sttEngine !== "sensevoice" || !recognizing) continue;
      try {
        const result = await window.__TAURI__.core.invoke("vad_process_chunk", {
          samples: Array.from(chunk),
          sampleRate,
        });
        handleVadResult(result, chunk);
      } catch (err) {
        log(`[vad:error] ${err}`);
      }
    }
  } finally {
    vadPumping = false;
  }
}

// `chunk` is the same raw (monitorCtx.sampleRate) samples that were just
// sent to vad_process_chunk — kept here only to feed
// senseVoiceInterimBuffer; the segments in `result` are already resampled
// to 16kHz on the Rust side (see vad.rs's resample_to_16k), which is why
// dispatchSenseVoiceSegment below hardcodes VAD_SEGMENT_SAMPLE_RATE instead
// of reusing monitorCtx.sampleRate the way the interim path does.
function handleVadResult(result, chunk) {
  if (result.inSpeech) {
    if (!vadInSpeech) {
      senseVoiceUtteranceId++;
      // Seed with the preroll ring instead of starting empty — see
      // senseVoiceInterimPrerollBuffer's own comment. Copied (not aliased):
      // onaudioprocess reassigns the ring wholesale on shift/overflow, never
      // mutates an array in place, but a fresh copy keeps that invariant
      // obviously true here too rather than relying on it.
      senseVoiceInterimBuffer = [...senseVoiceInterimPrerollBuffer];
      senseVoiceLastInterimAt = Date.now();
    }
    senseVoiceInterimBuffer.push(chunk);
  } else if (vadInSpeech) {
    senseVoiceInterimBuffer = [];
    // Stale the instant the utterance it was trailing just ended — left in
    // place, a new utterance starting again quickly would get audio from
    // the *previous* one prepended instead of a fresh, actually-adjacent
    // preroll (same reasoning the old flushSenseVoiceUtterance() had for
    // its own equivalent reset).
    senseVoiceInterimPrerollBuffer = [];
  }
  vadInSpeech = result.inSpeech;

  for (const segment of result.segments) {
    dispatchSenseVoiceSegment(segment);
  }
}

// Matches Hiragana/Katakana, CJK ideographs, Hangul, and full-width forms —
// the ranges where a space between two such characters is never meaningful
// (unlike between Latin words, which this deliberately leaves alone).
const CJK_CHAR = "\\u3040-\\u30ff\\u3400-\\u9fff\\uac00-\\ud7a3\\uff00-\\uffef";
const CJK_SPACE_RE = new RegExp(`(?<=[${CJK_CHAR}])\\s+(?=[${CJK_CHAR}])`, "g");
// Local STT models (Whisper especially) sometimes insert stray punctuation
// or a space between every CJK character — neither shows up with the Web
// Speech API's own recognizer. Left as-is: 。/. (real sentence terminators,
// which the app's own ending/語尾 logic expects to see at most one of).
const STT_STRIP_PUNCTUATION_RE = /[？?！!]/g;

// See the two regexes above — only applied to local-model output (see
// dispatchSenseVoiceSegment below), not the Web Speech API path, since that
// one doesn't exhibit either artifact.
function cleanSttText(text) {
  return text.replace(CJK_SPACE_RE, "").replace(STT_STRIP_PUNCTUATION_RE, "").trim();
}

function concatSenseVoiceChunks(chunks) {
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const samples = new Float32Array(totalLength);
  let offset = 0;
  for (const c of chunks) {
    samples.set(c, offset);
    offset += c.length;
  }
  return samples;
}

// SenseVoice (and the other local models) only ever see one already-complete
// utterance at a time — there's no native interim/partial result the way
// SpeechRecognition has (see startVoiceMonitor's comment) — so this fakes
// one by re-transcribing a snapshot of the in-progress buffer on an
// interval and shoving the result into the same currentInterimText the Web
// Speech API path drives. Called from the same silenceCheckTimer loop that
// used to also flush to Final here — that job moved to Rust (see
// handleVadResult/dispatchSenseVoiceSegment) — never concurrently with
// itself (see senseVoiceInterimInFlight), but freely concurrently WITH a
// dispatch — both go through stt_transcribe's own Mutex-guarded recognizer,
// so they just serialize on the Rust side rather than racing.
async function runSenseVoiceInterim() {
  const utteranceId = senseVoiceUtteranceId;
  const samples = concatSenseVoiceChunks(senseVoiceInterimBuffer);
  if (samples.length === 0) return;

  senseVoiceInterimInFlight = true;
  senseVoiceLastInterimAt = Date.now();
  try {
    const text = cleanSttText(
      await window.__TAURI__.core.invoke("stt_transcribe", {
        samples: Array.from(samples),
        sampleRate: monitorCtx.sampleRate,
        modelId: sttModel,
        language: senseVoiceLangCode(),
      }),
    );
    // The utterance this was transcribing may have already been dispatched
    // to Final (or superseded by a new one starting) while the decode was
    // in flight — applying a stale partial on top of that would flicker
    // the just-confirmed Final text back into "still recognizing".
    if (utteranceId !== senseVoiceUtteranceId || !vadInSpeech) return;
    currentInterimText = text;
    renderMergedText();
    log(`[sensevoice:partial] text=${text}`);
  } catch (err) {
    log(`[sensevoice:error] ${err}`);
  } finally {
    senseVoiceInterimInFlight = false;
  }
}

// `segment` is one already-VAD-segmented utterance's samples, already
// resampled to 16kHz by vad.rs (see handleVadResult) — sent to
// stt_transcribe as-is, no local buffering/concatenation needed since Rust
// owns the whole segment now.
async function dispatchSenseVoiceSegment(segment) {
  if (segment.length === 0) return;

  setGoogleStatus("statusTranscribing");
  try {
    const text = cleanSttText(
      await window.__TAURI__.core.invoke("stt_transcribe", {
        samples: segment,
        sampleRate: VAD_SEGMENT_SAMPLE_RATE,
        modelId: sttModel,
        language: senseVoiceLangCode(),
      }),
    );
    setGoogleStatus("statusListening");
    if (!text) return;
    log(`[sensevoice:final] text=${text}`);
    handleFinalRecognizedText(text);
  } catch (err) {
    setGoogleStatus("statusIdle");
    log(`[sensevoice:error] ${err}`);
  }
}

// Forces a clean session instead of waiting to see whether the old one is
// actually still alive — see the watchdog comment in startVoiceMonitor().
function refreshRecognitionSession() {
  lastRecognitionRefreshAt = Date.now();
  log("[google] proactively refreshing recognition session after a long silence");
  recognizing = false; // so the old object's onend, if it fires late, is a no-op (see its own guard)
  try {
    recognition.stop();
  } catch {
    // Already dead/stopped — fine, we're replacing it either way.
  }
  recognition = createRecognition();
  resumeRecognition();
}

async function stopVoiceMonitor() {
  clearInterval(silenceCheckTimer);
  if (monitorProcessor) monitorProcessor.disconnect();
  if (monitorSource) monitorSource.disconnect();
  if (monitorStream) monitorStream.getTracks().forEach((t) => t.stop());
  if (monitorCtx) await monitorCtx.close();
  monitorStream = monitorCtx = monitorSource = monitorProcessor = undefined;
}

// Shared by both STT engines' "one utterance is now fully recognized" path —
// SpeechRecognition's onresult (isFinal) and the SenseVoice buffer-flush in
// startVoiceMonitor() both funnel into this, so sendMode/pendingFinalText/
// hotkey-hold handling only lives in one place regardless of which engine
// produced the text.
function handleFinalRecognizedText(text) {
  currentInterimText = "";

  if (sendMode === "manual") {
    // A new Final can arrive before the pending one is sent — append rather
    // than overwrite so nothing said in the meantime is lost.
    pendingFinalText = pendingFinalText ? `${pendingFinalText} ${text}` : text;
    // The content just changed, so restart any in-progress hold instead of
    // letting it fire against stale timing.
    resetHotkeyHold();
    // Move the (VR keyboard) cursor to the end of what was just recognized —
    // if it had been left mid-string from earlier editing, newly spoken text
    // still lands after it in pendingFinalText, so leaving the cursor behind
    // would visually separate "where the cursor is" from "what was just
    // said." Harmless to set even while the keyboard is closed: it's read
    // fresh from pendingFinalText.length whenever the keyboard next opens.
    vrKeyboardCursorPos = pendingFinalText.length;
    markVrKeyboardCursorActivity();
    // Dictated text never goes through the VR keyboard's own henkan flow —
    // there's nothing to convert or confirm about it — so it should never
    // show up blue/pending (see vrKeyboardConfirmedLength's own comment).
    vrKeyboardConfirmedLength = pendingFinalText.length;
  } else {
    dispatchText(text, text);
  }
  renderMergedText();
}

// Tauri's webview is WebView2 (Edge/Chromium engine), so this actually talks
// to Microsoft's speech backend, not Google's, even though the API shape
// (webkitSpeechRecognition) is the one Chrome popularized.
function createRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const r = new SpeechRecognition();
  r.lang = getSttLangForWebSpeech();
  r.continuous = true;
  r.interimResults = true;

  r.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    const text = result[0].transcript;

    if (!result.isFinal) {
      currentInterimText = text;
      renderMergedText();
      log(`[google:partial] text=${text}`);
      return;
    }

    log(`[google:final] text=${text}`);
    handleFinalRecognizedText(text);
  };
  r.onstart = () => {
    googleHadError = false;
    googleRetryFailures = 0;
    setGoogleStatus("statusListening");
  };
  r.onerror = (event) => {
    googleHadError = true;
    log(`[google:error] ${event.error}${event.message ? ` (${event.message})` : ""}`);
  };
  r.onend = () => {
    // Recognition is meant to run continuously for as long as the app is
    // armed (see startVoiceMonitor's comment) — reaching onend at all means
    // either the browser ended the session on its own (backend-side
    // timeout, error, device change, ...) or stopGoogleStt() called
    // stop() explicitly and already cleared `recognizing` before doing so,
    // making this an intentional no-op.
    if (!armed || !recognizing) return;
    // Every onend this app didn't ask for (stop() clears recognizing/armed
    // first, so those return above) counts as a failed connection attempt —
    // onstart is the only place this resets, so a session that never
    // manages to actually start counts up here even though instance.start()
    // itself keeps succeeding (no exception, see restartRecognition below),
    // which was the gap that let GOOGLE_RETRY_RECREATE_AFTER's counter stay
    // at 0 forever for a backend that starts fine and then immediately
    // errors out every single time (see GOOGLE_STUCK_THRESHOLD's comment).
    googleRetryFailures++;
    if (googleRetryFailures >= GOOGLE_STUCK_THRESHOLD) {
      setGoogleStatus("statusWebSpeechUnavailable");
      scheduleGoogleRetry();
      return;
    }
    setGoogleStatus(googleHadError ? "statusDisconnectedRetrying" : "statusReconnecting");
    // Restarting synchronously here is prone to InvalidStateError — the
    // browser doesn't always finish tearing down the previous session by
    // the time onend fires. Deferring one tick avoids that in most cases.
    setTimeout(() => restartRecognition(r), 0);
  };

  return r;
}

// `instance` is whichever recognition object's onend just fired — if a
// retry already rebuilt `recognition` in the meantime (see
// scheduleGoogleRetry), this stale closure should no-op rather than fight
// with the new object.
function restartRecognition(instance) {
  if (!armed || !recognizing || instance !== recognition) return;
  try {
    instance.start();
  } catch {
    // onend already counted this attempt (see its own comment) — don't
    // double-count it here, just fall back to the paced retry loop.
    scheduleGoogleRetry();
  }
}

function resumeRecognition() {
  if (recognizing) return;
  recognizing = true;
  googleHadError = false;
  setGoogleStatus("statusConnecting");
  try {
    recognition.start();
  } catch {
    // The previous session's stop() may not have finished tearing down yet.
    recognizing = false;
    setTimeout(() => {
      if (armed && !recognizing) resumeRecognition();
    }, 250);
  }
}

// Callers are expected to have already counted the failure that led here
// (onend increments unconditionally; restartRecognition's catch defers to
// onend's count instead of adding its own) — the one exception is this
// function's own catch below, for a synchronous start() throw that (unlike
// the other paths) never reaches onend at all.
function scheduleGoogleRetry() {
  clearTimeout(googleRetryTimer);
  googleRetryTimer = setTimeout(() => {
    if (!armed || !recognizing) return;
    if (googleRetryFailures >= GOOGLE_RETRY_RECREATE_AFTER) {
      // This object hasn't been able to restart itself several times in a
      // row — rather than retry a possibly permanently-wedged instance
      // forever, build a fresh one (same pattern as the initial connect).
      log(`[google] recreating recognition after ${googleRetryFailures} failed restarts`);
      recognition = createRecognition();
    }
    try {
      recognition.start();
    } catch {
      // Unlike the paths in onend/restartRecognition, nothing else has
      // counted this particular attempt yet (a synchronous throw here means
      // no session was created, so onend never fires for it).
      googleRetryFailures++;
      scheduleGoogleRetry();
    }
  }, GOOGLE_RETRY_MS);
}

async function startGoogleStt() {
  sttEngine = loadSttEngine();
  sttModel = loadSttModel();
  sttInterimPreviewEnabled = loadSttInterimPreviewEnabled();

  if (sttEngine === "webspeech" && !(window.SpeechRecognition || window.webkitSpeechRecognition)) {
    setGoogleStatus("statusSpeechNotSupported");
    return;
  }
  if (sttEngine === "sensevoice" && !(await window.__TAURI__.core.invoke("stt_model_downloaded", { modelId: sttModel }))) {
    setGoogleStatus("statusSenseVoiceNotDownloaded");
    return;
  }

  try {
    await startVoiceMonitor();
  } catch (err) {
    googleStatusKey = null; // one-off message, not a translatable state to restore later
    googleStatusEl.textContent = `${t("statusErrorPrefix")}${err.message}`;
    return;
  }

  armed = true;
  googleBtn.textContent = t("stopButton");
  googleBtn.classList.add("listening");
  statusDotEl.classList.add("active");

  if (sttEngine === "sensevoice") {
    // No SpeechRecognition object/session to connect — the mic monitor
    // startVoiceMonitor() just started is all SenseVoice needs; it's ready
    // the moment voice is actually detected (see onaudioprocess). This does
    // still need to (re)load the model when the pinned language changed —
    // every stt-lang switch tears down and restarts via this same function
    // (see setSttState) — so that's proactively done here rather than left
    // to stt_transcribe's own lazy-load fallback, which would
    // otherwise stall the first utterance after a language switch instead.
    setGoogleStatus("statusSenseVoiceLoading");
    try {
      await window.__TAURI__.core.invoke("load_stt_model", { modelId: sttModel, language: senseVoiceLangCode() });
    } catch (err) {
      log(`[sensevoice:error] failed to load model: ${err}`);
    }
    recognizing = true;
    setGoogleStatus("statusListening");
  } else {
    recognition = createRecognition();
    resumeRecognition();
  }
}

function stopGoogleStt() {
  armed = false;
  recognizing = false;
  googleHadError = false;
  clearTimeout(googleRetryTimer);
  if (sttEngine === "webspeech" && recognition) recognition.stop();
  vadInSpeech = false;
  senseVoiceInterimBuffer = [];
  senseVoiceInterimPrerollBuffer = [];
  vadChunkQueue = [];
  // Fire-and-forget: clears Rust's VAD internal state (a half-open speech
  // segment, buffered silence) so the next session starts clean instead of
  // inheriting whatever was happening right before this stop (see
  // vad_reset's own comment in vad.rs).
  window.__TAURI__.core.invoke("vad_reset").catch((err) => log(`[vad:error] failed to reset: ${err}`));
  stopVoiceMonitor();
  setGoogleStatus("statusIdle");
  googleBtn.textContent = t("startButton");
  googleBtn.classList.remove("listening");
  statusDotEl.classList.remove("active");
}

let voicevoxInput;
let voicevoxBtn;
let voicevoxStatusEl;
let voicevoxOutputsSelect;

const DEVICE_SETTINGS_KEY = "mutelink.deviceSettings";

function loadDeviceSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(DEVICE_SETTINGS_KEY) ?? "null");
    if (raw && typeof raw === "object") return raw;
  } catch {
    // fall through to defaults
  }
  return { speakerAuto: true, speakerDeviceIds: [] };
}

function saveDeviceSettings(settings) {
  localStorage.setItem(DEVICE_SETTINGS_KEY, JSON.stringify(settings));
}

// enumerateDevices() only returns real labels/ids once a media permission has
// been granted on this page, so probe getUserMedia first (audio-only, we
// immediately stop the track — we just need the permission side effect).
async function populateOutputDevices() {
  try {
    const probe = await navigator.mediaDevices.getUserMedia({ audio: true });
    probe.getTracks().forEach((t) => t.stop());
  } catch (err) {
    log(`[voicevox] mic permission probe failed, device labels may be blank: ${err}`);
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const outputs = devices.filter((d) => d.kind === "audiooutput");
  const settings = loadDeviceSettings();

  voicevoxOutputsSelect.innerHTML = "";
  for (const d of outputs) {
    const opt = document.createElement("option");
    opt.value = d.deviceId;
    opt.textContent = d.label || d.deviceId;
    opt.selected = settings.speakerAuto
      ? d.label.includes("CABLE Input")
      : settings.speakerDeviceIds.includes(d.deviceId);
    voicevoxOutputsSelect.appendChild(opt);
  }
}

// Chained onto by speak() below so overlapping calls (e.g. sending a new
// line while a previous one is still being read aloud) play back-to-back
// instead of on top of each other — each link waits for the previous
// utterance's audio to actually finish (see speakOnce()'s onended-driven
// promise), not just for it to start.
let ttsChain = Promise.resolve();

async function speak(text, params = {}) {
  text = (text ?? voicevoxInput.value).trim();
  if (!text) return;
  voicevoxInput.value = text;

  const run = ttsChain.then(() => speakOnce(text, params));
  // A failed utterance shouldn't wedge the queue for the next one — errors
  // already surface via voicevoxStatusEl inside speakOnce(), not via this
  // promise, so callers of speak() (which never await it) don't need `run`
  // itself to stay unhandled-rejection-safe either, but this keeps `ttsChain`
  // itself always resolved regardless.
  ttsChain = run.catch(() => {});
  return run;
}

async function speakOnce(text, params) {
  voicevoxStatusEl.textContent = t("voicevoxSynthesizing");
  try {
    const bytes = await window.__TAURI__.core.invoke("synthesize", {
      text,
      styleId: getSelectedStyleId(),
      speedScale: params.speedScale,
      pitchScale: params.pitchScale,
      intonationScale: params.intonationScale,
      volumeScale: params.volumeScale,
    });
    const blob = new Blob([new Uint8Array(bytes)], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    const sinkIds = Array.from(voicevoxOutputsSelect.selectedOptions).map((o) => o.value);
    const targets = sinkIds.length > 0 ? sinkIds : [""]; // no selection = default device

    const players = targets.map((sinkId) => ({ audio: new Audio(url), sinkId }));
    for (const { audio, sinkId } of players) {
      if (sinkId && audio.setSinkId) await audio.setSinkId(sinkId);
    }

    voicevoxStatusEl.textContent = `${t("voicevoxPlaying")} (${targets.length})`;

    // Waits for onended, not just for play() to start — that's what makes
    // ttsChain above an actual "don't start the next one until this one's
    // done" queue instead of a "don't start the next one until this one's
    // synthesis+setup is done" queue.
    await Promise.all(
      players.map(
        ({ audio }) =>
          new Promise((resolve) => {
            audio.onended = resolve;
            audio.play();
          }),
      ),
    );

    URL.revokeObjectURL(url);
    voicevoxStatusEl.textContent = t("statusIdle");
  } catch (err) {
    voicevoxStatusEl.textContent = `${t("statusErrorPrefix")}${err}`;
  }
}

function buildDeviceLabel(text) {
  const span = document.createElement("span");
  span.className = "device-label";
  span.textContent = text;
  return span;
}

// Mic selection has nothing to do with getUserMedia constraints — the Web
// Speech API (createRecognition() in main.js) has no way to target a
// specific device and always captures from Windows' default recording
// device, so picking a mic here calls the Rust-side
// set_default_input_device() to actually change that system-wide default
// instead. The list itself also comes from Rust (list_input_devices(),
// Windows' own Core Audio device enumeration) rather than
// navigator.mediaDevices, since it needs to report which one is currently
// the default and that has no browser-side equivalent.
//
// Speaker selection is unrelated and unaffected — VOICEVOX playback uses
// setSinkId(), which genuinely does support per-app device selection, so it
// still mirrors (and writes back to) the main screen's #voicevox-outputs
// <select multiple> as before.
async function renderMicDeviceList() {
  const micList = document.querySelector("#mic-device-list");
  let devices;
  try {
    devices = await window.__TAURI__.core.invoke("list_input_devices");
  } catch (err) {
    micList.innerHTML = "";
    log(`[device] failed to list input devices: ${err}`);
    return;
  }

  micList.innerHTML = "";
  for (const d of devices) {
    const row = document.createElement("label");
    row.className = "device-row";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "mic-device";
    radio.value = d.id;
    radio.checked = d.isDefault;
    radio.addEventListener("change", async () => {
      radio.disabled = true;
      try {
        await window.__TAURI__.core.invoke("set_default_input_device", { deviceId: d.id });
      } catch (err) {
        log(`[device] failed to set default input device: ${err}`);
      }
      await renderMicDeviceList(); // re-read the actual OS state rather than assume the call worked
    });
    row.append(radio, buildDeviceLabel(d.name));
    micList.appendChild(row);
  }
}

async function setupDevicePanel() {
  const speakerList = document.querySelector("#speaker-device-list");
  const speakerAutoToggle = document.querySelector("#speaker-auto-toggle");

  const settings = loadDeviceSettings();
  speakerAutoToggle.checked = settings.speakerAuto;
  speakerList.classList.toggle("disabled", settings.speakerAuto);

  speakerAutoToggle.addEventListener("change", () => {
    const s = loadDeviceSettings();
    s.speakerAuto = speakerAutoToggle.checked;
    saveDeviceSettings(s);
    speakerList.classList.toggle("disabled", s.speakerAuto);
    if (s.speakerAuto) populateOutputDevices(); // re-apply the CABLE-Input heuristic
  });

  renderMicDeviceList();

  try {
    const probe = await navigator.mediaDevices.getUserMedia({ audio: true });
    probe.getTracks().forEach((t) => t.stop());
  } catch {
    // labels may come back blank; selection by id still works
  }
  const devices = await navigator.mediaDevices.enumerateDevices();

  speakerList.innerHTML = "";
  for (const d of devices.filter((d) => d.kind === "audiooutput")) {
    const row = document.createElement("label");
    row.className = "device-row";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = d.deviceId;
    const mainOption = Array.from(voicevoxOutputsSelect.options).find((o) => o.value === d.deviceId);
    checkbox.checked = mainOption ? mainOption.selected : false;
    checkbox.addEventListener("change", () => {
      if (mainOption) mainOption.selected = checkbox.checked;
      const s = loadDeviceSettings();
      const ids = new Set(s.speakerDeviceIds);
      if (checkbox.checked) ids.add(d.deviceId);
      else ids.delete(d.deviceId);
      s.speakerDeviceIds = [...ids];
      saveDeviceSettings(s);
    });
    row.append(checkbox, buildDeviceLabel(d.label || d.deviceId));
    speakerList.appendChild(row);
  }
}

function setupTitlebar() {
  const appWindow = window.__TAURI__.window.getCurrentWindow();

  document.querySelector("#titlebar-minimize").addEventListener("click", () => appWindow.minimize());
  document.querySelector("#titlebar-maximize").addEventListener("click", () => appWindow.toggleMaximize());
  document.querySelector("#titlebar-close").addEventListener("click", () => appWindow.close());
}

function setupSettingsDialog() {
  const dialog = document.querySelector("#settings-dialog");
  document.querySelector("#settings-btn").addEventListener("click", () => dialog.showModal());
  document.querySelector("#settings-close-btn").addEventListener("click", () => dialog.close());
  // Dialog has no padding of its own, so any click that lands directly on
  // the <dialog> box (rather than a child) is a click on the backdrop area.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  setupSettingsNav();
  setupGeneralPanel();
  setupCharacterPanel();
  setupEndingsPanel();
  setupTemplatesPanel();
  setupProfilePanel();
  setupPresetPanel();
  setupAppearancePanel();
  setupDevicePanel();
  setupPronunciationDict();
  setupAboutLinks();
  setupUpdater();
}

// Generic external-link handling for [data-open-url] elements (currently
// just the 情報 section) — routes through the opener plugin's openUrl()
// rather than a plain <a href target="_blank">, since the latter tends to
// just navigate the app's own webview instead of the system browser inside
// a Tauri window.
function setupAboutLinks() {
  for (const el of document.querySelectorAll("[data-open-url]")) {
    el.addEventListener("click", () => {
      window.__TAURI__.opener.openUrl(el.dataset.openUrl);
    });
  }
}

// The Update object returned by updater.check() when one's available —
// held onto so the install button (which the user might click much later,
// or never) doesn't need to re-check.
let pendingUpdate = null;

// Runs once at startup (see DOMContentLoaded below) and again any time the
// user clicks #update-check-btn (see setupUpdater()) — either way,
// independent of whether the settings dialog is even open yet, since the
// Other panel's update section (queried fresh here) just reflects whatever
// this finds whenever the user eventually looks at it. There's no periodic
// re-check: an update published after the app launched (or after the last
// manual click) only gets noticed the next time one of those happens.
async function checkForUpdates() {
  const statusEl = document.querySelector("#update-status");
  const installBtn = document.querySelector("#update-install-btn");
  const checkBtn = document.querySelector("#update-check-btn");
  statusEl.textContent = t("updateCheckingStatus");
  checkBtn.disabled = true;

  try {
    pendingUpdate = await window.__TAURI__.updater.check();
  } catch (err) {
    statusEl.textContent = t("updateCheckFailedStatus");
    log(`[updater] check failed: ${err}`);
    return;
  } finally {
    checkBtn.disabled = false;
  }

  if (!pendingUpdate) {
    statusEl.textContent = t("updateUpToDateStatus");
    installBtn.hidden = true;
    return;
  }

  statusEl.textContent = `${t("updateAvailableStatus")} (${pendingUpdate.version})`;
  installBtn.hidden = false;
}

function setupUpdater() {
  window.__TAURI__.app
    .getVersion()
    .then((version) => {
      document.querySelector("#update-current-version").textContent = version;
    })
    .catch(() => {
      // Not critical — the rest of the update section still works without it.
    });

  document.querySelector("#update-check-btn").addEventListener("click", () => checkForUpdates());

  document.querySelector("#update-install-btn").addEventListener("click", async () => {
    if (!pendingUpdate) return;
    const installBtn = document.querySelector("#update-install-btn");
    const statusEl = document.querySelector("#update-status");
    installBtn.disabled = true;
    statusEl.textContent = t("updateDownloadingStatus");
    try {
      await pendingUpdate.downloadAndInstall();
      await window.__TAURI__.process.relaunch();
    } catch (err) {
      installBtn.disabled = false;
      statusEl.textContent = t("updateInstallFailedStatus");
      log(`[updater] install failed: ${err}`);
    }
  });
}

const APPEARANCE_STORAGE_KEY = "mutelink.appearance";

// 10 hues spanning the wheel (青/水色/緑/黄緑/黄色/ベージュ/橙/赤/ピンク/紫 —
// picked over the previous set, which leaned too heavily on blue-ish/
// teal-ish hues to tell apart at a glance), each chosen to read clearly as a
// border/fill color against both the light and dark surface colors (see
// --color-accent in styles.css, which everything — buttons, links, radios,
// the range slider thumb, --color-active-bg's own tint — now derives from).
// Ordered to flow around the wheel (beige is the one non-hue, muted-neutral
// exception, sitting as a warm bridge between yellow and orange rather than
// breaking the sequence). Deliberate app-wide setting, not part of a
// Profile (see the Profile system's own comment for why General/Device/
// Appearance stay unprofiled).
const COLOR_ACCENT_PRESETS = [
  { id: "blue", hex: "#3d6fd6" },
  { id: "skyblue", hex: "#2bb0d9" },
  { id: "green", hex: "#3daa5f" },
  { id: "yellowgreen", hex: "#8cc63f" },
  { id: "yellow", hex: "#e0b400" },
  { id: "beige", hex: "#c9a876" },
  { id: "orange", hex: "#e0682e" },
  { id: "red", hex: "#d9524f" },
  { id: "pink", hex: "#f0559e" },
  { id: "purple", hex: "#8a5cf0" },
];
const DEFAULT_ACCENT_COLOR = COLOR_ACCENT_PRESETS[0].hex;

// Must match overlay.rs's own *_ALPHA_DEFAULT/KEY_OPACITY_DEFAULT constants
// — what a fresh Hud (no set_vr_overlay_appearance push yet) starts at, so
// these sliders' initial position always matches what's actually on screen.
const VR_KEY_OPACITY_DEFAULT = 0.95;
// Shared by the keyboard grid and its cursor-control block — they're one
// combined background surface now, not two independent ones (see
// vrBackgroundSurfaces' own comment).
const VR_KEYBOARD_BG_OPACITY_DEFAULT = 0.88;
const VR_BOX_BG_OPACITY_DEFAULT = 210 / 255;

function defaultAppearance() {
  return {
    uiScale: 1,
    fontScale: 1,
    fontFamily: "",
    theme: "system",
    accentColor: DEFAULT_ACCENT_COLOR,
    keyOpacity: VR_KEY_OPACITY_DEFAULT,
    keyboardBgOpacity: VR_KEYBOARD_BG_OPACITY_DEFAULT,
    boxBgOpacity: VR_BOX_BG_OPACITY_DEFAULT,
    // 1 (100%) keeps existing installs sounding exactly as before this
    // setting existed — see playKeySound's own comment for where this is
    // actually read.
    keySoundVolume: 1,
  };
}

function loadAppearance() {
  try {
    const raw = JSON.parse(localStorage.getItem(APPEARANCE_STORAGE_KEY) ?? "null");
    if (raw && typeof raw === "object") return { ...defaultAppearance(), ...raw };
  } catch {
    // fall through to defaults
  }
  return defaultAppearance();
}

function saveAppearance(appearance) {
  localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance));
}

// "#rrggbb" -> [r, g, b] — accentColor is always one of COLOR_ACCENT_PRESETS
// or DEFAULT_ACCENT_COLOR, never arbitrary user input, so no format fallback.
function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16));
}

// Pushes the opacity sliders + accent color to the live VR overlay (Rust
// Hud) — see set_vr_overlay_appearance's own comment for why this, unlike
// the background images, isn't persisted on that side at all. Fire-and-
// forget from applyAppearance's own callers; failures (no SteamVR, no Hud)
// are expected and just logged, not surfaced to the user.
async function pushVrOverlayAppearance(appearance) {
  try {
    await window.__TAURI__.core.invoke("set_vr_overlay_appearance", {
      keyboardBgOpacity: appearance.keyboardBgOpacity,
      boxBgOpacity: appearance.boxBgOpacity,
      keyOpacity: appearance.keyOpacity,
      accent: hexToRgb(appearance.accentColor || DEFAULT_ACCENT_COLOR),
    });
  } catch (err) {
    log(`[appearance] failed to push VR overlay appearance: ${err}`);
  }
}

function applyAppearance(appearance) {
  document.documentElement.style.zoom = appearance.uiScale;
  document.documentElement.style.fontSize = `${16 * appearance.fontScale}px`;
  document.documentElement.style.fontFamily = appearance.fontFamily || "";
  if (appearance.theme === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", appearance.theme);
  }
  document.documentElement.style.setProperty("--color-accent", appearance.accentColor || DEFAULT_ACCENT_COLOR);
  pushVrOverlayAppearance(appearance);
}

// Must match .slider-wrap's width and the thumb width in styles.css. The
// native thumb can't overflow past the track ends, so its center only
// travels trackWidth - thumbWidth, not the full width — ticks/labels are
// positioned in pixels using that same math so they land under the thumb
// instead of drifting from it at both ends. (Measuring the real layout with
// getBoundingClientRect isn't reliable here since this runs while the
// <dialog> — and everything in it — is still closed/unlaid-out.)
const SLIDER_TRACK_WIDTH = 180;
const SLIDER_THUMB_WIDTH = 16;

// Draws a tick line under every discrete step of a range input, with a
// percentage label under every `labelEvery`-th one, instead of a single
// numeric readout next to the slider.
function buildSliderTicks(input, container, labelEvery = 2) {
  const min = Number(input.min);
  const max = Number(input.max);
  const step = Number(input.step);
  const steps = Math.round((max - min) / step) + 1;
  const usableWidth = SLIDER_TRACK_WIDTH - SLIDER_THUMB_WIDTH;

  container.innerHTML = "";
  for (let i = 0; i < steps; i++) {
    const value = min + step * i;
    const fraction = i / (steps - 1);
    const leftPx = SLIDER_THUMB_WIDTH / 2 + fraction * usableWidth;

    const tick = document.createElement("div");
    tick.className = "slider-tick";
    tick.style.left = `${leftPx}px`;
    container.appendChild(tick);

    if (i % labelEvery === 0) {
      const label = document.createElement("div");
      label.className = "slider-tick-label";
      label.style.left = `${leftPx}px`;
      label.textContent = `${Math.round(value * 100)}%`;
      container.appendChild(label);
    }
  }
}

function setupAppearancePanel() {
  const appearance = loadAppearance();
  applyAppearance(appearance);

  const uiScaleInput = document.querySelector("#ui-scale-input");
  const fontScaleInput = document.querySelector("#font-scale-input");
  const fontFamilySelect = document.querySelector("#font-family-select");

  buildSliderTicks(uiScaleInput, document.querySelector("#ui-scale-ticks"));
  buildSliderTicks(fontScaleInput, document.querySelector("#font-scale-ticks"));

  uiScaleInput.value = appearance.uiScale;
  fontScaleInput.value = appearance.fontScale;
  fontFamilySelect.value = appearance.fontFamily;
  const themeRadio = document.querySelector(`input[name="theme"][value="${appearance.theme}"]`);
  if (themeRadio) themeRadio.checked = true;

  uiScaleInput.addEventListener("input", () => {
    appearance.uiScale = Number(uiScaleInput.value);
    applyAppearance(appearance);
    saveAppearance(appearance);
  });

  fontScaleInput.addEventListener("input", () => {
    appearance.fontScale = Number(fontScaleInput.value);
    applyAppearance(appearance);
    saveAppearance(appearance);
  });

  fontFamilySelect.addEventListener("change", () => {
    appearance.fontFamily = fontFamilySelect.value;
    applyAppearance(appearance);
    saveAppearance(appearance);
  });

  for (const radio of document.querySelectorAll('input[name="theme"]')) {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      appearance.theme = radio.value;
      applyAppearance(appearance);
      saveAppearance(appearance);
    });
  }

  const swatchRow = document.querySelector("#accent-color-swatches");
  swatchRow.innerHTML = "";
  for (const preset of COLOR_ACCENT_PRESETS) {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = preset.hex;
    swatch.classList.toggle("selected", preset.hex === appearance.accentColor);
    swatch.title = preset.id;
    swatch.setAttribute("aria-label", preset.id);
    swatch.addEventListener("click", () => {
      appearance.accentColor = preset.hex;
      applyAppearance(appearance);
      saveAppearance(appearance);
      for (const el of swatchRow.querySelectorAll(".color-swatch")) el.classList.remove("selected");
      swatch.classList.add("selected");
    });
    swatchRow.appendChild(swatch);
  }

  // Key opacity + the 2 surfaces' own background tint opacity (see
  // overlay::KeyboardVisuals/BoxCache) — same slider-wrap/tick pattern as
  // uiScaleInput/fontScaleInput above, just 0-1 in 5% steps since these are
  // plain alpha values, not a scale factor.
  const opacityFields = [
    ["keyOpacity", "vr-key-opacity-input", "vr-key-opacity-ticks"],
    ["keyboardBgOpacity", "vr-keyboard-bg-opacity-input", "vr-keyboard-bg-opacity-ticks"],
    ["boxBgOpacity", "vr-box-bg-opacity-input", "vr-box-bg-opacity-ticks"],
  ];
  for (const [field, inputId, ticksId] of opacityFields) {
    const input = document.querySelector(`#${inputId}`);
    buildSliderTicks(input, document.querySelector(`#${ticksId}`), 4);
    input.value = appearance[field];
    input.addEventListener("input", () => {
      appearance[field] = Number(input.value);
      applyAppearance(appearance);
      saveAppearance(appearance);
    });
  }

  // 0-100% in 11 stops (10% steps) rather than the 5% steps above — this
  // isn't a subtle visual tint, it's a click volume, where 21 stops would
  // just be more clicking-through than the difference between adjacent
  // steps is worth. Doesn't go through applyAppearance/pushVrOverlayAppearance
  // (see keySoundVolumeCache's own comment) — this never reaches Rust or
  // CSS, only playKeySound reads it, so there's nothing else to re-apply.
  const keySoundVolumeInput = document.querySelector("#key-sound-volume-input");
  buildSliderTicks(keySoundVolumeInput, document.querySelector("#key-sound-volume-ticks"), 2);
  keySoundVolumeInput.value = appearance.keySoundVolume;
  keySoundVolumeCache = appearance.keySoundVolume;
  keySoundVolumeInput.addEventListener("input", () => {
    appearance.keySoundVolume = Number(keySoundVolumeInput.value);
    keySoundVolumeCache = appearance.keySoundVolume;
    saveAppearance(appearance);
  });

  setupVrOverlayBackgroundPanels();
}

// ---- VR overlay background images (settings > Appearance) --------------
// Two independently-settable surfaces — the VR keyboard (its grid *and* its
// own cursor-control block, sharing one image — see below) and the
// confirm/discard preview box — each with its own target crop size.
//
// The keyboard grid and the cursor block used to each get their own,
// separately-cropped image. They sit only a few px apart (see
// VR_KB_CURSOR_BOX_PADDING/overlay.rs's own CURSOR_BOX_PADDING), close
// enough that two independently-picked photos never actually read as one
// continuous picture — the seam between them was always obviously two
// different crops. The "keyboard" entry's own width now instead spans the
// *union* of both boxes (from the canvas's left edge out to the cursor
// block's own padded right edge), so one image is cropped once and blitted
// across both at once on the Rust side (see overlay.rs's keyboard_panel) —
// the couple-px gap between the two boxes' own tint rects just shows that
// same photo through, reading as continuous rather than as a seam.
// The keyboard's own size is derived from compile-time-constant pixel
// geometry (VR_KB_GRID_WIDTH/VR_KB_CANVAS_HEIGHT/VR_KB_CURSOR_BOX — none of
// which change at runtime, see their own comments); the box's from Rust's
// own CANVAS_WIDTH/CANVAS_HEIGHT.
// A function, not a plain top-level const object: VR_KB_GRID_WIDTH/
// VR_KB_CURSOR_BOX/VR_BOX_CANVAS_WIDTH etc. are declared further down this
// same file (see computeVrKeyboardLayout's own section), so building this
// object eagerly at parse time would hit those consts' temporal dead zone.
// Every call site here already only runs from a user gesture well after the
// whole module has finished loading, same as the old single-surface
// version's own VR_KB_CANVAS_WIDTH references did.
function vrBackgroundSurfaces() {
  return {
    keyboard: {
      width: Math.round(VR_KB_CURSOR_BOX.x + VR_KB_CURSOR_BOX.w + VR_KB_CURSOR_BOX_PADDING),
      height: VR_KB_CANVAS_HEIGHT,
    },
    box: { width: VR_BOX_CANVAS_WIDTH, height: VR_BOX_CANVAS_HEIGHT },
  };
}
// This dialog's own element-id prefixes per surface (…-file/-choose-btn/
// -remove-btn/-status, see index.html) — the one place a surface key maps
// to concrete DOM ids, so setupBackgroundImagePanel/refreshBackgroundStatus
// stay generic over both instead of two near-identical copies.
const VR_BACKGROUND_SURFACE_ID_PREFIX = {
  keyboard: "vr-keyboard-background",
  box: "vr-box-background",
};

// A plain <canvas> pan/zoom-within-a-fixed-aspect-frame tool rather than
// free-form crop handles — the target is always exactly one aspect ratio
// (whichever surface is being edited — see vrBackgroundSurfaces()), so
// there's nothing a resizable rectangle would add over "the frame is
// already the right shape, just move/scale the image under it" — and it's
// far simpler to get right without a pointer-drag-a-handle state machine.
// cropImage/cropSurface/cropScale/etc. are this dialog's only state, valid
// strictly between openImageCropDialog() and either crop button click.
let cropImage = null;
let cropSurface = null; // one of vrBackgroundSurfaces()' own keys
let cropCoverScale = 1; // minimum scale so the image fully covers the frame — the zoom slider's own "1.0"
let cropScale = 1;
let cropOffsetX = 0; // pan, in *preview*-canvas pixels, from centered
let cropOffsetY = 0;
let cropDragging = false;
let cropDragStartX = 0;
let cropDragStartY = 0;
let cropDragStartOffsetX = 0;
let cropDragStartOffsetY = 0;

// Keeps the image covering the whole frame no matter how far it's been
// panned — clamped in *display* (canvas) pixels, called after every pan/
// zoom change, not just on release, so the image can never be dragged to
// reveal empty space even mid-drag.
function clampCropOffsets(canvas) {
  const dw = cropImage.width * cropScale;
  const dh = cropImage.height * cropScale;
  const maxOffsetX = Math.max(0, (dw - canvas.width) / 2);
  const maxOffsetY = Math.max(0, (dh - canvas.height) / 2);
  cropOffsetX = Math.min(maxOffsetX, Math.max(-maxOffsetX, cropOffsetX));
  cropOffsetY = Math.min(maxOffsetY, Math.max(-maxOffsetY, cropOffsetY));
}

// Faint outlines of roughly where the real buttons will sit, drawn over the
// cropped image preview so a busy/high-contrast part of a picked photo can
// be checked against actual button positions before committing. Mirrors the
// real keyboard's own grid (VR_KB_GRID_LEFT/TOP/CELL_W/H/GAP_X/Y, 5 cols x 4
// rows) and cursor block (VR_KB_CURSOR_BOX, 2 cols x 5 rows) geometry — real
// button *positions*, not real labels/current mode/content, since this only
// needs to be a rough structural guide, not a live mirror of the actual
// keyboard state (which depends on mode/profile/endings and would be a lot
// more machinery for a dialog that's only ever open for a few seconds).
function drawCropButtonOverlay(ctx, canvasWidth, target) {
  const scale = canvasWidth / target.width;
  ctx.save();
  ctx.scale(scale, scale);
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  ctx.lineWidth = 1 / scale;
  const drawCell = (x, y, w, h) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();
  };
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < VR_KB_GRID_COLS; col++) {
      drawCell(VR_KB_GRID_LEFT + col * (VR_KB_CELL_W + VR_KB_GAP_X), VR_KB_GRID_TOP + row * (VR_KB_CELL_H + VR_KB_GAP_Y), VR_KB_CELL_W, VR_KB_CELL_H);
    }
  }
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 2; col++) {
      drawCell(VR_KB_CURSOR_BOX.x + col * (VR_KB_CELL_W + VR_KB_GAP_X), VR_KB_GRID_TOP + row * (VR_KB_CELL_H + VR_KB_GAP_Y), VR_KB_CELL_W, VR_KB_CELL_H);
    }
  }
  // 語尾(endings) row(s), below the main grid — same formula
  // computeVrKeyboardLayout itself uses (endTop/endRows/endH), reading the
  // active profile's own endings count via loadEndings() rather than
  // assuming a fixed row count, so this preview doesn't silently drift out
  // of sync with however many endings the user has actually configured.
  const endTop = VR_KB_GRID_TOP + 4 * (VR_KB_CELL_H + VR_KB_GAP_Y) + VR_KB_GAP_Y;
  const endingsCount = loadEndings().length;
  if (endingsCount > 0) {
    const endRows = Math.ceil(endingsCount / VR_KB_GRID_COLS);
    const endH = (VR_KB_CANVAS_HEIGHT - endTop - VR_KB_GAP_Y - (endRows - 1) * VR_KB_GAP_Y) / endRows;
    for (let i = 0; i < endingsCount; i++) {
      const col = i % VR_KB_GRID_COLS;
      const row = Math.floor(i / VR_KB_GRID_COLS);
      drawCell(VR_KB_GRID_LEFT + col * (VR_KB_CELL_W + VR_KB_GAP_X), endTop + row * (endH + VR_KB_GAP_Y), VR_KB_CELL_W, endH);
    }
  }
  ctx.restore();
}

function drawCropPreview() {
  const canvas = document.querySelector("#image-crop-canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dw = cropImage.width * cropScale;
  const dh = cropImage.height * cropScale;
  ctx.drawImage(cropImage, (canvas.width - dw) / 2 + cropOffsetX, (canvas.height - dh) / 2 + cropOffsetY, dw, dh);
  // Box (confirm/discard preview) has no buttons of its own — text only —
  // so there's nothing structural to overlay there.
  if (cropSurface === "keyboard") {
    drawCropButtonOverlay(ctx, canvas.width, vrBackgroundSurfaces()[cropSurface]);
  }
}

function openImageCropDialog(image, surface) {
  cropImage = image;
  cropSurface = surface;
  const target = vrBackgroundSurfaces()[surface];
  const canvas = document.querySelector("#image-crop-canvas");
  // Display-only resolution — the exported image (see the apply handler in
  // setupImageCropDialog) is always the full target width x height
  // regardless of this. Capped by *both* width and height (not just width,
  // the way this used to work) so the dialog reliably fits inside the
  // window without needing to scroll to reach the zoom slider/buttons below
  // it, regardless of how wide-and-short (the box) or how much wider the
  // combined keyboard surface (see vrBackgroundSurfaces) a given target's
  // own aspect ratio is.
  const maxPreviewWidth = 640;
  const maxPreviewHeight = Math.max(220, Math.round(window.innerHeight * 0.4));
  let previewWidth = maxPreviewWidth;
  let previewHeight = Math.round(previewWidth * (target.height / target.width));
  if (previewHeight > maxPreviewHeight) {
    previewHeight = maxPreviewHeight;
    previewWidth = Math.round(previewHeight * (target.width / target.height));
  }
  canvas.width = previewWidth;
  canvas.height = previewHeight;

  cropCoverScale = Math.max(canvas.width / image.width, canvas.height / image.height);
  cropScale = cropCoverScale;
  cropOffsetX = 0;
  cropOffsetY = 0;
  document.querySelector("#image-crop-zoom").value = "1";

  drawCropPreview();
  document.querySelector("#image-crop-dialog").showModal();
}

function setupImageCropDialog() {
  const canvas = document.querySelector("#image-crop-canvas");
  const zoomInput = document.querySelector("#image-crop-zoom");
  const dialog = document.querySelector("#image-crop-dialog");

  zoomInput.addEventListener("input", () => {
    cropScale = cropCoverScale * Number(zoomInput.value);
    clampCropOffsets(canvas);
    drawCropPreview();
  });

  canvas.addEventListener("pointerdown", (event) => {
    cropDragging = true;
    canvas.setPointerCapture(event.pointerId);
    cropDragStartX = event.clientX;
    cropDragStartY = event.clientY;
    cropDragStartOffsetX = cropOffsetX;
    cropDragStartOffsetY = cropOffsetY;
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!cropDragging) return;
    // clientX/Y deltas are in CSS pixels; the canvas's own backing
    // resolution (canvas.width) can differ from its displayed CSS size
    // (styles.css caps it at max-width:100%) — scale the delta by that
    // ratio so a full drag across the visible image always maps to a full
    // drag across its backing pixels, regardless of how large it's shown.
    const displayScale = canvas.width / canvas.getBoundingClientRect().width;
    cropOffsetX = cropDragStartOffsetX + (event.clientX - cropDragStartX) * displayScale;
    cropOffsetY = cropDragStartOffsetY + (event.clientY - cropDragStartY) * displayScale;
    clampCropOffsets(canvas);
    drawCropPreview();
  });
  const endDrag = () => {
    cropDragging = false;
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  document.querySelector("#image-crop-cancel-btn").addEventListener("click", () => {
    dialog.close();
    cropImage = null;
    cropSurface = null;
  });

  document.querySelector("#image-crop-apply-btn").addEventListener("click", async () => {
    // Renders the *exact same* composition onto a full-resolution offscreen
    // canvas — every drawImage argument just scales up from preview-canvas
    // pixels to full pixels by the same uniform ratio, since both canvases
    // share the identical aspect ratio by construction (openImageCropDialog
    // derives the preview's own height from the target surface's own
    // width/height).
    const target = vrBackgroundSurfaces()[cropSurface];
    const full = document.createElement("canvas");
    full.width = target.width;
    full.height = target.height;
    const previewCanvas = document.querySelector("#image-crop-canvas");
    const ratio = target.width / previewCanvas.width;
    const dw = cropImage.width * cropScale * ratio;
    const dh = cropImage.height * cropScale * ratio;
    const fullCtx = full.getContext("2d");
    fullCtx.drawImage(cropImage, (full.width - dw) / 2 + cropOffsetX * ratio, (full.height - dh) / 2 + cropOffsetY * ratio, dw, dh);
    const rgba = fullCtx.getImageData(0, 0, full.width, full.height).data;

    const applyBtn = document.querySelector("#image-crop-apply-btn");
    applyBtn.disabled = true;
    try {
      await window.__TAURI__.core.invoke("set_background_image", {
        surface: cropSurface,
        width: target.width,
        height: target.height,
        rgba: Array.from(rgba),
      });
      dialog.close();
      const surface = cropSurface;
      cropImage = null;
      cropSurface = null;
      await refreshBackgroundStatus(surface);
    } catch (err) {
      log(`[appearance] failed to set the ${cropSurface} background: ${err}`);
    } finally {
      applyBtn.disabled = false;
    }
  });
}

async function refreshBackgroundStatus(surface) {
  const prefix = VR_BACKGROUND_SURFACE_ID_PREFIX[surface];
  const statusEl = document.querySelector(`#${prefix}-status`);
  const removeBtn = document.querySelector(`#${prefix}-remove-btn`);
  let hasBackground = false;
  try {
    hasBackground = await window.__TAURI__.core.invoke("has_background_image", { surface });
  } catch (err) {
    log(`[appearance] ${err}`);
  }
  statusEl.textContent = t(hasBackground ? "vrKeyboardBackgroundSetStatus" : "vrKeyboardBackgroundUnsetStatus");
  removeBtn.hidden = !hasBackground;
}

function setupBackgroundImagePanel(surface) {
  const prefix = VR_BACKGROUND_SURFACE_ID_PREFIX[surface];
  const fileInput = document.querySelector(`#${prefix}-file`);
  const chooseBtn = document.querySelector(`#${prefix}-choose-btn`);
  const removeBtn = document.querySelector(`#${prefix}-remove-btn`);

  chooseBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    fileInput.value = ""; // so picking the exact same file again still fires "change"
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.addEventListener("load", () => {
      URL.revokeObjectURL(url);
      openImageCropDialog(image, surface);
    });
    image.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      log("[appearance] failed to load the selected image");
    });
    image.src = url;
  });

  removeBtn.addEventListener("click", async () => {
    removeBtn.disabled = true;
    try {
      await window.__TAURI__.core.invoke("clear_background_image", { surface });
      await refreshBackgroundStatus(surface);
    } catch (err) {
      log(`[appearance] ${err}`);
    } finally {
      removeBtn.disabled = false;
    }
  });

  refreshBackgroundStatus(surface);
}

function setupVrOverlayBackgroundPanels() {
  setupImageCropDialog();
  for (const surface of Object.keys(VR_BACKGROUND_SURFACE_ID_PREFIX)) setupBackgroundImagePanel(surface);
}

function setupSettingsNav() {
  const buttons = document.querySelectorAll(".settings-nav-btn");
  const panels = document.querySelectorAll(".settings-panel");

  function showPanel(name) {
    for (const btn of buttons) btn.classList.toggle("active", btn.dataset.panel === name);
    for (const panel of panels) panel.hidden = panel.dataset.panel !== name;
  }

  for (const btn of buttons) {
    btn.addEventListener("click", () => showPanel(btn.dataset.panel));
  }
  showPanel("general");
}

const DEFAULT_ENDING_PARAMS = {
  speedScale: 1,
  pitchScale: 0,
  intonationScale: 1,
  volumeScale: 1,
  speakEnding: false, // whether VOICEVOX reads this ending aloud at all when it's picked
  reading: "", // what to read instead of the literal text when speakEnding is on; falls back to the text itself if left blank
};
// Fixed at exactly 10 numbered slots (1-10) rather than a free-form list —
// hotkeys are assigned by slot number (see the Profile system's own
// comment), so editing what's in a slot automatically updates whatever
// hotkey points at that number instead of needing to be re-picked.
const ENDINGS_SLOT_COUNT = 10;
const DEFAULT_ENDINGS = [
  { text: "..o0", speedScale: 0.89, pitchScale: 0.01, intonationScale: 1.35, volumeScale: 1.08, speakEnding: false, reading: "" },
  { text: "ー", speedScale: 1, pitchScale: 0, intonationScale: 1, volumeScale: 1, speakEnding: true, reading: "" },
  { text: "!", speedScale: 1, pitchScale: 0, intonationScale: 1, volumeScale: 1, speakEnding: true, reading: "" },
  { text: "xwx", speedScale: 1, pitchScale: -0.05, intonationScale: 0.45, volumeScale: 1, speakEnding: false, reading: "" },
  { text: "?", speedScale: 1, pitchScale: 0, intonationScale: 1, volumeScale: 1, speakEnding: true, reading: "" },
  { text: "♡", speedScale: 1, pitchScale: 0, intonationScale: 1, volumeScale: 1, speakEnding: false, reading: "" },
  { text: "...", speedScale: 1, pitchScale: 0, intonationScale: 1, volumeScale: 1, speakEnding: false, reading: "" },
  { text: "..//", speedScale: 1, pitchScale: 0, intonationScale: 1, volumeScale: 1, speakEnding: false, reading: "" },
  { text: "..zZ", speedScale: 1, pitchScale: 0, intonationScale: 1, volumeScale: 1, speakEnding: false, reading: "" },
  { text: "にゃん=w=", speedScale: 0.93, pitchScale: 0.03, intonationScale: 1.26, volumeScale: 1, speakEnding: true, reading: "にゃん" },
];

// Endings are profile-scoped (see the Profile system further down) —
// reads/writes the *active* profile's own endings list. normalizeEndingsList
// (defined alongside the Profile system) does the fixed-slot-count padding/
// truncation this used to do inline.
function loadEndings() {
  return getActiveProfile().endings;
}

function saveEndings(endings) {
  updateActiveProfile((p) => ({ ...p, endings }));
}

// The VR keyboard's "テンプレ" (template) mode — a 12-slot quick-phrase
// picker, separate from `endings` above (endings are appended to a
// confirmed send; templates are inserted at the cursor like any other
// typed text). Storage contract (also relied on by the VR keyboard's own
// layout code in computeVrKeyboardLayout): a plain JSON array of exactly
// VR_KEYBOARD_TEMPLATE_SLOT_COUNT strings, empty string = that slot unset.
// Profile-scoped the same way endings are — reads/writes the active
// profile's own templates list.
const VR_KEYBOARD_TEMPLATE_SLOT_COUNT = 12;

function loadVrKeyboardTemplates() {
  return getActiveProfile().templates;
}

function saveVrKeyboardTemplates(templates) {
  updateActiveProfile((p) => ({ ...p, templates }));
}

// Plain text inputs, one per fixed slot (unlike renderGeneralEndingsList's
// expandable rows — there's nothing to configure per template besides the
// text itself, no add/remove since the slot count is fixed by the
// keyboard's own 12-cell template-mode grid).
// `container`/`profileIndex` default to the main テンプレート settings panel
// and the active profile — the Profile menu's own embedded editor (see
// renderProfileMenuList) passes its own detail container and a specific
// profile index instead, same pattern as renderGeneralEndingsList.
function renderVrKeyboardTemplatesList(container = document.querySelector("#vr-keyboard-templates-list"), profileIndex = loadActiveProfileIndex()) {
  if (!container) return;
  container.innerHTML = "";
  const templates = loadProfiles()[profileIndex].templates;
  templates.forEach((text, i) => {
    const row = document.createElement("div");
    row.className = "settings-list-row";

    const label = document.createElement("span");
    label.className = "settings-list-label";
    label.textContent = String(i + 1);

    const input = document.createElement("input");
    input.type = "text";
    input.value = text;
    input.addEventListener("change", () => {
      const current = loadProfiles()[profileIndex].templates.slice();
      current[i] = input.value;
      updateProfileAt(profileIndex, (p) => ({ ...p, templates: current }));
    });

    row.append(label, input);
    container.append(row);
  });
}

function renderEndingButtons(container, endings, onPick) {
  container.innerHTML = "";
  for (const ending of endings) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = ending.text;
    btn.addEventListener("click", () => onPick(ending));
    container.appendChild(btn);
  }
}

// Populated by setupEndings(); read by setupHotkeys() too, since hotkeys
// trigger the exact same "pick this favorite" action as clicking its button.
let endings = [];

// Applying a favorite appends it to whatever's pending in the Final block and
// sends immediately, using that ending's own VOICEVOX parameters. A trailing
// 。/./？/? on the pending text is dropped first since the ending replaces it
// in the chatbox output. By default VOICEVOX reads only the plain Final
// sentence with the ending left off (endings are often emoji/kaomoji that
// OpenJTalk mispronounces) — each ending's own settings.speakEnding/reading
// (see 語尾 settings panel) can opt that specific ending into being spoken
// too, using a separate reading text instead of its literal chatbox text.
function applyEnding(ending) {
  const original = pendingFinalText;
  const base = original.replace(/[。.？?]$/, "");
  const outputText = base ? `${base}${ending.text}` : ending.text;
  const endingReading = ending.reading || ending.text;
  const spokenText = ending.speakEnding ? (base ? `${base}${endingReading}` : endingReading) : original;
  dispatchText(outputText, spokenText, {
    speedScale: ending.speedScale,
    pitchScale: ending.pitchScale,
    intonationScale: ending.intonationScale,
    volumeScale: ending.volumeScale,
  });
  pendingFinalText = "";
  // The VR keyboard can still be open after this (auto-close-on-ending is
  // itself an option — see loadVrKeyboardAutoCloseOnSend) — without this,
  // vrKeyboardCursorPos stays wherever it was in the now-gone text (e.g.
  // past the end), and every insert after that lands mid-air past the end
  // of the new text instead of appending to it, with no visible cursor
  // bar at all (draw_text_block in overlay.rs only draws one when the
  // cursor index is actually within the line it's drawing).
  vrKeyboardCursorPos = 0;
  vrKeyboardConfirmedLength = 0;
  renderMergedText();
}

function setupEndings() {
  const endingButtons = document.querySelector("#ending-buttons");

  endings = loadEndings();
  saveEndings(endings); // persist defaults on first run
  renderEndingButtons(endingButtons, endings, applyEnding);
  renderHotkeyAssignmentOptions();
}

// Desktop mode's on-screen stand-in for the VR hand hotkeys: #lang-cycle-btn
// mirrors cycleSttState() (normally the left controller's lower face
// button — see setupHotkeys()), #discard-text-btn mirrors the stick-press
// discard gesture (see fireHotkeyAssignment()/HOTKEY_CANCEL_ACTION below),
// and #ending-buttons (already built by setupEndings() above) doubles as
// the "confirm/send" action, exactly like picking an ending slot via a hand
// hotkey does. VR mode never shows any of these three (see
// body.ui-mode-desktop in styles.css), so its own screen is unaffected by
// them. #pending-text-editor is the one exception — it's visible in both
// modes (a live preview in VR mode, matching the VR HUD; editable in
// either) — its "input" listener writes straight back into pendingFinalText,
// which is what applyEnding()/dispatchText() actually read, so an edit here
// is exactly what goes out.
function setupUiMode() {
  const toggleBtn = document.querySelector("#ui-mode-toggle-btn");
  const langCycleBtn = document.querySelector("#lang-cycle-btn");
  const discardTextBtn = document.querySelector("#discard-text-btn");

  function apply(mode) {
    document.body.classList.toggle("ui-mode-desktop", mode === "desktop");
    toggleBtn.textContent = mode === "desktop" ? "Desktop" : "VR";
  }

  apply(loadUiMode());

  pendingTextEditorEl.addEventListener("input", () => {
    pendingFinalText = pendingTextEditorEl.value;
    // Editing here can shorten the text out from under an open VR
    // keyboard's own cursor (same class of bug as applyEnding/the cancel
    // hotkey — see their own comments) — clamped rather than reset to 0,
    // since unlike a send/clear this doesn't imply "start over".
    vrKeyboardCursorPos = Math.min(vrKeyboardCursorPos, pendingFinalText.length);
    vrKeyboardConfirmedLength = Math.min(vrKeyboardConfirmedLength, pendingFinalText.length);
    renderMergedText();
  });

  toggleBtn.addEventListener("click", () => {
    const next = loadUiMode() === "desktop" ? "vr" : "desktop";
    saveUiMode(next);
    apply(next);
  });

  langCycleBtn.addEventListener("click", () => cycleSttState());
  discardTextBtn.addEventListener("click", () => fireHotkeyAssignment(HOTKEY_CANCEL_ACTION));
}

// `labelKey` (not translated text directly) so formatEndingSummary()/the
// param rows below always reflect the current uiLang via t().
const ENDING_PARAM_DEFS = [
  { key: "speedScale", labelKey: "paramSpeed", min: 0.5, max: 2, step: 0.01 },
  { key: "pitchScale", labelKey: "paramPitch", min: -0.15, max: 0.15, step: 0.01 },
  { key: "intonationScale", labelKey: "paramIntonation", min: 0, max: 2, step: 0.01 },
  { key: "volumeScale", labelKey: "paramVolume", min: 0, max: 2, step: 0.01 },
];

function formatEndingSummary(ending) {
  return ENDING_PARAM_DEFS.map((def) => `${t(def.labelKey)}${Number(ending[def.key]).toFixed(2)}`).join(" / ");
}

// Persists `list` into profileIndex's own endings — if that's the currently
// active profile, keeps the module `endings` mirror (and everything reading
// it directly, like renderEndingButtons/the hotkey poll loop) in sync too.
// Used for plain param edits (speak toggle, reading, sliders), which don't
// need the main-screen tiles or hotkey dropdown *labels* rebuilt since the
// ending's text didn't change.
function saveProfileEndings(profileIndex, list) {
  updateProfileAt(profileIndex, (p) => ({ ...p, endings: list }));
  if (profileIndex === loadActiveProfileIndex()) endings = list;
}

// Same, plus rebuilds every other view of the text (main-screen tiles,
// hotkey dropdown option labels) — worth doing after a text edit, which
// those two views also show, but not on every param tweak. Both refreshes
// are no-ops in effect when profileIndex isn't the active one, since
// neither view reflects a non-active profile regardless.
function refreshProfileEndingConsumers(profileIndex, list) {
  saveProfileEndings(profileIndex, list);
  if (profileIndex === loadActiveProfileIndex()) {
    renderEndingButtons(document.querySelector("#ending-buttons"), endings, applyEnding);
    renderHotkeyAssignmentOptions();
  }
}

// Every hand/slot hotkey combo currently pointing at ending slot number
// `slotNumber` (1-based) *within `profileIndex`'s own hotkey assignments* —
// as human-readable "右手: トリガーのみ" strings — so the 語尾 panel (and the
// Profile menu's own embedded copy of it) can show right on each row where
// it's wired up, instead of having to go check the Hotkey panel to find out.
function hotkeyRefsForEndingSlot(slotNumber, profileIndex = loadActiveProfileIndex()) {
  const assignments = loadProfiles()[profileIndex].hotkey;
  const target = String(slotNumber);
  const refs = [];
  for (const hand of HOTKEY_HANDS) {
    for (const slot of HOTKEY_SLOTS) {
      if (assignments[hand][slot] === target) {
        refs.push(`${t(HOTKEY_HAND_LABEL_KEYS[hand])}: ${t(HOTKEY_SLOT_LABEL_KEYS[slot])}`);
      }
    }
  }
  return refs;
}

// `container`/`profileIndex` default to the main 語尾 settings panel and the
// active profile — the Profile menu's own embedded editor (see
// renderProfileMenuList) passes its own detail container and a specific
// profile index instead, to edit a profile that may not be the active one.
function renderGeneralEndingsList(container = document.querySelector("#ending-settings-list"), profileIndex = loadActiveProfileIndex()) {
  container.innerHTML = "";
  const list = loadProfiles()[profileIndex].endings;

  list.forEach((ending, i) => {
    const slotNumber = i + 1;
    const row = document.createElement("div");
    row.className = "ending-settings-row";

    const summary = document.createElement("button");
    summary.type = "button";
    summary.className = "ending-settings-summary";

    const numberBadge = document.createElement("span");
    numberBadge.className = "ending-settings-number";
    numberBadge.textContent = String(slotNumber);

    const textSpan = document.createElement("span");
    textSpan.className = "ending-settings-text";
    textSpan.textContent = ending.text;

    const valuesSpan = document.createElement("span");
    valuesSpan.className = "ending-settings-values";
    valuesSpan.textContent = formatEndingSummary(ending);

    const chevron = document.createElement("span");
    chevron.className = "ending-settings-chevron";
    chevron.textContent = "▾";

    summary.append(numberBadge, textSpan, valuesSpan, chevron);

    const hotkeyRefs = document.createElement("div");
    hotkeyRefs.className = "ending-hotkey-refs";
    const refs = hotkeyRefsForEndingSlot(slotNumber, profileIndex);
    if (refs.length > 0) {
      hotkeyRefs.textContent = `→ ${refs.join(" / ")}`;
    } else {
      hotkeyRefs.hidden = true;
    }

    const detail = document.createElement("div");
    detail.className = "ending-settings-detail";
    detail.hidden = true;

    const textRow = document.createElement("div");
    textRow.className = "ending-param-row";
    const textLabel = document.createElement("span");
    textLabel.className = "ending-param-label";
    textLabel.textContent = t("endingTextFieldLabel");
    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.className = "ending-text-input";
    textInput.value = ending.text;
    textInput.addEventListener("change", () => {
      const value = textInput.value.trim();
      if (!value) {
        textInput.value = ending.text; // reject empty, revert to the last real value
        return;
      }
      ending.text = value;
      textSpan.textContent = value;
      readingInput.placeholder = value;
      refreshProfileEndingConsumers(profileIndex, list);
    });
    textRow.append(textLabel, textInput);
    detail.appendChild(textRow);

    const speakRow = document.createElement("div");
    speakRow.className = "settings-list-row ending-speak-row";
    const speakLabel = document.createElement("span");
    speakLabel.className = "settings-list-label";
    speakLabel.textContent = t("endingSpeakLabel");
    const speakSwitch = document.createElement("label");
    speakSwitch.className = "switch";
    const speakCheckbox = document.createElement("input");
    speakCheckbox.type = "checkbox";
    speakCheckbox.checked = !!ending.speakEnding;
    const speakTrack = document.createElement("span");
    speakTrack.className = "switch-track";
    speakSwitch.append(speakCheckbox, speakTrack);
    speakCheckbox.addEventListener("change", () => {
      ending.speakEnding = speakCheckbox.checked;
      saveProfileEndings(profileIndex, list);
    });
    speakRow.append(speakLabel, speakSwitch);
    detail.appendChild(speakRow);

    const readingRow = document.createElement("div");
    readingRow.className = "ending-param-row";
    const readingLabel = document.createElement("span");
    readingLabel.className = "ending-param-label";
    readingLabel.textContent = t("endingReadingLabel");
    const readingInput = document.createElement("input");
    readingInput.type = "text";
    readingInput.className = "ending-text-input";
    readingInput.placeholder = ending.text;
    readingInput.value = ending.reading ?? "";
    readingInput.addEventListener("change", () => {
      ending.reading = readingInput.value.trim();
      saveProfileEndings(profileIndex, list);
    });
    readingRow.append(readingLabel, readingInput);
    detail.appendChild(readingRow);

    for (const def of ENDING_PARAM_DEFS) {
      const paramRow = document.createElement("div");
      paramRow.className = "ending-param-row";

      const label = document.createElement("span");
      label.className = "ending-param-label";
      label.textContent = t(def.labelKey);

      const input = document.createElement("input");
      input.type = "range";
      input.min = def.min;
      input.max = def.max;
      input.step = def.step;
      input.value = ending[def.key];

      const val = document.createElement("input");
      val.type = "number";
      val.className = "ending-param-val";
      val.min = def.min;
      val.max = def.max;
      val.step = def.step;
      val.value = Number(ending[def.key]).toFixed(2);

      input.addEventListener("input", () => {
        ending[def.key] = Number(input.value);
        val.value = ending[def.key].toFixed(2);
        valuesSpan.textContent = formatEndingSummary(ending);
        saveProfileEndings(profileIndex, list);
      });

      val.addEventListener("change", () => {
        let v = Number(val.value);
        if (Number.isNaN(v)) v = ending[def.key];
        v = Math.min(def.max, Math.max(def.min, v));
        ending[def.key] = v;
        val.value = v.toFixed(2);
        input.value = v;
        valuesSpan.textContent = formatEndingSummary(ending);
        saveProfileEndings(profileIndex, list);
      });

      paramRow.append(label, input, val);
      detail.appendChild(paramRow);
    }

    summary.addEventListener("click", () => {
      const willOpen = detail.hidden;
      detail.hidden = !willOpen;
      row.classList.toggle("open", willOpen);
    });

    row.append(summary, hotkeyRefs, detail);
    container.appendChild(row);
  });
}

function setupEndingsPanel() {
  renderGeneralEndingsList();
}

function setupTemplatesPanel() {
  renderVrKeyboardTemplatesList();
}

// Settings > Other's pronunciation dictionary (see lib.rs's
// list_pronunciation_words/add_pronunciation_word/remove_pronunciation_word)
// — a thin UI over VOICEVOX's own OpenJtalk::use_user_dict mechanism, for
// fixing a specific word/phrase OpenJTalk's rule-based reading gets wrong
// (e.g. reading は as the わ topic-particle sound where that's not actually
// what's meant). Unlike the ending/template lists above, this isn't
// localStorage-backed — the word list lives in Rust (persisted alongside
// the VOICEVOX models) since it has to be loaded into the actual
// OpenJtalk analyzer, not just displayed.
async function renderPronunciationDictList() {
  const list = document.querySelector("#pronunciation-dict-list");
  if (!list) return;
  let words;
  try {
    words = await window.__TAURI__.core.invoke("list_pronunciation_words");
  } catch (err) {
    log(`[pronunciation-dict] ${err}`);
    return;
  }
  list.innerHTML = "";
  for (const word of words) {
    const row = document.createElement("div");
    row.className = "settings-list-row";

    const surfaceEl = document.createElement("span");
    surfaceEl.className = "settings-list-label";
    surfaceEl.textContent = word.surface;

    const readingEl = document.createElement("span");
    readingEl.textContent = word.pronunciation;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "link-btn";
    removeBtn.textContent = "✕";
    removeBtn.setAttribute("aria-label", t("pronunciationDictRemoveAriaLabel"));
    removeBtn.addEventListener("click", async () => {
      try {
        await window.__TAURI__.core.invoke("remove_pronunciation_word", { id: word.id });
        renderPronunciationDictList();
      } catch (err) {
        log(`[pronunciation-dict] ${err}`);
      }
    });

    row.append(surfaceEl, readingEl, removeBtn);
    list.append(row);
  }
}

function setupPronunciationDict() {
  const surfaceInput = document.querySelector("#pronunciation-dict-surface");
  const readingInput = document.querySelector("#pronunciation-dict-reading");
  const addBtn = document.querySelector("#pronunciation-dict-add-btn");
  const errorEl = document.querySelector("#pronunciation-dict-error");
  surfaceInput.placeholder = t("pronunciationDictSurfacePlaceholder");
  readingInput.placeholder = t("pronunciationDictReadingPlaceholder");

  addBtn.addEventListener("click", async () => {
    const surface = surfaceInput.value.trim();
    const pronunciation = readingInput.value.trim();
    if (!surface || !pronunciation) return;
    errorEl.hidden = true;
    try {
      await window.__TAURI__.core.invoke("add_pronunciation_word", { surface, pronunciation });
      surfaceInput.value = "";
      readingInput.value = "";
      renderPronunciationDictList();
    } catch (err) {
      // Rust's own validation error (voicevox_core's own message, e.g.
      // "カタカナ以外の文字") is already specific enough to act on directly —
      // shown as-is rather than mapped through a second translation layer.
      errorEl.textContent = String(err);
      errorEl.hidden = false;
    }
  });

  renderPronunciationDictList();
}

const PRESET_TYPE = "mutelink-preset";
const PRESET_VERSION = 1;

// Bundles endings + hotkey assignments (plus the couple of settings that
// shape how they're used — hold duration, priority hand) into one shareable
// object. Hotkeys reference endings by slot number (see ENDINGS_SLOT_COUNT),
// so the two only make sense shared together, not separately.
function buildPresetObject() {
  return {
    type: PRESET_TYPE,
    version: PRESET_VERSION,
    endings,
    hotkeyAssignments: loadHotkeyAssignments(),
    hotkeyHoldMs: loadHotkeyHoldMs(),
    hotkeyPriorityHand: loadHotkeyPriorityHand(),
  };
}

// Pure parse + validate — throws on anything that isn't a recognizable
// preset, without touching any stored state. Kept separate from actually
// committing it so the caller can confirm with the user first.
function parsePresetJson(text) {
  const preset = JSON.parse(text);
  if (!preset || preset.type !== PRESET_TYPE || !Array.isArray(preset.endings)) {
    throw new Error("not a Mutelink preset");
  }
  if (!preset.endings.every((e) => typeof e?.text === "string")) {
    throw new Error("invalid endings in preset");
  }
  return preset;
}

// Writes a validated preset to storage — same slot-count normalization as
// loadEndings(), and hotkeyAssignments/hold/priority are only applied if
// present and well-formed (loadHotkeyAssignments() already merges partial
// data with defaults, so a partial preset degrades gracefully rather than
// erroring). Caller is expected to reload the page afterward so every
// already-rendered view (main screen, endings list, hotkey dropdowns) picks
// the new state up consistently, the same way "reset all settings" does.
function commitPreset(preset) {
  const normalized = preset.endings.slice(0, ENDINGS_SLOT_COUNT);
  while (normalized.length < ENDINGS_SLOT_COUNT) {
    normalized.push({ text: `語尾${normalized.length + 1}`, ...DEFAULT_ENDING_PARAMS });
  }
  saveEndings(normalized);

  if (preset.hotkeyAssignments && typeof preset.hotkeyAssignments === "object") {
    saveHotkeyAssignments(preset.hotkeyAssignments);
  }
  if (Number.isFinite(preset.hotkeyHoldMs) && preset.hotkeyHoldMs > 0) {
    saveHotkeyHoldMs(preset.hotkeyHoldMs);
  }
  if (preset.hotkeyPriorityHand === "left" || preset.hotkeyPriorityHand === "right") {
    saveHotkeyPriorityHand(preset.hotkeyPriorityHand);
  }
}

function setupPresetPanel() {
  const textarea = document.querySelector("#preset-json-area");
  const statusEl = document.querySelector("#preset-status");

  document.querySelector("#preset-copy-btn").addEventListener("click", async () => {
    const json = JSON.stringify(buildPresetObject(), null, 2);
    textarea.value = json;
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      // Clipboard permission can be denied in some contexts — the JSON is
      // still right there in the textarea to copy by hand either way.
    }
    statusEl.textContent = t("presetCopiedStatus");
  });

  document.querySelector("#preset-load-btn").addEventListener("click", async () => {
    let preset;
    try {
      preset = parsePresetJson(textarea.value);
    } catch (err) {
      statusEl.textContent = t("presetInvalidStatus");
      log(`[preset] invalid JSON: ${err}`);
      return;
    }
    const ok = await showConfirmDialog(t("presetLoadConfirm"));
    if (!ok) return;
    commitPreset(preset);
    statusEl.textContent = t("presetLoadedStatus");
    location.reload();
  });
}

// In-app replacement for window.confirm(), styled to match the settings
// dialog (native browser confirm() looks out of place next to it).
function showConfirmDialog(message) {
  const dialog = document.querySelector("#confirm-dialog");
  const okBtn = document.querySelector("#confirm-dialog-ok");
  const cancelBtn = document.querySelector("#confirm-dialog-cancel");
  document.querySelector("#confirm-dialog-message").textContent = message;

  return new Promise((resolve) => {
    const finish = (result) => {
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      dialog.removeEventListener("click", onBackdrop);
      dialog.removeEventListener("cancel", onCancelEvent);
      dialog.close();
      resolve(result);
    };
    const onOk = () => finish(true);
    const onCancel = () => finish(false);
    const onCancelEvent = (event) => {
      event.preventDefault();
      finish(false);
    };
    const onBackdrop = (event) => {
      if (event.target === dialog) finish(false);
    };

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    dialog.addEventListener("cancel", onCancelEvent);
    dialog.addEventListener("click", onBackdrop);
    dialog.showModal();
  });
}

const DEFAULT_STYLE_ID = 46; // 小夜/SAYO ノーマル, the character bundled with the app

// Which character speaks is profile-scoped (see the Profile system further
// down) — reads/writes the *active* profile's own styleId, same pattern as
// loadHotkeyAssignments/loadEndings/loadVrKeyboardTemplates below.
function loadSelectedStyleId() {
  return getActiveProfile().styleId;
}

function saveSelectedStyleId(id) {
  updateActiveProfile((p) => ({ ...p, styleId: id }));
}

// Read by speak() on every synthesis call, so switching the character in
// General settings takes effect immediately without needing a restart.
function getSelectedStyleId() {
  return loadSelectedStyleId();
}

function findStyleLabel(catalog, styleId) {
  for (const entry of catalog) {
    for (const character of entry.characters) {
      const style = character.styles.find((s) => s.id === styleId);
      if (style) return `${character.name}(${style.name})`;
    }
  }
  return null;
}

// Characters are downloaded per-VVM-file on demand (some VVMs bundle more
// than one character) via the Rust-side download_character/load_character
// commands, which shell out to the same download.exe used for the initial
// SAYO model. The catalog itself is parsed server-side from the VVM/style
// table VOICEVOX ships in models/README.txt, so it stays in sync with
// whatever's actually downloadable without us hand-maintaining a list here.
async function setupCharacterPanel() {
  const listEl = document.querySelector("#character-catalog-list");
  const labelEl = document.querySelector("#current-character-label");
  labelEl.textContent = t("loading");

  let catalog;
  try {
    catalog = await window.__TAURI__.core.invoke("character_catalog");
  } catch (err) {
    listEl.textContent = `${t("characterLoadFailedPrefix")}${err}`;
    return;
  }

  function updateLabel() {
    const label = findStyleLabel(catalog, loadSelectedStyleId());
    labelEl.textContent = `${t("currentVoicePrefix")}${label || t("currentVoiceUnset")}`;
  }

  // One VVM file can bundle several characters (they're downloaded and
  // loaded together, there's no way to fetch just one), but the list is
  // still one row per *character* — each gets its own add button, and
  // adding any of them refreshes every row that shares the same VVM.
  const refreshersByEntry = new Map();

  listEl.innerHTML = "";
  for (const entry of catalog) {
    refreshersByEntry.set(entry, []);

    for (const character of entry.characters) {
      const row = document.createElement("div");
      row.className = "ending-settings-row";

      const summary = document.createElement("button");
      summary.type = "button";
      summary.className = "ending-settings-summary";

      const textSpan = document.createElement("span");
      textSpan.className = "ending-settings-text";
      textSpan.textContent = character.name;

      const valuesSpan = document.createElement("span");
      valuesSpan.className = "ending-settings-values";

      const chevron = document.createElement("span");
      chevron.className = "ending-settings-chevron";
      chevron.textContent = "▾";

      summary.append(textSpan, valuesSpan, chevron);

      const detail = document.createElement("div");
      detail.className = "ending-settings-detail";
      detail.hidden = true;

      function renderDetail() {
        valuesSpan.textContent = t(entry.downloaded ? "downloaded" : "notDownloaded");
        detail.innerHTML = "";

        if (entry.downloaded) {
          const styleList = document.createElement("div");
          styleList.className = "character-style-list";
          for (const style of character.styles) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "character-style-btn";
            btn.textContent = style.name;
            btn.classList.toggle("active", style.id === loadSelectedStyleId());
            btn.addEventListener("click", () => {
              saveSelectedStyleId(style.id);
              updateLabel();
              for (const b of styleList.querySelectorAll(".character-style-btn")) b.classList.remove("active");
              btn.classList.add("active");
            });
            styleList.appendChild(btn);
          }
          detail.appendChild(styleList);
        } else {
          const addRow = document.createElement("div");
          addRow.className = "character-add-row";

          const hint = document.createElement("span");
          hint.className = "character-add-hint";
          const siblings = entry.characters.filter((c) => c !== character).map((c) => c.name);
          hint.textContent =
            siblings.length > 0
              ? `${t("addSiblingsHintPrefix")}${siblings.join("、")}`
              : t("addAloneHint");

          const addBtn = document.createElement("button");
          addBtn.type = "button";
          addBtn.textContent = t("addButton");
          addBtn.addEventListener("click", async () => {
            addBtn.disabled = true;
            addBtn.textContent = t("downloadingButton");
            try {
              await window.__TAURI__.core.invoke("download_character", { vvmFile: entry.vvmFile });
              await window.__TAURI__.core.invoke("load_character", { vvmFile: entry.vvmFile });
              entry.downloaded = true;
              for (const refresh of refreshersByEntry.get(entry)) refresh();
            } catch (err) {
              addBtn.disabled = false;
              addBtn.textContent = t("addButton");
              log(`[character] download failed: ${err}`);
            }
          });

          addRow.append(hint, addBtn);
          detail.appendChild(addRow);
        }
      }

      renderDetail();
      refreshersByEntry.get(entry).push(renderDetail);

      summary.addEventListener("click", () => {
        const willOpen = detail.hidden;
        detail.hidden = !willOpen;
        row.classList.toggle("open", willOpen);
      });

      row.append(summary, detail);
      listEl.appendChild(row);
    }
  }

  updateLabel();
}

// Every localStorage key this app writes EXCEPT the ones deliberately left
// out below — kept as one explicit list (built lazily inside the click
// handler below, not at module scope: several of these *_KEY consts are
// declared further down in the file, and referencing them from a top-level
// const array evaluated immediately at load time hits the temporal dead
// zone) so a genuinely unrelated key some future feature adds isn't
// silently wiped by default. Add new settings keys here as they're
// introduced.
//
// Deliberately NOT included (survive a reset):
// - DEVICE_SETTINGS_KEY — mic/speaker selection, tied to this specific PC's
//   hardware, not a "preference" a reset should touch.
// - UI_LANG_KEY — the UI's display language; resetting it would flip the
//   whole Settings dialog to Japanese for a non-Japanese-reading user.
// - UI_MODE_KEY — Desktop vs VR mode; in practice tracks whether *this* PC
//   currently has SteamVR set up, which is closer to machine-specific than
//   a preference.
function resetClearsKeys() {
  return [
    PROFILES_KEY,
    PROFILE_COUNT_KEY,
    ACTIVE_PROFILE_KEY,
    HOTKEY_HOLD_DURATION_KEY,
    HOTKEY_PRIORITY_HAND_KEY,
    APPEARANCE_STORAGE_KEY,
    CHATBOX_ENABLED_KEY,
    TTS_ENABLED_KEY,
    SEND_MODE_KEY,
    STT_ENGINE_KEY,
    STT_MODEL_KEY,
    STT_INTERIM_PREVIEW_KEY,
    TTS_LANG_ENABLED_KEY,
    STT_CYCLE_LANG_KEY,
    VOICE_RMS_THRESHOLD_KEY,
    HOTKEY_ACTIVE_DURING_KEYBOARD_KEY,
    VR_KEYBOARD_AUTO_CLOSE_ON_SEND_KEY,
    VR_KEYBOARD_POSITION_MODE_KEY,
  ];
}

function setupGeneralPanel() {
  document.querySelector("#settings-reset-btn").addEventListener("click", async () => {
    const ok = await showConfirmDialog(t("resetConfirm"));
    if (!ok) return;
    for (const key of resetClearsKeys()) localStorage.removeItem(key);
    location.reload();
  });
}

// Was 50 — this is also where the VR keyboard's trigger release commits a
// flick (see processVrKeyboardTrigger), so its interval directly bounds
// how long a flick sits "done" before it's actually applied. The round
// trip here is cheap (just reads live OpenVR controller state, no
// rasterization/GPU work — unlike the render loop below), so tightening it
// doesn't cost much. HOTKEY_DEBOUNCE_MS below is a wall-clock duration
// threshold (Date.now()-based), not a tick count, so it stays meaningful
// at any poll rate.
const HOTKEY_POLL_MS = 20;
// "stick" (short press) and "stickLong" are two independent slots sharing
// one physical control — see processStickPress for why that needs its own
// dispatch, separate from how the other 4 slots fire (processHandHotkey).
// "gripDouble"/"triggerDouble" are the same idea applied to grip/trigger —
// see processDoubleClick — independent of (and can coexist with) their
// plain grip/trigger hold-based counterparts.
// "aDouble" — a double-click of the lower face button ("A"/"X", see
// leftAWasPressed's own comment) — reuses the exact same double-click
// machinery as gripDouble/triggerDouble (see processDoubleClick), even
// though that button's *single* press isn't part of this assignment system
// at all (it's hardcoded to cycleSttState/handleCyclePress). The two don't
// fight over a fast double-press: handleCyclePress already delays its own
// single-press action by CYCLE_DOUBLE_PRESS_MS and cancels it outright if a
// second press follows within that window (built for the exact same
// XSOverlay double-press conflict), so a double-click here fires this
// assignment with the language cycle left untouched.
const HOTKEY_SLOTS = ["both", "grip", "gripDouble", "trigger", "triggerDouble", "aDouble", "none", "stick", "stickLong"];
// Map to I18N keys, not translated text directly, so hotkeyRefsForEndingSlot()
// (and anywhere else) always reflects the *current* uiLang via t() rather
// than whatever language was active when this module evaluated.
const HOTKEY_SLOT_LABEL_KEYS = {
  both: "slotBoth",
  grip: "slotGrip",
  gripDouble: "slotGripDouble",
  trigger: "slotTrigger",
  triggerDouble: "slotTriggerDouble",
  aDouble: "slotADouble",
  none: "slotNone",
  stick: "slotStick",
  stickLong: "slotStickLong",
};
const HOTKEY_HAND_LABEL_KEYS = { right: "handRight", left: "handLeft" };
// Sentinel assignment value meaning "discard the pending text", alongside
// the ending *slot numbers* ("1"-"10", see ENDINGS_SLOT_COUNT) a hotkey
// slot can otherwise be assigned to.
const HOTKEY_CANCEL_ACTION = "__cancel__";
// Sentinel for "open/close the VR keyboard" — used to be hardcoded to the
// right stick regardless of this assignment table; now just another
// selectable value like HOTKEY_CANCEL_ACTION, assignable to any slot
// including either half of the stick's short/long split (see
// processStickPress) — e.g. the default pairs it with HOTKEY_CANCEL_ACTION
// on the same stick, short press opens/closes the keyboard, long press
// clears whatever's pending.
const HOTKEY_KEYBOARD_TOGGLE_ACTION = "__keyboard__";

// Resolves a stored assignment value (a slot-number string, the cancel
// sentinel, or "") to the actual ending object it currently points at —
// null for cancel/unset, or if the number is somehow out of range.
function endingForAssignment(assignment) {
  if (!assignment || assignment === HOTKEY_CANCEL_ACTION) return null;
  return endings[Number(assignment) - 1] ?? null;
}

const HOTKEY_HOLD_DURATION_KEY = "mutelink.hotkeyHoldMs";
const DEFAULT_HOTKEY_HOLD_MS = 300;

function loadHotkeyHoldMs() {
  // See loadVoiceRmsThreshold()'s comment — same "missing key vs.
  // deliberately-saved 0" distinction, needed now that the slider's min is
  // 0 (see index.html).
  const stored = localStorage.getItem(HOTKEY_HOLD_DURATION_KEY);
  if (stored === null) return DEFAULT_HOTKEY_HOLD_MS;
  const raw = Number(stored);
  return Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_HOTKEY_HOLD_MS;
}

function saveHotkeyHoldMs(ms) {
  localStorage.setItem(HOTKEY_HOLD_DURATION_KEY, String(ms));
}

// Whether the grip/trigger *hold* slots (processHandHotkey) stay active
// while the VR keyboard is open — off by default, matching the original
// design (the keyboard's own send button/stick-press/double-click own
// confirming text while it's up, so the hold-based flow racing it would be
// surprising by default). The stick and double-click slots were always
// active regardless of this — only the hold-based combo slots (both/grip/
// trigger/none) were ever suppressed, see the poll loop's own comment.
const HOTKEY_ACTIVE_DURING_KEYBOARD_KEY = "mutelink.hotkeyActiveDuringKeyboard";

function loadHotkeyActiveDuringKeyboard() {
  return localStorage.getItem(HOTKEY_ACTIVE_DURING_KEYBOARD_KEY) === "true";
}

function saveHotkeyActiveDuringKeyboard(value) {
  localStorage.setItem(HOTKEY_ACTIVE_DURING_KEYBOARD_KEY, String(value));
}

// Whether selecting a 語尾 from the VR keyboard's own on-screen row (see
// applyVrKeyboardAction's "ending" case) closes the keyboard afterward —
// on by default, matching the original design. Turning it off keeps
// typing right where it left off after a quick ending-send mid-edit,
// instead of needing to reopen the keyboard for the next line.
const VR_KEYBOARD_AUTO_CLOSE_ON_SEND_KEY = "mutelink.vrKeyboardAutoCloseOnSend";

function loadVrKeyboardAutoCloseOnSend() {
  const raw = localStorage.getItem(VR_KEYBOARD_AUTO_CLOSE_ON_SEND_KEY);
  return raw === null ? true : raw === "true";
}

function saveVrKeyboardAutoCloseOnSend(value) {
  localStorage.setItem(VR_KEYBOARD_AUTO_CLOSE_ON_SEND_KEY, String(value));
}

// Where the VR keyboard panel lives: "centered" (default, the original
// behavior — HMD-relative, always in front of wherever you look) or "fixed"
// (placed in front of the head at the moment it opens, then stays put in the
// room and can be grabbed/moved with grip — see processKeyboardGrab). Only
// the setting lives here; lib.rs's KeyboardPlacement does the actual
// transform handling, driven by this value on every update_keyboard_overlay
// call (so a change applies immediately, even with the keyboard open).
const VR_KEYBOARD_POSITION_MODE_KEY = "mutelink.vrKeyboardPositionMode";
const VR_KEYBOARD_POSITION_MODES = ["centered", "fixed"];

function loadVrKeyboardPositionMode() {
  const raw = localStorage.getItem(VR_KEYBOARD_POSITION_MODE_KEY);
  return VR_KEYBOARD_POSITION_MODES.includes(raw) ? raw : "centered";
}

function saveVrKeyboardPositionMode(mode) {
  localStorage.setItem(VR_KEYBOARD_POSITION_MODE_KEY, mode);
}

// Both hands act independently now (each can be bound to a different
// ending), but only one hand's hold can be shown on the overlay at once —
// this picks which one wins when both happen to be mid-hold simultaneously.
const HOTKEY_PRIORITY_HAND_KEY = "mutelink.hotkeyPriorityHand";

function loadHotkeyPriorityHand() {
  return localStorage.getItem(HOTKEY_PRIORITY_HAND_KEY) === "left" ? "left" : "right";
}

function saveHotkeyPriorityHand(hand) {
  localStorage.setItem(HOTKEY_PRIORITY_HAND_KEY, hand);
}

const HOTKEY_HANDS = ["right", "left"];

// Assignments are stored by ending slot number (not text) so editing what's
// in a slot — see 語尾 settings — updates any hotkey pointing at that number
// immediately, without needing to be re-picked here. Separate per hand so
// each hand can be bound to a different slot, and the two hands' defaults
// differ deliberately: right hand gives quick access to 1/2, plus its
// trigger double-clicked toggles the VR keyboard and stick short-pressed
// clears whatever's pending (see HOTKEY_KEYBOARD_TOGGLE_ACTION/
// HOTKEY_CANCEL_ACTION — the keyboard toggle used to be hardcoded to
// right-stick rather than a real assignment before double-click existed;
// moving it to double-click freed the stick back up, so cancel moved from
// stick's long press to its short one — a long press was reported as
// uncomfortably slow to trigger deliberately); left hand covers 4/5/10 plus
// a stick-press cancel (ending 3 left unset), and its lower face button
// ("A"/"X", see leftAWasPressed) double-clicked *also* toggles the keyboard
// — a second, off-hand way to reach it, on the same button that already
// single-clicks to cycle the STT language (handleCyclePress). The two don't
// fight over a fast double-click: handleCyclePress already cancels its own
// pending single-press cycle outright if a second press follows within
// CYCLE_DOUBLE_PRESS_MS (built for the unrelated XSOverlay double-press
// conflict on this exact button), so a double-click here fires the keyboard
// toggle with the language left untouched, and a genuine single click still
// cycles it same as always.
function defaultHotkeyAssignments() {
  return {
    right: {
      both: "1",
      grip: "",
      gripDouble: "",
      trigger: "2",
      triggerDouble: HOTKEY_KEYBOARD_TOGGLE_ACTION,
      aDouble: "",
      none: "",
      stick: HOTKEY_CANCEL_ACTION,
      stickLong: "",
    },
    left: {
      both: "10",
      grip: "4",
      gripDouble: "",
      trigger: "5",
      triggerDouble: "",
      aDouble: HOTKEY_KEYBOARD_TOGGLE_ACTION,
      none: "",
      stick: HOTKEY_CANCEL_ACTION,
      stickLong: "",
    },
  };
}

// ---- Profiles ----------------------------------------------------------
// A Profile bundles everything that makes sense to swap as a set when a
// game/world takes over a controller button, or just to have a separate
// "voice + endings + templates + hotkeys" setup ready to switch to: the
// speaking character, 語尾 (endings), VR keyboard templates, and hotkey
// hand/slot assignments. General/Device/Appearance stay single global
// settings, not profiled — they're either machine-specific (device) or not
// something anyone asked to swap per-profile. Managed centrally from the
// new プロファイル settings panel (setupProfilePanel/renderProfileMenuList);
// the four bundled settings' own panels (キャラクター/語尾/テンプレート/
// Hotkey) are untouched and keep editing "whichever profile is active" the
// same way the Hotkey panel already did before this existed.
const PROFILE_COUNT_KEY = "mutelink.profileCount";
const ACTIVE_PROFILE_KEY = "mutelink.activeProfile";
const PROFILES_KEY = "mutelink.profiles";
const MIN_PROFILE_COUNT = 1;
const MAX_PROFILE_COUNT = 5;
// Matches the old fixed HOTKEY_PROFILE_COUNT this replaced, so an upgrading
// install's profile count doesn't change on its own (see
// migrateLegacyProfileDataIfNeeded) and a fresh install's default is the
// same "3 ready-to-go slots" it always was.
const DEFAULT_PROFILE_COUNT = 3;

function defaultProfile() {
  return {
    hotkey: defaultHotkeyAssignments(),
    styleId: DEFAULT_STYLE_ID,
    // .map(e => ({...e})) — fresh copies, not references into DEFAULT_ENDINGS
    // itself, since renderGeneralEndingsList mutates ending objects in place.
    endings: DEFAULT_ENDINGS.map((e) => ({ ...e })),
    templates: Array.from({ length: VR_KEYBOARD_TEMPLATE_SLOT_COUNT }, () => ""),
  };
}

// Same fixed-slot-count padding/truncation loadEndings/loadVrKeyboardTemplates
// used to do directly — factored out since every profile now needs it
// independently (loadProfiles below, and the migration path).
function normalizeEndingsList(list) {
  const out = list.slice(0, ENDINGS_SLOT_COUNT);
  while (out.length < ENDINGS_SLOT_COUNT) out.push({ text: `語尾${out.length + 1}`, ...DEFAULT_ENDING_PARAMS });
  return out;
}

function normalizeTemplatesList(list) {
  const out = list.slice(0, VR_KEYBOARD_TEMPLATE_SLOT_COUNT).map((v) => (typeof v === "string" ? v : ""));
  while (out.length < VR_KEYBOARD_TEMPLATE_SLOT_COUNT) out.push("");
  return out;
}

function loadProfileCount() {
  const raw = Number(localStorage.getItem(PROFILE_COUNT_KEY));
  return Number.isInteger(raw) && raw >= MIN_PROFILE_COUNT && raw <= MAX_PROFILE_COUNT ? raw : DEFAULT_PROFILE_COUNT;
}

function saveProfileCount(count) {
  localStorage.setItem(PROFILE_COUNT_KEY, String(count));
}

function loadActiveProfileIndex() {
  const raw = Number(localStorage.getItem(ACTIVE_PROFILE_KEY));
  const count = loadProfileCount();
  return Number.isInteger(raw) && raw >= 0 && raw < count ? raw : 0;
}

function saveActiveProfileIndex(index) {
  localStorage.setItem(ACTIVE_PROFILE_KEY, String(index));
}

function mergeProfile(def, saved) {
  if (!saved || typeof saved !== "object") return def;
  const savedEndings = Array.isArray(saved.endings) && saved.endings.every((e) => typeof e?.text === "string") ? saved.endings : def.endings;
  return {
    hotkey: {
      right: { ...def.hotkey.right, ...saved.hotkey?.right },
      left: { ...def.hotkey.left, ...saved.hotkey?.left },
    },
    styleId: Number.isFinite(saved.styleId) ? saved.styleId : def.styleId,
    endings: normalizeEndingsList(savedEndings),
    templates: normalizeTemplatesList(Array.isArray(saved.templates) ? saved.templates : def.templates),
  };
}

// Cached in memory, invalidated only by saveProfiles/a profile-count change
// (both go through saveProfiles) — loadHotkeyAssignments() reads through
// here on every hotkey poll tick (setupHotkeys()'s ~50Hz loop), and a full
// JSON.parse of every profile's endings/templates on every tick would be
// wasteful busywork a plain hotkey-only profile object never needed.
let profilesCache = null;

function loadProfiles() {
  if (profilesCache) return profilesCache;
  const count = loadProfileCount();
  const defaults = Array.from({ length: count }, () => defaultProfile());
  try {
    const raw = JSON.parse(localStorage.getItem(PROFILES_KEY) ?? "null");
    if (Array.isArray(raw)) {
      profilesCache = defaults.map((def, i) => mergeProfile(def, raw[i]));
      return profilesCache;
    }
  } catch {
    // fall through
  }
  profilesCache = defaults;
  return profilesCache;
}

function saveProfiles(profiles) {
  profilesCache = profiles;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function getActiveProfile() {
  return loadProfiles()[loadActiveProfileIndex()];
}

function updateProfileAt(index, updater) {
  const profiles = loadProfiles();
  profiles[index] = updater(profiles[index]);
  saveProfiles(profiles);
}

function updateActiveProfile(updater) {
  updateProfileAt(loadActiveProfileIndex(), updater);
}

// Reads/writes only the *active* profile's hand/slot assignments — every
// existing caller (renderHotkeyAssignmentOptions, the poll loop,
// buildPresetObject, etc.) keeps working unchanged.
function loadHotkeyAssignments() {
  return getActiveProfile().hotkey;
}

function saveHotkeyAssignments(assignments) {
  updateActiveProfile((p) => ({ ...p, hotkey: assignments }));
}

// The three pre-Profile localStorage keys this replaced — endings/character
// were single global values, and hotkey assignments were the only thing
// already profiled (fixed at 3). Referenced *only* from
// migrateLegacyProfileDataIfNeeded below; everything else now goes through
// getActiveProfile()/updateActiveProfile() above.
const LEGACY_ENDINGS_KEY = "mutelink.endings";
const LEGACY_TEMPLATES_KEY = "mutelink.vrKeyboardTemplates";
const LEGACY_SELECTED_STYLE_KEY = "mutelink.selectedStyleId";
const LEGACY_HOTKEY_PROFILES_KEY = "mutelink.hotkeyProfiles";
const LEGACY_HOTKEY_ACTIVE_PROFILE_KEY = "mutelink.activeHotkeyProfile";

// One-time upgrade from the pre-Profile layout: a single global endings/
// character/templates, plus a separate, hotkey-only profile system fixed at
// 3 slots. Runs once (guarded by PROFILES_KEY's own presence) before
// anything else touches profile data — every profile starts out with
// whatever the single old global endings/character/templates used to be
// (only hotkey assignments actually varied per profile before), so an
// upgrading install behaves identically until the user intentionally
// diverges a profile via the new Profile menu. Must run before any
// setup*() call that reads endings/character/templates/hotkey assignments.
function migrateLegacyProfileDataIfNeeded() {
  if (localStorage.getItem(PROFILES_KEY) !== null) return;

  let legacyEndings = DEFAULT_ENDINGS;
  try {
    const raw = JSON.parse(localStorage.getItem(LEGACY_ENDINGS_KEY) ?? "null");
    if (Array.isArray(raw) && raw.length > 0 && raw.every((e) => typeof e?.text === "string")) legacyEndings = raw;
  } catch {
    // fall through to defaults
  }

  let legacyTemplates = [];
  try {
    const raw = JSON.parse(localStorage.getItem(LEGACY_TEMPLATES_KEY) ?? "null");
    if (Array.isArray(raw)) legacyTemplates = raw.map((v) => (typeof v === "string" ? v : ""));
  } catch {
    // fall through to empty
  }

  const legacyStyleRaw = localStorage.getItem(LEGACY_SELECTED_STYLE_KEY);
  const legacyStyleId = legacyStyleRaw !== null && Number.isFinite(Number(legacyStyleRaw)) ? Number(legacyStyleRaw) : DEFAULT_STYLE_ID;

  let legacyHotkeyProfiles = [];
  try {
    const raw = JSON.parse(localStorage.getItem(LEGACY_HOTKEY_PROFILES_KEY) ?? "null");
    if (Array.isArray(raw)) legacyHotkeyProfiles = raw;
  } catch {
    // fall through to empty
  }
  const legacyActiveRaw = Number(localStorage.getItem(LEGACY_HOTKEY_ACTIVE_PROFILE_KEY));
  const legacyActiveIndex = Number.isInteger(legacyActiveRaw) && legacyActiveRaw >= 0 ? legacyActiveRaw : 0;

  const count = Math.max(MIN_PROFILE_COUNT, Math.min(MAX_PROFILE_COUNT, legacyHotkeyProfiles.length || DEFAULT_PROFILE_COUNT));
  saveProfileCount(count);

  const defaultHotkey = defaultHotkeyAssignments();
  const profiles = Array.from({ length: count }, (_, i) => ({
    hotkey: {
      right: { ...defaultHotkey.right, ...legacyHotkeyProfiles[i]?.right },
      left: { ...defaultHotkey.left, ...legacyHotkeyProfiles[i]?.left },
    },
    styleId: legacyStyleId,
    endings: normalizeEndingsList(legacyEndings.map((e) => ({ ...e }))),
    templates: normalizeTemplatesList([...legacyTemplates]),
  }));
  saveProfiles(profiles);
  saveActiveProfileIndex(Math.min(legacyActiveIndex, count - 1));
}

// The single entry point for changing which profile is active — re-reads
// every profile-scoped setting from the newly active profile and refreshes
// every view of it (main-screen ending tiles + P button, settings' endings/
// templates/hotkey-dropdown lists, the character panel, the Profile menu's
// own list), no matter which control triggered the switch. Mirrors
// applyUiLang's "switch, then refresh everything that shows it" shape.
function setActiveProfileIndex(index) {
  saveActiveProfileIndex(index);

  endings = loadEndings();
  renderEndingButtons(document.querySelector("#ending-buttons"), endings, applyEnding);
  renderGeneralEndingsList();

  renderHotkeyAssignmentOptions();
  renderVrKeyboardTemplatesList();
  setupCharacterPanel();

  const mainBtn = document.querySelector("#hotkey-profile-btn");
  if (mainBtn) mainBtn.textContent = `P${index + 1}`;
  renderProfileMenuList();
}

// Grows/shrinks the saved profile list to match, padding new slots with
// defaultProfile() and truncating extras — shrinking permanently discards
// whatever was in the dropped slots (the caller, setupProfilePanel, confirms
// with the user first when shrinking). Re-routes through
// setActiveProfileIndex if the active index no longer exists post-shrink,
// since that's the one function that knows how to refresh every view.
function setProfileCount(newCount) {
  const clamped = Math.min(MAX_PROFILE_COUNT, Math.max(MIN_PROFILE_COUNT, newCount));
  const current = loadProfiles();
  saveProfileCount(clamped);
  const profiles = current.slice(0, clamped);
  while (profiles.length < clamped) profiles.push(defaultProfile());
  saveProfiles(profiles);

  const activeIndex = loadActiveProfileIndex();
  if (activeIndex >= clamped) {
    setActiveProfileIndex(clamped - 1);
  } else {
    renderProfileMenuList();
  }
}

// In-memory only (not persisted) — a "copy" survives until the next "paste"
// or app restart, same expectation as a system clipboard, not something
// meant to be a durable saved slot of its own.
let profileClipboard = null;

// One row per configured profile: which one is active (radio, replacing the
// old Hotkey-panel-only radio group), copy/paste, and an expandable detail
// (matching the ending-settings-row pattern used elsewhere) holding its own
// full copy of every panel a profile actually bundles — キャラクター (a
// plain dropdown of already-*installed* styles, not the キャラクター panel's
// own expandable-list-with-download-buttons UI, which would be far too tall
// repeated once per profile here), 語尾, テンプレート, and ホットキー — since
// what a profile actually holds wasn't otherwise visible anywhere but those
// separate panels' own always-active-profile-only view. Character catalog
// is fetched once per render and shared across every row rather than once
// per row, since they'd all show the exact same installed-styles list
// anyway.
async function renderProfileMenuList() {
  const list = document.querySelector("#profile-list");
  if (!list) return;

  let catalog = [];
  try {
    catalog = await window.__TAURI__.core.invoke("character_catalog");
  } catch (err) {
    log(`[profile] ${err}`);
  }
  const installedStyles = catalog
    .filter((entry) => entry.downloaded)
    .flatMap((entry) => entry.characters.flatMap((character) => character.styles.map((style) => ({ id: style.id, label: `${character.name}(${style.name})` }))));

  const count = loadProfileCount();
  const profiles = loadProfiles();
  const activeIndex = loadActiveProfileIndex();

  list.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const profile = profiles[i];
    const row = document.createElement("div");
    row.className = "ending-settings-row profile-row";

    const header = document.createElement("div");
    header.className = "profile-row-header";

    const radioLabel = document.createElement("label");
    radioLabel.className = "profile-row-select";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "active-profile";
    radio.value = String(i);
    radio.checked = i === activeIndex;
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      setActiveProfileIndex(i);
    });
    radioLabel.append(radio, document.createTextNode(` P${i + 1}`));

    const summary = document.createElement("button");
    summary.type = "button";
    summary.className = "profile-row-summary";
    const chevron = document.createElement("span");
    chevron.className = "ending-settings-chevron";
    chevron.textContent = "▾";
    summary.append(document.createTextNode(t("profileDetailsButton")), chevron);

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "profile-copy-btn";
    copyBtn.textContent = t("profileCopyButton");
    copyBtn.addEventListener("click", () => {
      profileClipboard = JSON.parse(JSON.stringify(profile));
      renderProfileMenuList(); // every row's paste button needs to become enabled
    });

    const pasteBtn = document.createElement("button");
    pasteBtn.type = "button";
    pasteBtn.className = "profile-paste-btn";
    pasteBtn.textContent = t("profilePasteButton");
    pasteBtn.disabled = !profileClipboard;
    pasteBtn.addEventListener("click", () => {
      if (!profileClipboard) return;
      const current = loadProfiles();
      current[i] = JSON.parse(JSON.stringify(profileClipboard));
      saveProfiles(current);
      // Pasting into the active profile changes what every other panel
      // should be showing right now — setActiveProfileIndex is the one
      // function that refreshes all of them; a non-active target just
      // needs this list's own row (and its own already-open detail, if
      // any) rebuilt.
      if (i === activeIndex) setActiveProfileIndex(i);
      else renderProfileMenuList();
    });

    header.append(radioLabel, summary, copyBtn, pasteBtn);

    const detail = document.createElement("div");
    detail.className = "ending-settings-detail profile-detail";
    detail.hidden = true;

    const charRow = document.createElement("div");
    charRow.className = "settings-list-row";
    const charLabel = document.createElement("span");
    charLabel.className = "settings-list-label";
    charLabel.textContent = t("profileCharacterLabel");
    const charSelect = document.createElement("select");
    charSelect.className = "profile-character-select";
    for (const style of installedStyles) {
      const opt = document.createElement("option");
      opt.value = String(style.id);
      opt.textContent = style.label;
      opt.selected = style.id === profile.styleId;
      charSelect.appendChild(opt);
    }
    charSelect.addEventListener("change", () => {
      const newStyleId = Number(charSelect.value);
      const current = loadProfiles();
      current[i] = { ...current[i], styleId: newStyleId };
      saveProfiles(current);
      // The キャラクター panel itself (and its "現在の声" label) only ever
      // shows the *active* profile's character — only needs a refresh when
      // that's the one just edited here.
      if (i === activeIndex) setupCharacterPanel();
    });
    charRow.append(charLabel, charSelect);
    detail.appendChild(charRow);

    const endingsHeading = document.createElement("h4");
    endingsHeading.textContent = t("navEndings");
    const endingsContainer = document.createElement("div");
    endingsContainer.className = "ending-settings-list";
    detail.append(endingsHeading, endingsContainer);

    const templatesHeading = document.createElement("h4");
    templatesHeading.textContent = t("navTemplates");
    const templatesContainer = document.createElement("div");
    templatesContainer.className = "ending-settings-list";
    detail.append(templatesHeading, templatesContainer);

    const hotkeyHeading = document.createElement("h4");
    hotkeyHeading.textContent = t("navHotkey");
    const hotkeyContainer = document.createElement("div");
    detail.append(hotkeyHeading, hotkeyContainer);

    // Rendered lazily, the first time this row is actually expanded — up to
    // 5 profiles × (10 endings rows + 12 template inputs + 16 hotkey
    // selects) mounted unconditionally would build a lot of DOM nobody may
    // ever look at. A later full renderProfileMenuList() call (profile
    // switch, count change, paste elsewhere) rebuilds every row from
    // scratch regardless, so there's no staleness to worry about from
    // leaving a once-opened detail's own children as-is afterward.
    let detailRendered = false;
    summary.addEventListener("click", () => {
      const willOpen = detail.hidden;
      detail.hidden = !willOpen;
      row.classList.toggle("open", willOpen);
      if (willOpen && !detailRendered) {
        detailRendered = true;
        renderGeneralEndingsList(endingsContainer, i);
        renderVrKeyboardTemplatesList(templatesContainer, i);
        renderProfileHotkeyEditor(hotkeyContainer, i);
      }
    });

    row.append(header, detail);
    list.append(row);
  }
}

function setupProfilePanel() {
  const countSelect = document.querySelector("#profile-count-select");
  countSelect.value = String(loadProfileCount());
  countSelect.addEventListener("change", async () => {
    const newCount = Number(countSelect.value);
    const oldCount = loadProfileCount();
    if (newCount < oldCount) {
      const ok = await showConfirmDialog(t("profileCountShrinkConfirm"));
      if (!ok) {
        countSelect.value = String(oldCount);
        return;
      }
    }
    setProfileCount(newCount);
  });

  renderProfileMenuList();
}

// Shared option-building for a single hand/slot <select> — used by both the
// main Hotkey panel's fixed-id selects (renderHotkeyAssignmentOptions) and
// the Profile menu's own embedded, dynamically-created ones
// (renderProfileHotkeyEditor). `endingsList` is whichever profile's own
// endings the options should preview (so slot "1" reads as that profile's
// own ending #1, not necessarily the active profile's).
function populateHotkeySelect(select, endingsList, currentValue) {
  select.innerHTML = "";
  const unsetOpt = document.createElement("option");
  unsetOpt.value = "";
  unsetOpt.textContent = t("unset");
  const cancelOpt = document.createElement("option");
  cancelOpt.value = HOTKEY_CANCEL_ACTION;
  cancelOpt.textContent = t("cancelSend");
  const keyboardOpt = document.createElement("option");
  keyboardOpt.value = HOTKEY_KEYBOARD_TOGGLE_ACTION;
  keyboardOpt.textContent = t("hotkeyKeyboardToggleOption");
  select.append(unsetOpt, cancelOpt, keyboardOpt);
  endingsList.forEach((ending, i) => {
    const opt = document.createElement("option");
    opt.value = String(i + 1);
    opt.textContent = `${i + 1}. ${ending.text}`;
    select.appendChild(opt);
  });
  // Falls back to "(未設定)" automatically if the saved value doesn't match
  // any option (shouldn't normally happen now that slots are fixed at
  // 1-10, but stays safe against stale pre-migration values).
  select.value = currentValue;
}

function renderHotkeyAssignmentOptions() {
  const assignments = loadHotkeyAssignments();
  for (const hand of HOTKEY_HANDS) {
    for (const slot of HOTKEY_SLOTS) {
      const select = document.querySelector(`#hotkey-${hand}-${slot}`);
      populateHotkeySelect(select, endings, assignments[hand][slot]);
    }
  }
}

// The Profile menu's own embedded copy of the Hotkey panel's assignment
// grid, scoped to one specific profile (which may not be the active one) —
// dynamically builds its own <select> per hand/slot (the main panel's own
// selects are fixed-id, one set total, always active-profile-only) and
// saves straight into that profile's own hotkey object on change.
function renderProfileHotkeyEditor(container, profileIndex) {
  container.innerHTML = "";
  const profile = loadProfiles()[profileIndex];
  for (const hand of HOTKEY_HANDS) {
    const heading = document.createElement("h4");
    heading.textContent = t(HOTKEY_HAND_LABEL_KEYS[hand]);
    container.appendChild(heading);
    for (const slot of HOTKEY_SLOTS) {
      const row = document.createElement("div");
      row.className = "settings-list-row";
      const label = document.createElement("span");
      label.className = "settings-list-label";
      label.textContent = t(HOTKEY_SLOT_LABEL_KEYS[slot]);
      const select = document.createElement("select");
      populateHotkeySelect(select, profile.endings, profile.hotkey[hand][slot]);
      select.addEventListener("change", () => {
        updateProfileAt(profileIndex, (p) => ({
          ...p,
          hotkey: { ...p.hotkey, [hand]: { ...p.hotkey[hand], [slot]: select.value } },
        }));
        // The main Hotkey panel's own fixed-id selects only ever show the
        // active profile's assignments — only needs a refresh when that's
        // the one just edited here.
        if (profileIndex === loadActiveProfileIndex()) renderHotkeyAssignmentOptions();
      });
      row.append(label, select);
      container.appendChild(row);
    }
  }
}

// Which of the four grip/trigger-combo slots a hand is currently making.
// Excludes "stick" — that fires on press instead of after a hold (see
// setupHotkeys()), since a quick click is often shorter than the
// hold-debounce window below and was going unnoticed.
function gestureFor(hand) {
  if (hand.grip && hand.trigger) return "both";
  if (hand.grip) return "grip";
  if (hand.trigger) return "trigger";
  return "none";
}

function newHotkeyHoldState() {
  return {
    candidateSlot: null, // most recent raw gesture reading, not yet committed
    candidateSince: 0,
    activeSlot: null, // one of both/grip/trigger/none, once debounced
    activeSince: 0,
    activeAssignment: "", // assignments[hand][activeSlot], cached when it last changed
    firedForThisHold: false,
  };
}

// Hoisted to module scope (rather than local to setupHotkeys()) so that
// createRecognition()'s onresult handler can reset the hold timers whenever
// pendingFinalText changes — a fresh/appended Final means whatever hold was
// in progress should restart from 0 rather than firing based on stale
// timing. Each hand tracks its own independent state since they can now be
// bound to different actions.
let rightHotkeyHold = newHotkeyHoldState();
let leftHotkeyHold = newHotkeyHoldState();

// Called whenever the pending text changes (new Final, or one appended to
// an existing pending Final) so an in-progress hold restarts against the
// new content instead of firing on stale timing. Leaves stick-press edge
// tracking alone — that's about physical button transitions, not content.
function resetHotkeyHold() {
  rightHotkeyHold.activeSlot = null;
  rightHotkeyHold.candidateSlot = null;
  leftHotkeyHold.activeSlot = null;
  leftHotkeyHold.candidateSlot = null;
}

function fireHotkeyAssignment(assignment) {
  if (assignment === HOTKEY_CANCEL_ACTION) {
    pendingFinalText = "";
    // Same reasoning as applyEnding's own reset — this can fire (stick
    // short-press, or a grip/trigger hold if hotkeyActiveDuringKeyboard is
    // on) while the VR keyboard is still open, and without resetting these
    // too the next few keystrokes would land past the end of the (now
    // empty) text with no visible cursor, and any half-done 変換
    // conversion would keep pointing at text that's no longer there.
    vrKeyboardCursorPos = 0;
    vrKeyboardConfirmedLength = 0;
    resetVrKeyboardConversion();
    renderMergedText();
  } else if (assignment === HOTKEY_KEYBOARD_TOGGLE_ACTION) {
    toggleVrKeyboard();
  } else {
    const ending = endingForAssignment(assignment);
    if (ending) applyEnding(ending);
  }
}

const HOTKEY_DEBOUNCE_MS = 100; // absorb single-poll blips in the raw grip/trigger state

// Advances one hand's independent hold state machine by one tick: debounces/
// holds the grip+trigger gesture against that hand's own assignment table.
// Both hands run this every tick, so each can fire its own action
// independently of what the other hand is doing. Doesn't handle the stick
// at all — that's processStickPress's job entirely now (it used to also be
// edge-fired here, which double-fired alongside processStickPress once that
// was added, e.g. toggling the VR keyboard open then immediately shut again
// on a single press, whose "shut" half sends/clears pendingFinalText —
// exactly what looked like "cancel send fires no matter what stick is
// assigned to").
function processHandHotkey(hold, hand, handAssignments, now) {
  if (!pendingFinalText) return;

  const rawSlot = gestureFor(hand);
  if (rawSlot !== hold.candidateSlot) {
    hold.candidateSlot = rawSlot;
    hold.candidateSince = now;
  }
  const slot = now - hold.candidateSince >= HOTKEY_DEBOUNCE_MS ? hold.candidateSlot : hold.activeSlot;

  if (slot !== hold.activeSlot) {
    hold.activeSlot = slot;
    hold.activeSince = now;
    hold.firedForThisHold = false;
    hold.activeAssignment = handAssignments[slot] || "";
  }

  if (!hold.firedForThisHold && now - hold.activeSince >= hotkeyHoldMsCache) {
    hold.firedForThisHold = true;
    fireHotkeyAssignment(hold.activeAssignment);
    hold.activeSlot = null;
    hold.candidateSlot = null;
  }
}

// --- VR flick-input keyboard (TASK.md #23) ---
// VR-only text entry as an alternative to voice recognition — shown/hidden
// by a fixed right-stick press (see the poll loop in setupHotkeys() below,
// not reassignable via the hotkey slot system above — see
// defaultHotkeyAssignments()'s own comment for why). Still a work in
// progress: this covers the show/hide toggle, hotkey-send suppression while
// it's up, and a cursor-aware edit model for pendingFinalText — the actual
// on-screen grid/flick-gesture/laser-pointer rendering doesn't exist yet
// (needs new overlay.rs drawing + hit-testing against HandState.pose).
let vrKeyboardVisible = false;
// Index into pendingFinalText where the next inserted character lands —
// textarea-style. Reset to the end of whatever's already pending each time
// the keyboard opens (see toggleVrKeyboard below), since that's the most
// useful starting point (append to what voice recognition already
// produced) — the cursor move buttons (still TODO) move it from there.
let vrKeyboardCursorPos = 0;
// Index into pendingFinalText: [0, vrKeyboardConfirmedLength) is confirmed
// (plain) text, [vrKeyboardConfirmedLength, pendingFinalText.length) is not
// yet confirmed (drawn with the same light-blue background draw_text_block
// already used for the henkan focus highlight — see the render loop's own
// highlightStart/End). Only confirmVrKeyboardConversion ever advances it;
// everything that clears pendingFinalText resets it back to 0 alongside
// vrKeyboardCursorPos, for the same reason (a stale boundary past the end
// of shorter/empty text). Dictated (voice-recognized) text bumps it
// immediately in handleFinalRecognizedText — the henkan flow only applies
// to text typed on the VR keyboard itself, so dictated text should never
// show as pending.
let vrKeyboardConfirmedLength = 0;
// Timestamp of the last cursor move/edit — see the render loop's own
// CURSOR_BLINK_PAUSE_MS comment for why the blink pauses (stays solid)
// for a bit after this, instead of blinking straight through a move and
// making it hard to tell where the cursor actually landed.
let vrKeyboardCursorActivityAt = 0;
function markVrKeyboardCursorActivity() {
  vrKeyboardCursorActivityAt = Date.now();
}

function insertAtVrKeyboardCursor(str) {
  pendingFinalText = pendingFinalText.slice(0, vrKeyboardCursorPos) + str + pendingFinalText.slice(vrKeyboardCursorPos);
  vrKeyboardCursorPos += str.length;
  markVrKeyboardCursorActivity();
  renderMergedText();
}

// BS — deletes the character before the cursor, moving it back.
function deleteBeforeVrKeyboardCursor() {
  if (vrKeyboardCursorPos === 0) return;
  pendingFinalText = pendingFinalText.slice(0, vrKeyboardCursorPos - 1) + pendingFinalText.slice(vrKeyboardCursorPos);
  vrKeyboardCursorPos -= 1;
  markVrKeyboardCursorActivity();
  renderMergedText();
}

function moveVrKeyboardCursor(delta) {
  vrKeyboardCursorPos = Math.max(0, Math.min(pendingFinalText.length, vrKeyboardCursorPos + delta));
  markVrKeyboardCursorActivity();
}

// Right stick: opens the keyboard (cursor starts at the end of whatever
// text is already pending, e.g. from voice recognition) if it was closed;
// closes AND sends if it was open — mirrors applyEnding()'s own "clear
// pendingFinalText and dispatch" but with no ending appended, since the
// keyboard's own text is already exactly what the user typed (same
// no-ending path handleFinalRecognizedText's "auto" sendMode uses).
function openVrKeyboard() {
  vrKeyboardVisible = true;
  vrKeyboardCursorPos = pendingFinalText.length;
  markVrKeyboardCursorActivity();
  // No per-hand default needed here (there used to be one) —
  // update_keyboard_overlay ray-casts both hands every render tick
  // regardless of whether either has ever pulled its trigger, so both
  // hover highlights are live from the very first frame.
}

// Hides the keyboard only — leaves pendingFinalText untouched, so the same
// in-progress text is still there (and still pending, still editable) next
// time the keyboard is reopened. Sending is a separate, explicit action —
// picking an ending/template button (see applyEnding, still gated by
// loadVrKeyboardAutoCloseOnSend) or a controller hotkey, there's no bare
// "just send the raw text" key on the grid any more — toggling the keyboard
// off with the stick used to also send/clear the text, which meant a plain
// "put the keyboard away for a second" press quietly submitted whatever had
// been typed so far.
function closeVrKeyboard() {
  vrKeyboardVisible = false;
}

function toggleVrKeyboard() {
  if (vrKeyboardVisible) {
    closeVrKeyboard();
  } else {
    openVrKeyboard();
  }
}

// The stick's short (HOTKEY_SLOTS "stick") and long (HOTKEY_SLOTS
// "stickLong") press are independently assignable to any of the normal
// hotkey actions (unset/cancel/ending N/HOTKEY_KEYBOARD_TOGGLE_ACTION — see
// fireHotkeyAssignment), same as every other slot. This isn't the ending/
// cancel hold-then-fire machinery below (processHandHotkey) — that fires
// once a *single* assignment's hold threshold is crossed; here there are
// *two* assignments racing against one physical press, and they must be
// mutually exclusive (a long-press attempt must never also fire the short
// one). Firing the long assignment the instant the hold crosses
// HOTKEY_STICK_LONG_PRESS_MS (while still held, like the ending/cancel
// system does) rather than waiting for release, and latching that with
// `firedLong`, is what guarantees the short assignment can't *also* fire
// on release right after.
const HOTKEY_STICK_LONG_PRESS_MS = 200;
function newStickPressState() {
  return { since: 0, firedLong: false };
}
let vrKeyboardStickPress = { right: newStickPressState(), left: newStickPressState() };

function processStickPress(hand, handState, handAssignments) {
  const state = vrKeyboardStickPress[hand];
  if (handState.stick && state.since === 0) {
    state.since = Date.now();
    state.firedLong = false;
  } else if (handState.stick && !state.firedLong && Date.now() - state.since >= HOTKEY_STICK_LONG_PRESS_MS) {
    state.firedLong = true;
    fireHotkeyAssignment(handAssignments.stickLong);
  } else if (!handState.stick && state.since !== 0) {
    if (!state.firedLong) fireHotkeyAssignment(handAssignments.stick);
    state.since = 0;
  }
}

// Double-click for grip/trigger (HOTKEY_SLOTS "gripDouble"/"triggerDouble")
// — detected independently of, and in parallel with, each button's own
// hold-based single slot (processHandHotkey): a double-click fires the
// instant the second press lands, without waiting for it to be held at
// all, so it stays useful for a quick default like toggling the VR
// keyboard (works with nothing pending, same reasoning as the stick slots
// above — this runs unconditionally in the poll loop, not gated on
// pendingFinalText the way processHandHotkey is). HOTKEY_DOUBLE_CLICK_MS
// matches XSOverlay's own quick-double-press window (see
// CYCLE_DOUBLE_PRESS_MS, declared later in the file — kept a literal here
// rather than a reference to it, since a module-scope `const` referencing
// one declared further down throws at load time, before this module's own
// DOMContentLoaded handler even registers) as "how fast counts as
// deliberate", rather than picking a fresh number.
const HOTKEY_DOUBLE_CLICK_MS = 300;
// How long the two-circle indicator holds at "both lit" after firing (see
// doubleClickStageFor) before it'd naturally read as 0 again — well past
// one render tick, so it's reliably captured into boxFrozenContent (see the
// render loop) and visible through the box's own fade-out, but short
// enough that it's back to a clean 0 well before any *new* double-click
// sequence could plausibly start.
const HOTKEY_DOUBLE_CLICK_DOT_HOLD_MS = 150;
function newDoubleClickButtonState() {
  return { pendingSince: 0, wasPressed: false };
}
let hotkeyDoubleClickState = {
  right: { grip: newDoubleClickButtonState(), trigger: newDoubleClickButtonState(), a: newDoubleClickButtonState(), firedAt: 0, activeAssignment: "" },
  left: { grip: newDoubleClickButtonState(), trigger: newDoubleClickButtonState(), a: newDoubleClickButtonState(), firedAt: 0, activeAssignment: "" },
};

// Derives the two-circle indicator's stage (0/1/2 — see draw_double_click_dots
// in overlay.rs) purely from timestamps already being tracked for detection,
// rather than a separately-set/reset flag: grip-double, trigger-double, and
// a-double share one hand's worth of display (same as the hold system
// already collapses both/grip/trigger/none into one activeSlot per hand), and
// nothing here needs an explicit reset anywhere else — once `firedAt` and
// every button's `pendingSince` are both stale, this naturally reads 0
// again on its own. An earlier version stored the stage as a plain field,
// set to 2 on fire — that field only ever got reset to 0 on a *timeout*,
// so a fire followed by nothing else (the normal case: firing closes the
// keyboard, or sends and clears pendingFinalText) left it stuck at 2, and
// the *next* time the box became visible for an unrelated reason (e.g. the
// next voice Final), it would incorrectly show "just fired" again.
// Stage 1 only shows once the *first* click has actually been released —
// while a button is still down, there's no way yet to tell a hold from the
// first half of a double-click, so the hold bar gets first say (see the
// render loop's holdDisplay, which already only shows while a hand isn't
// reporting a double-click stage here — this is the other half of that:
// whichever button is physically down keeps this at 0). The moment it's
// released short of firing the hold, `pendingSince` is still set (it isn't
// cleared until the double-click window itself expires) and neither button
// is held anymore, so this flips to 1 right then — reading exactly as "that
// was a click, waiting on a possible second one" instead of "still mid-hold".
function doubleClickStageFor(hand) {
  const handState = hotkeyDoubleClickState[hand];
  const now = Date.now();
  if (now - handState.firedAt < HOTKEY_DOUBLE_CLICK_DOT_HOLD_MS) return 2;
  if (handState.grip.wasPressed || handState.trigger.wasPressed || handState.a.wasPressed) return 0;
  if (handState.grip.pendingSince || handState.trigger.pendingSince || handState.a.pendingSince) return 1;
  return 0;
}

// { stage, assignment } for the render loop's ending-preview text/dot
// color, or null while stage is 0 — assignment is whichever button
// (grip/trigger) most recently drove the stage above 0 (see
// processDoubleClick, which keeps it current on every press-edge).
function doubleClickDisplayFor(hand) {
  const stage = doubleClickStageFor(hand);
  return stage ? { stage, assignment: hotkeyDoubleClickState[hand].activeAssignment } : null;
}

// `hold` is this hand's rightHotkeyHold/leftHotkeyHold (declared further
// below) — a double-click resets it so a second tap that happens to
// linger doesn't *also* cross the plain grip/trigger hold threshold
// moments later: clearing activeSlot/candidateSlot alone restarts that
// debounce from scratch, same as a genuine fresh press would, but
// activeAssignment/activeSince/firedForThisHold also need clearing here —
// processHandHotkey (which normally keeps them in sync) stops running
// entirely the instant pendingFinalText goes empty (its own early return),
// which a double-click send always does, so without this reset those three
// fields would keep reading whatever they were at the moment of that last
// real hold, and the render loop (which reads them for the progress bar/
// ending-preview text) would show that stale hold indefinitely instead of
// nothing.
function processDoubleClick(hand, button, pressed, handAssignments, hold) {
  const handState = hotkeyDoubleClickState[hand];
  const state = handState[button];
  const now = Date.now();
  // A trigger press that's actually clicking a VR keyboard key isn't a
  // hotkey gesture at all — without this, typing on the keyboard (each key
  // press is its own trigger press/release) would randomly land inside an
  // earlier double-click's window and fire it. Grip has no keyboard role,
  // so this only ever applies to button === "trigger".
  // Clicking into the box to place the cursor counts the same way (see
  // boxCursorIndex's own comment) — clicking two spots in quick succession
  // would otherwise fire the trigger double-click (by default, toggling the
  // keyboard closed).
  if (
    button === "trigger" &&
    vrKeyboardVisible &&
    (vrKeyboardHands[hand].highlightedIndex !== null || vrKeyboardHands[hand].boxCursorIndex !== null)
  ) {
    state.wasPressed = pressed;
    return;
  }
  // Same idea for grip: a grip press that grabbed the keyboard (fixed
  // position mode, see processKeyboardGrab — which runs before this each
  // tick, so a grab started this very tick is already reflected) is a drag,
  // not a hotkey gesture; without this, re-gripping to adjust the panel
  // twice in quick succession would fire gripDouble. The release tick needs
  // no special case: processKeyboardGrab clears vrKeyboardGrabHand first,
  // and a release is never a press edge anyway.
  if (button === "grip" && vrKeyboardGrabHand === hand) {
    state.wasPressed = pressed;
    return;
  }
  if (pressed && !state.wasPressed) {
    if (state.pendingSince && now - state.pendingSince < HOTKEY_DOUBLE_CLICK_MS) {
      state.pendingSince = 0;
      handState.firedAt = now;
      handState.activeAssignment = handAssignments[`${button}Double`] || "";
      fireHotkeyAssignment(handAssignments[`${button}Double`]);
      hold.activeSlot = null;
      hold.candidateSlot = null;
      hold.activeAssignment = "";
      hold.activeSince = now;
      hold.firedForThisHold = false;
    } else {
      state.pendingSince = now;
      handState.activeAssignment = handAssignments[`${button}Double`] || "";
    }
  } else if (state.pendingSince && now - state.pendingSince >= HOTKEY_DOUBLE_CLICK_MS) {
    state.pendingSince = 0;
  }
  state.wasPressed = pressed;
}

// Grip-grab for the VR keyboard in "fixed" position mode (see
// loadVrKeyboardPositionMode). null, or the hand ("right"/"left") currently
// dragging the panel — a single value rather than per-hand state because
// only one hand may drag at a time: a second hand's grip is simply ignored
// until the first lets go (two hands fighting over one rigid panel has no
// sensible meaning, and "both released at once" can't then leave it half-way).
let vrKeyboardGrabHand = null;
// Own grip edge tracking, separate from hotkeyDoubleClickState's: that one's
// wasPressed gets overwritten by processDoubleClick, which runs after this.
let vrKeyboardGripWasPressed = { right: false, left: false };

// A grab starts only on a *fresh* grip press (same press-edge rule as
// processDoubleClick — holding grip and then sweeping onto the panel doesn't
// pick it up) while the keyboard is showing in fixed mode, and only if that
// hand's aim ray is on the panel at that instant — begin_keyboard_grab does
// that hit-test itself against the live pose, rather than trusting this
// hand's last reported highlightedIndex, since grabbing is allowed anywhere
// on the panel, not just over a key. Grip pointed elsewhere stays an
// ordinary hotkey grip. Called for "right" before "left" each tick, so on a
// same-tick press by both hands, right wins.
//
// All the grip/release geometry (and keeping the drag rigid) lives in
// lib.rs — see begin_keyboard_grab/end_keyboard_grab. Nothing needs sending
// per tick for the grip itself: the panel is parented to the controller on
// SteamVR's side for the duration, so it follows the hand at the headset's
// own frame rate rather than this loop's HOTKEY_POLL_MS. The render loop
// separately sends the cached right-stick depth value each tick, which is
// what allows that rigid parented panel to move forward/back.
async function processKeyboardGrab(hand, handState) {
  const wasPressed = vrKeyboardGripWasPressed[hand];
  vrKeyboardGripWasPressed[hand] = handState.grip;

  if (vrKeyboardGrabHand === hand) {
    // Closing the keyboard mid-drag also ends it — it's re-anchored on the
    // next open anyway, but lib.rs shouldn't be left thinking it's grabbed.
    if (!handState.grip || !vrKeyboardVisible) {
      vrKeyboardGrabHand = null;
      await window.__TAURI__.core.invoke("end_keyboard_grab").catch((err) => log(`[overlay] ${err}`));
    }
    return;
  }
  if (vrKeyboardGrabHand !== null) return;
  if (!handState.grip || wasPressed) return;
  if (!vrKeyboardVisible || vrKeyboardPositionModeCache !== "fixed") return;
  // .catch: rejects only if the overlay itself failed to initialize (see
  // lib.rs's Hud) — log it like the render loop does, rather than letting it
  // abort the rest of this poll tick (trigger handling etc.).
  const grabbed = await window.__TAURI__.core.invoke("begin_keyboard_grab", { hand }).catch((err) => {
    log(`[overlay] ${err}`);
    return false;
  });
  if (grabbed) vrKeyboardGrabHand = hand;
}

// The hold-based hotkeys (processHandHotkey) see a grabbing hand's grip as
// released — otherwise, with hotkeyActiveDuringKeyboardCache on, simply
// holding the panel longer than the hold threshold would fire whatever
// that hand's grip slot is assigned to (e.g. send an ending).
function withoutGrabbingGrip(hand, handState) {
  return vrKeyboardGrabHand === hand ? { ...handState, grip: false } : handState;
}

// --- VR keyboard layout + flick input (TASK.md #23) ---
// Must match overlay.rs's KEYBOARD_CANVAS_WIDTH/HEIGHT — the layout itself
// lives entirely here (not duplicated in Rust, see overlay.rs's own top
// comment on this) and gets sent to update_keyboard_overlay every frame.
//
// The 5-column grid (gridLeft/gridCols/gapX/cellW, computed in
// computeVrKeyboardLayout from VR_KB_GRID_WIDTH below) keeps the exact
// pixel geometry — and, since lib.rs's KEYBOARD_TRANSFORM carries a
// matching compensating shift (see its own comment), the exact world
// position too — it's always had. VR_KB_CANVAS_WIDTH is wider than that
// grid alone: a 2x2 block of cells the same size as the grid's own
// (cellW x cellH each), for the cursor controls (see
// computeVrKeyboardLayout's cursorActions), plus VR_KB_GAP_X clearance on
// each side of that block's own *padded* footprint (matching the standard
// gap everywhere else, and VR_KB_GRID_LEFT past its outer edge, matching
// the grid's own margin) — they used to be a single ~50px-tall strip below
// the whole grid, too small a target to reliably land a VR pointer press
// on, so they moved into their own block to the right instead, drawn as a
// visually separate box (see lib.rs's RectArg / overlay.rs's CURSOR_BOX_* —
// Rust draws the box, but its bounds are computed here and sent over, same
// "layout lives in JS only" reasoning as the rest of this section).
// VR_KB_CURSOR_BOX_PADDING must match overlay.rs's CURSOR_BOX_PADDING —
// left out of that padding, the block's *button* positions would be
// correctly clear of column 5, but its padded background box would still
// visually overlap BS/etc. (this happened once already — the padding was
// only accounted for on the Rust side, not reserved for here).
const VR_KB_GRID_LEFT = 20;
const VR_KB_GRID_COLS = 5;
const VR_KB_GAP_X = 10;
const VR_KB_GRID_WIDTH = 900;
const VR_KB_CELL_W = (VR_KB_GRID_WIDTH - VR_KB_GRID_LEFT * 2 - (VR_KB_GRID_COLS - 1) * VR_KB_GAP_X) / VR_KB_GRID_COLS; // 164
const VR_KB_CURSOR_BOX_PADDING = 14;
// The computed VR_KB_GAP_X clearance from BS still read as touching/
// overlapping in-headset once the padded box was actually rendered — a
// few rounds of in-headset feedback settled on this much extra breathing
// room on top of the standard gap.
const VR_KB_CURSOR_BOX_EXTRA_GAP = 13;
// VR_KB_GRID_WIDTH already counts its own trailing VR_KB_GRID_LEFT-width
// margin (see this constant's own value/derivation) — that's also exactly
// the margin left *past* the padded cursor block below, so it isn't added
// again here.
const VR_KB_CANVAS_WIDTH =
  VR_KB_GRID_WIDTH + VR_KB_GAP_X + VR_KB_CURSOR_BOX_EXTRA_GAP + VR_KB_CURSOR_BOX_PADDING * 2 + (VR_KB_CELL_W * 2 + VR_KB_GAP_X); // 1289
// 823, not 640 — the panel was asked to shrink ~30% in world *width* but
// only ~10% in world *height*. Width alone is a plain KEYBOARD_WORLD_WIDTH
// cut in lib.rs (uniform, nothing here needs to change for that). Height
// has no separate "set height" call in OpenVR though — an overlay's world
// height always follows its texture's own pixel aspect ratio (width in
// meters × canvas_height/canvas_width). The only way to give height a
// *different* percentage than width is to change that pixel aspect ratio
// itself: solving world_height_new = world_height_old*0.9 against
// world_width_new = world_width_old*0.7 (same canvas *width* in pixels)
// reduces to a single vertical-only scale factor of 0.9/0.7 ≈ 1.286 —
// applied to every vertical pixel measurement below (VR_KB_VERTICAL_SCALE)
// including this constant itself (640*0.9/0.7 ≈ 823). Horizontal pixel
// constants (gridLeft/gapX/cellW/VR_KB_CANVAS_WIDTH) are untouched — the
// uniform 30% width cut is entirely lib.rs's KEYBOARD_WORLD_WIDTH's job.
const VR_KB_CANVAS_HEIGHT = 823;
const VR_KB_VERTICAL_SCALE = VR_KB_CANVAS_HEIGHT / 640;

// Must match overlay.rs's own CANVAS_WIDTH/CANVAS_HEIGHT — the confirm/
// discard preview box's own (separate) canvas. Used only to size its
// background crop target (see VR_BACKGROUND_SURFACES); nothing else on this
// side draws into that canvas.
const VR_BOX_CANVAS_WIDTH = 560;
const VR_BOX_CANVAS_HEIGHT = 300;

const VR_KB_GRID_TOP = Math.round(90 * VR_KB_VERTICAL_SCALE);
const VR_KB_GAP_Y = Math.round(10 * VR_KB_VERTICAL_SCALE);
const VR_KB_CELL_H = Math.round(85 * VR_KB_VERTICAL_SCALE);

// The cursor-control block's own background box (see overlay.rs's
// CURSOR_BOX_* and lib.rs's RectArg) — a constant, not computed inside
// computeVrKeyboardLayout, since it doesn't depend on anything that
// changes at runtime (mode, endings, hover state, ...). 2 columns x 5 rows
// of full-size cells (matches cursorActions' own geometry there exactly) —
// rows 0-1 are cursor jump/step, rows 2-3 are the Auto/profile/Chatbox/TTS
// controls (desktop-only until now, see computeVrKeyboardLayout's own
// comment on them), row 4 is copy/paste — top edge level with row 0 (BS).
// `x` starts VR_KB_GAP_X
// past column 5's
// own right edge *plus* VR_KB_CURSOR_BOX_PADDING, so that once Rust pads
// the drawn background out by that same amount (see overlay.rs's
// CURSOR_BOX_PADDING) on every side, its left edge still lands exactly
// VR_KB_GAP_X clear of BS rather than overlapping it — the padding was
// only accounted for in Rust the first time this was built, which visually
// overlapped the two boxes despite the buttons themselves never
// overlapping anything. VR_KB_CANVAS_WIDTH leaves the same *padded*
// clearance (VR_KB_GRID_LEFT-width) past this box's own outer edge too.
const VR_KB_CURSOR_BOX = {
  x: VR_KB_GRID_LEFT + VR_KB_GRID_COLS * (VR_KB_CELL_W + VR_KB_GAP_X) + VR_KB_CURSOR_BOX_PADDING + VR_KB_CURSOR_BOX_EXTRA_GAP,
  y: VR_KB_GRID_TOP,
  w: VR_KB_CELL_W * 2 + VR_KB_GAP_X,
  h: VR_KB_CELL_H * 5 + VR_KB_GAP_Y * 4,
};

// Standard Japanese flick-input layout (iOS/Android kana keyboards alike):
// tap = あ, flick LEFT = い, UP = う, right = え, down = お. Rows are stored
// in あいうえお order, so this index is what maps a screen direction onto a
// vowel column. It has been wrong twice before (right/down swapped, then
// up/left swapped — "い above, う left" is a common misremembering); the
// user's own description (な: に where た is = left, ぬ where か is = up)
// is the reference.
const VR_KB_DIRECTION_INDEX = { center: 0, left: 1, up: 2, right: 3, down: 4 };
const VR_KB_FLICK_ROWS = {
  あ: ["あ", "い", "う", "え", "お"],
  か: ["か", "き", "く", "け", "こ"],
  さ: ["さ", "し", "す", "せ", "そ"],
  た: ["た", "ち", "つ", "て", "と"],
  な: ["な", "に", "ぬ", "ね", "の"],
  は: ["は", "ひ", "ふ", "へ", "ほ"],
  ま: ["ま", "み", "む", "め", "も"],
  ら: ["ら", "り", "る", "れ", "ろ"],
  // や/わ have no real い/え-column sounds — these are stored by direction
  // (same order as above: center/left/up/right/down) with what phone
  // keyboards put there instead. "" = no flick in that direction.
  や: ["や", "（", "ゆ", "）", "よ"],
  わ: ["わ", "を", "ん", "ー", "〜"],
};
// Up-only entries for the number/symbol mode (see VR_KB_NUMSYM_ROWS) —
// left/right/down all just repeat `base`, which resolveFlickChar's own
// "no flick that way" skip (in the render loop below) reads as "nothing
// there", same as や/わ's own unused directions above.
const vrKbUpOnly = (base, up) => [base, base, up, base, base];
Object.assign(VR_KB_FLICK_ROWS, {
  "!": vrKbUpOnly("!", "`"),
  "@": vrKbUpOnly("@", "~"),
  ",": vrKbUpOnly(",", "<"),
  ".": vrKbUpOnly(".", ">"),
  "/": vrKbUpOnly("/", "?"),
  ";": vrKbUpOnly(";", ":"),
  "'": vrKbUpOnly("'", '"'),
  "[": vrKbUpOnly("[", "{"),
  "]": vrKbUpOnly("]", "}"),
  "-": vrKbUpOnly("-", "_"),
  "=": vrKbUpOnly("=", "+"),
  "\\": vrKbUpOnly("\\", "|"),
});
// 「、。？！」key — same direction-order convention, no down.
const VR_KB_PUNCTUATION_ROW = ["、", "。", "？", "！", ""];

// The 3x4 inner block (columns 2-4 of the 5-column grid) — the only part
// kana/number/template modes swap out; column 1 (mode buttons) and column
// 5 (⌫/変換/空白/送信) stay put so those never move under the user's aim.
// null = no button at all in that cell.
const VR_KB_KANA_INNER = [
  [{ base: "あ" }, { base: "か" }, { base: "さ" }],
  [{ base: "た" }, { base: "な" }, { base: "は" }],
  [{ base: "ま" }, { base: "や" }, { base: "ら" }],
  [{ variant: true }, { base: "わ" }, { base: "punct" }],
];
// Combined number+symbol mode ("numsym" — used to be two separate modes,
// "number" and "symbol", cycled with a shared button; one full-width 3x10
// layout instead, same footprint as English/QWERTY below, since the old
// 3x4 inner grid didn't have room for a real symbol row without spreading
// it across two mode switches). Row 1 is plain digits, no flick. Row 2's
// flick only covers its first two keys (see VR_KB_FLICK_ROWS' own
// vrKbUpOnly entries) — nothing else in that row needed a second symbol
// badly enough to reach for a flick. Row 3's flick is the full standard
// US-keyboard shift-row mapping, so it matches what a physical keyboard
// user already has memorized.
const VR_KB_NUMSYM_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"],
  [",", ".", "/", ";", "'", "[", "]", "-", "=", "\\"],
];
// Full-width (replaces all 5 columns). QWERTY's own 26 letters leave 1
// empty slot in row 2 and 3 in row 3 (30 cells total, no dead ones) — ' in
// row 2, ,.? in row 3, per the user's explicit ordering.
const VR_KB_QWERTY_ROWS = ["qwertyuiop", "asdfghjkl'", "zxcvbnm,.?"];
// Every letter's up-flick gives its own uppercase — replaces the old
// dedicated A/a caps-toggle button (case is momentary per keystroke now,
// like a real flick-keyboard shift, instead of a sticky mode you had to
// remember was on).
for (const ch of "abcdefghijklmnopqrstuvwxyz") {
  VR_KB_FLICK_ROWS[ch] = vrKbUpOnly(ch, ch.toUpperCase());
}

// 小゛゜ key: each string is one cycle, pressed repeatedly on the character
// before the cursor (は→ば→ぱ→は…). Kept as cycles rather than a hand-written
// next-char map so adding a family is one entry and every cycle is closed by
// construction. つ/う put the small form first, as phone keyboards do (っ is
// far more common than づ).
const VR_KB_VARIANT_CYCLES = [
  "あぁ", "いぃ", "うぅゔ", "えぇ", "おぉ",
  "かが", "きぎ", "くぐ", "けげ", "こご",
  "さざ", "しじ", "すず", "せぜ", "そぞ",
  "ただ", "ちぢ", "つっづ", "てで", "とど",
  "はばぱ", "ひびぴ", "ふぶぷ", "へべぺ", "ほぼぽ",
  "やゃ", "ゆゅ", "よょ", "わゎ",
];
const VR_KB_VARIANT_NEXT = {};
for (const cycle of VR_KB_VARIANT_CYCLES) {
  const chars = [...cycle];
  chars.forEach((c, i) => (VR_KB_VARIANT_NEXT[c] = chars[(i + 1) % chars.length]));
}

// "kana" | "number" | "english" | "template". Deliberately not reset when
// the keyboard closes — reopening in the mode last used matches phone IMEs.
let vrKeyboardMode = "kana";

// Resolves a (base kana row, flick direction) pair to the actual character
// — falls back to the row's own center/tap character if that direction
// isn't meaningfully distinct for this row (や/わ, see VR_KB_FLICK_ROWS's
// own comment).
function resolveFlickChar(base, direction) {
  const row = base === "punct" ? VR_KB_PUNCTUATION_ROW : VR_KB_FLICK_ROWS[base];
  if (!row) return base;
  return row[VR_KB_DIRECTION_INDEX[direction]] || row[0];
}

// Where each of a held key's flick characters is drawn (see overlay.rs's
// draw_flick_cross): directly on top of the neighboring grid cell in that
// direction, like a phone flick keyboard's guide — な's に sits on た, ぬ on
// か, etc. — so the popup reads as "the grid itself relabeled" rather than
// a separate widget. Vertical neighbors past the grid (above the top row /
// below the bottom row) just get clipped to the canvas; there's still room
// there (candidate strip / control rows). Horizontal ones past the edge
// columns have no room at all (only a 20px margin), so those instead take
// the key's own outer third, the key's remaining part staying the center.
const VR_KB_FLICK_EDGE_FRACTION = 1 / 3;
function vrKeyboardFlickCells(x, y, w, h, pitchX, pitchY) {
  const clipV = (cy, ch) => {
    const top = Math.max(0, cy);
    return { y: top, h: Math.min(VR_KB_CANVAS_HEIGHT, cy + ch) - top };
  };
  const center = { x, y, w, h };
  const edgeW = w * VR_KB_FLICK_EDGE_FRACTION;
  let left;
  if (x - pitchX >= 0) {
    left = { x: x - pitchX, y, w, h };
  } else {
    left = { x, y, w: edgeW, h };
    center.x += edgeW;
    center.w -= edgeW;
  }
  let right;
  if (x + pitchX + w <= VR_KB_CANVAS_WIDTH) {
    right = { x: x + pitchX, y, w, h };
  } else {
    right = { x: x + w - edgeW, y, w: edgeW, h };
    center.w -= edgeW;
  }
  return {
    center,
    left,
    right,
    up: { x, w, ...clipV(y - pitchY, h) },
    down: { x, w, ...clipV(y + pitchY, h) },
  };
}

// Flicking = aiming the pointer past the engaged key's own edge, toward one
// of its drawn flick cells (like dragging a finger on a phone) — crossing
// the key's own boundary is read as committing to that direction, rather
// than requiring the pointer to travel all the way into the (visually
// larger, drawn-over-the-neighbor-key) flick cell itself. Live, not
// latched: this runs every render tick and always reflects the *current*
// hit position, including back to "center" if the pointer is dragged back
// within the key's own box before release — so a flick started and then
// abandoned inputs the plain center character, same as never having
// flicked. The inset (checked against the key's own edge, not the flick
// cell's) keeps the pointer's natural jitter right at that boundary from
// flipping the direction back and forth, and also keeps a small release-
// time jerk (squeezing the trigger tends to nudge the aim) from snapping a
// real, committed flick back to center at the last instant — the jerk is
// small relative to the distance already flicked, so it doesn't cross all
// the way back past the inset.
const VR_KB_FLICK_HIT_INSET = 8;
function updateVrKeyboardFlickDirection(hand, hitX, hitY) {
  const state = vrKeyboardHands[hand];
  if (state.engagedAction?.type !== "key" || hitX == null || hitY == null) return;
  const b = vrKeyboardLastLayout[state.engagedIndex];
  if (!b?.flickCells) return;
  const base = b.action.base;
  const centerChar = resolveFlickChar(base, "center");
  const center = b.flickCells.center;
  const m = VR_KB_FLICK_HIT_INSET;
  const has = (dir) => resolveFlickChar(base, dir) !== centerChar; // e.g. 、 key's down has nothing of its own

  if (hitY < center.y - m && has("up")) {
    state.engagedDirection = "up";
  } else if (hitY >= center.y + center.h + m && has("down")) {
    state.engagedDirection = "down";
  } else if (hitX < center.x - m && has("left")) {
    state.engagedDirection = "left";
  } else if (hitX >= center.x + center.w + m && has("right")) {
    state.engagedDirection = "right";
  } else if (hitX >= center.x && hitX < center.x + center.w && hitY >= center.y && hitY < center.y + center.h) {
    state.engagedDirection = "center";
  }
  // Else: past the key's edge but in a direction with nothing of its own
  // (has(dir) was false) — keep whatever direction was already latched,
  // same as drifting through the gap between two drawn cells; there's
  // nothing here to commit to instead.
}

// How many characters the cursor row's ≪/≫ buttons skip at once.
const VR_KB_CURSOR_JUMP = 5;
// ⌫ renders as a missing-glyph box in the overlay's font (Meiryo/Yu Gothic,
// see rasterize_cached in overlay.rs and font()'s own comment — neither
// carries the Miscellaneous Technical block ⌫/⌦ live in) — a left-pointing
// triangle + an × reads as "erase what's behind the cursor" without needing
// an actual backspace glyph the font doesn't have. Both characters are
// known to render fine: ◀ is the same one the cursor-jump buttons use, and
// × (U+00D7, Latin-1 Supplement) is about as safe a glyph as exists in a
// font that renders Latin text at all. An earlier version used ◀■ (a plain
// filled square) — legible enough side by side with the ◀/▶ cursor buttons,
// but read as "a generic solid button", not specifically "delete", on its
// own; × reads unambiguously as "remove" the way it does in close buttons
// elsewhere.
const VR_KB_BACKSPACE_LABEL = "◀×";

// Builds the full button list (pixel rects within VR_KB_CANVAS_WIDTH x
// VR_KB_CANVAS_HEIGHT) + a lookup from button index back to what selecting
// it should do. Recomputed every frame the keyboard is visible — cheap
// (a few dozen small objects), and always reflects the current endings
// list without needing separate invalidation.
function computeVrKeyboardLayout() {
  const buttons = [];

  // Vertical budget (canvas VR_KB_CANVAS_HEIGHT, see its own comment for
  // why that's not a plain 640 anymore): candidates, grid (4 rows, with the
  // cursor block beside it, not below — see cursorActions), 2 ending rows,
  // in that order top to bottom — every vertical measurement below is
  // VR_KB_VERTICAL_SCALE'd from the original 640-tall design so the
  // proportions stay the same at the new canvas height. Horizontal ones
  // (gridLeft/gapX/cellW) are untouched — see VR_KB_CANVAS_HEIGHT's own
  // comment on why only vertical scales.
  const gridTop = VR_KB_GRID_TOP;
  const gridLeft = VR_KB_GRID_LEFT;
  const gridCols = VR_KB_GRID_COLS;
  const gapX = VR_KB_GAP_X;
  const gapY = VR_KB_GAP_Y;
  const cellW = VR_KB_CELL_W;
  const cellH = VR_KB_CELL_H;
  const cellX = (c) => gridLeft + c * (cellW + gapX);
  const cellY = (r) => gridTop + r * (cellH + gapY);

  // 変換 (henkan) candidate list for the *focused* segment — lives in the
  // margin above the grid (0..gridTop, otherwise empty) so it's visible
  // what candidates are available instead of only being able to cycle
  // through them blind one 変換 press at a time. Each candidate is
  // directly selectable (see applyVrKeyboardAction's "selectCandidate"),
  // and the one currently applied is marked `selected` (see overlay.rs's
  // KeyButton). Multiple segments (see vrKeyboardConversionSegments' own
  // comment) each get their own candidate list as focus moves between them
  // (◀/▶ while converting — see applyVrKeyboardAction's "cursor" case).
  if (vrKeyboardConversionSegments !== null) {
    const focused = vrKeyboardConversionSegments[vrKeyboardConversionFocus];
    const candTop = gapY;
    const candH = gridTop - gapY * 2;
    const maxShown = Math.min(focused.candidates.length, 8);
    // Sized off VR_KB_GRID_WIDTH, not VR_KB_CANVAS_WIDTH — stays above the
    // grid's own panel, not stretched out over the (now transparent, see
    // overlay.rs's KEYBOARD_GRID_WIDTH) gap before the cursor block.
    const candW = (VR_KB_GRID_WIDTH - gridLeft * 2 - (maxShown - 1) * gapX) / maxShown;
    for (let i = 0; i < maxShown; i++) {
      buttons.push({
        x: gridLeft + i * (candW + gapX),
        y: candTop,
        w: candW,
        h: candH,
        label: focused.candidates[i],
        action: { type: "selectCandidate", index: i },
        selected: i === focused.index,
      });
    }
  }

  const cell = (r, c, label, action, extra = {}) =>
    buttons.push({ x: cellX(c), y: cellY(r), w: cellW, h: cellH, label, action, ...extra });

  // English and numsym share one control-row shape — kana / the other one
  // of this pair / newline / space / BS — so switching between "typing
  // Latin text" and "typing symbols" is always one press each way, with no
  // detour through kana mode. Neither carries a Send button any more (kana
  // mode's own still does): with the double-click-to-send hotkey covering
  // the common case, the extra column went to the direct mode-switch
  // instead of a second way to do what the hotkey already does.
  if (vrKeyboardMode === "english") {
    // Needs all 10 columns, so this replaces the whole 5-column grid
    // (mode column included) — its bottom row carries its own way back.
    // Sized off VR_KB_GRID_WIDTH, not the wider VR_KB_CANVAS_WIDTH — QWERTY
    // stays within the original grid's own footprint, leaving the cursor
    // column (added to the right of it, see cursorActions below) clear
    // rather than stretching keys out underneath it. Letters go through the
    // flick machinery (type: "key", same as kana/numsym) so an up-flick
    // gives the uppercase form (see VR_KB_FLICK_ROWS' per-letter entries) —
    // flickHint surfaces that same uppercase letter as a small corner label.
    // confirmed: true (see applyVrKeyboardAction's "key" case) — unlike
    // kana, Latin letters never go through 変換, so there's nothing for a
    // blue "not yet confirmed" state to usefully mark here.
    const letterW = (VR_KB_GRID_WIDTH - gridLeft * 2 - 9 * gapX) / 10;
    VR_KB_QWERTY_ROWS.forEach((row, r) => {
      [...row].forEach((ch, c) => {
        const x = gridLeft + c * (letterW + gapX);
        const y = cellY(r);
        const flickCells = vrKeyboardFlickCells(x, y, letterW, cellH, letterW + gapX, cellH + gapY);
        const upChar = resolveFlickChar(ch, "up");
        buttons.push({
          x,
          y,
          w: letterW,
          h: cellH,
          label: ch,
          action: { type: "key", base: ch, confirmed: true },
          flickCells,
          flickHint: upChar !== ch ? upChar : undefined,
        });
      });
    });
    // Space isn't in the QWERTY block (its 30 cells are exactly full), and
    // English without spaces is unusable — it gets its own control-row slot.
    cell(3, 0, t("vrKbModeKana"), { type: "mode", mode: "kana" });
    cell(3, 1, t("vrKbModeNumber"), { type: "mode", mode: "numsym" });
    cell(3, 2, t("vrKbNewlineButton"), { type: "insert", text: "\n" });
    cell(3, 3, t("vrKbSpaceButton"), { type: "insert", text: " " });
    cell(3, 4, VR_KB_BACKSPACE_LABEL, { type: "delete" });
  } else if (vrKeyboardMode === "numsym") {
    // Full-width like English above — see VR_KB_NUMSYM_ROWS' own comment
    // for why this replaced two separate "number"/"symbol" modes. Same
    // flick machinery as English's letters, for the same reason, and same
    // confirmed: true reasoning (numbers/symbols never go through 変換
    // either).
    const symW = (VR_KB_GRID_WIDTH - gridLeft * 2 - 9 * gapX) / 10;
    VR_KB_NUMSYM_ROWS.forEach((row, r) => {
      row.forEach((ch, c) => {
        const x = gridLeft + c * (symW + gapX);
        const y = cellY(r);
        const flickCells = vrKeyboardFlickCells(x, y, symW, cellH, symW + gapX, cellH + gapY);
        const upChar = resolveFlickChar(ch, "up");
        buttons.push({
          x,
          y,
          w: symW,
          h: cellH,
          label: ch,
          action: { type: "key", base: ch, confirmed: true },
          flickCells,
          flickHint: upChar !== ch ? upChar : undefined,
        });
      });
    });
    cell(3, 0, t("vrKbModeKana"), { type: "mode", mode: "kana" });
    cell(3, 1, t("vrKbModeEnglish"), { type: "mode", mode: "english" });
    cell(3, 2, t("vrKbNewlineButton"), { type: "insert", text: "\n" });
    cell(3, 3, t("vrKbSpaceButton"), { type: "insert", text: " " });
    cell(3, 4, VR_KB_BACKSPACE_LABEL, { type: "delete" });
  } else {
    // Column 1: an active mode's own button relabels to かな and toggles
    // back; the other two stay live so template↔english↔number/symbol is
    // always one press, never a detour through kana mode first. 変換
    // (henkan) lives here too now, not column 5 — that column is full with
    // Del/BS/Newline/Confirm (see below). No `selected` highlight on the
    // active one — tried that, but a highlighted button reading "かな" while
    // you're actually in, say, template mode read as "you're in kana mode"
    // rather than the intended "press here to get back to kana".
    const modeButton = (mode, labelKey) => [t(vrKeyboardMode === mode ? "vrKbModeKana" : labelKey), { type: "mode", mode }];
    cell(0, 0, ...modeButton("template", "vrKbModeTemplate"));
    // Only pressable while there's something not yet confirmed to act on
    // (see vrKeyboardConfirmedLength) — either fresh unconfirmed text 変換
    // hasn't touched yet, or a candidate review already in progress (where
    // pressing again cycles the focused segment, see handleHenkanPress).
    const canConvert = vrKeyboardConversionSegments !== null || vrKeyboardConfirmedLength < pendingFinalText.length;
    cell(1, 0, "変換", canConvert ? { type: "henkan" } : undefined);
    cell(2, 0, ...modeButton("numsym", "vrKbModeNumber"));
    cell(3, 0, ...modeButton("english", "vrKbModeEnglish"));

    if (vrKeyboardMode === "template") {
      loadVrKeyboardTemplates().forEach((text, i) => {
        // Unset slots still render (as inert, action-less keys) so every
        // slot keeps a fixed position whether or not its neighbors are set.
        const action = text ? { type: "insert", text, confirmed: true } : undefined;
        cell(Math.floor(i / 3), (i % 3) + 1, text, action);
      });
    } else {
      VR_KB_KANA_INNER.forEach((row, r) =>
        row.forEach((k, c) => {
          if (k.variant) {
            cell(r, c + 1, "小゛゜", { type: "variant" });
            return;
          }
          const x = cellX(c + 1);
          const y = cellY(r);
          const label = k.base === "punct" ? "、。？！" : k.base;
          const flickCells = vrKeyboardFlickCells(x, y, cellW, cellH, cellW + gapX, cellH + gapY);
          buttons.push({ x, y, w: cellW, h: cellH, label, action: { type: "key", base: k.base }, flickCells });
        }),
      );
    }

    // 変換 moved to column 1 above, freeing this column for the 4 controls
    // below. No forward-delete button (there used to be one, "Del") — BS
    // plus the cursor column's ◀/▶ (see cursorActions below) covers the
    // same ground without needing a fifth slot.
    cell(0, 4, VR_KB_BACKSPACE_LABEL, { type: "delete" });
    cell(1, 4, t("vrKbSpaceButton"), { type: "insert", text: " " });
    cell(2, 4, t("vrKbNewlineButton"), { type: "insert", text: "\n" });
    // 確定 accepts whatever's currently unconfirmed (blue) as final text —
    // without converting it if it was never sent through 変換 at all, or
    // ending a candidate review early and locking in whatever's currently
    // applied if it was (see confirmVrKeyboardConversion). Always pressable,
    // unlike 変換 below — a no-op when there's nothing pending, same as a
    // real IME's confirm key.
    cell(3, 4, t("vrKbConfirmButton"), { type: "confirm" });
  }

  // Cursor + quick-settings controls: a 2x4 block of full-size cells (same
  // cellW x cellH as any other key), positioned exactly at VR_KB_CURSOR_BOX
  // (to the right of column 5, vertically lined up with the whole grid) —
  // rows 0-1 replaced a single ~50px-tall strip that used to run below the
  // whole grid, too small a target to reliably land a VR pointer press on.
  // ≪/≫ (multi-char jump — replaced an earlier Home/End pair, which needed
  // the whole string's length to read and didn't help with a mid-string
  // edit the way a plain multi-char skip does) on top, ◀/▶ (single-char)
  // below that, then Auto/profile/Chatbox/TTS in rows 2-3. Drawn as its own
  // visually separate box (VR_KB_CURSOR_BOX, sent to Rust alongside
  // `buttons` — see CURSOR_BOX_* in overlay.rs) so it reads as a distinct
  // control, not a 6th grid column — an earlier version that extended the
  // grid's own canvas rightward for this shifted the whole existing
  // keyboard's *world position* left by half the added width (an OpenVR
  // overlay is centered on its own texture, and the original grid no
  // longer sat at that center once the canvas grew asymmetrically); a
  // separate box with its own explicit bounds sidesteps that class of bug
  // entirely rather than requiring a compensating shift to stay correct
  // (lib.rs's KEYBOARD_RECENTER_X still carries one, for the canvas-
  // widening-vs-transform-centering issue itself, but nothing about *this*
  // block's own position depends on getting that right).
  const ctrlColX = VR_KB_CURSOR_BOX.x;
  const cursorActions = [
    { x: ctrlColX, y: cellY(0), label: "≪", action: { type: "cursor", delta: -VR_KB_CURSOR_JUMP } },
    { x: ctrlColX + cellW + gapX, y: cellY(0), label: "≫", action: { type: "cursor", delta: VR_KB_CURSOR_JUMP } },
    { x: ctrlColX, y: cellY(1), label: "◀", action: { type: "cursor", delta: -1 } },
    { x: ctrlColX + cellW + gapX, y: cellY(1), label: "▶", action: { type: "cursor", delta: 1 } },
    // Desktop-only until now (see #mode-toggle-btn/#hotkey-profile-btn/
    // #chatbox-toggle-btn/#tts-toggle-btn) — same underlying state either
    // way (setSendMode/setChatboxEnabled/setTtsEnabled/setActiveProfileIndex
    // keep both UIs in sync), just reachable from the headset now too.
    // Auto/Chatbox/TTS get the quieter `toggledOn` look while on (not
    // `selected` — that's SELECTED_COLOR in overlay.rs, meant for a one-off
    // active choice like a mode button, far too insistent for a toggle
    // that's "on" most of the time); the profile button doesn't highlight at
    // all (matches the desktop "P1/P2/P3" button, which just shows the number).
    { x: ctrlColX, y: cellY(2), label: t("autoLabel"), action: { type: "toggleAuto" }, toggledOn: sendMode === "auto" },
    { x: ctrlColX + cellW + gapX, y: cellY(2), label: `P${loadActiveProfileIndex() + 1}`, action: { type: "cycleProfile" } },
    { x: ctrlColX, y: cellY(3), label: "Chatbox", action: { type: "toggleChatbox" }, toggledOn: chatboxEnabled },
    { x: ctrlColX + cellW + gapX, y: cellY(3), label: "TTS", action: { type: "toggleTts" }, toggledOn: ttsEnabled },
    // Reuses the Profile menu's own コピー/貼り付け labels — same words,
    // same action either way (copy: current text → system clipboard,
    // paste: system clipboard → current text), just a different "current
    // text" here (pendingFinalText, not a profile).
    { x: ctrlColX, y: cellY(4), label: t("profileCopyButton"), action: { type: "copyText" } },
    { x: ctrlColX + cellW + gapX, y: cellY(4), label: t("profilePasteButton"), action: { type: "pasteText" } },
  ];
  cursorActions.forEach((btn) => {
    buttons.push({ x: btn.x, y: btn.y, w: cellW, h: cellH, label: btn.label, action: btn.action, toggledOn: !!btn.toggledOn });
  });

  // Always shown now (used to be an opt-out toggle in settings — removed,
  // there's no reason not to have quick-send phrases available while the
  // keyboard's up). 2 rows of 5 rather than 1 of 10 — at 1/10 width, most
  // ending texts overflowed their own key. Still only as wide as the
  // original 5-column grid (the new cursor column sits above this, not
  // beside it) — unchanged from before.
  const endTop = cellY(4) + gapY;
  const endRows = Math.ceil(endings.length / gridCols);
  const endH = (VR_KB_CANVAS_HEIGHT - endTop - gapY - (endRows - 1) * gapY) / endRows;
  endings.forEach((ending, i) => {
    buttons.push({
      x: cellX(i % gridCols),
      y: endTop + Math.floor(i / gridCols) * (endH + gapY),
      w: cellW,
      h: endH,
      label: ending.text,
      action: { type: "ending", index: i },
    });
  });

  return buttons;
}

// Per-hand hover/engage state — fully independent per hand (right and left
// each track their own highlighted key, their own engaged-on-trigger-press
// action, and their own live flick direction). This used to be a single
// shared set of variables following whichever hand's trigger was pressed
// most recently ("vrKeyboardActiveHand"), with update_keyboard_overlay only
// ray-casting *that* hand — pressing the other hand's trigger reused
// whatever highlight was last computed for the *previous* active hand
// (stale by up to a tick, since the new hand's own hover hadn't been
// ray-cast yet), so e.g. right-trigger then left-trigger could type the
// right hand's target. update_keyboard_overlay now ray-casts both hands
// every call (see its own HandHit/hand_hit), so each hand's state here is
// always fresh from its own aim, independent of what the other hand is doing.
function newVrKeyboardHandState() {
  return {
    // Set from update_keyboard_overlay's per-hand result every render tick.
    highlightedIndex: null,
    // Whether this hand's aim landed within the keyboard panel's own bounds
    // on the last update_keyboard_overlay call (result.<hand>.hitX/Y non-null
    // — see hand_hit in lib.rs, which already returns None past the panel's
    // edges) — drives that hand's own laser visibility (see the render
    // loop's update_pointer_overlays call), so the beam only shows while
    // it's actually pointing somewhere on the keyboard, not just whenever
    // the keyboard happens to be open.
    aimingAtPanel: false,
    // Set alongside the above: non-null while this hand is aiming at the
    // confirm/discard box (instead of the panel — lib.rs's hand_hit picks
    // the nearer of the two when the ray crosses both), holding the char
    // index into pendingFinalText a trigger pull would move the cursor to
    // (see processVrKeyboardTrigger's "placeCursor"). Also lights this
    // hand's laser, same as aimingAtPanel. Only ever ray-cast while the
    // keyboard is open — the box shows no cursor otherwise (see the render
    // loop's own `cursor`), and a trigger aimed at it with the keyboard
    // closed stays an ordinary hotkey trigger (hold/double-click).
    boxCursorIndex: null,
    // The action (see computeVrKeyboardLayout) of whichever button this
    // hand's trigger was DOWN on when it was pressed (not just currently
    // hovering — see the poll loop) — applied on release, using
    // engagedDirection below. null when this hand has no key engaged.
    engagedAction: null,
    // The index (into vrKeyboardLastLayout at engage time) of the button
    // engagedAction came from — used only to draw the flick cross over
    // that same button each frame (see the render loop). Can go briefly
    // stale the instant the layout's shape changes (e.g. a henkan
    // candidate row appearing/disappearing) mid-hold — same one-tick-of-lag
    // tradeoff highlightedIndex already accepts elsewhere.
    engagedIndex: null,
    // Which of the held key's flick directions is committed *right now* —
    // live, not latched: applied on release exactly as it reads at that
    // instant (see updateVrKeyboardFlickDirection, fed from this hand's hit
    // position every render tick), including reverting to "center" if the
    // pointer is dragged back within the key's own box before release. Reset
    // to "center" on each new engage.
    engagedDirection: "center",
    // 0 while not auto-repeating; otherwise the timestamp the *next*
    // repeat fire is due. Only cursor/delete-type buttons repeat (see
    // VR_KB_REPEATABLE_TYPES) — flick keys don't have a "held direction"
    // that makes sense to fire repeatedly, they resolve once on release.
    repeatNextAt: 0,
  };
}
let vrKeyboardHands = { right: newVrKeyboardHandState(), left: newVrKeyboardHandState() };
// The button list the render loop most recently sent to
// update_keyboard_overlay — read by the poll loop to resolve a trigger
// press into an engaged action (see above). Shared: the layout itself
// doesn't depend on which hand is looking at it.
let vrKeyboardLastLayout = [];
// Whether the keyboard/pointer overlays were visible on the *previous*
// render tick — lets the render loop send exactly one "hide" call the
// instant vrKeyboardVisible goes false, instead of only ever hiding them
// while also having new content to draw (see its own code).
let vrKeyboardWasVisible = false;
let vrKeyboardRightTriggerWasPressed = false;
let vrKeyboardLeftTriggerWasPressed = false;

// Google's transliterate endpoint auto-segments a plain hiragana run into
// bunsetsu (phrase) chunks on its own — no comma needed, see
// convert_kana_to_kanji's own comment — and each chunk gets cycled/
// re-converted independently here, matching how a real IME lets you adjust
// one clause without disturbing the others. null (both) when not mid-
// conversion; vrKeyboardConversionSegments is an array of
// {candidates: string[], index: number}, one per bunsetsu chunk, in the
// order they appear in the original hiragana run.
let vrKeyboardConversionSegments = null;
let vrKeyboardConversionBase = null; // index into pendingFinalText where the whole conversion starts
let vrKeyboardConversionTotalLength = 0; // current combined length of every segment's applied candidate
let vrKeyboardConversionFocus = 0; // index into vrKeyboardConversionSegments currently being cycled/navigated

async function handleHenkanPress() {
  if (vrKeyboardConversionSegments !== null) {
    // Already converting — cycle the *focused* segment's candidate instead
    // of re-fetching (see resetVrKeyboardConversion for what ends a cycle,
    // and the "cursor" case in applyVrKeyboardAction for how focus moves
    // between segments while converting).
    const seg = vrKeyboardConversionSegments[vrKeyboardConversionFocus];
    seg.index = (seg.index + 1) % Math.max(seg.candidates.length, 1);
    applyVrKeyboardConversionSegments();
    return;
  }

  // Converts the whole not-yet-confirmed tail (see vrKeyboardConfirmedLength's
  // own comment) rather than scanning backward from the cursor for a
  // hiragana run — the confirmed/unconfirmed boundary *is* now the thing
  // that decides what 変換 acts on, matching what's shown with the blue
  // background in the box. Mirrors the 変換 button's own enabled condition
  // in computeVrKeyboardLayout, so a press here can only ever be reachable
  // when there's actually something to convert.
  if (vrKeyboardConfirmedLength >= pendingFinalText.length) return;
  const start = vrKeyboardConfirmedLength;
  const segmentText = pendingFinalText.slice(start);
  try {
    const segments = await window.__TAURI__.core.invoke("convert_kana_to_kanji", { text: segmentText });
    if (!segments || segments.length === 0) return;
    // The network round-trip above can take long enough that the user types
    // more, deletes, sends, or otherwise moves on before it resolves —
    // `start`/`segmentText` were captured before any of that, so applying
    // them unconditionally could splice this stale conversion into
    // whatever's now at that position instead of what was actually
    // converted (reported as already-confirmed text reappearing, or extra
    // characters landing wrong, whenever this raced with typing). Bail out
    // instead of applying if the text there isn't still exactly what was
    // sent for conversion.
    if (pendingFinalText.slice(start, start + segmentText.length) !== segmentText) return;
    vrKeyboardConversionBase = start;
    vrKeyboardConversionTotalLength = segmentText.length;
    vrKeyboardConversionSegments = segments.map((s) => ({
      candidates: [s.original, ...s.candidates.filter((c) => c !== s.original)],
      index: 0,
    }));
    vrKeyboardConversionFocus = 0;
    applyVrKeyboardConversionSegments();
  } catch (err) {
    log(`[ime:error] ${err}`);
  }
}

function applyVrKeyboardConversionSegments() {
  const replacement = vrKeyboardConversionSegments.map((s) => s.candidates[s.index]).join("");
  const end = vrKeyboardConversionBase + vrKeyboardConversionTotalLength;
  pendingFinalText = pendingFinalText.slice(0, vrKeyboardConversionBase) + replacement + pendingFinalText.slice(end);
  vrKeyboardConversionTotalLength = replacement.length;
  vrKeyboardCursorPos = vrKeyboardConversionBase + replacement.length;
  markVrKeyboardCursorActivity();
  renderMergedText();
}

// Any action other than pressing 変換 again, moving segment focus, or
// picking a candidate directly ends the current conversion cycle — matches
// how a real IME commits whatever's showing the moment you do anything
// else (type more, send, ...). Doesn't touch vrKeyboardConfirmedLength —
// ending a cycle this way leaves whatever candidates were currently applied
// in place but still *unconfirmed* (still blue): only confirmVrKeyboardConversion
// (picking the last segment, or pressing 確定) actually commits it.
function resetVrKeyboardConversion() {
  vrKeyboardConversionSegments = null;
  vrKeyboardConversionBase = null;
  vrKeyboardConversionTotalLength = 0;
  vrKeyboardConversionFocus = 0;
}

// Marks everything up to the current end of pendingFinalText as confirmed
// (see vrKeyboardConfirmedLength's own comment) — the only thing that ever
// advances that boundary. Ends any candidate review in progress the same
// way resetVrKeyboardConversion does (accepting whatever's currently
// applied, mid-review or not), but unlike that function this is the one
// that actually turns the blue "not yet confirmed" text plain. Called both
// by 確定 (skips conversion entirely — just accepts the raw text as-is) and
// by picking the last segment's candidate in a review (see "selectCandidate"
// in applyVrKeyboardAction) — same action either way: stop treating this
// span as pending and accept what's currently there.
function confirmVrKeyboardConversion() {
  vrKeyboardConfirmedLength = pendingFinalText.length;
  resetVrKeyboardConversion();
  renderMergedText();
}

// One hand's trigger edge handling for the VR keyboard — see the poll loop
// in setupHotkeys() for the overall press/hold/release model. Fully
// independent per hand (see vrKeyboardHands' own comment for why: each
// hand engages/releases against its *own* tracked state, so right-then-left
// (or simultaneous) presses can never mix up which hand types what).
// Cursor/delete-type buttons repeat while held (like a physical keyboard's
// key-repeat) instead of only firing once on release — see
// processVrKeyboardTrigger. Flick keys ("key") and one-shot actions
// (henkan/send/mode/...) aren't here: they either need a release-time
// flick direction or don't make sense to spam.
const VR_KB_REPEATABLE_TYPES = ["cursor", "delete"];
const VR_KB_REPEAT_INITIAL_DELAY_MS = 400; // hold this long before repeat kicks in
const VR_KB_REPEAT_INTERVAL_MS = 100; // then repeat this often

// A short click for tactile/audio feedback on every VR keyboard button press
// (see applyVrKeyboardAction) — root-relative like main.js's own <script src>
// in index.html, so it resolves the same regardless of which page/base URL
// this happens to run from.
const KEY_SOUND_URL = "/assets/key_sound.mp3";

// Mirrors voiceRmsThresholdCache's own pattern: a plain module-level cache,
// synced from the persisted appearance settings at startup and on every
// settings-panel change (see setupAppearancePanel), read directly in the
// hot path below instead of re-parsing localStorage on every single key
// press.
let keySoundVolumeCache = 1;

// key_sound.mp3's own recorded level is louder than actually comfortable at
// the slider's 100% position — rather than re-encoding the source file
// (would need an external tool this dev machine doesn't have, e.g. ffmpeg),
// the 0-100% the slider shows is scaled down to an actual 0-0.5 range here,
// right before it's applied. The slider itself stays full-resolution
// (11 steps across the same 0-100% the user sees) — only the ceiling it
// maps to is lower.
const KEY_SOUND_MAX_VOLUME = 0.5;

// Deliberately does NOT reuse voicevoxOutputsSelect's own selection as-is:
// that list's whole point is routing TTS *into* VRChat's mic (CABLE Input —
// see populateOutputDevices' own CABLE-Input heuristic), and a UI click
// leaking into that same stream is exactly the kind of noise other people
// in-game shouldn't hear. This plays on whichever of the *selected* output
// devices isn't CABLE Input — normally the user's own headphones/speakers,
// if those are also checked alongside CABLE Input. If every selected device
// is CABLE Input (the common default — see populateOutputDevices), there's
// nothing to play to and this silently does nothing; no fallback to the
// system default device, since that could just as easily resolve to CABLE
// Input itself if the user ever set it as their Windows default.
function playKeySound() {
  if (keySoundVolumeCache <= 0) return;
  const targets = Array.from(voicevoxOutputsSelect.selectedOptions).filter((o) => !o.textContent.includes("CABLE Input"));
  for (const { value: sinkId } of targets) {
    const audio = new Audio(KEY_SOUND_URL);
    audio.volume = keySoundVolumeCache * KEY_SOUND_MAX_VOLUME;
    if (sinkId && audio.setSinkId) audio.setSinkId(sinkId).catch(() => {});
    audio.play().catch(() => {});
  }
}

function processVrKeyboardTrigger(hand, handState, wasPressed) {
  const state = vrKeyboardHands[hand];
  if (handState.trigger && !wasPressed) {
    if (vrKeyboardVisible && state.highlightedIndex !== null) {
      state.engagedAction = vrKeyboardLastLayout[state.highlightedIndex]?.action ?? null;
      state.engagedIndex = state.engagedAction ? state.highlightedIndex : null;
      state.engagedDirection = "center";
      // Tactile confirmation the moment a real key is pressed — the visual
      // highlight alone wasn't enough to tell a press actually registered.
      // Fire-and-forget: a dropped pulse isn't worth blocking input on.
      if (state.engagedAction) window.__TAURI__.core.invoke("trigger_hand_haptic", { hand }).catch(() => {});
      // Repeatable types fire immediately on press (a tap still does
      // something right away) and then again every VR_KB_REPEAT_INTERVAL_MS
      // as long as the trigger stays down — see the release branch below
      // for why this also suppresses the normal release-fire for these.
      if (state.engagedAction && VR_KB_REPEATABLE_TYPES.includes(state.engagedAction.type)) {
        applyVrKeyboardAction(state.engagedAction, "center");
        state.repeatNextAt = Date.now() + VR_KB_REPEAT_INITIAL_DELAY_MS;
      } else {
        state.repeatNextAt = 0;
      }
    } else if (vrKeyboardVisible && state.boxCursorIndex !== null) {
      // Clicking into the box places the cursor on press, not release — the
      // way a desktop text field does on mousedown — and nothing is engaged,
      // so the release below has nothing left to apply.
      applyVrKeyboardAction({ type: "placeCursor", index: state.boxCursorIndex }, "center");
      window.__TAURI__.core.invoke("trigger_hand_haptic", { hand }).catch(() => {});
    }
  }
  if (handState.trigger && state.engagedAction && state.repeatNextAt && Date.now() >= state.repeatNextAt) {
    applyVrKeyboardAction(state.engagedAction, "center");
    state.repeatNextAt = Date.now() + VR_KB_REPEAT_INTERVAL_MS;
  }
  if (!handState.trigger && wasPressed) {
    // repeatNextAt is only ever nonzero for a repeatable-type engage (see
    // above) — a repeatable action has already fired at least once (on
    // press) and possibly several more times since, so firing it *again*
    // here on release would be an extra, unwanted repeat.
    if (vrKeyboardVisible && state.engagedAction && state.repeatNextAt === 0) {
      applyVrKeyboardAction(state.engagedAction, state.engagedDirection);
    }
    state.engagedAction = null;
    state.engagedIndex = null;
    state.repeatNextAt = 0;
  }
}

function applyVrKeyboardAction(action, direction) {
  if (!["henkan", "selectCandidate", "cursor"].includes(action.type)) resetVrKeyboardConversion();
  // placeCursor (clicking into the confirm/discard box, see
  // processVrKeyboardTrigger) isn't a keyboard button press — every other
  // action type that reaches this function is, so it's the one exclusion.
  if (action.type !== "placeCursor") playKeySound();

  switch (action.type) {
    case "key":
      insertAtVrKeyboardCursor(resolveFlickChar(action.base, direction));
      // English/symbol keys set this (see their own cell() calls in
      // computeVrKeyboardLayout) — unlike kana, there's no 変換 step that
      // could ever turn a typed letter/symbol into something else, so
      // making the user press 変換/確定 before it's treated as finished
      // text was pure friction with no upside, unlike kana where the blue
      // "not yet confirmed" state exists specifically to show what 変換
      // still has left to act on.
      if (action.confirmed) vrKeyboardConfirmedLength = Math.max(vrKeyboardConfirmedLength, vrKeyboardCursorPos);
      break;
    case "insert":
      insertAtVrKeyboardCursor(action.text);
      // Template phrases (see computeVrKeyboardLayout's template mode) are
      // already-final text, not something to convert — they should never
      // show up blue/pending the way freshly-flicked kana does. Space/
      // newline don't set this: those get typed *while* composing
      // something else, so they stay part of whatever's currently
      // unconfirmed around them.
      if (action.confirmed) vrKeyboardConfirmedLength = Math.max(vrKeyboardConfirmedLength, vrKeyboardCursorPos);
      break;
    case "variant": {
      const next = VR_KB_VARIANT_NEXT[pendingFinalText[vrKeyboardCursorPos - 1]];
      if (next) {
        pendingFinalText = pendingFinalText.slice(0, vrKeyboardCursorPos - 1) + next + pendingFinalText.slice(vrKeyboardCursorPos);
        markVrKeyboardCursorActivity();
        renderMergedText();
      }
      break;
    }
    case "mode":
      vrKeyboardMode = vrKeyboardMode === action.mode ? "kana" : action.mode;
      break;
    case "henkan":
      handleHenkanPress();
      break;
    case "selectCandidate":
      if (vrKeyboardConversionSegments !== null) {
        const seg = vrKeyboardConversionSegments[vrKeyboardConversionFocus];
        if (seg.candidates[action.index] !== undefined) {
          seg.index = action.index;
          applyVrKeyboardConversionSegments();
          // Picking a candidate locks that segment in and moves on to the
          // next one, same as a real IME's henkan flow — picking the last
          // segment's candidate confirms the whole conversion (the text is
          // already applied above; this just stops showing candidates/the
          // focus highlight for it and marks it confirmed/plain).
          if (vrKeyboardConversionFocus + 1 < vrKeyboardConversionSegments.length) {
            vrKeyboardConversionFocus += 1;
          } else {
            confirmVrKeyboardConversion();
          }
        }
      }
      break;
    case "cursor":
      // While converting, ◀/▶ move which bunsetsu segment 変換 cycles next
      // (real IMEs use the same keys for this) instead of the text cursor —
      // there'd be nothing else to move a *character* cursor with anyway
      // while the text is mid-replacement.
      if (vrKeyboardConversionSegments !== null) {
        // Plain `%` can come out negative in JS when the sum does (e.g.
        // delta -5 with only 2 segments) — the ≪/≫ jump buttons (see
        // cursorActions in computeVrKeyboardLayout) made that a real case,
        // not just a theoretical one at delta ±1. An extra `+ n, % n` fixes
        // the sign without changing the ±1 behavior at all.
        const n = vrKeyboardConversionSegments.length;
        vrKeyboardConversionFocus = (((vrKeyboardConversionFocus + action.delta) % n) + n) % n;
      } else {
        moveVrKeyboardCursor(action.delta);
      }
      break;
    case "delete":
      deleteBeforeVrKeyboardCursor();
      break;
    case "placeCursor":
      // Not a layout button — see processVrKeyboardTrigger's box-click
      // branch. Routed through here anyway so it ends a conversion cycle via
      // the top line above like any other non-henkan action: unlike ◀/▶
      // (which move segment focus mid-conversion), a click names an exact
      // character spot, which segment focus has no way to express. The clamp
      // covers text that shrank in the tick between lib.rs resolving the
      // index (against what was last drawn) and this press.
      vrKeyboardCursorPos = Math.min(action.index, pendingFinalText.length);
      markVrKeyboardCursorActivity();
      break;
    case "confirm":
      // Accepts whatever's currently unconfirmed as final text WITHOUT
      // converting it — resetVrKeyboardConversion() already ran above
      // (applyVrKeyboardAction's own top line, for any type other than
      // henkan/selectCandidate/cursor) if a review was in progress, so this
      // only needs to advance the confirmed boundary itself.
      confirmVrKeyboardConversion();
      break;
    case "ending":
      if (endings[action.index]) applyEnding(endings[action.index]);
      if (loadVrKeyboardAutoCloseOnSend()) vrKeyboardVisible = false;
      break;
    case "toggleAuto":
      setSendMode(sendMode === "auto" ? "manual" : "auto");
      break;
    case "cycleProfile":
      setActiveProfileIndex((loadActiveProfileIndex() + 1) % loadProfileCount());
      break;
    case "toggleChatbox":
      setChatboxEnabled(!chatboxEnabled);
      break;
    case "toggleTts":
      setTtsEnabled(!ttsEnabled);
      break;
    case "copyText":
      // Fire-and-forget, same as the Profile menu's own preset-copy button —
      // clipboard permission can be denied in some contexts, and there's
      // nothing more useful to do here than silently no-op if so.
      navigator.clipboard.writeText(pendingFinalText).catch(() => {});
      break;
    case "pasteText":
      // navigator.clipboard.readText() came back empty from here — unlike
      // writeText (used by "copyText" above), a browser's own clipboard
      // *read* needs a real DOM user-gesture behind the call, which firing
      // from the VR controller poll loop isn't. tauri-plugin-clipboard-
      // manager reads the OS clipboard straight from Rust instead,
      // sidestepping that entirely.
      window.__TAURI__.clipboardManager
        .readText()
        .then((text) => {
          if (!text) return;
          insertAtVrKeyboardCursor(text);
          // Pasted text is already-finished content from elsewhere, not
          // hiragana pending conversion — same "starts out confirmed, not
          // blue" treatment as a template phrase (see the "insert" case's
          // own `confirmed` handling).
          vrKeyboardConfirmedLength = Math.max(vrKeyboardConfirmedLength, vrKeyboardCursorPos);
        })
        .catch((err) => log(`[vr-keyboard] paste failed: ${err}`));
      break;
  }
}

// Set by setupHotkeys() and updated live from its slider/radios; read by
// processHandHotkey() above and the render loop below, both of which run
// outside setupHotkeys()'s own closure timing-wise but are defined inside
// it — module-level so the value assigned there is visible to itself.
let hotkeyHoldMsCache = DEFAULT_HOTKEY_HOLD_MS;
let hotkeyPriorityHandCache = "right";
let hotkeyActiveDuringKeyboardCache = false;
let vrKeyboardPositionModeCache = "centered";

function setupHotkeys() {
  const statusEl = document.querySelector("#hotkey-status");
  const reconnectBtn = document.querySelector("#hotkey-reconnect-btn");
  const holdInput = document.querySelector("#hotkey-hold-duration-input");
  const holdVal = document.querySelector("#hotkey-hold-duration-val");

  for (const hand of HOTKEY_HANDS) {
    for (const slot of HOTKEY_SLOTS) {
      const select = document.querySelector(`#hotkey-${hand}-${slot}`);
      select.addEventListener("change", () => {
        const assignments = loadHotkeyAssignments();
        assignments[hand][slot] = select.value;
        saveHotkeyAssignments(assignments);
      });
    }
  }

  hotkeyHoldMsCache = loadHotkeyHoldMs();
  holdInput.value = hotkeyHoldMsCache / 1000;
  holdVal.textContent = `${(hotkeyHoldMsCache / 1000).toFixed(1)}${t("secondsSuffix")}`;
  holdInput.addEventListener("input", () => {
    hotkeyHoldMsCache = Math.round(Number(holdInput.value) * 1000);
    holdVal.textContent = `${Number(holdInput.value).toFixed(1)}${t("secondsSuffix")}`;
    saveHotkeyHoldMs(hotkeyHoldMsCache);
  });

  hotkeyPriorityHandCache = loadHotkeyPriorityHand();
  for (const radio of document.querySelectorAll('input[name="hotkey-priority-hand"]')) {
    radio.checked = radio.value === hotkeyPriorityHandCache;
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      hotkeyPriorityHandCache = radio.value;
      saveHotkeyPriorityHand(hotkeyPriorityHandCache);
    });
  }

  const activeDuringKeyboardToggle = document.querySelector("#hotkey-active-during-keyboard-toggle");
  hotkeyActiveDuringKeyboardCache = loadHotkeyActiveDuringKeyboard();
  activeDuringKeyboardToggle.checked = hotkeyActiveDuringKeyboardCache;
  activeDuringKeyboardToggle.addEventListener("change", () => {
    hotkeyActiveDuringKeyboardCache = activeDuringKeyboardToggle.checked;
    saveHotkeyActiveDuringKeyboard(hotkeyActiveDuringKeyboardCache);
  });

  const autoCloseOnSendToggle = document.querySelector("#vr-keyboard-auto-close-on-send-toggle");
  autoCloseOnSendToggle.checked = loadVrKeyboardAutoCloseOnSend();
  autoCloseOnSendToggle.addEventListener("change", () => {
    saveVrKeyboardAutoCloseOnSend(autoCloseOnSendToggle.checked);
  });

  vrKeyboardPositionModeCache = loadVrKeyboardPositionMode();
  for (const radio of document.querySelectorAll('input[name="vr-keyboard-position-mode"]')) {
    radio.checked = radio.value === vrKeyboardPositionModeCache;
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      vrKeyboardPositionModeCache = radio.value;
      saveVrKeyboardPositionMode(vrKeyboardPositionModeCache);
    });
  }

  // Which profile is active is picked from the Profile settings panel now
  // (see setupProfilePanel/renderProfileMenuList) — this button just cycles
  // through whatever's currently configured, same as the VR keyboard's own
  // profile-cycle button (see applyVrKeyboardAction's "cycleProfile" case).
  const profileBtn = document.querySelector("#hotkey-profile-btn");
  profileBtn.textContent = `P${loadActiveProfileIndex() + 1}`;
  profileBtn.addEventListener("click", () => {
    setActiveProfileIndex((loadActiveProfileIndex() + 1) % loadProfileCount());
  });

  reconnectBtn.addEventListener("click", async () => {
    hotkeyStatusKey = "vrStatusConnecting";
    statusEl.textContent = t(hotkeyStatusKey);
    const ok = await window.__TAURI__.core.invoke("reconnect_vr");
    hotkeyStatusKey = ok ? "vrStatusConnected" : "vrStatusDisconnected";
    statusEl.textContent = t(hotkeyStatusKey);
    // reconnect_vr rebuilds Hud from scratch (Rust-side opacity/accent
    // defaults) — background images reload themselves from disk, but
    // opacity/accent only ever live in this frontend's localStorage, so a
    // fresh Hud needs them pushed again, same as applyAppearance already
    // does at startup/on every settings change.
    if (ok) await pushVrOverlayAppearance(loadAppearance());
  });

  let overlayShown = false; // avoids spamming hide calls every frame while idle
  let boxShownAt = 0; // when the box most recently went hidden -> showing, for the fade-in curve
  let boxFadingOutSince = 0; // 0 = not fading out; otherwise when the fade-out began
  let boxFrozenContent = null; // last-rendered {finalText, interimText, endingPreview, progress}, kept alive while fading out
  // Same fade in/out treatment for the VR keyboard panel as the confirm/
  // discard box above — it used to just pop in/out instantly, which read
  // badly in a headset the same way an instant box would.
  let keyboardShownAt = 0;
  let keyboardFadingOutSince = 0;
  let keyboardFrozenButtons = null; // last-rendered button list, kept alive while fading out
  const KEYBOARD_FADE_IN_MS = 300;
  const KEYBOARD_FADE_OUT_MS = 500;
  const CURSOR_BLINK_MS = 530; // roughly matches a typical OS text-caret blink rate
  const CURSOR_BLINK_PAUSE_MS = 600; // how long the cursor stays solid after vrKeyboardCursorActivityAt
  let langTagShown = false; // same, for the separate language-tag overlay
  let tickInFlight = false; // setInterval doesn't wait for the previous async tick's IPC round-trip
  let vrAvailable = false; // updated by the poll below, read by the render loop
  // hotkeyState is local to the poll callback below, but the overlay render
  // callback runs separately. Cache the right stick value here so the render
  // loop can send it to update_keyboard_overlay without reaching across that
  // callback's scope.
  let vrKeyboardGrabDepthStickY = 0;
  let leftAWasPressed = false; // left controller's lower face button (X on Quest) — toggles STT start/stop

  setInterval(async () => {
    if (tickInFlight) return;
    tickInFlight = true;
    try {
      let hotkeyState;
      try {
        hotkeyState = await window.__TAURI__.core.invoke("hotkey_state");
      } catch {
        vrKeyboardGrabDepthStickY = 0;
        return;
      }

      if (!hotkeyState.available) {
        hotkeyStatusKey = "vrStatusDisconnected";
        statusEl.textContent = t(hotkeyStatusKey);
        vrAvailable = false;
        vrKeyboardGrabDepthStickY = 0;
        return;
      }
      hotkeyStatusKey = "vrStatusConnected";
      statusEl.textContent = t(hotkeyStatusKey);
      vrAvailable = true;
      vrKeyboardGrabDepthStickY = hotkeyState.right.stickY;

      // Left controller's lower face button (X on Quest) steps through the
      // 日本語→English→中文→OFF language cycle, independent of whether a
      // Final is pending — see handleCyclePress()/cycleSttState().
      if (hotkeyState.left.a && !leftAWasPressed) {
        handleCyclePress();
      }
      leftAWasPressed = hotkeyState.left.a;

      // Stick short/long press, and grip/trigger double-click, for both
      // hands — independently assignable to any hotkey action (see
      // processStickPress/processDoubleClick/fireHotkeyAssignment), e.g.
      // the default right stick short-press=cancel/clear-all, right
      // trigger double-click=toggle-keyboard. Works in either UI mode —
      // the app's own desktop/VR setting is about which on-screen controls
      // this app shows, not whether SteamVR itself is connected (and this
      // whole tick already only runs when hotkeyState.available is true,
      // i.e. SteamVR is actually reachable — see the early return above).
      // Reads assignments fresh each tick, same as the hold-based hotkeys
      // further down, so a settings change takes effect immediately.
      const stickAssignments = loadHotkeyAssignments();
      processStickPress("right", hotkeyState.right, stickAssignments.right);
      processStickPress("left", hotkeyState.left, stickAssignments.left);
      // Before processDoubleClick, so a grip press that grabs the keyboard
      // is already marked as a grab by the time the double-click logic sees
      // it (see its own grip exemption). Sequential awaits, not parallel:
      // right-before-left is what makes "right wins a same-tick tie" hold.
      await processKeyboardGrab("right", hotkeyState.right);
      await processKeyboardGrab("left", hotkeyState.left);
      processDoubleClick("right", "grip", hotkeyState.right.grip, stickAssignments.right, rightHotkeyHold);
      processDoubleClick("right", "trigger", hotkeyState.right.trigger, stickAssignments.right, rightHotkeyHold);
      processDoubleClick("right", "a", hotkeyState.right.a, stickAssignments.right, rightHotkeyHold);
      processDoubleClick("left", "grip", hotkeyState.left.grip, stickAssignments.left, leftHotkeyHold);
      processDoubleClick("left", "trigger", hotkeyState.left.trigger, stickAssignments.left, leftHotkeyHold);
      processDoubleClick("left", "a", hotkeyState.left.a, stickAssignments.left, leftHotkeyHold);

      // VR keyboard: each hand's trigger press engages whatever key *that
      // hand's own* pointer was last reported over (see the render loop's
      // update_keyboard_overlay call and vrKeyboardHands[hand].highlightedIndex —
      // both hands are ray-cast every tick, fully independent of each
      // other); while held, the render loop tracks a live flick direction
      // from where that hand currently points (see
      // updateVrKeyboardFlickDirection); release applies the result (see
      // applyVrKeyboardAction). This runs
      // unconditionally — harmless when the keyboard isn't shown — but
      // engage/apply only actually do anything while vrKeyboardVisible is true.
      processVrKeyboardTrigger("right", hotkeyState.right, vrKeyboardRightTriggerWasPressed);
      vrKeyboardRightTriggerWasPressed = hotkeyState.right.trigger;
      processVrKeyboardTrigger("left", hotkeyState.left, vrKeyboardLeftTriggerWasPressed);
      vrKeyboardLeftTriggerWasPressed = hotkeyState.left.trigger;

      // While the VR keyboard is up, its own send button/stick-press/
      // double-click own confirming text (see toggleVrKeyboard) — the
      // grip/trigger-hold ending flow below is suppressed entirely rather
      // than racing it, unless the user opted into both being active at
      // once (see hotkeyActiveDuringKeyboardCache's own comment).
      if (!pendingFinalText || (vrKeyboardVisible && !hotkeyActiveDuringKeyboardCache)) {
        resetHotkeyHold();
        return;
      }

      const assignments = loadHotkeyAssignments();
      const now = Date.now();
      processHandHotkey(rightHotkeyHold, withoutGrabbingGrip("right", hotkeyState.right), assignments.right, now);
      // The right hand's processing above may have just fired (sent an
      // ending or discarded), clearing pendingFinalText — don't let the
      // left hand act on now-stale text in the same tick.
      if (pendingFinalText) processHandHotkey(leftHotkeyHold, withoutGrabbingGrip("left", hotkeyState.left), assignments.left, now);
    } finally {
      tickInFlight = false;
    }
  }, HOTKEY_POLL_MS);

  // Renders on its own fast timer instead of the much coarser hotkey-poll
  // cadence above, so the progress bar advances smoothly instead of visibly
  // stepping every 50ms. Only interpolates elapsed time against whatever
  // the poll loop above last computed for each hand — it never re-reads the
  // controller itself, so it stays cheap even at a high rate. Uses
  // setInterval rather than requestAnimationFrame because rAF is capped to
  // the desktop monitor's refresh rate (commonly 60Hz), which is slower
  // than the VR headset's — the HUD is seen in the headset, not on the
  // desktop window, so there's no reason to cap there.
  const OVERLAY_RENDER_MS = 8; // ~125Hz
  // Abrupt appear/disappear reads badly in a headset — fade in quickly when
  // new content shows up, but fade out more gently so it doesn't feel like
  // it's being yanked away the instant text is sent/discarded.
  const BOX_FADE_IN_MS = 300;
  const BOX_FADE_OUT_MS = 500;
  let renderInFlight = false;

  async function renderOverlayTick() {
    const now = Date.now();

    let boxPromise = null;
    // Interim (still being recognized) text is shown alongside pending
    // Final text now, not just once something's actually confirmed — see
    // overlay.rs's render() for how the two are colored differently.
    // vrKeyboardVisible keeps this box (and its cursor) showing even with
    // nothing typed yet — otherwise opening the keyboard with no pending
    // voice-recognized text (typing a message from scratch) would show no
    // box, and so no cursor, until the first character landed.
    if (vrAvailable && (pendingFinalText || currentInterimText || vrKeyboardVisible)) {
      boxFadingOutSince = 0;
      boxFrozenContent = null;
      if (!overlayShown) {
        overlayShown = true;
        boxShownAt = now;
      }
      // Both hands can be mid-hold at once with different actions; only one
      // can be shown, so the priority hand wins when both have something
      // assigned to their current gesture, falling back to whichever one
      // does if only one does. Green = this hold will send an ending (with
      // a preview of that ending shown below the main text), red = it'll
      // discard, no bar at all if neither hand's current gesture is
      // assigned to anything — and not while *that same hand's*
      // doubleClickStageFor already reads 1 or 2 (see its own comment for
      // why that only happens *after* release, never while a button is
      // still down): the bar always gets first say the instant a press
      // starts (nothing yet distinguishes a hold from the first half of a
      // double-click), and only hands off to the two-circle indicator once
      // that press is released without having crossed the hold threshold.
      const otherHandName = hotkeyPriorityHandCache === "left" ? "right" : "left";
      const priorityHold = hotkeyPriorityHandCache === "left" ? leftHotkeyHold : rightHotkeyHold;
      const otherHold = hotkeyPriorityHandCache === "left" ? rightHotkeyHold : leftHotkeyHold;
      const holdCandidates = [
        { hold: priorityHold, hand: hotkeyPriorityHandCache },
        { hold: otherHold, hand: otherHandName },
      ];
      const holdDisplay = holdCandidates.find(({ hold, hand }) => hold.activeAssignment && !doubleClickStageFor(hand))?.hold ?? null;
      let progress = null;
      let endingPreview = null;
      if (holdDisplay && holdDisplay.activeAssignment === HOTKEY_CANCEL_ACTION) {
        progress = { isSend: false, fraction: (now - holdDisplay.activeSince) / hotkeyHoldMsCache };
      } else if (holdDisplay) {
        progress = { isSend: true, fraction: (now - holdDisplay.activeSince) / hotkeyHoldMsCache };
        endingPreview = endingForAssignment(holdDisplay.activeAssignment)?.text ?? null;
      }
      // Same priority-hand pattern as holdDisplay above, for the two-circle
      // double-click indicator (see doubleClickStageFor: 0 none, 1 first
      // click registered, 2 just fired) — and, when nothing from the hold
      // side already claimed endingPreview, showing what a completed
      // double-click would send too, so a double-click reads the same as a
      // hold: the preview line above whichever indicator (bar or dots) is
      // currently live, matching the report that double-clicking "blind"
      // (with no indication of which 語尾 it'd send) felt uneasy.
      const priorityDoubleClick = doubleClickDisplayFor(hotkeyPriorityHandCache);
      const otherDoubleClick = doubleClickDisplayFor(otherHandName);
      const doubleClickDisplay = priorityDoubleClick ?? otherDoubleClick;
      const doubleClick = doubleClickDisplay
        ? { stage: doubleClickDisplay.stage, isSend: doubleClickDisplay.assignment !== HOTKEY_CANCEL_ACTION }
        : null;
      if (!endingPreview && doubleClickDisplay && doubleClickDisplay.assignment !== HOTKEY_CANCEL_ACTION) {
        endingPreview = endingForAssignment(doubleClickDisplay.assignment)?.text ?? null;
      }
      // cursor is only meaningful while the VR keyboard is actually editing
      // this text (see toggleVrKeyboard/insertAtVrKeyboardCursor etc.) —
      // null the rest of the time so draw_text_block doesn't draw one.
      // Also null on alternating CURSOR_BLINK_MS windows regardless, for a
      // standard blinking-caret look, EXCEPT right after the cursor's own
      // position last changed (see vrKeyboardCursorActivityAt) — blinking
      // through a cursor move made it hard to tell where it landed, so it
      // stays solid for a bit after any move/edit and only starts blinking
      // once that settles. Box *visibility* itself no longer depends on
      // this at all — see update_overlay's own `editing` param, added after
      // reusing cursor-is-null for both caused the whole box to flicker
      // hidden every time the blink cycled off.
      const cursorRecentlyMoved = now - vrKeyboardCursorActivityAt < CURSOR_BLINK_PAUSE_MS;
      const cursorBlinkOn = cursorRecentlyMoved || Math.floor(now / CURSOR_BLINK_MS) % 2 === 0;
      const cursor = vrKeyboardVisible && cursorBlinkOn ? vrKeyboardCursorPos : null;
      // Marks everything not yet confirmed (see vrKeyboardConfirmedLength's
      // own comment) — whatever 変換/確定 would next act on.
      const hasUnconfirmed = pendingFinalText.length > vrKeyboardConfirmedLength;
      const highlightStart = hasUnconfirmed ? vrKeyboardConfirmedLength : null;
      const highlightEnd = hasUnconfirmed ? pendingFinalText.length : null;
      const content = {
        finalText: pendingFinalText,
        interimText: currentInterimText,
        endingPreview,
        progress,
        doubleClick,
        cursor,
        editing: vrKeyboardVisible,
        highlightStart,
        highlightEnd,
      };
      boxFrozenContent = content;
      const fadeAlpha = Math.min(1, (now - boxShownAt) / BOX_FADE_IN_MS);
      boxPromise = window.__TAURI__.core.invoke("update_overlay", { ...content, fadeAlpha });
    } else if (overlayShown) {
      // Content just disappeared (sent/discarded/cleared) — keep showing
      // the last frame's content, frozen, while alpha ramps down, instead
      // of cutting straight to hidden.
      if (!boxFadingOutSince) boxFadingOutSince = now;
      const elapsed = now - boxFadingOutSince;
      if (elapsed >= BOX_FADE_OUT_MS) {
        overlayShown = false;
        boxFadingOutSince = 0;
        boxFrozenContent = null;
        boxPromise = window.__TAURI__.core.invoke("update_overlay", {
          finalText: "",
          interimText: "",
          endingPreview: null,
          progress: null,
          doubleClick: null,
          cursor: null,
          editing: false,
          highlightStart: null,
          highlightEnd: null,
          fadeAlpha: 0,
        });
      } else {
        const fadeAlpha = 1 - elapsed / BOX_FADE_OUT_MS;
        boxPromise = window.__TAURI__.core.invoke("update_overlay", { ...boxFrozenContent, fadeAlpha });
      }
    }

    // The language tag is a separate overlay positioned relative to the
    // box's own (unchanged) geometry — it flashes on its own schedule and
    // doesn't need the confirm/discard box to be showing.
    let tagPromise = null;
    const langTagActive = vrAvailable && now < langTagUntil;
    if (langTagActive) {
      langTagShown = true;
      tagPromise = window.__TAURI__.core.invoke("update_lang_tag", {
        label: langTagLabel,
        elapsedSecs: (now - langTagShownAt) / 1000,
      });
    } else if (langTagShown) {
      langTagShown = false;
      tagPromise = window.__TAURI__.core.invoke("update_lang_tag", { label: null, elapsedSecs: 0 });
    }

    // VR flick-input keyboard (TASK.md #23) — see computeVrKeyboardLayout's
    // own comment for why the layout is recomputed and re-sent every frame
    // rather than only on change (update_keyboard_overlay is a "dumb"
    // renderer with no layout state of its own). The pointer overlay rides
    // along for the same reason it exists at all: showing/aiming it only
    // matters while there's a keyboard to aim at.
    let keyboardPromise = null;
    let pointerPromise = null;
    if (vrKeyboardVisible) {
      keyboardFadingOutSince = 0;
      if (!vrKeyboardWasVisible) keyboardShownAt = now;
      const layout = computeVrKeyboardLayout();
      vrKeyboardLastLayout = layout;
      const buttons = layout.map((b, i) => {
        const btn = { x: b.x, y: b.y, w: b.w, h: b.h, label: b.label, selected: !!b.selected, toggledOn: !!b.toggledOn, flickHint: b.flickHint };
        // Only a held kana/punctuation key gets the flick cross (see
        // vrKeyboardFlickCells) — check both hands, since each engages
        // independently now (see vrKeyboardHands' own comment); if both
        // somehow ended up engaged on the same button, the right hand's
        // wins, purely for a deterministic pick in that rare overlap.
        const engagedHand = vrKeyboardHands.right.engagedIndex === i ? "right" : vrKeyboardHands.left.engagedIndex === i ? "left" : null;
        if (engagedHand && b.flickCells) {
          const engagedDirection = vrKeyboardHands[engagedHand].engagedDirection;
          const base = b.action.base;
          const centerChar = resolveFlickChar(base, "center");
          btn.flick = {};
          for (const dir of ["center", "up", "left", "right", "down"]) {
            const char = resolveFlickChar(base, dir);
            if (dir !== "center" && char === centerChar) continue; // no flick that way (e.g. 、 key's down)
            // "center" always renders at the key's own full x/y/w/h, not
            // b.flickCells.center — an edge column's flickCells.center is
            // narrowed (see vrKeyboardFlickCells' own comment) to make room
            // for a same-side left/right flick cell that has no neighboring
            // key to draw over, but that narrowing is a hit-test-only
            // concern; rendering the base key any smaller than usual just
            // because it's flicked reads as a visual glitch.
            const cellBox = dir === "center" ? { x: b.x, y: b.y, w: b.w, h: b.h } : b.flickCells[dir];
            btn.flick[dir] = { ...cellBox, label: char, selected: dir === engagedDirection };
          }
        }
        return btn;
      });
      keyboardFrozenButtons = buttons;
      const fadeAlpha = Math.min(1, (now - keyboardShownAt) / KEYBOARD_FADE_IN_MS);
      keyboardPromise = window.__TAURI__.core
        .invoke("update_keyboard_overlay", {
          visible: true,
          buttons,
          fadeAlpha,
          cursorBox: VR_KB_CURSOR_BOX,
          fixedPosition: vrKeyboardPositionModeCache === "fixed",
          // This tick is a fresh open (including a reopen mid-fade-out,
          // which Rust can't see on its own — see update_keyboard_overlay's
          // own `reanchor` comment): fixed mode re-anchors in front of the
          // head on every open rather than reusing the last spot.
          reanchor: !vrKeyboardWasVisible,
          // Right stick pushes/pulls the panel along view depth while it's
          // being grip-dragged, regardless of which hand is holding it —
          // see apply_keyboard_grab_depth. Harmless to send even when
          // nothing is grabbed (Rust just ignores it then).
          grabDepthStickY: vrKeyboardGrabDepthStickY,
        })
        .then((result) => {
          vrKeyboardHands.right.highlightedIndex = result.right.highlightedIndex;
          vrKeyboardHands.left.highlightedIndex = result.left.highlightedIndex;
          vrKeyboardHands.right.aimingAtPanel = result.right.hitX !== null;
          vrKeyboardHands.left.aimingAtPanel = result.left.hitX !== null;
          vrKeyboardHands.right.boxCursorIndex = result.right.boxCursorIndex;
          vrKeyboardHands.left.boxCursorIndex = result.left.boxCursorIndex;
          // Here rather than in the poll loop: this is where fresh aim data
          // arrives, at the render rate. Both hands, independently.
          updateVrKeyboardFlickDirection("right", result.right.hitX, result.right.hitY);
          updateVrKeyboardFlickDirection("left", result.left.hitX, result.left.hitY);
        });
      // Per-hand — a hand's own laser only shows once its aim actually lands
      // within the panel's or the box's bounds (see aimingAtPanel's/
      // boxCursorIndex's own comments), not just because the keyboard is
      // open. One tick of lag: this reads whatever the *previous*
      // update_keyboard_overlay call found, since this tick's own result
      // isn't back yet (same lag the highlight/flick direction already
      // accept elsewhere).
      pointerPromise = window.__TAURI__.core.invoke("update_pointer_overlays", {
        rightVisible: vrKeyboardHands.right.aimingAtPanel || vrKeyboardHands.right.boxCursorIndex !== null,
        leftVisible: vrKeyboardHands.left.aimingAtPanel || vrKeyboardHands.left.boxCursorIndex !== null,
      });
    } else if (vrKeyboardWasVisible || keyboardFadingOutSince) {
      // Keeps showing the last frame's buttons, frozen, at a ramping alpha —
      // same "don't cut straight to hidden" treatment as the confirm/
      // discard box (see boxFadingOutSince above). The pointer/laser isn't
      // part of this — it just hides immediately, since aiming stops
      // mattering the instant the keyboard starts closing.
      if (!keyboardFadingOutSince) keyboardFadingOutSince = now;
      const elapsed = now - keyboardFadingOutSince;
      vrKeyboardHands.right.highlightedIndex = null;
      vrKeyboardHands.left.highlightedIndex = null;
      vrKeyboardHands.right.aimingAtPanel = false;
      vrKeyboardHands.left.aimingAtPanel = false;
      vrKeyboardHands.right.boxCursorIndex = null;
      vrKeyboardHands.left.boxCursorIndex = null;
      if (elapsed >= KEYBOARD_FADE_OUT_MS) {
        keyboardFadingOutSince = 0;
        keyboardFrozenButtons = null;
        keyboardPromise = window.__TAURI__.core.invoke("update_keyboard_overlay", {
          visible: false,
          buttons: [],
          fadeAlpha: 0,
          cursorBox: VR_KB_CURSOR_BOX,
          fixedPosition: vrKeyboardPositionModeCache === "fixed",
          reanchor: false,
          // Fading out or already hidden — nothing to grab, see
          // grabDepthStickY's own comment on the fresh-open call above.
          grabDepthStickY: 0,
        });
      } else {
        const fadeAlpha = 1 - elapsed / KEYBOARD_FADE_OUT_MS;
        keyboardPromise = window.__TAURI__.core.invoke("update_keyboard_overlay", {
          visible: true,
          buttons: keyboardFrozenButtons ?? [],
          fadeAlpha,
          cursorBox: VR_KB_CURSOR_BOX,
          // Fades out wherever it currently is — the mode is still applied
          // (a switch mid-fade-out takes effect too), just never re-anchored.
          fixedPosition: vrKeyboardPositionModeCache === "fixed",
          reanchor: false,
          grabDepthStickY: 0,
        });
      }
      pointerPromise = window.__TAURI__.core.invoke("update_pointer_overlays", { rightVisible: false, leftVisible: false });
    }
    vrKeyboardWasVisible = vrKeyboardVisible;

    if (!boxPromise && !tagPromise && !keyboardPromise && !pointerPromise) return;
    await Promise.all([boxPromise, tagPromise, keyboardPromise, pointerPromise].filter(Boolean)).catch((err) => log(`[overlay] ${err}`));
  }

  setInterval(() => {
    if (renderInFlight) return;
    renderInFlight = true;
    // Keep the in-flight guard recoverable even if a synchronous exception
    // escapes this tick. Without the catch/finally, one frontend error would
    // leave renderInFlight=true forever and silently freeze every overlay.
    renderOverlayTick()
      .catch((err) => log(`[overlay] ${err}`))
      .finally(() => {
        renderInFlight = false;
      });
  }, OVERLAY_RENDER_MS);
}

function setSttLang(lang) {
  const radio = document.querySelector(`input[name="stt-lang"][value="${lang}"]`);
  if (radio) radio.checked = true;
}

// Falls back to Japanese when "off" is currently selected (e.g. nothing's
// been started yet this session) — used by the round start/stop button,
// which just resumes/pauses rather than carrying its own language choice.
function getSttLangOrDefault() {
  const current = getSttLang();
  return current === "off" ? "ja-JP" : current;
}

// Web Speech API has no equivalent to SenseVoice/Whisper's language: "auto"
// (see senseVoiceLangCode() below) — recognition.lang needs one concrete
// BCP-47 tag, so when the stt-lang radio is set to "auto" this falls back
// to Japanese instead, same as getSttLangOrDefault()'s "off" case.
function getSttLangForWebSpeech() {
  const lang = getSttLangOrDefault();
  return lang === "auto" ? "ja-JP" : lang;
}

// SenseVoice's own short language codes, not BCP-47 — see load_recognizer()
// in sense_voice.rs. Pinning one (instead of "auto") skips its language-ID
// step, which is both faster and avoids the occasional misdetection auto
// mode is prone to on short utterances — but it also means the model won't
// output anything outside that one language, which is wrong for utterances
// that legitimately mix in foreign words (e.g. "VR" inside an otherwise
// Japanese sentence). "auto" is exposed directly as a 5th stt-lang option
// (see index.html) for exactly that case: SENSE_VOICE_LANG_CODES has no
// "auto" key on purpose, so looking it up here falls through to the `??
// "auto"` default below and passes it straight to sense_voice.rs unchanged.
const SENSE_VOICE_LANG_CODES = { "ja-JP": "ja", "en-US": "en", "zh-CN": "zh", "ko-KR": "ko" };

function senseVoiceLangCode() {
  return SENSE_VOICE_LANG_CODES[getSttLangOrDefault()] ?? "auto";
}

// The source of truth for "what was last asked for", updated the instant
// setSttState() is called — unlike `armed`, which only flips true once
// startGoogleStt()'s async chain (getUserMedia() etc., often slow right
// after launch) actually finishes. cycleSttState() reads this instead of
// armed/getSttLang() so a press landing in that gap still computes the
// correct next step instead of re-deriving a stale "off" and re-picking
// 日本語 (this was causing "JP, JP" or "JP → EN → JP" instead of advancing).
let sttStateValue = "off";

// Overlapping setSttState() calls (e.g. two presses before the first one's
// startGoogleStt() has actually resolved) used to race — both would call
// startGoogleStt()/stopGoogleStt() on top of each other, leaking a mic
// stream/SpeechRecognition object. Chaining each call onto this promise
// makes it wait for the previous one to fully settle first; if the target
// changed again in the meantime, the now-stale call just no-ops instead of
// briefly applying an outdated language.
let sttStateChain = Promise.resolve();

// Native self-names, deliberately not translated by UI language (see I18N's
// top comment) — only "off"/"auto" are actual UI strings, via t().
const STT_STATE_LABELS = { "ja-JP": "日本語", "en-US": "English", "zh-CN": "中文", "ko-KR": "한국어" };

function sttStateLabel(value) {
  if (value === "off") return t("sttOff");
  if (value === "auto") return t("sttAuto");
  return STT_STATE_LABELS[value] ?? value;
}

// The single entry point for changing what's being recognized (or turning
// recognition off) — keeps the desktop radio group, the VR overlay's
// language tag, the desktop status label, and the actual recognition
// session in sync no matter which control triggered the change: a radio
// click, the round start/stop button, or the VR controller's cycle (see
// cycleSttState()).
function setSttState(value) {
  sttStateValue = value;
  setSttLang(value);
  sttStateLabelEl.textContent = sttStateLabel(value);
  flashLangTag(value);
  sttStateChain = sttStateChain.then(async () => {
    if (sttStateValue !== value) return; // superseded by a later call while queued
    if (armed) stopGoogleStt();
    if (value !== "off") await startGoogleStt();
  });
}

const TTS_LANG_ENABLED_KEY = "mutelink.ttsLangEnabled";
// Japanese only by default — unlike sttCycleLangDefault() above, this is
// NOT tied to the UI language: VOICEVOX's OpenJTalk text analyzer only
// really handles Japanese (see ttsLangHint's own text), so English/中文/
// 한국어 read-aloud coming out broken isn't specific to which language the
// user happens to have the UI set to.
const TTS_LANG_ENABLED_DEFAULT = { "ja-JP": true, "en-US": false, "zh-CN": false, "ko-KR": false };

function loadTtsLangEnabled() {
  try {
    const raw = JSON.parse(localStorage.getItem(TTS_LANG_ENABLED_KEY) ?? "null");
    if (raw && typeof raw === "object") {
      return { ...TTS_LANG_ENABLED_DEFAULT, ...raw };
    }
  } catch {
    // fall through
  }
  return { ...TTS_LANG_ENABLED_DEFAULT };
}

function saveTtsLangEnabled(map) {
  localStorage.setItem(TTS_LANG_ENABLED_KEY, JSON.stringify(map));
}

function setupTtsLangSettings() {
  const enabled = loadTtsLangEnabled();
  for (const checkbox of document.querySelectorAll('input[name="tts-lang"]')) {
    checkbox.checked = enabled[checkbox.value] ?? true;
    checkbox.addEventListener("change", () => {
      const map = loadTtsLangEnabled();
      map[checkbox.value] = checkbox.checked;
      saveTtsLangEnabled(map);
    });
  }
}

const STT_CYCLE_LANG_KEY = "mutelink.sttCycleLangs";
const UI_LANG_TO_STT_LANG = { ja: "ja-JP", en: "en-US", zh: "zh-CN", ko: "ko-KR" };

// Only the language matching the current UI language starts checked — not
// all four — so a fresh install (or a reset, see resetClearsKeys()) doesn't
// hand someone who only reads/speaks one of these four languages a cycle
// that includes the other three unasked. "auto" is never on by default
// either: it's a slower, occasional-use mode (see
// SENSE_VOICE_LANG_CODES/senseVoiceLangCode()), so it shouldn't show up
// uninvited in the middle of an existing cycle. A function, not a plain
// object, since it depends on loadUiLang() at the time it's actually
// needed (a reset reads this fresh after clearing storage, not once at
// module load).
function sttCycleLangDefault() {
  const sttLang = UI_LANG_TO_STT_LANG[loadUiLang()] ?? "ja-JP";
  return { "ja-JP": false, "en-US": false, "zh-CN": false, "ko-KR": false, auto: false, [sttLang]: true };
}

function loadSttCycleLangs() {
  try {
    const raw = JSON.parse(localStorage.getItem(STT_CYCLE_LANG_KEY) ?? "null");
    if (raw && typeof raw === "object") {
      return { ...sttCycleLangDefault(), ...raw };
    }
  } catch {
    // fall through
  }
  return sttCycleLangDefault();
}

function saveSttCycleLangs(map) {
  localStorage.setItem(STT_CYCLE_LANG_KEY, JSON.stringify(map));
}

function setupSttCycleLangSettings() {
  const enabled = loadSttCycleLangs();
  for (const checkbox of document.querySelectorAll('input[name="stt-cycle-lang"]')) {
    checkbox.checked = enabled[checkbox.value] ?? true;
    checkbox.addEventListener("change", () => {
      const map = loadSttCycleLangs();
      map[checkbox.value] = checkbox.checked;
      saveSttCycleLangs(map);
    });
  }
}

function setupMicSensitivitySettings() {
  const input = document.querySelector("#voice-rms-threshold-input");
  const val = document.querySelector("#voice-rms-threshold-val");

  const render = () => {
    val.textContent = `${(voiceRmsThresholdCache * 100).toFixed(1)}%`;
  };

  voiceRmsThresholdCache = loadVoiceRmsThreshold();
  input.value = voiceRmsThresholdCache;
  render();
  input.addEventListener("input", () => {
    voiceRmsThresholdCache = Number(input.value);
    render();
    saveVoiceRmsThreshold(voiceRmsThresholdCache);
  });
}

// Switching engines/models here only takes effect the next time recognition
// (re)starts — see the `sttEngine = loadSttEngine()` at the top of
// startGoogleStt() — not live mid-session. The interim-preview toggle is the
// one exception (see its own change handler below).
function setupSttEngineSettings() {
  const select = document.querySelector("#stt-engine-select");
  const modelRow = document.querySelector("#stt-model-row");
  const modelSelect = document.querySelector("#stt-model-select");
  const downloadRow = document.querySelector("#sense-voice-download-row");
  const downloadBtn = document.querySelector("#sense-voice-download-btn");
  const cancelBtn = document.querySelector("#sense-voice-cancel-btn");
  const deleteRow = document.querySelector("#sense-voice-delete-row");
  const deleteBtn = document.querySelector("#sense-voice-delete-btn");
  const interimPreviewToggle = document.querySelector("#stt-interim-preview-toggle");

  // downloadRow and deleteRow are two sides of the same state (not
  // downloaded vs. downloaded) — always refreshed together so they can
  // never both show, or both hide, for the selected model at once.
  async function refreshDownloadRow() {
    const isLocal = select.value === "sensevoice";
    modelRow.hidden = !isLocal;
    if (!isLocal) {
      downloadRow.hidden = true;
      deleteRow.hidden = true;
      return;
    }
    const downloaded = await window.__TAURI__.core.invoke("stt_model_downloaded", { modelId: modelSelect.value });
    downloadRow.hidden = downloaded;
    deleteRow.hidden = !downloaded;
  }

  // Greys out (disables, doesn't uncheck) the 言語サイクル checkboxes for
  // whichever languages the currently-selected engine/model combo can't
  // actually do anything different for (see STT_MODEL_SUPPORTED_LANGS) —
  // reflects the Settings dropdowns' own current values, not necessarily
  // what's actually armed (see this function's own leading comment), so it
  // updates immediately as those are changed rather than lagging behind a
  // mic re-arm like sttEngine/sttModel themselves.
  function refreshLangCycleAvailability() {
    const supported = supportedSttLangs(select.value, modelSelect.value);
    for (const checkbox of document.querySelectorAll('input[name="stt-cycle-lang"]')) {
      const isSupported = supported.includes(checkbox.value);
      checkbox.disabled = !isSupported;
      checkbox.closest("label").classList.toggle("stt-cycle-lang-unsupported", !isSupported);
    }
  }

  select.value = loadSttEngine();
  modelSelect.value = loadSttModel();
  interimPreviewToggle.checked = loadSttInterimPreviewEnabled();
  refreshDownloadRow();
  refreshLangCycleAvailability();

  select.addEventListener("change", () => {
    saveSttEngine(select.value);
    refreshDownloadRow();
    refreshLangCycleAvailability();
  });

  modelSelect.addEventListener("change", () => {
    saveSttModel(modelSelect.value);
    refreshDownloadRow();
    refreshLangCycleAvailability();
  });

  interimPreviewToggle.addEventListener("change", () => {
    sttInterimPreviewEnabled = interimPreviewToggle.checked;
    saveSttInterimPreviewEnabled(sttInterimPreviewEnabled);
  });

  deleteBtn.addEventListener("click", async () => {
    const modelId = modelSelect.value;
    const ok = await showConfirmDialog(t("sttModelDeleteConfirm"));
    if (!ok) return;
    deleteBtn.disabled = true;
    try {
      await window.__TAURI__.core.invoke("delete_stt_model", { modelId });
      log(`[sensevoice] deleted model ${modelId}`);
      await refreshDownloadRow();
    } catch (err) {
      log(`[sensevoice] failed to delete model ${modelId}: ${err}`);
    } finally {
      deleteBtn.disabled = false;
    }
  });

  // Emitted from Rust (see download_stt_model() in sense_voice.rs) as each
  // of the selected model's files streams in — without this, the button
  // just reads "ダウンロード中..." for however long that takes with zero
  // visible change, which is indistinguishable from having actually
  // stalled. `modelId` is checked since the dropdown (disabled during an
  // active download, but not during the brief gap before one starts) could
  // in principle point at a different model than the one these events are
  // still winding down for.
  window.__TAURI__.event.listen("stt-model-download-progress", (event) => {
    const { modelId, bytesDownloaded, totalBytes, bytesBefore } = event.payload;
    if (modelId !== modelSelect.value) return;
    const percent = Math.floor(((bytesBefore + bytesDownloaded) / totalBytes) * 100);
    downloadBtn.textContent = `${t("sttEngineDownloadingButton")} ${percent}%`;
  });

  cancelBtn.addEventListener("click", () => {
    // Fire-and-forget: the download's own invoke() promise (in the
    // downloadBtn handler below) is what settles once Rust actually notices
    // the flag and unwinds — that's what resets the buttons/model select,
    // not this click itself. See cancel_stt_model_download() in
    // sense_voice.rs; a no-op (false) if the download already finished on
    // its own in the meantime, which is fine either way.
    window.__TAURI__.core.invoke("cancel_stt_model_download", { modelId: modelSelect.value });
    cancelBtn.disabled = true;
  });

  downloadBtn.addEventListener("click", async () => {
    const modelId = modelSelect.value;
    downloadBtn.disabled = true;
    modelSelect.disabled = true;
    cancelBtn.hidden = false;
    cancelBtn.disabled = false;
    downloadBtn.textContent = t("sttEngineDownloadingButton");
    try {
      log(`[sensevoice] downloading model ${modelId}...`);
      await window.__TAURI__.core.invoke("download_stt_model", { modelId });
      // Distinct from "ダウンロード中..." on purpose — download and model
      // loading are two separate steps that can each take a while, and
      // without this the button just sits on stale "100%" text the whole
      // time load_stt_model() is running, indistinguishable from the
      // download itself still being in progress.
      log("[sensevoice] download done, loading model...");
      cancelBtn.hidden = true; // no cancelling the (much quicker) load step
      downloadBtn.textContent = t("sttEngineLoadingButton");
      await window.__TAURI__.core.invoke("load_stt_model", { modelId, language: senseVoiceLangCode() });
      log("[sensevoice] model loaded");
      await refreshDownloadRow();
    } catch (err) {
      downloadBtn.textContent = t("sttEngineDownloadButton");
      log(err === "cancelled" ? `[sensevoice] download of ${modelId} cancelled` : `[sensevoice] model download/load failed: ${err}`);
    } finally {
      downloadBtn.disabled = false;
      modelSelect.disabled = false;
      cancelBtn.hidden = true;
    }
  });
}

// Hoisted to module scope: set here, read by setupHotkeys()'s overlay
// render loop, which is defined in a different function but needs to know
// whether a language switch (or an OFF) just happened, to flash the
// "EN"/"JP"/"CN"/"OFF" tag in VR — even if there's no pending Final (and so
// no confirm/discard box) at the moment it occurs.
let langTagLabel = null;
let langTagShownAt = 0;
let langTagUntil = 0;
// Matches overlay.rs's render_lang_tag animation: pop-in/settle finishes by
// 0.3s, holds fully opaque until 2.5s, then fades out linearly through 3.5s.
const LANG_TAG_DISPLAY_MS = 3500;
const STT_LANG_TAG_LABELS = { "ja-JP": "JP", "en-US": "EN", "zh-CN": "CN", "ko-KR": "KR", auto: "AUTO" };

// `value` is a stt-lang radio value: a BCP-47 code for JP/EN/CN, or "off".
function flashLangTag(value) {
  langTagLabel = value === "off" ? "OFF" : (STT_LANG_TAG_LABELS[value] ?? null);
  langTagShownAt = Date.now();
  langTagUntil = langTagShownAt + LANG_TAG_DISPLAY_MS;
}

const STT_CYCLE_LANGS_ALL = ["ja-JP", "en-US", "zh-CN", "ko-KR", "auto"];

// Only the languages checked in 設定 > General > 言語サイクル participate,
// further narrowed to whatever the active engine/model can actually do
// something different for (see currentSttSupportedLangs()) — cycling into a
// language a fixed-vocabulary local model (e.g. parakeet-ja) would just
// silently ignore isn't useful. Always ends with "off"; falls back to
// whatever's supported if none of the checked ones are, so the cycle never
// becomes a no-op.
function sttCycleOrder() {
  const enabled = loadSttCycleLangs();
  const candidates = STT_CYCLE_LANGS_ALL.filter((lang) => currentSttSupportedLangs().includes(lang));
  const langs = candidates.filter((lang) => enabled[lang]);
  return [...(langs.length > 0 ? langs : candidates), "off"];
}

// Advances one step through whichever languages are enabled for the cycle →
// OFF → back to the first one, via setSttState() — bound to the left
// controller's lower face button (see setupHotkeys()) as a hands-free way to
// switch languages without touching the desktop.
function cycleSttState() {
  const order = sttCycleOrder();
  const next = order[(order.indexOf(sttStateValue) + 1) % order.length];
  setSttState(next);
}

// XSOverlay binds its own gesture to a quick double-press of this same
// button, which was landing here too and advancing the cycle twice instead
// of once. Rather than try to distinguish "our" press from XSOverlay's,
// treat any second press within CYCLE_DOUBLE_PRESS_MS of the first as
// canceling it out entirely — a genuine single press only takes effect once
// this window passes without a second one.
const CYCLE_DOUBLE_PRESS_MS = 300;
let pendingCycleTimer = null;

function handleCyclePress() {
  if (pendingCycleTimer) {
    clearTimeout(pendingCycleTimer);
    pendingCycleTimer = null;
    return;
  }
  pendingCycleTimer = setTimeout(() => {
    pendingCycleTimer = null;
    cycleSttState();
  }, CYCLE_DOUBLE_PRESS_MS);
}

window.addEventListener("DOMContentLoaded", async () => {
  // Absolute first thing — before anything below reads endings/character/
  // templates/hotkey assignments (all profile-scoped now, see the Profile
  // system's own comment), so an upgrading install never sees a blank/
  // default profile even for one frame.
  migrateLegacyProfileDataIfNeeded();

  // First thing: translates all static [data-i18n] text right away. The
  // dynamic pieces (status text, ending list, hotkey dropdowns, character
  // panel) just no-op here since appReady is still false — they render
  // correctly on their own once their own setup*() below runs, already
  // using the uiLang this just set.
  applyUiLang(loadUiLang());

  logEl = document.querySelector("#log");
  googleBtn = document.querySelector("#google-btn");
  statusDotEl = document.querySelector("#status-dot");
  googleStatusEl = document.querySelector("#google-status");
  sttStateLabelEl = document.querySelector("#stt-state-label");
  finalTextPartEl = document.querySelector("#final-text-part");
  interimTextPartEl = document.querySelector("#interim-text-part");
  pendingTextEditorEl = document.querySelector("#pending-text-editor");
  pendingTextFinalPartEl = document.querySelector("#pending-text-final-part");
  pendingTextInterimPartEl = document.querySelector("#pending-text-interim-part");
  voicevoxInput = document.querySelector("#voicevox-text");
  voicevoxBtn = document.querySelector("#voicevox-btn");
  voicevoxStatusEl = document.querySelector("#voicevox-status");
  voicevoxStatusEl.textContent = t("statusIdle");
  voicevoxOutputsSelect = document.querySelector("#voicevox-outputs");
  // setupDevicePanel() below mirrors this select's option state, so it must
  // finish populating first.
  await populateOutputDevices();

  setupTitlebar();
  setupEndings();
  setupUiMode();
  setupSettingsDialog();
  setupHotkeys();
  setupTtsLangSettings();
  setupSttCycleLangSettings();
  setupSttEngineSettings();
  setupMicSensitivitySettings();
  checkForUpdates();

  googleBtn.addEventListener("click", () => {
    // sttStateValue, not armed — same reasoning as cycleSttState().
    setSttState(sttStateValue === "off" ? getSttLangOrDefault() : "off");
  });

  for (const radio of document.querySelectorAll('input[name="stt-lang"]')) {
    radio.addEventListener("change", () => {
      if (radio.checked) setSttState(radio.value);
    });
  }

  voicevoxBtn.addEventListener("click", () => speak());

  setSendMode(loadSendMode());
  document.querySelector("#mode-toggle-btn").addEventListener("click", () => {
    setSendMode(sendMode === "auto" ? "manual" : "auto");
  });

  setChatboxEnabled(loadChatboxEnabled());
  document.querySelector("#chatbox-toggle-btn").addEventListener("click", () => {
    setChatboxEnabled(!chatboxEnabled);
  });

  setTtsEnabled(loadTtsEnabled());
  document.querySelector("#tts-toggle-btn").addEventListener("click", () => {
    setTtsEnabled(!ttsEnabled);
  });

  const uiLangSelect = document.querySelector("#ui-lang-select");
  uiLangSelect.value = uiLang;
  uiLangSelect.addEventListener("change", () => {
    saveUiLang(uiLangSelect.value);
    applyUiLang(uiLangSelect.value);
  });

  // Everything above has now run at least once — from here on,
  // applyUiLang() (e.g. from the picker above) should fully re-render the
  // dynamic pieces too, not just skip them like it did during this initial
  // pass.
  appReady = true;

  // Otherwise #pending-text-overlay's spans sit empty (not even the
  // placeholder) until the first STT event/ending pick/discard happens to
  // call this reactively — nothing does so on a fresh load.
  renderMergedText();
});

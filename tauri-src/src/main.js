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
  uiScaleLabel: { ja: "UIサイズ", en: "UI size", zh: "界面大小", ko: "UI 크기" },
  fontScaleLabel: { ja: "フォントサイズ", en: "Font size", zh: "字体大小", ko: "글꼴 크기" },
  fontFamilyLabel: { ja: "フォント", en: "Font", zh: "字体", ko: "글꼴" },
  fontDefault: { ja: "既定", en: "Default", zh: "默认", ko: "기본값" },

  holdDurationLabel: { ja: "保持時間", en: "Hold duration", zh: "按住时长", ko: "유지 시간" },
  secondsSuffix: { ja: "秒", en: "s", zh: "秒", ko: "초" },
  priorityHandLabel: { ja: "優先する手", en: "Priority hand", zh: "优先手", ko: "우선 손" },
  hotkeyProfileLabel: { ja: "プロファイル", en: "Profile", zh: "配置", ko: "프로필" },
  hotkeyProfileHint: {
    ja: "グリップなど一部のボタンをゲーム側(ワールドなど)に使われてしまっているときのために、3種類のホットキー設定を用意して切り替えられます。下の割り当ては選んだプロファイルの内容です。メイン画面の「P1/P2/P3」ボタンでも切り替えられます。",
    en: "In case a game (e.g. a VRChat world) takes over some of your buttons like grip, you can prepare 3 separate hotkey setups and switch between them. The assignments below belong to whichever profile is selected. The \"P1/P2/P3\" button on the main screen switches too.",
    zh: "如果游戏(例如VRChat世界)占用了握把等部分按键，可以准备3套快捷键配置并切换使用。下方的分配对应当前选中的配置。主界面的「P1/P2/P3」按钮也可以切换。",
    ko: "그립 등 일부 버튼을 게임(예: VRChat 월드) 쪽에서 사용 중일 때를 대비해, 3가지 단축키 설정을 만들어 전환할 수 있습니다. 아래 할당은 선택한 프로필의 내용입니다. 메인 화면의 「P1/P2/P3」 버튼으로도 전환할 수 있습니다.",
  },
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
    ja: "右スティック押し込み(単押し)でVR内キーボードの表示/非表示を切り替え、編集後にもう一度押すと送信します(表示中はグリップ/トリガーでの送信は無効になります)。右スティック長押しで入力中の文章を全消しします。どちらも下の「スティック押し込み」「スティック押し込み(長押し)」欄で割り当てを変更できます。開発中の機能です。",
    en: "A short right-stick press toggles the in-VR keyboard; press it again after editing to send (grip/trigger-based sending is disabled while it's shown). A long right-stick press clears whatever's pending. Both are reassignable below (\"Stick press\" / \"Stick press (long)\"). Still in development.",
    zh: "短按右摇杆可切换VR内键盘的显示/隐藏，编辑后再按一次即可发送(显示期间握把/扳机发送将被禁用)。长按右摇杆会清空当前输入内容。两者均可在下方的「摇杆按下」「摇杆按下(长按)」中重新分配。此功能仍在开发中。",
    ko: "오른쪽 스틱을 짧게 누르면 VR 키보드 표시/숨김이 전환되며, 편집 후 다시 누르면 전송됩니다(표시 중에는 그립/트리거 전송이 비활성화됩니다). 오른쪽 스틱을 길게 누르면 입력 중인 내용이 모두 지워집니다. 두 동작 모두 아래의 「스틱 누름」/「스틱 누름(길게)」에서 재할당할 수 있습니다. 아직 개발 중인 기능입니다.",
  },
  // The VR keyboard's own on-screen send button — rendered inside the
  // SteamVR overlay texture by Rust (see overlay.rs's render_keyboard), not
  // an HTML element, so this can't just be a data-i18n attribute like most
  // UI text; computeVrKeyboardLayout() reads it directly via t().
  vrKbSendButton: { ja: "送信", en: "Send", zh: "发送", ko: "전송" },
  // VR keyboard mode buttons (same t()-in-layout situation as above).
  // vrKbModeKana is what an active mode's own button relabels to — it
  // names the destination (back to kana input) rather than a generic
  // "back", since the other mode buttons jump sideways, not back.
  vrKbModeTemplate: { ja: "テンプレ", en: "Phrases", zh: "模板", ko: "템플릿" },
  vrKbModeSymbol: { ja: "記号", en: "Symbols", zh: "符号", ko: "기호" },
  vrKbModeNumber: { ja: "数字", en: "123", zh: "数字", ko: "숫자" },
  vrKbModeEnglish: { ja: "英字", en: "ABC", zh: "英文", ko: "영문" },
  vrKbModeKana: { ja: "かな", en: "Kana", zh: "假名", ko: "가나" },
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
  slotTrigger: { ja: "トリガーのみ", en: "Trigger only", zh: "仅扳机", ko: "트리거만" },
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
  // analyzer) isn't built for those scripts, but that's accepted; the
  // per-language checkboxes in 設定 > Other let read-aloud be turned off for
  // specific languages if the result isn't wanted. "auto" has no checkbox of
  // its own — which language actually came out varies utterance to
  // utterance, so there's nothing sensible to gate a single toggle on —
  // read-aloud always stays on for it.
  const lang = getSttLang();
  if (lang === "auto" || loadTtsLangEnabled()[lang]) {
    // Spaces (half- or full-width) in the recognized text read as an
    // unnatural pause/silence through VOICEVOX, so close them up before
    // speaking — outputText (chatbox) keeps them untouched.
    speak(spokenText.replace(/\s+/g, ""), params);
  } else {
    log(`[voicevox] skipped: read-aloud disabled for ${lang}`);
  }
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
      enqueueVadChunk(chunk.slice(), monitorCtx.sampleRate); // copy — the browser reuses this buffer next callback
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
      senseVoiceInterimBuffer = [];
      senseVoiceLastInterimAt = Date.now();
    }
    senseVoiceInterimBuffer.push(chunk);
  } else if (vadInSpeech) {
    senseVoiceInterimBuffer = [];
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
  setupPresetPanel();
  setupAppearancePanel();
  setupDevicePanel();
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

function loadAppearance() {
  try {
    const raw = JSON.parse(localStorage.getItem(APPEARANCE_STORAGE_KEY) ?? "null");
    if (raw && typeof raw === "object") return raw;
  } catch {
    // fall through to defaults
  }
  return { uiScale: 1, fontScale: 1, fontFamily: "", theme: "system" };
}

function saveAppearance(appearance) {
  localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance));
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

const ENDINGS_STORAGE_KEY = "mutelink.endings";
const DEFAULT_ENDING_PARAMS = {
  speedScale: 1,
  pitchScale: 0,
  intonationScale: 1,
  volumeScale: 1,
  speakEnding: false, // whether VOICEVOX reads this ending aloud at all when it's picked
  reading: "", // what to read instead of the literal text when speakEnding is on; falls back to the text itself if left blank
};
// Fixed at exactly 10 numbered slots (1-10) rather than a free-form list —
// hotkeys are assigned by slot number (see HOTKEY_PROFILES_KEY et al.),
// so editing what's in a slot automatically updates whatever hotkey points
// at that number instead of needing to be re-picked.
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

// Always returns exactly ENDINGS_SLOT_COUNT entries, padding with generic
// placeholders or truncating extras — this used to be a free-length list,
// so anything saved before this became fixed-size gets normalized here
// rather than needing a one-time migration step.
function loadEndings() {
  let list = DEFAULT_ENDINGS;
  try {
    const raw = JSON.parse(localStorage.getItem(ENDINGS_STORAGE_KEY) ?? "null");
    if (Array.isArray(raw) && raw.length > 0 && raw.every((e) => typeof e?.text === "string")) {
      list = raw;
    }
  } catch {
    // fall through to defaults
  }
  list = list.slice(0, ENDINGS_SLOT_COUNT);
  while (list.length < ENDINGS_SLOT_COUNT) {
    list.push({ text: `語尾${list.length + 1}`, ...DEFAULT_ENDING_PARAMS });
  }
  return list;
}

function saveEndings(endings) {
  localStorage.setItem(ENDINGS_STORAGE_KEY, JSON.stringify(endings));
}

// The VR keyboard's "テンプレ" (template) mode — a 12-slot quick-phrase
// picker, separate from `endings` above (endings are appended to a
// confirmed send; templates are inserted at the cursor like any other
// typed text). Storage contract (also relied on by the VR keyboard's own
// layout code in computeVrKeyboardLayout): a plain JSON array of exactly
// VR_KEYBOARD_TEMPLATE_SLOT_COUNT strings, empty string = that slot unset.
const VR_KEYBOARD_TEMPLATES_KEY = "mutelink.vrKeyboardTemplates";
const VR_KEYBOARD_TEMPLATE_SLOT_COUNT = 12;

// Same defensive normalize-on-load shape as loadEndings() above (missing/
// corrupt data just becomes empty slots, no migration/error needed).
function loadVrKeyboardTemplates() {
  let list;
  try {
    const raw = JSON.parse(localStorage.getItem(VR_KEYBOARD_TEMPLATES_KEY) ?? "null");
    list = Array.isArray(raw) ? raw.map((v) => (typeof v === "string" ? v : "")) : [];
  } catch {
    list = [];
  }
  list = list.slice(0, VR_KEYBOARD_TEMPLATE_SLOT_COUNT);
  while (list.length < VR_KEYBOARD_TEMPLATE_SLOT_COUNT) list.push("");
  return list;
}

function saveVrKeyboardTemplates(templates) {
  localStorage.setItem(VR_KEYBOARD_TEMPLATES_KEY, JSON.stringify(templates));
}

// Plain text inputs, one per fixed slot (unlike renderGeneralEndingsList's
// expandable rows — there's nothing to configure per template besides the
// text itself, no add/remove since the slot count is fixed by the
// keyboard's own 12-cell template-mode grid).
function renderVrKeyboardTemplatesList() {
  const list = document.querySelector("#vr-keyboard-templates-list");
  if (!list) return;
  list.innerHTML = "";
  const templates = loadVrKeyboardTemplates();
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
      const current = loadVrKeyboardTemplates();
      current[i] = input.value;
      saveVrKeyboardTemplates(current);
    });

    row.append(label, input);
    list.append(row);
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

// Persists `endings` and refreshes every OTHER view of it (main-screen
// tiles, hotkey assignment dropdowns) — called after a text edit, add, or
// delete. Deliberately doesn't touch the settings list itself: callers that
// need it rebuilt (add/delete) call renderGeneralEndingsList() separately;
// a text edit doesn't, so the row the user's actively editing stays open
// instead of the whole list collapsing back to closed.
function refreshEndingConsumers() {
  saveEndings(endings);
  renderEndingButtons(document.querySelector("#ending-buttons"), endings, applyEnding);
  renderHotkeyAssignmentOptions();
}

// Rebuilt from the shared `endings` array whenever it changes (param edits
// here, or a new favorite added from the main screen), so the two views of
// the same data never drift apart.
// Every hand/slot hotkey combo currently pointing at ending slot number
// `slotNumber` (1-based), as human-readable "右手: トリガーのみ" strings —
// so the 語尾 panel can show right on each row where it's wired up, instead
// of having to go check the Hotkey panel to find out.
function hotkeyRefsForEndingSlot(slotNumber) {
  const assignments = loadHotkeyAssignments();
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

function renderGeneralEndingsList() {
  const list = document.querySelector("#ending-settings-list");
  list.innerHTML = "";

  endings.forEach((ending, i) => {
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
    const refs = hotkeyRefsForEndingSlot(slotNumber);
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
      refreshEndingConsumers();
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
      saveEndings(endings);
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
      saveEndings(endings);
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
        saveEndings(endings);
      });

      val.addEventListener("change", () => {
        let v = Number(val.value);
        if (Number.isNaN(v)) v = ending[def.key];
        v = Math.min(def.max, Math.max(def.min, v));
        ending[def.key] = v;
        val.value = v.toFixed(2);
        input.value = v;
        valuesSpan.textContent = formatEndingSummary(ending);
        saveEndings(endings);
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
    list.appendChild(row);
  });
}

function setupEndingsPanel() {
  renderGeneralEndingsList();
}

function setupTemplatesPanel() {
  renderVrKeyboardTemplatesList();
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

const SELECTED_STYLE_KEY = "mutelink.selectedStyleId";
const DEFAULT_STYLE_ID = 46; // 小夜/SAYO ノーマル, the character bundled with the app

function loadSelectedStyleId() {
  const raw = localStorage.getItem(SELECTED_STYLE_KEY);
  const id = raw !== null ? Number(raw) : DEFAULT_STYLE_ID;
  return Number.isFinite(id) ? id : DEFAULT_STYLE_ID;
}

function saveSelectedStyleId(id) {
  localStorage.setItem(SELECTED_STYLE_KEY, String(id));
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
    ENDINGS_STORAGE_KEY,
    HOTKEY_PROFILES_KEY,
    HOTKEY_ACTIVE_PROFILE_KEY,
    HOTKEY_HOLD_DURATION_KEY,
    HOTKEY_PRIORITY_HAND_KEY,
    APPEARANCE_STORAGE_KEY,
    CHATBOX_ENABLED_KEY,
    TTS_ENABLED_KEY,
    SEND_MODE_KEY,
    STT_ENGINE_KEY,
    STT_MODEL_KEY,
    STT_INTERIM_PREVIEW_KEY,
    SELECTED_STYLE_KEY,
    TTS_LANG_ENABLED_KEY,
    STT_CYCLE_LANG_KEY,
    VOICE_RMS_THRESHOLD_KEY,
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
const HOTKEY_PROFILES_KEY = "mutelink.hotkeyProfiles";
const HOTKEY_ACTIVE_PROFILE_KEY = "mutelink.activeHotkeyProfile";
const HOTKEY_PROFILE_COUNT = 3;
// "stick" (short press) and "stickLong" are two independent slots sharing
// one physical control — see processStickPress for why that needs its own
// dispatch, separate from how the other 4 slots fire (processHandHotkey).
const HOTKEY_SLOTS = ["both", "grip", "trigger", "none", "stick", "stickLong"];
// Map to I18N keys, not translated text directly, so hotkeyRefsForEndingSlot()
// (and anywhere else) always reflects the *current* uiLang via t() rather
// than whatever language was active when this module evaluated.
const HOTKEY_SLOT_LABEL_KEYS = {
  both: "slotBoth",
  grip: "slotGrip",
  trigger: "slotTrigger",
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
// stick short-pressed toggles the VR keyboard and long-pressed clears
// whatever's pending (see HOTKEY_KEYBOARD_TOGGLE_ACTION/HOTKEY_CANCEL_ACTION
// — the keyboard toggle used to be hardcoded to right-stick rather than a
// real assignment, but out-of-the-box short-press behavior stays the
// same); left hand covers 4/5/10 plus a stick-press cancel (ending 3 left
// unset).
function defaultHotkeyAssignments() {
  return {
    right: { both: "1", grip: "", trigger: "2", none: "", stick: HOTKEY_KEYBOARD_TOGGLE_ACTION, stickLong: HOTKEY_CANCEL_ACTION },
    left: { both: "10", grip: "4", trigger: "5", none: "", stick: HOTKEY_CANCEL_ACTION, stickLong: "" },
  };
}

// Which of the HOTKEY_PROFILE_COUNT profiles is currently in effect — both
// for editing (the Hotkey panel's dropdowns show this one) and for live
// hotkey firing (setupHotkeys()'s poll loop calls loadHotkeyAssignments()
// fresh every tick, so switching this takes effect within one tick, no
// extra wiring needed there).
function loadHotkeyProfileIndex() {
  const raw = Number(localStorage.getItem(HOTKEY_ACTIVE_PROFILE_KEY));
  return Number.isInteger(raw) && raw >= 0 && raw < HOTKEY_PROFILE_COUNT ? raw : 0;
}

function saveHotkeyProfileIndex(index) {
  localStorage.setItem(HOTKEY_ACTIVE_PROFILE_KEY, String(index));
}

function loadHotkeyProfiles() {
  const defaults = Array.from({ length: HOTKEY_PROFILE_COUNT }, () => defaultHotkeyAssignments());
  try {
    const raw = JSON.parse(localStorage.getItem(HOTKEY_PROFILES_KEY) ?? "null");
    if (Array.isArray(raw)) {
      return defaults.map((def, i) => {
        const saved = raw[i];
        if (!saved || typeof saved !== "object") return def;
        return {
          right: { ...def.right, ...saved.right },
          left: { ...def.left, ...saved.left },
        };
      });
    }
  } catch {
    // fall through
  }
  return defaults;
}

function saveHotkeyProfiles(profiles) {
  localStorage.setItem(HOTKEY_PROFILES_KEY, JSON.stringify(profiles));
}

// Reads/writes only the *active* profile's assignments — every existing
// caller (renderHotkeyAssignmentOptions, the poll loop, buildPresetObject,
// etc.) keeps working unchanged, now transparently scoped to whichever
// profile setHotkeyProfileIndex() last selected.
function loadHotkeyAssignments() {
  return loadHotkeyProfiles()[loadHotkeyProfileIndex()];
}

function saveHotkeyAssignments(assignments) {
  const profiles = loadHotkeyProfiles();
  profiles[loadHotkeyProfileIndex()] = assignments;
  saveHotkeyProfiles(profiles);
}

// The single entry point for changing which profile is active — keeps the
// main-screen "P1/P2/P3" button, the Hotkey settings radio, and the
// dropdowns showing that profile's assignments all in sync no matter which
// control triggered the switch.
function setHotkeyProfileIndex(index) {
  saveHotkeyProfileIndex(index);
  const profileBtn = document.querySelector("#hotkey-profile-btn");
  if (profileBtn) profileBtn.textContent = `P${index + 1}`;
  const radio = document.querySelector(`input[name="hotkey-profile"][value="${index}"]`);
  if (radio) radio.checked = true;
  renderHotkeyAssignmentOptions();
}

function renderHotkeyAssignmentOptions() {
  const assignments = loadHotkeyAssignments();
  for (const hand of HOTKEY_HANDS) {
    for (const slot of HOTKEY_SLOTS) {
      const select = document.querySelector(`#hotkey-${hand}-${slot}`);
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
      endings.forEach((ending, i) => {
        const opt = document.createElement("option");
        opt.value = String(i + 1);
        opt.textContent = `${i + 1}. ${ending.text}`;
        select.appendChild(opt);
      });
      // Falls back to "(未設定)" automatically if the saved value doesn't
      // match any option (shouldn't normally happen now that slots are
      // fixed at 1-10, but stays safe against stale pre-migration values).
      select.value = assignments[hand][slot];
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
// no-ending path handleFinalRecognizedText's "auto" sendMode uses). A
// screen send button does the same thing without needing the controller
// (see applyVrKeyboardAction's "send" case).
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
// time the keyboard is reopened. Sending is a separate, explicit action
// (the on-keyboard Send key, see sendVrKeyboardTextAndClose) — toggling the
// keyboard off with the stick used to also send/clear the text, which meant
// a plain "put the keyboard away for a second" press quietly submitted
// whatever had been typed so far.
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

function sendVrKeyboardTextAndClose() {
  if (pendingFinalText) {
    dispatchText(pendingFinalText, pendingFinalText);
    pendingFinalText = "";
    renderMergedText();
  }
  closeVrKeyboard();
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
const HOTKEY_STICK_LONG_PRESS_MS = 500;
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

// --- VR keyboard layout + flick input (TASK.md #23) ---
// Must match overlay.rs's KEYBOARD_CANVAS_WIDTH/HEIGHT — the layout itself
// lives entirely here (not duplicated in Rust, see overlay.rs's own top
// comment on this) and gets sent to update_keyboard_overlay every frame.
const VR_KB_CANVAS_WIDTH = 900;
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
// Phone dialpad order, so digit positions are where muscle memory expects.
const VR_KB_NUMBER_INNER = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [null, "0", null],
];
// General symbols not already reachable elsewhere (、。？！ live on the
// punct kana key). No particular ordering convention to match — just
// grouped by kind (brackets, then slashes/at/hash, then misc).
const VR_KB_SYMBOL_INNER = [
  ["(", ")", "["],
  ["]", "{", "}"],
  ["/", "\\", "@"],
  ["#", "&", "*"],
];
// Full-width (replaces all 5 columns). QWERTY's own 26 letters leave 1
// empty slot in row 2 and 3 in row 3 (30 cells total, no dead ones) — ! in
// row 2, ,.? in row 3, per the user's explicit ordering.
const VR_KB_QWERTY_ROWS = ["qwertyuiop", "asdfghjkl!", "zxcvbnm,.?"];

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
let vrKeyboardEnglishCaps = false;

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

// Builds the full button list (pixel rects within VR_KB_CANVAS_WIDTH x
// VR_KB_CANVAS_HEIGHT) + a lookup from button index back to what selecting
// it should do. Recomputed every frame the keyboard is visible — cheap
// (a few dozen small objects), and always reflects the current endings
// list without needing separate invalidation.
function computeVrKeyboardLayout() {
  const buttons = [];

  // Vertical budget (canvas VR_KB_CANVAS_HEIGHT, see its own comment for
  // why that's not a plain 640 anymore): candidates, grid (4 rows), cursor
  // row, 2 ending rows, in that order top to bottom — every vertical
  // measurement below is VR_KB_VERTICAL_SCALE'd from the original 640-tall
  // design so the proportions stay the same at the new canvas height.
  // Horizontal ones (gridLeft/gapX/cellW) are untouched — see
  // VR_KB_CANVAS_HEIGHT's own comment on why only vertical scales.
  const gridTop = Math.round(90 * VR_KB_VERTICAL_SCALE);
  const gridLeft = 20;
  const gridCols = 5;
  const gapX = 10;
  const gapY = Math.round(10 * VR_KB_VERTICAL_SCALE);
  const cellW = (VR_KB_CANVAS_WIDTH - gridLeft * 2 - (gridCols - 1) * gapX) / gridCols; // 164
  const cellH = Math.round(85 * VR_KB_VERTICAL_SCALE);
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
    const candW = (VR_KB_CANVAS_WIDTH - gridLeft * 2 - (maxShown - 1) * gapX) / maxShown;
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

  if (vrKeyboardMode === "english") {
    // Needs all 10 columns, so this replaces the whole 5-column grid
    // (mode column included) — its bottom row carries its own way back.
    const letterW = (VR_KB_CANVAS_WIDTH - gridLeft * 2 - 9 * gapX) / 10;
    VR_KB_QWERTY_ROWS.forEach((row, r) => {
      [...row].forEach((ch, c) => {
        const text = vrKeyboardEnglishCaps ? ch.toUpperCase() : ch;
        buttons.push({ x: gridLeft + c * (letterW + gapX), y: cellY(r), w: letterW, h: cellH, label: text, action: { type: "insert", text } });
      });
    });
    // Space isn't in the QWERTY block (its 30 cells are exactly full), and
    // English without spaces is unusable — it gets the control row's
    // middle slot. 送信 stays in column 5 as in the other modes.
    cell(3, 0, t("vrKbModeKana"), { type: "mode", mode: "kana" });
    cell(3, 1, vrKeyboardEnglishCaps ? "ABC" : "abc", { type: "caps" }, { selected: vrKeyboardEnglishCaps });
    cell(3, 2, t("vrKbSpaceButton"), { type: "insert", text: " " });
    cell(3, 3, "BS", { type: "delete" });
    cell(3, 4, t("vrKbSendButton"), { type: "send" });
  } else {
    // Column 1: an active mode's own button relabels to かな and toggles
    // back; the other two stay live so template↔english (or ↔number/symbol,
    // see numberSymbolButton) is always one press, never a detour through
    // kana mode first. 変換 (henkan) lives here too now, not column 5 — that
    // column is full with Del/BS/Space/Send (see below).
    const modeButton = (mode, labelKey) => [
      t(vrKeyboardMode === mode ? "vrKbModeKana" : labelKey),
      { type: "mode", mode },
      { selected: vrKeyboardMode === mode },
    ];
    // Number and symbol share one physical button (there wasn't room for a
    // 5th column-1 slot once 変換 moved in) — press steps kana -> number ->
    // symbol -> kana, each press's label showing what *that* press leads to
    // (same "shows the next state" convention modeButton uses, just chained
    // over 2 modes instead of 1 — see applyVrKeyboardAction's "modeCycle").
    const numberSymbolButton = () => {
      const modes = ["number", "symbol"];
      const idx = modes.indexOf(vrKeyboardMode);
      const nextMode = idx === -1 ? modes[0] : idx + 1 < modes.length ? modes[idx + 1] : "kana";
      const labelKey = nextMode === "kana" ? "vrKbModeKana" : nextMode === "number" ? "vrKbModeNumber" : "vrKbModeSymbol";
      return [t(labelKey), { type: "modeCycle", modes }, { selected: idx !== -1 }];
    };
    cell(0, 0, ...modeButton("template", "vrKbModeTemplate"));
    cell(1, 0, "変換", { type: "henkan" });
    cell(2, 0, ...numberSymbolButton());
    cell(3, 0, ...modeButton("english", "vrKbModeEnglish"));

    if (vrKeyboardMode === "number") {
      VR_KB_NUMBER_INNER.forEach((row, r) =>
        row.forEach((digit, c) => {
          if (digit !== null) cell(r, c + 1, digit, { type: "insert", text: digit });
        }),
      );
    } else if (vrKeyboardMode === "symbol") {
      VR_KB_SYMBOL_INNER.forEach((row, r) => row.forEach((sym, c) => cell(r, c + 1, sym, { type: "insert", text: sym })));
    } else if (vrKeyboardMode === "template") {
      loadVrKeyboardTemplates().forEach((text, i) => {
        // Unset slots still render (as inert, action-less keys) so every
        // slot keeps a fixed position whether or not its neighbors are set.
        const action = text ? { type: "insert", text } : undefined;
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

    // ⌫ renders as a missing-glyph box in the overlay's font (see
    // rasterize_cached in overlay.rs) — plain "BS" text instead. 変換 moved
    // to column 1 above, freeing this column for the 4 controls below.
    // No forward-delete button (there used to be one, "Del") — BS plus the
    // cursor row's left/right covers the same ground without needing a
    // fifth slot.
    cell(0, 4, "BS", { type: "delete" });
    cell(1, 4, t("vrKbSpaceButton"), { type: "insert", text: " " });
    // 変換 (henkan) cycles a candidate; this explicitly ends the conversion
    // (same reset applyVrKeyboardAction already does before any other
    // action type — see its own top line) without also typing, moving the
    // cursor, or sending, so the user can lock in a pick and stop there.
    cell(2, 4, t("vrKbConfirmButton"), { type: "confirm" });
    cell(3, 4, t("vrKbSendButton"), { type: "send" });
  }

  const ctrlTop = cellY(4);
  const ctrlH = Math.round(50 * VR_KB_VERTICAL_SCALE);
  const cursorActions = [
    // ≪/≫ jump several characters at once — replaced an earlier Home/End
    // pair (jump-to-start/end), which needed the whole string's length to
    // read and didn't help with a mid-string edit the way a plain multi-
    // char skip does.
    { label: "≪", action: { type: "cursor", delta: -VR_KB_CURSOR_JUMP } },
    { label: "◀", action: { type: "cursor", delta: -1 } },
    { label: "▶", action: { type: "cursor", delta: 1 } },
    { label: "≫", action: { type: "cursor", delta: VR_KB_CURSOR_JUMP } },
  ];
  const ctrlW = (VR_KB_CANVAS_WIDTH - gridLeft * 2 - (cursorActions.length - 1) * gapX) / cursorActions.length;
  cursorActions.forEach((btn, i) => {
    buttons.push({ x: gridLeft + i * (ctrlW + gapX), y: ctrlTop, w: ctrlW, h: ctrlH, label: btn.label, action: btn.action });
  });

  // Always shown now (used to be an opt-out toggle in settings — removed,
  // there's no reason not to have quick-send phrases available while the
  // keyboard's up). 2 rows of 5 rather than 1 of 10 — at 1/10 width, most
  // ending texts overflowed their own key.
  const endTop = ctrlTop + ctrlH + gapY;
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

// Hiragana-only run immediately before the cursor — what 変換 (henkan)
// converts. Doesn't reach across kanji/punctuation/latin already in the
// text, only the most recent unconverted hiragana the user just flicked in.
const HIRAGANA_RE = /^[぀-ゟ]+$/;
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

  let start = vrKeyboardCursorPos;
  while (start > 0 && HIRAGANA_RE.test(pendingFinalText[start - 1])) start--;
  if (start === vrKeyboardCursorPos) return; // nothing hiragana right before the cursor to convert

  const segmentText = pendingFinalText.slice(start, vrKeyboardCursorPos);
  try {
    const segments = await window.__TAURI__.core.invoke("convert_kana_to_kanji", { text: segmentText });
    if (!segments || segments.length === 0) return;
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

// The currently-focused segment's own [start, end) range within
// pendingFinalText — derived from the *current* (possibly already-cycled)
// lengths of every segment before it, since each segment's applied
// candidate can be a different length than its original reading. Used for
// both the highlight band (see the render loop) and the candidate-list
// display (see computeVrKeyboardLayout). Returns null when not converting.
function vrKeyboardFocusedSegmentRange() {
  if (vrKeyboardConversionSegments === null) return null;
  let offset = vrKeyboardConversionBase;
  for (let i = 0; i < vrKeyboardConversionFocus; i++) {
    const s = vrKeyboardConversionSegments[i];
    offset += s.candidates[s.index].length;
  }
  const focused = vrKeyboardConversionSegments[vrKeyboardConversionFocus];
  return [offset, offset + focused.candidates[focused.index].length];
}

// Any action other than pressing 変換 again, moving segment focus, or
// picking a candidate directly ends the current conversion cycle — matches
// how a real IME commits whatever's showing the moment you do anything
// else (type more, send, ...).
function resetVrKeyboardConversion() {
  vrKeyboardConversionSegments = null;
  vrKeyboardConversionBase = null;
  vrKeyboardConversionTotalLength = 0;
  vrKeyboardConversionFocus = 0;
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

  switch (action.type) {
    case "key":
      insertAtVrKeyboardCursor(resolveFlickChar(action.base, direction));
      break;
    case "insert":
      insertAtVrKeyboardCursor(action.text);
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
    case "modeCycle": {
      // Shared physical button for >1 mode (currently number+symbol) —
      // steps to the next mode in action.modes each press, wrapping back
      // to kana after the last one. See vrKeyboardNumberSymbolButton for
      // the matching "next mode" label logic.
      const idx = action.modes.indexOf(vrKeyboardMode);
      vrKeyboardMode = idx === -1 ? action.modes[0] : idx + 1 < action.modes.length ? action.modes[idx + 1] : "kana";
      break;
    }
    case "caps":
      vrKeyboardEnglishCaps = !vrKeyboardEnglishCaps;
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
    case "confirm":
      // resetVrKeyboardConversion() already ran above (applyVrKeyboardAction's
      // own top line, for any type other than henkan/selectCandidate/cursor)
      // — this button exists purely so there's a dedicated key for "stop
      // editing this conversion" that doesn't also type, move the cursor,
      // or send.
      break;
    case "send":
      sendVrKeyboardTextAndClose();
      break;
    case "ending":
      if (endings[action.index]) applyEnding(endings[action.index]);
      vrKeyboardVisible = false;
      break;
  }
}

// Set by setupHotkeys() and updated live from its slider/radios; read by
// processHandHotkey() above and the render loop below, both of which run
// outside setupHotkeys()'s own closure timing-wise but are defined inside
// it — module-level so the value assigned there is visible to itself.
let hotkeyHoldMsCache = DEFAULT_HOTKEY_HOLD_MS;
let hotkeyPriorityHandCache = "right";

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

  // 3 independent hotkey profiles, switchable both from here and via the
  // main screen's "P1/P2/P3" button (see setHotkeyProfileIndex()) — for
  // when a game/world takes over a button like grip, so a grip-free profile
  // is one switch away instead of needing to reconfigure on the spot.
  const initialProfileIndex = loadHotkeyProfileIndex();
  for (const radio of document.querySelectorAll('input[name="hotkey-profile"]')) {
    radio.checked = Number(radio.value) === initialProfileIndex;
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      setHotkeyProfileIndex(Number(radio.value));
    });
  }
  const profileBtn = document.querySelector("#hotkey-profile-btn");
  profileBtn.textContent = `P${initialProfileIndex + 1}`;
  profileBtn.addEventListener("click", () => {
    setHotkeyProfileIndex((loadHotkeyProfileIndex() + 1) % HOTKEY_PROFILE_COUNT);
  });

  reconnectBtn.addEventListener("click", async () => {
    hotkeyStatusKey = "vrStatusConnecting";
    statusEl.textContent = t(hotkeyStatusKey);
    const ok = await window.__TAURI__.core.invoke("reconnect_vr");
    hotkeyStatusKey = ok ? "vrStatusConnected" : "vrStatusDisconnected";
    statusEl.textContent = t(hotkeyStatusKey);
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
  let leftAWasPressed = false; // left controller's lower face button (X on Quest) — toggles STT start/stop

  setInterval(async () => {
    if (tickInFlight) return;
    tickInFlight = true;
    try {
      let hotkeyState;
      try {
        hotkeyState = await window.__TAURI__.core.invoke("hotkey_state");
      } catch {
        return;
      }

      if (!hotkeyState.available) {
        hotkeyStatusKey = "vrStatusDisconnected";
        statusEl.textContent = t(hotkeyStatusKey);
        vrAvailable = false;
        return;
      }
      hotkeyStatusKey = "vrStatusConnected";
      statusEl.textContent = t(hotkeyStatusKey);
      vrAvailable = true;

      // Left controller's lower face button (X on Quest) steps through the
      // 日本語→English→中文→OFF language cycle, independent of whether a
      // Final is pending — see handleCyclePress()/cycleSttState().
      if (hotkeyState.left.a && !leftAWasPressed) {
        handleCyclePress();
      }
      leftAWasPressed = hotkeyState.left.a;

      // Stick short/long press for both hands — independently assignable
      // to any hotkey action (see processStickPress/fireHotkeyAssignment),
      // e.g. the default short=toggle-keyboard, long=cancel/clear-all.
      // Works in either UI mode — the app's own desktop/VR setting is about
      // which on-screen controls this app shows, not whether SteamVR
      // itself is connected (and this whole tick already only runs when
      // hotkeyState.available is true, i.e. SteamVR is actually reachable
      // — see the early return above). Reads assignments fresh each tick,
      // same as the hold-based hotkeys further down, so a settings change
      // takes effect immediately.
      const stickAssignments = loadHotkeyAssignments();
      processStickPress("right", hotkeyState.right, stickAssignments.right);
      processStickPress("left", hotkeyState.left, stickAssignments.left);

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

      // While the VR keyboard is up, its own send button/stick-press owns
      // confirming text (see toggleVrKeyboard) — the grip/trigger-hold
      // ending flow below is suppressed entirely rather than racing it.
      if (!pendingFinalText || vrKeyboardVisible) {
        resetHotkeyHold();
        return;
      }

      const assignments = loadHotkeyAssignments();
      const now = Date.now();
      processHandHotkey(rightHotkeyHold, hotkeyState.right, assignments.right, now);
      // The right hand's processing above may have just fired (sent an
      // ending or discarded), clearing pendingFinalText — don't let the
      // left hand act on now-stale text in the same tick.
      if (pendingFinalText) processHandHotkey(leftHotkeyHold, hotkeyState.left, assignments.left, now);
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

  setInterval(() => {
    if (renderInFlight) return;
    renderInFlight = true;

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
      // assigned to anything.
      const priorityHold = hotkeyPriorityHandCache === "left" ? leftHotkeyHold : rightHotkeyHold;
      const otherHold = hotkeyPriorityHandCache === "left" ? rightHotkeyHold : leftHotkeyHold;
      const display = priorityHold.activeAssignment ? priorityHold : otherHold.activeAssignment ? otherHold : null;
      let progress = null;
      let endingPreview = null;
      if (display && display.activeAssignment === HOTKEY_CANCEL_ACTION) {
        progress = { isSend: false, fraction: (now - display.activeSince) / hotkeyHoldMsCache };
      } else if (display) {
        progress = { isSend: true, fraction: (now - display.activeSince) / hotkeyHoldMsCache };
        endingPreview = endingForAssignment(display.activeAssignment)?.text ?? null;
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
      // Marks the *focused* bunsetsu segment 変換 (henkan) would next act
      // on, so it's visible what a press of it (or picking a candidate)
      // will change — see vrKeyboardFocusedSegmentRange's own comment.
      const focusedRange = vrKeyboardFocusedSegmentRange();
      const highlightStart = focusedRange ? focusedRange[0] : null;
      const highlightEnd = focusedRange ? focusedRange[1] : null;
      const content = {
        finalText: pendingFinalText,
        interimText: currentInterimText,
        endingPreview,
        progress,
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
        const btn = { x: b.x, y: b.y, w: b.w, h: b.h, label: b.label, selected: !!b.selected };
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
            btn.flick[dir] = { ...b.flickCells[dir], label: char, selected: dir === engagedDirection };
          }
        }
        return btn;
      });
      keyboardFrozenButtons = buttons;
      const fadeAlpha = Math.min(1, (now - keyboardShownAt) / KEYBOARD_FADE_IN_MS);
      keyboardPromise = window.__TAURI__.core.invoke("update_keyboard_overlay", { visible: true, buttons, fadeAlpha }).then((result) => {
        vrKeyboardHands.right.highlightedIndex = result.right.highlightedIndex;
        vrKeyboardHands.left.highlightedIndex = result.left.highlightedIndex;
        // Here rather than in the poll loop: this is where fresh aim data
        // arrives, at the render rate. Both hands, independently.
        updateVrKeyboardFlickDirection("right", result.right.hitX, result.right.hitY);
        updateVrKeyboardFlickDirection("left", result.left.hitX, result.left.hitY);
      });
      // Both hands' lasers always — seeing where either hand points before
      // pulling its trigger is the point.
      pointerPromise = window.__TAURI__.core.invoke("update_pointer_overlays", { visible: true });
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
      if (elapsed >= KEYBOARD_FADE_OUT_MS) {
        keyboardFadingOutSince = 0;
        keyboardFrozenButtons = null;
        keyboardPromise = window.__TAURI__.core.invoke("update_keyboard_overlay", {
          visible: false,
          buttons: [],
          fadeAlpha: 0,
        });
      } else {
        const fadeAlpha = 1 - elapsed / KEYBOARD_FADE_OUT_MS;
        keyboardPromise = window.__TAURI__.core.invoke("update_keyboard_overlay", {
          visible: true,
          buttons: keyboardFrozenButtons ?? [],
          fadeAlpha,
        });
      }
      pointerPromise = window.__TAURI__.core.invoke("update_pointer_overlays", { visible: false });
    }
    vrKeyboardWasVisible = vrKeyboardVisible;

    if (!boxPromise && !tagPromise && !keyboardPromise && !pointerPromise) {
      renderInFlight = false;
      return;
    }
    Promise.all([boxPromise, tagPromise, keyboardPromise, pointerPromise].filter(Boolean))
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

  const modeToggleBtn = document.querySelector("#mode-toggle-btn");
  sendMode = loadSendMode();
  modeToggleBtn.classList.toggle("active", sendMode === "auto");
  modeToggleBtn.setAttribute("aria-pressed", String(sendMode === "auto"));
  modeToggleBtn.addEventListener("click", () => {
    sendMode = sendMode === "auto" ? "manual" : "auto";
    modeToggleBtn.classList.toggle("active", sendMode === "auto");
    modeToggleBtn.setAttribute("aria-pressed", String(sendMode === "auto"));
    saveSendMode(sendMode);
  });

  const chatboxToggleBtn = document.querySelector("#chatbox-toggle-btn");
  chatboxEnabled = loadChatboxEnabled();
  chatboxToggleBtn.classList.toggle("active", chatboxEnabled);
  chatboxToggleBtn.setAttribute("aria-pressed", String(chatboxEnabled));
  chatboxToggleBtn.addEventListener("click", () => {
    chatboxEnabled = !chatboxEnabled;
    chatboxToggleBtn.classList.toggle("active", chatboxEnabled);
    chatboxToggleBtn.setAttribute("aria-pressed", String(chatboxEnabled));
    saveChatboxEnabled(chatboxEnabled);
  });

  const ttsToggleBtn = document.querySelector("#tts-toggle-btn");
  ttsEnabled = loadTtsEnabled();
  ttsToggleBtn.classList.toggle("active", ttsEnabled);
  ttsToggleBtn.setAttribute("aria-pressed", String(ttsEnabled));
  ttsToggleBtn.addEventListener("click", () => {
    ttsEnabled = !ttsEnabled;
    ttsToggleBtn.classList.toggle("active", ttsEnabled);
    ttsToggleBtn.setAttribute("aria-pressed", String(ttsEnabled));
    saveTtsEnabled(ttsEnabled);
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

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
  navDevice: { ja: "デバイス", en: "Device", zh: "设备", ko: "장치" },
  navAppearance: { ja: "外観", en: "Appearance", zh: "外观", ko: "외관" },
  navHotkey: { ja: "ホットキー", en: "Hotkey", zh: "快捷键", ko: "단축키" },
  navOther: { ja: "その他", en: "Other", zh: "其他", ko: "기타" },

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

  unset: { ja: "(未設定)", en: "(Unset)", zh: "（未设置）", ko: "(미설정)" },
  cancelSend: { ja: "送信取り消し", en: "Cancel send", zh: "取消发送", ko: "전송 취소" },

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
  statusWaitingForVoice: { ja: "発話待ち...", en: "Waiting for voice...", zh: "等待语音...", ko: "음성 대기 중..." },
  statusSpeechNotSupported: {
    ja: "エラー: 音声認識に対応していません",
    en: "Error: Speech recognition not supported",
    zh: "错误：不支持语音识别",
    ko: "오류: 음성 인식이 지원되지 않습니다",
  },
  statusErrorPrefix: { ja: "エラー: ", en: "Error: ", zh: "错误：", ko: "오류: " },

  uiLangLabel: { ja: "UIの言語", en: "UI Language", zh: "界面语言", ko: "UI 언어" },
  sttOff: { ja: "オフ", en: "Off", zh: "关闭", ko: "꺼짐" },
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
    sttStateLabelEl.textContent = sttStateValue === "off" ? t("sttOff") : (STT_STATE_LABELS[sttStateValue] ?? sttStateValue);
  }
  const hotkeyStatusEl = document.querySelector("#hotkey-status");
  if (hotkeyStatusEl) hotkeyStatusEl.textContent = t(hotkeyStatusKey);
  const holdVal = document.querySelector("#hotkey-hold-duration-val");
  if (holdVal) holdVal.textContent = `${(loadHotkeyHoldMs() / 1000).toFixed(1)}${t("secondsSuffix")}`;
  renderGeneralEndingsList();
  renderHotkeyAssignmentOptions();
  setupCharacterPanel();
}

const GOOGLE_RETRY_MS = 3000;
const SILENCE_TIMEOUT_MS = 5000;
const VOICE_RMS_THRESHOLD = 0.01;

let recognition;
let armed = false; // Start/Stop button state; survives pause/resume cycles
let recognizing = false; // true while a recognition session is supposed to be running
let googleHadError = false;
let googleRetryTimer;
let googleRetryFailures = 0; // consecutive failed restarts of the *current* recognition object; reset on a successful onstart
const GOOGLE_RETRY_RECREATE_AFTER = 3; // after this many, rebuild the SpeechRecognition object instead of retrying a possibly-wedged one forever
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
  // specific languages if the result isn't wanted.
  const lang = getSttLang();
  if (loadTtsLangEnabled()[lang]) {
    // Spaces (half- or full-width) in the recognized text read as an
    // unnatural pause/silence through VOICEVOX, so close them up before
    // speaking — outputText (chatbox) keeps them untouched.
    speak(spokenText.replace(/\s+/g, ""), params);
  } else {
    log(`[voicevox] skipped: read-aloud disabled for ${lang}`);
  }
}

// SpeechRecognition owns mic capture internally and doesn't expose audio
// levels, so silence/voice is measured by a second, independent mic stream
// that only ever computes RMS locally — nothing from it is sent anywhere.
// It stays alive across pause/resume so speech can restart recognition
// automatically; only the Stop button tears it down.
let monitorStream;
let monitorCtx;
let monitorSource;
let monitorProcessor;
let lastVoiceAt = 0;
let silenceCheckTimer;

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
  const deviceSettings = loadDeviceSettings();
  const audioConstraints =
    !deviceSettings.micAuto && deviceSettings.micDeviceId
      ? { deviceId: { exact: deviceSettings.micDeviceId } }
      : true;
  monitorStream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
  monitorCtx = new AudioContext();
  monitorSource = monitorCtx.createMediaStreamSource(monitorStream);
  monitorProcessor = monitorCtx.createScriptProcessor(4096, 1, 1);

  monitorProcessor.onaudioprocess = (event) => {
    if (rms(event.inputBuffer.getChannelData(0)) < VOICE_RMS_THRESHOLD) return;
    lastVoiceAt = Date.now();
    if (armed && !recognizing) resumeRecognition();
  };

  monitorSource.connect(monitorProcessor);
  monitorProcessor.connect(monitorCtx.destination);

  lastVoiceAt = Date.now();
  silenceCheckTimer = setInterval(() => {
    if (recognizing && Date.now() - lastVoiceAt >= SILENCE_TIMEOUT_MS) pauseRecognition();
  }, 1000);
}

async function stopVoiceMonitor() {
  clearInterval(silenceCheckTimer);
  if (monitorProcessor) monitorProcessor.disconnect();
  if (monitorSource) monitorSource.disconnect();
  if (monitorStream) monitorStream.getTracks().forEach((t) => t.stop());
  if (monitorCtx) await monitorCtx.close();
  monitorStream = monitorCtx = monitorSource = monitorProcessor = undefined;
}

// Tauri's webview is WebView2 (Edge/Chromium engine), so this actually talks
// to Microsoft's speech backend, not Google's, even though the API shape
// (webkitSpeechRecognition) is the one Chrome popularized.
function createRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const r = new SpeechRecognition();
  r.lang = getSttLang();
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
    currentInterimText = "";

    if (sendMode === "manual") {
      // A new Final can arrive before the pending one is sent — append
      // rather than overwrite so nothing said in the meantime is lost.
      pendingFinalText = pendingFinalText ? `${pendingFinalText} ${text}` : text;
      // The content just changed, so restart any in-progress hold instead
      // of letting it fire against stale timing.
      resetHotkeyHold();
    } else {
      dispatchText(text, text);
    }
    renderMergedText();
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
    // Only reconnect if we're still supposed to be actively recognizing.
    // pauseRecognition()/stopGoogleStt() clear `recognizing` before calling
    // stop(), so their own end events land here as a no-op.
    if (!armed || !recognizing) return;
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

function pauseRecognition() {
  if (!recognizing) return;
  recognizing = false;
  clearTimeout(googleRetryTimer);
  recognition.stop();
  setGoogleStatus("statusWaitingForVoice");
}

function scheduleGoogleRetry() {
  googleRetryFailures++;
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
      scheduleGoogleRetry();
    }
  }, GOOGLE_RETRY_MS);
}

async function startGoogleStt() {
  if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
    setGoogleStatus("statusSpeechNotSupported");
    return;
  }

  try {
    await startVoiceMonitor();
  } catch (err) {
    googleStatusKey = null; // one-off message, not a translatable state to restore later
    googleStatusEl.textContent = `${t("statusErrorPrefix")}${err.message}`;
    return;
  }

  recognition = createRecognition();
  armed = true;
  googleBtn.textContent = t("stopButton");
  googleBtn.classList.add("listening");
  statusDotEl.classList.add("active");
  resumeRecognition();
}

function stopGoogleStt() {
  armed = false;
  recognizing = false;
  googleHadError = false;
  clearTimeout(googleRetryTimer);
  if (recognition) recognition.stop();
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
  return { micAuto: true, micDeviceId: "", speakerAuto: true, speakerDeviceIds: [] };
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

async function speak(text, params = {}) {
  text = (text ?? voicevoxInput.value).trim();
  if (!text) return;
  voicevoxInput.value = text;

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

    let remaining = targets.length;
    const players = targets.map((sinkId) => {
      const audio = new Audio(url);
      audio.onended = () => {
        remaining -= 1;
        if (remaining === 0) {
          URL.revokeObjectURL(url);
          voicevoxStatusEl.textContent = t("statusIdle");
        }
      };
      return { audio, sinkId };
    });

    for (const { audio, sinkId } of players) {
      if (sinkId && audio.setSinkId) await audio.setSinkId(sinkId);
    }
    await Promise.all(players.map(({ audio }) => audio.play()));

    voicevoxStatusEl.textContent = `${t("voicevoxPlaying")} (${targets.length})`;
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

// Mic selection feeds startVoiceMonitor()'s getUserMedia constraint directly.
// Speaker selection mirrors (and writes back to) the main screen's
// #voicevox-outputs <select multiple> so there's one source of truth.
async function setupDevicePanel() {
  const micList = document.querySelector("#mic-device-list");
  const speakerList = document.querySelector("#speaker-device-list");
  const micAutoToggle = document.querySelector("#mic-auto-toggle");
  const speakerAutoToggle = document.querySelector("#speaker-auto-toggle");

  const settings = loadDeviceSettings();
  micAutoToggle.checked = settings.micAuto;
  speakerAutoToggle.checked = settings.speakerAuto;
  micList.classList.toggle("disabled", settings.micAuto);
  speakerList.classList.toggle("disabled", settings.speakerAuto);

  micAutoToggle.addEventListener("change", () => {
    const s = loadDeviceSettings();
    s.micAuto = micAutoToggle.checked;
    saveDeviceSettings(s);
    micList.classList.toggle("disabled", s.micAuto);
  });

  speakerAutoToggle.addEventListener("change", () => {
    const s = loadDeviceSettings();
    s.speakerAuto = speakerAutoToggle.checked;
    saveDeviceSettings(s);
    speakerList.classList.toggle("disabled", s.speakerAuto);
    if (s.speakerAuto) populateOutputDevices(); // re-apply the CABLE-Input heuristic
  });

  try {
    const probe = await navigator.mediaDevices.getUserMedia({ audio: true });
    probe.getTracks().forEach((t) => t.stop());
  } catch {
    // labels may come back blank; selection by id still works
  }
  const devices = await navigator.mediaDevices.enumerateDevices();

  micList.innerHTML = "";
  for (const d of devices.filter((d) => d.kind === "audioinput")) {
    const row = document.createElement("label");
    row.className = "device-row";
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "mic-device";
    radio.value = d.deviceId;
    radio.checked = d.deviceId === settings.micDeviceId;
    radio.addEventListener("change", () => {
      const s = loadDeviceSettings();
      s.micDeviceId = d.deviceId;
      saveDeviceSettings(s);
    });
    row.append(radio, buildDeviceLabel(d.label || d.deviceId));
    micList.appendChild(row);
  }

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
  setupPresetPanel();
  setupAppearancePanel();
  setupDevicePanel();
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
// Slots 2/3/5/10 (~, !, ?, にゃん) default to reading the ending aloud —
// reading left blank so it falls back to the text itself (see applyEnding()).
const DEFAULT_ENDINGS_SPOKEN_SLOTS = [2, 3, 5, 10];
const DEFAULT_ENDINGS = ["..o0", "~", "!", "xwx", "?", "♡", "...", "..//", "..zZ", "にゃん"].map((text, i) => ({
  text,
  ...DEFAULT_ENDING_PARAMS,
  speakEnding: DEFAULT_ENDINGS_SPOKEN_SLOTS.includes(i + 1),
}));

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

function setupGeneralPanel() {
  document.querySelector("#settings-reset-btn").addEventListener("click", async () => {
    const ok = await showConfirmDialog(t("resetConfirm"));
    if (!ok) return;
    localStorage.removeItem(ENDINGS_STORAGE_KEY);
    localStorage.removeItem(HOTKEY_PROFILES_KEY);
    localStorage.removeItem(HOTKEY_ACTIVE_PROFILE_KEY);
    localStorage.removeItem(APPEARANCE_STORAGE_KEY);
    localStorage.removeItem(DEVICE_SETTINGS_KEY);
    location.reload();
  });
}

const HOTKEY_POLL_MS = 50;
const HOTKEY_PROFILES_KEY = "mutelink.hotkeyProfiles";
const HOTKEY_ACTIVE_PROFILE_KEY = "mutelink.activeHotkeyProfile";
const HOTKEY_PROFILE_COUNT = 3;
const HOTKEY_SLOTS = ["both", "grip", "trigger", "none", "stick"];
// Map to I18N keys, not translated text directly, so hotkeyRefsForEndingSlot()
// (and anywhere else) always reflects the *current* uiLang via t() rather
// than whatever language was active when this module evaluated.
const HOTKEY_SLOT_LABEL_KEYS = { both: "slotBoth", grip: "slotGrip", trigger: "slotTrigger", none: "slotNone", stick: "slotStick" };
const HOTKEY_HAND_LABEL_KEYS = { right: "handRight", left: "handLeft" };
// Sentinel assignment value meaning "discard the pending text", alongside
// the ending *slot numbers* ("1"-"10", see ENDINGS_SLOT_COUNT) a hotkey
// slot can otherwise be assigned to.
const HOTKEY_CANCEL_ACTION = "__cancel__";

// Resolves a stored assignment value (a slot-number string, the cancel
// sentinel, or "") to the actual ending object it currently points at —
// null for cancel/unset, or if the number is somehow out of range.
function endingForAssignment(assignment) {
  if (!assignment || assignment === HOTKEY_CANCEL_ACTION) return null;
  return endings[Number(assignment) - 1] ?? null;
}

const HOTKEY_HOLD_DURATION_KEY = "mutelink.hotkeyHoldMs";
const DEFAULT_HOTKEY_HOLD_MS = 1000;

function loadHotkeyHoldMs() {
  const raw = Number(localStorage.getItem(HOTKEY_HOLD_DURATION_KEY));
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_HOTKEY_HOLD_MS;
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
// differ deliberately: right hand gives quick access to 1/2 and a stick-press
// cancel; left hand covers 3/4/5, leaving its "none"/stick slots unset since
// the right hand's stick already handles cancel.
function defaultHotkeyAssignments() {
  return {
    right: { both: "1", grip: "", trigger: "2", none: "", stick: HOTKEY_CANCEL_ACTION },
    left: { both: "3", grip: "4", trigger: "5", none: "", stick: "" },
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
      select.append(unsetOpt, cancelOpt);
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
    stickWasPressed: false,
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
  } else {
    const ending = endingForAssignment(assignment);
    if (ending) applyEnding(ending);
  }
}

const HOTKEY_DEBOUNCE_MS = 100; // absorb single-poll blips in the raw grip/trigger state

// Advances one hand's independent hold state machine by one tick: edge-fires
// the stick, then debounces/holds the grip+trigger gesture against that
// hand's own assignment table. Both hands run this every tick, so each can
// fire its own action independently of what the other hand is doing.
function processHandHotkey(hold, hand, handAssignments, now) {
  if (hand.stick && !hold.stickWasPressed) {
    fireHotkeyAssignment(handAssignments.stick);
  }
  hold.stickWasPressed = hand.stick;
  if (!pendingFinalText) return; // the stick fire above may have just cleared it

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

      if (!pendingFinalText) {
        resetHotkeyHold();
        rightHotkeyHold.stickWasPressed = hotkeyState.right.stick;
        leftHotkeyHold.stickWasPressed = hotkeyState.left.stick;
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
    if (vrAvailable && (pendingFinalText || currentInterimText)) {
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
      const content = { finalText: pendingFinalText, interimText: currentInterimText, endingPreview, progress };
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

    if (!boxPromise && !tagPromise) {
      renderInFlight = false;
      return;
    }
    Promise.all([boxPromise, tagPromise].filter(Boolean))
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
// top comment) — only "off" is an actual UI string, via t("sttOff").
const STT_STATE_LABELS = { "ja-JP": "日本語", "en-US": "English", "zh-CN": "中文", "ko-KR": "한국어" };

// The single entry point for changing what's being recognized (or turning
// recognition off) — keeps the desktop radio group, the VR overlay's
// language tag, the desktop status label, and the actual recognition
// session in sync no matter which control triggered the change: a radio
// click, the round start/stop button, or the VR controller's cycle (see
// cycleSttState()).
function setSttState(value) {
  sttStateValue = value;
  setSttLang(value);
  sttStateLabelEl.textContent = value === "off" ? t("sttOff") : (STT_STATE_LABELS[value] ?? value);
  flashLangTag(value);
  sttStateChain = sttStateChain.then(async () => {
    if (sttStateValue !== value) return; // superseded by a later call while queued
    if (armed) stopGoogleStt();
    if (value !== "off") await startGoogleStt();
  });
}

const TTS_LANG_ENABLED_KEY = "mutelink.ttsLangEnabled";
const TTS_LANG_ENABLED_DEFAULT = { "ja-JP": true, "en-US": true, "zh-CN": true, "ko-KR": true };

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
const STT_CYCLE_LANG_DEFAULT = { "ja-JP": true, "en-US": true, "zh-CN": true, "ko-KR": true };

function loadSttCycleLangs() {
  try {
    const raw = JSON.parse(localStorage.getItem(STT_CYCLE_LANG_KEY) ?? "null");
    if (raw && typeof raw === "object") {
      return { ...STT_CYCLE_LANG_DEFAULT, ...raw };
    }
  } catch {
    // fall through
  }
  return { ...STT_CYCLE_LANG_DEFAULT };
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
const STT_LANG_TAG_LABELS = { "ja-JP": "JP", "en-US": "EN", "zh-CN": "CN", "ko-KR": "KR" };

// `value` is a stt-lang radio value: a BCP-47 code for JP/EN/CN, or "off".
function flashLangTag(value) {
  langTagLabel = value === "off" ? "OFF" : (STT_LANG_TAG_LABELS[value] ?? null);
  langTagShownAt = Date.now();
  langTagUntil = langTagShownAt + LANG_TAG_DISPLAY_MS;
}

const STT_CYCLE_LANGS_ALL = ["ja-JP", "en-US", "zh-CN", "ko-KR"];

// Only the languages checked in 設定 > General > 言語サイクル participate,
// always with "off" appended at the end — falls back to all four if
// somehow none are checked, so the cycle never becomes a no-op.
function sttCycleOrder() {
  const enabled = loadSttCycleLangs();
  const langs = STT_CYCLE_LANGS_ALL.filter((lang) => enabled[lang]);
  return [...(langs.length > 0 ? langs : STT_CYCLE_LANGS_ALL), "off"];
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
  setupSettingsDialog();
  setupHotkeys();
  setupTtsLangSettings();
  setupSttCycleLangSettings();

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
});

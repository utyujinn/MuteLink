import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
// ── デフォルト語尾 ────────────────────────────────────────────────────
const DEFAULT_SUFFIXES = [
    { label: '。', suffix: '。', speed: 1.0, pitch: 0.0, intonation: 1.0, volume: 1.0 },
    { label: '！', suffix: '！', speed: 1.2, pitch: 0.05, intonation: 1.5, volume: 1.1 },
    { label: '？', suffix: '？', speed: 0.95, pitch: 0.05, intonation: 1.3, volume: 1.0 },
    { label: 'qwq', suffix: 'qwq', speed: 0.85, pitch: -0.05, intonation: 0.8, volume: 0.9 },
    { label: 'xwx', suffix: 'xwx', speed: 0.9, pitch: -0.03, intonation: 0.9, volume: 0.9 },
    { label: 'owo', suffix: 'owo', speed: 1.1, pitch: 0.07, intonation: 1.4, volume: 1.0 },
    { label: '..o○', suffix: '..o○', speed: 0.85, pitch: 0.02, intonation: 0.7, volume: 0.8 },
    { label: '..//', suffix: '..//', speed: 1.0, pitch: 0.03, intonation: 1.1, volume: 0.85 },
    { label: '><', suffix: '><', speed: 1.1, pitch: 0.05, intonation: 1.2, volume: 0.9 },
    { label: 'www', suffix: 'www', speed: 1.15, pitch: 0.05, intonation: 1.5, volume: 1.1 },
    { label: 'zzz', suffix: 'zzz', speed: 0.75, pitch: -0.07, intonation: 0.5, volume: 0.7 },
    { label: '~', suffix: '~', speed: 0.9, pitch: 0.03, intonation: 1.2, volume: 1.0 },
];
// ── 言語リスト ────────────────────────────────────────────────────────
const LANGUAGES = [
    ['ja-JP', '日本語'], ['en-US', 'English (US)'], ['en-GB', 'English (UK)'],
    ['zh-CN', '中文 (简体)'], ['zh-TW', '中文 (繁體)'], ['ko-KR', '한국어'],
    ['fr-FR', 'Français'], ['de-DE', 'Deutsch'], ['es-ES', 'Español'],
];
// ── DOM 参照 ──────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const langSelect = $('lang-select');
const micSelect = $('mic-select');
const statusDot = $('status-dot');
const statusLabel = $('status-label');
const errorLabel = $('error-label');
const hypothesisText = $('hypothesis-text');
const pendingText = $('pending-text');
const vrcArea = $('vrc-area');
const vrcTextEl = $('vrc-text');
const vrcCount = $('vrc-count');
const suffixBtns = $('suffix-buttons');
const btnStart = $('btn-start');
const btnAuto = $('btn-auto');
const btnChat = $('btn-chat');
const btnTts = $('btn-tts');
const settingsPanel = $('settings-panel');
const suffixEditor = $('suffix-editor');
const menuSettingsBtn = $('menu-settings-btn');
const menuSuffixBtn = $('menu-suffix-btn');
const menuAppBtn = $('menu-app-btn');
// ── ローカル状態 ──────────────────────────────────────────────────────
let st = null;
let recognition = null;
let isComposing = false;
// ── 初期化 ────────────────────────────────────────────────────────────
async function init() {
    // 言語セレクタ構築
    for (const [tag, name] of LANGUAGES) {
        langSelect.add(new Option(name, tag));
    }
    langSelect.value = 'ja-JP';
    // マイクデバイス一覧取得
    const devices = await invoke('get_audio_devices');
    micSelect.add(new Option('デフォルト', ''));
    for (const [id, name] of devices) {
        const label = name.length > 24 ? name.slice(0, 23) + '…' : name;
        micSelect.add(new Option(label, id));
    }
    // 設定パネルと語尾エディタのHTML構築（一度だけ）
    buildSettingsPanelHTML();
    buildSuffixEditorHTML();
    // Tauri イベント受信
    await listen('app-state', (e) => updateUI(e.payload));
    // ボタンイベント
    btnStart.addEventListener('click', toggleStartStop);
    btnAuto.addEventListener('click', () => toggleBoolSetting('auto_mode'));
    btnChat.addEventListener('click', () => toggleBoolSetting('chatbox_enabled'));
    btnTts.addEventListener('click', () => toggleBoolSetting('tts_enabled'));
    // VRCエリアをクリックでチャットボックスリセット
    vrcArea.addEventListener('click', () => {
        if (st?.vrc_text)
            invoke('reset_chatbox');
    });
    // Pending IME + Ctrl+Enter
    pendingText.addEventListener('compositionstart', () => { isComposing = true; });
    pendingText.addEventListener('compositionend', () => { isComposing = false; });
    pendingText.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter' && !isComposing) {
            e.preventDefault();
            confirmWithSuffix(0);
        }
    });
    // 言語・マイク変更 → 認識再起動
    langSelect.addEventListener('change', () => { if (st?.is_running)
        restartRecognition(); });
    micSelect.addEventListener('change', () => { if (st?.is_running)
        restartRecognition(); });
    // メニューボタン
    menuSettingsBtn.addEventListener('click', toggleSettingsPanel);
    menuSuffixBtn.addEventListener('click', toggleSuffixEditor);
    menuAppBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleAppDropdown();
    });
    document.addEventListener('click', closeAppDropdown);
}
// ── UI 更新 ──────────────────────────────────────────────────────────
function updateUI(s) {
    st = s;
    // ステータスドット
    statusDot.className = `dot ${{ idle: 'dot-idle', capturing: 'dot-capture', speech_detected: 'dot-speech' }[s.rec_state]}`;
    statusLabel.textContent = { idle: '', capturing: '聴取中', speech_detected: '発話中' }[s.rec_state];
    // エラー
    if (s.last_error) {
        errorLabel.textContent = `エラー: ${s.last_error}`;
        errorLabel.classList.remove('hidden');
    }
    else {
        errorLabel.classList.add('hidden');
    }
    // Hypothesis
    hypothesisText.textContent = s.hypothesis;
    // Pending（フォーカス中は上書きしない）
    if (document.activeElement !== pendingText) {
        pendingText.value = s.pending ?? '';
    }
    // VRC
    const count = [...s.vrc_text].length;
    vrcTextEl.textContent = s.vrc_text;
    vrcCount.textContent = `${count}/144`;
    vrcArea.classList.toggle('will-reset', s.vrc_will_reset);
    // 開始/停止ボタン
    btnStart.textContent = s.is_running ? '停止' : '開始';
    btnStart.className = `ctrl-btn ${s.is_running ? 'btn-stop' : 'btn-start'}`;
    // トグルボタン
    btnAuto.className = `ctrl-btn ${s.auto_mode ? 'btn-on' : 'btn-off'}`;
    btnChat.className = `ctrl-btn ${s.chatbox_enabled ? 'btn-on' : 'btn-off'}`;
    btnTts.className = `ctrl-btn ${s.tts_enabled ? 'btn-on' : 'btn-off'}`;
    // 語尾ボタン（数が変わったとき再構築）
    if (suffixBtns.children.length !== s.suffix_configs.length) {
        buildSuffixButtons(s.suffix_configs);
    }
    const hasPending = !!(s.pending?.length);
    suffixBtns.querySelectorAll('.suffix-btn').forEach(b => {
        b.disabled = !hasPending;
    });
    // 設定パネルが開いていれば内容を更新
    if (!settingsPanel.classList.contains('hidden')) {
        refreshSettingsPanel(s);
    }
}
function buildSuffixButtons(configs) {
    suffixBtns.innerHTML = '';
    configs.forEach((cfg, i) => {
        const btn = document.createElement('button');
        btn.className = 'suffix-btn';
        btn.textContent = cfg.label;
        btn.addEventListener('click', () => confirmWithSuffix(i));
        suffixBtns.appendChild(btn);
    });
}
// ── アクション ───────────────────────────────────────────────────────
async function toggleStartStop() {
    if (st?.is_running) {
        stopSpeech();
        await invoke('stop_recognition');
    }
    else {
        const deviceId = micSelect.value || null;
        await invoke('start_recognition', { deviceId });
        startSpeech(langSelect.value);
    }
}
function toggleBoolSetting(key) {
    if (!st)
        return;
    const cfg = stateToConfig(st);
    cfg[key] = !st[key];
    invoke('update_settings', { cfg });
}
function confirmWithSuffix(suffixIdx) {
    const text = pendingText.value.trim();
    if (!text)
        return;
    pendingText.value = '';
    invoke('confirm_text', { text, suffixIdx });
}
async function restartRecognition() {
    stopSpeech();
    await invoke('stop_recognition');
    const deviceId = micSelect.value || null;
    await invoke('start_recognition', { deviceId });
    startSpeech(langSelect.value);
}
function stateToConfig(s) {
    return {
        voicevox_path: s.voicevox_path,
        concat_mode: s.concat_mode,
        concat_limit: s.concat_limit,
        auto_mode: s.auto_mode,
        tts_enabled: s.tts_enabled,
        chatbox_enabled: s.chatbox_enabled,
        tts_speaker_sel: s.tts_speaker_sel,
        tts_style_sel: s.tts_style_sel,
        tts_device_indices: [...s.tts_device_indices],
        suffix_configs: s.suffix_configs,
    };
}
function startSpeech(lang) {
    stopSpeech();
    const r = new webkitSpeechRecognition();
    r.continuous = true;
    r.interimResults = true;
    r.lang = lang;
    r.onstart = () => invoke('on_speech_result', { type: 'ready', text: '' });
    r.onresult = (e) => {
        const res = e.results[e.resultIndex];
        invoke('on_speech_result', {
            type: res.isFinal ? 'final' : 'interim',
            text: res[0].transcript,
        });
    };
    r.onerror = (e) => {
        if (e.error !== 'aborted' && e.error !== 'no-speech') {
            invoke('on_speech_result', { type: 'error', text: e.error });
        }
    };
    r.onend = () => { if (st?.is_running)
        setTimeout(() => r.start(), 200); };
    r.start();
    recognition = r;
}
function stopSpeech() {
    if (recognition) {
        recognition.onend = null;
        recognition.stop();
        recognition = null;
    }
}
// ── 設定パネル ───────────────────────────────────────────────────────
function buildSettingsPanelHTML() {
    settingsPanel.innerHTML = `
    <div class="panel-inner">
      <div class="panel-header">
        <span class="panel-title">設定</span>
        <button class="panel-close" id="settings-close">×</button>
      </div>
      <div class="panel-body">
        <label class="check-row">
          <input type="checkbox" id="s-concat">
          <span>結合モード（VRCテキストに追記）</span>
        </label>
        <div class="indent-row">
          <span class="s-label">リセット文字数</span>
          <input type="number" id="s-concat-limit" min="1" max="144" step="1" class="s-num-input">
        </div>

        <div class="panel-hr"></div>

        <label class="check-row">
          <input type="checkbox" id="s-chatbox">
          <span>Chatbox送信（VRCチャットボックス）</span>
        </label>

        <div class="panel-hr"></div>

        <label class="check-row">
          <input type="checkbox" id="s-tts">
          <span>TTS自動読み上げ</span>
        </label>
        <div class="indent-row">
          <span class="s-label">キャラクター</span>
          <select id="s-speaker" class="s-select"></select>
        </div>
        <div class="indent-row">
          <span class="s-label">スタイル</span>
          <select id="s-style" class="s-select"></select>
        </div>
        <div class="indent-section">
          <div class="s-label" style="margin-bottom:4px">出力デバイス</div>
          <div id="s-tts-devices"></div>
        </div>

        <div class="panel-hr"></div>

        <div class="s-section-title">VoiceVox パス</div>
        <div class="indent-row" style="gap:6px">
          <button id="s-vv-detect" class="s-btn">自動検出</button>
          <span id="s-vv-status" class="s-vv-status"></span>
        </div>
        <input type="text" id="s-vv-path" class="s-path-input" placeholder="VOICEVOX 実行ファイルのパス">
      </div>
    </div>
  `;
    $('settings-close').addEventListener('click', toggleSettingsPanel);
    ($('s-concat')).addEventListener('change', (e) => {
        if (!st)
            return;
        const cfg = stateToConfig(st);
        cfg.concat_mode = e.target.checked;
        invoke('update_settings', { cfg });
    });
    ($('s-concat-limit')).addEventListener('change', (e) => {
        if (!st)
            return;
        const cfg = stateToConfig(st);
        cfg.concat_limit = Math.max(1, parseInt(e.target.value, 10) || 50);
        invoke('update_settings', { cfg });
    });
    ($('s-chatbox')).addEventListener('change', (e) => {
        if (!st)
            return;
        const cfg = stateToConfig(st);
        cfg.chatbox_enabled = e.target.checked;
        invoke('update_settings', { cfg });
    });
    ($('s-tts')).addEventListener('change', (e) => {
        if (!st)
            return;
        const cfg = stateToConfig(st);
        cfg.tts_enabled = e.target.checked;
        invoke('update_settings', { cfg });
    });
    // スピーカー変更 → スタイルセレクタを即時更新してから保存
    $('s-speaker').addEventListener('change', () => {
        if (!st)
            return;
        const spkIdx = parseInt(($('s-speaker')).value, 10);
        const spk = st.tts_speakers[spkIdx];
        if (spk) {
            const styleEl = $('s-style');
            styleEl.innerHTML = '';
            spk.styles.forEach((s, i) => styleEl.add(new Option(s.name, String(i))));
            styleEl.value = '0';
        }
        const cfg = stateToConfig(st);
        cfg.tts_speaker_sel = spkIdx;
        cfg.tts_style_sel = 0;
        invoke('update_settings', { cfg });
    });
    $('s-style').addEventListener('change', () => {
        if (!st)
            return;
        const cfg = stateToConfig(st);
        cfg.tts_style_sel = parseInt(($('s-style')).value, 10);
        invoke('update_settings', { cfg });
    });
    $('s-vv-detect').addEventListener('click', async () => {
        const path = await invoke('find_voicevox_path');
        $('s-vv-path').value = path;
        setVvStatus(path);
        if (!st)
            return;
        const cfg = stateToConfig(st);
        cfg.voicevox_path = path;
        invoke('update_settings', { cfg });
    });
    $('s-vv-path').addEventListener('change', (e) => {
        const path = e.target.value;
        setVvStatus(path);
        if (!st)
            return;
        const cfg = stateToConfig(st);
        cfg.voicevox_path = path;
        invoke('update_settings', { cfg });
    });
}
function setVvStatus(path) {
    const el = $('s-vv-status');
    if (!path) {
        el.textContent = '未設定';
        el.className = 's-vv-status vv-missing';
    }
    else {
        el.textContent = '設定済';
        el.className = 's-vv-status vv-ok';
    }
}
let lastSpeakerCount = -1;
let lastDeviceCount = -1;
function refreshSettingsPanel(s) {
    ($('s-concat')).checked = s.concat_mode;
    ($('s-concat-limit')).value = String(s.concat_limit);
    ($('s-chatbox')).checked = s.chatbox_enabled;
    ($('s-tts')).checked = s.tts_enabled;
    // スピーカーセレクタ（リストが変わったとき再構築）
    const spkEl = $('s-speaker');
    const styleEl = $('s-style');
    if (s.tts_speakers.length !== lastSpeakerCount) {
        lastSpeakerCount = s.tts_speakers.length;
        spkEl.innerHTML = '';
        if (s.tts_speakers.length === 0) {
            spkEl.add(new Option('読み込み中…', '-1'));
        }
        else {
            s.tts_speakers.forEach((spk, i) => spkEl.add(new Option(spk.name, String(i))));
        }
    }
    const spkIdx = s.tts_speaker_sel < s.tts_speakers.length ? s.tts_speaker_sel : 0;
    if (spkEl.value !== String(spkIdx))
        spkEl.value = String(spkIdx);
    // スタイルセレクタ（選択スピーカーが変わったとき再構築）
    const spk = s.tts_speakers[spkIdx];
    const styleCount = spk?.styles.length ?? 0;
    if (styleEl.length !== styleCount) {
        styleEl.innerHTML = '';
        spk?.styles.forEach((st2, i) => styleEl.add(new Option(st2.name, String(i))));
    }
    const styleIdx = s.tts_style_sel < styleCount ? s.tts_style_sel : 0;
    if (styleEl.value !== String(styleIdx))
        styleEl.value = String(styleIdx);
    // 出力デバイス（デバイス数が変わったとき再構築）
    const devContainer = $('s-tts-devices');
    if (s.tts_devices.length !== lastDeviceCount) {
        lastDeviceCount = s.tts_devices.length;
        devContainer.innerHTML = '';
        s.tts_devices.forEach((dev, i) => {
            const label = document.createElement('label');
            label.className = 'check-row dev-check';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.dataset.idx = String(i);
            cb.checked = s.tts_device_indices[i] ?? false;
            cb.addEventListener('change', () => {
                if (!st)
                    return;
                const cfg = stateToConfig(st);
                cfg.tts_device_indices[i] = cb.checked;
                invoke('update_settings', { cfg });
            });
            const text = document.createTextNode(dev.length > 34 ? dev.slice(0, 33) + '…' : dev);
            label.appendChild(cb);
            label.appendChild(text);
            devContainer.appendChild(label);
        });
    }
    else {
        devContainer.querySelectorAll('input[data-idx]').forEach(cb => {
            const i = parseInt(cb.dataset.idx, 10);
            cb.checked = s.tts_device_indices[i] ?? false;
        });
    }
    // VoiceVox パス（フォーカス中は上書きしない）
    const pathEl = $('s-vv-path');
    if (document.activeElement !== pathEl) {
        pathEl.value = s.voicevox_path;
        setVvStatus(s.voicevox_path);
    }
}
function toggleSettingsPanel() {
    const wasHidden = settingsPanel.classList.toggle('hidden');
    if (!wasHidden) {
        // 開いた
        suffixEditor.classList.add('hidden');
        lastSpeakerCount = -1;
        lastDeviceCount = -1;
        if (st)
            refreshSettingsPanel(st);
    }
}
// ── 語尾エディタ ─────────────────────────────────────────────────────
function buildSuffixEditorHTML() {
    suffixEditor.innerHTML = `
    <div class="panel-inner">
      <div class="panel-header">
        <span class="panel-title">語尾設定</span>
        <button class="panel-close" id="suffix-close">×</button>
      </div>
      <div class="suffix-table-wrap">
        <table class="suffix-table">
          <thead>
            <tr>
              <th>ラベル</th><th>語尾</th><th>速さ</th>
              <th>ピッチ</th><th>抑揚</th><th>音量</th><th></th>
            </tr>
          </thead>
          <tbody id="suffix-tbody"></tbody>
        </table>
      </div>
    </div>
  `;
    $('suffix-close').addEventListener('click', toggleSuffixEditor);
}
function refreshSuffixEditor(configs) {
    const tbody = $('suffix-tbody');
    tbody.innerHTML = '';
    configs.forEach((cfg, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td><input class="sf-i sf-label"  type="text"   value="${esc(cfg.label)}"                    style="width:48px"></td>
      <td><input class="sf-i sf-suffix" type="text"   value="${esc(cfg.suffix)}"                   style="width:48px"></td>
      <td><input class="sf-i sf-speed"  type="number" value="${cfg.speed.toFixed(2)}"  step="0.05" min="0.5" max="2.0" style="width:52px"></td>
      <td><input class="sf-i sf-pitch"  type="number" value="${cfg.pitch.toFixed(3)}"  step="0.01" min="-0.15" max="0.15" style="width:58px"></td>
      <td><input class="sf-i sf-inton"  type="number" value="${cfg.intonation.toFixed(2)}" step="0.05" min="0" max="2.0" style="width:52px"></td>
      <td><input class="sf-i sf-vol"    type="number" value="${cfg.volume.toFixed(2)}"  step="0.05" min="0" max="2.0" style="width:52px"></td>
      <td><button class="sf-reset-btn" title="デフォルトに戻す">↺</button></td>
    `;
        tr.querySelectorAll('.sf-i').forEach(inp => {
            inp.addEventListener('change', () => saveSuffixRow(tr, i));
        });
        tr.querySelector('.sf-reset-btn').addEventListener('click', () => {
            resetSuffixRow(tr, i);
        });
        tbody.appendChild(tr);
    });
}
function saveSuffixRow(tr, i) {
    if (!st)
        return;
    const cfg = stateToConfig(st);
    if (!cfg.suffix_configs)
        return;
    cfg.suffix_configs[i] = {
        label: (tr.querySelector('.sf-label')).value,
        suffix: (tr.querySelector('.sf-suffix')).value,
        speed: parseFloat((tr.querySelector('.sf-speed')).value) || 1.0,
        pitch: parseFloat((tr.querySelector('.sf-pitch')).value) || 0.0,
        intonation: parseFloat((tr.querySelector('.sf-inton')).value) || 1.0,
        volume: parseFloat((tr.querySelector('.sf-vol')).value) || 1.0,
    };
    invoke('update_settings', { cfg });
}
function resetSuffixRow(tr, i) {
    const def = DEFAULT_SUFFIXES[i] ?? DEFAULT_SUFFIXES[0];
    (tr.querySelector('.sf-label')).value = def.label;
    (tr.querySelector('.sf-suffix')).value = def.suffix;
    (tr.querySelector('.sf-speed')).value = def.speed.toFixed(2);
    (tr.querySelector('.sf-pitch')).value = def.pitch.toFixed(3);
    (tr.querySelector('.sf-inton')).value = def.intonation.toFixed(2);
    (tr.querySelector('.sf-vol')).value = def.volume.toFixed(2);
    saveSuffixRow(tr, i);
}
function toggleSuffixEditor() {
    const wasHidden = suffixEditor.classList.toggle('hidden');
    if (!wasHidden) {
        settingsPanel.classList.add('hidden');
        if (st)
            refreshSuffixEditor(st.suffix_configs);
    }
}
function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
// ── アプリメニュードロップダウン ──────────────────────────────────────
function toggleAppDropdown() {
    const existing = document.getElementById('app-dropdown');
    if (existing) {
        existing.remove();
        return;
    }
    const dd = document.createElement('div');
    dd.id = 'app-dropdown';
    dd.innerHTML = `
    <div class="dd-item" id="dd-reset">設定をリセット</div>
    <div class="dd-sep"></div>
    <div class="dd-item" id="dd-quit">終了</div>
  `;
    dd.addEventListener('click', (e) => e.stopPropagation());
    document.body.appendChild(dd);
    const rect = menuAppBtn.getBoundingClientRect();
    dd.style.top = `${rect.bottom}px`;
    dd.style.left = `${rect.left}px`;
    $('dd-reset').addEventListener('click', async () => {
        if (!st)
            return;
        const cfg = {
            voicevox_path: st.voicevox_path,
            concat_mode: false,
            concat_limit: 50,
            auto_mode: false,
            tts_enabled: true,
            chatbox_enabled: true,
            tts_speaker_sel: 0,
            tts_style_sel: 0,
            tts_device_indices: st.tts_device_indices.map(() => false),
            suffix_configs: null,
        };
        await invoke('update_settings', { cfg });
        closeAppDropdown();
    });
    $('dd-quit').addEventListener('click', async () => {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        getCurrentWindow().close();
    });
}
function closeAppDropdown() {
    document.getElementById('app-dropdown')?.remove();
}
// ── 起動 ─────────────────────────────────────────────────────────────
init().catch(console.error);

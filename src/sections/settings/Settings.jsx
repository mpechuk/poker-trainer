import { useState } from 'preact/hooks';
import { getSettings, saveSettings, resetSettings, DEFAULT_SETTINGS, CARD_SIZES } from '../../utils/storage.js';
import { handToCards } from '../../utils/illustrations.jsx';
import '../../styles/settings.css';

export function Settings() {
  const [settings, setSettings] = useState(() => getSettings());
  const [justSaved, setJustSaved] = useState(false);

  function update(patch) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1200);
  }

  function onReset() {
    resetSettings();
    setSettings({ ...DEFAULT_SETTINGS });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1200);
  }

  const currentSize = CARD_SIZES[settings.cardSize];

  return (
    <div class="rq-panel settings-panel">
      <h2 class="rq-title">Settings</h2>
      <p class="settings-sub">Preferences are saved to this browser.</p>

      <section class="settings-section">
        <div class="rq-setup-label">Auto-advance</div>
        <label class="settings-toggle">
          <input
            type="checkbox"
            checked={settings.autoAdvance}
            onChange={(e) => update({ autoAdvance: e.currentTarget.checked })}
          />
          <span>Advance to the next quiz question automatically</span>
        </label>

        <div class={`settings-timeout${settings.autoAdvance ? '' : ' disabled'}`}>
          <label for="settings-timeout-input">Delay (seconds)</label>
          <input
            id="settings-timeout-input"
            type="number"
            min="1"
            max="60"
            step="1"
            disabled={!settings.autoAdvance}
            value={settings.autoAdvanceSeconds}
            onInput={(e) => {
              const n = Number(e.currentTarget.value);
              if (Number.isFinite(n) && n >= 1 && n <= 60) update({ autoAdvanceSeconds: n });
            }}
          />
        </div>
      </section>

      <section class="settings-section">
        <div class="rq-setup-label">Card image size</div>
        <div class="rq-selector-group">
          {Object.entries(CARD_SIZES).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              class={`rq-selector-btn${settings.cardSize === key ? ' active' : ''}`}
              onClick={() => update({ cardSize: key })}
            >{meta.label}</button>
          ))}
        </div>
        <div class="settings-card-preview"
          dangerouslySetInnerHTML={{ __html: handToCards('AKs', '\u2660', currentSize) }}
        />
      </section>

      <div class="settings-actions">
        <button type="button" class="rq-selector-btn" onClick={onReset}>Reset to defaults</button>
        <span class={`settings-saved${justSaved ? ' show' : ''}`}>Saved</span>
      </div>
    </div>
  );
}

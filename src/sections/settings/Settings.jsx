import { useState } from 'preact/hooks';
import { getSettings, saveSettings, resetSettings, DEFAULT_SETTINGS, CARD_SIZES, QUIZ_LENGTH_MIN, QUIZ_LENGTH_MAX } from '../../utils/storage.js';
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
        <div class="rq-setup-label">Quiz length</div>
        <p class="settings-sub" style="margin:.2rem 0 .8rem">Number of questions per quiz run, configured per quiz type.</p>
        {[
          { key: 'quizLengthTerminology', label: 'Terminology' },
          { key: 'quizLengthPreflop',     label: 'Preflop'     },
          { key: 'quizLengthFlop',        label: 'Board Texture' },
          { key: 'quizLengthCombos',      label: 'Flop Combos' },
        ].map(({ key, label }) => (
          <div key={key} class="settings-quiz-length-row">
            <div class="settings-quiz-length-label">{label}</div>
            <div class="settings-quiz-length-controls">
              <div class="rq-selector-group">
                {[5, 10, 20, 30, 50].map(n => (
                  <button
                    key={n}
                    type="button"
                    class={`rq-selector-btn${settings[key] === n ? ' active' : ''}`}
                    onClick={() => update({ [key]: n })}
                  >{n}</button>
                ))}
              </div>
              <div class="settings-timeout">
                <label for={`settings-${key}-input`}>Custom</label>
                <input
                  id={`settings-${key}-input`}
                  type="number"
                  min={QUIZ_LENGTH_MIN}
                  max={QUIZ_LENGTH_MAX}
                  step="1"
                  value={settings[key]}
                  onInput={(e) => {
                    const n = Number(e.currentTarget.value);
                    if (Number.isFinite(n) && n >= QUIZ_LENGTH_MIN && n <= QUIZ_LENGTH_MAX) {
                      update({ [key]: Math.round(n) });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}
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

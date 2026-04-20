import { useState, useRef, useEffect } from 'preact/hooks';
import { copyToClipboard } from '../utils/share.js';

export function ShareButton({
  url,
  content,
  label = 'Share Link',
  copiedLabel = 'Link Copied!',
  disabled = false,
}) {
  // `content` is the payload that gets copied. Defaults to `url` so the
  // "Share Link" variant stays a one-prop call. The "Share Score" variant
  // passes a full message that already embeds the URL.
  const payload = content ?? url;
  const [status, setStatus] = useState('idle'); // 'idle' | 'copied' | 'error'
  const timerRef = useRef(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  async function onClick() {
    if (disabled || !payload) return;
    const ok = await copyToClipboard(payload);
    setStatus(ok ? 'copied' : 'error');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus('idle'), 2200);
  }

  const text = status === 'copied' ? copiedLabel :
               status === 'error'  ? 'Copy Failed \u2014 select text below:'
                                   : label;

  return (
    <div class="share-wrap">
      <button
        type="button"
        class={`share-btn${status === 'copied' ? ' copied' : ''}${status === 'error' ? ' error' : ''}`}
        onClick={onClick}
        disabled={disabled || !payload}
        aria-label={label}
      >
        {text}
      </button>
      {status === 'error' && (
        <textarea
          class="share-fallback"
          readOnly
          rows={2}
          value={payload}
          onFocus={(e) => e.currentTarget.select()}
        />
      )}
    </div>
  );
}

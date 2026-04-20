import { useState, useRef, useEffect } from 'preact/hooks';
import { copyToClipboard } from '../utils/share.js';

export function ShareButton({ url, label = 'Share Quiz', disabled = false }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'copied' | 'error'
  const timerRef = useRef(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  async function onClick() {
    if (disabled || !url) return;
    const ok = await copyToClipboard(url);
    setStatus(ok ? 'copied' : 'error');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus('idle'), 2200);
  }

  const text = status === 'copied' ? 'Link Copied!' :
               status === 'error'  ? 'Copy Failed \u2014 Long-press URL:'
                                   : label;

  return (
    <div class="share-wrap">
      <button
        type="button"
        class={`share-btn${status === 'copied' ? ' copied' : ''}${status === 'error' ? ' error' : ''}`}
        onClick={onClick}
        disabled={disabled || !url}
        aria-label={label}
      >
        {text}
      </button>
      {status === 'error' && (
        <input
          class="share-fallback"
          type="text"
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
        />
      )}
    </div>
  );
}

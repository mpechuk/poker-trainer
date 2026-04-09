import { getIllus } from '../utils/illustrations.jsx';

export function Modal({ term, onClose }) {
  if (!term) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div class="modal-overlay open" onClick={handleOverlayClick}>
      <div class="modal">
        <button class="modal-close" onClick={onClose}>{'\u2715'}</button>
        <div class="mc">{term.cat}</div>
        <div class="mt">{term.term}</div>
        <div class="md">{term.def}</div>
        <div class="mi" dangerouslySetInnerHTML={{ __html: getIllus(term) }} />
      </div>
    </div>
  );
}

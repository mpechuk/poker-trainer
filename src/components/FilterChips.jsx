import { CATS } from '../data/terms.js';

export function FilterChips({ activeCats, onToggle }) {
  return (
    <div class="filters">
      <button
        class={`chip ${activeCats.size === CATS.length ? 'on' : ''}`}
        onClick={() => onToggle('ALL')}
      >All</button>
      {CATS.map(cat => (
        <button
          key={cat}
          class={`chip ${activeCats.has(cat) ? 'on' : ''}`}
          onClick={() => onToggle(cat)}
        >{cat}</button>
      ))}
    </div>
  );
}

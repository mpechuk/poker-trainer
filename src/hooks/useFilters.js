import { useState } from 'preact/hooks';
import { CATS } from '../data/terms.js';

export function useFilters() {
  const [activeCats, setActiveCats] = useState(new Set(CATS));

  function toggleCat(cat) {
    setActiveCats(prev => {
      const next = new Set(prev);
      if (cat === 'ALL') {
        return new Set(CATS);
      }
      if (next.has(cat)) {
        if (next.size === 1) return prev;
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  return { activeCats, toggleCat };
}

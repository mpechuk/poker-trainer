import { useState, useEffect, useCallback } from 'preact/hooks';
import { TERMS } from '../data/terms.js';
import { shuffle } from '../utils/shuffle.js';

export function useDeck(activeCats) {
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const filtered = TERMS.filter(t => activeCats.has(t.cat));
    const shuffled = shuffle(filtered);
    setDeck(shuffled);
    setIdx(0);
    setFlipped(false);
  }, [activeCats]);

  const flipCard = useCallback(() => {
    setFlipped(f => !f);
  }, []);

  const navCard = useCallback((dir) => {
    setFlipped(false);
    setIdx(i => (i + dir + deck.length) % deck.length);
  }, [deck.length]);

  const shuffleDeck = useCallback(() => {
    setDeck(d => shuffle(d));
    setIdx(0);
    setFlipped(false);
  }, []);

  return { deck, idx, flipped, flipCard, navCard, shuffleDeck };
}

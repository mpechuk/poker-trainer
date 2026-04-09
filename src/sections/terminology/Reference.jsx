import { useState } from 'preact/hooks';
import { SubNav } from '../../components/SubNav.jsx';
import { FilterChips } from '../../components/FilterChips.jsx';
import { Modal } from '../../components/Modal.jsx';
import { useFilters } from '../../hooks/useFilters.js';
import { TERMS } from '../../data/terms.js';
import '../../styles/reference.css';

const TABS = [
  { path: '/terminology/study', label: 'Study' },
  { path: '/terminology/quiz', label: 'Quiz' },
  { path: '/terminology/reference', label: 'Reference' }
];

export function Reference({ path }) {
  const { activeCats, toggleCat } = useFilters();
  const [search, setSearch] = useState('');
  const [modalTerm, setModalTerm] = useState(null);

  const q = search.toLowerCase();
  const filtered = TERMS
    .filter(t => activeCats.has(t.cat))
    .filter(t => !q || t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q));

  const byCat = {};
  filtered.forEach(t => {
    if (!byCat[t.cat]) byCat[t.cat] = [];
    byCat[t.cat].push(t);
  });

  return (
    <div>
      <SubNav tabs={TABS} currentPath="/terminology/reference" />
      <FilterChips activeCats={activeCats} onToggle={toggleCat} />
      <div class="ref-panel">
        <div class="search-wrap">
          <span class="search-icon">{'\u2660'}</span>
          <input
            type="text"
            placeholder="Search terms\u2026"
            value={search}
            onInput={e => setSearch(e.target.value)}
          />
        </div>
        <div>
          {Object.keys(byCat).length === 0 ? (
            <p style="color:var(--muted);text-align:center;padding:2rem">No terms match your search.</p>
          ) : (
            Object.entries(byCat).map(([cat, terms]) => (
              <div class="ref-group" key={cat}>
                <div class="ref-group-title">{cat}</div>
                <div class="ref-grid">
                  {terms.map(t => (
                    <div class="ref-card" key={t.term} onClick={() => setModalTerm(t)}>
                      <div class="rc-term">{t.term}</div>
                      <div class="rc-def">{t.def.slice(0, 90)}{t.def.length > 90 ? '\u2026' : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {modalTerm && <Modal term={modalTerm} onClose={() => setModalTerm(null)} />}
    </div>
  );
}

// ─────────────────── ILLUSTRATIONS ───────────────────
export function cardSvg(rank, suit, w=52, h=74) {
  const red = suit==='♥'||suit==='♦';
  const c = red?'#c0392b':'#1a1a2a';
  const fs = rank.length>1?10:13;
  return `<svg class="playing-card" width="${w}" height="${h}" viewBox="0 0 52 74">
    <rect width="52" height="74" rx="5" fill="#f9f5ea" stroke="#d4c8a0" stroke-width=".8"/>
    <text x="5" y="15" font-family="Georgia,serif" font-size="${fs}" font-weight="700" fill="${c}">${rank}</text>
    <text x="26" y="46" font-size="22" text-anchor="middle" fill="${c}">${suit}</text>
    <text x="47" y="68" font-family="Georgia,serif" font-size="${fs}" font-weight="700" fill="${c}" text-anchor="end">${rank}</text>
  </svg>`;
}

export function hand(...cards) {
  return `<div class="hand">${cards.map(([r,s])=>cardSvg(r,s)).join('')}</div>`;
}

export const ILLUS = {
  'royal-flush': ()=>hand(['A','♠'],['K','♠'],['Q','♠'],['J','♠'],['10','♠']),
  'straight-flush': ()=>hand(['7','♥'],['8','♥'],['9','♥'],['10','♥'],['J','♥']),
  'quads': ()=>hand(['A','♠'],['A','♥'],['A','♦'],['A','♣'],['K','♠']),
  'full-house': ()=>hand(['K','♠'],['K','♥'],['K','♦'],['7','♥'],['7','♦']),
  'flush': ()=>hand(['A','♦'],['J','♦'],['9','♦'],['6','♦'],['2','♦']),
  'straight': ()=>hand(['8','♠'],['9','♦'],['10','♥'],['J','♠'],['Q','♣']),
  'trips': ()=>hand(['9','♠'],['9','♥'],['9','♦'],['A','♣'],['4','♥']),
  'two-pair': ()=>hand(['K','♠'],['K','♥'],['Q','♦'],['Q','♣'],['J','♠']),
  'pair': ()=>hand(['A','♠'],['A','♣'],['K','♦'],['J','♥'],['7','♠']),
  'high-card': ()=>hand(['A','♠'],['J','♣'],['9','♦'],['6','♥'],['2','♣']),
  'hole-cards': ()=>`<div class="hand">${cardSvg('A','♠',60,86)}${cardSvg('K','♥',60,86)}</div>`,
  'suited': ()=>`<div class="hand">${cardSvg('A','♥',60,86)}${cardSvg('K','♥',60,86)}</div>`,
  'pocket-pair': ()=>`<div class="hand">${cardSvg('8','♠',60,86)}${cardSvg('8','♦',60,86)}</div>`,
  'nuts': ()=>hand(['A','♣'],['K','♣'],['Q','♣'],['J','♣'],['10','♣']),
  'board': ()=>`<div style="display:flex;flex-direction:column;gap:6px;align-items:center">
    <div style="font-size:.7rem;color:#8a7a5a;letter-spacing:.1em">COMMUNITY CARDS</div>
    <div class="hand">${['9♠','K♥','3♦','7♣','Q♠'].map(c=>cardSvg(c.slice(0,-1),c.slice(-1),44,62)).join('')}</div>
  </div>`,
  'flop': ()=>`<div style="display:flex;flex-direction:column;gap:6px;align-items:center">
    <div style="font-size:.7rem;color:#8a7a5a;letter-spacing:.1em">FLOP</div>
    <div class="hand">${cardSvg('9','♠',54,76)}${cardSvg('K','♥',54,76)}${cardSvg('3','♦',54,76)}</div>
  </div>`,
  'turn': ()=>`<div style="display:flex;flex-direction:column;gap:6px;align-items:center">
    <div style="font-size:.7rem;color:#8a7a5a;letter-spacing:.1em">TURN</div>
    <div class="hand">${['9♠','K♥','3♦','7♣'].map(c=>cardSvg(c.slice(0,-1),c.slice(-1),50,70)).join('')}</div>
  </div>`,
  'river': ()=>`<div style="display:flex;flex-direction:column;gap:6px;align-items:center">
    <div style="font-size:.7rem;color:#8a7a5a;letter-spacing:.1em">RIVER (5th Street)</div>
    <div class="hand">${['9♠','K♥','3♦','7♣','Q♠'].map(c=>cardSvg(c.slice(0,-1),c.slice(-1),44,62)).join('')}</div>
  </div>`,
  'chips': ()=>`<svg width="140" height="60" viewBox="0 0 140 60">
    ${[0,1,2,3,4].map((i,_,a)=>`
      <ellipse cx="${22+i*24}" cy="38" rx="18" ry="8" fill="${['#1a3a8a','#c0392b','#1a3a1a','#8a1a8a','#d4af37'][i]}" opacity=".9"/>
      <rect x="${4+i*24}" y="22" width="36" height="16" fill="${['#1a3a8a','#c0392b','#1a3a1a','#8a1a8a','#d4af37'][i]}"/>
      <ellipse cx="${22+i*24}" cy="22" rx="18" ry="8" fill="${['#2a4aaa','#e05050','#2a5a2a','#aa2aaa','#f0d060'][i]}" opacity=".9"/>
    `).join('')}
    <text x="70" y="58" text-anchor="middle" font-size="10" fill="#c9a84c" font-family="Georgia">CHIPS</text>
  </svg>`,
  // ── Betting Action Illustrations ──
  'act-fold': ()=>`<svg width="160" height="68" viewBox="0 0 160 68">
    <rect x="32" y="4" width="26" height="38" rx="3" fill="#3a3a4a" stroke="#555" stroke-width=".8" transform="rotate(-18 45 23)"/>
    <rect x="50" y="4" width="26" height="38" rx="3" fill="#3a3a4a" stroke="#555" stroke-width=".8" transform="rotate(-6 63 23)"/>
    <line x1="100" y1="12" x2="120" y2="34" stroke="#c0392b" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="120" y1="12" x2="100" y2="34" stroke="#c0392b" stroke-width="2.5" stroke-linecap="round"/>
    <text x="80" y="58" text-anchor="middle" font-size="9" fill="#8a7a5a" font-family="Georgia">cards mucked — out of hand</text>
  </svg>`,
  'act-check': ()=>`<svg width="160" height="68" viewBox="0 0 160 68">
    <circle cx="80" cy="26" r="18" fill="none" stroke="#27ae60" stroke-width="2"/>
    <polyline points="70,26 77,35 92,18" fill="none" stroke="#27ae60" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="80" y="58" text-anchor="middle" font-size="9" fill="#8a7a5a" font-family="Georgia">pass action — no chips wagered</text>
  </svg>`,
  'act-call': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <rect x="30" y="14" width="24" height="14" rx="3" fill="#c0392b"/>
    <text x="42" y="25" text-anchor="middle" font-size="8" fill="white" font-family="Georgia" font-weight="600">$50</text>
    <text x="42" y="42" text-anchor="middle" font-size="8" fill="#888" font-family="Georgia">Opp bets</text>
    <text x="90" y="25" text-anchor="middle" font-size="16" fill="#555" font-family="Georgia">=</text>
    <rect x="126" y="14" width="24" height="14" rx="3" fill="#c9a84c"/>
    <text x="138" y="25" text-anchor="middle" font-size="8" fill="#1a1a2a" font-family="Georgia" font-weight="600">$50</text>
    <text x="138" y="42" text-anchor="middle" font-size="8" fill="#c9a84c" font-family="Georgia">You call</text>
    <text x="90" y="62" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">match the current bet to stay in</text>
  </svg>`,
  'act-bet': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <ellipse cx="90" cy="12" rx="30" ry="10" fill="rgba(39,174,96,.12)" stroke="#27ae60" stroke-width=".8"/>
    <text x="90" y="16" text-anchor="middle" font-size="8" fill="#27ae60" font-family="Georgia">POT $40</text>
    <rect x="78" y="30" width="24" height="14" rx="3" fill="#c9a84c"/>
    <text x="90" y="40" text-anchor="middle" font-size="8" fill="#1a1a2a" font-family="Georgia" font-weight="600">$30</text>
    <line x1="90" y1="28" x2="90" y2="22" stroke="#c9a84c" stroke-width="1.5" stroke-dasharray="3,2"/>
    <text x="90" y="56" text-anchor="middle" font-size="9" fill="#c9a84c" font-family="Georgia">You bet $30</text>
    <text x="90" y="67" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">first aggression on this street</text>
  </svg>`,
  'act-raise': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <rect x="22" y="18" width="24" height="14" rx="3" fill="#c0392b"/>
    <text x="34" y="28" text-anchor="middle" font-size="8" fill="white" font-family="Georgia" font-weight="600">$30</text>
    <text x="34" y="43" text-anchor="middle" font-size="7" fill="#888" font-family="Georgia">Opp bets</text>
    <text x="80" y="28" text-anchor="middle" font-size="16" fill="#555">→</text>
    <rect x="118" y="14" width="36" height="18" rx="3" fill="#c9a84c"/>
    <text x="136" y="27" text-anchor="middle" font-size="9" fill="#1a1a2a" font-family="Georgia" font-weight="700">$90</text>
    <text x="136" y="43" text-anchor="middle" font-size="7" fill="#c9a84c" font-family="Georgia">You raise</text>
    <text x="90" y="62" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">increase the bet — opponents must decide</text>
  </svg>`,
  'act-3bet': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <rect x="6" y="20" width="20" height="10" rx="2" fill="#888"/>
    <text x="16" y="28" text-anchor="middle" font-size="6" fill="white" font-family="Georgia">$10</text>
    <text x="16" y="40" text-anchor="middle" font-size="6" fill="#666" font-family="Georgia">Open</text>
    <text x="38" y="28" font-size="10" fill="#555">→</text>
    <rect x="50" y="18" width="24" height="12" rx="2" fill="#c0392b"/>
    <text x="62" y="27" text-anchor="middle" font-size="7" fill="white" font-family="Georgia">$30</text>
    <text x="62" y="40" text-anchor="middle" font-size="6" fill="#888" font-family="Georgia">Raise</text>
    <text x="86" y="28" font-size="10" fill="#555">→</text>
    <rect x="98" y="14" width="34" height="16" rx="3" fill="#c9a84c"/>
    <text x="115" y="25" text-anchor="middle" font-size="8" fill="#1a1a2a" font-family="Georgia" font-weight="700">$90</text>
    <text x="115" y="40" text-anchor="middle" font-size="7" fill="#c9a84c" font-weight="700" font-family="Georgia">3-Bet!</text>
    <text x="90" y="60" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">the re-raise — third bet in sequence</text>
  </svg>`,
  'act-4bet': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <rect x="2" y="22" width="16" height="8" rx="2" fill="#888"/>
    <text x="10" y="29" text-anchor="middle" font-size="5" fill="white" font-family="Georgia">$10</text>
    <text x="25" y="28" font-size="8" fill="#555">→</text>
    <rect x="32" y="20" width="20" height="10" rx="2" fill="#888"/>
    <text x="42" y="28" text-anchor="middle" font-size="6" fill="white" font-family="Georgia">$30</text>
    <text x="59" y="28" font-size="8" fill="#555">→</text>
    <rect x="66" y="18" width="24" height="12" rx="2" fill="#c0392b"/>
    <text x="78" y="27" text-anchor="middle" font-size="6" fill="white" font-family="Georgia">$90</text>
    <text x="97" y="28" font-size="8" fill="#555">→</text>
    <rect x="106" y="14" width="38" height="16" rx="3" fill="#c9a84c"/>
    <text x="125" y="25" text-anchor="middle" font-size="8" fill="#1a1a2a" font-family="Georgia" font-weight="700">$250</text>
    <text x="125" y="42" text-anchor="middle" font-size="7" fill="#c9a84c" font-weight="700" font-family="Georgia">4-Bet!</text>
    <text x="90" y="62" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">re-raise of a 3-bet — extreme strength</text>
  </svg>`,
  'act-allin': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <ellipse cx="90" cy="10" rx="28" ry="8" fill="rgba(39,174,96,.12)" stroke="#27ae60" stroke-width=".8"/>
    <text x="90" y="14" text-anchor="middle" font-size="7" fill="#27ae60" font-family="Georgia">POT</text>
    ${[0,1,2,3,4].map(i=>`<rect x="${64+i*11}" y="${30-i*2}" width="10" height="8" rx="1.5" fill="#c9a84c" opacity="${1-i*.1}"/>`).join('')}
    <line x1="90" y1="22" x2="90" y2="18" stroke="#c9a84c" stroke-width="1.5" stroke-dasharray="2,2"/>
    <text x="90" y="50" text-anchor="middle" font-size="13" fill="#c9a84c" font-weight="700" font-family="Georgia">ALL IN</text>
    <text x="90" y="64" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">commit every chip — no turning back</text>
  </svg>`,
  'act-limp': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <ellipse cx="90" cy="12" rx="30" ry="10" fill="rgba(39,174,96,.12)" stroke="#27ae60" stroke-width=".8"/>
    <text x="90" y="16" text-anchor="middle" font-size="8" fill="#27ae60" font-family="Georgia">BB $5</text>
    <rect x="80" y="30" width="20" height="12" rx="2" fill="rgba(201,168,76,.4)" stroke="#c9a84c" stroke-width=".8"/>
    <text x="90" y="39" text-anchor="middle" font-size="7" fill="#c9a84c" font-family="Georgia">$5</text>
    <line x1="90" y1="28" x2="90" y2="22" stroke="#c9a84c" stroke-width="1" stroke-dasharray="2,2"/>
    <text x="90" y="56" text-anchor="middle" font-size="9" fill="#c9a84c" font-family="Georgia">just call the blind</text>
    <text x="90" y="67" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">enter pot without raising — passive</text>
  </svg>`,
  'act-straddle': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <rect x="16" y="14" width="28" height="16" rx="3" fill="rgba(39,174,96,.2)" stroke="#27ae60" stroke-width=".8"/>
    <text x="30" y="26" text-anchor="middle" font-size="8" fill="#27ae60" font-family="Georgia">SB $1</text>
    <rect x="60" y="10" width="28" height="20" rx="3" fill="rgba(39,174,96,.3)" stroke="#27ae60" stroke-width=".8"/>
    <text x="74" y="24" text-anchor="middle" font-size="8" fill="#27ae60" font-family="Georgia">BB $2</text>
    <rect x="106" y="6" width="36" height="24" rx="3" fill="rgba(201,168,76,.25)" stroke="#c9a84c" stroke-width="1.2"/>
    <text x="124" y="22" text-anchor="middle" font-size="9" fill="#c9a84c" font-weight="600" font-family="Georgia">STR $4</text>
    <text x="90" y="48" text-anchor="middle" font-size="8" fill="#c9a84c" font-family="Georgia">voluntary 3rd blind</text>
    <text x="90" y="60" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">posted before cards are dealt</text>
  </svg>`,
  'act-open': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <ellipse cx="50" cy="14" rx="28" ry="10" fill="rgba(39,174,96,.12)" stroke="#27ae60" stroke-width=".8"/>
    <text x="50" y="18" text-anchor="middle" font-size="7" fill="#27ae60" font-family="Georgia">blinds only</text>
    <text x="90" y="18" text-anchor="middle" font-size="14" fill="#555">→</text>
    <rect x="114" y="6" width="34" height="18" rx="3" fill="#c9a84c"/>
    <text x="131" y="19" text-anchor="middle" font-size="8" fill="#1a1a2a" font-family="Georgia" font-weight="700">3× BB</text>
    <text x="131" y="36" text-anchor="middle" font-size="7" fill="#c9a84c" font-family="Georgia">Open raise</text>
    <text x="90" y="54" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">first voluntary raise pre-flop</text>
  </svg>`,
  // ── Strategy Illustrations ──
  'strat-cbet': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <rect x="10" y="4" width="44" height="16" rx="3" fill="rgba(201,168,76,.2)" stroke="#c9a84c" stroke-width=".8"/>
    <text x="32" y="15" text-anchor="middle" font-size="7" fill="#c9a84c" font-family="Georgia">Pre: YOU raise</text>
    <text x="66" y="15" text-anchor="middle" font-size="12" fill="#555">→</text>
    <text x="120" y="8" text-anchor="middle" font-size="7" fill="#8a7a5a" font-family="Georgia">FLOP</text>
    <g transform="translate(98,14)">${['9♠','K♥','3♦'].map((c,i)=>`<svg x="${i*20}" width="18" height="26" viewBox="0 0 52 74"><rect width="52" height="74" rx="5" fill="#f9f5ea" stroke="#d4c8a0" stroke-width=".8"/><text x="26" y="46" font-size="22" text-anchor="middle" fill="${c.endsWith('♥')||c.endsWith('♦')?'#c0392b':'#1a1a2a'}">${c.slice(-1)}</text></svg>`).join('')}</g>
    <rect x="116" y="44" width="28" height="14" rx="3" fill="#c9a84c"/>
    <text x="130" y="54" text-anchor="middle" font-size="7" fill="#1a1a2a" font-family="Georgia" font-weight="600">BET</text>
    <text x="56" y="62" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">raiser bets flop — continues story</text>
  </svg>`,
  'strat-donk': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <circle cx="30" cy="16" r="8" fill="rgba(192,57,43,.15)" stroke="#c0392b" stroke-width="1"/>
    <text x="30" y="19" text-anchor="middle" font-size="6" fill="#c0392b" font-family="Georgia">OOP</text>
    <circle cx="150" cy="16" r="8" fill="rgba(201,168,76,.15)" stroke="#c9a84c" stroke-width="1"/>
    <text x="150" y="19" text-anchor="middle" font-size="6" fill="#c9a84c" font-family="Georgia">PFR</text>
    <rect x="52" y="30" width="24" height="12" rx="2" fill="#c0392b"/>
    <text x="64" y="39" text-anchor="middle" font-size="7" fill="white" font-family="Georgia" font-weight="600">BET</text>
    <line x1="78" y1="36" x2="140" y2="18" stroke="#c0392b" stroke-width="1" stroke-dasharray="3,2"/>
    <text x="110" y="36" text-anchor="middle" font-size="7" fill="#c0392b" font-family="Georgia">into raiser!</text>
    <text x="90" y="58" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">out-of-position player leads into aggressor</text>
  </svg>`,
  'strat-probe': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <circle cx="30" cy="14" r="8" fill="rgba(201,168,76,.15)" stroke="#c9a84c" stroke-width="1"/>
    <text x="30" y="17" text-anchor="middle" font-size="6" fill="#c9a84c" font-family="Georgia">YOU</text>
    <circle cx="150" cy="14" r="8" fill="rgba(136,136,136,.2)" stroke="#888" stroke-width="1"/>
    <text x="150" y="17" text-anchor="middle" font-size="6" fill="#888" font-family="Georgia">IP</text>
    <polyline points="143,24 147,30 155,20" fill="none" stroke="#27ae60" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="150" y="40" text-anchor="middle" font-size="7" fill="#27ae60" font-family="Georgia">checked</text>
    <rect x="44" y="30" width="24" height="12" rx="2" fill="#c9a84c"/>
    <text x="56" y="39" text-anchor="middle" font-size="7" fill="#1a1a2a" font-family="Georgia" font-weight="600">BET</text>
    <text x="90" y="58" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">bet after opponent shows weakness</text>
  </svg>`,
  'strat-checkraise': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <rect x="6" y="8" width="40" height="18" rx="3" fill="rgba(39,174,96,.15)" stroke="#27ae60" stroke-width=".8"/>
    <text x="26" y="20" text-anchor="middle" font-size="8" fill="#27ae60" font-family="Georgia">✓ Check</text>
    <text x="56" y="20" font-size="10" fill="#555">→</text>
    <rect x="64" y="8" width="42" height="18" rx="3" fill="rgba(136,136,136,.15)" stroke="#888" stroke-width=".8"/>
    <text x="85" y="20" text-anchor="middle" font-size="8" fill="#888" font-family="Georgia">Opp bets</text>
    <text x="116" y="20" font-size="10" fill="#555">→</text>
    <rect x="124" y="4" width="46" height="22" rx="3" fill="rgba(201,168,76,.2)" stroke="#c9a84c" stroke-width="1.2"/>
    <text x="147" y="19" text-anchor="middle" font-size="9" fill="#c9a84c" font-weight="700" font-family="Georgia">RAISE!</text>
    <text x="90" y="44" text-anchor="middle" font-size="9" fill="#c9a84c" font-family="Georgia">trap sprung — deceptive strength</text>
    <text x="90" y="58" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">check, let them bet, then raise</text>
  </svg>`,
  'strat-slowplay': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <g transform="translate(28,4)">${cardSvg('A','♠',36,50)}</g>
    <g transform="translate(68,4)">${cardSvg('A','♥',36,50)}</g>
    <circle cx="140" cy="28" r="14" fill="none" stroke="#27ae60" stroke-width="1.5"/>
    <polyline points="133,28 138,34 149,22" fill="none" stroke="#27ae60" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="140" y="48" text-anchor="middle" font-size="7" fill="#27ae60" font-family="Georgia">just check</text>
    <text x="90" y="66" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">disguise monster hand — let opponents build pot</text>
  </svg>`,
  'strat-value': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <ellipse cx="90" cy="10" rx="28" ry="8" fill="rgba(39,174,96,.12)" stroke="#27ae60" stroke-width=".8"/>
    <text x="90" y="14" text-anchor="middle" font-size="7" fill="#27ae60" font-family="Georgia">POT $80</text>
    <rect x="78" y="24" width="24" height="14" rx="3" fill="#c9a84c"/>
    <text x="90" y="34" text-anchor="middle" font-size="8" fill="#1a1a2a" font-family="Georgia" font-weight="600">$40</text>
    <text x="90" y="50" text-anchor="middle" font-size="8" fill="#c9a84c" font-family="Georgia">sized to get called</text>
    <text x="90" y="64" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">bet strong hand — extract value from worse</text>
  </svg>`,
  'strat-bluff': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <g transform="translate(16,2)"><svg width="30" height="42" viewBox="0 0 52 74"><rect width="52" height="74" rx="5" fill="#f9f5ea" stroke="#d4c8a0" stroke-width=".8"/><text x="5" y="15" font-family="Georgia,serif" font-size="13" font-weight="700" fill="#1a1a2a">7</text><text x="26" y="46" font-size="22" text-anchor="middle" fill="#1a1a2a">♠</text></svg></g>
    <g transform="translate(50,2)"><svg width="30" height="42" viewBox="0 0 52 74"><rect width="52" height="74" rx="5" fill="#f9f5ea" stroke="#d4c8a0" stroke-width=".8"/><text x="5" y="15" font-family="Georgia,serif" font-size="13" font-weight="700" fill="#1a1a2a">2</text><text x="26" y="46" font-size="22" text-anchor="middle" fill="#1a1a2a">♣</text></svg></g>
    <text x="100" y="16" text-anchor="middle" font-size="8" fill="#c0392b" font-family="Georgia">weak hand →</text>
    <rect x="126" y="6" width="36" height="18" rx="3" fill="#c0392b"/>
    <text x="144" y="19" text-anchor="middle" font-size="9" fill="white" font-family="Georgia" font-weight="700">BIG BET</text>
    <text x="90" y="56" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">bet with nothing — make opponents fold better</text>
  </svg>`,
  'strat-semibluff': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <g transform="translate(10,2)"><svg width="28" height="40" viewBox="0 0 52 74"><rect width="52" height="74" rx="5" fill="#f9f5ea" stroke="#d4c8a0" stroke-width=".8"/><text x="5" y="15" font-family="Georgia,serif" font-size="13" font-weight="700" fill="#c0392b">9</text><text x="26" y="46" font-size="22" text-anchor="middle" fill="#c0392b">♥</text></svg></g>
    <g transform="translate(42,2)"><svg width="28" height="40" viewBox="0 0 52 74"><rect width="52" height="74" rx="5" fill="#f9f5ea" stroke="#d4c8a0" stroke-width=".8"/><text x="5" y="15" font-family="Georgia,serif" font-size="13" font-weight="700" fill="#c0392b">8</text><text x="26" y="46" font-size="22" text-anchor="middle" fill="#c0392b">♥</text></svg></g>
    <rect x="82" y="8" width="24" height="12" rx="2" fill="#c9a84c"/>
    <text x="94" y="17" text-anchor="middle" font-size="7" fill="#1a1a2a" font-family="Georgia" font-weight="600">BET</text>
    <text x="130" y="10" text-anchor="middle" font-size="7" fill="#27ae60" font-family="Georgia">fold equity</text>
    <text x="130" y="22" text-anchor="middle" font-size="7" fill="#27ae60" font-family="Georgia">+ draw outs</text>
    <text x="90" y="56" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">bluff with a draw — two ways to win</text>
  </svg>`,
  'strat-overbet': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <rect x="20" y="10" width="50" height="16" rx="4" fill="rgba(39,174,96,.2)" stroke="#27ae60" stroke-width=".8"/>
    <text x="45" y="22" text-anchor="middle" font-size="8" fill="#27ae60" font-family="Georgia">Pot: $100</text>
    <rect x="20" y="32" width="100" height="18" rx="4" fill="rgba(201,168,76,.25)" stroke="#c9a84c" stroke-width="1.2"/>
    <text x="70" y="45" text-anchor="middle" font-size="9" fill="#c9a84c" font-weight="700" font-family="Georgia">Bet: $200</text>
    <text x="140" y="44" text-anchor="middle" font-size="10" fill="#c0392b" font-family="Georgia" font-weight="700">2×</text>
    <text x="90" y="64" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">bet larger than the pot — max pressure</text>
  </svg>`,
  'strat-squeeze': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <circle cx="30" cy="14" r="8" fill="rgba(136,136,136,.2)" stroke="#888" stroke-width="1"/>
    <text x="30" y="17" text-anchor="middle" font-size="6" fill="#888" font-family="Georgia">raise</text>
    <circle cx="70" cy="14" r="8" fill="rgba(136,136,136,.2)" stroke="#888" stroke-width="1"/>
    <text x="70" y="17" text-anchor="middle" font-size="5" fill="#888" font-family="Georgia">call</text>
    <circle cx="110" cy="14" r="8" fill="rgba(136,136,136,.2)" stroke="#888" stroke-width="1"/>
    <text x="110" y="17" text-anchor="middle" font-size="5" fill="#888" font-family="Georgia">call</text>
    <rect x="126" y="4" width="44" height="22" rx="3" fill="rgba(201,168,76,.2)" stroke="#c9a84c" stroke-width="1.2"/>
    <text x="148" y="12" text-anchor="middle" font-size="6" fill="#c9a84c" font-family="Georgia">YOU</text>
    <text x="148" y="22" text-anchor="middle" font-size="8" fill="#c9a84c" font-weight="700" font-family="Georgia">3-BET!</text>
    <line x1="130" y1="30" x2="40" y2="30" stroke="#c9a84c" stroke-width="1" stroke-dasharray="3,2" marker-start="url(#a)"/>
    <text x="90" y="42" text-anchor="middle" font-size="8" fill="#c9a84c" font-family="Georgia">squeeze out multiple opponents</text>
    <text x="90" y="56" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">3-bet vs. a raiser + caller(s)</text>
  </svg>`,
  'strat-float': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <rect x="6" y="6" width="68" height="20" rx="3" fill="rgba(136,136,136,.1)" stroke="#888" stroke-width=".8"/>
    <text x="40" y="12" text-anchor="middle" font-size="6" fill="#888" font-family="Georgia">FLOP: Opp bets</text>
    <text x="40" y="22" text-anchor="middle" font-size="7" fill="#c9a84c" font-family="Georgia">You call (float)</text>
    <text x="86" y="18" font-size="12" fill="#555">→</text>
    <rect x="96" y="6" width="76" height="20" rx="3" fill="rgba(201,168,76,.15)" stroke="#c9a84c" stroke-width="1"/>
    <text x="134" y="12" text-anchor="middle" font-size="6" fill="#888" font-family="Georgia">TURN: Opp checks</text>
    <text x="134" y="22" text-anchor="middle" font-size="7" fill="#c9a84c" font-weight="600" font-family="Georgia">You bluff!</text>
    <text x="90" y="44" text-anchor="middle" font-size="8" fill="#c9a84c" font-family="Georgia">call now → bluff later</text>
    <text x="90" y="58" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">exploit opponent's weakness on next street</text>
  </svg>`,
  'strat-triplebarrel': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <rect x="6" y="8" width="46" height="18" rx="3" fill="rgba(201,168,76,.15)" stroke="#c9a84c" stroke-width=".8"/>
    <text x="29" y="14" text-anchor="middle" font-size="6" fill="#888" font-family="Georgia">FLOP</text>
    <text x="29" y="22" text-anchor="middle" font-size="7" fill="#c9a84c" font-weight="600" font-family="Georgia">Bet</text>
    <text x="58" y="20" font-size="8" fill="#555">→</text>
    <rect x="66" y="8" width="46" height="18" rx="3" fill="rgba(201,168,76,.2)" stroke="#c9a84c" stroke-width=".8"/>
    <text x="89" y="14" text-anchor="middle" font-size="6" fill="#888" font-family="Georgia">TURN</text>
    <text x="89" y="22" text-anchor="middle" font-size="7" fill="#c9a84c" font-weight="600" font-family="Georgia">Bet</text>
    <text x="118" y="20" font-size="8" fill="#555">→</text>
    <rect x="126" y="6" width="48" height="22" rx="3" fill="rgba(201,168,76,.3)" stroke="#c9a84c" stroke-width="1.2"/>
    <text x="150" y="14" text-anchor="middle" font-size="6" fill="#888" font-family="Georgia">RIVER</text>
    <text x="150" y="24" text-anchor="middle" font-size="8" fill="#c9a84c" font-weight="700" font-family="Georgia">Bet!</text>
    <text x="90" y="44" text-anchor="middle" font-size="9" fill="#c9a84c" font-family="Georgia">fire all three streets</text>
    <text x="90" y="58" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">maximum aggression through every round</text>
  </svg>`,
  'strat-iso': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    <circle cx="40" cy="16" r="8" fill="rgba(136,136,136,.2)" stroke="#888" stroke-width="1"/>
    <text x="40" y="19" text-anchor="middle" font-size="6" fill="#888" font-family="Georgia">limp</text>
    <circle cx="80" cy="16" r="8" fill="rgba(136,136,136,.1)" stroke="#666" stroke-width=".8" stroke-dasharray="2,2"/>
    <text x="80" y="19" text-anchor="middle" font-size="6" fill="#666" font-family="Georgia">fold</text>
    <rect x="110" y="4" width="50" height="22" rx="3" fill="rgba(201,168,76,.2)" stroke="#c9a84c" stroke-width="1.2"/>
    <text x="135" y="12" text-anchor="middle" font-size="6" fill="#c9a84c" font-family="Georgia">YOU</text>
    <text x="135" y="22" text-anchor="middle" font-size="8" fill="#c9a84c" font-weight="700" font-family="Georgia">RAISE</text>
    <line x1="48" y1="16" x2="72" y2="16" stroke="#888" stroke-width=".8" stroke-dasharray="2,2"/>
    <text x="90" y="42" text-anchor="middle" font-size="8" fill="#c9a84c" font-family="Georgia">isolate the weak player</text>
    <text x="90" y="56" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">raise over limper to play heads-up</text>
  </svg>`,
  // ── Effective Stack ──
  'eff-stack': ()=>`<svg width="180" height="70" viewBox="0 0 180 70">
    ${[0,1,2,3,4,5].map(i=>`<rect x="28" y="${4+i*7}" width="14" height="6" rx="1" fill="#c9a84c" opacity="${1-i*.08}"/>`).join('')}
    <text x="35" y="56" text-anchor="middle" font-size="7" fill="#c9a84c" font-family="Georgia">$500</text>
    ${[0,1,2,3].map(i=>`<rect x="100" y="${18+i*7}" width="14" height="6" rx="1" fill="#c0392b" opacity="${1-i*.1}"/>`).join('')}
    <text x="107" y="56" text-anchor="middle" font-size="7" fill="#c0392b" font-family="Georgia">$200</text>
    <line x1="60" y1="32" x2="82" y2="32" stroke="#888" stroke-width="1" stroke-dasharray="3,2"/>
    <rect x="132" y="16" width="38" height="20" rx="3" fill="rgba(201,168,76,.15)" stroke="#c9a84c" stroke-width="1"/>
    <text x="151" y="24" text-anchor="middle" font-size="6" fill="#888" font-family="Georgia">Effective</text>
    <text x="151" y="33" text-anchor="middle" font-size="8" fill="#c9a84c" font-weight="700" font-family="Georgia">$200</text>
    <text x="90" y="67" text-anchor="middle" font-size="8" fill="#8a7a5a" font-family="Georgia">max at risk = the shorter stack</text>
  </svg>`,
  'equity': ()=>`<svg width="140" height="70" viewBox="0 0 140 70">
    <rect x="5" y="10" width="130" height="22" rx="11" fill="rgba(0,0,0,.3)"/>
    <rect x="5" y="10" width="91" height="22" rx="11" fill="#27ae60"/>
    <text x="51" y="25" text-anchor="middle" font-size="11" fill="white" font-weight="600" font-family="Georgia">70% equity</text>
    <rect x="5" y="38" width="130" height="22" rx="11" fill="rgba(0,0,0,.3)"/>
    <rect x="5" y="38" width="39" height="22" rx="11" fill="#c0392b"/>
    <text x="98" y="53" text-anchor="middle" font-size="11" fill="#888" font-family="Georgia">30% equity</text>
    <text x="70" y="68" text-anchor="middle" font-size="9" fill="#c9a84c" font-family="Georgia">EQUITY SPLIT</text>
  </svg>`,
  'outs': ()=>`<svg width="160" height="60" viewBox="0 0 160 60">
    ${Array.from({length:9},(_,i)=>`
      <rect x="${5+i*17}" y="8" width="14" height="20" rx="2" fill="${i<2?'#27ae60':'rgba(255,255,255,.15)'}"/>
      <text x="${12+i*17}" y="22" text-anchor="middle" font-size="9" fill="${i<2?'white':'#555'}" font-family="Georgia">♥</text>
    `).join('')}
    <text x="80" y="44" text-anchor="middle" font-size="10" fill="#27ae60" font-family="Georgia">9 flush outs remaining</text>
    <text x="80" y="58" text-anchor="middle" font-size="9" fill="#c9a84c" font-family="Georgia">≈ 36% to hit by river</text>
  </svg>`,
  'player': ()=>`<svg width="100" height="70" viewBox="0 0 100 70">
    <circle cx="50" cy="22" r="16" fill="rgba(201,168,76,.2)" stroke="#c9a84c" stroke-width="1.5"/>
    <text x="50" y="27" text-anchor="middle" font-size="16" fill="#c9a84c">♠</text>
    <path d="M20 65 Q50 42 80 65" fill="rgba(201,168,76,.15)" stroke="#c9a84c" stroke-width="1.5"/>
  </svg>`,
  'misc': ()=>`<svg width="80" height="60" viewBox="0 0 80 60">
    <text x="40" y="42" text-anchor="middle" font-size="40" fill="rgba(201,168,76,.35)">♣</text>
  </svg>`,
};

// Position table illustration
export function tableIllus(highlight) {
  const pos = [
    {id:'BTN',x:200,y:16,label:'BTN'},
    {id:'SB', x:320,y:44,label:'SB'},
    {id:'BB', x:380,y:110,label:'BB'},
    {id:'UTG',x:340,y:176,label:'UTG'},
    {id:'LJ', x:200,y:204,label:'LJ'},
    {id:'HJ', x:80, y:176,label:'HJ'},
    {id:'CO', x:20, y:110,label:'CO'},
  ];
  const hl = highlight.replace('table-','').toUpperCase().replace('UTG','UTG');
  return `<svg width="400" height="240" viewBox="0 0 400 240">
    <ellipse cx="200" cy="112" rx="168" ry="96" fill="#1e4a2e" stroke="#8B6914" stroke-width="7"/>
    <ellipse cx="200" cy="112" rx="148" ry="78" fill="#2a6040"/>
    <text x="200" y="108" text-anchor="middle" font-size="12" fill="rgba(201,168,76,.6)" font-family="Georgia">TEXAS HOLD'EM</text>
    <text x="200" y="124" text-anchor="middle" font-size="10" fill="rgba(201,168,76,.4)" font-family="Georgia">No Limit</text>
    ${pos.map(p=>{
      const on = p.id===hl;
      return `<g>
        <circle cx="${p.x}" cy="${p.y}" r="${on?19:15}"
          fill="${on?'#c9a84c':'rgba(0,0,0,.6)'}"
          stroke="${on?'#f0d060':'rgba(201,168,76,.5)'}"
          stroke-width="${on?2:1}"/>
        <text x="${p.x}" y="${p.y+5}" text-anchor="middle"
          font-size="${on?10:9}" fill="${on?'#1a2010':'#c9a84c'}"
          font-weight="${on?'700':'400'}" font-family="Georgia">${p.label}</text>
      </g>`;
    }).join('')}
    <text x="200" y="228" text-anchor="middle" font-size="9" fill="rgba(201,168,76,.5)" font-family="Georgia">seat positions</text>
  </svg>`;
}

export function getIllus(t) {
  if (t.illus && t.illus.startsWith('table-')) return tableIllus(t.illus);
  const fn = ILLUS[t.illus];
  return fn ? fn() : ILLUS['misc']();
}


export function handToCards(h) {
  const rank1 = h[0], rank2 = h[1];
  const type = h.length===2 ? 'pair' : h[2]==='s' ? 'suited' : 'offsuit';
  if (type==='pair') return cardSvg(rank1,'♠',64,90)+cardSvg(rank2,'♥',64,90);
  if (type==='suited') {
    const s = ['♠','♥','♦','♣'][Math.floor(Math.random()*4)];
    return cardSvg(rank1,s,64,90)+cardSvg(rank2,s,64,90);
  }
  return cardSvg(rank1,'♠',64,90)+cardSvg(rank2,'♥',64,90);
}

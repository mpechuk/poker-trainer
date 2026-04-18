import { useState, useEffect } from 'preact/hooks';

// 6-max poker table with clickable seats — used as a visual position selector
// for both hero and villain at the same time.
const SEATS = [
  { id: 'BTN', x: 200, y: 22 },
  { id: 'SB',  x: 340, y: 58 },
  { id: 'BB',  x: 340, y: 168 },
  { id: 'UTG', x: 200, y: 208 },
  { id: 'HJ',  x:  60, y: 168 },
  { id: 'CO',  x:  60, y:  58 },
];

const BTN_SEAT = SEATS[0];
// Dealer button chip sits just inside the rail, offset from the BTN seat toward
// the table center so it's clearly *near* the seat without overlapping the label.
const DEALER_CHIP = { x: BTN_SEAT.x + 30, y: BTN_SEAT.y + 28, r: 9 };

const HERO_FILL   = '#c9a84c';
const HERO_STROKE = '#f0d060';
const VILL_FILL   = '#7a2a1e';
const VILL_STROKE = '#e85c4a';

export function PositionTable({
  heroSelected = 'all',
  villainSelected = 'all',
  heroAvailable,
  villainAvailable,
  onHeroSelect,
  onVillainSelect,
  showVillain = false,
  showAllButtons = true,
  autoSwitchRole = true,
  heroLabel = 'Your Position',
  villainLabel = 'Villain',
}) {
  const [activeRole, setActiveRole] = useState('hero');

  // Keep the active role valid when the villain tab disappears (e.g. RFI mode).
  useEffect(() => {
    if (!showVillain && activeRole !== 'hero') setActiveRole('hero');
  }, [showVillain, activeRole]);

  const heroAvailSet = new Set(heroAvailable || []);
  const villainAvailSet = new Set(villainAvailable || []);
  const active = showVillain ? activeRole : 'hero';

  const handleSeatClick = (id) => {
    if (active === 'hero') {
      if (!heroAvailSet.has(id)) return;
      onHeroSelect(id);
      if (showVillain && autoSwitchRole) setActiveRole('villain');
    } else {
      if (!villainAvailSet.has(id)) return;
      onVillainSelect(id);
      if (showVillain && autoSwitchRole) setActiveRole('hero');
    }
  };

  const heroIsAll    = heroSelected === 'all' || heroSelected == null;
  const villainIsAll = villainSelected === 'all' || villainSelected == null;

  return (
    <div class="pt-wrap">
      {showVillain && (
        <div class="pt-roles" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={active === 'hero'}
            class={`pt-role pt-role-hero${active === 'hero' ? ' active' : ''}`}
            onClick={() => setActiveRole('hero')}
          >
            <span class="pt-role-lbl">{heroLabel}</span>
            <span class="pt-role-val">{heroIsAll ? 'All' : heroSelected}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={active === 'villain'}
            class={`pt-role pt-role-villain${active === 'villain' ? ' active' : ''}`}
            onClick={() => setActiveRole('villain')}
          >
            <span class="pt-role-lbl">{villainLabel}</span>
            <span class="pt-role-val">{villainIsAll ? 'All' : villainSelected}</span>
          </button>
        </div>
      )}

      <div class="pt-svg-wrap">
        <svg viewBox="0 0 400 240" class="pt-svg" role="group" aria-label="Position selector">
          <ellipse cx="200" cy="115" rx="168" ry="96"
            fill="#1e4a2e" stroke="#8B6914" stroke-width="6"/>
          <ellipse cx="200" cy="115" rx="148" ry="78" fill="#2a6040"/>
          <text x="200" y="111" text-anchor="middle" font-size="12"
            fill="rgba(201,168,76,.6)" font-family="Georgia">TEXAS HOLD'EM</text>
          <text x="200" y="127" text-anchor="middle" font-size="10"
            fill="rgba(201,168,76,.4)" font-family="Georgia">No Limit</text>

          {/* Dealer button chip (the "BTN" chip) near the Button seat. */}
          <g class="pt-dealer-chip" aria-hidden="true">
            <circle cx={DEALER_CHIP.x} cy={DEALER_CHIP.y} r={DEALER_CHIP.r + 1}
              fill="rgba(0,0,0,.35)"/>
            <circle cx={DEALER_CHIP.x} cy={DEALER_CHIP.y} r={DEALER_CHIP.r}
              fill="#f5e27a" stroke="#8B6914" stroke-width="1.5"/>
            <circle cx={DEALER_CHIP.x} cy={DEALER_CHIP.y} r={DEALER_CHIP.r - 3}
              fill="none" stroke="#8B6914" stroke-width=".75"
              stroke-dasharray="1.5 1.5"/>
            <text x={DEALER_CHIP.x} y={DEALER_CHIP.y + 3.5} text-anchor="middle"
              font-size="9" font-weight="700" fill="#3a2a10" font-family="Georgia">D</text>
          </g>

          {SEATS.map(seat => {
            const isHero    = !heroIsAll    && heroSelected    === seat.id;
            const isVillain = !villainIsAll && villainSelected === seat.id;
            const roleAvail = active === 'hero' ? heroAvailSet : villainAvailSet;
            const enabled   = roleAvail.has(seat.id);
            const dimmed    = !enabled && !isHero && !isVillain;
            const r         = (isHero || isVillain) ? 22 : 18;

            let fill, stroke, strokeWidth, textColor, fontWeight;
            if (isHero) {
              fill = HERO_FILL; stroke = HERO_STROKE; strokeWidth = 2.5;
              textColor = '#1a2010'; fontWeight = 700;
            } else if (isVillain) {
              fill = VILL_FILL; stroke = VILL_STROKE; strokeWidth = 2.5;
              textColor = '#ffe7d9'; fontWeight = 700;
            } else if (dimmed) {
              fill = 'rgba(0,0,0,.35)'; stroke = 'rgba(201,168,76,.2)';
              strokeWidth = 1; textColor = 'rgba(201,168,76,.35)'; fontWeight = 500;
            } else {
              fill = 'rgba(0,0,0,.6)'; stroke = 'rgba(201,168,76,.55)';
              strokeWidth = 1.25; textColor = '#c9a84c'; fontWeight = 500;
            }

            const clickable = enabled;
            return (
              <g key={seat.id}
                 class={`pt-seat${clickable ? ' pt-seat-enabled' : ''}${isHero ? ' pt-seat-hero' : ''}${isVillain ? ' pt-seat-villain' : ''}`}
                 onClick={clickable ? () => handleSeatClick(seat.id) : undefined}
                 role={clickable ? 'button' : undefined}
                 tabIndex={clickable ? 0 : undefined}
                 aria-label={`${seat.id}${isHero ? ' (hero)' : isVillain ? ' (villain)' : ''}`}
                 aria-pressed={(isHero || isVillain) ? 'true' : 'false'}
                 onKeyDown={clickable ? (e) => {
                   if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault();
                     handleSeatClick(seat.id);
                   }
                 } : undefined}
              >
                <circle cx={seat.x} cy={seat.y} r={r}
                  fill={fill} stroke={stroke} stroke-width={strokeWidth}/>
                <text x={seat.x} y={seat.y + 5} text-anchor="middle"
                  font-size={(isHero || isVillain) ? 12 : 11} fill={textColor}
                  font-weight={fontWeight} font-family="Georgia"
                  style="pointer-events:none;user-select:none">{seat.id}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {showAllButtons && (
        <div class="pt-all-row">
          <button
            type="button"
            class={`rq-selector-btn pt-all-hero${heroIsAll ? ' active' : ''}`}
            onClick={() => onHeroSelect('all')}
          >All {heroLabel.toLowerCase()}s</button>
          {showVillain && (
            <button
              type="button"
              class={`rq-selector-btn pt-all-villain${villainIsAll ? ' active' : ''}`}
              onClick={() => onVillainSelect('all')}
            >All {villainLabel.toLowerCase()}s</button>
          )}
        </div>
      )}
    </div>
  );
}

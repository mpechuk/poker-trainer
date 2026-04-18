// 6-max poker table with clickable seats — used as a visual position selector.
// Seat coordinates mirror the terminology table illustration layout.
const SEATS = [
  { id: 'BTN', x: 200, y: 22 },
  { id: 'SB',  x: 340, y: 58 },
  { id: 'BB',  x: 340, y: 168 },
  { id: 'UTG', x: 200, y: 208 },
  { id: 'HJ',  x:  60, y: 168 },
  { id: 'CO',  x:  60, y:  58 },
];

export function PositionTable({
  selected,
  available,
  onSelect,
  allowAll = true,
  title,
  variant = 'hero',
}) {
  const availSet = new Set(available || []);
  const isAll = selected === 'all' || selected == null;

  return (
    <div class={`pt-wrap pt-${variant}`}>
      {title && <div class="pt-title">{title}</div>}
      <div class="pt-svg-wrap">
        <svg viewBox="0 0 400 240" class="pt-svg" role="group" aria-label="Position selector">
          <ellipse cx="200" cy="115" rx="168" ry="96"
            fill="#1e4a2e" stroke="#8B6914" stroke-width="6"/>
          <ellipse cx="200" cy="115" rx="148" ry="78" fill="#2a6040"/>
          <text x="200" y="111" text-anchor="middle" font-size="12"
            fill="rgba(201,168,76,.6)" font-family="Georgia">TEXAS HOLD'EM</text>
          <text x="200" y="127" text-anchor="middle" font-size="10"
            fill="rgba(201,168,76,.4)" font-family="Georgia">No Limit</text>
          {SEATS.map(seat => {
            const enabled = availSet.has(seat.id);
            const active = enabled && selected === seat.id;
            const dimmed = !enabled;
            const r = active ? 22 : 18;
            const fill   = active ? '#c9a84c'
                        : dimmed ? 'rgba(0,0,0,.35)'
                        : 'rgba(0,0,0,.6)';
            const stroke = active ? '#f0d060'
                        : dimmed ? 'rgba(201,168,76,.2)'
                        : 'rgba(201,168,76,.55)';
            const strokeWidth = active ? 2.5 : 1.25;
            const textColor = active ? '#1a2010'
                           : dimmed ? 'rgba(201,168,76,.35)'
                           : '#c9a84c';
            const fontWeight = active ? 700 : 500;
            return (
              <g key={seat.id}
                 class={`pt-seat${enabled ? ' pt-seat-enabled' : ''}${active ? ' pt-seat-active' : ''}`}
                 onClick={enabled ? () => onSelect(seat.id) : undefined}
                 role={enabled ? 'button' : undefined}
                 tabIndex={enabled ? 0 : undefined}
                 aria-label={seat.id}
                 aria-pressed={active ? 'true' : 'false'}
                 onKeyDown={enabled ? (e) => {
                   if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault();
                     onSelect(seat.id);
                   }
                 } : undefined}
              >
                <circle cx={seat.x} cy={seat.y} r={r}
                  fill={fill} stroke={stroke} stroke-width={strokeWidth}/>
                <text x={seat.x} y={seat.y + 5} text-anchor="middle"
                  font-size={active ? 12 : 11} fill={textColor}
                  font-weight={fontWeight} font-family="Georgia"
                  style="pointer-events:none;user-select:none">{seat.id}</text>
              </g>
            );
          })}
        </svg>
      </div>
      {allowAll && (
        <div class="pt-all-row">
          <button
            type="button"
            class={`rq-selector-btn${isAll ? ' active' : ''}`}
            onClick={() => onSelect('all')}
          >All Positions</button>
        </div>
      )}
    </div>
  );
}

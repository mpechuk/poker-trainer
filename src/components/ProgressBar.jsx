export function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current + 1) / total * 100) : 0;
  return (
    <div class="progress-wrap">
      <div class="progress-bar">
        <div class="progress-fill" style={{ width: pct + '%' }} />
      </div>
      <div class="progress-label">
        <span>Card {current + 1} of {total}</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}

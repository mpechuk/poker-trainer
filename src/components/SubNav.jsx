export function SubNav({ tabs, currentPath }) {
  return (
    <nav class="sub-nav">
      {tabs.map(tab => (
        <a
          key={tab.path}
          href={`#${tab.path}`}
          class={currentPath === tab.path ? 'active' : ''}
        >
          {tab.label}
        </a>
      ))}
    </nav>
  );
}

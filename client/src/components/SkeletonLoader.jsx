export default function SkeletonLoader({ count = 6, type = 'card' }) {
  const items = Array.from({ length: count });

  if (type === 'row') {
    return (
      <div className="skeleton-row-list">
        {items.map((_, idx) => (
          <div key={idx} className="skeleton-row">
            <div className="skeleton-row-left">
              <div className="skeleton-box skeleton-avatar" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <div className="skeleton-box skeleton-title" style={{ width: '40%' }} />
                <div className="skeleton-box skeleton-text" style={{ width: '60%' }} />
              </div>
            </div>
            <div className="skeleton-box skeleton-btn" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'stats') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="skeleton-card" style={{ padding: '20px' }}>
            <div className="skeleton-box skeleton-text-short" />
            <div className="skeleton-box skeleton-title" style={{ height: '32px', width: '50%', marginTop: '8px' }} />
          </div>
        ))}
      </div>
    );
  }

  // Default: Grid of Listing Cards
  return (
    <div className="skeleton-grid">
      {items.map((_, idx) => (
        <div key={idx} className="skeleton-card">
          <div className="skeleton-box skeleton-img" />
          <div className="skeleton-box skeleton-title" />
          <div className="skeleton-box skeleton-text" />
          <div className="skeleton-box skeleton-text-short" />
          <div className="skeleton-footer">
            <div className="skeleton-box skeleton-price" />
            <div className="skeleton-box skeleton-btn" />
          </div>
        </div>
      ))}
    </div>
  );
}

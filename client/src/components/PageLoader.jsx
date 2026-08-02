export default function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Loading page">
      <div className="skeleton-bar" />
      <div className="skeleton-search" />
      <div className="skeleton-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-block skeleton-img" />
            <div className="skeleton-block skeleton-w80" />
            <div className="skeleton-block skeleton-w55" />
            <div className="skeleton-block skeleton-w65" />
          </div>
        ))}
      </div>
    </div>
  );
}

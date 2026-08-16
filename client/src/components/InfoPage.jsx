import { useNav } from '../context/NavContext';

/**
 * Shared layout for long-form content pages (policies, "for farmers",
 * "how it works", etc.). Provides the back button, page banner header,
 * a constrained content column, and optional CTA buttons.
 */
export default function InfoPage({ title, subtitle, children, actions = [] }) {
  const { navigate, back } = useNav();
  return (
    <div style={{ paddingBottom: '60px' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '16px 24px 0' }}>
        <button className="btn-back-icon" onClick={back} aria-label="Back">←</button>
      </div>
      <section className="section" style={{ background: 'var(--surface-2)', textAlign: 'center', paddingBottom: '28px' }}>
        <h1 style={{ fontSize: 'var(--fs-5xl)', fontWeight: '800', color: 'var(--text-dark)' }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 'clamp(15px, 2.2vw, 18px)', color: 'var(--text-mid)', marginTop: '20px', maxWidth: '820px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.7' }}>
            {subtitle}
          </p>
        )}
      </section>

      <section className="section" style={{ maxWidth: '900px', margin: '32px auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', fontSize: '16px', color: 'var(--text-mid)', lineHeight: '1.8' }}>
          {children}
        </div>
        {actions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '44px' }}>
            {actions.map((a, i) => (
              <button
                key={i}
                className="btn-hero"
                style={a.primary
                  ? { background: 'var(--green-mid)', color: 'white', border: 'none', padding: 'clamp(10px, 2vw, 14px) clamp(22px, 4.5vw, 32px)', boxShadow: '0 8px 20px rgba(34, 197, 94, 0.35)' }
                  : { background: 'white', color: 'var(--green-dark)', border: '1.5px solid var(--green-mid)', padding: 'clamp(10px, 2vw, 14px) clamp(22px, 4.5vw, 32px)' }}
                onClick={() => a.view && navigate(a.view)}
              >
                {a.label} {a.view && <span aria-hidden="true">→</span>}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** A titled content block (heading + paragraphs / lists) used inside InfoPage. */
export function InfoBlock({ title, children }) {
  return (
    <div>
      <h3 style={{ color: 'var(--text-dark)', marginBottom: '12px' }}>{title}</h3>
      {children}
    </div>
  );
}

/** Styled paragraph inside an InfoBlock. */
export function InfoP({ children }) {
  return <p style={{ marginBottom: '12px' }}>{children}</p>;
}

/** Styled list inside an InfoBlock. */
export function InfoList({ items }) {
  return (
    <ul style={{ paddingLeft: '20px', margin: '8px 0 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

/** Styled card used for feature / option comparisons on info pages. */
export function InfoCard({ title, badge, children, accent = 'var(--green-mid)' }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderLeft: `4px solid ${accent}`, borderRadius: 'var(--radius-md)', padding: '16px 18px', background: 'var(--white)', boxShadow: 'var(--shadow-sm)' }}>
      {badge && (
        <span style={{ display: 'inline-block', background: 'var(--green-light)', color: 'var(--green-dark)', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '999px', marginBottom: '8px' }}>{badge}</span>
      )}
      <h4 style={{ fontSize: 'var(--fs-md)', color: 'var(--text-dark)', marginBottom: '8px' }}>{title}</h4>
      {children}
    </div>
  );
}

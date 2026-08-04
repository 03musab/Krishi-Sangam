// Shared inline SVG icon set — replaces emojis across the app.
// All icons use the same stroke style as the inline SVGs on the Home page
// (fill none, stroke currentColor, rounded caps/joins) so they inherit the
// text color of whatever contains them.

const ICONS = {
  seedling: (
    <>
      <path d="M12 22v-7" />
      <path d="M12 15C8 15 5 12.5 5 9c4 0 7 2.5 7 6z" />
      <path d="M12 12c0-3.5 3-6 7-6 0 3.5-3 6-7 6z" />
    </>
  ),
  wheat: (
    <>
      <path d="M2 22 16 8" />
      <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z" />
      <path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
      <path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
      <path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z" />
    </>
  ),
  leaf: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </>
  ),
  drone: (
    <>
      <path d="M10 10h4v4h-4z" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M6 4l2 2" />
      <path d="M16 4l-2 2" />
      <path d="M6 20l2-2" />
      <path d="M16 20l-2-2" />
    </>
  ),
  corn: (
    <>
      <path d="M12 3v18" />
      <path d="M12 4c-1.8 0-3 1.2-3 3s1.2 3 3 3 3-1.2 3-3-1.2-3-3-3z" />
      <path d="M12 10c-1.8 0-3 1.2-3 3s1.2 3 3 3 3-1.2 3-3-1.2-3-3-3z" />
      <path d="M12 16c-1.8 0-3 1.2-3 3s1.2 3 3 3 3-1.2 3-3-1.2-3-3-3z" />
      <path d="M9 4.5 7 3M15 4.5 17 3M9 16.5 7 18M15 16.5 17 18" />
    </>
  ),
  truck: (
    <>
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </>
  ),
  tree: (
    <>
      <path d="M12 22V9" />
      <path d="M12 9c-3 0-5-2-5-5 3 0 5 2 5 5z" />
      <path d="M12 9c3 0 5-2 5-5-3 0-5 2-5 5z" />
      <path d="M12 14c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4z" />
      <path d="M12 14c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4z" />
      <path d="M8 22h8" />
    </>
  ),
  droplet: (
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  ),
  farmer: (
    <>
      <path d="M4 5h16" />
      <path d="M7 5c0-2 2-3.5 5-3.5S17 3 17 5" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
    </>
  ),
  tractor: (
    <>
      <circle cx="6.5" cy="17" r="3.5" />
      <circle cx="17.5" cy="17" r="2.5" />
      <path d="M6.5 17h11" />
      <path d="M11 13.5 10 8H4.5" />
      <path d="M4.5 8h12.5l2.5 3" />
      <path d="M13 8V5" />
      <path d="M11.5 5h3" />
    </>
  ),
  worker: (
    <>
      <path d="M4 6h16" />
      <path d="M7 6a5 5 0 0 1 10 0" />
      <path d="M12 6v3" />
      <path d="M6 11h12" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
    </>
  ),
  shower: (
    <>
      <path d="M5 4h14" />
      <path d="M7 4v2a5 5 0 0 0 10 0V4" />
      <path d="M7.5 9v2M12 9v4M16.5 9v2" />
    </>
  ),
  zap: (
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  ),
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  pin: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  map: (
    <>
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </>
  ),
  pushpin: (
    <>
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </>
  ),
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  shield: (
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  ),
  chat: (
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  toolbox: (
    <>
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <rect x="2" y="8" width="20" height="13" rx="2" />
      <path d="M2 13h20" />
    </>
  ),
  clipboard: (
    <>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </>
  ),
  money: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),
  package: (
    <>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </>
  ),
  alert: (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  star: (
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  ),
  check: (
    <polyline points="20 6 9 17 4 12" />
  ),
  x: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  send: (
    <>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </>
  )
};

export default function Icon({ name, size = 24, className = '', style, strokeWidth = 1.8 }) {
  const glyph = ICONS[name];
  if (!glyph) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {glyph}
    </svg>
  );
}

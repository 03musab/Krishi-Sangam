// Official Untitled UI Icons set (1,100+ Free SVG icons style)
// Clean 24x24 grid, 1.8px / 2px stroke, rounded linecaps & joins

const ICONS = {
  seedling: (
    <>
      <path d="M7 20h10" />
      <path d="M12 20V10" />
      <path d="M12 10C12 6.134 8.866 3 5 3C5 7.5 8 10 12 10Z" />
      <path d="M12 14C12 10.134 15.134 7 19 7C19 11.5 16 14 12 14Z" />
    </>
  ),
  wheat: (
    <>
      <path d="M12 22V2" />
      <path d="M12 18C8.5 16 7 13.5 7 11C10.5 11 12 13.5 12 16" />
      <path d="M12 18C15.5 16 17 13.5 17 11C13.5 11 12 13.5 12 16" />
      <path d="M12 12C8.5 10 7 7.5 7 5C10.5 5 12 7.5 12 10" />
      <path d="M12 12C15.5 10 17 7.5 17 5C13.5 5 12 7.5 12 10" />
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
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
      <path d="M4 4l5 5M20 4l-5 5M4 20l5-5M20 20l-5-5" />
      <circle cx="4" cy="4" r="2.5" />
      <circle cx="20" cy="4" r="2.5" />
      <circle cx="4" cy="20" r="2.5" />
      <circle cx="20" cy="20" r="2.5" />
    </>
  ),
  corn: (
    <>
      <path d="M12 2C8.5 2 6.5 5 6.5 9.5C6.5 14 8.5 18 12 22C15.5 18 17.5 14 17.5 9.5C17.5 5 15.5 2 12 2Z" />
      <path d="M6.5 9.5C9.5 10 12 12 12 22M17.5 9.5C14.5 10 12 12 12 22" />
    </>
  ),
  truck: (
    <>
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </>
  ),
  tree: (
    <>
      <path d="M12 22v-8" />
      <path d="M12 2L5 9h3l-3 5h4l-3 5h14l-3-5h4l-3-5h3L12 2z" />
    </>
  ),
  droplet: (
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  ),
  farmer: (
    <>
      <circle cx="12" cy="7" r="4" />
      <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      <path d="M4 6.5h16M7 6.5c0-2.2 2.2-3.5 5-3.5s5 1.3 5 3.5" />
    </>
  ),
  tractor: (
    <>
      <circle cx="7" cy="17" r="4" />
      <circle cx="18" cy="18" r="2" />
      <path d="M7 17h11M11 13l-1-6H4v6h7zM11 7h6l2 4h-8" />
      <path d="M14 7V4M12.5 4h3" />
    </>
  ),
  worker: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 9h14M7 9a5 5 0 0 1 10 0" />
      <path d="M4 21v-2a7 7 0 0 1 14 0v2" />
    </>
  ),
  shower: (
    <>
      <path d="M4 4h16M6 4v2a6 6 0 0 0 12 0V4" />
      <path d="M8 10v2M12 10v4M16 10v2M6 16v2M10 18v2M14 18v2M18 16v2" />
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
      <path d="M12 21.5S3 14.5 3 9.5a9 9 0 1 1 18 0c0 5-9 12-9 12z" />
      <circle cx="12" cy="9.5" r="3" />
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
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  chat: (
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
  ),
  external: (
    <>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  'credit-card': (
    <>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </>
  ),
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  'arrow-left': (
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </>
  ),
  'arrow-right': (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>
  ),
  filter: (
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  ),
  eye: (
    <>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
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
      className={`untitledui-icon ${className}`.trim()}
      style={style}
      aria-hidden="true"
    >
      {glyph}
    </svg>
  );
}

// shared.jsx — Auctus brand tokens + shared building blocks.

const AuctusBrand = {
  // Warmer off-white background (per Figma comment: warmer, but not too much)
  bg: '#F3EFE3',
  bgWarm: '#EFE9D8',
  paper: '#FAF8F0',
  ink: '#0E0E10',
  ink2: '#3A3A40',
  inkMute: '#7A7A82',
  rule: 'rgba(14,14,16,0.08)',
  ruleStrong: 'rgba(14,14,16,0.18)',
  // brand
  purple: '#6B3CFF',
  purpleDeep: '#4E1FE3',
  purpleSoft: '#E5DCFE',
  coral: '#FF6B5C',
  coralSoft: '#FFE2DD',
  // OSMO-green (per Figma: same lime as OSMO marquee)
  lime: '#C6FF3D',
  limeSoft: '#EFFFC8',
  butter: '#FFEAA8',
};

// ──────────────────────────────────────────────────────────────────────────
// Top nav. OSMO-style dark pill, no icon — wordmark only. The kiki-style
// "Auctus" wordmark IS the logo. A lime marquee strip below the pill scrolls
// new opportunities/news.
function AuctusTopNav({ accent = AuctusBrand.coral }) {
  const B = AuctusBrand;
  const navItems = [
    { l:'Grants',       h:'#grants' },
    { l:'Scholarships', h:'#scholarships' },
    { l:'Research',     h:'#research' },
    { l:'Forum',        h:'#forum' },
  ];

  return (
    <div style={{ position: 'sticky', top: 16, zIndex: 50, padding: '0 24px', display:'flex', flexDirection:'column', alignItems:'center', gap: 0 }}>
      {/* Bar — squared with subtle rounding (OSMO style) */}
      <div style={{
        display: 'flex', alignItems: 'center',
        background: B.ink, color: '#fff',
        borderRadius: 14, padding: '8px 8px 8px 22px',
        boxShadow: '0 10px 30px -8px rgba(14,14,16,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset',
        width: '100%', maxWidth: 1240, height: 64,
      }}>
        {/* Auctus wordmark — kiki style, big rounded chunky. Links home. */}
        <a href="#home" style={{
          textDecoration:'none', color:'#fff', display:'flex', alignItems:'baseline', gap: 2, marginRight: 32,
        }}>
          <span className="kiki" style={{ fontSize: 30, lineHeight: 1, letterSpacing:'-0.02em' }}>auctus</span>
          <span style={{ width: 7, height: 7, background: B.lime, borderRadius:'50%', marginLeft: 4, alignSelf:'center' }}></span>
        </a>

        <div style={{ flex: 1, display:'flex', justifyContent:'center', gap: 2 }}>
          {navItems.map((n) => (
            <a key={n.l} href={n.h} className="auc-nav-link" style={{
              color: 'rgba(255,255,255,0.78)', textDecoration:'none',
              fontWeight: 500, fontSize: 14, padding: '10px 18px', borderRadius: 8,
              transition: 'background .15s, color .15s',
            }}>{n.l}</a>
          ))}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <a href="#" className="auc-nav-link" style={{
            color:'rgba(255,255,255,0.85)', textDecoration:'none', fontWeight:500, fontSize:14,
            padding:'10px 18px', borderRadius: 8,
          }}>Login</a>
          <a href="#cta" style={{
            background: B.lime, color: B.ink, textDecoration:'none', fontWeight:700, fontSize:14,
            padding: '12px 22px', borderRadius: 10, letterSpacing:'-0.005em',
          }}>Join</a>
        </div>
      </div>

      {/* Lime marquee strip below — funding opportunity ticker */}
      <div style={{
        marginTop: 6, width: '100%', maxWidth: 1240,
        background: B.lime, color: B.ink, borderRadius: 10, overflow:'hidden',
        padding: '7px 0', position:'relative', border: `1px solid ${B.ink}`,
      }}>
        <div className="auc-marquee-track mono" style={{ fontSize: 12, fontWeight: 700, letterSpacing:'0.06em', textTransform:'uppercase' }}>
          {Array.from({ length: 2 }).map((_, r) => (
            <React.Fragment key={r}>
              <span>★ NEW · NSERC PGS-D opens Oct 14</span>
              <span>+</span>
              <span>CDAP renewed · $4B envelope</span>
              <span>+</span>
              <span>Vanier closes Nov 2 · 14 days</span>
              <span>+</span>
              <span>SSHRC Insight · Oct 1</span>
              <span>+</span>
              <span>Ontario AI scale-up tax credit · Dec 31</span>
              <span>+</span>
              <span>4,128 open opportunities · updated 4 min ago</span>
              <span>+</span>
              <span>87 new this week</span>
              <span>+</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Reusable lime marquee strip used as section divider.
function AuctusMarqueeStrip({ tone='lime', items, speed='normal' }) {
  const B = AuctusBrand;
  const bg = tone === 'lime' ? B.lime : tone === 'ink' ? B.ink : B.bg;
  const fg = tone === 'ink' ? '#fff' : B.ink;
  const defaults = [
    '4,128 OPEN OPPORTUNITIES',
    '312 SOURCES INDEXED',
    '$4.1B TRACKED ANNUALLY',
    '87 NEW THIS WEEK',
    '3 ROLES, ONE DATABASE',
  ];
  const list = items || defaults;
  return (
    <div style={{
      background: bg, color: fg, overflow:'hidden',
      borderTop: `1.5px solid ${B.ink}`, borderBottom: `1.5px solid ${B.ink}`,
      padding: '14px 0',
    }}>
      <div className={'auc-marquee-track mono ' + (speed==='slow' ? 'slow' : '')} style={{
        fontSize: 13, fontWeight: 700, letterSpacing:'0.06em',
      }}>
        {Array.from({ length: 2 }).map((_, r) => (
          <React.Fragment key={r}>
            {list.map((it, i) => (
              <React.Fragment key={r + '-' + i}>
                <span>★ {it}</span>
                <span style={{ opacity: .55 }}>+</span>
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Generic sticker pill
function Sticker({ children, color = AuctusBrand.coral, ink = '#0E0E10', tilt = 0, style = {} }) {
  return (
    <div style={{
      display:'inline-flex', alignItems:'center', gap:6,
      background: color, color: ink,
      padding: '8px 14px', borderRadius: 999, fontWeight: 700, fontSize: 13,
      letterSpacing:'-0.005em', transform: `rotate(${tilt}deg)`,
      boxShadow: '0 1px 0 rgba(0,0,0,0.15), 0 6px 18px -8px rgba(0,0,0,0.25)',
      whiteSpace: 'nowrap', ...style,
    }}>
      {children}
    </div>
  );
}

const OPPORTUNITIES = [
  { id:'cdap', title:'Canada Digital Adoption Program', provider:'ISED · Federal', amount:'$15,000', kind:'Grant', deadline:'Rolling', tags:['SME','Digital'], role:'Business' },
  { id:'nserc-pgs', title:'NSERC PGS-D Doctoral Scholarship', provider:'NSERC', amount:'$23,000/yr', kind:'Scholarship', deadline:'Oct 14', tags:['STEM','PhD'], role:'Student' },
  { id:'sshrc-ig', title:'SSHRC Insight Grant', provider:'SSHRC', amount:'$200,000', kind:'Research', deadline:'Oct 1', tags:['Humanities'], role:'Researcher' },
];

const STATS = { liveOpportunities: 4128, newThisWeek: 87, totalDeployed: '$4.1B', rolesServed: 3 };

Object.assign(window, {
  AuctusBrand, AuctusTopNav, AuctusMarqueeStrip, Sticker,
  OPPORTUNITIES, STATS,
});

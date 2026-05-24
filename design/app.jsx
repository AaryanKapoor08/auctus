// app.jsx — Auctus final prototype with hash-based routing.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#FF6B5C",
  "bgWarmth": "warm"
}/*EDITMODE-END*/;

// ─────────────────────────────────────────────────────────────────────
// Hash router. Hashes:
//   ''   '#'   '#home'              → home
//   '#grants'                       → grants browser
//   '#grants?cats=...&search=...'   → grants browser with state
//   '#grants/cdap'                  → grant detail
//   '#scholarships'  '#scholarships/<id>'
//   '#research'      '#research/<id>'
//   '#forum'         '#forum/new'   '#forum/<id>'
function parseHash(hashRaw) {
  const hash = (hashRaw || '').replace(/^#/, '');
  if (!hash || hash === 'home' || hash === 'top') return { route: 'home' };

  const [pathPart, queryPart] = hash.split('?');
  const params = {};
  if (queryPart) {
    for (const [k, v] of new URLSearchParams(queryPart)) params[k] = v;
  }

  const segs = pathPart.split('/').filter(Boolean);
  const [a, b] = segs;

  if (a === 'grants' || a === 'scholarships' || a === 'research') {
    if (b) return { route: 'detail', kind: a, id: b, params };
    return { route: 'browse', kind: a, params };
  }
  if (a === 'forum') {
    if (!b) return { route: 'forum', params };
    if (b === 'new') return { route: 'forum-new', params };
    return { route: 'forum-thread', id: b, params };
  }
  // Anchors on the home page (e.g. #opportunities, #community, #cta) — treat as home.
  return { route: 'home', anchor: a };
}

function useRoute() {
  const [route, setRoute] = React.useState(() => parseHash(window.location.hash));
  React.useEffect(() => {
    const onChange = () => {
      const r = parseHash(window.location.hash);
      setRoute(r);
      // Always scroll to top on route change, unless an in-page anchor is requested.
      if (r.route === 'home' && r.anchor) {
        const el = document.getElementById(r.anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const route = useRoute();

  React.useEffect(() => {
    const map = { cool: '#F4F4F0', warm: '#F3EFE3', warmer: '#EFE9D2' };
    document.body.style.background = map[t.bgWarmth] || map.warm;
  }, [t.bgWarmth]);

  // ── route → page ──
  let page;
  if (route.route === 'browse') {
    page = (
      <div className="auctus-page">
        <AuctusTopNav accent={t.accent} />
        <FundingBrowser kind={route.kind} initialParams={route.params} />
        <AuctusFooterSlim accent={t.accent} />
      </div>
    );
  } else if (route.route === 'detail') {
    page = (
      <div className="auctus-page">
        <AuctusTopNav accent={t.accent} />
        <FundingDetail kind={route.kind} id={route.id} />
        <AuctusFooterSlim accent={t.accent} />
      </div>
    );
  } else if (route.route === 'forum') {
    page = (
      <div className="auctus-page">
        <AuctusTopNav accent={t.accent} />
        <ForumBrowser initialParams={route.params} />
        <AuctusFooterSlim accent={t.accent} />
      </div>
    );
  } else if (route.route === 'forum-new') {
    page = (
      <div className="auctus-page">
        <AuctusTopNav accent={t.accent} />
        <NewThreadPage />
        <AuctusFooterSlim accent={t.accent} />
      </div>
    );
  } else if (route.route === 'forum-thread') {
    page = (
      <div className="auctus-page">
        <AuctusTopNav accent={t.accent} />
        <ThreadDetailPage id={route.id} />
        <AuctusFooterSlim accent={t.accent} />
      </div>
    );
  } else {
    page = <AuctusLanding accent={t.accent} />;
  }

  return (
    <React.Fragment>
      {page}

      <TweaksPanel title="Auctus tweaks">
        <TweakSection label="Brand" />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={['#FF6B5C', '#C6FF3D', '#6B3CFF', '#FFB800', '#34D399']}
          onChange={(v) => setTweak('accent', v)}
        />
        <TweakSection label="Background" />
        <TweakRadio
          label="Warmth"
          value={t.bgWarmth}
          options={['cool', 'warm', 'warmer']}
          onChange={(v) => setTweak('bgWarmth', v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

// Slim footer shown on sub-pages (kept lighter than the home page tail).
function AuctusFooterSlim({ accent }) {
  const B = AuctusBrand;
  return (
    <footer style={{
      marginTop: 80, background: B.ink, color:'#fff', padding: '32px 56px',
      display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap: 12,
    }}>
      <div style={{ display:'flex', alignItems:'baseline', gap: 4 }}>
        <span className="kiki" style={{ fontSize: 22, color:'#fff' }}>auctus</span>
        <span style={{ width:6, height:6, background: B.lime, borderRadius:'50%', alignSelf:'center', marginLeft:4 }}></span>
        <span className="mono" style={{ fontSize: 11, color:'rgba(255,255,255,0.45)', marginLeft: 14 }}>© 2026 · MADE IN CANADA 🇨🇦</span>
      </div>
      <div style={{ display:'flex', gap: 18, fontSize: 12, color:'rgba(255,255,255,0.7)' }}>
        <a href="#grants" style={{ color:'inherit', textDecoration:'none' }}>Grants</a>
        <a href="#scholarships" style={{ color:'inherit', textDecoration:'none' }}>Scholarships</a>
        <a href="#research" style={{ color:'inherit', textDecoration:'none' }}>Research</a>
        <a href="#forum" style={{ color:'inherit', textDecoration:'none' }}>Forum</a>
        <a href="#home" style={{ color:'inherit', textDecoration:'none' }}>Home</a>
      </div>
    </footer>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

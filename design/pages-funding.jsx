// pages-funding.jsx — FundingBrowser + FundingDetail page components.

const PROFILE_RECS = {
  grants: {
    profileTag: 'Toronto SaaS founder · seed-stage',
    tags: ['Digital', 'Growth', 'Federal', 'Women'],
    categoryIds: ['federal','digital','growth','women'],
  },
  scholarships: {
    profileTag: 'First-year master\'s · McGill · STEM',
    tags: ['Graduate', 'Merit-based', 'STEM', 'Federal'],
    categoryIds: ['federal','graduate','merit-based','stem'],
  },
  research: {
    profileTag: 'Associate Professor · UofT · HSS',
    tags: ['SSHRC', 'Social Sciences', 'Partnership'],
    categoryIds: ['sshrc','social-sciences','partnership'],
  },
};

// ─────────────────────────────────────────────────────────────────────
function FundingBrowser({ kind, initialParams }) {
  const B = AuctusBrand;
  const cfg = CATEGORY_CONFIG[kind];
  const recs = PROFILE_RECS[kind];

  // ── state ──
  const [search, setSearch]               = React.useState(initialParams?.search || '');
  const [sort, setSort]                   = React.useState(initialParams?.sort || 'best');
  const [deadlineFilter, setDeadlineFilter] = React.useState(initialParams?.deadline || 'all');
  const [selected, setSelected]           = React.useState(
    initialParams?.cats ? initialParams.cats.split(',').filter(Boolean) : []
  );

  // ── URL sync (hash query) ──
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sort && sort !== 'best') params.set('sort', sort);
    if (deadlineFilter !== 'all') params.set('deadline', deadlineFilter);
    if (selected.length) params.set('cats', selected.join(','));
    const qs = params.toString();
    const newHash = `#${kind}${qs ? '?' + qs : ''}`;
    if (window.location.hash !== newHash) {
      history.replaceState(null, '', newHash);
    }
  }, [search, sort, deadlineFilter, selected, kind]);

  // ── data filtering ──
  const items = React.useMemo(
    () => FUNDING.filter(f => f.kind === kind),
    [kind]
  );

  // Count items in each category (independent of current selection)
  const countsByCategory = React.useMemo(() => {
    const counts = {};
    cfg.groups.forEach(g => g.items.forEach(it => { counts[it.id] = 0; }));
    items.forEach(it => {
      it.categories.forEach(c => { if (counts[c] != null) counts[c] += 1; });
    });
    return counts;
  }, [items, cfg]);

  const filtered = React.useMemo(() => {
    let rs = items;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rs = rs.filter(it =>
        it.title.toLowerCase().includes(q) ||
        it.provider.toLowerCase().includes(q) ||
        (it.description || '').toLowerCase().includes(q) ||
        it.tags.join(' ').toLowerCase().includes(q)
      );
    }

    if (selected.length) {
      rs = rs.filter(it => selected.every(s => it.categories.includes(s)));
    }

    if (deadlineFilter === 'rolling') {
      rs = rs.filter(it => /rolling|continuous/i.test(it.deadline));
    } else if (deadlineFilter !== 'all') {
      const max = parseInt(deadlineFilter, 10);
      rs = rs.filter(it => it.deadlineDays <= max && it.deadlineDays < 9999);
    }

    const sorted = [...rs];
    if (sort === 'deadline') {
      sorted.sort((a,b) => a.deadlineDays - b.deadlineDays);
    } else if (sort === 'amount') {
      const parse = s => parseInt(String(s).replace(/[^0-9]/g, ''), 10) || 0;
      sorted.sort((a,b) => parse(b.amount) - parse(a.amount));
    } else if (sort === 'newest') {
      sorted.sort((a,b) => a.id.localeCompare(b.id));
    }
    return sorted;
  }, [items, search, selected, deadlineFilter, sort]);

  // ── handlers ──
  const toggleSelected = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const clearAll = () => { setSearch(''); setSort('best'); setDeadlineFilter('all'); setSelected([]); };
  const reapplyProfile = () => setSelected([...recs.categoryIds]);

  // ── render ──
  const eyebrow = `0${kind==='grants'?1:kind==='scholarships'?2:3} · ${kind.toUpperCase()}`;

  return (
    <div style={{ paddingBottom: 80 }}>
      <PageHeader
        eyebrow={eyebrow}
        title={cfg.title}
        description={cfg.description}
        count={items.length}
      />

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 56px', display:'flex', gap: 24, alignItems:'flex-start' }}>
        <FilterSidebar
          kind={kind}
          search={search} setSearch={setSearch}
          sort={sort} setSort={setSort}
          deadlineFilter={deadlineFilter} setDeadlineFilter={setDeadlineFilter}
          selected={selected} toggleSelected={toggleSelected} clearAll={clearAll}
          reapplyProfile={reapplyProfile}
          profileRecommendations={recs}
          countsByCategory={countsByCategory}
        />

        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Guest banner */}
          <div style={{
            background: B.ink, color:'#fff', borderRadius: 14, padding:'14px 18px',
            display:'flex', justifyContent:'space-between', alignItems:'center', gap: 16, flexWrap:'wrap',
            marginBottom: 18,
          }}>
            <div>
              <div className="mono" style={{ fontSize:11, color: B.lime, letterSpacing:'0.06em' }}>BROWSING AS GUEST</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>Sign in to save opportunities, get deadline reminders, and pin reviewer notes.</div>
            </div>
            <div style={{ display:'flex', gap: 8 }}>
              <a href="#" style={{
                background: B.lime, color: B.ink, textDecoration:'none', padding:'8px 14px', borderRadius: 8,
                fontWeight: 700, fontSize: 13,
              }}>Sign in</a>
              <a href="#" style={{
                background:'transparent', color:'#fff', textDecoration:'none', padding:'8px 14px', borderRadius: 8,
                fontWeight: 600, fontSize: 13, border:'1px solid rgba(255,255,255,0.4)',
              }}>Customize matches</a>
            </div>
          </div>

          {/* Selected filter chips */}
          {(selected.length > 0 || search || deadlineFilter!=='all' || sort!=='best') && (
            <div style={{ display:'flex', gap: 8, alignItems:'center', flexWrap:'wrap', marginBottom: 16 }}>
              <span className="mono" style={{ fontSize:11, color: B.inkMute, letterSpacing:'0.06em', textTransform:'uppercase' }}>Filters:</span>
              {search && (
                <Chip onRemove={() => setSearch('')}>search: "{search}"</Chip>
              )}
              {deadlineFilter !== 'all' && (
                <Chip onRemove={() => setDeadlineFilter('all')}>{deadlineFilter === 'rolling' ? 'rolling' : `≤ ${deadlineFilter} days`}</Chip>
              )}
              {sort !== 'best' && (
                <Chip onRemove={() => setSort('best')}>sort: {sort}</Chip>
              )}
              {selected.map(id => {
                const item = cfg.groups.flatMap(g => g.items).find(i => i.id === id);
                return (
                  <Chip key={id} onRemove={() => toggleSelected(id)}>{item ? item.label : id}</Chip>
                );
              })}
              <button onClick={clearAll} className="mono" style={{
                background:'transparent', border:'none', color: B.coral, fontSize:11, fontWeight:700,
                letterSpacing:'0.06em', cursor:'pointer', padding: '4px 8px', textTransform:'uppercase',
              }}>Clear all</button>
            </div>
          )}

          {/* Result count */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 14 }}>
            <div className="mono" style={{ fontSize: 13, color: B.ink2, letterSpacing:'0.04em' }}>
              Showing <b style={{ color: B.ink }}>{filtered.length}</b> of <b style={{ color: B.ink }}>{items.length}</b> results
            </div>
            <div className="mono" style={{ fontSize: 11, color: B.inkMute, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Updated 4 min ago
            </div>
          </div>

          {/* Results grid or empty state */}
          {filtered.length === 0 ? (
            <EmptyState onReset={clearAll} kind={kind} />
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(296px, 1fr))', gap: 14 }}>
              {filtered.map(item => (
                <FundingCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Chip({ children, onRemove }) {
  const B = AuctusBrand;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap: 6,
      background: B.paper, border:`1.5px solid ${B.ink}`, borderRadius: 999,
      padding:'5px 10px 5px 12px', fontSize: 12, fontWeight: 600,
    }}>
      {children}
      <button onClick={onRemove} style={{
        background: B.ink, color:'#fff', border:'none', width: 18, height: 18, borderRadius: '50%',
        cursor:'pointer', fontSize: 12, lineHeight: 1, padding: 0,
      }}>×</button>
    </span>
  );
}

function EmptyState({ onReset, kind }) {
  const B = AuctusBrand;
  return (
    <div style={{
      border:`1.5px dashed ${B.ruleStrong}`, borderRadius: 18, padding: '56px 32px', textAlign:'center',
      background: B.paper,
    }}>
      <div className="display" style={{ fontSize: 36, lineHeight: 1.1, letterSpacing:'-0.02em' }}>Nothing matches yet.</div>
      <p style={{ fontSize: 14, color: B.ink2, marginTop: 10, maxWidth: 420, marginLeft:'auto', marginRight:'auto', lineHeight: 1.5 }}>
        Try widening your deadline window, removing a category, or clearing your filters to see all {CATEGORY_CONFIG[kind].title.toLowerCase()}.
      </p>
      <button onClick={onReset} style={{
        marginTop: 18, background: B.ink, color:'#fff', border:'none', borderRadius: 999,
        padding:'12px 22px', fontWeight: 700, fontSize: 14, cursor:'pointer',
      }}>Reset filters</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// FUNDING DETAIL
function FundingDetail({ kind, id }) {
  const B = AuctusBrand;
  const item = FUNDING.find(f => f.kind === kind && f.id === id);

  if (!item) {
    return (
      <div style={{ padding: '120px 56px', textAlign:'center' }}>
        <div className="display" style={{ fontSize: 48 }}>Not found.</div>
        <a href={`#${kind}`} style={{ display:'inline-block', marginTop: 20, color: B.purple, fontWeight: 700 }}>← Back to {kind}</a>
      </div>
    );
  }

  const kindLabel = kind === 'grants' ? 'GRANT' : kind === 'scholarships' ? 'SCHOLARSHIP' : 'RESEARCH';
  const kindBg = kind === 'grants' ? B.purpleSoft : kind === 'scholarships' ? B.coralSoft : '#E5F7CC';
  const kindFg = kind === 'grants' ? B.purpleDeep : kind === 'scholarships' ? '#B23A2D' : '#3F5A00';
  const hasAi = !!item.aiOverview;
  const hasChecklist = !!item.aiChecklist;

  return (
    <div style={{ padding: '40px 56px 80px', maxWidth: 1200, margin:'0 auto' }}>
      <a href={`#${kind}`} className="mono" style={{
        color: B.inkMute, fontSize: 12, textDecoration:'none', letterSpacing:'0.06em', textTransform:'uppercase',
        display:'inline-flex', alignItems:'center', gap: 6,
      }}>← Back to {CATEGORY_CONFIG[kind].title}</a>

      {/* Header */}
      <div style={{ marginTop: 24, display:'flex', gap: 14, alignItems:'center' }}>
        <span className="mono" style={{
          fontSize:11, padding:'4px 10px', borderRadius: 4, fontWeight:700, letterSpacing:'0.06em',
          background: kindBg, color: kindFg,
        }}>{kindLabel}</span>
        <span className="mono" style={{
          fontSize:12, padding:'4px 12px', background: B.paper, border:`1.5px solid ${B.ink}`, borderRadius:999,
          color: B.coral, fontWeight:700,
        }}>● Deadline · {item.deadline}</span>
      </div>

      <h1 className="display" style={{ fontSize: 64, lineHeight: 1, margin: '20px 0 10px', letterSpacing:'-0.03em', maxWidth: 1000 }}>
        {item.title}
      </h1>
      <div style={{ fontSize: 18, color: B.ink2 }}>{item.provider}</div>

      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap: 32, marginTop: 36, alignItems:'start' }}>
        {/* LEFT: content */}
        <div>
          {/* Description / AI overview */}
          {hasAi ? (
            <div style={{ background: B.lime, border:`1.5px solid ${B.ink}`, borderRadius: 16, padding: 22, boxShadow:`4px 4px 0 ${B.ink}` }}>
              <div className="mono" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', color: B.ink }}>AUCTUS AI · OVERVIEW</div>
              <p style={{ margin: '10px 0 0', fontSize: 15, lineHeight: 1.55, color: B.ink }}>{item.aiOverview}</p>
            </div>
          ) : (
            <div style={{ fontSize: 16, lineHeight: 1.6, color: B.ink2 }}>{item.description}</div>
          )}

          {/* Good fit for */}
          {item.goodFitFor && (
            <DetailSection title="Good fit for">
              <ul style={{ margin: 0, padding: 0, listStyle:'none', display:'flex', flexDirection:'column', gap: 8 }}>
                {item.goodFitFor.map(g => (
                  <li key={g} style={{ display:'flex', alignItems:'flex-start', gap: 10, fontSize: 15, lineHeight: 1.5 }}>
                    <span style={{
                      flexShrink:0, marginTop: 5, width: 6, height: 6, background: B.purple, borderRadius:'50%',
                    }}></span>
                    {g}
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}

          {/* Eligibility */}
          {item.eligibility && (
            <DetailSection title="Eligibility signals">
              <ul style={{ margin: 0, padding: 0, listStyle:'none', display:'flex', flexDirection:'column', gap: 8 }}>
                {item.eligibility.map(e => (
                  <li key={e} style={{ display:'flex', alignItems:'flex-start', gap: 10, fontSize: 15, lineHeight: 1.5 }}>
                    <span style={{
                      flexShrink:0, marginTop: 3, width: 18, height: 18, borderRadius: 4,
                      background:'#fff', border:`1.5px solid ${B.ink}`, color: B.ink,
                      display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize: 11, fontWeight: 800,
                    }}>✓</span>
                    {e}
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}

          {/* Requirements */}
          <DetailSection title="Requirements">
            <ul style={{ margin: 0, padding: 0, listStyle:'none', display:'flex', flexDirection:'column', gap: 8 }}>
              {item.requirements.map(r => (
                <li key={r} style={{ display:'flex', alignItems:'flex-start', gap: 10, fontSize: 15, lineHeight: 1.5 }}>
                  <span className="mono" style={{ flexShrink:0, fontSize: 11, color: B.inkMute, marginTop: 4 }}>—</span>
                  {r}
                </li>
              ))}
            </ul>
          </DetailSection>

          {/* AI application prep checklist */}
          {hasChecklist && (
            <DetailSection title="AI application-prep checklist" badge="AI">
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {item.aiChecklist.map(c => (
                  <span key={c} className="mono" style={{
                    fontSize: 12, padding:'8px 12px', background: B.lime, color: B.ink,
                    border:`1.5px solid ${B.ink}`, borderRadius:999, fontWeight: 700,
                  }}>✓ {c}</span>
                ))}
              </div>
            </DetailSection>
          )}
        </div>

        {/* RIGHT: aside */}
        <aside style={{ position:'sticky', top: 110, display:'flex', flexDirection:'column', gap: 16 }}>
          {/* Amount + Apply */}
          <div style={{ background: B.paper, border:`1.5px solid ${B.ink}`, borderRadius: 16, padding: 20, boxShadow:`4px 4px 0 ${B.ink}` }}>
            <div className="mono" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', color: B.inkMute }}>AMOUNT</div>
            <div className="display" style={{ fontSize: 42, lineHeight: 1, marginTop: 6 }}>{item.amount}</div>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop:`1px solid ${B.rule}`, display:'flex', justifyContent:'space-between' }}>
              <div className="mono" style={{ fontSize: 11, color: B.inkMute, letterSpacing:'0.06em', textTransform:'uppercase' }}>Deadline</div>
              <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: B.coral }}>● {item.deadline}</div>
            </div>

            <a href={item.url || '#'} target="_blank" rel="noopener noreferrer" style={{
              marginTop: 16, display:'flex', alignItems:'center', justifyContent:'space-between',
              background: B.ink, color:'#fff', textDecoration:'none',
              padding:'14px 18px', borderRadius: 999, fontWeight:700, fontSize:14,
            }}>
              Apply on provider site
              <span className="mono" style={{ background: B.lime, color: B.ink, padding:'4px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800 }}>↗</span>
            </a>
            <div className="mono" style={{ fontSize: 10, color: B.inkMute, marginTop: 8, letterSpacing:'0.06em', textAlign:'center' }}>
              EXTERNAL · OPENS IN NEW TAB
            </div>
          </div>

          {/* Guest personalization prompt */}
          <div style={{ background: B.purpleSoft, border:`1.5px solid ${B.purple}`, borderRadius: 16, padding: 18 }}>
            <div className="mono" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', color: B.purpleDeep }}>GUEST PROMPT</div>
            <div style={{ fontSize: 14, color: B.ink, marginTop: 8, lineHeight: 1.45 }}>
              You're browsing without a profile. Sign in to see how this opportunity scores against your background, and to add it to your shortlist.
            </div>
            <div style={{ display:'flex', gap: 8, marginTop: 12 }}>
              <a href="#" style={{
                background: B.purple, color:'#fff', textDecoration:'none', padding:'8px 14px', borderRadius: 8,
                fontWeight: 700, fontSize: 13,
              }}>Sign in</a>
              <a href="#" style={{
                background:'transparent', color: B.purpleDeep, textDecoration:'none', padding:'8px 14px', borderRadius: 8,
                fontWeight: 700, fontSize: 13, border:`1.5px solid ${B.purple}`,
              }}>Customize matches</a>
            </div>
          </div>

          {/* Categories */}
          <div style={{ background: B.paper, border:`1.5px solid ${B.ink}`, borderRadius: 16, padding: 18 }}>
            <div className="mono" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', color: B.inkMute, marginBottom: 10 }}>CATEGORIES</div>
            <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
              {item.categories.map(c => (
                <span key={c} className="mono" style={{
                  fontSize: 11, padding:'4px 8px', border:`1px solid ${B.rule}`, borderRadius: 4, color: B.ink2,
                }}>{c}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailSection({ title, badge, children }) {
  const B = AuctusBrand;
  return (
    <section style={{ marginTop: 32 }}>
      <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 14 }}>
        <div className="mono" style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em', color: B.inkMute, textTransform:'uppercase' }}>{title}</div>
        {badge && <span className="mono" style={{ fontSize:9, padding:'2px 6px', background: B.ink, color: B.lime, borderRadius:3, fontWeight:800, letterSpacing:'0.06em' }}>{badge}</span>}
      </div>
      <div>{children}</div>
    </section>
  );
}

Object.assign(window, { FundingBrowser, FundingDetail });

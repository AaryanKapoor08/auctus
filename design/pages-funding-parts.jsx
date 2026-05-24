// pages-funding.jsx — Funding browser + detail (Grants, Scholarships, Research).

// Sub-page header shown above the filter+results grid.
function PageHeader({ eyebrow, title, description, count }) {
  const B = AuctusBrand;
  return (
    <div style={{ padding: '56px 56px 24px', maxWidth: 1440, margin:'0 auto' }}>
      <div className="mono" style={{ fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase', color:B.inkMute, marginBottom: 12 }}>{eyebrow}</div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap: 32 }}>
        <div>
          <h1 className="display" style={{ fontSize: 96, lineHeight: 0.92, margin: 0, letterSpacing:'-0.035em' }}>{title}</h1>
          <p style={{ fontSize: 18, color: B.ink2, lineHeight: 1.5, marginTop: 16, maxWidth: 720 }}>{description}</p>
        </div>
        {count != null && (
          <div style={{
            background: B.ink, color:'#fff', padding:'16px 22px', borderRadius: 14,
            display:'flex', alignItems:'baseline', gap: 8, whiteSpace:'nowrap',
          }}>
            <div className="display" style={{ fontSize: 38, lineHeight: 1 }}>{count.toLocaleString()}</div>
            <div className="mono" style={{ fontSize: 11, color:'rgba(255,255,255,0.6)', letterSpacing:'0.08em', textTransform:'uppercase' }}>loaded</div>
          </div>
        )}
      </div>
    </div>
  );
}

// One funding card for the results grid.
function FundingCard({ item, onOpen }) {
  const B = AuctusBrand;
  const kindLabel = item.kind === 'grants' ? 'GRANT' : item.kind === 'scholarships' ? 'SCHOLARSHIP' : 'RESEARCH';
  const kindBg = item.kind === 'grants' ? B.purpleSoft : item.kind === 'scholarships' ? B.coralSoft : '#E5F7CC';
  const kindFg = item.kind === 'grants' ? B.purpleDeep : item.kind === 'scholarships' ? '#B23A2D' : '#3F5A00';
  return (
    <a href={`#${item.kind}/${item.id}`} onClick={onOpen} style={{
      display:'flex', flexDirection:'column', textDecoration:'none', color: B.ink,
      background: B.paper, border:`1.5px solid ${B.ink}`, borderRadius: 16, padding: 18,
      gap: 10, minHeight: 240, transition:'transform .12s, box-shadow .12s',
      boxShadow:`3px 3px 0 ${B.ink}`,
    }}
    onMouseEnter={(e)=>{ e.currentTarget.style.boxShadow=`6px 6px 0 ${B.ink}`; e.currentTarget.style.transform='translate(-2px,-2px)'; }}
    onMouseLeave={(e)=>{ e.currentTarget.style.boxShadow=`3px 3px 0 ${B.ink}`; e.currentTarget.style.transform='translate(0,0)'; }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span className="mono" style={{
          fontSize:10, padding:'3px 8px', borderRadius: 4, fontWeight:700, letterSpacing:'0.06em',
          background: kindBg, color: kindFg,
        }}>{kindLabel}</span>
        <span className="mono" style={{
          fontSize:11, padding:'4px 10px', background: B.bg, border:`1px solid ${B.rule}`, borderRadius:999,
          color: B.coral, fontWeight:700,
        }}>● {item.deadline}</span>
      </div>
      <div style={{ fontWeight:800, fontSize:18, lineHeight:1.25 }}>{item.title}</div>
      <div style={{ fontSize: 13, color: B.inkMute }}>{item.provider}</div>
      <div style={{ fontSize: 13, color: B.ink2, lineHeight: 1.45, flex:1 }}>{item.description}</div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', borderTop:`1px solid ${B.rule}`, paddingTop: 12 }}>
        <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>{item.amount}</div>
        <div style={{ display:'flex', gap: 4 }}>
          {item.tags.slice(0,2).map(t => (
            <span key={t} className="mono" style={{ fontSize: 10, padding:'3px 7px', border:`1px solid ${B.rule}`, borderRadius:4, color: B.ink2 }}>{t}</span>
          ))}
        </div>
      </div>
    </a>
  );
}

// ────────────────────────── FILTER SIDEBAR ──────────────────────────
function FilterSidebar({
  kind, search, setSearch, sort, setSort,
  deadlineFilter, setDeadlineFilter,
  selected, toggleSelected, clearAll,
  reapplyProfile, profileRecommendations,
  countsByCategory,
}) {
  const B = AuctusBrand;
  const cfg = CATEGORY_CONFIG[kind];

  return (
    <aside style={{
      width: 296, flexShrink: 0, alignSelf:'flex-start', position:'sticky', top: 110,
      background: B.paper, border:`1.5px solid ${B.ink}`, borderRadius: 18, padding: 18,
      maxHeight: 'calc(100vh - 130px)', overflowY: 'auto',
    }}>
      {/* Search */}
      <div>
        <div className="mono" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color: B.inkMute, marginBottom: 8 }}>SEARCH</div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, provider, keyword…"
          style={{
            width:'100%', padding:'10px 12px', background: B.bg, border:`1.5px solid ${B.ink}`,
            borderRadius: 10, fontSize: 14, fontFamily:'Inter', color: B.ink, outline:'none',
          }}
        />
      </div>

      {/* Sort */}
      <div style={{ marginTop: 18 }}>
        <div className="mono" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color: B.inkMute, marginBottom: 8 }}>SORT</div>
        <select
          value={sort} onChange={(e) => setSort(e.target.value)}
          style={{
            width:'100%', padding:'10px 12px', background: B.bg, border:`1.5px solid ${B.ink}`,
            borderRadius: 10, fontSize: 14, fontFamily:'Inter', color: B.ink, outline:'none', appearance:'none',
          }}
        >
          <option value="best">Best match</option>
          <option value="deadline">Soonest deadline</option>
          <option value="amount">Highest amount</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Deadline filter */}
      <div style={{ marginTop: 18 }}>
        <div className="mono" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color: B.inkMute, marginBottom: 8 }}>DEADLINE</div>
        {[
          { v:'all',     l:'All deadlines' },
          { v:'30',      l:'Next 30 days' },
          { v:'60',      l:'Next 60 days' },
          { v:'90',      l:'Next 90 days' },
          { v:'rolling', l:'Rolling only' },
        ].map(o => (
          <label key={o.v} style={{ display:'flex', alignItems:'center', gap: 10, padding:'7px 4px', cursor:'pointer', fontSize: 13 }}>
            <input
              type="radio" name="deadline" value={o.v}
              checked={deadlineFilter === o.v}
              onChange={() => setDeadlineFilter(o.v)}
              style={{ accentColor: B.purple }}
            />
            <span>{o.l}</span>
          </label>
        ))}
      </div>

      {/* From your profile */}
      <div style={{
        marginTop: 18, background: B.purpleSoft, border:`1.5px solid ${B.purple}`, borderRadius: 12, padding: 14,
      }}>
        <div className="mono" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color: B.purpleDeep }}>From your profile</div>
        <div style={{ fontSize: 13, color: B.ink, marginTop: 8, lineHeight: 1.4 }}>
          You're tagged as <b>{profileRecommendations.profileTag}</b>. We've pre-checked the categories below.
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop: 10 }}>
          {profileRecommendations.tags.map(t => (
            <span key={t} className="mono" style={{ fontSize:10, padding:'3px 7px', background:'#fff', color: B.purpleDeep, borderRadius:4, fontWeight:700 }}>{t}</span>
          ))}
        </div>
        <button onClick={reapplyProfile} style={{
          marginTop: 12, width:'100%', background: B.purple, color:'#fff', border:'none',
          borderRadius: 8, padding:'10px 12px', fontWeight: 700, fontSize: 13, cursor:'pointer',
        }}>Reapply profile filters</button>
      </div>

      {/* Categories */}
      {cfg.groups.map(g => (
        <div key={g.id} style={{ marginTop: 22 }}>
          <div className="mono" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color: B.inkMute, marginBottom: 8 }}>{g.label}</div>
          {g.items.map(it => {
            const isProfile = profileRecommendations.categoryIds.includes(it.id);
            const checked = selected.includes(it.id);
            const count = countsByCategory[it.id] || 0;
            return (
              <label key={it.id} style={{
                display:'flex', alignItems:'center', gap: 10, padding:'7px 4px', cursor:'pointer',
                fontSize: 13, opacity: count===0 ? 0.5 : 1,
              }}>
                <input
                  type="checkbox" checked={checked} onChange={() => toggleSelected(it.id)}
                  style={{ accentColor: B.purple }}
                />
                <span style={{ flex:1 }}>{it.label}</span>
                {isProfile && (
                  <span className="mono" style={{
                    fontSize:9, padding:'2px 5px', background: B.purple, color:'#fff', borderRadius:3, fontWeight:700, letterSpacing:'0.06em',
                  }}>PROFILE</span>
                )}
                <span className="mono" style={{ fontSize:11, color: B.inkMute, minWidth: 18, textAlign:'right' }}>{count}</span>
              </label>
            );
          })}
        </div>
      ))}

      {/* Clear all */}
      <button onClick={clearAll} style={{
        marginTop: 22, width:'100%', background:'transparent', color: B.ink, border:`1.5px solid ${B.ink}`,
        borderRadius: 10, padding:'10px 12px', fontWeight: 700, fontSize: 13, cursor:'pointer',
      }}>Clear / reset filters</button>
    </aside>
  );
}

window.PageHeader = PageHeader;
window.FundingCard = FundingCard;
window.FilterSidebar = FilterSidebar;

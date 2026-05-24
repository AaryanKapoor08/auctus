// pages-forum.jsx — Forum browser, NewThread, ThreadDetail.

const FORUM_CATEGORIES = [
  { id:'all',           label:'All' },
  { id:'funding',       label:'Funding' },
  { id:'collaboration', label:'Collaboration' },
  { id:'research',      label:'Research' },
  { id:'hiring',        label:'Hiring' },
  { id:'operations',    label:'Operations' },
  { id:'announcements', label:'Announcements' },
];

// ─────────────────────────────────────────────────────────────────────
function ForumBrowser({ initialParams }) {
  const B = AuctusBrand;
  const [search, setSearch]   = React.useState(initialParams?.search || '');
  const [category, setCategory] = React.useState(initialParams?.cat || 'all');

  // URL sync
  React.useEffect(() => {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (category !== 'all') p.set('cat', category);
    const qs = p.toString();
    const newHash = `#forum${qs ? '?' + qs : ''}`;
    if (window.location.hash !== newHash) history.replaceState(null, '', newHash);
  }, [search, category]);

  const filtered = React.useMemo(() => {
    let rs = FORUM_THREADS;
    if (category !== 'all') rs = rs.filter(t => t.categoryKey === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rs = rs.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.contentPreview.toLowerCase().includes(q) ||
        t.tags.join(' ').toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q)
      );
    }
    return rs;
  }, [search, category]);

  const clearFilters = () => { setSearch(''); setCategory('all'); };

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: '56px 56px 24px', maxWidth: 1320, margin:'0 auto' }}>
        <div className="mono" style={{ fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase', color:B.inkMute, marginBottom: 12 }}>04 · FORUM</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap: 32, flexWrap:'wrap' }}>
          <div>
            <h1 className="display" style={{ fontSize: 96, lineHeight: 0.92, margin: 0, letterSpacing:'-0.035em' }}>Community forum</h1>
            <p style={{ fontSize: 18, color: B.ink2, lineHeight: 1.5, marginTop: 16, maxWidth: 720 }}>
              Real notes from people who've applied — and won. Compare reviewer feedback, share templates, and tag the questions that actually got answered.
            </p>
          </div>
          <a href="#forum/new" style={{
            background: B.ink, color:'#fff', padding:'16px 22px', borderRadius: 999,
            fontWeight: 700, fontSize: 15, textDecoration:'none',
            display:'inline-flex', alignItems:'center', gap: 10, whiteSpace:'nowrap',
          }}>
            New thread
            <span style={{ background: B.lime, color: B.ink, borderRadius: 999, width: 24, height: 24, display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight: 800 }}>+</span>
          </a>
        </div>
      </div>

      {/* Search + chips */}
      <div style={{ padding: '0 56px', maxWidth: 1320, margin:'0 auto' }}>
        <div style={{ background: B.paper, border:`1.5px solid ${B.ink}`, borderRadius: 16, padding: 16 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search threads, authors, tags…"
            style={{
              width:'100%', padding:'12px 14px', background: B.bg, border:`1.5px solid ${B.ink}`,
              borderRadius: 10, fontSize: 15, fontFamily:'Inter', color: B.ink, outline:'none', marginBottom: 14,
            }}
          />
          <div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>
            {FORUM_CATEGORIES.map(c => {
              const active = category === c.id;
              return (
                <button key={c.id} onClick={() => setCategory(c.id)} style={{
                  background: active ? B.ink : 'transparent',
                  color: active ? '#fff' : B.ink,
                  border: `1.5px solid ${active ? B.ink : B.ruleStrong}`,
                  borderRadius: 999, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor:'pointer',
                }}>{c.label}</button>
              );
            })}
            {(category !== 'all' || search) && (
              <button onClick={clearFilters} className="mono" style={{
                background:'transparent', border:'none', color: B.coral, fontSize:11, fontWeight:700,
                letterSpacing:'0.06em', cursor:'pointer', padding: '4px 8px', textTransform:'uppercase', marginLeft:'auto',
              }}>Clear filters</button>
            )}
          </div>
        </div>
      </div>

      {/* Threads */}
      <div style={{ padding: '24px 56px 0', maxWidth: 1320, margin:'0 auto' }}>
        {filtered.length === 0 ? (
          <div style={{
            border:`1.5px dashed ${B.ruleStrong}`, borderRadius: 18, padding: '56px 32px', textAlign:'center',
            background: B.paper,
          }}>
            <div className="display" style={{ fontSize: 36, lineHeight: 1.1, letterSpacing:'-0.02em' }}>No threads yet here.</div>
            <p style={{ fontSize: 14, color: B.ink2, marginTop: 10, maxWidth: 420, marginLeft:'auto', marginRight:'auto', lineHeight: 1.5 }}>
              Be the first — start a thread and tag it with the right category.
            </p>
            <a href="#forum/new" style={{
              display:'inline-block', marginTop: 18, background: B.ink, color:'#fff', textDecoration:'none', borderRadius: 999,
              padding:'12px 22px', fontWeight: 700, fontSize: 14,
            }}>Start a thread</a>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(420px, 1fr))', gap: 14 }}>
            {filtered.map(th => <ThreadCard key={th.id} thread={th} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
function ThreadCard({ thread }) {
  const B = AuctusBrand;
  return (
    <a href={`#forum/${thread.id}`} style={{
      display:'flex', flexDirection:'column', gap: 10, textDecoration:'none', color: B.ink,
      background: B.paper, border:`1.5px solid ${B.ink}`, borderRadius: 16, padding: 18,
      boxShadow:`3px 3px 0 ${B.ink}`,
      transition:'transform .12s, box-shadow .12s',
    }}
    onMouseEnter={(e)=>{ e.currentTarget.style.boxShadow=`6px 6px 0 ${B.ink}`; e.currentTarget.style.transform='translate(-2px,-2px)'; }}
    onMouseLeave={(e)=>{ e.currentTarget.style.boxShadow=`3px 3px 0 ${B.ink}`; e.currentTarget.style.transform='translate(0,0)'; }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span className="mono" style={{
          fontSize:10, fontWeight:700, color: B.ink, background: B.lime, padding:'4px 8px', borderRadius:4, letterSpacing:'0.06em',
        }}>{thread.category.toUpperCase()}</span>
        {thread.hot && (
          <span className="mono" style={{
            fontSize:10, fontWeight:800, color: B.ink, background: B.coral, padding:'3px 7px', borderRadius:3, letterSpacing:'0.06em',
          }}>HOT</span>
        )}
      </div>
      <div style={{ fontWeight: 800, fontSize: 18, lineHeight: 1.3 }}>{thread.title}</div>
      <div style={{ fontSize: 14, color: B.ink2, lineHeight: 1.5 }}>{thread.contentPreview}</div>

      {thread.tags.length > 0 && (
        <div style={{ display:'flex', gap: 6, flexWrap:'wrap' }}>
          {thread.tags.map(t => (
            <span key={t} className="mono" style={{ fontSize: 10, padding:'3px 7px', border:`1px solid ${B.rule}`, borderRadius:4, color: B.ink2 }}>#{t}</span>
          ))}
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:`1px solid ${B.rule}`, paddingTop: 12, marginTop: 'auto' }}>
        <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
          <Avatar name={thread.author} size={28} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{thread.author}</div>
            <div className="mono" style={{ fontSize: 10, color: B.inkMute, letterSpacing:'0.04em' }}>{thread.authorRole}{thread.authorOnboarding ? ` · ${thread.authorOnboarding}` : ''}</div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{thread.replyCount} replies</div>
          <div className="mono" style={{ fontSize: 10, color: B.inkMute }}>{thread.date}</div>
        </div>
      </div>
    </a>
  );
}

function Avatar({ name, size = 32 }) {
  const B = AuctusBrand;
  const initials = name.split(/[\s.]/).filter(Boolean).map(s => s[0]).slice(0, 2).join('').toUpperCase();
  // pick a deterministic color from name
  const colors = [B.purple, B.coral, '#22A06B', '#3B82F6', '#E58E14'];
  const i = name.charCodeAt(0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: colors[i],
      color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center',
      fontWeight: 800, fontSize: size * 0.4, flexShrink:0,
    }}>{initials}</div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// NEW THREAD PAGE
function NewThreadPage() {
  const B = AuctusBrand;
  const [title, setTitle]     = React.useState('');
  const [category, setCategory] = React.useState('Funding');
  const [content, setContent] = React.useState('');
  const [tagsText, setTagsText] = React.useState('');
  const canPost = title.trim() && content.trim();

  return (
    <div style={{ padding: '40px 56px 80px', maxWidth: 820, margin:'0 auto' }}>
      <a href="#forum" className="mono" style={{
        color: B.inkMute, fontSize: 12, textDecoration:'none', letterSpacing:'0.06em', textTransform:'uppercase',
      }}>← Back to forum</a>

      <h1 className="display" style={{ fontSize: 56, lineHeight: 1, margin:'20px 0 10px', letterSpacing:'-0.03em' }}>Start a thread</h1>
      <p style={{ fontSize: 16, color: B.ink2, lineHeight: 1.5, maxWidth: 600 }}>
        Keep it specific. The community is most helpful when the thread title names a real funding program or shared question.
      </p>

      <div style={{ background: B.paper, border:`1.5px solid ${B.ink}`, borderRadius: 18, padding: 24, marginTop: 28, boxShadow:`6px 6px 0 ${B.ink}` }}>
        {/* Title */}
        <Field label="Title">
          <input
            value={title} onChange={(e)=>setTitle(e.target.value)}
            placeholder="e.g. CDAP Stream 2 — advisor report turnaround?"
            style={inputStyle(B)}
          />
        </Field>

        {/* Category */}
        <Field label="Category">
          <select value={category} onChange={(e)=>setCategory(e.target.value)} style={inputStyle(B)}>
            {FORUM_CATEGORIES.filter(c=>c.id!=='all').map(c=>(
              <option key={c.id} value={c.label}>{c.label}</option>
            ))}
          </select>
        </Field>

        {/* Content */}
        <Field label="Content">
          <textarea
            value={content} onChange={(e)=>setContent(e.target.value)}
            placeholder="Share the context, what you've tried, and what answer would help."
            rows={8}
            style={{ ...inputStyle(B), resize:'vertical', fontFamily:'Inter', lineHeight:1.5 }}
          />
        </Field>

        {/* Tags */}
        <Field label="Tags (optional)" helper="Up to five comma-separated tags.">
          <input
            value={tagsText} onChange={(e)=>setTagsText(e.target.value)}
            placeholder="CDAP, Stream 2, Advisor"
            style={inputStyle(B)}
          />
        </Field>

        <div style={{ display:'flex', justifyContent:'flex-end', gap: 8, marginTop: 18 }}>
          <a href="#forum" style={{
            background:'transparent', color: B.ink, textDecoration:'none',
            padding:'12px 20px', borderRadius: 999, fontWeight:600, fontSize:14,
            border:`1.5px solid ${B.ink}`,
          }}>Cancel</a>
          <button disabled={!canPost} onClick={()=>{ /* prototype only */ window.location.hash = '#forum'; }} style={{
            background: canPost ? B.ink : B.ruleStrong, color: canPost ? '#fff' : B.inkMute, border:'none',
            padding:'12px 22px', borderRadius: 999, fontWeight:700, fontSize:14, cursor: canPost ? 'pointer' : 'not-allowed',
            display:'inline-flex', alignItems:'center', gap: 10,
          }}>
            Post thread
            {canPost && <span style={{ background: B.lime, color: B.ink, padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:800 }}>↗</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, helper, children }) {
  const B = AuctusBrand;
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="mono" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color: B.inkMute, marginBottom: 8 }}>{label}</div>
      {children}
      {helper && <div className="mono" style={{ fontSize:11, color: B.inkMute, marginTop: 6, letterSpacing:'0.02em' }}>{helper}</div>}
    </div>
  );
}

function inputStyle(B) {
  return {
    width:'100%', padding:'12px 14px', background: B.bg, border:`1.5px solid ${B.ink}`,
    borderRadius: 10, fontSize: 15, color: B.ink, outline:'none',
    fontFamily:'Inter',
  };
}

// ─────────────────────────────────────────────────────────────────────
// THREAD DETAIL
function ThreadDetailPage({ id }) {
  const B = AuctusBrand;
  const thread = FORUM_THREADS.find(t => t.id === id);
  const [replyText, setReplyText] = React.useState('');
  // Working copy of replies in state so we can toggle helpful + add new replies live.
  const initial = (FORUM_REPLIES[id] || FORUM_REPLIES.default).map(r => ({ ...r, marked:false }));
  const [replies, setReplies] = React.useState(initial);

  if (!thread) {
    return (
      <div style={{ padding: '120px 56px', textAlign:'center' }}>
        <div className="display" style={{ fontSize: 48 }}>Thread not found.</div>
        <a href="#forum" style={{ display:'inline-block', marginTop: 20, color: B.purple, fontWeight: 700 }}>← Back to forum</a>
      </div>
    );
  }

  const toggleHelpful = (rid) => {
    setReplies(rs => rs.map(r => r.id === rid ? { ...r, marked: !r.marked, helpful: r.helpful + (r.marked ? -1 : 1) } : r));
  };

  const postReply = () => {
    if (!replyText.trim()) return;
    setReplies(rs => [...rs, {
      id: 'new-'+Date.now(), author:'You', authorRole:'Guest · Auctus', authorOnboarding:'',
      date:'Just now', content: replyText.trim(), helpful: 0, marked: false,
    }]);
    setReplyText('');
  };

  return (
    <div style={{ padding: '40px 56px 80px', maxWidth: 900, margin:'0 auto' }}>
      <a href="#forum" className="mono" style={{
        color: B.inkMute, fontSize: 12, textDecoration:'none', letterSpacing:'0.06em', textTransform:'uppercase',
      }}>← Back to forum</a>

      {/* Category + delete */}
      <div style={{ marginTop: 24, display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12 }}>
        <span className="mono" style={{
          fontSize:11, fontWeight:700, color: B.ink, background: B.lime, padding:'5px 10px', borderRadius:4, letterSpacing:'0.06em',
        }}>{thread.category.toUpperCase()}</span>
        <button
          onClick={()=>{ if(confirm('Delete this thread?')) window.location.hash = '#forum'; }}
          className="mono" style={{
            background:'transparent', color: B.coral, border:`1.5px solid ${B.coral}`, padding:'6px 12px', borderRadius: 999,
            fontSize: 11, fontWeight: 700, cursor:'pointer', letterSpacing:'0.06em',
          }}>DELETE THREAD</button>
      </div>

      <h1 className="display" style={{ fontSize: 56, lineHeight: 1.05, margin:'14px 0 16px', letterSpacing:'-0.025em' }}>{thread.title}</h1>

      {/* Meta */}
      <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 24 }}>
        <Avatar name={thread.author} size={42} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{thread.author}</div>
          <div className="mono" style={{ fontSize: 11, color: B.inkMute, letterSpacing:'0.04em' }}>
            {thread.authorRole}{thread.authorOnboarding ? ` · ${thread.authorOnboarding}` : ''} · {thread.date} · {thread.replyCount} replies
          </div>
        </div>
      </div>

      {/* Tags */}
      {thread.tags.length > 0 && (
        <div style={{ display:'flex', gap: 6, flexWrap:'wrap', marginBottom: 20 }}>
          {thread.tags.map(t => (
            <span key={t} className="mono" style={{ fontSize: 11, padding:'4px 10px', border:`1px solid ${B.rule}`, borderRadius:999, color: B.ink2 }}>#{t}</span>
          ))}
        </div>
      )}

      {/* Body */}
      <div style={{
        background: B.paper, border:`1.5px solid ${B.ink}`, borderRadius: 18, padding: 24,
        boxShadow:`4px 4px 0 ${B.ink}`, fontSize: 16, lineHeight: 1.65, whiteSpace:'pre-wrap', color: B.ink,
      }}>{thread.content}</div>

      {/* Replies */}
      <div style={{ marginTop: 48 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom: 18 }}>
          <h2 className="display" style={{ fontSize: 36, lineHeight: 1.05, margin: 0, letterSpacing:'-0.02em' }}>Replies <span style={{ color: B.inkMute }}>{replies.length}</span></h2>
          <div className="mono" style={{ fontSize: 11, color: B.inkMute, letterSpacing:'0.06em', textTransform:'uppercase' }}>Helpful counts shown</div>
        </div>

        {replies.length === 0 ? (
          <div style={{ border:`1.5px dashed ${B.ruleStrong}`, borderRadius: 18, padding: '40px 24px', textAlign:'center', color: B.inkMute, fontSize: 14 }}>
            No replies yet — be the first.
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap: 14 }}>
            {replies.map(r => (
              <article key={r.id} style={{
                background: B.paper, border:`1.5px solid ${B.ink}`, borderRadius: 16, padding: 18,
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap: 16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
                    <Avatar name={r.author} size={36} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{r.author}</div>
                      <div className="mono" style={{ fontSize: 11, color: B.inkMute, letterSpacing:'0.04em' }}>
                        {r.authorRole}{r.authorOnboarding ? ` · ${r.authorOnboarding}` : ''} · {r.date}
                      </div>
                    </div>
                  </div>
                  {r.author === 'You' && (
                    <button
                      onClick={()=>setReplies(rs=>rs.filter(x=>x.id!==r.id))}
                      className="mono" style={{
                        background:'transparent', color: B.coral, border:'none', padding:'4px 8px', borderRadius: 6,
                        fontSize: 10, fontWeight: 700, cursor:'pointer', letterSpacing:'0.06em',
                      }}>DELETE</button>
                  )}
                </div>
                <div style={{ marginTop: 14, fontSize: 15, lineHeight: 1.55, color: B.ink, whiteSpace:'pre-wrap' }}>{r.content}</div>
                <div style={{ marginTop: 14, display:'flex', alignItems:'center', gap: 10 }}>
                  <button onClick={()=>toggleHelpful(r.id)} style={{
                    background: r.marked ? B.lime : 'transparent',
                    color: r.marked ? B.ink : B.ink,
                    border:`1.5px solid ${B.ink}`, padding:'6px 12px', borderRadius: 999,
                    fontWeight: 700, fontSize: 12, cursor:'pointer',
                  }}>{r.marked ? '✓ Helpful' : 'Helpful'} · {r.helpful}</button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Add reply */}
        <div style={{
          marginTop: 24, background: B.paper, border:`1.5px solid ${B.ink}`, borderRadius: 18, padding: 18,
        }}>
          <div className="mono" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color: B.inkMute, marginBottom: 10 }}>Add a reply</div>
          <textarea
            value={replyText} onChange={(e)=>setReplyText(e.target.value)}
            rows={4}
            placeholder="Share what helped — or ask a follow-up."
            style={{ ...inputStyle(B), resize:'vertical', fontFamily:'Inter' }}
          />
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop: 12 }}>
            <button onClick={postReply} disabled={!replyText.trim()} style={{
              background: replyText.trim() ? B.ink : B.ruleStrong, color: replyText.trim() ? '#fff' : B.inkMute, border:'none',
              padding:'12px 22px', borderRadius: 999, fontWeight:700, fontSize:14,
              cursor: replyText.trim() ? 'pointer' : 'not-allowed',
            }}>Post reply</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ForumBrowser, NewThreadPage, ThreadDetailPage });

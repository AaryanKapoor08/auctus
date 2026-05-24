// landing.jsx — Auctus public landing (final).
// Composition merged from V1/V2/V3 per Figma annotations.

function AuctusLanding({ accent = AuctusBrand.coral }) {
  const B = AuctusBrand;

  return (
    <div className="auctus-page" id="top" style={{ color: B.ink }}>
      <AuctusTopNav accent={accent} />

      {/* ───────────────────────────── HERO ───────────────────────────── */}
      <section style={{ padding: '56px 56px 0', maxWidth: 1440, margin:'0 auto' }}>
        <h1 className="display" style={{
          fontSize: 220, lineHeight: 0.86, margin: 0, letterSpacing:'-0.045em',
        }}>
          FIND THE<br/>
          MONEY.<br/>
          <span style={{ position:'relative', display:'inline-block' }}>
            <span style={{
              position:'absolute', inset:'-6px -16px 6px -16px', background: B.purple, zIndex:0,
              transform:'skewX(-4deg)',
            }}></span>
            <span style={{ position:'relative', color:'#fff', zIndex:1, padding:'0 14px' }}>SKIP THE</span>
          </span>{' '}
          <span>NOISE.</span>
        </h1>

        {/* Subhead + CTA — from V3 */}
        <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', gap: 48, marginTop: 56, alignItems:'start' }}>
          <div>
            <p style={{ fontSize: 22, lineHeight: 1.4, color: B.ink2, maxWidth: 560, margin: 0, fontWeight: 500 }}>
              Auctus indexes <b style={{ color: B.ink }}>4,128 open opportunities</b> from federal, provincial and private sources — then matches you to the ones you can actually win.
            </p>
            <div style={{ display:'flex', gap: 12, marginTop: 32, flexWrap:'wrap' }}>
              <a href="#cta" style={{
                background: B.ink, color: '#fff', padding: '20px 28px', borderRadius: 999,
                fontWeight: 700, fontSize: 17, textDecoration:'none', letterSpacing:'-0.005em',
                display:'inline-flex', alignItems:'center', gap: 12,
              }}>
                Let's begin?
                <span style={{ background: B.lime, color: B.ink, borderRadius: 999, width:28, height:28, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize: 16, fontWeight:800 }}>→</span>
              </a>
              <a href="#opportunities" style={{
                border: `1.5px solid ${B.ink}`, color: B.ink, padding: '20px 26px', borderRadius: 999,
                fontWeight: 600, fontSize: 17, textDecoration:'none',
              }}>Browse the database</a>
            </div>

            <div style={{ display:'flex', gap: 32, marginTop: 40, flexWrap:'wrap' }}>
              {[['4,128', 'open opportunities'], ['312', 'sources indexed'], ['$4.1B', 'tracked annually']].map(([n,l]) => (
                <div key={l}>
                  <div className="display" style={{ fontSize: 38, lineHeight: 1 }}>{n}</div>
                  <div className="mono" style={{ fontSize: 11, color: B.inkMute, marginTop: 4, letterSpacing:'0.06em', textTransform:'uppercase' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live shortlist preview card */}
          <div style={{
            background: B.paper, borderRadius: 18, border: `1.5px solid ${B.ink}`,
            boxShadow: '8px 8px 0 0 ' + B.ink, padding: 22, alignSelf:'start',
          }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 14 }}>
              <div className="mono" style={{ fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', color: B.inkMute }}>SAMPLE SHORTLIST · 3 OF 6 MATCHES</div>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background: B.purpleSoft, color: B.purpleDeep, padding:'4px 10px', borderRadius:999, fontSize: 11, fontWeight: 700 }}>
                <span style={{ width:6, height:6, borderRadius:999, background: B.purple }}></span>
                AI MATCHED
              </div>
            </div>
            {OPPORTUNITIES.map((o, i) => (
              <div key={o.id} style={{
                padding: '14px 0', borderTop: `1px solid ${B.rule}`,
                display:'grid', gridTemplateColumns:'1fr auto', gap: 10, alignItems:'center',
              }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, lineHeight:1.25 }}>{o.title}</div>
                  <div style={{ fontSize: 12, color: B.inkMute, marginTop: 2 }}>{o.provider} · {o.kind}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div className="display" style={{ fontSize: 18, color: B.ink }}>{o.amount}</div>
                  <div className="mono" style={{ fontSize: 11, color: B.coral, fontWeight:700 }}>{o.deadline}</div>
                </div>
              </div>
            ))}
            <div style={{ borderTop:`1px solid ${B.rule}`, paddingTop: 14, marginTop: 4, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div className="mono" style={{ fontSize:11, color: B.inkMute }}>+ 3 more matched</div>
              <a href="#cta" style={{ fontSize:12, fontWeight:700, color: B.purple, textDecoration:'none' }}>Build mine →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── divider strip ───────── */}
      <div style={{ marginTop: 88 }}>
        <AuctusMarqueeStrip />
      </div>

      {/* ─────────────────────── PICK A LANE (V2) ─────────────────────── */}
      <section id="opportunities" style={{ padding: '96px 56px 0', maxWidth: 1440, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom: 32, borderBottom:`1.5px solid ${B.ink}`, paddingBottom: 18 }}>
          <div>
            <div className="mono" style={{ fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase', color:B.inkMute, marginBottom: 8 }}>SECTION 02 — ENTRY POINTS</div>
            <h2 className="display" style={{ fontSize: 92, lineHeight: 0.92, margin: 0, letterSpacing:'-0.03em' }}>Pick a lane.</h2>
          </div>
          <div style={{ fontSize: 14, color: B.inkMute, maxWidth: 340, lineHeight: 1.5 }}>
            Each lane is a personalized shortlist. Switch between them anytime; advisors and parents often run two.
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 0, borderTop:`1px solid ${B.rule}` }}>
          {[
            { num:'01', label:'BUSINESSES',  total:'1,640', body:'Federal & provincial grants, R&D credits, growth funds and procurement.', accent: B.purple, tags:['CDAP','SR&ED','IRAP','BDC'] },
            { num:'02', label:'STUDENTS',    total:'1,820', body:'Undergraduate to doctoral scholarships, bursaries, and travel awards.', accent: B.coral,  tags:['Vanier','NSERC','OGS','Loran'] },
            { num:'03', label:'RESEARCHERS', total:'  668', body:'Tri-council operating grants, partnership programs, and CFI infrastructure.', accent: B.lime, tags:['SSHRC','CIHR','CFI','NFRF'] },
          ].map((r, i) => (
            <div key={r.num} style={{
              padding: '32px 28px', borderRight: i<2?`1px solid ${B.rule}`:'none',
              display:'flex', flexDirection:'column', position:'relative',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <div className="mono" style={{ fontSize: 13, color: B.inkMute }}>NO. {r.num}</div>
                <div className="mono" style={{ fontSize: 11, color: B.inkMute, letterSpacing:'0.05em', textTransform:'uppercase' }}>OPEN NOW</div>
              </div>
              <div className="display" style={{ fontSize: 40, lineHeight: 1, marginTop: 6 }}>{r.label}</div>
              <div className="display-cond" style={{ fontSize: 150, lineHeight: 0.85, marginTop: 18, color: r.accent }}>
                {r.total}
              </div>
              <p style={{ fontSize: 14, color: B.ink2, lineHeight: 1.5, marginTop: 18 }}>{r.body}</p>
              <div style={{ display:'flex', gap: 6, flexWrap:'wrap', marginTop: 14 }}>
                {r.tags.map(t => (
                  <span key={t} className="mono" style={{ fontSize: 11, padding:'4px 8px', border:`1px solid ${B.ruleStrong}`, borderRadius: 4 }}>{t}</span>
                ))}
              </div>
              <a href="#cta" style={{
                marginTop: 28, alignSelf:'flex-start',
                background: B.ink, color:'#fff', padding:'12px 18px', borderRadius:999, fontWeight:700, fontSize:13, textDecoration:'none',
                display:'inline-flex', alignItems:'center', gap: 8,
              }}>Open {r.label.toLowerCase()} <span style={{ color: r.accent }}>→</span></a>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────── FROM 4,000-ROW (V2) ─────────────────── */}
      <section style={{ padding: '120px 56px 0', maxWidth: 1440, margin:'0 auto' }}>
        <div className="mono" style={{ fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase', color:B.inkMute, marginBottom: 8 }}>SECTION 04 — HOW IT WORKS</div>
        <h2 className="display" style={{ fontSize: 92, lineHeight: 0.92, margin: 0, letterSpacing:'-0.03em', maxWidth: 1200 }}>
          From a 4,000-row database to a six-line shortlist.
        </h2>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 0, marginTop: 56, borderTop:`2px solid ${B.ink}` }}>
          {[
            { step:'STEP 01', t:'Tell us once.',       body:'Pick a role and answer a 5-question profile. Stage, sector, location, stack — nothing more.', accent: B.purple },
            { step:'STEP 02', t:'See what fits.',      body:'Auctus matches your profile to live opportunities, scoring each by eligibility and competitiveness.', accent: B.coral },
            { step:'STEP 03', t:'Stay in the loop.',   body:'Save what matters. Deadlines, eligibility changes, and reviewer notes land in your weekly digest.', accent: B.lime },
            { step:'STEP 04', t:'Apply with context.', body:'Each detail page ships with an AI-enriched summary, eligibility checklist and external application link.', accent: B.butter },
          ].map((s, i) => (
            <div key={s.step} style={{
              padding: '28px 24px', borderRight: i<3?`1px solid ${B.rule}`:'none',
              display:'flex', flexDirection:'column', minHeight: 340,
            }}>
              <div className="mono" style={{ fontSize:11, color: B.inkMute, letterSpacing:'0.06em' }}>{s.step}</div>
              <div className="display" style={{ fontSize: 36, lineHeight: 1.05, marginTop: 14, letterSpacing:'-0.02em' }}>{s.t}</div>
              <div style={{ height: 56, marginTop: 18, background: s.accent, borderRadius: 6 }}></div>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: B.ink2, marginTop: 18 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── divider strip ───────── */}
      <div style={{ marginTop: 96 }}>
        <AuctusMarqueeStrip
          items={['AI READS THE FINE PRINT', 'AUTO-FILL WHERE WE CAN', '$4.1B TRACKED', 'NO PDFs LEFT BEHIND', 'BUILT FOR CANADA']}
          speed="slow"
        />
      </div>

      {/* ──────────────── AUTOMATE — NEW SECTION ──────────────── */}
      <AutomateSection />

      {/* ─────────────────── COMMUNITY (V1) ─────────────────── */}
      <section id="community" style={{ padding: '120px 56px 0', maxWidth: 1440, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.1fr', gap: 48, alignItems:'center' }}>
          <div>
            <div className="mono" style={{ fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase', color:B.inkMute, marginBottom: 10 }}>05 · COMMUNITY</div>
            <h2 className="display" style={{ fontSize: 72, lineHeight: 0.95, margin: 0, letterSpacing:'-0.03em' }}>
              Real notes from <br/>people who've <span style={{ color: B.purple }}>won the thing.</span>
            </h2>
            <p style={{ fontSize: 18, color: B.ink2, lineHeight: 1.5, marginTop: 18, maxWidth: 500 }}>
              The Auctus forum is where applicants compare reviewer feedback, share templates, and tag the questions that actually got answered.
            </p>
            <div style={{ display:'flex', gap: 10, marginTop: 28 }}>
              <a href="#" style={{ background: B.ink, color:'#fff', padding:'14px 22px', borderRadius: 999, fontWeight:700, fontSize:14, textDecoration:'none' }}>Browse threads</a>
              <a href="#" style={{ color: B.ink, padding:'14px 22px', borderRadius: 999, fontWeight:600, fontSize:14, textDecoration:'none', border:`1.5px solid ${B.ink}` }}>Start a thread</a>
            </div>
          </div>

          <div style={{ background: B.paper, border:`1.5px solid ${B.ink}`, borderRadius: 18, padding: 18, boxShadow:'8px 8px 0 0 '+B.ink }}>
            {[
              { tag:'CDAP', title:'Anyone heard back about Stream 2 advisor reports?', meta:'@hena_p · 14 replies · 22 helpful', hot:true },
              { tag:'NSERC', title:'NSERC PGS-D writing template (round 4 winner)', meta:'@dr_marc · 31 replies · 48 helpful', hot:false },
              { tag:'SR&ED', title:'Do I need to amortize prototype costs across years?', meta:'@founder_q · 7 replies · 9 helpful', hot:false },
              { tag:'SSHRC', title:'Best way to frame "knowledge mobilization"?', meta:'@kira.h · 11 replies · 15 helpful', hot:false },
            ].map((th, i) => (
              <div key={i} style={{
                padding:'16px 6px', display:'grid', gridTemplateColumns:'76px 1fr auto', alignItems:'center', gap:14,
                borderTop: i===0?'none':`1px solid ${B.rule}`,
              }}>
                <span className="mono" style={{ fontSize:11, fontWeight:700, color: B.purpleDeep, background: B.purpleSoft, padding:'5px 8px', borderRadius:4, textAlign:'center' }}>{th.tag}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, lineHeight:1.3 }}>{th.title}</div>
                  <div style={{ fontSize: 12, color: B.inkMute, marginTop: 2 }}>{th.meta}</div>
                </div>
                {th.hot
                  ? <span style={{ background: accent, color: B.ink, fontWeight:700, fontSize:10, padding:'3px 8px', borderRadius:4 }}>HOT</span>
                  : <span className="mono" style={{ fontSize: 11, color: B.inkMute }}>▲ 14</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────── BLACK TAIL / FOOTER ─────────────────── */}
      <AuctusFooter accent={accent} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Automate section — light-themed, lime block + auto-looping demo of
// "press button next to grant → AI summary pops up".
function AutomateSection() {
  const B = AuctusBrand;
  return (
    <section style={{ padding: '120px 56px 0', maxWidth: 1440, margin:'0 auto' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.05fr', gap: 56, alignItems:'start' }}>
        {/* LEFT: copy + lime block */}
        <div>
          <div className="mono" style={{ fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase', color:B.inkMute, marginBottom: 10 }}>06 · AUTOMATE</div>
          <h2 className="display" style={{ fontSize: 88, lineHeight: 0.92, margin: 0, letterSpacing:'-0.035em' }}>
            Automate<br/>
            and <span style={{ background: B.lime, padding:'0 12px', display:'inline-block', borderRadius: 6 }}>save time</span><br/>
            for things<br/>that matter.
          </h2>
          <p style={{ fontSize: 18, color: B.ink2, lineHeight: 1.5, marginTop: 24, maxWidth: 520 }}>
            Auctus AI reads the program docs so you don't have to. Plain-language summaries, eligibility checklists, reviewer-style red flags, and auto-fillable application drafts — one click per grant.
          </p>

          <div style={{ display:'flex', gap: 10, marginTop: 28 }}>
            <a href="#cta" style={{
              background: B.ink, color:'#fff', padding:'14px 22px', borderRadius: 999,
              fontWeight: 700, fontSize:14, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:10,
            }}>
              Try the AI demo
              <span style={{ background: B.lime, color: B.ink, borderRadius: 999, width: 22, height: 22, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize: 12 }}>→</span>
            </a>
            <a href="#" style={{
              color: B.ink, padding:'14px 22px', borderRadius: 999, fontWeight:600, fontSize:14, textDecoration:'none', border:`1.5px solid ${B.ink}`,
            }}>How it works</a>
          </div>

          {/* Capability chips */}
          <div style={{ display:'flex', gap: 8, flexWrap:'wrap', marginTop: 36, maxWidth: 480 }}>
            {[
              'Eligibility checklist',
              'Reviewer red-flag scan',
              'Budget cross-check',
              'Letter-of-support drafts',
              'Deadline calendar sync',
              'Profile auto-fill',
            ].map(c => (
              <span key={c} style={{
                padding:'8px 12px', background: B.paper, border:`1.5px solid ${B.ink}`, borderRadius: 999,
                fontSize: 13, fontWeight: 600,
              }}>✓ {c}</span>
            ))}
          </div>
        </div>

        {/* RIGHT: light-themed demo */}
        <div style={{
          background: B.paper, border:`1.5px solid ${B.ink}`, borderRadius: 22, padding: 24,
          boxShadow: `8px 8px 0 0 ${B.ink}`, position:'relative', overflow:'hidden',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 14 }}>
            <div className="mono" style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color: B.inkMute }}>
              AUCTUS AI · LIVE DEMO
            </div>
            <div className="mono" style={{ fontSize:11, color: B.inkMute, display:'inline-flex', alignItems:'center', gap: 6 }}>
              <span style={{ width:6, height:6, background:'#10C966', borderRadius:999 }}></span>
              READY
            </div>
          </div>

          {/* The grant row with auto-loop button */}
          <div style={{
            background: B.bg, border:`1.5px solid ${B.ink}`, borderRadius: 14, padding: 16,
            display:'grid', gridTemplateColumns:'1fr auto', gap: 16, alignItems:'center',
          }}>
            <div>
              <div style={{ display:'flex', gap:6, marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 10, padding:'2px 6px', background: B.purpleSoft, color: B.purpleDeep, borderRadius: 4, fontWeight: 700, letterSpacing:'0.04em' }}>RESEARCH</span>
                <span className="mono" style={{ fontSize: 10, padding:'2px 6px', background: B.coralSoft, color: '#B23A2D', borderRadius: 4, fontWeight: 700, letterSpacing:'0.04em' }}>SSHRC</span>
              </div>
              <div style={{ fontWeight:800, fontSize:17, lineHeight:1.25 }}>SSHRC Insight Grant</div>
              <div style={{ display:'flex', gap: 14, marginTop: 6, fontSize: 13, color: B.ink2 }}>
                <span><b className="display" style={{ fontSize: 14 }}>$200,000</b></span>
                <span style={{ color: B.coral, fontWeight:600 }}>● Oct 1</span>
                <span className="mono" style={{ fontSize: 11, color: B.inkMute }}>5-YR · HUMANITIES</span>
              </div>
            </div>
            <button className="auc-btn-loop" style={{
              background: B.lime, color: B.ink, border:`1.5px solid ${B.ink}`,
              padding:'12px 16px', borderRadius: 999, fontWeight:800, fontSize:13, cursor:'pointer',
              display:'inline-flex', alignItems:'center', gap: 8, whiteSpace:'nowrap',
              boxShadow:`0 3px 0 ${B.ink}`,
            }}>
              <span style={{
                width: 18, height: 18, borderRadius:'50%', background: B.ink, color: B.lime,
                display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize: 11, fontWeight:800,
              }}>✦</span>
              Summarize
            </button>
          </div>

          {/* The popup summary that auto-shows */}
          <div className="auc-summary-loop" style={{
            background: B.lime, border:`1.5px solid ${B.ink}`, borderRadius: 14, padding: 18,
            marginTop: 12, position:'relative',
            boxShadow: `4px 4px 0 ${B.ink}`,
          }}>
            <div style={{ position:'absolute', top:-9, left: 24, width: 16, height: 16, background: B.lime, borderLeft:`1.5px solid ${B.ink}`, borderTop:`1.5px solid ${B.ink}`, transform:'rotate(45deg)' }}></div>

            <div className="mono" style={{ fontSize: 10, letterSpacing:'0.08em', color: B.ink, opacity:.7 }}>AI SUMMARY · 1.4s</div>
            <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.5, color: B.ink }}>
              A 5-year program covering up to <b>$200,000</b> for humanities and social-science research.
              Reviewers weight <i>knowledge mobilization plans</i> heavily; budget under-spend in year 1 is a common red flag.
            </p>

            <div style={{ marginTop: 14, display:'flex', flexWrap:'wrap', gap:6 }}>
              {[
                ['✓', 'Eligibility: PhD + appointment'],
                ['✓', 'Letters of support × 2'],
                ['✓', 'Knowledge mobilization plan'],
                ['!', 'Budget realism (Y1)'],
              ].map(([mark, t]) => (
                <span key={t} className="mono" style={{
                  fontSize: 11, padding:'5px 10px',
                  background: mark==='!'?'#FFD2CC':'#FFFFFF',
                  color: mark==='!'?'#B23A2D':B.ink,
                  borderRadius: 999, fontWeight: 700,
                  border: `1px solid ${mark==='!'?'#B23A2D':'rgba(14,14,16,0.18)'}`,
                }}>
                  <b>{mark}</b> {t}
                </span>
              ))}
            </div>

            <div style={{ marginTop: 16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div className="mono" style={{ fontSize: 11, color: B.ink, opacity:.7 }}>POWERED BY AUCTUS AI · GPT + GRANT-CORPUS</div>
              <div style={{ display:'flex', gap: 6 }}>
                <button style={{ background:'#fff', color: B.ink, border:`1.5px solid ${B.ink}`, padding:'6px 12px', borderRadius:999, fontSize:12, fontWeight:700 }}>Save</button>
                <button style={{ background: B.ink, color:'#fff', border:'none', padding:'6px 12px', borderRadius:999, fontSize:12, fontWeight:700 }}>Draft application →</button>
              </div>
            </div>
          </div>

          {/* faint instructions */}
          <div className="mono" style={{ marginTop: 14, fontSize: 11, color: B.inkMute, letterSpacing:'0.05em' }}>
            ↻ DEMO LOOPS · TAP SUMMARIZE ON ANY GRANT IN THE PRODUCT
          </div>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function AuctusFooter({ accent }) {
  const B = AuctusBrand;
  return (
    <footer id="cta" style={{
      marginTop: 120, background: B.ink, color:'#fff', padding: '80px 56px 28px', position:'relative', overflow:'hidden',
    }}>
      {/* Big wordmark watermark */}
      <div className="kiki" style={{
        position:'absolute', bottom: -32, left: 24, right: 24, fontSize: 320, lineHeight: 0.9,
        color: 'rgba(255,255,255,0.04)', pointerEvents:'none', letterSpacing:'-0.02em',
      }}>auctus.</div>

      <div style={{ maxWidth: 1320, margin: '0 auto', position:'relative', zIndex: 1 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap: 64 }}>
          <div>
            <div className="mono" style={{ fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.55)', marginBottom: 18 }}>
              READY · 90s · FREE FOREVER
            </div>
            <h2 className="display" style={{ fontSize: 92, lineHeight: 0.92, margin: 0, letterSpacing:'-0.035em' }}>
              Stop scrolling.<br/>
              Start <span style={{ color: B.lime }}>shortlisting.</span>
            </h2>
            <div style={{ display:'flex', gap: 12, marginTop: 36, flexWrap:'wrap' }}>
              <a href="#" style={{
                background: B.lime, color: B.ink, padding:'18px 28px', borderRadius: 999, fontWeight: 800, fontSize: 16, textDecoration:'none',
                display:'inline-flex', alignItems:'center', gap: 10,
              }}>Create my profile <span>→</span></a>
              <a href="#opportunities" style={{
                background:'transparent', color:'#fff', padding:'18px 24px', borderRadius: 999, fontWeight: 600, fontSize: 16, textDecoration:'none', border:'1.5px solid rgba(255,255,255,0.3)',
              }}>Browse the database</a>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 24, alignContent:'start', paddingTop: 8 }}>
            {[
              { h:'Product', items:['Grants','Scholarships','Research','Forum','Dashboard'] },
              { h:'Auctus',  items:['About','Sources','Press','Careers','Contact'] },
              { h:'Legal',   items:['Privacy','Terms','Data','Accessibility'] },
            ].map(col => (
              <div key={col.h}>
                <div className="mono" style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'rgba(255,255,255,0.5)' }}>{col.h}</div>
                <div style={{ display:'flex', flexDirection:'column', gap: 10, marginTop: 14 }}>
                  {col.items.map(it => (
                    <a key={it} href="#" style={{ color:'rgba(255,255,255,0.88)', textDecoration:'none', fontSize: 14 }}>{it}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: 64, paddingTop: 22, borderTop:'1px solid rgba(255,255,255,0.12)',
          display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap: 16,
        }}>
          <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
            <span className="kiki" style={{ fontSize: 22, color:'#fff' }}>auctus</span>
            <span style={{ width:6, height:6, background: B.lime, borderRadius:'50%', alignSelf:'center', marginLeft:4 }}></span>
            <span className="mono" style={{ fontSize: 11, color:'rgba(255,255,255,0.45)', marginLeft: 14 }}>© 2026 · MADE IN CANADA 🇨🇦</span>
          </div>
          <div className="mono" style={{ fontSize: 11, color:'rgba(255,255,255,0.45)', letterSpacing:'0.06em' }}>
            INDEXED DAILY · 312 SOURCES · 4,128 OPPORTUNITIES LIVE
          </div>
        </div>
      </div>
    </footer>
  );
}

window.AuctusLanding = AuctusLanding;

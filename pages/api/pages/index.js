import { useState } from "react";
import Head from "next/head";

const BUSINESS_TYPES = ["Restaurant","Hotel","Cafe","Retail Shop","Medical Clinic","Salon & Spa","Gym & Fitness","Auto Service","Legal Service","Real Estate","Other"];
const TONES = ["Friendly & Warm","Professional","Formal","Casual","Empathetic"];
const STAR_LABELS = ["","Very bad — damage control needed","Poor — careful response needed","Average — room to improve","Good — thank & acknowledge","Excellent — celebrate & invite back"];

const SENTIMENT_STYLES = {
  positive: { bg:"rgba(74,222,128,0.08)",  color:"#4ADE80", border:"rgba(74,222,128,0.2)"  },
  negative: { bg:"rgba(248,113,113,0.08)", color:"#F87171", border:"rgba(248,113,113,0.2)" },
  mixed:    { bg:"rgba(251,146,60,0.08)",  color:"#FB923C", border:"rgba(251,146,60,0.2)"  },
  neutral:  { bg:"rgba(148,163,184,0.08)", color:"#94A3B8", border:"rgba(148,163,184,0.2)" },
};

const VAR_STYLES = [
  { color:"#4ADE80", bg:"rgba(74,222,128,0.1)",  border:"rgba(74,222,128,0.25)"  },
  { color:"#60A5FA", bg:"rgba(96,165,250,0.1)",  border:"rgba(96,165,250,0.25)"  },
  { color:"#C084FC", bg:"rgba(192,132,252,0.1)", border:"rgba(192,132,252,0.25)" },
];

export default function Home() {
  const [profile, setProfile]           = useState({ name:"", type:"Restaurant", tone:"Friendly & Warm" });
  const [profileOpen, setProfileOpen]   = useState(true);
  const [profileSaved, setProfileSaved] = useState(false);
  const [stars, setStars]               = useState(0);
  const [hoveredStar, setHoveredStar]   = useState(0);
  const [review, setReview]             = useState("");
  const [loading, setLoading]           = useState(false);
  const [results, setResults]           = useState(null);
  const [copied, setCopied]             = useState(null);
  const [error, setError]               = useState(null);

  const canGenerate = review.trim().length > 10 && stars > 0 && !loading;

  async function generateReplies() {
    if (!canGenerate) return;
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review, stars, profile }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  function copyReply(text, idx) {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2200);
  }

  const activeStar = hoveredStar || stars;
  const sentStyle  = results ? (SENTIMENT_STYLES[results.sentiment] || SENTIMENT_STYLES.neutral) : null;

  return (
    <>
      <Head>
        <title>ReplyAI — AI-Powered Review Replies</title>
        <meta name="description" content="Generate perfect, personalized replies to your Google reviews in seconds." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#08080D;color:#EEEEF4;font-family:'DM Sans',sans-serif;min-height:100vh;}
        ::selection{background:rgba(74,222,128,0.25);}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#222230;border-radius:2px;}
        textarea:focus,select:focus,input:focus{outline:none;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-400% 0}100%{background-position:400% 0}}
        @keyframes popIn{0%{transform:scale(0.92);opacity:0}100%{transform:scale(1);opacity:1}}
        .star-btn{background:none;border:none;cursor:pointer;padding:3px;transition:transform 0.12s ease;}
        .star-btn:hover{transform:scale(1.25);}
        .tone-btn{cursor:pointer;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
        .gen-btn{cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;}
        .gen-btn:hover:not(:disabled){opacity:0.88;transform:translateY(-1px);}
        .gen-btn:active:not(:disabled){transform:scale(0.98);}
        .gen-btn:disabled{cursor:not-allowed;}
        .copy-btn{cursor:pointer;transition:all 0.15s;font-family:'DM Sans',sans-serif;}
        .copy-btn:hover{opacity:0.8;}
        .copy-btn:active{transform:scale(0.95);}
        .var-card{transition:border-color 0.2s;}
        .var-card:hover{border-color:rgba(255,255,255,0.14) !important;}
        .profile-toggle{width:100%;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;}
        .profile-select{background:#141420;border:1px solid rgba(255,255,255,0.08);color:#EEEEF4;border-radius:8px;padding:9px 12px;font-family:'DM Sans',sans-serif;font-size:14px;width:100%;cursor:pointer;appearance:none;}
        .profile-select:focus{border-color:rgba(74,222,128,0.35);}
        .profile-input{background:#141420;border:1px solid rgba(255,255,255,0.08);color:#EEEEF4;border-radius:8px;padding:9px 12px;font-family:'DM Sans',sans-serif;font-size:14px;width:100%;transition:border-color 0.2s;}
        .profile-input::placeholder{color:rgba(238,238,244,0.25);}
        .profile-input:focus{border-color:rgba(74,222,128,0.35);}
        .review-area{background:#0E0E18;border:1px solid rgba(255,255,255,0.07);color:#EEEEF4;border-radius:12px;padding:16px;font-family:'DM Sans',sans-serif;font-size:15px;width:100%;resize:none;line-height:1.7;transition:border-color 0.2s;}
        .review-area::placeholder{color:rgba(238,238,244,0.2);}
        .review-area:focus{border-color:rgba(74,222,128,0.3);}
        .save-btn{cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;}
        .save-btn:hover{opacity:0.85;}
      `}</style>

      <div style={{ paddingBottom:60 }}>
        {/* Header */}
        <div style={{ padding:"22px 22px 0", display:"flex", alignItems:"center", justifyContent:"space-between", maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#4ADE80,#16A34A)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>✦</div>
            <span style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", fontSize:23, letterSpacing:"-0.3px", color:"#FAFAFA" }}>ReplyAI</span>
          </div>
          <div style={{ fontSize:12, color:"rgba(238,238,244,0.35)", background:"#141420", padding:"4px 10px", borderRadius:20, border:"1px solid rgba(255,255,255,0.07)" }}>Free Beta</div>
        </div>

        <div style={{ maxWidth:720, margin:"0 auto", padding:"24px 18px 0" }}>

          {/* Business Profile */}
          <div style={{ background:"#111118", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, marginBottom:14, overflow:"hidden" }}>
            <button className="profile-toggle" onClick={() => setProfileOpen(o => !o)} style={{ padding:"14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:16 }}>🏢</span>
                <span style={{ fontSize:14, fontWeight:500 }}>Business Profile</span>
                {profileSaved && <span style={{ fontSize:11, background:"rgba(74,222,128,0.12)", color:"#4ADE80", padding:"2px 9px", borderRadius:20, border:"1px solid rgba(74,222,128,0.2)" }}>✓ Saved</span>}
              </div>
              <span style={{ color:"rgba(238,238,244,0.35)", fontSize:20, transition:"transform 0.2s", display:"block", transform: profileOpen ? "rotate(180deg)" : "none" }}>⌄</span>
            </button>

            {profileOpen && (
              <div style={{ padding:"4px 20px 20px", borderTop:"1px solid rgba(255,255,255,0.05)", animation:"popIn 0.2s ease" }}>
                <p style={{ fontSize:13, color:"rgba(238,238,244,0.38)", margin:"12px 0 16px", lineHeight:1.55 }}>
                  Set this once — every reply will be automatically personalized to your brand.
                </p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                  <div>
                    <label style={{ fontSize:12, color:"rgba(238,238,244,0.4)", display:"block", marginBottom:6 }}>Business name</label>
                    <input className="profile-input" placeholder="e.g. Mario's Pizzeria" value={profile.name} onChange={e => setProfile(p => ({...p, name:e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize:12, color:"rgba(238,238,244,0.4)", display:"block", marginBottom:6 }}>Business type</label>
                    <select className="profile-select" value={profile.type} onChange={e => setProfile(p => ({...p, type:e.target.value}))}>
                      {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:12, color:"rgba(238,238,244,0.4)", display:"block", marginBottom:8 }}>Reply tone</label>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {TONES.map(t => (
                      <button key={t} className="tone-btn" onClick={() => setProfile(p => ({...p, tone:t}))} style={{ background: profile.tone===t ? "rgba(74,222,128,0.12)" : "#1A1A28", border:`1px solid ${profile.tone===t ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.08)"}`, color: profile.tone===t ? "#4ADE80" : "rgba(238,238,244,0.55)", borderRadius:8, padding:"7px 13px", fontSize:13, fontWeight: profile.tone===t ? 500 : 400 }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="save-btn" onClick={() => { setProfileSaved(true); setProfileOpen(false); }} style={{ background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.22)", color:"#4ADE80", borderRadius:9, padding:"9px 20px", fontSize:14, fontWeight:500 }}>
                  Save profile →
                </button>
              </div>
            )}
          </div>

          {/* Main Tool */}
          <div style={{ background:"#111118", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:"24px", marginBottom:14 }}>

            {/* Stars */}
            <div style={{ marginBottom:22 }}>
              <label style={{ fontSize:13, color:"rgba(238,238,244,0.45)", display:"block", marginBottom:10 }}>How many stars did this review have?</label>
              <div style={{ display:"flex", alignItems:"center", gap:2 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} className="star-btn" onClick={() => setStars(s)} onMouseEnter={() => setHoveredStar(s)} onMouseLeave={() => setHoveredStar(0)}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill={activeStar >= s ? "#F59E0B" : "rgba(255,255,255,0.07)"} stroke={activeStar >= s ? "#F59E0B" : "rgba(255,255,255,0.18)"} strokeWidth="1.5" style={{ display:"block", transition:"fill 0.1s,stroke 0.1s" }}>
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                    </svg>
                  </button>
                ))}
                {stars > 0 && <span style={{ fontSize:12, color:"rgba(238,238,244,0.35)", marginLeft:10 }}>{STAR_LABELS[stars]}</span>}
              </div>
            </div>

            {/* Review */}
            <div style={{ marginBottom:22 }}>
              <label style={{ fontSize:13, color:"rgba(238,238,244,0.45)", display:"block", marginBottom:10 }}>Paste the customer review</label>
              <textarea className="review-area" rows={5} placeholder="Paste the exact review here — the more specific, the better and more personalized your reply will be..." value={review} onChange={e => setReview(e.target.value)} />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                <span style={{ fontSize:12, color:"rgba(238,238,244,0.2)" }}>{review.length} chars</span>
                {review.length > 0 && review.length < 10 && <span style={{ fontSize:12, color:"#FB923C" }}>Write a bit more</span>}
              </div>
            </div>

            {/* Generate Button */}
            <button className="gen-btn" disabled={!canGenerate} onClick={generateReplies} style={{ width:"100%", background: canGenerate ? "linear-gradient(135deg,#22C55E 0%,#16A34A 100%)" : "#161622", border:"none", borderRadius:12, padding:"15px", fontSize:15, fontWeight:600, color: canGenerate ? "#fff" : "rgba(238,238,244,0.2)", display:"flex", alignItems:"center", justifyContent:"center", gap:9, boxShadow: canGenerate ? "0 4px 24px rgba(34,197,94,0.25)" : "none" }}>
              {loading ? (
                <>
                  <div style={{ width:18, height:18, border:"2.5px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                  Generating 3 personalized replies…
                </>
              ) : <>✦ Generate 3 Reply Variations</>}
            </button>
          </div>

          {/* Shimmer */}
          {loading && (
            <div style={{ display:"grid", gap:10 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ height:130, borderRadius:14, background:"linear-gradient(90deg,#111118 25%,#1A1A28 50%,#111118 75%)", backgroundSize:"400% 100%", animation:`shimmer 1.6s ease-in-out ${i*0.18}s infinite` }} />
              ))}
            </div>
          )}

          {/* Error */}
          {error && <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:12, padding:"14px 18px", color:"#F87171", fontSize:14 }}>{error}</div>}

          {/* Results */}
          {results && !loading && (
            <div style={{ animation:"slideUp 0.3s ease" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                <span style={{ fontSize:13, color:"rgba(238,238,244,0.35)" }}>Detected:</span>
                <span style={{ fontSize:12, fontWeight:500, padding:"3px 12px", borderRadius:20, background:sentStyle.bg, color:sentStyle.color, border:`1px solid ${sentStyle.border}` }}>
                  {results.sentimentLabel || results.sentiment}
                </span>
                <span style={{ fontSize:12, color:"rgba(238,238,244,0.2)", marginLeft:"auto" }}>3 variations ready</span>
              </div>

              <div style={{ display:"grid", gap:10 }}>
                {results.variations.map((v, i) => {
                  const vs = VAR_STYLES[i];
                  return (
                    <div key={i} className="var-card" style={{ background:"#111118", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"18px 20px", animation:`slideUp 0.35s ease ${i*0.1}s both` }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:12, fontWeight:600, padding:"3px 11px", borderRadius:6, background:vs.bg, color:vs.color, border:`1px solid ${vs.border}` }}>{v.label}</span>
                          <span style={{ fontSize:11, color:"rgba(238,238,244,0.22)" }}>{v.reply.length} chars</span>
                        </div>
                        <button className="copy-btn" onClick={() => copyReply(v.reply, i)} style={{ background: copied===i ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.05)", border:`1px solid ${copied===i ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`, color: copied===i ? "#4ADE80" : "rgba(238,238,244,0.6)", borderRadius:8, padding:"6px 14px", fontSize:13, fontWeight:500, display:"flex", alignItems:"center", gap:5 }}>
                          {copied===i ? "✓ Copied!" : "Copy"}
                        </button>
                      </div>
                      <p style={{ fontSize:14, lineHeight:1.75, color:"rgba(238,238,244,0.78)", borderLeft:`2px solid ${vs.color}`, paddingLeft:14, margin:0 }}>
                        {v.reply}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:"rgba(238,238,244,0.2)" }}>
                Not happy with these? Hit generate again for fresh variations.
              </div>
            </div>
          )}

          {!results && !loading && (
            <div style={{ textAlign:"center", padding:"44px 20px", color:"rgba(238,238,244,0.18)" }}>
              <div style={{ fontSize:38, marginBottom:14, opacity:0.5 }}>✦</div>
              <div style={{ fontSize:14, lineHeight:1.7 }}>Select a star rating and paste a review above,<br/>then hit generate.</div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

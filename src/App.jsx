import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://rczqlzkfdhotymrivweb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjenFsemtmZGhvdHltcml2d2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MjYwMjgsImV4cCI6MjA5MjMwMjAyOH0.LHDTf8SasGRLGH1A9Pw6ItQILJCQzDaf67k8G0uxo98";
const ADMIN_PASSWORD = "noah633"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0a; --surface: #141414; --surface2: #1e1e1e;
    --border: rgba(255,255,255,0.08); --border2: rgba(255,255,255,0.15);
    --text: #f0f0f0; --muted: #888;
    --green: #22c55e; --red: #ef4444; --amber: #f59e0b; --blue: #3b82f6; --accent: #a78bfa;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Syne', sans-serif; }
  .app { min-height: 100vh; max-width: 800px; margin: 0 auto; padding: 0 16px 80px; }
  
  .header { padding: 32px 0 24px; border-bottom: 1px solid var(--border); margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; }
  .logo { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
  .logo span { color: var(--accent); }
  .subtitle { font-size: 13px; color: var(--muted); margin-top: 4px; font-family: 'DM Mono', monospace; }

  .btn { padding: 8px 16px; border-radius: 8px; border: none; font-family: 'Syne', sans-serif; font-weight: 500; font-size: 13px; cursor: pointer; transition: opacity 0.15s, transform 0.1s; }
  .btn:hover { opacity: 0.85; } .btn:active { transform: scale(0.97); }
  .btn-primary { background: var(--accent); color: #000; }
  .btn-success { background: var(--green); color: #000; }
  .btn-danger { background: var(--red); color: #fff; }
  .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border2); }

  .field-label { font-size: 12px; color: var(--muted); font-family: 'DM Mono', monospace; margin-bottom: 6px; display: block; }
  .field-input { width: 100%; padding: 10px 14px; background: var(--surface2); border: 1px solid var(--border2); border-radius: 10px; color: var(--text); font-family: 'Syne', sans-serif; font-size: 15px; outline: none; margin-bottom: 16px; }
  .field-input:focus { border-color: var(--accent); }
  
  textarea.field-input { min-height: 100px; resize: vertical; }

  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px 20px; margin-bottom: 16px; }
  
  .market-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
  .market-title { font-size: 18px; font-weight: 700; }
  .market-status { font-size: 11px; font-family: 'DM Mono', monospace; padding: 4px 8px; border-radius: 99px; background: rgba(255,255,255,0.1); }
  .market-status.open { color: var(--green); background: rgba(34,197,94,0.1); }
  .market-status.resolved { color: var(--amber); background: rgba(245,158,11,0.1); }
  
  .options-grid { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; border-top: 1px solid var(--border); padding-top: 16px; }
  .option-row { display: flex; justify-content: space-between; align-items: center; background: var(--surface2); padding: 12px 16px; border-radius: 10px; border: 1px solid transparent; }
  .option-row.winner { border-color: var(--amber); background: rgba(245,158,11,0.1); }
  .option-title { font-weight: 500; font-size: 15px; }
  .option-stats { font-family: 'DM Mono', monospace; font-size: 12px; color: var(--muted); }
  
  .bet-controls { display: flex; gap: 8px; align-items: center; }
  .bet-input { width: 80px; padding: 8px; background: var(--bg); border: 1px solid var(--border2); border-radius: 6px; color: var(--text); font-family: 'DM Mono', monospace; }

  .nav-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
  .nav-tab { padding: 8px 16px; border-radius: 99px; font-size: 14px; font-weight: 500; cursor: pointer; background: transparent; color: var(--muted); border: 1px solid transparent; }
  .nav-tab.active { background: var(--surface); color: var(--text); border-color: var(--border); }

  .access-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; }
  .access-screen h1 { font-size: 48px; margin-bottom: 12px; }
  .access-screen p { color: var(--muted); margin-bottom: 32px; }

  .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--surface2); border: 1px solid var(--border2); border-radius: 999px; padding: 10px 20px; font-size: 13px; z-index: 200; }
  .toast.success { border-color: var(--green); color: var(--green); }
  .toast.error { border-color: var(--red); color: var(--red); }
  
  .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; background: var(--surface2); margin-left: 8px; font-family: 'DM Mono'; }
`;

export default function App() {
  const [accessGranted, setAccessGranted] = useState(localStorage.getItem("site_access") === "granted");
  const [accessCode, setAccessCode] = useState("");

  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [activeTab, setActiveTab] = useState("markets"); // markets, admin
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  
  const [markets, setMarkets] = useState([]);
  const [options, setOptions] = useState([]);
  const [bets, setBets] = useState([]);
  const [expandedMarket, setExpandedMarket] = useState(null);
  
  const [betAmounts, setBetAmounts] = useState({});
  const [toast, setToast] = useState(null);
  
  // Admin form state
  const [newMarketTitle, setNewMarketTitle] = useState("");
  const [newOptionsText, setNewOptionsText] = useState("");
  const [profiles, setProfiles] = useState([]);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const fetchData = useCallback(async () => {
    const [mRes, oRes, bRes] = await Promise.all([
      supabase.from("markets").select("*").order("id", { ascending: false }),
      supabase.from("options").select("*"),
      supabase.from("bets").select("*")
    ]);
    if (mRes.data) setMarkets(mRes.data);
    if (oRes.data) setOptions(oRes.data);
    if (bRes.data) setBets(bRes.data);
    
    if (session) {
      const pRes = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (pRes.data) setUserProfile(pRes.data);
    }
    
    if (adminAuthed) {
      const allPRes = await supabase.from("profiles").select("*");
      if (allPRes.data) setProfiles(allPRes.data);
    }
  }, [session, adminAuthed]);

  useEffect(() => {
    if (accessGranted) fetchData();
  }, [accessGranted, fetchData]);

  function handleAccess() {
    if (accessCode === ADMIN_PASSWORD) {
      localStorage.setItem("site_access", "granted");
      setAccessGranted(true);
    } else {
      showToast("Incorrect access code", "error");
    }
  }

  async function handleAuth(e) {
    e.preventDefault();
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        showToast("Signed up successfully! You are logged in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showToast("Logged in!");
      }
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserProfile(null);
    setAdminAuthed(false);
  }

  function handleAdminLogin() {
    if (adminPw === ADMIN_PASSWORD) {
      setAdminAuthed(true);
      setAdminPw("");
      fetchData();
    } else {
      showToast("Incorrect admin password", "error");
    }
  }

  async function placeBet(optionId, marketId) {
    if (!userProfile) return showToast("Must be logged in", "error");
    const amount = Number(betAmounts[optionId] || 10);
    if (amount <= 0) return showToast("Invalid amount", "error");
    if (amount > userProfile.balance) return showToast("Insufficient balance", "error");

    const { error: betErr } = await supabase.from("bets").insert({
      user_id: userProfile.id,
      market_id: marketId,
      option_id: optionId,
      amount
    });
    
    if (betErr) return showToast(betErr.message, "error");

    const { error: profErr } = await supabase.from("profiles")
      .update({ balance: userProfile.balance - amount })
      .eq("id", userProfile.id);

    if (profErr) return showToast(profErr.message, "error");

    showToast(`Successfully bet $${amount}`);
    setBetAmounts(prev => ({ ...prev, [optionId]: "" }));
    fetchData();
  }

  // --- ADMIN FUNCTIONS ---
  async function createMarket() {
    if (!newMarketTitle) return;
    const { data, error } = await supabase.from("markets").insert({ title: newMarketTitle }).select().single();
    if (error) return showToast(error.message, "error");
    
    if (newOptionsText.trim()) {
      const opts = newOptionsText.split(/\n|,/).map(s => s.trim()).filter(s => s.length > 0);
      const optInserts = opts.map(o => ({ market_id: data.id, title: o }));
      await supabase.from("options").insert(optInserts);
    }
    
    setNewMarketTitle("");
    setNewOptionsText("");
    showToast("Market created");
    fetchData();
  }

  async function updateBalance(userId, newBalance) {
    const { error } = await supabase.from("profiles").update({ balance: Number(newBalance) }).eq("id", userId);
    if (error) return showToast(error.message, "error");
    showToast("Balance updated");
    fetchData();
  }

  async function resolveMarket(market, winningOptionId) {
    if (!confirm("Are you sure you want to resolve this market? This will distribute payouts.")) return;
    
    // Calculate payouts
    const marketBets = bets.filter(b => b.market_id === market.id);
    const totalPool = marketBets.reduce((sum, b) => sum + Number(b.amount), 0);
    const winningBets = marketBets.filter(b => b.option_id === winningOptionId);
    const winningPool = winningBets.reduce((sum, b) => sum + Number(b.amount), 0);
    
    // Distribute payouts
    if (winningPool > 0) {
      for (const bet of winningBets) {
        const user = profiles.find(p => p.id === bet.user_id);
        if (user) {
          const payout = (Number(bet.amount) / winningPool) * totalPool;
          await supabase.from("profiles").update({ balance: Number(user.balance) + payout }).eq("id", user.id);
        }
      }
    }
    
    // Mark resolved
    await supabase.from("markets").update({ status: 'resolved', resolved_option_id: winningOptionId }).eq("id", market.id);
    showToast("Market resolved & payouts distributed");
    fetchData();
  }

  // Calculate Option Pools & Total Pools
  const optionPools = {};
  const marketPools = {};
  bets.forEach(b => {
    optionPools[b.option_id] = (optionPools[b.option_id] || 0) + Number(b.amount);
    marketPools[b.market_id] = (marketPools[b.market_id] || 0) + Number(b.amount);
  });

  if (!accessGranted) {
    return (
      <div className="access-screen">
        <style>{css}</style>
        <h1>Coming Soon</h1>
        <p>BTHS Predictions Platform</p>
        <div style={{ maxWidth: 300, width: "100%" }}>
          <input 
            type="password" 
            className="field-input" 
            placeholder="Access Code"
            value={accessCode}
            onChange={e => setAccessCode(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAccess()}
          />
          <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleAccess}>Enter</button>
        </div>
        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    );
  }

  if (!session) {
    return (
      <div className="app" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
        <style>{css}</style>
        <div style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
          <div className="logo" style={{ marginBottom: 32, textAlign: 'center' }}>BTHS <span>Predictions</span></div>
          <form onSubmit={handleAuth} className="card">
            <h2 style={{ marginBottom: 16 }}>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
            <label className="field-label">Email</label>
            <input type="email" required className="field-input" value={email} onChange={e => setEmail(e.target.value)} />
            <label className="field-label">Password</label>
            <input type="password" required className="field-input" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginBottom: 12 }}>
              {isSignUp ? "Sign Up" : "Log In"}
            </button>
            <div style={{ textAlign: 'center', fontSize: 13, color: '#888' }}>
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <span style={{ color: '#a78bfa', cursor: 'pointer' }} onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? "Log In" : "Sign Up"}
              </span>
            </div>
          </form>
        </div>
        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div>
            <div className="logo">BTHS <span>Predictions</span></div>
            <div className="subtitle">Balance: ${userProfile?.balance?.toFixed(2) || 0}</div>
          </div>
          <button className="btn btn-secondary" onClick={handleLogout}>Log Out</button>
        </div>

        <div className="nav-tabs">
          <button className={`nav-tab ${activeTab === 'markets' ? 'active' : ''}`} onClick={() => setActiveTab('markets')}>Markets</button>
          <button className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>Admin</button>
        </div>

        {activeTab === 'markets' && (
          <div>
            {markets.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No markets available right now.</div>
            ) : (
              markets.map(market => {
                const isExpanded = expandedMarket === market.id;
                const mOptions = options.filter(o => o.market_id === market.id);
                const mTotalPool = marketPools[market.id] || 0;

                return (
                  <div key={market.id} className="card">
                    <div className="market-header" onClick={() => setExpandedMarket(isExpanded ? null : market.id)}>
                      <div>
                        <div className="market-title">{market.title}</div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                          Vol: ${mTotalPool.toFixed(0)} · {mOptions.length} Options
                        </div>
                      </div>
                      <div className={`market-status ${market.status}`}>{market.status.toUpperCase()}</div>
                    </div>
                    
                    {isExpanded && (
                      <div className="options-grid">
                        {mOptions.map(opt => {
                          const oPool = optionPools[opt.id] || 0;
                          const percent = mTotalPool > 0 ? ((oPool / mTotalPool) * 100).toFixed(0) : 0;
                          const isWinner = market.resolved_option_id === opt.id;
                          
                          return (
                            <div key={opt.id} className={`option-row ${isWinner ? 'winner' : ''}`}>
                              <div>
                                <div className="option-title">{opt.title} {isWinner && "🏆"}</div>
                                <div className="option-stats">${oPool.toFixed(0)} pool ({percent}%)</div>
                              </div>
                              {market.status === 'open' && (
                                <div className="bet-controls">
                                  <input 
                                    type="number" 
                                    className="bet-input" 
                                    placeholder="$" 
                                    value={betAmounts[opt.id] || ""}
                                    onChange={e => setBetAmounts({...betAmounts, [opt.id]: e.target.value})}
                                  />
                                  <button className="btn btn-success" onClick={() => placeBet(opt.id, market.id)}>Bet</button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <div>
            {!adminAuthed ? (
              <div className="card" style={{ maxWidth: 400, margin: '40px auto' }}>
                <h3 style={{ marginBottom: 16 }}>Admin Access</h3>
                <input 
                  type="password" 
                  className="field-input" 
                  placeholder="Admin Password"
                  value={adminPw}
                  onChange={e => setAdminPw(e.target.value)}
                />
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAdminLogin}>Unlock</button>
              </div>
            ) : (
              <div>
                <div className="card">
                  <h3 style={{ marginBottom: 16 }}>Create New Market</h3>
                  <label className="field-label">Market Question / Title</label>
                  <input className="field-input" value={newMarketTitle} onChange={e => setNewMarketTitle(e.target.value)} placeholder="e.g. Who will win?" />
                  
                  <label className="field-label">Options (comma or newline separated)</label>
                  <textarea className="field-input" value={newOptionsText} onChange={e => setNewOptionsText(e.target.value)} placeholder="Yes, No, Maybe..." />
                  
                  <button className="btn btn-primary" onClick={createMarket}>Create Market</button>
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: 16 }}>Manage Markets & Resolutions</h3>
                  {markets.filter(m => m.status === 'open').map(market => (
                    <div key={market.id} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #333' }}>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>{market.title}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {options.filter(o => o.market_id === market.id).map(opt => (
                          <button key={opt.id} className="btn btn-secondary" onClick={() => resolveMarket(market, opt.id)}>
                            Set "{opt.title}" as Winner
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {markets.filter(m => m.status === 'open').length === 0 && <div style={{color: '#888'}}>No open markets to resolve.</div>}
                </div>

                <div className="card">
                  <h3 style={{ marginBottom: 16 }}>Manage Users</h3>
                  {profiles.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 14 }}>{p.email}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>
                          Bets placed: {bets.filter(b => b.user_id === p.id).length}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input 
                          type="number" 
                          className="bet-input" 
                          defaultValue={p.balance} 
                          onBlur={e => updateBalance(p.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="card">
                  <h3 style={{ marginBottom: 16 }}>Ledger / Recent Bets</h3>
                  <div style={{ maxHeight: 300, overflowY: 'auto', fontSize: 13 }}>
                    {bets.slice().reverse().map(b => {
                      const user = profiles.find(p => p.id === b.user_id)?.email || 'Unknown';
                      const market = markets.find(m => m.id === b.market_id)?.title || 'Unknown';
                      const opt = options.find(o => o.id === b.option_id)?.title || 'Unknown';
                      return (
                        <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #222' }}>
                          <span><strong>{user}</strong> bet ${b.amount} on "{opt}"</span>
                          <span style={{ color: '#888' }}>{market}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}

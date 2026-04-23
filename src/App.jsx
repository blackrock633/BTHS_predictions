import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://rczqlzkfdhotymrivweb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjenFsemtmZGhvdHltcml2d2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MjYwMjgsImV4cCI6MjA5MjMwMjAyOH0.LHDTf8SasGRLGH1A9Pw6ItQILJCQzDaf67k8G0uxo98";
const VENMO_HANDLE = "YOUR_VENMO_HANDLE"; // Update this!
const ADMIN_PASSWORD = "noah633"; // Based on previous session passcode
const MIN_BET = 1;
const MAX_BET = 50;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── STYLES ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0a;
    --surface: #141414;
    --surface2: #1e1e1e;
    --border: rgba(255,255,255,0.08);
    --border2: rgba(255,255,255,0.15);
    --text: #f0f0f0;
    --muted: #888;
    --green: #22c55e;
    --green-bg: rgba(34,197,94,0.12);
    --red: #ef4444;
    --red-bg: rgba(239,68,68,0.12);
    --amber: #f59e0b;
    --blue: #3b82f6;
    --blue-bg: rgba(59,130,246,0.12);
    --accent: #a78bfa;
    --accent-bg: rgba(167,139,250,0.12);
  }

  body { background: var(--bg); color: var(--text); font-family: 'Syne', sans-serif; }

  .app { min-height: 100vh; max-width: 900px; margin: 0 auto; padding: 0 16px 80px; }

  .header {
    padding: 32px 0 24px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 28px;
  }
  .header-top { display: flex; align-items: center; justify-content: space-between; }
  .logo { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
  .logo span { color: var(--accent); }
  .subtitle { font-size: 13px; color: var(--muted); margin-top: 4px; font-family: 'DM Mono', monospace; }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 28px;
  }
  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 16px;
  }
  .stat-label { font-size: 11px; color: var(--muted); font-family: 'DM Mono', monospace; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
  .stat-value { font-size: 22px; font-weight: 700; }
  .stat-value.green { color: var(--green); }
  .stat-value.amber { color: var(--amber); }

  .section-title { font-size: 11px; color: var(--muted); font-family: 'DM Mono', monospace; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; }

  .markets { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }

  .market-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 18px 20px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 16px;
    align-items: center;
    transition: border-color 0.15s;
    cursor: default;
  }
  .market-card:hover { border-color: var(--border2); }
  .market-card.eliminated {
    opacity: 0.45;
    pointer-events: none;
  }
  .market-card.winner {
    border-color: var(--amber);
    background: rgba(245,158,11,0.05);
  }

  .player-info { display: flex; align-items: center; gap: 14px; }
  .avatar {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 14px;
    flex-shrink: 0;
  }
  .player-name { font-size: 16px; font-weight: 500; }
  .player-meta { font-size: 12px; color: var(--muted); font-family: 'DM Mono', monospace; margin-top: 2px; }

  .badge {
    display: inline-flex; align-items: center;
    font-size: 10px; font-family: 'DM Mono', monospace;
    padding: 3px 8px; border-radius: 999px; font-weight: 500;
    letter-spacing: 0.03em;
  }
  .badge.eliminated { background: rgba(239,68,68,0.15); color: var(--red); }
  .badge.winner { background: rgba(245,158,11,0.15); color: var(--amber); }
  .badge.alive { background: rgba(34,197,94,0.12); color: var(--green); }

  .market-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }

  .prob-display { text-align: right; }
  .prob-value { font-size: 28px; font-weight: 700; font-family: 'DM Mono', monospace; line-height: 1; }
  .prob-value.high { color: var(--green); }
  .prob-value.mid { color: var(--amber); }
  .prob-value.low { color: var(--muted); }
  .prob-label { font-size: 11px; color: var(--muted); font-family: 'DM Mono', monospace; margin-top: 2px; }

  .bet-row { display: flex; align-items: center; gap: 8px; }

  .bet-input {
    width: 72px; padding: 7px 10px;
    background: var(--surface2); border: 1px solid var(--border2);
    border-radius: 8px; color: var(--text);
    font-family: 'DM Mono', monospace; font-size: 14px;
    outline: none;
  }
  .bet-input:focus { border-color: var(--accent); }

  .btn {
    padding: 8px 16px; border-radius: 8px; border: none;
    font-family: 'Syne', sans-serif; font-weight: 500; font-size: 13px;
    cursor: pointer; transition: opacity 0.15s, transform 0.1s;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .btn:hover { opacity: 0.85; }
  .btn:active { transform: scale(0.97); }
  .btn-yes { background: var(--green); color: #000; }
  .btn-no { background: var(--red-bg); color: var(--red); border: 1px solid rgba(239,68,68,0.25); }
  .btn-admin { background: var(--accent-bg); color: var(--accent); border: 1px solid rgba(167,139,250,0.25); font-size: 12px; padding: 7px 14px; }
  .btn-danger { background: var(--red); color: #fff; }
  .btn-success { background: var(--green); color: #000; }
  .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border2); }
  .btn-small { padding: 5px 10px; font-size: 12px; }

  .prob-bar-wrap { height: 3px; background: var(--border); border-radius: 99px; overflow: hidden; width: 100%; margin-top: 4px; }
  .prob-bar { height: 100%; border-radius: 99px; transition: width 0.4s; }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; padding: 20px;
  }
  .modal {
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: 20px; padding: 28px; width: 100%; max-width: 440px;
  }
  .modal-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
  .modal-sub { font-size: 13px; color: var(--muted); margin-bottom: 24px; }

  .field-label { font-size: 12px; color: var(--muted); font-family: 'DM Mono', monospace; margin-bottom: 6px; }
  .field-input {
    width: 100%; padding: 10px 14px;
    background: var(--surface2); border: 1px solid var(--border2);
    border-radius: 10px; color: var(--text); font-family: 'Syne', sans-serif; font-size: 15px;
    outline: none; margin-bottom: 16px;
  }
  .field-input:focus { border-color: var(--accent); }

  .modal-btns { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }

  /* Venmo confirm */
  .venmo-box {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 12px; padding: 16px; margin: 16px 0;
    font-family: 'DM Mono', monospace; font-size: 13px; line-height: 1.8;
  }
  .venmo-row { display: flex; justify-content: space-between; }
  .venmo-key { color: var(--muted); }
  .venmo-val { color: var(--text); font-weight: 500; }
  .venmo-total { border-top: 1px solid var(--border); margin-top: 10px; padding-top: 10px; }
  .venmo-total .venmo-val { color: var(--green); font-size: 16px; }

  .info-box {
    background: var(--blue-bg); border: 1px solid rgba(59,130,246,0.2);
    border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;
    font-size: 13px; color: #93c5fd; line-height: 1.6;
  }
  .warning-box {
    background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2);
    border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;
    font-size: 13px; color: var(--amber); line-height: 1.6;
  }

  /* Admin panel */
  .admin-section {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 22px; margin-top: 32px;
  }
  .admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .admin-title { font-size: 15px; font-weight: 700; }
  .admin-grid { display: flex; flex-direction: column; gap: 8px; }
  .admin-player-row {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--surface2); border-radius: 10px; padding: 12px 14px;
  }
  .admin-player-name { font-size: 14px; font-weight: 500; }
  .admin-player-status { font-size: 12px; color: var(--muted); font-family: 'DM Mono', monospace; }
  .admin-actions { display: flex; gap: 8px; }

  .add-player-form { display: flex; gap: 8px; margin-bottom: 16px; }
  .add-player-form input { flex: 1; }

  .tab-row { display: flex; gap: 2px; background: var(--surface2); border-radius: 10px; padding: 3px; margin-bottom: 20px; }
  .tab { flex: 1; padding: 8px; text-align: center; font-size: 13px; border-radius: 8px; cursor: pointer; transition: background 0.15s; color: var(--muted); }
  .tab.active { background: var(--surface); color: var(--text); font-weight: 500; }

  .empty-state { text-align: center; padding: 48px 20px; color: var(--muted); font-size: 14px; }

  .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: var(--surface2); border: 1px solid var(--border2);
    border-radius: 999px; padding: 10px 20px; font-size: 13px;
    z-index: 200; animation: fadeup 0.2s ease;
    white-space: nowrap;
  }
  .toast.success { border-color: var(--green); color: var(--green); }
  .toast.error { border-color: var(--red); color: var(--red); }
  @keyframes fadeup { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
`;

// ─── AVATAR COLORS ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "rgba(167,139,250,0.2)", color: "#a78bfa" },
  { bg: "rgba(34,197,94,0.2)", color: "#22c55e" },
  { bg: "rgba(59,130,246,0.2)", color: "#3b82f6" },
  { bg: "rgba(245,158,11,0.2)", color: "#f59e0b" },
  { bg: "rgba(239,68,68,0.2)", color: "#ef4444" },
  { bg: "rgba(20,184,166,0.2)", color: "#14b8a6" },
  { bg: "rgba(249,115,22,0.2)", color: "#f97316" },
  { bg: "rgba(236,72,153,0.2)", color: "#ec4899" },
];

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function probClass(p) {
  if (p >= 40) return "high";
  if (p >= 20) return "mid";
  return "low";
}

function probBarColor(p) {
  if (p >= 40) return "#22c55e";
  if (p >= 20) return "#f59e0b";
  return "#888";
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("market"); // "market" | "admin"
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPwInput, setAdminPwInput] = useState("");
  const [betAmounts, setBetAmounts] = useState({});
  const [betModal, setBetModal] = useState(null); // { player, type: "YES"|"NO", amount }
  const [toast, setToast] = useState(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [addingPlayer, setAddingPlayer] = useState(false);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchPlayers = useCallback(async () => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) { showToast("Failed to load players", "error"); return; }
    setPlayers(data || []);
    setLoading(false);
  }, [showToast]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  // Compute implied probabilities from bet_pool_yes / bet_pool_no
  const alivePlayers = players.filter(p => p.status === "alive");
  const totalPool = alivePlayers.reduce((s, p) => s + (p.bet_pool_yes || 0), 0);

  function getProb(player) {
    if (player.status !== "alive") return 0;
    if (totalPool === 0) return Math.round(100 / Math.max(alivePlayers.length, 1));
    return Math.round(((player.bet_pool_yes || 0) / totalPool) * 100);
  }

  // ── Bet flow ──
  function openBetModal(player, type) {
    const amount = betAmounts[player.id] || MIN_BET;
    setBetModal({ player, type, amount });
  }

  function confirmBet() {
    if (!betModal) return;
    const { player, type, amount } = betModal;
    const note = encodeURIComponent(
      `ASSASSIN BET: ${type} on ${player.name} winning | $${amount}`
    );
    const venmoUrl = `https://venmo.com/${VENMO_HANDLE}?txn=pay&amount=${amount}&note=${note}`;

    // Optimistically update the pool in Supabase
    const col = type === "YES" ? "bet_pool_yes" : "bet_pool_no";
    supabase
      .from("players")
      .update({ [col]: (player[col] || 0) + Number(amount) })
      .eq("id", player.id)
      .then(() => fetchPlayers());

    // Open Venmo
    window.open(venmoUrl, "_blank");
    setBetModal(null);
    showToast(`Opening Venmo for $${amount} ${type} bet on ${player.name}!`);
  }

  // ── Admin actions ──
  function handleAdminLogin() {
    if (adminPwInput === ADMIN_PASSWORD) {
      setAdminAuthed(true);
      setAdminPwInput("");
    } else {
      showToast("Wrong password", "error");
    }
  }

  async function eliminatePlayer(player) {
    const { error } = await supabase
      .from("players")
      .update({ status: "eliminated" })
      .eq("id", player.id);
    if (error) { showToast("Error", "error"); return; }
    showToast(`${player.name} eliminated`);
    fetchPlayers();
  }

  async function markWinner(player) {
    // Set all others as eliminated too
    const { error } = await supabase.from("players").update({ status: "eliminated" }).neq("id", player.id);
    const { error: e2 } = await supabase.from("players").update({ status: "winner" }).eq("id", player.id);
    if (error || e2) { showToast("Error", "error"); return; }
    showToast(`${player.name} wins!`);
    fetchPlayers();
  }

  async function restorePlayer(player) {
    const { error } = await supabase.from("players").update({ status: "alive" }).eq("id", player.id);
    if (error) { showToast("Error", "error"); return; }
    fetchPlayers();
  }

  async function addPlayer() {
    const name = newPlayerName.trim();
    if (!name) return;
    setAddingPlayer(true);
    const { error } = await supabase.from("players").insert({
      name,
      status: "alive",
      bet_pool_yes: 0,
      bet_pool_no: 0,
    });
    if (error) { showToast("Error adding player", "error"); }
    else { showToast(`${name} added!`); setNewPlayerName(""); fetchPlayers(); }
    setAddingPlayer(false);
  }

  async function deletePlayer(player) {
    await supabase.from("players").delete().eq("id", player.id);
    fetchPlayers();
  }

  const winner = players.find(p => p.status === "winner");
  const eliminated = players.filter(p => p.status === "eliminated");
  const totalVolume = players.reduce((s, p) => s + (p.bet_pool_yes || 0) + (p.bet_pool_no || 0), 0);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="header">
          <div className="header-top">
            <div>
              <div className="logo">BTHS <span>Predictions</span></div>
              <div className="subtitle">class of 2025 · prediction market</div>
            </div>
            <button className="btn btn-admin" onClick={() => setTab(tab === "admin" ? "market" : "admin")}>
              {tab === "admin" ? "← back" : "admin"}
            </button>
          </div>
        </div>

        {tab === "market" && (
          <>
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Players alive</div>
                <div className="stat-value green">{alivePlayers.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Eliminated</div>
                <div className="stat-value" style={{ color: "#ef4444" }}>{eliminated.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total volume</div>
                <div className="stat-value amber">${totalVolume.toFixed(0)}</div>
              </div>
            </div>

            {winner && (
              <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontSize: 28 }}>🏆</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#f59e0b" }}>{winner.name} wins!</div>
                  <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Game over — {winner.name} is the last one standing</div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="empty-state"><div className="spinner" /></div>
            ) : players.length === 0 ? (
              <div className="empty-state">No players yet. Ask an admin to add players.</div>
            ) : (
              <>
                <div className="section-title">Markets — who wins?</div>
                <div className="markets">
                  {players.map((player, idx) => {
                    const prob = getProb(player);
                    const av = avatarColor(player.name);
                    const betAmt = betAmounts[player.id] || MIN_BET;
                    const isOut = player.status !== "alive";
                    return (
                      <div
                        key={player.id}
                        className={`market-card ${player.status === "eliminated" ? "eliminated" : ""} ${player.status === "winner" ? "winner" : ""}`}
                      >
                        <div className="player-info">
                          <div className="avatar" style={{ background: av.bg, color: av.color }}>
                            {initials(player.name)}
                          </div>
                          <div>
                            <div className="player-name">{player.name}</div>
                            <div className="player-meta">
                              <span className={`badge ${player.status}`}>{player.status}</span>
                              {!isOut && (
                                <span style={{ marginLeft: 8, color: "#555" }}>
                                  ${(player.bet_pool_yes || 0).toFixed(0)} vol
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {!isOut && (
                          <div className="market-right">
                            <div className="prob-display">
                              <div className={`prob-value ${probClass(prob)}`}>{prob}¢</div>
                              <div className="prob-label">to win</div>
                              <div className="prob-bar-wrap" style={{ width: 80 }}>
                                <div className="prob-bar" style={{ width: `${prob}%`, background: probBarColor(prob) }} />
                              </div>
                            </div>
                            <div className="bet-row">
                              <input
                                type="number"
                                className="bet-input"
                                min={MIN_BET}
                                max={MAX_BET}
                                step="1"
                                value={betAmt}
                                onChange={e => setBetAmounts(b => ({ ...b, [player.id]: Math.max(MIN_BET, Math.min(MAX_BET, Number(e.target.value))) }))}
                              />
                              <button className="btn btn-yes" onClick={() => openBetModal(player, "YES")}>YES</button>
                              <button className="btn btn-no" onClick={() => openBetModal(player, "NO")}>NO</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="info-box">
                  Prices reflect the crowd's probability that each player wins. YES = you think they'll win; NO = you think they'll lose. All bets are sent via Venmo — the organizer pays out winners when the game ends.
                </div>
              </>
            )}
          </>
        )}

        {tab === "admin" && (
          <div>
            {!adminAuthed ? (
              <div style={{ maxWidth: 340, margin: "60px auto" }}>
                <div className="modal-title" style={{ marginBottom: 6 }}>Admin access</div>
                <div className="modal-sub">Enter the admin password to manage the game.</div>
                <div className="field-label">Password</div>
                <input
                  type="password"
                  className="field-input"
                  value={adminPwInput}
                  onChange={e => setAdminPwInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
                  placeholder="••••••••"
                />
                <button className="btn btn-success" style={{ width: "100%" }} onClick={handleAdminLogin}>
                  Enter
                </button>
              </div>
            ) : (
              <div className="admin-section">
                <div className="admin-header">
                  <div className="admin-title">Game admin</div>
                  <button className="btn btn-secondary btn-small" onClick={() => setAdminAuthed(false)}>lock</button>
                </div>

                <div className="field-label">Add new player</div>
                <div className="add-player-form">
                  <input
                    className="field-input"
                    style={{ margin: 0 }}
                    placeholder="Full name"
                    value={newPlayerName}
                    onChange={e => setNewPlayerName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addPlayer()}
                  />
                  <button className="btn btn-success" onClick={addPlayer} disabled={addingPlayer}>
                    {addingPlayer ? <span className="spinner" /> : "Add"}
                  </button>
                </div>

                <div className="section-title" style={{ marginTop: 8 }}>All players</div>
                <div className="admin-grid">
                  {players.map(player => (
                    <div key={player.id} className="admin-player-row">
                      <div>
                        <div className="admin-player-name">{player.name}</div>
                        <div className="admin-player-status">
                          <span className={`badge ${player.status}`}>{player.status}</span>
                          <span style={{ marginLeft: 8, fontSize: 12, color: "#555" }}>
                            YES: ${(player.bet_pool_yes || 0).toFixed(0)} · NO: ${(player.bet_pool_no || 0).toFixed(0)}
                          </span>
                        </div>
                      </div>
                      <div className="admin-actions">
                        {player.status === "alive" && (
                          <>
                            <button className="btn btn-danger btn-small" onClick={() => eliminatePlayer(player)}>Eliminate</button>
                            <button className="btn btn-small" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }} onClick={() => markWinner(player)}>🏆 Winner</button>
                          </>
                        )}
                        {(player.status === "eliminated") && (
                          <button className="btn btn-secondary btn-small" onClick={() => restorePlayer(player)}>Restore</button>
                        )}
                        <button className="btn btn-small" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }} onClick={() => deletePlayer(player)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                {players.length === 0 && (
                  <div className="empty-state" style={{ padding: "24px 0" }}>No players yet — add some above.</div>
                )}

                <div className="warning-box" style={{ marginTop: 20, marginBottom: 0 }}>
                  Eliminating a player updates the market immediately. Mark a winner to end the game — this eliminates all remaining players and shows a winner banner.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bet confirmation modal */}
      {betModal && (
        <div className="modal-overlay" onClick={() => setBetModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              Confirm {betModal.type} bet — {betModal.player.name}
            </div>
            <div className="modal-sub">
              This will open Venmo to complete your payment.
            </div>

            <div className="venmo-box">
              <div className="venmo-row">
                <span className="venmo-key">Player</span>
                <span className="venmo-val">{betModal.player.name}</span>
              </div>
              <div className="venmo-row">
                <span className="venmo-key">Position</span>
                <span className="venmo-val" style={{ color: betModal.type === "YES" ? "#22c55e" : "#ef4444" }}>
                  {betModal.type === "YES" ? "YES — will win" : "NO — will not win"}
                </span>
              </div>
              <div className="venmo-row">
                <span className="venmo-key">Current odds</span>
                <span className="venmo-val">{getProb(betModal.player)}¢</span>
              </div>
              <div className="venmo-row venmo-total">
                <span className="venmo-key">You send</span>
                <span className="venmo-val">${betModal.amount}</span>
              </div>
            </div>

            <div className="info-box">
              Venmo memo will be pre-filled. After paying, your bet is recorded automatically. Payouts happen manually at game end.
            </div>

            <div className="modal-btns">
              <button className="btn btn-secondary" onClick={() => setBetModal(null)}>Cancel</button>
              <button className="btn btn-yes" onClick={confirmBet}>Open Venmo →</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>{toast.msg}</div>
      )}
    </>
  );
}

import { useEffect, useState } from "react";
import api from "../api/axios";
import StatCard from "../components/StatCard";
import TradeRow from "../components/TradeRow";
import "./Review.css";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const SESSIONS = ["All","London","New York","Tokyo","Sydney","Other"];

export default function Review() {
  const thisYear = new Date().getFullYear();

  const [year,    setYear]    = useState(String(thisYear));
  const [month,   setMonth]   = useState("");           // "" = whole year
  const [session, setSession] = useState("All");
  const [type,    setType]    = useState("all");

  const [trades,  setTrades]  = useState([]);
  const [stats,   setStats]   = useState(null);
  const [active,  setActive]  = useState(null);        // selected trade for image view
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const params = { year };
      if (month)              params.month   = String(MONTHS.indexOf(month) + 1);
      if (session !== "All")  params.session = session;
      if (type    !== "all")  params.type    = type;

      const { data } = await api.get("/trades/review", { params });
      setTrades(data.trades);
      setStats(data.stats);
      setActive(data.trades.find(t => t.pic) || null);
    } catch { setError("Failed to load review data."); }
    finally   { setLoading(false); }
  };

  useEffect(() => { load(); }, [year, month, session, type]);

  const pnlPos = (stats?.totalPnL || 0) >= 0;

  return (
    <div className="review-page">
      <div className="page-header">
        <h1>Review</h1>
        <p>Analyse trades by period, session, and type</p>
      </div>

      {/* Filters */}
      <div className="review-filters">
        {/* Year */}
        <select value={year} onChange={e => setYear(e.target.value)} className="filter-select">
          {[thisYear, thisYear-1, thisYear-2].map(y => <option key={y}>{y}</option>)}
        </select>

        {/* Month pills */}
        <div className="month-pills">
          <button className={`pill ${month === "" ? "active" : ""}`} onClick={() => setMonth("")}>All</button>
          {MONTHS.map(m => (
            <button key={m} className={`pill ${month === m ? "active" : ""}`} onClick={() => setMonth(m)}>{m}</button>
          ))}
        </div>

        {/* Session & type */}
        <div className="filter-row">
          <select value={session} onChange={e => setSession(e.target.value)} className="filter-select">
            {SESSIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={type} onChange={e => setType(e.target.value)} className="filter-select">
            <option value="all">All types</option>
            <option value="backtest">Backtest</option>
            <option value="realtime">Real-time</option>
          </select>
        </div>
      </div>

      {error   && <div className="err-box">{error}</div>}
      {loading && <div className="loading">Loading…</div>}

      {!loading && !error && (
        <>
          {/* Stats row */}
          {stats && (
            <div className="stats-grid" style={{ marginBottom: "1.25rem" }}>
              <StatCard label="Trades"   value={stats.total} />
              <StatCard label="Win rate" value={stats.total > 0 ? `${stats.winRate}%` : "—"} type={stats.winRate >= 50 ? "pos" : stats.total > 0 ? "neg" : ""} />
              <StatCard label="P&L"      value={stats.total > 0 ? `${pnlPos ? "+" : ""}$${Math.abs(stats.totalPnL).toFixed(2)}` : "—"} type={pnlPos ? "pos" : "neg"} />
              <StatCard label="Avg P&L"  value={stats.total > 0 ? `${stats.avgPnL >= 0 ? "+" : ""}$${Math.abs(stats.avgPnL).toFixed(2)}` : "—"} type={stats.avgPnL >= 0 ? "pos" : "neg"} />
              <StatCard label="Wins"    value={stats.wins}   type="pos" />
              <StatCard label="Losses"  value={stats.losses} type="neg" />
              <StatCard label="Best"    value={stats.total > 0 ? `+$${stats.bestTrade.toFixed(2)}`  : "—"} type="pos" />
              <StatCard label="Worst"   value={stats.total > 0 ? `-$${Math.abs(stats.worstTrade).toFixed(2)}` : "—"} type="neg" />
            </div>
          )}

          {trades.length === 0
            ? <div className="loading">No trades match the selected filters.</div>
            : (
              <div className="review-body">
                {/* Left: trade list */}
                <div className="review-list card">
                  <div className="section-lbl">{trades.length} trades</div>
                  {trades.map(t => (
                    <div
                      key={t._id}
                      className={`review-trade-item ${active?._id === t._id ? "selected" : ""}`}
                      onClick={() => t.pic && setActive(t)}
                    >
                      <TradeRow trade={t} compact />
                      {t.pic && <div className="has-img">📸 chart</div>}
                    </div>
                  ))}
                </div>

                {/* Right: image + notes panel */}
                <div className="review-panel">
                  {active?.pic ? (
                    <>
                      <div className="review-img-wrap">
                        <img src={active.pic} alt="chart" />
                      </div>
                      <div className="card review-detail">
                        <div className="rd-header">
                          <span className="tr-pair">{active.pair}</span>
                          <span className={`badge badge-${active.direction === "Buy" ? "buy" : "sell"}`}>{active.direction}</span>
                          <span className={`badge badge-${active.result === "Win" ? "win" : active.result === "Loss" ? "loss" : "be"}`}>{active.result}</span>
                          <span className={`rd-pnl ${(active.pnl||0) >= 0 ? "pos" : "neg"}`}>
                            {(active.pnl||0) >= 0 ? "+" : ""}${(active.pnl||0).toFixed(2)}
                          </span>
                        </div>
                        <div className="rd-grid">
                          <Kv k="Date"      v={new Date(active.date).toLocaleDateString()} />
                          <Kv k="Entry"     v={active.entry} />
                          <Kv k="Exit"      v={active.exit} />
                          <Kv k="Lot"       v={active.lot} />
                          <Kv k="SL"        v={active.sl || "—"} />
                          <Kv k="TP"        v={active.tp || "—"} />
                          <Kv k="Setup"     v={active.setup} />
                          <Kv k="Timeframe" v={active.timeframe} />
                          <Kv k="Session"   v={active.session} />
                          <Kv k="Emotion"   v={active.emotion} />
                          <Kv k="Type"      v={active.type} />
                          <Kv k="Entry time" v={active.entryTime || "—"} />
                          <Kv k="Exit time"  v={active.exitTime  || "—"} />
                        </div>
                        {active.notes && (
                          <div className="rd-notes">
                            <div className="section-lbl" style={{ marginBottom: 6 }}>Notes</div>
                            <p>{active.notes}</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="review-placeholder">
                      <div>📸</div>
                      <div>Click a trade with a chart image to view it here</div>
                    </div>
                  )}
                </div>
              </div>
            )
          }
        </>
      )}
    </div>
  );
}

// Key-value pair in detail panel
function Kv({ k, v }) {
  return (
    <div className="kv">
      <span className="kv-k">{k}</span>
      <span className="kv-v">{v}</span>
    </div>
  );
}

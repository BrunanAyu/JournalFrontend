import { useEffect, useState } from "react";
import api from "../api/axios";
import StatCard from "../components/StatCard";
import TradeRow from "../components/TradeRow";
import AccountWidget from "../components/AccountWidget"
import "./Dashboard.css";


export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [sRes, tRes] = await Promise.all([
        api.get("/trades/stats"),
        api.get("/trades"),
      ]);
      setStats(sRes.data);
      setRecent(tRes.data.filter(trade => trade.type !== "missed").slice(0, 5));
    } catch { setError("Failed to load data."); }
    finally   { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="loading">Loading…</div>;
  if (error)   return <div className="err-box">{error} <button className="btn btn-ghost" onClick={load}>Retry</button></div>;

  const { all, backtest, realtime } = stats || {};

  return (
    <div className="dash-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of all your trades</p>
      </div>
      <AccountWidget />
      {/* Overall stats */}
      <div className="section-lbl">Overall</div>
      <div className="stats-grid">
        <StatCard label="Total"    value={all?.total}    />
        <StatCard label="Win rate" value={all?.total > 0 ? `${all.winRate}%` : "—"} type={all?.winRate >= 50 ? "pos" : all?.total > 0 ? "neg" : ""} />
        <StatCard label="Total P&L" value={all?.total > 0 ? `${all.totalPnL >= 0 ? "+" : ""}$${Math.abs(all.totalPnL).toFixed(2)}` : "—"} type={all?.totalPnL >= 0 ? "pos" : "neg"} />
        <StatCard label="Avg P&L"  value={all?.total > 0 ? `${all.avgPnL >= 0 ? "+" : ""}$${Math.abs(all.avgPnL).toFixed(2)}`   : "—"} type={all?.avgPnL  >= 0 ? "pos" : "neg"} />
        <StatCard label="Wins"    value={all?.wins}    type="pos" />
        <StatCard label="Losses"  value={all?.losses}  type="neg" />
      </div>

      {/* Backtest vs Realtime side by side */}
      <div className="dash-split">
        <div className="card">
          <div className="section-lbl" style={{ color: "var(--accent)" }}>Backtest</div>
          <div className="stats-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <StatCard label="Trades"   value={backtest?.total} />
            <StatCard label="Win rate" value={backtest?.total > 0 ? `${backtest.winRate}%` : "—"} type={backtest?.winRate >= 50 ? "pos" : backtest?.total > 0 ? "neg" : ""} />
            <StatCard label="P&L"      value={backtest?.total > 0 ? `${backtest.totalPnL >= 0 ? "+" : ""}$${Math.abs(backtest?.totalPnL || 0).toFixed(2)}` : "—"} type={backtest?.totalPnL >= 0 ? "pos" : "neg"} />
          </div>
        </div>
        <div className="card">
          <div className="section-lbl" style={{ color: "var(--accent2)" }}>Real-time</div>
          <div className="stats-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <StatCard label="Trades"   value={realtime?.total} />
            <StatCard label="Win rate" value={realtime?.total > 0 ? `${realtime.winRate}%` : "—"} type={realtime?.winRate >= 50 ? "pos" : realtime?.total > 0 ? "neg" : ""} />
            <StatCard label="P&L"      value={realtime?.total > 0 ? `${realtime.totalPnL >= 0 ? "+" : ""}$${Math.abs(realtime?.totalPnL || 0).toFixed(2)}` : "—"} type={realtime?.totalPnL >= 0 ? "pos" : "neg"} />
          </div>
        </div>
      </div>

      {/* Recent trades */}
      <div className="card" style={{ marginTop: "1.25rem" }}>
        <div className="section-lbl">Recent trades</div>
        {recent.length === 0
          ? <div className="loading">No trades yet — go log your first one.</div>
          : recent.map(t => <TradeRow key={t._id} trade={t} compact />)
        }
      </div>
    </div>
  );
}

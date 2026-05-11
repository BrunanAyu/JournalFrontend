import { useEffect, useState } from "react";
import api from "../api/axios";
import TradeRow from "../components/TradeRow";
import "./History.css";

export default function History() {
  const [trades,  setTrades]  = useState([]);
  const [filter,  setFilter]  = useState("all"); // all | backtest | realtime
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const params = filter !== "all" ? { type: filter } : {};
      const { data } = await api.get("/trades", { params });
      setTrades(data);
    } catch { setError("Failed to load trades."); }
    finally   { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trade?")) return;
    try {
      await api.delete(`/trades/${id}`);
      setTrades(prev => prev.filter(t => t._id !== id));
    } catch { alert("Delete failed."); }
  };

  return (
    <div className="hist-page">
      <div className="page-header">
        <h1>History</h1>
        <p>All logged trades</p>
      </div>

      {/* Filter tabs */}
      <div className="hist-tabs">
        {[["all","All"],["backtest","Backtest"],["realtime","Real-time"]].map(([v,l]) => (
          <button key={v} className={`hist-tab ${filter === v ? "active" : ""}`} onClick={() => setFilter(v)}>
            {l}
          </button>
        ))}
        <span className="hist-count">{trades.length} trades</span>
      </div>

      {error   && <div className="err-box">{error} <button className="btn btn-ghost" onClick={load}>Retry</button></div>}
      {loading && <div className="loading">Loading…</div>}

      {!loading && !error && (
        <div className="card">
          {trades.length === 0
            ? <div className="loading">No trades found.</div>
            : trades.map(t => <TradeRow key={t._id} trade={t} onDelete={handleDelete} />)
          }
        </div>
      )}
    </div>
  );
}

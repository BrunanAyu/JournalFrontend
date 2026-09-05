import "./TradeRow.css";

export default function TradeRow({ trade: t, onDelete, onEdit, compact }) {
  const pnlPos = (t.pnl || 0) >= 0;
  const dateStr = t.date ? new Date(t.date).toLocaleDateString() : "";

  return (
    <div className={`trade-row ${compact ? "compact" : ""}`}>
      {/* Left: pair + meta */}
      <div className="tr-left">
        <div className="tr-top">
          <span className="tr-pair">{t.pair}</span>
          {t.direction && <span className={`badge badge-${t.direction === "Buy" ? "buy" : "sell"}`}>{t.direction}</span>}
          {t.result && <span className={`badge badge-${t.result === "Win" ? "win" : t.result === "Loss" ? "loss" : "be"}`}>{t.result}</span>}
          <span className={`badge badge-${t.type === "backtest" ? "bt" : t.type === "realtime" ? "rt" : "missed"}`}>{t.type}</span>
        </div>
        <div className="tr-meta">
          {dateStr} · {t.setup || "—"} · {t.timeframe || "—"} · {t.session || "—"} · {t.emotion || "—"}
          {t.notes && <span className="tr-notes"> · {t.notes}</span>}
        </div>
      </div>

      {/* Right: P&L + prices + delete */}
      <div className="tr-right">
        <div className={`tr-pnl ${pnlPos ? "pos" : "neg"}`}>
          {pnlPos ? "+" : ""}${(t.pnl || 0).toFixed(2)}
        </div>
        <div className="tr-prices">{t.type === "missed" ? "No prices" : `${t.entry} → ${t.exit}`}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          {onEdit && (
            <button className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => onEdit(t)}>
              Edit
            </button>
          )}
          {onDelete && (
            <button className="btn btn-danger" onClick={() => onDelete(t._id)}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import api from "../api/axios";
import "./updateModal.css";

const PAIRS      = ["EUR/USD","GBP/USD","USD/JPY","USD/CHF","AUD/USD","USD/CAD","NZD/USD","EUR/GBP","EUR/JPY","GBP/JPY"];
const SETUPS     = ["Breakout","Trend follow","Reversal","Support/Resistance","News trade","ICT","SMC","Other"];
const TIMEFRAMES = ["M1","M5","M15","M30","H1","H4","D1","W1"];
const EMOTIONS   = ["Calm","Confident","Anxious","Greedy","Fearful","Neutral","Disciplined"];
const SESSIONS   = ["London","New York","Tokyo","Sydney","Other"];

export default function UpdateModal({ trade, onClose, onUpdated }) {
  // Pre-fill form with existing trade data
  const [form, setForm] = useState({
    pair:      trade.pair,
    direction: trade.direction,
    entry:     trade.entry,
    exit:      trade.exit,
    entryTime: trade.entryTime || "",
    exitTime:  trade.exitTime  || "",
    lot:       trade.lot,
    sl:        trade.sl   || "",
    tp:        trade.tp   || "",
    setup:     trade.setup,
    timeframe: trade.timeframe,
    emotion:   trade.emotion,
    result:    trade.result,
    session:   trade.session || "London",
    pic:       trade.pic   || "",
    notes:     trade.notes || "",
    date:      trade.date ? new Date(trade.date).toISOString().slice(0,10) : "",
  });

  const [msg,  setMsg]  = useState({ text: "", type: "" });
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleUpdate = async () => {
    if (!form.entry || !form.exit || !form.lot) {
      setMsg({ text: "Entry, exit and lot size are required.", type: "err" }); return;
    }
    setBusy(true); setMsg({ text: "", type: "" });
    try {
      const { data } = await api.put(`/trades/${trade._id}`, {
        ...form,
        entry: parseFloat(form.entry),
        exit:  parseFloat(form.exit),
        lot:   parseFloat(form.lot),
        sl:    form.sl ? parseFloat(form.sl) : null,
        tp:    form.tp ? parseFloat(form.tp) : null,
      });
      setMsg({ text: "Trade updated!", type: "ok" });
      setTimeout(() => onUpdated(data), 600);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Update failed.", type: "err" });
    } finally { setBusy(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">Edit trade</div>
            <div className="modal-sub">{trade.pair} · {trade.type}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Basic info */}
          <div className="section-lbl">Basic info</div>
          <div className="form-grid">
            <Field label="Currency pair">
              <select value={form.pair} onChange={e => set("pair", e.target.value)}>
                {PAIRS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Direction">
              <select value={form.direction} onChange={e => set("direction", e.target.value)}>
                <option>Buy</option><option>Sell</option>
              </select>
            </Field>
            <Field label="Entry price">
              <input type="number" step="0.00001" value={form.entry} onChange={e => set("entry", e.target.value)} />
            </Field>
            <Field label="Exit price">
              <input type="number" step="0.00001" value={form.exit} onChange={e => set("exit", e.target.value)} />
            </Field>
            <Field label="Entry time">
              <input type="time" value={form.entryTime} onChange={e => set("entryTime", e.target.value)} />
            </Field>
            <Field label="Exit time">
              <input type="time" value={form.exitTime} onChange={e => set("exitTime", e.target.value)} />
            </Field>
            <Field label="Lot size">
              <input type="number" step="0.01" value={form.lot} onChange={e => set("lot", e.target.value)} />
            </Field>
            <Field label="Date">
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </Field>
            <Field label="Stop loss">
              <input type="number" step="0.00001" value={form.sl} onChange={e => set("sl", e.target.value)} />
            </Field>
            <Field label="Take profit">
              <input type="number" step="0.00001" value={form.tp} onChange={e => set("tp", e.target.value)} />
            </Field>
          </div>

          <hr className="divider" />

          {/* Detailed info */}
          <div className="section-lbl">Detailed info</div>
          <div className="form-grid">
            <Field label="Setup">
              <select value={form.setup} onChange={e => set("setup", e.target.value)}>
                {SETUPS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Timeframe">
              <select value={form.timeframe} onChange={e => set("timeframe", e.target.value)}>
                {TIMEFRAMES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Session">
              <select value={form.session} onChange={e => set("session", e.target.value)}>
                {SESSIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Emotion">
              <select value={form.emotion} onChange={e => set("emotion", e.target.value)}>
                {EMOTIONS.map(em => <option key={em}>{em}</option>)}
              </select>
            </Field>
            <Field label="Result">
              <select value={form.result} onChange={e => set("result", e.target.value)}>
                <option>Win</option><option>Loss</option><option>Break even</option>
              </select>
            </Field>
            <Field label="Chart image URL">
              <input placeholder="https://www.tradingview.com/x/..." value={form.pic} onChange={e => set("pic", e.target.value)} />
            </Field>
            <Field label="Notes" full>
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)} />
            </Field>
          </div>

          {/* Image preview */}
          {form.pic && (
            <div style={{ marginTop: "1rem", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)" }}>
              <img src={form.pic} alt="chart" style={{ width: "100%", maxHeight: 200, objectFit: "contain", background: "var(--bg3)", display: "block" }} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-accent" onClick={handleUpdate} disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          {msg.text && <span className={msg.type === "ok" ? "msg-ok" : "msg-err"}>{msg.text}</span>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div className={`form-group ${full ? "full" : ""}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../api/axios";
import "./LogTrade.css";

const PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "EUR/JPY", "GBP/JPY"];
const SETUPS = ["Breakout", "Trend follow", "Reversal", "Support/Resistance", "News trade", "ICT", "SMC", "Other"];
const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"];
const EMOTIONS = ["Calm", "Confident", "Anxious", "Greedy", "Fearful", "Neutral", "Disciplined"];
const SESSIONS = ["London", "New York", "Tokyo", "Sydney", "Other"];

const EMPTY = {
  pair: "EUR/USD", direction: "Buy", entry: "", exit: "",
  entryTime: "", exitTime: "", lot: "", sl: "", tp: "",
  setup: "ICT", timeframe: "M5", emotion: "Calm",
  result: "Win", session: "London", pic: "", notes: "",
  date: new Date().toISOString().slice(0, 10),
};

export default function LogTrade() {
  const [tradeType, setTradeType] = useState(null); // null = not chosen yet
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (tradeType !== "missed" && (!form.entry || !form.exit || !form.lot)) {
      setMsg({ text: "Entry, exit and lot size are required.", type: "err" }); return;
    }
    setBusy(true); setMsg({ text: "", type: "" });
    try {
      const payload = tradeType === "missed"
        ? { type: tradeType, pair: form.pair, direction: form.direction, timeframe: form.timeframe, session: form.session, pic: form.pic, notes: form.notes, date: form.date }
        : { ...form, type: tradeType, entry: parseFloat(form.entry), exit: parseFloat(form.exit), lot: parseFloat(form.lot), sl: form.sl ? parseFloat(form.sl) : null, tp: form.tp ? parseFloat(form.tp) : null };
      await api.post("/trades", payload);
      setMsg({ text: "Trade saved!", type: "ok" });
      setTimeout(() => navigate("/"), 700);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Save failed.", type: "err" });
    } finally { setBusy(false); }
  };

  // ── Step 1: choose type ──────────────────────────────────────────────────
  if (!tradeType) return (
    <div className="log-page">
      <div className="page-header">
        <h1>Log a trade</h1>
        <p>Choose the type of trade you want to log</p>
      </div>
      <div className="type-picker">
        <button className="type-card" onClick={() => setTradeType("backtest")}>
          <div className="type-icon bt">BT</div>
          <div className="type-label">Backtest</div>
          <div className="type-desc">Historical data replay — practice trades</div>
        </button>
        <button className="type-card" onClick={() => setTradeType("realtime")}>
          <div className="type-icon rt">RT</div>
          <div className="type-label">Real-time</div>
          <div className="type-desc">Live market trade — real money or demo</div>
        </button>
        <button className="type-card" onClick={() => setTradeType("missed")}>
          <div className="type-icon missed">MS</div>
          <div className="type-label">Missed trade</div>
          <div className="type-desc">Capture a setup you saw but did not take</div>
        </button>
      </div>
    </div>
  );

  // ── Step 2: the form ─────────────────────────────────────────────────────
  return (
    <div className="log-page">
      <div className="page-header" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button className="btn btn-ghost" style={{ padding: "6px 10px" }} onClick={() => setTradeType(null)}>← Back</button>
        <div>
          <h1>
            {tradeType === "backtest" ? "Backtest" : tradeType === "realtime" ? "Real-time" : "Missed"} trade
            <span className={`badge badge-${tradeType === "backtest" ? "bt" : tradeType === "realtime" ? "rt" : "missed"}`} style={{ marginLeft: 10, fontSize: 12 }}>{tradeType}</span>
          </h1>
          <p>Fill in all the details then save</p>
        </div>
      </div>

      {tradeType === "missed" ? (
        <div className="card">
          <div className="section-lbl">Missed trade details</div>
          <div className="form-grid">
            <Field label="Currency pair">
              <select value={form.pair} onChange={e => set("pair", e.target.value)}>{PAIRS.map(p => <option key={p}>{p}</option>)}</select>
            </Field>
            <Field label="Direction">
              <select value={form.direction} onChange={e => set("direction", e.target.value)}>
                <option>Buy</option><option>Sell</option>
              </select>
            </Field>
            <Field label="Timeframe">
              <select value={form.timeframe} onChange={e => set("timeframe", e.target.value)}>{TIMEFRAMES.map(t => <option key={t}>{t}</option>)}</select>
            </Field>
            <Field label="Session">
              <select value={form.session} onChange={e => set("session", e.target.value)}>{SESSIONS.map(s => <option key={s}>{s}</option>)}</select>
            </Field>
            <Field label="Date">
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </Field>
            <Field label="Image link">
              <input placeholder="https://..." value={form.pic} onChange={e => set("pic", e.target.value)} />
            </Field>
            <Field label="Description" full>
              <textarea placeholder="What setup did you miss?" value={form.notes} onChange={e => set("notes", e.target.value)} />
            </Field>
          </div>
          {form.pic && <div className="pic-preview"><img src={form.pic} alt="chart" onError={e => e.target.style.display = "none"} /></div>}
          <div style={{ display: "flex", gap: "10px", marginTop: "1.25rem", alignItems: "center" }}>
            <button className="btn btn-accent" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save missed trade"}</button>
            <button className="btn btn-ghost" onClick={() => setForm(EMPTY)}>Clear</button>
            {msg.text && <span className={msg.type === "ok" ? "msg-ok" : "msg-err"}>{msg.text}</span>}
          </div>
        </div>
      ) : <>
        {/* Basic info */}
        <div className="card" style={{ marginBottom: "1rem" }}>
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
              <input type="number" step="0.00001" placeholder="1.08500" value={form.entry} onChange={e => set("entry", e.target.value)} />
            </Field>
            <Field label="Exit price">
              <input type="number" step="0.00001" placeholder="1.09200" value={form.exit} onChange={e => set("exit", e.target.value)} />
            </Field>
            <Field label="Entry time">
              <input type="time" value={form.entryTime} onChange={e => set("entryTime", e.target.value)} />
            </Field>
            <Field label="Exit time">
              <input type="time" value={form.exitTime} onChange={e => set("exitTime", e.target.value)} />
            </Field>
            <Field label="Lot size">
              <input type="number" step="0.01" placeholder="0.10" value={form.lot} onChange={e => set("lot", e.target.value)} />
            </Field>
            <Field label="Date">
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            </Field>
            <Field label="Stop loss">
              <input type="number" step="0.00001" placeholder="1.08000" value={form.sl} onChange={e => set("sl", e.target.value)} />
            </Field>
            <Field label="Take profit">
              <input type="number" step="0.00001" placeholder="1.10000" value={form.tp} onChange={e => set("tp", e.target.value)} />
            </Field>
          </div>
        </div>

        {/* Detailed info */}
        <div className="card">
          <div className="section-lbl">Detailed info</div>
          <div className="form-grid">
            <Field label="Setup / strategy">
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
            <Field label="Chart image (TradingView URL)">
              <input placeholder="https://www.tradingview.com/x/..." value={form.pic} onChange={e => set("pic", e.target.value)} />
            </Field>
            <Field label="Notes" full>
              <textarea placeholder="Setup reasoning, mistakes, lessons learned…" value={form.notes} onChange={e => set("notes", e.target.value)} />
            </Field>
          </div>

          {/* Image preview */}
          {form.pic && (
            <div className="pic-preview">
              <img src={form.pic} alt="chart" onError={e => e.target.style.display = "none"} />
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "1.25rem", alignItems: "center" }}>
            <button className="btn btn-accent" onClick={save} disabled={busy}>
              {busy ? "Saving…" : "Save trade"}
            </button>
            <button className="btn btn-ghost" onClick={() => setForm(EMPTY)}>Clear</button>
            {msg.text && <span className={msg.type === "ok" ? "msg-ok" : "msg-err"}>{msg.text}</span>}
          </div>
        </div>
      </>}
    </div>
  );
}

// Reusable field wrapper
function Field({ label, children, full }) {
  return (
    <div className={`form-group ${full ? "full" : ""}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

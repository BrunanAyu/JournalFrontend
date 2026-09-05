import { useEffect, useState } from "react";
import api from "../api/axios";
import "./AccountWidget.css";

export default function AccountWidget() {
  const [account, setAccount] = useState(null);
  const [fetched,  setFetched]  = useState(false);
  const [mode, setMode] = useState(null); // null | setup | deposit | withdrawal
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get("/account");
      setAccount(data);
    } catch { }
    finally { setFetched(true); }
  };

  useEffect(() => { load(); }, []);

  const handle = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setMsg({ text: "Enter a valid amount.", type: "err" }); return;
    }
    setBusy(true); setMsg({ text: "", type: "" });
    try {
      const endpoint =
        mode === "setup" ? "/account/setup"
          : mode === "deposit" ? "/account/deposit"
            : "/account/withdrawal";

      const payload =
        mode === "setup"
          ? { balance: parseFloat(amount) }
          : { amount: parseFloat(amount), note };

      await api.post(endpoint, payload);
      setMsg({ text: "Done!", type: "ok" });
      setMode(null); setAmount(""); setNote("");
      load();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Error.", type: "err" });
    } finally { setBusy(false); }
  };

  // No balance set yet
  if (!fetched) return <div className="loading">Loading…</div>;
  if (account?.balance === null || account?.balance === undefined) return (
    <div className="aw-setup-prompt">
      <div className="aw-title">Set your account balance</div>
      <p>Enter your starting balance once. It will update automatically after each trade.</p>
      <button className="btn btn-accent" onClick={() => setMode("setup")}>Set balance</button>
      {mode === "setup" && <SetupForm amount={amount} note={note} setAmount={setAmount} setNote={setNote} handle={handle} busy={busy} msg={msg} />}
    </div>
  );

  const pnlTotal = account.history
    ?.filter(h => h.type === "trade")
    .reduce((s, h) => s + h.amount, 0) || 0;

  return (
    <div className="aw-card card">
      {/* Balance display */}
      <div className="aw-balance-row">
        <div>
          <div className="aw-label">Account balance</div>
          <div className="aw-balance">${account.balance?.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="aw-actions">
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setMode(mode === "deposit" ? null : "deposit")}>+ Deposit</button>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setMode(mode === "withdrawal" ? null : "withdrawal")}>- Withdraw</button>
        </div>
      </div>

      {/* Total trade P&L */}
      <div className={`aw-pnl ${pnlTotal >= 0 ? "pos" : "neg"}`}>
        Total trade P&L: {pnlTotal >= 0 ? "+" : ""}${pnlTotal.toFixed(2)}
      </div>

      {/* Deposit / Withdrawal form */}
      {(mode === "deposit" || mode === "withdrawal") && (
        <div className="aw-form">
          <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} />
          <input placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn btn-accent" onClick={handle} disabled={busy}>
              {busy ? "…" : mode === "deposit" ? "Deposit" : "Withdraw"}
            </button>
            <button className="btn btn-ghost" onClick={() => { setMode(null); setAmount(""); setMsg({ text: "", type: "" }); }}>Cancel</button>
            {msg.text && <span className={msg.type === "ok" ? "msg-ok" : "msg-err"}>{msg.text}</span>}
          </div>
        </div>
      )}

      {/* Balance history */}
      <div className="aw-history">
        <div className="section-lbl" style={{ marginBottom: 8 }}>Balance history</div>
        {account.history?.slice().reverse().slice(0, 5).map((h, i) => (
          <div key={i} className="aw-hist-row">
            <div>
              <span className={`aw-hist-type ${h.type}`}>{h.type}</span>
              <span className="aw-hist-note">{h.note}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className={h.amount >= 0 ? "pos" : "neg"}>
                {h.amount >= 0 ? "+" : ""}${Math.abs(h.amount).toFixed(2)}
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>${h.balance?.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SetupForm({ amount, note, setAmount, setNote, handle, busy, msg }) {
  return (
    <div className="aw-form" style={{ marginTop: "1rem" }}>
      <input type="number" placeholder="e.g. 10000" value={amount} onChange={e => setAmount(e.target.value)} />
      <button className="btn btn-accent" onClick={handle} disabled={busy}>
        {busy ? "Setting up…" : "Confirm balance"}
      </button>
      {msg.text && <span className={msg.type === "ok" ? "msg-ok" : "msg-err"}>{msg.text}</span>}
    </div>
  );
}
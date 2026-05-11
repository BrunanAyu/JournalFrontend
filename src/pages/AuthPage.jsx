import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../api/axios";
import "./Auth.css";

export default function AuthPage() {
  const [tab, setTab]   = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg]   = useState({ text: "", type: "" });
  const [busy, setBusy] = useState(false);
  const navigate        = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handle = async () => {
    setBusy(true);
    setMsg({ text: "", type: "" });
    try {
      const endpoint = tab === "login" ? "/auth/login" : "/auth/signup";
      const payload  = tab === "login"
        ? { email: form.email, password: form.password }
        : form;
      
      
      const { data } = await api.post(endpoint, payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Error. Try again.", type: "err" });
    } finally {
      setBusy(false);
      navigate("//auth/login");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-logo">FX</div>
          <div>
            <div className="auth-title">Trade Journal</div>
            <div className="auth-sub">Forex · Log · Analyse · Improve</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          {["login","signup"].map(t => (
            <button
              key={t}
              className={`auth-tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "login" ? "Login" : "Sign up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="auth-form">
          {tab === "signup" && (
            <div className="form-group">
              <label>Full name</label>
              <input placeholder="John Doe" value={form.name} onChange={e => set("name", e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)}
              onKeyDown={e => e.key === "Enter" && handle()} />
          </div>

          {msg.text && <div className={msg.type === "err" ? "msg-err" : "msg-ok"}>{msg.text}</div>}

          <button className="btn btn-accent" style={{ width: "100%", marginTop: "1rem" }} onClick={handle} disabled={busy}>
            {busy ? "Please wait…" : tab === "login" ? "Login" : "Create account"}
          </button>
        </div>

        <div className="auth-foot">
          {tab === "login"
            ? <>No account? <span onClick={() => setTab("signup")}>Sign up</span></>
            : <>Have an account? <span onClick={() => setTab("login")}>Login</span></>
          }
        </div>
      </div>
    </div>
  );
}

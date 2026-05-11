import { Link, useLocation, useNavigate } from "react-router";
import "./Navbar.css";

const LINKS = [
  { to: "/",        label: "Dashboard" },
  { to: "/log",     label: "Log Trade" },
  { to: "/history", label: "History"   },
  { to: "/review",  label: "Review"    },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate     = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <span className="nav-logo">FX</span>
        <span>Journal</span>
      </Link>

      <div className="nav-links">
        {LINKS.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`nav-link ${pathname === l.to ? "active" : ""}`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="nav-right">
        <span className="nav-user">{user.name || "Trader"}</span>
        <button className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

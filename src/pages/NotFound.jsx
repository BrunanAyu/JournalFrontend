import { Link } from "react-router";
import "./NotFound.css";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-box">
        <div className="not-found-code">404</div>
        <h1>Page not found</h1>
        <p>Your session may have expired, or this page does not exist.</p>
        <Link className="btn btn-accent" to="/login">Go to login</Link>
      </div>
    </main>
  );
}

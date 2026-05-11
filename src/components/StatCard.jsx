/* Renders a single stat tile */
export default function StatCard({ label, value, type = "" }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-val ${type}`}>{value ?? "—"}</div>
    </div>
  );
}

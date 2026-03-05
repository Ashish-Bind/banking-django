export default function Unauthorized() {
  return (
    <div style={{ textAlign: "center", padding: "100px" }}>
      <h1 style={{ fontSize: "72px", color: "#dc2626" }}>403</h1>
      <h2>Access Denied</h2>
      <p>You don't have permission to view this page.</p>
      <a href="/" style={{ color: "#14b8a6", fontWeight: "bold" }}>
        Go Back Home
      </a>
    </div>
  );
}
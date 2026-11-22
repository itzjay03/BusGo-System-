function AccessDenied({ go, account }) {
  return (
    <main className="container py-5 text-center">
      <i className="bi bi-shield-lock display-1 text-danger"></i>
      <h1 className="mt-3">Access Denied</h1>
      <p className="text-muted">You don't have permission to view this page.</p>
      <button
        className="btn btn-primary rounded-pill px-4"
        onClick={() => go(account?.role === "admin" ? "admin-dashboard" : "dashboard")}
      >
        Back to my dashboard
      </button>
    </main>
  );
}

export default AccessDenied;
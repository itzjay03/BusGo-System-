function NotFound({ go }) {
  return (
    <main className="container py-5 text-center">
      <h1 className="display-1 fw-bold">404</h1>
      <h2>Page not found</h2>
      <p className="text-muted">The page you're looking for doesn't exist.</p>
      <button className="btn btn-primary rounded-pill px-4" onClick={() => go("home")}>
        Go to Home
      </button>
    </main>
  );
}

export default NotFound;
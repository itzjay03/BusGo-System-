import { useEffect, useState } from "react";

function Profile({ account, onSave, go }) {
  const [form, setForm] = useState({ name: account?.name || "", email: account?.email || "" });
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [bookingPref, setBookingPref] = useState("Window seat");
  const [securityOpen, setSecurityOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [securitySaved, setSecuritySaved] = useState(false);

  useEffect(() => {
    setForm({ name: account?.name || "", email: account?.email || "" });
  }, [account]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...account, name: form.name.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const initial = (account?.name || "B").charAt(0).toUpperCase();
  const isAdmin = account?.role === "admin";

  return (
    <main className="page-content profile-page">
      <div className="container">
        <div className="profile-hero">
          <div>
            <span className="section-label">BUSGO ACCOUNT</span>
            <h1>Profile & settings</h1>
            <p>Manage your account details and BusGo travel preferences.</p>
          </div>
          <button className="btn btn-outline-secondary rounded-pill" onClick={() => go(isAdmin ? "admin-dashboard" : "dashboard")}>
            <i className="bi bi-arrow-left me-2"></i>Back to dashboard
          </button>
        </div>

        <div className="profile-layout">
          <aside className="profile-card profile-summary-card">
            <div className="profile-avatar-xl">{initial}</div>
            <span className="profile-role"><i className="bi bi-person-check me-1"></i>{isAdmin ? "Administrator" : "Passenger"}</span>
            <h3>{account?.name || "BusGo User"}</h3>
            <p>{account?.email || "No email available"}</p>

            <div className="profile-status-card">
              <div className="profile-status-icon"><i className="bi bi-shield-check"></i></div>
              <div><strong>Account active</strong><small>Your BusGo account is ready for reservations.</small></div>
            </div>

            <div className="profile-summary-links">
              <button type="button" onClick={() => go("my-trip")}><i className="bi bi-ticket-perforated"></i><span>My Trip</span><i className="bi bi-chevron-right"></i></button>
              <button type="button" onClick={() => go("bookings")}><i className="bi bi-calendar-check"></i><span>My Reservations</span><i className="bi bi-chevron-right"></i></button>
              <button type="button" onClick={() => go("notifications")}><i className="bi bi-bell"></i><span>Notifications</span><i className="bi bi-chevron-right"></i></button>
            </div>
          </aside>

          <div className="profile-main-stack">
            <form className="profile-card" onSubmit={submit}>
              <div className="profile-card-heading">
                <div><span>PERSONAL INFORMATION</span><h3>Account details</h3><p>These details are used across your BusGo reservations.</p></div>
                <i className="bi bi-person-vcard"></i>
              </div>

              {saved && <div className="profile-success"><i className="bi bi-check-circle-fill"></i><span>Profile updated successfully.</span></div>}

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Full name</label>
                  <input className="form-control form-control-lg" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email address</label>
                  <input className="form-control form-control-lg" value={form.email} disabled />
                </div>
              </div>

              <div className="profile-info-box mt-4"><i className="bi bi-info-circle-fill"></i><span>Your email is connected to your BusGo account and cannot be changed from this screen.</span></div>

              <div className="d-flex justify-content-end mt-4">
                <button className="btn btn-primary rounded-pill px-4"><i className="bi bi-check2 me-2"></i>Save changes</button>
              </div>
            </form>

            <section className="profile-card">
              <div className="profile-card-heading"><div><span>TRAVEL PREFERENCES</span><h3>Booking preferences</h3><p>Choose how you prefer to travel when making reservations.</p></div><i className="bi bi-sliders"></i></div>
              <div className="profile-setting-list">
                <div className="profile-setting-row">
                  <div className="profile-setting-icon"><i className="bi bi-bell"></i></div>
                  <div className="profile-setting-copy"><strong>Trip notifications</strong><small>Booking confirmations, travel reminders and reservation updates.</small></div>
                  <button type="button" className={`setting-switch ${notifications ? "on" : ""}`} onClick={() => setNotifications(!notifications)} aria-label="Toggle trip notifications"><span></span></button>
                </div>
                <div className="profile-setting-row">
                  <div className="profile-setting-icon"><i className="bi bi-grid-3x3-gap"></i></div>
                  <div className="profile-setting-copy"><strong>Preferred seat</strong><small>Use this as your preferred seat option during booking.</small></div>
                  <select className="form-select profile-preference-select" value={bookingPref} onChange={(e) => setBookingPref(e.target.value)}><option>Window seat</option><option>Aisle seat</option><option>Any seat</option></select>
                </div>
              </div>
            </section>

            <section className="profile-card">
              <div className="profile-card-heading"><div><span>SECURITY</span><h3>Account security</h3><p>Keep your BusGo account protected.</p></div><i className="bi bi-shield-lock"></i></div>
              {!securityOpen ? (
                <div className="security-summary-row"><div className="profile-setting-icon"><i className="bi bi-lock-fill"></i></div><div className="profile-setting-copy"><strong>Password protection</strong><small>Update your password whenever you need to improve account security.</small></div><button type="button" className="btn btn-outline-secondary rounded-pill" onClick={() => setSecurityOpen(true)}>Manage</button></div>
              ) : (
                <div className="security-editor">
                  <div className="d-flex justify-content-between align-items-start gap-3"><div><strong>Change password</strong><p>Use at least 8 characters.</p></div><button type="button" className="btn-close" onClick={() => setSecurityOpen(false)} aria-label="Close"></button></div>
                  <div className="input-group mt-3"><span className="input-group-text"><i className="bi bi-shield-lock"></i></span><input type="password" className="form-control" placeholder="New password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" className="btn btn-primary" disabled={password.length < 8} onClick={() => { localStorage.setItem(`busgo_password_${account.email}`, password); setSecuritySaved(true); setPassword(""); }}>Update password</button></div>
                  {securitySaved && <div className="profile-success mt-3"><i className="bi bi-check-circle-fill"></i><span>Password updated successfully.</span></div>}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;

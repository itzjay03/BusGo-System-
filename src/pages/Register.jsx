import { useState } from "react";
import busgoLoginLogo from "../assets/busgo-login-logo.png";
import heroBusImage from "../hero-bus.jpg";

function Register({ onRegister, go }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm) {
      setError("Please complete all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    onRegister({ name: form.name.trim(), email: form.email.trim().toLowerCase() });
  };

  return (
    <main className="auth-page auth-register-page">
      <div className="auth-layout auth-register-layout">
        <section className="auth-showcase">
          <img className="auth-hero-image" src={heroBusImage} alt="Bus traveling along a scenic route" />
          <div className="auth-hero-overlay" aria-hidden="true"></div>
          <div className="auth-showcase-brand">
            <img className="auth-logo-image" src={busgoLoginLogo} alt="BusGo" />
            <span className="auth-brand-divider"></span>
            <span className="auth-brand-tagline">Your journey starts here</span>
          </div>
          <div className="auth-showcase-content">
            <span className="auth-showcase-label">READY FOR YOUR NEXT TRIP?</span>
            <h1>Good trips begin with <span>BusGo.</span></h1>
            <p>Create your passenger account to book your next ride, keep your trip details organized, and get moving with confidence.</p>
            <div className="auth-benefits">
              <div><i className="bi bi-person-check"></i><span><strong>Your passenger profile</strong><small>Keep your booking details in one place.</small></span></div>
              <div><i className="bi bi-clock-history"></i><span><strong>Trip history, made easy</strong><small>Find your reservation details when you need them.</small></span></div>
              <div><i className="bi bi-phone"></i><span><strong>Travel with confidence</strong><small>Plan and manage your journeys with ease.</small></span></div>
            </div>
            <div className="auth-route-preview"><span>PLAN</span><i className="bi bi-arrow-right"></i><span>TRAVEL</span><i className="bi bi-arrow-right"></i><span>ARRIVE</span></div>
          </div>
        </section>

        <section className="auth-form-wrap auth-register-form-wrap">
          <div className="auth-card auth-register-card">
            <div className="auth-form-heading">
              <div className="auth-register-icon"><i className="bi bi-person-plus"></i></div>
              <div className="auth-heading-lines"><span></span><b>GET STARTED</b><span></span></div>
              <h1 className="auth-title">Create your<br /><span>BusGo</span> account</h1>
              <p>Join BusGo and make your next trip easier to plan.</p>
            </div>

            {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}

            <form onSubmit={submit}>
              <div className="auth-field">
                <label className="form-label" htmlFor="register-name">FULL NAME</label>
                <div className="auth-input-group">
                  <i className="bi bi-person"></i>
                  <input id="register-name" type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Enter your full name" autoComplete="name" />
                </div>
              </div>
              <div className="auth-field">
                <label className="form-label" htmlFor="register-email">EMAIL ADDRESS</label>
                <div className="auth-input-group">
                  <i className="bi bi-envelope"></i>
                  <input id="register-email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" autoComplete="email" />
                </div>
              </div>
              <div className="auth-field">
                <label className="form-label" htmlFor="register-password">PASSWORD</label>
                <div className="auth-input-group auth-password-group">
                  <i className="bi bi-lock"></i>
                  <input id="register-password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" />
                  <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}><i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i></button>
                </div>
              </div>
              <div className="auth-field">
                <label className="form-label" htmlFor="register-confirm">CONFIRM PASSWORD</label>
                <div className="auth-input-group auth-password-group">
                  <i className="bi bi-shield-lock"></i>
                  <input id="register-confirm" type={showConfirm ? "text" : "password"} value={form.confirm} onChange={(e) => update("confirm", e.target.value)} placeholder="Re-enter your password" autoComplete="new-password" />
                  <button type="button" className="auth-password-toggle" onClick={() => setShowConfirm((value) => !value)} aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}><i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}></i></button>
                </div>
              </div>
              <button className="auth-submit-btn" type="submit">Create Passenger Account <i className="bi bi-arrow-right"></i></button>
            </form>
            <p className="auth-create-account">Already have an account? <button type="button" onClick={() => go("login")}>Sign in</button></p>
            <p className="auth-secure-note"><i className="bi bi-shield-check"></i> Your details are used to manage your BusGo account.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;

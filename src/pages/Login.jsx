import { useState } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import busgoLoginLogo from "../assets/busgo-login-logo.png";
import googleReferenceLogo from "../assets/google-reference-logo.png";
import heroBusImage from "../hero-bus.jpg";

function Login({ onLogin, go }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  // Firebase users are passengers by default. These accounts are allowed to enter the admin area.
  const adminEmails = ["admin@busgo.com"];

  const getRole = (email) =>
    adminEmails.includes(email.trim().toLowerCase()) ? "admin" : "user";

  const googleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    onLogin({
      name: result.user.displayName,
      email: result.user.email,
      role: getRole(result.user.email || "")
    });

  } catch (error) {
    console.error("Google Login Error:", error);
    setError("Google login failed. Please try again.");
  }
};

  const submit = async (e) => {
  e.preventDefault();

  const email = form.email.trim().toLowerCase();

  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      form.password
    );

    setError("");

    onLogin({
      name: result.user.displayName || email,
      email: result.user.email,
      role: getRole(result.user.email || email)
    });

  } catch (error) {
    console.error("Email Login Error:", error);

    setError("Invalid email or password.");
  }
};

  const demo = (role) => onLogin(role === "admin"
    ? { name: "BusGo Administrator", email: "admin@busgo.com", role: "admin" }
    : { name: "Passenger", email: "user@busgo.com", role: "user" });

  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-showcase">
          <img className="auth-hero-image" src={heroBusImage} alt="Bus on a scenic road" />
          <div className="auth-hero-overlay" aria-hidden="true"></div>

          <div className="auth-showcase-brand">
            <img className="auth-logo-image" src={busgoLoginLogo} alt="BusGo" />
            <span className="auth-brand-divider"></span>
            <span className="auth-brand-tagline">Journey Starts Here</span>
          </div>

          <div className="auth-showcase-content">
            <h1>Travel with less<br />waiting and<br /><span>more confidence.</span></h1>
            <p>Search a route, choose your seat, and keep your trip details together in one simple experience.</p>

            <div className="auth-benefits">
              <div>
                <i className="bi bi-search"></i>
                <span><strong>Easy trip search</strong><small>Find routes and schedules quickly.</small></span>
              </div>
              <div>
                <i className="bi bi-grid-3x3-gap"></i>
                <span><strong>Choose your seat</strong><small>See available seats before booking.</small></span>
              </div>
              <div>
                <i className="bi bi-ticket-perforated"></i>
                <span><strong>Digital ticket</strong><small>Keep your reservation details ready.</small></span>
              </div>
            </div>

            <div className="auth-route-preview">
              <span>MANILA</span><i className="bi bi-arrow-right"></i><span>BATANGAS</span>
            </div>
          </div>
        </section>

        <section className="auth-form-wrap">
          <div className="auth-card">
            <div className="auth-form-heading">
              <div className="auth-heading-lines"><span></span><b>WELCOME BACK</b><span></span></div>
              <h1 className="auth-title">Sign in to your<br /><span>BusGo</span> account</h1>
              <p>Plan, manage, and track your bus reservations<br className="auth-desktop-break" /> from one convenient place.</p>
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <form onSubmit={submit}>
              <div className="auth-field">
                <label className="form-label">EMAIL ADDRESS</label>
                <div className="auth-input-group">
                  <i className="bi bi-envelope"></i>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" autoComplete="email" />
                </div>
              </div>

              <div className="auth-field">
                <label className="form-label">PASSWORD</label>
                <div className="auth-input-group auth-password-group">
                  <i className="bi bi-lock"></i>
                  <input type={show ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter password" autoComplete="current-password" />
                  <button type="button" className="auth-password-toggle" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
                    <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
              </div>

              <button className="auth-submit-btn" type="submit">Sign In <i className="bi bi-arrow-right"></i></button>

              <div className="auth-divider"><span></span><b>OR</b><span></span></div>

              <button type="button" className="google-login-btn" onClick={googleLogin}>
                <span className="google-login-icon" aria-hidden="true">
                  <img src={googleReferenceLogo} alt="" />
                </span>
                <span>Continue with Google</span>
                <i className="bi bi-arrow-right google-login-arrow"></i>
              </button>
            </form>

            <p className="auth-create-account">Don't have an account? <button onClick={() => go("register")}>Create one</button></p>
          </div>
        </section>
      </div>
    </main>
  );
}
export default Login;

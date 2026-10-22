function Footer() {
  return (
    <footer className="busgo-footer">
      <div className="container">
        <div className="busgo-footer-main">
          <div className="busgo-footer-brand">
            <div className="footer-brand-row">
              <span className="brand-icon"><i className="bi bi-bus-front-fill"></i></span>
              <span className="brand-text">Bus<span>Go</span></span>
            </div>
            <p>Simple bus reservations, clear trip details, and digital tickets in one place.</p>
          </div>
          <div className="busgo-footer-links">
            <div><h6>Explore</h6><span>Search trips</span><span>My reservations</span></div>
            <div><h6>Support</h6><span>Help center</span><span>Travel guide</span></div>
            <div><h6>Contact</h6><span>support@busgo.com</span><span>Metro Manila, Philippines</span></div>
          </div>
          <div className="busgo-footer-social">
            <span className="footer-status"><i className="bi bi-circle-fill"></i> Service available</span>
            <div className="footer-social-icons">
              <span><i className="bi bi-facebook"></i></span><span><i className="bi bi-twitter-x"></i></span><span><i className="bi bi-instagram"></i></span><span><i className="bi bi-youtube"></i></span>
            </div>
          </div>
        </div>
        <div className="busgo-footer-bottom"><span>© 2026 BusGo. All rights reserved.</span><span>Travel smarter. Arrive with confidence.</span></div>
      </div>
    </footer>
  );
}
export default Footer;

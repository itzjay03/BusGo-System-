import SearchBox from "../components/SearchBox";
import Feature from "../components/Feature";
import RouteCard from "../components/RouteCard";
import { routes } from "../data/buses";
import heroBus from "../hero-bus.jpg";

function Home({ search, setSearch, onSearch, go, reviews = [] }) {
  return (
    <>
      <section className="hero-section hero-modern">
        <div className="container position-relative">
          <div className="hero-topline"><span><i className="bi bi-shield-check me-1"></i> Simple, secure online bus reservations</span><span className="hero-topline-dot"></span><span>Designed for everyday travel</span></div>
          <div className="row align-items-center g-5 hero-main">
            <div className="col-lg-7">
              <span className="eyebrow"><i className="bi bi-stars me-2"></i>Simple. Fast. Reliable.</span>
              <h1 className="hero-title">Plan your next journey<br /><span>with confidence.</span></h1>
              <p className="hero-copy">Search your route, select your preferred seat, and receive your digital ticket through a simple, guided booking experience.</p>
              <div className="hero-points">
                <span><i className="bi bi-check-circle-fill"></i> Effortless trip search</span>
                <span><i className="bi bi-check-circle-fill"></i> Seat selection</span>
                <span><i className="bi bi-check-circle-fill"></i> Digital ticket</span>
              </div>
              <div className="hero-actions">
                <button className="btn btn-primary btn-lg rounded-pill px-4 hero-primary-cta" onClick={() => document.querySelector(".search-panel")?.scrollIntoView({ behavior: "smooth", block: "center" })}>Search Trips <i className="bi bi-arrow-right ms-2"></i></button>
                <button className="btn btn-link text-decoration-none fw-semibold hero-secondary-cta" onClick={() => go("schedules")}>View schedules <i className="bi bi-arrow-up-right ms-1"></i></button>
              </div>
              <div className="hero-trust-row">
                <span><i className="bi bi-patch-check-fill"></i> Clear fares</span>
                <span><i className="bi bi-clock-fill"></i> Fast, guided booking</span>
                <span><i className="bi bi-phone-fill"></i> Mobile ready</span>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="hero-visual hero-visual-modern">
                <div className="visual-grid"></div>
                <div className="hero-photo-card">
                  <img src={heroBus} alt="BusGo travel bus" />
                  <div className="hero-photo-overlay"></div>
                  <div className="hero-photo-caption">
                    <span><i className="bi bi-geo-alt-fill"></i> Manila</span>
                    <i className="bi bi-arrow-right"></i>
                    <span>Batangas</span>
                  </div>
                </div>
                <div className="floating-card card-one"><i className="bi bi-shield-check"></i><div><strong>Secure reservations</strong><small>Clear, guided booking process</small></div></div>
                <div className="floating-card card-two"><i className="bi bi-ticket-perforated"></i><div><strong>Digital ticket</strong><small>Ready after confirmation</small></div></div>
                <div className="hero-rating-card"><span className="hero-rating-stars">★★★★★</span><strong>Passenger experience</strong><small>Simple booking from search to ticket</small></div>
              </div>
            </div>
          </div>

          <SearchBox search={search} setSearch={setSearch} onSearch={onSearch} />

          <div className="hero-stats row g-2 g-md-3">
            <div className="col-6 col-md-3"><div className="mini-stat"><strong>Easy</strong><span>Trip search</span></div></div>
            <div className="col-6 col-md-3"><div className="mini-stat"><strong>Fast</strong><span>Seat selection</span></div></div>
            <div className="col-6 col-md-3"><div className="mini-stat"><strong>Clear</strong><span>Trip details</span></div></div>
            <div className="col-6 col-md-3"><div className="mini-stat"><strong>Ready</strong><span>Digital ticket</span></div></div>
          </div>
        </div>
      </section>

      <section className="section-space routes-modern">
        <div className="container">
          <div className="section-heading d-flex justify-content-between align-items-end mb-4">
            <div><span className="section-label">Popular destinations</span><h2>Explore popular destinations.</h2><p>Select a destination to view available departures, fares, and schedules.</p></div>
            <button className="btn btn-link text-decoration-none d-none d-md-block fw-semibold" onClick={() => go("schedules")}>View all <i className="bi bi-arrow-right ms-1"></i></button>
          </div>
          <div className="row g-3">{routes.map((route, index) => <div className="col-md-6 col-xl-3" key={route.to}><RouteCard route={route} number={index + 1} onClick={() => go("schedules")} /></div>)}</div>
        </div>
      </section>

      <section className="section-space bg-light why-modern">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-5">
              <span className="section-label">Why travel with BusGo</span>
              <h2 className="display-6 fw-bold mt-2">A smarter way to plan your journey.</h2>
              <p className="text-secondary mt-3">Every step is designed around the passenger experience—from trip discovery to digital ticket management.</p>
              <button className="btn btn-dark rounded-pill px-4 mt-2" onClick={() => go("schedules")}>Explore buses <i className="bi bi-arrow-up-right ms-2"></i></button>
            </div>
            <div className="col-lg-7"><div className="row g-3">
              <Feature icon="bi-search" title="Easy search" text="Compare departures by route, schedule, fare, and availability." />
              <Feature icon="bi-grid-3x3-gap" title="Seat selection" text="Pick your preferred seat before confirming." />
              <Feature icon="bi-ticket-perforated" title="Digital ticket" text="Keep your reservation and ticket details organized in one place." />
              <Feature icon="bi-phone" title="Mobile friendly" text="Use the same clean flow on phone or desktop." />
            </div></div>
          </div>
        </div>
      </section>


      <section className="section-space bg-light">
        <div className="container">
          <div className="section-heading text-center mb-5"><span className="section-label">How it works</span><h2>From trip search to digital ticket in four simple steps.</h2><p>A clear, guided booking experience keeps every step simple and organized.</p></div>
          <div className="row g-3">
            {[['01','Search for a trip','Enter your route, travel date and passenger count.','bi-search'],['02','Select your bus','Compare schedules, fares, ratings and amenities.','bi-bus-front'],['03','Select your seat','See the bus layout and select an available seat.','bi-grid-3x3-gap'],['04','Receive your digital ticket','Complete the passenger details and keep your digital ticket.','bi-ticket-perforated']].map(([n,t,d,i])=><div className="col-md-6 col-xl-3" key={n}><div className="how-card"><i className={`bi ${i} how-icon`}></i><div className="how-number">{n}</div><h3>{t}</h3><p>{d}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container">
          <div className="section-heading mb-4"><span className="section-label">Bus operators</span><h2>Travel with trusted operators.</h2><p>Explore the operators currently available in our trip listings.</p></div>
          <div className="row g-3">
            {['Victory Liner','JAC Liner','DLTB Co.','Philtranco'].map((name,i)=><div className="col-6 col-lg-3" key={name}><div className="operator-card"><div className="operator-logo">{name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><strong>{name}</strong><small>Available in trip listings</small></div></div></div>)}
          </div>
        </div>
      </section>

      <section className="section-space bg-light">
        <div className="container">
          <div className="section-heading mb-4"><span className="section-label">Passenger ratings & reviews</span><h2>What passengers say about their booking experience.</h2><p>Read passenger feedback about trip selection, seat booking, and digital tickets.</p></div>
          <div className="row g-3">
            {reviews.length === 0 ? <div className="col-12"><div className="reviews-empty"><div className="reviews-empty-icon"><i className="bi bi-chat-square-heart"></i></div><div><h3>No passenger reviews yet</h3><p>Completed passengers can share a rating and review from My Reservations.</p></div></div></div> : reviews.slice(0, 6).map(review => {
              const initial = (review.passenger || "P").charAt(0).toUpperCase();
              return <div className="col-md-6 col-xl-4" key={review.id}>
                <div className="review-card passenger-review-card">
                  <div className="review-top"><div className="review-stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}<span className="review-stars-muted">{"★".repeat(5 - review.rating)}</span></div><strong>{review.rating}.0</strong></div>
                  <p className="review-copy">“{review.comment}”</p>
                  <div className="review-trip"><span><i className="bi bi-geo-alt"></i>{review.route}</span><span><i className="bi bi-bus-front"></i>{review.operator}</span></div>
                  <div className="review-person"><div className="review-avatar">{initial}</div><div><strong>{review.passenger}</strong><small className="d-block text-secondary"><i className="bi bi-patch-check-fill me-1"></i>Verified passenger review</small></div></div>
                </div>
              </div>;
            })}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container">
          <div className="row g-5 align-items-start">
            <div className="col-lg-4"><span className="section-label">FAQ</span><h2 className="mt-2">Frequently asked questions</h2><p className="text-secondary">Find quick answers to common questions about reservations and tickets.</p></div>
            <div className="col-lg-8"><div className="accordion">
              {[['Can I choose my seat?','Yes. The booking flow includes a seat selection screen where you can choose from the seats currently shown as available.'],['Can I view my booking later?','Yes. Open My Reservations after signing in to review your saved booking details and ticket.'],['Can I print my ticket?','Yes. The digital ticket includes a Print Ticket action for a cleaner paper copy.'],['How does payment work?','Choose a payment option during checkout, review your fare, and submit your reservation for confirmation.']].map(([q,a],i)=><div className="accordion-item faq-item" key={q}><h2 className="accordion-header"><button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#faq-${i}`}>{q}</button></h2><div id={`faq-${i}`} className="accordion-collapse collapse"><div className="accordion-body">{a}</div></div></div>)}
            </div></div>
          </div>
        </div>
      </section>

      <section className="section-space final-cta">
        <div className="container"><div className="cta-card"><div><span className="section-label">Ready to plan your journey?</span><h2>Find your next departure with BusGo.</h2><p>Search your route and begin your reservation in just a few steps.</p></div><button className="btn btn-primary btn-lg rounded-pill px-4" onClick={() => go("schedules")}>Search Trips <i className="bi bi-arrow-right ms-2"></i></button></div></div>
      </section>
    </>
  );
}

export default Home;

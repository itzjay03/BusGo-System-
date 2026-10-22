import { useEffect, useMemo, useState } from "react";

function UserOverview({ account, bookings, reviews = [], go }) {
  const mine = bookings.filter((b) => b.email === account.email);
  const upcoming = mine.filter((b) => b.status === "Pending" || b.status === "Confirmed");
  const completed = mine.filter((b) => b.status === "Completed");
  const latest = upcoming[0];
  const confirmed = mine.filter((b) => b.status === "Confirmed").length;
  const pending = mine.filter((b) => b.status === "Pending").length;
  const completedUnrated = completed.filter((b) => !reviews.some((r) => r.bookingId === b.id));

  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!latest) {
      setCountdown("");
      return undefined;
    }

    const update = () => {
      const target = new Date(`${latest.date}T${latest.time || "00:00"}`);
      const diff = target.getTime() - Date.now();
      if (!Number.isFinite(diff) || diff <= 0) {
        setCountdown("Departure time");
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setCountdown(days > 0 ? `${days}d ${hours}h ${mins}m` : `${hours}h ${mins}m`);
    };

    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [latest]);

  const recent = useMemo(() => mine.slice(0, 4), [mine]);

  return (
    <main className="dashboard-page py-5">
      <div className="container">
        <section className="dashboard-hero mb-4">
          <div>
            <span className="dashboard-kicker">PASSENGER DASHBOARD</span>
            <h1>Welcome back, {account.name}.</h1>
            <p>Manage your journeys, reservations, tickets, and passenger feedback from one place.</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-light rounded-pill px-4" onClick={() => go("my-trip")}><i className="bi bi-map me-2"></i>My Trip</button><button className="btn btn-outline-light rounded-pill px-4" onClick={() => go("schedules")}><i className="bi bi-search me-2"></i>Search Trips</button>
            <button className="btn btn-outline-light rounded-pill px-4" onClick={() => go("profile")}><i className="bi bi-person me-2"></i>Profile & Settings</button>
          </div>
        </section>

        <div className="row g-3 mb-4">
          <div className="col-6 col-xl-3"><div className="dashboard-stat"><span><i className="bi bi-ticket-perforated"></i></span><div><small>Total Reservations</small><strong>{mine.length}</strong></div></div></div>
          <div className="col-6 col-xl-3"><div className="dashboard-stat"><span><i className="bi bi-check2-circle"></i></span><div><small>Confirmed Trips</small><strong>{confirmed}</strong></div></div></div>
          <div className="col-6 col-xl-3"><div className="dashboard-stat"><span><i className="bi bi-hourglass-split"></i></span><div><small>Pending Reservations</small><strong>{pending}</strong></div></div></div>
          <div className="col-6 col-xl-3"><div className="dashboard-stat"><span><i className="bi bi-star-fill"></i></span><div><small>Reviews Pending</small><strong>{completedUnrated.length}</strong></div></div></div>
        </div>

        <section className="dashboard-quick-grid mb-4">
          <button onClick={() => go("schedules")}><i className="bi bi-search"></i><span><strong>Find a trip</strong><small>Search routes and schedules</small></span><i className="bi bi-arrow-right"></i></button>
          <button onClick={() => go("bookings")}><i className="bi bi-ticket-perforated"></i><span><strong>My reservations</strong><small>View and manage bookings</small></span><i className="bi bi-arrow-right"></i></button>
          <button onClick={() => go("travel-center")}><i className="bi bi-wallet2"></i><span><strong>Ticket wallet</strong><small>Keep your tickets in one place</small></span><i className="bi bi-arrow-right"></i></button>
          <button onClick={() => go("profile")}><i className="bi bi-person"></i><span><strong>Passenger profile</strong><small>Update your account details</small></span><i className="bi bi-arrow-right"></i></button>
        </section>

        {latest && (
          <section className="next-trip-card mb-4">
            <div className="next-trip-label"><i className="bi bi-calendar-event me-2"></i>NEXT JOURNEY</div>
            <div className="next-trip-main">
              <div className="next-trip-route"><small>{latest.date}</small><h2>{latest.route}</h2><p>{latest.bus} · Seat {latest.seat}</p></div>
              <div className="next-trip-time"><small>DEPARTURE</small><strong>{latest.time}</strong><span>{latest.from}</span>{countdown && <em><i className="bi bi-clock me-1"></i>{countdown}</em>}</div>
              <div className="next-trip-actions"><span className={`status-badge ${latest.status === "Pending" ? "pending-badge" : ""}`}>{latest.status}</span><button className="btn btn-primary rounded-pill" onClick={() => go("ticket")}>View Ticket</button></div>
            </div>
          </section>
        )}

        {completedUnrated.length > 0 && (
          <section className="rating-reminder-card mb-4">
            <div className="rating-reminder-icon"><i className="bi bi-star-fill"></i></div>
            <div><span className="section-label">PASSENGER FEEDBACK</span><h3>You have {completedUnrated.length} completed {completedUnrated.length === 1 ? "trip" : "trips"} to review.</h3><p>Share a quick rating and review to help other passengers choose with confidence.</p></div>
            <button className="btn btn-primary rounded-pill ms-lg-auto" onClick={() => go("bookings")}>Rate a trip <i className="bi bi-arrow-right ms-1"></i></button>
          </section>
        )}

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="dashboard-card">
              <div className="card-heading"><div><small>TRIP ACTIVITY</small><h3>Recent reservations</h3></div><button className="btn btn-sm btn-outline-dark rounded-pill" onClick={() => go("bookings")}>View all</button></div>
              {recent.length ? <div className="passenger-booking-list">{recent.map((booking) => (
                <button className="passenger-booking-row" key={booking.id} onClick={() => go("bookings")}>
                  <span className="booking-icon"><i className="bi bi-bus-front"></i></span>
                  <span className="booking-route"><strong>{booking.route}</strong><small>{booking.bus} · {booking.date}</small></span>
                  <span className="booking-seat"><small>SEAT</small><strong>{booking.seat}</strong></span>
                  <span className={`status-badge ${booking.status === "Pending" ? "pending-badge" : booking.status === "Cancelled" ? "cancelled-badge" : booking.status === "Completed" ? "completed-badge" : ""}`}>{booking.status}</span>
                  <i className="bi bi-chevron-right"></i>
                </button>
              ))}</div> : <div className="empty-passenger"><i className="bi bi-ticket-perforated"></i><h5>No reservations yet</h5><p>Search available trips to begin your next journey.</p><button className="btn btn-primary rounded-pill px-4" onClick={() => go("schedules")}>Search Trips</button></div>}
            </div>
          </div>
          <div className="col-lg-4">
            <div className="dashboard-card quick-tools-card">
              <div className="card-heading"><div><small>QUICK ACTIONS</small><h4>Passenger tools</h4></div></div>
              <button className="quick-action" onClick={() => go("schedules")}><i className="bi bi-bus-front"></i><span>Browse available trips</span><i className="bi bi-arrow-right"></i></button>
              <button className="quick-action" onClick={() => go("bookings")}><i className="bi bi-receipt"></i><span>View my reservations</span><i className="bi bi-arrow-right"></i></button>
              <button className="quick-action" onClick={() => go("my-trip")}><i className="bi bi-map"></i><span>Open my trip</span><i className="bi bi-arrow-right"></i></button>
              <button className="quick-action" onClick={() => go("profile")}><i className="bi bi-person-gear"></i><span>Profile & settings</span><i className="bi bi-arrow-right"></i></button>
              <button className="quick-action" onClick={() => go("home")}><i className="bi bi-house"></i><span>Return to BusGo home</span><i className="bi bi-arrow-right"></i></button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
export default UserOverview;

import { routes } from "../data/buses";

function Admin({ bookings, go }) {
  const stats = [
    ["Total buses", "24", "bi-bus-front", "+4 this month"],
    ["Today's trips", "18", "bi-calendar-check", "+12% vs yesterday"],
    ["Bookings", String(bookings.length + 126), "bi-ticket-perforated", "+8.2% this week"],
    ["Revenue", "₱84.6K", "bi-graph-up-arrow", "+14.5% this month"]
  ];

  return (
    <main className="page-content">
      <div className="container">
        <div className="page-title-row">
          <div>
            <span className="section-label">Management</span>
            <h1>Admin dashboard</h1>
            <p>Monitor trips, buses and passenger reservations.</p>
          </div>
          <button className="btn btn-primary rounded-pill" onClick={() => go("schedules")}>Passenger view</button>
        </div>

        <div className="row g-3 mb-4">
          {stats.map((stat) => (
            <div className="col-md-6 col-xl-3" key={stat[0]}>
              <div className="stat-card">
                <div className="stat-icon"><i className={`bi ${stat[2]}`}></i></div>
                <span>{stat[0]}</span>
                <strong>{stat[1]}</strong>
                <small>{stat[3]}</small>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <div className="admin-card">
              <div className="card-heading">
                <div><h4>Recent reservations</h4><p>Latest passenger reservations</p></div>
                <button className="btn btn-sm btn-light">View all</button>
              </div>

              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr><th>Booking</th><th>Passenger</th><th>Route</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>#BG-458921</td><td>Juan Dela Cruz</td><td>Manila → Batangas</td><td><span className="status-badge">Confirmed</span></td></tr>
                    <tr><td>#BG-458920</td><td>Maria Santos</td><td>Manila → Baguio</td><td><span className="status-badge">Confirmed</span></td></tr>
                    <tr><td>#BG-458919</td><td>Carlo Reyes</td><td>Manila → Lucena</td><td><span className="status-badge pending">Pending</span></td></tr>
                    <tr><td>#BG-458918</td><td>Anne Garcia</td><td>Manila → La Union</td><td><span className="status-badge">Confirmed</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="admin-card h-100">
              <div className="card-heading">
                <div><h4>Popular destinations</h4><p>This week's demand</p></div>
              </div>

              {routes.map((route, index) => (
                <div className="d-flex justify-content-between align-items-center route-stat" key={route.to}>
                  <div>
                    <strong>{route.from} → {route.to}</strong>
                    <small>{42 - index * 7} bookings</small>
                  </div>
                  <span>{86 - index * 9}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Admin;
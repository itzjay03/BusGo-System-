import { useMemo, useState } from "react";

const emptyBus = {
  company: "",
  type: "Aircon Bus",
  from: "Manila",
  to: "",
  depart: "",
  arrive: "",
  duration: "",
  price: "",
  seats: "40",
  rating: "4.5",
  plateNumber: "",
  status: "Active"
};

function AdminOverview({ bookings, buses = [], setBuses, go, updateBookingStatus, markBookingCompleted, updatePaymentStatus, activityLogs = [], setActivityLogs, reviews = [], setReviews }) {
  const [section, setSection] = useState("overview");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [busQuery, setBusQuery] = useState("");
  const [busStatusFilter, setBusStatusFilter] = useState("All");
  const [showBusForm, setShowBusForm] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [selectedFleetBus, setSelectedFleetBus] = useState(null);
  const [busForm, setBusForm] = useState(emptyBus);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [routeQuery, setRouteQuery] = useState("");
  const [passengerQuery, setPassengerQuery] = useState("");
  const [passengerFilter, setPassengerFilter] = useState("All");
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [reviewQuery, setReviewQuery] = useState("");
  const [reviewFilter, setReviewFilter] = useState("All");
  const [selectedReview, setSelectedReview] = useState(null);
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("busgo_admin_settings") || "null") || { bookingCutoff: "2", autoComplete: true, onlinePayments: true, emailAlerts: true, maintenanceMode: false }; }
    catch { return { bookingCutoff: "2", autoComplete: true, onlinePayments: true, emailAlerts: true, maintenanceMode: false }; }
  });
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  const confirmed = bookings.filter((b) => b.status === "Confirmed");
  const pending = bookings.filter((b) => b.status === "Pending");
  const cancelled = bookings.filter((b) => b.status === "Cancelled" || b.status === "Rejected");
  const completed = bookings.filter((b) => b.status === "Completed");
  const revenue = confirmed.reduce((sum, b) => sum + Number(b.total || b.price || 0), 0);
  const completedRevenue = completed.reduce((sum, b) => sum + Number(b.total || b.price || 0), 0);
  const paidRevenue = bookings.filter((b) => b.paymentStatus === "Paid").reduce((sum, b) => sum + Number(b.total || b.price || 0), 0);
  const pendingPayments = bookings.filter((b) => b.paymentStatus === "Pending Verification").length;
  const averageBooking = bookings.length ? Math.round(bookings.reduce((sum, b) => sum + Number(b.total || b.price || 0), 0) / bookings.length) : 0;
  const activeTripBookings = bookings.filter((b) => !["Cancelled", "Rejected", "Completed"].includes(b.status));
  const totalCapacity = buses.reduce((sum, bus) => sum + Number(bus.seats || 0), 0);
  const occupancyRate = totalCapacity ? Math.min(100, Math.round((activeTripBookings.length / totalCapacity) * 100)) : 0;
  const upcomingDepartures = [...confirmed].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0)).slice(0, 5);
  const routeAnalytics = Array.from(new Map(bookings.map((b) => [b.route || `${b.from || ""} → ${b.to || ""}`, b])).keys()).map((route) => ({
    route,
    bookings: bookings.filter((b) => (b.route || `${b.from || ""} → ${b.to || ""}`) === route).length,
    revenue: bookings.filter((b) => (b.route || `${b.from || ""} → ${b.to || ""}`) === route).reduce((sum, b) => sum + Number(b.total || b.price || 0), 0)
  })).sort((a, b) => b.bookings - a.bookings).slice(0, 5);
  const maxRouteBookings = Math.max(1, ...routeAnalytics.map((r) => r.bookings));
  const passengers = Array.from(new Map(bookings.map((b) => [b.email, b])).values());
  const routes = Array.from(new Map(buses.map((b) => [`${b.from} → ${b.to}`, b])).values());
  const routePerformance = routes.map((route) => ({
    ...route,
    bookings: bookings.filter((b) => b.from === route.from && b.to === route.to).length,
    revenue: bookings.filter((b) => b.from === route.from && b.to === route.to).reduce((sum, b) => sum + Number(b.total || b.price || 0), 0)
  })).sort((a, b) => b.bookings - a.bookings);

  const fleetStats = {
    total: buses.length,
    active: buses.filter((bus) => (bus.status || "Active") === "Active").length,
    maintenance: buses.filter((bus) => (bus.status || "Active") === "Maintenance").length,
    inactive: buses.filter((bus) => (bus.status || "Active") === "Inactive").length,
    capacity: buses.reduce((sum, bus) => sum + Number(bus.seats || 0), 0)
  };

  const systemAlerts = [
    ...(pending.length ? [{ id: "pending-bookings", tone: "warning", icon: "bi-hourglass-split", title: `${pending.length} pending reservation${pending.length === 1 ? "" : "s"}`, text: "Review new reservations that are waiting for admin confirmation." }] : []),
    ...(pendingPayments ? [{ id: "pending-payments", tone: "danger", icon: "bi-credit-card", title: `${pendingPayments} payment${pendingPayments === 1 ? "" : "s"} need verification`, text: "Check submitted payment details before confirming the related reservation." }] : []),
    ...(fleetStats.maintenance ? [{ id: "maintenance-buses", tone: "info", icon: "bi-tools", title: `${fleetStats.maintenance} bus${fleetStats.maintenance === 1 ? "" : "es"} under maintenance`, text: "Maintenance units are currently excluded from normal fleet availability." }] : []),
    ...(reviews.length && reviews.length >= 5 ? [{ id: "review-volume", tone: "success", icon: "bi-star", title: `${reviews.length} passenger reviews recorded`, text: "Review recent feedback to monitor passenger experience." }] : [])
  ].filter(alert => !dismissedAlerts.includes(alert.id));

  const stats = [
    ["Total Bookings", bookings.length, "bi-ticket-perforated"],
    ["Confirmed", confirmed.length, "bi-check-circle"],
    ["Pending", pending.length, "bi-hourglass-split"],
    ["Passengers", passengers.length, "bi-people"],
    ["Revenue", `₱${revenue.toLocaleString()}`, "bi-cash-stack"]
  ];

  const visible = useMemo(() => bookings
    .filter((b) => filter === "All" || b.status === filter)
    .filter((b) => `${b.id} ${b.passenger} ${b.email} ${b.route} ${b.bus}`.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 30), [bookings, filter, query]);

  const visibleBuses = useMemo(() => buses.filter((bus) =>
    (busStatusFilter === "All" || (bus.status || "Active") === busStatusFilter) &&
    `${bus.company} ${bus.type} ${bus.from} ${bus.to} ${bus.plateNumber || ""}`.toLowerCase().includes(busQuery.toLowerCase())
  ), [buses, busQuery, busStatusFilter]);

  const visibleRoutes = routes.filter((bus) =>
    `${bus.from} ${bus.to} ${bus.company}`.toLowerCase().includes(routeQuery.toLowerCase())
  );

  const passengerProfiles = passengers.map((p) => {
    const passengerBookings = bookings.filter((b) => b.email === p.email);
    const activeBookings = passengerBookings.filter((b) => ["Pending", "Confirmed"].includes(b.status));
    const completedBookings = passengerBookings.filter((b) => b.status === "Completed");
    const latestBooking = [...passengerBookings].sort((a, b) => new Date(b.bookedAt || b.date || 0) - new Date(a.bookedAt || a.date || 0))[0];
    return { ...p, bookings: passengerBookings, bookingCount: passengerBookings.length, activeCount: activeBookings.length, completedCount: completedBookings.length, latestBooking };
  });

  const visibleReviews = reviews.filter((r) => {
    const matchesSearch = `${r.passenger || ""} ${r.email || ""} ${r.route || ""} ${r.operator || ""} ${r.bookingId || ""}`.toLowerCase().includes(reviewQuery.toLowerCase());
    const matchesFilter = reviewFilter === "All" || Number(r.rating) === Number(reviewFilter);
    return matchesSearch && matchesFilter;
  });
  const averageReview = reviews.length ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1) : "0.0";

  const visiblePassengers = passengerProfiles.filter((p) => {
    const matchesSearch = `${p.passenger} ${p.email} ${p.phone || ""}`.toLowerCase().includes(passengerQuery.toLowerCase());
    const matchesFilter = passengerFilter === "All" || (passengerFilter === "Active" ? p.activeCount > 0 : passengerFilter === "Completed" ? p.completedCount > 0 : true);
    return matchesSearch && matchesFilter;
  });

  const openAddBus = () => {
    setEditingBus(null);
    setBusForm(emptyBus);
    setShowBusForm(true);
  };

  const openEditBus = (bus) => {
    setEditingBus(bus.id);
    setBusForm({ ...emptyBus, ...bus });
    setShowBusForm(true);
  };

  const saveBus = async (event) => {
    event.preventDefault();
    if (!busForm.company.trim() || !busForm.from.trim() || !busForm.to.trim()) return;

    const cleanBus = {
      ...busForm,
      status: busForm.status || "Active",
      price: Number(busForm.price) || 0,
      seats: Number(busForm.seats) || 0,
      rating: Number(busForm.rating) || 0
    };

    try {
      const url = editingBus
        ? `http://localhost:8080/api/buses/${editingBus}`
        : "http://localhost:8080/api/buses";
      const response = await fetch(url, {
        method: editingBus ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanBus)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Bus request failed with status ${response.status}`);
      }

      const data = await response.json();
      setBuses((current) => editingBus
        ? current.map((bus) => bus.id === Number(editingBus) ? data : bus)
        : [...current, data]
      );

      setShowBusForm(false);
      setEditingBus(null);
      setBusForm(emptyBus);
    } catch (error) {
      console.error("Unable to save bus:", error);
      window.alert("Hindi na-save ang bus. Siguraduhing naka-run ang backend sa port 8080.");
    }
  };

  const deleteBus = async (id) => {
    if (!window.confirm("Remove this bus from the BusGo fleet?")) return;

    try {
      const response = await fetch(`http://localhost:8080/api/buses/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Delete failed with status ${response.status}`);
      }

      await response.json();
      setBuses((current) => current.filter((bus) => Number(bus.id) !== Number(id)));
      setSelectedFleetBus((current) => current && Number(current.id) === Number(id) ? null : current);
    } catch (error) {
      console.error("Unable to delete bus:", error);
      window.alert("Hindi na-delete ang bus. Siguraduhing naka-run ang backend sa port 8080.");
    }
  };

  const nav = [
    ["overview", "Overview", "bi-grid-1x2"],
    ["bookings", "Bookings", "bi-ticket-perforated", pending.length],
    ["buses", "Buses", "bi-bus-front"],
    ["routes", "Routes & schedules", "bi-signpost-2"],
    ["passengers", "Passengers", "bi-people"],
    ["reviews", "Reviews", "bi-star"],
    ["reports", "Reports", "bi-bar-chart"],
    ["activity", "Activity logs", "bi-clock-history"],
    ["alerts", "System alerts", "bi-bell", systemAlerts.length],
    ["operations", "Operations center", "bi-activity"],
    ["settings", "Settings", "bi-sliders"]
  ];

  const sectionTitle = nav.find((item) => item[0] === section)?.[1] || "Overview";

  return (
    <main className="admin-page py-4">
      <div className="container-fluid px-lg-4">
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-brand"><span className="admin-brand-icon"><i className="bi bi-bus-front-fill"></i></span><div><strong>BusGo</strong><small>Admin Panel</small></div></div>
            <div className="admin-side-label">WORKSPACE</div>
            <nav className="admin-side-nav">
              {nav.map(([id, label, icon, count]) => <button key={id} className={section === id ? "active" : ""} onClick={() => setSection(id)}><i className={`bi ${icon}`}></i><span>{label}</span>{count ? <b>{count}</b> : null}</button>)}
            </nav>
            <div className="admin-side-bottom">
              <button onClick={() => go("operations")}><i className="bi bi-activity"></i> Operations center</button>
            </div>
          </aside>

          <div className="admin-main">
            <div className="admin-page-head">
              <div><span>BUSGO ADMINISTRATION</span><h1>{sectionTitle}</h1><p>Manage reservations, fleet information, routes, and passenger activity from one centralized workspace.</p></div>
              <div className="d-flex gap-2 flex-wrap"><button className="btn btn-outline-secondary rounded-pill" onClick={() => go("home")}><i className="bi bi-house me-2"></i>View website</button>{section === "buses" && <button className="btn btn-primary rounded-pill px-4" onClick={openAddBus}><i className="bi bi-plus-lg me-2"></i>Add bus</button>}</div>
            </div>

            {section === "overview" && <>
              <section className="admin-welcome-card mb-4">
                <div className="admin-welcome-copy">
                  <span className="admin-welcome-kicker"><i className="bi bi-stars me-2"></i>BUSGO CONTROL CENTER</span>
                  <h2>Operations at a glance</h2>
                  <p>Monitor reservations, fleet availability, payments, and passenger activity from one workspace.</p>
                  <div className="admin-welcome-meta">
                    <span><i className="bi bi-shield-check"></i> System ready</span>
                    <span><i className="bi bi-clock"></i> Updated just now</span>
                  </div>
                </div>
                <div className="admin-welcome-actions">
                  <button className="btn btn-light rounded-pill" onClick={() => setSection("bookings")}><i className="bi bi-ticket-perforated me-2"></i>Review bookings</button>
                  <button className="btn btn-outline-light rounded-pill" onClick={() => { setSection("buses"); openAddBus(); }}><i className="bi bi-plus-lg me-2"></i>Add bus</button>
                </div>
              </section>
              <div className="row g-3 mb-4">{stats.map(([label, value, icon]) => <div className="col-sm-6 col-xl" key={label}><div className="admin-stat"><div><small>{label}</small><strong>{value}</strong></div><i className={`bi ${icon}`}></i></div></div>)}</div>
              <div className="admin-analytics-kpis">
                <div className="analytics-kpi"><span><i className="bi bi-pie-chart"></i>Occupancy rate</span><strong>{occupancyRate}%</strong><small>{activeTripBookings.length} active passenger seats</small><div className="analytics-progress"><i style={{width:`${occupancyRate}%`}}></i></div></div>
                <div className="analytics-kpi"><span><i className="bi bi-cash-stack"></i>Completed revenue</span><strong>₱{completedRevenue.toLocaleString()}</strong><small>{completed.length} finished trips</small></div>
                <div className="analytics-kpi"><span><i className="bi bi-credit-card"></i>Pending payments</span><strong>{pendingPayments}</strong><small>Waiting for verification</small></div>
                <div className="analytics-kpi"><span><i className="bi bi-bus-front"></i>Fleet availability</span><strong>{fleetStats.active}/{fleetStats.total}</strong><small>Active buses in fleet</small></div>
              </div>
              <div className="admin-analytics-grid mt-4">
                <div className="admin-card analytics-panel"><div className="card-heading"><div><small>ROUTE PERFORMANCE</small><h3>Most booked routes</h3></div><span className="analytics-caption">Based on reservations</span></div><div className="route-chart">{routeAnalytics.length ? routeAnalytics.map((r) => <div className="route-chart-row" key={r.route}><div className="route-chart-label"><strong>{r.route}</strong><span>{r.bookings} booking{r.bookings===1?"":"s"}</span></div><div className="route-chart-track"><i style={{width:`${Math.round((r.bookings/maxRouteBookings)*100)}%`}}></i></div><strong className="route-chart-value">₱{r.revenue.toLocaleString()}</strong></div>) : <div className="empty-admin compact-empty"><i className="bi bi-bar-chart"></i><strong>No route data yet</strong><span>Booking activity will appear here.</span></div>}</div></div>
                <div className="admin-card analytics-panel"><div className="card-heading"><div><small>UPCOMING DEPARTURES</small><h3>Next confirmed trips</h3></div><button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => setSection("bookings")}>Manage</button></div><div className="upcoming-list">{upcomingDepartures.length ? upcomingDepartures.map((b) => <div className="upcoming-row" key={b.id}><span className="upcoming-icon"><i className="bi bi-bus-front"></i></span><div><strong>{b.route || `${b.from || ""} → ${b.to || ""}`}</strong><small>{b.date || "Date not set"} · {b.depart || "Departure TBA"}</small></div><span className="upcoming-seat">{b.seat || "—"}</span></div>) : <div className="empty-admin compact-empty"><i className="bi bi-calendar-x"></i><strong>No upcoming trips</strong><span>Confirmed departures will appear here.</span></div>}</div></div>
              </div>
              <div className="admin-overview-grid mt-4">
                <div className="admin-card"><div className="card-heading"><div><small>RESERVATIONS</small><h3>Booking health</h3></div></div><div className="metric-list">{[["Confirmed", confirmed.length], ["Pending", pending.length], ["Cancelled", cancelled.length]].map(([label, value]) => <div className="metric-row" key={label}><div style={{flex:1}}><span>{label}</span><div className="metric-progress"><i style={{width:`${Math.min(100,(value/Math.max(bookings.length,1))*100)}%`}}></i></div></div><strong>{value}</strong></div>)}</div></div>
                <div className="admin-card"><div className="card-heading"><div><small>QUICK ACTIONS</small><h3>Quick actions</h3></div></div><div className="admin-quick-grid"><button onClick={() => setSection("bookings")}><i className="bi bi-ticket-perforated"></i><span>Review reservations</span><small>{pending.length} pending</small></button><button onClick={() => { setSection("buses"); openAddBus(); }}><i className="bi bi-bus-front"></i><span>Add bus</span><small>Update fleet</small></button><button onClick={() => setSection("routes")}><i className="bi bi-signpost-2"></i><span>Manage routes</span><small>{routes.length} routes</small></button><button onClick={() => setSection("reports")}><i className="bi bi-bar-chart"></i><span>View reports</span><small>Performance</small></button></div></div>
              </div>
              <div className="admin-card mt-4"><div className="card-heading"><div><small>RECENT ACTIVITY</small><h3>Latest bookings</h3></div><button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => setSection("bookings")}>View all</button></div><div className="table-responsive"><table className="table align-middle mb-0"><thead><tr><th>Booking</th><th>Passenger</th><th>Route</th><th>Status</th><th></th></tr></thead><tbody>{bookings.slice(0,6).map((b)=><tr key={b.id}><td><strong>{b.id}</strong><small className="d-block text-secondary">{b.date}</small></td><td>{b.passenger}<small className="d-block text-secondary">{b.email}</small></td><td>{b.route}</td><td><span className={`status-badge booking-status-badge ${b.status === "Pending" ? "pending-badge" : b.status === "Cancelled" || b.status === "Rejected" ? "cancelled-badge" : ""}`}>{b.status}</span></td><td><button className="btn btn-sm btn-light" onClick={()=>setSelectedBooking(b)}>Details</button></td></tr>)}</tbody></table></div>{!bookings.length && <div className="empty-admin">No reservation activity yet.</div>}</div>
            </>}

            {section === "bookings" && <>
              <div className="admin-booking-summary">
                <button className={filter === "Pending" ? "active" : ""} onClick={() => setFilter("Pending")}><span className="booking-summary-icon pending"><i className="bi bi-hourglass-split"></i></span><div><small>WAITING FOR REVIEW</small><strong>{pending.length}</strong><span>Pending reservations</span></div></button>
                <button className={filter === "Confirmed" ? "active" : ""} onClick={() => setFilter("Confirmed")}><span className="booking-summary-icon confirmed"><i className="bi bi-check-circle"></i></span><div><small>CONFIRMED</small><strong>{confirmed.length}</strong><span>Approved trips</span></div></button>
                <button className={filter === "Completed" ? "active" : ""} onClick={() => setFilter("Completed")}><span className="booking-summary-icon completed"><i className="bi bi-flag"></i></span><div><small>COMPLETED</small><strong>{completed.length}</strong><span>Finished trips</span></div></button>
                <button className={filter === "Cancelled" ? "active" : ""} onClick={() => setFilter("Cancelled")}><span className="booking-summary-icon cancelled"><i className="bi bi-x-circle"></i></span><div><small>CANCELLED</small><strong>{cancelled.length}</strong><span>Cancelled records</span></div></button>
              </div>
              <div className="admin-card admin-bookings-card">
                <div className="admin-filter-row booking-toolbar-pro"><div><strong>Reservation management</strong><small>Review payments, confirm trips and complete finished reservations.</small></div><div className="booking-toolbar-controls"><div className="input-group"><span className="input-group-text"><i className="bi bi-search"></i></span><input className="form-control" placeholder="Search booking, passenger, route or bus" value={query} onChange={(e)=>setQuery(e.target.value)}/></div><div className="booking-filters">{["All","Pending","Confirmed","Completed","Rejected","Cancelled"].map(x=><button key={x} className={`filter-pill ${filter===x?"active":""}`} onClick={()=>setFilter(x)}>{x}</button>)}</div></div></div>
                <div className="admin-booking-note"><i className="bi bi-shield-check"></i><span><strong>Confirmation control:</strong> Online payments must be approved before a pending reservation can be confirmed. Cash bookings can be confirmed directly.</span></div>
                <div className="table-responsive mt-3"><table className="table align-middle admin-booking-table"><thead><tr><th>Booking</th><th>Passenger</th><th>Route</th><th>Seat</th><th>Amount</th><th>Payment</th><th>Status</th><th>Action</th></tr></thead><tbody>{visible.map((b)=>{
                  const paymentPending = b.paymentStatus === "Pending Verification";
                  const canConfirm = b.status === "Pending" && (b.paymentMethod === "Cash" || b.paymentStatus === "Paid");
                  return <tr key={b.id}><td><strong>{b.id}</strong><small className="d-block text-secondary">{b.date}</small></td><td><strong>{b.passenger}</strong><small className="d-block text-secondary">{b.email}</small></td><td><strong>{b.route}</strong><small className="d-block text-secondary">{b.bus}</small></td><td><span className="seat-pill">{b.seat || "—"}</span></td><td><strong>₱{Number(b.total||b.price||0).toLocaleString()}</strong></td><td><span className={`status-badge payment-badge ${paymentPending ? "pending-badge" : b.paymentStatus === "Pay at terminal" ? "payment-cash-badge" : ""}`}>{b.paymentStatus || "—"}</span></td><td><span className={`status-badge booking-status-badge ${b.status === "Pending" ? "pending-badge" : b.status === "Cancelled" || b.status === "Rejected" ? "cancelled-badge" : b.status === "Completed" ? "completed-badge" : ""}`}>{b.status}</span></td><td><div className="admin-booking-actions"><button className="btn btn-sm btn-light" onClick={()=>setSelectedBooking(b)}>Details</button>{paymentPending && <><button className="btn btn-sm btn-outline-success" onClick={()=>updatePaymentStatus(b.id,"Paid")}>Approve payment</button><button className="btn btn-sm btn-outline-danger" onClick={()=>updatePaymentStatus(b.id,"Payment Rejected")}>Reject payment</button></>}{b.status === "Pending" && <><button className="btn btn-sm btn-success" disabled={!canConfirm} title={!canConfirm ? "Approve payment first" : "Confirm booking"} onClick={()=>canConfirm&&updateBookingStatus(b.id,"Confirmed")}>Confirm</button><button className="btn btn-sm btn-outline-danger" onClick={()=>updateBookingStatus(b.id,"Rejected")}>Reject</button></>}{b.status === "Confirmed" && <button className="btn btn-sm btn-outline-success" onClick={()=>markBookingCompleted?.(b.id)}><i className="bi bi-check2-circle me-1"></i>Mark completed</button>}</div></td></tr>;
                })}</tbody></table></div>{!visible.length && <div className="empty-admin"><i className="bi bi-search"></i><strong>No reservations found</strong><span>Try a different search term or filter.</span></div>}</div>
            </>}
            {section === "buses" && <><div className="fleet-kpi-grid"><div className="fleet-kpi"><span><i className="bi bi-bus-front"></i>Total fleet</span><strong>{fleetStats.total}</strong><small>Registered buses</small></div><div className="fleet-kpi"><span><i className="bi bi-check-circle"></i>Active</span><strong>{fleetStats.active}</strong><small>Available for schedules</small></div><div className="fleet-kpi"><span><i className="bi bi-tools"></i>Maintenance</span><strong>{fleetStats.maintenance}</strong><small>Temporarily unavailable</small></div><div className="fleet-kpi"><span><i className="bi bi-people"></i>Seat capacity</span><strong>{fleetStats.capacity}</strong><small>Total registered seats</small></div></div><div className="admin-card"><div className="bus-management-tools"><div className="input-group"><span className="input-group-text"><i className="bi bi-search"></i></span><input className="form-control" placeholder="Search operator, plate, route or bus type" value={busQuery} onChange={(e)=>setBusQuery(e.target.value)}/></div><div className="fleet-filters">{["All","Active","Maintenance","Inactive"].map(status=><button key={status} className={busStatusFilter===status?"active":""} onClick={()=>setBusStatusFilter(status)}>{status}</button>)}</div><span className="bus-count"><strong>{visibleBuses.length}</strong> buses</span></div>{showBusForm && <form className="bus-form-card" onSubmit={saveBus}><div className="d-flex justify-content-between align-items-center mb-3"><div><small>{editingBus?"EDIT BUS DETAILS":"ADD NEW BUS"}</small><h4>{editingBus?"Update the selected fleet unit":"Register a bus in the BusGo fleet"}</h4></div><button type="button" className="btn btn-sm btn-light rounded-circle" onClick={()=>setShowBusForm(false)}><i className="bi bi-x-lg"></i></button></div><div className="row g-3"><div className="col-md-6"><label>Operator / Company</label><input className="form-control" value={busForm.company} onChange={e=>setBusForm({...busForm,company:e.target.value})} required/></div><div className="col-md-6"><label>Bus type</label><input className="form-control" value={busForm.type} onChange={e=>setBusForm({...busForm,type:e.target.value})} required/></div><div className="col-md-6"><label>Plate number</label><input className="form-control" placeholder="e.g. ABC 1234" value={busForm.plateNumber || ""} onChange={e=>setBusForm({...busForm,plateNumber:e.target.value})}/></div><div className="col-md-6"><label>Fleet status</label><select className="form-select" value={busForm.status || "Active"} onChange={e=>setBusForm({...busForm,status:e.target.value})}><option>Active</option><option>Maintenance</option><option>Inactive</option></select></div><div className="col-md-6"><label>From</label><input className="form-control" value={busForm.from} onChange={e=>setBusForm({...busForm,from:e.target.value})} required/></div><div className="col-md-6"><label>To</label><input className="form-control" value={busForm.to} onChange={e=>setBusForm({...busForm,to:e.target.value})} required/></div><div className="col-sm-4"><label>Departure</label><input className="form-control" value={busForm.depart} onChange={e=>setBusForm({...busForm,depart:e.target.value})}/></div><div className="col-sm-4"><label>Arrival</label><input className="form-control" value={busForm.arrive} onChange={e=>setBusForm({...busForm,arrive:e.target.value})}/></div><div className="col-sm-4"><label>Duration</label><input className="form-control" value={busForm.duration} onChange={e=>setBusForm({...busForm,duration:e.target.value})}/></div><div className="col-sm-4"><label>Fare (₱)</label><input type="number" min="0" className="form-control" value={busForm.price} onChange={e=>setBusForm({...busForm,price:e.target.value})} required/></div><div className="col-sm-4"><label>Seat capacity</label><input type="number" min="1" className="form-control" value={busForm.seats} onChange={e=>setBusForm({...busForm,seats:e.target.value})} required/></div><div className="col-sm-4"><label>Rating</label><input type="number" min="0" max="5" step="0.1" className="form-control" value={busForm.rating} onChange={e=>setBusForm({...busForm,rating:e.target.value})}/></div></div><div className="d-flex justify-content-end gap-2 mt-4"><button type="button" className="btn btn-light rounded-pill" onClick={()=>setShowBusForm(false)}>Cancel</button><button className="btn btn-primary rounded-pill px-4">{editingBus ? "Update Bus" : "Add bus"}</button></div></form>}{visibleBuses.length?<div className="table-responsive"><table className="table align-middle mb-0"><thead><tr><th>Bus</th><th>Route</th><th>Schedule</th><th>Capacity</th><th>Fare</th><th>Status</th><th>Action</th></tr></thead><tbody>{visibleBuses.map(bus=>{const status=bus.status||"Active"; return <tr key={bus.id}><td><div className="bus-name-cell"><span className="bus-icon"><i className="bi bi-bus-front"></i></span><div><strong>{bus.company}</strong><small>{bus.type}{bus.plateNumber?` · ${bus.plateNumber}`:""}</small></div></div></td><td><strong>{bus.from} → {bus.to}</strong></td><td>{bus.depart||"—"}<small className="d-block text-secondary">to {bus.arrive||"—"}</small></td><td><span className="seat-count-badge">{bus.seats} seats</span></td><td><strong>₱{Number(bus.price||0).toLocaleString()}</strong></td><td><span className={`fleet-status ${status.toLowerCase()}`}><i className={`bi ${status === "Active" ? "bi-check-circle-fill" : status === "Maintenance" ? "bi-tools" : "bi-pause-circle-fill"}`}></i>{status}</span></td><td><div className="d-flex gap-2 flex-wrap"><button className="btn btn-sm btn-light fleet-details-btn" onClick={()=>setSelectedFleetBus(bus)}><i className="bi bi-eye me-1"></i>Details</button><button className="btn btn-sm btn-outline-primary" onClick={()=>openEditBus(bus)}>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={()=>deleteBus(bus.id)}><i className="bi bi-trash"></i></button></div></td></tr>})}</tbody></table></div>:<div className="empty-admin"><i className="bi bi-bus-front"></i><strong>No buses found</strong><span>Try another search or add a new bus.</span></div>}</div></>}

            {section === "routes" && <>
  <div className="admin-route-kpis">
    <div className="admin-route-kpi"><span><i className="bi bi-signpost-2"></i>Active routes</span><strong>{visibleRoutes.length}</strong><small>Routes in the current fleet</small></div>
    <div className="admin-route-kpi"><span><i className="bi bi-clock"></i>Scheduled trips</span><strong>{buses.length}</strong><small>Published bus schedules</small></div>
    <div className="admin-route-kpi"><span><i className="bi bi-building"></i>Operators</span><strong>{new Set(buses.map(b => b.company).filter(Boolean)).size}</strong><small>Bus operators serving routes</small></div>
    <div className="admin-route-kpi"><span><i className="bi bi-wallet2"></i>Fare range</span><strong>{buses.length ? `₱${Math.min(...buses.map(b=>Number(b.price)||0)).toLocaleString()} – ₱${Math.max(...buses.map(b=>Number(b.price)||0)).toLocaleString()}` : "₱0"}</strong><small>Current listed fares</small></div>
  </div>
  <div className="admin-card admin-routes-card">
    <div className="admin-filter-row route-toolbar-pro">
      <div><strong>Routes & schedules</strong><small>Review published routes, operators, departure times and fares.</small></div>
      <div className="route-toolbar-controls"><div className="input-group"><span className="input-group-text"><i className="bi bi-search"></i></span><input className="form-control" placeholder="Search route or operator" value={routeQuery} onChange={e=>setRouteQuery(e.target.value)}/></div><span className="bus-count"><strong>{visibleRoutes.length}</strong> routes</span></div>
    </div>
    <div className="admin-route-list mt-3">
      {visibleRoutes.map(bus => <div className="admin-route-row" key={`route-${bus.id}`}>
        <div className="admin-route-main"><span className="admin-route-icon"><i className="bi bi-signpost-2"></i></span><div><strong>{bus.from} <i className="bi bi-arrow-right"></i> {bus.to}</strong><small>{bus.company || "BusGo operator"} · {bus.type || "Standard coach"}</small></div></div>
        <div className="admin-route-meta"><span><small>DEPARTURE</small><strong>{bus.depart || "TBA"}</strong></span><span><small>DURATION</small><strong>{bus.duration || "TBA"}</strong></span><span><small>FARE</small><strong>₱{Number(bus.price||0).toLocaleString()}</strong></span><span><small>SEATS</small><strong>{bus.seats || 0}</strong></span></div>
        <span className={`route-live-status ${(bus.status || "Active").toLowerCase()}`}><i className="bi bi-circle-fill"></i>{bus.status || "Active"}</span>
      </div>)}
      {!visibleRoutes.length && <div className="empty-admin"><i className="bi bi-signpost-2"></i><strong>No routes found</strong><span>Try a different route or operator search.</span></div>}
    </div>
  </div>
</>}

            {section === "passengers" && <>
              <div className="passenger-kpi-grid">
                <div className="passenger-kpi"><span><i className="bi bi-people"></i>Total passengers</span><strong>{passengerProfiles.length}</strong><small>Unique passenger accounts in reservations</small></div>
                <div className="passenger-kpi"><span><i className="bi bi-person-check"></i>Active passengers</span><strong>{passengerProfiles.filter(p=>p.activeCount>0).length}</strong><small>With pending or confirmed trips</small></div>
                <div className="passenger-kpi"><span><i className="bi bi-ticket-perforated"></i>Total reservations</span><strong>{bookings.length}</strong><small>Across all passenger records</small></div>
                <div className="passenger-kpi"><span><i className="bi bi-check2-circle"></i>Completed trips</span><strong>{completed.length}</strong><small>Finished passenger journeys</small></div>
              </div>
              <div className="admin-card passenger-management-card">
                <div className="passenger-toolbar">
                  <div><div className="card-heading mb-0"><div><small>PASSENGER DIRECTORY</small><h3>Passenger management</h3></div></div><p>Review passenger contact details, reservation history, and latest trip activity.</p></div>
                  <div className="passenger-toolbar-right"><div className="input-group passenger-search"><span className="input-group-text"><i className="bi bi-search"></i></span><input className="form-control" placeholder="Search name, email or phone" value={passengerQuery} onChange={e=>setPassengerQuery(e.target.value)}/></div><div className="passenger-filter-pills">{["All","Active","Completed"].map(x=><button key={x} className={passengerFilter===x?"active":""} onClick={()=>setPassengerFilter(x)}>{x}</button>)}</div></div>
                </div>
                <div className="passenger-table-wrap mt-3"><table className="table align-middle mb-0 passenger-table"><thead><tr><th>Passenger</th><th>Contact</th><th>Reservations</th><th>Latest trip</th><th>Status</th><th>Action</th></tr></thead><tbody>{visiblePassengers.map(p=>{const latest=p.latestBooking; const status=p.activeCount>0?"Active":p.completedCount>0?"Completed":"No active trip"; return <tr key={p.email}><td><div className="passenger-name-cell"><span className="passenger-avatar-pro">{(p.passenger||"P").charAt(0).toUpperCase()}</span><div><strong>{p.passenger||"Passenger"}</strong><small>Passenger account</small></div></div></td><td><strong className="contact-main">{p.email}</strong><small className="contact-sub">{p.phone||"No phone number"}</small></td><td><strong>{p.bookingCount}</strong><small className="contact-sub">{p.completedCount} completed</small></td><td>{latest?<><strong>{latest.route||`${latest.from||""} → ${latest.to||""}`}</strong><small className="contact-sub">{latest.date||"Date not set"} · {latest.id||"Reservation"}</small></>:<span className="text-secondary">No trips yet</span>}</td><td><span className={`passenger-status ${status.toLowerCase().replace(/\s+/g,"-")}`}><i className="bi bi-circle-fill"></i>{status}</span></td><td><button className="btn btn-sm btn-outline-primary rounded-pill px-3" onClick={()=>setSelectedPassenger(p)}>View details</button></td></tr>})}</tbody></table></div>
                {!visiblePassengers.length&&<div className="empty-admin"><i className="bi bi-people"></i><strong>No passenger records found</strong><span>Try another search term or status filter.</span></div>}
              </div>
            </>}

            {section === "reviews" && <>
              <div className="review-admin-kpis">
                <div className="review-admin-kpi"><span><i className="bi bi-star-fill"></i>Total reviews</span><strong>{reviews.length}</strong><small>Passenger feedback received</small></div>
                <div className="review-admin-kpi"><span><i className="bi bi-bar-chart-fill"></i>Average rating</span><strong>{averageReview}</strong><small>Out of 5.0 stars</small></div>
                <div className="review-admin-kpi"><span><i className="bi bi-star-fill"></i>5-star reviews</span><strong>{reviews.filter(r=>Number(r.rating)===5).length}</strong><small>Highest-rated feedback</small></div>
                <div className="review-admin-kpi"><span><i className="bi bi-patch-check"></i>Verified</span><strong>{reviews.filter(r=>r.verified).length}</strong><small>Linked to completed bookings</small></div>
              </div>
              <div className="admin-card review-management-card">
                <div className="review-toolbar">
                  <div><div className="card-heading mb-0"><div><small>PASSENGER FEEDBACK</small><h3>Reviews management</h3></div></div><p>Review ratings and passenger comments from completed trips.</p></div>
                  <div className="review-toolbar-right"><div className="input-group review-search"><span className="input-group-text"><i className="bi bi-search"></i></span><input className="form-control" placeholder="Search passenger, route or booking" value={reviewQuery} onChange={e=>setReviewQuery(e.target.value)}/></div><div className="review-filter-pills">{["All","5","4","3","2","1"].map(x=><button key={x} className={reviewFilter===x?"active":""} onClick={()=>setReviewFilter(x)}>{x === "All" ? "All" : `${x}★`}</button>)}</div></div>
                </div>
                <div className="review-admin-list">
                  {visibleReviews.map(r=><div className="review-admin-row" key={r.id}>
                    <span className="review-admin-avatar">{(r.passenger||"P").charAt(0).toUpperCase()}</span>
                    <div className="review-admin-main"><div className="review-admin-name"><strong>{r.passenger||"Passenger"}</strong>{r.verified && <span><i className="bi bi-patch-check-fill"></i> Verified</span>}</div><small>{r.route||"Trip review"} · {r.operator||"BusGo"} · {r.bookingId||"—"}</small><p>{r.comment || "No written comment provided."}</p></div>
                    <div className="review-admin-rating"><strong>{Number(r.rating||0).toFixed(1)}</strong><span>{"★".repeat(Math.max(0,Math.min(5,Number(r.rating||0))))}{"☆".repeat(Math.max(0,5-Math.min(5,Number(r.rating||0))))}</span><small>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "Recently"}</small></div>
                    <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={()=>setSelectedReview(r)}>View</button>
                  </div>)}
                  {!visibleReviews.length && <div className="empty-admin"><i className="bi bi-star"></i><strong>No reviews found</strong><span>Try another search or rating filter.</span></div>}
                </div>
              </div>
            </>}

            {section === "reports" && <>
              <div className="admin-report-kpis">
                <div className="admin-report-kpi"><span><i className="bi bi-cash-stack"></i>Confirmed revenue</span><strong>₱{revenue.toLocaleString()}</strong><small>From confirmed reservations</small></div>
                <div className="admin-report-kpi"><span><i className="bi bi-flag"></i>Completed revenue</span><strong>₱{completedRevenue.toLocaleString()}</strong><small>Finished trips</small></div>
                <div className="admin-report-kpi"><span><i className="bi bi-credit-card"></i>Verified payments</span><strong>₱{paidRevenue.toLocaleString()}</strong><small>{pendingPayments} payment{pendingPayments === 1 ? "" : "s"} waiting for review</small></div>
                <div className="admin-report-kpi"><span><i className="bi bi-receipt"></i>Average booking</span><strong>₱{averageBooking.toLocaleString()}</strong><small>Across all reservations</small></div>
              </div>

              <div className="admin-report-grid">
                <div className="admin-card">
                  <div className="card-heading"><div><small>RESERVATION STATUS</small><h3>Booking performance</h3></div><span className="report-period">Current records</span></div>
                  <div className="report-status-list">
                    {[
                      ["Confirmed", confirmed.length, "confirmed", "bi-check-circle"],
                      ["Completed", completed.length, "completed", "bi-flag"],
                      ["Pending", pending.length, "pending", "bi-hourglass-split"],
                      ["Cancelled", cancelled.length, "cancelled", "bi-x-circle"]
                    ].map(([label, value, tone, icon]) => {
                      const percent = bookings.length ? Math.round((value / bookings.length) * 100) : 0;
                      return <div className="report-status-row" key={label}>
                        <span className={`report-status-icon ${tone}`}><i className={`bi ${icon}`}></i></span>
                        <div className="report-status-copy"><strong>{label}</strong><div className="report-progress"><i className={tone} style={{ width: `${percent}%` }}></i></div></div>
                        <b>{value}</b><small>{percent}%</small>
                      </div>;
                    })}
                  </div>
                </div>

                <div className="admin-card">
                  <div className="card-heading"><div><small>PAYMENT HEALTH</small><h3>Payment overview</h3></div></div>
                  <div className="payment-health-grid">
                    <div><span>Paid</span><strong>{bookings.filter(b => b.paymentStatus === "Paid").length}</strong></div>
                    <div><span>Pending verification</span><strong>{pendingPayments}</strong></div>
                    <div><span>Pay at terminal</span><strong>{bookings.filter(b => b.paymentMethod === "Cash").length}</strong></div>
                    <div><span>Total processed</span><strong>₱{paidRevenue.toLocaleString()}</strong></div>
                  </div>
                  <div className="report-payment-note"><i className="bi bi-shield-check"></i><span>Only verified online payments are included in confirmed payment revenue.</span></div>
                </div>
              </div>

              <div className="admin-report-grid lower">
                <div className="admin-card">
                  <div className="card-heading"><div><small>ROUTE PERFORMANCE</small><h3>Most active routes</h3></div><span className="report-period">By bookings</span></div>
                  <div className="route-performance-list">
                    {routePerformance.slice(0, 6).map((route, index) => {
                      const max = Math.max(routePerformance[0]?.bookings || 1, 1);
                      return <div className="route-performance-row" key={`${route.id}-${route.from}-${route.to}`}>
                        <span className="route-rank">{index + 1}</span>
                        <div className="route-performance-copy"><strong>{route.from} → {route.to}</strong><small>{route.company || "BusGo operator"}</small><div className="report-progress"><i style={{ width: `${Math.max(7, route.bookings / max * 100)}%` }}></i></div></div>
                        <div className="route-performance-value"><strong>{route.bookings}</strong><small>bookings</small><b>₱{route.revenue.toLocaleString()}</b></div>
                      </div>;
                    })}
                    {!routePerformance.length && <div className="empty-admin">No route performance data yet.</div>}
                  </div>
                </div>

                <div className="admin-card">
                  <div className="card-heading"><div><small>RECENT COMPLETIONS</small><h3>Finished trips</h3></div><span className="report-period">Latest 5</span></div>
                  <div className="report-completed-list">
                    {completed.slice(0, 5).map((booking) => <div className="report-completed-row" key={booking.id}><span className="completed-check"><i className="bi bi-check2"></i></span><div><strong>{booking.id}</strong><small>{booking.passenger} · {booking.route}</small></div><b>₱{Number(booking.total || booking.price || 0).toLocaleString()}</b></div>)}
                    {!completed.length && <div className="empty-admin">No completed trips yet.</div>}
                  </div>
                </div>
              </div>
            </>}

            {section === "alerts" && <div className="admin-alerts-wrap">
              <div className="admin-alerts-kpis">
                <div className="admin-alert-kpi"><span><i className="bi bi-bell"></i>Open alerts</span><strong>{systemAlerts.length}</strong><small>Items that may need admin attention</small></div>
                <div className="admin-alert-kpi"><span><i className="bi bi-ticket-perforated"></i>Pending bookings</span><strong>{pending.length}</strong><small>Reservations awaiting review</small></div>
                <div className="admin-alert-kpi"><span><i className="bi bi-credit-card"></i>Payment checks</span><strong>{pendingPayments}</strong><small>Payments waiting for verification</small></div>
              </div>
              <div className="admin-card admin-alerts-card">
                <div className="card-heading"><div><small>SYSTEM MONITOR</small><h3>Admin alerts</h3><p className="text-secondary mb-0">Important items generated from current BusGo activity.</p></div>{systemAlerts.length > 0 && <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={()=>setDismissedAlerts(systemAlerts.map(a=>a.id))}><i className="bi bi-check2-all me-1"></i>Dismiss all</button>}</div>
                <div className="admin-alert-list">
                  {systemAlerts.map(alert => <div className={`admin-alert-row ${alert.tone}`} key={alert.id}>
                    <span className="admin-alert-icon"><i className={`bi ${alert.icon}`}></i></span>
                    <div><strong>{alert.title}</strong><p>{alert.text}</p></div>
                    <button className="btn btn-sm btn-light rounded-pill" onClick={()=>setDismissedAlerts(current=>[...current,alert.id])}>Dismiss</button>
                  </div>)}
                  {!systemAlerts.length && <div className="empty-admin"><i className="bi bi-check2-circle"></i><strong>All clear</strong><span>There are no current alerts that require attention.</span></div>}
                </div>
              </div>
            </div>}

            {selectedFleetBus && <div className="fleet-detail-overlay" onClick={()=>setSelectedFleetBus(null)}><div className="fleet-detail-modal" onClick={e=>e.stopPropagation()}><div className="fleet-detail-head"><div><span className="fleet-detail-kicker"><i className="bi bi-bus-front"></i> Fleet unit</span><h3>{selectedFleetBus.company || "BusGo operator"}</h3><p>{selectedFleetBus.type || "Standard coach"}{selectedFleetBus.plateNumber ? ` · ${selectedFleetBus.plateNumber}` : ""}</p></div><button className="btn btn-light rounded-circle" onClick={()=>setSelectedFleetBus(null)}><i className="bi bi-x-lg"></i></button></div><div className="fleet-detail-status-row"><span className={`fleet-status ${(selectedFleetBus.status || "Active").toLowerCase()}`}><i className={`bi ${(selectedFleetBus.status || "Active") === "Active" ? "bi-check-circle-fill" : (selectedFleetBus.status || "Active") === "Maintenance" ? "bi-tools" : "bi-pause-circle-fill"}`}></i>{selectedFleetBus.status || "Active"}</span><span className="fleet-detail-route"><i className="bi bi-signpost-2"></i>{selectedFleetBus.from} <i className="bi bi-arrow-right"></i> {selectedFleetBus.to}</span></div><div className="fleet-detail-grid"><div><small>DEPARTURE</small><strong>{selectedFleetBus.depart || "TBA"}</strong></div><div><small>ARRIVAL</small><strong>{selectedFleetBus.arrive || "TBA"}</strong></div><div><small>DURATION</small><strong>{selectedFleetBus.duration || "TBA"}</strong></div><div><small>SEAT CAPACITY</small><strong>{selectedFleetBus.seats || 0}</strong></div><div><small>FARE</small><strong>₱{Number(selectedFleetBus.price || 0).toLocaleString()}</strong></div><div><small>RATING</small><strong><i className="bi bi-star-fill text-warning"></i> {Number(selectedFleetBus.rating || 0).toFixed(1)}</strong></div></div><div className="fleet-maintenance-panel"><div><span><i className="bi bi-tools"></i> Maintenance status</span><strong>{selectedFleetBus.status === "Maintenance" ? "Currently under maintenance" : "Ready for scheduled operation"}</strong></div><p>{selectedFleetBus.status === "Maintenance" ? "This unit should remain unavailable for new schedules until maintenance is completed." : "Keep preventive maintenance records updated before assigning this unit to a new trip."}</p><div className="fleet-maintenance-meta"><span><small>PLATE NUMBER</small><strong>{selectedFleetBus.plateNumber || "Not assigned"}</strong></span><span><small>OPERATOR</small><strong>{selectedFleetBus.company || "BusGo operator"}</strong></span></div></div><div className="fleet-detail-actions"><button className="btn btn-light rounded-pill" onClick={()=>setSelectedFleetBus(null)}>Close</button><button className="btn btn-primary rounded-pill px-4" onClick={()=>{setSelectedFleetBus(null);openEditBus(selectedFleetBus)}}><i className="bi bi-pencil me-2"></i>Edit fleet details</button></div></div></div>}

            {section === "operations" && <div className="operations-center-wrap">
              <div className="operations-kpis">
                <div className="operations-kpi"><span><i className="bi bi-calendar-check"></i>Confirmed trips</span><strong>{confirmed.length}</strong><small>Current confirmed reservations</small></div>
                <div className="operations-kpi"><span><i className="bi bi-hourglass-split"></i>Needs action</span><strong>{pending.length + pendingPayments}</strong><small>Bookings or payments awaiting review</small></div>
                <div className="operations-kpi"><span><i className="bi bi-bus-front"></i>Fleet ready</span><strong>{fleetStats.active}/{fleetStats.total}</strong><small>Active buses in the fleet</small></div>
                <div className="operations-kpi"><span><i className="bi bi-people"></i>Booked seats</span><strong>{activeTripBookings.length}</strong><small>Seats currently tied to active trips</small></div>
              </div>
              <div className="operations-grid">
                <div className="admin-card operations-panel">
                  <div className="card-heading"><div><small>LIVE QUEUE</small><h3>Action queue</h3><p className="text-secondary mb-0">Items that may need attention before the next departures.</p></div></div>
                  <div className="operations-queue">
                    {pending.length > 0 && <button className="operations-queue-row" onClick={()=>setSection("bookings")}><span className="operations-queue-icon warning"><i className="bi bi-ticket-perforated"></i></span><div><strong>{pending.length} pending reservation{pending.length===1?"":"s"}</strong><small>Review and confirm eligible bookings.</small></div><i className="bi bi-chevron-right"></i></button>}
                    {pendingPayments > 0 && <button className="operations-queue-row" onClick={()=>setSection("bookings")}><span className="operations-queue-icon danger"><i className="bi bi-credit-card"></i></span><div><strong>{pendingPayments} payment verification{pendingPayments===1?"":"s"}</strong><small>Check payment status before confirmation.</small></div><i className="bi bi-chevron-right"></i></button>}
                    {fleetStats.maintenance > 0 && <button className="operations-queue-row" onClick={()=>setSection("buses")}><span className="operations-queue-icon info"><i className="bi bi-tools"></i></span><div><strong>{fleetStats.maintenance} bus{fleetStats.maintenance===1?"":"es"} under maintenance</strong><small>These units should remain unavailable.</small></div><i className="bi bi-chevron-right"></i></button>}
                    {!pending.length && !pendingPayments && !fleetStats.maintenance && <div className="operations-clear"><i className="bi bi-check2-circle"></i><strong>Operations are clear</strong><span>No urgent queue items right now.</span></div>}
                  </div>
                </div>
                <div className="admin-card operations-panel">
                  <div className="card-heading"><div><small>NEXT DEPARTURES</small><h3>Upcoming trips</h3></div><button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={()=>setSection("bookings")}>View bookings</button></div>
                  <div className="operations-departures">
                    {upcomingDepartures.map(b=><div className="operations-departure" key={`ops-${b.id}`}><span className="operations-time">{b.time||"TBA"}</span><div><strong>{b.route||`${b.from||""} → ${b.to||""}`}</strong><small>{b.date||"Date not set"} · {b.bus||"BusGo operator"}</small></div><span className="operations-seat">Seat {b.seat||"—"}</span></div>)}
                    {!upcomingDepartures.length && <div className="compact-empty"><i className="bi bi-calendar-x"></i><strong>No upcoming confirmed trips</strong><span>Confirmed departures will appear here.</span></div>}
                  </div>
                </div>
              </div>
            </div>}

            {section === "settings" && <div className="admin-settings-grid">
              <div className="admin-card admin-settings-main">
                <div className="card-heading"><div><small>SYSTEM PREFERENCES</small><h3>BusGo settings</h3><p className="text-secondary mb-0">Control the basic booking and notification behavior of the admin workspace.</p></div></div>
                <div className="settings-section"><div><strong>Booking cutoff</strong><small>Minimum hours before departure when a new reservation can be made.</small></div><select className="form-select" value={settings.bookingCutoff} onChange={e=>setSettings({...settings,bookingCutoff:e.target.value})}><option value="1">1 hour</option><option value="2">2 hours</option><option value="4">4 hours</option><option value="12">12 hours</option><option value="24">24 hours</option></select></div>
                <div className="settings-toggle"><div><strong>Automatic trip completion</strong><small>Move confirmed reservations to Completed after their scheduled trip.</small></div><button type="button" className={`settings-switch ${settings.autoComplete?"on":""}`} onClick={()=>setSettings({...settings,autoComplete:!settings.autoComplete})} aria-label="Toggle automatic trip completion"><span></span></button></div>
                <div className="settings-toggle"><div><strong>Online payments</strong><small>Allow passengers to choose online payment during checkout.</small></div><button type="button" className={`settings-switch ${settings.onlinePayments?"on":""}`} onClick={()=>setSettings({...settings,onlinePayments:!settings.onlinePayments})} aria-label="Toggle online payments"><span></span></button></div>
                <div className="settings-toggle"><div><strong>Booking email alerts</strong><small>Show booking and payment updates in the passenger notification flow.</small></div><button type="button" className={`settings-switch ${settings.emailAlerts?"on":""}`} onClick={()=>setSettings({...settings,emailAlerts:!settings.emailAlerts})} aria-label="Toggle booking alerts"><span></span></button></div>
                <div className="settings-actions"><button className="btn btn-primary rounded-pill px-4" onClick={()=>{localStorage.setItem("busgo_admin_settings",JSON.stringify(settings));setSettingsSaved(true);setTimeout(()=>setSettingsSaved(false),1800)}}><i className="bi bi-check2 me-2"></i>Save settings</button>{settingsSaved&&<span><i className="bi bi-check-circle me-1"></i>Settings saved</span>}</div>
              </div>
              <div className="admin-settings-side">
                <div className="admin-card settings-status-card"><span className="settings-status-icon"><i className="bi bi-shield-check"></i></span><small>SYSTEM STATUS</small><h4>{settings.maintenanceMode ? "Maintenance mode" : "System ready"}</h4><p>{settings.maintenanceMode ? "Passenger access is marked for maintenance." : "BusGo is configured for normal passenger operations."}</p><button className={`btn rounded-pill ${settings.maintenanceMode?"btn-warning":"btn-outline-secondary"}`} onClick={()=>setSettings({...settings,maintenanceMode:!settings.maintenanceMode})}>{settings.maintenanceMode?"Disable maintenance":"Enable maintenance"}</button></div>
                <div className="admin-card"><div className="card-heading"><div><small>CONFIGURATION</small><h3>Current setup</h3></div></div><div className="settings-summary"><span><i className="bi bi-clock"></i>Booking cutoff<strong>{settings.bookingCutoff}h</strong></span><span><i className="bi bi-credit-card"></i>Payments<strong>{settings.onlinePayments?"Enabled":"Disabled"}</strong></span><span><i className="bi bi-bell"></i>Alerts<strong>{settings.emailAlerts?"Enabled":"Disabled"}</strong></span></div></div>
              </div>
            </div>}

            {section === "activity" && <div className="admin-card">
              <div className="card-heading"><div><small>ACTIVITY LOG</small><h3>Recent activity</h3></div><div className="d-flex gap-2 align-items-center"><span className="text-secondary small">Last {Math.min(activityLogs.length, 50)} events</span>{activityLogs.length > 0 && <button className="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => { if (window.confirm("Clear all activity logs?")) setActivityLogs?.([]); }}>Clear logs</button>}</div></div>
              <div className="activity-list">
                {activityLogs.slice(0, 50).map((log) => {
                  const icon = log.tone === "success" ? "bi-check2-circle" : log.tone === "danger" ? "bi-x-circle" : "bi-clock-history";
                  const when = log.time ? new Date(log.time).toLocaleString() : "Recently";
                  return <div className="activity-row" key={log.id}><span className={`activity-icon ${log.tone || "info"}`}><i className={`bi ${icon}`}></i></span><div><strong>{log.action}</strong><small>{log.details}{log.bookingId ? ` · ${log.bookingId}` : ""}</small></div><span title={when}>{when}</span></div>;
                })}
                {!activityLogs.length && <div className="empty-admin"><i className="bi bi-clock-history"></i><strong>No activity yet</strong><span>Reservation, payment, confirmation, and completion actions will appear here.</span></div>}
              </div>
            </div>}
          </div>
        </div>
      </div>

      {selectedPassenger && <div className="details-modal-backdrop" onClick={()=>setSelectedPassenger(null)}><div className="details-modal admin-passenger-modal" onClick={e=>e.stopPropagation()}><div className="details-modal-head"><div><span className="section-label">Passenger profile</span><h2>{selectedPassenger.passenger||"Passenger"}</h2><p>{selectedPassenger.email}</p></div><button className="btn-close" onClick={()=>setSelectedPassenger(null)}></button></div><div className="passenger-profile-head"><span className="passenger-avatar-large">{(selectedPassenger.passenger||"P").charAt(0).toUpperCase()}</span><div><strong>{selectedPassenger.passenger||"Passenger"}</strong><span>{selectedPassenger.phone||"No phone number"}</span></div><span className={`passenger-status ${selectedPassenger.activeCount>0?"active":"completed"}`}>{selectedPassenger.activeCount>0?"Active":"Completed"}</span></div><div className="passenger-detail-grid"><div><span>Email</span><strong>{selectedPassenger.email}</strong></div><div><span>Phone</span><strong>{selectedPassenger.phone||"Not provided"}</strong></div><div><span>Total reservations</span><strong>{selectedPassenger.bookingCount}</strong></div><div><span>Completed trips</span><strong>{selectedPassenger.completedCount}</strong></div></div><div className="passenger-history"><div className="passenger-history-head"><strong>Reservation history</strong><span>{selectedPassenger.bookingCount} record{selectedPassenger.bookingCount===1?"":"s"}</span></div>{selectedPassenger.bookings.slice(0,6).map(b=><div className="passenger-history-row" key={b.id}><div><strong>{b.id}</strong><small>{b.route||"Trip reservation"} · {b.date||"Date not set"}</small></div><div><strong>₱{Number(b.total||b.price||0).toLocaleString()}</strong><span className={`status-badge booking-status-badge ${b.status === "Pending" ? "pending-badge" : b.status === "Completed" ? "completed-badge" : b.status === "Cancelled" || b.status === "Rejected" ? "cancelled-badge" : ""}`}>{b.status}</span></div></div>)}</div><div className="details-modal-actions"><button className="btn btn-outline-secondary" onClick={()=>setSelectedPassenger(null)}>Close</button></div></div></div>}

      {selectedReview && <div className="details-modal-backdrop" onClick={()=>setSelectedReview(null)}><div className="details-modal admin-review-modal" onClick={e=>e.stopPropagation()}><div className="details-modal-head"><div><span className="section-label">Passenger review</span><h2>{selectedReview.passenger||"Passenger"}</h2><p>{selectedReview.bookingId||"Review record"} · {selectedReview.createdAt ? new Date(selectedReview.createdAt).toLocaleString() : "Recently"}</p></div><button className="btn-close" onClick={()=>setSelectedReview(null)}></button></div><div className="review-detail-rating"><strong>{Number(selectedReview.rating||0).toFixed(1)}</strong><span>{"★".repeat(Math.max(0,Math.min(5,Number(selectedReview.rating||0))))}{"☆".repeat(Math.max(0,5-Math.min(5,Number(selectedReview.rating||0))))}</span>{selectedReview.verified && <em><i className="bi bi-patch-check-fill"></i> Verified passenger</em>}</div><div className="review-detail-route"><div><span>Route</span><strong>{selectedReview.route||"—"}</strong></div><div><span>Operator</span><strong>{selectedReview.operator||"—"}</strong></div></div><div className="review-detail-scores"><div><span>Comfort</span><strong>{selectedReview.comfort||selectedReview.rating||0}/5</strong></div><div><span>Cleanliness</span><strong>{selectedReview.cleanliness||selectedReview.rating||0}/5</strong></div><div><span>Punctuality</span><strong>{selectedReview.punctuality||selectedReview.rating||0}/5</strong></div><div><span>Staff & service</span><strong>{selectedReview.service||selectedReview.rating||0}/5</strong></div></div><div className="review-detail-comment"><span>Passenger comment</span><p>{selectedReview.comment||"No written comment provided."}</p></div><div className="details-modal-actions"><button className="btn btn-outline-secondary" onClick={()=>setSelectedReview(null)}>Close</button><button className="btn btn-outline-danger" onClick={()=>{if(window.confirm("Remove this review from BusGo feedback?")){setReviews?.(current=>current.filter(x=>x.id!==selectedReview.id));setSelectedReview(null);}}}><i className="bi bi-trash me-2"></i>Remove review</button></div></div></div>}

      {selectedBooking && <div className="details-modal-backdrop" onClick={()=>setSelectedBooking(null)}><div className="details-modal admin-booking-modal" onClick={e=>e.stopPropagation()}><div className="details-modal-head"><div><span className="section-label">Booking details</span><h2>{selectedBooking.id}</h2><p>{selectedBooking.status} · {selectedBooking.bookedAt||"Booking record"}</p></div><button className="btn-close" onClick={()=>setSelectedBooking(null)}></button></div><div className="booking-detail-grid"><div><span>Passenger</span><strong>{selectedBooking.passenger}</strong><small>{selectedBooking.email}</small></div><div><span>Route</span><strong>{selectedBooking.route}</strong><small>{selectedBooking.bus}</small></div><div><span>Travel date</span><strong>{selectedBooking.date}</strong><small>{selectedBooking.time} – {selectedBooking.arrival}</small></div><div><span>Seat</span><strong>{selectedBooking.seat}</strong><small>{selectedBooking.phone||"No phone"}</small></div><div><span>Payment</span><strong>{selectedBooking.paymentMethod||"—"}</strong><small>{selectedBooking.paymentStatus||"—"}</small></div><div><span>Refund</span><strong>{selectedBooking.refundStatus||"—"}</strong><small>{selectedBooking.status === "Cancelled" ? "Cancellation record" : "No refund request"}</small></div><div><span>Total</span><strong>₱{Number(selectedBooking.total||selectedBooking.price||0).toLocaleString()}</strong><small>Fare + booking fee</small></div></div><div className="details-modal-actions"><button className="btn btn-outline-secondary" onClick={()=>setSelectedBooking(null)}>Close</button>{selectedBooking.status === "Pending" && <button className="btn btn-primary" disabled={selectedBooking.paymentMethod !== "Cash" && selectedBooking.paymentStatus !== "Paid"} title={selectedBooking.paymentMethod !== "Cash" && selectedBooking.paymentStatus !== "Paid" ? "Approve payment first" : "Confirm booking"} onClick={()=>{updateBookingStatus(selectedBooking.id,"Confirmed");setSelectedBooking(null)}}>Confirm booking</button>}{selectedBooking.status === "Confirmed" && <button className="btn btn-success" onClick={()=>{markBookingCompleted?.(selectedBooking.id);setSelectedBooking(null)}}><i className="bi bi-check2-circle me-2"></i>Mark as completed</button>}</div></div></div>}
    </main>
  );
}

export default AdminOverview;

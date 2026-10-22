import React, { useMemo, useState } from "react";

export default function Notifications({ account, notifications = [], setNotifications, go }) {
  const [filter, setFilter] = useState("all");

  const visible = useMemo(() => notifications.filter((n) => {
    const audience = account?.role === "admin" ? "admin" : "passenger";
    if (n.audience && n.audience !== audience) return false;
    if (n.email && n.email !== account?.email) return false;
    if (filter === "unread") return !n.read;
    if (filter === "booking") return /reservation|booking|payment|ticket/i.test(`${n.title} ${n.text}`);
    if (filter === "trip") return /trip|boarding|departure|travel/i.test(`${n.title} ${n.text}`);
    return true;
  }), [notifications, account, filter]);

  const unread = visible.filter((n) => !n.read).length;

  const markRead = (id) => setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAll = () => setNotifications(notifications.map((n) => visible.some((v) => v.id === n.id) ? { ...n, read: true } : n));
  const clearAll = () => setNotifications(notifications.filter((n) => !visible.some((v) => v.id === n.id)));

  return (
    <main className="page-content notifications-page">
      <div className="container">
        <div className="page-hero notifications-hero">
          <div>
            <span className="section-label"><i className="bi bi-bell me-2"></i>BusGo updates</span>
            <h1>Notifications</h1>
            <p>Stay updated with your reservations, payments, and upcoming trips.</p>
          </div>
          <div className="notification-count-card">
            <strong>{unread}</strong>
            <span>Unread updates</span>
          </div>
        </div>

        <div className="notification-toolbar">
          <div className="notification-filters">
            {[['all','All'],['unread','Unread'],['booking','Bookings'],['trip','Trips']].map(([key,label]) => (
              <button key={key} className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>{label}</button>
            ))}
          </div>
          <div className="notification-actions">
            <button className="btn btn-sm btn-outline-primary" onClick={markAll} disabled={!unread}><i className="bi bi-check2-all me-1"></i>Mark all read</button>
            <button className="btn btn-sm btn-light" onClick={clearAll} disabled={!visible.length}><i className="bi bi-trash3 me-1"></i>Clear</button>
          </div>
        </div>

        <section className="notification-center-card">
          {visible.length ? visible.map((n) => (
            <button key={n.id} className={`notification-center-item ${n.read ? 'read' : 'unread'} ${n.type || 'info'}`} onClick={() => markRead(n.id)}>
              <span className="notification-center-icon"><i className={`bi ${n.type === 'success' ? 'bi-check2-circle' : n.type === 'warning' ? 'bi-exclamation-circle' : 'bi-info-circle'}`}></i></span>
              <span className="notification-center-copy">
                <strong>{n.title}</strong>
                <span>{n.text}</span>
                <small>{n.time || 'Recently'}</small>
              </span>
              {!n.read && <span className="notification-unread-dot"></span>}
            </button>
          )) : (
            <div className="notification-center-empty">
              <div className="empty-icon"><i className="bi bi-bell-slash"></i></div>
              <h3>You're all caught up</h3>
              <p>Booking and trip updates will appear here.</p>
              <button className="btn btn-primary" onClick={() => go('schedules')}><i className="bi bi-search me-2"></i>Find a trip</button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

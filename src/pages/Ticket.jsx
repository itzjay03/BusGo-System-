function FakeQR({ value }) {
  const cells = Array.from({ length: 225 }, (_, i) => {
    const x = (i * 17 + value.length * 7 + Math.floor(i / 15) * 13) % 11;
    const r = Math.floor(i / 15), c = i % 15;
    const finder = (r < 7 && c < 7) || (r < 7 && c >= 8) || (r >= 8 && c < 7);
    return finder ? ((r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) && c !== 7) : x > 4;
  });
  return <div className="fake-qr" aria-label={`Boarding code for ${value}`}>{cells.map((on, i) => <span key={i} className={on ? "on" : ""}></span>)}</div>;
}

function Ticket({ booking, go }) {
  const confirmed = booking.status === "Confirmed";
  const pending = booking.status === "Pending";
  const print = () => window.print();
  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(booking.id);
      window.alert("Booking reference copied.");
    } catch {
      window.prompt("Copy your booking reference:", booking.id);
    }
  };
  const download = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>BusGo ${booking.id}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#172033}main{max-width:700px;margin:auto;border:1px solid #dbe3ef;border-radius:18px;padding:28px}h1{margin:0 0 8px}h2{margin-top:26px;border-top:1px solid #e5e7eb;padding-top:18px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px}.item{padding:12px;background:#f5f7fb;border-radius:10px}.label{display:block;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:bold;letter-spacing:.8px}.value{display:block;margin-top:5px;font-weight:bold}</style></head><body><main><h1>BusGo Digital Ticket</h1><div>Booking reference: <strong>${booking.id}</strong></div><h2>${booking.from} → ${booking.to}</h2><div class="grid"><div class="item"><span class="label">Passenger</span><span class="value">${booking.passenger}</span></div><div class="item"><span class="label">Seat</span><span class="value">${booking.seat}</span></div><div class="item"><span class="label">Travel date</span><span class="value">${booking.date}</span></div><div class="item"><span class="label">Departure</span><span class="value">${booking.time}</span></div><div class="item"><span class="label">Operator</span><span class="value">${booking.bus}</span></div><div class="item"><span class="label">Payment status</span><span class="value">${booking.paymentStatus || "Pending"}</span></div></div><h2>Total: ₱${booking.total || booking.price}</h2><p>Show this ticket and your booking reference when boarding.</p></main></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${booking.id}-BusGo-Ticket.html`; a.click(); URL.revokeObjectURL(url);
  };
  return <main className="page-content">
    <div className="container ticket-page">
      <div className="ticket-success text-center mb-4">
        <div className={`ticket-result-icon ${confirmed ? "confirmed" : "pending"}`}><i className={`bi ${confirmed ? "bi-check-lg" : "bi-hourglass-split"}`}></i></div>
        <span className="section-label">{confirmed ? "Reservation confirmed" : "Waiting for confirmation"}</span>
        <h1>{confirmed ? "Your BusGo ticket is ready" : "Your BusGo reservation is being processed"}</h1>
        <p className="text-secondary">Booking reference <strong>{booking.id}</strong> · Keep this ticket ready when you travel.</p>
        <div className="ticket-stepper mx-auto" aria-label="Booking progress">
          <span className="done"><i className="bi bi-check2"></i>Booked</span><i className="bi bi-chevron-right"></i>
          <span className={confirmed ? "done" : "active"}>{confirmed ? <i className="bi bi-check2"></i> : <i className="bi bi-hourglass-split"></i>}Confirmation</span><i className="bi bi-chevron-right"></i>
          <span className={confirmed ? "active" : ""}><i className="bi bi-ticket-perforated"></i>Ticket</span>
        </div>
      </div>

      <div className="digital-ticket mx-auto">
        <div className="ticket-brand"><div><strong><i className="bi bi-bus-front-fill me-2"></i>BusGo</strong><small>DIGITAL BOARDING PASS</small></div><span className={`status-badge ${pending ? "pending-badge" : booking.status === "Cancelled" ? "cancelled-badge" : ""}`}>{booking.status}</span></div>
        <div className="ticket-main"><div><small>BOOKING REFERENCE</small><h4>{booking.id}</h4><button className="ticket-copy" onClick={copyReference}><i className="bi bi-copy me-1"></i>Copy reference</button></div><div className="text-end"><small>SEAT</small><h4>{booking.seat}</h4></div></div>
        <div className="ticket-journey"><div><small>DEPARTURE</small><strong>{booking.from}</strong><span>{booking.time}</span></div><div className="ticket-route-line"><span></span><i className="bi bi-bus-front-fill"></i><span></span></div><div><small>ARRIVAL</small><strong>{booking.to}</strong><span>{booking.arrival}</span></div></div>
        <div className="ticket-grid"><div><small>PASSENGER</small><strong>{booking.passenger}</strong></div><div><small>TRAVEL DATE</small><strong>{booking.date}</strong></div><div><small>OPERATOR</small><strong>{booking.bus}</strong></div><div><small>SEAT</small><strong>{booking.seat}</strong></div><div><small>PAYMENT</small><strong>{booking.paymentMethod || "Pending"}</strong></div><div><small>TOTAL</small><strong>₱{booking.total || booking.price}</strong></div><div><small>TRANSACTION</small><strong>{booking.transactionRef || "Pending"}</strong></div><div><small>BOARDING TIME</small><strong>{booking.boardingTime || booking.time || "TBA"}</strong></div><div><small>PAYMENT STATUS</small><strong>{booking.paymentStatus || "Pending"}</strong></div></div>
        <div className="boarding-highlight"><div><i className="bi bi-door-open-fill"></i><span>Boarding point<strong>{booking.boardingPoint || `${booking.from} Central Terminal`}</strong></span></div><div><i className="bi bi-geo-alt-fill"></i><span>Drop-off point<strong>{booking.dropOffPoint || `${booking.to} Bus Terminal`}</strong></span></div><div><i className="bi bi-clock-fill"></i><span>Arrival<strong>{booking.arrival}</strong></span></div></div>
        <div className="ticket-divider"><span></span><span></span></div>
        <div className="ticket-bottom"><div className="qr-wrap"><div className="qr-label"><i className="bi bi-qr-code-scan"></i><span>BOARDING QR</span></div><FakeQR value={booking.id} /><strong className="qr-reference">{booking.id}</strong><small>{confirmed ? "Scan this code at boarding" : "Available after confirmation"}</small></div><div className="ticket-note"><h6><i className="bi bi-shield-check me-2"></i>Boarding instructions</h6><ul><li>Arrive at the terminal at least 30 minutes before departure.</li><li>Show your BusGo ticket or booking reference at boarding.</li><li>Bring a valid ID and keep this ticket accessible.</li></ul></div></div>
        <div className="receipt-breakdown"><div><span>Ticket fare</span><strong>₱{booking.price}</strong></div><div><span>Booking fee</span><strong>₱{booking.bookingFee || 0}</strong></div>{Number(booking.discount || 0) > 0 && <div className="discount-row"><span>Promo discount</span><strong>-₱{booking.discount}</strong></div>}</div><div className="ticket-total-row"><span>Total fare</span><strong>₱{booking.total || booking.price}</strong></div>
        <div className="ticket-actions"><button className="btn btn-primary" onClick={print}><i className="bi bi-printer me-2"></i>Print ticket</button><button className="btn btn-outline-primary" onClick={download}><i className="bi bi-download me-2"></i>Download</button>{confirmed && <button className="btn btn-outline-success" onClick={() => go("travel-center")}><i className="bi bi-person-check me-2"></i>Check-in</button>}<button className="btn btn-light" onClick={() => go("my-trip")}><i className="bi bi-map me-2"></i>My Trip</button></div>
      </div>
    </div>
  </main>;
}
export default Ticket;

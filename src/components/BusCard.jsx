function BusCard({ bus, onSelect, onDetails }) {
  const popular = Number(bus.rating || 0) >= 4.7;
  const seats = Number(bus.seats || 0);
  const seatTone = seats <= 8 ? "limited" : "open";
  const status = bus.status || (seats > 0 ? "Available" : "Full");
  const isAvailable = status.toLowerCase() === "available" && seats > 0;

  return (
    <article className={`bus-card trip-result-card ${!isAvailable ? "trip-unavailable" : ""}`}>
      <div className="trip-result-main">
        <div className="trip-operator-block">
          <div className="operator-icon trip-operator-icon"><i className="bi bi-bus-front-fill"></i></div>
          <div className="trip-operator-copy">
            <div className="trip-operator-name-row">
              <strong>{bus.company}</strong>
              {popular && isAvailable && <span className="trip-recommended"><i className="bi bi-check-circle-fill"></i> Recommended</span>}
            </div>
            <span>{bus.type}</span>
            <div className="trip-rating"><i className="bi bi-star-fill"></i><strong>{bus.rating}</strong><span>Passenger rating</span></div>
          </div>
        </div>

        <div className="trip-route-block">
          <div className="trip-point">
            <span className="trip-label">DEPARTURE</span>
            <strong>{bus.depart}</strong>
            <small>{bus.from}</small>
          </div>
          <div className="trip-route-middle">
            <span>{bus.duration}</span>
            <div className="trip-route-line"><i className="bi bi-circle-fill"></i><span></span><i className="bi bi-geo-alt-fill"></i></div>
            <small>Direct trip</small>
          </div>
          <div className="trip-point trip-point-arrive">
            <span className="trip-label">ARRIVAL</span>
            <strong>{bus.arrive}</strong>
            <small>{bus.to}</small>
          </div>
        </div>

        <div className="trip-fare-block">
          <span className="trip-label">FARE FROM</span>
          <strong>₱{bus.price}</strong>
          <small>per passenger</small>
          <span className="fare-note"><i className="bi bi-shield-check"></i> Secure booking</span>
        </div>
      </div>

      <div className="trip-result-bottom">
        <div className="trip-features">
          <span><i className="bi bi-snow2"></i> Air-conditioned</span>
          <span><i className="bi bi-usb-plug"></i> USB charging</span>
          <span className={`trip-seat-status ${seatTone}`}><i className="bi bi-person-check"></i> {seats} seats available</span>
          <span className={`trip-availability ${isAvailable ? "available" : "unavailable"}`}><i className={`bi ${isAvailable ? "bi-check-circle-fill" : "bi-x-circle-fill"}`}></i> {status}</span>
        </div>
        <div className="trip-card-actions">
          <button className="btn details-link" onClick={() => onDetails?.(bus)}><i className="bi bi-eye me-1"></i>View details</button>
          <button className="btn btn-primary trip-select-btn" disabled={!isAvailable} onClick={() => onSelect(bus)}>
            {isAvailable ? "Select seat" : "Unavailable"} <i className={`bi ${isAvailable ? "bi-arrow-right" : "bi-lock"} ms-1`}></i>
          </button>
        </div>
      </div>
    </article>
  );
}

export default BusCard;

import { useEffect, useMemo, useState } from "react";

function SeatSelection({ bus, selectedSeat, setSelectedSeat, onConfirm, go, bookings = [], searchDate }) {
  const [secondsLeft, setSecondsLeft] = useState(600);

  useEffect(() => {
    if (!selectedSeat) {
      setSecondsLeft(600);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(value - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [selectedSeat]);

  useEffect(() => {
    if (secondsLeft === 0 && selectedSeat) {
      setSelectedSeat(null);
    }
  }, [secondsLeft, selectedSeat, setSelectedSeat]);

  if (!bus) return null;

  const seats = Array.from({ length: 44 }, (_, index) => index + 1);

  // Fixed occupied seats keep the layout looking like a real in-bus seat map.
  // Additional seats become unavailable when the selected bus has fewer remaining seats.
  const baseOccupied = [3, 4, 8, 12, 13, 14, 15, 16, 17, 18, 21, 22, 27, 34, 38, 39, 40, 41, 42];
  const remainingSeats = Math.max(0, Math.min(44, Number(bus.seats || 0)));
  const targetUnavailable = 44 - remainingSeats;
  const extraOccupied = seats
    .filter((seat) => !baseOccupied.includes(seat))
    .slice(0, Math.max(0, targetUnavailable - baseOccupied.length));

  const bookedSeats = bookings
    .filter(
      (booking) =>
        booking.bus === bus.company &&
        booking.route === `${bus.from} → ${bus.to}` &&
        (!searchDate || booking.date === searchDate) &&
        (booking.status === "Confirmed" || booking.status === "Pending")
    )
    .map((booking) => Number(booking.seat))
    .filter(Boolean);

  const occupied = [...new Set([...baseOccupied, ...extraOccupied, ...bookedSeats])];
  const availableSeats = seats.filter((seat) => !occupied.includes(seat));
  const availableCount = availableSeats.length;
  const selectedIsAvailable = Boolean(selectedSeat && !occupied.includes(selectedSeat));
  const tripDate = searchDate || "Date to be selected";
  const seatPrice = Number(bus.price || 0);

  const seatRows = useMemo(
    () => Array.from({ length: 11 }, (_, rowIndex) => [rowIndex * 4 + 1, rowIndex * 4 + 2, rowIndex * 4 + 3, rowIndex * 4 + 4]),
    []
  );

  const windowSeats = new Set([1, 2, 5, 6, 7, 10]);
  const isWindowSeat = (seat) => windowSeats.has(seat);
  const selectedType = selectedSeat && isWindowSeat(selectedSeat) ? "Window Seat" : "Standard Seat";
  const selectedSeatPrice = seatPrice;
  const fmt = (value) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;

  const serviceRows = {
    4: "coffee",
    6: "restroom",
    8: "door",
  };

  const getSeatClass = (seat) => {
    const occupiedSeat = occupied.includes(seat);
    const selected = selectedSeat === seat && !occupiedSeat;
    return [
      "seatreserve-seat",
      selected ? "selected" : "",
      occupiedSeat ? "occupied" : "",
      isWindowSeat(seat) ? "window-seat" : "standard-seat",
    ]
      .filter(Boolean)
      .join(" ");
  };

  const selectSeat = (seat) => {
    if (!occupied.includes(seat)) setSelectedSeat(seat);
  };

  return (
    <main className="page-content seatreserve-page">
      <div className="seatreserve-backdrop" aria-hidden="true"></div>

      <section className="seatreserve-modal" role="dialog" aria-modal="true" aria-label="Seat Reservation">
        <header className="seatreserve-header">
          <div className="seatreserve-title-wrap">
            <span className="seatreserve-eyebrow">BUSGO · SEAT MAP</span>
            <h1>Select Your Seat</h1>
          </div>
          <button type="button" className="seatreserve-close" onClick={() => go("schedules")} aria-label="Close seat reservation">
            <i className="bi bi-x-lg"></i>
          </button>
        </header>

        <div className="seatreserve-trip-head">
          <div><strong>{bus.from}</strong><i className="bi bi-arrow-right"></i><strong>{bus.to}</strong></div>
          <span>{tripDate} · {bus.depart || "Departure TBA"}</span>
        </div>

        <div className="seatreserve-legend">
          <div className="seatreserve-type">
            <span className="seatreserve-mini-seat comfort"><i className="bi bi-dash"></i></span>
            <div><strong>Standard</strong><b>₱{seatPrice}</b></div>
          </div>
          <div className="seatreserve-type">
            <span className="seatreserve-mini-seat window-seat"><i className="bi bi-window"></i></span>
            <div><strong>Window</strong><b>₱{seatPrice}</b></div>
          </div>
          <div className="seatreserve-status-legend">
            <span><i className="seat-dot available"></i>Available</span>
            <span><i className="seat-dot selected"></i>Selected</span>
            <span><i className="seat-dot occupied"></i>Occupied</span>
          </div>
        </div>

        <div className="seatreserve-count">
          Selected seat:
          <strong>{selectedSeat || "No seat selected"}</strong>
        </div>

        <div className="seatreserve-bus">
          <div className="seatreserve-bus-top">
            <div className="seatreserve-driver">
              <i className="bi bi-person-fill"></i>
              <span>DRIVER</span>
            </div>
            <div className="seatreserve-front-window"></div>
            <span className="seatreserve-front-label">BUS FRONT</span>
          </div>

          <div className="seatreserve-seatmap">
            {seatRows.map((row, rowIndex) => {
              const service = serviceRows[rowIndex + 1];
              return (
                <div className="seatreserve-row" key={rowIndex}>
                  <button
                    type="button"
                    className={getSeatClass(row[0])}
                    disabled={occupied.includes(row[0])}
                    onClick={() => selectSeat(row[0])}
                    aria-label={`BusGo seat ${row[0]}`}
                  >
                    <span>{row[0]}</span>
                    {isWindowSeat(row[0]) && <i className="bi bi-window"></i>}
                  </button>

                  <button
                    type="button"
                    className={getSeatClass(row[1])}
                    disabled={occupied.includes(row[1])}
                    onClick={() => selectSeat(row[1])}
                    aria-label={`BusGo seat ${row[1]}`}
                  >
                    <span>{row[1]}</span>
                    {isWindowSeat(row[1]) && <i className="bi bi-window"></i>}
                  </button>

                  <div className="seatreserve-aisle">
                    {service === "coffee" && <i className="bi bi-cup-hot-fill" aria-label="Refreshment area"></i>}
                    {service === "restroom" && <i className="bi bi-person-standing" aria-label="Comfort room"></i>}
                    {service === "door" && <i className="bi bi-door-open-fill" aria-label="Exit door"></i>}
                  </div>

                  <button
                    type="button"
                    className={getSeatClass(row[2])}
                    disabled={occupied.includes(row[2])}
                    onClick={() => selectSeat(row[2])}
                    aria-label={`BusGo seat ${row[2]}`}
                  >
                    <span>{row[2]}</span>
                    {isWindowSeat(row[2]) && <i className="bi bi-window"></i>}
                  </button>

                  <button
                    type="button"
                    className={getSeatClass(row[3])}
                    disabled={occupied.includes(row[3])}
                    onClick={() => selectSeat(row[3])}
                    aria-label={`BusGo seat ${row[3]}`}
                  >
                    <span>{row[3]}</span>
                    {isWindowSeat(row[3]) && <i className="bi bi-window"></i>}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="seatreserve-bus-bottom">
            <span><i className="bi bi-person-check"></i> {availableCount} seats available</span>
            <span>EMERGENCY EXIT · BUS REAR</span>
          </div>
        </div>

        {selectedSeat && (
          <div className="seatreserve-selected-info">
            <div className="seatreserve-selected-badge">{selectedSeat}</div>
            <div>
              <strong>{selectedType}</strong>
              <span>₱{selectedSeatPrice} · Seat {selectedSeat}</span>
            </div>
            <span className="seatreserve-timer">{fmt(secondsLeft)}</span>
          </div>
        )}

        <div className="seatreserve-footer">
          <div>
            <small>BusGo · {bus.company} · {bus.from} → {bus.to}</small>
            <strong>{tripDate}</strong>
          </div>
          <button
            type="button"
            className="btn btn-primary seatreserve-continue"
            disabled={!selectedSeat || !selectedIsAvailable}
            onClick={onConfirm}
          >
            Continue to Passenger Details
            <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </section>
    </main>
  );
}

export default SeatSelection;

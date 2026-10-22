import { useState } from "react";

function PassengerDetails({ account, selectedBus, selectedSeat, onConfirm, go, travelDate }) {
  const [form, setForm] = useState({
    name: account?.name || "",
    phone: account?.phone || "",
    notes: ""
  });
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  const routeStops = {
    Manila: ["Pasay City Bus Terminal", "Cubao Bus Terminal"],
    Batangas: ["Batangas Grand Terminal", "Batangas City Transport Hub"],
    Baguio: ["Baguio Bus Terminal", "Gov. Pack Road Terminal"],
    "La Union": ["San Fernando Bus Terminal", "La Union Transport Hub"],
    Lucena: ["Lucena Grand Central Terminal", "Lucena City Transport Hub"]
  };
  const boardingOptions = routeStops[selectedBus?.from] || [`${selectedBus?.from || "Origin"} Central Terminal`, `${selectedBus?.from || "Origin"} Transport Hub`];
  const dropOffOptions = routeStops[selectedBus?.to] || [`${selectedBus?.to || "Destination"} Bus Terminal`, `${selectedBus?.to || "Destination"} Transport Hub`];
  const [stops, setStops] = useState({
    boardingPoint: boardingOptions[0],
    dropOffPoint: dropOffOptions[0]
  });

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError("");
  };

  const submit = (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      return setError("Please complete the passenger name and mobile number.");
    }

    if (!/^09\d{9}$/.test(form.phone.trim())) {
      return setError("Please enter a valid 11-digit Philippine mobile number.");
    }

    if (!confirmed) {
      return setError("Please confirm that the passenger information is correct.");
    }

    setError("");
    onConfirm({
      ...form,
      boardingPoint: stops.boardingPoint,
      dropOffPoint: stops.dropOffPoint,
      boardingTime: selectedBus.depart
    });
  };

  if (!selectedBus || !selectedSeat) return null;

  return (
    <main className="page-content passenger-details-page">
      <div className="container">
        <button className="back-button passenger-back" onClick={() => go("seats")}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to seat selection
        </button>

        <div className="booking-progress passenger-stepper mb-4">
          <div className="progress-step complete">
            <span><i className="bi bi-check"></i></span>
            <div>
              <strong>Select seat</strong>
              <small>Seat {selectedSeat}</small>
            </div>
          </div>
          <div className="progress-line active"></div>
          <div className="progress-step active">
            <span>2</span>
            <div>
              <strong>Passenger</strong>
              <small>Your travel details</small>
            </div>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <span>3</span>
            <div>
              <strong>Payment</strong>
              <small>Choose payment method</small>
            </div>
          </div>
        </div>

        <div className="passenger-page-heading">
          <div>
            <span className="section-label">BusGo reservation</span>
            <h1>Passenger details</h1>
            <p>Enter the information of the passenger who will take this trip.</p>
          </div>
          <div className="passenger-heading-badge">
            <i className="bi bi-shield-check"></i>
            <span>Secure reservation</span>
          </div>
        </div>

        <div className="passenger-details-layout">
          <div className="passenger-form-column">
            <form className="selection-card passenger-form-card" onSubmit={submit}>
              <div className="passenger-card-header">
                <div className="passenger-card-icon"><i className="bi bi-person-vcard"></i></div>
                <div>
                  <h3>Passenger information</h3>
                  <p>Make sure the name and mobile number are correct.</p>
                </div>
              </div>

              {error && (
                <div className="passenger-error" role="alert">
                  <i className="bi bi-exclamation-circle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              <div className="passenger-form-grid">
                <div className="passenger-field full">
                  <label>Boarding point <span>*</span></label>
                  <div className="passenger-input-wrap select-wrap">
                    <i className="bi bi-door-open"></i>
                    <select
                      className="form-control"
                      value={stops.boardingPoint}
                      onChange={(e) => setStops((current) => ({ ...current, boardingPoint: e.target.value }))}
                    >
                      {boardingOptions.map((point) => <option key={point}>{point}</option>)}
                    </select>
                    <i className="bi bi-chevron-down select-arrow"></i>
                  </div>
                  <small>Choose where you will board the bus.</small>
                </div>

                <div className="passenger-field full">
                  <label>Drop-off point <span>*</span></label>
                  <div className="passenger-input-wrap select-wrap">
                    <i className="bi bi-geo-alt"></i>
                    <select
                      className="form-control"
                      value={stops.dropOffPoint}
                      onChange={(e) => setStops((current) => ({ ...current, dropOffPoint: e.target.value }))}
                    >
                      {dropOffOptions.map((point) => <option key={point}>{point}</option>)}
                    </select>
                    <i className="bi bi-chevron-down select-arrow"></i>
                  </div>
                  <small>Choose your arrival terminal or drop-off point.</small>
                </div>

                <div className="passenger-field full">
                  <div className="boarding-time-card">
                    <div className="boarding-time-icon"><i className="bi bi-clock"></i></div>
                    <div><span>Boarding time</span><strong>{selectedBus.depart}</strong><small>Arrive at your boarding point at least 30 minutes before departure.</small></div>
                  </div>
                </div>

                <div className="passenger-field full">
                  <label htmlFor="passenger-name">Full name <span>*</span></label>
                  <div className="passenger-input-wrap">
                    <i className="bi bi-person"></i>
                    <input
                      id="passenger-name"
                      className="form-control"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Juan Dela Cruz"
                      autoComplete="name"
                    />
                  </div>
                  <small>Enter the passenger's complete name.</small>
                </div>

                <div className="passenger-field">
                  <label htmlFor="passenger-phone">Mobile number <span>*</span></label>
                  <div className="passenger-input-wrap">
                    <i className="bi bi-phone"></i>
                    <input
                      id="passenger-phone"
                      className="form-control"
                      inputMode="numeric"
                      maxLength="11"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))}
                      placeholder="09XXXXXXXXX"
                      autoComplete="tel"
                    />
                  </div>
                  <small>Used for important trip updates.</small>
                </div>

                <div className="passenger-field">
                  <label htmlFor="passenger-email">Email address</label>
                  <div className="passenger-input-wrap disabled">
                    <i className="bi bi-envelope"></i>
                    <input
                      id="passenger-email"
                      className="form-control"
                      value={account?.email || ""}
                      disabled
                    />
                  </div>
                  <small>This is the email connected to your BusGo account.</small>
                </div>

                <div className="passenger-field full">
                  <label htmlFor="passenger-notes">Special request <span className="optional">Optional</span></label>
                  <textarea
                    id="passenger-notes"
                    className="form-control passenger-notes"
                    rows="3"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Add a note for your trip, if needed."
                  ></textarea>
                </div>
              </div>

              <label className="passenger-confirm-check">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => {
                    setConfirmed(e.target.checked);
                    if (error) setError("");
                  }}
                />
                <span className="passenger-check-box"><i className="bi bi-check"></i></span>
                <span>I confirm that the passenger information above is correct.</span>
              </label>

              <div className="passenger-form-footer">
                <div className="passenger-info-note">
                  <i className="bi bi-info-circle"></i>
                  <span>You can review your fare and payment method on the next step.</span>
                </div>
                <button type="submit" className="btn btn-primary passenger-continue-btn">
                  Continue to payment
                  <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </form>
          </div>

          <aside className="passenger-summary-column">
            <div className="summary-card passenger-trip-card">
              <div className="passenger-summary-top">
                <div>
                  <span className="section-label">Your trip</span>
                  <h3>BusGo booking</h3>
                </div>
                <div className="passenger-seat-badge">
                  <small>SEAT</small>
                  <strong>{selectedSeat}</strong>
                </div>
              </div>

              <div className="passenger-route-box">
                <div className="passenger-route-point">
                  <span className="route-dot"></span>
                  <div>
                    <small>DEPARTURE</small>
                    <strong>{selectedBus.from}</strong>
                    <span>{selectedBus.depart}</span>
                  </div>
                </div>
                <div className="passenger-route-line"><span></span></div>
                <div className="passenger-route-point">
                  <span className="route-dot arrival"></span>
                  <div>
                    <small>ARRIVAL</small>
                    <strong>{selectedBus.to}</strong>
                    <span>{selectedBus.arrive}</span>
                  </div>
                </div>
              </div>

              <div className="passenger-trip-details">
                <div><i className="bi bi-calendar3"></i><span>Date</span><strong>{travelDate || "Selected date"}</strong></div>
                <div><i className="bi bi-clock"></i><span>Duration</span><strong>{selectedBus.duration || "2h 30m"}</strong></div>
                <div><i className="bi bi-bus-front"></i><span>Operator</span><strong>{selectedBus.company}</strong></div>
                <div><i className="bi bi-grid-3x3-gap"></i><span>Seat</span><strong>{selectedSeat}</strong></div>
              </div>

              <div className="passenger-fare-box">
                <span>Ticket fare</span>
                <strong>₱{selectedBus.price}</strong>
              </div>

              <div className="passenger-stop-preview">
                <div><i className="bi bi-door-open-fill"></i><span>Boarding<strong>{stops.boardingPoint}</strong></span></div>
                <div><i className="bi bi-geo-alt-fill"></i><span>Drop-off<strong>{stops.dropOffPoint}</strong></span></div>
              </div>

              <div className="passenger-summary-note">
                <i className="bi bi-shield-check"></i>
                <div>
                  <strong>Booking protected by BusGo</strong>
                  <span>Your reservation details will be carried to the payment step.</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default PassengerDetails;

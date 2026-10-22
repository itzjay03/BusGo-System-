import { useMemo, useState } from "react";

function Payment({ account, selectedBus, selectedSeat, passenger, travelDate, onConfirm, go }) {
  const [method, setMethod] = useState("GCash");
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const fare = Number(selectedBus?.price || 0);
  const bookingFee = 50;
  const discount = promoApplied ? Math.round(fare * 0.10) : 0;
  const total = useMemo(() => Math.max(0, fare + bookingFee - discount), [fare, discount]);

  const paymentOptions = [
    { id: "GCash", label: "GCash", note: "Mobile wallet", icon: "bi-phone", color: "gcash" },
    { id: "Maya", label: "Maya", note: "Mobile wallet", icon: "bi-wallet2", color: "maya" },
    { id: "Card", label: "Debit / Credit Card", note: "Visa or Mastercard", icon: "bi-credit-card", color: "card" },
    { id: "Cash", label: "Pay at terminal", note: "Settle before boarding", icon: "bi-cash-stack", color: "cash" }
  ];

  if (!selectedBus || !selectedSeat || !passenger) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!terms) return setError("Please agree to the BusGo booking terms before continuing.");
    if (method === "Card" && (!cardName.trim() || cardNumber.replace(/\s/g, "").length < 12 || !expiry.trim() || cvv.trim().length < 3)) {
      return setError("Please complete the card details before continuing.");
    }
    setError("");
    onConfirm({
      method,
      fare,
      bookingFee,
      discount,
      total,
      transactionRef: `PAY-${Date.now().toString().slice(-8)}`
    });
  };

  const formatCard = (value) => value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  return (
    <main className="page-content checkout-page">
      <div className="container">
        <button className="back-button mb-4" onClick={() => go("passenger-details")}>
          <i className="bi bi-arrow-left me-2"></i>Back to passenger details
        </button>

        <div className="checkout-stepper mb-4">
          <div className="checkout-step done"><span><i className="bi bi-check"></i></span><div><b>Seat</b><small>Seat {selectedSeat}</small></div></div>
          <i className="checkout-step-line active"></i>
          <div className="checkout-step done"><span><i className="bi bi-check"></i></span><div><b>Passenger</b><small>{passenger.name}</small></div></div>
          <i className="checkout-step-line active"></i>
          <div className="checkout-step current"><span>3</span><div><b>Checkout</b><small>Review &amp; pay</small></div></div>
        </div>

        <div className="checkout-title-row">
          <div>
            <span className="section-label">BusGo checkout</span>
            <h1>Complete your reservation</h1>
            <p>Review your journey, passenger details, and payment method before submitting your reservation.</p>
          </div>
          <div className="checkout-trust"><i className="bi bi-shield-check"></i><div><b>Secure reservation</b><small>Your selected seat is held while you complete checkout.</small></div></div>
        </div>

        <form onSubmit={submit}>
          <div className="checkout-grid">
            <div className="checkout-main">
              <section className="checkout-card">
                <div className="checkout-card-head">
                  <div className="checkout-card-icon"><i className="bi bi-person-check"></i></div>
                  <div><span>01</span><h2>Passenger details</h2><p>Information for this reservation</p></div>
                  <i className="bi bi-check-circle-fill checkout-complete"></i>
                </div>
                <div className="checkout-info-grid">
                  <div><small>PASSENGER</small><strong>{passenger.name}</strong></div>
                  <div><small>EMAIL</small><strong>{account?.email || "—"}</strong></div>
                  <div><small>PHONE</small><strong>{passenger.phone || "—"}</strong></div>
                  <div><small>SEAT</small><strong>Seat {selectedSeat}</strong></div>
                </div>
              </section>

              <section className="checkout-card payment-method-card">
                <div className="checkout-card-head">
                  <div className="checkout-card-icon"><i className="bi bi-wallet2"></i></div>
                  <div><span>02</span><h2>Payment method</h2><p>Choose how you want to settle the reservation</p></div>
                  <div className="payment-secure-chip"><i className="bi bi-shield-lock-fill"></i> Secure</div>
                </div>
                {error && <div className="checkout-error"><i className="bi bi-exclamation-circle-fill"></i><span>{error}</span></div>}
                <div className="payment-security-banner"><div className="payment-security-icon"><i className="bi bi-shield-check"></i></div><div><b>Secure payment selection</b><span>Your payment method is recorded with this reservation. Online payments remain pending until the BusGo admin verifies the payment.</span></div><i className="bi bi-lock-fill"></i></div>
                <div className="checkout-method-grid">
                  {paymentOptions.map(option => (
                    <button type="button" key={option.id} className={`checkout-method ${method === option.id ? "selected" : ""}`} onClick={() => { setMethod(option.id); setError(""); }}>
                      <span className={`checkout-method-icon ${option.color}`}><i className={`bi ${option.icon}`}></i></span>
                      <span><b>{option.label}</b><small>{option.note}</small></span>
                      <i className={`bi ${method === option.id ? "bi-check-circle-fill" : "bi-circle"}`}></i>
                    </button>
                  ))}
                </div>

                <div className="payment-method-caption"><span>Selected method</span><strong>{method === "Card" ? "Debit / Credit Card" : method === "Cash" ? "Pay at terminal" : method}</strong><small>{method === "Card" ? "Enter the cardholder details below." : method === "Cash" ? "No online payment is required at checkout." : `Continue with ${method} after submitting your reservation.`}</small></div>

                {method === "Card" && (
                  <div className="checkout-card-fields">
                    <div className="checkout-field full"><label>Cardholder name</label><input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Name on card" /></div>
                    <div className="checkout-field full"><label>Card number</label><div className="checkout-input-icon"><i className="bi bi-credit-card"></i><input value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} placeholder="0000 0000 0000 0000" inputMode="numeric" /></div></div>
                    <div className="checkout-field"><label>Expiry date</label><input value={expiry} onChange={e => setExpiry(e.target.value.replace(/[^0-9/]/g, "").slice(0, 5))} placeholder="MM/YY" inputMode="numeric" /></div>
                    <div className="checkout-field"><label>CVV</label><input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" inputMode="numeric" /></div>
                  </div>
                )}

                {(method === "GCash" || method === "Maya") && (
                  <div className="checkout-wallet-note"><i className="bi bi-phone"></i><div><b>{method} payment</b><span>You will receive the payment instructions after submitting this reservation. Your booking will remain pending until payment is verified.</span></div></div>
                )}
                {method === "Cash" && (
                  <div className="checkout-wallet-note cash"><i className="bi bi-building"></i><div><b>Pay at the terminal</b><span>Bring your booking reference and settle the fare before boarding. The reservation remains subject to BusGo confirmation.</span></div></div>
                )}
              </section>

              <section className="checkout-card checkout-final-card">
                <div className="checkout-promo-row">
                  <div><b><i className="bi bi-tag me-2"></i>Have a promo code?</b><small>Apply a valid BusGo discount before paying.</small></div>
                  <div className="checkout-promo-input"><input value={promo} onChange={e => { setPromo(e.target.value.toUpperCase()); setPromoApplied(false); }} placeholder="BUSGO10" /><button type="button" onClick={() => setPromoApplied(promo.trim() === "BUSGO10")}>{promoApplied ? "Applied" : "Apply"}</button></div>
                </div>
                {promo.trim() && promo.trim() !== "BUSGO10" && <small className="checkout-promo-error">Promo code not recognized. Check the code and try again.</small>}
                <label className="checkout-terms"><input type="checkbox" checked={terms} onChange={e => { setTerms(e.target.checked); setError(""); }} /><span>I confirm that the passenger and trip details are correct and I agree to the BusGo booking and cancellation terms.</span></label>
                <div className="payment-submit-meta"><span><i className="bi bi-lock-fill"></i> Protected checkout</span><span><i className="bi bi-receipt"></i> Booking reference generated after submission</span></div>
                <button type="submit" className="checkout-submit"><span>Submit reservation</span><strong>₱{total.toLocaleString()}</strong><i className="bi bi-arrow-right"></i></button>
              </section>
            </div>

            <aside className="checkout-sidebar">
              <section className="checkout-summary">
                <div className="checkout-summary-head"><div><span>TRIP SUMMARY</span><h2>{selectedBus.company}</h2></div><b className="checkout-seat">{selectedSeat}</b></div>
                <div className="checkout-route">
                  <div><i className="checkout-dot"></i><span><small>DEPARTURE</small><b>{selectedBus.from}</b><em>{selectedBus.depart}</em></span></div>
                  <i className="checkout-route-line"></i>
                  <div><i className="checkout-dot arrival"></i><span><small>ARRIVAL</small><b>{selectedBus.to}</b><em>{selectedBus.arrive}</em></span></div>
                </div>
                <div className="checkout-trip-facts">
                  <div><i className="bi bi-calendar3"></i><span>Date</span><b>{travelDate || "Selected date"}</b></div>
                  <div><i className="bi bi-clock"></i><span>Duration</span><b>{selectedBus.duration || "2h 30m"}</b></div>
                  <div><i className="bi bi-grid-3x3-gap"></i><span>Seat</span><b>{selectedSeat}</b></div>
                  <div><i className="bi bi-person"></i><span>Passenger</span><b>{passenger.name}</b></div>
                </div>
                <div className="checkout-fare">
                  <div><span>Ticket fare</span><b>₱{fare.toLocaleString()}</b></div>
                  <div><span>Booking fee</span><b>₱{bookingFee.toLocaleString()}</b></div>
                  {discount > 0 && <div className="discount"><span>Promo discount</span><b>-₱{discount.toLocaleString()}</b></div>}
                </div>
                <div className="checkout-total"><span>Total</span><strong>₱{total.toLocaleString()}</strong></div>
                <div className="checkout-status"><i className="bi bi-info-circle"></i><span>Online payments require admin verification before the reservation becomes confirmed.</span></div>
              </section>
              <div className="checkout-help"><i className="bi bi-headset"></i><div><b>Need help?</b><span>Check your route, date, passenger name, and seat before submitting.</span></div></div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
}

export default Payment;

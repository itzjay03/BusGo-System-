import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";

function RatingModal({ booking, onClose, onSubmit }) {
  const [rating,setRating]=useState(0), [comment,setComment]=useState(""), [scores,setScores]=useState({comfort:0,cleanliness:0,punctuality:0,service:0}), [done,setDone]=useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);
  const categories=[['comfort','Comfort','bi-armchair'],['cleanliness','Cleanliness','bi-stars'],['punctuality','Punctuality','bi-clock'],['service','Staff / service','bi-person-heart']];
  const submit=()=>{
    if(!rating || comment.trim().length<5) return;
    onSubmit(booking,rating,comment,scores);
    setDone(true);
    window.setTimeout(onClose, 1400);
  };
  const Stars=({value,onChange})=><div className="mini-rating-stars">{[1,2,3,4,5].map(n=><button type="button" key={n} className={n<=value?"active":""} onClick={()=>onChange(n)} aria-label={`${n} stars`}><i className="bi bi-star-fill"></i></button>)}</div>;
  const modal = <div className="rating-modal-backdrop" role="dialog" aria-modal="true" aria-label="Rate your trip">
    <div className="rating-modal">
      {!done ? <>
        <div className="rating-modal-head">
          <div><span className="section-label">Verified passenger feedback</span><h3>Rate your trip</h3><p>{booking.route} · {booking.bus}</p></div>
          <button className="btn-close" onClick={onClose} aria-label="Close review"></button>
        </div>
        <div className="rating-main"><small>OVERALL EXPERIENCE</small><div className="rating-stars">{[1,2,3,4,5].map(n=><button type="button" key={n} className={n<=rating?"active":""} onClick={()=>setRating(n)}><i className="bi bi-star-fill"></i></button>)}</div><strong>{rating?`${rating}/5`:"Select your rating"}</strong></div>
        <div className="rating-category-grid">{categories.map(([key,label,icon])=><div className="rating-category" key={key}><span><i className={`bi ${icon}`}></i>{label}</span><Stars value={scores[key]} onChange={n=>setScores({...scores,[key]:n})}/></div>)}</div>
        <label className="form-label fw-bold mt-3">Written review</label><textarea className="form-control rating-textarea" rows="4" maxLength="500" value={comment} onChange={e=>setComment(e.target.value)} placeholder="How was the bus, seat, punctuality and service?"/>
        <div className="rating-modal-actions"><button className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancel</button><button className="btn btn-primary rounded-pill px-4" disabled={!rating||comment.trim().length<5} onClick={submit}>Submit review <i className="bi bi-arrow-right ms-2"></i></button></div>
      </> : <div className="rating-success text-center"><div className="rating-success-icon"><i className="bi bi-check-lg"></i></div><span className="section-label">Review submitted</span><h3>Thanks for sharing your trip.</h3><p>Your review has been saved and will appear in the BusGo reviews section.</p></div>}
    </div>
  </div>;
  return createPortal(modal, document.body);
}

function ReservationCard({ b, hasReview, onTicket, onReview, onCancel, onReschedule }) {
  const date = b.date ? new Date(`${b.date}T00:00:00`).toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"}) : "Date to be confirmed";
  const statusClass = b.status === "Cancelled" ? "cancelled-badge" : b.status === "Pending" ? "pending-badge" : b.status === "Completed" ? "completed-badge" : "";
  return <article className={`reservation-card ${b.status === "Cancelled" ? "is-cancelled" : ""}`}>
    <div className="reservation-card-head">
      <div className="reservation-ref"><span>BOOKING REFERENCE</span><strong>{b.id}</strong></div>
      <span className={`status-badge ${statusClass}`}>{b.status}</span>
    </div>
    <div className="reservation-route">
      <div className="reservation-place"><small>FROM</small><strong>{b.from}</strong><span>{b.time || "Schedule TBA"}</span></div>
      <div className="reservation-line"><i className="bi bi-bus-front-fill"></i><span></span></div>
      <div className="reservation-place reservation-place-end"><small>TO</small><strong>{b.to}</strong><span>{b.arrival || date}</span></div>
    </div>
    <div className="reservation-meta">
      <div><span>TRAVEL DATE</span><strong>{date}</strong></div>
      <div><span>OPERATOR</span><strong>{b.bus || "BusGo Operator"}</strong></div>
      <div><span>SEAT</span><strong>{b.seat || "—"}</strong></div>
      <div><span>TOTAL</span><strong>₱{b.total ?? b.price ?? 0}</strong></div>
    </div>
    <div className="reservation-card-actions">
      <button className="btn btn-primary" onClick={()=>onTicket(b)}><i className="bi bi-qr-code me-2"></i>View ticket</button>
      {b.status === "Completed" && <button className={`btn ${hasReview ? "btn-outline-success" : "btn-outline-primary"}`} onClick={()=>!hasReview&&onReview(b)} disabled={hasReview}><i className={`bi ${hasReview ? "bi-check-circle" : "bi-star"} me-2`}></i>{hasReview ? "Review submitted" : "Rate trip"}</button>}
      {(b.status === "Confirmed" || b.status === "Pending") && <><button className="btn btn-outline-primary" onClick={()=>{const next=window.prompt("New travel date (YYYY-MM-DD):",b.date);if(next&&/^\d{4}-\d{2}-\d{2}$/.test(next)&&next!==b.date)onReschedule(b.id,next)}}><i className="bi bi-calendar2-event me-2"></i>Reschedule</button><button className="btn btn-outline-danger" aria-label="Cancel reservation" onClick={()=>{if(window.confirm(`Cancel booking ${b.id}?`))onCancel(b.id)}}><i className="bi bi-x-circle"></i></button></>}
    </div>
  </article>;
}

function Bookings({ bookings, reviews=[], go, onCancel, onReschedule, onTicket, onReview }) {
  const [filter,setFilter]=useState("Upcoming"), [query,setQuery]=useState(""), [reviewBooking,setReviewBooking]=useState(null);
  const counts = useMemo(()=>({
    Upcoming: bookings.filter(b=>b.status==="Pending"||b.status==="Confirmed").length,
    Completed: bookings.filter(b=>b.status==="Completed").length,
    Cancelled: bookings.filter(b=>b.status==="Cancelled").length,
    All: bookings.length
  }),[bookings]);
  const filtered=useMemo(()=>bookings.filter(b=>{
    const q=`${b.id} ${b.bus} ${b.route} ${b.passenger} ${b.from} ${b.to}`.toLowerCase();
    const mq=q.includes(query.toLowerCase());
    const mf=filter==="All" || (filter==="Upcoming" ? (b.status==="Pending"||b.status==="Confirmed") : b.status===filter);
    return mq&&mf;
  }),[bookings,filter,query]);
  const hasReview=b=>reviews.some(r=>r.bookingId===b.id);
  const activeCount=counts.Upcoming;
  return <main className="page-content reservations-page"><div className="container">
    <div className="reservations-hero">
      <div><span className="section-label">Passenger portal</span><h1>My Reservations</h1><p>Keep track of your BusGo bookings, tickets and travel details in one place.</p></div>
      <button className="btn btn-primary rounded-pill px-4" onClick={()=>go("schedules")}><i className="bi bi-plus-lg me-2"></i>Book another trip</button>
    </div>

    <div className="reservation-overview">
      <div className="reservation-overview-card"><span><i className="bi bi-calendar-check"></i></span><div><small>UPCOMING</small><strong>{activeCount}</strong><p>Active reservation{activeCount===1?"":"s"}</p></div></div>
      <div className="reservation-overview-card"><span><i className="bi bi-check2-circle"></i></span><div><small>COMPLETED</small><strong>{counts.Completed}</strong><p>Finished trip{counts.Completed===1?"":"s"}</p></div></div>
      <div className="reservation-overview-card"><span><i className="bi bi-ticket-perforated"></i></span><div><small>ALL BOOKINGS</small><strong>{counts.All}</strong><p>Your reservation history</p></div></div>
    </div>

    <div className="reservation-toolbar">
      <div className="reservation-search"><i className="bi bi-search"></i><input placeholder="Search booking, route or bus" value={query} onChange={e=>setQuery(e.target.value)}/></div>
      <div className="reservation-tabs" role="tablist">{['Upcoming','Completed','Cancelled','All'].map(x=><button type="button" key={x} className={filter===x?'active':''} onClick={()=>setFilter(x)}>{x}<span>{counts[x]}</span></button>)}</div>
    </div>

    {filter==="Completed" && <div className="review-info-banner reservation-review-banner"><div className="review-info-icon"><i className="bi bi-star-fill"></i></div><div><strong>Help improve the BusGo experience</strong><p>Rate your completed trip for comfort, cleanliness, punctuality and staff service.</p></div></div>}

    {filtered.length===0 ? <div className="reservation-empty"><div className="empty-icon"><i className={filter==="Completed"?"bi bi-star":"bi bi-ticket-perforated"}></i></div><span className="section-label">{filter} reservations</span><h3>{query?"No matching reservations":"No reservations found"}</h3><p>{query?"Try another booking reference, route or bus operator.":bookings.length?"There are no bookings under this status yet.":"Your BusGo reservation will appear here after you complete a booking."}</p><button className="btn btn-primary rounded-pill px-4" onClick={()=>go("schedules")}>Find a bus</button></div> : <div className="reservation-list">{filtered.map(b=><ReservationCard key={b.id} b={b} hasReview={hasReview(b)} onTicket={onTicket} onReview={setReviewBooking} onCancel={onCancel} onReschedule={onReschedule}/>)}</div>}

    <div className="reservation-help"><div><i className="bi bi-shield-check"></i><div><strong>Your reservations are saved in BusGo</strong><p>Keep your booking reference ready when you need to check your ticket or travel details.</p></div></div><button className="btn btn-outline-primary rounded-pill" onClick={()=>go("travel-center")}>Travel Center <i className="bi bi-arrow-right ms-2"></i></button></div>
  </div>{reviewBooking&&<RatingModal booking={reviewBooking} onClose={()=>setReviewBooking(null)} onSubmit={(...args)=>{onReview(...args)}}/>}</main>;
}
export default Bookings;

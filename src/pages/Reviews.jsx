import { useMemo, useState } from "react";

function Stars({ value = 0, size = "normal" }) {
  return <span className={`reviews-stars ${size === "small" ? "small" : ""}`} aria-label={`${value} out of 5 stars`}>
    {[1,2,3,4,5].map(n => <i key={n} className={`bi ${n <= Math.round(value) ? "bi-star-fill" : "bi-star"}`}></i>)}
  </span>;
}

function Reviews({ account, bookings = [], reviews = [], go }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const myReviews = useMemo(() => reviews.filter(r => r.email === account?.email), [reviews, account]);
  const completed = useMemo(() => bookings.filter(b => b.status === "Completed"), [bookings]);
  const reviewedIds = new Set(myReviews.map(r => r.bookingId));
  const availableToRate = completed.filter(b => !reviewedIds.has(b.id));
  const filtered = useMemo(() => reviews.filter(r => {
    const text = `${r.route || ""} ${r.operator || ""} ${r.passenger || ""} ${r.comment || ""}`.toLowerCase();
    return (filter === "All" || Number(r.rating) === Number(filter)) && text.includes(query.toLowerCase());
  }), [reviews, filter, query]);
  const average = reviews.length ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length : 0;
  const categoryAverage = key => reviews.length ? reviews.reduce((sum, r) => sum + Number(r[key] || r.rating || 0), 0) / reviews.length : 0;

  return <main className="page-content reviews-page"><div className="container">
    <div className="reviews-hero">
      <div><span className="section-label">Passenger feedback</span><h1>BusGo Reviews</h1><p>Share your experience after a completed trip and help future passengers know what to expect.</p></div>
      <button className="btn btn-primary rounded-pill px-4" onClick={() => go("bookings")}><i className="bi bi-ticket-perforated me-2"></i>My Reservations</button>
    </div>

    <section className="reviews-summary">
      <div className="reviews-score-card"><small>BUSGO PASSENGER RATING</small><div className="reviews-score-row"><strong>{average ? average.toFixed(1) : "—"}</strong><div><Stars value={average}/><span>{reviews.length} verified review{reviews.length === 1 ? "" : "s"}</span></div></div><p>Ratings are based on passenger feedback collected after completed trips.</p></div>
      <div className="reviews-category-card">
        {[['comfort','Comfort','bi-armchair'],['cleanliness','Cleanliness','bi-stars'],['punctuality','Punctuality','bi-clock'],['service','Staff & service','bi-person-heart']].map(([key,label,icon]) => <div className="review-metric" key={key}><span><i className={`bi ${icon}`}></i>{label}</span><strong>{categoryAverage(key) ? categoryAverage(key).toFixed(1) : "—"}</strong></div>)}
      </div>
    </section>

    {availableToRate.length > 0 && <section className="review-rate-panel"><div><span className="review-rate-icon"><i className="bi bi-star-fill"></i></span><div><strong>You have a completed trip to review</strong><p>Open My Reservations and choose <b>Rate trip</b> to leave your feedback.</p></div></div><button className="btn btn-outline-primary rounded-pill" onClick={() => go("bookings")}>Rate a trip <i className="bi bi-arrow-right ms-2"></i></button></section>}

    <div className="reviews-section-head"><div><span className="section-label">Passenger experiences</span><h2>Recent reviews</h2></div><div className="reviews-tools"><div className="reviews-search"><i className="bi bi-search"></i><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search route or operator"/></div><div className="reviews-filter">{["All",5,4,3].map(x=><button key={x} className={String(filter)===String(x)?"active":""} onClick={()=>setFilter(String(x))}>{x === "All" ? "All" : `${x} ★`}</button>)}</div></div></div>

    {filtered.length === 0 ? <div className="reviews-empty"><div className="reviews-empty-icon"><i className="bi bi-chat-square-heart"></i></div><h3>{reviews.length ? "No reviews match your search" : "No passenger reviews yet"}</h3><p>{reviews.length ? "Try another route, operator or rating filter." : "Completed-trip feedback will appear here once passengers share their BusGo experience."}</p></div> : <div className="reviews-list">{filtered.map(r => <article className="review-card" key={r.id}><div className="review-card-head"><div className="review-avatar">{(r.passenger || "P").charAt(0).toUpperCase()}</div><div><strong>{r.passenger || "BusGo Passenger"}</strong><div className="review-meta"><Stars value={r.rating} size="small"/><span>{r.verified ? "Verified passenger" : "Passenger review"}</span></div></div><time>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"}) : "Recently"}</time></div><div className="review-route-line"><span>{r.route || "BusGo trip"}</span><b>{r.operator || "BusGo Operator"}</b></div><p className="review-comment">“{r.comment}”</p><div className="review-detail-row"><span>Comfort <b>{r.comfort || r.rating}/5</b></span><span>Cleanliness <b>{r.cleanliness || r.rating}/5</b></span><span>Punctuality <b>{r.punctuality || r.rating}/5</b></span><span>Service <b>{r.service || r.rating}/5</b></span></div></article>)}</div>}
  </div></main>;
}
export default Reviews;

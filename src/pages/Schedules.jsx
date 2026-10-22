import { useEffect, useMemo, useState } from "react";
import BusCard from "../components/BusCard";

function Schedules({ buses, search, setSearch, onSelect, go }) {
  const [sort, setSort] = useState("recommended");
  const [type, setType] = useState("All");
  const [maxFare, setMaxFare] = useState(2000);
  const [detailsBus, setDetailsBus] = useState(null);
  const [recent, setRecent] = useState(() => JSON.parse(localStorage.getItem("busgo_recent_searches") || "[]"));

  useEffect(() => {
    if (!search.from && !search.to) return;
    const item = { from: search.from, to: search.to, date: search.date };
    const key = `${item.from}|${item.to}|${item.date}`;
    const next = [item, ...recent.filter(x => `${x.from}|${x.to}|${x.date}` !== key)].slice(0, 5);
    setRecent(next); localStorage.setItem("busgo_recent_searches", JSON.stringify(next));
  }, [search.from, search.to, search.date]);

  const types = ["All", ...new Set(buses.map((b) => b.type).filter(Boolean))];
  const matches = useMemo(() => {
    const list = buses.filter((b) =>
      (!search.from || b.from.toLowerCase().includes(search.from.toLowerCase())) &&
      (!search.to || b.to.toLowerCase().includes(search.to.toLowerCase())) &&
      (type === "All" || b.type === type) && Number(b.price || 0) <= maxFare
    );
    return [...list].sort((a, b) => {
      if (sort === "price") return Number(a.price || 0) - Number(b.price || 0);
      if (sort === "rating") return Number(b.rating || 0) - Number(a.rating || 0);
      return Number(b.rating || 0) - Number(a.rating || 0) || Number(a.price || 0) - Number(b.price || 0);
    });
  }, [buses, search, sort, type, maxFare]);

  return <main className="page-content"><div className="container">
    <div className="page-title-row trips-page-heading"><div><span className="section-label">Search results</span><h1>Choose your trip</h1><p>Compare departure times, fares, operators, and available seats before you book.</p></div><button className="btn btn-outline-secondary rounded-pill" onClick={() => go("home")}><i className="bi bi-arrow-left me-2"></i>New search</button></div>
    <div className="compact-search mb-4"><div className="row g-3"><div className="col-md-3"><label>From</label><input className="form-control" list="locations" value={search.from} onChange={e => setSearch({...search,from:e.target.value})}/></div><div className="col-md-3"><label>To</label><input className="form-control" list="locations" value={search.to} onChange={e => setSearch({...search,to:e.target.value})}/></div><div className="col-md-3"><label>Date</label><input className="form-control" type="date" value={search.date} min={new Date().toISOString().slice(0,10)} onChange={e => setSearch({...search,date:e.target.value})}/></div><div className="col-md-3"><label>Passengers</label><select className="form-select" value={search.passengers || 1} onChange={e => setSearch({...search, passengers:Number(e.target.value)})}>{[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} passenger{n > 1 ? "s" : ""}</option>)}</select></div></div>{recent.length > 0 && <div className="recent-searches"><small><i className="bi bi-clock-history me-1"></i>Recent searches</small>{recent.map((r,i)=><button key={i} onClick={()=>setSearch({...search,from:r.from,to:r.to,date:r.date})}>{r.from} → {r.to}</button>)}</div>}<datalist id="locations">{[...new Set(buses.flatMap(b => [b.from,b.to]))].map(x=><option key={x} value={x}/>)}</datalist></div>

    <div className="results-toolbar results-toolbar-pro mb-4">
      <div className="results-summary">
        <div className="results-count"><strong>{matches.length} {matches.length === 1 ? "trip" : "trips"}</strong><span> available for your search</span></div>
        <span className="results-route-chip"><i className="bi bi-geo-alt me-1"></i>{search.from || "Any origin"} <i className="bi bi-arrow-right mx-1"></i> {search.to || "Any destination"}</span>
      </div>
      <div className="results-controls results-controls-pro">
        <label><span>Bus type</span><select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>{types.map(x => <option key={x}>{x}</option>)}</select></label>
        <label><span>Fare</span><select className="form-select" value={maxFare} onChange={(e) => setMaxFare(Number(e.target.value))}><option value="2000">Any fare</option><option value="800">Up to ₱800</option><option value="600">Up to ₱600</option><option value="400">Up to ₱400</option></select></label>
        <label><span>Sort by</span><select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}><option value="recommended">Recommended</option><option value="price">Lowest fare</option><option value="rating">Highest rated</option></select></label>
      </div>
    </div>

    {matches.length ? <div className="d-grid gap-3">{matches.map(bus => <BusCard key={bus.id} bus={bus} onSelect={onSelect} onDetails={setDetailsBus}/>)}</div> : <div className="empty-state py-5"><div className="empty-icon"><i className="bi bi-bus-front"></i></div><h3>No trips found</h3><p className="text-secondary">Try another destination, bus type or fare range.</p><button className="btn btn-outline-primary rounded-pill" onClick={() => { setType("All"); setMaxFare(2000); setSort("recommended"); setSearch({...search, from:"", to:"", date:"", passengers:1}); }}>Clear filters</button></div>}
    {detailsBus && <div className="details-modal-backdrop" onClick={() => setDetailsBus(null)}>
      <div className="details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="details-modal-head"><div className="bus-photo-visual"><i className="bi bi-bus-front-fill"></i><span>BUSGO TRIP</span></div><div className="details-title"><span className="section-label">Trip details</span><h2>{detailsBus.company}</h2><p>{detailsBus.type} · Passenger rating {detailsBus.rating}/5</p></div><button className="btn-close" aria-label="Close" onClick={() => setDetailsBus(null)}></button></div>
        <div className="details-route-box"><div><small>DEPARTURE</small><strong>{detailsBus.depart}</strong><span>{detailsBus.from}</span></div><i className="bi bi-arrow-right"></i><div><small>ARRIVAL</small><strong>{detailsBus.arrive}</strong><span>{detailsBus.to}</span></div><div><small>DURATION</small><strong>{detailsBus.duration}</strong><span>estimated</span></div></div>
        <div className="details-grid"><div><i className="bi bi-cash-stack"></i><span>Fare</span><strong>₱{detailsBus.price}</strong></div><div><i className="bi bi-person-check"></i><span>Seats available</span><strong>{detailsBus.seats}</strong></div><div><i className="bi bi-wifi"></i><span>On-board</span><strong>Aircon</strong></div><div><i className="bi bi-star"></i><span>Rating</span><strong>{detailsBus.rating}/5</strong></div></div>
        <div className="details-amenities"><span><i className="bi bi-snow2"></i> Air-conditioned</span><span><i className="bi bi-usb-plug"></i> USB charging</span><span><i className="bi bi-wifi"></i> Wi-Fi</span><span><i className="bi bi-person-workspace"></i> Reclining seats</span></div><div className="details-policy"><div><strong>Passenger reviews</strong><span><i className="bi bi-star-fill"></i> {detailsBus.rating}/5 · Verified passenger feedback</span></div><div><strong>Cancellation policy</strong><span>Review cancellation terms before confirming your reservation.</span></div></div>
        <div className="details-modal-actions"><button className="btn btn-outline-secondary" onClick={() => setDetailsBus(null)}>Close</button><button className="btn btn-primary px-4" onClick={() => { setDetailsBus(null); onSelect(detailsBus); }}>Select this bus <i className="bi bi-arrow-right ms-2"></i></button></div>
      </div>
    </div>}
  </div></main>;
}
export default Schedules;

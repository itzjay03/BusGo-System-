import { useState } from "react";

function GroupBooking({ account, go }) {
  const key = `busgo_group_${account?.email}`;
  const [travellers, setTravellers] = useState(() => JSON.parse(localStorage.getItem(key) || "[]"));
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saved, setSaved] = useState(false);

  const addTraveller = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !/^09\d{9}$/.test(form.phone)) return;
    if (travellers.length >= 4) return;
    const next = [...travellers, { id: Date.now(), ...form }];
    setTravellers(next);
    localStorage.setItem(key, JSON.stringify(next));
    setForm({ name: "", phone: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const remove = (id) => {
    const next = travellers.filter((t) => t.id !== id);
    setTravellers(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  return <main className="page-content py-5"><div className="container">
    <button className="back-button mb-4" onClick={() => go("travel-center")}><i className="bi bi-arrow-left me-2"></i>Back to Travel Center</button>
    <div className="page-title-row mb-4"><div><span className="section-label">GROUP TRAVEL</span><h1>Travel companions</h1><p>Save up to four passenger profiles so group bookings are faster.</p></div><span className="status-badge">{travellers.length}/4 saved</span></div>
    {saved && <div className="alert alert-success border-0 rounded-4"><i className="bi bi-check-circle me-2"></i>Passenger profile saved.</div>}
    <div className="row g-4">
      <div className="col-lg-5"><form className="selection-card" onSubmit={addTraveller}><div className="checkout-heading"><div className="checkout-icon"><i className="bi bi-people"></i></div><div><h4 className="fw-bold mb-1">Add passenger</h4><p className="text-secondary mb-0">Keep companion details ready for your next trip.</p></div></div><label className="form-label mt-4">Full name</label><input className="form-control form-control-lg" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Juan Dela Cruz" required/><label className="form-label mt-3">Mobile number</label><input className="form-control form-control-lg" inputMode="numeric" maxLength="11" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value.replace(/\D/g,"")})} placeholder="09XXXXXXXXX" required/><button className="btn btn-primary btn-lg w-100 rounded-pill mt-4" disabled={travellers.length>=4}><i className="bi bi-plus-circle me-2"></i>{travellers.length>=4?"Maximum reached":"Save passenger"}</button></form></div>
      <div className="col-lg-7"><section className="selection-card h-100"><div className="card-heading"><div><small>SAVED TRAVELLERS</small><h3>Your group</h3></div></div>{travellers.length ? <div className="list-group list-group-flush">{travellers.map(t=><div className="list-group-item px-0 d-flex justify-content-between align-items-center"><div><strong>{t.name}</strong><small className="d-block text-secondary">{t.phone}</small></div><button className="btn btn-sm btn-outline-danger rounded-pill" onClick={()=>remove(t.id)}>Remove</button></div>)}</div> : <div className="empty-passenger py-5"><i className="bi bi-person-plus"></i><h5>No saved companions</h5><p>Add family or friends before your next group trip.</p></div>}<div className="profile-info-box mt-4"><i className="bi bi-info-circle"></i><span>Each traveller still receives an individual seat during the normal seat-selection flow.</span></div><button className="btn btn-outline-primary rounded-pill mt-4" onClick={()=>go("schedules")}><i className="bi bi-search me-2"></i>Start group trip</button></section></div>
    </div>
  </div></main>;
}
export default GroupBooking;

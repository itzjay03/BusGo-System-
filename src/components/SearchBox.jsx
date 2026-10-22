function SearchBox({ search, setSearch, onSearch }) {
  const swap = () => setSearch({ ...search, from: search.to, to: search.from });
  return (
    <div className="search-panel shadow-lg premium-search-panel">
      <div className="search-panel-head">
        <div><span className="search-kicker"><i className="bi bi-search me-2"></i>Find your trip</span><strong>Where are you going?</strong></div>
        <span className="search-secure"><i className="bi bi-shield-check me-1"></i>Secure booking</span>
      </div>
      <div className="row g-3 align-items-end">
        <div className="col-lg-3 position-relative"><SearchField label="From" icon="bi-geo-alt" value={search.from} onChange={(e) => setSearch({ ...search, from: e.target.value })} /><button type="button" className="route-swap" onClick={swap} title="Swap locations" aria-label="Swap from and to"><i className="bi bi-arrow-down-up"></i></button></div>
        <div className="col-lg-3"><SearchField label="To" icon="bi-geo" value={search.to} onChange={(e) => setSearch({ ...search, to: e.target.value })} /></div>
        <SearchField label="Travel date" icon="bi-calendar3" type="date" value={search.date} onChange={(e) => setSearch({ ...search, date: e.target.value })} />
        <div className="col-lg-2"><label className="form-label">Passengers</label><div className="input-group input-group-lg"><span className="input-group-text"><i className="bi bi-people"></i></span><select className="form-select" value={search.passengers || 1} onChange={(e) => setSearch({ ...search, passengers: Number(e.target.value) })}>{[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? "passenger" : "passengers"}</option>)}</select></div></div>
        <div className="col-lg-2"><button className="btn btn-primary search-button w-100" onClick={onSearch}><i className="bi bi-search me-2"></i>Search buses</button></div>
      </div>
      <div className="search-hints"><span><i className="bi bi-lightning-charge-fill"></i> Quick search</span><button type="button" onClick={() => setSearch({ ...search, from:"Manila", to:"Batangas" })}>Manila → Batangas</button><button type="button" onClick={() => setSearch({ ...search, from:"Manila", to:"Baguio" })}>Manila → Baguio</button><button type="button" onClick={() => setSearch({ ...search, from:"Manila", to:"Quezon" })}>Manila → Quezon</button></div>
    </div>
  );
}
function SearchField({ label, icon, type = "text", value, onChange }) {
  return <div className="col-lg-3"><label className="form-label">{label}</label><div className="input-group input-group-lg"><span className="input-group-text"><i className={`bi ${icon}`}></i></span><input className="form-control" type={type} min={type === "date" ? new Date().toISOString().slice(0,10) : undefined} value={value} onChange={onChange} /></div></div>;
}
export default SearchBox;

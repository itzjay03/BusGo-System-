function RouteCard({ route, number, onClick }) {
  return (
    <button className="route-card w-100 text-start" onClick={onClick}>
      <div className="route-number">0{number}</div>
      <div className="route-line">
        <span>{route.from}</span>
        <i className="bi bi-arrow-right"></i>
        <span>{route.to}</span>
      </div>
      <div className="route-meta">
        <span><i className="bi bi-clock me-1"></i>{route.duration}</span>
        <strong>{route.price}</strong>
      </div>
    </button>
  );
}

export default RouteCard;
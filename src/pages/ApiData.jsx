
function ApiData({ buses = [] }) {
  return (
    <main className="page-content">
      <div className="container">
        <div className="page-title-row">
          <div>
            <span className="section-label">Express JS GET Method</span>
            <h1>Live fleet data</h1>
            <p>Bus schedules loaded from the Express backend.</p>
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Departure</th>
                  <th>Arrival</th>
                  <th>Price</th>
                  <th>Seats</th>
                </tr>
              </thead>

              <tbody>
                {buses.map((bus) => (
                  <tr key={bus.id}>
                    <td>{bus.id}</td>
                    <td>{bus.company}</td>
                    <td>{bus.type}</td>
                    <td>{bus.from}</td>
                    <td>{bus.to}</td>
                    <td>{bus.depart}</td>
                    <td>{bus.arrive}</td>
                    <td>₱{bus.price}</td>
                    <td>{bus.seats}</td>
                  </tr>
                ))}

                {buses.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-4">
                      No bus records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ApiData;

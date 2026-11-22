import { useEffect, useState } from "react";

function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    let timer;

    const handleOnline = () => {
      setOnline(true);
      setShowBackOnline(true);
      timer = setTimeout(() => setShowBackOnline(false), 3000);
    };

    const handleOffline = () => {
      clearTimeout(timer);
      setOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online && !showBackOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 3000,
        padding: "8px 12px",
        textAlign: "center",
        fontSize: "0.9rem",
        fontWeight: 600,
        color: "#fff",
        background: online ? "#16a34a" : "#dc2626"
      }}
    >
      {online ? (
        <><i className="bi bi-wifi me-2"></i>Back online</>
      ) : (
        <><i className="bi bi-wifi-off me-2"></i>You're offline. Showing saved data where available.</>
      )}
    </div>
  );
}

export default OfflineBanner;

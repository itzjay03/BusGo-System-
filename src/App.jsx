import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Schedules from "./pages/Schedules";
import SeatSelection from "./pages/SeatSelection";
import PassengerDetails from "./pages/PassengerDetails";
import Payment from "./pages/Payment";
import Bookings from "./pages/Bookings";
import Ticket from "./pages/Ticket";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserOverview from "./pages/UserDashboard";
import AdminOverview from "./pages/AdminDashboard";
import ApiData from "./pages/ApiData";
import { buses as localBuses } from "./data/buses";
import Backend from "./pages/Backend";
import Profile from "./pages/Profile";
import MyTrip from "./pages/MyTrip";
import TravelCenter from "./pages/TravelCenter";
import OperationsCenter from "./pages/OperationsCenter";
import GroupBooking from "./pages/GroupBooking";
import Notifications from "./pages/Notifications";
import Reviews from "./pages/Reviews";

function App() {
  const [page, setPage] = useState("home");
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [passenger, setPassenger] = useState(null);
  const [ticketBooking, setTicketBooking] = useState(null);
  const [buses, setBuses] = useState(() => JSON.parse(localStorage.getItem("busgo_buses") || "[]"));
  const [bookings, setBookings] = useState(() => JSON.parse(localStorage.getItem("busgo_bookings") || "[]"));
  const [search, setSearch] = useState({ from: "Manila", to: "Batangas", date: "", passengers: 1 });
  const [account, setAccount] = useState(() => JSON.parse(localStorage.getItem("busgo_account") || "null"));
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("busgo_dark_mode") === "true");
  const [reviews, setReviews] = useState(() => JSON.parse(localStorage.getItem("busgo_reviews") || "[]"));
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem("busgo_notifications") || "[]"));
  const [activityLogs, setActivityLogs] = useState(() => JSON.parse(localStorage.getItem("busgo_activity_logs") || "[]"));

  useEffect(() => {
    let cancelled = false;

    const loadBuses = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/buses");
        if (!response.ok) throw new Error(`Bus API returned ${response.status}`);
        const data = await response.json();
        if (!cancelled && Array.isArray(data) && data.length) {
          setBuses(data);
          localStorage.setItem("busgo_buses", JSON.stringify(data));
          return;
        }
      } catch (error) {
        console.warn("Bus API is not available. Using the local bus array.", error);
      }

      if (!cancelled) {
        const saved = JSON.parse(localStorage.getItem("busgo_buses") || "[]");
        setBuses(saved.length ? saved : localBuses);
      }
    };

    loadBuses();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { localStorage.setItem("busgo_bookings", JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { if (buses.length) localStorage.setItem("busgo_buses", JSON.stringify(buses)); }, [buses]);
  useEffect(() => { account ? localStorage.setItem("busgo_account", JSON.stringify(account)) : localStorage.removeItem("busgo_account"); }, [account]);
  useEffect(() => { localStorage.setItem("busgo_dark_mode", String(darkMode)); document.body.classList.toggle("dark-mode", darkMode); }, [darkMode]);
  useEffect(() => { localStorage.setItem("busgo_reviews", JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => { localStorage.setItem("busgo_notifications", JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem("busgo_activity_logs", JSON.stringify(activityLogs)); }, [activityLogs]);

  // Automatically mark confirmed trips as completed after their scheduled arrival time.
  useEffect(() => {
    const parseTime = (value) => {
      if (!value) return null;
      const match = String(value).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (!match) return null;
      let hour = Number(match[1]);
      const minute = Number(match[2]);
      const meridiem = match[3]?.toUpperCase();
      if (meridiem === "PM" && hour < 12) hour += 12;
      if (meridiem === "AM" && hour === 12) hour = 0;
      if (hour > 23 || minute > 59) return null;
      return { hour, minute };
    };

    const completeFinishedTrips = () => {
      const now = new Date();
      const finished = bookings.filter((b) => {
        if (b.status !== "Confirmed" || !b.date || !b.arrival) return false;
        const time = parseTime(b.arrival);
        if (!time) return false;
        const arrival = new Date(`${b.date}T${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}:00`);
        return !Number.isNaN(arrival.getTime()) && now >= arrival;
      });

      if (!finished.length) return;
      const ids = new Set(finished.map((b) => b.id));
      setBookings((current) => current.map((b) => ids.has(b.id) ? { ...b, status: "Completed", completedAt: b.completedAt || new Date().toISOString() } : b));
      setActivityLogs((current) => [
        ...finished.map((b) => ({
          id: `A-${Date.now()}-${b.id}`, action: "Trip completed", details: `${b.id} automatically completed after arrival time.`, bookingId: b.id, tone: "success", actor: "BusGo system", time: new Date().toISOString()
        })),
        ...current
      ].slice(0, 200));
      setNotifications((current) => {
        const existing = new Set(current.map((n) => `${n.type}:${n.bookingId || ""}`));
        const additions = finished
          .filter((b) => !existing.has(`trip-completed:${b.id}`))
          .map((b) => ({
            id: `N-${Date.now()}-${b.id}`,
            audience: "passenger",
            email: b.email,
            bookingId: b.id,
            type: "trip-completed",
            title: "Trip completed",
            text: `${b.id} is now marked as completed. You can rate your BusGo trip.`,
            time: "Just now",
            read: false
          }));
        return [...additions, ...current];
      });
    };

    completeFinishedTrips();
    const timer = window.setInterval(completeFinishedTrips, 30000);
    return () => window.clearInterval(timer);
  }, [bookings]);

  useEffect(() => {
    const syncBusGoData = (event) => {
      if (event.key === "busgo_bookings" && event.newValue) setBookings(JSON.parse(event.newValue));
      if (event.key === "busgo_notifications" && event.newValue) setNotifications(JSON.parse(event.newValue));
    };
    window.addEventListener("storage", syncBusGoData);
    return () => window.removeEventListener("storage", syncBusGoData);
  }, []);

  const go = (nextPage) => { setPage(nextPage); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const addActivity = (action, details, bookingId = null, tone = "info") => {
    setActivityLogs((current) => [{
      id: `A-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      action, details, bookingId, tone,
      actor: account?.email || "BusGo system",
      time: new Date().toISOString()
    }, ...current].slice(0, 200));
  };

  const handleLogin = (user) => { setAccount(user); go(user.role === "admin" ? "admin-dashboard" : "dashboard"); };
  const handleRegister = (user) => { setAccount({ ...user, role: "user" }); go("dashboard"); };

  const updateAccount = (nextAccount) => setAccount(nextAccount);

  const logout = () => {
    setAccount(null); setSelectedBus(null); setSelectedSeat(null); setPassenger(null); go("home");
  };

  const selectBus = (bus) => {
    if (!account) return go("login");
    if (account.role === "admin") return go("admin-dashboard");
    setSelectedBus(bus); setSelectedSeat(null); setPassenger(null); go("seats");
  };

  const continueToPassenger = () => { if (selectedSeat) go("passenger-details"); };

  const proceedToPayment = (details) => {
    if (!selectedBus || !selectedSeat || !account) return;
    setPassenger(details);
    go("payment");
  };

  const confirmPayment = (paymentDetails) => {
    if (!selectedBus || !selectedSeat || !account || !passenger) return;
    const booking = {
      id: `BG-${Date.now().toString().slice(-6)}`,
      passenger: passenger.name,
      email: account.email,
      phone: passenger.phone,
      bus: selectedBus.company,
      route: `${selectedBus.from} → ${selectedBus.to}`,
      from: selectedBus.from,
      to: selectedBus.to,
      date: search.date || new Date().toISOString().slice(0, 10),
      time: selectedBus.depart,
      arrival: selectedBus.arrive,
      seat: selectedSeat,
      price: selectedBus.price,
      bookingFee: paymentDetails.bookingFee,
      total: paymentDetails.total,
      discount: paymentDetails.discount || 0,
      paymentMethod: paymentDetails.method,
      paymentStatus: paymentDetails.method === "Cash" ? "Pay at terminal" : "Pending Verification",
      transactionRef: paymentDetails.transactionRef,
      status: "Pending",
      boardingPoint: passenger.boardingPoint || `${selectedBus.from} Central Terminal`,
      dropOffPoint: passenger.dropOffPoint || `${selectedBus.to} Bus Terminal`,
      boardingTime: passenger.boardingTime || selectedBus.depart,
      duration: selectedBus.duration || "2h 30m",
      cancellationPolicy: "Free cancellation before departure subject to operator policy",
      bookedAt: new Date().toLocaleString()
    };
    setBookings((current) => [booking, ...current]);
    addActivity("New reservation", `${booking.passenger} submitted ${booking.route}.`, booking.id, "info");
    const cartKey = `busgo_cart_${(account.email || "guest").toLowerCase()}`;
    const savedCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
    localStorage.setItem(cartKey, JSON.stringify(savedCart.filter(item => item.id !== selectedBus.id)));
    setNotifications(current => [
      { id:`N-${Date.now()}-admin`, audience:"admin", type:"warning", title:"New reservation to review", text:`${booking.passenger} submitted ${booking.id}. Please review and confirm the reservation.`, time:"Just now", read:false },
      { id:`N-${Date.now()}-passenger`, audience:"passenger", email:account.email, type:"info", title:"Reservation submitted", text:`${booking.id} is pending admin confirmation.`, time:"Just now", read:false },
      ...current
    ]);
    setTicketBooking(booking);
    go("ticket");
  };

  const updatePaymentStatus = (id, paymentStatus) => {
    const target = bookings.find(b => b.id === id);
    setBookings((current) => current.map((b) => b.id === id ? { ...b, paymentStatus } : b));
    if (target) {
      const approved = paymentStatus === "Paid";
      addActivity(approved ? "Payment approved" : "Payment rejected", `${target.id} payment was marked ${paymentStatus}.`, target.id, approved ? "success" : "danger");
      setNotifications(current => [{
        id:`N-${Date.now()}`, audience:"passenger", email:target.email, type:approved ? "success" : "warning",
        title:approved ? "Payment approved" : "Payment rejected",
        text:approved ? `Payment for ${target.id} has been verified.` : `Payment for ${target.id} was not approved. Please review your payment details.`,
        time:"Just now", read:false
      }, ...current]);
    }
  };

  const markBookingCompleted = (id) => {
    const target = bookings.find(b => b.id === id);
    if (!target || target.status !== "Confirmed") return;
    setBookings((current) => current.map((b) => b.id === id ? { ...b, status: "Completed", completedAt: new Date().toISOString() } : b));
    addActivity("Trip completed", `${target.id} was marked completed.`, target.id, "success");
    setNotifications(current => [{
      id:`N-${Date.now()}`, audience:"passenger", email:target.email, bookingId:target.id, type:"trip-completed",
      title:"Trip completed", text:`${target.id} has been marked as completed. You can now rate your BusGo trip.`, time:"Just now", read:false
    }, ...current]);
  };

  const updateBookingStatus = (id, status) => {
    const target = bookings.find(b => b.id === id);
    if (!target) return;
    if (status === "Confirmed" && target.paymentMethod !== "Cash" && target.paymentStatus !== "Paid") {
      setNotifications(current => [{ id:`N-${Date.now()}`, audience:"admin", type:"warning", title:"Payment approval required", text:`Approve payment for ${target.id} before confirming the reservation.`, time:"Just now", read:false }, ...current]);
      return;
    }
    setBookings((current) => current.map((b) => b.id === id ? { ...b, status, confirmedAt: status === "Confirmed" ? new Date().toISOString() : b.confirmedAt } : b));
    addActivity(status === "Confirmed" ? "Reservation confirmed" : status === "Rejected" ? "Reservation rejected" : `Reservation ${status.toLowerCase()}`, `${target.id} was updated to ${status}.`, target.id, status === "Confirmed" ? "success" : "danger");
    const title = status === "Confirmed" ? "Reservation confirmed" : status === "Rejected" ? "Reservation rejected" : `Reservation ${status.toLowerCase()}`;
    const text = status === "Confirmed"
      ? `${target.id} has been confirmed by BusGo. Your ticket is ready.`
      : status === "Rejected"
        ? `${target.id} was not approved by BusGo. Please contact support if you need assistance.`
        : `${target.id} has been updated to ${status}.`;
    setNotifications(current => [{ id:`N-${Date.now()}`, audience:"passenger", email:target.email, type: status === "Confirmed" ? "success" : "warning", title, text, time:"Just now", read:false }, ...current]);
  };

  const cancelBooking = (id) => {
    const target = bookings.find(b => b.id === id);
    setBookings((current) => current.map((b) => b.id === id ? { ...b, status: "Cancelled", refundStatus: b.paymentStatus === "Paid" ? "Refund Requested" : "Not applicable" } : b));
    if (target) addActivity("Reservation cancelled", `${target.id} was cancelled by ${target.passenger}.`, target.id, "danger");
    if (target) setNotifications(current => [{ id:`N-${Date.now()}`, audience:"admin", type:"warning", title:"Cancellation request", text:`${target.id} was cancelled by ${target.passenger}.`, time:"Just now", read:false }, ...current]);
  };

  const rescheduleBooking = (id, date) => {
    const target = bookings.find(b => b.id === id);
    setBookings((current) => current.map((b) => b.id === id ? { ...b, date, status: "Pending" } : b));
    if (target) setNotifications(current => [{ id:`N-${Date.now()}`, audience:"admin", type:"info", title:"Reschedule request", text:`${target.id} requested a new travel date: ${date}.`, time:"Just now", read:false }, ...current]);
  };

  const submitReview = (booking, rating, comment, details = {}) => {
    const review = {
      id: `REV-${Date.now().toString().slice(-7)}`,
      bookingId: booking.id,
      passenger: booking.passenger || account?.name || "Passenger",
      email: booking.email,
      rating,
      comment,
      comfort: details.comfort || rating,
      cleanliness: details.cleanliness || rating,
      punctuality: details.punctuality || rating,
      service: details.service || rating,
      verified: booking.id !== "DEMO-REVIEW",
      route: booking.route,
      operator: booking.bus,
      createdAt: new Date().toISOString()
    };
    setReviews((current) => [review, ...current]);
    return review;
  };

  const renderPage = () => {
    if (page === "login") return <Login onLogin={handleLogin} go={go} />;
    if (page === "register") return <Register onRegister={handleRegister} go={go} />;
    if (page === "dashboard") return account
      ? account.role === "admin"
        ? <AdminOverview bookings={bookings} buses={buses} setBuses={setBuses} go={go} updateBookingStatus={updateBookingStatus} markBookingCompleted={markBookingCompleted} updatePaymentStatus={updatePaymentStatus} activityLogs={activityLogs} setActivityLogs={setActivityLogs} reviews={reviews} setReviews={setReviews} />
        : <UserOverview account={account} bookings={bookings} reviews={reviews} go={go} />
      : <Login onLogin={handleLogin} go={go} />;
    if (page === "admin-dashboard") return !account
      ? <Login onLogin={handleLogin} go={go} />
      : account.role === "admin"
        ? <AdminOverview bookings={bookings} buses={buses} setBuses={setBuses} go={go} updateBookingStatus={updateBookingStatus} markBookingCompleted={markBookingCompleted} updatePaymentStatus={updatePaymentStatus} activityLogs={activityLogs} setActivityLogs={setActivityLogs} reviews={reviews} setReviews={setReviews} />
        : <UserOverview account={account} bookings={bookings} reviews={reviews} go={go} />;
    if (page === "api-data") {
  return (
    <>
      <ApiData />
      <Backend />
    </>
  );
}
    if (page === "schedules") return account?.role === "admin" ? <OperationsCenter bookings={bookings} buses={buses} go={go} /> : <Schedules buses={buses} search={search} setSearch={setSearch} onSelect={selectBus} go={go} />;
    if (page === "seats") return account && account.role !== "admin" ? <SeatSelection bus={selectedBus} selectedSeat={selectedSeat} setSelectedSeat={setSelectedSeat} onConfirm={continueToPassenger} go={go} bookings={bookings} searchDate={search.date} /> : account?.role === "admin" ? <AdminOverview bookings={bookings} buses={buses} setBuses={setBuses} go={go} updateBookingStatus={updateBookingStatus} markBookingCompleted={markBookingCompleted} updatePaymentStatus={updatePaymentStatus} activityLogs={activityLogs} setActivityLogs={setActivityLogs} reviews={reviews} setReviews={setReviews} /> : <Login onLogin={handleLogin} go={go} />;
    if (page === "passenger-details") return account && account.role !== "admin" && selectedBus && selectedSeat ? <PassengerDetails account={account} selectedBus={selectedBus} selectedSeat={selectedSeat} onConfirm={proceedToPayment} go={go} travelDate={search.date} /> : account?.role === "admin" ? <AdminOverview bookings={bookings} buses={buses} setBuses={setBuses} go={go} updateBookingStatus={updateBookingStatus} markBookingCompleted={markBookingCompleted} updatePaymentStatus={updatePaymentStatus} activityLogs={activityLogs} setActivityLogs={setActivityLogs} reviews={reviews} setReviews={setReviews} /> : <Schedules buses={buses} search={search} setSearch={setSearch} onSelect={selectBus} go={go} />;
    if (page === "payment") return account && account.role !== "admin" && selectedBus && selectedSeat && passenger ? <Payment account={account} selectedBus={selectedBus} selectedSeat={selectedSeat} passenger={passenger} travelDate={search.date} onConfirm={confirmPayment} go={go} /> : account?.role === "admin" ? <AdminOverview bookings={bookings} buses={buses} setBuses={setBuses} go={go} updateBookingStatus={updateBookingStatus} markBookingCompleted={markBookingCompleted} updatePaymentStatus={updatePaymentStatus} activityLogs={activityLogs} setActivityLogs={setActivityLogs} reviews={reviews} setReviews={setReviews} /> : <Schedules buses={buses} search={search} setSearch={setSearch} onSelect={selectBus} go={go} />;
    if (page === "ticket") return account?.role === "admin" ? <AdminOverview bookings={bookings} buses={buses} setBuses={setBuses} go={go} updateBookingStatus={updateBookingStatus} markBookingCompleted={markBookingCompleted} updatePaymentStatus={updatePaymentStatus} activityLogs={activityLogs} setActivityLogs={setActivityLogs} reviews={reviews} setReviews={setReviews} /> : ticketBooking ? <Ticket booking={ticketBooking} go={go} /> : <Bookings bookings={bookings.filter((b) => b.email === account?.email)} reviews={reviews} go={go} onCancel={cancelBooking} onTicket={(b) => { setTicketBooking(b); go("ticket"); }} onReview={submitReview} onReschedule={rescheduleBooking} />;
    if (page === "profile") return account ? <Profile account={account} onSave={updateAccount} go={go} /> : <Login onLogin={handleLogin} go={go} />;
    if (page === "notifications") return account ? <Notifications account={account} notifications={notifications} setNotifications={setNotifications} go={go} /> : <Login onLogin={handleLogin} go={go} />;
    if (page === "reviews") return account && account.role !== "admin" ? <Reviews account={account} bookings={bookings.filter((b) => b.email === account.email)} reviews={reviews} go={go} /> : <Login onLogin={handleLogin} go={go} />;
    if (page === "travel-center") return !account ? <Login onLogin={handleLogin} go={go} /> : account.role === "admin" ? <OperationsCenter bookings={bookings} buses={buses} go={go} /> : <TravelCenter account={account} bookings={bookings} buses={buses} go={go} onSelectBus={selectBus} onCancel={cancelBooking} onReschedule={rescheduleBooking} onTicket={(b) => { setTicketBooking(b); go("ticket"); }} />;
    if (page === "group-booking") return account && account.role !== "admin" ? <GroupBooking account={account} go={go} /> : <Login onLogin={handleLogin} go={go} />;
    if (page === "operations") return account?.role === "admin" ? <OperationsCenter bookings={bookings} buses={buses} go={go} /> : <Login onLogin={handleLogin} go={go} />;
    if (page === "my-trip") return account && account.role !== "admin" ? <MyTrip account={account} bookings={bookings} go={go} onCancel={cancelBooking} onReschedule={rescheduleBooking} onTicket={(b) => { setTicketBooking(b); go("ticket"); }} /> : <Login onLogin={handleLogin} go={go} />;
    if (page === "bookings") {
      if (!account) return <Login onLogin={handleLogin} go={go} />;
      if (account.role === "admin") return <AdminOverview bookings={bookings} buses={buses} setBuses={setBuses} go={go} updateBookingStatus={updateBookingStatus} markBookingCompleted={markBookingCompleted} updatePaymentStatus={updatePaymentStatus} activityLogs={activityLogs} setActivityLogs={setActivityLogs} reviews={reviews} setReviews={setReviews} />;
      const visible = bookings.filter((b) => b.email === account.email);
      return <Bookings bookings={visible} reviews={reviews} go={go} onCancel={cancelBooking} onTicket={(b) => { setTicketBooking(b); go("ticket"); }} onReview={submitReview} onReschedule={rescheduleBooking} />;
    }
    return <Home search={search} setSearch={setSearch} onSearch={() => go("schedules")} go={go} reviews={reviews} />;
  };

  return (
  <div className={`app-shell ${darkMode ? "dark" : ""}`} >
    <Navbar page={page} go={go} account={account} onLogout={logout} darkMode={darkMode} setDarkMode={setDarkMode} notifications={notifications} setNotifications={setNotifications} />

    
    {renderPage()}

    <Footer />
  </div>
);
} 
export default App;

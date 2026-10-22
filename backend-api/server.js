const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

let buses = [
    {
        id: 1,
        company: "Victory Express",
        type: "Deluxe Coach",
        from: "Manila",
        to: "Batangas",
        depart: "06:30 AM",
        arrive: "09:00 AM",
        duration: "2h 30m",
        price: 280,
        seats: 18,
        rating: 4.8,
        status: "Available"
    },
    {
        id: 2,
        company: "MetroLink",
        type: "Premium Bus",
        from: "Manila",
        to: "Baguio",
        depart: "08:00 AM",
        arrive: "02:30 PM",
        duration: "6h 30m",
        price: 650,
        seats: 11,
        rating: 4.7,
        status: "Available"
    },
    {
        id: 3,
        company: "Island Transit",
        type: "Executive Coach",
        from: "Manila",
        to: "La Union",
        depart: "09:15 AM",
        arrive: "02:15 PM",
        duration: "5h",
        price: 520,
        seats: 24,
        rating: 4.6,
        status: "Available"
    },
    {
        id: 4,
        company: "SouthLine",
        type: "Aircon Bus",
        from: "Manila",
        to: "Lucena",
        depart: "11:30 AM",
        arrive: "03:30 PM",
        duration: "4h",
        price: 390,
        seats: 7,
        rating: 4.5,
        status: "Available"
    }
];

app.get("/api/buses", (req, res) => {
    res.json(buses);
});

app.post("/api/buses", (req, res) => {
    const nextId = buses.length ? Math.max(...buses.map((bus) => Number(bus.id) || 0)) + 1 : 1;
    const bus = {
        id: nextId,
        company: req.body.company || "",
        type: req.body.type || "Aircon Bus",
        plateNumber: req.body.plateNumber || "",
        from: req.body.from || "",
        to: req.body.to || "",
        depart: req.body.depart || "",
        arrive: req.body.arrive || "",
        duration: req.body.duration || "",
        price: Number(req.body.price) || 0,
        seats: Number(req.body.seats) || 0,
        rating: Number(req.body.rating) || 0,
        status: req.body.status || "Available"
    };

    buses.push(bus);
    console.log("Bus added:");
    console.log(bus);
    res.status(201).json(bus);
});

app.put("/api/buses/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = buses.findIndex((bus) => Number(bus.id) === id);

    if (index === -1) {
        return res.status(404).json({ message: "Bus not found" });
    }

    const current = buses[index];
    buses[index] = {
        ...current,
        ...req.body,
        id: current.id,
        price: Number(req.body.price ?? current.price) || 0,
        seats: Number(req.body.seats ?? current.seats) || 0,
        rating: Number(req.body.rating ?? current.rating) || 0
    };

    console.log("Bus updated:");
    console.log(buses[index]);
    res.json(buses[index]);
});

app.delete("/api/buses/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = buses.findIndex((bus) => Number(bus.id) === id);

    if (index === -1) {
        return res.status(404).json({ message: "Bus not found" });
    }

    const deletedBus = buses[index];
    buses.splice(index, 1);

    console.log("Bus deleted:");
    console.log(deletedBus);
    console.log(`Available buses: ${buses.length}`);
    console.table(buses);
    res.json({ message: "Bus deleted", bus: deletedBus, available: buses.length });
});

let products = [];

app.get("/api/product", (req, res) => {
    res.json(products);
});

app.get("/api/health", (req, res) => {
    res.json({ message: "Hello Backend", status: "OK" });
});


app.post("/api/product", (req, res) => {
    const product = req.body;

    console.log(product);

    products.push(product);

    res.status(201).json(product);
}); 


const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
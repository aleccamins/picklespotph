const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// SAMPLE DATA
let courts = [
  {
    name: "Cebu Pickle Court",
    location: "Cebu City",
    image: "https://via.placeholder.com/200"
  }
];

let bookings = [
  {
    id: "1",
    courtName: "Cebu Pickle Court",
    user: "Juan",
    date: "2026-05-01",
    time: "10:00",
    status: "Pending"
  }
];

// API ROUTES FIRST
app.get("/courts", (req, res) => res.json(courts));
app.get("/bookings", (req, res) => res.json(bookings));

app.post("/book", (req, res) => {
  const { courtName, user, date, time } = req.body;

  const exists = bookings.find(
    b => b.courtName === courtName && b.date === date && b.time === time
  );

  if (exists) {
    return res.send("Slot already booked ❌");
  }

  const newBooking = {
    id: Date.now().toString(),
    courtName,
    user,
    date,
    time,
    status: "Pending"
  };

  bookings.push(newBooking);
  res.send("Booking created ✅");
});

app.post("/approve/:id", (req, res) => {
  bookings = bookings.map(b =>
    b.id === req.params.id ? { ...b, status: "Approved" } : b
  );
  res.send("Approved");
});

app.post("/reject/:id", (req, res) => {
  bookings = bookings.map(b =>
    b.id === req.params.id ? { ...b, status: "Rejected" } : b
  );
  res.send("Rejected");
});

// 🔥 FORCE LOGIN PAGE BEFORE STATIC
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// SERVE STATIC FILES AFTER
app.use(express.static(path.join(__dirname, "public")));

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});
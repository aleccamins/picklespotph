const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const DATA_FILE = "data.json";

// READ DATA
function readData() {
  const data = fs.readFileSync(DATA_FILE);
  return JSON.parse(data);
}

// WRITE DATA
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET BOOKINGS
app.get("/bookings", (req, res) => {
  const data = readData();
  res.json(data.bookings);
});

// CREATE BOOKING
app.post("/book", (req, res) => {
  const { courtName, user, date, time } = req.body;

  let data = readData();

  const exists = data.bookings.find(
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

  data.bookings.push(newBooking);
  writeData(data);

  res.send("Booking created ✅");
});

// APPROVE
app.post("/approve/:id", (req, res) => {
  let data = readData();

  data.bookings = data.bookings.map(b =>
    b.id === req.params.id ? { ...b, status: "Approved" } : b
  );

  writeData(data);
  res.send("Approved");
});

// REJECT
app.post("/reject/:id", (req, res) => {
  let data = readData();

  data.bookings = data.bookings.map(b =>
    b.id === req.params.id ? { ...b, status: "Rejected" } : b
  );

  writeData(data);
  res.send("Rejected");
});

// HOME
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running");
});
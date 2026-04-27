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

// Convert "4:00 PM" → minutes
function timeToMinutes(timeStr) {
  let [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");

  hours = parseInt(hours);
  minutes = parseInt(minutes);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

// CHECK OVERLAP
function isOverlapping(newBooking, existingBooking) {
  if (newBooking.date !== existingBooking.date) return false;
  if (newBooking.courtName !== existingBooking.courtName) return false;

  const newStart = timeToMinutes(newBooking.time);
  const newEnd = newStart + (parseInt(newBooking.duration) * 60);

  const existingStart = timeToMinutes(existingBooking.time);
  const existingEnd = existingStart + (parseInt(existingBooking.duration || 1) * 60);

  return newStart < existingEnd && newEnd > existingStart;
}

// GET BOOKINGS
app.get("/bookings", (req, res) => {
  const data = readData();
  res.json(data.bookings);
});

// CREATE BOOKING
app.post("/book", (req, res) => {
  const { courtName, user, date, time, duration } = req.body;

  let data = readData();

  const newBooking = {
    courtName,
    user,
    date,
    time,
    duration,
    status: "Pending"
  };

  const conflict = data.bookings.find(b => isOverlapping(newBooking, b));

  if (conflict) {
    return res.send("Time slot overlaps with existing booking ❌");
  }

  newBooking.id = Date.now().toString();

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
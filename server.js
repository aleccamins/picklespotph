const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

const DATA_FILE = "data.json";

// COURTS
const courts = [
  { name: "Cebu Pickle Court" },
  { name: "Dumaguete Court 1" },
  { name: "Dumaguete Court 2" }
];

// OWNERS (simple login)
const owners = [
  { username: "cebu", password: "1234", court: "Cebu Pickle Court" },
  { username: "duma1", password: "1234", court: "Dumaguete Court 1" },
  { username: "duma2", password: "1234", court: "Dumaguete Court 2" }
];

// READ
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

// WRITE
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// TIME
function timeToMinutes(timeStr) {
  let [time, mod] = timeStr.split(" ");
  let [h, m] = time.split(":");

  h = parseInt(h);
  m = parseInt(m);

  if (mod === "PM" && h !== 12) h += 12;
  if (mod === "AM" && h === 12) h = 0;

  return h * 60 + m;
}

// OVERLAP
function isOverlapping(newB, existingB) {
  if (newB.date !== existingB.date) return false;
  if (newB.courtName !== existingB.courtName) return false;

  const newStart = timeToMinutes(newB.time);
  const newEnd = newStart + (parseInt(newB.duration) * 60);

  const oldStart = timeToMinutes(existingB.time);
  const oldEnd = oldStart + (parseInt(existingB.duration || 1) * 60);

  return newStart < oldEnd && newEnd > oldStart;
}

// LOGIN
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const owner = owners.find(o => o.username === username && o.password === password);

  if (!owner) return res.send("Invalid login ❌");

  res.json(owner);
});

// COURTS
app.get("/courts", (req, res) => res.json(courts));

// BOOKINGS
app.get("/bookings", (req, res) => {
  const data = readData();
  res.json(data.bookings);
});

// BOOK
app.post("/book", (req, res) => {
  const { courtName, user, date, time, duration } = req.body;

  let data = readData();

  const newBooking = {
    id: Date.now().toString(),
    courtName,
    user,
    date,
    time,
    duration,
    status: "Pending"
  };

  const conflict = data.bookings.find(b => isOverlapping(newBooking, b));
  if (conflict) return res.send("Time slot overlaps ❌");

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
app.listen(PORT, () => console.log("Server running"));
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use(express.static(path.join(__dirname, "public")));

const DATA_FILE = "data.json";

// INIT
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    bookings: [],
    courts: [
      { name: "Default Court", price: 100 }
    ]
  }, null, 2));
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET COURTS
app.get("/courts", (req, res) => {
  res.json(readData().courts);
});

// BOOK
app.post("/book", (req, res) => {
  const { courtName, user, date, time, duration, proof } = req.body;

  let data = readData();

  data.bookings.push({
    id: Date.now().toString(),
    courtName,
    user,
    date,
    time,
    duration,
    proof,
    status: "Pending"
  });

  writeData(data);
  res.send("Booked");
});

// BOOKINGS
app.get("/bookings", (req, res) => {
  res.json(readData().bookings);
});

// APPROVE / REJECT
app.post("/approve/:id", (req, res) => {
  let data = readData();
  data.bookings = data.bookings.map(b =>
    b.id === req.params.id ? { ...b, status: "Approved" } : b
  );
  writeData(data);
  res.send("Approved");
});

app.post("/reject/:id", (req, res) => {
  let data = readData();
  data.bookings = data.bookings.map(b =>
    b.id === req.params.id ? { ...b, status: "Rejected" } : b
  );
  writeData(data);
  res.send("Rejected");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.listen(5000);
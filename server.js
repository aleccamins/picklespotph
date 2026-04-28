const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 SERVE FRONTEND FILES
app.use(express.static(path.join(__dirname, "public")));

const DATA_FILE = "data.json";
const PAYMONGO_SECRET = "sk_test_xxx"; // ⚠️ put your TEST key here

// INIT DATA
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ bookings: [] }, null, 2));
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

//////////////////////////////////////////////////////
// 🔥 IMPORTANT: LANDING PAGE FIX
//////////////////////////////////////////////////////

// 👉 This ensures index.html is shown
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

//////////////////////////////////////////////////////
// PAYMONGO PAYMENT LINK
//////////////////////////////////////////////////////

app.post("/create-payment", async (req, res) => {
  const { name, date, time, duration, courtName } = req.body;

  const amount = duration * 100;

  try {
    const response = await axios.post(
      "https://api.paymongo.com/v1/links",
      {
        data: {
          attributes: {
            amount: amount * 100,
            description: "PickleSpotPH Booking",
            remarks: JSON.stringify({
              name,
              date,
              time,
              duration,
              courtName
            })
          }
        }
      },
      {
        headers: {
          Authorization:
            "Basic " + Buffer.from(PAYMONGO_SECRET + ":").toString("base64"),
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      checkout_url: response.data.data.attributes.checkout_url
    });

  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).send("Payment error");
  }
});

//////////////////////////////////////////////////////
// BOOKINGS API
//////////////////////////////////////////////////////

app.get("/bookings", (req, res) => {
  const data = readData();
  res.json(data.bookings);
});

//////////////////////////////////////////////////////
// 🔥 WEBHOOK (AUTO CREATE BOOKING AFTER PAYMENT)
//////////////////////////////////////////////////////

app.post("/webhook", (req, res) => {
  try {
    const event = req.body;

    if (event.data.attributes.type === "payment.paid") {
      const paymentData = event.data.attributes.data.attributes;

      const parsed = JSON.parse(paymentData.remarks);

      const data = readData();

      data.bookings.push({
        id: Date.now().toString(),
        user: parsed.name,
        date: parsed.date,
        time: parsed.time,
        duration: parsed.duration,
        courtName: parsed.courtName,
        status: "Paid"
      });

      writeData(data);
    }

    res.sendStatus(200);

  } catch (err) {
    console.log("Webhook error:", err.message);
    res.sendStatus(400);
  }
});

//////////////////////////////////////////////////////
// START SERVER
//////////////////////////////////////////////////////

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
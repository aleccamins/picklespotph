let selectedTime = "";
let selectedDate = "";
let selectedCourt = localStorage.getItem("selectedCourt") || "Court A";

const times = [
  "8:00 AM","9:00 AM","10:00 AM",
  "11:00 AM","12:00 PM","1:00 PM",
  "2:00 PM","3:00 PM","4:00 PM",
  "5:00 PM","6:00 PM","7:00 PM"
];

// LOAD SLOTS
async function loadSlots() {
  selectedDate = document.getElementById("date").value;
  if (!selectedDate) return;

  const res = await fetch("/bookings");
  const bookings = await res.json();

  const container = document.getElementById("slots");
  container.innerHTML = "";

  times.forEach(time => {
    const div = document.createElement("div");
    div.className = "slot";
    div.innerText = time;

    const taken = bookings.find(b =>
      b.date === selectedDate &&
      b.time === time &&
      b.courtName === selectedCourt &&
      (b.status === "Paid" || b.status === "Approved")
    );

    if (taken) {
      div.classList.add("disabled");
      div.innerText += " (Booked)";
    } else {
      div.onclick = () => selectSlot(div, time);
    }

    container.appendChild(div);
  });
}

// SELECT SLOT
function selectSlot(el, time) {
  document.querySelectorAll(".slot").forEach(s => s.classList.remove("selected"));
  el.classList.add("selected");
  selectedTime = time;
}

// PAY / BOOK
async function pay() {
  const name = document.getElementById("name").value;
  const duration = document.getElementById("duration").value;

  if (!name || !selectedDate || !selectedTime) {
    alert("Complete all fields");
    return;
  }

  // 🔥 SAVE FOR CONFIRMATION PAGE
  localStorage.setItem("lastBooking", JSON.stringify({
    court: selectedCourt,
    date: selectedDate,
    time: selectedTime,
    duration: duration
  }));

  // 🔥 OPTIONAL: CALL PAYMENT API (if using PayMongo)
  try {
    const res = await fetch("/create-payment", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        name,
        date: selectedDate,
        time: selectedTime,
        duration,
        courtName: selectedCourt
      })
    });

    const data = await res.json();

    // 👉 Redirect to PayMongo checkout
    if (data.checkout_url) {
      window.location.href = data.checkout_url;
      return;
    }

  } catch (err) {
    console.log("Payment API error, fallback to confirmation");
  }

  // 🔥 FALLBACK (if no payment or testing)
  window.location.href = "confirmation.html";
}
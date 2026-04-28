let selectedTime = "";

const times = [
  "8:00 AM","9:00 AM","10:00 AM",
  "11:00 AM","12:00 PM","1:00 PM",
  "2:00 PM","3:00 PM","4:00 PM",
  "5:00 PM","6:00 PM","7:00 PM"
];

// LOAD SLOTS
async function loadSlots() {
  const date = document.getElementById("date").value;
  if (!date) return;

  const res = await fetch("/bookings");
  const bookings = await res.json();

  const container = document.getElementById("slots");
  container.innerHTML = "";

  times.forEach(time => {
    const div = document.createElement("div");
    div.className = "slot";
    div.innerText = time;

    const taken = bookings.find(b =>
      b.date === date &&
      b.time === time &&
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

// PAY VIA PAYMONGO
async function pay() {
  const name = document.getElementById("name").value;
  const date = document.getElementById("date").value;
  const duration = document.getElementById("duration").value;

  if (!name || !date || !selectedTime) {
    alert("Complete all fields");
    return;
  }

  const res = await fetch("/create-payment", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      name,
      date,
      time: selectedTime,
      duration,
      courtName: "Default Court"
    })
  });

  const data = await res.json();

  window.location.href = data.checkout_url;
}
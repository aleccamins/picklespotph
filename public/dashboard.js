const API = "http://localhost:5000";

// LOAD COURTS
async function loadCourts() {
  const res = await fetch(API + "/courts");
  const data = await res.json();

  const container = document.getElementById("courts");
  container.innerHTML = "";

  data.forEach(court => {
    container.innerHTML += `
      <div style="background:white;padding:10px;margin:10px;border-radius:10px;">
        <h3>${court.name}</h3>
        <p>${court.location}</p>
      </div>
    `;
  });
}

// LOAD BOOKINGS
async function loadBookings() {
  const res = await fetch(API + "/bookings");
  const data = await res.json();

  const container = document.getElementById("bookings");
  container.innerHTML = "";

  data.forEach(b => {
    container.innerHTML += `
      <div style="background:white;padding:10px;margin:10px;border-radius:10px;">
        <p><b>Court:</b> ${b.courtName}</p>
        <p><b>User:</b> ${b.user}</p>
        <p><b>Date:</b> ${b.date}</p>
        <p><b>Time:</b> ${b.time}</p>
        <p><b>Status:</b> ${b.status}</p>

        <button onclick="approveBooking('${b.id}')">Approve</button>
        <button onclick="rejectBooking('${b.id}')">Reject</button>
      </div>
    `;
  });
}

// CREATE BOOKING
async function createBooking() {
  const user = document.getElementById("user").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  await fetch(API + "/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      courtName: "Cebu Pickle Court",
      user,
      date,
      time
    })
  });

  loadBookings();
}

// APPROVE
async function approveBooking(id) {
  await fetch(API + "/approve/" + id, { method: "POST" });
  loadBookings();
}

// REJECT
async function rejectBooking(id) {
  await fetch(API + "/reject/" + id, { method: "POST" });
  loadBookings();
}

// INIT
loadCourts();
loadBookings();
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

// CREATE BOOKING
async function createBooking() {
  const user = document.getElementById("user").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  const res = await fetch(API + "/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      courtName: "Cebu Pickle Court",
      user,
      date,
      time
    })
  });

  const msg = await res.text();
  alert(msg);
}

// INIT
loadCourts();
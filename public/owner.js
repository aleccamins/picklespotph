async function loadBookings() {
  const res = await fetch("/bookings");
  const data = await res.json();

  const container = document.getElementById("bookings");
  container.innerHTML = "";

  data.forEach(b => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <p><b>Court:</b> ${b.courtName}</p>
      <p><b>User:</b> ${b.user}</p>
      <p><b>Date:</b> ${b.date}</p>
      <p><b>Time:</b> ${b.time}</p>
      <p><b>Duration:</b> ${b.duration} hour(s)</p>
      <p><b>Status:</b> ${b.status}</p>
      <button class="approve" onclick="approve('${b.id}')">Approve</button>
      <button class="reject" onclick="reject('${b.id}')">Reject</button>
    `;

    container.appendChild(div);
  });
}

async function approve(id) {
  await fetch(`/approve/${id}`, { method: "POST" });
  loadBookings();
}

async function reject(id) {
  await fetch(`/reject/${id}`, { method: "POST" });
  loadBookings();
}

loadBookings();
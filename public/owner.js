async function loadBookings() {
  const res = await fetch("/bookings");
  const bookings = await res.json();

  const container = document.getElementById("list");
  container.innerHTML = "";

  if (bookings.length === 0) {
    container.innerHTML = "No bookings yet";
    return;
  }

  bookings.reverse().forEach(b => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>${b.user}</b><br>
      ${b.date} - ${b.time}<br>
      ${b.duration} hr<br>
      Status: ${b.status}
      <br><br>
      <button class="approve" onclick="approve('${b.id}')">Approve</button>
      <button class="reject" onclick="reject('${b.id}')">Reject</button>
    `;

    container.appendChild(div);
  });
}

async function approve(id) {
  await fetch("/approve/" + id, { method:"POST" });
  loadBookings();
}

async function reject(id) {
  await fetch("/reject/" + id, { method:"POST" });
  loadBookings();
}

loadBookings();
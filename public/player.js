async function book() {
  const user = document.getElementById("name").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  if (!user || !date || !time) {
    alert("Please fill all fields");
    return;
  }

  const res = await fetch("/book", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      courtName: "Cebu Pickle Court",
      user,
      date,
      time
    })
  });

  const msg = await res.text();
  alert(msg);

  // Clear fields
  document.getElementById("name").value = "";
  document.getElementById("date").value = "";
  document.getElementById("time").value = "";
}
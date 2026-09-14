import { API } from "./api.js";
import { loadPatients } from "./patients.js";
import { disconnectSphere } from "./sphere.js";

export function initAuth() {
  document.getElementById("loginBtn").addEventListener("click", handleLogin);
  document.getElementById("password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });
  document.getElementById("logoutBtn").addEventListener("click", handleLogout);
}

async function handleLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    document.getElementById("loginError").textContent = data.message;
    return;
  }

  document.getElementById("loginSection").style.display = "none";
  document.getElementById("appSection").style.display = "block";
  document.getElementById("doctorInfo").style.display = "flex";
  document.getElementById("doctorName").textContent = `Dr. ${data.doctor.name}`;

  loadPatients();
}

// Epic issues no session token in this prototype, so "logout" is just a client-side
// UI reset — there is no server-side session to invalidate.
function handleLogout() {
  disconnectSphere();
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
  document.getElementById("loginError").textContent = "";
  document.getElementById("doctorInfo").style.display = "none";
  document.getElementById("appSection").style.display = "none";
  document.getElementById("patientDetail").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
}

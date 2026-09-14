import { API } from "./api.js";
import { state } from "./state.js";

// Wires up everything on the patient-list and patient-detail screens that isn't
// login/logout (auth.js) or adding new records (records.js).
export function initPatients() {
  document.getElementById("searchBtn").addEventListener("click", () => loadPatients(1));
  document.getElementById("searchInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadPatients(1);
  });
  document.getElementById("prevBtn").addEventListener("click", () => {
    if (state.currentPage > 1) loadPatients(state.currentPage - 1);
  });
  document.getElementById("nextBtn").addEventListener("click", () => loadPatients(state.currentPage + 1));
  document.getElementById("backBtn").addEventListener("click", () => {
    document.getElementById("patientDetail").style.display = "none";
    document.getElementById("appSection").style.display = "block";
  });

  document.getElementById("toggleHistoryBtn").addEventListener("click", (e) => {
    const historyList = document.getElementById("detailHistory");
    const isHidden = historyList.style.display === "none";
    historyList.style.display = isHidden ? "block" : "none";
    e.target.textContent = isHidden ? "Hide History" : "Show History";
  });
}

export async function loadPatients(page = 1) {
  state.currentPage = page;
  const search = document.getElementById("searchInput").value;

  const res = await fetch(`${API}/patients?search=${encodeURIComponent(search)}&page=${page}&limit=5`);
  const data = await res.json();

  const list = document.getElementById("patientList");
  list.innerHTML = "";

  if (data.patients.length === 0) {
    list.innerHTML = `<li class="empty-note">No patients found.</li>`;
  }

  data.patients.forEach((p) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${p.firstName} ${p.lastName}</span><span class="mrn-tag">MRN: ${p.mrn}</span>`;
    li.addEventListener("click", () => showPatient(p.mrn));
    list.appendChild(li);
  });

  document.getElementById("pageInfo").textContent = `Page ${data.page} of ${data.totalPages || 1}`;
}

// Exported because records.js also calls this, to refresh the detail view
// immediately after saving a new visit.
export async function showPatient(mrn) {
  state.currentMrn = mrn;
  const res = await fetch(`${API}/patients/${mrn}`);
  const data = await res.json();
  const patient = data.patient;
  state.currentPatient = patient; // records.js needs this to know the newest diagnosis's id

  document.getElementById("appSection").style.display = "none";
  document.getElementById("patientDetail").style.display = "block";

  document.getElementById("detailName").textContent = `${patient.firstName} ${patient.lastName}`;
  document.getElementById("detailInfo").textContent = `MRN: ${patient.mrn}  |  DOB: ${patient.dob}  |  Sex: ${patient.sex}`;

  const allergiesList = document.getElementById("detailAllergies");
  allergiesList.innerHTML = patient.allergies.length ? "" : `<li class="empty-note">No known allergies.</li>`;
  patient.allergies.forEach((a) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${a.substance}</strong>: ${a.reaction} <span class="muted">${a.note || ""}</span>`;
    allergiesList.appendChild(li);
  });

  renderHistory(patient);
}

// Past visits, newest first. Each diagnosis shows the medications prescribed
// alongside it, found by matching `medication.relatedDiagnosisId` back to
// `diagnosis._id` — the reference link, not a flat separate list.
function renderHistory(patient) {
  const history = document.getElementById("detailHistory");
  history.innerHTML = "";

  if (patient.diagnoses.length === 0) {
    history.innerHTML = `<li class="empty-note">No history recorded yet.</li>`;
    return;
  }

  const newestFirst = patient.diagnoses.slice().reverse(); // .slice() copies the array so .reverse() doesn't disturb the original order

  newestFirst.forEach((d) => {
    const linkedMeds = patient.medications.filter((m) => m.relatedDiagnosisId === d._id);

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${d.label}</strong> <span class="muted">(${d.diagnosedOn})</span><br>
      <span class="muted">${d.note || ""}</span>
      ${linkedMeds.length
        ? `<ul class="nested-meds">${linkedMeds.map((m) => `<li>&#128138; ${m.name} — ${m.dosage}, ${m.frequency}</li>`).join("")}</ul>`
        : ""}
    `;
    history.appendChild(li);
  });
}

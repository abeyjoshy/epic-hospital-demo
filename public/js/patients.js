import { API } from "./api.js";
import { state } from "./state.js";
import { resetMeows } from "./records.js";

// The old value (5) was an arbitrary small number left over from before the
// list panel could scroll internally. Now that it can, a page can reasonably
// hold more — this is still a fixed page size (real pagination), just a
// sensible one instead of a leftover small one.
const PAGE_SIZE = 20;

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
    document.getElementById("appSection").style.display = "flex";
    loadPatients(state.currentPage); // the list may be stale (e.g. a patient was just created)
  });

  document.getElementById("openAddPatientModalBtn").addEventListener("click", () => {
    document.getElementById("addPatientModal").style.display = "flex";
  });
  document.getElementById("closeAddPatientModalBtn").addEventListener("click", () => {
    document.getElementById("addPatientModal").style.display = "none";
  });

  document.getElementById("addPatientBtn").addEventListener("click", addPatient);

  document.getElementById("viewFullHistoryBtn").addEventListener("click", () => {
    const patient = state.currentPatient;

    document.getElementById("patientDetail").style.display = "none";
    document.getElementById("patientHistoryFull").style.display = "flex";

    document.getElementById("fullHistoryName").textContent = `${patient.firstName} ${patient.lastName}`;
    document.getElementById("fullHistoryInfo").textContent = `MRN: ${patient.mrn}  |  DOB: ${patient.dob}  |  Sex: ${patient.sex}`;

    renderAllergies("fullHistoryAllergies", patient);
    renderFullHistory(patient);
  });

  document.getElementById("backToPatientBtn").addEventListener("click", () => {
    document.getElementById("patientHistoryFull").style.display = "none";
    document.getElementById("patientDetail").style.display = "flex";
  });
}

async function addPatient() {
  const firstName = document.getElementById("newPatientFirstName").value;
  const lastName = document.getElementById("newPatientLastName").value;
  const dob = document.getElementById("newPatientDob").value;
  const sex = document.getElementById("newPatientSex").value;
  const phone = document.getElementById("newPatientPhone").value;
  const ppsn = document.getElementById("newPatientPpsn").value;

  if (!firstName || !lastName || !dob) return;

  const res = await fetch(`${API}/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, dob, sex, phone, ppsn }),
  });

  if (!res.ok) return;

  const data = await res.json();

  document.getElementById("newPatientFirstName").value = "";
  document.getElementById("newPatientLastName").value = "";
  document.getElementById("newPatientDob").value = "";
  document.getElementById("newPatientSex").value = "";
  document.getElementById("newPatientPhone").value = "";
  document.getElementById("newPatientPpsn").value = "";
  document.getElementById("addPatientModal").style.display = "none";

  showPatient(data.patient.mrn); // go straight to the new patient's own page
}

export async function loadPatients(page = 1) {
  state.currentPage = page;
  const search = document.getElementById("searchInput").value;

  const res = await fetch(`${API}/patients?search=${encodeURIComponent(search)}&page=${page}&limit=${PAGE_SIZE}`);
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
  document.getElementById("patientDetail").style.display = "flex"; // .app-shell is a flex container

  document.getElementById("detailName").textContent = `${patient.firstName} ${patient.lastName}`;
  document.getElementById("detailInfo").textContent = `MRN: ${patient.mrn}  |  DOB: ${patient.dob}  |  Sex: ${patient.sex}`;

  resetMeows();
  document.getElementById("addAllergyForm").style.display = "none"; // collapsed by default on every fresh page load

  renderAllergies("detailAllergies", patient);
  renderHistory(patient);
}

// Shared by both the patient detail page and the full-history page — one
// allergy-list renderer, one place its markup is defined.
function renderAllergies(containerId, patient) {
  const allergiesList = document.getElementById(containerId);
  allergiesList.innerHTML = patient.allergies.length ? "" : `<li class="empty-note">No known allergies.</li>`;
  patient.allergies.forEach((a) => {
    const li = document.createElement("li");
    li.className = "allergy-item";
    li.innerHTML = `
      <div class="allergy-header">
        <span class="allergy-substance">&#9888;&#65039; ${a.substance}</span>
        ${a.recordedOn ? `<span class="muted">${a.recordedOn}</span>` : ""}
      </div>
      ${a.reaction ? `<div class="allergy-reaction"><strong>Reaction:</strong> ${a.reaction}</div>` : ""}
      ${a.note ? `<div class="allergy-note">${a.note}</div>` : ""}
    `;
    allergiesList.appendChild(li);
  });
}

// Concise version shown on the patient detail page: diagnosis, date, and how
// many medications go with it — no notes, no medication detail. Just enough
// to scan quickly; "View Detailed History" is where the full picture lives.
function renderHistory(patient) {
  const history = document.getElementById("detailHistory");
  history.innerHTML = "";

  if (patient.diagnoses.length === 0) {
    history.innerHTML = `<li class="empty-note">No history recorded yet.</li>`;
    return;
  }

  const newestFirst = patient.diagnoses.slice().reverse();

  newestFirst.forEach((d) => {
    const medCount = patient.medications.filter((m) => m.relatedDiagnosisId === d._id).length;

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${d.label}</strong> <span class="muted">(${d.diagnosedOn})</span>
      ${medCount ? `<span class="mrn-tag">${medCount} medication${medCount > 1 ? "s" : ""}</span>` : ""}
    `;
    history.appendChild(li);
  });
}

// Full version shown on the dedicated history page: every diagnosis with its
// note, and every linked medication with its dosage/frequency/note — the
// complete picture the concise card deliberately leaves out.
function renderFullHistory(patient) {
  const history = document.getElementById("fullHistoryList");
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
        ? `<ul class="nested-meds">${linkedMeds.map((m) => `
            <li>
              <div class="med-name">&#128138; ${m.name}</div>
              <div class="med-detail">${[m.dosage, m.frequency].filter(Boolean).join(", ")}</div>
              ${m.note ? `<div class="med-note">${m.note}</div>` : ""}
            </li>
          `).join("")}</ul>`
        : ""}
    `;
    history.appendChild(li);
  });
}

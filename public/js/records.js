import { API } from "./api.js";
import { state } from "./state.js";
import { showPatient } from "./patients.js";

// Wires up the "Save Visit" action (diagnosis + any number of medications)
// and the allergy add-form toggle.
export function initRecords() {
  document.getElementById("saveVisitBtn").addEventListener("click", saveVisit);

  document.getElementById("addMedRowBtn").addEventListener("click", () => {
    document.getElementById("visitMedRows").appendChild(createMeow());
  });

  document.getElementById("openAddAllergyBtn").addEventListener("click", () => {
    const form = document.getElementById("addAllergyForm");
    form.style.display = form.style.display === "none" ? "flex" : "none";
  });

  document.getElementById("addAllergyBtn").addEventListener("click", addAllergy);
}

// One medication input row, as its own small DOM chunk — built with
// createElement instead of static HTML because a visit can have any number
// of these, so each one's inputs are found by class (querySelector scoped to
// the row), not by a fixed id like the old single-medication version used.
function createMeow() {
  const row = document.createElement("div");
  row.className = "add-form med-row";
  row.innerHTML = `
    <input type="text" class="med-name" placeholder="Medication" />
    <input type="text" class="med-dosage" placeholder="Dosage" />
    <input type="text" class="med-frequency" placeholder="Frequency" />
    <input type="text" class="med-note" placeholder="Note (optional)" />
    <button type="button" class="secondary remove-med-row">&times;</button>
  `;
  row.querySelector(".remove-med-row").addEventListener("click", () => row.remove());
  return row;
}

// Clears the medication rows back to a single empty one. Exported so
// patients.js can call it whenever a different patient's page is opened, so
// leftover rows from a previous visit don't carry over.
export function resetMeows() {
  const container = document.getElementById("visitMedRows");
  container.innerHTML = "";
  container.appendChild(createMeow());
}

// One visit = one diagnosis (title + note) plus zero or more medications
// prescribed for it, one per row currently in #visitMeows. The diagnosis is
// created first so its _id exists to link each medication to.
async function saveVisit() {
  const label = document.getElementById("visitDiagnosis").value;
  const note = document.getElementById("visitNote").value;

  if (!label) return;

  const diagnosisRes = await fetch(`${API}/patients/${state.currentMrn}/diagnoses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label, note }),
  });

  if (!diagnosisRes.ok) return;

  const diagnosisData = await diagnosisRes.json();
  const updatedDiagnoses = diagnosisData.patient.diagnoses;
  const newDiagnosis = updatedDiagnoses[updatedDiagnoses.length - 1]; // the push always appends, so it's last

  const meows = document.querySelectorAll("#visitMedRows .med-row");

  // Sequential, not parallel (Promise.all) — for a handful of rows the
  // difference isn't noticeable, and doing them one at a time keeps this
  // simple and matches everything else's plain await-in-order style.
  for (const row of meows) {
    const name = row.querySelector(".med-name").value;
    if (!name) continue; // an empty row (never filled in) is just skipped, not an error

    const dosage = row.querySelector(".med-dosage").value;
    const frequency = row.querySelector(".med-frequency").value;
    const medNote = row.querySelector(".med-note").value;

    await fetch(`${API}/patients/${state.currentMrn}/medications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        dosage,
        frequency,
        note: medNote,
        diagnosisId: newDiagnosis._id,
      }),
    });
  }

  document.getElementById("visitDiagnosis").value = "";
  document.getElementById("visitNote").value = "";
  resetMeows();

  showPatient(state.currentMrn); // refresh so the new visit appears in history immediately
}

async function addAllergy() {
  const substance = document.getElementById("newAllergySubstance").value;
  const reaction = document.getElementById("newAllergyReaction").value;
  const note = document.getElementById("newAllergyNote").value;

  if (!substance) return;

  const res = await fetch(`${API}/patients/${state.currentMrn}/allergies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ substance, reaction, note }),
  });

  if (res.ok) {
    document.getElementById("newAllergySubstance").value = "";
    document.getElementById("newAllergyReaction").value = "";
    document.getElementById("newAllergyNote").value = "";
    document.getElementById("addAllergyForm").style.display = "none"; // collapse it again
    showPatient(state.currentMrn);
  }
}

import { API } from "./api.js";
import { state } from "./state.js";
import { showPatient } from "./patients.js";

// Wires up the single "Save Visit" action on the patient detail view.
export function initRecords() {
  document.getElementById("saveVisitBtn").addEventListener("click", saveVisit);
}

// One visit = one diagnosis (title + note) plus, optionally, one medication
// prescribed for it. The two are separate database writes (there's no combined
// endpoint), but from the doctor's side it's a single "Save Visit" action:
// 1. create the diagnosis
// 2. read back its _id from the response
// 3. create the medication, linked to that _id
async function saveVisit() {
  const label = document.getElementById("visitDiagnosis").value;
  const note = document.getElementById("visitNote").value;
  const medName = document.getElementById("visitMedName").value;
  const medDosage = document.getElementById("visitMedDosage").value;
  const medFrequency = document.getElementById("visitMedFrequency").value;

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

  if (medName) {
    await fetch(`${API}/patients/${state.currentMrn}/medications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: medName,
        dosage: medDosage,
        frequency: medFrequency,
        diagnosisId: newDiagnosis._id,
      }),
    });
  }

  document.getElementById("visitDiagnosis").value = "";
  document.getElementById("visitNote").value = "";
  document.getElementById("visitMedName").value = "";
  document.getElementById("visitMedDosage").value = "";
  document.getElementById("visitMedFrequency").value = "";

  showPatient(state.currentMrn); // refresh so the new visit appears in history immediately
}

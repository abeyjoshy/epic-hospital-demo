import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  mrn: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dob: { type: String, required: true },
  sex: { type: String },
  phone: { type: String },
  diagnoses: [{ label: String, diagnosedOn: String, note: String }],
  allergies: [{ substance: String, reaction: String, note: String }],
  medications: [
  {
    name: { type: String, required: true },
    dosage: { type: String },
    frequency: { type: String },
    note: { type: String },
    prescribedOn: { type: String },
    relatedDiagnosisId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
],
});

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;

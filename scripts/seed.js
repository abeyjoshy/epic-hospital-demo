import mongoose from "mongoose";
import mongooseClient from "../src/config/mongod.conf.js";
import Doctor from "../src/models/doctor.Model.js";
import Patient from "../src/models/patient.Model.js";

async function seed() {
  await mongooseClient.connect();

  if (mongoose.connection.readyState !== 1) {
    console.error("Could not connect to MongoDB. Check your .env settings.");
    process.exit(1);
  }

  await Doctor.deleteMany({});
  await Patient.deleteMany({});

  await Doctor.create([
    { email: "abey@epic.com", password: "Epic@123", name: "Dr. Abey" },
  ]);

  // Pre-generated so a medication can link back to the diagnosis it was
  // prescribed for, the same relatedDiagnosisId pattern addMedication.controller.js uses.
  const mehtaDiagnosisId = new mongoose.Types.ObjectId();
  const nairDiagnosisId = new mongoose.Types.ObjectId();
  const subramaniamDiagnosisId = new mongoose.Types.ObjectId();

  await Patient.create([
    // Also present in Evolve (same name, dob, ppsn) — syncing both should
    // merge onto one SPHERE Patient, matched by the shared PPSN identifier.
    {
      mrn: "MRN-9001", firstName: "Arjun", lastName: "Mehta", dob: "1985-03-22", sex: "M", phone: "0851000001", ppsn: "1234567A",
      diagnoses: [{ _id: mehtaDiagnosisId, label: "Type 2 Diabetes Mellitus", diagnosedOn: "2022-06-15", note: "diet and metformin controlled" }],
      medications: [{ name: "Metformin", dosage: "500mg", frequency: "twice daily", note: "", prescribedOn: "2022-06-15", relatedDiagnosisId: mehtaDiagnosisId }],
      allergies: [{ substance: "Penicillin", reaction: "Rash", note: "" }],
    },
    // Also present in Evolve (same name, dob, ppsn) — second shared patient.
    {
      mrn: "MRN-9002", firstName: "Priya", lastName: "Nair", dob: "1990-11-08", sex: "F", phone: "0851000002", ppsn: "2345678B",
      diagnoses: [{ _id: nairDiagnosisId, label: "Migraine", diagnosedOn: "2023-02-10", note: "hormonal trigger suspected" }],
      medications: [{ name: "Sumatriptan", dosage: "50mg", frequency: "as needed", note: "", prescribedOn: "2023-02-10", relatedDiagnosisId: nairDiagnosisId }],
      allergies: [],
    },
    // Epic-only — no matching record in Evolve.
    {
      mrn: "MRN-9003", firstName: "Karthik", lastName: "Subramaniam", dob: "1982-01-15", sex: "M", phone: "0851000003", ppsn: "5678901E",
      diagnoses: [{ _id: subramaniamDiagnosisId, label: "Asthma", diagnosedOn: "2020-05-20", note: "exercise-induced episodes" }],
      medications: [{ name: "Salbutamol inhaler", dosage: "2 puffs", frequency: "as needed", note: "", prescribedOn: "2020-05-20", relatedDiagnosisId: subramaniamDiagnosisId }],
      allergies: [{ substance: "Dust mites", reaction: "Wheezing", note: "" }],
    },
  ]);

  console.log("Epic local DB seeded with 3 patients and 1 doctor.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (error) => {
  console.error(`Seed failed: ${error}`);
  await mongoose.disconnect();
  process.exit(1);
});

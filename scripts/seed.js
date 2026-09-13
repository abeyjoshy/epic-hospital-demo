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
    { email: "joshy@epic.com", password: "Epic@123", name: "Dr. Joshy" },
  ]);

  await Patient.create([
    {
      mrn: "MRN-9001", firstName: "Abey", lastName: "Joshy", dob: "1998-04-12", sex: "M", phone: "0851234567",
      diagnoses: [{ label: "Hypertension", diagnosedOn: "2023-06-01", note: "patient was in tension" }],
      allergies: [{ substance: "Penicillin", reaction: "Rash", note: "patient had multiple rashes in neck" }],
    },
    {
      mrn: "MRN-9002", firstName: "Sara", lastName: "Byrne", dob: "1990-11-02", sex: "F", phone: "0861234567",
      diagnoses: [{ label: "Asthma", diagnosedOn: "2021-02-15", note: "patient was breating heavely" }],
      allergies: [],
    },
  ]);

  console.log("Epic local DB seeded.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (error) => {
  console.error(`Seed failed: ${error}`);
  await mongoose.disconnect();
  process.exit(1);
});
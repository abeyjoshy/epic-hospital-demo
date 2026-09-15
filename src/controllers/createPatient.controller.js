import Patient from "../models/patient.Model.js";

export default async function createPatient(req, res) {
  const firstName = req.body?.firstName || null;
  const lastName = req.body?.lastName || null;
  const dob = req.body?.dob || null;
  const sex = req.body?.sex || "";
  const phone = req.body?.phone || "";
  const ppsn = req.body?.ppsn || "";

  if (!firstName || !lastName || !dob) {
    return res.status(400).json({ message: "firstName, lastName and dob are required" });
  }

  try {
    const mrn = await generateMrn();

    const patient = new Patient({ mrn, firstName, lastName, dob, sex, phone, ppsn });
    await patient.save();

    return res.status(201).json({ patient });
  } catch (error) {
    console.error(`Error creating patient: ${error}`);
    return res.status(500).json({ message: "Failed to create patient" });
  }
}

async function generateMrn() {
  const count = await Patient.countDocuments();
  return `MRN-${9000 + count + 1}`;
}
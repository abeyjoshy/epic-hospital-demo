import Patient from "../models/patient.Model.js";

export default async function addMedication(req, res) {
  const { mrn } = req.params;
  const name = req.body?.name || null;
  const dosage = req.body?.dosage || "";
  const frequency = req.body?.frequency || "";
  const note = req.body?.note || "";
  const diagnosisId = req.body?.diagnosisId || null;

  if (!name) {
    return res.status(400).json({ message: "name is required" });
  }

  try {
    const patient = await Patient.findOneAndUpdate(
      { mrn },
      {
        $push: {
          medications: {
            name, dosage, frequency, note,
            relatedDiagnosisId: diagnosisId,
            prescribedOn: new Date().toISOString().slice(0, 10),
          },
        },
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: `No patient with MRN '${mrn}'` });
    }

    return res.status(201).json({ patient });
  } catch (error) {
    console.error(`Error adding medication for ${mrn}: ${error}`);
    return res.status(500).json({ message: "Failed to add medication" });
  }
}
import Patient from "../models/patient.Model.js";

export default async function addDiagnosis(req, res) {
  const { mrn } = req.params;
  const label = req.body?.label || null;
  const note = req.body?.note || "";

  if (!label) {
    return res.status(400).json({ message: "label is required" });
  }

  try {
    const patient = await Patient.findOneAndUpdate(
      { mrn },
      {
        $push: {
          diagnoses: {
            label,
            note,
            diagnosedOn: new Date().toISOString().slice(0, 10),
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
    console.error(`Error adding diagnosis for ${mrn}: ${error}`);
    return res.status(500).json({ message: "Failed to add diagnosis" });
  }
}
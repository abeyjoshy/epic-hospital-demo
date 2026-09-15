import Patient from "../models/patient.Model.js";

export default async function addAllergies(req, res) {
  const { mrn } = req.params;
  const substance = req.body?.substance || null;
  const reaction = req.body?.reaction || "";
  const note = req.body?.note || "";
  
  if (!substance) {
    return res.status(400).json({ message: "substance is required" });
  }

  try {
    const patient = await Patient.findOneAndUpdate(
      { mrn },
      {
        $push: {
          allergies: {
            substance, reaction, note
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
    console.error(`Error adding allergies for ${mrn}: ${error}`);
    return res.status(500).json({ message: "Failed to add medication" });
  }
}
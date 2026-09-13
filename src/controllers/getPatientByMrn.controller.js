import Patient from "../models/patient.Model.js";

export default async function getPatientByMrn(req, res) {
  const { mrn } = req.params;

  try {
    const patient = await Patient.findOne({ mrn });

    if (!patient) {
      return res.status(404).json({ message: `No patient with MRN '${mrn}'` });
    }

    return res.status(200).json({ patient });
  } catch (error) {
    console.error(`Error fetching patient ${mrn}: ${error}`);
    return res.status(500).json({ message: "Failed to fetch patient" });
  }
}
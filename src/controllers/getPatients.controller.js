import Patient from "../models/patient.Model.js";

export default async function getPatients(req, res) {
  const search = req.query?.search || "";
  const page = parseInt(req.query?.page) || 1;
  const limit = parseInt(req.query?.limit) || 10;

  try {
    const filter = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { mrn: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await Patient.countDocuments(filter);

    const patients = await Patient.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      patients,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(`Error fetching patients: ${error}`);
    return res.status(500).json({ message: "Failed to fetch patients" });
  }
}

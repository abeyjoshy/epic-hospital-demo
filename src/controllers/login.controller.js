import Doctor from "../models/doctor.Model.js"

export default async function login(req, res) {
  const email = req.body?.email || null;
  const password = req.body?.password || null;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const doctor = await Doctor.findOne({ email, password });

    if (!doctor) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      message: "Login successful",
      doctor: { email: doctor.email, name: doctor.name },
    });
  } catch (error) {
    console.error(`Error logging in doctor: ${error}`);
    return res.status(500).json({ message: "Login failed" });
  }
}
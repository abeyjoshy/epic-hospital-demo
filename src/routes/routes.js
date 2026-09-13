import { Router } from "express";
import login from "../controllers/login.controller.js";
import getPatients from "../controllers/getPatients.controller.js";
import getPatientByMrn from "../controllers/getPatientByMrn.controller.js";
import addDiagnosis from "../controllers/addDiagnosis.controller.js";
import addMedication from "../controllers/addMedication.controller.js";

const router = Router();

router.post("/login", login);
router.get("/patients", getPatients);
router.get("/patients/:mrn", getPatientByMrn);
router.post("/patients/:mrn/diagnoses", addDiagnosis);
router.post("/patients/:mrn/medications", addMedication);

export default router;
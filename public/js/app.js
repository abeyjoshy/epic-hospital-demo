// Single entry point, loaded by epic.html as <script type="module">.
// Each init function attaches the event listeners that module owns.
import { initAuth } from "./auth.js";
import { initPatients } from "./patients.js";
import { initRecords } from "./records.js";
import { initSphere } from "./sphere.js";

initAuth();
initPatients();
initRecords();
initSphere();

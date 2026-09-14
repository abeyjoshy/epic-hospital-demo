// Shared state used across modules. An object (not separate `let` exports) because
// ES module imports are read-only bindings — other files can mutate `state.currentMrn`,
// but they could not reassign an imported `let currentMrn` directly.
export const state = {
  currentMrn: null,
  currentPage: 1,
  currentPatient: null, // the last patient fetched by showPatient(), so records.js can read it
};

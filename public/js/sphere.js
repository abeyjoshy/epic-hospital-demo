// Epic's half of the SPHERE connection: show/hide the widget modal, and listen
// for the "connected" message the widget sends once login succeeds inside it.
// Epic never reads the SPHERE token itself — it only reacts to this one message.
import { state } from "./state.js";
import { SPHERE_BASE_URL } from "./config.js";

// Epic's own origin, told to the widget explicitly (via ?origin=) every time
// its src is set — this is how a generic, vendor-agnostic widget knows who
// it's talking to right now, instead of Epic being hardcoded inside it.
const EPIC_OWN_ORIGIN = "http://localhost:4000";

export function initSphere() {
  // Set on load, from config, instead of epic.html hardcoding its own copy
  // of the SPHERE URL in the iframe's static src attribute.
  document.getElementById("sphereFrame").src =
    `${SPHERE_BASE_URL}/widget.html?origin=${encodeURIComponent(EPIC_OWN_ORIGIN)}`;

  document.getElementById("connectSphereBtn").addEventListener("click", () => {
    document.getElementById("sphereModal").style.display = "flex";
  });

  document.getElementById("accessSphereBtn").addEventListener("click", () => {
    const frame = document.getElementById("sphereFrame");
    // Reloading the iframe's src is fine — the cached SPHERE token lives in
    // localStorage, which survives a reload; only the widget's in-memory JS
    // state resets, and it re-checks localStorage on load anyway.
    frame.src = `${SPHERE_BASE_URL}/widget.html?mrn=${encodeURIComponent(state.currentMrn)}&origin=${encodeURIComponent(EPIC_OWN_ORIGIN)}`;
    document.getElementById("sphereModal").style.display = "flex";
  });

  document.getElementById("closeSphereModalBtn").addEventListener("click", () => {
    document.getElementById("sphereModal").style.display = "none";
    // Reset the iframe to a neutral, no-patient URL on close — otherwise
    // reopening it later (e.g. via the header's "SPHERE: Connected" badge,
    // which never sets a fresh src) would just show whatever patient's
    // record was last loaded, stale and possibly for the wrong patient.
    const frame = document.getElementById("sphereFrame");
    frame.src = `${SPHERE_BASE_URL}/widget.html?origin=${encodeURIComponent(EPIC_OWN_ORIGIN)}`;
  });

  document.getElementById("syncSphereBtn").addEventListener("click", () => {
    // No modal shown — this runs in the background through the iframe, which
    // stays loaded (just hidden) so it still has the cached SPHERE token.
    const frame = document.getElementById("sphereFrame");
    frame.contentWindow.postMessage(
      { type: "sphere-sync", mrn: state.currentMrn },
      SPHERE_BASE_URL
    );
  });

  window.addEventListener("message", (event) => {
    // Only trust messages that actually came from SPHERE's own origin —
    // without this check, any page could fake a "connected" message.
    if (event.origin !== SPHERE_BASE_URL) return;

    if (event.data?.type === "sphere-connected") {
      document.getElementById("sphereModal").style.display = "none";
      setConnected();
    }

    if (event.data?.type === "sphere-sync-result") {
      showToast(event.data.success, event.data.message);
    }
  });
}

function showToast(success, message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${success ? "success" : "error"}`;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 4000);
}

function setConnected() {
  const btn = document.getElementById("connectSphereBtn");
  btn.textContent = "SPHERE: Connected";
  btn.classList.add("connected");
}

// Called from auth.js on Epic logout. The iframe stays loaded in the page even
// while hidden (that's why this works without the modal ever being opened) —
// we just tell it, via postMessage, to forget its own cached token.
export function disconnectSphere() {
  const frame = document.getElementById("sphereFrame");
  frame.contentWindow.postMessage({ type: "sphere-logout" }, SPHERE_BASE_URL);

  const btn = document.getElementById("connectSphereBtn");
  btn.textContent = "SPHERE: Not Connected";
  btn.classList.remove("connected");
}

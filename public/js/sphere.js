// Epic's half of the SPHERE connection: show/hide the widget modal, and listen
// for the "connected" message the widget sends once login succeeds inside it.
// Epic never reads the SPHERE token itself — it only reacts to this one message.
const SPHERE_ORIGIN = "http://localhost:3000";

export function initSphere() {
  document.getElementById("connectSphereBtn").addEventListener("click", () => {
    document.getElementById("sphereModal").style.display = "flex";
  });

  document.getElementById("closeSphereModalBtn").addEventListener("click", () => {
    document.getElementById("sphereModal").style.display = "none";
  });

  window.addEventListener("message", (event) => {
    // Only trust messages that actually came from SPHERE's own origin —
    // without this check, any page could fake a "connected" message.
    if (event.origin !== SPHERE_ORIGIN) return;

    if (event.data?.type === "sphere-connected") {
      document.getElementById("sphereModal").style.display = "none";
      setConnected();
    }
  });
}

function setConnected() {
  const status = document.getElementById("sphereStatus");
  status.textContent = "SPHERE: Connected";
  status.classList.add("connected");
}

// Called from auth.js on Epic logout. The iframe stays loaded in the page even
// while hidden (that's why this works without the modal ever being opened) —
// we just tell it, via postMessage, to forget its own cached token.
export function disconnectSphere() {
  const frame = document.getElementById("sphereFrame");
  frame.contentWindow.postMessage({ type: "sphere-logout" }, SPHERE_ORIGIN);

  const status = document.getElementById("sphereStatus");
  status.textContent = "SPHERE: Not Connected";
  status.classList.remove("connected");
}

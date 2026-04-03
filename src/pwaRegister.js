export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        console.log("SW registered:", reg.scope);
      } catch (err) {
        console.log("SW registration failed:", err);
      }
    });
  }
}

export async function sendSWMessage(message) {
  if (!("serviceWorker" in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    if (reg.active) {
      reg.active.postMessage(message);
    }
  } catch {}
}

export function getNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  const result = await Notification.requestPermission();
  return result;
}

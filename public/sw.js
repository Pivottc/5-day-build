const CACHE_NAME = "5day-build-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

let lastReminderFiredDate = "";
let reminderSettings = null;
let reminderIntervalId = null;

self.addEventListener("message", (event) => {
  const data = event.data;

  if (data.type === "REST_TIMER_DONE") {
    self.registration.showNotification("Rest Over", {
      body: "Rest over. Time for your next set.",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "rest-timer",
      renotify: true,
      vibrate: [200, 100, 200],
      data: { action: "rest-done" }
    });
  }

  if (data.type === "SCHEDULE_REMINDERS") {
    reminderSettings = data.settings;
    startReminderCheck();
  }

  if (data.type === "CLEAR_REMINDERS") {
    stopReminderCheck();
    reminderSettings = null;
  }

  if (data.type === "REMINDER_FIRED") {
    lastReminderFiredDate = data.date;
  }
});

function stopReminderCheck() {
  if (reminderIntervalId) {
    clearInterval(reminderIntervalId);
    reminderIntervalId = null;
  }
}

function startReminderCheck() {
  stopReminderCheck();
  if (!reminderSettings || !reminderSettings.enabled || !reminderSettings.days || reminderSettings.days.length === 0) return;
  reminderIntervalId = setInterval(() => checkAndFireReminder(), 30000);
  checkAndFireReminder();
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const FOCUS_MAP = {
  1: "Push Day",
  2: "Pull Day",
  3: "Lower Body",
  4: "Press Day",
  5: "Fat Loss Circuit"
};

function checkAndFireReminder() {
  if (!reminderSettings || !reminderSettings.enabled) return;

  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  if (!reminderSettings.days.includes(currentDay)) return;

  const [targetHour, targetMinute] = (reminderSettings.time || "06:00").split(":").map(Number);

  if (currentHour === targetHour && currentMinute === targetMinute) {
    const todayKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    if (lastReminderFiredDate === todayKey) return;
    lastReminderFiredDate = todayKey;

    const dayName = DAY_NAMES[currentDay];
    const dayIndex = reminderSettings.days.indexOf(currentDay);
    const workoutNum = (dayIndex % 5) + 1;
    const focus = FOCUS_MAP[workoutNum] || "workout";

    self.registration.showNotification("Time to Train", {
      body: `Time to train. Your ${dayName} ${focus} workout is ready.`,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "workout-reminder",
      renotify: true,
      vibrate: [200, 100, 200, 100, 200],
      data: { action: "open-app" }
    });

    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ type: "REMINDER_FIRED", date: todayKey });
      });
    });
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow("/");
      }
    })
  );
});

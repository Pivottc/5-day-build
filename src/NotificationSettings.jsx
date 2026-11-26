import { useState, useEffect } from "react";
import { getNotificationPermission, requestNotificationPermission, sendSWMessage } from "./pwaRegister";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function loadReminderSettings() {
  try {
    const raw = localStorage.getItem("workout_reminders");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { enabled: false, days: [1, 3, 5], time: "06:00" };
}

function saveReminderSettings(settings) {
  localStorage.setItem("workout_reminders", JSON.stringify(settings));
  if (settings.enabled) {
    sendSWMessage({ type: "SCHEDULE_REMINDERS", settings });
  } else {
    sendSWMessage({ type: "CLEAR_REMINDERS" });
  }
}

export default function NotificationSettings({ color, onClose }) {
  const [settings, setSettings] = useState(loadReminderSettings);
  const [permission, setPermission] = useState(getNotificationPermission);
  const rgb = hexToRgb(color);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const toggleDay = (dayIndex) => {
    setSettings(prev => {
      const days = prev.days.includes(dayIndex)
        ? prev.days.filter(d => d !== dayIndex)
        : [...prev.days, dayIndex].sort();
      const next = { ...prev, days };
      saveReminderSettings(next);
      return next;
    });
  };

  const toggleEnabled = async () => {
    if (!settings.enabled && permission !== "granted") {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result !== "granted") return;
    }
    setSettings(prev => {
      const next = { ...prev, enabled: !prev.enabled };
      saveReminderSettings(next);
      return next;
    });
  };

  const updateTime = (time) => {
    setSettings(prev => {
      const next = { ...prev, time };
      saveReminderSettings(next);
      return next;
    });
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1500,
      background: "rgba(52,42,30,0.32)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, animation: "fadeIn 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 440,
        background: "linear-gradient(180deg, #FCFAF5 0%, #F6F1E7 100%)",
        borderRadius: 16, border: "1px solid rgba(120,96,60,0.12)",
        overflow: "hidden", animation: "slideUp 0.25s ease"
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(120,96,60,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color, textTransform: "uppercase", marginBottom: 4 }}>SETTINGS</div>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 600, color: "#2B251E" }}>Notifications</div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(120,96,60,0.12)", border: "1px solid rgba(43,37,30,0.13)", color: "#7A6F61",
              borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>×</button>
          </div>
        </div>

        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {permission === "unsupported" && (
            <div style={{
              background: "rgba(156,79,60,0.08)", border: "1px solid rgba(156,79,60,0.15)",
              borderRadius: 10, padding: "14px 16px",
              fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(43,37,30,0.65)", lineHeight: 1.5
            }}>
              Notifications are not supported in this browser.
            </div>
          )}

          {permission === "denied" && (
            <div style={{
              background: "rgba(156,79,60,0.08)", border: "1px solid rgba(156,79,60,0.15)",
              borderRadius: 10, padding: "14px 16px",
              fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(43,37,30,0.65)", lineHeight: 1.5
            }}>
              Notification permission was denied. Please enable notifications in your browser settings to use this feature.
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#2B251E", marginBottom: 3 }}>Workout Reminders</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(43,37,30,0.39)" }}>Get notified when it's time to train</div>
            </div>
            <button onClick={toggleEnabled} style={{
              width: 48, height: 28, borderRadius: 14, border: "none", cursor: "pointer",
              background: settings.enabled ? `rgba(${rgb},0.3)` : "rgba(120,96,60,0.16)",
              position: "relative", transition: "background 0.25s",
              padding: 0
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: settings.enabled ? color : "rgba(43,37,30,0.26)",
                position: "absolute", top: 3,
                left: settings.enabled ? 23 : 3,
                transition: "all 0.25s"
              }} />
            </button>
          </div>

          {settings.enabled && (
            <>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(43,37,30,0.325)", textTransform: "uppercase", marginBottom: 10 }}>TRAINING DAYS</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {DAY_LABELS.map((label, i) => {
                    const active = settings.days.includes(i);
                    return (
                      <button key={i} onClick={() => toggleDay(i)} style={{
                        flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer",
                        background: active ? `rgba(${rgb},0.12)` : "rgba(255,253,248,0.8)",
                        border: active ? `1px solid rgba(${rgb},0.3)` : "1px solid rgba(120,96,60,0.12)",
                        color: active ? color : "rgba(43,37,30,0.39)",
                        fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                        transition: "all 0.2s"
                      }}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(43,37,30,0.325)", textTransform: "uppercase", marginBottom: 10 }}>REMINDER TIME</div>
                <input
                  type="time"
                  value={settings.time}
                  onChange={(e) => updateTime(e.target.value)}
                  style={{
                    background: "rgba(255,253,248,0.8)", border: `1px solid rgba(${rgb},0.2)`,
                    borderRadius: 10, padding: "12px 16px", width: "100%",
                    color: "#2B251E", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
                    outline: "none", cursor: "pointer",
                    colorScheme: "light"
                  }}
                />
              </div>

              <div style={{
                background: "rgba(255,253,248,0.8)", border: "1px solid rgba(255,253,248,0.8)",
                borderRadius: 10, padding: "12px 16px"
              }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(43,37,30,0.39)", lineHeight: 1.5 }}>
                  You'll receive a reminder at <span style={{ color: "rgba(43,37,30,0.78)", fontWeight: 600 }}>{formatTime12(settings.time)}</span> on{" "}
                  <span style={{ color: "rgba(43,37,30,0.78)", fontWeight: 600 }}>
                    {settings.days.length === 0 ? "no days" : settings.days.map(d => DAY_LABELS[d]).join(", ")}
                  </span>.
                </div>
              </div>
            </>
          )}

          <div style={{ borderTop: "1px solid rgba(255,253,248,0.8)", paddingTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: "#2B251E", marginBottom: 3 }}>Rest Timer Alerts</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(43,37,30,0.39)" }}>Notifies when rest period ends (if app is in background)</div>
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                color: permission === "granted" ? "rgba(94,123,92,0.7)" : "rgba(43,37,30,0.26)",
                letterSpacing: "0.08em", textTransform: "uppercase"
              }}>
                {permission === "granted" ? "Active" : permission === "denied" ? "Blocked" : "Pending"}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "12px 24px 20px" }}>
          <button onClick={onClose} style={{
            width: "100%", padding: "14px", borderRadius: 10,
            background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.2)`,
            color, fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
            cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.04em"
          }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : "255,255,255";
}

function formatTime12(time24) {
  if (!time24) return "6:00 AM";
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

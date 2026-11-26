import { useState, useEffect } from "react";
import { getNotificationPermission, requestNotificationPermission } from "./pwaRegister";

export default function NotificationPrompt({ color }) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const alreadyAsked = localStorage.getItem("workout_notif_prompted");
    const perm = getNotificationPermission();
    if (!alreadyAsked && perm === "default") {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show || dismissed) return null;

  const hexToRgb = (hex) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : "255,255,255";
  };
  const rgb = hexToRgb(color);

  const handleAllow = async () => {
    localStorage.setItem("workout_notif_prompted", "true");
    await requestNotificationPermission();
    setDismissed(true);
  };

  const handleLater = () => {
    localStorage.setItem("workout_notif_prompted", "true");
    setDismissed(true);
  };

  return (
    <div style={{
      position: "fixed", bottom: 20, left: 16, right: 16, zIndex: 900,
      maxWidth: 420, margin: "0 auto",
      background: "linear-gradient(135deg, #1a1a1e 0%, #111113 100%)",
      border: `1px solid rgba(${rgb},0.2)`,
      borderRadius: 16, padding: "20px 22px",
      boxShadow: `0 8px 32px rgba(80,60,30,0.14), 0 0 20px rgba(${rgb},0.08)`,
      animation: "slideUp 0.4s ease"
    }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `rgba(${rgb},0.12)`, border: `1px solid rgba(${rgb},0.2)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0
        }}>
          🔔
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: "#2B251E", marginBottom: 4 }}>
            Stay on track
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(43,37,30,0.52)", lineHeight: 1.5 }}>
            Get rest timer alerts and workout reminders so you never miss a set or a session.
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={handleLater} style={{
          flex: 1, padding: "11px 16px", borderRadius: 10,
          background: "rgba(255,253,248,0.8)", border: "1px solid rgba(120,96,60,0.16)",
          color: "rgba(43,37,30,0.52)", fontFamily: "'Inter', sans-serif",
          fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
        }}>
          Maybe Later
        </button>
        <button onClick={handleAllow} style={{
          flex: 1, padding: "11px 16px", borderRadius: 10,
          background: `rgba(${rgb},0.15)`, border: `1px solid rgba(${rgb},0.3)`,
          color, fontFamily: "'Inter', sans-serif",
          fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
        }}>
          Enable Notifications
        </button>
      </div>
    </div>
  );
}

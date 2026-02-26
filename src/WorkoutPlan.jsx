import { useState, useEffect, useCallback } from "react";

const workoutData = [
  {
    day: 1, label: "DAY 01", title: "Chest + Triceps", focus: "Push Day",
    equipment: "Rogue Cage + Functional Trainer + Dumbbells", color: "#E84A2E",
    warmup: "5 min Peloton Tread easy walk/light jog",
    exercises: [
      { name: "Barbell Bench Press", equipment: "Rogue Cage", sets: 3, reps: "10", startWeight: "65 lbs (bar + 10s each side)", tip: "Control the descent — 2 seconds down, press up. Key for chest development.", muscles: "Chest, Front Delt, Triceps", videoId: "rT7DgCr-3pg" },
      { name: "Incline DB Press", equipment: "Dumbbells + Centr 2 Bench", sets: 3, reps: "12", startWeight: "20 lbs each hand", tip: "Upper chest targets the 'shelf' look and helps reduce chest fat appearance.", muscles: "Upper Chest, Shoulders", videoId: "8iPEnn-ltC8" },
      { name: "Cable Chest Fly (Low to High)", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "15 lbs per side", tip: "Squeeze at the top. This targets inner and lower chest — great for your goal.", muscles: "Inner Chest, Lower Chest", videoId: "pYcpY20QaE8" },
      { name: "Tricep Rope Pushdown", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "20 lbs per side", tip: "Keep elbows glued to sides. Spread the rope at the bottom.", muscles: "Triceps", videoId: "vB5OHsJ3EME" },
      { name: "DB Skull Crushers", equipment: "Dumbbells + Bench", sets: 3, reps: "10", startWeight: "15 lbs each hand", tip: "Lower slowly to forehead, press straight up.", muscles: "Triceps Long Head", videoId: "d_KZxkY_5cM" }
    ],
    notes: "Rest 60–90 sec between sets. Total time ~38 min."
  },
  {
    day: 2, label: "DAY 02", title: "Back + Biceps", focus: "Pull Day",
    equipment: "Rogue Cage + Functional Trainer + Dumbbells", color: "#2E7BE8",
    warmup: "5 min Peloton Tread moderate walk",
    exercises: [
      { name: "Barbell Bent-Over Row", equipment: "Rogue Cage", sets: 3, reps: "10", startWeight: "65 lbs", tip: "Hinge at hips, chest up, pull bar to belly button. Back is your biggest fat-burning muscle.", muscles: "Lats, Rhomboids, Rear Delts", videoId: "FWJR5Ve8bnQ" },
      { name: "Single-Arm DB Row", equipment: "Dumbbells + Bench", sets: 3, reps: "10 each side", startWeight: "25 lbs", tip: "Drive your elbow back and up. Full stretch at the bottom.", muscles: "Lats, Mid Back", videoId: "roCP6wCXPqo" },
      { name: "Cable Straight-Arm Pulldown", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "20 lbs per side", tip: "Arms straight, pull bar to thighs. Incredible lat isolation.", muscles: "Lats, Serratus", videoId: "pYcpY20QaE8" },
      { name: "Cable Seated Row", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "20 lbs per side", tip: "Tall posture, pull to navel, squeeze shoulder blades for 1 second.", muscles: "Mid Back, Biceps", videoId: "GZbfZ033f74" },
      { name: "DB Alternating Curl", equipment: "Dumbbells", sets: 3, reps: "10 each arm", startWeight: "20 lbs each hand", tip: "Supinate (twist) at the top. Slow negative.", muscles: "Biceps", videoId: "sAq_ocpRh_I" }
    ],
    notes: "Rest 60–90 sec between sets. Total time ~40 min."
  },
  {
    day: 3, label: "DAY 03", title: "Legs + Glutes", focus: "Lower Body",
    equipment: "Rogue Cage + Functional Trainer + Kettlebell", color: "#2ECC71",
    warmup: "5 min Peloton Tread incline walk",
    exercises: [
      { name: "Barbell Back Squat", equipment: "Rogue Cage", sets: 3, reps: "10", startWeight: "75 lbs (bar + 15s each side)", tip: "Depth to parallel. Biggest compound move — burns the most calories.", muscles: "Quads, Glutes, Hamstrings, Core", videoId: "ultWZbUMPL8" },
      { name: "Romanian Deadlift (RDL)", equipment: "Barbell", sets: 3, reps: "10", startWeight: "65 lbs", tip: "Hinge, not squat. Feel the hamstring stretch, drive hips forward to stand.", muscles: "Hamstrings, Glutes, Lower Back", videoId: "jEy_czb3RKA" },
      { name: "Walking DB Lunges", equipment: "Dumbbells", sets: 3, reps: "10 each leg", startWeight: "20 lbs each hand", tip: "Keep front knee over ankle. Great for quad definition.", muscles: "Quads, Glutes", videoId: "L8fvypPrzzs" },
      { name: "Kettlebell Swing", equipment: "Kettlebell", sets: 3, reps: "15", startWeight: "Start with lightest KB available", tip: "Hip hinge power, not arm lift. One of the best full-body fat-burners.", muscles: "Glutes, Hamstrings, Core, Shoulders", videoId: "sSESeQAir2M" },
      { name: "Cable Pull-Through", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "20 lbs per side", tip: "Face away from cable, hinge and drive hips forward. Glute burnout.", muscles: "Glutes, Hamstrings", videoId: "mr5gaRn8coo" }
    ],
    notes: "Rest 90 sec between sets. Legs need it. Total time ~42 min."
  },
  {
    day: 4, label: "DAY 04", title: "Shoulders + Core", focus: "Press & Stability",
    equipment: "Rogue Cage + Functional Trainer + Dumbbells", color: "#9B59B6",
    warmup: "5 min Peloton easy ride or walk",
    exercises: [
      { name: "Barbell Overhead Press", equipment: "Rogue Cage", sets: 3, reps: "10", startWeight: "45 lbs (just the bar to start)", tip: "Core tight, press straight up. Builds the boulder shoulder look.", muscles: "Front & Side Delts, Triceps, Core", videoId: "2yjwXTZQDDI" },
      { name: "DB Lateral Raise", equipment: "Dumbbells", sets: 3, reps: "12", startWeight: "10 lbs each hand", tip: "Slight bend in elbow, raise to shoulder height. Slow and controlled.", muscles: "Side Delts — creates width", videoId: "3VcKaXpzqRo" },
      { name: "Cable Face Pull", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "15", startWeight: "15 lbs per side", tip: "Pull rope to face, elbows high. Protects shoulders and builds rear delts.", muscles: "Rear Delts, Rotator Cuff", videoId: "rep-qVOkqgk" },
      { name: "Plank", equipment: "Bodyweight", sets: 3, reps: "30–45 sec hold", startWeight: "Bodyweight", tip: "Squeeze glutes and abs together. Don't let hips sag.", muscles: "Core, Obliques", videoId: "ASdvN_XEl_c" },
      { name: "Cable Woodchop (High to Low)", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12 each side", startWeight: "15 lbs per side", tip: "Rotational movement targets the obliques — directly attacks belly fat zones.", muscles: "Obliques, Transverse Abs, Core", videoId: "vqSvAzvnHMc" }
    ],
    notes: "Rest 60 sec between sets. Total time ~35 min."
  },
  {
    day: 5, label: "DAY 05", title: "Full Body + Cardio Burn", focus: "Fat Loss Finisher",
    equipment: "Peloton Tread + Functional Trainer + Dumbbells + Kettlebell", color: "#E8A02E",
    warmup: "None — first exercise is the warm-up",
    exercises: [
      { name: "Peloton Tread Intervals", equipment: "Peloton Tread", sets: 1, reps: "10 min", startWeight: "Walk 3 min → Jog 2 min → Walk 2 min → Jog 3 min", tip: "This is your metabolic primer. Gets heart rate up before lifting.", muscles: "Cardio, Legs, Core", videoId: "lzJNsD2yjKw" },
      { name: "DB Goblet Squat", equipment: "Dumbbell", sets: 3, reps: "12", startWeight: "25 lbs", tip: "Hold DB at chest, squat deep. Full body + posture reset.", muscles: "Quads, Glutes, Core", videoId: "MeIiIdhvXT4" },
      { name: "Cable Anti-Rotation Press", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "10 each side", startWeight: "10 lbs per side", tip: "Fight rotation. This destroys your obliques and deep core — belly flattener.", muscles: "Core, Obliques, Shoulder Stability", videoId: "rHGFuFBzH5Y" },
      { name: "Kettlebell Deadlift", equipment: "Kettlebell", sets: 3, reps: "12", startWeight: "Moderate KB", tip: "Hip hinge, flat back. Sets up your technique for heavier barbell work.", muscles: "Glutes, Hamstrings, Back", videoId: "tPNBHmFPuGU" },
      { name: "DB Renegade Row", equipment: "Dumbbells", sets: 3, reps: "8 each arm", startWeight: "15 lbs each hand", tip: "Plank position, row one DB. Best full-body integration move.", muscles: "Back, Core, Chest, Triceps", videoId: "hzFuGGM3mHM" }
    ],
    notes: "Minimal rest (45 sec). Circuit-style. Total time ~40 min."
  }
];

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function loadTracking() {
  try {
    const raw = localStorage.getItem("workout_tracking");
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.date !== getTodayKey()) return null;
    return data;
  } catch { return null; }
}

function saveTracking(data) {
  localStorage.setItem("workout_tracking", JSON.stringify(data));
}

function initTracking() {
  const existing = loadTracking();
  if (existing) return existing;
  const sets = {};
  workoutData.forEach((day) => {
    sets[day.day] = {};
    day.exercises.forEach((ex, ei) => {
      sets[day.day][ei] = Array(ex.sets).fill(false);
    });
  });
  const fresh = { date: getTodayKey(), sets };
  saveTracking(fresh);
  return fresh;
}

function loadWeights() {
  try {
    const raw = localStorage.getItem("workout_weights");
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

function saveWeights(data) {
  localStorage.setItem("workout_weights", JSON.stringify(data));
}

function getWeight(weights, dayNum, exIndex, fallback) {
  const key = `${dayNum}-${exIndex}`;
  return weights[key] !== undefined ? weights[key] : fallback;
}

function getDayProgress(tracking, dayNum) {
  const daySets = tracking.sets[dayNum];
  if (!daySets) return { done: 0, total: 0 };
  let done = 0, total = 0;
  Object.values(daySets).forEach(arr => {
    arr.forEach(v => { total++; if (v) done++; });
  });
  return { done, total };
}

function SetCircles({ count, completed, color, onToggle }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: count }).map((_, s) => (
        <button
          key={s}
          onClick={(e) => { e.stopPropagation(); onToggle(s); }}
          style={{
            width: 28, height: 28, borderRadius: "50%",
            border: `2px solid ${completed[s] ? color : "#333"}`,
            background: completed[s] ? `rgba(${hexToRgb(color)},0.2)` : "transparent",
            color: completed[s] ? color : "#555",
            fontFamily: "'Lato', sans-serif", fontSize: 11, fontWeight: 700,
            cursor: "pointer", transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          title={`Set ${s + 1}`}
        >
          {completed[s] ? "✓" : s + 1}
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ done, total, color }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius: 3, transition: "width 0.4s ease"
        }} />
      </div>
      <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, fontWeight: 700, color: pct === 100 ? color : "#666", minWidth: 36, textAlign: "right" }}>
        {pct}%
      </span>
    </div>
  );
}

function VideoModal({ exercise, color, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.93)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, backdropFilter: "blur(10px)",
      animation: "fadeIn 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 720, animation: "slideUp 0.25s ease" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: color, marginBottom: 4 }}>FORM GUIDE</div>
            <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 34, letterSpacing: "0.04em", color: "#f0ede6", lineHeight: 1 }}>{exercise.name}</div>
            <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: "#555", marginTop: 4, fontStyle: "italic" }}>{exercise.muscles}</div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid #333", color: "#888",
            borderRadius: 6, width: 36, height: 36, cursor: "pointer", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 16
          }}>×</button>
        </div>
        <div style={{
          position: "relative", paddingBottom: "56.25%", borderRadius: 10, overflow: "hidden",
          border: `1px solid rgba(${hexToRgb(color)},0.3)`,
          boxShadow: `0 0 60px rgba(${hexToRgb(color)},0.15)`
        }}>
          <iframe
            src={`https://www.youtube.com/embed/${exercise.videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={exercise.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          />
        </div>
        <div style={{
          marginTop: 14, padding: "12px 16px",
          background: `rgba(${hexToRgb(color)},0.07)`,
          border: `1px solid rgba(${hexToRgb(color)},0.18)`,
          borderRadius: 8, display: "flex", gap: 10, alignItems: "flex-start"
        }}>
          <span style={{ fontSize: 16, marginTop: 1 }}>💡</span>
          <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: "#aaa", lineHeight: 1.5, fontStyle: "italic" }}>{exercise.tip}</span>
        </div>
        <div style={{ textAlign: "center", marginTop: 10, fontFamily: "'Lato', sans-serif", fontSize: 11, color: "#333" }}>Click outside or press ESC to close</div>
      </div>
    </div>
  );
}

export default function WorkoutPlan() {
  const [activeDay, setActiveDay] = useState(0);
  const [expandedEx, setExpandedEx] = useState(null);
  const [videoEx, setVideoEx] = useState(null);
  const [tracking, setTracking] = useState(() => initTracking());
  const [weights, setWeights] = useState(() => loadWeights());
  const day = workoutData[activeDay];

  const updateWeight = useCallback((exerciseIndex, value) => {
    const key = `${day.day}-${exerciseIndex}`;
    setWeights(prev => {
      const next = { ...prev, [key]: value };
      saveWeights(next);
      return next;
    });
  }, [day.day]);

  const toggleSet = useCallback((exerciseIndex, setIndex) => {
    setTracking(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const arr = next.sets[day.day][exerciseIndex];
      arr[setIndex] = !arr[setIndex];
      saveTracking(next);
      return next;
    });
  }, [day.day]);

  const resetDay = useCallback(() => {
    setTracking(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const daySets = next.sets[day.day];
      Object.keys(daySets).forEach(ei => {
        daySets[ei] = daySets[ei].map(() => false);
      });
      saveTracking(next);
      return next;
    });
  }, [day.day]);

  const dayProgress = getDayProgress(tracking, day.day);
  const allComplete = dayProgress.total > 0 && dayProgress.done === dayProgress.total;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0ede6", padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Lato:wght@300;400;700&display=swap');
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .day-tab { cursor: pointer; transition: all 0.2s; }
        .day-tab:hover { background: rgba(255,255,255,0.05); }
        .ex-card { transition: all 0.25s; border-left: 3px solid transparent; }
        .ex-card:hover { background: rgba(255,255,255,0.04) !important; }
        .ex-card.open { border-left-color: var(--day-color); }
        .ex-card.done-card { opacity: 0.55; }
        .ex-card.done-card:hover { opacity: 0.75; }
        .pill { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-family: 'Lato', sans-serif; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); }
        .expand-detail { overflow: hidden; transition: max-height 0.3s ease; }
        .form-btn { background: rgba(255,255,255,0.04); border: 1px solid #2a2a2a; color: #555; font-family: 'Lato', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; padding: 7px 14px; border-radius: 4px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
        .form-btn:hover { border-color: var(--day-color) !important; color: var(--day-color) !important; background: rgba(255,255,255,0.04); }
        .reset-btn { background: transparent; border: 1px solid #2a2a2a; color: #555; font-family: 'Lato', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; padding: 6px 12px; border-radius: 4px; cursor: pointer; transition: all 0.2s; }
        .reset-btn:hover { border-color: #E84A2E; color: #E84A2E; }
        .weight-input { background: rgba(255,255,255,0.04); border: 1px solid #2a2a2a; border-radius: 6px; padding: 6px 10px; font-family: 'Lato', sans-serif; font-size: 14px; font-weight: 700; color: var(--day-color); width: 100%; outline: none; transition: border-color 0.2s; }
        .weight-input:focus { border-color: var(--day-color); background: rgba(255,255,255,0.06); }
        .weight-input::placeholder { color: #444; font-weight: 400; font-style: italic; }
      `}</style>

      <div style={{ background: "linear-gradient(135deg, #111 0%, #1a1a1a 100%)", borderBottom: "1px solid #222", padding: "28px 24px 0" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontFamily: "'Lato', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: "0.3em", color: "#888", marginBottom: 4 }}>YOUR PERSONALIZED</div>
          <h1 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 52, letterSpacing: "0.05em", lineHeight: 1, background: `linear-gradient(90deg, #f0ede6, ${day.color})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8, transition: "all 0.3s" }}>5-DAY BUILD PROGRAM</h1>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: "#666", marginBottom: 20, fontWeight: 300 }}>190 lbs · Returning Lifter · Goal: Muscle Mass + Chest & Belly Fat Loss · 30–45 min sessions</p>
          <div style={{ display: "flex", gap: 0 }}>
            {workoutData.map((d, i) => {
              const prog = getDayProgress(tracking, d.day);
              const tabComplete = prog.total > 0 && prog.done === prog.total;
              return (
                <button key={i} className="day-tab" onClick={() => { setActiveDay(i); setExpandedEx(null); }} style={{ flex: 1, background: activeDay === i ? "#1a1a1a" : "transparent", border: "none", borderBottom: activeDay === i ? `3px solid ${d.color}` : "3px solid transparent", padding: "10px 4px 12px", cursor: "pointer", color: activeDay === i ? d.color : "#555", position: "relative" }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, letterSpacing: "0.05em", lineHeight: 1 }}>
                    {tabComplete ? "✓" : `D${d.day}`}
                  </div>
                  <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>{d.focus.split(" ")[0]}</div>
                  {prog.done > 0 && !tabComplete && (
                    <div style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, borderRadius: "50%", background: d.color }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 24px" }} key={activeDay}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.25em", color: day.color, textTransform: "uppercase", marginBottom: 4 }}>{day.label} · {day.focus}</div>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 42, letterSpacing: "0.04em", lineHeight: 1, color: "#f0ede6" }}>{day.title}</h2>
            <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: "#555", marginTop: 6 }}>{day.equipment}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #222", borderRadius: 8, padding: "12px 16px", minWidth: 160 }}>
            <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: "#555", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Warm-Up</div>
            <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: "#888", lineHeight: 1.4 }}>{day.warmup}</div>
          </div>
        </div>

        <div style={{ marginBottom: 20, padding: "14px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid #1e1e1e", borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555" }}>
                {allComplete ? "WORKOUT COMPLETE" : "TODAY'S PROGRESS"}
              </span>
              {allComplete && <span style={{ fontSize: 14 }}>🎉</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, fontWeight: 700, color: day.color }}>{dayProgress.done}/{dayProgress.total} sets</span>
              {dayProgress.done > 0 && (
                <button className="reset-btn" onClick={resetDay}>RESET</button>
              )}
            </div>
          </div>
          <ProgressBar done={dayProgress.done} total={dayProgress.total} color={day.color} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {day.exercises.map((ex, i) => {
            const isOpen = expandedEx === i;
            const setsCompleted = tracking.sets[day.day][i] || [];
            const exDone = setsCompleted.every(Boolean);
            return (
              <div key={i} className={`ex-card ${isOpen ? "open" : ""} ${exDone ? "done-card" : ""}`} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid #1e1e1e", borderRadius: 10, overflow: "hidden", "--day-color": day.color }}>
                <div onClick={() => setExpandedEx(isOpen ? null : i)} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", cursor: "pointer" }}>
                  <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 28, color: exDone ? day.color : (isOpen ? day.color : "#333"), minWidth: 28, transition: "color 0.2s", lineHeight: 1 }}>
                    {exDone ? "✓" : String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, fontWeight: 700, color: exDone ? "#888" : "#f0ede6", marginBottom: 4, textDecoration: exDone ? "line-through" : "none", textDecorationColor: day.color }}>{ex.name}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className="pill">{ex.equipment}</span>
                      <span className="pill">{ex.muscles}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <SetCircles count={ex.sets} completed={setsCompleted} color={day.color} onToggle={(s) => toggleSet(i, s)} />
                    <div style={{ textAlign: "right", minWidth: 60 }}>
                      <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 22, color: day.color, lineHeight: 1 }}>{ex.sets} × {ex.reps}</div>
                      <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>SETS × REPS</div>
                    </div>
                  </div>
                  <div style={{ color: "#444", fontSize: 18, transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.25s", marginLeft: 4 }}>›</div>
                </div>

                <div className="expand-detail" style={{ maxHeight: isOpen ? 220 : 0 }}>
                  <div style={{ borderTop: "1px solid #1e1e1e", padding: "14px 18px 16px", display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 16, alignItems: "center" }}>
                    <div style={{ "--day-color": day.color }}>
                      <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: "#555", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Current Weight</div>
                      <input
                        className="weight-input"
                        type="text"
                        value={getWeight(weights, day.day, i, ex.startWeight)}
                        placeholder={ex.startWeight}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateWeight(i, e.target.value)}
                      />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, color: "#555", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Coaching Tip</div>
                      <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 12, color: "#aaa", lineHeight: 1.5, fontStyle: "italic" }}>{ex.tip}</div>
                    </div>
                    <button
                      className="form-btn"
                      style={{ "--day-color": day.color }}
                      onClick={(e) => { e.stopPropagation(); setVideoEx(ex); }}
                    >
                      <span style={{ fontSize: 12 }}>▶</span> WATCH FORM
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, padding: "14px 18px", background: `linear-gradient(135deg, rgba(${hexToRgb(day.color)},0.08) 0%, transparent 100%)`, border: `1px solid rgba(${hexToRgb(day.color)},0.2)`, borderRadius: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>⏱</span>
          <span style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: "#999" }}>{day.notes}</span>
        </div>

        <div style={{ marginTop: 32, borderTop: "1px solid #1a1a1a", paddingTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { icon: "📈", title: "Progression", body: "Add 5 lbs every 2 weeks if the last set feels easy. Never chase weight over form." },
            { icon: "🍽", title: "Protein Goal", body: "Aim for 150–175g protein/day. Critical while on GLP-1 to preserve and build muscle." },
            { icon: "😴", title: "Recovery", body: "7–8 hrs sleep. GLP-1 + lifting is a powerful combo — your body rebuilds overnight." }
          ].map((note, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #1e1e1e", borderRadius: 8, padding: "14px" }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{note.icon}</div>
              <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: day.color, marginBottom: 4 }}>{note.title}</div>
              <div style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: "#666", lineHeight: 1.5 }}>{note.body}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, fontFamily: "'Lato', sans-serif", fontSize: 11, color: "#333", textAlign: "center", paddingBottom: 20 }}>
          Tap set circles to track progress · Tap any exercise to reveal details · Hit <span style={{ color: "#555" }}>▶ WATCH FORM</span> to see technique video
        </div>
      </div>

      {videoEx && <VideoModal exercise={videoEx} color={day.color} onClose={() => setVideoEx(null)} />}
    </div>
  );
}

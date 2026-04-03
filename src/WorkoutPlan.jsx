import { useState, useEffect, useCallback, useRef } from "react";

const PHASE_LABELS = ["Starting Position", "Movement", "Finish Position"];

const workoutData = [
  {
    day: 1, label: "DAY 01", title: "Chest + Triceps", focus: "Push Day",
    equipment: "Rogue Cage + Functional Trainer + Dumbbells", color: "#E84A2E",
    warmup: "5 min Peloton Tread easy walk/light jog",
    exercises: [
      { name: "Barbell Bench Press", equipment: "Rogue Cage", sets: 3, reps: "10", startWeight: "65 lbs (bar + 10s each side)", tip: "Control the descent — 2 seconds down, press up. Key for chest development.", muscles: "Chest, Front Delt, Triceps", images: ["/exercises/barbell-bench-press-1.png", "/exercises/barbell-bench-press-2.png", "/exercises/barbell-bench-press-3.png"] },
      { name: "Incline DB Press", equipment: "Dumbbells + Centr 2 Bench", sets: 3, reps: "12", startWeight: "20 lbs each hand", tip: "Upper chest targets the 'shelf' look and helps reduce chest fat appearance.", muscles: "Upper Chest, Shoulders", images: ["/exercises/incline-db-press-1.png", "/exercises/incline-db-press-2.png", "/exercises/incline-db-press-3.png"] },
      { name: "Cable Chest Fly (Low to High)", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "15 lbs per side", tip: "Squeeze at the top. This targets inner and lower chest — great for your goal.", muscles: "Inner Chest, Lower Chest", images: ["/exercises/cable-chest-fly-1.png", "/exercises/cable-chest-fly-2.png", "/exercises/cable-chest-fly-3.png"] },
      { name: "Tricep Rope Pushdown", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "20 lbs per side", tip: "Keep elbows glued to sides. Spread the rope at the bottom.", muscles: "Triceps", images: ["/exercises/tricep-pushdown-1.png", "/exercises/tricep-pushdown-2.png", "/exercises/tricep-pushdown-3.png"] },
      { name: "DB Skull Crushers", equipment: "Dumbbells + Bench", sets: 3, reps: "10", startWeight: "15 lbs each hand", tip: "Lower slowly to forehead, press straight up.", muscles: "Triceps Long Head", images: ["/exercises/db-skull-crushers-1.png", "/exercises/db-skull-crushers-2.png", "/exercises/db-skull-crushers-3.png"] }
    ],
    notes: "Rest 60–90 sec between sets. Total time ~38 min."
  },
  {
    day: 2, label: "DAY 02", title: "Back + Biceps", focus: "Pull Day",
    equipment: "Rogue Cage + Functional Trainer + Dumbbells", color: "#2E7BE8",
    warmup: "5 min Peloton Tread moderate walk",
    exercises: [
      { name: "Barbell Bent-Over Row", equipment: "Rogue Cage", sets: 3, reps: "10", startWeight: "65 lbs", tip: "Hinge at hips, chest up, pull bar to belly button. Back is your biggest fat-burning muscle.", muscles: "Lats, Rhomboids, Rear Delts", images: ["/exercises/barbell-bent-row-1.png", "/exercises/barbell-bent-row-2.png", "/exercises/barbell-bent-row-3.png"] },
      { name: "Single-Arm DB Row", equipment: "Dumbbells + Bench", sets: 3, reps: "10 each side", startWeight: "25 lbs", tip: "Drive your elbow back and up. Full stretch at the bottom.", muscles: "Lats, Mid Back", images: ["/exercises/single-arm-db-row-1.png", "/exercises/single-arm-db-row-2.png", "/exercises/single-arm-db-row-3.png"] },
      { name: "Cable Straight-Arm Pulldown", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "20 lbs per side", tip: "Arms straight, pull bar to thighs. Incredible lat isolation.", muscles: "Lats, Serratus", images: ["/exercises/cable-pulldown-1.png", "/exercises/cable-pulldown-2.png", "/exercises/cable-pulldown-3.png"] },
      { name: "Cable Seated Row", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "20 lbs per side", tip: "Tall posture, pull to navel, squeeze shoulder blades for 1 second.", muscles: "Mid Back, Biceps", images: ["/exercises/cable-seated-row-1.png", "/exercises/cable-seated-row-2.png", "/exercises/cable-seated-row-3.png"] },
      { name: "DB Alternating Curl", equipment: "Dumbbells", sets: 3, reps: "10 each arm", startWeight: "20 lbs each hand", tip: "Supinate (twist) at the top. Slow negative.", muscles: "Biceps", images: ["/exercises/db-curl-1.png", "/exercises/db-curl-2.png", "/exercises/db-curl-3.png"] }
    ],
    notes: "Rest 60–90 sec between sets. Total time ~40 min."
  },
  {
    day: 3, label: "DAY 03", title: "Legs + Glutes", focus: "Lower Body",
    equipment: "Rogue Cage + Functional Trainer + Kettlebell", color: "#2ECC71",
    warmup: "5 min Peloton Tread incline walk",
    exercises: [
      { name: "Barbell Back Squat", equipment: "Rogue Cage", sets: 3, reps: "10", startWeight: "75 lbs (bar + 15s each side)", tip: "Depth to parallel. Biggest compound move — burns the most calories.", muscles: "Quads, Glutes, Hamstrings, Core", images: ["/exercises/barbell-squat-1.png", "/exercises/barbell-squat-2.png", "/exercises/barbell-squat-3.png"] },
      { name: "Romanian Deadlift (RDL)", equipment: "Barbell", sets: 3, reps: "10", startWeight: "65 lbs", tip: "Hinge, not squat. Feel the hamstring stretch, drive hips forward to stand.", muscles: "Hamstrings, Glutes, Lower Back", images: ["/exercises/romanian-deadlift-1.png", "/exercises/romanian-deadlift-2.png", "/exercises/romanian-deadlift-3.png"] },
      { name: "Walking DB Lunges", equipment: "Dumbbells", sets: 3, reps: "10 each leg", startWeight: "20 lbs each hand", tip: "Keep front knee over ankle. Great for quad definition.", muscles: "Quads, Glutes", images: ["/exercises/walking-lunges-1.png", "/exercises/walking-lunges-2.png", "/exercises/walking-lunges-3.png"] },
      { name: "Kettlebell Swing", equipment: "Kettlebell", sets: 3, reps: "15", startWeight: "Start with lightest KB available", tip: "Hip hinge power, not arm lift. One of the best full-body fat-burners.", muscles: "Glutes, Hamstrings, Core, Shoulders", images: ["/exercises/kettlebell-swing-1.png", "/exercises/kettlebell-swing-2.png", "/exercises/kettlebell-swing-3.png"] },
      { name: "Cable Pull-Through", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "20 lbs per side", tip: "Face away from cable, hinge and drive hips forward. Glute burnout.", muscles: "Glutes, Hamstrings", images: ["/exercises/cable-pull-through-1.png", "/exercises/cable-pull-through-2.png", "/exercises/cable-pull-through-3.png"] }
    ],
    notes: "Rest 90 sec between sets. Legs need it. Total time ~42 min."
  },
  {
    day: 4, label: "DAY 04", title: "Shoulders + Core", focus: "Press & Stability",
    equipment: "Rogue Cage + Functional Trainer + Dumbbells", color: "#9B59B6",
    warmup: "5 min Peloton easy ride or walk",
    exercises: [
      { name: "Barbell Overhead Press", equipment: "Rogue Cage", sets: 3, reps: "10", startWeight: "45 lbs (just the bar to start)", tip: "Core tight, press straight up. Builds the boulder shoulder look.", muscles: "Front & Side Delts, Triceps, Core", images: ["/exercises/overhead-press-1.png", "/exercises/overhead-press-2.png", "/exercises/overhead-press-3.png"] },
      { name: "DB Lateral Raise", equipment: "Dumbbells", sets: 3, reps: "12", startWeight: "10 lbs each hand", tip: "Slight bend in elbow, raise to shoulder height. Slow and controlled.", muscles: "Side Delts — creates width", images: ["/exercises/lateral-raise-1.png", "/exercises/lateral-raise-2.png", "/exercises/lateral-raise-3.png"] },
      { name: "Cable Face Pull", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "15", startWeight: "15 lbs per side", tip: "Pull rope to face, elbows high. Protects shoulders and builds rear delts.", muscles: "Rear Delts, Rotator Cuff", images: ["/exercises/face-pull-1.png", "/exercises/face-pull-2.png", "/exercises/face-pull-3.png"] },
      { name: "Plank", equipment: "Bodyweight", sets: 3, reps: "30–45 sec hold", startWeight: "Bodyweight", tip: "Squeeze glutes and abs together. Don't let hips sag.", muscles: "Core, Obliques", images: ["/exercises/plank-1.png", "/exercises/plank-2.png", "/exercises/plank-3.png"] },
      { name: "Cable Woodchop (High to Low)", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12 each side", startWeight: "15 lbs per side", tip: "Rotational movement targets the obliques — directly attacks belly fat zones.", muscles: "Obliques, Transverse Abs, Core", images: ["/exercises/cable-woodchop-1.png", "/exercises/cable-woodchop-2.png", "/exercises/cable-woodchop-3.png"] }
    ],
    notes: "Rest 60 sec between sets. Total time ~35 min."
  },
  {
    day: 5, label: "DAY 05", title: "Full Body + Cardio Burn", focus: "Fat Loss Finisher",
    equipment: "Peloton Tread + Functional Trainer + Dumbbells + Kettlebell", color: "#E8A02E",
    warmup: "None — first exercise is the warm-up",
    exercises: [
      { name: "Peloton Tread Intervals", equipment: "Peloton Tread", sets: 1, reps: "10 min", startWeight: "Walk 3 min → Jog 2 min → Walk 2 min → Jog 3 min", tip: "This is your metabolic primer. Gets heart rate up before lifting.", muscles: "Cardio, Legs, Core", images: ["/exercises/tread-intervals-1.png", "/exercises/tread-intervals-2.png", "/exercises/tread-intervals-3.png"] },
      { name: "DB Goblet Squat", equipment: "Dumbbell", sets: 3, reps: "12", startWeight: "25 lbs", tip: "Hold DB at chest, squat deep. Full body + posture reset.", muscles: "Quads, Glutes, Core", images: ["/exercises/goblet-squat-1.png", "/exercises/goblet-squat-2.png", "/exercises/goblet-squat-3.png"] },
      { name: "Cable Anti-Rotation Press", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "10 each side", startWeight: "10 lbs per side", tip: "Fight rotation. This destroys your obliques and deep core — belly flattener.", muscles: "Core, Obliques, Shoulder Stability", images: ["/exercises/anti-rotation-press-1.png", "/exercises/anti-rotation-press-2.png", "/exercises/anti-rotation-press-3.png"] },
      { name: "Kettlebell Deadlift", equipment: "Kettlebell", sets: 3, reps: "12", startWeight: "Moderate KB", tip: "Hip hinge, flat back. Sets up your technique for heavier barbell work.", muscles: "Glutes, Hamstrings, Back", images: ["/exercises/kettlebell-deadlift-1.png", "/exercises/kettlebell-deadlift-2.png", "/exercises/kettlebell-deadlift-3.png"] },
      { name: "DB Renegade Row", equipment: "Dumbbells", sets: 3, reps: "8 each arm", startWeight: "15 lbs each hand", tip: "Plank position, row one DB. Best full-body integration move.", muscles: "Back, Core, Chest, Triceps", images: ["/exercises/renegade-row-1.png", "/exercises/renegade-row-2.png", "/exercises/renegade-row-3.png"] }
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

function loadHistory() {
  try {
    const raw = localStorage.getItem("workout_history");
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

function saveHistory(history) {
  localStorage.setItem("workout_history", JSON.stringify(history));
}

function saveWorkoutToHistory(tracking, weights) {
  const history = loadHistory();
  const dateKey = tracking.date;
  const sessions = [];
  workoutData.forEach((dayData) => {
    const daySets = tracking.sets[dayData.day];
    if (!daySets) return;
    const completedCount = Object.values(daySets).reduce((sum, arr) => sum + arr.filter(Boolean).length, 0);
    if (completedCount === 0) return;
    const totalSets = Object.values(daySets).reduce((sum, arr) => sum + arr.length, 0);
    const vol = getDayVolume(dayData, tracking, weights);
    sessions.push({
      dayNum: dayData.day,
      dayTitle: dayData.title,
      focus: dayData.focus,
      color: dayData.color,
      completedSets: completedCount,
      totalSets,
      totalVolume: vol.totalVolume,
      exercises: vol.perExercise.filter(e => e.completedCount > 0)
    });
  });
  if (sessions.length > 0) {
    history[dateKey] = { date: dateKey, sessions };
  } else {
    delete history[dateKey];
  }
  saveHistory(history);
  return history;
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDayProgress(tracking, dayNum) {
  const daySets = tracking.sets[dayNum];
  if (!daySets) return { done: 0, total: 0 };
  let done = 0, total = 0;
  Object.values(daySets).forEach(arr => {
    arr.forEach(v => { total++; if (v) done++; });
  });
  return { done, total };
}

function parseNumericWeight(weightStr) {
  if (!weightStr) return 0;
  const match = String(weightStr).match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function parseNumericReps(repsStr) {
  if (!repsStr) return 0;
  const match = String(repsStr).match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : 0;
}

function getDayVolume(dayData, tracking, weights) {
  let totalVolume = 0;
  let perExercise = [];
  dayData.exercises.forEach((ex, ei) => {
    const setsCompleted = tracking.sets[dayData.day]?.[ei] || [];
    const completedCount = setsCompleted.filter(Boolean).length;
    const weightVal = parseNumericWeight(getWeight(weights, dayData.day, ei, ex.startWeight));
    const repsVal = parseNumericReps(ex.reps);
    const volume = weightVal * repsVal * completedCount;
    perExercise.push({ name: ex.name, volume, completedCount, totalSets: ex.sets, weight: weightVal, reps: repsVal });
    totalVolume += volume;
  });
  return { totalVolume, perExercise };
}

function SetCircles({ count, completed, color, onToggle }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: count }).map((_, s) => (
        <button
          key={s}
          onClick={(e) => { e.stopPropagation(); onToggle(s); }}
          style={{
            width: 26, height: 26, borderRadius: "50%",
            border: `1.5px solid ${completed[s] ? color : "rgba(255,255,255,0.12)"}`,
            background: completed[s] ? `rgba(${hexToRgb(color)},0.15)` : "transparent",
            color: completed[s] ? color : "rgba(255,255,255,0.25)",
            fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
            cursor: "pointer", transition: "all 0.25s ease",
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
      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          borderRadius: 2, transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
        }} />
      </div>
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: pct === 100 ? color : "rgba(255,255,255,0.25)", minWidth: 36, textAlign: "right" }}>
        {pct}%
      </span>
    </div>
  );
}

function FormGuideModal({ exercise, color, onClose }) {
  const [activeFrame, setActiveFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef(null);
  const images = exercise.images || [exercise.image];

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (isPlaying && images.length > 1) {
      timerRef.current = setInterval(() => {
        setActiveFrame(prev => (prev + 1) % images.length);
      }, 1500);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, images.length]);

  const goTo = (idx) => { setActiveFrame(idx); setIsPlaying(false); };

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
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: color, marginBottom: 6 }}>Form Guide</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", lineHeight: 1.1 }}>{exercise.name}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4, fontWeight: 400 }}>{exercise.muscles}</div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)",
            borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 16,
            transition: "all 0.2s"
          }}>×</button>
        </div>

        <div style={{
          borderRadius: 10, overflow: "hidden",
          border: `1px solid rgba(${hexToRgb(color)},0.2)`,
          boxShadow: `0 0 40px rgba(${hexToRgb(color)},0.1)`,
          position: "relative"
        }}>
          {images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`${exercise.name} - ${PHASE_LABELS[idx] || `Step ${idx + 1}`}`}
              style={{
                width: "100%", height: "auto", display: idx === activeFrame ? "block" : "none",
                transition: "opacity 0.3s ease"
              }}
            />
          ))}
          {images.length > 1 && (
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
              padding: "20px 16px 12px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: color, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {PHASE_LABELS[activeFrame] || `Step ${activeFrame + 1}`}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goTo(idx)}
                      style={{
                        width: idx === activeFrame ? 24 : 8, height: 8,
                        borderRadius: 4,
                        background: idx === activeFrame ? color : "rgba(255,255,255,0.3)",
                        border: "none", cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff", borderRadius: 4, width: 28, height: 28,
                    cursor: "pointer", fontSize: 12,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{
          marginTop: 14, padding: "12px 16px",
          background: `rgba(${hexToRgb(color)},0.07)`,
          border: `1px solid rgba(${hexToRgb(color)},0.18)`,
          borderRadius: 8, display: "flex", gap: 10, alignItems: "flex-start"
        }}>
          <span style={{ fontSize: 16, marginTop: 1 }}>💡</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#aaa", lineHeight: 1.5, fontStyle: "italic" }}>{exercise.tip}</span>
        </div>
        <div style={{ textAlign: "center", marginTop: 10, fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#333" }}>Click outside or press ESC to close</div>
      </div>
    </div>
  );
}

function HistoryDetailModal({ entry, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const dateObj = new Date(entry.date + "T12:00:00");
  const dateStr = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const grandTotal = entry.sessions.reduce((s, sess) => s + sess.totalVolume, 0);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.93)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, backdropFilter: "blur(10px)",
      animation: "fadeIn 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, maxHeight: "80vh", overflowY: "auto", animation: "slideUp 0.25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#888", marginBottom: 4 }}>WORKOUT HISTORY</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, letterSpacing: "0.04em", color: "#f0ede6", lineHeight: 1 }}>{dateStr}</div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid #333", color: "#888",
            borderRadius: 6, width: 36, height: 36, cursor: "pointer", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>×</button>
        </div>

        <div style={{
          padding: "14px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid #222",
          borderRadius: 10, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555" }}>TOTAL VOLUME</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, color: "#f0ede6", lineHeight: 1 }}>{grandTotal.toLocaleString()} lbs</span>
        </div>

        {entry.sessions.map((sess, si) => (
          <div key={si} style={{
            marginBottom: 12, padding: "16px 18px",
            background: `linear-gradient(135deg, rgba(${hexToRgb(sess.color)},0.08) 0%, rgba(255,255,255,0.02) 100%)`,
            border: `1px solid rgba(${hexToRgb(sess.color)},0.2)`,
            borderRadius: 10
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: sess.color, textTransform: "uppercase" }}>DAY {sess.dayNum} · {sess.focus}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, color: "#f0ede6", lineHeight: 1, marginTop: 2 }}>{sess.dayTitle}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, color: sess.color, lineHeight: 1 }}>{sess.totalVolume.toLocaleString()} lbs</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#555", marginTop: 2 }}>{sess.completedSets}/{sess.totalSets} sets</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sess.exercises.map((ex, ei) => (
                <div key={ei} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: ei === 0 ? 0 : 6, borderTop: ei === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#888" }}>{ex.name}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#444" }}>
                      {ex.weight} × {ex.reps} × {ex.completedCount}
                    </span>
                  </div>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: ex.completedCount === ex.totalSets ? sess.color : "#555" }}>
                    {ex.volume.toLocaleString()} lbs
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ textAlign: "center", marginTop: 10, fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#333" }}>Click outside or press ESC to close</div>
      </div>
    </div>
  );
}

function CalendarView({ history, onSelectDate }) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const days = getMonthDays(viewYear, viewMonth);
  const todayKey = getTodayKey();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const monthWorkouts = Object.entries(history).filter(([key]) => {
    return key.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`);
  });
  const monthVolume = monthWorkouts.reduce((sum, [, entry]) =>
    sum + entry.sessions.reduce((s, sess) => s + sess.totalVolume, 0), 0
  );
  const monthSessions = monthWorkouts.length;

  const allVolumes = Object.values(history).map(entry =>
    entry.sessions.reduce((s, sess) => s + sess.totalVolume, 0)
  );
  const streak = (() => {
    let count = 0;
    const d = new Date();
    while (true) {
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      if (history[key]) { count++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return count;
  })();

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", color: "#888", textTransform: "uppercase", marginBottom: 4 }}>WORKOUT HISTORY</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 42, letterSpacing: "0.04em", color: "#f0ede6", lineHeight: 1 }}>HISTORY</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #222", borderRadius: 10, padding: "16px" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>THIS MONTH</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, color: "#2ECC71", lineHeight: 1 }}>{monthSessions}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#666", marginTop: 2 }}>workouts</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #222", borderRadius: 10, padding: "16px" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>MONTH VOLUME</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, color: "#2E7BE8", lineHeight: 1 }}>{monthVolume.toLocaleString()}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#666", marginTop: 2 }}>lbs lifted</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #222", borderRadius: 10, padding: "16px" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>STREAK</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, color: "#E8A02E", lineHeight: 1 }}>{streak}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#666", marginTop: 2 }}>{streak === 1 ? "day" : "days"}</div>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid #1e1e1e", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button className="cal-nav" onClick={prevMonth} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #2a2a2a", color: "#888", borderRadius: 6, width: 36, height: 36, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, letterSpacing: "0.06em", color: "#f0ede6" }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </div>
          <button className="cal-nav" onClick={nextMonth} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #2a2a2a", color: "#888", borderRadius: 6, width: 36, height: 36, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => (
            <div key={d} style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#444", textAlign: "center", padding: "6px 0" }}>{d}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {days.map((d, i) => {
            if (d === null) return <div key={`empty-${i}`} />;
            const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const entry = history[dateKey];
            const isToday = dateKey === todayKey;
            const hasWorkout = !!entry;
            const dayColors = entry ? entry.sessions.map(s => s.color) : [];

            return (
              <button
                className="cal-day"
                key={dateKey}
                onClick={() => hasWorkout && onSelectDate(entry)}
                style={{
                  background: isToday ? "rgba(255,255,255,0.06)" : hasWorkout ? "rgba(255,255,255,0.03)" : "transparent",
                  border: isToday ? "1px solid #444" : "1px solid transparent",
                  borderRadius: 8,
                  padding: "8px 4px",
                  cursor: hasWorkout ? "pointer" : "default",
                  textAlign: "center",
                  transition: "all 0.2s",
                  minHeight: 56
                }}
                title={hasWorkout ? `${entry.sessions.map(s => s.dayTitle).join(", ")} — ${entry.sessions.reduce((s, sess) => s + sess.totalVolume, 0).toLocaleString()} lbs` : ""}
              >
                <div style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: isToday ? 700 : 400,
                  color: isToday ? "#f0ede6" : hasWorkout ? "#ccc" : "#444",
                  marginBottom: 4
                }}>
                  {d}
                </div>
                {hasWorkout && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 3 }}>
                    {dayColors.map((c, ci) => (
                      <div key={ci} style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {Object.keys(history).length > 0 && (() => {
        const sortedDates = Object.keys(history).sort().reverse().slice(0, 7);
        return (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", marginBottom: 12 }}>RECENT SESSIONS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sortedDates.map(dateKey => {
                const entry = history[dateKey];
                const dateObj = new Date(dateKey + "T12:00:00");
                const dateLabel = dateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                const totalVol = entry.sessions.reduce((s, sess) => s + sess.totalVolume, 0);
                return (
                  <button
                    className="history-row"
                    key={dateKey}
                    onClick={() => onSelectDate(entry)}
                    style={{
                      background: "rgba(255,255,255,0.025)", border: "1px solid #1e1e1e", borderRadius: 10,
                      padding: "14px 18px", cursor: "pointer", textAlign: "left",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ display: "flex", gap: 3 }}>
                        {entry.sessions.map((s, si) => (
                          <div key={si} style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                        ))}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: "#f0ede6" }}>{dateLabel}</div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#555", marginTop: 2 }}>
                          {entry.sessions.map(s => s.dayTitle).join(" + ")}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, color: entry.sessions[0].color, lineHeight: 1 }}>{totalVol.toLocaleString()} lbs</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#444", marginTop: 2 }}>
                        {entry.sessions.reduce((s, sess) => s + sess.completedSets, 0)} sets
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function WorkoutPlan() {
  const [activeDay, setActiveDay] = useState(0);
  const [expandedEx, setExpandedEx] = useState(null);
  const [formGuideEx, setFormGuideEx] = useState(null);
  const [tracking, setTracking] = useState(() => initTracking());
  const [weights, setWeights] = useState(() => loadWeights());
  const [view, setView] = useState("workout");
  const [history, setHistory] = useState(() => loadHistory());
  const [historyDetail, setHistoryDetail] = useState(null);
  const day = workoutData[activeDay];

  const updateWeight = useCallback((exerciseIndex, value) => {
    const key = `${day.day}-${exerciseIndex}`;
    setWeights(prev => {
      const next = { ...prev, [key]: value };
      saveWeights(next);
      setTracking(currentTracking => {
        const updatedHistory = saveWorkoutToHistory(currentTracking, next);
        setHistory(updatedHistory);
        return currentTracking;
      });
      return next;
    });
  }, [day.day]);

  const toggleSet = useCallback((exerciseIndex, setIndex) => {
    setTracking(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const arr = next.sets[day.day][exerciseIndex];
      arr[setIndex] = !arr[setIndex];
      saveTracking(next);
      const updatedHistory = saveWorkoutToHistory(next, weights);
      setHistory(updatedHistory);
      return next;
    });
  }, [day.day, weights]);

  const resetDay = useCallback(() => {
    setTracking(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const daySets = next.sets[day.day];
      Object.keys(daySets).forEach(ei => {
        daySets[ei] = daySets[ei].map(() => false);
      });
      saveTracking(next);
      const updatedHistory = saveWorkoutToHistory(next, weights);
      setHistory(updatedHistory);
      return next;
    });
  }, [day.day, weights]);

  const dayProgress = getDayProgress(tracking, day.day);
  const allComplete = dayProgress.total > 0 && dayProgress.done === dayProgress.total;
  const volume = getDayVolume(day, tracking, weights);

  return (
    <div style={{ minHeight: "100vh", background: "#08080a", color: "#f0ede6", padding: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #08080a; }
        .day-tab { cursor: pointer; transition: all 0.25s ease; border: none; }
        .day-tab:hover { background: rgba(255,255,255,0.04) !important; }
        .ex-card { transition: all 0.3s ease; border-left: 3px solid transparent; backdrop-filter: blur(8px); }
        .ex-card:hover { background: rgba(255,255,255,0.04) !important; transform: translateX(2px); }
        .ex-card.open { border-left-color: var(--day-color); }
        .ex-card.done-card { opacity: 0.5; }
        .ex-card.done-card:hover { opacity: 0.7; }
        .pill { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 10px; font-family: 'Inter', sans-serif; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.45); border: 1px solid rgba(255,255,255,0.06); }
        .expand-detail { overflow: hidden; transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
        .form-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.25s; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
        .form-btn:hover { border-color: var(--day-color) !important; color: var(--day-color) !important; background: rgba(255,255,255,0.05); }
        .reset-btn { background: transparent; border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.3); font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 14px; border-radius: 8px; cursor: pointer; transition: all 0.25s; }
        .reset-btn:hover { border-color: #E84A2E; color: #E84A2E; }
        .weight-input { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 8px 12px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: var(--day-color); width: 100%; outline: none; transition: all 0.25s; }
        .weight-input:focus { border-color: var(--day-color); background: rgba(255,255,255,0.06); box-shadow: 0 0 0 3px rgba(var(--day-color-rgb), 0.1); }
        .weight-input::placeholder { color: rgba(255,255,255,0.2); font-weight: 400; }
        .cal-day:hover { background: rgba(255,255,255,0.06) !important; }
        .cal-nav:hover { background: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.15) !important; }
        .history-row:hover { background: rgba(255,255,255,0.04) !important; border-color: rgba(255,255,255,0.1) !important; }
        .view-toggle:hover { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.15) !important; color: #ccc !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      <div style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "32px 24px 0" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", marginBottom: 8, textTransform: "uppercase" }}>Your Program</div>
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#fff", marginBottom: 6 }}>5-Day Build</h1>
            </div>
            <button
              className="view-toggle"
              onClick={() => setView(view === "workout" ? "calendar" : "workout")}
              style={{
                background: view === "calendar" ? `rgba(${hexToRgb("#2ECC71")},0.1)` : "rgba(255,255,255,0.04)",
                border: view === "calendar" ? "1px solid rgba(46,204,113,0.25)" : "1px solid rgba(255,255,255,0.08)",
                color: view === "calendar" ? "#2ECC71" : "rgba(255,255,255,0.5)",
                fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                letterSpacing: "0.05em", textTransform: "uppercase",
                padding: "10px 18px", borderRadius: 10, cursor: "pointer",
                transition: "all 0.25s", whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 6
              }}
            >
              {view === "calendar" ? "< Workout" : "History"}
            </button>
          </div>
          {view === "workout" && (
          <div style={{ display: "flex", gap: 4 }}>
            {workoutData.map((d, i) => {
              const prog = getDayProgress(tracking, d.day);
              const tabComplete = prog.total > 0 && prog.done === prog.total;
              const isActive = activeDay === i;
              return (
                <button key={i} className="day-tab" onClick={() => { setActiveDay(i); setExpandedEx(null); }} style={{
                  flex: 1, background: isActive ? `rgba(${hexToRgb(d.color)},0.08)` : "transparent",
                  borderBottom: isActive ? `2px solid ${d.color}` : "2px solid transparent",
                  borderRadius: isActive ? "8px 8px 0 0" : "8px 8px 0 0",
                  padding: "12px 4px 14px", cursor: "pointer",
                  color: isActive ? d.color : "rgba(255,255,255,0.3)",
                  position: "relative"
                }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, lineHeight: 1 }}>
                    {tabComplete ? "✓" : `D${d.day}`}
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4, opacity: isActive ? 1 : 0.7 }}>{d.focus.split(" ")[0]}</div>
                  {prog.done > 0 && !tabComplete && (
                    <div style={{ position: "absolute", top: 6, right: 6, width: 5, height: 5, borderRadius: "50%", background: d.color }} />
                  )}
                </button>
              );
            })}
          </div>
          )}
        </div>
      </div>

      {view === "calendar" && (
        <CalendarView history={history} onSelectDate={(entry) => setHistoryDetail(entry)} />
      )}

      {view === "workout" && (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 40px" }} key={activeDay}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", color: day.color, textTransform: "uppercase", marginBottom: 6, opacity: 0.9 }}>{day.label} · {day.focus}</div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#fff" }}>{day.title}</h2>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 6, fontWeight: 400 }}>{day.equipment}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 16px", minWidth: 140, backdropFilter: "blur(8px)" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontWeight: 500 }}>Walk/Jog</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.4, fontWeight: 400 }}>10 minutes</div>
          </div>
        </div>

        <div style={{ marginBottom: 20, padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: allComplete ? day.color : "rgba(255,255,255,0.3)" }}>
                {allComplete ? "Complete" : "Progress"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: day.color }}>{dayProgress.done}/{dayProgress.total}</span>
              {dayProgress.done > 0 && (
                <button className="reset-btn" onClick={resetDay}>Reset</button>
              )}
            </div>
          </div>
          <ProgressBar done={dayProgress.done} total={dayProgress.total} color={day.color} />
        </div>

        {dayProgress.done > 0 && (
          <div style={{ marginBottom: 20, padding: "16px 20px", background: `rgba(${hexToRgb(day.color)},0.04)`, border: `1px solid rgba(${hexToRgb(day.color)},0.1)`, borderRadius: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Volume</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, color: day.color, lineHeight: 1, letterSpacing: "-0.02em" }}>{volume.totalVolume.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.7 }}>lbs</span></span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {volume.perExercise.map((ve, vi) => (
                ve.completedCount > 0 && (
                  <div key={vi} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>{ve.name}</span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
                        {ve.weight} × {ve.reps} × {ve.completedCount}
                      </span>
                    </div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: ve.completedCount === ve.totalSets ? day.color : "rgba(255,255,255,0.35)" }}>{ve.volume.toLocaleString()}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {day.exercises.map((ex, i) => {
            const isOpen = expandedEx === i;
            const setsCompleted = tracking.sets[day.day][i] || [];
            const exDone = setsCompleted.every(Boolean);
            return (
              <div key={i} className={`ex-card ${isOpen ? "open" : ""} ${exDone ? "done-card" : ""}`} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden", "--day-color": day.color }}>
                <div onClick={() => setExpandedEx(isOpen ? null : i)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", cursor: "pointer" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700, color: exDone ? day.color : (isOpen ? day.color : "rgba(255,255,255,0.12)"), minWidth: 28, transition: "color 0.25s", lineHeight: 1, textAlign: "center" }}>
                    {exDone ? "✓" : String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: exDone ? "rgba(255,255,255,0.4)" : "#fff", marginBottom: 5, textDecoration: exDone ? "line-through" : "none", textDecorationColor: `rgba(${hexToRgb(day.color)},0.5)` }}>{ex.name}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      <span className="pill">{ex.equipment}</span>
                      <span className="pill">{ex.muscles}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <SetCircles count={ex.sets} completed={setsCompleted} color={day.color} onToggle={(s) => toggleSet(i, s)} />
                    <div style={{ textAlign: "right", minWidth: 54 }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, color: day.color, lineHeight: 1, letterSpacing: "-0.01em" }}>{ex.sets}×{ex.reps}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2, fontWeight: 500 }}>sets × reps</div>
                    </div>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 16, transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", marginLeft: 2 }}>›</div>
                </div>

                <div className="expand-detail" style={{ maxHeight: isOpen ? 220 : 0 }}>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "14px 18px 16px", display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 16, alignItems: "center" }}>
                    <div style={{ "--day-color": day.color }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontWeight: 500 }}>Weight</div>
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
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontWeight: 500 }}>Tip</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, fontWeight: 400 }}>{ex.tip}</div>
                    </div>
                    <button
                      className="form-btn"
                      style={{ "--day-color": day.color }}
                      onClick={(e) => { e.stopPropagation(); setFormGuideEx(ex); }}
                    >
                      Form Guide
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
      )}

      {formGuideEx && <FormGuideModal exercise={formGuideEx} color={day.color} onClose={() => setFormGuideEx(null)} />}
      {historyDetail && <HistoryDetailModal entry={historyDetail} onClose={() => setHistoryDetail(null)} />}
    </div>
  );
}

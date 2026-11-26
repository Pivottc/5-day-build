import { useState, useMemo, useEffect } from "react";

const MEASUREMENT_KEYS = [
  { key: "neck", label: "Neck" },
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hips", label: "Hips" },
  { key: "leftArm", label: "Left Arm" },
  { key: "rightArm", label: "Right Arm" },
  { key: "leftThigh", label: "Left Thigh" },
  { key: "rightThigh", label: "Right Thigh" },
];

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : "255,255,255";
}

function loadBodyEntries() {
  try {
    const raw = localStorage.getItem("workout_body_metrics");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveBodyEntries(entries) {
  localStorage.setItem("workout_body_metrics", JSON.stringify(entries));
}

function loadUnit() {
  try {
    const raw = localStorage.getItem("workout_body_unit");
    return raw || "imperial";
  } catch { return "imperial"; }
}

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function formatDate(dateStr) {
  const [y,m,d] = dateStr.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[m-1]} ${d}`;
}

function formatDateFull(dateStr) {
  const [y,m,d] = dateStr.split("-").map(Number);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[m-1]} ${d}, ${y}`;
}

const ACCENT = "#9C4F3C";
const ACCENT_RGB = hexToRgb(ACCENT);

function WeightChart({ entries, rangeDays }) {
  const filtered = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - rangeDays);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return entries.filter(e => e.date >= cutoffStr && e.weight).sort((a,b) => a.date.localeCompare(b.date));
  }, [entries, rangeDays]);

  if (filtered.length < 2) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(43,37,30,0.26)" }}>
        Log at least 2 weigh-ins to see your chart
      </div>
    );
  }

  const weights = filtered.map(e => e.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;
  const padding = range * 0.1;

  const chartW = 100;
  const chartH = 40;

  const points = filtered.map((e, i) => {
    const x = (i / (filtered.length - 1)) * chartW;
    const y = chartH - ((e.weight - (minW - padding)) / (range + padding * 2)) * chartH;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,${chartH} ${points} ${chartW},${chartH}`;

  const first = weights[0];
  const last = weights[weights.length - 1];
  const delta = last - first;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 32, fontWeight: 600, color: "#2B251E", lineHeight: 1 }}>{last.toFixed(1)}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(43,37,30,0.39)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Current</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, lineHeight: 1,
            color: delta < 0 ? "#5E7B5C" : delta > 0 ? ACCENT : "rgba(43,37,30,0.52)"
          }}>
            {delta > 0 ? "+" : ""}{delta.toFixed(1)}
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(43,37,30,0.39)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {rangeDays}d change
          </div>
        </div>
      </div>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", height: 140 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.2" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#weightGrad)" />
        <polyline points={points} fill="none" stroke={ACCENT} strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
        {filtered.map((e, i) => {
          const x = (i / (filtered.length - 1)) * chartW;
          const y = chartH - ((e.weight - (minW - padding)) / (range + padding * 2)) * chartH;
          return <circle key={i} cx={x} cy={y} r="0.8" fill={ACCENT} />;
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "rgba(43,37,30,0.26)" }}>{formatDate(filtered[0].date)}</span>
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "rgba(43,37,30,0.26)" }}>{formatDate(filtered[filtered.length-1].date)}</span>
      </div>
    </div>
  );
}

function MeasurementDeltas({ entries, unit }) {
  const suffix = unit === "imperial" ? "in" : "cm";
  const firstEntry = entries.find(e => {
    return MEASUREMENT_KEYS.some(k => e.measurements && e.measurements[k.key]);
  });
  const lastEntry = [...entries].reverse().find(e => {
    return MEASUREMENT_KEYS.some(k => e.measurements && e.measurements[k.key]);
  });

  if (!firstEntry || !lastEntry || firstEntry.date === lastEntry.date) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(43,37,30,0.26)" }}>
        Log measurements on 2+ dates to see changes
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {MEASUREMENT_KEYS.map(({ key, label }) => {
        const firstVal = firstEntry.measurements?.[key];
        const lastVal = lastEntry.measurements?.[key];
        if (!firstVal || !lastVal) return (
          <div key={key} style={{
            background: "rgba(255,253,248,0.8)", border: "1px solid rgba(255,253,248,0.8)",
            borderRadius: 10, padding: "12px 14px"
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(43,37,30,0.65)", marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(43,37,30,0.195)" }}>No data</div>
          </div>
        );
        const delta = lastVal - firstVal;
        return (
          <div key={key} style={{
            background: "rgba(255,253,248,0.8)", border: "1px solid rgba(255,253,248,0.8)",
            borderRadius: 10, padding: "12px 14px"
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(43,37,30,0.65)", marginBottom: 4 }}>{label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, color: "#2B251E" }}>{lastVal}</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(43,37,30,0.325)" }}>{suffix}</span>
              {delta !== 0 && (
                <span style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                  color: delta < 0 ? "#5E7B5C" : ACCENT,
                  marginLeft: "auto"
                }}>
                  {delta > 0 ? "+" : ""}{delta.toFixed(1)}
                </span>
              )}
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "rgba(43,37,30,0.195)", marginTop: 4 }}>
              since {formatDate(firstEntry.date)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LogSheet({ unit, existingEntry, onSave, onClose }) {
  const suffix = unit === "imperial" ? "lbs" : "kg";
  const msuffix = unit === "imperial" ? "in" : "cm";
  const [weight, setWeight] = useState(existingEntry?.weight?.toString() || "");
  const [bodyFat, setBodyFat] = useState(existingEntry?.bodyFat?.toString() || "");
  const [measurements, setMeasurements] = useState(existingEntry?.measurements || {});

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const updateM = (key, val) => {
    setMeasurements(prev => ({ ...prev, [key]: val ? parseFloat(val) : undefined }));
  };

  const handleSave = () => {
    const entry = {
      date: getTodayKey(),
      timestamp: Date.now(),
      weight: weight ? parseFloat(weight) : undefined,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      measurements: Object.fromEntries(Object.entries(measurements).filter(([,v]) => v !== undefined && v !== "")),
      unit,
    };
    onSave(entry);
  };

  const inputStyle = {
    background: "rgba(255,253,248,0.8)", border: "1px solid rgba(120,96,60,0.16)",
    borderRadius: 10, padding: "10px 14px", width: "100%",
    fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600,
    color: "#2B251E", outline: "none", transition: "all 0.2s"
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1500,
      background: "rgba(52,42,30,0.32)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      animation: "fadeIn 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 480,
        background: "linear-gradient(180deg, #FCFAF5 0%, #F6F1E7 100%)",
        borderRadius: "20px 20px 0 0", border: "1px solid rgba(120,96,60,0.12)",
        borderBottom: "none", maxHeight: "85vh", overflowY: "auto",
        animation: "drawerSlideUp 0.3s ease"
      }}>
        <div style={{ padding: "16px 24px 12px", borderBottom: "1px solid rgba(120,96,60,0.12)", position: "sticky", top: 0, background: "#FCFAF5", zIndex: 2 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(43,37,30,0.195)", margin: "0 auto 14px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: 4 }}>LOG ENTRY</div>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 600, color: "#2B251E" }}>Today's Metrics</div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(120,96,60,0.12)", border: "1px solid rgba(43,37,30,0.13)", color: "#7A6F61",
              borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>×</button>
          </div>
        </div>

        <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(43,37,30,0.325)", textTransform: "uppercase", marginBottom: 8 }}>Body Weight ({suffix})</div>
              <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="190.0" style={inputStyle} />
            </div>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(43,37,30,0.325)", textTransform: "uppercase", marginBottom: 8 }}>Body Fat % (optional)</div>
              <input type="number" step="0.1" value={bodyFat} onChange={e => setBodyFat(e.target.value)} placeholder="18.0" style={inputStyle} />
            </div>
          </div>

          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(43,37,30,0.325)", textTransform: "uppercase", marginBottom: 10 }}>MEASUREMENTS ({msuffix})</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {MEASUREMENT_KEYS.map(({ key, label }) => (
                <div key={key}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(43,37,30,0.39)", marginBottom: 4, fontWeight: 500 }}>{label}</div>
                  <input
                    type="number" step="0.1"
                    value={measurements[key] || ""}
                    onChange={e => updateM(key, e.target.value)}
                    placeholder="—"
                    style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }}
                  />
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleSave} style={{
            width: "100%", padding: "16px", borderRadius: 12,
            background: `linear-gradient(135deg, ${ACCENT}, rgba(${ACCENT_RGB},0.7))`,
            border: "none", color: "#FFFDF8", fontFamily: "'Inter', sans-serif",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            boxShadow: `0 4px 20px rgba(${ACCENT_RGB},0.3)`,
            marginTop: 4
          }}>
            Save Entry
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BodyMetrics() {
  const [entries, setEntries] = useState(loadBodyEntries);
  const [unit, setUnit] = useState(loadUnit);
  const [showLog, setShowLog] = useState(false);
  const [chartRange, setChartRange] = useState(90);

  const sortedEntries = useMemo(() => [...entries].sort((a,b) => a.date.localeCompare(b.date)), [entries]);

  const toggleUnit = () => {
    const next = unit === "imperial" ? "metric" : "imperial";
    setUnit(next);
    localStorage.setItem("workout_body_unit", next);
  };

  const handleSave = (entry) => {
    setEntries(prev => {
      const existing = prev.findIndex(e => e.date === entry.date);
      let next;
      if (existing >= 0) {
        next = [...prev];
        next[existing] = { ...next[existing], ...entry, timestamp: Date.now() };
      } else {
        next = [...prev, entry];
      }
      saveBodyEntries(next);
      return next;
    });
    setShowLog(false);
  };

  const todayEntry = entries.find(e => e.date === getTodayKey());
  const latestWeight = sortedEntries.filter(e => e.weight).slice(-1)[0];
  const suffix = unit === "imperial" ? "lbs" : "kg";

  const recentEntries = useMemo(() => [...entries].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5), [entries]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: ACCENT, textTransform: "uppercase", marginBottom: 6 }}>BODY METRICS</div>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 600, color: "#2B251E" }}>Track Your Progress</div>
        </div>
        <button onClick={toggleUnit} style={{
          background: "rgba(255,253,248,0.8)", border: "1px solid rgba(120,96,60,0.16)",
          borderRadius: 8, padding: "8px 14px", cursor: "pointer",
          fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
          color: "rgba(43,37,30,0.52)", letterSpacing: "0.06em", textTransform: "uppercase",
          transition: "all 0.2s"
        }}>
          {unit === "imperial" ? "lbs / in" : "kg / cm"}
        </button>
      </div>

      <div style={{
        background: "rgba(255,253,248,0.8)", border: "1px solid rgba(120,96,60,0.12)",
        borderRadius: 16, padding: "20px 22px", marginBottom: 16
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(43,37,30,0.52)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Body Weight ({suffix})</div>
          <div style={{ display: "flex", gap: 4 }}>
            {[30, 90, 180].map(d => (
              <button key={d} onClick={() => setChartRange(d)} style={{
                background: chartRange === d ? `rgba(${ACCENT_RGB},0.12)` : "rgba(255,253,248,0.8)",
                border: chartRange === d ? `1px solid rgba(${ACCENT_RGB},0.25)` : "1px solid rgba(120,96,60,0.12)",
                color: chartRange === d ? ACCENT : "rgba(43,37,30,0.39)",
                fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                padding: "4px 10px", borderRadius: 6, cursor: "pointer", transition: "all 0.2s"
              }}>
                {d}d
              </button>
            ))}
          </div>
        </div>
        <WeightChart entries={sortedEntries} rangeDays={chartRange} />
      </div>

      <div style={{
        background: "rgba(255,253,248,0.8)", border: "1px solid rgba(120,96,60,0.12)",
        borderRadius: 16, padding: "20px 22px", marginBottom: 16
      }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(43,37,30,0.52)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
          Measurements
        </div>
        <MeasurementDeltas entries={sortedEntries} unit={unit} />
      </div>

      {recentEntries.length > 0 && (
        <div style={{
          background: "rgba(255,253,248,0.8)", border: "1px solid rgba(120,96,60,0.12)",
          borderRadius: 16, padding: "20px 22px"
        }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(43,37,30,0.52)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            Recent Entries
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {recentEntries.map((e, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", background: "rgba(255,253,248,0.8)",
                border: "1px solid rgba(255,253,248,0.8)", borderRadius: 10
              }}>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#2B251E" }}>{formatDateFull(e.date)}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(43,37,30,0.325)", marginTop: 2 }}>
                    {[
                      e.weight && `${e.weight} ${suffix}`,
                      e.bodyFat && `${e.bodyFat}% BF`,
                      e.measurements && Object.keys(e.measurements).length > 0 && `${Object.keys(e.measurements).length} measurements`
                    ].filter(Boolean).join(" · ") || "Empty entry"}
                  </div>
                </div>
                {e.date === getTodayKey() && (
                  <span style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 600,
                    background: `rgba(${ACCENT_RGB},0.1)`, color: ACCENT,
                    padding: "3px 8px", borderRadius: 4, border: `1px solid rgba(${ACCENT_RGB},0.2)`,
                    letterSpacing: "0.06em", textTransform: "uppercase"
                  }}>Today</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={() => setShowLog(true)} style={{
        position: "fixed", bottom: "calc(var(--nav-h, 64px) + env(safe-area-inset-bottom) + 16px)", right: 20, zIndex: 100,
        background: `linear-gradient(135deg, ${ACCENT}, rgba(${ACCENT_RGB},0.8))`,
        border: "none", borderRadius: 16, padding: "14px 22px",
        color: "#FFFDF8", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700,
        cursor: "pointer", boxShadow: `0 6px 24px rgba(${ACCENT_RGB},0.35)`,
        display: "flex", alignItems: "center", gap: 8,
        transition: "all 0.2s"
      }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Log Today
      </button>

      {showLog && (
        <LogSheet
          unit={unit}
          existingEntry={todayEntry}
          onSave={handleSave}
          onClose={() => setShowLog(false)}
        />
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { sendSWMessage, getNotificationPermission } from "./pwaRegister";
import NotificationPrompt from "./NotificationPrompt";
import NotificationSettings from "./NotificationSettings";
import BodyMetrics from "./BodyMetrics";

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

const SWAP_ALTERNATIVES = {
  "Barbell Bench Press": [
    { name: "Floor Press", equipment: "Rogue Cage", sets: 3, reps: "10", startWeight: "55 lbs", tip: "Lie on the floor — limits range of motion, great for lockout strength and triceps.", muscles: "Chest, Triceps" },
    { name: "Close-Grip Bench Press", equipment: "Rogue Cage", sets: 3, reps: "10", startWeight: "55 lbs", tip: "Narrow grip shifts focus to triceps while still hitting chest.", muscles: "Chest, Triceps" },
    { name: "DB Flat Press", equipment: "Dumbbells + Bench", sets: 3, reps: "10", startWeight: "25 lbs each hand", tip: "Greater range of motion than barbell. Better chest stretch at bottom.", muscles: "Chest, Front Delt, Triceps" },
  ],
  "Incline DB Press": [
    { name: "Incline Cable Fly", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "12 lbs per side", tip: "Set bench at 30°, fly with cables for constant tension on upper chest.", muscles: "Upper Chest, Shoulders" },
    { name: "DB Arnold Press", equipment: "Dumbbells", sets: 3, reps: "12", startWeight: "15 lbs each hand", tip: "Rotate palms during press — hits front delts and upper chest together.", muscles: "Upper Chest, Shoulders" },
    { name: "Landmine Press", equipment: "Rogue Cage", sets: 3, reps: "12", startWeight: "Bar only + 10 lbs", tip: "Angled pressing targets upper chest with less shoulder stress.", muscles: "Upper Chest, Front Delt" },
  ],
  "Cable Chest Fly (Low to High)": [
    { name: "Cable Chest Fly (High to Low)", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "15 lbs per side", tip: "Reverse the angle — emphasizes upper inner chest.", muscles: "Upper Chest, Inner Chest" },
    { name: "Cable Crossover", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "12 lbs per side", tip: "Mid-height cables, cross hands at bottom for peak chest contraction.", muscles: "Chest, Inner Chest" },
    { name: "Pec Deck Machine Fly", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "15 lbs per side", tip: "Seated fly with cables — controlled squeeze for chest isolation.", muscles: "Inner Chest, Chest" },
  ],
  "Tricep Rope Pushdown": [
    { name: "Cable Overhead Tricep Extension", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "15 lbs per side", tip: "Face away, extend overhead — targets the long head.", muscles: "Triceps Long Head" },
    { name: "Straight Bar Pushdown", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "20 lbs per side", tip: "Bar attachment instead of rope. More lateral head focus.", muscles: "Triceps" },
    { name: "Single-Arm Cable Pushdown", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12 each arm", startWeight: "10 lbs per side", tip: "Isolate each arm. Fix imbalances and improve mind-muscle connection.", muscles: "Triceps" },
  ],
  "DB Skull Crushers": [
    { name: "DB Kickbacks", equipment: "Dumbbells", sets: 3, reps: "12", startWeight: "10 lbs each hand", tip: "Hinge forward, extend arm straight back. Squeeze at the top.", muscles: "Triceps" },
    { name: "Close-Grip DB Press", equipment: "Dumbbells + Bench", sets: 3, reps: "10", startWeight: "20 lbs each hand", tip: "Press with palms facing each other, elbows close to body.", muscles: "Triceps, Chest" },
    { name: "Diamond Push-Up", equipment: "Bodyweight", sets: 3, reps: "12", startWeight: "Bodyweight", tip: "Hands together forming a diamond. Excellent tricep finisher.", muscles: "Triceps, Chest" },
  ],
  "Barbell Bent-Over Row": [
    { name: "Pendlay Row", equipment: "Rogue Cage", sets: 3, reps: "10", startWeight: "65 lbs", tip: "Dead stop on floor each rep. Explosive pulling power.", muscles: "Lats, Rhomboids, Rear Delts" },
    { name: "T-Bar Row (Landmine)", equipment: "Rogue Cage", sets: 3, reps: "10", startWeight: "Bar + 25 lbs", tip: "Straddle the bar, row with both hands. Thick back builder.", muscles: "Mid Back, Lats" },
    { name: "Chest-Supported DB Row", equipment: "Dumbbells + Bench", sets: 3, reps: "10", startWeight: "20 lbs each hand", tip: "Incline bench, row both arms. Removes lower back from the equation.", muscles: "Lats, Mid Back, Rear Delts" },
  ],
  "Single-Arm DB Row": [
    { name: "Meadows Row (Landmine)", equipment: "Rogue Cage", sets: 3, reps: "10 each side", startWeight: "Bar only", tip: "Stagger stance, single-arm landmine row for thick lats.", muscles: "Lats, Mid Back" },
    { name: "DB Prone Row", equipment: "Dumbbells + Bench", sets: 3, reps: "10", startWeight: "20 lbs each hand", tip: "Lie chest-down on incline bench, row both arms simultaneously.", muscles: "Mid Back, Lats" },
    { name: "Cable Single-Arm Row", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "10 each side", startWeight: "20 lbs per side", tip: "Cable provides constant tension. Great lat stretch.", muscles: "Lats, Mid Back" },
  ],
  "Cable Straight-Arm Pulldown": [
    { name: "Cable Pullover", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "15 lbs per side", tip: "Lie on bench under cable, pull from overhead to hips.", muscles: "Lats, Serratus" },
    { name: "Cable Reverse Fly", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "10 lbs per side", tip: "Cross cables, pull apart. Rear delt and upper back burner.", muscles: "Rear Delts, Lats" },
    { name: "Straight-Arm Cable Row", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "15 lbs per side", tip: "Low cable, arms extended, pull toward hips. Lat focused.", muscles: "Lats, Lower Back" },
  ],
  "Cable Seated Row": [
    { name: "Cable Wide-Grip Row", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "18 lbs per side", tip: "Wide grip targets upper back and rear delts more.", muscles: "Mid Back, Rear Delts" },
    { name: "Cable Face Pull to Row", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "12 lbs per side", tip: "Hybrid move — pull high then row. Hits entire upper back.", muscles: "Mid Back, Rear Delts, Biceps" },
    { name: "Resistance Band Row", equipment: "Bodyweight", sets: 3, reps: "15", startWeight: "Medium band", tip: "Anchor band, row to chest. Great warm-up or burnout.", muscles: "Mid Back, Biceps" },
  ],
  "DB Alternating Curl": [
    { name: "DB Hammer Curl", equipment: "Dumbbells", sets: 3, reps: "10 each arm", startWeight: "20 lbs each hand", tip: "Neutral grip — builds brachialis for arm thickness.", muscles: "Biceps, Brachialis" },
    { name: "DB Concentration Curl", equipment: "Dumbbells", sets: 3, reps: "10 each arm", startWeight: "15 lbs", tip: "Seated, elbow braced on thigh. Peak contraction focus.", muscles: "Biceps" },
    { name: "Cable Curl", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "15 lbs per side", tip: "Constant tension from cable. Great for bicep pump.", muscles: "Biceps" },
  ],
  "Barbell Back Squat": [
    { name: "Barbell Front Squat", equipment: "Rogue Cage", sets: 3, reps: "10", startWeight: "55 lbs", tip: "Bar on front delts — more quad dominant, keeps you upright.", muscles: "Quads, Core, Glutes" },
    { name: "Box Squat", equipment: "Rogue Cage", sets: 3, reps: "10", startWeight: "65 lbs", tip: "Squat to a box or bench. Teaches depth and builds confidence.", muscles: "Quads, Glutes, Hamstrings" },
    { name: "DB Goblet Squat", equipment: "Dumbbells", sets: 3, reps: "12", startWeight: "30 lbs", tip: "Hold dumbbell at chest. Perfect for learning squat mechanics.", muscles: "Quads, Glutes, Core" },
  ],
  "Romanian Deadlift (RDL)": [
    { name: "DB Romanian Deadlift", equipment: "Dumbbells", sets: 3, reps: "10", startWeight: "25 lbs each hand", tip: "Same hip hinge pattern. Dumbbells allow more natural arm path.", muscles: "Hamstrings, Glutes, Lower Back" },
    { name: "Single-Leg RDL", equipment: "Dumbbells", sets: 3, reps: "8 each leg", startWeight: "15 lbs", tip: "Balance + hamstring stretch. Fixes left/right imbalances.", muscles: "Hamstrings, Glutes" },
    { name: "Cable Pull-Through", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "20 lbs per side", tip: "Same hip hinge, cable keeps tension at the bottom.", muscles: "Glutes, Hamstrings" },
  ],
  "Walking DB Lunges": [
    { name: "Reverse DB Lunges", equipment: "Dumbbells", sets: 3, reps: "10 each leg", startWeight: "20 lbs each hand", tip: "Step backward — easier on knees, same quad/glute activation.", muscles: "Quads, Glutes" },
    { name: "Bulgarian Split Squat", equipment: "Dumbbells", sets: 3, reps: "10 each leg", startWeight: "15 lbs each hand", tip: "Rear foot elevated on bench. Intense single-leg quad builder.", muscles: "Quads, Glutes" },
    { name: "Step-Ups", equipment: "Dumbbells", sets: 3, reps: "10 each leg", startWeight: "15 lbs each hand", tip: "Step onto bench. Mimics real-world movement.", muscles: "Quads, Glutes, Core" },
  ],
  "Kettlebell Swing": [
    { name: "KB Sumo Deadlift", equipment: "Kettlebell", sets: 3, reps: "15", startWeight: "Moderate KB", tip: "Wide stance deadlift. Targets glutes and inner thighs.", muscles: "Glutes, Hamstrings, Core" },
    { name: "KB Goblet Squat", equipment: "Kettlebell", sets: 3, reps: "15", startWeight: "Moderate KB", tip: "Hold KB at chest, deep squat. Full body compound move.", muscles: "Quads, Glutes, Core" },
    { name: "DB Thruster", equipment: "Dumbbells", sets: 3, reps: "12", startWeight: "15 lbs each hand", tip: "Squat to overhead press in one motion. Cardio + strength.", muscles: "Quads, Shoulders, Core" },
  ],
  "Cable Pull-Through": [
    { name: "Cable Hip Abduction", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12 each leg", startWeight: "10 lbs per side", tip: "Ankle strap, lateral leg raise. Glute med activation.", muscles: "Glutes" },
    { name: "Cable Kickback", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12 each leg", startWeight: "10 lbs per side", tip: "Ankle strap, kick straight back. Glute isolation.", muscles: "Glutes, Hamstrings" },
    { name: "Cable Romanian Deadlift", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "20 lbs per side", tip: "Hip hinge with cable for constant tension on the posterior chain.", muscles: "Hamstrings, Glutes" },
  ],
  "Barbell Overhead Press": [
    { name: "DB Shoulder Press", equipment: "Dumbbells", sets: 3, reps: "10", startWeight: "20 lbs each hand", tip: "Seated or standing — greater range of motion than barbell.", muscles: "Front Delt, Side Delts, Triceps" },
    { name: "Push Press", equipment: "Rogue Cage", sets: 3, reps: "10", startWeight: "55 lbs", tip: "Small leg drive to start the press. Move more weight overhead.", muscles: "Shoulders, Triceps, Core" },
    { name: "Landmine Press", equipment: "Rogue Cage", sets: 3, reps: "10 each arm", startWeight: "Bar only", tip: "Angled press is shoulder-friendly. Great for beginners.", muscles: "Shoulders, Core" },
  ],
  "DB Lateral Raise": [
    { name: "Cable Lateral Raise", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "8 lbs per side", tip: "Constant cable tension through entire range. Superior for hypertrophy.", muscles: "Side Delts" },
    { name: "DB Front Raise", equipment: "Dumbbells", sets: 3, reps: "12", startWeight: "10 lbs each hand", tip: "Alternating front raises target front delts for shoulder width.", muscles: "Front Delt" },
    { name: "DB Y-Raise", equipment: "Dumbbells", sets: 3, reps: "12", startWeight: "8 lbs each hand", tip: "Raise at 45° angle — hits front and side delts together.", muscles: "Side Delts, Front Delt" },
  ],
  "Cable Face Pull": [
    { name: "Cable External Rotation", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "15", startWeight: "8 lbs per side", tip: "Elbow at side, rotate out. Prehab king for rotator cuff.", muscles: "Rotator Cuff, Rear Delts" },
    { name: "Band Pull-Apart", equipment: "Bodyweight", sets: 3, reps: "15", startWeight: "Light band", tip: "Hold band at arms length, pull apart. Posture corrector.", muscles: "Rear Delts, Rhomboids" },
    { name: "Cable Reverse Fly", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12", startWeight: "10 lbs per side", tip: "Cross cables at face height, pull apart. Rear delt isolation.", muscles: "Rear Delts, Rotator Cuff" },
  ],
  "Plank": [
    { name: "Dead Bug", equipment: "Bodyweight", sets: 3, reps: "10 each side", startWeight: "Bodyweight", tip: "On back, extend opposite arm/leg. Deep core activator.", muscles: "Core, Obliques" },
    { name: "Side Plank", equipment: "Bodyweight", sets: 3, reps: "30 sec each side", startWeight: "Bodyweight", tip: "Stack feet, hold. Oblique and lateral core strength.", muscles: "Obliques, Core" },
    { name: "Bird Dog", equipment: "Bodyweight", sets: 3, reps: "10 each side", startWeight: "Bodyweight", tip: "Hands and knees, extend opposite arm/leg. Spine stability.", muscles: "Core, Lower Back" },
  ],
  "Cable Woodchop (High to Low)": [
    { name: "Cable Woodchop (Low to High)", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "12 each side", startWeight: "15 lbs per side", tip: "Reverse angle targets lower abs and obliques differently.", muscles: "Obliques, Core" },
    { name: "Cable Pallof Press", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "10 each side", startWeight: "12 lbs per side", tip: "Anti-rotation — press cable away from chest, resist the twist.", muscles: "Core, Obliques" },
    { name: "Russian Twist", equipment: "Bodyweight", sets: 3, reps: "15 each side", startWeight: "Bodyweight", tip: "Seated, lean back, rotate. Add weight when ready.", muscles: "Obliques, Core" },
  ],
  "Peloton Tread Intervals": [
    { name: "Jump Rope Intervals", equipment: "Bodyweight", sets: 1, reps: "10 min", startWeight: "Bodyweight", tip: "30 sec on, 30 sec off. Incredible calorie burner.", muscles: "Cardio, Calves, Core" },
    { name: "Rowing Machine Intervals", equipment: "Bodyweight", sets: 1, reps: "10 min", startWeight: "Bodyweight", tip: "500m hard, 500m easy, repeat. Full body cardio.", muscles: "Cardio, Back, Legs" },
    { name: "Stair Climber", equipment: "Bodyweight", sets: 1, reps: "10 min", startWeight: "Bodyweight", tip: "Steady climb — excellent glute and cardio work.", muscles: "Cardio, Glutes, Quads" },
  ],
  "DB Goblet Squat": [
    { name: "DB Sumo Squat", equipment: "Dumbbell", sets: 3, reps: "12", startWeight: "25 lbs", tip: "Wide stance, toes out. Inner thigh and glute emphasis.", muscles: "Quads, Glutes, Adductors" },
    { name: "DB Front Squat", equipment: "Dumbbells", sets: 3, reps: "12", startWeight: "20 lbs each hand", tip: "DBs on shoulders. Keeps you upright, more quad work.", muscles: "Quads, Core" },
    { name: "Bodyweight Squat Pulses", equipment: "Bodyweight", sets: 3, reps: "20", startWeight: "Bodyweight", tip: "Stay in the bottom half, pulse. Quad burnout finisher.", muscles: "Quads, Glutes" },
  ],
  "Cable Anti-Rotation Press": [
    { name: "Cable Pallof Hold", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "20 sec each side", startWeight: "10 lbs per side", tip: "Static hold — press out and hold. Pure anti-rotation.", muscles: "Core, Obliques" },
    { name: "Cable Chop", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "10 each side", startWeight: "12 lbs per side", tip: "Diagonal chop from high to low. Dynamic core rotation.", muscles: "Core, Obliques" },
    { name: "Cable Lift", equipment: "Centr 2 Functional Trainer", sets: 3, reps: "10 each side", startWeight: "10 lbs per side", tip: "Low to high diagonal — reverse of chop. Full oblique range.", muscles: "Obliques, Core" },
  ],
  "Kettlebell Deadlift": [
    { name: "KB Single-Leg Deadlift", equipment: "Kettlebell", sets: 3, reps: "10 each leg", startWeight: "Moderate KB", tip: "Balance challenge + hamstring focus. Build stability.", muscles: "Glutes, Hamstrings" },
    { name: "DB Deadlift", equipment: "Dumbbells", sets: 3, reps: "12", startWeight: "25 lbs each hand", tip: "Same pattern, dumbbells give more grip options.", muscles: "Glutes, Hamstrings, Back" },
    { name: "KB Sumo Deadlift", equipment: "Kettlebell", sets: 3, reps: "12", startWeight: "Moderate KB", tip: "Wide stance, KB between feet. Inner thigh + glute combo.", muscles: "Glutes, Hamstrings, Adductors" },
  ],
  "DB Renegade Row": [
    { name: "DB Push-Up to Row", equipment: "Dumbbells", sets: 3, reps: "8 each arm", startWeight: "15 lbs each hand", tip: "Do a push-up between rows for extra chest work.", muscles: "Back, Chest, Core" },
    { name: "DB Plank Row", equipment: "Dumbbells", sets: 3, reps: "10 each arm", startWeight: "12 lbs each hand", tip: "Wider stance for stability, focus on the row only.", muscles: "Back, Core" },
    { name: "Bear Crawl", equipment: "Bodyweight", sets: 3, reps: "30 sec", startWeight: "Bodyweight", tip: "On all fours, knees off ground, move forward. Full body.", muscles: "Core, Shoulders, Back" },
  ],
};

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function CompletionOverlay({ dayData, volume, duration, color, onSave, onDismiss }) {
  const [phase, setPhase] = useState(0);
  const rgb = hexToRgb(color);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 800);
    const t3 = setTimeout(() => setPhase(3), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const exerciseCount = dayData.exercises.length;
  const totalSets = dayData.exercises.reduce((s, ex) => s + ex.sets, 0);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", padding: 32,
      animation: "fadeIn 0.4s ease"
    }}>
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none"
      }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            width: 4 + Math.random() * 6,
            height: 4 + Math.random() * 6,
            borderRadius: "50%",
            background: color,
            opacity: 0,
            animation: phase >= 1 ? `confettiFade 2s ease ${i * 0.08}s forwards` : "none"
          }} />
        ))}
      </div>

      <div style={{
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? "scale(1)" : "scale(0.3)",
        transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        marginBottom: 8
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: `rgba(${rgb},0.12)`,
          border: `2px solid rgba(${rgb},0.3)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: `0 0 40px rgba(${rgb},0.2)`
        }}>
          <span style={{ fontSize: 36 }}>&#10003;</span>
        </div>
      </div>

      <div style={{
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.5s ease 0.2s",
        textAlign: "center", marginBottom: 6
      }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color, textTransform: "uppercase", marginBottom: 8 }}>WORKOUT COMPLETE</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, color: "#f0ede6", lineHeight: 1.2 }}>
          Day {dayData.day} — {dayData.focus}
        </div>
      </div>

      <div style={{
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.5s ease",
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
        width: "100%", maxWidth: 420, margin: "28px 0 32px"
      }}>
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14, padding: "18px 14px", textAlign: "center"
        }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 8 }}>VOLUME</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{volume.toLocaleString()}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>lbs lifted</div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14, padding: "18px 14px", textAlign: "center"
        }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 8 }}>DURATION</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 700, color: "#f0ede6", lineHeight: 1 }}>{formatDuration(duration)}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>total time</div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14, padding: "18px 14px", textAlign: "center"
        }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 8 }}>SETS</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 700, color: "#f0ede6", lineHeight: 1 }}>{totalSets}/{totalSets}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{exerciseCount} exercises</div>
        </div>
      </div>

      <div style={{
        opacity: phase >= 3 ? 1 : 0,
        transform: phase >= 3 ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.5s ease",
        display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 320
      }}>
        <button onClick={onSave} style={{
          width: "100%", padding: "16px 24px", borderRadius: 12,
          background: `linear-gradient(135deg, ${color}, rgba(${rgb},0.7))`,
          border: "none", color: "#fff", fontFamily: "'Inter', sans-serif",
          fontSize: 15, fontWeight: 700, letterSpacing: "0.04em",
          cursor: "pointer", transition: "all 0.2s",
          boxShadow: `0 4px 20px rgba(${rgb},0.3)`
        }}>
          Save Workout
        </button>
        <button onClick={onDismiss} style={{
          width: "100%", padding: "12px 24px", borderRadius: 12,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif",
          fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
        }}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

function SwapModal({ exercise, alternatives, color, onSwap, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const rgb = hexToRgb(color);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, animation: "fadeIn 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 480,
        background: "linear-gradient(180deg, #141416 0%, #0c0c0e 100%)",
        borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden", animation: "slideUp 0.25s ease"
      }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: color, textTransform: "uppercase", marginBottom: 4 }}>SWAP EXERCISE</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, color: "#f0ede6" }}>Replace {exercise.name}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>Same muscle group · Same equipment</div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#888",
              borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>×</button>
          </div>
        </div>

        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {alternatives.map((alt, i) => (
            <button key={i} onClick={() => onSwap(alt)} style={{
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 12, padding: "16px 18px", cursor: "pointer",
              textAlign: "left", transition: "all 0.2s", display: "block", width: "100%"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `rgba(${rgb},0.06)`; e.currentTarget.style.borderColor = `rgba(${rgb},0.2)`; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: "#f0ede6", marginBottom: 4 }}>{alt.name}</div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 600, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", padding: "2px 8px", borderRadius: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>{alt.equipment}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 600, background: `rgba(${rgb},0.08)`, color: color, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>{alt.muscles}</span>
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{alt.tip}</div>
                </div>
                <div style={{ textAlign: "right", marginLeft: 12, flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700, color: color }}>{alt.sets}×{alt.reps}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>{alt.startWeight}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ padding: "12px 24px 20px", textAlign: "center" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.15)" }}>Tap an alternative to swap · Click outside to cancel</div>
        </div>
      </div>
    </div>
  );
}

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
  if (existing) {
    if (!existing.warmup) {
      existing.warmup = {};
      workoutData.forEach((day) => { existing.warmup[day.day] = false; });
      saveTracking(existing);
    }
    return existing;
  }
  const sets = {};
  const warmup = {};
  workoutData.forEach((day) => {
    sets[day.day] = {};
    warmup[day.day] = false;
    day.exercises.forEach((ex, ei) => {
      sets[day.day][ei] = Array(ex.sets).fill(false);
    });
  });
  const fresh = { date: getTodayKey(), sets, warmup };
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

function loadPRs() {
  try {
    const raw = localStorage.getItem("workout_prs");
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

function savePRs(data) {
  localStorage.setItem("workout_prs", JSON.stringify(data));
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
    const completedCount = Object.values(daySets).reduce((sum, arr) => sum + arr.filter(v => isSetDone(v)).length, 0);
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

function isSetDone(v) {
  if (!v) return false;
  if (v === true) return true;
  return typeof v === "object" && v.weight !== undefined;
}

function getDayProgress(tracking, dayNum) {
  const daySets = tracking.sets[dayNum];
  if (!daySets) return { done: 0, total: 0 };
  let done = 0, total = 0;
  Object.values(daySets).forEach(arr => {
    arr.forEach(v => { total++; if (isSetDone(v)) done++; });
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
    const setsArr = tracking.sets[dayData.day]?.[ei] || [];
    let completedCount = 0;
    let volume = 0;
    const fallbackWeight = parseNumericWeight(getWeight(weights, dayData.day, ei, ex.startWeight));
    const fallbackReps = parseNumericReps(ex.reps);
    setsArr.forEach(v => {
      if (isSetDone(v)) {
        completedCount++;
        const w = (typeof v === "object" && v.weight !== undefined) ? parseNumericWeight(v.weight) : fallbackWeight;
        const r = (typeof v === "object" && v.reps !== undefined) ? parseNumericReps(v.reps) : fallbackReps;
        volume += w * r;
      }
    });
    const setDetails = setsArr.map((v, si) => {
      if (!isSetDone(v)) return null;
      const w = (typeof v === "object" && v.weight !== undefined) ? parseNumericWeight(v.weight) : fallbackWeight;
      const r = (typeof v === "object" && v.reps !== undefined) ? parseNumericReps(v.reps) : fallbackReps;
      return { set: si + 1, weight: w, reps: r };
    }).filter(Boolean);
    perExercise.push({ name: ex.name, volume, completedCount, totalSets: ex.sets, weight: fallbackWeight, reps: fallbackReps, setDetails });
    totalVolume += volume;
  });
  return { totalVolume, perExercise };
}

function SetCircles({ count, completed, color, onTap }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: count }).map((_, s) => {
        const done = isSetDone(completed[s]);
        return (
          <button
            key={s}
            onClick={(e) => { e.stopPropagation(); onTap(s); }}
            style={{
              width: 26, height: 26, borderRadius: "50%",
              border: `1.5px solid ${done ? color : "rgba(255,255,255,0.12)"}`,
              background: done ? `rgba(${hexToRgb(color)},0.15)` : "transparent",
              color: done ? color : "rgba(255,255,255,0.25)",
              fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
              cursor: "pointer", transition: "all 0.25s ease",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            title={`Set ${s + 1}`}
          >
            {done ? "✓" : s + 1}
          </button>
        );
      })}
    </div>
  );
}

function SetLogInput({ setIndex, defaultWeight, defaultReps, color, onLog, onCancel }) {
  const [weight, setWeight] = useState(String(defaultWeight));
  const [reps, setReps] = useState(String(defaultReps));
  const weightRef = useRef(null);

  useEffect(() => {
    if (weightRef.current) {
      weightRef.current.focus();
      weightRef.current.select();
    }
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    onLog(weight, reps);
  };

  return (
    <div onClick={(e) => e.stopPropagation()} style={{
      borderTop: "1px solid rgba(255,255,255,0.05)",
      padding: "12px 18px",
      background: `rgba(${hexToRgb(color)},0.04)`,
      animation: "fadeIn 0.15s ease"
    }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
          color: color, minWidth: 42, textAlign: "center"
        }}>
          Set {setIndex + 1}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3, fontWeight: 500 }}>Weight</div>
            <input
              ref={weightRef}
              type="text"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.06)", border: `1px solid rgba(${hexToRgb(color)},0.25)`,
                borderRadius: 8, padding: "7px 10px", fontFamily: "'Inter', sans-serif",
                fontSize: 14, fontWeight: 600, color: color, width: "100%", outline: "none",
                transition: "all 0.2s"
              }}
            />
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.15)", paddingTop: 14 }}>×</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3, fontWeight: 500 }}>Reps</div>
            <input
              type="text"
              inputMode="numeric"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.06)", border: `1px solid rgba(${hexToRgb(color)},0.25)`,
                borderRadius: 8, padding: "7px 10px", fontFamily: "'Inter', sans-serif",
                fontSize: 14, fontWeight: 600, color: color, width: "100%", outline: "none",
                transition: "all 0.2s"
              }}
            />
          </div>
        </div>
        <button
          type="submit"
          style={{
            background: `rgba(${hexToRgb(color)},0.15)`, border: `1px solid rgba(${hexToRgb(color)},0.3)`,
            color: color, fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
            padding: "8px 16px", borderRadius: 8, cursor: "pointer", transition: "all 0.2s",
            letterSpacing: "0.04em", marginTop: 12
          }}
        >
          Log
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 500,
            padding: "8px 12px", borderRadius: 8, cursor: "pointer", transition: "all 0.2s",
            marginTop: 12
          }}
        >
          ×
        </button>
      </form>
    </div>
  );
}

function loadRestTimes() {
  try {
    const raw = localStorage.getItem("workout_rest_times");
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

function saveRestTimes(data) {
  localStorage.setItem("workout_rest_times", JSON.stringify(data));
}

function getRestTime(restTimes, dayNum, exIndex) {
  const key = `${dayNum}-${exIndex}`;
  return restTimes[key] !== undefined ? restTimes[key] : 90;
}

function RestTimer({ seconds, exerciseName, color, onDismiss, onAddTime }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pct = Math.max(0, seconds / 90 * 100);

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 900,
      background: "rgba(10,10,12,0.95)", backdropFilter: "blur(16px)",
      borderTop: `1px solid rgba(${hexToRgb(color)},0.2)`,
      padding: "0", animation: "slideUp 0.3s ease"
    }}>
      <div style={{
        height: 3, background: `rgba(${hexToRgb(color)},0.15)`, width: "100%"
      }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          transition: "width 1s linear", borderRadius: "0 2px 2px 0"
        }} />
      </div>
      <div style={{
        maxWidth: 720, margin: "0 auto", padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700,
            color: seconds <= 10 ? "#ff4444" : color, letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums", minWidth: 70, transition: "color 0.3s"
          }}>
            {mins}:{String(secs).padStart(2, "0")}
          </div>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>Rest</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 400 }}>{exerciseName}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onAddTime}
            style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif", fontSize: 11,
              fontWeight: 600, padding: "8px 14px", borderRadius: 8, cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            +30s
          </button>
          <button
            onClick={onDismiss}
            style={{
              background: `rgba(${hexToRgb(color)},0.12)`, border: `1px solid rgba(${hexToRgb(color)},0.25)`,
              color: color, fontFamily: "'Inter', sans-serif", fontSize: 11,
              fontWeight: 600, padding: "8px 14px", borderRadius: 8, cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            Skip
          </button>
        </div>
      </div>
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

const MUSCLE_GROUPS = {
  chest: { label: "Chest", front: true, path: "M85,75 Q100,70 115,75 L120,95 Q100,105 80,95 Z" },
  "upper chest": { label: "Upper Chest", front: true, path: "M85,68 Q100,63 115,68 L118,80 Q100,85 82,80 Z" },
  "inner chest": { label: "Inner Chest", front: true, path: "M93,75 Q100,72 107,75 L108,95 Q100,100 92,95 Z" },
  "lower chest": { label: "Lower Chest", front: true, path: "M83,90 Q100,100 117,90 L118,95 Q100,105 82,95 Z" },
  "front delt": { label: "Front Deltoid", front: true, path: "M72,68 Q78,60 85,68 L83,82 Q76,80 72,75 Z M115,68 Q122,60 128,68 L128,75 Q124,80 117,82 Z" },
  shoulders: { label: "Shoulders", front: true, path: "M68,65 Q78,55 88,65 L85,78 Q76,76 68,72 Z M112,65 Q122,55 132,65 L132,72 Q124,76 115,78 Z" },
  "side delts": { label: "Side Deltoids", front: true, path: "M68,68 Q72,60 78,65 L76,80 Q70,78 68,74 Z M122,65 Q128,60 132,68 L132,74 Q130,78 124,80 Z" },
  "rear delts": { label: "Rear Deltoids", front: false, path: "M68,68 Q78,58 88,68 L85,80 Q76,78 68,74 Z M112,68 Q122,58 132,68 L132,74 Q124,78 115,80 Z" },
  triceps: { label: "Triceps", front: false, path: "M68,85 Q72,80 76,85 L78,115 Q72,118 66,115 Z M124,85 Q128,80 132,85 L134,115 Q128,118 122,115 Z" },
  "triceps long head": { label: "Triceps Long Head", front: false, path: "M69,88 Q73,83 77,88 L78,112 Q73,115 68,112 Z M123,88 Q127,83 131,88 L132,112 Q127,115 122,112 Z" },
  biceps: { label: "Biceps", front: true, path: "M70,85 Q75,80 80,85 L82,115 Q76,118 68,115 Z M120,85 Q125,80 130,85 L132,115 Q124,118 118,115 Z" },
  lats: { label: "Lats", front: false, path: "M78,78 Q88,75 95,80 L95,115 Q85,118 78,112 Z M105,80 Q112,75 122,78 L122,112 Q115,118 105,115 Z" },
  "mid back": { label: "Mid Back", front: false, path: "M88,78 Q100,75 112,78 L112,100 Q100,105 88,100 Z" },
  rhomboids: { label: "Rhomboids", front: false, path: "M88,72 Q100,68 112,72 L112,88 Q100,92 88,88 Z" },
  quads: { label: "Quadriceps", front: true, path: "M80,128 Q88,125 93,128 L95,175 Q88,178 78,175 Z M107,128 Q112,125 120,128 L122,175 Q112,178 105,175 Z" },
  glutes: { label: "Glutes", front: false, path: "M78,118 Q100,112 122,118 L122,140 Q100,148 78,140 Z" },
  hamstrings: { label: "Hamstrings", front: false, path: "M80,140 Q88,138 95,140 L95,178 Q88,180 78,178 Z M105,140 Q112,138 120,140 L122,178 Q112,180 105,178 Z" },
  core: { label: "Core", front: true, path: "M88,98 Q100,95 112,98 L112,130 Q100,135 88,130 Z" },
  obliques: { label: "Obliques", front: true, path: "M80,100 Q86,98 90,100 L88,130 Q84,132 78,128 Z M110,100 Q114,98 120,100 L122,128 Q116,132 112,130 Z" },
  "transverse abs": { label: "Transverse Abs", front: true, path: "M88,105 Q100,102 112,105 L112,125 Q100,128 88,125 Z" },
  serratus: { label: "Serratus", front: true, path: "M78,90 Q82,88 85,92 L84,108 Q80,110 76,106 Z M115,92 Q118,88 122,90 L124,106 Q120,110 116,108 Z" },
  "lower back": { label: "Lower Back", front: false, path: "M88,100 Q100,98 112,100 L112,125 Q100,128 88,125 Z" },
  "rotator cuff": { label: "Rotator Cuff", front: false, path: "M75,65 Q82,60 88,65 L86,75 Q80,73 75,70 Z M112,65 Q118,60 125,65 L125,70 Q120,73 114,75 Z" },
  cardio: { label: "Cardio", front: true, path: "M93,75 Q100,70 107,75 L107,88 Q100,92 93,88 Z" },
  "shoulder stability": { label: "Shoulder Stability", front: true, path: "M70,62 Q80,55 88,62 L86,72 Q78,70 70,68 Z M112,62 Q120,55 130,62 L130,68 Q122,70 114,72 Z" },
};

function parseMuscleKeys(muscleStr) {
  if (!muscleStr) return [];
  const cleaned = muscleStr.toLowerCase().replace(/—[^,]*/g, "").replace("front & side delts", "front delt, side delts").trim();
  const tokens = cleaned.split(",").map(t => t.trim()).filter(Boolean);
  const found = new Set();
  const sortedKeys = Object.keys(MUSCLE_GROUPS).sort((a, b) => b.length - a.length);
  for (const token of tokens) {
    let matched = false;
    for (const k of sortedKeys) {
      if (token.includes(k)) { found.add(k); matched = true; }
    }
    if (!matched) {
      if (token === "back") found.add("lats");
      else if (token === "legs") { found.add("quads"); found.add("hamstrings"); }
    }
  }
  return [...found];
}

function MuscleMap({ muscles, color }) {
  const keys = parseMuscleKeys(muscles);
  const hasFront = keys.some(k => MUSCLE_GROUPS[k]?.front);
  const hasBack = keys.some(k => MUSCLE_GROUPS[k] && !MUSCLE_GROUPS[k].front);
  const rgb = hexToRgb(color);

  const renderBody = (isFront) => (
    <svg viewBox="55 40 90 160" style={{ width: "100%", height: "100%" }}>
      <g opacity="0.15" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none">
        <ellipse cx="100" cy="52" rx="12" ry="14" />
        <path d="M88,66 Q78,58 68,66 L66,120 Q68,125 78,128 L80,128 Q88,135 88,128 L88,66 Z" />
        <path d="M112,66 Q122,58 132,66 L134,120 Q132,125 122,128 L120,128 Q112,135 112,128 L112,66 Z" />
        <path d="M88,66 L88,130 Q88,135 93,135 L93,190 Q88,192 85,190 L78,128" />
        <path d="M112,66 L112,130 Q112,135 107,135 L107,190 Q112,192 115,190 L122,128" />
      </g>
      {keys.map((k, i) => {
        const mg = MUSCLE_GROUPS[k];
        if (!mg || mg.front !== isFront) return null;
        return <path key={i} d={mg.path} fill={`rgba(${rgb},0.4)`} stroke={color} strokeWidth="0.8" opacity="0.9" />;
      })}
      <text x="100" y="198" textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.3)" fontFamily="Inter, sans-serif">{isFront ? "FRONT" : "BACK"}</text>
    </svg>
  );

  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
      {(hasFront || !hasBack) && <div style={{ width: 100, height: 170 }}>{renderBody(true)}</div>}
      {hasBack && <div style={{ width: 100, height: 170 }}>{renderBody(false)}</div>}
    </div>
  );
}

function WeightChart({ exerciseName, history, color }) {
  const dataPoints = [];
  const sortedDates = Object.keys(history).sort();
  sortedDates.forEach(dateKey => {
    const entry = history[dateKey];
    entry.sessions.forEach(sess => {
      sess.exercises.forEach(ex => {
        if (ex.name === exerciseName && ex.completedCount > 0) {
          let maxWeight = ex.weight;
          if (ex.setDetails && ex.setDetails.length > 0) {
            maxWeight = Math.max(...ex.setDetails.map(s => s.weight));
          }
          dataPoints.push({ date: dateKey, weight: maxWeight });
        }
      });
    });
  });

  const last8 = dataPoints.slice(-8);
  if (last8.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>No history yet. Log sets to see your progression.</div>
      </div>
    );
  }

  const weights = last8.map(d => d.weight);
  const minW = Math.min(...weights) * 0.85;
  const maxW = Math.max(...weights) * 1.05;
  const range = maxW - minW || 1;
  const chartW = 280;
  const chartH = 100;
  const padL = 36;
  const padR = 10;
  const padT = 10;
  const padB = 24;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const points = last8.map((d, i) => ({
    x: padL + (last8.length === 1 ? plotW / 2 : (i / (last8.length - 1)) * plotW),
    y: padT + plotH - ((d.weight - minW) / range) * plotH,
    ...d
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = linePath + ` L${points[points.length-1].x},${padT + plotH} L${points[0].x},${padT + plotH} Z`;
  const rgb = hexToRgb(color);

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", height: "auto" }}>
      {[0, 0.5, 1].map((f, i) => {
        const y = padT + plotH * (1 - f);
        const val = Math.round(minW + range * f);
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <text x={padL - 4} y={y + 3} textAnchor="end" fontSize="6" fill="rgba(255,255,255,0.25)" fontFamily="Inter, sans-serif">{val}</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id={`chartGrad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#chartGrad-${color.replace('#','')})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill="#08080a" stroke={color} strokeWidth="1.5" />
          <text x={p.x} y={padT + plotH + 14} textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.2)" fontFamily="Inter, sans-serif">
            {p.date.slice(5)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ExerciseDetailDrawer({ exercise, color, history, prs, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  const rgb = hexToRgb(color);
  const pr = prs[exercise.name];
  const muscleList = exercise.muscles.split(",").map(m => m.trim());

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      animation: "fadeIn 0.2s ease"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 480,
        background: "linear-gradient(180deg, #141416 0%, #0c0c0e 100%)",
        borderRadius: "20px 20px 0 0",
        border: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "none",
        maxHeight: "85vh", overflowY: "auto",
        animation: "drawerSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "12px auto 0" }} />

        <div style={{ padding: "20px 24px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: color, textTransform: "uppercase", marginBottom: 4 }}>{exercise.equipment}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 700, color: "#f0ede6", lineHeight: 1.2 }}>{exercise.name}</div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#888",
              borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>×</button>
          </div>

          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {muscleList.map((m, i) => (
              <span key={i} style={{
                fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                background: `rgba(${rgb},0.1)`, color: color,
                padding: "3px 10px", borderRadius: 20,
                border: `1px solid rgba(${rgb},0.2)`,
                letterSpacing: "0.03em"
              }}>{m}</span>
            ))}
          </div>
          {pr && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginTop: 10,
              background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.12)",
              borderRadius: 8, padding: "8px 12px"
            }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", background: "rgba(255,215,0,0.15)", color: "#FFD700", padding: "2px 6px", borderRadius: 4, border: "1px solid rgba(255,215,0,0.2)" }}>PR</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,215,0,0.7)", fontWeight: 500 }}>{pr.weight} lbs × {pr.reps} reps</span>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,215,0,0.35)" }}>({pr.date})</span>
            </div>
          )}
        </div>

        <div style={{ padding: "20px 24px" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>MUSCLE MAP</div>
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, padding: "16px 12px", display: "flex", justifyContent: "center"
          }}>
            <MuscleMap muscles={exercise.muscles} color={color} />
          </div>
        </div>

        <div style={{ padding: "0 24px 20px" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>COACHING CUES</div>
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, padding: 16
          }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
              {exercise.tip}
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <div style={{ background: `rgba(${rgb},0.08)`, border: `1px solid rgba(${rgb},0.15)`, borderRadius: 8, padding: "8px 12px", flex: 1, textAlign: "center" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, color: color }}>{exercise.sets}×{exercise.reps}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginTop: 2 }}>SETS × REPS</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 12px", flex: 1, textAlign: "center" }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, color: "#f0ede6" }}>{exercise.startWeight}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", marginTop: 2 }}>START WEIGHT</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 24px 28px" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>WEIGHT PROGRESSION</div>
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12, padding: "16px 12px"
          }}>
            <WeightChart exerciseName={exercise.name} history={history} color={color} />
          </div>
        </div>
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
                <div key={ei} style={{ paddingTop: ei === 0 ? 0 : 8, borderTop: ei === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: ex.completedCount === ex.totalSets ? "#ccc" : "#888" }}>{ex.name}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: ex.completedCount === ex.totalSets ? sess.color : "#555" }}>
                      {ex.volume.toLocaleString()} lbs
                    </span>
                  </div>
                  {ex.setDetails && ex.setDetails.length > 0 ? (
                    <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                      {ex.setDetails.map((s, si) => (
                        <div key={si} style={{
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                          borderRadius: 6, padding: "4px 10px",
                          fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#999"
                        }}>
                          <span style={{ color: sess.color, fontWeight: 600 }}>S{s.set}</span>{" "}
                          {s.weight} lbs × {s.reps}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#444", marginTop: 3 }}>
                      {ex.weight} lbs × {ex.reps} × {ex.completedCount} sets
                    </div>
                  )}
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

const MUSCLE_GROUP_COLORS = {
  "Chest": "#E84A2E", "Upper Chest": "#E84A2E", "Inner Chest": "#E84A2E", "Lower Chest": "#E84A2E",
  "Shoulders": "#9B59B6", "Front Delt": "#9B59B6", "Side Delts": "#9B59B6", "Rear Delts": "#9B59B6",
  "Triceps": "#E8A02E", "Triceps Long Head": "#E8A02E",
  "Biceps": "#2E7BE8",
  "Back": "#2E7BE8", "Lats": "#2E7BE8", "Mid Back": "#2E7BE8", "Rhomboids": "#2E7BE8",
  "Quads": "#2ECC71", "Glutes": "#2ECC71", "Hamstrings": "#2ECC71",
  "Core": "#E8A02E", "Obliques": "#E8A02E",
  "Cardio": "#E84A2E",
};

function getWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function computeStats(history) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const { start: weekStart, end: weekEnd } = getWeekRange();

  let monthVolume = 0;
  let monthSessions = 0;
  const weeklyMuscleVolume = {};
  const liftHistory = {};

  let streak = 0;
  const d = new Date();
  while (true) {
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    if (history[key]) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }

  Object.entries(history).forEach(([dateKey, entry]) => {
    if (dateKey.startsWith(monthKey)) {
      monthSessions += entry.sessions.length;
      entry.sessions.forEach(sess => {
        monthVolume += sess.totalVolume;
      });
    }

    const dateObj = new Date(dateKey + "T12:00:00");
    if (dateObj >= weekStart && dateObj <= weekEnd) {
      entry.sessions.forEach(sess => {
        sess.exercises.forEach(ex => {
          const muscles = ex.name;
          const dayData = workoutData.find(wd => wd.day === sess.dayNum);
          if (dayData) {
            const exData = dayData.exercises.find(e => e.name === ex.name);
            if (exData) {
              const muscleNames = exData.muscles.split(",").map(m => m.trim().replace(/—.*/, "").trim());
              const volPerMuscle = ex.volume / Math.max(muscleNames.length, 1);
              muscleNames.forEach(m => {
                const key = m.split(",")[0].trim();
                if (!key) return;
                weeklyMuscleVolume[key] = (weeklyMuscleVolume[key] || 0) + volPerMuscle;
              });
            }
          }
        });
      });
    }

    entry.sessions.forEach(sess => {
      sess.exercises.forEach(ex => {
        if (!liftHistory[ex.name]) liftHistory[ex.name] = [];
        let maxW = ex.weight || 0;
        if (ex.setDetails && ex.setDetails.length > 0) {
          maxW = Math.max(...ex.setDetails.map(s => s.weight));
        }
        liftHistory[ex.name].push({ date: dateKey, weight: maxW });
      });
    });
  });

  let mostImproved = null;
  let bestImprovement = 0;
  Object.entries(liftHistory).forEach(([name, entries]) => {
    if (entries.length < 2) return;
    const sorted = entries.sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0].weight;
    const last = sorted[sorted.length - 1].weight;
    if (first > 0 && last > first) {
      const pct = ((last - first) / first) * 100;
      if (pct > bestImprovement) {
        bestImprovement = pct;
        mostImproved = { name, from: first, to: last, pct: Math.round(pct) };
      }
    }
  });

  return { monthVolume, monthSessions, streak, weeklyMuscleVolume, mostImproved };
}

function StatsView({ history }) {
  const stats = useMemo(() => computeStats(history), [history]);
  const { monthVolume, monthSessions, streak, weeklyMuscleVolume, mostImproved } = stats;

  const muscleEntries = Object.entries(weeklyMuscleVolume).sort((a, b) => b[1] - a[1]);
  const maxMuscleVol = muscleEntries.length > 0 ? muscleEntries[0][1] : 1;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", color: "#888", textTransform: "uppercase", marginBottom: 4 }}>ANALYTICS</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 42, letterSpacing: "0.04em", color: "#f0ede6", lineHeight: 1 }}>STATS</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #222", borderRadius: 10, padding: "16px" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>THIS MONTH</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, color: "#2ECC71", lineHeight: 1 }}>{monthVolume.toLocaleString()}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#666", marginTop: 2 }}>lbs lifted</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #222", borderRadius: 10, padding: "16px" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>SESSIONS</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, color: "#2E7BE8", lineHeight: 1 }}>{monthSessions}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#666", marginTop: 2 }}>this month</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #222", borderRadius: 10, padding: "16px" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>STREAK</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, color: "#E8A02E", lineHeight: 1 }}>{streak}</div>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#666", marginTop: 2 }}>{streak === 1 ? "day" : "days"} in a row</div>
        </div>
      </div>

      {mostImproved && (
        <div style={{
          background: "linear-gradient(135deg, rgba(46,204,113,0.08) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(46,204,113,0.2)", borderRadius: 12,
          padding: "18px 20px", marginBottom: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#2ECC71", marginBottom: 6 }}>MOST IMPROVED LIFT</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, color: "#f0ede6", lineHeight: 1.2 }}>{mostImproved.name}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              {mostImproved.from} lbs → {mostImproved.to} lbs
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 700, color: "#2ECC71", lineHeight: 1 }}>+{mostImproved.pct}%</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>improvement</div>
          </div>
        </div>
      )}

      <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid #1e1e1e", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#555", marginBottom: 18 }}>WEEKLY VOLUME BY MUSCLE GROUP</div>
        {muscleEntries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.2)" }}>No workouts logged this week yet.</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.12)", marginTop: 6 }}>Log sets to see your muscle volume breakdown.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {muscleEntries.map(([muscle, vol]) => {
              const barColor = MUSCLE_GROUP_COLORS[muscle] || "#888";
              const pct = (vol / maxMuscleVol) * 100;
              return (
                <div key={muscle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{muscle}</span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: barColor }}>{Math.round(vol).toLocaleString()} lbs</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 4,
                      background: `linear-gradient(90deg, ${barColor}, rgba(${hexToRgb(barColor)},0.6))`,
                      width: `${pct}%`,
                      transition: "width 0.5s ease"
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!mostImproved && Object.keys(history).length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0 20px" }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.2)" }}>Start logging workouts to see your stats here.</div>
        </div>
      )}
    </div>
  );
}

export default function WorkoutPlan() {
  const [activeDay, setActiveDay] = useState(() => {
    try { const v = localStorage.getItem("workout_active_day"); return v ? parseInt(v, 10) : 0; } catch { return 0; }
  });
  const [expandedEx, setExpandedEx] = useState(null);
  const [formGuideEx, setFormGuideEx] = useState(null);
  const [tracking, setTracking] = useState(() => initTracking());
  const [weights, setWeights] = useState(() => loadWeights());
  const [view, setView] = useState("workout");
  const [history, setHistory] = useState(() => loadHistory());
  const [historyDetail, setHistoryDetail] = useState(null);
  const [activeSetLog, setActiveSetLog] = useState(null);
  const [restTimes, setRestTimes] = useState(() => loadRestTimes());
  const [restTimer, setRestTimer] = useState(null);
  const [prs, setPrs] = useState(() => loadPRs());
  const [newPRs, setNewPRs] = useState({});
  const [detailDrawerEx, setDetailDrawerEx] = useState(null);
  const [swapModal, setSwapModal] = useState(null);
  const [swappedExercises, setSwappedExercises] = useState(() => {
    try { const raw = localStorage.getItem("workout_swaps"); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  });
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionDismissed, setCompletionDismissed] = useState({});
  const [showNotifSettings, setShowNotifSettings] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("workout_reminders");
      if (raw) {
        const settings = JSON.parse(raw);
        if (settings.enabled) {
          sendSWMessage({ type: "SCHEDULE_REMINDERS", settings });
        }
      }
    } catch {}
  }, []);

  const workoutStartTimeRef = useRef((() => {
    try { const v = localStorage.getItem("workout_start_times"); return v ? JSON.parse(v) : {}; } catch { return {}; }
  })());
  const completionTimeoutRef = useRef(null);
  const restTimerRef = useRef(null);
  const day = workoutData[activeDay];

  useEffect(() => {
    if (restTimer && restTimer.remaining > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTimer(prev => {
          if (!prev || prev.remaining <= 1) {
            clearInterval(restTimerRef.current);
            if (document.hidden && getNotificationPermission() === "granted") {
              sendSWMessage({ type: "REST_TIMER_DONE" });
            }
            return null;
          }
          return { ...prev, remaining: prev.remaining - 1 };
        });
      }, 1000);
    }
    return () => { if (restTimerRef.current) clearInterval(restTimerRef.current); };
  }, [restTimer?.exerciseName, restTimer?.startTime]);

  const startRestTimer = useCallback((exerciseName, exerciseIndex) => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    const duration = getRestTime(restTimes, day.day, exerciseIndex);
    setRestTimer({ exerciseName, remaining: duration, startTime: Date.now() });
  }, [restTimes, day.day]);

  const dismissRestTimer = useCallback(() => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestTimer(null);
  }, []);

  const addRestTime = useCallback(() => {
    setRestTimer(prev => prev ? { ...prev, remaining: prev.remaining + 30 } : null);
  }, []);

  const updateRestTime = useCallback((exerciseIndex, value) => {
    const key = `${day.day}-${exerciseIndex}`;
    setRestTimes(prev => {
      const next = { ...prev, [key]: value };
      saveRestTimes(next);
      return next;
    });
  }, [day.day]);

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

  const getEffectiveExercise = useCallback((dayNum, exIndex, originalEx) => {
    const key = `${dayNum}-${exIndex}`;
    const swapped = swappedExercises[key];
    if (swapped) {
      return { ...originalEx, name: swapped.name, equipment: swapped.equipment, sets: swapped.sets, reps: swapped.reps, startWeight: swapped.startWeight, tip: swapped.tip, muscles: swapped.muscles, _swapped: true, _originalName: originalEx.name };
    }
    return { ...originalEx, _swapped: false };
  }, [swappedExercises]);

  const logSet = useCallback((exerciseIndex, setIndex, weight, reps) => {
    const originalEx = day.exercises[exerciseIndex];
    const effEx = getEffectiveExercise(day.day, exerciseIndex, originalEx);
    const exName = effEx.name;

    if (!workoutStartTimeRef.current[day.day]) {
      workoutStartTimeRef.current[day.day] = Date.now();
      localStorage.setItem("workout_start_times", JSON.stringify(workoutStartTimeRef.current));
    }

    setTracking(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.sets[day.day][exerciseIndex][setIndex] = { weight, reps };
      saveTracking(next);
      const updatedHistory = saveWorkoutToHistory(next, weights);
      setHistory(updatedHistory);

      const prog = getDayProgress(next, day.day);
      if (prog.total > 0 && prog.done === prog.total && !completionDismissed[day.day]) {
        if (completionTimeoutRef.current) clearTimeout(completionTimeoutRef.current);
        completionTimeoutRef.current = setTimeout(() => {
          setShowCompletion(true);
          completionTimeoutRef.current = null;
        }, 600);
      }

      return next;
    });
    setActiveSetLog(null);

    const w = parseNumericWeight(weight);
    const r = parseNumericReps(reps);
    const vol = w * r;
    if (vol > 0) {
      setPrs(prev => {
        const existing = prev[exName];
        if (!existing || !existing.volume || vol > existing.volume) {
          const dateKey = getTodayKey();
          const next = { ...prev, [exName]: { volume: vol, weight: w, reps: r, date: dateKey } };
          savePRs(next);
          setNewPRs(p => ({ ...p, [exName]: true }));
          setTimeout(() => {
            setNewPRs(p => { const n = { ...p }; delete n[exName]; return n; });
          }, 4000);
          return next;
        }
        return prev;
      });
    }

    const totalSets = effEx.sets;
    const setsArr = tracking.sets[day.day][exerciseIndex] || [];
    const doneAfterThis = setsArr.filter((v, idx) => idx === setIndex ? true : isSetDone(v)).length;
    if (doneAfterThis < totalSets) {
      startRestTimer(exName, exerciseIndex);
    }
  }, [day, tracking, weights, startRestTimer, getEffectiveExercise, completionDismissed]);

  const handleSwap = useCallback((dayNum, exIndex, alt) => {
    const key = `${dayNum}-${exIndex}`;
    setSwappedExercises(prev => {
      const next = { ...prev, [key]: alt };
      localStorage.setItem("workout_swaps", JSON.stringify(next));
      return next;
    });
    setSwapModal(null);
  }, []);

  const revertSwap = useCallback((dayNum, exIndex) => {
    const key = `${dayNum}-${exIndex}`;
    setSwappedExercises(prev => {
      const next = { ...prev };
      delete next[key];
      localStorage.setItem("workout_swaps", JSON.stringify(next));
      return next;
    });
  }, []);

  const clearSet = useCallback((exerciseIndex, setIndex) => {
    setTracking(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.sets[day.day][exerciseIndex][setIndex] = false;
      saveTracking(next);
      const updatedHistory = saveWorkoutToHistory(next, weights);
      setHistory(updatedHistory);
      return next;
    });
  }, [day.day, weights]);

  const handleSetTap = useCallback((exerciseIndex, setIndex) => {
    const setsArr = tracking.sets[day.day][exerciseIndex] || [];
    if (isSetDone(setsArr[setIndex])) {
      clearSet(exerciseIndex, setIndex);
    } else {
      setActiveSetLog({ exIndex: exerciseIndex, setIndex });
    }
  }, [tracking, day.day, clearSet]);

  const toggleWarmup = useCallback(() => {
    setTracking(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.warmup) next.warmup = {};
      next.warmup[day.day] = !next.warmup[day.day];
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
      if (next.warmup) next.warmup[day.day] = false;
      saveTracking(next);
      const updatedHistory = saveWorkoutToHistory(next, weights);
      setHistory(updatedHistory);
      return next;
    });
    setShowCompletion(false);
    setCompletionDismissed(prev => { const n = { ...prev }; delete n[day.day]; return n; });
    delete workoutStartTimeRef.current[day.day];
    localStorage.setItem("workout_start_times", JSON.stringify(workoutStartTimeRef.current));
    if (completionTimeoutRef.current) { clearTimeout(completionTimeoutRef.current); completionTimeoutRef.current = null; }
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
        @keyframes prPulse { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes prGlow { 0%, 100% { box-shadow: 0 0 4px rgba(255,215,0,0.3); } 50% { box-shadow: 0 0 12px rgba(255,215,0,0.6); } }
        @keyframes drawerSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes confettiFade { 0% { opacity: 0; transform: scale(0) translateY(0); } 30% { opacity: 1; transform: scale(1.5) translateY(-20px); } 100% { opacity: 0; transform: scale(0.8) translateY(30px); } }
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
            <div style={{ display: "flex", gap: 6 }}>
              {view !== "workout" && (
                <button
                  className="view-toggle"
                  onClick={() => setView("workout")}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                    letterSpacing: "0.05em", textTransform: "uppercase",
                    padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                    transition: "all 0.25s", whiteSpace: "nowrap"
                  }}
                >
                  ← Back
                </button>
              )}
              {view === "workout" && (
                <>
                  <button
                    className="view-toggle"
                    onClick={() => setView("calendar")}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                      letterSpacing: "0.05em", textTransform: "uppercase",
                      padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                      transition: "all 0.25s", whiteSpace: "nowrap"
                    }}
                  >
                    History
                  </button>
                  <button
                    className="view-toggle"
                    onClick={() => setView("stats")}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                      letterSpacing: "0.05em", textTransform: "uppercase",
                      padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                      transition: "all 0.25s", whiteSpace: "nowrap"
                    }}
                  >
                    Stats
                  </button>
                  <button
                    className="view-toggle"
                    onClick={() => setView("body")}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                      letterSpacing: "0.05em", textTransform: "uppercase",
                      padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                      transition: "all 0.25s", whiteSpace: "nowrap"
                    }}
                  >
                    Body
                  </button>
                  <button
                    className="view-toggle"
                    onClick={() => setShowNotifSettings(true)}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
                      padding: "8px 11px", borderRadius: 10, cursor: "pointer",
                      transition: "all 0.25s", whiteSpace: "nowrap",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                    title="Notification Settings"
                  >
                    ⚙
                  </button>
                </>
              )}
            </div>
          </div>
          {view === "workout" && (
          <div style={{ display: "flex", gap: 4 }}>
            {workoutData.map((d, i) => {
              const prog = getDayProgress(tracking, d.day);
              const tabComplete = prog.total > 0 && prog.done === prog.total;
              const isActive = activeDay === i;
              return (
                <button key={i} className="day-tab" onClick={() => { setActiveDay(i); localStorage.setItem("workout_active_day", String(i)); setExpandedEx(null); setShowCompletion(false); if (completionTimeoutRef.current) { clearTimeout(completionTimeoutRef.current); completionTimeoutRef.current = null; } }} style={{
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

      {view === "stats" && (
        <StatsView history={history} />
      )}

      {view === "body" && (
        <BodyMetrics />
      )}

      {view === "workout" && (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 40px" }} key={activeDay}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", color: day.color, textTransform: "uppercase", marginBottom: 6, opacity: 0.9 }}>{day.label} · {day.focus}</div>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#fff" }}>{day.title}</h2>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.25)", marginTop: 6, fontWeight: 400 }}>{day.equipment}</div>
          </div>
          {(() => {
            const warmupDone = tracking.warmup && tracking.warmup[day.day];
            return (
              <button
                onClick={toggleWarmup}
                style={{
                  background: warmupDone ? `rgba(${hexToRgb(day.color)},0.1)` : "rgba(255,255,255,0.03)",
                  border: warmupDone ? `1px solid rgba(${hexToRgb(day.color)},0.25)` : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, padding: "12px 16px", minWidth: 140,
                  backdropFilter: "blur(8px)", cursor: "pointer",
                  transition: "all 0.25s", textAlign: "left",
                  display: "flex", alignItems: "center", gap: 10
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  border: `1.5px solid ${warmupDone ? day.color : "rgba(255,255,255,0.15)"}`,
                  background: warmupDone ? `rgba(${hexToRgb(day.color)},0.2)` : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.25s", flexShrink: 0,
                  color: warmupDone ? day.color : "transparent",
                  fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700
                }}>
                  {warmupDone ? "✓" : ""}
                </div>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: warmupDone ? day.color : "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3, fontWeight: 500, transition: "color 0.25s" }}>Walk/Jog</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: warmupDone ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.6)", lineHeight: 1.4, fontWeight: 400, textDecoration: warmupDone ? "line-through" : "none", textDecorationColor: `rgba(${hexToRgb(day.color)},0.5)`, transition: "all 0.25s" }}>10 minutes</div>
                </div>
              </button>
            );
          })()}
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
          {day.exercises.map((originalEx, i) => {
            const ex = getEffectiveExercise(day.day, i, originalEx);
            const isOpen = expandedEx === i;
            const setsCompleted = tracking.sets[day.day][i] || [];
            const exDone = setsCompleted.every(v => isSetDone(v));
            const showSetLog = activeSetLog && activeSetLog.exIndex === i;
            const defaultWeight = getWeight(weights, day.day, i, ex.startWeight);
            const defaultReps = ex.reps;
            const hasPR = prs[ex.name] && prs[ex.name].date === getTodayKey();
            const isNewPR = newPRs[ex.name];
            const originalName = ex._swapped ? ex._originalName : ex.name;
            const swapAlts = SWAP_ALTERNATIVES[originalName];
            return (
              <div key={i} className={`ex-card ${isOpen ? "open" : ""} ${exDone ? "done-card" : ""}`} style={{ background: "rgba(255,255,255,0.02)", border: hasPR ? "1px solid rgba(255,215,0,0.15)" : "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden", "--day-color": day.color }}>
                <div onClick={() => setExpandedEx(isOpen ? null : i)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", cursor: "pointer" }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700, color: exDone ? day.color : (isOpen ? day.color : "rgba(255,255,255,0.12)"), minWidth: 28, transition: "color 0.25s", lineHeight: 1, textAlign: "center" }}>
                    {exDone ? "✓" : String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, color: exDone ? "rgba(255,255,255,0.4)" : "#fff", textDecoration: exDone ? "line-through" : "none", textDecorationColor: `rgba(${hexToRgb(day.color)},0.5)` }}>{ex.name}</span>
                      {ex._swapped && (
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: "0.05em", background: `rgba(${hexToRgb(day.color)},0.1)`, color: day.color, padding: "2px 6px", borderRadius: 4, border: `1px solid rgba(${hexToRgb(day.color)},0.2)` }}>SWAPPED</span>
                      )}
                      {hasPR && (
                        <span style={{
                          fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 700,
                          letterSpacing: "0.06em", textTransform: "uppercase",
                          background: "rgba(255,215,0,0.15)", color: "#FFD700",
                          padding: "2px 7px", borderRadius: 5,
                          border: "1px solid rgba(255,215,0,0.25)",
                          animation: isNewPR ? "prPulse 0.5s ease, prGlow 2s ease infinite" : "prGlow 3s ease infinite",
                          display: "inline-flex", alignItems: "center", gap: 3
                        }}>
                          PR
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      <span className="pill">{ex.equipment}</span>
                      <span className="pill">{ex.muscles}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <SetCircles count={ex.sets} completed={setsCompleted} color={day.color} onTap={(s) => handleSetTap(i, s)} />
                    <div style={{ textAlign: "right", minWidth: 54 }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, color: day.color, lineHeight: 1, letterSpacing: "-0.01em" }}>{ex.sets}×{ex.reps}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2, fontWeight: 500 }}>sets × reps</div>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setDetailDrawerEx(ex); }} style={{
                    background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 16, cursor: "pointer",
                    padding: "6px 2px", marginLeft: 2, transition: "color 0.2s",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }} title="Exercise details">›</button>
                </div>

                {showSetLog && (
                  <SetLogInput
                    setIndex={activeSetLog.setIndex}
                    defaultWeight={defaultWeight}
                    defaultReps={defaultReps}
                    color={day.color}
                    onLog={(w, r) => logSet(i, activeSetLog.setIndex, w, r)}
                    onCancel={() => setActiveSetLog(null)}
                  />
                )}

                <div className="expand-detail" style={{ maxHeight: isOpen ? 400 : 0 }}>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "14px 18px 16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 16, alignItems: "center" }}>
                      <div style={{ "--day-color": day.color }}>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, fontWeight: 500 }}>Default Weight</div>
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
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.04)" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 500 }}>Rest</div>
                      {[60, 90, 120].map(sec => {
                        const current = getRestTime(restTimes, day.day, i);
                        const isActive = current === sec;
                        return (
                          <button key={sec} onClick={() => updateRestTime(i, sec)} style={{
                            background: isActive ? `rgba(${hexToRgb(day.color)},0.12)` : "rgba(255,255,255,0.03)",
                            border: isActive ? `1px solid rgba(${hexToRgb(day.color)},0.25)` : "1px solid rgba(255,255,255,0.06)",
                            color: isActive ? day.color : "rgba(255,255,255,0.3)",
                            fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                            padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                            transition: "all 0.2s"
                          }}>
                            {sec}s
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.04)" }} onClick={e => e.stopPropagation()}>
                      {swapAlts && (
                        <button onClick={() => setSwapModal({ exIndex: i, exercise: originalEx, alternatives: swapAlts })} style={{
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                          padding: "5px 12px", borderRadius: 6, cursor: "pointer", transition: "all 0.2s",
                          display: "flex", alignItems: "center", gap: 5, letterSpacing: "0.04em"
                        }}>
                          ⇄ Swap
                        </button>
                      )}
                      {ex._swapped && (
                        <button onClick={() => revertSwap(day.day, i)} style={{
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.3)", fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 600,
                          padding: "5px 12px", borderRadius: 6, cursor: "pointer", transition: "all 0.2s",
                          letterSpacing: "0.04em"
                        }}>
                          ↩ Revert
                        </button>
                      )}
                    </div>
                    {prs[ex.name] && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", background: "rgba(255,215,0,0.12)", color: "#FFD700", padding: "2px 6px", borderRadius: 4, border: "1px solid rgba(255,215,0,0.2)" }}>PR</span>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                          {prs[ex.name].weight} lbs × {prs[ex.name].reps} reps
                        </span>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>
                          ({prs[ex.name].date})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
      )}

      {restTimer && (
        <RestTimer
          seconds={restTimer.remaining}
          exerciseName={restTimer.exerciseName}
          color={day.color}
          onDismiss={dismissRestTimer}
          onAddTime={addRestTime}
        />
      )}

      {formGuideEx && <FormGuideModal exercise={formGuideEx} color={day.color} onClose={() => setFormGuideEx(null)} />}
      {historyDetail && <HistoryDetailModal entry={historyDetail} onClose={() => setHistoryDetail(null)} />}
      {detailDrawerEx && <ExerciseDetailDrawer exercise={detailDrawerEx} color={day.color} history={history} prs={prs} onClose={() => setDetailDrawerEx(null)} />}
      {swapModal && (
        <SwapModal
          exercise={swapModal.exercise}
          alternatives={swapModal.alternatives}
          color={day.color}
          onSwap={(alt) => handleSwap(day.day, swapModal.exIndex, alt)}
          onClose={() => setSwapModal(null)}
        />
      )}
      {showCompletion && allComplete && (
        <CompletionOverlay
          dayData={day}
          volume={volume.totalVolume}
          duration={workoutStartTimeRef.current[day.day] ? Date.now() - workoutStartTimeRef.current[day.day] : 0}
          color={day.color}
          onSave={() => {
            setShowCompletion(false);
            setCompletionDismissed(prev => ({ ...prev, [day.day]: true }));
          }}
          onDismiss={() => {
            setShowCompletion(false);
            setCompletionDismissed(prev => ({ ...prev, [day.day]: true }));
          }}
        />
      )}
      {showNotifSettings && (
        <NotificationSettings color={day.color} onClose={() => setShowNotifSettings(false)} />
      )}
      <NotificationPrompt color={day.color} />
    </div>
  );
}

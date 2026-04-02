# 5-Day Build Program

## Overview
A React-based interactive workout plan application showing a personalized 5-day training program. Built with Vite + React.

## Structure
- `src/App.jsx` - Root app component
- `src/WorkoutPlan.jsx` - Main workout plan component with all workout data, exercise cards, and form guide modal
- `public/exercises/` - 25 AI-generated exercise form guide illustrations
- `src/index.jsx` - Entry point
- `vite.config.js` - Vite config (port 5000)

## Features
- 5-day tabbed workout navigation (Push, Pull, Lower, Press, Fat Loss)
- Expandable exercise cards with starting weight, coaching tips
- Form guide modal with AI-generated exercise illustrations (replaced YouTube embeds)
- Set tracking: clickable circles per exercise to mark sets complete
- Per-day progress bar with percentage and set count
- Completed exercises get dimmed with strikethrough and checkmark
- Day tabs show checkmark when all sets done, dot when partially done
- Reset button to clear a day's progress
- Editable weight field per exercise (persists permanently, does not reset daily)
- Total volume lifted summary (weight x reps x sets) per exercise and day total, appears as sets are completed
- Calendar view with workout history tracking
  - Auto-saves sessions to `workout_history` localStorage whenever sets are toggled
  - Monthly calendar grid with color-coded dots for workout days
  - Stats cards: month workout count, month volume, current streak
  - Recent sessions list (last 7 workouts)
  - Click any past date to see full workout detail modal (exercises, sets, volume breakdown)
  - Navigate months with prev/next buttons
- Set tracking data persists in localStorage, resets daily
- Dark theme with per-day color coding
- Fully inline styles with Bebas Neue + Lato fonts

## Running
- `npm run dev` starts the Vite dev server on port 5000

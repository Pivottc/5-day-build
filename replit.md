# 5-Day Build Program

## Overview
A React-based interactive workout plan application showing a personalized 5-day training program. Built with Vite + React. Installable as a Progressive Web App (PWA).

## Structure
- `src/App.jsx` - Root app component
- `src/WorkoutPlan.jsx` - Main workout plan component with all workout data, exercise cards, and form guide modal
- `src/NotificationSettings.jsx` - Notification settings modal (workout reminders, rest timer alerts)
- `src/NotificationPrompt.jsx` - First-launch notification permission prompt
- `src/pwaRegister.js` - Service worker registration and notification helpers
- `public/manifest.json` - PWA manifest (app name, icons, theme/background colors)
- `public/sw.js` - Service worker (rest timer notifications, scheduled workout reminders)
- `public/icons/` - PWA icons (192px and 512px)
- `public/exercises/` - 75 AI-generated exercise form guide illustrations (3 frames per exercise)
- `src/index.jsx` - Entry point (registers service worker)
- `vite.config.js` - Vite config (port 5000)

## Features
- 5-day tabbed workout navigation (Push, Pull, Lower, Press, Fat Loss)
- Expandable exercise cards with starting weight, coaching tips
- Form guide modal with auto-cycling 3-frame slideshow per exercise (start, movement, finish positions)
  - 75 AI-generated images (3 per exercise) auto-play like a GIF at 1.5s intervals
  - Play/pause control and clickable frame indicators
  - Phase labels overlay (Starting Position / Movement / Finish Position)
- Per-set logging: tapping a set circle opens an inline input to log actual weight and reps; logs per-set data for accurate volume tracking
- Rest timer: auto-starts a 90s countdown banner after logging a set (skips if all sets done); customizable per exercise (60/90/120s); +30s extend button; persistent bottom banner with progress bar
- Personal Records (PRs): stores best weight×reps volume per exercise in `workout_prs` localStorage; gold "PR" badge with pulse/glow animation appears on exercise card when today's set beats the record; expanded detail shows all-time PR with weight, reps, and date
- Exercise Detail Drawer: tapping the `›` arrow opens a bottom sheet with muscle diagram (SVG body outline with highlighted muscle groups), coaching cues with sets/reps/start weight cards, and a weight progression chart showing the last 8 sessions
- Stats/Analytics Dashboard: "Stats" tab showing total monthly volume, session count, workout streak, weekly volume per muscle group (horizontal bar chart with per-muscle-group colors), and most improved lift (percentage gain from first to latest logged weight)
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
- Exercise Swap: each exercise card has a "Swap" button in the expanded detail; opens a modal with 3 alternative exercises (same muscle group/equipment); selecting one replaces the exercise in-place with a "SWAPPED" badge; "Revert" button to restore original; swaps persist in `workout_swaps` localStorage; PR tracking uses the swapped exercise name
- Completion Overlay: when all sets for a day are done (e.g. 15/15), a full-screen animated overlay appears with staggered reveal (checkmark, title, stats cards, CTA); shows total volume lifted, workout duration (tracked from first logged set), and sets/exercise count; "Save Workout" and "Dismiss" buttons close the overlay; resets on day reset; confetti particle animation with day accent color
- Progressive Web App (PWA):
  - `manifest.json` with app name, icons, theme color #000000, background color; installable on mobile homescreen
  - Service worker (`public/sw.js`) handles rest timer notifications and scheduled workout reminders
  - Rest timer notifications: when rest countdown ends and app is backgrounded, pushes "Rest over. Time for your next set."
  - Scheduled workout reminders: user picks days of the week and a time (stored in `workout_reminders` localStorage); fires "Time to train. Your [Day Name] workout is ready." at the scheduled time
  - Notification settings page (⚙ gear icon in header): toggle reminders on/off, pick training days, set reminder time, shows rest timer alert status
  - First-launch notification permission prompt: clean custom UI prompt (not raw browser default) appears after 2 seconds on first visit; "Enable Notifications" / "Maybe Later" buttons; stores `workout_notif_prompted` flag so it only shows once
- Full localStorage persistence: all logged data survives page refreshes and browser restarts
  - `workout_tracking` — daily set logs with per-set weight/reps (auto-resets next day)
  - `workout_weights` — custom weight overrides per exercise (permanent)
  - `workout_history` — complete workout history with volume and set details (permanent)
  - `workout_prs` — personal records (permanent)
  - `workout_rest_times` — rest timer preferences per exercise (permanent)
  - `workout_swaps` — exercise swap choices (permanent)
  - `workout_active_day` — last selected day tab (permanent)
  - `workout_start_times` — workout start timestamps for duration tracking (cleared on reset)
  - `workout_reminders` — notification reminder settings (days, time, enabled flag)
  - `workout_notif_prompted` — tracks whether notification permission prompt has been shown
- Dark theme (#08080a background) with per-day color coding
- Modern glassmorphic UI with Inter font, rgba borders, backdrop blur, smooth transitions

## Running
- `npm run dev` starts the Vite dev server on port 5000

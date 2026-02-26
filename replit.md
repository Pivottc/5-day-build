# 5-Day Build Program

## Overview
A React-based interactive workout plan application showing a personalized 5-day training program. Built with Vite + React.

## Structure
- `src/App.jsx` - Root app component
- `src/WorkoutPlan.jsx` - Main workout plan component with all workout data, exercise cards, and video modal
- `src/index.jsx` - Entry point
- `vite.config.js` - Vite config (port 5000)

## Features
- 5-day tabbed workout navigation (Push, Pull, Lower, Press, Fat Loss)
- Expandable exercise cards with starting weight, coaching tips
- Video modal for form guides (YouTube embeds)
- Set tracking: clickable circles per exercise to mark sets complete
- Per-day progress bar with percentage and set count
- Completed exercises get dimmed with strikethrough and checkmark
- Day tabs show checkmark when all sets done, dot when partially done
- Reset button to clear a day's progress
- Data persists in localStorage, resets daily
- Dark theme with per-day color coding
- Fully inline styles with Bebas Neue + Lato fonts

## Running
- `npm run dev` starts the Vite dev server on port 5000

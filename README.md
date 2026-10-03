# FORGE — 3D Gym Training

Interactive 3D gym training web app. Browse **190+ exercises** across 17 muscle groups, and see every
exercise light up on a rotatable **3D anatomical body** (Three.js).

## Features

- **3D Body Map** — click any muscle on the interactive 3D mannequin to see every exercise that trains it
- **Exercise detail view** — each exercise renders on its own 3D body with primary (red) and secondary (orange) muscles highlighted, plus step-by-step instructions
- **190 exercises** — chest, back, lats, traps, lower back, shoulders, biceps, triceps, forearms, abs, obliques, glutes, quads, hamstrings, calves, full body, cardio
- **Search & filters** — by muscle, equipment (barbell, dumbbell, cable, machine, bodyweight, kettlebell, band) and level
- **Favorites** — saved locally in your browser
- Drag to rotate, scroll to zoom, front/back views

## Run locally

Just open `index.html` in a browser (Three.js is vendored as `three.min.js`, no build step).

## Data

`build-data.mjs` generates `exercises.js` (run `node build-data.mjs` after editing the catalog).

*Sample training content — not medical advice.*

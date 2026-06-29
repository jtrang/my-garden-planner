# 3D Garden Planner — MVP

A single-page 3D editor where you model your garden to scale, position the sun, place planters, and drop in stylized plants.

## Visual direction

- Clean, diagrammatic aesthetic — think architectural site plan meets low-poly 3D.
- Warm neutral palette: soft cream background, sage/olive greens for foliage, terracotta for pots, soft yellow sun.
- Typography: Outfit (UI headings) + Inter (body/numbers), via @fontsource.
- Left sidebar = tool palette + object library. Right sidebar = inspector (dimensions, rotation, plant info). Top bar = unit toggle (m/cm ↔ ft/in), sun time-of-day slider, reset view, clear all. Bottom = small help strip with hotkeys.

## Core features (MVP)

1. **Garden ground** — rectangular plot. Editable width & depth via inspector. Grid overlay at 1-unit and 10-unit lines, scale ruler in the corner.
2. **Sunlight** — directional light representing the sun. Time-of-day slider (06:00–20:00) moves the sun along an arc; shadows update live. A small sun gizmo shows the source. (No latitude/date math in MVP — single arc.)
3. **Planters** — add rectangular or circular planters. Resize (width/depth/height or radius/height) numerically and via drag handles. Move + rotate (Y axis). Terracotta material.
4. **Plant library** (6 stylized low-poly plants, all procedurally built in three.js so no asset downloads):
   - Tomato (staked), Basil (bushy), Lavender, Strawberry, Pepper, Small fruit tree.
   Each has a realistic mature footprint + height. Drag from library onto a planter; plant snaps to the planter's soil surface. Plants in pots move with the pot.
5. **Selection & manipulation** — click to select; transform handles for move/rotate; numeric inputs in the inspector for exact dimensions; Delete key removes.
6. **Camera** — orbit/pan/zoom (OrbitControls). Buttons for Top, Front, Perspective views.
7. **Units toggle** — switches all inspector inputs and ruler labels between metric (m, cm) and imperial (ft, in). Internal model stays in meters.
8. **Local persistence** — auto-save scene to localStorage; "Clear all" button to reset.

## Technical approach

- **Stack:** three.js + @react-three/fiber + @react-three/drei (OrbitControls, TransformControls, shadows, Html labels). Zustand for scene state. Existing TanStack Start + Tailwind + shadcn.
- **Scene state (Zustand):**
  - `garden: { width, depth }`
  - `sun: { timeOfDay }` → computed light position
  - `planters: [{ id, shape, dims, position, rotation }]`
  - `plants: [{ id, species, plantedInId|null, position, rotation, scale }]`
  - `units: 'metric' | 'imperial'`
  - `selectedId`
- **Plant meshes:** small factory functions returning `<group>` of primitives (cylinders, spheres, cones) with sage/olive materials. Each has a `footprintRadius` and `height` in meters for to-scale rendering.
- **Snapping:** when a plant is dropped within a planter's XZ bounds, set `plantedInId` and lock Y to soil level (planter height − 2cm).
- **Shadows:** PCFSoftShadowMap, single directional light casts shadows on the ground plane and planters.
- **Unit conversion utility:** `formatLength(meters, units)` and `parseLength(input, units)` for inspector inputs.
- **Persistence:** subscribe to Zustand store, debounce-write JSON to localStorage; hydrate on mount.

## Routes & files

- `src/routes/index.tsx` — replaces placeholder, renders the editor (full-viewport `<Canvas>` + UI overlays).
- `src/routes/__root.tsx` — update title + meta to "Garden Planner — design your garden to scale".
- `src/components/garden/Scene.tsx` — Canvas, lights, ground, sun gizmo.
- `src/components/garden/Planter.tsx`, `Plant.tsx`, `Sun.tsx`, `Ground.tsx`.
- `src/components/garden/plants/` — one file per species returning a `<group>`.
- `src/components/garden/ui/Toolbar.tsx`, `Inspector.tsx`, `PlantLibrary.tsx`, `SunControl.tsx`.
- `src/lib/garden/store.ts` — Zustand store + localStorage persistence.
- `src/lib/garden/units.ts` — conversion helpers.
- `src/lib/garden/plants-catalog.ts` — species metadata (name, mature size, color).

## Dependencies to add

`three`, `@react-three/fiber`, `@react-three/drei`, `zustand`, `@fontsource/outfit`, `@fontsource/inter`.

## Out of scope for this MVP (can add later)

Custom garden polygon shape, latitude/date sun path, sunlight-hour heatmap, more plants, cloud save, export.

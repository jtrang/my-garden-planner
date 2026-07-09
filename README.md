# 3D Garden Planner

Design your garden to scale in the browser. Model the plot shape, position the sun through the day, place planters, drop stylized plants into them, and build walls, fences, and roofs — all in a live 3D scene with soft shadows, drag-to-move, and edge-drag resizing.

Built with TanStack Start (React 19 + Vite 7), Three.js via `@react-three/fiber` and `@react-three/drei`, Zustand for scene state, Tailwind v4, and shadcn/ui.

## Features

- **Rectangular plot** with editable width/depth, cardinal direction labels (N/S/E/W), and swappable ground: solid color (with palette + custom picker) or wood deck / concrete / grass skins.
- **Sun** on a time-of-day arc (06:00–20:00) driving a directional light with soft shadows.
- **Planters** — rectangular or circular terracotta pots. Numeric inspector, edge-drag resize, drag-to-move, collision-checked so they can't overlap.
- **Plants** (stylized low-poly, procedurally built and seeded per instance): Tomato, Basil, Bush beans, Strawberry, Pepper, Romaine. Plants can only be placed inside a planter, snap to soil level, and move with their planter.
- **Structures** — masonry walls, wood fences, glass fences with metal railings (glass panels let through ~65% of light for faint shadows), and roofs that snap to and stay attached to a wall (bidirectional length sync).
- **Ghost placement preview** with red overlap / invalid indicator before commit.
- **Units toggle** between metric and imperial; internal model stays in meters.
- **Local persistence** via `localStorage` and a Clear All action.
- **MCP server** exposing `list_plants`, `get_plant`, `planter_capacity`, and `sun_exposure_guide` tools for AI agents.

## Run locally

Prerequisites: [Bun](https://bun.sh) (recommended) or Node.js 20+.

```bash
# 1. Install dependencies
bun install

# 2. Start the dev server (Vite on http://localhost:8080)
bun run dev
```

Then open http://localhost:8080.

### Other scripts

```bash
bun run build       # production build
bun run build:dev   # development-mode build
bun run preview     # preview the production build
bun run lint        # eslint
bun run format      # prettier --write .
```

If you prefer npm/pnpm/yarn, substitute the package manager — the scripts are identical (`npm run dev`, etc.).

## Controls

- **Orbit / pan / zoom**: left drag / right drag / scroll.
- **Camera presets**: 3D, Top, Front buttons in the toolbar.
- **Add object**: click a planter, structure, or plant in the left library, then click in the scene to place. The ghost preview turns red when placement is invalid (overlap, or plant outside a planter).
- **Move**: click and drag any placed object along the ground.
- **Resize**: select an object and drag the blue handles on its edges.
- **Inspector** (right panel): precise numeric dimensions, position, rotation, and ground styling.
- **Delete**: select an object and press <kbd>Delete</kbd> or <kbd>Backspace</kbd>.

## Project layout

```
src/
  routes/                      TanStack Start file-based routes
    __root.tsx                 App shell + head metadata
    index.tsx                  Editor page (Canvas + UI overlays)
    [.mcp]/                    MCP HTTP endpoints
  components/garden/
    Scene.tsx                  R3F Canvas, lights, camera
    Ground.tsx                 Plot + procedural skins + N/S/E/W labels
    Sun.tsx                    Directional light on a time-of-day arc
    Planter.tsx, Plant.tsx     Placed objects with drag-to-move
    Structure.tsx              Walls, fences, roofs
    PlacementPreview.tsx       Ghost preview + validity check
    ResizeHandles.tsx          Edge-drag resize handles
    plants/PlantModels.tsx     Procedural low-poly plant meshes
    ui/                        Toolbar, PlantLibrary, Inspector
  lib/garden/
    store.ts                   Zustand store + localStorage persistence
    plants-catalog.ts          Species metadata (mature size, sunlight)
    collision.ts               Overlap + wall-snap helpers
    units.ts                   Metric/imperial conversion
  lib/mcp/                     MCP tools exposed to AI agents
```

## Tech stack

TanStack Start v1 · React 19 · Vite 7 · Three.js · @react-three/fiber · @react-three/drei · Zustand · Tailwind CSS v4 · shadcn/ui · TypeScript.

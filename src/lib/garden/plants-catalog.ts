export type PlantSpecies =
  | "tomato"
  | "basil"
  | "bushBeans"
  | "strawberry"
  | "pepper"
  | "romaine";

export interface PlantSpec {
  id: PlantSpecies;
  name: string;
  // mature size in meters
  footprintRadius: number;
  height: number;
  foliage: string;
  accent: string;
  description: string;
}

export const PLANT_CATALOG: Record<PlantSpecies, PlantSpec> = {
  tomato: {
    id: "tomato",
    name: "Tomato",
    footprintRadius: 0.3,
    height: 1.6,
    foliage: "#6b8e4e",
    accent: "#d94a3a",
    description: "Staked indeterminate tomato.",
  },
  basil: {
    id: "basil",
    name: "Basil",
    footprintRadius: 0.18,
    height: 0.45,
    foliage: "#7aa05a",
    accent: "#7aa05a",
    description: "Bushy culinary herb.",
  },
  bushBeans: {
    id: "bushBeans",
    name: "Bush beans",
    footprintRadius: 0.22,
    height: 0.5,
    foliage: "#6d8f4a",
    accent: "#c8b96a",
    description: "Compact bush bean plant with hanging pods.",
  },
  strawberry: {
    id: "strawberry",
    name: "Strawberry",
    footprintRadius: 0.22,
    height: 0.2,
    foliage: "#6b8e4e",
    accent: "#d94a3a",
    description: "Low groundcover fruit.",
  },
  pepper: {
    id: "pepper",
    name: "Pepper",
    footprintRadius: 0.25,
    height: 0.7,
    foliage: "#5f8048",
    accent: "#e8a93a",
    description: "Bell or chili pepper.",
  },
  romaine: {
    id: "romaine",
    name: "Romaine lettuce",
    footprintRadius: 0.18,
    height: 0.3,
    foliage: "#8fb15a",
    accent: "#c9dc8a",
    description: "Upright romaine lettuce head.",
  },
};

export const PLANT_LIST = Object.values(PLANT_CATALOG);

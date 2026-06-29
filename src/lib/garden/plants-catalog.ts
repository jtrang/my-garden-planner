export type PlantSpecies =
  | "tomato"
  | "basil"
  | "lavender"
  | "strawberry"
  | "pepper"
  | "fruitTree";

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
  lavender: {
    id: "lavender",
    name: "Lavender",
    footprintRadius: 0.35,
    height: 0.6,
    foliage: "#8aa67a",
    accent: "#9b86c4",
    description: "Mediterranean perennial.",
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
  fruitTree: {
    id: "fruitTree",
    name: "Dwarf fruit tree",
    footprintRadius: 1.0,
    height: 2.8,
    foliage: "#6b8c52",
    accent: "#d94a3a",
    description: "Dwarf apple or citrus.",
  },
};

export const PLANT_LIST = Object.values(PLANT_CATALOG);

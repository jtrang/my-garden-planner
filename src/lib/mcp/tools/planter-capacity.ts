import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PLANT_CATALOG, type PlantSpecies } from "@/lib/garden/plants-catalog";

const species = z.enum([
  "tomato",
  "basil",
  "lavender",
  "strawberry",
  "pepper",
  "fruitTree",
]);

export default defineTool({
  name: "planter_capacity",
  title: "Estimate planter capacity",
  description:
    "Estimate how many plants of a given species comfortably fit in a rectangular or circular planter, using the plant's mature footprint. All dimensions are in meters.",
  inputSchema: {
    shape: z.enum(["rect", "circle"]).describe("Planter shape."),
    width: z
      .number()
      .positive()
      .describe("For rect: width in meters. For circle: radius in meters."),
    depth: z
      .number()
      .positive()
      .optional()
      .describe("Rect only: depth in meters."),
    species,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ shape, width, depth, species }) => {
    const spec = PLANT_CATALOG[species as PlantSpecies];
    const r = spec.footprintRadius;
    const plantArea = Math.PI * r * r;
    const planterArea =
      shape === "circle" ? Math.PI * width * width : width * (depth ?? width);
    // 70% packing efficiency for spacing/access
    const count = Math.max(0, Math.floor((planterArea * 0.7) / plantArea));
    const result = {
      species: spec.name,
      footprintRadius: r,
      plantArea: +plantArea.toFixed(3),
      planterArea: +planterArea.toFixed(3),
      recommendedCount: count,
    };
    return {
      content: [
        {
          type: "text",
          text: `About ${count} ${spec.name.toLowerCase()} plant(s) fit in this planter.`,
        },
      ],
      structuredContent: result,
    };
  },
});

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
  name: "get_plant",
  title: "Get plant details",
  description:
    "Return mature size and description for one plant species in the Garden Planner catalog.",
  inputSchema: {
    species: species.describe("Plant species id, e.g. tomato, basil, lavender."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ species }) => {
    const spec = PLANT_CATALOG[species as PlantSpecies];
    return {
      content: [{ type: "text", text: JSON.stringify(spec, null, 2) }],
      structuredContent: spec,
    };
  },
});

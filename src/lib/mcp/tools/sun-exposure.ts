import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const SUN_NEEDS: Record<string, { hours: string; note: string }> = {
  tomato: { hours: "6-8+", note: "Full sun; more sun = more fruit." },
  basil: { hours: "6+", note: "Full sun; tolerates light afternoon shade." },
  lavender: { hours: "6-8+", note: "Full sun; needs dry, well-drained soil." },
  strawberry: { hours: "6-10", note: "Full sun for best yields." },
  pepper: { hours: "6-8", note: "Full sun and warmth." },
  fruitTree: { hours: "6-8", note: "Full sun for fruit set." },
};

export default defineTool({
  name: "sun_exposure_guide",
  title: "Sun exposure guide",
  description:
    "Return recommended daily sunlight hours for a Garden Planner plant species.",
  inputSchema: {
    species: z
      .enum(["tomato", "basil", "lavender", "strawberry", "pepper", "fruitTree"])
      .describe("Plant species id."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ species }) => {
    const info = SUN_NEEDS[species];
    return {
      content: [
        { type: "text", text: `${species}: ${info.hours} hours/day — ${info.note}` },
      ],
      structuredContent: { species, ...info },
    };
  },
});

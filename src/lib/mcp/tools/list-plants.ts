import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { PLANT_LIST } from "@/lib/garden/plants-catalog";

export default defineTool({
  name: "list_plants",
  title: "List plant catalog",
  description:
    "List all stylized plant species available in the Garden Planner, with mature footprint and height in meters.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(PLANT_LIST, null, 2) }],
    structuredContent: { plants: PLANT_LIST },
  }),
});

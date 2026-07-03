import { defineMcp } from "@lovable.dev/mcp-js";
import listPlants from "./tools/list-plants";
import getPlant from "./tools/get-plant";
import planterCapacity from "./tools/planter-capacity";
import sunExposure from "./tools/sun-exposure";

export default defineMcp({
  name: "garden-planner-mcp",
  title: "Garden Planner MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Garden Planner app. Use these to browse the stylized plant catalog, look up mature sizes and sun needs, and estimate how many plants of a species fit in a rectangular or circular planter. All dimensions are in meters.",
  tools: [listPlants, getPlant, planterCapacity, sunExposure],
});

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useGarden } from "@/lib/garden/store";
import { Scene } from "@/components/garden/Scene";
import { Toolbar } from "@/components/garden/ui/Toolbar";
import { PlantLibrary } from "@/components/garden/ui/PlantLibrary";
import { Inspector } from "@/components/garden/ui/Inspector";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Garden Planner — design your garden to scale" },
      {
        name: "description",
        content:
          "A 3D, to-scale garden planning tool. Model your plot, planters, sunlight, and plants in real dimensions.",
      },
      { property: "og:title", content: "Garden Planner — design your garden to scale" },
      {
        property: "og:description",
        content: "Plan planters, plants, and sun exposure in a real-scale 3D garden editor.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  const deleteSelected = useGarden((s) => s.deleteSelected);

  useEffect(() => {
    setMounted(true);
    // hydrate persisted store on client
    void useGarden.persist.rehydrate();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && !(e.target instanceof HTMLInputElement)) {
        deleteSelected();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteSelected]);

  return (
    <div className="flex h-screen w-screen flex-col bg-stone-100 text-stone-800">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <PlantLibrary />
        <main className="relative flex-1">
          {mounted ? (
            <Scene />
          ) : (
            <div className="flex h-full items-center justify-center text-stone-500">
              Loading 3D editor…
            </div>
          )}
        </main>
        <Inspector />
      </div>
    </div>
  );
}

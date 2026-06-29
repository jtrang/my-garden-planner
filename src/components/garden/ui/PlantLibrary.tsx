import { useGarden } from "@/lib/garden/store";
import { PLANT_LIST } from "@/lib/garden/plants-catalog";
import { formatLength } from "@/lib/garden/units";

export function PlantLibrary() {
  const addPlanter = useGarden((s) => s.addPlanter);
  const addPlant = useGarden((s) => s.addPlant);
  const units = useGarden((s) => s.units);
  const transformMode = useGarden((s) => s.transformMode);
  const setTransformMode = useGarden((s) => s.setTransformMode);

  return (
    <aside className="flex w-64 flex-col gap-4 border-r border-stone-300 bg-stone-50 p-3 overflow-y-auto">
      <section>
        <h2 className="mb-2 font-display text-xs font-semibold uppercase tracking-wider text-stone-500">
          Tools
        </h2>
        <div className="flex gap-1 rounded-md border border-stone-300 bg-white p-0.5 text-xs">
          <button
            onClick={() => setTransformMode("translate")}
            className={`flex-1 rounded px-2 py-1 ${transformMode === "translate" ? "bg-stone-800 text-white" : "text-stone-600"}`}
          >
            Move
          </button>
          <button
            onClick={() => setTransformMode("rotate")}
            className={`flex-1 rounded px-2 py-1 ${transformMode === "rotate" ? "bg-stone-800 text-white" : "text-stone-600"}`}
          >
            Rotate
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-display text-xs font-semibold uppercase tracking-wider text-stone-500">
          Add planter
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => addPlanter("rect")}
            className="flex flex-col items-center gap-1 rounded-md border border-stone-300 bg-white p-3 text-xs text-stone-700 hover:border-stone-500 hover:bg-stone-100"
          >
            <div className="h-10 w-12 rounded-sm bg-[#b5613a]" />
            Rectangular
          </button>
          <button
            onClick={() => addPlanter("circle")}
            className="flex flex-col items-center gap-1 rounded-md border border-stone-300 bg-white p-3 text-xs text-stone-700 hover:border-stone-500 hover:bg-stone-100"
          >
            <div className="h-10 w-10 rounded-full bg-[#b5613a]" />
            Circular
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-display text-xs font-semibold uppercase tracking-wider text-stone-500">
          Plants
        </h2>
        <p className="mb-2 text-[11px] text-stone-500">
          Click to add. If a planter is selected, the plant will be placed inside it.
        </p>
        <div className="flex flex-col gap-1.5">
          {PLANT_LIST.map((p) => (
            <button
              key={p.id}
              onClick={() => addPlant(p.id)}
              className="flex items-center gap-3 rounded-md border border-stone-300 bg-white p-2 text-left text-xs hover:border-stone-500 hover:bg-stone-100"
            >
              <div
                className="h-8 w-8 shrink-0 rounded-full"
                style={{ background: p.foliage }}
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-stone-800">{p.name}</div>
                <div className="text-[10px] text-stone-500">
                  ⌀ {formatLength(p.footprintRadius * 2, units)} · h {formatLength(p.height, units)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}

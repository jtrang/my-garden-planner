import { useGarden } from "@/lib/garden/store";
import { PLANT_LIST } from "@/lib/garden/plants-catalog";
import { formatLength } from "@/lib/garden/units";

export function PlantLibrary() {
  const startPlacement = useGarden((s) => s.startPlacement);
  const cancelPlacement = useGarden((s) => s.cancelPlacement);
  const pending = useGarden((s) => s.pending);
  const units = useGarden((s) => s.units);
  const transformMode = useGarden((s) => s.transformMode);
  const setTransformMode = useGarden((s) => s.setTransformMode);

  const isPending = (test: (p: NonNullable<typeof pending>) => boolean) =>
    !!pending && test(pending);

  const activeCls = "ring-2 ring-stone-800 bg-stone-100";

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

      {pending && (
        <div className="rounded-md border border-stone-400 bg-stone-100 p-2 text-[11px] text-stone-700">
          <div className="mb-1 font-medium text-stone-800">Placement mode</div>
          Hover over the garden and click to place. Press{" "}
          <kbd className="rounded border border-stone-400 bg-white px-1">Esc</kbd>{" "}
          to cancel.
          <button
            onClick={cancelPlacement}
            className="mt-2 w-full rounded border border-stone-400 bg-white px-2 py-1 hover:bg-stone-200"
          >
            Cancel
          </button>
        </div>
      )}

      <section>
        <h2 className="mb-2 font-display text-xs font-semibold uppercase tracking-wider text-stone-500">
          Add planter
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => startPlacement({ kind: "planter", shape: "rect" })}
            className={`flex flex-col items-center gap-1 rounded-md border border-stone-300 bg-white p-3 text-xs text-stone-700 hover:border-stone-500 hover:bg-stone-100 ${isPending((p) => p.kind === "planter" && p.shape === "rect") ? activeCls : ""}`}
          >
            <div className="h-10 w-12 rounded-sm bg-[#b5613a]" />
            Rectangular
          </button>
          <button
            onClick={() => startPlacement({ kind: "planter", shape: "circle" })}
            className={`flex flex-col items-center gap-1 rounded-md border border-stone-300 bg-white p-3 text-xs text-stone-700 hover:border-stone-500 hover:bg-stone-100 ${isPending((p) => p.kind === "planter" && p.shape === "circle") ? activeCls : ""}`}
          >
            <div className="h-10 w-10 rounded-full bg-[#b5613a]" />
            Circular
          </button>
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-display text-xs font-semibold uppercase tracking-wider text-stone-500">
          Walls &amp; fences
        </h2>
        <div className="flex flex-col gap-1.5">
          <StructureButton
            variant="wall"
            label="Wall"
            sub="Solid masonry"
            preview={<div className="h-6 w-8 rounded-sm bg-[#cfc4ac] border-t-2 border-[#b3a785]" />}
            active={isPending((p) => p.kind === "structure" && p.variant === "wall")}
            onClick={() => startPlacement({ kind: "structure", variant: "wall" })}
          />
          <StructureButton
            variant="fenceWood"
            label="Wood fence"
            sub="Pickets on posts"
            preview={
              <div className="flex h-6 w-8 items-end gap-[2px]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-full flex-1 rounded-sm bg-[#8a5a34]" />
                ))}
              </div>
            }
            active={isPending((p) => p.kind === "structure" && p.variant === "fenceWood")}
            onClick={() => startPlacement({ kind: "structure", variant: "fenceWood" })}
          />
          <StructureButton
            variant="fenceGlass"
            label="Glass fence"
            sub="Metal posts + glass"
            preview={
              <div className="flex h-6 w-8 items-stretch gap-[2px]">
                <div className="w-[2px] bg-[#8a8f96]" />
                <div className="flex-1 rounded-sm bg-[#c8dbe4]/70 border border-[#8a8f96]" />
                <div className="w-[2px] bg-[#8a8f96]" />
              </div>
            }
            active={isPending((p) => p.kind === "structure" && p.variant === "fenceGlass")}
            onClick={() => startPlacement({ kind: "structure", variant: "fenceGlass" })}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-display text-xs font-semibold uppercase tracking-wider text-stone-500">
          Plants
        </h2>
        <p className="mb-2 text-[11px] text-stone-500">
          Click a plant, then hover over the garden or a planter and click to drop it.
        </p>
        <div className="flex flex-col gap-1.5">
          {PLANT_LIST.map((p) => (
            <button
              key={p.id}
              onClick={() => startPlacement({ kind: "plant", species: p.id })}
              className={`flex items-center gap-3 rounded-md border border-stone-300 bg-white p-2 text-left text-xs hover:border-stone-500 hover:bg-stone-100 ${isPending((pp) => pp.kind === "plant" && pp.species === p.id) ? activeCls : ""}`}
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

function StructureButton({
  label,
  sub,
  preview,
  active,
  onClick,
}: {
  variant: string;
  label: string;
  sub: string;
  preview: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-md border border-stone-300 bg-white p-2 text-left text-xs hover:border-stone-500 hover:bg-stone-100 ${active ? "ring-2 ring-stone-800 bg-stone-100" : ""}`}
    >
      <div className="flex h-8 w-10 items-center justify-center rounded bg-stone-50">
        {preview}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-stone-800">{label}</div>
        <div className="text-[10px] text-stone-500">{sub}</div>
      </div>
    </button>
  );
}



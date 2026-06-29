import { useGarden } from "@/lib/garden/store";
import { PLANT_CATALOG } from "@/lib/garden/plants-catalog";
import { displayToMeters, metersToDisplay, unitLabel } from "@/lib/garden/units";
import { Button } from "@/components/ui/button";

export function Inspector() {
  const selectedId = useGarden((s) => s.selectedId);
  const planters = useGarden((s) => s.planters);
  const plants = useGarden((s) => s.plants);
  const garden = useGarden((s) => s.garden);
  const setGarden = useGarden((s) => s.setGarden);
  const updatePlanter = useGarden((s) => s.updatePlanter);
  const deleteSelected = useGarden((s) => s.deleteSelected);
  const units = useGarden((s) => s.units);
  const ul = unitLabel(units);

  const planter = planters.find((p) => p.id === selectedId);
  const plant = plants.find((p) => p.id === selectedId);

  return (
    <aside className="flex w-72 flex-col gap-4 border-l border-stone-300 bg-stone-50 p-3 overflow-y-auto">
      <section>
        <h2 className="mb-2 font-display text-xs font-semibold uppercase tracking-wider text-stone-500">
          Garden
        </h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <NumField
            label={`Width (${units === "metric" ? "m" : "ft"})`}
            value={units === "metric" ? garden.width : +(garden.width * 3.28084).toFixed(2)}
            step={units === "metric" ? 0.1 : 0.5}
            onChange={(v) => setGarden({ ...garden, width: units === "metric" ? v : v / 3.28084 })}
          />
          <NumField
            label={`Depth (${units === "metric" ? "m" : "ft"})`}
            value={units === "metric" ? garden.depth : +(garden.depth * 3.28084).toFixed(2)}
            step={units === "metric" ? 0.1 : 0.5}
            onChange={(v) => setGarden({ ...garden, depth: units === "metric" ? v : v / 3.28084 })}
          />
        </div>
      </section>

      {!planter && !plant && (
        <div className="rounded-md border border-dashed border-stone-300 bg-white p-4 text-center text-xs text-stone-500">
          Select a planter or plant to edit its dimensions and position.
        </div>
      )}

      {planter && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-stone-500">
              {planter.shape === "rect" ? "Rectangular planter" : "Circular planter"}
            </h2>
            <Button variant="ghost" size="sm" onClick={deleteSelected} className="h-6 text-xs text-red-600">
              Delete
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {planter.shape === "rect" ? (
              <>
                <NumField
                  label={`Width (${ul})`}
                  value={metersToDisplay(planter.width, units)}
                  step={units === "metric" ? 5 : 1}
                  onChange={(v) => updatePlanter(planter.id, { width: displayToMeters(v, units) })}
                />
                <NumField
                  label={`Depth (${ul})`}
                  value={metersToDisplay(planter.depth, units)}
                  step={units === "metric" ? 5 : 1}
                  onChange={(v) => updatePlanter(planter.id, { depth: displayToMeters(v, units) })}
                />
              </>
            ) : (
              <NumField
                label={`Diameter (${ul})`}
                value={metersToDisplay(planter.width * 2, units)}
                step={units === "metric" ? 5 : 1}
                onChange={(v) => updatePlanter(planter.id, { width: displayToMeters(v, units) / 2 })}
              />
            )}
            <NumField
              label={`Height (${ul})`}
              value={metersToDisplay(planter.height, units)}
              step={units === "metric" ? 5 : 1}
              onChange={(v) => updatePlanter(planter.id, { height: displayToMeters(v, units) })}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <NumField
              label="X position (m)"
              value={+planter.position[0].toFixed(2)}
              step={0.1}
              onChange={(v) => updatePlanter(planter.id, { position: [v, 0, planter.position[2]] })}
            />
            <NumField
              label="Z position (m)"
              value={+planter.position[2].toFixed(2)}
              step={0.1}
              onChange={(v) => updatePlanter(planter.id, { position: [planter.position[0], 0, v] })}
            />
          </div>
          <NumField
            label="Rotation (°)"
            value={+((planter.rotationY * 180) / Math.PI).toFixed(0)}
            step={5}
            onChange={(v) => updatePlanter(planter.id, { rotationY: (v * Math.PI) / 180 })}
          />
        </section>
      )}

      {plant && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-stone-500">
              {PLANT_CATALOG[plant.species].name}
            </h2>
            <Button variant="ghost" size="sm" onClick={deleteSelected} className="h-6 text-xs text-red-600">
              Delete
            </Button>
          </div>
          <p className="mb-2 text-xs text-stone-600">{PLANT_CATALOG[plant.species].description}</p>
          <dl className="space-y-1 rounded-md bg-white p-2 text-xs">
            <Row k="Mature spread" v={`Ø ${(PLANT_CATALOG[plant.species].footprintRadius * 2).toFixed(2)} m`} />
            <Row k="Mature height" v={`${PLANT_CATALOG[plant.species].height.toFixed(2)} m`} />
            <Row
              k="In planter"
              v={plant.plantedInId ? "Yes" : "Free placed"}
            />
            <Row
              k="Position"
              v={`x ${plant.position[0].toFixed(2)}, z ${plant.position[2].toFixed(2)}`}
            />
          </dl>
        </section>
      )}

      <div className="mt-auto rounded-md border border-stone-200 bg-white p-2 text-[11px] text-stone-500">
        <strong className="block text-stone-700">Tips</strong>
        Drag the colored arrows to move. Switch to Rotate for the green ring. Press <kbd className="rounded border px-1">Delete</kbd> to remove the selection. Drag a plant inside a planter's footprint to snap it in.
      </div>
    </aside>
  );
}

function NumField({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 col-span-1">
      <span className="text-[10px] uppercase tracking-wider text-stone-500">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!Number.isNaN(v)) onChange(v);
        }}
        className="rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800 focus:border-stone-500 focus:outline-none"
      />
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-stone-500">{k}</span>
      <span className="text-stone-800">{v}</span>
    </div>
  );
}

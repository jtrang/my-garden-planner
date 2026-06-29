import { useGarden } from "@/lib/garden/store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export function Toolbar() {
  const units = useGarden((s) => s.units);
  const setUnits = useGarden((s) => s.setUnits);
  const sunTime = useGarden((s) => s.sunTime);
  const setSunTime = useGarden((s) => s.setSunTime);
  const cameraView = useGarden((s) => s.cameraView);
  const setCameraView = useGarden((s) => s.setCameraView);
  const clearAll = useGarden((s) => s.clearAll);

  const hours = Math.floor(sunTime);
  const mins = Math.round((sunTime - hours) * 60);
  const timeLabel = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

  return (
    <div className="flex items-center justify-between gap-4 border-b border-stone-300 bg-stone-50/95 px-4 py-2 backdrop-blur">
      <div className="flex items-center gap-2">
        <h1 className="font-display text-lg font-semibold text-stone-800">Garden Planner</h1>
        <span className="text-xs text-stone-500">to-scale 3D layout</span>
      </div>

      <div className="flex flex-1 items-center justify-center gap-3 max-w-md">
        <span className="text-xs font-medium text-stone-600">☀ {timeLabel}</span>
        <Slider
          value={[sunTime]}
          min={6}
          max={20}
          step={0.25}
          onValueChange={(v) => setSunTime(v[0])}
          className="flex-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-md border border-stone-300 bg-white text-xs">
          {(["perspective", "top", "front"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setCameraView(v)}
              className={`px-2 py-1 capitalize ${cameraView === v ? "bg-stone-800 text-white" : "text-stone-600"}`}
            >
              {v === "perspective" ? "3D" : v}
            </button>
          ))}
        </div>
        <div className="flex rounded-md border border-stone-300 bg-white text-xs">
          <button
            onClick={() => setUnits("metric")}
            className={`px-2 py-1 ${units === "metric" ? "bg-stone-800 text-white" : "text-stone-600"}`}
          >
            m/cm
          </button>
          <button
            onClick={() => setUnits("imperial")}
            className={`px-2 py-1 ${units === "imperial" ? "bg-stone-800 text-white" : "text-stone-600"}`}
          >
            ft/in
          </button>
        </div>
        <Button variant="outline" size="sm" onClick={() => {
          if (confirm("Clear the entire garden?")) clearAll();
        }}>
          Clear
        </Button>
      </div>
    </div>
  );
}

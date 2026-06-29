export type Units = "metric" | "imperial";

const M_TO_FT = 3.28084;

export function formatLength(meters: number, units: Units): string {
  if (units === "metric") {
    if (Math.abs(meters) < 1) return `${(meters * 100).toFixed(0)} cm`;
    return `${meters.toFixed(2)} m`;
  }
  const ft = meters * M_TO_FT;
  const whole = Math.floor(ft);
  const inches = Math.round((ft - whole) * 12);
  if (whole === 0) return `${inches}"`;
  return inches === 0 ? `${whole}'` : `${whole}' ${inches}"`;
}

export function metersToDisplay(meters: number, units: Units): number {
  return units === "metric" ? +(meters * 100).toFixed(1) : +(meters * M_TO_FT * 12).toFixed(1);
}

export function displayToMeters(value: number, units: Units): number {
  return units === "metric" ? value / 100 : value / 12 / M_TO_FT;
}

export function unitLabel(units: Units): string {
  return units === "metric" ? "cm" : "in";
}

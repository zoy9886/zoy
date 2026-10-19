export type Save = {
  version: 1;
  name: string;
  helmet: string;
  x: number;
  y: number;
  seen: string[];
  quest: boolean;
  reward: boolean;
};
const KEY = "fengyu-site-v1";
export function load(): Save | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    return v?.version === 1 &&
      typeof v.name === "string" &&
      ["white", "blue"].includes(v.helmet) &&
      Array.isArray(v.seen) &&
      v.seen.every((s: unknown) => typeof s === "string") &&
      Number.isFinite(v.x) &&
      Number.isFinite(v.y) &&
      typeof v.quest === "boolean" &&
      typeof v.reward === "boolean"
      ? v
      : null;
  } catch {
    return null;
  }
}
export function save(v: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
    document.querySelector("#save-status")!.textContent = "✓ 進度已儲存";
  } catch {
    document.querySelector("#save-status")!.textContent =
      "儲存空間不可用 · 本次仍可遊玩";
  }
}

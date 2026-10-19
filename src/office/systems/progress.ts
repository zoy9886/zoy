export type EvidenceId = "blueprint" | "computer" | "model";
export type PlanningStatus =
  "locked" | "available" | "active" | "ready" | "complete";
export type Progress = {
  version: 2;
  name: string;
  x: number;
  y: number;
  hr: boolean;
  planning: PlanningStatus;
  inspected: EvidenceId[];
  items: string[];
  chapterComplete: boolean;
};
export const SAVE_KEY = "fengyu-office-v2";
export const evidenceIds: EvidenceId[] = ["blueprint", "computer", "model"];
export function fresh(name = ""): Progress {
  return {
    version: 2,
    name,
    x: 512,
    y: 925,
    hr: false,
    planning: "locked",
    inspected: [],
    items: [],
    chapterComplete: false,
  };
}
export function loadProgress(): Progress | null {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (
      s?.version !== 2 ||
      typeof s.name !== "string" ||
      !s.name.trim() ||
      s.name.length > 12 ||
      !Number.isFinite(s.x) ||
      !Number.isFinite(s.y) ||
      typeof s.hr !== "boolean" ||
      typeof s.chapterComplete !== "boolean" ||
      !["locked", "available", "active", "ready", "complete"].includes(
        s.planning,
      ) ||
      !Array.isArray(s.items) ||
      !s.items.every((i: unknown) => typeof i === "string") ||
      !Array.isArray(s.inspected) ||
      !s.inspected.every((i: EvidenceId) => evidenceIds.includes(i))
    )
      return null;
    if (new Set(s.inspected).size !== s.inspected.length) return null;
    if (s.hr && s.planning === "locked") return null;
    if (["locked", "available"].includes(s.planning) && s.inspected.length)
      return null;
    if (s.planning === "active" && s.inspected.length >= 3) return null;
    if (!s.hr && (s.planning !== "locked" || s.inspected.length)) return null;
    if (["ready", "complete"].includes(s.planning) && s.inspected.length !== 3)
      return null;
    if (s.chapterComplete && s.planning !== "complete") return null;
    return s;
  } catch {
    return null;
  }
}
export class ProgressStore {
  state: Progress;
  onChange = () => {};
  onNotice = (text: string) => {};
  storageAvailable = true;
  constructor() {
    this.state = loadProgress() || fresh();
  }
  begin(name: string) {
    this.state = fresh(name.trim().slice(0, 12));
    this.commit();
  }
  checkIn() {
    if (this.state.hr) return;
    this.state.hr = true;
    this.state.planning = "available";
    this.state.items.push("識別證", "安全帽", "實習手冊");
    this.commit();
    this.onNotice("報到完成 · 取得識別證、安全帽與實習手冊");
  }
  accept() {
    if (this.state.planning !== "available") return;
    this.state.planning = "active";
    this.commit();
    this.onNotice("任務接取 · 規劃室的三個線索");
  }
  inspect(id: EvidenceId) {
    if (this.state.planning !== "active" || this.state.inspected.includes(id))
      return;
    this.state.inspected.push(id);
    if (this.state.inspected.length === 3) this.state.planning = "ready";
    this.commit();
    this.onNotice(
      this.state.planning === "ready"
        ? "線索已齊全 · 回去找林以安交流"
        : `實習筆記新增 · ${this.state.inspected.length} / 3`,
    );
  }
  report() {
    if (this.state.planning !== "ready") return;
    this.state.planning = "complete";
    this.state.items.push("圖說協調便條");
    this.commit();
    this.onNotice("任務完成 · 取得圖說協調便條");
  }
  finishChapter() {
    if (this.state.planning !== "complete" || this.state.chapterComplete)
      return;
    this.state.chapterComplete = true;
    this.state.items.push("辦公室見習章");
    this.commit();
    this.onNotice("第一章完成 · 辦公室見習章已收進背包");
  }
  commit() {
    try {
      if (this.state.name)
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
      this.storageAvailable = true;
    } catch {
      this.storageAvailable = false;
    }
    this.onChange();
  }
}

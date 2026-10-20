import {
  freshChallenge,
  validChallenge,
  assess,
  verifiedReady,
  type ChallengeState,
  type ChallengeEvidence,
} from "./challengeModel";
export type EvidenceId = "blueprint" | "computer" | "model";
export type PlanningStatus =
  "locked" | "available" | "active" | "ready" | "complete";
export type SiteJob = "construction" | "safety" | "quality";
export const SITE_OBJECTIVES: Record<SiteJob, string[]> = {
  construction: ["rebar", "timber", "scaffold"],
  safety: ["opening", "extinguisher", "lane"],
  quality: ["quality", "pipe1", "bim"],
};
export type Progress = {
  challenge: ChallengeState;
  location: "office" | "site";
  siteTasks: Record<SiteJob, PlanningStatus>;
  siteSeen: string[];
  dayComplete: boolean;
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
    challenge: freshChallenge(),
    location: "office",
    siteTasks: {
      construction: "available",
      safety: "available",
      quality: "available",
    },
    siteSeen: [],
    dayComplete: false,
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
    // Additive migration: previously saved office progress and rewards remain intact.
    s.location ??= "office";
    s.siteTasks ??= {
      construction: "available",
      safety: "available",
      quality: "available",
    };
    s.siteSeen ??= [];
    s.dayComplete ??= false;
    if (
      !["office", "site"].includes(s.location) ||
      !Array.isArray(s.siteSeen) ||
      !s.siteSeen.every((id: unknown) => typeof id === "string") ||
      typeof s.dayComplete !== "boolean"
    )
      return null;
    if (s.location === "site" && (!s.hr || s.planning !== "complete"))
      return null;
    for (const [job, ids] of Object.entries(SITE_OBJECTIVES)) {
      const status = s.siteTasks[job];
      if (!["available", "active", "ready", "complete"].includes(status))
        return null;
      if (
        ["ready", "complete"].includes(status) &&
        !ids.every((id) => s.siteSeen.includes(id))
      )
        return null;
    }
    if (
      s.dayComplete &&
      !Object.values(s.siteTasks).every((v) => v === "complete")
    )
      return null;
    s.challenge ??= freshChallenge();
    if (!validChallenge(s.challenge)) s.challenge = freshChallenge();
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
  acceptSite(job: SiteJob) {
    if (this.state.siteTasks[job] !== "available") return;
    this.state.siteTasks[job] = "active";
    this.commit();
    this.onNotice("現場任務已接取 · 沿安全通道探索");
  }
  inspectSite(id: string) {
    for (const job of Object.keys(SITE_OBJECTIVES) as SiteJob[]) {
      if (
        this.state.siteTasks[job] !== "active" ||
        !SITE_OBJECTIVES[job].includes(id)
      )
        continue;
      if (!this.state.siteSeen.includes(id)) this.state.siteSeen.push(id);
      if (SITE_OBJECTIVES[job].every((v) => this.state.siteSeen.includes(v)))
        this.state.siteTasks[job] = "ready";
      this.commit();
      this.onNotice("觀察已記錄 · 完成後記得向負責人回報");
    }
  }
  reportSite(job: SiteJob) {
    if (this.state.siteTasks[job] !== "ready") return;
    this.state.siteTasks[job] = "complete";
    this.state.items.push(
      {
        construction: "施工觀察紀錄",
        safety: "職安巡檢紀錄",
        quality: "品質查驗紀錄",
      }[job],
    );
    this.commit();
    this.onNotice("現場任務完成 · 紀錄已收進背包");
  }
  finishDay() {
    if (
      !Object.values(this.state.siteTasks).every((v) => v === "complete") ||
      this.state.dayComplete
    )
      return;
    this.state.dayComplete = true;
    this.state.items.push("第一天實習紀念章");
    this.commit();
    this.onNotice("第一天實習完成 · 謝謝你帶著好奇走進現場");
  }
  startChallenge() {
    if (
      this.state.location !== "site" ||
      !this.state.hr ||
      this.state.planning !== "complete" ||
      this.state.siteTasks.construction === "available" ||
      this.state.challenge.status === "active"
    )
      return;
    const old = this.state.challenge;
    this.state.challenge = {
      ...freshChallenge(),
      status: "active",
      attempt: old.attempt + 1,
      history: old.history,
    };
    this.commit();
    this.onNotice("挑戰開始 · 澆置前的三方溝通");
  }
  observeChallenge(id: ChallengeEvidence) {
    const c = this.state.challenge;
    if (c.status !== "active" || c.evidence.includes(id)) return;
    c.evidence.push(id);
    this.commit();
    this.onNotice("挑戰依據已記錄 · " + c.evidence.length + "/3");
  }
  challengeWu(mode: "ask" | "assist" | "force") {
    const c = this.state.challenge;
    if (c.status !== "active") return;
    if (c.wu === "none") c.wu = mode;
    else if (c.wu === "force" && mode !== "force") c.wuRepaired = true;
    this.commit();
  }
  challengeChen(mode: "hold" | "review" | "rush") {
    const c = this.state.challenge;
    if (c.status !== "active") return;
    if (c.chen === "none") c.chen = mode;
    else if (c.chen === "rush" && mode !== "rush") c.chenCorrected = true;
    this.commit();
  }
  challengeLogistics() {
    if (this.state.challenge.status !== "active") return;
    this.state.challenge.logistics = true;
    this.commit();
  }
  submitChallenge(report: "verified" | "partial" | "assume") {
    const c = this.state.challenge;
    if (c.status !== "active" || (report === "verified" && !verifiedReady(c)))
      return;
    c.report = report;
    c.status = "complete";
    c.history = [...c.history, assess(c)].slice(-5);
    if (!this.state.items.includes("施工溝通評核紀錄"))
      this.state.items.push("施工溝通評核紀錄");
    this.commit();
    this.onNotice("施工挑戰完成 · 在手冊的「評核」查看結果");
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

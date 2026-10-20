export const CHALLENGE_EVIDENCE = ["drawing", "component", "support"] as const;
export type ChallengeEvidence = (typeof CHALLENGE_EVIDENCE)[number];
export type ChallengeCard = {
  name: string;
  points: number;
  max: number;
  reason: string;
};
export type ChallengeResult = {
  attempt: number;
  total: number;
  grade: string;
  cards: ChallengeCard[];
  feedback: string;
  report: "verified" | "partial" | "assume";
};
export type ChallengeState = {
  status: "available" | "active" | "complete";
  attempt: number;
  evidence: ChallengeEvidence[];
  wu: "none" | "ask" | "assist" | "force";
  wuRepaired: boolean;
  chen: "none" | "hold" | "review" | "rush";
  chenCorrected: boolean;
  logistics: boolean;
  report: "none" | "verified" | "partial" | "assume";
  history: ChallengeResult[];
};
export const evidenceLabels: Record<ChallengeEvidence, string> = {
  drawing: "核定 C 版圖說",
  component: "C3 構件與待查驗標示",
  support: "支撐調整待確認紀錄",
};
export function freshChallenge(): ChallengeState {
  return {
    status: "available",
    attempt: 0,
    evidence: [],
    wu: "none",
    wuRepaired: false,
    chen: "none",
    chenCorrected: false,
    logistics: false,
    report: "none",
    history: [],
  };
}
export function verifiedReady(c: ChallengeState) {
  return (
    c.evidence.length === 3 &&
    c.wu !== "none" &&
    (c.wu !== "force" || c.wuRepaired) &&
    c.chen !== "none" &&
    (c.chen !== "rush" || c.chenCorrected)
  );
}
export function assess(c: ChallengeState): ChallengeResult {
  const observation = c.evidence.length * 10;
  const judgment =
    c.report === "verified" && verifiedReady(c)
      ? 30
      : c.report === "partial"
        ? Math.min(
            24,
            c.evidence.length * 6 +
              (c.wu !== "none" && (c.wu !== "force" || c.wuRepaired) ? 6 : 0),
          )
        : 0;
  const safety =
    c.chen === "hold" || c.chen === "review"
      ? 25
      : c.chen === "rush" && c.chenCorrected
        ? 20
        : 0;
  const communication =
    (c.wu === "ask" || c.wu === "assist"
      ? 8
      : c.wu === "force"
        ? c.wuRepaired
          ? 6
          : 4
        : 0) + (c.report === "verified" || c.report === "partial" ? 7 : 0);
  const missing = CHALLENGE_EVIDENCE.filter(
    (id) => !c.evidence.includes(id),
  ).map((id) => evidenceLabels[id]);
  const cards = [
    {
      name: "觀察完整度",
      points: observation,
      max: 30,
      reason: missing.length
        ? `尚未記錄：${missing.join("、")}。`
        : "三項現場依據已實際調查，不因重複點擊加分。",
    },
    {
      name: "判斷與依據",
      points: judgment,
      max: 30,
      reason:
        c.report === "verified"
          ? "將 C3 位置、圖說版本與支撐待確認事項連結，交由負責人協調。"
          : c.report === "partial"
            ? "如實回報已知與缺口；尚未形成完整的三方核對紀錄。"
            : "未提出核對依據就判定可照舊作業，工程師已要求重新確認。",
    },
    {
      name: "安全處置",
      points: safety,
      max: 25,
      reason:
        safety === 25
          ? "先維持受影響工項待確認，請負責人核對計畫；不自行批准施工。"
          : safety === 20
            ? "原先提議先做，已在提醒後改為待確認；保留本次修正紀錄，扣 5 分。"
            : "未完成安全處置確認；不會實際放行作業，仍由工程師管制。",
    },
    {
      name: "溝通與回報",
      points: communication,
      max: 15,
      reason: `${c.wu === "force" ? (c.wuRepaired ? "曾直接下結論，後續已補問現況，溝通項扣 2 分。" : "尚未補問師傅的現況與版次。") : c.wu === "none" ? "尚未與鋼筋師傅核對現況。" : "有詢問現況，或請工程師協助一起釐清。"}${c.report === "verified" || c.report === "partial" ? "回報有區分事實與待確認事項。" : "回報未交代具體依據。"}`,
    },
  ];
  const total = cards.reduce((n, row) => n + row.points, 0),
    grade =
      total >= 90
        ? "S · 回報扎實"
        : total >= 75
          ? "A · 掌握重點"
          : total >= 60
            ? "B · 需要複核"
            : "C · 建議補查";
  return {
    attempt: c.attempt,
    total,
    grade,
    cards,
    report: c.report === "none" ? "partial" : c.report,
    feedback:
      total >= 90
        ? "你先聽工班說明，再用現場資料組織回報。這份紀錄能幫助負責人安排下一步，並不代表已取得施工放行。"
        : `下一次可先補齊${missing.length ? "「" + missing.join("、") + "」" : "三方訊息的核對"}，說清楚位置、版本、現況與待決事項；需要協助時，請工程師一起確認。`,
  };
}
export function validChallenge(value: unknown): value is ChallengeState {
  const c = value as ChallengeState;
  if (
    !c ||
    !["available", "active", "complete"].includes(c.status) ||
    !Number.isInteger(c.attempt) ||
    c.attempt < 0 ||
    !Array.isArray(c.evidence) ||
    new Set(c.evidence).size !== c.evidence.length ||
    !c.evidence.every((id) => CHALLENGE_EVIDENCE.includes(id)) ||
    !["none", "ask", "assist", "force"].includes(c.wu) ||
    typeof c.wuRepaired !== "boolean" ||
    !["none", "hold", "review", "rush"].includes(c.chen) ||
    typeof c.chenCorrected !== "boolean" ||
    typeof c.logistics !== "boolean" ||
    !["none", "verified", "partial", "assume"].includes(c.report) ||
    !Array.isArray(c.history) ||
    c.history.length > 5
  )
    return false;
  if (
    (c.status === "complete" && (c.report === "none" || !c.history.length)) ||
    (c.status !== "complete" && c.report !== "none")
  )
    return false;
  if (c.report === "verified" && !verifiedReady(c)) return false;
  if (c.status !== "available" && c.attempt < 1) return false;
  if (
    c.history.some(
      (r) =>
        !r ||
        !Number.isFinite(r.total) ||
        r.total < 0 ||
        r.total > 100 ||
        typeof r.grade !== "string" ||
        !Array.isArray(r.cards) ||
        r.cards.length !== 4 ||
        r.cards.some(
          (v) =>
            !v ||
            typeof v.name !== "string" ||
            !Number.isFinite(v.points) ||
            !Number.isFinite(v.max) ||
            v.points < 0 ||
            v.points > v.max ||
            typeof v.reason !== "string",
        ) ||
        r.total !== r.cards.reduce((n, v) => n + v.points, 0) ||
        !Number.isInteger(r.attempt) ||
        r.attempt < 1 ||
        typeof r.feedback !== "string",
    )
  )
    return false;
  return true;
}

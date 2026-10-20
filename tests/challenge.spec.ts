import { test, expect, type Page } from "@playwright/test";
import { read, walkTo, interact, finish } from "./helpers";
import {
  assess,
  freshChallenge,
  validChallenge,
} from "../src/office/systems/challengeModel";
async function seededSite(p: Page) {
  await p.goto("./");
  await p.locator("#new-game").waitFor();
  await p.evaluate(() =>
    localStorage.setItem(
      "fengyu-office-v2",
      JSON.stringify({
        version: 2,
        name: "工班見習生",
        x: 512,
        y: 752,
        location: "site",
        hr: true,
        planning: "complete",
        inspected: ["blueprint", "computer", "model"],
        items: [
          "識別證",
          "安全帽",
          "實習手冊",
          "圖說協調便條",
          "辦公室見習章",
          "施工觀察紀錄",
        ],
        chapterComplete: true,
        siteTasks: {
          construction: "complete",
          safety: "available",
          quality: "available",
        },
        siteSeen: ["rebar", "timber", "scaffold"],
        dayComplete: false,
      }),
    ),
  );
  await p.reload();
  await p.locator("#continue").click();
}
async function advance(p: Page) {
  while (
    (await p.locator("#dialogue").isVisible()) &&
    (await p.locator("#next").isVisible())
  )
    await p.locator("#next").click();
}
async function choose(p: Page, id: string) {
  await p.locator(`[data-choice="${id}"]`).click();
}
async function start(p: Page) {
  await walkTo(p, "master-wu");
  await interact(p);
  await choose(p, "start-challenge");
  await finish(p);
  expect((await read(p)).state.challenge.status).toBe("active");
}
async function finishReport(p: Page, mode: "verified" | "partial" | "assume") {
  await walkTo(p, "construction");
  await interact(p);
  await choose(p, `report-${mode}`);
  await advance(p);
  await choose(p, "confirm-submit");
  await expect(p.locator("#journal")).toBeVisible();
}
async function observeAll(p: Page) {
  for (const id of ["scaffold", "bim", "rebar"]) {
    await walkTo(p, id);
    await interact(p);
    await finish(p);
  }
  expect((await read(p)).state.challenge.evidence).toHaveLength(3);
}
test("worker dialogue and 100-point evidence-based report, persistence and fresh attempt", async ({
  page,
}) => {
  test.setTimeout(240000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await seededSite(page);
  expect((await read(page)).markers.sort()).toEqual([
    "construction",
    "quality-npc",
    "safety",
  ]);
  expect((await read(page)).state.challenge.status).toBe("available");
  await start(page);
  expect((await read(page)).markers).toContain("bim");
  await interact(page);
  await page.keyboard.press("e", { delay: 100 });
  await expect(page.locator('[data-choice="wu-ask"]')).toBeVisible();
  await expect(page.locator("#next")).toBeHidden();
  expect((await read(page)).state.challenge.wu).toBe("none");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/worker-choices.png",
    fullPage: true,
  });
  await choose(page, "wu-ask");
  await finish(page);
  expect((await read(page)).state.challenge.wu).toBe("ask");
  await walkTo(page, "master-zhou");
  await interact(page);
  await choose(page, "zhou-review");
  await finish(page);
  expect((await read(page)).worldFeedback.join(" ")).toContain(
    "支撐調整待確認",
  );
  await page.reload();
  await page.locator("#continue").click();
  expect((await read(page)).state.challenge.wu).toBe("ask");
  expect((await read(page)).state.challenge.chen).toBe("review");
  await walkTo(page, "construction");
  await interact(page);
  await expect(page.locator('[data-choice="report-verified"]')).toBeDisabled();
  await choose(page, "report-later");
  await observeAll(page);
  await walkTo(page, "logistics");
  await interact(page);
  await finish(page);
  expect((await read(page)).state.challenge.logistics).toBe(true);
  await finishReport(page, "verified");
  const c = (await read(page)).state.challenge;
  expect(c.history.at(-1).total).toBe(100);
  expect(c.history.at(-1).cards.map((r: any) => r.points)).toEqual([
    30, 30, 25, 15,
  ]);
  await expect(page.locator("#journal-content")).toContainText("100 / 100");
  await page.screenshot({
    path: "test-results/challenge-result.png",
    fullPage: true,
  });
  await page.locator("#journal-close").click();
  await page.reload();
  await page.locator("#continue").click();
  expect((await read(page)).state.challenge.history).toHaveLength(1);
  expect((await read(page)).state.challenge.status).toBe("complete");
  await walkTo(page, "master-wu");
  await interact(page);
  await choose(page, "open-review");
  expect((await read(page)).state.challenge.history).toHaveLength(1);
  await page.locator("#journal-close").click();
  await interact(page);
  await choose(page, "start-challenge");
  await finish(page);
  const retry = (await read(page)).state;
  expect(retry.challenge.attempt).toBe(2);
  expect(retry.challenge.evidence).toEqual([]);
  expect(retry.challenge.history[0].total).toBe(100);
  expect(retry.siteTasks.construction).toBe("complete");
  await interact(page);
  await choose(page, "wu-assist");
  await expect(page.locator("#dialog-text")).toContainText(
    "林學長陪你一起核對",
  );
  await finish(page);
  expect((await read(page)).state.challenge.wu).toBe("assist");
  expect(errors).toEqual([]);
});
test("premature conclusions change dialogue and world; correcting them retains explained deductions", async ({
  page,
}) => {
  test.setTimeout(240000);
  await seededSite(page);
  await start(page);
  await interact(page);
  await choose(page, "wu-force");
  await finish(page);
  expect((await read(page)).worldFeedback.join(" ")).toContain("資訊待釐清");
  await interact(page);
  await expect(page.locator("#dialog-text")).toContainText("很難安排人力");
  await choose(page, "wu-repair");
  await finish(page);
  expect((await read(page)).state.challenge.wuRepaired).toBe(true);
  await walkTo(page, "master-zhou");
  await interact(page);
  await choose(page, "zhou-rush");
  await finish(page);
  expect((await read(page)).worldFeedback.join(" ")).toContain("建議未獲採用");
  await interact(page);
  await choose(page, "zhou-correct");
  await finish(page);
  expect((await read(page)).state.challenge.chenCorrected).toBe(true);
  await observeAll(page);
  await finishReport(page, "verified");
  const result = (await read(page)).state.challenge.history.at(-1);
  expect(result.total).toBe(93);
  expect(result.cards.map((r: any) => r.points)).toEqual([30, 30, 20, 13]);
  await expect(page.locator("#journal-content")).toContainText("扣 5 分");
  await expect(page.locator("#journal-content")).toContainText("扣 2 分");
});
test("incomplete assumptions produce a lower recorded result without releasing site work", async ({
  page,
}) => {
  await seededSite(page);
  await start(page);
  await interact(page);
  await choose(page, "wu-force");
  await finish(page);
  await finishReport(page, "assume");
  const result = (await read(page)).state.challenge.history.at(-1);
  expect(result.total).toBe(4);
  expect(result.grade).toContain("C");
  await expect(page.locator("#journal-content")).toContainText("尚未記錄");
  await page.locator("#journal-close").click();
  expect((await read(page)).worldFeedback.join(" ")).toContain("維持管制");
});
test("assessment rejects skipped prerequisites and corrupted saved results", () => {
  const c = freshChallenge();
  expect(validChallenge(c)).toBe(true);
  c.status = "complete";
  c.report = "verified";
  expect(validChallenge(c)).toBe(false);
  const complete = {
    ...freshChallenge(),
    status: "complete" as const,
    attempt: 1,
    evidence: ["drawing", "component", "support"] as const,
    wu: "assist" as const,
    chen: "hold" as const,
    report: "verified" as const,
  };
  const result = assess({ ...complete, evidence: [...complete.evidence] });
  expect(result.total).toBe(100);
  expect(
    validChallenge({
      ...complete,
      evidence: [...complete.evidence],
      history: [{ ...result, total: 200 }],
    }),
  ).toBe(false);
});

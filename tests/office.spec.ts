import { test, expect } from "@playwright/test";
import { read, begin, finish, interact, moveAxis, walkTo } from "./helpers";
test("office story: check-in, deferred acceptance, investigation gating, report, chapter and save", async ({
  page,
}) => {
  test.setTimeout(240000);
  const errors: string[] = [];
  const failed: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(r.url());
  });
  await begin(page);
  expect((await read(page)).markers).toEqual(["planner"]);
  expect((await read(page)).state.items).toEqual([]);
  await walkTo(page, "hr");
  await interact(page);
  expect((await read(page)).state.hr).toBe(false);
  await expect(page.locator("#portrait")).toBeVisible();
  await page.screenshot({
    path: "test-results/hr-dialogue.png",
    fullPage: true,
  });
  await finish(page);
  expect((await read(page)).state.hr).toBe(true);
  expect((await read(page)).state.items).toContain("安全帽");
  expect((await read(page)).markers).toEqual(["planner"]);
  await walkTo(page, "blueprint");
  await interact(page);
  await finish(page);
  expect((await read(page)).state.inspected).toEqual([]);
  await walkTo(page, "planner");
  await interact(page);
  await page.locator("#defer").click();
  expect((await read(page)).state.planning).toBe("available");
  await interact(page);
  await finish(page);
  expect((await read(page)).state.planning).toBe("active");
  expect((await read(page)).markers.sort()).toEqual([
    "blueprint",
    "computer",
    "model",
    "planner",
  ]);
  await page.waitForTimeout(4200);
  await page.screenshot({
    path: "test-results/office-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: "test-results/office-planning-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1100 });
  for (const id of ["model", "computer", "blueprint"]) {
    await walkTo(page, id);
    await interact(page);
    await expect(page.locator("#evidence")).toBeVisible();
    await expect(page.locator("#record")).toBeDisabled();
    if (id === "model") {
      await page.locator("#evidence-close").click();
      expect((await read(page)).markers).toContain("model");
      expect((await read(page)).state.inspected).toEqual([]);
      await interact(page);
    }
    expect((await read(page)).state.inspected).not.toContain(id);
    await page.locator("#evidence-action").click();
    await expect(page.locator("#record")).toBeEnabled();
    await page.locator("#record").click();
    expect((await read(page)).state.inspected).toContain(id);
    expect((await read(page)).markers).not.toContain(id);
  }
  expect((await read(page)).state.planning).toBe("ready");
  expect((await read(page)).state.items).not.toContain("圖說協調便條");
  await walkTo(page, "planner");
  await interact(page);
  await finish(page);
  expect((await read(page)).state.planning).toBe("complete");
  expect((await read(page)).state.chapterComplete).toBe(false);
  await walkTo(page, "hr");
  await interact(page);
  await finish(page);
  expect((await read(page)).state.chapterComplete).toBe(true);
  await page.locator("#menu").click();
  await page.locator('[data-tab="bag"]').click();
  await expect(page.locator("#journal-content")).toContainText("辦公室見習章");
  await page.locator('[data-tab="map"]').click();
  await expect(page.locator(".office-map")).toBeVisible();
  await page.locator("#journal-close").click();
  await page.reload();
  await page.locator("#continue").click();
  expect((await read(page)).state.chapterComplete).toBe(true);
  expect((await read(page)).state.items).toHaveLength(5);
  await walkTo(page, "exit");
  await interact(page);
  await finish(page);
  expect((await read(page)).location).toBe("site");
  expect((await read(page)).markers.sort()).toEqual([
    "construction",
    "quality-npc",
    "safety",
  ]);
  await page.reload();
  await page.locator("#continue").click();
  expect((await read(page)).location).toBe("site");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: "test-results/connected-site-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1100 });
  for (const [npc, objectives] of [
    ["construction", ["rebar", "timber", "scaffold"]],
    ["safety", ["opening", "extinguisher", "lane"]],
    ["quality-npc", ["quality", "pipe1", "bim"]],
  ] as const) {
    await walkTo(page, npc);
    await interact(page);
    await finish(page);
    const job = npc === "quality-npc" ? "quality" : npc;
    expect((await read(page)).state.siteTasks[job]).toBe("active");
    for (const id of objectives) {
      expect((await read(page)).markers).toContain(id);
      await walkTo(page, id);
      await interact(page);
      await finish(page);
      expect((await read(page)).state.siteSeen).toContain(id);
      expect((await read(page)).markers).not.toContain(id);
    }
    expect((await read(page)).state.siteTasks[job]).toBe("ready");
    await walkTo(page, npc);
    await interact(page);
    await finish(page);
    expect((await read(page)).state.siteTasks[job]).toBe("complete");
  }
  await walkTo(page, "return-office");
  await interact(page);
  await finish(page);
  expect((await read(page)).location).toBe("office");
  await walkTo(page, "hr");
  await interact(page);
  await finish(page);
  expect((await read(page)).state.dayComplete).toBe(true);
  expect((await read(page)).state.items).toContain("第一天實習紀念章");
  // Re-enter and return once more to catch stale colliders or duplicated handlers.
  await walkTo(page, "exit");
  await interact(page);
  await finish(page);
  expect((await read(page)).location).toBe("site");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: "test-results/connected-site-mobile.png",
    fullPage: true,
  });
  await walkTo(page, "return-office");
  await interact(page);
  await finish(page);
  expect((await read(page)).location).toBe("office");
  await page.reload();
  await page.locator("#continue").click();
  expect((await read(page)).state.dayComplete).toBe(true);
  expect(errors).toEqual([]);
  expect(failed).toEqual([]);
});
test("portrait mobile: real controls, wall collision, sound, menu and restart", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await begin(page);
  const before = await read(page);
  const right = await page.locator('[data-dir="right"]').boundingBox();
  await page.mouse.move(right!.x + 20, right!.y + 20);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  expect((await read(page)).x).toBeGreaterThan(before.x + 40);
  expect((await read(page)).direction).toBe(2);
  // Main corridor right wall is x=576 at this Y; it blocks a real eastward walk.
  await moveAxis(page, "x", 512);
  await moveAxis(page, "y", 720);
  await page.keyboard.down("d");
  await page.waitForTimeout(900);
  await page.keyboard.up("d");
  const wall = (await read(page)).x;
  expect(wall).toBeLessThan(570);
  await page.keyboard.down("d");
  await page.waitForTimeout(300);
  await page.keyboard.up("d");
  expect(Math.abs((await read(page)).x - wall)).toBeLessThan(2);
  await page.locator("#sound").click();
  await expect(page.locator("#sound span")).toHaveText("ON");
  await page.locator("#sound").click();
  await expect(page.locator("#sound span")).toHaveText("OFF");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const bounds = await page.locator("#shell").boundingBox();
  expect(bounds!.height / bounds!.width).toBeCloseTo(16 / 9, 2);
  await page.screenshot({
    path: "test-results/office-mobile.png",
    fullPage: true,
  });
  await page.locator("#menu").click();
  const frozen = await read(page);
  await page.keyboard.down("w");
  await page.waitForTimeout(200);
  await page.keyboard.up("w");
  expect((await read(page)).y).toBeCloseTo(frozen.y, 0);
  await page.locator("#restart").click();
  await page.locator("#cancel-restart").click();
  expect((await read(page)).state.name).toBe("小豐");
  await page.locator("#restart").click();
  await page.locator("#confirm-restart").click();
  await page.locator("#player-name").fill("新的故事");
  await page.locator("#name-form .primary").click();
  await finish(page);
  expect((await read(page)).state.name).toBe("新的故事");
  expect((await read(page)).state.hr).toBe(false);
});

test("keyboard dialogue closes once, report gate and legacy chapter remain playable", async ({
  page,
}) => {
  await begin(page);
  await walkTo(page, "planner");
  await interact(page);
  await expect(page.locator("#dialog-text")).toContainText("HR");
  await page.keyboard.press("e", { delay: 120 });
  await page.waitForTimeout(350);
  await expect(page.locator("#dialogue")).not.toBeVisible();
  expect((await read(page)).state.hr).toBe(false);
  expect((await read(page)).markers).toEqual(["planner"]);
  await page.goto("legacy.html");
  await page.locator("#player-name").fill("舊版");
  await page.locator("#create button").click();
  await page.locator("#next").click();
  await expect(page.locator("canvas")).toBeVisible();
  expect(await page.evaluate(() => !!(window as any).__site)).toBe(true);
});

test("migrate completed office save and walk through both portals", async ({
  page,
}) => {
  await page.goto("./");
  await page.locator("#new-game").waitFor();
  await page.evaluate(() =>
    localStorage.setItem(
      "fengyu-office-v2",
      JSON.stringify({
        version: 2,
        name: "既有實習生",
        x: 272,
        y: 272,
        hr: true,
        planning: "complete",
        inspected: ["blueprint", "computer", "model"],
        items: ["識別證", "安全帽", "實習手冊", "圖說協調便條", "辦公室見習章"],
        chapterComplete: true,
      }),
    ),
  );
  await page.reload();
  await page.locator("#continue").click();
  expect((await read(page)).state.items).toHaveLength(5);
  expect((await read(page)).location).toBe("office");
  await walkTo(page, "exit");
  await interact(page);
  await finish(page);
  expect((await read(page)).location).toBe("site");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: "test-results/connected-site-mobile.png",
    fullPage: true,
  });
  await walkTo(page, "return-office");
  await interact(page);
  await finish(page);
  expect((await read(page)).location).toBe("office");
});

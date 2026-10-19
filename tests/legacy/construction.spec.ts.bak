import { test, expect, type Page } from "@playwright/test";
const state = (p: Page) => p.evaluate(() => (window as any).__site);
async function start(p: Page) {
  await p.goto("./");
  await p.locator("#player-name").fill("小豐");
  await p.locator("#create button").click();
  await p.locator("#next").click();
  await expect(p.locator("#welcome")).not.toBeVisible();
  await expect.poll(async () => !!(await state(p))).toBe(true);
}
async function walk(p: Page, key: string, ms: number) {
  await p.keyboard.down(key);
  await p.waitForTimeout(ms);
  await p.keyboard.up(key);
  await p.waitForTimeout(100);
}
async function axis(p: Page, x: number, y: number) {
  for (const [key, target] of [
    ["x", x],
    ["y", y],
  ] as const) {
    const current = (await state(p))[key];
    if (Math.abs(current - target) < 6) continue;
    const dir =
      key === "x"
        ? target > current
          ? "d"
          : "a"
        : target > current
          ? "s"
          : "w";
    await p.keyboard.down(dir);
    try {
      await expect
        .poll(
          async () => {
            const value = (await state(p))[key];
            return target > current ? value >= target - 4 : value <= target + 4;
          },
          { timeout: 15000, intervals: [16] },
        )
        .toBe(true);
    } finally {
      await p.keyboard.up(dir);
    }
    await p.waitForTimeout(100);
  }
}
async function interact(p: Page) {
  await p.keyboard.press("e", { delay: 100 });
  await expect(p.locator("#conversation")).toBeVisible();
}
async function finish(p: Page) {
  while (await p.locator("#conversation").isVisible()) {
    const choices = p.locator("#choices button");
    if (await choices.count()) {
      const correct = p.getByRole("button", {
        name: /確認圖說|回報工程師|保持距離|依程序標示/,
      });
      await correct.click();
    }
    await p.locator("#next").click();
  }
}
test("desktop: exploration, collisions, observations, reward and save", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await start(page);
  const initial = await state(page);
  await walk(page, "d", 400);
  expect((await state(page)).x).toBeGreaterThan(initial.x + 15);
  await walk(page, "a", 400);
  await axis(page, 512, 605);
  await axis(page, 384, 605);
  await interact(page);
  await finish(page);
  expect((await state(page)).quest).toBe(true);
  await axis(page, 256, 525);
  await interact(page);
  await finish(page);
  expect((await state(page)).seen).toContain("rebar");
  // A pallet collision: walk into its south face and verify movement stops.
  await axis(page, 256, 640);
  await walk(page, "s", 1800);
  const blocked = (await state(page)).y;
  expect(blocked).toBeLessThan(769);
  await walk(page, "s", 350);
  expect(Math.abs((await state(page)).y - blocked)).toBeLessThan(3);
  await axis(page, 256, 605);
  await axis(page, 736, 555);
  await interact(page);
  await finish(page);
  expect((await state(page)).seen).toContain("opening");
  await axis(page, 736, 620);
  await axis(page, 1006, 620);
  await axis(page, 1006, 540);
  await interact(page);
  await finish(page);
  expect((await state(page)).seen).toContain("timber");
  await axis(page, 1130, 605);
  await axis(page, 1130, 225);
  await axis(page, 1038, 225);
  await interact(page);
  await finish(page);
  expect((await state(page)).seen).toContain("quality");
  await axis(page, 1130, 605);
  await axis(page, 384, 605);
  await interact(page);
  await finish(page);
  expect((await state(page)).reward).toBe(true);
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  await page.reload();
  await expect.poll(async () => (await state(page))?.reward).toBe(true);
  await expect(page.locator("#welcome")).not.toBeVisible();
  expect(errors).toEqual([]);
});
test("mobile portrait: naming, touch movement and interaction", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  const a = await state(page);
  const right = page.locator('[data-dir="right"]');
  const box = (await right.boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  expect((await state(page)).x).toBeGreaterThan(a.x + 30);
  await expect(page.locator("#interact")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
  await page.locator("#help").click();
  await expect(page.locator("#conversation")).toBeVisible();
  await page.locator("#next").click();
});

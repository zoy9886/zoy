import { expect, type Page } from "@playwright/test";
export const read = (p: Page) => p.evaluate(() => (window as any).__office);
export async function begin(p: Page) {
  await p.goto("./");
  await p.locator("#new-game").click();
  await p.locator("#player-name").fill("小豐");
  await p.locator("#name-form .primary").click();
  await finish(p);
  await expect.poll(async () => !!(await read(p))).toBe(true);
}
export async function finish(p: Page) {
  while (await p.locator("#dialogue").isVisible())
    await p.locator("#next").click();
}
export async function interact(p: Page) {
  await p.keyboard.press("e", { delay: 120 });
  await expect(p.locator("dialog[open]")).toBeVisible();
}
export async function moveAxis(p: Page, key: "x" | "y", target: number) {
  const current = (await read(p))[key];
  if (Math.abs(current - target) < 4) return;
  const direction =
    key === "x" ? (target > current ? "d" : "a") : target > current ? "s" : "w";
  await p.keyboard.down(direction);
  try {
    await expect
      .poll(
        async () => {
          const value = (await read(p))[key];
          return target > current ? value >= target - 2 : value <= target + 2;
        },
        { intervals: [16], timeout: 15000 },
      )
      .toBe(true);
  } catch (error) {
    const now = await read(p);
    console.log("movement blocked", key, target, now.x, now.y, now.location);
    await p.screenshot({ path: "/tmp/connected-stuck.png" });
    throw error;
  } finally {
    await p.keyboard.up(direction);
  }
  await p.waitForTimeout(30);
}
// Grid search uses read-only geometry. Every path is traversed with real key events.
export async function walkTo(p: Page, id: string) {
  const g = await read(p),
    target = g.targets.find((t: any) => t.id === id);
  expect(target).toBeTruthy();
  const size = 16;
  const key = (x: number, y: number) => `${x},${y}`;
  const free = (x: number, y: number) =>
    x >= 48 &&
    x <= g.world.width - 48 &&
    y >= 80 &&
    y <= g.world.height - 48 &&
    !g.blockers.some(
      (r: any) =>
        x + 17 > r.x && x - 17 < r.x + r.w && y + 2 > r.y && y - 24 < r.y + r.h,
    );
  const start = [Math.round(g.x / size) * size, Math.round(g.y / size) * size];
  const queue = [start],
    parent = new Map<string, string | null>([[key(start[0], start[1]), null]]);
  let goal: number[] | undefined,
    best = Infinity;
  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i];
    const d = Math.hypot(x - target.x, y - target.y);
    if (d < 52 && y >= target.y + 12) {
      const score = Math.hypot(x - target.x, y - (target.y + 35));
      if (score < best) {
        best = score;
        goal = [x, y];
      }
    }
    for (const [dx, dy] of [
      [0, -size],
      [0, size],
      [-size, 0],
      [size, 0],
    ]) {
      const nx = x + dx,
        ny = y + dy,
        k = key(nx, ny);
      if (!parent.has(k) && free(nx, ny)) {
        parent.set(k, key(x, y));
        queue.push([nx, ny]);
      }
    }
  }
  expect(goal, `reachable approach to ${id}`).toBeTruthy();
  const path: number[][] = [];
  let k: string | null = key(goal![0], goal![1]);
  while (k) {
    path.unshift(k.split(",").map(Number));
    k = parent.get(k)!;
  }
  const corners = path.filter(
    (point, i) =>
      i === path.length - 1 ||
      (i > 0 &&
        (point[0] - path[i - 1][0] !== path[i + 1][0] - point[0] ||
          point[1] - path[i - 1][1] !== path[i + 1][1] - point[1])),
  );
  for (const [x, y] of corners) {
    await moveAxis(p, "x", x);
    await moveAxis(p, "y", y);
  }
  await p.waitForTimeout(100);
  expect(
    Math.hypot((await read(p)).x - target.x, (await read(p)).y - target.y),
  ).toBeLessThan(65);
}

import Phaser from "phaser";
import { fixtures, zones } from "../../world/site";
import { makeArt } from "../../art/atlas";
import type { Rect } from "./data";
export const sitePeople = [
  {
    id: "construction",
    x: 384,
    y: 544,
    name: "林學長",
    role: "施工工程師",
    look: "planner" as const,
  },
  {
    id: "safety",
    x: 576,
    y: 736,
    name: "陳姐",
    role: "職安工程師",
    look: "colleague" as const,
  },
  {
    id: "quality-npc",
    x: 1088,
    y: 256,
    name: "許學姐",
    role: "品管工程師",
    look: "hr" as const,
  },
];
export const siteTargets = fixtures
  .filter((f) => f.label)
  .map((f) => ({
    id: f.id,
    x: f.x * 32 + 32,
    y: (f.y + 1) * 32 + 8,
    label: f.label!,
  }))
  .concat(
    sitePeople.map((n) => ({
      id: n.id,
      x: n.x,
      y: n.y,
      label: n.name + "・" + n.role,
    })),
    [
      { id: "lane", x: 680, y: 616, label: "安全通道巡檢點" },
      { id: "return-office", x: 512, y: 860, label: "返回辦公區" },
    ],
  );
export function buildConstruction(
  scene: Phaser.Scene,
  block: (r: Rect) => void,
) {
  if (!scene.textures.exists("site-atlas")) makeArt(scene);
  if (!scene.textures.exists("connected-site-floor")) {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 32;
    const ctx = c.getContext("2d")!,
      source = scene.textures
        .get("site-atlas")
        .getSourceImage() as HTMLCanvasElement;
    ctx.drawImage(source, 0, 0, 32, 32, 0, 0, 32, 32);
    ctx.drawImage(source, 64, 0, 32, 32, 32, 0, 32, 32);
    scene.textures.addCanvas("connected-site-floor", c);
  }
  const map = scene.make.tilemap({
    data: Array.from({ length: 29 }, (_, y) =>
      Array.from({ length: 40 }, (_, x) =>
        y === 18 || y === 19 || x === 19 ? 1 : 0,
      ),
    ),
    tileWidth: 32,
    tileHeight: 32,
  });
  const tiles = map.addTilesetImage("site", "connected-site-floor", 32, 32)!;
  map.createLayer(0, tiles)!.setDepth(-100);
  const walls = [
    { x: 0, y: 0, w: 1280, h: 64 },
    { x: 0, y: 896, w: 1280, h: 32 },
    { x: 0, y: 32, w: 32, h: 896 },
    { x: 1248, y: 32, w: 32, h: 896 },
  ];
  walls.forEach((r) => block(r));
  for (let x = 0; x < 40; x += 2) {
    scene.add
      .image(x * 32, 0, "site-atlas", "wall")
      .setOrigin(0)
      .setDepth(64);
    scene.add
      .image(x * 32, 896, "site-atlas", "wall")
      .setOrigin(0)
      .setDepth(970);
  }
  for (let y = 2; y < 28; y += 2) {
    scene.add
      .image(-32, y * 32, "site-atlas", "wall")
      .setOrigin(0)
      .setDepth(y * 32 + 64);
    scene.add
      .image(1248, y * 32, "site-atlas", "wall")
      .setOrigin(0)
      .setDepth(y * 32 + 64);
  }
  for (const f of fixtures) {
    const bottom = (f.y + 1) * 32;
    scene.add
      .image(f.x * 32, bottom, "site-atlas", f.art)
      .setOrigin(0, 1)
      .setDepth(bottom);
    block({
      x: f.x * 32 + 8,
      y: bottom - (f.art === "opening" ? 44 : 24),
      w: 48,
      h: f.art === "opening" ? 44 : 24,
    });
  }
  const g = scene.add.graphics().setDepth(-70);
  g.lineStyle(2, 0xcbbd84, 0.7);
  g.strokeRect(160, 384, 224, 160);
  g.strokeRect(896, 416, 224, 160);
  for (let x = 160; x < 1150; x += 128) {
    g.lineBetween(x, 608, x + 32, 608);
    g.lineBetween(x + 24, 603, x + 32, 608);
    g.lineBetween(x + 24, 613, x + 32, 608);
  }
  g.fillStyle(0x617b86, 0.45);
  g.fillRect(174, 390, 198, 99);
  g.lineStyle(2, 0x536c7b);
  for (let x = 180; x < 370; x += 12) g.lineBetween(x, 392, x, 487);
  for (let y = 396; y < 488; y += 12) g.lineBetween(176, y, 369, y);
  g.lineStyle(1, 0xaebfbb, 0.7);
  for (let x = 184; x < 370; x += 24) g.lineBetween(x, 393, x, 486);
  zones.forEach((z) =>
    scene.add
      .text(z.x * 32, z.y * 32, z.text, {
        fontSize: "12px",
        fontFamily: "sans-serif",
        color: z.color,
        backgroundColor: "#405b68",
        padding: { x: 8, y: 5 },
      })
      .setDepth(-10),
  );
  scene.add
    .image(512, 856, "office-site-door")
    .setOrigin(0.5, 120 / 128)
    .setDepth(856);
  block({ x: 462, y: 842, w: 100, h: 14 });
  scene.add
    .text(512, 780, "← 工務所・返回辦公區", {
      fontSize: "10px",
      fontFamily: "sans-serif",
      color: "#f0edcf",
      backgroundColor: "#405b68",
      padding: { x: 7, y: 5 },
    })
    .setOrigin(0.5)
    .setDepth(880);
  // The landing side of the door is north of its collision footprint.
  const ret = siteTargets.find((t) => t.id === "return-office")!;
  ret.y = 816;
  scene.add
    .text(680, 585, "安全通道・保持淨空", {
      fontFamily: "sans-serif",
      fontSize: "10px",
      backgroundColor: "#45616b",
      color: "#dddcc5",
      padding: { x: 6, y: 4 },
    })
    .setOrigin(0.5)
    .setDepth(-10);
}

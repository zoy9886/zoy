import Phaser from "phaser";
// Original pixel art, 32 px grid. Textures are assembled into a reusable atlas.
export const TILE = 32;
export const artNames = [
  "floor",
  "lane",
  "wall",
  "column",
  "opening",
  "rebar",
  "timber",
  "scaffold",
  "pallet",
  "desk",
  "bim",
  "quality",
  "cone",
  "extinguisher",
  "rail",
  "tools",
  "pipe",
  "sign",
] as const;
export function makeArt(scene: Phaser.Scene) {
  const canvas = document.createElement("canvas");
  canvas.width = artNames.length * 64;
  canvas.height = 96;
  const c = canvas.getContext("2d")!;
  c.imageSmoothingEnabled = false;
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  };
  const line = (
    x: number,
    y: number,
    x2: number,
    y2: number,
    color: string,
  ) => {
    c.strokeStyle = color;
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x + 0.5, y + 0.5);
    c.lineTo(x2 + 0.5, y2 + 0.5);
    c.stroke();
  };
  artNames.forEach((name, i) => {
    c.save();
    c.translate(i * 64, 0);
    if (["floor", "lane"].includes(name)) {
      rect(0, 0, 32, 32, "#858f92");
      rect(1, 1, 30, 30, "#939c9d");
      for (let p = 0; p < 16; p++) {
        const x = (p * 13 + 7) % 31,
          y = (p * 19 + 3) % 31;
        rect(x, y, p % 3 === 0 ? 2 : 1, 1, p % 2 ? "#a2aaaa" : "#7f8a8e");
      }
      line(0, 31, 31, 31, "#899496");
      if (name === "lane") {
        rect(0, 1, 32, 2, "#c6b773");
        rect(0, 29, 32, 2, "#c6b773");
      }
    } else {
      rect(5, 60, 53, 8, "#52626a");
      switch (name) {
        case "wall":
          rect(0, 0, 64, 64, "#455964");
          rect(0, 4, 64, 12, "#b1babc");
          rect(0, 17, 64, 39, "#87979d");
          rect(0, 55, 64, 9, "#637881");
          for (let y = 20; y < 53; y += 13) line(0, y, 64, y, "#74868e");
          for (let x = 0; x < 64; x += 16) rect(x, 9, 2, 3, "#d3d8d3");
          break;
        case "column":
          rect(12, 5, 37, 57, "#526872");
          rect(12, 5, 30, 51, "#a1adb0");
          rect(13, 6, 5, 49, "#c1c9c6");
          rect(42, 5, 7, 57, "#6d818b");
          rect(10, 52, 42, 10, "#7d9197");
          for (let y = 12; y < 48; y += 14) {
            rect(23, y, 3, 2, "#71838b");
            rect(35, y, 2, 2, "#71838b");
          }
          break;
        case "opening":
          rect(0, 18, 64, 46, "#263d49");
          rect(5, 23, 54, 36, "#192d39");
          for (let x = 0; x < 64; x += 10) {
            rect(x, 12, 5, 4, "#e5c77d");
            rect(x, 60, 5, 4, "#e5c77d");
          }
          rect(0, 13, 3, 51, "#e4b650");
          rect(61, 13, 3, 51, "#e4b650");
          break;
        case "rebar":
          rect(3, 51, 57, 9, "#5e625b");
          for (let y = 18; y < 56; y += 5) {
            line(3, y, 58, y + 4, "#344d5c");
            line(3, y + 1, 58, y + 5, "#99a8a8");
          }
          for (let x = 10; x < 59; x += 13) line(x, 20, x, 59, "#b59c75");
          break;
        case "timber":
          for (let y = 21; y < 60; y += 7) {
            rect(4, y, 54, 6, "#9b7956");
            rect(4, y, 54, 2, "#c1a17a");
            for (let x = 10; x < 55; x += 17)
              line(x, y + 3, x + 11, y + 3, "#745e4b");
          }
          rect(13, 18, 4, 44, "#536875");
          rect(47, 18, 4, 44, "#536875");
          break;
        case "scaffold":
          for (let x = 7; x < 60; x += 47) {
            rect(x, 4, 3, 60, "#516b79");
            rect(x, 4, 1, 59, "#bac7c6");
          }
          for (let y = 12; y < 62; y += 22) {
            rect(5, y, 54, 4, "#718895");
            line(9, y + 5, 54, y + 21, "#9aafb4");
            line(54, y + 5, 9, y + 21, "#9aafb4");
          }
          rect(4, 7, 57, 5, "#ad9270");
          break;
        case "pallet":
          for (let y = 36; y < 63; y += 8) {
            rect(3, y, 57, 6, "#ad8c64");
            rect(5, y, 54, 2, "#cab18b");
          }
          for (let x = 10; x < 54; x += 18) rect(x, 37, 4, 27, "#795f49");
          break;
        case "desk":
          rect(5, 27, 52, 6, "#c5b294");
          rect(8, 33, 4, 29, "#3f5667");
          rect(50, 33, 4, 29, "#3f5667");
          rect(11, 19, 27, 11, "#dde4d8");
          for (let y = 21; y < 28; y += 3) line(14, y, 34, y, "#6088a3");
          rect(42, 17, 9, 13, "#334c5d");
          rect(43, 18, 7, 8, "#97becb");
          rect(22, 43, 19, 17, "#567582");
          break;
        case "bim":
          rect(5, 24, 52, 6, "#99a9a9");
          rect(9, 30, 4, 31, "#425e6c");
          rect(50, 30, 4, 31, "#425e6c");
          rect(14, 2, 35, 25, "#293e50");
          rect(17, 5, 29, 18, "#7cb2c0");
          for (let x = 21; x < 45; x += 6) {
            line(x, 8, x, 20, "#e0ebe1");
            line(19, 12, 44, 12, "#e0ebe1");
          }
          rect(22, 29, 22, 4, "#c2cccc");
          break;
        case "quality":
          rect(5, 29, 53, 6, "#bdc9c4");
          rect(9, 35, 4, 28, "#526a75");
          rect(50, 35, 4, 28, "#526a75");
          rect(10, 17, 15, 12, "#697c83");
          rect(12, 14, 11, 4, "#a0adb0");
          rect(31, 15, 20, 14, "#e4e5d6");
          for (let y = 18; y < 27; y += 3) {
            rect(34, y, 2, 1, "#497c77");
            rect(39, y, 9, 1, "#7b9194");
          }
          break;
        case "cone":
          rect(18, 57, 27, 5, "#354c59");
          for (let y = 27; y < 57; y++) {
            const w = Math.floor((y - 25) / 3);
            rect(
              31 - w,
              y,
              w * 2 + 1,
              1,
              y > 37 && y < 44 ? "#ece6d2" : "#d38b59",
            );
          }
          break;
        case "extinguisher":
          rect(23, 24, 15, 34, "#ab514b");
          rect(25, 27, 3, 27, "#dd7970");
          rect(26, 36, 10, 12, "#e3dfce");
          rect(27, 19, 7, 6, "#3a4c57");
          rect(30, 17, 12, 3, "#343e4a");
          line(39, 20, 42, 42, "#283f4d");
          break;
        case "rail":
          for (let x = 3; x < 64; x += 28) {
            rect(x, 20, 3, 44, "#d0b764");
            rect(x, 20, 1, 41, "#f0d38b");
          }
          rect(3, 25, 59, 4, "#d5bd73");
          rect(3, 45, 59, 3, "#c8b36b");
          for (let x = 7; x < 60; x += 7) line(x, 29, x, 44, "#586f72");
          break;
        case "tools":
          rect(8, 37, 43, 23, "#386c7b");
          rect(8, 37, 43, 4, "#78a1a4");
          rect(23, 30, 15, 4, "#344954");
          rect(23, 33, 3, 5, "#344954");
          rect(35, 33, 3, 5, "#344954");
          rect(26, 45, 9, 6, "#b6c3bb");
          break;
        case "pipe":
          for (let y = 31; y < 60; y += 8) {
            rect(5, y, 51, 5, "#728b99");
            rect(5, y, 51, 2, "#b4c4c7");
            rect(53, y, 5, 5, "#344c5d");
          }
          break;
        case "sign":
          rect(11, 12, 42, 27, "#405d6b");
          rect(13, 14, 38, 23, "#d5dccc");
          rect(29, 39, 5, 24, "#6d8085");
          rect(18, 19, 28, 3, "#627f86");
          rect(18, 25, 20, 2, "#627f86");
          rect(18, 30, 25, 2, "#627f86");
          break;
      }
    }
    c.restore();
  });
  const tex = scene.textures.addCanvas("site-atlas", canvas)!;
  artNames.forEach((name, i) =>
    tex.add(
      name,
      0,
      i * 64,
      0,
      ["floor", "lane"].includes(name) ? 32 : 64,
      ["floor", "lane"].includes(name) ? 32 : 72,
    ),
  );
  // Four directions, three walking frames. Silhouettes, helmet brims and PPE are pixel drawn.
  const people = document.createElement("canvas");
  people.width = 96;
  people.height = 128;
  const p = people.getContext("2d")!;
  const r = (x: number, y: number, w: number, h: number, col: string) => {
    p.fillStyle = col;
    p.fillRect(x, y, w, h);
  };
  for (let dir = 0; dir < 4; dir++)
    for (let step = 0; step < 3; step++) {
      p.save();
      p.translate(step * 32, dir * 32);
      r(8, 28, 17, 3, "#4f626b");
      const offset = step === 1 ? -2 : step === 2 ? 2 : 0;
      r(11, 23, 4, 6 + offset, "#283e50");
      r(18, 23, 4, 6 - offset, "#283e50");
      r(10, 29 + offset, 6, 2, "#263443");
      r(18, 29 - offset, 6, 2, "#263443");
      r(9, 14, 15, 11, "#487f99");
      r(11, 14, 3, 10, "#d6d5a5");
      r(19, 14, 3, 10, "#d6d5a5");
      r(9, 20, 15, 2, "#dae2cf");
      r(6, 16, 3, 9, "#81a0ae");
      r(24, 16, 3, 9, "#81a0ae");
      r(6, 24, 3, 3, "#d4ae8b");
      r(24, 24, 3, 3, "#d4ae8b");
      r(11, 7, 11, 8, "#d8b293");
      r(9, 4, 15, 7, "#ecede0");
      r(7, 9, 19, 3, "#c3cfc7");
      r(15, 3, 3, 7, "#f9f7df");
      if (dir !== 3) {
        r(dir === 1 ? 10 : dir === 2 ? 21 : 12, 12, 2, 2, "#324853");
        if (dir === 0) r(19, 12, 2, 2, "#324853");
      } else r(11, 12, 11, 3, "#5c655e");
      p.restore();
    }
  const worker = scene.textures.addCanvas("worker", people)!;
  for (let i = 0; i < 12; i++)
    worker.add(i, 0, (i % 3) * 32, Math.floor(i / 3) * 32, 32, 32);
  for (let dir = 0; dir < 4; dir++)
    scene.anims.create({
      key: `walk-${dir}`,
      frames: scene.anims.generateFrameNumbers("worker", {
        start: dir * 3,
        end: dir * 3 + 2,
      }),
      frameRate: 8,
      repeat: -1,
    });
}

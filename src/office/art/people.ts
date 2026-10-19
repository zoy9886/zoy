import Phaser from "phaser";
import { painter, type Painter } from "./officeArt";
import { P } from "./palette";
export type Look = "intern" | "hr" | "planner" | "colleague";
const styles: Record<
  Look,
  {
    hair: string;
    light: string;
    shirt: string;
    shade: string;
    trousers: string;
  }
> = {
  intern: {
    hair: "#46545a",
    light: "#718080",
    shirt: "#e2e7df",
    shade: "#a6bbb8",
    trousers: "#4c6778",
  },
  hr: {
    hair: "#514f51",
    light: "#84736b",
    shirt: "#bd9e92",
    shade: "#8f7774",
    trousers: "#4f646d",
  },
  planner: {
    hair: "#344a53",
    light: "#647b7e",
    shirt: "#7aa6b4",
    shade: "#517c91",
    trousers: "#3f5669",
  },
  colleague: {
    hair: "#4b5351",
    light: "#8b8e7e",
    shirt: "#899b7c",
    shade: "#5d7e6a",
    trousers: "#536a76",
  },
};
function character(
  p: Painter,
  look: Look,
  dir: number,
  step: number,
  helmet: boolean,
) {
  const s = styles[look],
    stride = step === 1 ? -2 : step === 2 ? 2 : 0;
  p.poly(
    [
      [7, 43],
      [10, 41],
      [25, 41],
      [29, 44],
      [24, 47],
      [11, 47],
    ],
    "#2c414b35",
  );
  p.r(11, 33, 5, 10 + stride, s.trousers);
  p.r(20, 33, 5, 10 - stride, s.trousers);
  p.r(12, 34, 2, 7, s.shade);
  p.r(21, 34, 2, 7, s.shade);
  p.r(10, 43 + stride, 7, 3, P.deep);
  p.r(20, 43 - stride, 7, 3, P.deep);
  p.r(10, 43 + stride, 6, 1, P.steel);
  p.r(20, 43 - stride, 6, 1, P.steel);
  p.poly(
    [
      [11, 20],
      [24, 20],
      [28, 25],
      [26, 35],
      [10, 35],
      [7, 25],
    ],
    s.shade,
  );
  p.r(11, 22, 14, 12, s.shirt);
  p.r(13, 23, 2, 10, s.light);
  p.r(7, 24 + stride, 4, 10, s.shirt);
  p.r(26, 24 - stride, 4, 10, s.shirt);
  p.r(7, 33 + stride, 4, 4, P.skin);
  p.r(26, 33 - stride, 4, 4, P.skin);
  p.r(15, 18, 7, 6, P.skin);
  p.r(15, 21, 7, 2, P.skinDark);
  p.r(11, 9, 15, 13, s.hair);
  p.r(12, 12, 13, 9, P.skin);
  p.r(14, 13, 9, 7, P.skinLight);
  p.r(11, 17, 2, 4, P.skinDark);
  p.r(24, 17, 2, 4, P.skinDark);
  if (look === "hr") {
    p.r(9, 10, 3, 18, s.hair);
    p.r(25, 10, 3, 18, s.hair);
    p.r(10, 8, 16, 6, s.hair);
    p.r(12, 9, 10, 2, s.light);
    p.r(12, 13, 4, 3, s.hair);
  } else {
    p.r(11, 8, 15, 6, s.hair);
    p.r(13, 8, 10, 2, s.light);
    p.r(11, 12, 4, 3, s.hair);
  }
  if (dir === 3) {
    p.r(12, 12, 13, 9, s.hair);
    p.r(14, 13, 9, 2, s.light);
  } else {
    const left = dir === 1 ? 12 : dir === 2 ? 23 : 15;
    p.r(left, 16, 2, 2, P.ink);
    if (dir === 0) p.r(22, 16, 2, 2, P.ink);
    if (look === "planner") {
      p.l(left - 1, 15, left + 3, 15, P.deep);
      if (dir === 0) {
        p.l(21, 15, 25, 15, P.deep);
        p.l(18, 16, 21, 16, P.deep);
      }
    }
    p.r(dir === 1 ? 11 : dir === 2 ? 25 : 19, 19, 2, 1, P.skinDark);
  }
  if (dir !== 3) {
    p.l(15, 23, 17, 29, P.blue);
    p.l(22, 23, 20, 29, P.blue);
    p.r(16, 29, 6, 5, P.paper);
    p.r(17, 30, 4, 1, P.blue);
    p.r(14, 23, 2, 1, P.paper);
    p.r(22, 23, 2, 1, P.paper);
  }
  if (helmet) {
    p.poly(
      [
        [10, 8],
        [12, 5],
        [25, 5],
        [27, 8],
        [27, 13],
        [9, 13],
      ],
      P.white,
    );
    p.r(7, 12, 23, 3, P.light);
    p.r(17, 4, 3, 8, "#f7f4de");
    p.r(11, 8, 2, 4, "#c2cfc7");
  }
}
export function makePeople(scene: Phaser.Scene) {
  for (const look of Object.keys(styles) as Look[]) {
    for (const helmet of look === "intern" ? [false, true] : [false]) {
      const key = `person-${look}${helmet ? "-helmet" : ""}`;
      const canvas = document.createElement("canvas");
      canvas.width = 108;
      canvas.height = 192;
      const c = canvas.getContext("2d")!;
      for (let dir = 0; dir < 4; dir++)
        for (let frame = 0; frame < 3; frame++) {
          c.save();
          c.translate(frame * 36, dir * 48);
          character(painter(c), look, dir, frame, helmet);
          c.restore();
        }
      const texture = scene.textures.addCanvas(key, canvas)!;
      for (let i = 0; i < 12; i++)
        texture.add(i, 0, (i % 3) * 36, Math.floor(i / 3) * 48, 36, 48);
      for (let dir = 0; dir < 4; dir++)
        scene.anims.create({
          key: `${key}-walk-${dir}`,
          frames: [0, 1, 0, 2].map((f) => ({ key, frame: dir * 3 + f })),
          frameRate: 8,
          repeat: -1,
        });
    }
  }
}
export function paintPortrait(canvas: HTMLCanvasElement, look: Look) {
  const c = canvas.getContext("2d")!,
    p = painter(c),
    s = styles[look];
  c.clearRect(0, 0, 96, 112);
  p.r(0, 0, 96, 112, "#c5d5cc");
  p.poly(
    [
      [0, 70],
      [96, 18],
      [96, 112],
      [0, 112],
    ],
    "#adbfba",
  );
  p.r(5, 8, 24, 1, "#dfe5d8");
  p.r(5, 11, 12, 1, "#dfe5d8");
  // Layered hair silhouette, then shoulders, neck, face and individual facial pixels.
  p.poly(
    [
      [21, 31],
      [23, 17],
      [32, 10],
      [61, 8],
      [75, 17],
      [79, 33],
      [77, 73],
      [68, 83],
      [25, 80],
      [18, 66],
    ],
    s.hair,
  );
  p.poly(
    [
      [5, 112],
      [9, 91],
      [23, 81],
      [37, 76],
      [62, 76],
      [80, 85],
      [90, 103],
      [91, 112],
    ],
    s.shade,
  );
  p.poly(
    [
      [14, 112],
      [17, 90],
      [35, 81],
      [46, 87],
      [62, 81],
      [79, 92],
      [83, 112],
    ],
    s.shirt,
  );
  p.r(39, 67, 19, 17, P.skinDark);
  p.r(40, 67, 16, 13, P.skin);
  p.poly(
    [
      [35, 79],
      [46, 86],
      [39, 94],
      [27, 84],
    ],
    P.white,
  );
  p.poly(
    [
      [60, 78],
      [49, 86],
      [56, 94],
      [68, 84],
    ],
    P.white,
  );
  p.l(29, 90, 36, 112, s.light, 2);
  p.l(69, 90, 63, 112, s.shade, 2);
  p.l(37, 87, 44, 104, P.blue, 2);
  p.l(61, 88, 53, 104, P.blue, 2);
  p.r(42, 102, 13, 10, P.paper);
  p.r(44, 104, 9, 2, P.blue);
  p.r(44, 108, 4, 1, P.green);
  p.poly(
    [
      [26, 31],
      [35, 21],
      [60, 22],
      [70, 32],
      [69, 56],
      [62, 69],
      [52, 76],
      [40, 73],
      [29, 63],
      [24, 47],
    ],
    P.skinDark,
  );
  p.poly(
    [
      [29, 31],
      [37, 24],
      [60, 25],
      [67, 33],
      [66, 55],
      [60, 66],
      [51, 71],
      [41, 69],
      [32, 59],
      [28, 44],
    ],
    P.skin,
  );
  p.poly(
    [
      [33, 32],
      [42, 27],
      [58, 28],
      [63, 34],
      [61, 53],
      [55, 58],
      [39, 55],
      [33, 46],
    ],
    P.skinLight,
  );
  p.r(23, 40, 5, 13, P.skin);
  p.r(25, 44, 2, 6, P.skinDark);
  p.r(68, 40, 5, 13, P.skin);
  p.r(69, 43, 2, 7, P.skinDark);
  // Side-parted locks have shadow clusters and fine highlight strands.
  p.poly(
    [
      [23, 34],
      [25, 19],
      [36, 13],
      [62, 13],
      [73, 23],
      [73, 37],
      [65, 32],
      [59, 24],
      [48, 27],
      [39, 31],
      [30, 31],
      [28, 43],
    ],
    s.hair,
  );
  p.poly(
    [
      [29, 24],
      [37, 16],
      [58, 16],
      [64, 19],
      [47, 21],
      [39, 26],
    ],
    s.light,
  );
  p.l(34, 22, 46, 17, "#96a09a");
  p.poly(
    [
      [58, 23],
      [68, 23],
      [71, 38],
      [66, 36],
    ],
    s.light,
  );
  if (look === "hr") {
    p.poly(
      [
        [22, 29],
        [29, 32],
        [28, 66],
        [33, 79],
        [24, 77],
        [19, 59],
      ],
      s.hair,
    );
    p.poly(
      [
        [70, 30],
        [76, 28],
        [77, 61],
        [72, 79],
        [63, 80],
        [69, 61],
      ],
      s.hair,
    );
    p.l(23, 42, 24, 67, s.light, 2);
    p.l(73, 43, 71, 65, s.light, 2);
    p.r(72, 52, 3, 4, P.paper);
  }
  p.l(34, 39, 43, 38, s.hair, 2);
  p.l(54, 38, 63, 39, s.hair, 2);
  p.r(34, 44, 10, 4, P.white);
  p.r(55, 44, 9, 4, P.white);
  p.r(38, 43, 4, 6, s.hair);
  p.r(56, 43, 4, 6, s.hair);
  p.r(39, 44, 1, 2, P.white);
  p.r(57, 44, 1, 2, P.white);
  p.l(34, 43, 44, 43, P.ink);
  p.l(54, 43, 64, 43, P.ink);
  if (look === "planner") {
    for (const x of [32, 53]) {
      p.l(x, 41, x + 13, 41, P.ink);
      p.l(x, 41, x, 50, P.ink);
      p.l(x, 50, x + 13, 50, P.ink);
      p.l(x + 13, 41, x + 13, 50, P.ink);
    }
    p.l(45, 44, 53, 44, P.ink);
    p.l(29, 42, 32, 43, P.ink);
  }
  p.r(48, 47, 2, 10, P.skinDark);
  p.r(49, 54, 4, 2, P.skinDark);
  p.r(48, 48, 2, 5, P.skinLight);
  p.l(43, 62, 55, 62, P.skinDark);
  p.r(46, 63, 7, 1, "#f2d8bb");
  p.r(32, 53, 7, 2, "#d8a38d");
  p.r(59, 53, 6, 2, "#d8a38d");
  p.r(19, 102, 8, 1, s.light);
  p.r(70, 100, 7, 1, P.paper);
}

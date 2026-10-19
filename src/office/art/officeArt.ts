import Phaser from "phaser";
import { P } from "./palette";
export type Painter = {
  c: CanvasRenderingContext2D;
  r: (x: number, y: number, w: number, h: number, col: string) => void;
  l: (
    x: number,
    y: number,
    xx: number,
    yy: number,
    col: string,
    w?: number,
  ) => void;
  poly: (pts: number[][], col: string) => void;
};
function painter(c: CanvasRenderingContext2D): Painter {
  return {
    c,
    r: (x, y, w, h, col) => {
      c.fillStyle = col;
      c.fillRect(x, y, w, h);
    },
    l: (x, y, xx, yy, col, w = 1) => {
      c.strokeStyle = col;
      c.lineWidth = w;
      c.beginPath();
      c.moveTo(x + 0.5, y + 0.5);
      c.lineTo(xx + 0.5, yy + 0.5);
      c.stroke();
    },
    poly: (pts, col) => {
      c.fillStyle = col;
      c.beginPath();
      pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.closePath();
      c.fill();
    },
  };
}
const paper = (p: Painter, x: number, y: number, w = 22, h = 15) => {
  p.r(x + 1, y + 2, w, h, "#536d7860");
  p.r(x, y, w, h, P.paper);
  p.l(x + 4, y + 4, x + w - 4, y + 4, P.blue);
  p.l(x + 4, y + 7, x + w - 7, y + 7, P.light);
  p.l(x + 4, y + 10, x + w - 5, y + 10, P.light);
};
const legs = (p: Painter, w: number, h = 17) => {
  p.r(-w / 2 + 6, -h, 4, h, P.ink);
  p.r(w / 2 - 10, -h, 4, h, P.ink);
  p.r(-w / 2 + 6, -h, 1, h, P.steel);
  p.r(w / 2 - 10, -h, 1, h, P.steel);
};
const slab = (p: Painter, w: number, y: number, col = P.wood) => {
  p.r(-w / 2 + 2, y + 6, w, 8, P.woodDark);
  p.r(-w / 2, y, w, 7, col);
  p.r(-w / 2 + 1, y, w - 2, 2, P.woodLight);
  p.l(-w / 2 + 5, y + 4, w / 2 - 5, y + 4, "#b59c7d");
};
const monitor = (p: Painter, x: number, y: number) => {
  p.r(x + 14, y + 26, 6, 6, P.ink);
  p.r(x + 7, y + 31, 20, 2, P.steel);
  p.r(x, y, 34, 27, P.ink);
  p.r(x + 2, y + 2, 30, 22, P.blue);
  p.r(x + 3, y + 3, 28, 3, P.blueLight);
  for (let i = 0; i < 3; i++) {
    p.r(x + 5 + i * 7, y + 9, 5, 11, "#c7dfd8");
    p.r(x + 6 + i * 7, y + 11, 3, 7, P.line);
  }
  p.r(x + 16, y + 24, 2, 1, P.light);
};
const books = (p: Painter, x: number, y: number, n = 5) => {
  for (let i = 0; i < n; i++) {
    const col = [P.blue, P.paper, P.green, P.pink, P.wood][i % 5];
    p.r(x + i * 6, y - (i % 2) * 2, 5, 20 + (i % 2) * 2, col);
    p.r(x + i * 6 + 1, y + 3, 3, 2, P.white);
    p.r(x + i * 6 + 1, y + 15, 3, 1, P.ink);
  }
};
export const artSpecs: Record<string, (p: Painter) => void> = {
  reception: (p) => {
    legs(p, 162, 19);
    p.r(-78, -32, 156, 30, P.woodDark);
    for (let x = -76; x < 76; x += 8) {
      p.r(x, -30, 6, 25, P.wood);
      p.r(x, -30, 1, 25, P.woodLight);
    }
    slab(p, 168, -42, P.paper);
    p.r(-74, -38, 155, 2, P.light);
    monitor(p, -54, -70);
    paper(p, 20, -40, 26, 18);
    p.r(53, -43, 16, 5, P.green);
    p.r(56, -49, 9, 7, P.white);
    p.r(60, -48, 2, 3, P.green);
    p.r(-20, -21, 40, 11, P.deep);
    p.r(-16, -17, 32, 2, P.white);
    p.r(-9, -13, 18, 1, P.light);
  },
  cabinet: (p) => {
    p.r(-27, -70, 54, 67, P.ink);
    p.r(-25, -68, 49, 62, P.steel);
    for (let y = -65; y < -5; y += 20) {
      p.r(-23, y, 45, 17, P.light);
      p.r(-21, y + 2, 41, 2, "#d9e1d8");
      p.r(-7, y + 7, 13, 4, P.line);
      p.r(-5, y + 8, 9, 2, P.white);
    }
    p.r(-27, -3, 54, 3, P.ink);
    books(p, -20, -91, 6);
  },
  files: (p) => {
    p.r(-30, -72, 60, 69, P.woodDark);
    p.r(-27, -69, 54, 64, P.wood);
    for (let y = -47; y < -5; y += 25) {
      p.r(-27, y, 54, 3, P.woodLight);
      books(p, -24, y - 20, 8);
    }
    p.r(-30, -72, 60, 3, P.woodLight);
    p.r(-29, -3, 5, 3, P.ink);
    p.r(24, -3, 5, 3, P.ink);
  },
  plant: (p) => {
    p.poly(
      [
        [-15, -19],
        [15, -19],
        [11, -2],
        [-10, -2],
      ],
      P.woodDark,
    );
    p.r(-16, -23, 32, 6, P.paper);
    p.r(-12, -19, 24, 3, P.woodLight);
    p.r(-2, -52, 3, 30, P.green);
    for (const [x, y, s] of [
      [-16, -51, 14],
      [6, -62, 16],
      [-12, -69, 14],
      [0, -45, 19],
      [-19, -36, 15],
      [10, -34, 12],
    ]) {
      p.poly(
        [
          [x, y + 5],
          [x + 3, y],
          [x + s - 2, y],
          [x + s, y + 8],
          [x + s - 6, y + 14],
          [x + 2, y + 11],
        ],
        P.green,
      );
      p.r(x + 3, y + 2, s - 7, 3, P.leaf);
      p.r(x + 5, y + 3, 2, 6, P.leafLight);
    }
  },
  sofa: (p) => {
    p.r(-47, -17, 94, 15, P.ink);
    p.r(-49, -46, 98, 27, P.green);
    p.r(-45, -43, 90, 16, "#8daca0");
    for (let x = -43; x < 43; x += 29) {
      p.r(x, -40, 27, 19, "#9cb6aa");
      p.r(x + 2, -38, 23, 2, "#b7c9b7");
      p.r(x, -20, 27, 12, "#79998b");
      p.r(x + 2, -19, 23, 2, "#a1b6a6");
    }
    p.r(-53, -28, 9, 23, P.green);
    p.r(44, -28, 9, 23, P.green);
    p.r(-52, -30, 8, 5, P.leafLight);
    p.r(45, -30, 8, 5, P.leafLight);
    p.r(-45, -3, 5, 3, P.woodDark);
    p.r(40, -3, 5, 3, P.woodDark);
    p.r(-32, -36, 14, 13, P.paper);
    p.r(-29, -34, 8, 2, P.light);
  },
  coffee: (p) => {
    legs(p, 60, 17);
    slab(p, 64, -27);
    paper(p, -22, -25, 25, 16);
    p.r(12, -23, 11, 9, P.white);
    p.r(13, -25, 9, 3, P.woodDark);
    p.r(23, -21, 3, 5, P.light);
  },
  notice: (p) => {
    p.r(-22, -70, 44, 52, P.woodDark);
    p.r(-19, -67, 38, 46, "#bdaf91");
    paper(p, -15, -60, 28, 28);
    p.r(-5, -63, 5, 4, P.blue);
    p.r(-18, -18, 4, 18, P.ink);
    p.r(14, -18, 4, 18, P.ink);
    p.r(-23, -2, 47, 3, P.ink);
    p.r(-10, -53, 18, 2, P.green);
    p.r(-10, -48, 13, 2, P.blue);
  },
  blueprint: (p) => {
    legs(p, 92, 21);
    slab(p, 104, -33);
    p.r(-40, -32, 70, 25, P.blue);
    p.r(-38, -31, 66, 21, "#dce7de");
    for (let x = -35; x < 27; x += 7) p.l(x, -29, x, -12, "#bdcfce");
    for (let y = -29; y < -10; y += 5) p.l(-36, y, 26, y, "#bdcfce");
    p.l(-29, -26, 17, -26, P.blue);
    p.l(-29, -26, -29, -14, P.blue);
    p.l(-29, -14, 17, -14, P.blue);
    p.l(17, -14, 17, -26, P.blue);
    p.l(-7, -26, -7, -14, P.blue);
    p.r(-43, -34, 5, 26, P.paper);
    p.r(28, -34, 5, 26, P.paper);
    p.r(36, -30, 8, 9, P.woodLight);
    p.r(37, -31, 6, 2, P.woodDark);
    p.r(35, -18, 13, 2, P.line);
  },
  computer: (p) => {
    legs(p, 76, 18);
    slab(p, 88, -31, P.light);
    monitor(p, -19, -65);
    p.r(-22, -25, 41, 9, P.ink);
    for (let y = -23; y < -17; y += 3)
      for (let x = -19; x < 16; x += 5) p.r(x, y, 3, 1, P.light);
    p.r(27, -23, 7, 8, P.paper);
    p.r(30, -23, 1, 3, P.line);
    p.r(-37, -51, 12, 20, P.deep);
    p.r(-35, -49, 8, 2, P.blueLight);
    p.r(-34, -35, 2, 2, P.leafLight);
  },
  model: (p) => {
    legs(p, 108, 17);
    slab(p, 118, -30, P.paper);
    p.poly(
      [
        [-49, -23],
        [27, -23],
        [49, -8],
        [-26, -8],
      ],
      "#78938e",
    );
    for (let x = -38; x < 31; x += 22) {
      p.poly(
        [
          [x, -25],
          [x + 15, -32],
          [x + 28, -24],
          [x + 12, -18],
        ],
        "#e4e8dc",
      );
      p.poly(
        [
          [x, -25],
          [x + 12, -18],
          [x + 12, -43],
          [x, -50],
        ],
        "#9cbbc1",
      );
      p.poly(
        [
          [x + 12, -18],
          [x + 28, -24],
          [x + 28, -49],
          [x + 12, -43],
        ],
        "#c5d5cf",
      );
      p.poly(
        [
          [x, -50],
          [x + 16, -56],
          [x + 28, -49],
          [x + 12, -43],
        ],
        "#edf0df",
      );
      for (let y = -38; y < -22; y += 6) {
        p.r(x + 3, y, 6, 2, P.line);
        p.r(x + 17, y - 2, 7, 2, P.blue);
      }
    }
    p.r(-48, -18, 5, 3, P.leaf);
    p.r(35, -13, 5, 3, P.leaf);
    p.r(-22, -8, 49, 4, P.blue);
  },
  chair: (p) => {
    p.r(-14, -35, 28, 22, P.ink);
    p.r(-12, -33, 24, 17, P.blue);
    p.r(-10, -32, 20, 3, P.blueLight);
    p.r(-14, -14, 28, 8, P.line);
    p.r(-12, -13, 24, 3, P.steel);
    p.r(-2, -6, 4, 6, P.ink);
    p.r(-16, -1, 32, 2, P.ink);
    p.r(-16, -1, 3, 3, P.deep);
    p.r(13, -1, 3, 3, P.deep);
  },
  board: (p) => {
    p.r(-60, -74, 120, 61, P.ink);
    p.r(-57, -71, 114, 55, P.white);
    p.r(-56, -70, 112, 2, "#f6f5e5");
    for (let x = -46; x < 43; x += 28) {
      paper(p, x, -62, 23, 34);
      p.r(x + 4, -54, 15, 7, P.blueLight);
      p.l(x + 5, -45, x + 18, -45, P.blue);
    }
    p.r(-62, -14, 124, 4, P.steel);
    p.r(30, -15, 15, 2, P.blue);
    p.r(-49, -10, 3, 10, P.ink);
    p.r(47, -10, 3, 10, P.ink);
  },
  water: (p) => {
    p.r(-19, -40, 38, 38, P.light);
    p.r(-16, -37, 32, 23, P.white);
    p.r(-11, -32, 22, 14, P.ink);
    p.r(-8, -31, 5, 5, P.blue);
    p.r(4, -31, 5, 5, P.pink);
    p.r(-5, -22, 9, 5, P.paper);
    p.r(-13, -13, 26, 8, P.steel);
    p.r(-11, -12, 22, 1, P.white);
    p.r(-12, -61, 24, 20, P.blue);
    p.r(-9, -64, 18, 3, P.blueLight);
    p.r(-9, -59, 5, 16, P.blueLight);
    p.r(-20, -2, 40, 3, P.ink);
  },
  pantry: (p) => {
    p.r(-50, -36, 100, 34, P.wood);
    p.r(-48, -31, 46, 27, P.woodLight);
    p.r(1, -31, 46, 27, P.woodLight);
    p.r(-8, -20, 3, 7, P.ink);
    p.r(6, -20, 3, 7, P.ink);
    slab(p, 108, -43, P.paper);
    p.r(-36, -66, 23, 24, P.ink);
    p.r(-33, -63, 17, 8, P.line);
    p.r(-30, -53, 12, 3, P.white);
    p.r(-29, -48, 10, 7, P.paper);
    p.r(-38, -43, 28, 3, P.steel);
    for (let x = 4; x < 40; x += 14) {
      p.r(x, -52, 10, 10, P.white);
      p.r(x + 2, -54, 6, 3, P.woodDark);
    }
  },
  printer: (p) => {
    legs(p, 70, 12);
    slab(p, 80, -23, P.steel);
    p.r(-27, -46, 54, 23, P.ink);
    p.r(-25, -44, 50, 19, P.light);
    p.r(-19, -35, 38, 7, P.deep);
    p.r(-14, -29, 28, 9, P.paper);
    p.r(-21, -58, 42, 14, P.steel);
    p.r(-19, -56, 38, 11, P.white);
    p.r(-15, -60, 30, 8, P.paper);
    p.r(12, -41, 8, 3, P.green);
    p.r(14, -40, 3, 1, P.leafLight);
  },
  workdesk: (p) => {
    legs(p, 91, 19);
    slab(p, 104, -31);
    paper(p, -43, -30, 30, 18);
    books(p, 7, -51, 5);
    p.r(-3, -34, 7, 5, P.blue);
    p.r(-2, -40, 5, 7, P.paper);
  },
  sign: (p) => {
    p.r(-25, -58, 50, 39, P.ink);
    p.r(-22, -55, 44, 33, P.paper);
    p.r(-18, -49, 35, 3, P.green);
    p.r(-17, -41, 18, 2, P.line);
    p.r(-17, -34, 26, 2, P.line);
    p.poly(
      [
        [9, -42],
        [16, -38],
        [9, -34],
      ],
      P.green,
    );
    p.r(-2, -19, 4, 18, P.ink);
    p.r(-19, -1, 38, 2, P.steel);
  },
  "site-door": (p) => {
    p.r(-50, -75, 100, 75, P.ink);
    p.r(-46, -71, 43, 68, P.steel);
    p.r(3, -71, 43, 68, P.steel);
    p.r(-42, -65, 35, 25, P.blueLight);
    p.r(7, -65, 35, 25, P.blueLight);
    for (let x = -38; x < 39; x += 13) p.r(x, -63, 2, 21, P.line);
    p.r(-10, -26, 3, 11, P.ink);
    p.r(7, -26, 3, 11, P.ink);
    p.r(-34, -36, 25, 7, P.green);
    p.r(9, -36, 25, 7, P.green);
    p.r(-31, -34, 18, 2, P.paper);
    p.r(13, -34, 18, 2, P.paper);
    p.r(-49, -4, 98, 4, P.woodLight);
  },
};
export function makeOfficeArt(scene: Phaser.Scene) {
  const floor = document.createElement("canvas");
  floor.width = 192;
  floor.height = 32;
  const f = painter(floor.getContext("2d")!);
  for (let tile = 0; tile < 6; tile++) {
    const x = tile * 32;
    const base = tile < 2 ? "#bdc6bf" : tile < 4 ? "#b6b8a7" : "#9bafa9";
    f.r(x, 0, 32, 32, base);
    for (let j = 0; j < 18; j++) {
      const xx = (j * 13 + tile * 7) % 32,
        yy = (j * 17 + tile * 3) % 32;
      f.r(
        x + xx,
        yy,
        j % 3 ? 1 : 2,
        1,
        tile < 2 ? "#b3beb8" : tile < 4 ? "#aaad9e" : "#93a6a1",
      );
    }
    if (tile === 2 || tile === 3) {
      for (let y = 0; y < 32; y += 8) {
        f.l(x, y, x + 31, y, "#9eab9f");
        f.l(
          x + ((y / 8 + tile) % 2) * 16,
          y,
          x + ((y / 8 + tile) % 2) * 16,
          y + 7,
          "#a2a99a",
        );
      }
    }
  }
  scene.textures.addCanvas("office-floor", floor);
  for (const [name, draw] of Object.entries(artSpecs)) {
    const canvas = document.createElement("canvas");
    canvas.width = 192;
    canvas.height = 128;
    const c = canvas.getContext("2d")!;
    c.imageSmoothingEnabled = false;
    c.translate(96, 120);
    const p = painter(c);
    p.poly(
      [
        [-42, -8],
        [-35, -14],
        [36, -14],
        [47, -6],
        [36, 1],
        [-34, 1],
      ],
      "#344b5a30",
    );
    draw(p);
    scene.textures.addCanvas("office-" + name, canvas);
  }
}
export { painter };

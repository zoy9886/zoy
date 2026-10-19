export const WIDTH = 40,
  HEIGHT = 29,
  CELL = 32;
export type Fixture = {
  id: string;
  art: string;
  x: number;
  y: number;
  label?: string;
  solid?: boolean;
  wide?: number;
};
export const fixtures: Fixture[] = [
  { id: "entry", art: "sign", x: 4, y: 23, label: "現場導覽" },
  { id: "bim", art: "bim", x: 6, y: 5, label: "施工圖說" },
  { id: "desk", art: "desk", x: 9, y: 5 },
  { id: "quality", art: "quality", x: 32, y: 5, label: "品質查驗台" },
  { id: "tools", art: "tools", x: 29, y: 6 },
  { id: "rebar", art: "rebar", x: 7, y: 13, label: "鋼筋綁紮區" },
  { id: "rebar2", art: "rebar", x: 9, y: 13 },
  { id: "rebar3", art: "rebar", x: 7, y: 15 },
  { id: "timber", art: "timber", x: 29, y: 14, label: "模板堆置區" },
  { id: "timber2", art: "timber", x: 32, y: 14 },
  { id: "pallet", art: "pallet", x: 29, y: 17 },
  { id: "scaffold", art: "scaffold", x: 15, y: 6, label: "支撐架" },
  { id: "scaffold2", art: "scaffold", x: 17, y: 6 },
  { id: "scaffold3", art: "scaffold", x: 15, y: 8 },
  { id: "scaffold4", art: "scaffold", x: 17, y: 8 },
  { id: "opening", art: "opening", x: 22, y: 14, label: "樓板開口" },
  { id: "rail1", art: "rail", x: 22, y: 13 },
  { id: "rail2", art: "rail", x: 22, y: 16 },
  { id: "cone1", art: "cone", x: 20, y: 14 },
  { id: "cone2", art: "cone", x: 25, y: 14 },
  { id: "extinguisher", art: "extinguisher", x: 3, y: 21, label: "滅火器" },
  { id: "pipe1", art: "pipe", x: 32, y: 23, label: "管材堆置" },
  { id: "pipe2", art: "pipe", x: 32, y: 25 },
  { id: "tool2", art: "tools", x: 28, y: 24 },
  { id: "pallet2", art: "pallet", x: 7, y: 23 },
  { id: "pallet3", art: "timber", x: 9, y: 23 },
];
for (const x of [3, 13, 25, 36])
  for (const y of [3, 11, 20, 27])
    fixtures.push({ id: `col-${x}-${y}`, art: "column", x, y });
export const zones = [
  { x: 5, y: 3, text: "01  工程師工作區", color: "#b9d5df" },
  { x: 14, y: 3, text: "02  模板支撐", color: "#b9d5df" },
  { x: 29, y: 3, text: "03  品質查驗", color: "#b9d5df" },
  { x: 5, y: 11, text: "04  鋼筋工程", color: "#dde0c7" },
  { x: 28, y: 12, text: "05  材料堆置", color: "#dde0c7" },
  { x: 5, y: 21, text: "06  進料暫存", color: "#b9d5df" },
];
export const npcs = [
  {
    id: "engineer",
    x: 12,
    y: 17,
    name: "林學長",
    role: "現場工程師",
    tint: 0xffffff,
  },
  {
    id: "safety",
    x: 18,
    y: 23,
    name: "陳姐",
    role: "職安工程師",
    tint: 0xf5dba1,
  },
  { id: "qc", x: 34, y: 8, name: "許學姐", role: "品管工程師", tint: 0xb9dce7 },
];

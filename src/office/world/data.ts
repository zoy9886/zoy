export const TILE = 32,
  COLS = 32,
  ROWS = 34;
export type Rect = { x: number; y: number; w: number; h: number };
export type Prop = {
  id: string;
  art: string;
  x: number;
  y: number;
  name?: string;
  target?: "blueprint" | "computer" | "model";
  block?: Rect;
  flip?: boolean;
};
// Coordinates are pixels. Props use their bottom-centre as an anchor.
export const walls: Rect[] = [
  { x: 0, y: 0, w: 1024, h: 56 },
  { x: 0, y: 1056, w: 1024, h: 32 },
  { x: 0, y: 32, w: 32, h: 1024 },
  { x: 992, y: 32, w: 32, h: 1024 },
];
function wall(x: number, y: number, w: number, h: number) {
  walls.push({ x: x * 32, y: y * 32, w: w * 32, h: h * 32 });
}
wall(13, 1, 1, 7);
wall(13, 10, 1, 10);
wall(13, 22, 1, 4);
wall(18, 1, 1, 7);
wall(18, 10, 1, 9);
wall(18, 21, 1, 5);
wall(1, 13, 5, 1);
wall(8, 13, 5, 1);
wall(19, 16, 5, 1);
wall(26, 16, 5, 1);
export const props: Prop[] = [
  {
    id: "hr-counter",
    art: "reception",
    x: 224,
    y: 170,
    block: { x: -80, y: -29, w: 160, h: 29 },
  },
  { id: "hr-cabinet", art: "cabinet", x: 91, y: 123 },
  { id: "hr-files", art: "files", x: 345, y: 130 },
  { id: "hr-plant", art: "plant", x: 361, y: 241 },
  { id: "hr-sofa", art: "sofa", x: 115, y: 330 },
  { id: "hr-table", art: "coffee", x: 235, y: 341, name: "接待區的小桌" },
  { id: "notice", art: "notice", x: 329, y: 350, name: "新生歡迎看板" },
  {
    id: "blueprint",
    art: "blueprint",
    x: 735,
    y: 166,
    name: "3F 結構圖說",
    target: "blueprint",
    block: { x: -47, y: -25, w: 94, h: 25 },
  },
  {
    id: "computer",
    art: "computer",
    x: 907,
    y: 239,
    name: "協作工作站",
    target: "computer",
    block: { x: -38, y: -22, w: 76, h: 22 },
  },
  {
    id: "model",
    art: "model",
    x: 852,
    y: 405,
    name: "辦公樓層模型",
    target: "model",
    block: { x: -50, y: -32, w: 100, h: 32 },
  },
  { id: "plan-files", art: "files", x: 663, y: 122 },
  { id: "plan-plant", art: "plant", x: 953, y: 120 },
  { id: "plan-chair", art: "chair", x: 910, y: 315 },
  { id: "plan-stool", art: "chair", x: 709, y: 223 },
  { id: "plan-board", art: "board", x: 852, y: 104 },
  { id: "lounge-sofa", art: "sofa", x: 140, y: 591 },
  { id: "lounge-table", art: "coffee", x: 264, y: 625, name: "休息區的筆記" },
  { id: "lounge-plant", art: "plant", x: 363, y: 536 },
  { id: "water", art: "water", x: 83, y: 735, name: "飲水機" },
  { id: "pantry", art: "pantry", x: 280, y: 783, name: "茶水櫃" },
  { id: "archive1", art: "cabinet", x: 677, y: 610 },
  { id: "archive2", art: "files", x: 764, y: 611 },
  { id: "printer", art: "printer", x: 903, y: 666, name: "共用印表機" },
  { id: "archive-desk", art: "workdesk", x: 789, y: 765, name: "文件整理桌" },
  { id: "lobby-sofa", art: "sofa", x: 350, y: 952 },
  { id: "lobby-sofa2", art: "sofa", x: 680, y: 952 },
  { id: "lobby-table", art: "coffee", x: 420, y: 975, name: "公司的工程年鑑" },
  { id: "entry-plant", art: "plant", x: 430, y: 1010 },
  { id: "entry-plant2", art: "plant", x: 592, y: 1010 },
  { id: "wayfinding", art: "sign", x: 378, y: 880, name: "樓層導覽" },
  {
    id: "exit",
    art: "site-door",
    x: 512,
    y: 1048,
    name: "前往施工現場",
    block: { x: -50, y: -12, w: 100, h: 12 },
  },
];
export const npcs = [
  {
    id: "hr",
    name: "雅涵",
    role: "HR・實習夥伴",
    x: 266,
    y: 234,
    look: "hr",
    main: false,
  },
  {
    id: "planner",
    name: "林以安",
    role: "規劃工程師",
    x: 735,
    y: 294,
    look: "planner",
    main: true,
  },
  {
    id: "colleague",
    name: "阿哲",
    role: "工務助理",
    x: 326,
    y: 704,
    look: "colleague",
    main: false,
  },
];
export const regions = [
  {
    id: "hr",
    name: "HR 室",
    subtitle: "每一次相遇，都是新的起點",
    rect: { x: 32, y: 56, w: 384, h: 360 },
  },
  {
    id: "planning",
    name: "規劃室",
    subtitle: "把圖紙上的想法，變成共同的語言",
    rect: { x: 608, y: 56, w: 384, h: 456 },
  },
  {
    id: "lounge",
    name: "交流休息區",
    subtitle: "現場以外，也有值得聽的故事",
    rect: { x: 32, y: 448, w: 384, h: 384 },
  },
  {
    id: "archive",
    name: "共用事務區",
    subtitle: "每一份文件，都有它的來處",
    rect: { x: 608, y: 544, w: 384, h: 288 },
  },
  {
    id: "lobby",
    name: "入口集合區",
    subtitle: "第一天・從這裡出發",
    rect: { x: 32, y: 832, w: 960, h: 224 },
  },
  {
    id: "hall",
    name: "公共走道",
    subtitle: "左側 HR・右側規劃室",
    rect: { x: 448, y: 56, w: 128, h: 776 },
  },
];
export function regionAt(x: number, y: number) {
  return (
    regions.find(
      (r) =>
        x >= r.rect.x &&
        x < r.rect.x + r.rect.w &&
        y >= r.rect.y &&
        y < r.rect.y + r.rect.h,
    ) || regions[5]
  );
}
export const targets = props
  .filter((p) => p.name)
  .map((p) => ({
    id: p.id,
    x: p.x,
    y: p.id === "exit" ? 1012 : p.y + 22,
    label: p.name!,
  }))
  .concat(
    npcs.map((n) => ({
      id: n.id,
      x: n.x,
      y: n.y,
      label: n.name + "・" + n.role,
    })),
  );

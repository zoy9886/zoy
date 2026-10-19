import Phaser from "phaser";
import { makeOfficeArt } from "../art/officeArt";
import { makePeople } from "../art/people";
import { P } from "../art/palette";
import {
  COLS,
  ROWS,
  props,
  walls,
  npcs,
  targets,
  regionAt,
  type Rect,
} from "./data";
import { OfficePlayer } from "./OfficePlayer";
import { TouchControls } from "../../ui/controls";
import { ProgressStore, type EvidenceId } from "../systems/progress";
import { OfficeStory } from "../systems/story";
import { OfficeAudio } from "../systems/audio";
import { OfficeDialogue } from "../ui/Dialogue";
import { EvidenceUI } from "../ui/Evidence";
import { Journal } from "../ui/Journal";
export class OfficeScene extends Phaser.Scene {
  private store = new ProgressStore();
  private touch = new TouchControls();
  private dialogue = new OfficeDialogue();
  private story = new OfficeStory(this.store, this.dialogue);
  private evidence = new EvidenceUI(this.store);
  private audio = new OfficeAudio();
  private journal = new Journal(this.store);
  player!: OfficePlayer;
  private blockers: Rect[] = [];
  private markers = new Map<string, Phaser.GameObjects.Container>();
  private lastSave = 0;
  private currentArea = "";
  private nearest?: (typeof targets)[number];
  private toastTimer?: ReturnType<typeof setTimeout>;
  private areaTimer?: ReturnType<typeof setTimeout>;
  private title = true;
  constructor() {
    super("office");
  }
  create() {
    makeOfficeArt(this);
    makePeople(this);
    this.drawFloor();
    const solids = this.physics.add.staticGroup();
    const block = (r: Rect) => {
      this.blockers.push(r);
      const zone = this.add.zone(r.x + r.w / 2, r.y + r.h / 2, r.w, r.h);
      this.physics.add.existing(zone, true);
      solids.add(zone);
    };
    walls.forEach((r) => {
      this.drawWall(r);
      block(r);
    });
    props.forEach((p) => {
      const image = this.add
        .image(p.x, p.y, "office-" + p.art)
        .setOrigin(0.5, 120 / 128)
        .setDepth(p.y);
      if (p.flip) image.setFlipX(true);
      const b = p.block || { x: -28, y: -23, w: 56, h: 23 };
      block({ x: p.x + b.x, y: p.y + b.y, w: b.w, h: b.h });
      if (p.target) {
        const badge = this.badge(p.x, p.y - 91, "!", 0xd4b980);
        this.markers.set(p.id, badge);
        badge.setVisible(false);
      }
    });
    npcs.forEach((n) => {
      const sprite = this.add
        .sprite(n.x, n.y, "person-" + n.look, 0)
        .setOrigin(0.5, 1)
        .setDepth(n.y);
      this.tweens.add({
        targets: sprite,
        y: n.y - 1,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      block({ x: n.x - 8, y: n.y - 11, w: 16, h: 13 });
      this.add
        .text(n.x, n.y - 57, n.name, {
          fontFamily: "sans-serif",
          fontSize: "10px",
          color: "#f4eedc",
          backgroundColor: "#3b5664e6",
          padding: { x: 5, y: 3 },
        })
        .setOrigin(0.5)
        .setDepth(n.y + 90);
      if (n.main) {
        const marker = this.add
          .container(n.x, n.y - 75, [
            this.add.triangle(0, 0, 0, 0, 10, 0, 5, 8, 0xd36b69).setOrigin(0.5),
          ])
          .setDepth(n.y + 95);
        this.markers.set(n.id, marker);
        this.tweens.add({
          targets: marker,
          y: n.y - 79,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    });
    this.drawArchitectureDetails();
    const s = this.store.state;
    let x = s.x,
      y = s.y;
    if (!this.safe(x, y)) {
      x = 512;
      y = 925;
    }
    s.x = x;
    s.y = y;
    this.player = new OfficePlayer(this, x, y);
    this.player.setHelmet(s.hr);
    this.physics.world.setBounds(32, 56, 960, 1000);
    this.physics.add.collider(this.player.sprite, solids);
    this.cameras.main
      .setBounds(-180, -180, COLS * 32 + 360, ROWS * 32 + 360)
      .setZoom(1.3)
      .setBackgroundColor("#344e59");
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.scale.on("resize", () =>
      this.cameras.main.setSize(this.scale.width, this.scale.height),
    );
    this.store.onChange = () => this.refresh();
    this.store.onNotice = (t) => {
      this.toast(t);
      this.audio.chime();
    };
    this.setupUI();
    this.refresh();
    this.refreshMarkers();
    window.addEventListener("pagehide", () => this.persist());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.touch.directions.clear();
        this.input.keyboard?.resetKeys();
        this.persist();
      }
    });
    // Read-only state and geometry: browser tests navigate with real keyboard input.
    Object.defineProperty(window, "__office", {
      configurable: true,
      get: () => ({
        x: this.player.sprite.x,
        y: this.player.sprite.y,
        direction: this.player.direction,
        area: regionAt(this.player.sprite.x, this.player.sprite.y).id,
        state: JSON.parse(JSON.stringify(this.store.state)),
        blocked: this.blocked(),
        markers: [...this.markers]
          .filter(([, m]) => m.visible)
          .map(([id]) => id),
        targets,
        blockers: this.blockers.map((r) => ({ ...r })),
        world: { width: 1024, height: 1088 },
        camera: {
          x: this.cameras.main.scrollX,
          y: this.cameras.main.scrollY,
          zoom: this.cameras.main.zoom,
        },
      }),
    });
  }
  private drawFloor() {
    const data = Array.from({ length: ROWS }, (_, y) =>
      Array.from({ length: COLS }, (_, x) => {
        const wood = (x < 13 && y < 13) || (x > 18 && y < 16);
        const carpet = x < 13 && y > 13 && y < 26;
        return (wood ? 2 : carpet ? 4 : 0) + ((x * 7 + y * 11) % 2);
      }),
    );
    const map = this.make.tilemap({ data, tileWidth: 32, tileHeight: 32 });
    const tiles = map.addTilesetImage("office", "office-floor", 32, 32)!;
    map.createLayer(0, tiles, 0, 0)!.setDepth(-100);
    const g = this.add.graphics().setDepth(-90);
    g.lineStyle(1, 0x9aada7, 0.4);
    for (let y = 64; y < 1088; y += 96) g.lineBetween(448, y, 576, y);
    g.fillStyle(0x6e9294, 0.45);
    g.fillRect(458, 835, 108, 99);
    g.lineStyle(2, 0xc8d6c8, 0.6);
    g.strokeRect(465, 843, 94, 82);
    g.fillStyle(0xdbe3d0, 0.45);
    g.fillTriangle(500, 872, 524, 872, 512, 860);
    g.lineStyle(2, 0xc4d1bb, 0.4);
    g.strokeRect(55, 478, 330, 320);
    // Small carpet medallions anchor furniture into deliberate room arrangements.
    g.fillStyle(0xa6bab0, 0.6);
    g.fillRect(640, 343, 315, 123);
    g.lineStyle(2, 0xd1d8be, 0.6);
    g.strokeRect(646, 349, 303, 111);
    g.fillStyle(0xb6c5b3, 0.6);
    g.fillRect(64, 889, 315, 113);
    g.fillRect(672, 889, 275, 113);
  }
  private drawWall(r: Rect) {
    const g = this.add.graphics().setDepth(r.y + r.h + 3);
    g.fillStyle(0x263f4b, 0.2);
    g.fillRect(r.x + 5, r.y + 8, r.w + 5, r.h + 6);
    g.fillStyle(0x66828a);
    g.fillRect(r.x, r.y, r.w, r.h);
    g.fillStyle(0xbccdc4);
    g.fillRect(r.x, r.y - 14, r.w, r.h);
    g.fillStyle(0xdde3d5);
    g.fillRect(r.x, r.y - 16, r.w, 4);
    g.fillStyle(0x92aaa7);
    g.fillRect(r.x + 3, r.y - 9, 3, r.h - 2);
    g.fillStyle(0x78958f);
    g.fillRect(r.x, r.y + r.h - 14, r.w, 8);
    g.fillStyle(0x405e6b);
    g.fillRect(r.x, r.y + r.h - 6, r.w, 6);
    if (r.w > r.h) {
      g.lineStyle(1, 0x9db6b0);
      for (let x = r.x + 48; x < r.x + r.w; x += 64)
        g.lineBetween(x, r.y + 2, x, r.y + r.h - 15);
    } else {
      g.lineStyle(1, 0x95aaa8);
      for (let y = r.y + 46; y < r.y + r.h - 15; y += 64)
        g.lineBetween(r.x + 4, y, r.x + r.w - 4, y);
    }
  }
  private drawArchitectureDetails() {
    const g = this.add.graphics().setDepth(-50);
    g.fillStyle(0xf3f0cc, 0.15);
    g.fillPoints(
      [
        { x: 70, y: 56 },
        { x: 205, y: 56 },
        { x: 365, y: 322 },
        { x: 218, y: 322 },
      ],
      true,
    );
    g.fillPoints(
      [
        { x: 669, y: 56 },
        { x: 857, y: 56 },
        { x: 968, y: 339 },
        { x: 803, y: 339 },
      ],
      true,
    );
    const windows = this.add.graphics().setDepth(58);
    for (const x of [73, 236, 656, 838]) {
      windows.fillStyle(0x4d7180);
      windows.fillRect(x, 12, 116, 30);
      windows.fillStyle(0xa8cbd1);
      windows.fillRect(x + 3, 14, 110, 23);
      windows.fillStyle(0xd6e5d7);
      windows.fillRect(x + 4, 14, 108, 7);
      for (let j = 8; j < 100; j += 21) {
        windows.fillStyle(j % 2 ? 0x8eaeb1 : 0x90b6bf);
        windows.fillRect(x + j, 26 - (j % 3) * 2, 12, 12);
      }
      windows.lineStyle(3, 0x648790);
      windows.lineBetween(x + 57, 13, x + 57, 38);
      windows.fillStyle(0xdce4d8);
      windows.fillRect(x - 3, 40, 122, 4);
    }
    // Door thresholds, trim and room signs preserve architectural continuity.
    const trim = this.add.graphics().setDepth(-60);
    trim.fillStyle(0x6f8f8b);
    for (const [x, y, w, h] of [
      [416, 256, 32, 64],
      [416, 640, 32, 64],
      [576, 256, 32, 64],
      [576, 608, 32, 64],
      [192, 416, 64, 32],
      [768, 512, 64, 32],
    ]) {
      trim.fillRect(x, y, w, h);
      trim.lineStyle(2, 0xc2c8ac);
      trim.strokeRect(x + 3, y + 3, w - 6, h - 6);
    }
    for (const [x, y, label, eng] of [
      [70, 76, "HR 人資室", "HUMAN RESOURCES"],
      [634, 73, "規劃室", "PLANNING STUDIO"],
      [64, 479, "交流休息區", "TAKE A BREATH"],
      [641, 566, "共用事務區", "SHARED WORKSPACE"],
    ] as const) {
      this.add
        .text(x, y, label, {
          fontSize: "13px",
          fontFamily: "sans-serif",
          color: "#e8ebd9",
          backgroundColor: "#4b6e79",
          padding: { x: 9, y: 6 },
        })
        .setDepth(y + 1);
      this.add
        .text(x + 1, y + 32, eng, {
          fontSize: "7px",
          fontFamily: "monospace",
          color: "#728d8b",
          letterSpacing: 1,
        })
        .setDepth(y + 1);
    }
    this.add
      .text(512, 1003, "施工通道・下一階段開放", {
        fontFamily: "sans-serif",
        fontSize: "9px",
        color: "#e5e7d5",
        backgroundColor: "#405c68",
        padding: { x: 6, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(1100);
    // Ceiling fixtures and wall clock give the office a working-day rhythm.
    const ceiling = this.add.graphics().setDepth(60);
    for (const x of [487])
      for (const y of [160, 420, 710]) {
        ceiling.fillStyle(0x71908e);
        ceiling.fillRect(x, y, 50, 8);
        ceiling.fillStyle(0xe8ebd6);
        ceiling.fillRect(x + 3, y + 2, 44, 3);
      }
    const clock = this.add.graphics().setDepth(75);
    clock.fillStyle(0x486775);
    clock.fillRect(351, 68, 21, 22);
    clock.fillStyle(0xe4e7d9);
    clock.fillRect(353, 70, 17, 17);
    clock.lineStyle(1, 0x486775);
    clock.lineBetween(361, 78, 361, 73);
    clock.lineBetween(361, 78, 366, 80);
  }
  private badge(x: number, y: number, label: string, color: number) {
    const bg = this.add.graphics();
    bg.fillStyle(0x2a4756, 0.95);
    bg.fillRoundedRect(-9, -12, 18, 24, 3);
    bg.lineStyle(1, color, 0.9);
    bg.strokeRoundedRect(-9, -12, 18, 24, 3);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: "sans-serif",
        fontSize: "15px",
        fontStyle: "bold",
        color: "#f0dab1",
      })
      .setOrigin(0.5);
    const container = this.add.container(x, y, [bg, text]).setDepth(y + 200);
    this.tweens.add({
      targets: container,
      y: y - 3,
      duration: 900,
      repeat: -1,
      yoyo: true,
    });
    return container;
  }
  private setupUI() {
    const saved = !!this.store.state.name;
    const continueButton =
      document.querySelector<HTMLButtonElement>("#continue")!;
    continueButton.hidden = !saved;
    if (saved)
      continueButton.textContent = `繼續 ${this.store.state.name} 的實習 →`;
    continueButton.addEventListener("click", () => {
      this.title = false;
      (document.querySelector("#title-screen") as HTMLElement).hidden = true;
      this.refresh();
    });
    document.querySelector("#new-game")!.addEventListener("click", () => {
      if (this.store.state.name)
        document
          .querySelector<HTMLDialogElement>("#restart-dialog")!
          .showModal();
      else
        document.querySelector<HTMLDialogElement>("#name-dialog")!.showModal();
    });
    document
      .querySelector("#name-back")!
      .addEventListener("click", () =>
        document.querySelector<HTMLDialogElement>("#name-dialog")!.close(),
      );
    document.querySelector("#name-form")!.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document
        .querySelector<HTMLInputElement>("#player-name")!
        .value.trim();
      if (!name) {
        document
          .querySelector<HTMLInputElement>("#player-name")!
          .setCustomValidity("請輸入姓名");
        document
          .querySelector<HTMLInputElement>("#player-name")!
          .reportValidity();
        return;
      }
      this.store.begin(name);
      this.player.sprite.setPosition(512, 925);
      this.player.setHelmet(false);
      this.title = false;
      (document.querySelector("#title-screen") as HTMLElement).hidden = true;
      document.querySelector<HTMLDialogElement>("#name-dialog")!.close();
      this.dialogue.show(
        { name: "實習手冊", role: "第一天・09:00", look: "intern" },
        [
          {
            title: "一扇門，一個新的開始",
            text: "早上的辦公室傳來印表機與談話聲。你把背包往肩上拉了拉，走進豐譽的第一天，就從這裡開始。",
          },
          {
            title: "先找到一個熟悉的名字",
            text: "報到通知寫著：「請到 HR 室找雅涵。」沿中央走道往北，左側就是 HR 室。靠近人物按 E、空白鍵或右下角互動；手機用左下方向鍵移動。",
          },
        ],
      );
    });
    document
      .querySelector("#player-name")!
      .addEventListener("input", () =>
        document
          .querySelector<HTMLInputElement>("#player-name")!
          .setCustomValidity(""),
      );
    document
      .querySelector("#confirm-restart")!
      .addEventListener("click", () => {
        document.querySelector<HTMLDialogElement>("#restart-dialog")!.close();
        document.querySelector<HTMLDialogElement>("#journal")!.close();
        document.querySelector<HTMLDialogElement>("#name-dialog")!.showModal();
      });
    document.querySelector("#sound")!.addEventListener("click", async () => {
      try {
        const on = await this.audio.toggle();
        const b = document.querySelector<HTMLButtonElement>("#sound")!;
        b.querySelector("span")!.textContent = on ? "ON" : "OFF";
        b.setAttribute("aria-label", on ? "關閉環境音" : "開啟環境音");
      } catch {
        this.toast("此瀏覽器暫時無法播放聲音");
      }
    });
  }
  update(time: number) {
    if (!this.player) return;
    const blocked = this.blocked();
    const moving = this.player.update(this.touch, blocked);
    if (moving) this.audio.step(time);
    const pos = this.player.sprite;
    this.nearest = targets
      .map((t) => ({
        ...t,
        d: Phaser.Math.Distance.Between(t.x, t.y, pos.x, pos.y),
      }))
      .filter((t) => t.d < 68)
      .sort((a, b) => a.d - b.d)[0];
    const prompt = document.querySelector("#prompt")!;
    prompt.textContent = this.nearest
      ? `互動 · ${this.nearest.label}`
      : "探索辦公室 · 靠近人物或物件互動";
    prompt.classList.toggle("near", !!this.nearest);
    document
      .querySelector("#interact")!
      .classList.toggle("available", !!this.nearest && !blocked);
    const trigger =
      (Phaser.Input.Keyboard.JustDown(this.player.keys.E) &&
        !this.player.keys.E.originalEvent?.defaultPrevented) ||
      (Phaser.Input.Keyboard.JustDown(this.player.keys.SPACE) &&
        !this.player.keys.SPACE.originalEvent?.defaultPrevented) ||
      this.touch.interact;
    this.touch.interact = false;
    if (trigger && !blocked && this.nearest) {
      this.touch.directions.clear();
      this.interact(this.nearest.id);
    }
    const area = regionAt(pos.x, pos.y);
    if (!this.title && area.id !== this.currentArea) {
      this.currentArea = area.id;
      document.querySelector("#area")!.textContent = "豐譽工程・" + area.name;
      const box = document.querySelector("#area-toast")!;
      box.textContent = area.name + " / " + area.subtitle;
      box.classList.add("visible");
      clearTimeout(this.areaTimer);
      this.areaTimer = setTimeout(() => box.classList.remove("visible"), 2800);
    }
    if (time - this.lastSave > 2000 && !blocked) {
      this.persist();
      this.lastSave = time;
    }
  }
  private interact(id: string) {
    if (npcs.some((n) => n.id === id)) {
      this.story.talk(id);
      return;
    }
    const target = props.find((p) => p.id === id);
    if (target?.target) {
      if (["active", "ready", "complete"].includes(this.store.state.planning))
        this.evidence.show(target.target as EvidenceId);
      else
        this.dialogue.show(
          { name: "實習筆記", role: "環境觀察", look: "intern" },
          [
            {
              title: target.name!,
              text: "這裡正在準備專案協調資料。先找林以安了解工作內容，再一起調查設備；現在先不翻動同事的文件。",
            },
          ],
        );
      return;
    }
    const lines: Record<string, { title: string; text: string }[]> = {
      "hr-table": [
        {
          title: "一張手寫的小卡",
          text: "「給每一位新同學：今天不需要什麼都會。願意觀察、願意問，就是很好的開始。」卡片旁邊，整齊排著幾只乾淨的杯子。",
        },
      ],
      notice: [
        {
          title: "每個名字，都是一段故事",
          text: "看板上有實習時間表、緊急聯絡資訊，以及一張大家在工地合照的照片。角落的便條寫著：「安全、品質、溝通，缺一不可。」",
        },
      ],
      "lounge-table": [
        {
          title: "一段被劃線的句子",
          text: "有人把工程雜誌翻到協作專題，底下畫了一條線：「問題被及早說出來，往往就是改善的起點。」頁邊還放著一支快沒墨的筆。",
        },
      ],
      water: [
        {
          title: "留一點時間照顧自己",
          text: "飲水機旁貼著今天的清潔紀錄。接一杯水，看看窗邊的植物，辦公室的節奏似乎也沒那麼陌生了。",
        },
      ],
      pantry: [
        {
          title: "茶水間的小規矩",
          text: "咖啡機旁寫著：「最後一杯，記得補水。」工程的細節很多，照顧一起工作的人，也從這些小事開始。",
        },
      ],
      printer: [
        {
          title: "印表機亮著待機燈",
          text: "出紙盤上的標籤提醒：「列印前確認版次；作廢文件請依規定處理。」同一張圖紙，可能因為日期不同而有完全不同的意義。",
        },
      ],
      "archive-desk": [
        {
          title: "每份文件都有編號",
          text: "整理桌上放著文件收發紀錄。誰核定、何時更新、送到誰手裡，都留下了清楚的路徑。這些細節讓團隊能追溯共同使用的資訊。",
        },
      ],
      "lobby-table": [
        {
          title: "翻開一本工程年鑑",
          text: "照片記錄一塊空地如何成為一棟建築。每一頁都有不同職務的人：有人規劃、有人管理施工、有人守護安全、有人把關品質。你想，也許自己的筆記會是下一個起點。",
        },
      ],
      wayfinding: [
        {
          title: "辦公區導覽",
          text: "沿中央走道往北：左側是 HR 室、右側是規劃室。中段左側是交流休息區，右側是共用事務區。隨時打開手冊的地圖，可以查看目前位置。",
        },
      ],
      exit: [
        {
          title: "施工現場，需要一起前往",
          text: this.store.state.chapterComplete
            ? "你已完成辦公室見習。施工、職安與品管的現場任務將在下一階段開放；這裡目前不會切換到未完成的場景。"
            : "通道旁掛著「進入現場請先接受安全告知，並由人員帶領」的標示。先完成報到與規劃室任務，再帶著筆記回到 HR 室。",
        },
      ],
    };
    this.dialogue.show(
      { name: "實習筆記", role: "辦公室裡的小發現", look: "intern" },
      lines[id] || [
        {
          title: "一個平凡的工作日",
          text: "辦公室裡，每個人都有正在照顧的事情。",
        },
      ],
    );
  }
  private blocked() {
    return this.title || !!document.querySelector("dialog[open]");
  }
  private refresh() {
    const s = this.store.state;
    this.player?.setHelmet(s.hr);
    const text = !s.hr
      ? "前往 HR 室，找雅涵報到"
      : s.planning === "available"
        ? "到規劃室，與林以安對話接取任務"
        : s.planning === "active"
          ? "自由調查圖說、電腦與樓層模型"
          : s.planning === "ready"
            ? "帶著三份筆記，向林以安回報"
            : !s.chapterComplete
              ? "回到 HR 室，和雅涵交流今天的收穫"
              : "第一章完成・繼續探索辦公室";
    document.querySelector("#quest-text")!.textContent = text;
    document.querySelector("#quest-label")!.textContent = !s.hr
      ? "序章 · 第一天"
      : s.planning === "complete"
        ? "第一章 · 帶著發現回來"
        : "規劃任務 · 辦公室的線索";
    document.querySelector("#quest-count")!.textContent =
      s.planning === "active" || s.planning === "ready"
        ? `${s.inspected.length}/3`
        : s.chapterComplete
          ? "✓"
          : "";
    document.querySelector("#clock")!.textContent = !s.hr
      ? "09:00 · 初次見面"
      : s.planning === "complete"
        ? "10:00 · 第一份收穫"
        : "09:20 · 自由探索";
    document.querySelector("#save-status")!.textContent = this.store
      .storageAvailable
      ? "✓ 進度已記錄"
      : "⚠ 無法儲存";
    this.refreshMarkers();
  }
  private refreshMarkers() {
    for (const id of ["blueprint", "computer", "model"] as const)
      this.markers
        .get(id)
        ?.setVisible(
          this.store.state.planning === "active" &&
            !this.store.state.inspected.includes(id),
        );
    this.markers.get("planner")?.setVisible(true);
  }
  private toast(text: string) {
    const box = document.querySelector("#toast")!;
    box.textContent = text;
    box.classList.add("visible");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => box.classList.remove("visible"), 3800);
  }
  private persist() {
    if (!this.store.state.name || !this.player) return;
    this.store.state.x = Math.round(this.player.sprite.x);
    this.store.state.y = Math.round(this.player.sprite.y);
    this.store.commit();
  }
  private safe(x: number, y: number) {
    return (
      x > 46 &&
      x < 978 &&
      y > 80 &&
      y < 1040 &&
      !this.blockers.some(
        (r) =>
          x + 8 > r.x && x - 8 < r.x + r.w && y - 2 > r.y && y - 12 < r.y + r.h,
      )
    );
  }
}

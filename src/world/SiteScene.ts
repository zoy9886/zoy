import Phaser from "phaser";
import { makeArt } from "../art/atlas";
import { WIDTH, HEIGHT, CELL, fixtures, zones, npcs } from "./site";
import { Player } from "./player";
import { Dialogue, observations } from "../systems/dialogue";
import { load, save, type Save } from "../systems/save";
import { TouchControls } from "../ui/controls";
export class SiteScene extends Phaser.Scene {
  player!: Player;
  touch = new TouchControls();
  dialogue = new Dialogue();
  state!: Save;
  private targets: { id: string; x: number; y: number; label: string }[] = [];
  private markers: Phaser.GameObjects.Triangle[] = [];
  private lastSave = 0;
  constructor() {
    super("site");
  }
  create() {
    makeArt(this);
    this.physics.world.setBounds(32, 64, (WIDTH - 2) * 32, (HEIGHT - 3) * 32);
    const map = this.make.tilemap({
      data: Array.from({ length: HEIGHT }, (_, y) =>
        Array.from({ length: WIDTH }, (_, x) =>
          y === 18 || y === 19 || x === 19 ? 1 : 0,
        ),
      ),
      tileWidth: 32,
      tileHeight: 32,
    });
    // Tilemap background uses individual atlas frames, never a flattened scene image.
    const floorCanvas = document.createElement("canvas");
    floorCanvas.width = 64;
    floorCanvas.height = 32;
    const ctx = floorCanvas.getContext("2d")!;
    const source = this.textures
      .get("site-atlas")
      .getSourceImage() as HTMLCanvasElement;
    ctx.drawImage(source, 0, 0, 32, 32, 0, 0, 32, 32);
    ctx.drawImage(source, 64, 0, 32, 32, 32, 0, 32, 32);
    this.textures.addCanvas("floor-tiles", floorCanvas);
    const tiles = map.addTilesetImage("concrete", "floor-tiles", 32, 32)!;
    map.createLayer(0, tiles, 0, 0)!.setDepth(-100);
    const solids = this.physics.add.staticGroup();
    const solid = (x: number, y: number, w: number, h: number) => {
      const body = this.add.zone(x, y, w, h);
      this.physics.add.existing(body, true);
      solids.add(body);
    };
    for (let x = 0; x < WIDTH; x += 2) {
      this.add
        .image(x * 32, 0, "site-atlas", "wall")
        .setOrigin(0)
        .setDepth(64);
      this.add
        .image(x * 32, (HEIGHT - 1) * 32, "site-atlas", "wall")
        .setOrigin(0)
        .setDepth(HEIGHT * 32 + 80);
    }
    for (let y = 2; y < HEIGHT - 1; y += 2) {
      this.add
        .image(-32, y * 32, "site-atlas", "wall")
        .setOrigin(0)
        .setDepth(y * 32 + 64);
      this.add
        .image((WIDTH - 1) * 32, y * 32, "site-atlas", "wall")
        .setOrigin(0)
        .setDepth(y * 32 + 64);
    }
    solid(WIDTH * 16, 40, WIDTH * 32, 48);
    solid(WIDTH * 16, HEIGHT * 32 - 12, WIDTH * 32, 24);
    solid(16, HEIGHT * 16, 32, HEIGHT * 32);
    solid(WIDTH * 32 - 16, HEIGHT * 16, 32, HEIGHT * 32);
    // Structure, objects and foreground have separate depth ranges based on foot positions.
    fixtures.forEach((f) => {
      const bottom = (f.y + 1) * 32;
      this.add
        .image(f.x * 32, bottom, "site-atlas", f.art)
        .setOrigin(0, 1)
        .setDepth(bottom);
      solid(f.x * 32 + 32, bottom - 11, 48, f.art === "opening" ? 42 : 24);
      if (f.label)
        this.targets.push({
          id: f.id,
          x: f.x * 32 + 32,
          y: bottom,
          label: f.label,
        });
    });
    // In-situ rebar mat, timber form panels and slab joints belong to the floor layer.
    const detail = this.add.graphics().setDepth(-60);
    detail.lineStyle(1, 0x697c83, 0.45);
    for (let x = 128; x < WIDTH * 32; x += 128)
      detail.lineBetween(x, 64, x, HEIGHT * 32 - 32);
    for (let y = 128; y < HEIGHT * 32; y += 128)
      detail.lineBetween(32, y, WIDTH * 32 - 32, y);
    detail.fillStyle(0x647c85, 0.55);
    detail.fillRect(170, 388, 206, 104);
    for (let x = 180; x < 371; x += 12) {
      detail.lineStyle(3, 0x3d5869);
      detail.lineBetween(x, 390, x, 487);
      detail.lineStyle(1, 0x9bb0b4);
      detail.lineBetween(x - 1, 390, x - 1, 487);
    }
    for (let y = 396; y < 488; y += 12) {
      detail.lineStyle(3, 0x425c6a);
      detail.lineBetween(176, y, 369, y);
      detail.lineStyle(1, 0x9fb0af);
      detail.lineBetween(176, y - 1, 369, y - 1);
    }
    for (let x = 184; x < 369; x += 36)
      for (let y = 403; y < 488; y += 36) {
        detail.lineStyle(1, 0xb2aa8e);
        detail.lineBetween(x - 3, y - 3, x + 3, y + 3);
      }
    // Active formwork bays have longitudinal joists beneath plywood panels.
    detail.fillStyle(0x425969, 0.6);
    detail.fillRect(459, 152, 153, 128);
    for (let x = 465; x < 610; x += 18) {
      detail.fillStyle(0x806b54);
      detail.fillRect(x, 157, 6, 116);
      detail.fillStyle(0xba9f78);
      detail.fillRect(x, 157, 2, 116);
    }
    // Tall windows give the unfinished exterior wall a consistent light source.
    for (const x of [160, 384, 736, 992]) {
      const window = this.add.graphics().setDepth(65);
      window.fillStyle(0x344f60);
      window.fillRect(x, 18, 95, 36);
      window.fillStyle(0xb8ced0);
      window.fillRect(x + 3, 20, 89, 29);
      window.fillStyle(0xdce6db);
      window.fillRect(x + 4, 20, 87, 8);
      window.lineStyle(3, 0x647e8c);
      window.lineBetween(x + 47, 19, x + 47, 51);
      window.lineBetween(x + 1, 36, x + 94, 36);
      window.fillStyle(0x495e6a);
      window.fillRect(x - 3, 51, 101, 5);
    }
    // Floor markings and designated circulation route.
    const g = this.add.graphics().setDepth(-50);
    g.lineStyle(2, 0xc9bd85, 0.65);
    g.strokeRect(5 * 32, 12 * 32, 7 * 32, 5 * 32);
    g.strokeRect(28 * 32, 13 * 32, 7 * 32, 5 * 32);
    g.lineStyle(2, 0xc5d2cd, 0.5);
    for (let x = 4; x < 36; x += 4) {
      g.lineBetween(x * 32, 19 * 32, (x + 1) * 32, 19 * 32);
      g.lineBetween((x + 1) * 32 - 8, 19 * 32 - 5, (x + 1) * 32, 19 * 32);
      g.lineBetween((x + 1) * 32 - 8, 19 * 32 + 5, (x + 1) * 32, 19 * 32);
    }
    zones.forEach((z) => {
      this.add
        .text(z.x * 32, z.y * 32, z.text, {
          fontFamily: "sans-serif",
          fontSize: "13px",
          color: z.color,
          backgroundColor: "#3f5660",
          padding: { x: 9, y: 6 },
        })
        .setDepth(-10);
    });
    // Cool natural daylight and a narrow overhead beam, kept clear of the primary path.
    const light = this.add.graphics().setDepth(-40);
    light.fillStyle(0xdbe9df, 0.1);
    light.fillPoints(
      [
        { x: 70, y: 64 },
        { x: 250, y: 64 },
        { x: 550, y: 560 },
        { x: 320, y: 560 },
      ],
      true,
    );
    light.fillPoints(
      [
        { x: 800, y: 64 },
        { x: 930, y: 64 },
        { x: 1150, y: 420 },
        { x: 950, y: 420 },
      ],
      true,
    );
    npcs.forEach((n) => {
      const x = n.x * 32,
        y = n.y * 32;
      const npc = this.add
        .sprite(x, y, "worker", 0)
        .setScale(1.35)
        .setTint(n.tint)
        .setDepth(y);
      this.tweens.add({
        targets: npc,
        y: y - 1,
        duration: 1100,
        yoyo: true,
        repeat: -1,
      });
      solid(x, y + 10, 19, 14);
      this.add
        .text(x, y - 53, n.name, {
          fontFamily: "sans-serif",
          fontSize: "12px",
          color: "#e9eee4",
          backgroundColor: "#344e5c",
          padding: { x: 5, y: 3 },
        })
        .setOrigin(0.5)
        .setDepth(y + 70);
      const marker = this.add
        .triangle(x, y - 67, 0, 0, 10, 0, 5, 8, 0xe97c72)
        .setDepth(y + 71);
      this.markers.push(marker);
      this.tweens.add({
        targets: marker,
        y: y - 72,
        yoyo: true,
        repeat: -1,
        duration: 700,
      });
      this.targets.push({ id: n.id, x, y, label: `${n.name} · ${n.role}` });
    });
    this.state = load() || {
      version: 1,
      name: "",
      helmet: "white",
      x: 16 * 32,
      y: 24 * 32,
      seen: [],
      quest: false,
      reward: false,
    };
    // Invalid or obsolete positions fall back to the safe entrance.
    if (
      this.state.x < 64 ||
      this.state.x > 1210 ||
      this.state.y < 90 ||
      this.state.y > 850 ||
      fixtures.some(
        (f) =>
          Math.abs(this.state.x - (f.x * 32 + 32)) < 40 &&
          Math.abs(this.state.y - ((f.y + 1) * 32 - 11)) < 35,
      )
    ) {
      this.state.x = 512;
      this.state.y = 768;
    }
    this.player = new Player(
      this,
      this.state.x,
      this.state.y,
      this.state.helmet === "blue",
    );
    this.physics.add.collider(this.player.sprite, solids);
    this.cameras.main.setBounds(0, 0, WIDTH * 32, HEIGHT * 32);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setBackgroundColor("#293f4b");
    this.scale.on("resize", () =>
      this.cameras.main.setSize(this.scale.width, this.scale.height),
    );
    const welcome = document.querySelector<HTMLDialogElement>("#welcome")!;
    if (!this.state.name) welcome.showModal();
    document.querySelector("#create")!.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document
        .querySelector<HTMLInputElement>("#player-name")!
        .value.trim();
      if (!name) return;
      this.state.name = name;
      this.state.helmet =
        document.querySelector<HTMLSelectElement>("#helmet")!.value;
      if (this.state.helmet === "blue") this.player.sprite.setTint(0xb5dbe9);
      welcome.close();
      this.persist();
      this.dialogue.show("報到通知", [
        {
          title: `${name}，歡迎來到豐譽！`,
          text: "今天先跟林學長認識結構施工樓層。他在中央安全通道旁，頭上有紅色三角形。走近後按 E，或點畫面上的互動鈕。",
        },
      ]);
    });
    welcome.addEventListener("cancel", (e) => e.preventDefault());
    document.querySelector("#help")!.addEventListener("click", () => {
      if (!this.dialogue.open)
        this.dialogue.show("操作說明", [
          {
            title: "走進現場，留意每個細節",
            text: "WASD 或方向鍵移動；靠近人物或物件按 E / 空白鍵互動。手機可使用左下方向鍵與右下互動鈕。四個觀察點：鋼筋、模板、樓板開口與品質查驗台。完成後向林學長回報。進度會自動保存在目前瀏覽器。",
          },
        ]);
    });
    this.updateJournal();
    window.addEventListener("pagehide", () => this.persist());
    // Read-only diagnostics for deterministic browser validation; never used to drive gameplay.
    Object.defineProperty(window, "__site", {
      configurable: true,
      get: () => ({
        x: this.player.sprite.x,
        y: this.player.sprite.y,
        velocity: this.player.sprite.body?.velocity.length(),
        seen: [...this.state.seen],
        quest: this.state.quest,
        reward: this.state.reward,
        targets: this.targets,
      }),
    });
  }
  update(time: number) {
    if (!this.player) return;
    this.player.update(this.touch, this.dialogue.open);
    const p = this.player.sprite;
    const near = this.targets
      .map((t) => ({
        ...t,
        distance: Phaser.Math.Distance.Between(t.x, t.y, p.x, p.y),
      }))
      .filter((t) => t.distance < 88)
      .sort((a, b) => a.distance - b.distance)[0];
    document.querySelector("#hint")!.textContent = near
      ? `E / 互動 · ${near.label}`
      : "WASD / 方向鍵移動 · E 互動";
    const interact =
      Phaser.Input.Keyboard.JustDown(this.player.keys.E) ||
      Phaser.Input.Keyboard.JustDown(this.player.keys.SPACE) ||
      this.touch.interact;
    this.touch.interact = false;
    if (interact && near && !this.dialogue.open) this.interact(near.id);
    if (time - this.lastSave > 2500 && !this.dialogue.open) {
      this.persist();
      this.lastSave = time;
    }
    this.markers.forEach((m, i) =>
      m.setVisible(
        i === 0
          ? !this.state.reward
          : i === 1
            ? !this.state.seen.includes("opening")
            : !this.state.seen.includes("quality"),
      ),
    );
  }
  private interact(id: string) {
    const name = this.state.name;
    if (observations[id]) {
      this.dialogue.show("現場觀察 / FIELD NOTES", observations[id], () => {
        if (!this.state.seen.includes(id)) this.state.seen.push(id);
        this.persist();
        this.updateJournal();
      });
      return;
    }
    if (id === "engineer") {
      if (this.state.seen.length === 4) {
        this.dialogue.show(
          "林學長 / 現場工程師",
          [
            {
              title: this.state.reward
                ? "繼續保持好奇心"
                : "第一天的觀察，很扎實！",
              text: this.state.reward
                ? "現場還有圖說、支撐架與安全設備可以調查。保持安全距離，有疑問就問學長姐。"
                : `${name}，你完成了四個現場觀察。獲得「現場觀察員」徽章與 100 實習經驗！今天學到的核心是：依圖施工、安全優先、查驗留痕。`,
            },
          ],
          () => {
            this.state.reward = true;
            this.persist();
            this.updateJournal();
          },
        );
      } else
        this.dialogue.show(
          "林學長 / 現場工程師",
          [
            {
              title: `${name}，一起讀懂這個工地`,
              text: "我們正在進行結構工程。沿中央通道探索，不要跨越護欄。請調查鋼筋、模板、樓板開口與品管查驗台，完成四個小挑戰，再回來找我。",
            },
            {
              title: "任務：第一天的現場筆記",
              text: `目前已完成 ${this.state.seen.length} / 4。實習手冊會記錄進度，隨時可以打開查看。`,
            },
          ],
          () => {
            this.state.quest = true;
            this.persist();
            this.updateJournal();
          },
        );
      return;
    }
    if (id === "safety") {
      this.dialogue.show("陳姐 / 職安工程師", [
        {
          title: "安全，是進入現場的第一件事",
          text: "安全帽、反光背心與安全鞋是基本配備。進入作業區前還要確認現場規定與危害告知。看到中央的箭頭嗎？那是我們保持淨空的通道。",
        },
        {
          title: "今天的觀察提示",
          text: "往北走，找到有黃色護欄的樓板開口。先在護欄外調查，完成危害辨識挑戰。",
        },
      ]);
      return;
    }
    if (id === "qc") {
      this.dialogue.show("許學姐 / 品管工程師", [
        {
          title: "好的品質，要能被證明",
          text: "查驗紀錄能讓每個施工步驟有跡可循。我的查驗台就在北邊，去看看材料進場的第一道關卡吧。",
        },
      ]);
      return;
    }
    const texts: Record<string, string> = {
      entry:
        "這是 3F 結構施工樓層。左側為鋼筋作業，右側為模板材料與開口防護，北側為支撐架及工程師工作區。五區域完整版將在後續階段擴充；目前開放施工樓層。",
      bim: "圖說先行：施工前需核對核定版次，BIM 可協助跨專業協調及檢討碰撞。此處為現場圖說工作站，完整 BIM 場景尚未開放。",
      scaffold:
        "支撐架應依核定施工計畫與載重設計搭設，保持基底穩定、連接確實，並依規定檢查。不可憑經驗任意變更。",
      extinguisher:
        "消防設備前保持淨空，確認位置與檢查紀錄。發生火警應依現場應變程序通報，先確保人員安全。",
      pipe1:
        "管材依規格分類並防止滾動，不得堆放於安全通道。整齊的材料管理也能減少搬運及誤用。",
    };
    this.dialogue.show("施工現場 / 觀察紀錄", [
      {
        title: this.targets.find((t) => t.id === id)?.label || "現場設備",
        text: texts[id] || "依施工計畫整理材料，保持作業與通行空間。",
      },
    ]);
  }
  private persist() {
    if (!this.state?.name) return;
    this.state.x = Math.round(this.player.sprite.x);
    this.state.y = Math.round(this.player.sprite.y);
    save(this.state);
  }
  private updateJournal() {
    const labels: Record<string, string> = {
      rebar: "鋼筋綁紮與保護層",
      timber: "模板及支撐管理",
      opening: "開口防護與危害辨識",
      quality: "材料查驗與品質紀錄",
    };
    document.querySelector("#progress")!.textContent = this.state.reward
      ? "✦ 現場觀察員 · 100 EXP"
      : `${this.state.seen.length} / 4 現場觀察完成`;
    const list = document.querySelector("#journal-items")!;
    list.replaceChildren();
    for (const [id, label] of Object.entries(labels)) {
      const item = document.createElement("div");
      item.className = this.state.seen.includes(id) ? "done" : "";
      item.textContent = `${this.state.seen.includes(id) ? "✓" : "○"} ${label}`;
      list.append(item);
    }
    const status = document.createElement("p");
    status.textContent = this.state.reward
      ? "已獲得現場觀察員徽章。"
      : this.state.seen.length === 4
        ? "四項完成！回到中央通道找林學長領取徽章。"
        : this.state.quest
          ? "任務進行中：探索四個觀察點。"
          : "先找中央通道的林學長接取實習任務。";
    list.append(status);
  }
}

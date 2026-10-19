export type Page = {
  title: string;
  text: string;
  choices?: { text: string; correct: boolean }[];
};
export class Dialogue {
  private dialog = document.querySelector<HTMLDialogElement>("#conversation")!;
  private pages: Page[] = [];
  private index = 0;
  private done = () => {};
  get open() {
    return (
      this.dialog.open ||
      document.querySelector<HTMLDialogElement>("#welcome")!.open
    );
  }
  constructor() {
    document
      .querySelector("#next")!
      .addEventListener("click", () => this.advance());
    this.dialog.addEventListener("cancel", (e) => e.preventDefault());
  }
  show(speaker: string, pages: Page[], done = () => {}) {
    this.pages = pages;
    this.index = 0;
    this.done = done;
    document.querySelector("#speaker")!.textContent = speaker;
    this.render();
    this.dialog.showModal();
  }
  private render() {
    const p = this.pages[this.index];
    document.querySelector("#dialog-title")!.textContent = p.title;
    document.querySelector("#dialog-text")!.textContent = p.text;
    const choices = document.querySelector("#choices")!;
    choices.replaceChildren();
    const next = document.querySelector<HTMLButtonElement>("#next")!;
    next.hidden = !!p.choices;
    next.textContent =
      this.index === this.pages.length - 1 ? "完成觀察 ✓" : "繼續 →";
    p.choices?.forEach((choice) => {
      const b = document.createElement("button");
      b.textContent = choice.text;
      b.addEventListener("click", () => {
        if (choice.correct) {
          next.hidden = false;
          choices.replaceChildren();
          document.querySelector("#dialog-text")!.textContent =
            "答對了！現場觀察 +1。先確認安全及圖說，才開始下一步工作。";
        } else {
          b.disabled = true;
          b.textContent += " · 再觀察一下";
        }
      });
      choices.append(b);
    });
  }
  private advance() {
    if (++this.index < this.pages.length) this.render();
    else {
      this.dialog.close();
      this.done();
    }
  }
}
export const observations: Record<string, Page[]> = {
  rebar: [
    {
      title: "鋼筋不是只要綁緊就好",
      text: "這裡的鋼筋依構件分區堆放。澆置前，工程師還要核對鋼筋號數、間距、搭接及保護層，並留下查驗紀錄。",
    },
    {
      title: "現場小挑戰",
      text: "綁紮完成後，應優先做哪件事？",
      choices: [
        { text: "確認圖說、保護層與查驗程序", correct: true },
        { text: "立即澆置混凝土", correct: false },
      ],
    },
  ],
  timber: [
    {
      title: "模板，也是一種精準工程",
      text: "模板決定混凝土成形的位置與尺寸。這裡與鋼筋區分開堆置，中央安全通道保持暢通。支撐架須依施工計畫設置，不能任意拆除。",
    },
    {
      title: "現場小挑戰",
      text: "發現支撐架妨礙搬運，你會？",
      choices: [
        { text: "自行拆掉一根", correct: false },
        { text: "回報工程師，依核定計畫處理", correct: true },
      ],
    },
  ],
  opening: [
    {
      title: "看得見的邊界，看不見的風險",
      text: "樓板開口設有護欄與警示。即使只離開一下，也不能移走防護。發現缺口時先保持距離並通報。",
    },
    {
      title: "現場小挑戰",
      text: "發現開口旁護欄鬆動，第一步是？",
      choices: [
        { text: "保持距離、提醒他人並通報職安", correct: true },
        { text: "跨進去看看下面", correct: false },
      ],
    },
  ],
  quality: [
    {
      title: "品質藏在每一筆紀錄裡",
      text: "查驗台備有檢查表與檢測工具。材料進場需確認文件與規格，施工查驗則依檢驗停留點與程序執行。",
    },
    {
      title: "現場小挑戰",
      text: "材料外觀正常，但缺少證明文件，應如何處理？",
      choices: [
        { text: "先用再說", correct: false },
        { text: "依程序標示管理，確認文件再使用", correct: true },
      ],
    },
  ],
};

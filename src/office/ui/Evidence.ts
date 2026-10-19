import { ProgressStore, type EvidenceId } from "../systems/progress";
const svg = (body: string) =>
  `<svg viewBox="0 0 320 210" xmlns="http://www.w3.org/2000/svg" role="img">${body}</svg>`;
const text = (x: number, y: number, t: string, size = 10) =>
  `<text x="${x}" y="${y}" fill="#b9d5d5" font-size="${size}" font-family="sans-serif">${t}</text>`;
export class EvidenceUI {
  private root = document.querySelector<HTMLDialogElement>("#evidence")!;
  private current: EvidenceId = "blueprint";
  private turned = 0;
  constructor(private store: ProgressStore) {
    document
      .querySelector("#evidence-close")!
      .addEventListener("click", () => this.root.close());
    document
      .querySelector("#evidence-action")!
      .addEventListener("click", () => {
        this.turned++;
        this.render();
      });
    document.querySelector("#record")!.addEventListener("click", () => {
      if (!this.turned) return;
      this.root.close();
      this.store.inspect(this.current);
    });
  }
  show(id: EvidenceId) {
    this.current = id;
    this.turned = 0;
    this.render();
    this.root.showModal();
  }
  private render() {
    const id = this.current,
      active = this.turned > 0;
    const info = {
      blueprint: {
        code: "DRAWING / A-031",
        title: "把圖紙展開來",
        intro: "圖說桌上留了兩個樓層頁籤。切換到 3F，看看本次調整的位置。",
        action: active ? "再看看 3F 圖說" : "切換至 3F 圖說",
        caption: active
          ? "C 版｜東側開口由軸線 4 移至軸線 5，動線需配合調整。這份核定圖說的日期為 6/12。"
          : "目前顯示 2F 平面。圖框上的版次與日期，也是圖說的一部分。",
      },
      computer: {
        code: "WORKSPACE / COORDINATION",
        title: "打開協作紀錄",
        intro:
          "資料夾依照版次保存，不是每個檔案都可以直接拿去施工。先開啟最新核定紀錄。",
        action: active ? "檢視核定紀錄" : "開啟 C 版核定紀錄",
        caption: active
          ? "6/12・C 版已核定。備註：「東側開口位置更新，模型待同步；由規劃與工務共同確認。」"
          : "檔案列表中同時保留 B 版與 C 版。先看狀態欄，不要只看檔名。",
      },
      model: {
        code: "MODEL / OFFICE LEVEL 3",
        title: "換個方向看建築",
        intro: "模型能幫助大家理解空間。旋轉模型，看看東側入口與走道的關係。",
        action: "旋轉模型 ↻",
        caption: active
          ? "模型底座標籤：B 版・6/05。東側開口仍在舊位置。它和 C 版圖說有差異，先記下來，回去和以安確認。"
          : "目前視角：入口正面。模型標籤藏在底座側邊，換個角度看看。",
      },
    }[id];
    document.querySelector("#evidence-code")!.textContent = info.code;
    document.querySelector("#evidence-title")!.textContent = info.title;
    document.querySelector("#evidence-intro")!.textContent = info.intro;
    document.querySelector("#evidence-caption")!.textContent = info.caption;
    document.querySelector("#evidence-action")!.textContent = info.action;
    const record = document.querySelector<HTMLButtonElement>("#record")!;
    record.disabled = !active;
    record.textContent = active
      ? "記入實習筆記 ✓"
      : "先操作設備，觀察其中的線索";
    let drawing = "";
    if (id === "blueprint") {
      drawing = `<defs><pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#405b6a" stroke-width=".5"/></pattern></defs><rect width="320" height="210" fill="#2c4759"/><rect x="15" y="15" width="290" height="180" fill="url(#grid)" stroke="#75979e"/><g stroke="#bad3d0" stroke-width="2" fill="none"><path d="M48 58H270V158H48ZM120 58V158M202 58V100M202 129V158M48 109H120M202 109H270"/><path d="M202 100Q229 100 229 127M202 129H229" stroke-width="1"/><path d="M${active ? 251 : 221} 158v-22h19" stroke="#d2b980" stroke-width="3"/></g><g fill="#9eb7bb">${[48, 120, 202, 270].map((x) => `<rect x="${x - 4}" y="54" width="8" height="8"/><rect x="${x - 4}" y="154" width="8" height="8"/>`).join("")}</g>${text(26, 32, active ? "3F STRUCTURE PLAN / REV. C" : "2F STRUCTURE PLAN / REV. B", 11)}${text(61, 86, "HR / OFFICE")}${text(135, 116, "HALL")}${text(215, 86, "PLANNING")}${text(30, 184, active ? "APPROVED 06.12  /  EAST OPENING UPDATED" : "ARCHIVE  /  SWITCH LEVEL TO INVESTIGATE")}`;
    } else if (id === "computer") {
      drawing = `<rect width="320" height="210" fill="#243d4b"/><rect x="16" y="16" width="288" height="178" rx="4" fill="#e1e8df"/><path d="M16 42H304" stroke="#adbfba"/>${text(28, 33, "FENG YU / PROJECT WORKSPACE", 10).replace("#b9d5d5", "#496d78")}<g fill="#4f7078" font-family="sans-serif" font-size="11"><text x="32" y="66">3F_STRUCTURE_B.pdf</text><text x="239" y="66">已封存</text><rect x="25" y="80" width="271" height="33" fill="${active ? "#b1cec4" : "#cbd8d1"}"/><text x="32" y="101">3F_STRUCTURE_C.pdf</text><text x="239" y="101">已核定</text><text x="32" y="137">${active ? "06/12　核定 C 版・東側開口更新" : "06/05　B 版留存於歷史資料夾"}</text><text x="32" y="162">${active ? "待辦：模型同步 / 規劃 × 工務協調" : "點選核定紀錄，查看版本異動"}</text><text x="32" y="181" font-size="9">${active ? "OWNER: LIN  /  STATUS: FOLLOW-UP" : "INTERNAL DOCUMENTS / READ ONLY"}</text></g>`;
    } else {
      const reverse = this.turned % 2 === 1;
      drawing = `<rect width="320" height="210" fill="#d5dfd5"/><path d="M45 149L158 96L280 147L162 199Z" fill="#849f99"/><path d="M45 149V157L162 205V199Z" fill="#536f76"/><path d="M162 199V205L280 153V147Z" fill="#71908d"/><g transform="${reverse ? "translate(320 0) scale(-1 1)" : ""}"><path d="M77 134V72L151 40V105Z" fill="#a7c4c5"/><path d="M151 40L247 79V141L151 105Z" fill="#e8eade"/><path d="M77 72L151 40L247 79L171 111Z" fill="#f3f1dc"/><path d="M151 105L171 111V174L77 134V72L171 111" fill="#7f9fa8"/><path d="M171 111L247 79V141L171 174Z" fill="#c6d5cf"/>${[0, 1, 2].map((n) => `<path d="M90 ${88 + n * 17}l12 5v8l-12-5zm24 10l12 5v8l-12-5zm24 10l12 5v8l-12-5z" fill="#426679"/><path d="M184 ${116 + n * 14}l13-5v7l-13 5zm25-10l13-5v7l-13 5z" fill="#729aa7"/>`).join("")}<path d="M221 152V129L235 123V146Z" fill="#d2b980"/></g><rect x="111" y="175" width="76" height="16" fill="#edf0df"/>${text(119, 186, active ? "REV. B / 06.05" : "3F MODEL", 9).replace("#b9d5d5", "#4e7078")}${text(18, 25, "ROTATE TO EXPLORE", 10).replace("#b9d5d5", "#637f81")}`;
    }
    document.querySelector("#evidence-art")!.innerHTML = svg(drawing);
  }
}

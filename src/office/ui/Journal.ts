import { ProgressStore } from "../systems/progress";
export const itemDescriptions: Record<string, string> = {
  識別證: "HR 核發的實習識別證。從今天起，你也是團隊的一份子。",
  安全帽: "進入現場的基本防護用品；仍需接受現場安全告知與帶領。",
  實習手冊: "記錄自己的觀察與疑問，不必把所有名詞背下來。",
  圖說協調便條:
    "確認核定版次、記錄差異、向負責人溝通。以安交給你的第一份協作提醒。",
  辦公室見習章: "第一章完成紀念。謝謝你帶著好奇，認識建築背後的人。",
};
export const evidenceNames = {
  blueprint: "3F 圖說 · 東側開口 C 版",
  computer: "協作紀錄 · 模型待同步",
  model: "樓層模型 · 底座仍標 B 版",
};
export class Journal {
  private root = document.querySelector<HTMLDialogElement>("#journal")!;
  private tab = "tasks";
  constructor(private store: ProgressStore) {
    document.querySelector("#menu")!.addEventListener("click", () => {
      this.render();
      this.root.showModal();
    });
    document
      .querySelector("#journal-close")!
      .addEventListener("click", () => this.root.close());
    document.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((b) =>
      b.addEventListener("click", () => {
        this.tab = b.dataset.tab!;
        this.render();
      }),
    );
    document
      .querySelector("#restart")!
      .addEventListener("click", () =>
        document
          .querySelector<HTMLDialogElement>("#restart-dialog")!
          .showModal(),
      );
    document
      .querySelector("#cancel-restart")!
      .addEventListener("click", () =>
        document.querySelector<HTMLDialogElement>("#restart-dialog")!.close(),
      );
  }
  render() {
    const s = this.store.state;
    document
      .querySelectorAll<HTMLButtonElement>("[data-tab]")
      .forEach((b) =>
        b.classList.toggle("selected", b.dataset.tab === this.tab),
      );
    const content = document.querySelector("#journal-content")!;
    content.replaceChildren();
    if (this.tab === "tasks") {
      this.entry(
        content,
        s.hr ? "已完成" : "進行中",
        "序章・初次見面",
        "到 HR 室找雅涵，領取識別證、安全帽與實習手冊。",
      );
      this.entry(
        content,
        {
          locked: "尚未解鎖",
          available: "可接取",
          active: "調查中",
          ready: "等待回報",
          complete: "已完成",
        }[s.planning],
        "規劃室的三個線索",
        s.planning === "locked"
          ? "先完成 HR 報到。"
          : s.planning === "available"
            ? "接近規劃室的林以安，對話後決定是否接取。"
            : s.planning === "ready"
              ? "三個線索已記錄。回到林以安身邊交流，才能完成任務。"
              : s.planning === "complete"
                ? "你發現圖說與模型的版本差異，並完成回報。"
                : "自由調查圖說、電腦與模型，觀察順序由你決定。",
      );
      if (!["locked", "available"].includes(s.planning)) {
        for (const [id, label] of Object.entries(evidenceNames))
          this.entry(
            content,
            s.inspected.includes(id as keyof typeof evidenceNames)
              ? "已記錄"
              : "待調查",
            label,
            s.inspected.includes(id as keyof typeof evidenceNames)
              ? "觀察已保存在筆記中。"
              : "接近驚嘆號，操作設備並記入筆記。",
          );
      }
      this.entry(
        content,
        s.chapterComplete
          ? "已完成"
          : s.planning === "complete"
            ? "進行中"
            : "等待中",
        "帶著發現回來交流",
        "規劃任務回報後，回到 HR 室找雅涵，領取辦公室見習章。",
      );
    } else if (this.tab === "bag") {
      const heading = document.createElement("p");
      heading.textContent = `${s.name}的背包 · ${s.items.length} 件紀錄`;
      heading.className = "bag-heading";
      content.append(heading);
      if (!s.items.length)
        this.entry(
          content,
          "空背包",
          "還沒有物品",
          "到 HR 室報到後，就能拿到你的第一份裝備。",
        );
      for (const item of s.items)
        this.entry(
          content,
          "已取得",
          item,
          itemDescriptions[item] || "實習途中取得的紀錄。",
        );
    } else {
      content.innerHTML = `<p class="map-heading">辦公區・一樓導覽</p><svg class="office-map" viewBox="0 0 320 345" role="img" aria-label="辦公區地圖，左上 HR 室、右上規劃室、中間走道、左下休息區、右下事務區、最下方集合區"><rect x="5" y="5" width="310" height="332" fill="#d3ded1" stroke="#536f76" stroke-width="3"/><g fill="#b3c8bd" stroke="#819d96"><rect x="12" y="20" width="116" height="108"/><rect x="192" y="20" width="116" height="139"/><rect x="12" y="142" width="116" height="112"/><rect x="192" y="173" width="116" height="81"/></g><g font-family="sans-serif" fill="#456b70" font-size="13" text-anchor="middle"><text x="70" y="80">HR 室</text><text x="249" y="86">規劃室 ◇</text><text x="70" y="205">休息區</text><text x="250" y="218">事務區</text><text x="160" y="299">入口集合區</text><text x="160" y="167" font-size="10">走道</text></g><path d="M128 86H142M178 86H192M128 209H142M178 198H192" stroke="#faf3d8" stroke-width="9"/><circle cx="${(s.x / 1024) * 320}" cy="${(s.y / 1088) * 345}" r="5" fill="#c17e60" stroke="#fff5db" stroke-width="2"/><path d="M148 334h24" stroke="#6d8d91" stroke-width="5"/></svg><p class="map-note">● 你的位置　◇ 規劃任務 NPC<br>房間入口連接中央走道，地圖可自由探索。<br>南側施工通道會在後續階段開放。</p>`;
    }
    document.querySelector("#journal-save")!.textContent = this.store
      .storageAvailable
      ? "✓ 已保存於目前瀏覽器"
      : "目前無法存檔，請勿關閉分頁";
  }
  private entry(parent: Element, status: string, title: string, text: string) {
    const box = document.createElement("article");
    box.className = "journal-entry";
    const badge = document.createElement("small");
    badge.textContent = status;
    const h = document.createElement("h3");
    h.textContent = title;
    const p = document.createElement("p");
    p.textContent = text;
    box.append(badge, h, p);
    parent.append(box);
  }
}

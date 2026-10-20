import { evidenceLabels } from "../systems/challengeModel";
import {
  ProgressStore,
  SITE_OBJECTIVES,
  type SiteJob,
} from "../systems/progress";
export const itemDescriptions: Record<string, string> = {
  施工觀察紀錄: "鋼筋、模板與支撐的現場觀察，已向施工工程師回報。",
  職安巡檢紀錄: "記錄開口防護異常、消防設備與安全通道，已向職安人員通報。",
  品質查驗紀錄: "材料、查驗表與核定圖說的核對紀錄，已交給品管人員追蹤。",
  第一天實習紀念章:
    "辦公室與施工現場的四組工作都已完成，謝謝你認真觀察並回報。",
  施工溝通評核紀錄:
    "施工挑戰的行動與對話評核。可在手冊的評核頁查看配分、得失分原因及練習紀錄。",
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
    document.querySelector("#restart")!.textContent=this.tab==='review'?'重開整段故事':'重新開始';
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
      if (s.planning === "complete")
        this.entry(
          content,
          s.challenge.status === "complete"
            ? "已交件"
            : s.challenge.status === "active"
              ? "挑戰中"
              : "可接取",
          "加值挑戰・澆置前的三方溝通",
          "在施工現場找鋼筋吳師傅接取，再與模板周師傅核對，帶著現場依據向林學長回報。結果記錄在「評核」頁。",
        );
      if (s.planning === "complete") {
        const names = {
          construction: "施工組・結構施工觀察",
          safety: "職安組・安全巡檢",
          quality: "品管組・材料與文件核對",
        };
        const targetNames: Record<string, string> = {
          rebar: "鋼筋綁紮",
          timber: "模板堆置",
          scaffold: "支撐架",
          opening: "樓板開口",
          extinguisher: "滅火器",
          lane: "安全通道",
          quality: "品質查驗台",
          pipe1: "管材標示",
          bim: "現場圖說",
        };
        for (const job of Object.keys(SITE_OBJECTIVES) as SiteJob[]) {
          const status = s.siteTasks[job];
          this.entry(
            content,
            {
              available: "可接取",
              active: "巡查中",
              ready: "等待回報",
              complete: "已完成",
              locked: "待開放",
            }[status],
            names[job],
            status === "available"
              ? "從大廳南側進入施工現場，找負責人接取任務。"
              : SITE_OBJECTIVES[job]
                  .map(
                    (id) =>
                      (s.siteSeen.includes(id) ? "✓ " : "○ ") + targetNames[id],
                  )
                  .join(" / "),
          );
        }
        this.entry(
          content,
          s.dayComplete ? "已完成" : "待交流",
          "終章・第一天的收穫",
          "三組現場任務都回報後，返回辦公區找雅涵，領取第一天實習紀念章。",
        );
      }
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
    } else if (this.tab === "review") {
      this.renderReview(content);
    } else {
      content.innerHTML = `<p class="map-heading">辦公區・一樓導覽</p><svg class="office-map" viewBox="0 0 320 345" role="img" aria-label="辦公區地圖，左上 HR 室、右上規劃室、中間走道、左下休息區、右下事務區、最下方集合區"><rect x="5" y="5" width="310" height="332" fill="#d3ded1" stroke="#536f76" stroke-width="3"/><g fill="#b3c8bd" stroke="#819d96"><rect x="12" y="20" width="116" height="108"/><rect x="192" y="20" width="116" height="139"/><rect x="12" y="142" width="116" height="112"/><rect x="192" y="173" width="116" height="81"/></g><g font-family="sans-serif" fill="#456b70" font-size="13" text-anchor="middle"><text x="70" y="80">HR 室</text><text x="249" y="86">規劃室 ◇</text><text x="70" y="205">休息區</text><text x="250" y="218">事務區</text><text x="160" y="299">入口集合區</text><text x="160" y="167" font-size="10">走道</text></g><path d="M128 86H142M178 86H192M128 209H142M178 198H192" stroke="#faf3d8" stroke-width="9"/><circle cx="${(s.x / 1024) * 320}" cy="${(s.y / 1088) * 345}" r="5" fill="#c17e60" stroke="#fff5db" stroke-width="2"/><path d="M148 334h24" stroke="#6d8d91" stroke-width="5"/></svg><p class="map-note">● 你的位置　◇ 規劃任務 NPC<br>房間入口連接中央走道，地圖可自由探索。<br>完成報到與規劃回報後，南側通道可前往工地。</p>`;
    }
    if (this.tab === "map" && s.location === "site")
      content.innerHTML = `<p class="map-heading">施工現場・3F</p><svg class="office-map" viewBox="0 0 400 290" role="img" aria-label="施工現場地圖"><rect x="5" y="5" width="390" height="280" fill="#d2dcd3" stroke="#5c7881" stroke-width="3"/><g fill="#adbbb6"><rect x="48" y="104" width="76" height="58"/><rect x="143" y="42" width="55" height="55"/><rect x="280" y="120" width="69" height="52"/><rect x="300" y="30" width="75" height="55"/></g><path d="M25 190H375M196 90V270" stroke="#b2a778" stroke-width="8"/><g fill="#4e6c74" font-family="sans-serif" font-size="11"><text x="55" y="133">鋼筋作業</text><text x="146" y="65">支撐架</text><text x="285" y="150">模板材料</text><text x="313" y="58">品管組</text><text x="107" y="177">施工組 ◇</text><text x="167" y="236">職安組 ◇</text><text x="220" y="265">↓ 返回辦公區</text></g><circle cx="${(s.x / 1280) * 400}" cy="${(s.y / 928) * 290}" r="5" fill="#c17e60" stroke="#fff4db" stroke-width="2"/></svg><p class="map-note">● 你的位置　◇ 主要任務人員<br>沿中央安全通道移動，不跨越樓板開口防護。<br>南側工務所通道可隨時返回辦公區。</p>`;
    document.querySelector("#journal-save")!.textContent = this.store
      .storageAvailable
      ? "✓ 已保存於目前瀏覽器"
      : "目前無法存檔，請勿關閉分頁";
  }
  openReview() {
    this.tab = "review";
    this.render();
    if (!this.root.open) this.root.showModal();
  }
  private renderReview(content: Element) {
    const c = this.store.state.challenge;
    const heading = document.createElement("p");
    heading.className = "bag-heading";
    heading.textContent = "施工挑戰・澆置前的三方溝通";
    content.append(heading);
    if (c.status !== "complete") {
      this.entry(
        content,
        c.status === "active" ? "挑戰進行中" : "可接取",
        "先找到工班師傅，再整理回報",
        c.status === "active"
          ? "三項現場依據、鋼筋吳師傅的現況、模板周師傅的處置確認，最後向林學長交件。可以先補查，不必急著提交。"
          : "接取施工觀察任務後，到鋼筋區旁找吳師傅開始挑戰。與師傅的選項會改變對話與現場標示。",
      );
      if (c.status === "active") {
        for (const [id, label] of Object.entries(evidenceLabels))
          this.entry(
            content,
            c.evidence.includes(id as keyof typeof evidenceLabels)
              ? "已記錄"
              : "待調查",
            label,
            "需要實際走到現場調查，同一依據只計一次。",
          );
        this.entry(
          content,
          "三方確認",
          "工班溝通進度",
          `吳師傅：${c.wu === "none" ? "尚未核對" : c.wu === "force" && !c.wuRepaired ? "尚需補問現況" : "已核對"}。周師傅：${c.chen === "none" ? "尚未核對" : c.chen === "rush" && !c.chenCorrected ? "尚需修正建議" : "已確認待處理事項"}。`,
        );
      }
      this.entry(
        content,
        "評分依據",
        "觀察 30・判斷 30・安全 25・溝通 15",
        "不以速度計分。若先提出不完整建議，仍能補問與修正；紀錄會說明本次保留的扣分原因。",
      );
    } else {
      const result = c.history[c.history.length - 1];
      if (result) {
        const score = document.createElement("div");
        score.className = "review-score";
        const num = document.createElement("strong");
        num.textContent = result.total + " / 100";
        const grade = document.createElement("span");
        grade.textContent =
          result.grade + " · 第 " + result.attempt + " 次練習";
        score.append(num, grade);
        content.append(score);
        for (const card of result.cards) {
          const row = document.createElement("article");
          row.className = "review-card";
          const h = document.createElement("h3");
          const name = document.createElement("span");
          name.textContent = card.name;
          const points = document.createElement("b");
          points.textContent = card.points + " / " + card.max;
          h.append(name, points);
          const meter = document.createElement("meter");
          meter.max = card.max;
          meter.value = card.points;
          meter.setAttribute("aria-label", card.name);
          const reason = document.createElement("p");
          reason.textContent = card.reason;
          row.append(h, meter, reason);
          content.append(row);
        }
        this.entry(
          content,
          "林學長的回饋",
          "下一次，怎麼做得更好",
          result.feedback,
        );
        this.entry(
          content,
          "可重新挑戰",
          "回到鋼筋區找吳師傅",
          "新的一次練習會重新記錄挑戰依據與對話，保留最近五次評核。原本的實習任務、背包與兩區域進度不會被清除。",
        );
      }
    }
    if (c.history.length) {
      const history = document.createElement("p");
      history.className = "review-history";
      history.textContent =
        "最近練習紀錄：" +
        c.history.map((r) => `第 ${r.attempt} 次 ${r.total} 分`).join(" / ");
      content.append(history);
    }
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

import { OfficeDialogue } from "../ui/Dialogue";
import { ProgressStore, SITE_OBJECTIVES, type SiteJob } from "./progress";
const people = {
  construction: {
    name: "林學長",
    role: "施工工程師・依圖施工",
    look: "planner" as const,
  },
  safety: {
    name: "陳姐",
    role: "職安工程師・先看風險再行動",
    look: "colleague" as const,
  },
  quality: {
    name: "許學姐",
    role: "品管工程師・讓品質可以追溯",
    look: "hr" as const,
  },
};
export const jobNames = {
  construction: "施工觀察",
  safety: "職安巡檢",
  quality: "品質查驗",
};
const brief: Record<SiteJob, string[]> = {
  construction: [
    "歡迎來到結構施工樓層。沿中間的安全通道走，先不要跨進作業範圍。你的規劃筆記，現在可以和真正的構件對照了。",
    "幫我觀察鋼筋綁紮、模板堆置與支撐架。記下各區的用途，以及施工前需要確認的條件。三處都看完再回來，我們一起整理施工順序。",
  ],
  safety: [
    "現場的防護不是背景裝飾。每一道護欄、每條通道，都在讓大家平安回家。巡檢時不需要冒險靠近危險區。",
    "從安全通道巡檢點開始，看看樓板開口防護與滅火器。若看見異常，先保持距離、做標記並回報，不要自行跨越或拆修。",
  ],
  quality: [
    "品質管理會把「看起來沒問題」變成有文件、有量測、有紀錄的確認。你也可以幫忙先核對資訊。",
    "請查看品質查驗台、管材標示與現場圖說。把材料批號、查驗紀錄與核定版次的發現記下來，完成後回報，我們再決定後續處理。",
  ],
};
const findings: Record<
  string,
  { title: string; text: string; detail: string }
> = {
  rebar: {
    title: "鋼筋綁紮區",
    text: "構件鋼筋依號數與用途分區。綁紮網格下可看見墊塊，用來協助維持保護層。",
    detail:
      "筆記：號數、間距、搭接與保護層都需依核定圖說查驗。完成綁紮不代表可以直接澆置；必須完成相關查驗程序。",
  },
  timber: {
    title: "模板材料與施工順序",
    text: "模板與木料分區堆放，沒有占用中央通道。模板決定構件的形狀、尺寸與表面。",
    detail:
      "筆記：組立前核對尺寸與位置，並確認支撐配置、接縫及穩定性。材料整齊只是起點，施工仍依核定計畫進行。",
  },
  scaffold: {
    title: "支撐架的受力路徑",
    text: "支撐架成排配置，底部與連接件是重要的檢查位置。它們承受施工過程中的荷重。",
    detail:
      "筆記：依核定支撐計畫檢查基底、間距及連接。不能為了方便通行任意拆掉構件，有疑問先請工程師確認。",
  },
  opening: {
    title: "開口旁的異常",
    text: "你在護欄外觀察到一側固定件鬆動的巡檢標示。先保持安全距離，不進入開口區域。",
    detail:
      "已標記：樓板開口防護需複查。提醒周邊人員，向職安工程師通報，並由負責人依程序安排隔離及修復。實習生不自行拆裝。",
  },
  extinguisher: {
    title: "消防設備與可及性",
    text: "滅火器放在通道可辨識的位置，前方保持淨空。檢查牌提供設備的巡檢狀態。",
    detail:
      "筆記：確認設備位置、檢查紀錄及取用動線。發生緊急狀況先依現場應變程序通報並確保人員安全。",
  },
  lane: {
    title: "沿著通道巡檢",
    text: "箭頭指示安全通行方向。你沿動線查看地面，沒有把材料搬入通道，也沒有穿越警戒線。",
    detail:
      "筆記：通道需保持淨空，材料不得妨礙通行與疏散。發現阻塞應回報，依規劃處理，不能自行改走危險區。",
  },
  quality: {
    title: "品質檢查表",
    text: "查驗台上的紀錄包含構件編號、檢查日期、檢查人員與待追蹤事項，對應現場施工位置。",
    detail:
      "筆記：檢查表有一項「材料證明待補」。未完成確認前應依程序標示及管制，不能只因外觀正常就判定可使用。",
  },
  pipe1: {
    title: "材料標示與批號",
    text: "管材依規格堆放並設有防滾措施。標籤提供規格與批號，可以和進場查驗紀錄核對。",
    detail:
      "筆記：批號與文件需要一一對應。你把待補證明的批次記下來，交給品管人員追蹤，不自行批准使用。",
  },
  bim: {
    title: "現場使用的圖說",
    text: "工作站保存核定 C 版圖說，標明東側開口異動；和你在規劃室看見的資訊相互對應。",
    detail:
      "筆記：現場需使用核定文件，並讓圖說版次、構件編號與查驗紀錄可以相互追溯。模型若未同步，仍須依協調程序確認。",
  },
};
export class SiteStory {
  constructor(
    private store: ProgressStore,
    private dialogue: OfficeDialogue,
  ) {}
  talk(id: string) {
    const job: SiteJob = id === "quality-npc" ? "quality" : (id as SiteJob);
    if (!people[job]) return;
    const status = this.store.state.siteTasks[job],
      who = people[job];
    if (status === "available")
      this.dialogue.show(
        who,
        [
          { title: `一起做一份${jobNames[job]}紀錄`, text: brief[job][0] },
          { title: "接下任務後，再開始巡查", text: brief[job][1] },
        ],
        () => this.store.acceptSite(job),
        { endLabel: "接取任務・沿通道探索", defer: true },
      );
    else if (status === "active")
      this.dialogue.show(who, [
        {
          title: "把觀察變成可以交流的筆記",
          text: `目前完成 ${SITE_OBJECTIVES[job].filter((id) => this.store.state.siteSeen.includes(id)).length} / 3。未調查的目標才會有驚嘆號。你可以自由決定順序，也可以先回辦公區整理資料。`,
        },
        { title: "不確定的地方，先留下問題", text: brief[job][1] },
      ]);
    else if (status === "ready")
      this.dialogue.show(
        who,
        [
          {
            title: "讓我們一起核對你的發現",
            text:
              job === "safety"
                ? "你記錄了開口固定件異常，並在護欄外通報，這就是正確的巡檢起點。我會安排負責人確認隔離與修復，再依程序複查。"
                : job === "quality"
                  ? "你發現材料證明仍待補，也核對了批次、圖說與構件紀錄。這些資訊會交給負責人追蹤；未完成確認前維持標示管制。"
                  : "鋼筋、模板與支撐是一整套施工流程。依圖核對、依計畫作業、完成查驗，才能安全地銜接下一個步驟。",
          },
          {
            title: "這份紀錄，也是一份責任",
            text: "謝謝你把看到的現象說清楚。觀察不是代替專業人員決定施工，而是讓團隊更早注意到需要確認的事情。把紀錄收好，另外兩位學長姐也很歡迎你去交流。",
          },
        ],
        () => this.store.reportSite(job),
        { endLabel: "回報完成・收下工作紀錄" },
      );
    else
      this.dialogue.show(who, [
        {
          title: "你的紀錄已經交給團隊",
          text: "這項任務已完成。可以繼續探索，也可以找另外兩位負責人接取任務。三組都完成後，回辦公區找雅涵交流今天的收穫。",
        },
      ]);
  }
  inspect(id: string) {
    const finding = findings[id];
    if (!finding) return false;
    const job = (Object.keys(SITE_OBJECTIVES) as SiteJob[]).find((job) =>
      SITE_OBJECTIVES[job].includes(id),
    )!;
    const active = ["active", "ready", "complete"].includes(
      this.store.state.siteTasks[job],
    );
    this.dialogue.show(
      { name: "現場實習筆記", role: jobNames[job], look: "intern" },
      active
        ? [
            { title: finding.title, text: finding.text },
            { title: "記下觀察與需要確認的事", text: finding.detail },
          ]
        : [
            {
              title: finding.title,
              text: "先找這一區的負責人接取任務，了解巡查範圍與注意事項，再開始記錄。現在不要跨越防護或自行操作設備。",
            },
          ],
      () => {
        if (active) this.store.inspectSite(id);
      },
      { endLabel: active ? "記入現場觀察紀錄" : "先和負責人交流" },
    );
    return true;
  }
}

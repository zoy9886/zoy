import { OfficeDialogue, type DialogueChoice } from "../ui/Dialogue";
import { ProgressStore } from "./progress";
import {
  verifiedReady,
  evidenceLabels,
  type ChallengeEvidence,
} from "./challengeModel";
const steel = {
  name: "吳師傅",
  role: "鋼筋工班班長・二十年的現場經驗",
  look: "steelworker" as const,
};
const form = {
  name: "周師傅",
  role: "模板工班班長・先把現況說清楚",
  look: "formworker" as const,
};
const engineer = {
  name: "林學長",
  role: "施工工程師・負責協調與施工確認",
  look: "planner" as const,
};
const delivery = {
  name: "小許",
  role: "材料與文件聯絡員",
  look: "logistics" as const,
};
const objectEvidence: Record<string, ChallengeEvidence> = {
  bim: "drawing",
  rebar: "component",
  scaffold: "support",
};
export class ChallengeStory {
  constructor(
    private store: ProgressStore,
    private dialogue: OfficeDialogue,
    private showReview: () => void,
    private normalConstruction: () => void,
  ) {}
  private menu(
    person: typeof steel | typeof form | typeof engineer | typeof delivery,
    title: string,
    text: string,
    choices: DialogueChoice[],
  ) {
    this.dialogue.show(person, [{ title, text, choices }]);
  }
  private start() {
    this.dialogue.show(
      steel,
      [
        {
          title: "澆置前的三方溝通",
          text: "C3 梁的準備工作遇到文件與支撐調整問題。林學長要你先了解工班現況，再整理一份有依據的回報，不是代替工程師批准施工。",
        },
        {
          title: "觀察、詢問，再做判斷",
          text: "走訪現場圖說、鋼筋 C3 標示與支撐架；和我、模板周師傅溝通，最後向林學長回報。觀察 30、判斷 30、安全處置 25、溝通回報 15 分，不計速度。選擇會留下紀錄，也能補查與修正。",
        },
      ],
      () => this.store.startChallenge(),
      {
        endLabel:
          "接受挑戰・開始第 " +
          (this.store.state.challenge.attempt + 1) +
          " 次練習",
        defer: true,
      },
    );
  }
  talk(id: string) {
    const c = this.store.state.challenge;
    if (id === "master-wu") {
      if (c.status !== "active") {
        this.menu(
          steel,
          c.status === "complete"
            ? "工作要靠大家把話說清楚"
            : "新同學，先別急著下結論",
          c.status === "complete"
            ? "你的上次溝通紀錄還在。可以看看工程師的回饋，再用新的方式練習；原本的實習任務不會被清掉。"
            : "我手上有一件和 C3 梁有關的小狀況。現場不是只會看圖就好，還得知道工班現在做到哪裡。要和我一起練習嗎？",
          [
            {
              id: "start-challenge",
              label:
                c.status === "complete" ? "重新挑戰一次" : "接下施工溝通挑戰",
              disabledReason:
                this.store.state.siteTasks.construction === "available"
                  ? "先找林學長接取施工觀察任務"
                  : undefined,
              select: () => this.start(),
            },
            {
              id: "worker-chat",
              label: "先聊聊師傅的工作",
              select: () =>
                this.dialogue.show(steel, [
                  {
                    title: "圖要看，人也要聽",
                    text: "每次交接，最怕大家以為講的是同一件事，實際上拿著不同資料。我的習慣是先說位置、目前做到哪裡，再一起把文件攤開來看。",
                  },
                ]),
            },
            ...(c.status === "complete"
              ? [
                  {
                    id: "open-review",
                    label: "查看上次評核",
                    select: () => this.showReview(),
                  },
                ]
              : []),
          ],
        );
        return true;
      }
      if (c.wu === "none") {
        this.menu(
          steel,
          "你會怎麼開口？",
          "吳師傅把手邊的工作暫放下：「你說 C3 這邊有要確認的事？我這裡也有一份圖，你先說說你看到什麼。」",
          [
            {
              id: "wu-ask",
              label: "先問目前進度、施工位置與圖說版次，再一起核對。",
              select: () => this.wu("ask"),
            },
            {
              id: "wu-assist",
              label: "請林學長協助一起對圖，我先記錄工班的現況。",
              select: () => this.wu("assist"),
            },
            {
              id: "wu-force",
              label: "先要求按我手上的圖重做，現況之後再問。",
              select: () => this.wu("force"),
            },
          ],
        );
        return true;
      }
      if (c.wu === "force" && !c.wuRepaired) {
        this.menu(
          steel,
          "先補上我們還沒確認的事",
          "「你還不知道這一段做到哪裡，就說全部重做，我很難安排人力。先把位置、版次和現況說清楚，請工程師一起確認，好嗎？」",
          [
            {
              id: "wu-repair",
              label: "收回先前的判斷，補問現況並請工程師協助。",
              detail: "會保留這次修正的紀錄，不必重新開始。",
              select: () => this.wu("ask"),
            },
            {
              id: "wu-leave",
              label: "先去補看現場資料，稍後回來。",
              select: () => {},
            },
          ],
        );
        return true;
      }
      this.dialogue.show(steel, [
        {
          title: "吳師傅確認的現況",
          text: "「我們接到的紙本標 B 版，今天還沒收到 C 版交接。C3 目前是準備查驗，不是已經取得澆置放行。你把這兩件事和林學長說清楚。」",
        },
        {
          title: "同一件事，要用同一份依據交流",
          text: "工班願意協助核對，但施工安排仍由負責人確認。吳師傅提醒你：把紙本版本與現場做到哪裡分開記錄，別把其中一項當成全部。",
        },
      ]);
      return true;
    }
    if (id === "master-zhou") {
      if (c.status !== "active") {
        this.dialogue.show(form, [
          {
            title: "好的安排，先從了解現況開始",
            text: "我負責模板與支撐的工班交接。新同學可以先去鋼筋區找吳師傅，接一個需要我們一起溝通的小挑戰。",
          },
        ]);
        return true;
      }
      if (c.chen === "none") {
        this.menu(
          form,
          "工期壓力下，先確認哪件事？",
          "周師傅指著支撐調整便條：「下午的人手要安排了，但這一處的調整還等工程師確認。你剛剛看過現場，有什麼資訊要帶回去？」",
          [
            {
              id: "zhou-hold",
              label: "記錄支撐待確認，請工程師安排受影響工項的後續。",
              detail: "不自行放行，也不代替工班決定施工方法。",
              select: () => this.zhou("hold"),
            },
            {
              id: "zhou-review",
              label: "先請班長與工程師核對核定支撐計畫，再安排確認。",
              select: () => this.zhou("review"),
            },
            {
              id: "zhou-rush",
              label: "建議先按舊安排做，等有空再處理變更。",
              select: () => this.zhou("rush"),
            },
          ],
        );
        return true;
      }
      if (c.chen === "rush" && !c.chenCorrected) {
        this.menu(
          form,
          "這一步不能靠猜測往前做",
          "周師傅搖頭：「支撐調整還沒有確認，不能因為趕時間就照舊。這個建議我不會直接照做，請你先把待決事項交給林學長。」",
          [
            {
              id: "zhou-correct",
              label: "修正建議：維持待確認，請工程師處理受影響工項。",
              detail:
                "會保留先前建議及這次修正，安全處置項最多可恢復到 20 分。",
              select: () => this.zhou("hold"),
            },
            {
              id: "zhou-leave",
              label: "先把已知情況回報工程師。",
              select: () => {},
            },
          ],
        );
        return true;
      }
      this.dialogue.show(form, [
        {
          title: "周師傅的交接重點",
          text: "「支撐調整交由負責人確認，受影響工項還在待確認狀態。請把位置、調整內容與班組現況一起交給工程師，我會配合安排。」",
        },
      ]);
      return true;
    }
    if (id === "logistics") {
      this.dialogue.show(
        delivery,
        [
          {
            title: "新版文件，還要送到使用的人手上",
            text: "「電腦有 C 版，不代表每個工班手上都是 C 版。交接要留下版次、日期與接收人，也要依規定管理舊版文件。」",
          },
          {
            title: "一張便條，不等於施工放行",
            text: "小許幫你整理了文件傳遞的線索：系統已更新，紙本仍需確認交接。可以帶著這個問題去問吳師傅，而不是直接假設他已經收到。",
          },
        ],
        () => this.store.challengeLogistics(),
      );
      return true;
    }
    if (id === "construction" && c.status !== "available") {
      if (c.status === "complete") {
        this.menu(
          engineer,
          "這次的回報，留下了哪些依據？",
          "這份紀錄列出了你這次採用的依據、處置與回報。可查看逐項得失分，或找吳師傅重新練習；重複交談不會額外加分。",
          [
            {
              id: "engineer-results",
              label: "查看施工挑戰評核",
              select: () => this.showReview(),
            },
            {
              id: "normal-construction",
              label: "交流原本的施工觀察任務",
              select: () => this.normalConstruction(),
            },
          ],
        );
        return true;
      }
      this.menu(
        engineer,
        "整理你的現場回報",
        "先分清楚「確認到的事實」與「還需要負責人決定的事項」。你可以帶著缺口來尋求協助，不需要假裝自己已經知道全部。",
        [
          {
            id: "report-verified",
            label: "完整回報 C3 位置、版本差異、工班現況與支撐待決事項。",
            disabledReason: verifiedReady(c)
              ? undefined
              : "尚需三項現場依據、吳師傅的現況核對，以及周師傅的安全處置確認。",
            select: () => this.report("verified"),
          },
          {
            id: "report-partial",
            label: "如實回報目前確認到的資料，列明尚未完成的核對。",
            detail: "可正式交件；缺少的依據會在結果中列出，也能先選補查。",
            select: () => this.report("partial"),
          },
          {
            id: "report-assume",
            label: "只說看起來沒問題，建議照原安排進行。",
            select: () => this.report("assume"),
          },
          {
            id: "report-later",
            label: "先不交件，回現場補查或繼續和師傅溝通。",
            select: () => {},
          },
          {
            id: "normal-construction",
            label: "先交流原本的施工觀察任務",
            select: () => this.normalConstruction(),
          },
        ],
      );
      return true;
    }
    return false;
  }
  private wu(mode: "ask" | "assist" | "force") {
    this.store.challengeWu(mode);
    const c = this.store.state.challenge;
    this.dialogue.show(steel, [
      {
        title:
          mode === "force"
            ? "師傅需要先知道你的依據"
            : c.wuRepaired
              ? "謝謝你回來把事情說清楚"
              : mode === "assist"
                ? "工程師加入三方確認"
                : "把現況攤開來一起看",
        text:
          mode === "force"
            ? "「先等一下。你還沒問目前做到哪裡，我沒辦法只憑一句話安排重做。先核對資料，再由工程師協調。」"
            : mode === "assist"
              ? "林學長陪你一起核對。吳師傅說：「我們拿到的是 B 版紙本，C3 還在待查驗，尚未取得澆置放行。請把這個現況連同核定 C 版交給工程師協調。」"
              : "「我們手上是 B 版紙本，C3 還在待查驗階段，沒有澆置放行。你把現場標示和 C 版一起核對，再問問模板周師傅支撐調整的狀況。」",
      },
      {
        title: "現場反應已記入挑戰紀錄",
        text:
          mode === "force"
            ? "目前仍缺少完整的工班現況。可以再和吳師傅交談，補問位置與版次；修正後也會保留原先的溝通紀錄。"
            : "已取得工班提供的版次與作業階段。這是現況線索，不是由實習生批准施工。也可找材料聯絡員小許了解紙本交接。",
      },
    ]);
  }
  private zhou(mode: "hold" | "review" | "rush") {
    this.store.challengeChen(mode);
    this.dialogue.show(form, [
      {
        title:
          mode === "rush"
            ? "這個建議還不能執行"
            : mode === "review"
              ? "先把核定計畫拿來一起核對"
              : "先把待確認的工項標清楚",
        text:
          mode === "rush"
            ? "「我不會因為實習生建議就跳過確認。這一處仍由工程師管制，請你把支撐調整的問題帶回去。」"
            : mode === "review"
              ? "周師傅取出支撐計畫的交接單：「請班長與工程師一起核對這一處的調整，受影響工項維持待確認。你可以把計畫核對與交接現況一起帶回去。」"
              : "「好，我會維持受影響工項的待確認標示，配合負責人核對計畫。你把現況帶給林學長，確認完成以前不要自行說可以繼續。」",
      },
    ]);
  }
  private report(mode: "verified" | "partial" | "assume") {
    this.dialogue.show(engineer, [
      {
        title: "正式交件前，確認你的回報",
        text:
          mode === "verified"
            ? "C3 工班仍持 B 版，核定文件為 C 版；構件尚待查驗，支撐調整也待負責人確認。你建議釐清版本與現況後，由相關人員協調受影響工項。"
            : mode === "partial"
              ? "你會提交目前確認到的現象，並明列尚未完成的核對。工程師會要求補查；本次結果會保留缺少的觀察項目，不把未知當成已確認。"
              : "林學長提醒：「看起來沒問題，不能當成放行依據。」工程師仍會維持管制，要求重新核對。你的回報缺口會記入本次評核。",
      },
      {
        title: "這次練習會留下可查看的結果",
        text: "交件後保留本次紀錄，不會因為再點一次物件就加分。可在手冊的評核頁看四項配分、得失分原因與改善建議，再找吳師傅開始新的一次練習。",
        choices: [
          {
            id: "confirm-submit",
            label: "確認交件，查看這次評核",
            select: () => {
              this.store.submitChallenge(mode);
              this.showReview();
            },
          },
          {
            id: "cancel-submit",
            label: "先不交件，回去補查",
            select: () => {},
          },
        ],
      },
    ]);
  }
  observe(id: string) {
    const evidence = objectEvidence[id];
    if (!evidence || this.store.state.challenge.status !== "active")
      return false;
    const details: Record<ChallengeEvidence, string> = {
      drawing:
        "現場工作站的核定圖說是 C 版，文件記錄指向 3F C3 梁的異動。請核對工班手上的紙本，不要假設系統更新就代表紙本已交接。",
      component:
        "鋼筋區標示構件 C3，現況為準備查驗。這塊標示只能證明構件位置與工作階段，不能當成已經批准澆置。",
      support:
        "支撐架旁的調整便條寫著「待工程師確認」。請保持現況，不進入作業區或自行調整構件；找模板周師傅了解交接情況。",
    };
    this.dialogue.show(
      { name: "挑戰現場筆記", role: "位置 × 版次 × 工作現況", look: "intern" },
      [
        { title: evidenceLabels[evidence], text: details[evidence] },
        {
          title: "帶著事實去找人確認",
          text: "現場資料只是其中一部分。還需要和鋼筋吳師傅、模板周師傅核對，最後向林學長回報。記錄只計一次，不會因重複操作累積分數。",
        },
      ],
      () => {
        this.store.observeChallenge(evidence);
        this.store.inspectSite(id);
      },
      { endLabel: "記入挑戰依據" },
    );
    return true;
  }
}

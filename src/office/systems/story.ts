import { OfficeDialogue } from "../ui/Dialogue";
import { ProgressStore } from "./progress";
export class OfficeStory {
  constructor(
    private store: ProgressStore,
    private dialogue: OfficeDialogue,
  ) {}
  talk(id: string) {
    const s = this.store.state;
    if (id === "hr") {
      const who = { name: "雅涵", role: "HR・實習夥伴", look: "hr" as const };
      if (!s.hr)
        this.dialogue.show(
          who,
          [
            {
              title: `${s.name}，你來啦。`,
              text: "我剛剛還在想，第一天來的人會不會找不到入口。別緊張，我是雅涵，這段實習有什麼問題都可以找我。",
            },
            {
              title: "先領取今天的裝備",
              text: "這是你的識別證、安全帽，還有一本空白的實習手冊。辦公室可以自由走動；進工地以前，還需要學長姐帶領與現場安全說明。",
            },
            {
              title: "先認識，建築是怎麼開始的",
              text: "穿過中間走道，右手邊就是規劃室。去找戴眼鏡、穿藍襯衫的林以安。他手邊有一件小事，很適合當你的第一個任務。",
            },
            {
              title: "留一點空間給自己的發現",
              text: "不用把每個專有名詞都背起來。先看看，問問為什麼。休息區的阿哲也很喜歡和新同學聊天。準備好了嗎？",
            },
          ],
          () => this.store.checkIn(),
          { endLabel: "接過識別證與安全帽" },
        );
      else if (s.planning === "complete" && !s.chapterComplete)
        this.dialogue.show(
          who,
          [
            {
              title: "帶著第一份筆記回來了",
              text: "以安剛剛跟我說，你沒有只看模型漂亮不漂亮，還注意到它和最新版圖說的差異。這種觀察力，在現場很有用。",
            },
            {
              title: "一個人畫圖，一群人把它做好",
              text: "規劃、施工、職安、品管會從不同角度看同一棟建築。今天你先找到一條連接大家的線：弄清楚資訊，然後和人確認。",
            },
            {
              title: "第一章・辦公室的線索",
              text: "這枚「辦公室見習章」送給你。辦公區仍可繼續探索。下一階段才會開放施工、職安與品管的現場故事，今天先把你的發現好好收起來。",
            },
          ],
          () => this.store.finishChapter(),
          { endLabel: "收下見習章，完成本章" },
        );
      else
        this.dialogue.show(who, [
          {
            title: s.chapterComplete
              ? "歡迎隨時回來坐坐"
              : "第一天，慢慢來就好",
            text: s.chapterComplete
              ? "你的辦公室見習筆記已經完成。你可以再看看規劃室的線索、和阿哲交流，或到茶水區休息。後續施工現場會在下一階段開放。"
              : "林以安在走道右手邊的規劃室。你可以先和他聊聊；如果想知道各房間的位置，實習手冊裡有一張簡圖。",
          },
        ]);
      return;
    }
    if (id === "planner") {
      const who = {
        name: "林以安",
        role: "規劃工程師・把想法變成共同語言",
        look: "planner" as const,
      };
      if (!s.hr) {
        this.dialogue.show(who, [
          {
            title: "你是今天的新同學吧？",
            text: "歡迎！先到走道左側的 HR 室找雅涵報到，領識別證和安全帽。等你回來，我們再一起看看這個案子的規劃。",
          },
        ]);
        return;
      }
      if (s.planning === "available") {
        this.dialogue.show(
          who,
          [
            {
              title: "圖說之外，還有很多故事",
              text: `${s.name}，我是以安。你看桌上的圖說、電腦、模型，它們講的是同一棟辦公樓，但不一定在同一個時間更新。`,
            },
            {
              title: "幫我找三個線索，好嗎？",
              text: "請看看北側桌上的 3F 圖說、東側電腦的協作紀錄，以及南側的樓層模型。不用照順序，自己決定從哪裡開始。",
            },
            {
              title: "我們不急著找一個標準答案",
              text: "操作設備，記下你看到的版本與動線。三份筆記都完成後，再回來告訴我：如果要拿去現場施工，還有什麼需要先確認？",
            },
          ],
          () => this.store.accept(),
          { endLabel: "接下任務・開始找線索", defer: true },
        );
        return;
      }
      if (s.planning === "active") {
        this.dialogue.show(who, [
          {
            title: `已經有 ${s.inspected.length} 份觀察筆記了`,
            text: "接取任務後，還沒調查的設備上方會有驚嘆號。圖說可以切換樓層，電腦可以開啟文件紀錄，模型則能換個方向看。",
          },
          {
            title: "用你的步調慢慢看",
            text: "發現看不懂的地方，先記在手冊裡。還沒有把三個線索看完也沒關係，我會在這裡。",
          },
        ]);
        return;
      }
      if (s.planning === "ready") {
        this.dialogue.show(
          who,
          [
            {
              title: "來，讓我們把線索擺在一起",
              text: "你的筆記寫著：3F 圖說是 C 版，協作紀錄顯示東側開口已調整；模型標籤卻還是 B 版。你注意到它們沒有完全同步。",
            },
            {
              title: "模型很有用，也需要被確認",
              text: "模型幫大家理解空間與動線，圖說則提供施工所需資訊。發現差異時，要確認核定文件、提出協調，不能直接把漂亮的模型當成施工依據。",
            },
            {
              title: "這就是跨部門協作的開始",
              text: "我會把你的發現帶進下午的協調會。這張「圖說協調便條」留給你：記錄發現、確認版本、向負責的人溝通。回去找雅涵，聊聊你的第一份收穫吧。",
            },
          ],
          () => this.store.report(),
          { endLabel: "回報完成・收下協調便條" },
        );
        return;
      }
      this.dialogue.show(who, [
        {
          title: "會觀察，也會把問題說清楚",
          text: "今天你完成了第一個規劃任務。以後走到施工現場，也別忘了這件事：遇到不一致，先停下來確認，再和相關人員一起解決。",
        },
        {
          title: "有些收穫，要說出來才會留下",
          text: s.chapterComplete
            ? "想再看一次三個設備也可以。你的觀察紀錄已經保存在實習手冊裡。"
            : "雅涵在 HR 室等你。帶著今天的發現回去聊聊吧。",
        },
      ]);
      return;
    }
    this.dialogue.show(
      { name: "阿哲", role: "工務助理・你的休息區鄰座", look: "colleague" },
      [
        {
          title: "第一天也可以先喝口水",
          text: "我剛來的時候，以為工程師每天都在看工地。後來才知道，電話、文件、協調，也占了很重要的一部分。",
        },
        {
          title: "問問題，不會顯得你不懂",
          text: "真正讓人擔心的，是沒確認就照自己的想法做。我的小秘訣是：先說你看到什麼，再問你不確定什麼。以安很願意聽。",
        },
        {
          title: "休息區的窗邊，是我的充電站",
          text: "手冊可以隨時打開。別急著把整個辦公室走完，看看窗外、翻翻工程年鑑，也會找到一些有意思的故事。",
        },
      ],
    );
  }
}

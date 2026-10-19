# 豐譽實習探索之旅

以營造業暑期實習為主題的俯視像素 RPG。這次交付第一、二階段的施工樓層可玩版本，並提供一條完整的現場觀察任務。

## 執行

需要 Node.js 22.12+ 或 24。

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Vite 的 base 固定為 `/zoy/`。開發及預覽時請開啟伺服器的 `/zoy/` 路徑。

## 操作

- 首次進入輸入姓名，選擇安全帽配色。
- WASD / 方向鍵移動；靠近人物或物件按 E / 空白鍵。
- 手機使用方向按鈕及互動鈕，支援多點觸控。
- 紅色三角形標示可交流的人物，靠近時底部顯示互動提示。
- 找林學長接取任務，調查鋼筋、模板、樓板開口與品質查驗台，回答問題後回報領取徽章。
- 進度每 2.5 秒及任務完成時保存於 localStorage。存檔只存在目前瀏覽器，不跨裝置同步。清除網站儲存資料會重新開始。

## 結構

- `src/main.ts`：Phaser 初始化。
- `src/world/SiteScene.ts`：Tilemap、分層場景、碰撞與互動。
- `src/world/site.ts`：施工區配置、物件及 NPC 資料。
- `src/world/player.ts`：四方向移動與動畫。
- `src/art/atlas.ts`：原創像素素材圖集及角色幀。
- `src/systems/`：多頁對話、問答、存檔。
- `src/ui/controls.ts`：觸控輸入。
- `tests/game.spec.ts`：真實瀏覽器操作測試。

地面為 32px Tilemap。物件為 64px 圖集幀，依腳底 Y 排序，角色也使用腳底深度；牆柱在前方會遮擋角色。碰撞體只覆蓋物件地面占用區。攝影機隨玩家移動，不是單張場景圖片。

### 素材規範

素材不依賴外部 CDN。所有圖像為本專案的程式化手繪像素圖集，無外部圖片授權需求。命名及類別：

| 類別       | 圖集幀名稱                         |
| ---------- | ---------------------------------- |
| 建築結構   | floor, lane, wall, column, opening |
| 臨時工程   | rebar, timber, scaffold            |
| 材料機具   | pallet, tools, pipe                |
| 職安設備   | cone, extinguisher, rail, sign     |
| 專業工作站 | desk, bim, quality                 |
| 人物       | worker：4 方向 × 3 幀              |

這是第一版自製素材，尚非完整商用品質美術包。後續需補：HR 櫃台、門窗與未完成隔間、混凝土梁專用連接件、安全網、手推車、電動工具、電纜、材料桶、會議桌、獨立職種角色造型。新增素材應維持 32px 基準、64×72 物件幀、32×32 角色幀，俯視偏正面視角、冷灰藍配色、左上光源及透明背景。不以重複素材宣稱覆蓋所有設備。

## 測試

```sh
npx playwright install chromium
npm test
# 已有系統 Chromium 時：
CHROMIUM_PATH=/usr/bin/chromium npm test
```

測試實際透過鍵盤走訪任務點，檢查移動、障礙碰撞、互動問答、獎勵、重新載入保存及手機按鈕。`window.__site` 提供唯讀診斷快照，不提供傳送或修改遊戲狀態能力。截圖保存在忽略的 `test-results/`。

## GitHub Pages

已提供 `.github/workflows/deploy.yml`，推送 `main` 後會建置並部署。

1. GitHub 儲存庫 → **Settings → Pages**。
2. **Build and deployment → Source** 選擇 **GitHub Actions**。
3. 合併此版本到 `main`，或在 Actions 手動執行部署工作流程。
4. 成功後網址為 https://zoy9886.github.io/zoy/ 。工作流程成功前不能視為已上線。

## 開發階段

- 第一階段：專案、素材載入、角色命名、行走、攝影機、手機操作、Tilemap 及碰撞。
- 第二階段：分區施工樓層、材料與工作站圖集、職安開口防護、地面動線、深度排序與遮擋。
- 提前實作的第三階段：3 位 NPC、四項觀察問答、一條任務、手冊、回報獎勵及存檔。
- 尚未完成：HR / BIM / 職安 / 品管獨立場景及場景切換、更長故事、完整人物與專業設備素材、音效、無障礙替代玩法及真機裝置驗證。不得把此版本視為五區域完整版。

教育內容僅供遊戲認識職務，不取代現場核定施工計畫、職安訓練與專業指導。

# 豐譽實習探索之旅 · 第一章「辦公室的線索」

Phaser 3 + TypeScript + Vite 的俯視像素探索 RPG。本分支重製第一階段，從報到開始，完成辦公區的規劃見習故事。角色可自由移動、進入房間、與人物交流，操作設備找線索；沒有心理測驗、答題計分或人格結果。

## 本次交付

- 可探索的 HR 室、規劃室、中央走道、交流休息區、共用事務區與入口集合區。
- Tilemap 地面、獨立家具圖集、牆面與門口、窗景、光影、地面碰撞及腳底深度排序。
- 4 方向、每方向 3 張行走幀；實習生、HR、規劃工程師與工務助理有不同外觀。報到後實習生戴上安全帽。
- HR 多頁報到劇情，領取識別證、安全帽、實習手冊。
- 規劃 NPC 的完整任務：可暫不接取；接取後才解鎖三個設備的驚嘆號；調查與記錄後需回報才能完成。
- 圖說切換樓層、電腦開啟核定紀錄、模型旋轉。三個觀察的順序由玩家決定。
- 回 HR 交流，領取辦公室見習章；完成後可繼續探索環境物件和一般 NPC。
- 人物像素立繪、任務追蹤、筆記、背包、位置簡圖、繼續遊戲、重新開始、每 2 秒自動保存。
- 9:16 遊戲畫框、手機多點方向操作、鍵盤操作、可選的環境低鳴與腳步聲。

本章只實作一位主要任務 NPC：規劃工程師林以安。HR 雅涵與工務助理阿哲不顯示紅色任務三角。施工、職安與品管三位主要任務 NPC 及其現場區域保留於後續階段，未用假任務或傳送點宣稱完成。

## 開始開發

Node.js 22.12+ 或 24：

```sh
npm ci
npm run dev
```

Vite 路徑為 `/zoy/`。開發伺服器從 `client/index.html` 載入新章節。

```sh
npm run build          # TypeScript 檢查、建置新版與舊版，更新根目錄靜態檔
npm run serve:static   # 從根目錄測試 Pages 的實際靜態檔
npm run preview       # 從 dist 預覽正式建置
```

根目錄 `index.html`、`legacy.html`、`assets/` 為生成產物，請修改來源後重新建置。

## 遊玩

1. 選「開始我的第一天」，輸入姓名。
2. 沿中央走道往北，從左側門口進 HR 室，接近雅涵後互動，完成報到。
3. 穿過走道進右側規劃室，找戴眼鏡、穿藍襯衫的林以安。閱讀對話後接取任務。
4. 調查桌上圖說、電腦與模型。每個設備需要實際操作後，才能記入筆記。可以任意決定順序。
5. 三份筆記完成後，回到以安身邊回報，獲得圖說協調便條。
6. 回 HR 室與雅涵交流，收下辦公室見習章，完成第一章。

WASD / 方向鍵移動，E / 空白鍵互動。對話也可以按 E / 空白鍵繼續。手機使用方向鈕與互動鍵。右上手冊提供任務、背包與目前位置簡圖。聲音預設關閉，可用音符按鈕切換。

進度保存於目前瀏覽器的 `fengyu-office-v2`，不跨裝置同步。重新開始只取代本章存檔，保留舊版 `fengyu-site-v1`。儲存不可用時會提示，不宣稱已保存。

## 模組

| 路徑                               | 用途                                            |
| ---------------------------------- | ----------------------------------------------- |
| `src/main.ts`                      | 新版 Phaser 初始化                              |
| `src/office/world/data.ts`         | 房間、牆、門口、家具、NPC 與互動位置            |
| `src/office/world/OfficeScene.ts`  | Tilemap、渲染、遮擋、碰撞、鏡頭、輸入與 UI 串接 |
| `src/office/world/OfficePlayer.ts` | 四方向角色動畫與移動                            |
| `src/office/art/`                  | 配色、家具素材、分職種人物、96×112 對話立繪     |
| `src/office/systems/progress.ts`   | 任務狀態機、物品與獨立版本存檔                  |
| `src/office/systems/story.ts`      | HR、規劃與一般 NPC 的多段故事                   |
| `src/office/systems/audio.ts`      | 可關閉的合成環境音與腳步                        |
| `src/office/ui/`                   | 對話、可操作的設備調查、手冊                    |
| `tests/office.spec.ts`             | 真實鍵盤走訪及手機指標操作的瀏覽器驗證          |

## 素材

所有像素素材為本專案自製，由程式逐像素繪製成可重用 Canvas 素材，無外部圖片 CDN。32px 地面 Tilemap 與家具、人物分開處理，場景不是一張背景圖。

- 建築：六幀地面、分段牆面、門檻、窗框、窗景、指示牌。
- 家具：reception、cabinet、files、sofa、coffee、notice、chair、pantry。
- 專業設備：blueprint、computer、model、board、printer、workdesk。
- 環境：plant、water、sign、site-door。
- 人物：intern / intern-helmet、hr、planner、colleague；每套 4 方向 × 3 幀。
- 立繪：同一人物配色與服裝，96×112px，獨立繪製臉部、頭髮、眼鏡、領口與識別證。

已加入分層家具與細節，但這是第一階段自製像素版本，尚未完成所有角色情緒立繪、辦公動畫變體與工地美術。正式完整篇仍需要施工設備、職安設施、品管工具與三個職種的完整立繪及行走素材。

## 測試

```sh
npx playwright install chromium
npm test
# 已有系統 Chromium：
CHROMIUM_PATH=/usr/bin/chromium npm test
```

測試從實際靜態首頁開始建立角色，不注入已完成的任務、不傳送玩家。路線以唯讀幾何資訊計算，再用真正的鍵盤事件逐段走訪。檢查未接取不可調查、暫不接取、接取後才有標記、不同順序操作設備、回報才完成、背包獎勵、讀檔、碰撞、手機方向鈕、9:16 畫框、聲音切換與重新開始。

`window.__office` 只提供測試用唯讀快照，不提供移動或修改任務的介面。模擬手機測試不等於 iOS / Android 真機驗證。驗收紀錄及截圖見 `docs/office-validation.md`。

## 保留舊版

舊版施工樓層的場景、素材與系統保留於 `src/world`、`src/art`、`src/systems`，啟動程式另存為 `src/legacy-main.ts`。`/zoy/legacy.html` 可遊玩舊版；本章採獨立的 `src/office` 模組，不共用任務存檔。舊說明保留於 `docs/legacy/README.md`。本次在新分支開發，不合併或推送 main。

## Pages

`base` 固定為 `/zoy/`，沿用 GitHub Pages Actions 與根目錄靜態發布兩種方式。審查分支不會自動取代 main 的線上遊戲。未經驗收，不切換正式站。

完成審查後才合併至 main；若使用 Actions，Settings → Pages → Source 選 GitHub Actions。若直接從分支發布，選 main / root，根目錄生成檔即可運作。發布時不要在兩種來源之間反覆切換。

本作品為職務認識的故事遊戲，不取代現場安全告知、核定施工文件或專業指導。

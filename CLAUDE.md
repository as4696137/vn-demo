# CLAUDE.md

互動式視覺小說（職場 burnout 主題，三結局，劇情中段穿插 mini-game）。
Ink 劇本 + React 19 + Zustand + Framer Motion + Howler，Vite 建置。

> 設計理念、完整架構與擴充教學見 [README.zh-TW.md](./README.zh-TW.md) — 本檔只講 agent 需要的操作規則與約束，不重複敘事。

## Commands

```bash
npm run dev         # dev server，http://localhost:5173（base 為 /）
npm run build       # tsc -b 型別檢查 + vite build → dist/（base 為 /vn-demo/）
npm test            # vitest run，跑一次（約 300ms）
npm run test:watch  # watch 模式；改 .ink 會自動重跑
npm run lint        # eslint
npm run story:build # content/story.xlsx → src/story/new-main.ink（劇本由 Excel 產生）
npm run story:verify# 驗證 Excel↔Ink 來回無損、可編譯、三結局可達
```

改完一定要跑 `npm test`，理由見下方「驗證」。

## 架構鐵則（不可違反）

四層單向相依：`.ink` 劇本 → `src/engine/`（純邏輯）→ `src/store/gameStore.ts`（Zustand，唯一接縫）→ `src/components/`（React/UI）。

1. **`src/engine/` 不准 import React。** 引擎是純模組（tag 解析、劇本推進、素材 registry、audio bridge），靠 unit test 保護。新增引擎邏輯放這裡並補測試，不要把 React 滲進來。
2. **UI 不准碰 inkjs。** component 只透過 `gameStore` 拿 typed 的 state，完全不知道 inkjs 存在。
3. **Mini-game 重用 choice 系統，不改 Ink 分支。** `# minigame: id` 只是把 choice 點的按鈕 UI 換成互動元件；玩家互動最終仍呼叫 `store.choose(index)`，index 必須對齊 `.ink` 裡 `* [...]` 的順序。從 Ink 的角度 mini-game 不存在。

## 改東西去哪改

| 要做什麼 | 改哪裡 |
| --- | --- |
| 加場景 / 對話 / 分支 / 結局 | 編輯 `content/story.xlsx` →（企劃流程，見下方「劇本來源」）→ 用 `npm run story:build` 產生 `src/story/new-main.ink`。**不要手改 `new-main.ink`。** |
| 新增背景 / 角色 pose / 音效 ID | `src/engine/assets.ts` 的對應 registry |
| 新增 / 改 tag 語法 | `src/engine/directives.ts`（+ `tests/directives.test.ts`） |
| 新增 mini-game | 建 component（實作 `MinigameProps`）→ 在 `src/components/minigames/index.tsx` 的 `MINIGAME_REGISTRY` 註冊 → `.ink` 標 `# minigame: id` |
| 畫面 / 動畫 / 狀態流程 | `src/components/` 與 `src/store/gameStore.ts` |

新 mini-game 的 component 檔頭請註明 choice index ↔ 選項對應，方便 review 對齊。

## 劇本來源：Excel 是 source of truth，`.ink` 是產生物

企劃不寫 Ink。劇情真實來源是 `content/story.xlsx`，經 `scripts/xlsx-to-ink.mjs` 轉成 `src/story/new-main.ink` 給引擎吃。

- **`src/story/new-main.ink` 是自動產生的 artifact，檔頭已標「請勿手改」。** 手改會在下次 `npm run story:build` 被覆蓋。要改劇情就改 Excel。
- 轉換器、ink 解析/產生、Excel 讀寫共用一份 IR：`scripts/story-ir.mjs`、`scripts/story-xlsx.mjs`；雙向 CLI 是 `xlsx-to-ink.mjs` / `ink-to-xlsx.mjs`。改轉換邏輯後跑 `npm run story:verify`（來回無損 + 編譯 + 三結局可達）。
- **Excel 欄位靠標題列括號內關鍵字認**（`(bg)`、`(knot)`…），可重排欄位，但**不要改動或重複括號內的字**。實際踩過的雷：背景欄標題被誤設成 `(knot)`，背景值就被當成段落名，Ink 報重複段落而編譯失敗。
- 完整欄位說明見 `content/README.md` 與 README 的「Excel 劇本工作流程」。

## 驗證與 gotchas

- **`tests/story.test.ts` 是最高 ROI 的測試**：DFS 走過 Ink 所有可達分支，驗證三結局可達、且所有 `# bg/chara/se/minigame` 的 ID 都已在 `assets.ts` 註冊。**劇本引用了沒註冊的 ID 會在這裡 fail，不會等到 runtime。** 改 Excel 並 `npm run story:build` 後、或改 registry 後，務必跑 `npm test`。
- **Asset 路徑用 `A()` 包，不要寫 leading slash。** `assets.ts` 的 `A(path)` 會自動前綴 `import.meta.env.BASE_URL`（dev 為 `/`，prod 為 `/vn-demo/`）。直接寫 `/assets/...` 會在 GitHub Pages 部署下 404。
- **import 用 `@/` alias** 指向 `src/`（見 `vite.config.ts`）。
- **`.ink` 在 build/dev 期由 `vite-plugin-ink.ts` 預編譯成 JSON**，runtime 只載 inkjs 的 Story（不載 Compiler）。`import storyJson from '@/story/new-main.ink'` 拿到的是已編譯 JSON。
- **`audio.ts` 對沒註冊的 ID 靜默忽略**（graceful placeholder），所以音效不響不一定是 bug，先確認 ID 有沒有註冊。
- **部署**：push 到 `main` 觸發 `.github/workflows/deploy.yml`（test → build → GitHub Pages → smoke probe）。smoke 步驟會檢查 HTML 是否引用 `/vn-demo/assets/`；若 base path 設定 regress，這裡會擋下。

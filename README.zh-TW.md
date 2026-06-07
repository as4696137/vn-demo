# 燃燒殆盡之前 / Before Burning Out

一款關於職場 burnout 的短篇互動式視覺小說，三個結局,劇情中段穿插互動式 mini-game。

[English README](./README.md)

<!-- TODO: 放一張截圖或 letter mini-game 的 GIF -->

---

## 關於這個專案

故事跟著一位走到 burnout 邊緣的設計師,玩家在五幕劇情中做出選擇,
通往三個結局——**沉默留下**、**離開**、**開口談一次**。
在幾個關鍵節點,選擇 UI 會換成**互動式 mini-game**——
例如主角翻到入職第一天寫給自己的那張紙時,玩家不是按鈕點擊,
而是真的用手指拖曳或輕點畫面上的那張紙。

整個專案的架構刻意把**劇情內容**和**引擎**切得很乾淨。
寫劇本的人改 `.ink` 就能加場景、換 pose、播音效,不碰 React;
工程師可以整層 UI 重寫,劇本一行不動。

## 技術棧

| 層   | 選擇                                            | 角色                           |
| ---- | ----------------------------------------------- | ------------------------------ |
| 劇情 | [inkjs](https://github.com/y-lohse/inkjs)       | Ink runtime,負責分支邏輯       |
| UI   | React 19 + TypeScript                           | 視圖層                         |
| 動畫 | [Framer Motion](https://www.framer.com/motion/) | 場景轉場、拖曳手勢             |
| 狀態 | [Zustand](https://github.com/pmndrs/zustand)    | 唯一的 store,連接 engine 與 UI |
| 樣式 | Tailwind CSS v4                                 | utility-first CSS              |
| 音效 | [Howler.js](https://howlerjs.com/)              | 帶 fade 的 BGM 與 one-shot SE  |
| 建置 | Vite + 自訂 Ink plugin                          | dev server、build              |
| 測試 | Vitest                                          | 劇本驗證 + unit test           |

## 快速開始

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 產生靜態檔到 dist/
npm test         # 跑全部測試,約 300ms
```

build 結果是純靜態 SPA,Vercel / Netlify / Cloudflare Pages / GitHub Pages
都可以部署。總資產大小約 5.6 MB。

## 架構

四層,每層只負責一件事:

```
┌──────────────────────────────────────────────────────────────────┐
│  Content     src/story/new-main.ink                              │
│              .ink 劇本——knot、choice、directive 都在 tag 裡     │
├──────────────────────────────────────────────────────────────────┤
│  Engine      src/engine/                                         │
│              InkRunner, parseTag, applyChara, audio, assets      │
│              純邏輯,沒有 React import。                          │
├──────────────────────────────────────────────────────────────────┤
│  State       src/store/gameStore.ts                              │
│              Zustand store。engine 與 UI 之間唯一的接縫。         │
├──────────────────────────────────────────────────────────────────┤
│  UI          src/components/                                     │
│              Stage、DialogueBox、ChoiceList、minigames、         │
│              EndingScreen——React + Framer Motion                │
└──────────────────────────────────────────────────────────────────┘
```

### Content — `.ink`

所有劇情內容都在 `src/story/new-main.ink`。
劇本用標準的 [Ink 語法](https://github.com/inkle/ink) 寫分支,
引擎指令以 **行上的 tag** 嵌入:

```ink
# bg: office_morning
# bgm: office_hum
# chara: xiaowen pose=gentle pos=right

「早安。」 # speaker: 小雯
```

支援的 tag:

| Tag                                | 效果                             |
| ---------------------------------- | -------------------------------- |
| `# speaker: 名字`                  | 設定下一行的講話者               |
| `# bg: id`                         | 切換背景(交叉淡出)               |
| `# chara: id pose=X pos=Y [exit]`  | 加入/更新/移除角色               |
| `# clear`                          | 移除所有角色                     |
| `# bgm: id` _(或 `none` / `stop`)_ | 切換 BGM,帶 fade                 |
| `# se: id`                         | 播一次性音效                     |
| `# minigame: id`                   | 標記下一個 choice 點為 mini-game |

Tag 的解析在 `src/engine/directives.ts`,有完整的 unit test 覆蓋。

### Engine

純模組,沒有 React,每個檔案只做一件事:

- **`InkRunner.ts`** — 包住 inkjs `Story`。每次 step 推進劇本,
  回傳一個 `StepResult` union(`line` / `choices` / `end`),
  tag 已經解析成 typed object。
- **`directives.ts`** — 把 `# tag` 字串 parse 成 `Directive` union。
- **`applyChara.ts`** — 純 reducer,套用單一 `chara` directive 到角色列表
  (進場 / 更新-保留未指定欄位 / 退場)。
- **`audio.ts`** — Howler 的橋接。對沒註冊的 ID 靜默忽略,
  所以開發中劇本可以引用還沒做出來的資源(graceful placeholder mode)。
- **`assets.ts`** — ID → 檔案路徑的 registry,加上 `prefetchAssets()`
  讓 UI 預熱 HTTP cache。
- **`useTypewriter.ts`** — 一字一字打字機效果的 hook。

### State

`src/store/gameStore.ts` 是唯一的 Zustand store,
也是 engine 與 UI 唯一相見的地方。

- **`advance()`** 推進 InkRunner。只有 directive 沒有可見文字的行
  會被 batch 在同一個 React render,
  玩家不會看到中間有空對話框閃過。
- **`choose(index)`** 選擇選項,重新進入 advance 迴圈。
- **結局流程**:Ink 跑到 `-> END` 時,store 讀取 `ending_id` 變數
  (`"A"`、`"B"`、`"C"`),先進入 `'fading'` 狀態(漸層黑色覆蓋的動畫),
  然後切到 `'end'`。

### UI

React component,完全不知道 inkjs 的存在。

- **`Stage.tsx`** 組合 `Background`、`CharaLayer`、`DialogueBox`、
  `ChoiceList`、`MinigameLayer`。
- **`DialogueBox.tsx`** 根據 `speaker` 分支:有講話者就渲染底部對話框,
  沒有(旁白)就渲染全螢幕置中字幕。
- **`minigames/`** — `MinigameLayer` 根據 `minigame.id` 從
  `MINIGAME_REGISTRY` 派發。未知 ID 會自動 fallback 到普通的 `ChoiceList`,
  劇本有 typo 也不會讓玩家卡住。

這裡有個刻意的設計:**mini-game 重用 choice 系統**。
`# minigame: letter` 標記在 choice 點上時,並不改變 Ink 的分支,
只是把按鈕 UI 換成可拖曳的紙。
拖曳手勢最終還是呼叫 `store.choose(index)`,index 跟按鈕點下去一樣。
**從 Ink 的角度看,mini-game 不存在。**

## 擴充

### 新增一幕場景

編輯 `src/story/new-main.ink`:

```ink
=== new_scene ===
# bg: office_day
# chara: jason pose=neutral pos=left

「我們需要談談。」 # speaker: Jason

-> next_scene
```

如果 `office_day` 或 `jason.neutral` 還沒註冊,
**劇本測試會在 build 之前就先 fail**——見[測試](#測試)。

### 新增一個角色 pose

1. 把圖片丟到 `public/assets/chara/`。
2. 在 `src/engine/assets.ts` 的 `CHARA_REGISTRY` 加入 entry:

   ```ts
   xiaowen: {
     // ...
     laughing: '/assets/chara/xiaowen_laughing.webp',
   },
   ```

3. 在劇本中使用:`# chara: xiaowen pose=laughing`。

### 新增一個 mini-game

Mini-game 是一個滿足 `MinigameProps` 合約的 React component:
收到 choice options,玩家完成互動時呼叫 `onChoose(index)`。

1. 建立 component:

   ```tsx
   // src/components/minigames/CoffeeMinigame.tsx
   import type { MinigameProps } from "./types";

   /**
    * Choice mapping(要跟 .ink 的選項順序對齊):
    *   index 0 → 喝下去
    *   index 1 → 倒掉
    */
   export function CoffeeMinigame({ onChoose }: MinigameProps) {
     return (
       <div className="absolute inset-0 ...">
         <button onClick={() => onChoose(0)}>喝下去</button>
         <button onClick={() => onChoose(1)}>倒掉</button>
       </div>
     );
   }
   ```

2. 在 `src/components/minigames/index.tsx` 註冊:

   ```ts
   export const MINIGAME_REGISTRY: Record<string, MinigameComponent> = {
     letter: LetterMinigame,
     coffee: CoffeeMinigame,
   };
   ```

3. 在 `.ink` 標記 choice 點:

   ```ink
   你看著桌上那杯冷掉的咖啡。 # minigame: coffee

   * [喝下去]    -> ...
   * [倒掉]      -> ...
   ```

`* [...]` 在劇本中的順序必須對應 component 裡 `onChoose(index)` 的 index——
把對應關係寫在 component 檔頭的註解裡,日後 review 時一眼就能對。

## 資源與效能管線

這個專案做過比較積極的瘦身,幾個值得提的選擇:

- **Ink 在 build 時就預先編譯。** 自訂 Vite plugin
  ([`vite-plugin-ink.ts`](./vite-plugin-ink.ts)) 在 build 時把 `.ink`
  編譯成 JSON。runtime bundle 只載 inkjs 的 Story 類別,不載 Compiler——
  省下 ~116 KB raw / ~30 KB gzip。
- **所有點陣圖都換成 WebP。** 一次性的腳本
  ([`scripts/compress-images.mjs`](./scripts/compress-images.mjs))
  把 PNG 圖檔轉成 WebP——總資產從 ~82 MB 降到 **5.6 MB**,肉眼看不出差異。
- **Idle prefetch。** 第一幕場景 paint 完 300ms 後,
  `prefetchAssets()` 用低優先級把所有 BG 與角色 pose 拉進 HTTP cache。
  後續切場景幾乎瞬切。
- **Lazy load 的 UI。** `EndingScreen` 與 `MinigameLayer` 用 `React.lazy()`
  切出去,不進入初始 bundle。

## 測試

```bash
npm test           # 跑一次
npm run test:watch # watch 模式,改 .ink 會自動重跑
```

兩個層級:

**Tier 1 — 劇本驗證** ([`tests/story.test.ts`](./tests/story.test.ts))

用 DFS + state snapshot 走過 Ink 劇本所有可達分支,確認:

- 三個結局都可達
- 所有 `# bg:` / `# chara:` / `# se:` / `# minigame:` 的 ID 都已註冊
- 劇本可以正常編譯(沒有語法錯誤)

這是 ROI 最高的測試:typo、漏註冊、divert 斷裂、結局不可達——
全部在 CI 時就抓住,不會等到 runtime 才壞。

**Tier 2 — 純函式 unit test**

- [`tests/directives.test.ts`](./tests/directives.test.ts) —
  `parseTag` / `parseTags` 完整覆蓋,包含邊界情境
  (缺冒號、無效 `pos` 值、`chara: pose=...` 沒有 id 等)。
- [`tests/applyChara.test.ts`](./tests/applyChara.test.ts) —
  角色 reducer(進場、更新-保留欄位、退場)。

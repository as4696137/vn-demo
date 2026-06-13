# 劇本工作流程（Excel ↔ Ink）

企劃用 **Excel** 寫劇情，工程端用一個指令轉成引擎吃的 `.ink`。
企劃不需要學 Ink 語法。

```
content/story.xlsx  ──npm run story:build──▶  src/story/new-main.ink  ──▶  引擎
   (企劃編輯)                                    (自動產生，勿手改)
```

## 指令

| 指令 | 作用 |
| --- | --- |
| `npm run story:build [in.xlsx] [out.ink]` | **Excel → .ink**。預設 `content/story.xlsx → src/story/new-main.ink`。 |
| `npm run story:template [in.ink] [out.xlsx]` | **.ink → Excel**。把現有腳本反向產生成 Excel（已用它產出 `story-template.xlsx` 範例）。 |
| `npm run story:verify [in.ink]` | 驗證來回轉換無損、可編譯、三結局可達。 |

建議流程：企劃改 `content/story.xlsx` → `npm run story:build` → `npm test`（story 測試會擋下沒註冊的素材 ID）。

## Excel 欄位（「劇本」分頁，一列 = 一個劇情節拍）

| 欄 | 對應 Ink | 說明 |
| --- | --- | --- |
| 段落 ID (knot) | `=== knot ===` | 只填在每段第一列；限英數+底線，**不能有空格或減號** |
| 背景 (bg) | `# bg:` | 素材 ID，留白沿用前一個 |
| 音樂 (bgm) | `# bgm:` | ID 或 `none`/`stop` |
| 音效 (se) | `# se:` | |
| 角色立繪 (chara) | `# chara:` / `# clear` | `xiaowen pose=gentle pos=right`；退場 `xiaowen exit`；清空 `clear` |
| 小遊戲 (minigame) | `# minigame:` | 把下一個選項點換成小遊戲 UI |
| 說話者 (speaker) | `# speaker:` | 留白 = 旁白 |
| 內容 (text) | 行文字 | 可用 `{變數名}` 插值，如 `{user_name}` |
| 選項 (choice) | `* [...]` | 要分歧時，連續數列各填一個選項 |
| 前往段落 (goto) | `-> target` | 跳段；`END` = 結束 |
| 設定變數 (set) | `~ ...` | 如 `ending_id = "A"` |

`變數` 分頁宣告變數與初始值；`設定` 分頁的 `start` 指定起始段落。

> 所有素材 ID（bg / chara / se / minigame）必須先在 `src/engine/assets.ts` 與
> `src/components/minigames/index.tsx` 註冊，否則 `npm test` 會 fail。

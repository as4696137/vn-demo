/**
 * Excel <-> IR bridge (uses exceljs).
 *
 * Workbook layout:
 *   - "劇本"  (story)     : one beat per row, columns from COLUMNS
 *   - "變數"  (variables) : VAR declarations  (name / initial / note)
 *   - "設定"  (config)    : key / value, currently just `start`
 *   - "說明"  (readme)    : human-readable usage notes
 */
import ExcelJS from 'exceljs'
import { COLUMNS } from './story-ir.mjs'

const STORY_SHEET = '劇本'
const VAR_SHEET = '變數'
const CONFIG_SHEET = '設定'
const README_SHEET = '說明'

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }
const HEADER_FONT = { color: { argb: 'FFFFFFFF' }, bold: true, name: 'Arial' }
const KNOT_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }
const CHOICE_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } }

const cellText = (v) => {
  if (v == null) return ''
  if (typeof v === 'object' && 'text' in v) return String(v.text).trim() // rich text
  if (typeof v === 'object' && 'result' in v) return String(v.result).trim()
  return String(v).trim()
}

// ---------------------------------------------------------------------------
//  IR -> .xlsx
// ---------------------------------------------------------------------------

export async function writeXlsx(ir, path) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'vn-demo story pipeline'

  // README
  const readme = wb.addWorksheet(README_SHEET)
  readme.columns = [{ width: 110 }]
  const notes = [
    ['燃燒殆盡之前 — 劇本工作表'],
    [''],
    ['這份 Excel 是劇情的「真實來源」。編輯完後，工程端跑：'],
    ['    npm run story:build       # 把這份 Excel 轉成 src/story/new-main.ink'],
    [''],
    ['【劇本 分頁】一列 = 一個劇情節拍 (beat)。由上往下依序播放。'],
    ['  • 段落 ID (knot)：一段劇情的起點代號，只填在該段第一列。'],
    ['                    限英文 / 數字 / 底線，不能有空格或減號 (-)。'],
    ['  • 背景 / 音樂 / 音效 / 角色立繪 / 小遊戲：填素材 ID，留白表示沿用前一個。'],
    ['  • 角色立繪 (chara)：寫「角色 pose=表情 pos=位置」，例如 xiaowen pose=gentle pos=right；'],
    ['                      角色退場寫「角色 exit」；清掉全部立繪寫 clear。'],
    ['  • 說話者 (speaker)：留白 = 旁白。'],
    ['  • 內容 (text)：對白或旁白文字。可用 {變數名} 插入變數，例如 {user_name}。'],
    ['  • 選項 (choice)：要分歧時，連續幾列各填一個選項。每個選項在「前往段落」填要跳到的段落 ID。'],
    ['  • 前往段落 (goto)：跳到某個段落 ID；填 END 表示結束遊戲。'],
    ['  • 設定變數 (set)：改變數值，例如 ending_id = "A"。'],
    [''],
    ['【變數 分頁】宣告會用到的變數與初始值。'],
    ['【設定 分頁】start = 遊戲從哪個段落開始。'],
    [''],
    ['素材 ID 必須在 src/engine/assets.ts 註冊過，否則 npm test 會擋下。'],
  ]
  notes.forEach((r) => readme.addRow(r))
  readme.getRow(1).font = { bold: true, size: 14, name: 'Arial' }

  // Story sheet
  const ws = wb.addWorksheet(STORY_SHEET, { views: [{ state: 'frozen', ySplit: 1 }] })
  ws.columns = COLUMNS.map((c) => ({
    header: c.header,
    key: c.key,
    width: c.key === 'text' || c.key === 'choice' ? 48 : c.key === 'chara' ? 26 : 16,
  }))
  const headerRow = ws.getRow(1)
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = { vertical: 'middle' }
  })

  for (const knot of ir.knots) {
    const rows = knot.rows.length ? knot.rows : [{}]
    rows.forEach((row, idx) => {
      const data = { ...row }
      if (idx === 0) data.knot = knot.name
      const added = ws.addRow(data)
      added.alignment = { vertical: 'top', wrapText: true }
      if (idx === 0) added.getCell('knot').fill = KNOT_FILL
      if (row.choice != null) added.getCell('choice').fill = CHOICE_FILL
    })
  }

  // Variables sheet
  const vs = wb.addWorksheet(VAR_SHEET)
  vs.columns = [
    { header: '變數名 (name)', key: 'name', width: 22 },
    { header: '初始值 (initial)', key: 'initial', width: 22 },
    { header: '備註 (note)', key: 'note', width: 50 },
  ]
  vs.getRow(1).eachCell((c) => {
    c.fill = HEADER_FILL
    c.font = HEADER_FONT
  })
  for (const v of ir.variables) vs.addRow({ name: v.name, initial: v.initial, note: v.note || '' })

  // Config sheet
  const cs = wb.addWorksheet(CONFIG_SHEET)
  cs.columns = [
    { header: '設定項 (key)', key: 'key', width: 22 },
    { header: '值 (value)', key: 'value', width: 30 },
  ]
  cs.getRow(1).eachCell((c) => {
    c.fill = HEADER_FILL
    c.font = HEADER_FONT
  })
  cs.addRow({ key: 'start', value: ir.config.start || '' })

  await wb.xlsx.writeFile(path)
}

// ---------------------------------------------------------------------------
//  .xlsx -> IR
// ---------------------------------------------------------------------------

/** Map the actual header cells to IR keys via the `(key)` hint in each header. */
function buildColumnMap(ws) {
  const map = {} // columnNumber -> key
  const headerRow = ws.getRow(1)
  headerRow.eachCell((cell, col) => {
    const text = cellText(cell.value)
    const hint = text.match(/\(([a-zA-Z]+)\)/)
    const key = hint ? hint[1] : text.toLowerCase()
    if (COLUMNS.some((c) => c.key === key)) map[col] = key
  })
  return map
}

export async function readXlsx(path) {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(path)

  const ir = { config: { start: null }, variables: [], knots: [] }

  const ws = wb.getWorksheet(STORY_SHEET)
  if (!ws) throw new Error(`找不到「${STORY_SHEET}」分頁`)
  const colMap = buildColumnMap(ws)

  let knot = null
  ws.eachRow((excelRow, rowNumber) => {
    if (rowNumber === 1) return
    const row = {}
    for (const [col, key] of Object.entries(colMap)) {
      const val = cellText(excelRow.getCell(Number(col)).value)
      if (val !== '') row[key] = val
    }
    const { knot: knotName, ...beat } = row
    if (knotName) {
      knot = { name: knotName, rows: [] }
      ir.knots.push(knot)
    }
    const hasContent = Object.keys(beat).length > 0
    if (hasContent) {
      if (!knot) throw new Error(`第 ${rowNumber} 列有內容但還沒有任何段落 ID (knot)`)
      knot.rows.push(beat)
    }
  })

  const vs = wb.getWorksheet(VAR_SHEET)
  if (vs) {
    vs.eachRow((r, n) => {
      if (n === 1) return
      const name = cellText(r.getCell(1).value)
      const initial = cellText(r.getCell(2).value)
      if (name) ir.variables.push({ name, initial: initial || '""' })
    })
  }

  const cs = wb.getWorksheet(CONFIG_SHEET)
  if (cs) {
    cs.eachRow((r, n) => {
      if (n === 1) return
      const key = cellText(r.getCell(1).value)
      const value = cellText(r.getCell(2).value)
      if (key === 'start') ir.config.start = value
    })
  }
  if (!ir.config.start && ir.knots.length) ir.config.start = ir.knots[0].name

  return ir
}

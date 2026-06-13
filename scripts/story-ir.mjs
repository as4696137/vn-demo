/**
 * Shared intermediate representation (IR) for the story pipeline.
 *
 * Both directions of the converter go through this IR, so an Excel file and a
 * `.ink` file are guaranteed to describe the same structure:
 *
 *     .ink  --parseInk-->  IR  --writeXlsx-->  .xlsx   (ink-to-xlsx)
 *     .xlsx --readXlsx-->  IR  --emitInk---->  .ink    (xlsx-to-ink)
 *
 * IR shape:
 *   {
 *     config:    { start: 'start' },
 *     variables: [ { name, initial } ],
 *     knots:     [ { name, rows: [ Row ] } ],
 *   }
 *
 * Row is a flat object with any of these optional string fields:
 *   bg, bgm, se, chara, minigame, speaker, text, choice, goto, set
 *
 * A run of consecutive rows that have `choice` set forms one Ink choice block.
 * A row without `choice` is a normal beat (directives + optional text + optional
 * `~ set` + optional `-> goto`).
 */

// Canonical columns, in display order. `key` is used in code; `header` is what
// a planner sees in Excel. The xlsx reader matches headers by the `(key)` hint
// so columns can be reordered or relabelled as long as the hint survives.
export const COLUMNS = [
  { key: 'knot', header: '段落 ID (knot)' },
  { key: 'bg', header: '背景 (bg)' },
  { key: 'bgm', header: '音樂 (bgm)' },
  { key: 'se', header: '音效 (se)' },
  { key: 'chara', header: '角色立繪 (chara)' },
  { key: 'minigame', header: '小遊戲 (minigame)' },
  { key: 'speaker', header: '說話者 (speaker)' },
  { key: 'text', header: '內容 / 對白 (text)' },
  { key: 'choice', header: '選項 (choice)' },
  { key: 'goto', header: '前往段落 (goto)' },
  { key: 'set', header: '設定變數 (set)' },
]

const DIRECTIVE_KEYS = ['bg', 'bgm', 'se', 'chara', 'minigame', 'speaker']

const HEADER_COMMENT = `// ============================================================
//  此檔案由 scripts/xlsx-to-ink.mjs 從 Excel 自動產生，請勿手改。
//  劇情內容請編輯對應的 .xlsx，再重新產生。
//  tag 規範：
//    # bg: id          切換背景
//    # bgm: id / none  播 / 停 BGM
//    # se: id          音效
//    # speaker: 名字   說話者（無則旁白）
//    # chara: id pose=X pos=left|center|right [exit]
//    # clear           清除所有立繪
//    # minigame: id    把下一個選項點標記為小遊戲
// ============================================================`

// ---------------------------------------------------------------------------
//  .ink  ->  IR
// ---------------------------------------------------------------------------

/** Parse a tag body like `chara: awei pose=grin pos=left` into [key, value]. */
function splitTag(tagBody) {
  const trimmed = tagBody.trim()
  if (trimmed === 'clear') return ['chara', 'clear']
  const colon = trimmed.indexOf(':')
  if (colon === -1) return [null, null]
  return [trimmed.slice(0, colon).trim(), trimmed.slice(colon + 1).trim()]
}

/** Apply a tag to a row/pending object in place. */
function applyTag(target, key, value) {
  if (key === 'speaker') target.speaker = value
  else if (key === 'bg') target.bg = value
  else if (key === 'bgm') target.bgm = value
  else if (key === 'se') target.se = value
  else if (key === 'minigame') target.minigame = value
  else if (key === 'chara') target.chara = value
}

export function parseInk(text) {
  const lines = text.split(/\r?\n/)
  const ir = { config: { start: null }, variables: [], knots: [] }

  let knot = null // current knot object
  let pending = {} // directives seen on their own lines, awaiting a beat
  let pendingSet = null // a `~ set` awaiting its divert
  let inChoices = false

  const hasPending = () => DIRECTIVE_KEYS.some((k) => pending[k] != null)

  const pushRow = (row) => {
    if (!knot) {
      // Stray content before the first knot — start an implicit one.
      knot = { name: '_prelude', rows: [] }
      ir.knots.push(knot)
    }
    knot.rows.push(row)
  }

  // Flush accumulated standalone directives as their own beat (rare: only when
  // a directive group isn't immediately followed by text).
  const flushPending = () => {
    if (hasPending()) {
      pushRow({ ...pending })
      pending = {}
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('//')) continue

    // VAR declaration
    const varMatch = line.match(/^VAR\s+(\w+)\s*=\s*(.*)$/)
    if (varMatch) {
      ir.variables.push({ name: varMatch[1], initial: varMatch[2].trim() })
      continue
    }

    // Knot header
    const knotMatch = line.match(/^={2,}\s*(\w+)\s*={2,}$/)
    if (knotMatch) {
      flushPending()
      knot = { name: knotMatch[1], rows: [] }
      ir.knots.push(knot)
      inChoices = false
      continue
    }

    // Choice
    if (line.startsWith('*') || line.startsWith('+')) {
      flushPending()
      const body = line.replace(/^[*+]\s*/, '')
      const bracket = body.match(/^\[([^\]]*)\]\s*(.*)$/)
      const choiceText = bracket ? bracket[1] : body
      const row = { ...pending, choice: choiceText }
      pending = {}
      // Inline divert after the bracket, e.g. `* [go] -> there`
      const tail = bracket ? bracket[2] : ''
      const inlineDivert = tail.match(/->\s*(\S+)/)
      if (inlineDivert) row.goto = inlineDivert[1]
      pushRow(row)
      inChoices = true
      continue
    }

    // Divert
    if (line.startsWith('->')) {
      const target = line.slice(2).trim()
      if (!knot) {
        ir.config.start = target // top-level `-> start`
        continue
      }
      if (inChoices) {
        // Belongs to the most recent choice row.
        const last = knot.rows[knot.rows.length - 1]
        if (last && last.choice != null && last.goto == null) last.goto = target
        else pushRow({ goto: target })
      } else {
        const row = { ...pending, goto: target }
        pending = {}
        if (pendingSet != null) {
          row.set = pendingSet
          pendingSet = null
        }
        pushRow(row)
      }
      continue
    }

    // Variable assignment `~ ending_id = "A"`
    if (line.startsWith('~')) {
      const body = line.slice(1).trim()
      if (inChoices) {
        const last = knot.rows[knot.rows.length - 1]
        if (last && last.choice != null) last.set = body
        else pushRow({ set: body })
      } else {
        // Hold it; it usually precedes a divert and reads better combined.
        pendingSet = body
      }
      continue
    }

    // Otherwise: a content line, possibly with trailing tags.
    // Split on '#': first segment is text, the rest are tags.
    const hashParts = raw.split('#')
    const content = hashParts[0].trim()
    const tags = hashParts.slice(1).map((t) => t.trim()).filter(Boolean)

    if (content === '' && tags.length > 0) {
      // Standalone directive line(s) -> accumulate into pending.
      for (const tag of tags) {
        const [k, v] = splitTag(tag)
        if (k) {
          if (pending[k] != null) flushPending() // avoid clobbering
          applyTag(pending, k, v)
        }
      }
      inChoices = false
      continue
    }

    if (content !== '') {
      // A text beat. Merge pending directives + this line's trailing tags.
      const row = { ...pending, text: content }
      pending = {}
      for (const tag of tags) {
        const [k, v] = splitTag(tag)
        if (k) applyTag(row, k, v)
      }
      if (pendingSet != null) {
        row.set = pendingSet
        pendingSet = null
      }
      pushRow(row)
      inChoices = false
    }
  }

  flushPending()
  if (!ir.config.start && ir.knots.length) ir.config.start = ir.knots[0].name
  return ir
}

// ---------------------------------------------------------------------------
//  IR  ->  .ink
// ---------------------------------------------------------------------------

function emitDirectiveLines(row) {
  const out = []
  if (row.bg) out.push(`# bg: ${row.bg}`)
  if (row.bgm) out.push(`# bgm: ${row.bgm}`)
  if (row.chara) out.push(row.chara === 'clear' ? `# clear` : `# chara: ${row.chara}`)
  if (row.se) out.push(`# se: ${row.se}`)
  if (row.minigame) out.push(`# minigame: ${row.minigame}`)
  if (row.speaker) out.push(`# speaker: ${row.speaker}`)
  return out
}

export function emitInk(ir) {
  const out = [HEADER_COMMENT, '']
  for (const v of ir.variables) out.push(`VAR ${v.name} = ${v.initial}`)
  if (ir.variables.length) out.push('')
  out.push(`-> ${ir.config.start || (ir.knots[0] && ir.knots[0].name) || 'END'}`)

  for (const knot of ir.knots) {
    out.push('', `=== ${knot.name} ===`)
    const rows = knot.rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (row.choice != null) {
        // Emit a contiguous run of choices as one block.
        while (i < rows.length && rows[i].choice != null) {
          const c = rows[i]
          out.push(`* [${c.choice}]`)
          if (c.se) out.push(`    # se: ${c.se}`)
          if (c.set) out.push(`    ~ ${c.set}`)
          if (c.goto) out.push(`    -> ${c.goto}`)
          i++
        }
        i-- // for-loop will ++ again
        continue
      }
      for (const d of emitDirectiveLines(row)) out.push(d)
      if (row.text) out.push(row.text)
      if (row.set) out.push(`~ ${row.set}`)
      if (row.goto) out.push(`-> ${row.goto}`)
    }
  }
  out.push('')
  return out.join('\n')
}

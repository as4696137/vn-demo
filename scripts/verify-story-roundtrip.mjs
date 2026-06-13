/**
 * Round-trip verification for the story pipeline. Proves that converting the
 * current .ink through the Excel layer and back produces a story that is:
 *   (a) byte-stable  (ink -> ink is idempotent),
 *   (b) preserved through the .xlsx read/write layer,
 *   (c) still compiles and reaches the same directives + all three endings.
 *
 *   node scripts/verify-story-roundtrip.mjs [input.ink]
 */
import { readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Story } from 'inkjs'
import { Compiler } from 'inkjs/full'
import { parseInk, emitInk } from './story-ir.mjs'
import { writeXlsx, readXlsx } from './story-xlsx.mjs'

const input = process.argv[2] || 'src/story/new-main.ink'

function compile(src) {
  return new Compiler(src).Compile().ToJson()
}

// Same DFS-over-all-choices walk the unit test uses, returning a tally.
function walkAllPaths(json) {
  const t = {
    bgs: new Set(), charas: new Set(), bgms: new Set(),
    ses: new Set(), minigames: new Set(), endings: new Set(), steps: 0,
  }
  const collect = (tags) => {
    for (const raw of tags || []) {
      const tag = raw.trim()
      const colon = tag.indexOf(':')
      if (tag === 'clear') continue
      if (colon === -1) continue
      const key = tag.slice(0, colon).trim()
      const val = tag.slice(colon + 1).trim()
      if (key === 'bg') t.bgs.add(val)
      else if (key === 'bgm') { if (val && val !== 'none' && val !== 'stop') t.bgms.add(val) }
      else if (key === 'se') t.ses.add(val)
      else if (key === 'minigame') t.minigames.add(val)
      else if (key === 'chara') {
        const parts = val.split(/\s+/)
        if (parts.includes('exit')) continue
        const id = parts[0]
        const pose = (parts.find((p) => p.startsWith('pose=')) || 'pose=neutral').slice(5)
        t.charas.add(`${id}::${pose}`)
      }
    }
  }
  const walk = (stateJson, choiceIndex) => {
    const story = new Story(json)
    if (stateJson) story.state.LoadJson(stateJson)
    if (choiceIndex !== null) story.ChooseChoiceIndex(choiceIndex)
    while (story.canContinue) {
      story.Continue()
      if (++t.steps > 50000) throw new Error('runaway walk — possible cycle')
      collect(story.currentTags)
    }
    if (story.currentChoices.length === 0) {
      t.endings.add(String(story.variablesState.ending_id ?? ''))
      return
    }
    const saved = story.state.toJson()
    for (let i = 0; i < story.currentChoices.length; i++) walk(saved, i)
  }
  walk(null, null)
  return t
}

const tallyToObj = (t) => ({
  bgs: [...t.bgs].sort(), charas: [...t.charas].sort(), bgms: [...t.bgms].sort(),
  ses: [...t.ses].sort(), minigames: [...t.minigames].sort(), endings: [...t.endings].sort(),
})

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)

let failures = 0
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? '  ' + detail : ''}`)
  if (!ok) failures++
}

const original = await readFile(input, 'utf-8')

// (a) ink -> IR -> ink is stable
const ir1 = parseInk(original)
const ink2 = emitInk(ir1)
const ink3 = emitInk(parseInk(ink2))
check('ink→ink 轉換穩定 (idempotent)', ink2 === ink3)

// (b) xlsx layer preserves everything
const tmpXlsx = join(tmpdir(), `vn-roundtrip-${Date.now()}.xlsx`)
await writeXlsx(ir1, tmpXlsx)
const irFromXlsx = await readXlsx(tmpXlsx)
const inkFromXlsx = emitInk(irFromXlsx)
check('Excel 讀寫無損 (.xlsx 來回一致)', inkFromXlsx === ink2)

// (c) generated ink compiles and is semantically equivalent
let genTally, origTally
try {
  origTally = tallyToObj(walkAllPaths(compile(original)))
  genTally = tallyToObj(walkAllPaths(compile(ink2)))
  check('產生的 .ink 可編譯且無暴走迴圈', true)
} catch (e) {
  check('產生的 .ink 可編譯且無暴走迴圈', false, e.message)
}
if (genTally && origTally) {
  check('三個結局皆可達 (A,B,C)', eq(genTally.endings, ['A', 'B', 'C']), JSON.stringify(genTally.endings))
  check('背景 (bg) 集合一致', eq(genTally.bgs, origTally.bgs))
  check('角色立繪 (chara) 集合一致', eq(genTally.charas, origTally.charas))
  check('音樂 (bgm) 集合一致', eq(genTally.bgms, origTally.bgms))
  check('音效 (se) 集合一致', eq(genTally.ses, origTally.ses))
  check('小遊戲 (minigame) 集合一致', eq(genTally.minigames, origTally.minigames))
}

console.log(failures === 0 ? '\n全部通過 ✅' : `\n${failures} 項失敗 ❌`)
process.exit(failures === 0 ? 0 : 1)

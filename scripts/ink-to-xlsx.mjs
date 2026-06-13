/**
 * Generate an Excel workbook from a `.ink` script.
 *
 *   node scripts/ink-to-xlsx.mjs [input.ink] [output.xlsx]
 *
 * Defaults: src/story/new-main.ink -> content/story-template.xlsx
 * Used to bootstrap the Excel template from the existing hand-written story.
 */
import { readFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { parseInk } from './story-ir.mjs'
import { writeXlsx } from './story-xlsx.mjs'

const input = process.argv[2] || 'src/story/new-main.ink'
const output = process.argv[3] || 'content/story-template.xlsx'

const ink = await readFile(input, 'utf-8')
const ir = parseInk(ink)
await mkdir(dirname(output), { recursive: true })
await writeXlsx(ir, output)

const beats = ir.knots.reduce((n, k) => n + k.rows.length, 0)
console.log(`✓ ${input} → ${output}`)
console.log(`  ${ir.knots.length} 段落、${beats} 個節拍、${ir.variables.length} 個變數`)

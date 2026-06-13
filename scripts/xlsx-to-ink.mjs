/**
 * Convert an Excel workbook into a `.ink` script.
 *
 *   node scripts/xlsx-to-ink.mjs [input.xlsx] [output.ink]
 *
 * Defaults: content/story.xlsx -> src/story/new-main.ink
 * This is the build step planners' Excel goes through. The generated `.ink` is
 * an artifact — never edit it by hand.
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { emitInk } from './story-ir.mjs'
import { readXlsx } from './story-xlsx.mjs'

const input = process.argv[2] || 'content/story.xlsx'
const output = process.argv[3] || 'src/story/new-main.ink'

const ir = await readXlsx(input)
const ink = emitInk(ir)
await mkdir(dirname(output), { recursive: true })
await writeFile(output, ink, 'utf-8')

const beats = ir.knots.reduce((n, k) => n + k.rows.length, 0)
console.log(`✓ ${input} → ${output}`)
console.log(`  ${ir.knots.length} 段落、${beats} 個節拍、${ir.variables.length} 個變數`)

import { readdir, stat } from 'node:fs/promises'
import { join, parse } from 'node:path'
import sharp from 'sharp'

const ROOTS = ['public/assets/bg', 'public/assets/chara']
const SKIP_NAMES = new Set(['logo.png'])
const SKIP_SUFFIX = '_source.png'
const QUALITY = 85

async function listPngs(dir) {
  const out = []
  for (const name of await readdir(dir)) {
    if (!name.endsWith('.png')) continue
    if (SKIP_NAMES.has(name)) continue
    if (name.endsWith(SKIP_SUFFIX)) continue
    out.push(join(dir, name))
  }
  return out
}

function fmt(bytes) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)}MB`
  return `${(bytes / 1024).toFixed(1)}KB`
}

let totalIn = 0
let totalOut = 0

for (const root of ROOTS) {
  const files = await listPngs(root)
  console.log(`\n[${root}] ${files.length} files`)
  for (const src of files) {
    const { dir, name } = parse(src)
    const dst = join(dir, `${name}.webp`)
    const before = (await stat(src)).size
    await sharp(src).webp({ quality: QUALITY }).toFile(dst)
    const after = (await stat(dst)).size
    totalIn += before
    totalOut += after
    const pct = ((1 - after / before) * 100).toFixed(0)
    console.log(`  ${name}.png  ${fmt(before)} → ${fmt(after)}  (-${pct}%)`)
  }
}

console.log(`\nTOTAL: ${fmt(totalIn)} → ${fmt(totalOut)}  (-${((1 - totalOut / totalIn) * 100).toFixed(0)}%)`)

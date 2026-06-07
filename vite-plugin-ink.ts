import { readFile } from 'node:fs/promises'
import type { Plugin } from 'vite'

/**
 * Compile `.ink` files at build/dev time using the inkjs Compiler, so the
 * runtime bundle only needs the `inkjs` Story runtime (no Compiler).
 *
 * Usage:
 *   import storyJson from '@/story/new-main.ink'
 *   new Story(storyJson)
 */
export function inkPlugin(): Plugin {
  return {
    name: 'vite-plugin-ink',
    enforce: 'pre',
    async load(id) {
      if (!id.endsWith('.ink')) return null
      const src = await readFile(id, 'utf-8')
      const { Compiler } = await import('inkjs/full')
      const story = new Compiler(src).Compile()
      const json = story.ToJson()
      return `export default ${json}`
    },
    handleHotUpdate({ file, server }) {
      if (!file.endsWith('.ink')) return
      server.moduleGraph.invalidateAll()
      server.ws.send({ type: 'full-reload' })
    },
  }
}

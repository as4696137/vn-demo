declare module '*.ink' {
  // Compiled Ink story JSON, produced at build time by vite-plugin-ink.
  // Pass directly to `new Story(json)` from 'inkjs'.
  const json: unknown
  export default json
}

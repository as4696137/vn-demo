# 燃燒殆盡之前 / Before Burning Out

A short visual novel about workplace burnout, with three endings and interactive
mini-games embedded in the choice flow.

[繁體中文 README](./README.zh-TW.md)

<!-- TODO: add a screenshot or short GIF of the letter mini-game here -->

---

## About

The story follows a designer at the edge of burnout. Across five acts the
player makes choices that lead to one of three endings — _Stay quiet_,
_Leave_, or _Speak up_. At a few key beats, the choice UI is replaced by an
**interactive mini-game**: when the protagonist finds an old note from her
first day at work, the player physically drags or taps a paper on screen
instead of clicking a button.

The project is structured to keep the **narrative content** and the **engine**
sharply separated. A writer can add a scene, swap a character pose, or trigger
a sound effect by editing the `.ink` script — no React, no TypeScript. An
engineer can rebuild the entire UI without touching a line of the story.

## Tech stack

| Layer     | Choice                                          | Role                              |
| --------- | ----------------------------------------------- | --------------------------------- |
| Narrative | [inkjs](https://github.com/y-lohse/inkjs)       | Story runtime + branching         |
| UI        | React 19 + TypeScript                           | View layer                        |
| Animation | [Framer Motion](https://www.framer.com/motion/) | Crossfades, drag gestures         |
| State     | [Zustand](https://github.com/pmndrs/zustand)    | Single store bridging engine ↔ UI |
| Styling   | Tailwind CSS v4                                 | Utility-first CSS                 |
| Audio     | [Howler.js](https://howlerjs.com/)              | BGM with fade + one-shot SE       |
| Build     | Vite + custom Ink plugin                        | Dev server, build                 |
| Testing   | Vitest                                          | Story validation + unit tests     |

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm test         # all tests, ~300ms
```

The build output is a fully static SPA — any static host (Vercel, Netlify,
Cloudflare Pages, GitHub Pages) works. Total deploy size is ~5.6 MB.

## Architecture

Four layers, each with one job:

```
┌──────────────────────────────────────────────────────────────────┐
│  Content     src/story/new-main.ink                              │
│              .ink script — knots, choices, directives in tags    │
├──────────────────────────────────────────────────────────────────┤
│  Engine      src/engine/                                         │
│              InkRunner, parseTag, applyChara, audio, assets      │
│              Pure logic. No React imports.                       │
├──────────────────────────────────────────────────────────────────┤
│  State       src/store/gameStore.ts                              │
│              Zustand store. The only seam between engine and UI. │
├──────────────────────────────────────────────────────────────────┤
│  UI          src/components/                                     │
│              Stage, DialogueBox, ChoiceList, minigames,          │
│              EndingScreen — React + Framer Motion                │
└──────────────────────────────────────────────────────────────────┘
```

### Content — `.ink`

All story content lives in `src/story/new-main.ink`. The script uses standard
[Ink syntax](https://github.com/inkle/ink) for branching, and embeds engine
directives as **tags on lines**:

```ink
# bg: office_morning
# bgm: office_hum
# chara: xiaowen pose=gentle pos=right

「早安。」 # speaker: 小雯
```

Supported tags:

| Tag                                | Effect                                     |
| ---------------------------------- | ------------------------------------------ |
| `# speaker: Name`                  | Sets the speaker for the next line         |
| `# bg: id`                         | Switches background (crossfade)            |
| `# chara: id pose=X pos=Y [exit]`  | Adds / updates / removes a character       |
| `# clear`                          | Removes all characters                     |
| `# bgm: id` _(or `none` / `stop`)_ | Switches background music with fade        |
| `# se: id`                         | Plays a one-shot sound effect              |
| `# minigame: id`                   | Marks the next choice point as a mini-game |

Tag parsing lives in `src/engine/directives.ts` and is exhaustively unit-tested.

### Engine

Pure modules, no React. Each does one thing:

- **`InkRunner.ts`** — wraps the inkjs `Story`. Steps the script forward and
  returns a `StepResult` union (`line` / `choices` / `end`) with directives
  already parsed into typed objects.
- **`directives.ts`** — parses `# tag` strings into a `Directive` union.
- **`applyChara.ts`** — pure reducer that applies one `chara` directive to the
  character list (enter / update with prop carryover / exit).
- **`audio.ts`** — Howler bridge. Silently ignores unregistered IDs, so the
  story script can reference assets that don't exist yet (graceful placeholder
  mode during development).
- **`assets.ts`** — ID → file path registries plus a `prefetchAssets()`
  helper used by the UI to warm the HTTP cache.
- **`useTypewriter.ts`** — character-by-character text reveal hook.

### State

`src/store/gameStore.ts` is a single Zustand store and the **only** place
where the engine and UI meet.

- **`advance()`** steps the InkRunner forward. Lines that contain only
  directives (no visible text) are batched into the same React render, so the
  player never sees an empty dialogue beat.
- **`choose(index)`** selects a choice and re-enters the advance loop.
- End-of-story flow: when Ink reaches `-> END`, the store reads the
  `ending_id` variable (`"A"`, `"B"`, or `"C"`), transitions through a
  `'fading'` scene state (an animated black overlay), then to `'end'`.

### UI

React components, completely unaware of inkjs.

- **`Stage.tsx`** composes `Background`, `CharaLayer`, `DialogueBox`,
  `ChoiceList`, and `MinigameLayer`.
- **`DialogueBox.tsx`** branches on `speaker`: with a speaker it renders the
  bottom dialogue panel; without one (narration) it renders a full-screen
  centered subtitle.
- **`minigames/`** — `MinigameLayer` dispatches on `minigame.id` via
  `MINIGAME_REGISTRY`. Unknown IDs gracefully fall back to a normal
  `ChoiceList`, so the script never deadlocks the player on a typo.

The interesting design here is that **mini-games reuse the choice system**.
A `# minigame: letter` directive on a choice point doesn't change Ink's
branching — it just swaps the button UI for a draggable paper. The drag
gesture eventually calls `store.choose(index)` with the same index a button
click would have. From Ink's perspective, mini-games don't exist.

## Extending

### Add a scene

Edit `src/story/new-main.ink`:

```ink
=== new_scene ===
# bg: office_day
# chara: jason pose=neutral pos=left

「我們需要談談。」 # speaker: Jason

-> next_scene
```

If `office_day` or `jason.neutral` isn't registered, the **story test will
fail before the build does** — see [Testing](#testing).

### Add a character pose

1. Drop the image into `public/assets/chara/`.
2. Add the entry to `CHARA_REGISTRY` in `src/engine/assets.ts`:

   ```ts
   xiaowen: {
     // ...
     laughing: '/assets/chara/xiaowen_laughing.webp',
   },
   ```

3. Reference it from the script: `# chara: xiaowen pose=laughing`.

### Add a mini-game

A mini-game is a React component that satisfies the `MinigameProps` contract:
it receives the choice options and calls `onChoose(index)` when the player
commits.

1. Create the component:

   ```tsx
   // src/components/minigames/CoffeeMinigame.tsx
   import type { MinigameProps } from "./types";

   /**
    * Choice mapping (must match the .ink choice order):
    *   index 0 → drink it
    *   index 1 → pour it out
    */
   export function CoffeeMinigame({ onChoose }: MinigameProps) {
     return (
       <div className="absolute inset-0 ...">
         <button onClick={() => onChoose(0)}>Drink it</button>
         <button onClick={() => onChoose(1)}>Pour it out</button>
       </div>
     );
   }
   ```

2. Register it in `src/components/minigames/index.tsx`:

   ```ts
   export const MINIGAME_REGISTRY: Record<string, MinigameComponent> = {
     letter: LetterMinigame,
     coffee: CoffeeMinigame,
   };
   ```

3. Tag the choice point in `.ink`:

   ```ink
   你看著桌上那杯冷掉的咖啡。 # minigame: coffee

   * [喝下去]    -> ...
   * [倒掉]      -> ...
   ```

The order of `* [...]` in the script must match the `onChoose(index)` calls
in the component — document the mapping in a comment at the top of the
component file so future-you can verify it at a glance.

## Asset & performance pipeline

The project went through aggressive size optimization. Some notable choices:

- **Ink is precompiled at build time.** A custom Vite plugin
  ([`vite-plugin-ink.ts`](./vite-plugin-ink.ts)) compiles `.ink` files to JSON
  during build. The runtime bundle ships only the inkjs Story class, not the
  Compiler — saving ~116 KB raw / ~30 KB gzip.
- **All raster assets are WebP.** A one-off script
  ([`scripts/compress-images.mjs`](./scripts/compress-images.mjs)) converted
  PNG art to WebP — total assets dropped from ~82 MB to **5.6 MB** with no
  visible quality loss.
- **Idle prefetch.** 300 ms after the first scene paints, `prefetchAssets()`
  warms the HTTP cache with every BG and character pose. Subsequent scene
  transitions are essentially instant.
- **Lazy-loaded UI.** `EndingScreen` and `MinigameLayer` are `React.lazy()` —
  they don't enter the initial bundle.

## Testing

```bash
npm test           # one-shot
npm run test:watch # watch mode (re-runs when .ink changes)
```

Two tiers:

**Tier 1 — story validation** ([`tests/story.test.ts`](./tests/story.test.ts))

Walks every reachable branch of the Ink script via DFS over state snapshots.
Asserts:

- All three endings are reachable
- Every `# bg:` / `# chara:` / `# se:` / `# minigame:` ID is registered
- The script compiles without syntax errors

This is the single highest-value test: it catches typos, missing
registrations, broken diverts, and unreachable endings at CI time rather than
at runtime.

**Tier 2 — pure unit tests**

- [`tests/directives.test.ts`](./tests/directives.test.ts) — exhaustive
  coverage of `parseTag` / `parseTags` including edge cases (missing colons,
  invalid `pos` values, `chara: pose=...` with no id).
- [`tests/applyChara.test.ts`](./tests/applyChara.test.ts) — character
  reducer (enter, update with prop carryover, exit).

/**
 * Asset registries. Map narrative IDs (used in .ink files) to real file paths.
 * Add entries here as you bring in real artwork or audio.
 *
 * Paths are written *without* a leading slash and prefixed by `A()` at
 * definition time. `A()` resolves to `import.meta.env.BASE_URL`, which is `/`
 * in dev and `/vn-demo/` on the GitHub Pages build. This keeps the same
 * registry working under both the dev server and the sub-path deploy.
 */

const A = (path: string): string => `${import.meta.env.BASE_URL}${path}`

export const BG_REGISTRY: Record<string, string> = {
  metro_night: A("assets/bg/metro_night.webp"),
  office_night: A("assets/bg/office_night.webp"),
  office_morning: A("assets/bg/office_morning.webp"),
  office_day: A("assets/bg/office_morning.webp"),
  office_evening: A("assets/bg/office_evening.webp"),
  office_lobby: A("assets/bg/office_lobby.webp"),
  office_exit: A("assets/bg/office_exit.webp"),
  office_building_day: A("assets/bg/office_building_day.webp"),
  meeting_room: A("assets/bg/meeting_room.webp"),
  bar_night: A("assets/bg/bar_night.webp"),
  cafe_day: A("assets/bg/cafe_day.webp"),
  bedroom_night: A("assets/bg/bedroom_night.webp"),
  bedroom_day: A("assets/bg/bedroom_day.webp"),
  park_morning: A("assets/bg/park_morning.webp"),
};

export const CHARA_REGISTRY: Record<string, Record<string, string>> = {
  xiaowen: {
    neutral: A("assets/chara/xiaowen_neutral.webp"),
    concerned: A("assets/chara/xiaowen_concerned.webp"),
    sad: A("assets/chara/xiaowen_sad.webp"),
    surprised: A("assets/chara/xiaowen_surprised.webp"),
    gentle: A("assets/chara/xiaowen_gentle.webp"),
    listening: A("assets/chara/xiaowen_listening.svg"),
  },
  awei: {
    grin: A("assets/chara/awei_grin.webp"),
    skeptical: A("assets/chara/awei_skeptical.webp"),
    serious: A("assets/chara/awei_serious.webp"),
    relaxed: A("assets/chara/awei_relaxed.webp"),
    listening: A("assets/chara/awei_listening.webp"),
    gentle: A("assets/chara/awei_gentle.webp"),
  },
  jason: {
    neutral: A("assets/chara/jason_neutral.webp"),
    frown: A("assets/chara/jason_frown.webp"),
    dismissive: A("assets/chara/jason_dismissive.webp"),
    listening: A("assets/chara/jason_listening.webp"),
    thinking: A("assets/chara/jason_thinking.webp"),
    serious: A("assets/chara/jason_serious.webp"),
  },
};

// BGM/SE registries are intentionally empty — unregistered IDs are silently
// ignored by `audio.ts`, so the .ink script can already reference them.
// Drop your audio files into public/assets/bgm or se/ and add entries below.
export const BGM_REGISTRY: Record<string, string> = {
  // ambient_train: A('assets/bgm/ambient_train.mp3'),
  // office_hum: A('assets/bgm/office_hum.mp3'),
  // bar_ambient: A('assets/bgm/bar_ambient.mp3'),
  // cafe_ambient: A('assets/bgm/cafe_ambient.mp3'),
  // quiet_room: A('assets/bgm/quiet_room.mp3'),
  // park_ambient: A('assets/bgm/park_ambient.mp3'),
  // soft_resolve: A('assets/bgm/soft_resolve.mp3'),
  // city_ambient: A('assets/bgm/city_ambient.mp3'),
};

export const SE_REGISTRY: Record<string, string> = {
  click: A("assets/se/click.wav"),
  door_close: A("assets/se/door_close.wav"),
  paper_fold: A("assets/se/paper_fold.wav"),
  paper_unfold: A("assets/se/paper_unfold.wav"),
  notification: A("assets/se/notification.wav"),
};

export function getBgSrc(id: string | null): string | null {
  if (!id) return null;
  return BG_REGISTRY[id] ?? null;
}

export function getCharaSrc(id: string, pose: string): string | null {
  return CHARA_REGISTRY[id]?.[pose] ?? null;
}

/**
 * Warm the HTTP cache with every BG (and optionally every chara pose) so that
 * scene switches don't pay a fetch cost. Skips the BG currently on screen.
 * Browsers handle these `new Image()` requests at low priority — calling this
 * after the first scene paints means the immediate need isn't crowded out.
 */
export function prefetchAssets(currentBgId: string | null): void {
  for (const [id, src] of Object.entries(BG_REGISTRY)) {
    if (id === currentBgId) continue;
    const img = new Image();
    img.src = src;
  }
  for (const poses of Object.values(CHARA_REGISTRY)) {
    for (const src of Object.values(poses)) {
      const img = new Image();
      img.src = src;
    }
  }
}

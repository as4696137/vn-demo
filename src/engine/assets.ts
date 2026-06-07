/**
 * Asset registries. Map narrative IDs (used in .ink files) to real file paths.
 * Add entries here as you bring in real artwork or audio.
 */

export const BG_REGISTRY: Record<string, string> = {
  metro_night: "/assets/bg/metro_night.webp",
  office_night: "/assets/bg/office_night.webp",
  office_morning: "/assets/bg/office_morning.webp",
  office_day: "/assets/bg/office_morning.webp",
  office_evening: "/assets/bg/office_evening.webp",
  office_lobby: "/assets/bg/office_lobby.webp",
  office_exit: "/assets/bg/office_exit.webp",
  office_building_day: "/assets/bg/office_building_day.webp",
  meeting_room: "/assets/bg/meeting_room.webp",
  bar_night: "/assets/bg/bar_night.webp",
  cafe_day: "/assets/bg/cafe_day.webp",
  bedroom_night: "/assets/bg/bedroom_night.webp",
  bedroom_day: "/assets/bg/bedroom_day.webp",
  park_morning: "/assets/bg/park_morning.webp",
};

export const CHARA_REGISTRY: Record<string, Record<string, string>> = {
  xiaowen: {
    neutral: "/assets/chara/xiaowen_neutral.webp",
    concerned: "/assets/chara/xiaowen_concerned.webp",
    sad: "/assets/chara/xiaowen_sad.webp",
    surprised: "/assets/chara/xiaowen_surprised.webp",
    gentle: "/assets/chara/xiaowen_gentle.webp",
    listening: "/assets/chara/xiaowen_listening.svg",
  },
  awei: {
    grin: "/assets/chara/awei_grin.webp",
    skeptical: "/assets/chara/awei_skeptical.webp",
    serious: "/assets/chara/awei_serious.webp",
    relaxed: "/assets/chara/awei_relaxed.webp",
    listening: "/assets/chara/awei_listening.webp",
    gentle: "/assets/chara/awei_gentle.webp",
  },
  jason: {
    neutral: "/assets/chara/jason_neutral.webp",
    frown: "/assets/chara/jason_frown.webp",
    dismissive: "/assets/chara/jason_dismissive.webp",
    listening: "/assets/chara/jason_listening.webp",
    thinking: "/assets/chara/jason_thinking.webp",
    serious: "/assets/chara/jason_serious.webp",
  },
};

// BGM/SE registries are intentionally empty — unregistered IDs are silently
// ignored by `audio.ts`, so the .ink script can already reference them.
// Drop your audio files into public/assets/bgm or se/ and add entries below.
export const BGM_REGISTRY: Record<string, string> = {
  // ambient_train: '/assets/bgm/ambient_train.mp3',
  // office_hum: '/assets/bgm/office_hum.mp3',
  // bar_ambient: '/assets/bgm/bar_ambient.mp3',
  // cafe_ambient: '/assets/bgm/cafe_ambient.mp3',
  // quiet_room: '/assets/bgm/quiet_room.mp3',
  // park_ambient: '/assets/bgm/park_ambient.mp3',
  // soft_resolve: '/assets/bgm/soft_resolve.mp3',
  // city_ambient: '/assets/bgm/city_ambient.mp3',
};

export const SE_REGISTRY: Record<string, string> = {
  click: "/assets/se/click.wav",
  door_close: "/assets/se/door_close.wav",
  paper_fold: "/assets/se/paper_fold.wav",
  paper_unfold: "/assets/se/paper_unfold.wav",
  notification: "/assets/se/notification.wav",
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

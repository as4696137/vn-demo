import { beforeAll, describe, expect, it } from "vitest";
import { Story } from "inkjs";
import storyJson from "@/story/new-main.ink";
import { parseTags } from "@/engine/directives";
import { BG_REGISTRY, CHARA_REGISTRY, SE_REGISTRY } from "@/engine/assets";
import { MINIGAME_REGISTRY } from "@/components/minigames";

/**
 * Walks every reachable path through the Ink story (by snapshotting/restoring
 * state at each choice) and tallies every directive ID referenced anywhere
 * plus every ending reached.
 *
 * The tally then drives the assertions below — registry mismatches, missing
 * endings, or untranslated minigame IDs all show up as failed tests rather
 * than runtime breakage during play.
 */

type Tally = {
  bgs: Set<string>;
  charas: Set<string>; // 'id::pose'
  bgms: Set<string>;
  ses: Set<string>;
  minigames: Set<string>;
  endings: Set<string>;
  totalSteps: number;
};

const MAX_STEPS = 20_000;

type InkStoryLike = {
  canContinue: boolean;
  currentTags: string[] | null;
  currentChoices: unknown[];
  variablesState: Record<string, unknown>;
  state: { toJson(): string; LoadJson(json: string): void };
  Continue(): string;
  ChooseChoiceIndex(i: number): void;
};

function walkAllPaths(json: unknown): Tally {
  const t: Tally = {
    bgs: new Set(),
    charas: new Set(),
    bgms: new Set(),
    ses: new Set(),
    minigames: new Set(),
    endings: new Set(),
    totalSteps: 0,
  };

  const collect = (tags: string[] | null) => {
    for (const d of parseTags(tags)) {
      switch (d.kind) {
        case "bg":
          t.bgs.add(d.id);
          break;
        case "chara":
          if (d.exit) break;
          // Match runtime fallback (gameStore.applyChara).
          t.charas.add(`${d.id}::${d.pose ?? "neutral"}`);
          break;
        case "bgm":
          if (d.id) t.bgms.add(d.id);
          break;
        case "se":
          t.ses.add(d.id);
          break;
        case "minigame":
          t.minigames.add(d.id);
          break;
      }
    }
  };

  const walk = (stateJson: string | null, choiceIndex: number | null) => {
    const story = new Story(json as never) as unknown as InkStoryLike;
    if (stateJson) story.state.LoadJson(stateJson);
    if (choiceIndex !== null) story.ChooseChoiceIndex(choiceIndex);

    while (story.canContinue) {
      story.Continue();
      if (++t.totalSteps > MAX_STEPS) {
        throw new Error(
          `Walker exceeded ${MAX_STEPS} steps — possible cycle in script`
        );
      }
      collect(story.currentTags);
    }

    if (story.currentChoices.length === 0) {
      const ending = String(story.variablesState.ending_id ?? "");
      t.endings.add(ending);
      return;
    }

    // Each branch walks from a fresh Story instance with the saved pre-choice
    // state — reusing the same instance across iterations leaves residual
    // state that breaks branching.
    const saved = story.state.toJson();
    for (let i = 0; i < story.currentChoices.length; i++) {
      walk(saved, i);
    }
  };

  walk(null, null);
  return t;
}

describe("story content validation", () => {
  let t: Tally;

  beforeAll(() => {
    t = walkAllPaths(storyJson);
  });

  it("compiles and walks without runaway loops", () => {
    expect(t.totalSteps).toBeGreaterThan(0);
    expect(t.totalSteps).toBeLessThan(MAX_STEPS);
  });

  it("reaches all three endings (A, B, C)", () => {
    expect([...t.endings].sort()).toEqual(["A", "B", "C"]);
  });

  it("every referenced bg id is in BG_REGISTRY", () => {
    const missing = [...t.bgs].filter((id) => !(id in BG_REGISTRY));
    expect(missing).toEqual([]);
  });

  it("every referenced chara id+pose is in CHARA_REGISTRY", () => {
    const missing = [...t.charas].filter((key) => {
      const [id, pose] = key.split("::");
      return !CHARA_REGISTRY[id]?.[pose];
    });
    expect(missing).toEqual([]);
  });

  it("every referenced minigame id has a registered component", () => {
    const missing = [...t.minigames].filter((id) => !(id in MINIGAME_REGISTRY));
    expect(missing).toEqual([]);
  });

  it("every referenced se id is in SE_REGISTRY", () => {
    const missing = [...t.ses].filter((id) => !(id in SE_REGISTRY));
    expect(missing).toEqual([]);
  });

  it("script references at least one bgm cue", () => {
    // BGM_REGISTRY is intentionally empty during the placeholder phase
    // (audio module silently ignores unknown IDs), so we don't assert
    // against it. We do want to know if no bgm cues exist at all though.
    expect(t.bgms.size).toBeGreaterThan(0);
  });
});

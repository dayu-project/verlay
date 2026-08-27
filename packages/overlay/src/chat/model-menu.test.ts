/**
 * The picker's content: two harness groups and Codex reasoning effort.
 *
 * `modelGroups` returns data rather than DOM, which is what makes most of this
 * testable without a menu to put it in — the same reason `deviceGroups` is
 * split out of the two menus that render it. The effort rows are data for the
 * same reason, so their selected state can be tested without opening a popover.
 */

import type { ModelCatalogue } from "@airship/protocol";
import { describe, expect, it, vi } from "vitest";
import type { MenuItem } from "../popover-host";
import { codexEffortItems, modelGroups, modelLabel } from "./model-menu";

const CATALOGUE: ModelCatalogue = [
  {
    agent: "claude",
    default: "opus",
    models: [
      { hint: "1M", id: "claude-opus-5", label: "Opus 5" },
      { id: "sonnet", label: "Sonnet" },
    ],
  },
  { agent: "codex", models: [{ id: "gpt-5.6", label: "GPT-5.6" }] },
  { agent: "opencode", models: [], note: "Not signed in" },
];

function groupsFor(
  agent: "claude" | "codex" | "opencode",
  models: Record<string, string> = {},
  pick = vi.fn()
) {
  return {
    groups: modelGroups({ agent, catalogue: CATALOGUE, models, pick }),
    pick,
  };
}

/** A group's rows, which are all `MenuItem`s by construction. */
function labels(items: MenuItem[]): string[] {
  return items.map((i) => i.label);
}

describe("modelGroups", () => {
  it("offers every harness, in picker order", () => {
    const { groups } = groupsFor("claude");
    expect(groups.map((g) => g.group)).toEqual(["claude", "codex"]);
  });

  it("opens the group for the backend the composer is on", () => {
    // Seeded from the current agent rather than left to fall back to the first,
    // so opening the menu on Codex shows you Codex.
    expect(groupsFor("codex").groups.find((g) => g.open)?.group).toBe("codex");
  });

  it("opens exactly one group", () => {
    const open = groupsFor("codex").groups.filter((g) => g.open);
    expect(open).toHaveLength(1);
  });

  it("leads every group with Default", () => {
    for (const group of groupsFor("claude").groups) {
      expect(group.items[0].label).toBe("Default");
    }
  });

  it("shows the daemon's resolved default as the Default row's hint", () => {
    const [claude] = groupsFor("claude").groups;
    expect(claude.items[0].hint).toBe("opus");
  });

  it("falls back to a phrase when no default was resolved", () => {
    const [, codex] = groupsFor("codex").groups;
    expect(codex.items[0].hint).toBe("the backend decides");
  });

  it("marks Default as on when no model is picked for that backend", () => {
    const [claude] = groupsFor("claude").groups;
    expect(claude.items[0].on).toBe(true);
  });

  it("marks the picked model instead, once there is one", () => {
    const [claude] = groupsFor("claude", { claude: "sonnet" }).groups;
    expect(claude.items[0].on).toBe(false);
    expect(claude.items.find((i) => i.label === "Sonnet")?.on).toBe(true);
  });

  it("marks each backend's own model, not the active one's", () => {
    // The reason the state is per harness at all: Claude's pick must not light
    // up a row in Codex's group.
    const [claude, codex] = groupsFor("claude", {
      claude: "sonnet",
      codex: "gpt-5.6",
    }).groups;
    expect(claude.items.find((i) => i.label === "Sonnet")?.on).toBe(true);
    expect(codex.items.find((i) => i.label === "GPT-5.6")?.on).toBe(true);
  });

  it("does not expose OpenCode even when the daemon catalogues it", () => {
    expect(groupsFor("claude").groups).toHaveLength(2);
    expect(groupsFor("claude").groups.some((g) => g.group === "opencode")).toBe(
      false
    );
  });

  it("picks the backend and the model together", () => {
    const { groups, pick } = groupsFor("claude");
    const [, codex] = groups;
    codex.items.find((i) => i.label === "GPT-5.6")?.run();
    expect(pick).toHaveBeenCalledWith({ agent: "codex", model: "gpt-5.6" });
  });

  it("sends an empty model for the Default row", () => {
    const { groups, pick } = groupsFor("claude");
    groups[0].items[0].run();
    expect(pick).toHaveBeenCalledWith({ agent: "claude", model: "" });
  });

  it("carries each backend's mark on its header", () => {
    expect(groupsFor("claude").groups.map((g) => g.icon)).toEqual([
      "claude",
      "codex",
    ]);
  });
});

describe("codexEffortItems", () => {
  it("offers the common Codex levels after Default", () => {
    expect(labels(codexEffortItems(undefined, vi.fn()))).toEqual([
      "默认",
      "低（推荐）",
      "中",
      "高",
      "极高",
    ]);
  });

  it("marks the selected effort", () => {
    const rows = codexEffortItems("high", vi.fn());
    expect(rows.find((row) => row.label === "高")?.on).toBe(true);
    expect(rows[0].on).toBe(false);
  });

  it("makes the latency-first choice explicit", () => {
    const low = codexEffortItems(undefined, vi.fn()).find(
      (row) => row.label === "低（推荐）"
    );
    expect(low?.hint).toBe("更快");
  });

  it("clears the override from the Default row", () => {
    const pick = vi.fn();
    codexEffortItems("medium", pick)[0].run();
    expect(pick).toHaveBeenCalledWith(undefined);
  });

  it("returns the protocol value for a level", () => {
    const pick = vi.fn();
    codexEffortItems(undefined, pick)
      .find((row) => row.label === "极高")
      ?.run();
    expect(pick).toHaveBeenCalledWith("xhigh");
  });
});

describe("modelLabel", () => {
  it("reads default when nothing is picked", () => {
    expect(modelLabel(CATALOGUE, "claude", undefined)).toBe("default");
  });

  it("resolves a picked id to its label", () => {
    expect(modelLabel(CATALOGUE, "claude", "claude-opus-5")).toBe("Opus 5");
  });

  it("falls back to the raw id for a model it has never heard of", () => {
    // A typed id, or one the seed predates. Showing it verbatim is better than
    // showing nothing, and it is what the user entered.
    expect(modelLabel(CATALOGUE, "claude", "claude-opus-9")).toBe(
      "claude-opus-9"
    );
  });
});

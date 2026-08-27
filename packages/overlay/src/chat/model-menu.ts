/**
 * "Which backend, on which model?", as menu content.
 *
 * The header used to ask only the first half, because the second was settled at
 * launch by `--model` and could not be changed without restarting the daemon.
 * Splitting them into two controls was the obvious shape and the wrong one: a
 * model id only means anything against a backend — `claude-opus-5` is not a
 * thing Codex can run — so two independent pickers would spend most of their
 * time in states that cannot be sent.
 *
 * So it stays one menu, and the grouping carries the pairing: one collapsible
 * group per exposed harness, and choosing any row inside it chooses both. This
 * is the same construction `canvas/device-menu.ts` uses for the device presets, for
 * the same reason — a flat column of every model across several backends is a
 * scroll, and four lines you open one of is a menu.
 */

import type {
  AgentKind,
  Effort,
  ModelCatalogue,
  ModelOption,
} from "@airship/protocol";
import type { IconName } from "../icons";
import type { MenuGroup, MenuItem } from "../popover-host";

/** The id that means "send no model and let the daemon's default stand". */
export const MODEL_DEFAULT = "";

export interface ModelPick {
  agent: AgentKind;
  /** `MODEL_DEFAULT` for the group's leading row. */
  model: string;
}

export interface ModelMenuDeps {
  /** The harness the composer is on. Its group opens. */
  agent: AgentKind;
  /** Live catalogue if one has arrived, else the seed. */
  catalogue: ModelCatalogue;
  /** The current model per harness, so each group marks its own. */
  models: Partial<Record<AgentKind, string>>;
  pick: (choice: ModelPick) => void;
}

/** Product marks, in the order the picker offers the backends. */
const AGENT_META: { icon: IconName; kind: AgentKind; label: string }[] = [
  { icon: "claude", kind: "claude", label: "Claude" },
  { icon: "codex", kind: "codex", label: "Codex" },
];

/**
 * Levels the in-product Codex picker can apply to one turn.
 *
 * `minimal` and `max` remain valid protocol values for the CLI, but they are
 * not offered here: the live model list mixes generations with different
 * endpoints, while low through xhigh are the useful common set. `undefined`
 * is a real leading choice so the daemon's launch/config default can be
 * restored after a manual pick.
 */
const CODEX_EFFORTS: {
  effort: Effort | undefined;
  hint?: string;
  label: string;
}[] = [
  { effort: undefined, hint: "由后端决定", label: "默认" },
  { effort: "low", hint: "更快", label: "低（推荐）" },
  { effort: "medium", hint: "均衡", label: "中" },
  { effort: "high", hint: "更深入", label: "高" },
  { effort: "xhigh", hint: "最慢", label: "极高" },
];

/** The label a picked model gets in the button's tooltip. */
export function modelLabel(
  catalogue: ModelCatalogue,
  agent: AgentKind,
  model: string | undefined
): string {
  if (!model) {
    return "default";
  }
  const group = catalogue.find((g) => g.agent === agent);
  return group?.models.find((m) => m.id === model)?.label ?? model;
}

/**
 * The rows for one harness.
 *
 * Every group leads with Default, and it is a real choice rather than a
 * placeholder: picking it clears the model from the request so the daemon's
 * own resolved setting applies — which is what `--claude-model` and
 * `airship.config.json` are for, and the only way back to them once a model has
 * been picked by hand.
 */
function rowsFor(
  agent: AgentKind,
  models: ModelOption[],
  current: string | undefined,
  fallback: string | undefined,
  note: string | undefined,
  pick: (choice: ModelPick) => void
): MenuItem[] {
  const rows: MenuItem[] = [
    {
      hint: fallback ?? "the backend decides",
      label: "Default",
      on: !current,
      run: () => pick({ agent, model: MODEL_DEFAULT }),
    },
  ];
  // A backend that could not be reached says so in place of its models. A group
  // that is simply empty reads as a broken picker rather than a missing login,
  // and the two want very different things from the user.
  if (note && !models.length) {
    rows.push({ disabled: true, label: note, run: () => undefined });
  }
  for (const model of models) {
    rows.push({
      hint: model.hint,
      label: model.label,
      on: model.id === current,
      run: () => pick({ agent, model: model.id }),
    });
  }
  return rows;
}

/**
 * The catalogue as collapsible `createMenu` groups.
 *
 * `open` is seeded from the composer's current backend rather than left to fall
 * back to the first, so opening the menu on Codex shows you Codex's models. The
 * exposed groups are always present even when a probe returned nothing — the
 * picker's job includes letting you *switch to* a backend you have not signed
 * into yet, and a group that vanishes when it fails cannot do that.
 */
export function modelGroups(deps: ModelMenuDeps): MenuGroup[] {
  return AGENT_META.map((meta) => {
    const group = deps.catalogue.find((g) => g.agent === meta.kind);
    return {
      group: meta.kind,
      icon: meta.icon,
      items: rowsFor(
        meta.kind,
        group?.models ?? [],
        deps.models[meta.kind],
        group?.default,
        group?.note,
        deps.pick
      ),
      label: meta.label,
      open: meta.kind === deps.agent,
    };
  });
}

/** Flat rows shown beneath the Codex model group. */
export function codexEffortItems(
  current: Effort | undefined,
  pick: (effort: Effort | undefined) => void
): MenuItem[] {
  return CODEX_EFFORTS.map((option) => ({
    hint: option.hint,
    label: option.label,
    on: option.effort === current,
    run: () => pick(option.effort),
  }));
}

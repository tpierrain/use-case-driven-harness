#!/usr/bin/env node
// plan-state-size-guard — the deterministic net under "a plan's `## 📍 STATE` block
// holds only what expires, and stays short enough to be RE-READ".
//
// WHY THIS EXISTS. The rule is not new: Kenjaku's CONVENTIONS §3ter has said
// "≤ 20 lines, four keys" since 2026-08-22, and the harness's own plans.md says the
// save point is a RE-READ of the block, never an append to it. Both were obeyed in
// spirit and neither was measurable, so on 2026-09-12 a re-read of the active plan's
// block found SIX false entries in it — and the block itself had grown to 197 lines
// across three live plans at 241, 197 and 43. A rule that must be remembered has
// already failed; this counts.
//
// THE CAUSAL CHAIN IT BREAKS, in one sentence: a block that mixes what expires with
// what never does (history, lessons, dated decisions) grows, and once it is long the
// writing habit degrades from "re-read and correct" to "append on top" — which is
// precisely how a line goes false without anyone editing it.
//
// SHAPE. One matcher: Stop → measure every LIVE plan's STATE block and name the ones
// over cap. Archived plans are frozen history and are never counted: warning about
// them forever is how a guard becomes noise, and a guard that becomes noise gets
// switched off.
//
// It JUDGES NO CONTENT. It counts lines. It cannot tell a durable lesson from a
// perishable status — only that a block has grown past the size at which anyone
// re-reads it. The only way under the cap is to move the durable half down into the
// body, which is the actual fix.
//
// Fail-open on every internal error: a guard bug must never wedge a session.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { homedir } from "node:os";

const STAMP_DIR = join(homedir(), ".claude", ".cache", "plan-state-size");

// The cap is Kenjaku CONVENTIONS §3ter's own number, not a new one invented here.
// One number in the prose and in the machine, or the machine teaches a second rule.
const DEFAULT_CAP = 20;

const PLAN_PATHSPEC = ["--", "*.md", ":(exclude)node_modules/**", ":(exclude)vault/**"];

// ── The testable core ────────────────────────────────────────────────────────

// The heading this rule is about. Written with the pin so it cannot match a prose
// mention of the words "state block".
const STATE_HEADING = /^##(?!#)\s+.*📍\s*STATE/u;
const NEXT_H2 = /^##(?!#)\s/u;

// The block is everything from the heading to the next h2 (or the end of the file).
// A `###` subsection belongs to the block: it is inside it, and it counts.
export function extractStateBlock(text) {
  if (typeof text !== "string") return null;
  const lines = text.split("\n");
  const start = lines.findIndex((line) => STATE_HEADING.test(line));
  if (start === -1) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => NEXT_H2.test(line));
  return end === -1 ? rest : rest.slice(0, end);
}

// Non-empty lines only: blank lines are typography, and counting them would make the
// cap gameable in the one direction that does not help anyone (unwrapping prose).
export function stateBlockSize(text) {
  const block = extractStateBlock(text);
  if (block === null) return null;
  return block.filter((line) => line.trim() !== "").length;
}

// A LIVE plan: under a `plans/` directory and not archived. Archived plans are frozen
// by §7 the day they are archived — their blocks are history, and history does not
// expire twice.
export function isLivePlan(path) {
  if (typeof path !== "string" || path.trim() === "") return false;
  const normalised = path.replace(/^\.\//, "");
  if (!/(^|\/)plans\//.test(normalised)) return false;
  return !/(^|\/)archived\//.test(normalised);
}

export function overCap(measurements, cap = DEFAULT_CAP) {
  return (measurements ?? [])
    .filter((entry) => Number.isFinite(entry?.size) && entry.size > cap)
    .sort((a, b) => b.size - a.size);
}

export function suppressionKey(headSha, offenders) {
  const parts = (offenders ?? [])
    .map((entry) => `${entry.file}:${entry.size}`)
    .sort();
  return `${headSha} ${parts.join(" ")}`;
}

export function shouldWarn({ stopHookActive, offenders, headSha, lastWarnedKey }) {
  if (stopHookActive) return false;
  if (!offenders || offenders.length === 0) return false;
  return suppressionKey(headSha, offenders) !== lastWarnedKey;
}

export function buildMessage({ offenders, cap = DEFAULT_CAP }) {
  const list = offenders
    .map((entry) => `  • ${entry.file} — ${entry.size} lines (${entry.size - cap} over)`)
    .join("\n");
  return (
    `🛑 PLAN STATE SIZE GUARD — ${offenders.length} live plan(s) carry a STATE block over ${cap} lines.\n\n` +
    `${list}\n\n` +
    `The cap is the forcing function, not a style preference: a block nobody re-reads ` +
    `gets APPENDED to, and an appended block goes false without anyone editing it ` +
    `(CONVENTIONS §3ter, and the harness's plans.md save point).\n\n` +
    `Do this: move the DURABLE half down into the body — findings, lessons, history, ` +
    `dated decisions. The body may be as long as it likes; nothing re-reads it every ` +
    `session. What stays above is only what expires: next step, blocker, owner's call, ` +
    `what a session may do alone.\n\n` +
    `This hook judges NO content. It counts non-empty lines between the heading and the ` +
    `next one. Archived plans are never counted.\n\n` +
    `(Silent again until HEAD or those sizes change.)\n`
  );
}

// ── Self-test (run: node plan-state-size-guard.mjs --selftest) ───────────────

function selftest() {
  const results = [];
  const check = (name, got, expected) => {
    const pass = JSON.stringify(got) === JSON.stringify(expected);
    results.push(pass);
    console.log(`${pass ? "✓" : "✗ FAIL"}  ${name} → ${JSON.stringify(got)} (expected ${JSON.stringify(expected)})`);
  };

  // extractStateBlock — where the block starts, and where it stops
  const plan = [
    "# Action plan — something",
    "",
    "## 📍 STATE — the only perishable block · opened 2026-01-01",
    "",
    "- Next: ship it",
    "- Blocked on: nothing",
    "",
    "## Tracking",
    "",
    "- [ ] a step",
  ].join("\n");
  check("the block is the lines under the heading", extractStateBlock(plan), ["", "- Next: ship it", "- Blocked on: nothing", ""]);
  check("a file with no block measures nothing", extractStateBlock("# Plan\n\n## Tracking\n- [ ] x"), null);
  check("an unreadable file measures nothing", extractStateBlock(undefined), null);
  check(
    "a ### subsection stays INSIDE the block",
    extractStateBlock("## 📍 STATE\n- a\n### detail\n- b\n## Tracking\n- c"),
    ["- a", "### detail", "- b"],
  );
  check(
    "a block that runs to the end of the file is still a block",
    extractStateBlock("## 📍 STATE\n- a\n- b"),
    ["- a", "- b"],
  );
  check(
    "a ### heading spelt like the block does not open one",
    extractStateBlock("### 📍 STATE\n- a\n- b"),
    null,
  );
  check(
    "prose naming the block does not open one",
    extractStateBlock("# Plan\n\nread its 📍 STATE block first\n\n- a"),
    null,
  );

  // stateBlockSize — blank lines are typography
  check("blank lines do not count", stateBlockSize(plan), 2);
  check("a file with no block has no size", stateBlockSize("# Plan"), null);
  check("an empty block is zero", stateBlockSize("## 📍 STATE\n\n\n## Tracking"), 0);
  check("whitespace-only lines do not count", stateBlockSize("## 📍 STATE\n- a\n   \n\t\n- b"), 2);

  // isLivePlan — archived is frozen history
  check("a prospective plan is live", isLivePlan("maintainers/plans/prospective/x-action.md"), true);
  check("a plan at the root of plans/ is live", isLivePlan("maintainers/plans/ACTIVE.md"), true);
  check("an archived plan is not", isLivePlan("maintainers/plans/archived/x-action.md"), false);
  check("a study is not a plan", isLivePlan("maintainers/studies/x-study.md"), false);
  check("a doc outside plans/ is not a plan", isLivePlan("maintainers/CONVENTIONS.md"), false);
  check("a ./ prefix is the same path", isLivePlan("./maintainers/plans/prospective/x.md"), true);
  check("a folder merely NAMED plans-something is not plans/", isLivePlan("maintainers/plansphere/x.md"), false);
  check("an empty path is not a plan", isLivePlan(""), false);
  check("an absent path is not a plan", isLivePlan(undefined), false);

  // overCap — the boundary, triangulated, and collections of ≥2 unsorted
  const measured = [
    { file: "small.md", size: 12 },
    { file: "huge.md", size: 197 },
    { file: "exact.md", size: 20 },
    { file: "one-over.md", size: 21 },
  ];
  check(
    "only blocks strictly over the cap are named, biggest first",
    overCap(measured, 20),
    [{ file: "huge.md", size: 197 }, { file: "one-over.md", size: 21 }],
  );
  check("exactly at the cap is not over it", overCap([{ file: "exact.md", size: 20 }], 20), []);
  check("one under the cap is not over it", overCap([{ file: "a.md", size: 19 }], 20), []);
  check("the cap is a parameter, not a constant", overCap([{ file: "a.md", size: 25 }], 30), []);
  check("a file with no block is never over cap", overCap([{ file: "a.md", size: null }], 20), []);
  check("nothing measured is nothing over cap", overCap([], 20), []);
  check("an absent measurement list is nothing over cap", overCap(undefined, 20), []);

  // suppressionKey
  check(
    "the key ignores the order the offenders were reported in",
    suppressionKey("abc", [{ file: "b.md", size: 30 }, { file: "a.md", size: 21 }]) ===
      suppressionKey("abc", [{ file: "a.md", size: 21 }, { file: "b.md", size: 30 }]),
    true,
  );
  check(
    "a block that SHRANK but is still over cap re-arms the warning",
    suppressionKey("abc", [{ file: "a.md", size: 30 }]) === suppressionKey("abc", [{ file: "a.md", size: 25 }]),
    false,
  );
  check(
    "a new commit re-arms the warning",
    suppressionKey("abc", [{ file: "a.md", size: 30 }]) === suppressionKey("def", [{ file: "a.md", size: 30 }]),
    false,
  );

  // shouldWarn
  const base = {
    stopHookActive: false,
    offenders: [{ file: "a.md", size: 30 }],
    headSha: "abc",
    lastWarnedKey: null,
  };
  check("a plan over cap warns", shouldWarn(base), true);
  check("the harness's own loop breaker silences it", shouldWarn({ ...base, stopHookActive: true }), false);
  check("nothing over cap is silent", shouldWarn({ ...base, offenders: [] }), false);
  check("an absent offender list is silent", shouldWarn({ ...base, offenders: undefined }), false);
  check(
    "the same warning twice over the same state is silent",
    shouldWarn({ ...base, lastWarnedKey: suppressionKey("abc", [{ file: "a.md", size: 30 }]) }),
    false,
  );
  check(
    "editing the block re-arms the warning",
    shouldWarn({ ...base, offenders: [{ file: "a.md", size: 26 }], lastWarnedKey: suppressionKey("abc", [{ file: "a.md", size: 30 }]) }),
    true,
  );

  // buildMessage — a fingerprint of every number and name it must carry
  const message = buildMessage({ offenders: [{ file: "big.md", size: 197 }, { file: "mid.md", size: 43 }], cap: 20 });
  check("the message names each offender", ["big.md", "mid.md"].every((f) => message.includes(f)), true);
  check("the message gives the measured size", message.includes("197 lines"), true);
  check("the message gives the overshoot", message.includes("177 over"), true);
  check("the message counts the offenders", message.includes("2 live plan(s)"), true);
  check("the message names the cap", message.includes("over 20 lines"), true);
  check("the message says it judges no content", /judges NO content/.test(message), true);
  check("the message says what to do instead of only what is wrong", /move the DURABLE half/.test(message), true);

  const passed = results.filter(Boolean).length;
  console.log(`\n${passed}/${results.length} passed`);
  process.exit(passed === results.length ? 0 : 1);
}

// ── The git half (impure, kept thin on purpose) ──────────────────────────────

function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

function gitLines(args, cwd) {
  try {
    return git(args, cwd)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return []; // git grep exits 1 on "no match"
  }
}

function gitValue(args, cwd) {
  try {
    return git(args, cwd).trim();
  } catch {
    return "";
  }
}

export function collectState(cwd, cap = DEFAULT_CAP) {
  const headSha = gitValue(["rev-parse", "HEAD"], cwd);
  if (!headSha) return null;

  // One grep for the heading's own pin, then a read per candidate. Live plans only.
  const candidates = gitLines(["grep", "-l", "--fixed-strings", "📍 STATE", ...PLAN_PATHSPEC], cwd).filter(isLivePlan);

  const measured = candidates.map((file) => {
    try {
      return { file, size: stateBlockSize(readFileSync(join(cwd, file), "utf8")) };
    } catch {
      return { file, size: null }; // fail-open: a file that cannot be read is not an offender
    }
  });

  return { headSha, measured, offenders: overCap(measured, cap), cap };
}

function stampPath(sessionId) {
  return join(STAMP_DIR, `${String(sessionId || "no-session").replace(/[^\w-]/g, "_")}.json`);
}

function readStamp(sessionId) {
  try {
    return JSON.parse(readFileSync(stampPath(sessionId), "utf8"));
  } catch {
    return {};
  }
}

function writeStamp(sessionId, stamp) {
  try {
    mkdirSync(STAMP_DIR, { recursive: true });
    writeFileSync(stampPath(sessionId), JSON.stringify(stamp));
  } catch {
    /* best-effort: a stamp that cannot be written only costs a repeated warning */
  }
}

// ── main ─────────────────────────────────────────────────────────────────────

if (process.argv.includes("--selftest")) selftest();

// `--explain` runs the whole git half against the current directory and prints the
// verdict without a payload — the end-to-end check, safe to run any time.
if (process.argv.includes("--explain")) {
  const state = collectState(process.cwd());
  if (!state) {
    console.log("not a git repository → silent");
    process.exit(0);
  }
  for (const entry of state.measured) {
    console.log(`${String(entry.size ?? "—").padStart(4)}  ${entry.file}`);
  }
  console.log("");
  console.log(state.offenders.length ? buildMessage(state) : `→ silent (cap ${state.cap})`);
  process.exit(0);
}

let payload = "";
try {
  payload = readFileSync(0, "utf8");
} catch {
  process.exit(0);
}

try {
  const data = JSON.parse(payload || "{}");
  const sessionId = data.session_id;
  const cwd = data.cwd || process.cwd();
  if ((data.hook_event_name || "") !== "Stop") process.exit(0);

  const stamp = readStamp(sessionId);
  const state = collectState(cwd);
  if (!state) process.exit(0);

  if (!shouldWarn({ ...state, stopHookActive: Boolean(data.stop_hook_active), lastWarnedKey: stamp.lastWarnedKey })) {
    process.exit(0);
  }

  writeStamp(sessionId, { ...stamp, lastWarnedKey: suppressionKey(state.headSha, state.offenders) });
  process.stderr.write(buildMessage(state));
  process.exit(2); // 2 = block the hand-back, stderr goes back to Claude
} catch {
  process.exit(0); // fail-open: a guard bug must never wedge a session
}

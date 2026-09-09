#!/usr/bin/env node
// notion-no-replace-guard — PreToolUse guard for the Notion MCP update-page tool.
//
// The parcours Notion pages are now edited & commented concurrently by several
// people / AI experts. A `replace_content` ("annule & remplace") call rewrites a
// whole page from scratch — it would SILENTLY wipe their edits AND their inline
// comments. This guard BLOCKS any notion-update-page call whose command is
// `replace_content`, forcing targeted edits (update_content / insert_content).
//
// Unlike en-artifact-guard (non-blocking warn), this one BLOCKS: the downside of
// a wrong replace (lost colleagues' work) is irreversible, so we deny by default.
// Conscious override for the rare legitimate case (a page you own alone):
// set ALLOW_NOTION_REPLACE=1 for that run.
//
// Matcher is server-id agnostic: it matches mcp__<anything>__notion-update-page,
// since the Notion connector id varies between sessions.

import { readFileSync } from 'node:fs'

// --- testable core ----------------------------------------------------------
// Returns { block: boolean, reason: string }.
export function evaluate(data, env = process.env) {
  const toolName = data?.tool_name || ''
  if (!/notion-update-page/.test(toolName)) return { block: false, reason: '' }

  const input = data?.tool_input || {}
  if (input.command !== 'replace_content') return { block: false, reason: '' }

  if (env.ALLOW_NOTION_REPLACE === '1') return { block: false, reason: '' }

  const pageId = input.page_id || '(inconnue)'
  const reason =
    `⛔ NOTION NO-REPLACE GUARD — appel \`replace_content\` bloqué (page ${pageId}).\n` +
    `Ces pages sont éditées & commentées en parallèle par plusieurs experts : un ` +
    `« annule & remplace » écraserait leur travail ET leurs commentaires.\n` +
    `→ Utilise des éditions CIBLÉES : \`update_content\` (search/replace) ou \`insert_content\`.\n` +
    `Override conscient (rare, page que tu possèdes seul) : relancer avec ALLOW_NOTION_REPLACE=1.`
  return { block: true, reason }
}

// --- selftest ---------------------------------------------------------------
function selftest() {
  const T = 'mcp__abc123-def__notion-update-page'
  const cases = [
    ['replace_content blocked', { tool_name: T, tool_input: { command: 'replace_content', page_id: 'x' } }, {}, true],
    ['update_content allowed', { tool_name: T, tool_input: { command: 'update_content' } }, {}, false],
    ['insert_content allowed', { tool_name: T, tool_input: { command: 'insert_content' } }, {}, false],
    ['update_properties allowed', { tool_name: T, tool_input: { command: 'update_properties' } }, {}, false],
    ['other tool ignored', { tool_name: 'Bash', tool_input: { command: 'replace_content' } }, {}, false],
    ['override bypasses', { tool_name: T, tool_input: { command: 'replace_content' } }, { ALLOW_NOTION_REPLACE: '1' }, false],
    ['different server id still caught', { tool_name: 'mcp__deadbeef-0000__notion-update-page', tool_input: { command: 'replace_content' } }, {}, true],
  ]
  let ok = 0
  for (const [name, data, env, expected] of cases) {
    const got = evaluate(data, env).block
    const pass = got === expected
    ok += pass ? 1 : 0
    console.log(`${pass ? '✓' : '✗ FAIL'}  ${name} → block=${got} (expected ${expected})`)
  }
  console.log(`\n${ok}/${cases.length} passed`)
  process.exit(ok === cases.length ? 0 : 1)
}

// --- main -------------------------------------------------------------------
if (process.argv.includes('--selftest')) selftest()

let payload = ''
try {
  payload = readFileSync(0, 'utf8')
} catch { process.exit(0) }

try {
  const data = JSON.parse(payload || '{}')
  const { block, reason } = evaluate(data)
  if (!block) process.exit(0)
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  }))
  process.exit(0)
} catch {
  process.exit(0) // fail-open: a guard bug must never wedge the session
}

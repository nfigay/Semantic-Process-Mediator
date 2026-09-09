const VALID_LEVELS = new Set([
  'off',
  'info',
  'warn',
  'error'
])


function normalizeRules(rules = {}) {
  const normalized = {}

  for (const [ruleId, level] of Object.entries(rules)) {

    if (!VALID_LEVELS.has(level)) {
      console.warn(
        `[lint] Invalid level "${level}" for rule "${ruleId}"`
      )

      continue
    }

    normalized[ruleId] = level
  }

  return normalized
}


export function resolveLintConfig({
  defaults = {},
  global = {},
  coc = {},
  maturity = {},
  overrides = {}
} = {}) {

  return {
    ...normalizeRules(defaults),
    ...normalizeRules(global),
    ...normalizeRules(coc),
    ...normalizeRules(maturity),
    ...normalizeRules(overrides)
  }
}
/**
 * SemArch Linter
 * Lightweight rule-based linter for the Semantic Process Mediator.
 * Runs as a bpmn-js companion — no bpmnlint dependency required.
 *
 * Architecture:
 *  - SemArchLinter: main class, subscribes to modeler events
 *  - Rules: pure functions (element, modeler) → Issue[]
 *  - Global rules always run; CoC rules activate based on maturity profile
 */

// ── Issue structure ──────────────────────────────────────────────────────────
// { rule, severity, element, elementId, elementName, message }
// severity: 'error' | 'warning' | 'info'

// ── AUTO-GENERATED ID pattern ────────────────────────────────────────────────
// bpmn-js generates IDs like: Activity_0abc123, Gateway_0xyz789, Flow_1ab2cd3
const AUTO_GEN_RE = /^[A-Za-z]+_[0-9a-zA-Z]{7,}$/

// ════════════════════════════════════════════════════════════════════════════
// RULES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Rule: semarch/stable-id
 * Element IDs should be semantic and stable, not auto-generated.
 * An auto-generated ID cannot serve as a stable merge key with EA or ARIS.
 */
export const stableIdRule = {
  id: 'semarch/stable-id',
  name: 'Stable semantic ID',
  severity: 'warning',
  appliesTo: null, // all elements
  check(element) {
    // Skip root, labels, connections that are internal
    if (['label', 'bpmn:Definitions'].includes(element.type)) return []
    if (element.type === 'bpmn:Process' && element.id === 'Process_1') {
      return [{
        rule: 'semarch/stable-id',
        severity: 'warning',
        element,
        message: `Default "Process_1" ID — rename to something like "CoC_Avionics_AssemblyVerification"`
      }]
    }
    if (AUTO_GEN_RE.test(element.id)) {
      return [{
        rule: 'semarch/stable-id',
        severity: 'warning',
        element,
        message: `Auto-generated ID "${element.id}". Use semantic naming: {ProcessId}_{Type}_{Name}`
      }]
    }
    return []
  }
}

/**
 * Rule: semarch/require-coc-ref
 * Process and task elements should declare their owning CoC
 * via semarch:Meta.cocRef in extensionElements.
 */
export const requireCocRefRule = {
  id: 'semarch/require-coc-ref',
  name: 'CoC reference required',
  severity: 'info',
  appliesTo: [
    'bpmn:Process', 'bpmn:Task', 'bpmn:UserTask', 'bpmn:ServiceTask',
    'bpmn:ManualTask', 'bpmn:BusinessRuleTask', 'bpmn:ScriptTask',
    'bpmn:CallActivity', 'bpmn:SubProcess'
  ],
  check(element) {
    if (!this.appliesTo.includes(element.type)) return []

    const bo = element.businessObject
    const exts = bo.extensionElements
    const meta = exts?.values?.find(v => v.$type === 'semarch:Meta')

    if (!meta) {
      return [{
        rule: 'semarch/require-coc-ref',
        severity: 'info',
        element,
        message: `No semarch:Meta on "${element.id}" — add cocRef to trace CoC ownership`
      }]
    }
    if (!meta.cocRef) {
      return [{
        rule: 'semarch/require-coc-ref',
        severity: 'info',
        element,
        message: `semarch:Meta on "${element.id}" is missing cocRef`
      }]
    }
    return []
  }
}

/**
 * Rule: semarch/typed-message-flow
 * MessageFlows should reference a Message definition.
 * Without messageRef, the inter-process contract is undefined.
 */
export const typedMessageFlowRule = {
  id: 'semarch/typed-message-flow',
  name: 'Message flow should reference a message',
  severity: 'warning',
  appliesTo: ['bpmn:MessageFlow'],
  check(element) {
    if (element.type !== 'bpmn:MessageFlow') return []
    const bo = element.businessObject
    if (!bo.messageRef) {
      return [{
        rule: 'semarch/typed-message-flow',
        severity: 'warning',
        element,
        message: `MessageFlow "${element.id}" has no messageRef — define the exchanged message`
      }]
    }
    return []
  }
}

/**
 * Rule: semarch/named-element
 * Tasks, gateways, and events should have meaningful names.
 * Unnamed elements break traceability to standards and documentation.
 */
export const namedElementRule = {
  id: 'semarch/named-element',
  name: 'Element should have a name',
  severity: 'info',
  appliesTo: [
    'bpmn:Task', 'bpmn:UserTask', 'bpmn:ServiceTask', 'bpmn:ManualTask',
    'bpmn:BusinessRuleTask', 'bpmn:ScriptTask', 'bpmn:CallActivity', 'bpmn:SubProcess',
    'bpmn:ExclusiveGateway', 'bpmn:InclusiveGateway', 'bpmn:ParallelGateway',
    'bpmn:EventBasedGateway', 'bpmn:ComplexGateway',
    'bpmn:StartEvent', 'bpmn:EndEvent',
    'bpmn:IntermediateCatchEvent', 'bpmn:IntermediateThrowEvent',
    'bpmn:BoundaryEvent', 'bpmn:DataObjectReference', 'bpmn:DataStoreReference'
  ],
  check(element) {
    if (!this.appliesTo.includes(element.type)) return []
    const bo = element.businessObject
    if (!bo.name || bo.name.trim() === '') {
      const type = element.type.replace('bpmn:', '')
      return [{
        rule: 'semarch/named-element',
        severity: 'info',
        element,
        message: `${type} "${element.id}" has no name — unnamed elements break traceability`
      }]
    }
    return []
  }
}

// All built-in rules
export const GLOBAL_RULES = [
  stableIdRule,
  namedElementRule,
  typedMessageFlowRule
]

export const L2_RULES = [
  ...GLOBAL_RULES,
  requireCocRefRule
]

// ════════════════════════════════════════════════════════════════════════════
// LINTER CLASS
// ════════════════════════════════════════════════════════════════════════════

export class SemArchLinter {
  /**
   * @param {Object} modeler   - bpmn-js modeler instance
   * @param {Function} onResult - callback(issues: Issue[]) called after each run
   */
  constructor(modeler, onResult) {
    this.modeler   = modeler
    this.onResult  = onResult
    this.rules     = [...GLOBAL_RULES]
    this._timer    = null
    this._active   = true

    modeler.on('commandStack.changed', () => {
      if (!this._active) return
      clearTimeout(this._timer)
      this._timer = setTimeout(() => this.run(), 900)
    })

    modeler.on('import.done', () => {
      if (!this._active) return
      setTimeout(() => this.run(), 300)
    })
  }

  /** Replace active rules with a named profile */
  setProfile(profile) {
    switch (profile) {
      case 'L1': this.rules = GLOBAL_RULES; break
      case 'L2':
      case 'L3':
      case 'L4': this.rules = L2_RULES; break
      default:   this.rules = GLOBAL_RULES
    }
  }

  /** Add a custom rule (e.g. CoC-specific) */
  addRule(rule) {
    if (!this.rules.find(r => r.id === rule.id)) {
      this.rules.push(rule)
    }
  }

  /** Enable / disable auto-run */
  setActive(active) {
    this._active = active
  }

  /** Run all rules immediately and return issues */
  run() {
    const registry = this.modeler.get('elementRegistry')
    if (!registry) return []

    const elements = registry.getAll()
    const issues   = []

    for (const rule of this.rules) {
      for (const element of elements) {
        if (element.type === 'label') continue
        try {
          const found = rule.check(element)
          if (found && found.length) issues.push(...found)
        } catch (e) {
          console.warn(`[SemArchLinter] Rule ${rule.id} threw:`, e)
        }
      }
    }

    // Sort: errors first, then warnings, then info
    const order = { error: 0, warning: 1, info: 2 }
    issues.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3))

    this.onResult(issues)
    return issues
  }
}

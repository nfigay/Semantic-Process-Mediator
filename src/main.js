// ── w2ui ────────────────────────────────────────────────────────────────────
import { w2layout, w2popup, w2alert, w2confirm } from 'w2ui/w2ui-2.0.es6.js'
import 'w2ui/w2ui-2.0.min.css'

// ── bpmn-js — standard BPMN properties only (no Camunda) ────────────────────
import BpmnModeler from 'bpmn-js/lib/Modeler'
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
} from 'bpmn-js-properties-panel'

import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import '@bpmn-io/properties-panel/assets/properties-panel.css'

// ── SemArch extensions ───────────────────────────────────────────────────────
import semarchModdle  from './extensions/semarch.json'
import cocRegistry    from './extensions/coc-registry.json'
import { SemArchLinter } from './linting/semarch-linter.js'

// ════════════════════════════════════════════════════════════════════════════
// DEFAULT DIAGRAM — Collaboration with two Pools
// (enables MessageFlow and inter-process modelling from the start)
// ════════════════════════════════════════════════════════════════════════════
const EMPTY_DIAGRAM = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:semarch="http://semarch.io/schema/1.0"
  targetNamespace="http://semarch.io/repository"
  id="Definitions_Repository">

  <bpmn:extensionElements>
    <semarch:RepositoryContext
      cocOwner=""
      organization=""
      maturity="L1"
      stdRef=""
      targetPlatform="Standalone"
      programContext=""
      repositoryVersion="1.0"
      lastReview=""/>
  </bpmn:extensionElements>

  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Participant_A" name="System A" processRef="Process_A"/>
    <bpmn:participant id="Participant_B" name="System B" processRef="Process_B"/>
  </bpmn:collaboration>

  <bpmn:process id="Process_A" isExecutable="true">
    <bpmn:startEvent id="Process_A_Start" name="Start"/>
  </bpmn:process>

  <bpmn:process id="Process_B" isExecutable="false">
    <bpmn:startEvent id="Process_B_Start" name="Start"/>
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_Collaboration">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1">
      <bpmndi:BPMNShape id="Participant_A_di" bpmnElement="Participant_A" isHorizontal="true">
        <dc:Bounds x="120" y="80" width="600" height="160"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Process_A_Start_di" bpmnElement="Process_A_Start">
        <dc:Bounds x="200" y="142" width="36" height="36"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Participant_B_di" bpmnElement="Participant_B" isHorizontal="true">
        <dc:Bounds x="120" y="280" width="600" height="160"/>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Process_B_Start_di" bpmnElement="Process_B_Start">
        <dc:Bounds x="200" y="342" width="36" height="36"/>
        <bpmndi:BPMNLabel/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

// ════════════════════════════════════════════════════════════════════════════
// 1. W2UI LAYOUT — 5 panels
// ════════════════════════════════════════════════════════════════════════════
const layout = new w2layout({
  box: '#app',
  name: 'main-layout',
  panels: [
    {
      type: 'top',
      size: 45,
      resizable: false,
      style: 'overflow:hidden; padding:0; background:#1E3A5F;'
    },
    {
      type: 'left',
      size: 50,
      resizable: false,
      style: 'background:#F4F6F9; border-right:1px solid #D4DCE6; overflow:hidden; padding:0;'
    },
    {
      type: 'main',
      style: 'background:#fff; overflow:hidden;'
    },
    {
      type: 'right',
      size: 320,
      resizable: true,
      style: 'background:#F9FAFB; border-left:1px solid #D4DCE6; overflow:hidden;'
    },
    {
      type: 'bottom',
      size: 130,
      resizable: true,
      style: 'background:#F4F6F9; border-top:1px solid #D4DCE6; overflow:hidden;'
    }
  ]
})

// ════════════════════════════════════════════════════════════════════════════
// 2. TOOLBAR — native HTML, native event listeners
// ════════════════════════════════════════════════════════════════════════════
layout.el('top').innerHTML = `
  <div style="display:flex;align-items:center;height:45px;padding:0 10px;gap:2px;">
    <span style="font-family:'Syne',sans-serif;font-weight:700;font-size:11px;
      letter-spacing:.1em;text-transform:uppercase;color:#fff;padding:0 12px;
      white-space:nowrap;">Semantic Process Mediator</span>
    <span style="width:1px;height:20px;background:rgba(255,255,255,.2);margin:0 4px;"></span>
    <button class="tb-btn" id="btn-new">New</button>
    <button class="tb-btn" id="btn-import">Import…</button>
    <span style="width:1px;height:20px;background:rgba(255,255,255,.2);margin:0 4px;"></span>
    <button class="tb-btn" id="btn-export-xml">Export XML</button>
    <button class="tb-btn" id="btn-export-svg">Export SVG</button>
    <span style="width:1px;height:20px;background:rgba(255,255,255,.2);margin:0 4px;"></span>
    <button class="tb-btn" id="btn-fit">Fit</button>
    <span style="width:1px;height:20px;background:rgba(255,255,255,.2);margin:0 4px;"></span>
    <button class="tb-btn tb-btn-accent" id="btn-context">⚙ CoC Context</button>
    <button class="tb-btn" id="btn-lint">⚡ Lint</button>
    <span style="flex:1"></span>
    <span id="lint-badge" style="display:none;font-family:monospace;font-size:11px;
      background:rgba(255,255,255,.12);color:#fff;padding:2px 10px;border-radius:20px;
      white-space:nowrap;"></span>
  </div>
`

// ════════════════════════════════════════════════════════════════════════════
// 3. BPMN-JS CONTAINERS
// ════════════════════════════════════════════════════════════════════════════
layout.el('main').innerHTML  = '<div id="bpmn-canvas"  style="width:100%;height:100%;"></div>'
layout.el('right').innerHTML = '<div id="bpmn-props"   style="height:100%;"></div>'

layout.el('bottom').innerHTML = `
  <div id="lint-panel" style="height:100%;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;padding:4px 12px;
      background:#EDF0F5;border-bottom:1px solid #D4DCE6;gap:8px;flex-shrink:0;">
      <span style="font-family:monospace;font-size:10px;font-weight:600;
        color:#4A6580;letter-spacing:.08em;text-transform:uppercase;">
        Linting Results
      </span>
      <span id="lint-summary" style="font-family:monospace;font-size:10px;color:#8A9BB0;"></span>
    </div>
    <div id="lint-results" style="flex:1;overflow-y:auto;padding:4px 0;"></div>
  </div>
`

// ════════════════════════════════════════════════════════════════════════════
// 4. BPMN MODELER — standard BPMN, semarch extension, no Camunda
// ════════════════════════════════════════════════════════════════════════════
const modeler = new BpmnModeler({
  container: '#bpmn-canvas',
  propertiesPanel: { parent: '#bpmn-props' },
  additionalModules: [
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
  ],
  moddleExtensions: {
    semarch: semarchModdle
  }
})

// ════════════════════════════════════════════════════════════════════════════
// 5. LINTER
// ════════════════════════════════════════════════════════════════════════════
const linter = new SemArchLinter(modeler, renderLintResults)
linter.setProfile('L2') // default — adjusts when CoC context is saved

function renderLintResults(issues) {
  const container = document.getElementById('lint-results')
  const summary   = document.getElementById('lint-summary')
  const badge     = document.getElementById('lint-badge')
  if (!container) return

  const errors   = issues.filter(i => i.severity === 'error').length
  const warnings = issues.filter(i => i.severity === 'warning').length
  const infos    = issues.filter(i => i.severity === 'info').length

  // Badge in toolbar
  if (issues.length === 0) {
    badge.style.display = 'none'
    summary.textContent = 'No issues'
  } else {
    badge.style.display = ''
    const parts = []
    if (errors)   parts.push(`${errors}E`)
    if (warnings) parts.push(`${warnings}W`)
    if (infos)    parts.push(`${infos}I`)
    badge.textContent   = parts.join(' · ')
    summary.textContent = `${issues.length} issue${issues.length > 1 ? 's' : ''}`
  }

  if (issues.length === 0) {
    container.innerHTML = `
      <div style="padding:8px 14px;font-family:monospace;font-size:11px;color:#6BAF92;">
        ✓ All rules passed
      </div>`
    return
  }

  const severityColors = {
    error:   { dot: '#B84040', bg: '#FBF3F3', text: '#7A2020' },
    warning: { dot: '#C47A2B', bg: '#FBF6F0', text: '#6A4010' },
    info:    { dot: '#2E6DA4', bg: '#EEF4FB', text: '#1A3A5A' }
  }

  container.innerHTML = issues.map(issue => {
    const c = severityColors[issue.severity] || severityColors.info
    const name = issue.element.businessObject?.name
      ? ` — ${issue.element.businessObject.name}`
      : ''
    return `
      <div class="lint-row" data-element-id="${issue.element.id}"
        style="display:flex;align-items:flex-start;gap:8px;padding:3px 12px;
          cursor:pointer;border-bottom:1px solid #EDF0F5;"
        onmouseover="this.style.background='${c.bg}'"
        onmouseout="this.style.background=''">
        <span style="width:6px;height:6px;border-radius:50%;background:${c.dot};
          flex-shrink:0;margin-top:4px;"></span>
        <div style="min-width:0;">
          <span style="font-family:monospace;font-size:10px;color:#8A9BB0;">
            ${issue.rule}
          </span>
          <span style="font-family:monospace;font-size:10px;font-weight:600;
            color:${c.text};margin-left:6px;">
            ${issue.element.id}${name}
          </span>
          <div style="font-size:11px;color:#4A6580;line-height:1.35;">
            ${issue.message}
          </div>
        </div>
      </div>`
  }).join('')

  // Click on a lint row → select element in canvas
  container.querySelectorAll('.lint-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.dataset.elementId
      const el = modeler.get('elementRegistry').get(id)
      if (el) {
        modeler.get('selection').select(el)
        modeler.get('canvas').scrollToElement(el)
      }
    })
  })
}

// ════════════════════════════════════════════════════════════════════════════
// 6. COC CONTEXT POPUP
// ════════════════════════════════════════════════════════════════════════════
function buildCocOptions() {
  return cocRegistry.cocs.map(c =>
    `<option value="${c.id}">${c.name}</option>`
  ).join('')
}

function openContextPopup() {
  // Read current context from definitions
  const ctx = readRepositoryContext()

  w2popup.open({
    title   : '⚙ CoC Context — Repository Settings',
    width   : 560,
    height  : 420,
    body    : `
      <div style="padding:16px;font-family:'DM Sans',sans-serif;font-size:13px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">

          <div>
            <label style="display:block;font-size:11px;font-weight:600;
              color:#4A6580;margin-bottom:4px;text-transform:uppercase;
              letter-spacing:.06em;">Centre of Competence</label>
            <select id="ctx-coc" style="width:100%;padding:6px 8px;border:1px solid #D4DCE6;
              border-radius:4px;font-size:13px;background:#fff;">
              <option value="">— select CoC —</option>
              ${buildCocOptions()}
            </select>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:600;
              color:#4A6580;margin-bottom:4px;text-transform:uppercase;
              letter-spacing:.06em;">Maturity Level</label>
            <select id="ctx-maturity" style="width:100%;padding:6px 8px;border:1px solid #D4DCE6;
              border-radius:4px;font-size:13px;background:#fff;">
              <option value="L1">L1 — Drawing (informal)</option>
              <option value="L2">L2 — Modelling (structured)</option>
              <option value="L3">L3 — Executable (workflow-ready)</option>
              <option value="L4">L4 — Simulation (analytical)</option>
            </select>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:600;
              color:#4A6580;margin-bottom:4px;text-transform:uppercase;
              letter-spacing:.06em;">Organisation</label>
            <input id="ctx-org" type="text" placeholder="Airbus D&S"
              style="width:100%;padding:6px 8px;border:1px solid #D4DCE6;
              border-radius:4px;font-size:13px;box-sizing:border-box;"
              value="${ctx.organization || ''}"/>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:600;
              color:#4A6580;margin-bottom:4px;text-transform:uppercase;
              letter-spacing:.06em;">Target Platform</label>
            <select id="ctx-platform" style="width:100%;padding:6px 8px;border:1px solid #D4DCE6;
              border-radius:4px;font-size:13px;background:#fff;">
              <option value="Standalone">Standalone / BPMN.io</option>
              <option value="ARIS">ARIS (BMS)</option>
              <option value="EA">Enterprise Architect (CoC)</option>
              <option value="Camunda">Camunda / Zeebe (executable)</option>
            </select>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:600;
              color:#4A6580;margin-bottom:4px;text-transform:uppercase;
              letter-spacing:.06em;">Reference Standard</label>
            <input id="ctx-std" type="text" placeholder="DO-178C / ECSS-Q-ST-80 / ISO 9001"
              style="width:100%;padding:6px 8px;border:1px solid #D4DCE6;
              border-radius:4px;font-size:13px;box-sizing:border-box;"
              value="${ctx.stdRef || ''}"/>
          </div>

          <div>
            <label style="display:block;font-size:11px;font-weight:600;
              color:#4A6580;margin-bottom:4px;text-transform:uppercase;
              letter-spacing:.06em;">Programme / Contract</label>
            <input id="ctx-program" type="text" placeholder="ESA-2024-XXX / Internal"
              style="width:100%;padding:6px 8px;border:1px solid #D4DCE6;
              border-radius:4px;font-size:13px;box-sizing:border-box;"
              value="${ctx.programContext || ''}"/>
          </div>

        </div>
        <div style="margin-top:12px;padding:8px 12px;background:#EEF4FB;
          border-left:3px solid #2E6DA4;border-radius:0 4px 4px 0;
          font-size:11px;color:#4A6580;line-height:1.4;">
          This context is serialised into the BPMN file as
          <code style="font-family:monospace;background:#D8E8F4;padding:1px 4px;
            border-radius:2px;">semarch:RepositoryContext</code>
          — it travels with the model and is transparent to ARIS and EA.
        </div>
      </div>`,
    buttons : `
      <button class="w2ui-btn" onclick="w2popup.close()">Cancel</button>
      <button class="w2ui-btn w2ui-btn-blue" id="btn-save-context">Save Context</button>`,
    onOpen  : () => {
      // Pre-select values from current context
      const matSel = document.getElementById('ctx-maturity')
      const platSel = document.getElementById('ctx-platform')
      const cocSel  = document.getElementById('ctx-coc')
      if (matSel  && ctx.maturity)       matSel.value  = ctx.maturity
      if (platSel && ctx.targetPlatform) platSel.value = ctx.targetPlatform
      if (cocSel  && ctx.cocOwner)       cocSel.value  = ctx.cocOwner

      // Auto-fill from CoC registry when CoC is selected
      cocSel?.addEventListener('change', () => {
        const coc = cocRegistry.cocs.find(c => c.id === cocSel.value)
        if (!coc) return
        document.getElementById('ctx-org').value     = coc.organization || ''
        document.getElementById('ctx-std').value     = coc.stdRef       || ''
        document.getElementById('ctx-platform').value= coc.targetPlatform || 'Standalone'
        document.getElementById('ctx-maturity').value= coc.maturity     || 'L1'
      })

      document.getElementById('btn-save-context')?.addEventListener('click', () => {
        saveRepositoryContext({
          cocOwner       : document.getElementById('ctx-coc').value,
          organization   : document.getElementById('ctx-org').value,
          maturity       : document.getElementById('ctx-maturity').value,
          stdRef         : document.getElementById('ctx-std').value,
          targetPlatform : document.getElementById('ctx-platform').value,
          programContext : document.getElementById('ctx-program').value,
          repositoryVersion: ctx.repositoryVersion || '1.0',
          lastReview     : new Date().toISOString().split('T')[0]
        })
        w2popup.close()
      })
    }
  })
}

// ── Read semarch:RepositoryContext from definitions extensionElements ─────
function readRepositoryContext() {
  try {
    const defs = modeler.getDefinitions()
    const ext  = defs?.extensionElements
    const ctx  = ext?.values?.find(v => v.$type === 'semarch:RepositoryContext')
    return ctx || {}
  } catch {
    return {}
  }
}

// ── Write semarch:RepositoryContext back to definitions ───────────────────
function saveRepositoryContext(values) {
  try {
    const moddle  = modeler.get('moddle')
    const modeling = modeler.get('modeling')
    const defs    = modeler.getDefinitions()

    // Ensure extensionElements exists
    if (!defs.extensionElements) {
      defs.extensionElements = moddle.create('bpmn:ExtensionElements', { values: [] })
    }

    // Remove existing RepositoryContext if any
    defs.extensionElements.values = (defs.extensionElements.values || [])
      .filter(v => v.$type !== 'semarch:RepositoryContext')

    // Create new one
    const ctx = moddle.create('semarch:RepositoryContext', values)
    defs.extensionElements.values.push(ctx)

    // Adjust linter profile to match maturity
    linter.setProfile(values.maturity || 'L2')
    linter.run()
  } catch (err) {
    console.error('saveRepositoryContext error:', err)
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 7. PALETTE EXTRACTION → left panel
// ════════════════════════════════════════════════════════════════════════════
function extractPalette() {
  const el = document.querySelector('#bpmn-canvas .djs-palette')
  if (!el) return
  const left = layout.el('left')
  left.innerHTML = ''
  left.appendChild(el)
  Object.assign(el.style, {
    position: 'relative', left: '0', top: '0',
    width: '100%', height: '100%',
    border: 'none', borderRadius: '0',
    boxShadow: 'none', background: 'transparent',
  })
}

// ════════════════════════════════════════════════════════════════════════════
// 8. DIAGRAM LOAD / SAVE
// ════════════════════════════════════════════════════════════════════════════
async function loadDiagram(xml) {
  try {
    await modeler.importXML(xml)
    modeler.get('canvas').zoom('fit-viewport')
    extractPalette()
    // Read maturity from context and update linter profile
    const ctx = readRepositoryContext()
    if (ctx.maturity) linter.setProfile(ctx.maturity)
  } catch (err) {
    alert('Import failed: ' + err.message)
  }
}

function download(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const a    = document.createElement('a')
  a.href     = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

// ════════════════════════════════════════════════════════════════════════════
// 9. EVENT LISTENERS
// ════════════════════════════════════════════════════════════════════════════
document.getElementById('btn-new').addEventListener('click', () => {
  if (confirm('Create a new diagram? Unsaved changes will be lost.')) {
    loadDiagram(EMPTY_DIAGRAM)
  }
})

const fileInput = document.getElementById('file-input')
document.getElementById('btn-import').addEventListener('click', () => {
  fileInput.value = ''
  fileInput.click()
})
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = e => loadDiagram(e.target.result)
  reader.readAsText(file)
})

document.getElementById('btn-export-xml').addEventListener('click', async () => {
  try {
    const { xml } = await modeler.saveXML({ format: true })
    download(xml, 'diagram.bpmn', 'application/xml')
  } catch (err) {
    alert('XML export failed: ' + err.message)
  }
})

document.getElementById('btn-export-svg').addEventListener('click', async () => {
  try {
    const { svg } = await modeler.saveSVG()
    download(svg, 'diagram.svg', 'image/svg+xml')
  } catch (err) {
    alert('SVG export failed: ' + err.message)
  }
})

document.getElementById('btn-fit').addEventListener('click', () => {
  modeler.get('canvas').zoom('fit-viewport')
})

document.getElementById('btn-context').addEventListener('click', openContextPopup)

document.getElementById('btn-lint').addEventListener('click', () => {
  linter.run()
})

// ════════════════════════════════════════════════════════════════════════════
// 10. INITIAL LOAD
// ════════════════════════════════════════════════════════════════════════════
loadDiagram(EMPTY_DIAGRAM)

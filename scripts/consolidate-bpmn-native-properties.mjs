import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const evidenceDir = path.join(root, 'test/evidence/bpmn-native-properties')
const readTsv = file => {
  const lines = fs.readFileSync(path.join(evidenceDir, file), 'utf8').trimEnd().split(/\r?\n/)
  const columns = lines.shift().split('\t')
  return lines.filter(Boolean).map(line => Object.fromEntries(columns.map((column, i) => [column, line.split('\t')[i] ?? ''])))
}
const staticRows = readTsv('bpmn-native-properties-static-evidence.tsv')
const runtimeRows = readTsv('bpmn-native-properties-runtime-evidence.tsv')
// Source evidence follows the registered provider, not an obsolete standalone module.
const standardModulePath = 'src/bpmn/bpmn-standard-properties-module.js'
const standardModule = fs.readFileSync(path.join(root, standardModulePath), 'utf8')
const modeler = fs.readFileSync(path.join(root, 'src/bpmn/create-modeler.js'), 'utf8')
const conditionImplementationPresent = standardModule.includes("type: 'bpmn:SequenceFlow'") &&
  standardModule.includes("property: 'conditionExpression'") &&
  standardModule.includes('updateModdleProperties') &&
  standardModule.includes('updateProperties') &&
  modeler.includes("import bpmnStandardPropertiesModule from './bpmn-standard-properties-module.js'") &&
  modeler.includes('      bpmnStandardPropertiesModule,')
const conditionKey = 'bpmn:SequenceFlow::conditionExpression'
const keys = new Set()
const columns = ['standard','owner','property','propertyType','shape','isMany','isReference','serialization','bpmnJsReferenced','officialPanelStaticEvidence','officialPanelSupport','bpmnsmImplementationEvidence','bpmnsmPanelEvidence','readable','editable','xmlRoundtrip','diagramRendering','coverageStatus','evidenceDetail']
const out = staticRows.map(row => {
  const key = `${row.owner}::${row.property}`
  if (keys.has(key)) throw new Error(`Duplicate owner/property: ${key}`)
  keys.add(key)
  const condition = key === conditionKey && conditionImplementationPresent
  const runtime = runtimeRows.some(e => e.evidence === 'RUNTIME_ENTRY_EXPOSED' && e.contextType === row.owner && e.entryId === row.property)
  return {
    standard: row.standard, owner: row.owner, property: row.property, propertyType: row.propertyType,
    shape: row.shape, isMany: row.isMany, isReference: row.isReference, serialization: row.serialization,
    bpmnJsReferenced: row.bpmnJsReferenced, officialPanelStaticEvidence: row.officialPanelStaticEvidence,
    officialPanelSupport: row.officialPanelSupport,
    bpmnsmImplementationEvidence: condition ? 'SOURCE_VERIFIED_15R' : 'NOT_ASSESSED',
    bpmnsmPanelEvidence: condition ? 'ENTRY_SOURCE_VERIFIED' : runtime ? 'RUNTIME_ENTRY_ID_MATCH_ONLY' : 'NOT_ASSESSED',
    readable: condition ? 'SOURCE_VERIFIED' : 'UNDETERMINED',
    editable: condition ? 'SOURCE_VERIFIED' : 'UNDETERMINED',
    xmlRoundtrip: 'NOT_TESTED_IN_THIS_GATE', diagramRendering: 'NOT_TESTED_IN_THIS_GATE',
    coverageStatus: condition ? 'PARTIAL_SOURCE_EVIDENCE' : 'UNDETERMINED',
    evidenceDetail: condition ? standardModulePath : row.evidenceDetail
  }
})
if (!keys.has(conditionKey)) throw new Error(`Missing required BPMN descriptor property: ${conditionKey}`)
const output = path.join(evidenceDir, 'bpmn-native-properties-consolidated.tsv')
const clean = v => String(v ?? '').replaceAll('\t', ' ').replaceAll('\n', ' ')
fs.writeFileSync(output, [columns.join('\t'), ...out.map(row => columns.map(col => clean(row[col])).join('\t'))].join('\n') + '\n')
console.log(JSON.stringify({ rows: out.length, uniqueKeys: keys.size, conditionImplementationPresent, runtimeEntryEvidenceRows: runtimeRows.length, output: path.relative(root, output) }, null, 2))

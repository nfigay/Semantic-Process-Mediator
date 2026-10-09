import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
test('consolidated evidence preserves baseline and marks only source-verified 15R', () => {
  const result = JSON.parse(execFileSync(process.execPath, ['scripts/consolidate-bpmn-native-properties.mjs'], { cwd: root, encoding: 'utf8' }))
  const baseline = fs.readFileSync(path.join(root, 'test/evidence/bpmn-native-properties/bpmn-native-properties-static-evidence.tsv'), 'utf8').trimEnd().split('\n')
  const consolidated = fs.readFileSync(path.join(root, result.output), 'utf8').trimEnd().split('\n')
  assert.equal(result.rows, baseline.length - 1)
  assert.equal(result.uniqueKeys, result.rows)
  const header = consolidated[0].split('\t')
  const rows = consolidated.slice(1).map(line => Object.fromEntries(header.map((col, i) => [col, line.split('\t')[i]])))
  const condition = rows.find(r => r.owner === 'bpmn:SequenceFlow' && r.property === 'conditionExpression')
  assert.ok(condition)
  assert.equal(condition.coverageStatus, 'PARTIAL_SOURCE_EVIDENCE')
  assert.equal(condition.xmlRoundtrip, 'NOT_TESTED_IN_THIS_GATE')
  assert.equal(condition.officialPanelSupport, 'UNDETERMINED')
  assert.equal(rows.filter(r => r.coverageStatus === 'PARTIAL_SOURCE_EVIDENCE').length, 1)
})

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const bpmn = fs.readFileSync(path.join(root, 'fixtures/expected/converted-source-di-15i.bpmn'), 'utf8');
function count(tag) {
  const re = new RegExp('<(?:[A-Za-z_][\\w.-]*:)?' + tag + '(?=[\\s/>])', 'g');
  return [...bpmn.matchAll(re)].length;
}
test('EA-XSLT-15L reference BPMN contains the validated structural baseline', () => {
  assert.equal(count('process'), 10);
  assert.equal(count('collaboration'), 3);
  assert.equal(count('BPMNDiagram'), 6);
});
test('EA-XSLT-15L source XMI is retained', () => {
  assert.ok(fs.statSync(path.join(root, 'fixtures/input/All Models BPMN20.XMI251.xml')).size > 0);
});

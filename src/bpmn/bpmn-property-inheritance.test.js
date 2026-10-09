import { test } from 'vitest'
import assert from 'node:assert/strict'
import { inheritedPropertyLabel, effectivePropertyOrigins } from './bpmn-property-inheritance.js'

const moddle = {
  getType(type) {
    assert.equal(type, 'bpmn:Task')
    const properties = [
      { name: 'id', type: 'String', definedBy: { name: 'BaseElement' } },
      { name: 'name', type: 'String', definedBy: { name: 'FlowElement' } },
      { name: 'local', type: 'String', definedBy: { name: 'Task' } }
    ]
    return { $descriptor: {
      properties,
      propertiesByName: Object.fromEntries(properties.map(p => [p.name, p]))
    } }
  }
}

test('resolves all inherited properties without per-attribute mappings', () => {
  assert.equal(inheritedPropertyLabel(moddle, 'bpmn:Task', 'name'), '(FlowElement · inherited)')
  assert.equal(inheritedPropertyLabel(moddle, 'bpmn:Task', 'id'), '(BaseElement · inherited)')
  assert.equal(inheritedPropertyLabel(moddle, 'bpmn:Task', 'local'), null)
  assert.equal(effectivePropertyOrigins(moddle, 'bpmn:Task').length, 3)
})

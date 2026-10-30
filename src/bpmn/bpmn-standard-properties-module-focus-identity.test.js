import { describe, it, expect, vi } from 'vitest'

// Isolate the wrapper identity contract. The provider itself is not under test;
// loading its native dependencies in Node reaches bpmn-js ESM-only internals.
vi.mock('preact', () => ({ h: () => null }))
vi.mock('./bpmn-io-structure-panel.js', () => ({ appendIoStructureGroup: groups => groups }))
vi.mock('./bpmn-native-inheritance.js', () => ({ decorateNativeEntries: groups => groups }))
vi.mock('@bpmn-io/properties-panel', () => ({
  TextFieldEntry: () => null, CheckboxEntry: () => null, SelectEntry: () => null,
  isTextFieldEntryEdited: () => false, isCheckboxEntryEdited: () => false,
  isSelectEntryEdited: () => false
}))
vi.mock('bpmn-js-properties-panel', () => ({ useService: () => null }))
vi.mock('./bpmn-property-inheritance.js', () => ({ inheritedPropertyLabel: () => '' }))
vi.mock('./bpmn-standard-scalar.js', () => ({
  collectScalarProperties: () => [], scalarValueToModdle: () => null
}))
vi.mock('./bpmn-standard-coverage.js', () => ({ propertyCoverage: () => [] }))

import { withOrigin } from './bpmn-standard-properties-module.js'

describe('native properties editor component identity', () => {
  it('preserves native Name wrapper identity across repeated provider getGroups calls', () => {
    function NativeNameEntry() { return null }
    const first = withOrigin(NativeNameEntry, 'BPMN')
    expect(withOrigin(NativeNameEntry, 'BPMN')).toBe(first)
    expect(withOrigin(NativeNameEntry, 'Another origin')).not.toBe(first)
    expect(withOrigin(() => null, 'BPMN')).not.toBe(first)
  })
})

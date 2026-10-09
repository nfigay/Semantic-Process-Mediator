import { describe, it, expect } from 'vitest'
import { BpmnModdle } from 'bpmn-moddle'
import { nativeEntryProperty, decorateNativeEntries } from './bpmn-native-inheritance.js'
import { inheritedPropertyLabel, effectivePropertyOrigins } from './bpmn-property-inheritance.js'

describe('PROP-006 native inheritance', () => {
  it('maps only explicit native IDs or declared semantic properties', () => {
    expect(nativeEntryProperty({ id: 'general-name' })).toBe('name')
    expect(nativeEntryProperty({ id: 'arbitrary-name' })).toBeNull()
    expect(nativeEntryProperty({ id: 'custom', semanticProperty: 'isForCompensation' })).toBe('isForCompensation')
  })
  it('preserves original native editor and decorates inherited properties only', () => {
    const moddle = new BpmnModdle()
    const component = () => null
    const original = [{ id: 'general', entries: [
      { id: 'general-name', component },
      { id: 'arbitrary-name', component },
      { id: 'general-id', component }
    ] }]
    const wrapped = decorateNativeEntries(original, moddle, 'bpmn:Task', inheritedPropertyLabel,
      (fn, origin) => Object.assign(() => fn(), { origin, original: fn }))
    expect(wrapped[0].entries[0].component.original).toBe(component)
    expect(wrapped[0].entries[0].inheritedLabel).toContain('inherited')
    expect(wrapped[0].entries[1]).toBe(original[0].entries[1])
    expect(wrapped[0].entries[2].component.original).toBe(component)
    expect(original[0].entries[0].component).toBe(component)
  })
  it('does not modify own properties or unknown components', () => {
    const moddle = new BpmnModdle()
    const type = 'bpmn:Process'
    const descriptor = moddle.getType(type).$descriptor
    const own = descriptor.properties.find(
      property => property.definedBy?.name === 'bpmn:Process'
    )

    expect(own).toBeDefined()
    expect(inheritedPropertyLabel(moddle, type, own.name)).toBeNull()

    const component = () => null
    const entries = [
      { id: 'own-property', semanticProperty: own.name, component },
      { id: 'unknown-entry', component }
    ]
    const groups = [{ id: 'general', entries }]

    const result = decorateNativeEntries(
      groups, moddle, type, inheritedPropertyLabel,
      () => { throw Error('unexpected decoration') }
    )

    expect(result[0]).toBe(groups[0])
    expect(result[0].entries[0]).toBe(entries[0])
    expect(result[0].entries[1]).toBe(entries[1])
  })
})

describe('PROP-006 qualified owner regression', () => {
  it('distinguishes own properties from inherited properties', () => {
    const moddle = new BpmnModdle()
    const type = 'bpmn:Process'

    expect(inheritedPropertyLabel(moddle, type, 'processType')).toBeNull()
    expect(inheritedPropertyLabel(moddle, type, 'id')).toContain('inherited')

    const origins = effectivePropertyOrigins(moddle, type)
    expect(origins.find(p => p.name === 'processType')?.inherited).toBe(false)
    expect(origins.find(p => p.name === 'id')?.inherited).toBe(true)
  })
})

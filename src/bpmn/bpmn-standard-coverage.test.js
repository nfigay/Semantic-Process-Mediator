import { describe, it, expect } from 'vitest'
import { nativePropertyIndex, enumOptions, propertyCoverage } from './bpmn-standard-coverage.js'

describe('BPMN standard property coverage', () => {
  const moddle = { getType: type => ({ $descriptor: type === 'State' ? { literals: [{ name: 'ready' }, { name: 'done' }] } : {} }) }
  it('indexes explicit semantic properties without guessing suffixes', () => {
    const groups = [{ entries: [{ id: 'custom-conditionExpression', semanticProperty: 'conditionExpression' }, { id: 'custom-foo' }, { id: 'general-name' }] }]
    expect([...nativePropertyIndex(groups)].sort()).toEqual(['conditionExpression', 'name'])
  })
  it('reads enumeration literals', () => expect(enumOptions(moddle, 'State')).toEqual(['ready', 'done']))
  it('classifies a family without duplicating native entries', () => {
    const collect = () => [
      { property: { name: 'name', type: 'String' }, kind: 'String' },
      { property: { name: 'state', type: 'State' }, kind: 'Enum' },
      { property: { name: 'unknown', type: 'Missing' }, kind: 'Enum' }
    ]
    expect(propertyCoverage(moddle, 'Task', [{ entries: [{ id: 'general-name' }] }], collect).map(x => x.status))
      .toEqual(['NATIVE', 'GENERATED', 'UNSUPPORTED_ENUM'])
  })
})

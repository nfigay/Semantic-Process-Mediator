/** PROP-007B: conservative BPMN InputOutputSpecification mutations. */
export const IO_HOST_TYPES = new Set([
  'bpmn:Process', 'bpmn:SubProcess', 'bpmn:Task', 'bpmn:UserTask',
  'bpmn:ServiceTask', 'bpmn:ScriptTask', 'bpmn:BusinessRuleTask',
  'bpmn:SendTask', 'bpmn:ReceiveTask', 'bpmn:ManualTask',
  'bpmn:CallActivity', 'bpmn:Transaction', 'bpmn:AdHocSubProcess'
])

export function supportsIoSpecification(moddle, type) {
  if (!IO_HOST_TYPES.has(type)) return false
  return Boolean(moddle?.getType(type)?.$descriptor?.propertiesByName?.ioSpecification)
}

export function uniqueBpmnId(prefix, elementRegistry) {
  let id
  do {
    id = `${prefix}_${Math.random().toString(36).slice(2, 11)}`
  } while (elementRegistry?.get?.(id))
  return id
}

export function ensureIoSpecification(element, modeling, factory, elementRegistry) {
  const bo = element.businessObject
  if (bo.ioSpecification) return bo.ioSpecification
  const io = factory.create('bpmn:InputOutputSpecification', {
    id: uniqueBpmnId('InputOutputSpecification', elementRegistry),
    dataInputs: [], dataOutputs: [], inputSets: [], outputSets: []
  })
  modeling.updateProperties(element, { ioSpecification: io })
  return io
}

export function addIoItem(element, kind, modeling, factory, elementRegistry) {
  if (kind !== 'input' && kind !== 'output') throw new Error('Invalid IO kind')
  const io = ensureIoSpecification(element, modeling, factory, elementRegistry)
  const input = kind === 'input'
  const property = input ? 'dataInputs' : 'dataOutputs'
  const setProperty = input ? 'inputSets' : 'outputSets'
  const refProperty = input ? 'dataInputRefs' : 'dataOutputRefs'
  const itemType = input ? 'bpmn:DataInput' : 'bpmn:DataOutput'
  const setType = input ? 'bpmn:InputSet' : 'bpmn:OutputSet'
  const item = factory.create(itemType, {
    id: uniqueBpmnId(input ? 'DataInput' : 'DataOutput', elementRegistry),
    name: input ? 'Input' : 'Output'
  })
  const existingSets = io.get(setProperty) || []
  const set = existingSets[0] || factory.create(setType, {
    id: uniqueBpmnId(input ? 'InputSet' : 'OutputSet', elementRegistry)
  })
  modeling.updateModdleProperties(element, io, {
    [property]: [...(io.get(property) || []), item],
    [setProperty]: existingSets.length ? existingSets : [set]
  })
  modeling.updateModdleProperties(element, set, {
    [refProperty]: [...(set.get(refProperty) || []), item]
  })
  return item
}

export function renameIoItem(element, item, name, modeling) {
  modeling.updateModdleProperties(element, item, { name })
}

export function ioItemIsReferenced(element, kind, item) {
  const bo = element.businessObject
  const associations = kind === 'input' ? (bo.dataInputAssociations || []) : (bo.dataOutputAssociations || [])
  return associations.some(association =>
    association.targetRef === item || (association.sourceRef || []).includes(item)
  )
}

export function removeIoItem(element, kind, item, modeling) {
  if (kind !== 'input' && kind !== 'output') throw new Error('Invalid IO kind')
  if (ioItemIsReferenced(element, kind, item)) {
    throw new Error('Cannot remove an input/output referenced by a data association')
  }
  const io = element.businessObject.ioSpecification
  if (!io) return
  const input = kind === 'input'
  const property = input ? 'dataInputs' : 'dataOutputs'
  const setProperty = input ? 'inputSets' : 'outputSets'
  const refProperty = input ? 'dataInputRefs' : 'dataOutputRefs'
  for (const set of io.get(setProperty) || []) {
    const refs = set.get(refProperty) || []
    if (refs.includes(item)) {
      modeling.updateModdleProperties(element, set, { [refProperty]: refs.filter(ref => ref !== item) })
    }
  }
  modeling.updateModdleProperties(element, io, {
    [property]: (io.get(property) || []).filter(candidate => candidate !== item)
  })
}

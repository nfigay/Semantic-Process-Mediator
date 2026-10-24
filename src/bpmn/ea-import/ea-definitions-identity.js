import { DOMParser, XMLSerializer } from '@xmldom/xmldom'

const BPMN_NS = 'http://www.omg.org/spec/BPMN/20100524/MODEL'

// Canonicalise only the converter's definitions identity. Business element IDs
// remain unchanged and are still checked by findBpmnIdentityConflict.
export function canonicalizeEaDefinitionsIdentity(xml) {
  if (typeof xml !== 'string' || !xml.trim()) throw new Error('Missing converted EA BPMN')
  const errors = []
  const doc = new DOMParser({
    onError: (level, message) => { if (level !== 'warning') errors.push(message) }
  }).parseFromString(xml, 'application/xml')
  const root = doc?.documentElement
  if (errors.length || root?.localName !== 'definitions' || root.namespaceURI !== BPMN_NS) {
    throw new Error('Invalid converted EA BPMN definitions')
  }
  const getModelId = name => {
    const elements = root.getElementsByTagNameNS(BPMN_NS, name)
    for (let i = 0; i < elements.length; i++) {
      const id = elements.item(i).getAttribute('id')
      if (id) return id
    }
    return null
  }
  const modelId = getModelId('collaboration') || getModelId('process')
  if (!modelId || !/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(modelId)) {
    throw new Error('EA model has no valid collaboration or process identity')
  }
  const existingId = root.getAttribute('id')
  if (!existingId) throw new Error('EA definitions identity missing')
  const desiredId = `Definitions_EA_${modelId}`
  if (existingId === desiredId) return xml
  // A definitions ID normally has no internal references. Refuse unexpected
  // references instead of rewriting an unknown relationship.
  const walk = element => {
    if (element.nodeType !== 1) return
    if (element !== root && element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        if (element.attributes.item(i).value === existingId) {
          throw new Error('EA definitions ID has an internal reference; cannot canonicalize safely')
        }
      }
    }
    for (let child = element.firstChild; child; child = child.nextSibling) walk(child)
  }
  walk(root)
  root.setAttribute('id', desiredId)
  return new XMLSerializer().serializeToString(doc)
}

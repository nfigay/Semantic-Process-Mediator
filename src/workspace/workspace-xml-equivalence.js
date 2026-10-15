import { DOMParser } from '@xmldom/xmldom'

// Fail closed: only XML representation differences (indentation, namespace
// prefixes, attribute order) are ignored. Model/DI nodes retain their order.
export function equivalentWorkspaceBpmnXml(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false
  if (left === right) return true
  // DTD/entity expansion and instructions other than XML declarations are not
  // part of the verified BPMN serialization contract.
  if (/<!DOCTYPE|<!ENTITY|<\?(?!xml\s)/i.test(left) || /<!DOCTYPE|<!ENTITY|<\?(?!xml\s)/i.test(right)) return false

  function parse(xml) {
    const errors = []
    const doc = new DOMParser({
      onError: (level, message) => errors.push({ level, message })
    }).parseFromString(xml, 'application/xml')
    if (errors.length || !doc?.documentElement || doc.doctype) return null
    if (doc.documentElement.localName !== 'definitions' ||
        doc.documentElement.namespaceURI !== 'http://www.omg.org/spec/BPMN/20100524/MODEL') return null
    return doc.documentElement
  }

  function attributes(node) {
    const attrs = []
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes.item(i)
      if (attr.namespaceURI === 'http://www.w3.org/2000/xmlns/') continue
      attrs.push([attr.namespaceURI || '', attr.localName, attr.value])
    }
    return attrs.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  }

  function relevantChildren(node) {
    const children = []
    for (let c = node.firstChild; c; c = c.nextSibling) {
      if (c.nodeType === 8) continue // XML comments
      if (c.nodeType === 3 || c.nodeType === 4) {
        if (!c.nodeValue.trim()) continue // indentation between elements
        children.push({ text: c.nodeValue, type: 'text' })
      } else if (c.nodeType === 1) {
        children.push({ node: c, type: 'element' })
      } else {
        return null // refuse unsupported nodes
      }
    }
    return children
  }

  function same(a, b) {
    if (a.namespaceURI !== b.namespaceURI || a.localName !== b.localName) return false
    if (JSON.stringify(attributes(a)) !== JSON.stringify(attributes(b))) return false
    const ac = relevantChildren(a), bc = relevantChildren(b)
    if (!ac || !bc || ac.length !== bc.length) return false
    return ac.every((child, i) => {
      const other = bc[i]
      return child.type === other.type && (child.type === 'text'
        ? child.text === other.text
        : same(child.node, other.node))
    })
  }

  try {
    const a = parse(left), b = parse(right)
    return !!a && !!b && same(a, b)
  } catch {
    return false
  }
}

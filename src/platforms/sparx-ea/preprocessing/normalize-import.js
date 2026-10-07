import { DOMParser, XMLSerializer } from '@xmldom/xmldom'
import { analyzeSparxEaImport } from './analyze-import.js'

const BPMN_NS = 'http://www.omg.org/spec/BPMN/20100524/MODEL'
const BPMNDI_NS = 'http://www.omg.org/spec/BPMN/20100524/DI'
const DI_NS = 'http://www.omg.org/spec/DD/20100524/DI'
const BIOC_NS = 'http://bpmn.io/schema/bpmn/biocolor/1.0'

function elements(document) {
  return Array.from(document.getElementsByTagName('*'))
}

function parseBpmn(xml) {
  return new DOMParser().parseFromString(xml, 'application/xml')
}

function eaColorToHex(value) {
  if (!Number.isInteger(value) || value < 0) return null

  const red = value & 0xff
  const green = (value >> 8) & 0xff
  const blue = (value >> 16) & 0xff

  return '#' + [red, green, blue]
    .map(component => component.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

export function normalizeSparxEaImport({ bpmnXml, xmiXml, nativeNotePolicy = {} }) {
  if (typeof bpmnXml !== 'string' || !bpmnXml.trim()) {
    throw new Error('A non-empty BPMN XML document is required.')
  }
  if (typeof xmiXml !== 'string' || !xmiXml.trim()) {
    throw new Error('A non-empty supporting EA XMI document is required for normalization.')
  }

  const analysis = analyzeSparxEaImport({ bpmnXml, xmiXml })
  const document = parseBpmn(bpmnXml)
  const all = elements(document)
  const repairs = []

  for (const style of analysis.xmi.diagramStyles) {
    const fill = eaColorToHex(style.fillColor)
    const stroke = eaColorToHex(
      style.strokeColor ?? style.lineColor
    )

    if (!fill && !stroke) continue

    const diElement = all.find(element =>
      element.namespaceURI === BPMNDI_NS
      && ['BPMNShape', 'BPMNEdge'].includes(element.localName)
      && element.getAttribute('bpmnElement') === style.subject
    )

    if (!diElement) continue

    if (fill) {
      diElement.setAttributeNS(BIOC_NS, 'bioc:fill', fill)
    }

    if (stroke) {
      diElement.setAttributeNS(BIOC_NS, 'bioc:stroke', stroke)
    }

    repairs.push({
      type: 'restore-ea-diagram-color',
      id: style.subject,
      kind: diElement.localName,
      ...(fill ? { fill } : {}),
      ...(stroke ? { stroke } : {}),
      source: 'supporting-xmi'
    })
  }

  for (const issue of analysis.bpmn.unresolvedAssociationReferences) {
    if (issue.role !== 'sourceRef' || !issue.ref) continue

    const note = analysis.xmi.notes.find(candidate =>
      candidate.id === issue.ref && candidate.sourceKind === 'bpmn-text-annotation'
    )
    if (!note) continue

    const association = all.find(element =>
      element.namespaceURI === BPMN_NS
      && element.localName === 'association'
      && element.getAttribute('id') === issue.associationId
    )
    if (!association?.parentNode) continue

    const textAnnotation = document.createElementNS(BPMN_NS, 'bpmn:textAnnotation')
    textAnnotation.setAttribute('id', note.id)
    const text = document.createElementNS(BPMN_NS, 'bpmn:text')
    text.appendChild(document.createTextNode(note.text))
    textAnnotation.appendChild(text)
    association.parentNode.insertBefore(textAnnotation, association)

    repairs.push({
      type: 'restore-bpmn-text-annotation',
      id: note.id,
      associationId: issue.associationId,
      source: 'supporting-xmi'
    })
  }

  for (const note of analysis.xmi.notes.filter(candidate => candidate.sourceKind === 'uml-note')) {
    const decision = nativeNotePolicy[note.id]
    if (!decision) continue

    if (decision === 'exclude') {
      for (const element of elements(document)) {
        if (element.namespaceURI === 'http://www.omg.org/spec/BPMN/20100524/DI'
          && ['BPMNShape', 'BPMNEdge'].includes(element.localName)
          && element.getAttribute('bpmnElement') === note.id) {
          element.parentNode?.removeChild(element)
        }
      }
      repairs.push({ type: 'exclude-native-uml-note', id: note.id, source: 'publication-policy' })
      continue
    }

    if (decision !== 'convert') {
      throw new Error(`Unsupported native-note publication policy for ${note.id}: ${decision}`)
    }

    const process = elements(document).find(element =>
      element.namespaceURI === BPMN_NS && element.localName === 'process'
    )
    if (!process) throw new Error(`Cannot convert native UML Note ${note.id}: BPMN process not found.`)

    const textAnnotation = document.createElementNS(BPMN_NS, 'bpmn:textAnnotation')
    textAnnotation.setAttribute('id', note.id)
    const text = document.createElementNS(BPMN_NS, 'bpmn:text')
    text.appendChild(document.createTextNode(note.text || ''))
    textAnnotation.appendChild(text)
    process.appendChild(textAnnotation)

    for (const link of note.noteLinks) {
      const target = link.start === note.id ? link.end : link.start
      if (!target || !analysis.bpmn.semanticIds.includes(target)) continue
      const association = document.createElementNS(BPMN_NS, 'bpmn:association')
      association.setAttribute('id', link.id)
      association.setAttribute('sourceRef', note.id)
      association.setAttribute('targetRef', target)
      process.appendChild(association)

      const umlEdge = analysis.xmi.umlEdges.find(candidate =>
        candidate.modelElement === link.id
      )
      const plane = elements(document).find(element =>
        element.namespaceURI === BPMNDI_NS && element.localName === 'BPMNPlane'
      )

      if (umlEdge && plane && umlEdge.waypoints.length >= 2) {
        const bpmnEdge = document.createElementNS(BPMNDI_NS, 'bpmndi:BPMNEdge')
        bpmnEdge.setAttribute('id', umlEdge.id)
        bpmnEdge.setAttribute('bpmnElement', link.id)

        for (const point of umlEdge.waypoints) {
          const waypoint = document.createElementNS(DI_NS, 'di:waypoint')
          waypoint.setAttribute('x', point.x)
          waypoint.setAttribute('y', point.y)
          bpmnEdge.appendChild(waypoint)
        }

        plane.appendChild(bpmnEdge)
      }
    }

    repairs.push({
      type: 'convert-native-uml-note',
      id: note.id,
      associationIds: note.noteLinks.map(link => link.id),
      source: 'publication-policy'
    })
  }

  return {
    platform: 'sparx-ea',
    bpmnXml: new XMLSerializer().serializeToString(document),
    repairs
  }
}

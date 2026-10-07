import { DOMParser } from '@xmldom/xmldom'

const BPMN_NS = 'http://www.omg.org/spec/BPMN/20100524/MODEL'
const BPMNDI_NS = 'http://www.omg.org/spec/BPMN/20100524/DI'
const XMI_NS = 'http://www.omg.org/spec/XMI/20131001'

function elements(document) {
  return Array.from(document.getElementsByTagName('*'))
}

function parseXml(xml, label) {
  const errors = []
  const document = new DOMParser({
    onError(level, message) {
      if (level === 'error' || level === 'fatalError') errors.push(message)
    }
  }).parseFromString(xml, 'application/xml')

  if (!document?.documentElement || errors.length) {
    throw new Error(`Invalid ${label} XML: ${errors.join('; ') || 'no document element'}`)
  }

  return document
}

function xmiAttribute(element, localName) {
  return element.getAttributeNS?.(XMI_NS, localName)
    || element.getAttribute(`xmi:${localName}`)
    || null
}

function analyzeBpmn(bpmnXml) {
  const document = parseXml(bpmnXml, 'BPMN')
  const all = elements(document)

  const semanticIds = new Set(
    all
      .filter(element => element.namespaceURI === BPMN_NS && element.getAttribute('id'))
      .map(element => element.getAttribute('id'))
  )

  const associations = all
    .filter(element => element.namespaceURI === BPMN_NS && element.localName === 'association')
    .map(element => {
      const id = element.getAttribute('id')
      const sourceRef = element.getAttribute('sourceRef') || null
      const targetRef = element.getAttribute('targetRef') || null
      return {
        id,
        sourceRef,
        targetRef,
        sourceResolved: Boolean(sourceRef && semanticIds.has(sourceRef)),
        targetResolved: Boolean(targetRef && semanticIds.has(targetRef))
      }
    })

  const diReferences = all
    .filter(element => element.namespaceURI === BPMNDI_NS && ['BPMNShape', 'BPMNEdge'].includes(element.localName))
    .map(element => {
      const bpmnElement = element.getAttribute('bpmnElement') || null
      return {
        kind: element.localName,
        id: element.getAttribute('id') || null,
        bpmnElement,
        resolved: Boolean(bpmnElement && semanticIds.has(bpmnElement))
      }
    })

  const planes = all
    .filter(element => element.namespaceURI === BPMNDI_NS && element.localName === 'BPMNPlane')
    .map(element => ({
      id: element.getAttribute('id') || null,
      bpmnElement: element.getAttribute('bpmnElement') || null
    }))

  const planeGroups = new Map()
  for (const plane of planes) {
    if (!plane.bpmnElement) continue
    const group = planeGroups.get(plane.bpmnElement) || []
    group.push(plane.id)
    planeGroups.set(plane.bpmnElement, group)
  }

  return {
    semanticIds: [...semanticIds],
    associations,
    unresolvedAssociationReferences: associations.flatMap(association => [
      ...(!association.sourceResolved ? [{ associationId: association.id, role: 'sourceRef', ref: association.sourceRef }] : []),
      ...(!association.targetResolved ? [{ associationId: association.id, role: 'targetRef', ref: association.targetRef }] : [])
    ]),
    diReferences,
    unresolvedDiReferences: diReferences.filter(reference => !reference.resolved),
    multiplePlanes: [...planeGroups.entries()]
      .filter(([, planeIds]) => planeIds.length > 1)
      .map(([bpmnElement, planeIds]) => ({ bpmnElement, planeIds }))
  }
}

function analyzeXmi(xmiXml) {
  const document = parseXml(xmiXml, 'XMI')
  const all = elements(document)

  const comments = new Map(
    all
      .filter(element => element.localName === 'ownedComment' && xmiAttribute(element, 'id'))
      .map(element => [xmiAttribute(element, 'id'), {
        id: xmiAttribute(element, 'id'),
        text: element.getAttribute('body') || ''
      }])
  )

  const extensionElements = new Map(
    all
      .filter(element => element.localName === 'element' && xmiAttribute(element, 'idref'))
      .map(element => [xmiAttribute(element, 'idref'), element])
  )

  const rawNoteLinks = all
    .filter(element => element.localName === 'NoteLink')
    .map(element => ({
      id: xmiAttribute(element, 'id'),
      start: element.getAttribute('start') || null,
      end: element.getAttribute('end') || null
    }))

  const noteLinksById = new Map()

  for (const noteLink of rawNoteLinks) {
    const existing = noteLinksById.get(noteLink.id)

    if (!existing) {
      noteLinksById.set(noteLink.id, {
        ...noteLink,
        sourceOccurrenceCount: 1
      })
      continue
    }

    if (
      existing.start !== noteLink.start
      || existing.end !== noteLink.end
    ) {
      throw new Error(
        `Conflicting Sparx EA NoteLink representations for ${noteLink.id}.`
      )
    }

    existing.sourceOccurrenceCount += 1
  }

  const noteLinks = [...noteLinksById.values()]

  const dependencies = all
    .filter(element => element.localName === 'Dependency')
    .map(element => ({
      id: xmiAttribute(element, 'id'),
      start: element.getAttribute('start') || null,
      end: element.getAttribute('end') || null
    }))

  const umlEdges = all
    .filter(element => xmiAttribute(element, 'type') === 'umldi:UMLEdge')
    .map(element => ({
      id: xmiAttribute(element, 'id'),
      modelElement: element.getAttribute('modelElement') || null,
      source: element.getAttribute('source') || null,
      target: element.getAttribute('target') || null,
      waypoints: elements(element)
        .filter(candidate => candidate.localName === 'waypoint')
        .map(waypoint => ({
          x: waypoint.getAttribute('x') || null,
          y: waypoint.getAttribute('y') || null
        }))
    }))

  const diagramStyles = all
    .filter(element =>
      element.localName === 'element'
      && element.hasAttribute('subject')
      && element.hasAttribute('style')
    )
    .map(element => {
      const style = element.getAttribute('style') || ''
      const values = Object.fromEntries(
        style
          .split(';')
          .map(entry => entry.split('='))
          .filter(parts => parts.length === 2)
          .map(([key, value]) => [key, value])
      )

      const number = key => {
        if (!(key in values)) return null
        const parsed = Number(values[key])
        return Number.isFinite(parsed) ? parsed : null
      }

      return {
        subject: element.getAttribute('subject'),
        fillColor: number('BCol'),
        strokeColor: number('LCol'),
        lineColor: number('Color'),
        lineWidth: number('LWth') ?? number('LWidth')
      }
    })
    .filter(style =>
      style.fillColor !== null
      || style.strokeColor !== null
      || style.lineColor !== null
      || style.lineWidth !== null
    )

  const notes = [...comments.values()].map(comment => {
    const extension = extensionElements.get(comment.id)
    const xrefs = extension
      ? elements(extension).find(element => element.localName === 'xrefs')?.getAttribute('value') || ''
      : ''
    const isBpmnTextAnnotation = xrefs.includes('FQName=BPMN2.0::TextAnnotation')

    return {
      ...comment,
      sourceKind: isBpmnTextAnnotation ? 'bpmn-text-annotation' : 'uml-note',
      stereotype: isBpmnTextAnnotation ? 'BPMN2.0::TextAnnotation' : null,
      noteLinks: noteLinks.filter(link => link.start === comment.id || link.end === comment.id),
      dependencies: dependencies.filter(link => link.start === comment.id || link.end === comment.id)
    }
  })

  return {
    notes,
    noteLinks,
    dependencies,
    umlEdges,
    diagramStyles
  }
}

export function analyzeSparxEaImport({ bpmnXml, xmiXml = null }) {
  if (typeof bpmnXml !== 'string' || !bpmnXml.trim()) {
    throw new Error('A non-empty BPMN XML document is required.')
  }

  const bpmn = analyzeBpmn(bpmnXml)
  const xmi = xmiXml ? analyzeXmi(xmiXml) : null

  return {
    platform: 'sparx-ea',
    bpmn,
    xmi,
    requiresSupportingXmi: !xmi && (
      bpmn.unresolvedAssociationReferences.length > 0
      || bpmn.unresolvedDiReferences.length > 0
    ),
    blockingIssues: [
      ...bpmn.unresolvedAssociationReferences.map(issue => ({ type: 'unresolved-bpmn-reference', ...issue })),
      ...bpmn.unresolvedDiReferences.map(issue => ({ type: 'unresolved-bpmndi-reference', ...issue }))
    ],
    warnings: bpmn.multiplePlanes.map(issue => ({ type: 'multiple-bpmn-planes', ...issue }))
  }
}

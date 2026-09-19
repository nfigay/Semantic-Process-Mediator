import { w2popup } from 'w2ui/w2ui-2.0.es6.js'


function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}


function findBpmnElement(definitions, id) {
  const visited = new Set()

  function visit(value) {
    if (!value || typeof value !== 'object' || visited.has(value)) return null
    visited.add(value)
    if (value.id === id) return value

    for (const key of [ 'rootElements', 'flowElements', 'artifacts', 'participants' ]) {
      for (const child of value[key] || []) {
        const found = visit(child)
        if (found) return found
      }
    }

    return null
  }

  return visit(definitions)
}


function getProcess(element) {
  let current = element?.$parent || null
  while (current) {
    if (current.$type === 'bpmn:Process') return current
    current = current.$parent || null
  }
  return null
}


function findOccurrences(definitions, representationId) {
  const occurrences = []
  const visited = new Set()

  function visit(value) {
    if (!value || typeof value !== 'object' || visited.has(value)) return
    visited.add(value)

    const referencedId =
      value.dataStoreRef?.id ||
      value.dataObjectRef?.id ||
      null

    if (referencedId === representationId) {
      occurrences.push({
        id: value.id || '',
        name: value.name || '',
        type: value.$type || '',
        process: getProcess(value)
      })
    }

    for (const key of [ 'rootElements', 'flowElements', 'artifacts', 'participants' ]) {
      for (const child of value[key] || []) visit(child)
    }
  }

  visit(definitions)
  return occurrences
}


export function createBusinessObjectSelectionHandler({
  businessObjects = [],
  onSelectBusinessObject
} = {}) {

  return event => {
    const target =
      event?.target?.closest?.(
        '[data-business-object-id]'
      )

    if (!target) return null

    const businessObjectId =
      target.getAttribute(
        'data-business-object-id'
      )

    const businessObject =
      businessObjects.find(
        candidate =>
          candidate.id === businessObjectId
      ) || null

    if (!businessObject) return null

    onSelectBusinessObject?.(
      businessObject
    )

    return businessObject
  }
}


export function openBusinessObjectsBrowserDialog({
  modeler,
  businessObjectStore,
  businessObjectRepresentationStore,
  onSelectBusinessObject
} = {}) {
  const definitions = modeler?.getDefinitions?.()
  const businessObjects = businessObjectStore?.getBusinessObjects?.() || []

  const body = businessObjects.length
    ? businessObjects.map(businessObject => {
        const representations =
          businessObjectRepresentationStore
            ?.getRepresentations?.(businessObject.id) || []

        const representationHtml = representations.length
          ? representations.map(link => {
              const representation = findBpmnElement(definitions, link.representationId)
              const occurrences = findOccurrences(definitions, link.representationId)
              const occurrenceHtml = occurrences.length
                ? occurrences.map(occurrence => `
                    <div style="margin:4px 0 0 18px;color:#536779;">
                      Process object: <strong>${escapeHtml(occurrence.name || occurrence.id)}</strong>
                      <span style="color:#8291A0;">${escapeHtml(occurrence.type)}</span>
                      ${occurrence.process ? `<br/>Process: <strong>${escapeHtml(occurrence.process.name || occurrence.process.id)}</strong>` : ''}
                    </div>
                  `).join('')
                : '<div style="margin:4px 0 0 18px;color:#8291A0;">No BPMN occurrence found in this document.</div>'

              return `
                <div style="margin:8px 0 0 14px;padding-left:10px;border-left:2px solid #D8E0E8;">
                  Representation: <strong>${escapeHtml(representation?.name || link.representationId)}</strong>
                  <span style="color:#8291A0;">${escapeHtml(representation?.$type || '')}</span>
                  <div style="color:#8291A0;font-size:11px;">${escapeHtml(link.representationId)}</div>
                  ${occurrenceHtml}
                </div>
              `
            }).join('')
          : '<div style="margin:6px 0 0 14px;color:#8291A0;">No BPMN representation linked.</div>'

        return `
          <div style="padding:12px 4px;border-bottom:1px solid #E4E9EF;">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
              <div>
                <div style="font-weight:700;color:#20364B;">${escapeHtml(businessObject.id)}</div>
                <div style="font-size:11px;color:#6B7C8F;">Types: ${escapeHtml(businessObject.typeRefs.join(', '))}</div>
              </div>
              ${typeof onSelectBusinessObject === 'function' ? `
                <button
                  type="button"
                  data-business-object-id="${escapeHtml(businessObject.id)}"
                  style="padding:5px 9px;cursor:pointer;"
                >Inspect</button>
              ` : ''}
            </div>
            ${representationHtml}
          </div>
        `
      }).join('')
    : '<div style="padding:18px;color:#6B7C8F;">No Business Objects in the current repository.</div>'

  let selectionHandler = null

  if (
    typeof onSelectBusinessObject === 'function' &&
    typeof document !== 'undefined'
  ) {
    selectionHandler =
      createBusinessObjectSelectionHandler({
        businessObjects,
        onSelectBusinessObject(
          businessObject
        ) {
          document.removeEventListener(
            'click',
            selectionHandler
          )

          onSelectBusinessObject(
            businessObject
          )

          w2popup.close()
        }
      })

    document.addEventListener(
      'click',
      selectionHandler
    )
  }

  w2popup.open({
    title: 'Business Objects',
    width: 720,
    height: 520,
    body: `<div style="padding:12px 18px;font-family:'DM Sans',sans-serif;font-size:13px;overflow:auto;height:100%;box-sizing:border-box;">${body}</div>`
  })
}

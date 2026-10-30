import { getOccurrenceDisplayLabel } from './occurrence-display-label.js'
import { getExternalLabelMid } from 'bpmn-js/lib/util/LabelUtil.js'

const TYPES = new Set([ 'bpmn:DataObjectReference', 'bpmn:DataStoreReference' ])
// Native external labels share the target's businessObject. They are not occurrences.
const isOccurrence = element => !element?.labelTarget && TYPES.has(element?.businessObject?.$type)

/**
 * Adapt the native external label lifecycle to derived master/dataState text.
 * The value is presentation-only: never call updateLabel with derived text.
 */
export function OccurrenceLabelMaterialization(eventBus, elementRegistry, modeling, textRenderer) {
  let adapting = false

  function labelFor(element) {
    return element.label || elementRegistry.get(element.id + '_label')
  }

  function synchronize(element) {
    if (adapting || !isOccurrence(element) || !element.parent) return

    const value = getOccurrenceDisplayLabel(element.businessObject)
    if (!value) return // Let native blank-label semantics apply.

    const label = labelFor(element)
    // Measure the ACTUAL presentation text, not getLabel(reference) or a
    // potentially stale native label geometry. Use a generous single-line
    // measurement box to avoid inheriting a previously narrow label width.
    // Use the native BPMN external-label anchor (same helper as UpdateLabelHandler).
    // The broad measurement box is for single-line text layout ONLY; it must
    // be centered on that anchor, not start at the shape's x-coordinate.
    const nativeMid = getExternalLabelMid(element)
    const center = { x: nativeMid.x, y: nativeMid.y + 7 }
    const measurementWidth = Math.max(400, label?.width || 0)
    const bounds = textRenderer.getExternalLabelBounds({
      x: center.x - measurementWidth / 2,
      y: center.y - 10,
      width: measurementWidth,
      height: 20
    }, value)
    if (!bounds) return
    const anchoredBounds = {
      x: center.x - bounds.width / 2,
      y: center.y - bounds.height / 2,
      width: bounds.width,
      height: bounds.height
    }

    adapting = true
    try {
      if (!label) {
        modeling.createLabel(element, {
          x: center.x,
          y: center.y
        }, {
          id: element.id + '_label',
          width: anchoredBounds.width,
          height: anchoredBounds.height,
          businessObject: element.businessObject
        })
      } else if (label.x !== anchoredBounds.x || label.y !== anchoredBounds.y ||
        label.width !== anchoredBounds.width || label.height !== anchoredBounds.height) {
        modeling.resizeShape(label, anchoredBounds, { width: 0, height: 0 })
      }
    } finally {
      adapting = false
    }
  }

  function relevantOccurrences(context) {
    const element = context?.element?.labelTarget || context?.element
    const bo = element?.businessObject
    if (!context || !element) return []

    if (isOccurrence(element)) return [ element ]

    const updated = context.moddleElement
    if (!updated || !Object.prototype.hasOwnProperty.call(context.properties || {}, 'name')) return []

    // Master changes can affect multiple occurrences, particularly DataStores
    // for which the native UpdateModdlePropertiesHandler does not gather refs.
    return elementRegistry.filter(candidate => {
      if (!isOccurrence(candidate)) return false
      const reference = candidate.businessObject
      return reference.dataObjectRef === updated ||
        reference.dataStoreRef === updated || reference.dataState === updated
    })
  }

  // This native option keeps an existing label when reference.name is cleared.
  eventBus.on('commandStack.element.updateLabel.preExecute', 1500, event => {
    const context = event?.context
    const element = context?.element?.labelTarget || context?.element
    const bo = element?.businessObject
    if (!TYPES.has(bo?.$type) || typeof context.newLabel !== 'string' || context.newLabel.trim()) return
    const fallback = getOccurrenceDisplayLabel({ ...bo, name: '' })
    if (!fallback) return
    context.hints = { ...(context.hints || {}), removeShape: false }
  })

  // Native command completion is the point where master and state values
  // already reflect the new model, including first creation of dataState.
  eventBus.on('commandStack.element.updateModdleProperties.postExecuted', 400, event => {
    for (const element of relevantOccurrences(event?.context)) synchronize(element)
  })

  eventBus.on('commandStack.element.updateLabel.postExecuted', 400, event => {
    const context = event?.context
    // Native LabelBehavior uses this command after a label shape is deleted.
    // Do not recreate that label inside the same deletion transaction.
    if (context?.newLabel == null && context?.hints?.removeShape === false) return
    synchronize(context?.element?.labelTarget || context?.element)
  })

  eventBus.on('commandStack.shape.create.postExecuted', 400, event => {
    synchronize(event?.context?.shape)
  })

  eventBus.on('import.done', 400, event => {
    if (event?.error) return
    for (const element of elementRegistry.filter(isOccurrence)) synchronize(element)
  })
}

OccurrenceLabelMaterialization.$inject = [
  'eventBus', 'elementRegistry', 'modeling', 'textRenderer'
]

export default {
  __init__: [ 'occurrenceLabelMaterialization' ],
  occurrenceLabelMaterialization: [ 'type', OccurrenceLabelMaterialization ]
}

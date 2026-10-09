import { getOccurrenceDisplayLabel } from './occurrence-display-label.js'

const TYPES = new Set([
  'bpmn:DataObjectReference',
  'bpmn:DataStoreReference'
])

/**
 * Synchronize presentation-only occurrence labels.
 * Keep BPMN name and dataState independent.
 * Use native bpmn-js text measurement and modeling geometry.
 */
export function OccurrenceLabelRefresh(
  eventBus,
  elementRegistry,
  modeling,
  textRenderer,
  selection
) {
  let refreshing = false

  const refresh = () => {
    if (refreshing) return

    refreshing = true

    try {
      const elements = elementRegistry.filter(
        element => TYPES.has(element?.businessObject?.$type)
      )

      for (const element of elements) {
        const label =
          element.label ||
          elementRegistry.get(element.id + '_label')

        if (!label) continue

        const text = getOccurrenceDisplayLabel(element.businessObject)

        if (text) {
          const bounds = textRenderer.getExternalLabelBounds(label, text)

          const changed =
            bounds.x !== label.x ||
            bounds.y !== label.y ||
            bounds.width !== label.width ||
            bounds.height !== label.height

          if (changed) {
            modeling.resizeShape(label, bounds, { width: 0, height: 0 })
          }
        }

        eventBus.fire('element.changed', { element: label })
      }

      const selected = selection.get()?.[0]
      const bo = selected?.businessObject

      if (bo && TYPES.has(bo.$type)) {
        eventBus.fire('bpmnsm.occurrenceDisplayLabel.changed', {
          element: selected,
          value: getOccurrenceDisplayLabel(bo)
        })
      }
    } finally {
      refreshing = false
    }
  }

  eventBus.on('commandStack.changed', 500, refresh)
  eventBus.on('selection.changed', 500, refresh)
}

OccurrenceLabelRefresh.$inject = [
  'eventBus',
  'elementRegistry',
  'modeling',
  'textRenderer',
  'selection'
]

export default {
  __init__: [ 'occurrenceLabelRefresh' ],
  occurrenceLabelRefresh: [ 'type', OccurrenceLabelRefresh ]
}

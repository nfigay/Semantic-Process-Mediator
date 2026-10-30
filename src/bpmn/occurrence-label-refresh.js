import { getOccurrenceDisplayLabel } from './occurrence-display-label.js'

const TYPES = new Set([ 'bpmn:DataObjectReference', 'bpmn:DataStoreReference' ])

/**
 * Render-only synchronization. In particular: no modeling commands from
 * commandStack.changed (a second command during Name input can remount fields).
 * Missing external labels are handled by OccurrenceLabelMaterialization.
 */
export function OccurrenceLabelRefresh(eventBus, elementRegistry, modeling, textRenderer, selection) {
  let refreshing = false

  const refresh = () => {
    if (refreshing) return
    refreshing = true
    try {
      for (const element of elementRegistry.filter(
        element => !element?.labelTarget && TYPES.has(element?.businessObject?.$type)
      )) {
        const label = element.label || elementRegistry.get(element.id + '_label')
        if (label) eventBus.fire('element.changed', { element: label })
      }
      const selected = selection.get()?.[0]
      const element = selected?.labelTarget || selected
      const bo = element?.businessObject
      if (bo && TYPES.has(bo.$type)) {
        eventBus.fire('bpmnsm.occurrenceDisplayLabel.changed', {
          element,
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
  'eventBus', 'elementRegistry', 'modeling', 'textRenderer', 'selection'
]

export default {
  __init__: [ 'occurrenceLabelRefresh' ],
  occurrenceLabelRefresh: [ 'type', OccurrenceLabelRefresh ]
}

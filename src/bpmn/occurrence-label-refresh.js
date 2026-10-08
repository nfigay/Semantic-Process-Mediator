import { getOccurrenceDisplayLabel } from './occurrence-display-label.js'

const TYPES = new Set([ 'bpmn:DataObjectReference', 'bpmn:DataStoreReference' ])

/** Refresh presentation after a BPMN command, without writing computed labels to BPMN. */
export function OccurrenceLabelRefresh(eventBus, elementRegistry, graphicsFactory, selection) {
  const refresh = () => {
    const elements = elementRegistry.filter(element => TYPES.has(element?.businessObject?.$type))
    for (const element of elements) {
      const label = element.label || elementRegistry.get(element.id + '_label')
      if (label) graphicsFactory.update('shape', label)
    }

    const selected = selection.get()?.[0]
    const bo = selected?.businessObject
    if (!bo || !TYPES.has(bo.$type)) return
    const value = getOccurrenceDisplayLabel(bo)
    // React owns the native properties header; never mutate its DOM from here.
    // The dedicated Visual Properties header is synchronized by its own event listener.
    eventBus.fire('bpmnsm.occurrenceDisplayLabel.changed', { element: selected, value })
  }
  eventBus.on('commandStack.changed', 500, refresh)
  eventBus.on('selection.changed', 500, refresh)
}
OccurrenceLabelRefresh.$inject = [ 'eventBus', 'elementRegistry', 'graphicsFactory', 'selection' ]

export default {
  __init__: [ 'occurrenceLabelRefresh' ],
  occurrenceLabelRefresh: [ 'type', OccurrenceLabelRefresh ]
}

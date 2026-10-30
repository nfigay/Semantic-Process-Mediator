import { getOccurrenceDisplayLabel } from './occurrence-display-label.js'

const TYPES = new Set([
  'bpmn:DataObjectReference',
  'bpmn:DataStoreReference'
])

/**
 * Presentation-only adapter for the installed native properties header.
 * Does not modify BPMN business objects or editable properties fields.
 */
export function OccurrencePropertiesHeader(eventBus, selection) {
  const parent = document.querySelector('#bpmn-props')
  if (!parent) return

  const update = () => {
    const selected = selection.get()?.[0]
    const element = selected?.labelTarget || selected
    const businessObject = element?.businessObject
    if (!businessObject || !TYPES.has(businessObject.$type)) return

    const header = parent.querySelector('.bio-properties-panel-header-label')
    if (!header) return

    const label = getOccurrenceDisplayLabel(businessObject)
    // Never mutate Preact's header subtree while a user is editing a field.
    // The native properties panel owns that DOM and its focus lifecycle.
    const active = document.activeElement
    if (active && parent.contains(active) && active.matches?.('input, textarea, [contenteditable="true"]')) {
      return
    }
    if (header.textContent !== label) header.textContent = label
  }

  // Native Preact may render after modeler events. Observe the panel itself
  // to keep the projection in sync without modifying its implementation.
  let pending = false
  const schedule = () => {
    if (pending) return
    pending = true
    queueMicrotask(() => {
      pending = false
      update()
    })
  }

  const observer = new MutationObserver(schedule)
  observer.observe(parent, { childList: true, subtree: true, characterData: true })

  // Flush a deferred presentation update only after the edit really ends.
  parent.addEventListener('focusout', schedule, true)
  eventBus.on('selection.changed', -1000, schedule)
  eventBus.on('commandStack.changed', -1000, schedule)
  eventBus.on('bpmnsm.occurrenceDisplayLabel.changed', -1000, schedule)
  eventBus.on('diagram.destroy', () => observer.disconnect())
  schedule()
}

OccurrencePropertiesHeader.$inject = [ 'eventBus', 'selection' ]

export default {
  __init__: [ 'occurrencePropertiesHeader' ],
  occurrencePropertiesHeader: [ 'type', OccurrencePropertiesHeader ]
}

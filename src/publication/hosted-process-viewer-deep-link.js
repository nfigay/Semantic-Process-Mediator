export function readHostedProcessViewerDeepLink(search = '') {
  const params = new URLSearchParams(search)

  return {
    elementId: String(params.get('element') || '').trim() || null,
    embedded: params.get('embed') === '1'
  }
}

export function applyHostedProcessViewerElementDeepLink({
  viewer,
  canvas,
  readOnlyPropertiesPanel,
  elementId
} = {}) {
  const id = String(elementId || '').trim()

  if (!id) {
    return null
  }

  const elementRegistry = viewer?.get?.('elementRegistry')
  const selection = viewer?.get?.('selection')
  const element = elementRegistry?.get?.(id)

  if (!element) {
    return null
  }

  selection?.select?.(element)
  canvas?.scrollToElement?.(element)
  readOnlyPropertiesPanel?.showBusinessObject?.(
    element.businessObject || null
  )

  return element
}

function nextPaint() {
  return new Promise(resolve => {
    if (typeof globalThis.requestAnimationFrame === 'function') {
      globalThis.requestAnimationFrame(() => resolve())
      return
    }

    queueMicrotask(resolve)
  })
}

export async function stabilizeHostedProcessViewerElementDeepLink({
  viewer,
  elementId,
  waitForPaint = nextPaint,
  maxAttempts = 8,
  ...options
} = {}) {
  const id = String(elementId || '').trim()

  if (!id) {
    return null
  }

  const eventBus = viewer?.get?.('eventBus', false)
  let propertiesConfirmed = false

  const onPropertiesUpdated = event => {
    if (event?.element?.id === id) {
      propertiesConfirmed = true
    }
  }

  eventBus?.on?.('propertiesPanel.updated', onPropertiesUpdated)

  try {
    let element = null

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      element = applyHostedProcessViewerElementDeepLink({
        viewer,
        elementId: id,
        ...options
      })

      if (!element || propertiesConfirmed || !eventBus) {
        return element
      }

      // BpmnPropertiesPanel subscribes to selection.changed from a Preact
      // effect. During initial import the diagram selection listener can already
      // be active while the Properties listener is not. Wait for the next paint
      // and repeat the canonical selection until Properties confirms that it
      // consumed the same element through propertiesPanel.updated.
      await waitForPaint()
    }

    return element
  } finally {
    eventBus?.off?.('propertiesPanel.updated', onPropertiesUpdated)
  }
}

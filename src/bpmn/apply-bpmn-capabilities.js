function resolveElement(target) {
  if (!target) return null
  if (typeof target === 'string') return document.querySelector(target)
  return target
}

function disableEditingControls(container) {
  if (!container) return

  container
    .querySelectorAll('input, textarea, select, [contenteditable="true"]')
    .forEach(control => {
      if ('readOnly' in control) control.readOnly = true
      if ('disabled' in control) control.disabled = true
      control.setAttribute('aria-readonly', 'true')
      if (control.getAttribute('contenteditable') === 'true') {
        control.setAttribute('contenteditable', 'false')
      }
    })

  container
    .querySelectorAll('button')
    .forEach(button => {
      const label = `${button.getAttribute('aria-label') || ''} ${button.title || ''}`
        .toLowerCase()

      // Keep disclosure/navigation buttons usable; disable mutation actions.
      if (!/expand|collapse|open|close|navigate/.test(label)) {
        button.disabled = true
        button.setAttribute('aria-disabled', 'true')
      }
    })
}

export function applyBpmnCapabilities({
  modeler,
  editable = true,
  propertiesPanel = null
} = {}) {
  if (!modeler || editable) {
    return { destroy() {} }
  }

  const propertiesElement = resolveElement(propertiesPanel)
  const canvasElement = modeler.get('canvas')?.getContainer?.() || null
  const contextPad = modeler.get('contextPad', false)
  const keyboard = modeler.get('keyboard', false)
  const directEditing = modeler.get('directEditing', false)
  const eventBus = modeler.get('eventBus', false)

  keyboard?.unbind?.()
  directEditing?.cancel?.()
  contextPad?.close?.()

  canvasElement?.classList.add('bpmn-read-only')
  propertiesElement?.classList.add('bpmn-properties-read-only')

  const style = document.createElement('style')
  style.dataset.bpmnsmReadOnly = 'true'
  style.textContent = `
    .bpmn-read-only .djs-palette,
    .bpmn-read-only .djs-context-pad,
    .bpmn-read-only .djs-direct-editing-parent,
    .bpmn-read-only .djs-popup {
      display: none !important;
    }
  `
  document.head.appendChild(style)

  disableEditingControls(propertiesElement)

  const observer = propertiesElement
    ? new MutationObserver(() => disableEditingControls(propertiesElement))
    : null

  observer?.observe(propertiesElement, {
    childList: true,
    subtree: true
  })

  const closeEditingAffordances = () => {
    directEditing?.cancel?.()
    contextPad?.close?.()
  }

  eventBus?.on?.('selection.changed', 2000, closeEditingAffordances)
  // Run after bpmn-js direct-editing activation handlers. Cancelling at a high
  // priority runs too early: direct editing may activate afterwards and hide the
  // label even though its editor is visually suppressed by read-only CSS.
  eventBus?.on?.('element.dblclick', 250, closeEditingAffordances)

  return {
    destroy() {
      observer?.disconnect()
      style.remove()
      canvasElement?.classList.remove('bpmn-read-only')
      propertiesElement?.classList.remove('bpmn-properties-read-only')
    }
  }
}

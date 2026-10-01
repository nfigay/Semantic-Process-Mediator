import {
  describe,
  expect,
  it,
  vi
} from 'vitest'

import {
  applyHostedProcessViewerElementDeepLink,
  readHostedProcessViewerDeepLink,
  stabilizeHostedProcessViewerElementDeepLink
} from './hosted-process-viewer-deep-link.js'

describe('hosted Process Viewer deep links', () => {
  it('reads an element id from the Viewer query string', () => {
    expect(
      readHostedProcessViewerDeepLink(
        '?publication=gs-pub-01&element=Task_Published'
      )
    ).toEqual({
      elementId: 'Task_Published',
      embedded: false
    })
  })


  it('reads embed=1 as a presentation-only consultation flag', () => {
    expect(
      readHostedProcessViewerDeepLink(
        '?publication=gs-pub-01&element=Activity_1&embed=1'
      )
    ).toEqual({
      elementId: 'Activity_1',
      embedded: true
    })

    expect(
      readHostedProcessViewerDeepLink('?publication=gs-pub-01&embed=0')
    ).toEqual({
      elementId: null,
      embedded: false
    })
  })

  it('selects, reveals and projects a resolved BPMN element', () => {
    const businessObject = { id: 'Task_Published' }
    const element = { id: 'Task_Published', businessObject }
    const select = vi.fn()
    const scrollToElement = vi.fn()
    const showBusinessObject = vi.fn()

    const viewer = {
      get(service) {
        if (service === 'elementRegistry') {
          return { get: vi.fn(() => element) }
        }
        if (service === 'selection') {
          return { select }
        }
        return null
      }
    }

    expect(
      applyHostedProcessViewerElementDeepLink({
        viewer,
        canvas: { scrollToElement },
        readOnlyPropertiesPanel: { showBusinessObject },
        elementId: 'Task_Published'
      })
    ).toBe(element)

    expect(select).toHaveBeenCalledWith(element)
    expect(scrollToElement).toHaveBeenCalledWith(element)
    expect(showBusinessObject).toHaveBeenCalledWith(businessObject)
  })

  it('re-applies selection until the shared Properties Panel confirms the deep-linked element', async () => {
    const businessObject = { id: 'Activity_1' }
    const element = { id: 'Activity_1', businessObject }
    const scrollToElement = vi.fn()
    const showBusinessObject = vi.fn()
    const waitForPaint = vi.fn(async () => {})
    const listeners = new Map()
    let selectionCount = 0

    const eventBus = {
      on: vi.fn((event, listener) => listeners.set(event, listener)),
      off: vi.fn((event, listener) => {
        if (listeners.get(event) === listener) listeners.delete(event)
      }),
      fire(event, payload) {
        listeners.get(event)?.(payload)
      }
    }

    const select = vi.fn(() => {
      selectionCount += 1

      // Reproduce the real regression boundary: diagram-js consumes the first
      // selection, while the Preact Properties effect is only ready afterwards.
      if (selectionCount === 2) {
        eventBus.fire('propertiesPanel.updated', { element })
      }
    })

    const viewer = {
      get(service) {
        if (service === 'elementRegistry') return { get: () => element }
        if (service === 'selection') return { select }
        if (service === 'eventBus') return eventBus
        return null
      }
    }

    await stabilizeHostedProcessViewerElementDeepLink({
      viewer,
      canvas: { scrollToElement },
      readOnlyPropertiesPanel: { showBusinessObject },
      elementId: 'Activity_1',
      waitForPaint
    })

    expect(select).toHaveBeenCalledTimes(2)
    expect(waitForPaint).toHaveBeenCalledTimes(1)
    expect(scrollToElement).toHaveBeenCalledTimes(2)
    expect(eventBus.on).toHaveBeenCalledWith(
      'propertiesPanel.updated',
      expect.any(Function)
    )
    expect(eventBus.off).toHaveBeenCalledWith(
      'propertiesPanel.updated',
      expect.any(Function)
    )
  })

  it('keeps the Process Viewer usable when the element id is unknown', () => {
    const viewer = {
      get(service) {
        if (service === 'elementRegistry') {
          return { get: vi.fn(() => null) }
        }
        return null
      }
    }

    expect(
      applyHostedProcessViewerElementDeepLink({
        viewer,
        elementId: 'Missing_Element'
      })
    ).toBeNull()
  })
})

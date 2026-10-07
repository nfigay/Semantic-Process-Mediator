import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from 'vitest'

import {
  createWorkspaceActions
} from './workspace-actions.js'


function createActions() {
  return createWorkspaceActions({
    repositoryDocumentStore: {
      clear() {},
      getDocuments() { return [] },
      setActiveDocument() {},
      updateDocument() {}
    },
    repositoryBrowser: {
      render() {}
    },
    createDocumentId() {
      return 'document-1'
    },
    async loadBpmn() {},
    async showArchimate() {}
  })
}


describe('Direct Workspace Folder capability', () => {

  const previousWindow =
    globalThis.window


  afterEach(() => {
    vi.restoreAllMocks()

    if (
      previousWindow ===
      undefined
    ) {
      delete globalThis.window
    } else {
      globalThis.window =
        previousWindow
    }
  })


  it('treats AbortError as a normal picker cancellation', async () => {

    const setItem =
      vi.fn()

    const alert =
      vi.fn()

    const reload =
      vi.fn()

    globalThis.window = {
      showDirectoryPicker:
        vi.fn().mockRejectedValue(
          Object.assign(
            new Error('cancelled'),
            {
              name:
                'AbortError'
            }
          )
        ),

      sessionStorage: {
        setItem
      },

      alert,

      location: {
        reload
      }
    }


    await expect(
      createActions()
        .openFolder()
    )
      .resolves
      .toBeNull()


    expect(setItem)
      .not
      .toHaveBeenCalled()

    expect(alert)
      .not
      .toHaveBeenCalled()

    expect(reload)
      .not
      .toHaveBeenCalled()
  })


  it('records NotAllowedError and switches the session to Archive fallback', async () => {

    const setItem =
      vi.fn()

    const alert =
      vi.fn()

    const reload =
      vi.fn()

    globalThis.window = {
      showDirectoryPicker:
        vi.fn().mockRejectedValue(
          Object.assign(
            new Error('not allowed'),
            {
              name:
                'NotAllowedError'
            }
          )
        ),

      sessionStorage: {
        setItem
      },

      alert,

      location: {
        reload
      }
    }


    await expect(
      createActions()
        .openFolder()
    )
      .resolves
      .toBeNull()


    expect(setItem)
      .toHaveBeenCalledWith(
        'bpmnsm.directWorkspaceDenied',
        '1'
      )

    expect(alert)
      .toHaveBeenCalledTimes(
        1
      )

    expect(
      alert.mock.calls[0][0]
    )
      .toContain(
        'Workspace Archive'
      )

    expect(reload)
      .toHaveBeenCalledTimes(
        1
      )
  })


  it('does not reinterpret unexpected picker failures', async () => {

    const failure =
      Object.assign(
        new Error('unexpected'),
        {
          name:
            'UnknownError'
        }
      )

    globalThis.window = {
      showDirectoryPicker:
        vi.fn().mockRejectedValue(
          failure
        ),

      sessionStorage: {
        setItem:
          vi.fn()
      },

      alert:
        vi.fn(),

      location: {
        reload:
          vi.fn()
      }
    }


    await expect(
      createActions()
        .openFolder()
    )
      .rejects
      .toBe(
        failure
      )
  })
})

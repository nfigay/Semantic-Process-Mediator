import {
  describe,
  expect,
  it
} from 'vitest'

import {
  createToolbar
} from './toolbar.js'


function findItem(
  toolbar,
  id
) {

  return toolbar.items.find(
    item =>
      item.id ===
      id
  )
}


describe(
  'createToolbar',
  () => {

    it(
      'exposes Utilities in editor mode by default',
      () => {

        const toolbar =
          createToolbar({
            mode:
              'editor'
          })


        expect(
          findItem(
            toolbar,
            'utilities'
          )
        ).toBeDefined()
      }
    )


    it(
      'exposes Utilities in viewer mode by default',
      () => {

        const toolbar =
          createToolbar({
            mode:
              'viewer'
          })


        expect(
          findItem(
            toolbar,
            'utilities'
          )
        ).toBeDefined()
      }
    )


    it(
      'can hide Utilities independently in viewer mode',
      () => {

        const toolbar =
          createToolbar({

            mode:
              'viewer',

            capabilities: {
              utilities:
                false
            }
          })


        expect(
          findItem(
            toolbar,
            'utilities'
          )
        ).toBeUndefined()
      }
    )


    it(
      'can explicitly expose Utilities in viewer mode',
      () => {

        const toolbar =
          createToolbar({

            mode:
              'viewer',

            capabilities: {
              utilities:
                true
            }
          })


        expect(
          findItem(
            toolbar,
            'utilities'
          )
        ).toBeDefined()
      }
    )


    it(
      'does not expose editor-only validation in viewer mode',
      () => {

        const toolbar =
          createToolbar({

            mode:
              'viewer',

            capabilities: {
              utilities:
                true
            }
          })


        expect(
          findItem(
            toolbar,
            'btn-validate'
          )
        ).toBeUndefined()
      }
    )

    it(
      'exposes direct BPMN opening in viewer mode',
      () => {

        const toolbar =
          createToolbar({
            mode:
              'viewer'
          })

        const repository =
          findItem(
            toolbar,
            'repository'
          )

        expect(
          repository.items.find(
            item =>
              item.id ===
              'open-bpmn'
          )
        ).toBeDefined()
      }
    )


    it(
      'does not expose direct BPMN opening in editor mode',
      () => {

        const toolbar =
          createToolbar({
            mode:
              'editor'
          })

        const repository =
          findItem(
            toolbar,
            'repository'
          )

        expect(
          repository.items.find(
            item =>
              item.id ===
              'open-bpmn'
          )
        ).toBeUndefined()
      }
    )


    it(
      'dispatches direct BPMN opening only in viewer mode',
      () => {

        let viewerOpenCount =
          0

        let editorOpenCount =
          0

        const viewerToolbar =
          createToolbar({

            mode:
              'viewer',

            onOpenBpmn() {

              viewerOpenCount +=
                1
            }
          })

        const editorToolbar =
          createToolbar({

            mode:
              'editor',

            onOpenBpmn() {

              editorOpenCount +=
                1
            }
          })


        viewerToolbar.invoke(
          'repository:open-bpmn'
        )

        editorToolbar.invoke(
          'repository:open-bpmn'
        )


        expect(
          viewerOpenCount
        ).toBe(
          1
        )

        expect(
          editorOpenCount
        ).toBe(
          0
        )
      }
    )

  }
)

    it('exposes and dispatches the Business Objects browser in editor mode', () => {
      let count = 0
      const toolbar = createToolbar({
        mode: 'editor',
        onBrowseBusinessObjects() { count += 1 }
      })
      const model = findItem(toolbar, 'model')
      expect(model.items.find(item => item.id === 'browse-business-objects')).toBeDefined()

      toolbar.onClick({ target: 'model:browse-business-objects' })
      expect(count).toBe(1)
    })

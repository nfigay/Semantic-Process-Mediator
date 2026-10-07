// @vitest-environment jsdom

import {
  describe,
  expect,
  it,
  vi
} from 'vitest'

import {
  createWorkspaceTreeSearch
} from './workspace-tree-search.js'


describe(
  'Workspace Tree Search UI',
  () => {

    it(
      'renders an accessible search input with the current query',
      () => {

        const container =
          document.createElement(
            'div'
          )

        const search =
          createWorkspaceTreeSearch({
            container,
            initialQuery:
              'Order'
          })

        expect(
          search.input.type
        ).toBe(
          'search'
        )

        expect(
          search.input.getAttribute(
            'aria-label'
          )
        ).toBe(
          'Search Environment'
        )

        expect(
          search.getQuery()
        ).toBe(
          'Order'
        )
      }
    )


    it(
      'forwards user input without implementing a second filter',
      () => {

        const container =
          document.createElement(
            'div'
          )

        const onQueryChange =
          vi.fn()

        const search =
          createWorkspaceTreeSearch({
            container,
            onQueryChange
          })

        search.input.value =
          'invoice'

        search.input.dispatchEvent(
          new Event(
            'input',
            {
              bubbles:
                true
            }
          )
        )

        expect(
          onQueryChange
        ).toHaveBeenLastCalledWith(
          'invoice'
        )
      }
    )


    it(
      'forwards an empty query so the Repository Browser can restore the full tree',
      () => {

        const container =
          document.createElement(
            'div'
          )

        const onQueryChange =
          vi.fn()

        const search =
          createWorkspaceTreeSearch({
            container,
            initialQuery:
              'invoice',
            onQueryChange
          })

        search.input.value = ''

        search.input.dispatchEvent(
          new Event(
            'input'
          )
        )

        expect(
          onQueryChange
        ).toHaveBeenLastCalledWith(
          ''
        )
      }
    )
  }
)

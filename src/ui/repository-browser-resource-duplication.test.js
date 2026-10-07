// @vitest-environment jsdom

import {
  describe,
  expect,
  it,
  vi
} from 'vitest'

import {
  createRepositoryBrowser
} from './repository-browser.js'

import {
  createRepositoryMembershipMenu
} from './repository-membership-menu.js'

import {
  createRepositoryScopeStore
} from '../repository/repository-scope-store.js'

import {
  createActiveRepository
} from '../repository/active-repository.js'


class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}


globalThis.ResizeObserver =
  TestResizeObserver


function createFixture() {

  const scopeStore =
    createRepositoryScopeStore()

  const source =
    scopeStore.createRepository(
      'repository-a'
    )

  source.workspace.mode =
    'folder'

  source.workspace.name =
    'Source A'

  source.documents.addDocument({
    id: 'document-a',
    fileName: 'process-a.bpmn',
    kind: 'bpmn',
    content: '<definitions />'
  })

  source.model.addComponent({
    id: 'process-a',
    type: 'process',
    name: 'Process A',
    documentId: 'document-a'
  })

  return {
    source,
    activeRepository:
      createActiveRepository(
        source
      )
  }
}


describe(
  'Repository Browser resource duplication UI',
  () => {

    it(
      'resolves the Resource document from a BPMN component before delegating duplication',
      () => {

        const {
          activeRepository
        } =
          createFixture()

        const container =
          document.createElement(
            'div'
          )

        document.body.appendChild(
          container
        )

        const onDuplicateResourceRequest =
          vi.fn()

        const browser =
          createRepositoryBrowser({
            activeRepository,
            container,
            onDuplicateResourceRequest
          })

        browser.setView('environment')

        const componentNode =
          browser.sidebar
            .find({
              repositoryKind:
                'component'
            })[0]

        expect(
          browser
            .getResourceDuplicationMenuItem(
              componentNode.id
            )
        ).toEqual({
          id:
            'duplicate-resource',
          text:
            'Duplicate resource to…'
        })

        browser
          .requestResourceDuplication(
            componentNode.id
          )

        expect(
          onDuplicateResourceRequest
        ).toHaveBeenCalledWith({
          documentId:
            'document-a',
          componentId:
            'process-a'
        })

        browser.destroy()
        container.remove()
      }
    )


    it(
      'composes resource duplication through the single W2UI membership menu owner',
      async () => {

        const {
          source,
          activeRepository
        } =
          createFixture()

        const container =
          document.createElement(
            'div'
          )

        document.body.appendChild(
          container
        )

        const browser =
          createRepositoryBrowser({
            activeRepository,
            container,
            onDuplicateResourceRequest:
              vi.fn()
          })

        const membershipMenu =
          createRepositoryMembershipMenu({
            sidebar:
              browser.sidebar,
            repositoryModel:
              source.model,
            activeRepository,

            getAdditionalMenuItems(
              nodeId
            ) {

              const item =
                browser
                  .getResourceDuplicationMenuItem(
                    nodeId
                  )

              return item
                ? [ item ]
                : []
            },

            onAdditionalMenuClick(
              event
            ) {

              if (
                event.detail?.menuItem?.id !==
                  'duplicate-resource'
              ) {

                return false
              }

              browser
                .requestResourceDuplication(
                  event.target
                )

              return true
            }
          })

        browser.setView('environment')

        const componentNode =
          browser.sidebar
            .find({
              repositoryKind:
                'component'
            })[0]

        const nodeElement =
          document.getElementById(
            `node_${componentNode.id}`
          )

        expect(
          nodeElement
        ).toBeTruthy()

        const event =
          new MouseEvent(
            'contextmenu',
            {
              bubbles: true,
              cancelable: true,
              button: 2,
              buttons: 2,
              clientX: 120,
              clientY: 80
            }
          )

        nodeElement.dispatchEvent(
          event
        )

        expect(
          event.defaultPrevented
        ).toBe(true)

        expect(
          browser.sidebar.menu
        ).toContainEqual({
          id:
            'duplicate-resource',
          text:
            'Duplicate resource to…'
        })

        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              20
            )
        )

        expect(
          document.body.textContent
        ).toContain(
          'Duplicate resource to…'
        )

        membershipMenu.destroy()
        browser.destroy()
        container.remove()
      }
    )

  }
)

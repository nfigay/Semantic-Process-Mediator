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


describe(
  'Repository Browser active Repository fixture',
  () => {

    it(
      'selects A -> B -> A through one Browser without reconstructing it',
      () => {

        const scopeStore =
          createRepositoryScopeStore()

        const repositoryA =
          scopeStore.createRepository(
            'repository-a'
          )

        const repositoryB =
          scopeStore.createRepository(
            'repository-b'
          )


        repositoryA.documents.addDocument({
          id: 'doc-1',
          fileName: 'repository-a.bpmn',
          kind: 'bpmn',
          content: '<repository-a />'
        })

        repositoryB.documents.addDocument({
          id: 'doc-1',
          fileName: 'repository-b.bpmn',
          kind: 'bpmn',
          content: '<repository-b />'
        })


        repositoryA.model.addComponent({
          id: 'process-1',
          type: 'process',
          name: 'Process A',
          documentId: 'doc-1'
        })

        repositoryB.model.addComponent({
          id: 'process-1',
          type: 'process',
          name: 'Process B',
          documentId: 'doc-1'
        })


        const activeRepository =
          createActiveRepository(
            repositoryA
          )


        const container =
          document.createElement(
            'div'
          )

        document.body.appendChild(
          container
        )


        const onSelect =
          vi.fn()


        const browser =
          createRepositoryBrowser({
            activeRepository,
            container,
            onSelect
          })


        const selectedA1 =
          browser.selectComponent(
            'process-1',
            false
          )

        expect(
          selectedA1?.name
        ).toBe(
          'Process A'
        )

        expect(
          repositoryA.documents
            .getActiveDocument()
            ?.fileName
        ).toBe(
          'repository-a.bpmn'
        )

        expect(
          repositoryB.documents
            .getActiveDocument()
        ).toBeNull()


        activeRepository.set(
          repositoryB
        )


        const selectedB =
          browser.selectComponent(
            'process-1',
            false
          )

        expect(
          selectedB?.name
        ).toBe(
          'Process B'
        )

        expect(
          repositoryB.documents
            .getActiveDocument()
            ?.fileName
        ).toBe(
          'repository-b.bpmn'
        )


        activeRepository.set(
          repositoryA
        )


        const selectedA2 =
          browser.selectComponent(
            'process-1',
            false
          )

        expect(
          selectedA2?.name
        ).toBe(
          'Process A'
        )


        expect(
          onSelect.mock.calls.map(
            ([ selectedDocument ]) =>
              selectedDocument?.fileName
          )
        ).toEqual([
          'repository-a.bpmn',
          'repository-b.bpmn',
          'repository-a.bpmn'
        ])


        browser.destroy()
        container.remove()
      }
    )


    it(
      'renders and selects A -> B -> A through one Browser',
      () => {

        const scopeStore =
          createRepositoryScopeStore()

        const repositoryA =
          scopeStore.createRepository(
            'repository-a-render'
          )

        const repositoryB =
          scopeStore.createRepository(
            'repository-b-render'
          )


        repositoryA.documents.addDocument({
          id: 'doc-1',
          fileName: 'render-a.bpmn',
          kind: 'bpmn',
          content: '<render-a />'
        })

        repositoryB.documents.addDocument({
          id: 'doc-1',
          fileName: 'render-b.bpmn',
          kind: 'bpmn',
          content: '<render-b />'
        })


        repositoryA.model.addComponent({
          id: 'process-1',
          type: 'process',
          name: 'Render Process A',
          documentId: 'doc-1'
        })

        repositoryB.model.addComponent({
          id: 'process-1',
          type: 'process',
          name: 'Render Process B',
          documentId: 'doc-1'
        })


        const activeRepository =
          createActiveRepository(
            repositoryA
          )

        const container =
          document.createElement(
            'div'
          )

        document.body.appendChild(
          container
        )

        const onSelect =
          vi.fn()

        const browser =
          createRepositoryBrowser({
            activeRepository,
            container,
            onSelect
          })


        const selectedA1 =
          browser.selectComponent(
            'process-1'
          )

        expect(
          selectedA1?.name
        ).toBe(
          'Render Process A'
        )

        expect(
          repositoryA.documents
            .getActiveDocument()
            ?.fileName
        ).toBe(
          'render-a.bpmn'
        )


        activeRepository.set(
          repositoryB
        )

        const selectedB =
          browser.selectComponent(
            'process-1'
          )

        expect(
          selectedB?.name
        ).toBe(
          'Render Process B'
        )

        expect(
          repositoryB.documents
            .getActiveDocument()
            ?.fileName
        ).toBe(
          'render-b.bpmn'
        )


        activeRepository.set(
          repositoryA
        )

        const selectedA2 =
          browser.selectComponent(
            'process-1'
          )

        expect(
          selectedA2?.name
        ).toBe(
          'Render Process A'
        )

        expect(
          onSelect.mock.calls.map(
            ([ selectedDocument ]) =>
              selectedDocument?.fileName
          )
        ).toEqual([
          'render-a.bpmn',
          'render-b.bpmn',
          'render-a.bpmn'
        ])


        browser.destroy()
        container.remove()
      }
    )


    it(
      'can exercise the historical direct Repository contract under jsdom',
      () => {

        const scopeStore =
          createRepositoryScopeStore()

        const repository =
          scopeStore.createRepository(
            'repository'
          )


        repository.documents.addDocument({
          id: 'doc-1',
          fileName: 'repository.bpmn',
          kind: 'bpmn',
          content: '<repository />'
        })


        repository.model.addComponent({
          id: 'process-1',
          type: 'process',
          name: 'Repository Process',
          documentId: 'doc-1'
        })


        const container =
          document.createElement(
            'div'
          )

        document.body.appendChild(
          container
        )


        const onSelect =
          vi.fn()


        const browser =
          createRepositoryBrowser({
            store:
              repository.documents,

            repositoryModel:
              repository.model,

            container,

            onSelect
          })


        const selected =
          browser.selectComponent(
            'process-1',
            false
          )


        expect(
          selected?.name
        ).toBe(
          'Repository Process'
        )

        expect(
          repository.documents
            .getActiveDocument()
            ?.id
        ).toBe(
          'doc-1'
        )

        expect(
          onSelect
        ).toHaveBeenCalledTimes(
          1
        )

        expect(
          onSelect.mock.calls[0][0]
            ?.fileName
        ).toBe(
          'repository.bpmn'
        )


        browser.destroy()
        container.remove()
      }
    )
  }
)

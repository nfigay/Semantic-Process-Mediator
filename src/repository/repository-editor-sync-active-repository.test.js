import {
  describe,
  expect,
  it,
  vi
} from 'vitest'

import {
  createActiveRepository
} from './active-repository.js'

import {
  createRepositoryScopeStore
} from './repository-scope-store.js'

import {
  createRepositoryEditorSync
} from './repository-editor-sync.js'


function createModeler() {
  const listeners =
    new Map()

  return {
    get(name) {
      if (name !== 'eventBus') {
        throw new Error(
          `Unexpected modeler service: ${name}`
        )
      }

      return {
        on(event, listener) {
          listeners.set(
            event,
            listener
          )
        },

        off(event, listener) {
          if (
            listeners.get(event) ===
            listener
          ) {
            listeners.delete(event)
          }
        }
      }
    },

    saveXML:
      vi.fn(
        async () => ({
          xml: '<saved />'
        })
      )
  }
}


describe(
  'RepositoryEditorSync active Repository',
  () => {

    it(
      'persists through A -> B -> A without reconstructing the consumer',
      async () => {

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
          fileName: 'a.bpmn',
          kind: 'bpmn',
          content: '<a />'
        })

        repositoryB.documents.addDocument({
          id: 'doc-1',
          fileName: 'b.bpmn',
          kind: 'bpmn',
          content: '<b />'
        })

        repositoryA.documents
          .setActiveDocument(
            'doc-1'
          )

        repositoryB.documents
          .setActiveDocument(
            'doc-1'
          )


        const activeRepository =
          createActiveRepository(
            repositoryA
          )

        const modeler =
          createModeler()

        const repositoryBrowser = {
          render:
            vi.fn()
        }


        const sync =
          createRepositoryEditorSync({
            modeler,
            activeRepository,
            repositoryBrowser
          })


        await sync.persist()

        expect(
          repositoryA.documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<saved />'
        )

        expect(
          repositoryB.documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<b />'
        )


        repositoryA.documents
          .updateDocument(
            'doc-1',
            {
              content: '<a-2 />',
              dirty: false
            }
          )

        activeRepository.set(
          repositoryB
        )

        await sync.persist()

        expect(
          repositoryA.documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<a-2 />'
        )

        expect(
          repositoryB.documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<saved />'
        )


        repositoryB.documents
          .updateDocument(
            'doc-1',
            {
              content: '<b-2 />',
              dirty: false
            }
          )

        activeRepository.set(
          repositoryA
        )

        await sync.persist()

        expect(
          repositoryA.documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<saved />'
        )

        expect(
          repositoryB.documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<b-2 />'
        )


        sync.destroy()
      }
    )


    it(
      'preserves the historical direct-store contract',
      async () => {

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
          content: '<before />'
        })

        repository.documents
          .setActiveDocument(
            'doc-1'
          )


        const sync =
          createRepositoryEditorSync({
            modeler:
              createModeler(),
            repositoryDocumentStore:
              repository.documents,
            repositoryModel:
              repository.model,
            repositoryBrowser: {
              render:
                vi.fn()
            }
          })


        await sync.persist()


        expect(
          repository.documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<saved />'
        )


        sync.destroy()
      }
    )


    it(
      'does not persist a stale save after the active Repository changes',
      async () => {

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
          fileName: 'a.bpmn',
          kind: 'bpmn',
          content: '<a />'
        })

        repositoryB.documents.addDocument({
          id: 'doc-1',
          fileName: 'b.bpmn',
          kind: 'bpmn',
          content: '<b />'
        })

        repositoryA.documents
          .setActiveDocument(
            'doc-1'
          )

        repositoryB.documents
          .setActiveDocument(
            'doc-1'
          )


        const activeRepository =
          createActiveRepository(
            repositoryA
          )


        let resolveSave

        const modeler =
          createModeler()

        modeler.saveXML =
          vi.fn(
            () =>
              new Promise(
                resolve => {
                  resolveSave =
                    resolve
                }
              )
          )


        const sync =
          createRepositoryEditorSync({
            modeler,
            activeRepository,
            repositoryBrowser: {
              render:
                vi.fn()
            }
          })


        const pendingPersist =
          sync.persist()


        activeRepository.set(
          repositoryB
        )


        resolveSave({
          xml: '<stale-a-save />'
        })


        const result =
          await pendingPersist


        expect(
          result
        ).toBeNull()

        expect(
          repositoryA.documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<a />'
        )

        expect(
          repositoryB.documents
            .getDocument('doc-1')
            .content
        ).toBe(
          '<b />'
        )


        sync.destroy()
      }
    )
  }
)

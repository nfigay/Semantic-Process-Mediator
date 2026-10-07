import {
  describe,
  expect,
  it
} from 'vitest'

import {
  createRepositoryScopeStore
} from './repository-scope-store.js'


describe(
  'Repository scope store',
  () => {
    it(
      'keeps model and document identities local to each repository scope',
      () => {
        const store =
          createRepositoryScopeStore()

        const repositoryA =
          store.createRepository(
            'repository-a'
          )

        const repositoryB =
          store.createRepository(
            'repository-b'
          )

        const componentA =
          repositoryA.model.addComponent({
            id:
              'process-1',

            name:
              'Process A'
          })

        const componentB =
          repositoryB.model.addComponent({
            id:
              'process-1',

            name:
              'Process B'
          })

        const documentA =
          repositoryA.documents.addDocument({
            id:
              'doc-1',

            content:
              '<definitions id="A" />'
          })

        const documentB =
          repositoryB.documents.addDocument({
            id:
              'doc-1',

            content:
              '<definitions id="B" />'
          })

        expect(
          repositoryA.model.getComponent(
            'process-1'
          )
        ).toBe(
          componentA
        )

        expect(
          repositoryB.model.getComponent(
            'process-1'
          )
        ).toBe(
          componentB
        )

        expect(
          repositoryA.documents.getDocument(
            'doc-1'
          )
        ).toBe(
          documentA
        )

        expect(
          repositoryB.documents.getDocument(
            'doc-1'
          )
        ).toBe(
          documentB
        )

        expect(
          documentA
        ).not.toBe(
          documentB
        )
      }
    )

    it(
      'owns independent repository context state for each repository scope',
      () => {
        const store =
          createRepositoryScopeStore()

        const repositoryA =
          store.createRepository(
            'repository-a'
          )

        const repositoryB =
          store.createRepository(
            'repository-b'
          )

        expect(
          repositoryA.repositoryContext
        ).toBeNull()

        expect(
          repositoryB.repositoryContext
        ).toBeNull()

        repositoryA.repositoryContext = {
          cocOwner:
            'CoC_A',
          maturity:
            'L2'
        }

        expect(
          repositoryB.repositoryContext
        ).toBeNull()
      }
    )


    it(
      'keeps active document state independent between repository scopes',
      () => {
        const store =
          createRepositoryScopeStore()

        const repositoryA =
          store.createRepository(
            'repository-a'
          )

        const repositoryB =
          store.createRepository(
            'repository-b'
          )

        const documentA1 =
          repositoryA.documents.addDocument({
            id:
              'doc-1'
          })

        const documentA2 =
          repositoryA.documents.addDocument({
            id:
              'doc-2'
          })

        const documentB1 =
          repositoryB.documents.addDocument({
            id:
              'doc-1'
          })

        const documentB2 =
          repositoryB.documents.addDocument({
            id:
              'doc-2'
          })

        repositoryA.documents
          .setActiveDocument(
            documentA1.id
          )

        repositoryB.documents
          .setActiveDocument(
            documentB2.id
          )

        expect(
          repositoryA.documents
            .getActiveDocument()
        ).toBe(
          documentA1
        )

        expect(
          repositoryB.documents
            .getActiveDocument()
        ).toBe(
          documentB2
        )

        repositoryA.documents
          .setActiveDocument(
            documentA2.id
          )

        expect(
          repositoryA.documents
            .getActiveDocument()
        ).toBe(
          documentA2
        )

        expect(
          repositoryB.documents
            .getActiveDocument()
        ).toBe(
          documentB2
        )

        expect(
          repositoryB.documents.getDocument(
            documentB1.id
          )
        ).toBe(
          documentB1
        )
      }
    )

    it(
      'isolates document update remove and clear operations between scopes',
      () => {
        const store =
          createRepositoryScopeStore()

        const repositoryA =
          store.createRepository(
            'repository-a'
          )

        const repositoryB =
          store.createRepository(
            'repository-b'
          )

        const documentA =
          repositoryA.documents.addDocument({
            id:
              'doc-1',

            content:
              'A'
          })

        const documentB =
          repositoryB.documents.addDocument({
            id:
              'doc-1',

            content:
              'B'
          })

        repositoryA.documents
          .setActiveDocument(
            documentA.id
          )

        repositoryB.documents
          .setActiveDocument(
            documentB.id
          )

        repositoryA.documents.updateDocument(
          documentA.id,
          {
            content:
              'A-updated',

            dirty:
              true
          }
        )

        expect(
          repositoryA.documents
            .getDocument(
              'doc-1'
            )
            .content
        ).toBe(
          'A-updated'
        )

        expect(
          repositoryB.documents
            .getDocument(
              'doc-1'
            )
            .content
        ).toBe(
          'B'
        )

        repositoryA.documents.removeDocument(
          'doc-1'
        )

        expect(
          repositoryA.documents
            .getActiveDocument()
        ).toBeNull()

        expect(
          repositoryB.documents
            .getActiveDocument()
        ).toBe(
          documentB
        )

        repositoryA.documents.addDocument({
          id:
            'doc-2'
        })

        repositoryA.documents.clear()

        expect(
          repositoryA.documents.getDocuments()
        ).toEqual([])

        expect(
          repositoryB.documents.getDocuments()
        ).toEqual([
          documentB
        ])

        expect(
          repositoryB.documents
            .getActiveDocument()
        ).toBe(
          documentB
        )
      }
    )

    it(
      'keeps containers components and references isolated between scopes',
      () => {
        const store =
          createRepositoryScopeStore()

        const repositoryA =
          store.createRepository(
            'repository-a'
          )

        const repositoryB =
          store.createRepository(
            'repository-b'
          )

        const containerA =
          repositoryA.model.addContainer({
            id:
              'coc-1'
          })

        const containerB =
          repositoryB.model.addContainer({
            id:
              'coc-1'
          })

        const componentA =
          repositoryA.model.addComponent({
            id:
              'process-1'
          })

        const componentB =
          repositoryB.model.addComponent({
            id:
              'process-1'
          })

        const referenceA =
          repositoryA.model.addReference({
            id:
              'reference-1',

            sourceId:
              'process-1',

            targetId:
              'missing-1'
          })

        const referenceB =
          repositoryB.model.addReference({
            id:
              'reference-1',

            sourceId:
              'process-1',

            targetId:
              'missing-1'
          })

        expect(
          repositoryA.model.getContainer(
            'coc-1'
          )
        ).toBe(
          containerA
        )

        expect(
          repositoryB.model.getContainer(
            'coc-1'
          )
        ).toBe(
          containerB
        )

        expect(
          repositoryA.model.getComponent(
            'process-1'
          )
        ).toBe(
          componentA
        )

        expect(
          repositoryB.model.getComponent(
            'process-1'
          )
        ).toBe(
          componentB
        )

        expect(
          repositoryA.model.getReference(
            'reference-1'
          )
        ).toBe(
          referenceA
        )

        expect(
          repositoryB.model.getReference(
            'reference-1'
          )
        ).toBe(
          referenceB
        )

        expect(
          referenceA
        ).not.toBe(
          referenceB
        )
      }
    )

    it(
      'recreates a removed repository id with fresh model and document stores',
      () => {
        const store =
          createRepositoryScopeStore()

        const repositoryA =
          store.createRepository(
            'repository-a'
          )

        const repositoryB =
          store.createRepository(
            'repository-b'
          )

        repositoryA.model.addComponent({
          id:
            'process-1'
        })

        repositoryA.documents.addDocument({
          id:
            'doc-1'
        })

        const documentB =
          repositoryB.documents.addDocument({
            id:
              'doc-1'
          })

        repositoryB.documents
          .setActiveDocument(
            documentB.id
          )

        expect(
          store.removeRepository(
            'repository-a'
          )
        ).toBe(
          true
        )

        const repositoryA2 =
          store.createRepository(
            'repository-a'
          )

        expect(
          repositoryA2
        ).not.toBe(
          repositoryA
        )

        expect(
          repositoryA2.model
        ).not.toBe(
          repositoryA.model
        )

        expect(
          repositoryA2.documents
        ).not.toBe(
          repositoryA.documents
        )

        expect(
          repositoryA2.model.getComponents()
        ).toEqual([])

        expect(
          repositoryA2.documents.getDocuments()
        ).toEqual([])

        expect(
          repositoryA2.documents
            .getActiveDocument()
        ).toBeNull()

        expect(
          repositoryB.documents
            .getActiveDocument()
        ).toBe(
          documentB
        )
      }
    )

    it(
      'validates repository ids and rejects duplicate scopes',
      () => {
        const store =
          createRepositoryScopeStore()

        expect(
          () =>
            store.createRepository('')
        ).toThrow(
          'Repository scope requires a repositoryId'
        )

        expect(
          () =>
            store.createRepository(null)
        ).toThrow(
          'Repository scope requires a repositoryId'
        )

        const repositoryA =
          store.createRepository(
            'repository-a'
          )

        expect(
          () =>
            store.createRepository(
              'repository-a'
            )
        ).toThrow(
          'Repository scope already exists: repository-a'
        )

        expect(
          store.getRepository(
            'repository-a'
          )
        ).toBe(
          repositoryA
        )

        expect(
          store.removeRepository(
            'missing'
          )
        ).toBe(
          false
        )
      }
    )

    it(
      'clears the scope catalogue without mutating detached repository state',
      () => {
        const store =
          createRepositoryScopeStore()

        const repositoryA =
          store.createRepository(
            'repository-a'
          )

        const repositoryB =
          store.createRepository(
            'repository-b'
          )

        const componentA =
          repositoryA.model.addComponent({
            id:
              'process-1'
          })

        const documentA =
          repositoryA.documents.addDocument({
            id:
              'doc-1'
          })

        const componentB =
          repositoryB.model.addComponent({
            id:
              'process-1'
          })

        const documentB =
          repositoryB.documents.addDocument({
            id:
              'doc-1'
          })

        repositoryA.documents
          .setActiveDocument(
            documentA.id
          )

        repositoryB.documents
          .setActiveDocument(
            documentB.id
          )

        store.clear()

        expect(
          store.getRepositories()
        ).toEqual([])

        expect(
          store.getRepository(
            'repository-a'
          )
        ).toBeNull()

        expect(
          store.getRepository(
            'repository-b'
          )
        ).toBeNull()

        expect(
          repositoryA.model.getComponent(
            'process-1'
          )
        ).toBe(
          componentA
        )

        expect(
          repositoryA.documents
            .getActiveDocument()
        ).toBe(
          documentA
        )

        expect(
          repositoryB.model.getComponent(
            'process-1'
          )
        ).toBe(
          componentB
        )

        expect(
          repositoryB.documents
            .getActiveDocument()
        ).toBe(
          documentB
        )
      }
    )
  }
)

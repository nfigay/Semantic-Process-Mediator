import {
  describe,
  expect,
  test,
  vi
} from 'vitest'

import {
  createRepositoryScopeStore
} from './repository-scope-store.js'

import {
  createActiveRepository
} from './active-repository.js'

import {
  switchActiveRepository
} from './active-repository-switch.js'


function addBpmnDocument(
  repository,
  {
    id,
    xml
  }
) {

  repository.documents.addDocument({
    id,
    fileName:
      `${id}.bpmn`,
    kind:
      'bpmn',
    content:
      xml,
    dirty:
      false
  })

  repository.documents.setActiveDocument(
    id
  )
}


describe(
  'active Repository switch',
  () => {

    test(
      'switches A -> B -> A, restores each active view and refreshes read projections without canonical reconstruction',
      async () => {

        const repositoryScopeStore =
          createRepositoryScopeStore()

        const repositoryA =
          repositoryScopeStore
            .createRepository(
              'repository-a'
            )

        const repositoryB =
          repositoryScopeStore
            .createRepository(
              'repository-b'
            )


        repositoryA.workspace.name =
          'Workspace A'

        repositoryB.workspace.name =
          'Workspace B'


        addBpmnDocument(
          repositoryA,
          {
            id:
              'process-a',
            xml:
              '<definitions id="A" />'
          }
        )

        addBpmnDocument(
          repositoryB,
          {
            id:
              'process-b',
            xml:
              '<definitions id="B" />'
          }
        )


        repositoryA.model.addComponent({
          id:
            'component-a',
          type:
            'process',
          name:
            'Component A'
        })

        repositoryB.model.addComponent({
          id:
            'component-b',
          type:
            'process',
          name:
            'Component B'
        })


        const activeRepository =
          createActiveRepository(
            repositoryA
          )

        const diagramActions = {
          loadDiagram:
            vi.fn()
              .mockResolvedValue()
        }

        const showArchimate =
          vi.fn()

        const renderRepositoryBrowser =
          vi.fn()

        const refreshBusinessModelExplorer =
          vi.fn()


        const dependencies = {
          repositoryScopeStore,
          activeRepository,
          diagramActions,
          showArchimate,
          renderRepositoryBrowser,
          refreshBusinessModelExplorer
        }


        const switchedToB =
          await switchActiveRepository({
            ...dependencies,
            repositoryId:
              'repository-b'
          })


        expect(
          switchedToB
        ).toBe(
          repositoryB
        )

        expect(
          activeRepository.get()
        ).toBe(
          repositoryB
        )

        expect(
          diagramActions.loadDiagram
        ).toHaveBeenLastCalledWith(
          '<definitions id="B" />'
        )

        expect(
          renderRepositoryBrowser
        ).toHaveBeenCalledTimes(
          1
        )

        expect(
          refreshBusinessModelExplorer
        ).toHaveBeenCalledTimes(
          1
        )


        const switchedToA =
          await switchActiveRepository({
            ...dependencies,
            repositoryId:
              'repository-a'
          })


        expect(
          switchedToA
        ).toBe(
          repositoryA
        )

        expect(
          activeRepository.get()
        ).toBe(
          repositoryA
        )

        expect(
          diagramActions.loadDiagram
        ).toHaveBeenNthCalledWith(
          2,
          '<definitions id="A" />'
        )

        expect(
          renderRepositoryBrowser
        ).toHaveBeenCalledTimes(
          2
        )

        expect(
          refreshBusinessModelExplorer
        ).toHaveBeenCalledTimes(
          2
        )


        expect(
          repositoryA.model.getComponent(
            'component-a'
          )?.name
        ).toBe(
          'Component A'
        )

        expect(
          repositoryA.model.getComponent(
            'component-b'
          )
        ).toBeNull()

        expect(
          repositoryB.model.getComponent(
            'component-b'
          )?.name
        ).toBe(
          'Component B'
        )

        expect(
          repositoryB.model.getComponent(
            'component-a'
          )
        ).toBeNull()


        expect(
          repositoryA.documents
            .getActiveDocument()
            ?.id
        ).toBe(
          'process-a'
        )

        expect(
          repositoryB.documents
            .getActiveDocument()
            ?.id
        ).toBe(
          'process-b'
        )

        expect(
          showArchimate
        ).not.toHaveBeenCalled()
      }
    )


    test(
      'leaves the current Repository unchanged when the requested id does not exist',
      async () => {

        const repositoryScopeStore =
          createRepositoryScopeStore()

        const repositoryA =
          repositoryScopeStore
            .createRepository(
              'repository-a'
            )

        const activeRepository =
          createActiveRepository(
            repositoryA
          )

        const diagramActions = {
          loadDiagram:
            vi.fn()
        }

        const renderRepositoryBrowser =
          vi.fn()

        const refreshBusinessModelExplorer =
          vi.fn()


        const result =
          await switchActiveRepository({
            repositoryId:
              'missing',
            repositoryScopeStore,
            activeRepository,
            diagramActions,
            showArchimate:
              vi.fn(),
            renderRepositoryBrowser,
            refreshBusinessModelExplorer
          })


        expect(result).toBeNull()

        expect(
          activeRepository.get()
        ).toBe(
          repositoryA
        )

        expect(
          diagramActions.loadDiagram
        ).not.toHaveBeenCalled()

        expect(
          renderRepositoryBrowser
        ).not.toHaveBeenCalled()

        expect(
          refreshBusinessModelExplorer
        ).not.toHaveBeenCalled()
      }
    )
  }
)

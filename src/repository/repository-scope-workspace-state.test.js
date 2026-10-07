import {
  describe,
  expect,
  it
} from 'vitest'

import {
  createRepositoryScopeStore
} from './repository-scope-store.js'


describe(
  'Repository scope workspace state',
  () => {

    it(
      'owns independent workspace state for each autonomous Repository',
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


        expect(
          repositoryA.workspace
        ).toEqual({
          mode:
            'memory',

          directoryHandle:
            null,

          name:
            null,

          workspaceId:
            null,

          createdAt:
            null,

          savedAt:
            null,

          fileHandles:
            expect.any(Map),

          loadedBusinessModelState:
            null
        })


        expect(
          repositoryB.workspace
        ).toEqual({
          mode:
            'memory',

          directoryHandle:
            null,

          name:
            null,

          workspaceId:
            null,

          createdAt:
            null,

          savedAt:
            null,

          fileHandles:
            expect.any(Map),

          loadedBusinessModelState:
            null
        })


        expect(
          repositoryA.workspace
        ).not.toBe(
          repositoryB.workspace
        )


        expect(
          repositoryA.workspace.fileHandles
        ).not.toBe(
          repositoryB.workspace.fileHandles
        )


        const directoryHandleA = {
          name:
            'A'
        }


        repositoryA.workspace.mode =
          'folder'

        repositoryA.workspace.directoryHandle =
          directoryHandleA

        repositoryA.workspace.name =
          'A'

        repositoryA.workspace.fileHandles.set(
          'document-a',
          {
            name:
              'a.bpmn'
          }
        )

        repositoryA.workspace.loadedBusinessModelState = {
          repositoryDocumentId:
            'business-a'
        }


        expect(
          repositoryB.workspace
        ).toEqual({
          mode:
            'memory',

          directoryHandle:
            null,

          name:
            null,

          workspaceId:
            null,

          createdAt:
            null,

          savedAt:
            null,

          fileHandles:
            expect.any(Map),

          loadedBusinessModelState:
            null
        })


        expect(
          repositoryB.workspace.fileHandles.size
        ).toBe(
          0
        )
      }
    )
  }
)

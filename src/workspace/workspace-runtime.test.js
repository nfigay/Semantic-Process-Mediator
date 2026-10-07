import { test } from 'vitest'
import assert from 'node:assert/strict'

import {
  WORKSPACE_METADATA_PATH,
  createWorkspaceState,
  createWorkspaceMetadata,
  readWorkspaceMetadata,
  resolveRepositoryResourceKind,
  createRepositoryScopeTransition
} from './workspace-runtime.js'


test(
  'workspace metadata roundtrip',
  () => {

    const metadata =
      createWorkspaceMetadata({
        workspaceId: 'workspace-1',
        createdAt: '2026-10-01T10:00:00Z',
        savedAt: '2026-10-01T11:00:00Z',
        name: 'Demo',
        snapshotIteration: 3
      })

    const result =
      readWorkspaceMetadata([
        {
          path:
            WORKSPACE_METADATA_PATH,
          content:
            JSON.stringify(metadata)
        }
      ])

    assert.equal(
      result.workspaceId,
      'workspace-1'
    )

    assert.equal(
      result.snapshotIteration,
      3
    )
  }
)


test(
  'workspace state starts in memory',
  () => {

    const workspace =
      createWorkspaceState()

    assert.equal(
      workspace.mode,
      'memory'
    )

    assert.ok(
      workspace.fileHandles instanceof Map
    )
  }
)


test(
  'resource kind identifies model documents',
  () => {

    assert.equal(
      resolveRepositoryResourceKind(
        'models/demo.bpmn'
      ),
      'bpmn'
    )

    assert.equal(
      resolveRepositoryResourceKind(
        'models/demo.archimate'
      ),
      'archimate'
    )
  }
)


test(
  'repository transition is atomic on preparation failure',
  async () => {

    const original = {
      id: 'original'
    }

    let active =
      original

    const transition =
      createRepositoryScopeTransition({

        createRepository(id) {
          return {
            id,
            workspace:
              createWorkspaceState()
          }
        },

        getActiveRepository() {
          return active
        },

        setActiveRepository(repository) {
          active = repository
        }
      })


    await assert.rejects(
      transition.prepareAndActivate({
        repositoryId:
          'candidate',

        prepare() {
          throw new Error(
            'preparation failed'
          )
        }
      })
    )


    assert.equal(
      active,
      original
    )
  }
)


test(
  'workspace archive preserves documents and metadata',
  async () => {

    const {
      createRepositoryWorkspaceArchive,
      readRepositoryWorkspaceArchive
    } =
      await import(
        './workspace-runtime.js'
      )


    const metadata =
      createWorkspaceMetadata({
        workspaceId:
          'workspace-archive',
        createdAt:
          '2026-10-01T10:00:00Z',
        savedAt:
          '2026-10-01T11:00:00Z',
        name:
          'Archive Demo',
        snapshotIteration:
          2
      })


    const archive =
      await createRepositoryWorkspaceArchive(
        [
          {
            fileName:
              'models/demo.bpmn',
            kind:
              'bpmn',
            content:
              '<definitions id="demo"/>',
            dirty:
              false
          },

          {
            fileName:
              'models/demo.archimate',
            kind:
              'archimate',
            content:
              '<model id="archi"/>',
            dirty:
              true
          }
        ],
        {
          includeClean:
            true,
          workspaceMetadata:
            metadata
        }
      )


    assert.ok(
      archive instanceof Uint8Array
    )


    const resources =
      await readRepositoryWorkspaceArchive(
        archive
      )


    const bpmn =
      resources.find(
        resource =>
          resource.path ===
          'models/demo.bpmn'
      )

    assert.equal(
      bpmn.content,
      '<definitions id="demo"/>'
    )


    const restoredMetadata =
      readWorkspaceMetadata(
        resources
      )

    assert.equal(
      restoredMetadata.workspaceId,
      'workspace-archive'
    )

    assert.equal(
      restoredMetadata.snapshotIteration,
      2
    )
  }
)


test(
  'workspace archive can contain dirty documents only',
  async () => {

    const {
      createRepositoryWorkspaceArchive,
      readRepositoryWorkspaceArchive
    } =
      await import(
        './workspace-runtime.js'
      )


    const archive =
      await createRepositoryWorkspaceArchive(
        [
          {
            fileName:
              'clean.bpmn',
            content:
              'clean',
            dirty:
              false
          },

          {
            fileName:
              'dirty.bpmn',
            content:
              'dirty',
            dirty:
              true
          }
        ],
        {
          includeClean:
            false
        }
      )


    const resources =
      await readRepositoryWorkspaceArchive(
        archive
      )


    assert.deepEqual(
      resources.map(
        resource =>
          resource.path
      ),
      [
        'dirty.bpmn'
      ]
    )
  }
)

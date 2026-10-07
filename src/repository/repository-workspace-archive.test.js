import {
  describe,
  expect,
  it
} from 'vitest'

import {
  createRepositoryWorkspaceArchive,
  readRepositoryWorkspaceArchive
} from './repository-workspace-archive.js'


describe(
  'Repository workspace archive — dirty repository documents',
  () => {
    it(
      'materializes dirty documents under their exact repository-relative paths without mutating dirty state',
      () => {
        const documents = [
          {
            id: 'process-a',
            fileName: 'processes/a.bpmn',
            kind: 'bpmn',
            content: '<definitions id="A-updated" />',
            dirty: true
          },
          {
            id: 'architecture',
            fileName: 'architecture/landscape.archimate',
            kind: 'archimate',
            content: '<model id="architecture" />',
            dirty: false
          },
          {
            id: 'business-model',
            fileName: 'business-model/model.json',
            kind: 'business-model',
            content: '{"formatVersion":"1","name":"Café"}',
            dirty: true
          }
        ]

        const archive = createRepositoryWorkspaceArchive(documents)
        const resources = readRepositoryWorkspaceArchive(archive)

        expect(archive).toBeInstanceOf(Uint8Array)
        expect(resources).toEqual([
          {
            path: 'processes/a.bpmn',
            content: '<definitions id="A-updated" />'
          },
          {
            path: 'business-model/model.json',
            content: '{"formatVersion":"1","name":"Café"}'
          }
        ])
        expect(documents.map(document => document.dirty)).toEqual([
          true,
          false,
          true
        ])
      }
    )

    it(
      'can materialize the complete active Repository for a portable Workspace archive',
      () => {
        const documents = [
          { id: 'a', fileName: 'a.bpmn', content: '<a />', dirty: false },
          { id: 'b', fileName: 'b.bpmn', content: '<b />', dirty: true }
        ]

        const resources = readRepositoryWorkspaceArchive(
          createRepositoryWorkspaceArchive(documents, { includeClean: true })
        )

        expect(resources.map(resource => resource.path)).toEqual([
          'a.bpmn',
          'b.bpmn'
        ])
      }
    )

    it(
      'rejects compression methods outside the current BPMNSM stored-entry archive format',
      () => {
        const archive = createRepositoryWorkspaceArchive([
          {
            id: 'process-a',
            fileName: 'processes/a.bpmn',
            content: '<definitions />',
            dirty: true
          }
        ])
        const unsupportedArchive = archive.slice()
        const view = new DataView(unsupportedArchive.buffer)

        view.setUint16(8, 8, true)

        expect(
          () => readRepositoryWorkspaceArchive(unsupportedArchive)
        ).toThrow(
          'Unsupported BPMNSM workspace archive compression method: 8'
        )
      }
    )

    it(
      'rejects corrupted stored entry content through CRC validation',
      () => {
        const archive = createRepositoryWorkspaceArchive([
          {
            id: 'process-a',
            fileName: 'processes/a.bpmn',
            content: '<definitions />',
            dirty: true
          }
        ])
        const corruptedArchive = archive.slice()
        const view = new DataView(corruptedArchive.buffer)
        const nameLength = view.getUint16(26, true)
        const extraLength = view.getUint16(28, true)
        const contentOffset = 30 + nameLength + extraLength

        corruptedArchive[contentOffset] ^= 0xff

        expect(
          () => readRepositoryWorkspaceArchive(corruptedArchive)
        ).toThrow(
          'Invalid BPMNSM workspace archive: CRC mismatch for processes/a.bpmn'
        )
      }
    )
  }
)

import { describe, expect, it } from 'vitest'
import { createWorkspaceContextsProjection } from './workspace-contexts-projection.js'
import { createRepositoryModel } from '../repository/repository-model.js'

describe('workspace Referential membership projection', () => {
  it('projects the same repository Process under its Referential', () => {
    const repositoryModel = createRepositoryModel()
    const process = repositoryModel.addComponent({ id: 'doc-2::Process_1', type: 'process', name: 'Derived Process', documentId: 'doc-2', metadata: { bpmnId: 'Process_1' } })
    repositoryModel.addReference({ id: 'ref-membership', type: 'contains', sourceId: 'ref-1', targetId: process.id, role: 'referential-member' })
    const projection = createWorkspaceContextsProjection({
      businessObjects: [{ id: 'ref-1', name: 'Technical Reference Framework', typeRefs: ['Referential'] }],
      repositoryModel
    })
    expect(projection.referentials.entriesByBusinessObjectId.get('ref-1').components).toEqual([process])
  })
})

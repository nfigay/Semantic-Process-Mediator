import { describe, expect, test } from 'vitest'
import { createWorkspaceContextsProjection } from './workspace-contexts-projection.js'
import { createEnvironmentProjection } from '../repository/environment-projection.js'

describe('Workspace Contexts / Repositories projection', () => {
  test('projects instanced CoC and Repository Business Objects without RepositoryModel containers', () => {
    const projection = createWorkspaceContextsProjection({
      businessObjects: [
        { id: 'coc-avionics', name: 'Avionics', typeRefs: [ 'CoC' ] },
        { id: 'ref-a', name: 'Technical Reference Framework', typeRefs: [ 'Referential' ] },
        { id: 'repo-a', name: 'Repository A', typeRefs: [ 'Repository' ] },
        { id: 'other', name: 'Other', typeRefs: [ 'SomethingElse' ] }
      ]
    })
    expect(projection.cocs.resolved).toBe(true)
    expect(projection.repositories.resolved).toBe(true)
    expect(projection.referentials.resolved).toBe(true)
    expect(projection.cocs.businessObjects.map(o => o.id)).toEqual([ 'coc-avionics' ])
    expect(projection.repositories.businessObjects.map(o => o.id)).toEqual([ 'repo-a' ])
    expect(projection.referentials.businessObjects.map(o => o.id)).toEqual([ 'ref-a' ])
  })

  test('projects direct Process membership below its CoC Business Object', () => {
    const containers = [ { id: 'coc-avionics', type: 'coc', name: 'Avionics' } ]
    const components = [ { id: 'doc::Process_A', type: 'process', name: 'Process A', metadata: { bpmnId: 'Process_A' } } ]
    const references = [ { id: 'membership', type: 'contains', sourceId: 'coc-avionics', targetId: 'doc::Process_A' } ]
    const repositoryModel = {
      getContainers: () => containers,
      getComponents: () => components,
      getReferences: () => references,
      getChildren(id) {
        return references
          .filter(reference => reference.type === 'contains' && reference.sourceId === id)
          .map(reference => ({ resolved: true, component: components.find(component => component.id === reference.targetId) }))
      }
    }

    const projection = createWorkspaceContextsProjection({
      businessObjects: [ { id: 'coc-avionics', name: 'Avionics', typeRefs: [ 'CoC' ] } ],
      repositoryModel
    })

    expect(projection.cocs.entriesByBusinessObjectId.get('coc-avionics')?.processes.map(process => process.id)).toEqual([ 'doc::Process_A' ])
  })


  test('keeps a directly CoC-contextualized Process visible as a root model occurrence', () => {
    const containers = [ { id: 'coc-avionics', type: 'coc', name: 'Avionics' } ]
    const components = [ { id: 'doc::Process_A', type: 'process', name: 'Process A', documentId: 'doc', metadata: { bpmnId: 'Process_A' } } ]
    const references = [ { id: 'membership', type: 'contains', sourceId: 'coc-avionics', targetId: 'doc::Process_A' } ]
    const repositoryModel = {
      getContainers: () => containers,
      getComponents: () => components,
      getReferences: () => references,
      getChildren(id) {
        return references
          .filter(reference => reference.type === 'contains' && reference.sourceId === id)
          .map(reference => ({ resolved: true, component: components.find(component => component.id === reference.targetId) }))
      }
    }

    const projection = createWorkspaceContextsProjection({
      businessObjects: [ { id: 'coc-avionics', name: 'Avionics', typeRefs: [ 'CoC' ] } ],
      repositoryModel
    })

    expect(projection.cocs.entriesByBusinessObjectId.get('coc-avionics')?.processes.map(process => process.id)).toEqual([ 'doc::Process_A' ])

    // Direct CoC membership is a contextual occurrence, not a move.
    // The same repository component therefore remains available to the
    // Models projection as a root Process occurrence.
    const environment = createEnvironmentProjection({ repositoryModel })
    expect(environment.processes.map(process => process.id)).toContain('doc::Process_A')
  })

})

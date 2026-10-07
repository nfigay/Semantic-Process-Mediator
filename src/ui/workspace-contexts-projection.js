import { createEnvironmentProjection } from '../repository/environment-projection.js'
import { businessObjectHasSemanticType } from '../model/business-object-type-resolver.js'
import { createWorkspaceBusinessTypeSource, getWorkspaceBusinessContextRoles } from '../model/workspace-business-type-source.js'

export function createWorkspaceContextsProjection({ businessObjects = [], repositoryModel = null, projectionProfile = undefined } = {}) {
  const source = createWorkspaceBusinessTypeSource()
  const roles = getWorkspaceBusinessContextRoles()
  const types = source.getTypes?.() || []
  const typeById = new Map(types.map(type => [type.id, type]))

  function project(typeRef) {
    const type = typeById.get(typeRef) || null
    return {
      typeRef,
      type,
      resolved: Boolean(type),
      businessObjects: type
        ? businessObjects.filter(object => businessObjectHasSemanticType(object, type.id))
        : []
    }
  }

  const cocProjection = project(roles.cocTypeRef)

  const environment = repositoryModel
    ? createEnvironmentProjection({
        repositoryModel,
        ...(projectionProfile ? { projectionProfile } : {})
      })
    : null

  const cocEntriesById = new Map(
    (environment?.cocs || []).map(entry => [ entry.container?.id, entry ])
  )

  const referentialProjection = project(roles.referentialTypeRef)
  const referentialEntriesById = new Map(
    referentialProjection.businessObjects.map(object => {
      const components = repositoryModel
        ? repositoryModel.getOutgoingReferences(object.id)
            .filter(reference => reference.type === 'contains' && reference.role === 'referential-member')
            .map(reference => repositoryModel.getComponent(reference.targetId))
            .filter(Boolean)
        : []
      return [ object.id, { businessObject: object, components } ]
    })
  )

  return {
    repositories: project(roles.repositoryTypeRef),
    referentials: {
      ...referentialProjection,
      entriesByBusinessObjectId: referentialEntriesById
    },
    cocs: {
      ...cocProjection,
      entriesByBusinessObjectId: cocEntriesById
    }
  }
}

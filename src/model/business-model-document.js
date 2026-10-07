/*
 * ------------------------------------------------------------
 * BPMNSM Business Model Document
 *
 * Format-neutral data projection of a BusinessModelResource.
 *
 * This boundary deliberately contains no JSON/XML encoding, BPMN,
 * BusinessObjectRepresentation or RepositoryDocument concern.
 * ------------------------------------------------------------
 */

import {
  createBusinessModelResource
} from './business-model-resource.js'


export function projectBusinessModelDocument(
  resource
) {

  requireResource(resource)

  return Object.freeze({
    identityOrigins:
      Object.freeze([
        ...resource.getIdentityOrigins()
      ]),
    businessObjects:
      Object.freeze([
        ...resource.getBusinessObjects()
      ]),
    businessRelations:
      Object.freeze([
        ...resource.getBusinessRelations()
      ]),
    businessObjectExternalIdentities:
      Object.freeze([
        ...resource.getBusinessObjectExternalIdentities()
      ])
  })
}


export function createBusinessModelResourceFromDocument(
  document
) {

  const normalizedDocument =
    normalizeDocument(document)

  const resource =
    createBusinessModelResource()

  for (const origin of normalizedDocument.identityOrigins) {
    resource.addIdentityOrigin(origin)
  }

  for (const businessObject of normalizedDocument.businessObjects) {
    resource.addBusinessObject(businessObject)
  }

  for (const businessRelation of normalizedDocument.businessRelations) {
    resource.addBusinessRelation(businessRelation)
  }

  for (
    const externalIdentity
    of normalizedDocument.businessObjectExternalIdentities
  ) {
    resource.attachExternalIdentity(externalIdentity)
  }

  return resource
}


function requireResource(resource) {

  const requiredMethods = [
    'getIdentityOrigins',
    'getBusinessObjects',
    'getBusinessRelations',
    'getBusinessObjectExternalIdentities'
  ]

  if (
    !resource ||
    requiredMethods.some(
      method => typeof resource[method] !== 'function'
    )
  ) {
    throw new Error(
      'projectBusinessModelDocument requires a BusinessModelResource'
    )
  }
}


function normalizeDocument(document) {

  if (!document || typeof document !== 'object') {
    throw new Error(
      'BusinessModelDocument requires an object'
    )
  }

  return {
    identityOrigins:
      requireCollection(document, 'identityOrigins'),
    businessObjects:
      requireCollection(document, 'businessObjects'),
    businessRelations:
      requireCollection(document, 'businessRelations'),
    businessObjectExternalIdentities:
      requireCollection(
        document,
        'businessObjectExternalIdentities'
      )
  }
}


function requireCollection(
  document,
  propertyName
) {

  if (!Array.isArray(document[propertyName])) {
    throw new Error(
      `BusinessModelDocument requires ${propertyName}[]`
    )
  }

  return document[propertyName]
}

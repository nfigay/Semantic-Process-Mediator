/*
 * ------------------------------------------------------------
 * BPMNSM Business Model Resource
 *
 * Pure in-memory composition of the canonical facts owned by an
 * autonomous Business Model resource.
 *
 * The resource deliberately contains no BPMN document and no
 * BusinessObjectRepresentation. Those are repository/document
 * concerns outside this ownership boundary.
 * ------------------------------------------------------------
 */

import {
  createBusinessObjectStore
} from './business-object-store.js'

import {
  createBusinessRelationStore
} from './business-relation-store.js'

import {
  createIdentityOrigin
} from './identity-origin.js'

import {
  createBusinessObjectExternalIdentityStore
} from './business-object-external-identity-store.js'


export function createBusinessModelResource() {

  const businessObjectStore =
    createBusinessObjectStore()

  const businessRelationStore =
    createBusinessRelationStore()

  const externalIdentityStore =
    createBusinessObjectExternalIdentityStore()

  const identityOrigins =
    new Map()


  function addIdentityOrigin(
    identityOrigin
  ) {

    const normalizedOrigin =
      createIdentityOrigin(
        identityOrigin
      )

    if (
      identityOrigins.has(
        normalizedOrigin.id
      )
    ) {

      throw new Error(
        `IdentityOrigin already exists: ${normalizedOrigin.id}`
      )
    }

    identityOrigins.set(
      normalizedOrigin.id,
      normalizedOrigin
    )

    return normalizedOrigin
  }


  function getIdentityOrigin(
    identityOriginId
  ) {

    if (
      typeof identityOriginId !== 'string' ||
      !identityOriginId.trim()
    ) {

      throw new Error(
        'BusinessModelResource requires a non-empty IdentityOrigin id'
      )
    }

    return (
      identityOrigins.get(
        identityOriginId.trim()
      ) || null
    )
  }


  function getIdentityOrigins() {

    return Array.from(
      identityOrigins.values()
    )
  }


  function clear() {

    businessObjectStore.clear()
    businessRelationStore.clear()
    externalIdentityStore.clear()
    identityOrigins.clear()
  }


  return {
    addBusinessObject:
      businessObjectStore.addBusinessObject,
    getBusinessObject:
      businessObjectStore.getBusinessObject,
    getBusinessObjects:
      businessObjectStore.getBusinessObjects,

    addBusinessRelation:
      businessRelationStore.addBusinessRelation,
    getBusinessRelation:
      businessRelationStore.getBusinessRelation,
    getBusinessRelations:
      businessRelationStore.getBusinessRelations,

    addIdentityOrigin,
    getIdentityOrigin,
    getIdentityOrigins,

    attachExternalIdentity:
      externalIdentityStore.attach,
    detachExternalIdentity:
      externalIdentityStore.detach,
    getExternalIdentities:
      externalIdentityStore.getExternalIdentities,
    getBusinessObjectExternalIdentities:
      externalIdentityStore.getBusinessObjectExternalIdentities,

    clear
  }
}

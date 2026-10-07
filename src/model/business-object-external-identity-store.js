/*
 * ------------------------------------------------------------
 * BPMNSM Business Object External Identity Store
 *
 * In-memory collection of explicit Business Object / external
 * identity links.
 *
 * Links are identified by the triplet:
 *
 *   businessObjectId + originRef + value
 *
 * The external identity value remains opaque and lossless. The
 * store delegates its normalization to ExternalIdentity and does
 * not require either endpoint to be present in another store.
 *
 * Detaching removes only the link. It does not remove or mutate
 * the Business Object, ExternalIdentity or IdentityOrigin.
 *
 * This abstraction is intentionally independent from:
 *
 * - BusinessObjectStore membership
 * - IdentityOrigin resolution
 * - repository persistence
 * - BPMN serialization
 * - UI
 * ------------------------------------------------------------
 */

import {
  createExternalIdentity
} from './external-identity.js'


export function createBusinessObjectExternalIdentityStore() {

  const identitiesByBusinessObject =
    new Map()


  function attach({
    businessObjectId,
    value,
    originRef
  } = {}) {

    const normalizedBusinessObjectId =
      normalizeBusinessObjectId(
        businessObjectId
      )

    const externalIdentity =
      createExternalIdentity({
        value,
        originRef
      })

    let identities =
      identitiesByBusinessObject.get(
        normalizedBusinessObjectId
      )

    if (
      !identities
    ) {

      identities =
        new Map()

      identitiesByBusinessObject.set(
        normalizedBusinessObjectId,
        identities
      )
    }

    const key =
      createExternalIdentityKey(
        externalIdentity
      )

    const link =
      Object.freeze({
        businessObjectId:
          normalizedBusinessObjectId,
        ...externalIdentity
      })

    identities.set(
      key,
      link
    )

    return link
  }


  function detach({
    businessObjectId,
    value,
    originRef
  } = {}) {

    const normalizedBusinessObjectId =
      normalizeBusinessObjectId(
        businessObjectId
      )

    const externalIdentity =
      createExternalIdentity({
        value,
        originRef
      })

    const identities =
      identitiesByBusinessObject.get(
        normalizedBusinessObjectId
      )

    if (
      !identities
    ) {

      return null
    }

    const key =
      createExternalIdentityKey(
        externalIdentity
      )

    const detached =
      identities.get(
        key
      ) || null

    if (
      !detached
    ) {

      return null
    }

    identities.delete(
      key
    )

    if (
      identities.size === 0
    ) {

      identitiesByBusinessObject.delete(
        normalizedBusinessObjectId
      )
    }

    return detached
  }


  function getExternalIdentities(
    businessObjectId
  ) {

    const normalizedBusinessObjectId =
      normalizeBusinessObjectId(
        businessObjectId
      )

    const identities =
      identitiesByBusinessObject.get(
        normalizedBusinessObjectId
      )

    if (
      !identities
    ) {

      return []
    }

    return Array.from(
      identities.values()
    )
  }


  function getBusinessObjectExternalIdentities() {

    return Array.from(
      identitiesByBusinessObject.values()
    ).flatMap(
      identities => Array.from(
        identities.values()
      )
    )
  }


  function clear() {

    identitiesByBusinessObject.clear()
  }


  return {
    attach,
    detach,
    getExternalIdentities,
    getBusinessObjectExternalIdentities,
    clear
  }
}


function normalizeBusinessObjectId(
  businessObjectId
) {

  if (
    typeof businessObjectId !== 'string' ||
    !businessObjectId.trim()
  ) {

    throw new Error(
      'BusinessObjectExternalIdentityStore requires a non-empty businessObjectId'
    )
  }

  return businessObjectId.trim()
}


function createExternalIdentityKey({
  originRef,
  value
}) {

  return JSON.stringify([
    originRef,
    value
  ])
}

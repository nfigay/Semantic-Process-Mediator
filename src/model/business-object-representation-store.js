/*
 * ------------------------------------------------------------
 * BPMNSM Business Object Representation Store
 *
 * In-memory collection of explicit Business Object /
 * representation links.
 *
 * Links are identified by the pair:
 *
 *   businessObjectId + representationId
 *
 * This store deliberately does not impose an inverse cardinality
 * on representations. The same representationId may therefore
 * participate in links to different Business Objects.
 *
 * Detaching removes only the link. It does not remove either
 * endpoint.
 *
 * This abstraction is intentionally independent from:
 *
 * - BPMN mutation
 * - semarch:stableGuid
 * - repository persistence
 * - Properties Panel
 * ------------------------------------------------------------
 */


import {
  createBusinessObjectRepresentation
} from './business-object-representation.js'


export function createBusinessObjectRepresentationStore() {

  const representationsByBusinessObject =
    new Map()


  function attach(
    representation
  ) {

    const normalizedRepresentation =
      createBusinessObjectRepresentation(
        representation
      )


    let representations =
      representationsByBusinessObject.get(
        normalizedRepresentation.businessObjectId
      )


    if (
      !representations
    ) {

      representations =
        new Map()


      representationsByBusinessObject.set(
        normalizedRepresentation.businessObjectId,
        representations
      )
    }


    representations.set(
      normalizedRepresentation.representationId,
      normalizedRepresentation
    )


    return normalizedRepresentation
  }


  function detach({
    businessObjectId,
    representationId
  } = {}) {

    const normalizedRepresentation =
      createBusinessObjectRepresentation({
        businessObjectId,
        representationId
      })


    const representations =
      representationsByBusinessObject.get(
        normalizedRepresentation.businessObjectId
      )


    if (
      !representations
    ) {

      return null
    }


    const detached =
      representations.get(
        normalizedRepresentation.representationId
      ) ||
      null


    if (
      !detached
    ) {

      return null
    }


    representations.delete(
      normalizedRepresentation.representationId
    )


    if (
      representations.size ===
        0
    ) {

      representationsByBusinessObject.delete(
        normalizedRepresentation.businessObjectId
      )
    }


    return detached
  }


  function getRepresentations(
    businessObjectId
  ) {

    if (
      typeof businessObjectId !==
        'string' ||
      !businessObjectId.trim()
    ) {

      throw new Error(
        'BusinessObjectRepresentationStore requires a non-empty businessObjectId'
      )
    }


    const representations =
      representationsByBusinessObject.get(
        businessObjectId.trim()
      )


    if (
      !representations
    ) {

      return []
    }


    return Array.from(
      representations.values()
    )
  }


  function getBusinessObjectRepresentations() {

    return Array.from(
      representationsByBusinessObject.values()
    ).flatMap(
      representations => Array.from(representations.values())
    )
  }


  function getBusinessObjectRepresentationsByRepresentationId(
    representationId
  ) {

    if (
      typeof representationId !==
        'string' ||
      !representationId.trim()
    ) {

      throw new Error(
        'BusinessObjectRepresentationStore requires a non-empty representationId'
      )
    }


    const normalizedRepresentationId =
      representationId.trim()


    return getBusinessObjectRepresentations()
      .filter(
        representation =>
          representation.representationId ===
            normalizedRepresentationId
      )
  }


  function clear() {

    representationsByBusinessObject.clear()
  }


  return {

    attach,

    detach,

    getRepresentations,

    getBusinessObjectRepresentations,

    getBusinessObjectRepresentationsByRepresentationId,

    clear

  }
}

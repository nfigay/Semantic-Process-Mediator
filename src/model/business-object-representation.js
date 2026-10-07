/*
 * ------------------------------------------------------------
 * BPMNSM Business Object Representation
 *
 * Links a canonical Business Object identity to the identity of
 * one of its model representations.
 *
 * The two identities are deliberately independent.
 *
 * This abstraction is intentionally independent from:
 *
 * - semarch:stableGuid
 * - BPMN occurrence semantics
 * - repository persistence
 * - Properties Panel
 * ------------------------------------------------------------
 */


export function createBusinessObjectRepresentation({
  businessObjectId,
  representationId,
  documentId
} = {}) {

  if (
    typeof businessObjectId !==
      'string' ||
    !businessObjectId.trim()
  ) {

    throw new Error(
      'BusinessObjectRepresentation requires a non-empty businessObjectId'
    )
  }


  if (
    typeof representationId !==
      'string' ||
    !representationId.trim()
  ) {

    throw new Error(
      'BusinessObjectRepresentation requires a non-empty representationId'
    )
  }


  if (
    documentId !==
      undefined &&
    (
      typeof documentId !==
        'string' ||
      !documentId.trim()
    )
  ) {

    throw new Error(
      'BusinessObjectRepresentation requires documentId to be a non-empty string when provided'
    )
  }


  return Object.freeze({

    businessObjectId:
      businessObjectId.trim(),

    representationId:
      representationId.trim(),

    ...(
      documentId ===
        undefined
        ? {}
        : {
          documentId:
            documentId.trim()
        }
    )
  })
}

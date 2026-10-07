/*
 * ------------------------------------------------------------
 * BPMNSM Business Object
 *
 * Canonical business identity independent from any BPMN
 * representation.
 *
 * A Business Object is identified by its own opaque id and is
 * typed by one or more semantic type references.
 *
 * This abstraction is intentionally independent from:
 *
 * - BPMN element ids
 * - semarch:stableGuid
 * - BPMN representations and occurrences
 * - repository persistence
 * - Properties Panel
 * ------------------------------------------------------------
 */


export function createBusinessObject({
  id,
  name,
  typeRefs
} = {}) {

  if (
    typeof id !==
      'string' ||
    !id.trim()
  ) {

    throw new Error(
      'BusinessObject requires a non-empty id'
    )
  }


  if (
    !Array.isArray(
      typeRefs
    ) ||
    typeRefs.length === 0
  ) {

    throw new Error(
      'BusinessObject requires at least one typeRef'
    )
  }


  const normalizedTypeRefs =
    typeRefs.map(
      typeRef => {

        if (
          typeof typeRef !==
            'string' ||
          !typeRef.trim()
        ) {

          throw new Error(
            'BusinessObject typeRefs must contain non-empty strings'
          )
        }


        return typeRef.trim()
      }
    )


  const normalizedName =
    typeof name === 'string' && name.trim()
      ? name.trim()
      : null


  return Object.freeze({

    id:
      id.trim(),

    ...(
      normalizedName
        ? { name: normalizedName }
        : {}
    ),

    typeRefs:
      Object.freeze(
        normalizedTypeRefs
      )
  })
}

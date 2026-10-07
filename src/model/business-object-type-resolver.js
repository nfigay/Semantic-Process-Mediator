/*
 * BPMNSM — Business Object semantic type resolution
 *
 * BM-SEM-01 experimental contract:
 *
 *   - BusinessObject.typeRefs[] contains semantic type identities.
 *   - ProfileRuntime is the authority for type definitions.
 *   - The same type identity can be carried by semarch:SemanticType.ref.
 *   - A type definition may exist without an external schema binding.
 *
 * This module deliberately does not introduce a persistent
 * BusinessObjectType catalogue or a second type system.
 */

export function resolveBusinessObjectTypes({
  businessObject,
  profileRuntime
} = {}) {

  const typeRefs =
    businessObject?.typeRefs || []

  if (
    !profileRuntime ||
    typeof profileRuntime.getType !==
      'function'
  ) {

    return typeRefs.map(
      typeRef => ({
        typeRef,
        type: null,
        resolved: false
      })
    )
  }


  return typeRefs.map(
    typeRef => {

      const type =
        profileRuntime.getType(
          typeRef
        )

      return {
        typeRef,
        type,
        resolved:
          Boolean(type)
      }
    }
  )
}


export function getResolvedBusinessObjectTypes(
  options = {}
) {

  return resolveBusinessObjectTypes(
    options
  )
    .filter(
      entry =>
        entry.resolved
    )
    .map(
      entry =>
        entry.type
    )
}


export function businessObjectHasSemanticType(
  businessObject,
  semanticTypeRef
) {

  if (
    !semanticTypeRef
  ) {

    return false
  }


  return (
    businessObject
      ?.typeRefs
      ?.includes(
        semanticTypeRef
      ) ||
    false
  )
}

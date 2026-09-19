/*
 * BPMNSM Business View Resolver
 *
 * Responsibility:
 *
 *   Resolve an explicit BusinessView from a collection of
 *   available Business Views by logical identity.
 *
 * The Business View version belongs to the resolved resource.
 * This resolver does not select a version and does not interpret
 * stakeholder or CoC context.
 *
 * Multiple resources with the same logical identity are therefore
 * ambiguous and must be rejected explicitly.
 */

export function resolveBusinessView({
  businessViews = [],
  businessViewRef = null
} = {}) {

  if (
    typeof businessViewRef !==
      'string' ||
    !businessViewRef.trim()
  ) {

    return null
  }


  const normalizedBusinessViewRef =
    businessViewRef.trim()


  const matches =
    businessViews.filter(
      businessView =>
        businessView?.id ===
          normalizedBusinessViewRef
    )


  if (
    matches.length > 1
  ) {

    throw new Error(
      `Ambiguous BPMNSM Business View: ${normalizedBusinessViewRef}`
    )
  }


  return (
    matches[0] ||
    null
  )
}

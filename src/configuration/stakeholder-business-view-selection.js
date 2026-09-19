/*
 * BPMNSM Stakeholder Business View Selection
 *
 * Responsibility:
 *
 *   Resolve an explicit Business View reference from a collection
 *   of stakeholder-to-view selections.
 *
 * This does not resolve the Business View resource itself.
 */

export function resolveStakeholderBusinessViewRef({
  selections = [],
  stakeholderRef = null
} = {}) {

  if (
    typeof stakeholderRef !==
      'string' ||
    !stakeholderRef.trim()
  ) {

    return null
  }


  const normalizedStakeholderRef =
    stakeholderRef.trim()


  const matches =
    selections.filter(
      selection =>
        selection?.stakeholderRef ===
          normalizedStakeholderRef
    )


  if (
    matches.length > 1
  ) {

    throw new Error(
      `Ambiguous BPMNSM stakeholder Business View selection: ${normalizedStakeholderRef}`
    )
  }


  const businessViewRef =
    matches[0]?.businessViewRef


  if (
    typeof businessViewRef !==
      'string' ||
    !businessViewRef.trim()
  ) {

    return null
  }


  return businessViewRef.trim()
}

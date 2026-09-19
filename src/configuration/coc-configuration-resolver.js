/*
 * BPMNSM CoC Configuration Resolver
 *
 * Responsibility:
 *
 *   Resolve an explicit CoCConfiguration from a collection
 *   of available CoC configurations by CoC identity.
 *
 * This resolver does not interpret RepositoryContext,
 * does not resolve ProfileRuntime and does not use the
 * legacy CoC registry.
 */

export function resolveCocConfiguration({
  cocConfigurations = [],
  cocId = null
} = {}) {

  if (
    typeof cocId !==
      'string' ||
    !cocId.trim()
  ) {

    return null
  }


  const normalizedCocId =
    cocId.trim()


  return (
    cocConfigurations.find(
      configuration =>
        configuration?.id ===
          normalizedCocId
    ) ||
    null
  )
}

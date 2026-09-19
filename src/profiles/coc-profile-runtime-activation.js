import {
  resolveCocConfiguration
} from '../configuration/coc-configuration-resolver.js'


/*
 * BPMNSM CoC Profile Runtime Activation
 *
 * Responsibility:
 *
 *   Resolve an explicit CoCConfiguration by CoC identity,
 *   resolve its ProfileRuntime, then replace the runtime held
 *   by ActiveProfileRuntime.
 *
 * This composition primitive does not:
 *
 *   - interpret RepositoryContext
 *   - use the legacy CoC registry
 *   - refresh UI components
 *   - resolve publication configuration
 */

export async function activateCocProfileRuntime({
  cocId,
  cocConfigurations = [],
  resolveProfileRuntime,
  activeProfileRuntime
} = {}) {

  const cocConfiguration =
    resolveCocConfiguration({
      cocConfigurations,
      cocId
    })


  if (
    !cocConfiguration ||
    !cocConfiguration.profileRef
  ) {

    return null
  }


  if (
    typeof resolveProfileRuntime !==
      'function'
  ) {

    throw new Error(
      'CoC profile runtime activation requires resolveProfileRuntime'
    )
  }


  if (
    !activeProfileRuntime ||
    typeof activeProfileRuntime.set !==
      'function'
  ) {

    throw new Error(
      'CoC profile runtime activation requires activeProfileRuntime'
    )
  }


  /*
   * Resolve first, mutate second.
   *
   * If profile resolution fails, the currently active runtime
   * remains unchanged.
   */

  const profileRuntime =
    await resolveProfileRuntime({
      profileRef:
        cocConfiguration.profileRef
    })


  activeProfileRuntime.set(
    profileRuntime
  )


  return {
    cocConfiguration,
    profileRuntime
  }
}

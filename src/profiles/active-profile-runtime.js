/*
 * BPMNSM Active Profile Runtime
 *
 * Responsibility:
 *
 *   Hold the ProfileRuntime currently applicable to the Editor.
 *
 * This is not a profile resolver and does not interpret CoC context.
 * It is only a mutable runtime reference used at the composition boundary.
 */

export function createActiveProfileRuntime(
  initialProfileRuntime = null
) {

  let profileRuntime =
    initialProfileRuntime ||
    null


  function get() {

    return profileRuntime
  }


  function set(
    nextProfileRuntime
  ) {

    profileRuntime =
      nextProfileRuntime ||
      null


    return profileRuntime
  }


  return {
    get,
    set
  }
}

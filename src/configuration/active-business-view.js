/*
 * BPMNSM Active Business View
 *
 * Responsibility:
 *
 *   Hold the BusinessView currently applicable to the Editor.
 *
 * This is not a Business View resolver and does not interpret CoC context.
 * It is only a mutable view reference used at the composition boundary.
 */

export function createActiveBusinessView(
  initialBusinessView = null
) {

  let businessView =
    initialBusinessView ||
    null


  function get() {

    return businessView
  }


  function set(
    nextBusinessView
  ) {

    businessView =
      nextBusinessView ||
      null


    return businessView
  }


  return {
    get,
    set
  }
}

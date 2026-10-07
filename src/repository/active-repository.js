/*
 * BPMNSM Active Repository
 *
 * Responsibility:
 *
 *   Hold the Repository currently applicable to the application.
 *
 * This is not a Repository resolver and does not interpret workspace
 * membership. It is only a mutable Repository reference used at the
 * composition boundary.
 */

export function createActiveRepository(
  initialRepository = null
) {

  let repository =
    initialRepository ||
    null


  function get() {

    return repository
  }


  function set(
    nextRepository
  ) {

    repository =
      nextRepository ||
      null


    return repository
  }


  return {
    get,
    set
  }
}

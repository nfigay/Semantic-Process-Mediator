/*
 * BPMNSM Schema Adapter Registry
 *
 * Responsibility:
 *   - register schema adapters
 *   - locate an adapter by declared technology/specification
 *
 * It must NOT:
 *   - load files
 *   - parse profiles
 *   - interpret schema contents itself
 */


export function createSchemaAdapterRegistry({
  adapters = []
} = {}) {

  const registeredAdapters =
    []


  /*
   * ------------------------------------------------------------
   * Register
   * ------------------------------------------------------------
   */

  function register(
    adapter
  ) {

    if (
      !adapter ||
      typeof adapter.getTechnology !==
        'function'
    ) {

      throw new Error(
        'Schema adapter must implement getTechnology()'
      )
    }


    if (
      typeof adapter.getSpecification !==
        'function'
    ) {

      throw new Error(
        'Schema adapter must implement getSpecification()'
      )
    }


    if (
      typeof adapter.read !==
        'function'
    ) {

      throw new Error(
        'Schema adapter must implement read()'
      )
    }


    const technology =
      adapter.getTechnology()


    const specification =
      adapter.getSpecification()


    if (
      !technology
    ) {

      throw new Error(
        'Schema adapter technology must not be empty'
      )
    }


    const duplicate =
      registeredAdapters.find(
        candidate =>
          sameText(
            candidate.getTechnology(),
            technology
          ) &&
          sameText(
            candidate.getSpecification(),
            specification
          )
      )


    if (
      duplicate
    ) {

      throw new Error(
        `Schema adapter already registered: ${technology} ${specification}`
      )
    }


    registeredAdapters.push(
      adapter
    )


    return adapter
  }


  /*
   * ------------------------------------------------------------
   * Find
   * ------------------------------------------------------------
   */

  function find({
    technology,
    specification = null
  } = {}) {

    if (
      !technology
    ) {

      return null
    }


    /*
     * Prefer an exact technology + specification match.
     */

    if (
      specification
    ) {

      const exact =
        registeredAdapters.find(
          adapter =>
            sameText(
              adapter.getTechnology(),
              technology
            ) &&
            sameText(
              adapter.getSpecification(),
              specification
            )
        )


      if (
        exact
      ) {

        return exact
      }
    }


    /*
     * If no specification was requested, or no exact match was
     * found, accept an adapter for the same technology only when
     * this choice is unambiguous.
     */

    const technologyMatches =
      registeredAdapters.filter(
        adapter =>
          sameText(
            adapter.getTechnology(),
            technology
          )
      )


    if (
      technologyMatches.length ===
      1
    ) {

      return technologyMatches[0]
    }


    return null
  }


  /*
   * ------------------------------------------------------------
   * Require
   * ------------------------------------------------------------
   */

  function requireAdapter(
    declaration
  ) {

    const adapter =
      find(
        declaration
      )


    if (
      adapter
    ) {

      return adapter
    }


    const technology =
      declaration?.technology ||
      'unknown'


    const specification =
      declaration?.specification
        ? ` ${declaration.specification}`
        : ''


    throw new Error(
      `No schema adapter registered for ${technology}${specification}`
    )
  }


  /*
   * ------------------------------------------------------------
   * Inspection
   * ------------------------------------------------------------
   */

  function getAdapters() {

    return [
      ...registeredAdapters
    ]
  }


  /*
   * ------------------------------------------------------------
   * Initial adapters
   * ------------------------------------------------------------
   */

  for (
    const adapter
    of adapters
  ) {

    register(
      adapter
    )
  }


  /*
   * ------------------------------------------------------------
   * Public API
   * ------------------------------------------------------------
   */

  return {

    register,

    find,

    requireAdapter,

    getAdapters
  }
}


function sameText(
  left,
  right
) {

  return String(
    left || ''
  )
    .toLowerCase() ===
    String(
      right || ''
    )
      .toLowerCase()
}
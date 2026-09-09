/*
 * ------------------------------------------------------------
 * SemArch Platform Registry
 * ------------------------------------------------------------
 *
 * The platform registry keeps track of modeling platform
 * adapters available to SemArch.
 *
 * Examples:
 *
 * - Sparx Enterprise Architect
 * - ARIS
 * - Signavio
 * - Camunda
 * - future enterprise modeling platforms
 *
 * The registry does not contain platform-specific logic.
 * That logic belongs inside individual platform adapters.
 * ------------------------------------------------------------
 */


export function createPlatformRegistry() {

  const adapters =
    new Map()


  /*
   * ------------------------------------------------------------
   * Validate adapter
   * ------------------------------------------------------------
   */

  function validateAdapter(
    adapter
  ) {

    if (
      !adapter
      || typeof adapter !== 'object'
    ) {

      throw new Error(
        'Platform adapter must be an object.'
      )
    }


    if (
      typeof adapter.id !== 'string'
      || !adapter.id.trim()
    ) {

      throw new Error(
        'Platform adapter must define a non-empty id.'
      )
    }


    if (
      typeof adapter.name !== 'string'
      || !adapter.name.trim()
    ) {

      throw new Error(
        `Platform adapter "${adapter.id}" must define a non-empty name.`
      )
    }


    return true
  }


  /*
   * ------------------------------------------------------------
   * Register adapter
   * ------------------------------------------------------------
   */

  function register(
    adapter
  ) {

    validateAdapter(
      adapter
    )


    const platformId =
      adapter.id.trim()


    if (
      adapters.has(
        platformId
      )
    ) {

      throw new Error(
        `Platform adapter "${platformId}" is already registered.`
      )
    }


    adapters.set(
      platformId,
      adapter
    )


    return adapter
  }


  /*
   * ------------------------------------------------------------
   * Unregister adapter
   * ------------------------------------------------------------
   */

  function unregister(
    platformId
  ) {

    return adapters.delete(
      platformId
    )
  }


  /*
   * ------------------------------------------------------------
   * Get adapter
   * ------------------------------------------------------------
   */

  function get(
    platformId
  ) {

    return (
      adapters.get(
        platformId
      )
      || null
    )
  }


  /*
   * ------------------------------------------------------------
   * Test adapter existence
   * ------------------------------------------------------------
   */

  function has(
    platformId
  ) {

    return adapters.has(
      platformId
    )
  }


  /*
   * ------------------------------------------------------------
   * List adapters
   * ------------------------------------------------------------
   */

  function list() {

    return Array.from(
      adapters.values()
    )
  }


  /*
   * ------------------------------------------------------------
   * Clear registry
   * ------------------------------------------------------------
   */

  function clear() {

    adapters.clear()
  }


  /*
   * ------------------------------------------------------------
   * Public API
   * ------------------------------------------------------------
   */

  return {

    register,

    unregister,

    get,

    has,

    list,

    clear
  }
}
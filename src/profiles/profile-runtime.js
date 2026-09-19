import {
  createTypeBinding
} from '../schemas/schema-binding.js'

import {
  resolveSchemaProperty
} from '../schemas/schema-property-resolver.js'


/*
 * BPMNSM Profile Runtime
 *
 * Responsibility:
 *
 *   Profile configuration
 *          +
 *   normalized external schemas
 *          ↓
 *   stable runtime API
 *
 * Consumers such as Properties Panel, Forms and Lint should
 * depend on this runtime rather than interpreting profile JSON
 * or schema structures directly.
 */


export function createProfileRuntime({
  profile,
  loadedSchemas = []
} = {}) {

  if (
    !profile
  ) {

    throw new Error(
      'Profile runtime requires a profile'
    )
  }


  const schemas =
    loadedSchemas.map(
      entry =>
        entry?.schema ||
        entry
    )


  const typeBindings =
    createBindingsFromProfile(
      profile
    )


  /*
   * ------------------------------------------------------------
   * Profile types
   * ------------------------------------------------------------
   */

  function getTypes() {

    return [
      ...(profile.types || [])
    ]
  }


  function getType(
    semanticType
  ) {

    if (
      !semanticType
    ) {

      return null
    }


    return (
      (profile.types || [])
        .find(
          type =>
            type.id ===
            semanticType
        ) ||
      null
    )
  }


  /*
   * ------------------------------------------------------------
   * Type bindings
   * ------------------------------------------------------------
   */

  function getTypeBindings() {

    return [
      ...typeBindings
    ]
  }


  function getTypeBinding(
    semanticType
  ) {

    return (
      typeBindings.find(
        binding =>
          binding.semanticType ===
          semanticType
      ) ||
      null
    )
  }


  /*
   * ------------------------------------------------------------
   * Schema inspection
   * ------------------------------------------------------------
   */

  function getSchemas() {

    return [
      ...schemas
    ]
  }


  /*
   * ------------------------------------------------------------
   * Property resolution
   * ------------------------------------------------------------
   */

  function resolveProperty({
    semanticTypes = [],
    propertyRef = null
  } = {}) {

    return resolveSchemaProperty({

      schemas,

      bindings:
        typeBindings,

      semanticTypes,

      propertyRef
    })
  }


  /*
   * ------------------------------------------------------------
   * Public API
   * ------------------------------------------------------------
   */

  return {

    profile,

    getTypes,

    getType,

    getTypeBindings,

    getTypeBinding,

    getSchemas,

    resolveProperty
  }
}


/*
 * ------------------------------------------------------------
 * Profile -> runtime binding projection
 * ------------------------------------------------------------
 */

export function createBindingsFromProfile(
  profile
) {

  const bindings =
    []


  for (
    const type
    of profile?.types || []
  ) {

    /*
     * A type without schemaType is still a valid BPMNSM
     * business type. It simply has no complementary external
     * schema binding.
     */

    if (
      !type.schemaType
    ) {

      continue
    }


    bindings.push(
      createTypeBinding({

        semanticType:
          type.id,

        schemaType:
          type.schemaType,

        bpmnAnchor:
          type.bpmnAnchor ||
          null
      })
    )
  }


  return bindings
}
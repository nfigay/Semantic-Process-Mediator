import {
  findTypeBinding
} from './schema-binding.js'


/*
 * ------------------------------------------------------------
 * Normalized schema lookup
 * ------------------------------------------------------------
 */

export function findSchemaType(
  schemas,
  schemaTypeId
) {

  if (
    !Array.isArray(schemas) ||
    !schemaTypeId
  ) {

    return null
  }


  for (
    const schema
    of schemas
  ) {

    const types =
      schema?.types ||
      []


    const type =
      types.find(
        candidate =>
          candidate.id ===
          schemaTypeId
      )


    if (
      type
    ) {

      return {
        schema,
        type
      }
    }
  }


  return null
}


/*
 * ------------------------------------------------------------
 * Property lookup inside one normalized type
 * ------------------------------------------------------------
 */

export function findSchemaProperty(
  type,
  propertyId
) {

  if (
    !type ||
    !propertyId
  ) {

    return null
  }


  const properties =
    type.properties ||
    []


  return (
    properties.find(
      property =>
        property.id ===
        propertyId
    ) ||
    null
  )
}


/*
 * ------------------------------------------------------------
 * Semantic property resolution
 *
 * Resolution path:
 *
 * SemanticType
 *   -> TypeBinding
 *   -> external schema type
 *   -> external schema property
 *
 * No name inference is performed.
 * ------------------------------------------------------------
 */

export function resolveSchemaProperty({
  schemas = [],
  bindings = [],
  semanticTypes = [],
  propertyRef = null
} = {}) {

  if (
    !propertyRef
  ) {

    return null
  }


  for (
    const semanticType
    of semanticTypes
  ) {

    const semanticTypeRef =
      typeof semanticType ===
        'string'
        ? semanticType
        : semanticType?.ref


    if (
      !semanticTypeRef
    ) {

      continue
    }


    const binding =
      findTypeBinding(
        bindings,
        semanticTypeRef
      )


    if (
      !binding
    ) {

      continue
    }


    const resolvedType =
      findSchemaType(
        schemas,
        binding.schemaType
      )


    if (
      !resolvedType
    ) {

      continue
    }


    const property =
      findSchemaProperty(
        resolvedType.type,
        propertyRef
      )


    if (
      !property
    ) {

      continue
    }


    return {

      semanticType:
        semanticTypeRef,

      binding,

      schema:
        resolvedType.schema,

      type:
        resolvedType.type,

      property
    }
  }


  return null
}
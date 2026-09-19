export function normalizeBusinessView(
  configuration = {}
) {

  if (
    !configuration ||
    typeof configuration !==
      'object' ||
    Array.isArray(
      configuration
    )
  ) {

    throw new TypeError(
      'Business view must be an object'
    )
  }


  const id =
    normalizeRequiredString(
      configuration.id,
      'Business view id'
    )


  const version =
    normalizeRequiredString(
      configuration.version,
      'Business view version'
    )


  const stakeholderRef =
    normalizeRequiredString(
      configuration.stakeholderRef,
      'Business view stakeholderRef'
    )


  const projections =
    configuration.projections ===
      undefined
      ? []
      : configuration.projections


  if (
    !Array.isArray(
      projections
    )
  ) {

    throw new TypeError(
      'Business view projections must be an array'
    )
  }


  return {

    id,

    version,

    stakeholderRef,

    projections:
      projections.map(
        normalizeProjection
      )
  }
}


function normalizeProjection(
  projection,
  index
) {

  if (
    !projection ||
    typeof projection !==
      'object' ||
    Array.isArray(
      projection
    )
  ) {

    throw new TypeError(
      `Business view projection ${index} must be an object`
    )
  }


  const typeRef =
    normalizeRequiredString(
      projection.typeRef,
      `Business view projection ${index} typeRef`
    )


  const propertyRefs =
    projection.propertyRefs ===
      undefined
      ? []
      : projection.propertyRefs


  if (
    !Array.isArray(
      propertyRefs
    )
  ) {

    throw new TypeError(
      `Business view projection ${index} propertyRefs must be an array`
    )
  }


  return {

    typeRef,

    propertyRefs:
      propertyRefs.map(
        (
          propertyRef,
          propertyIndex
        ) =>
          normalizeRequiredString(
            propertyRef,
            `Business view projection ${index} propertyRef ${propertyIndex}`
          )
      )
  }
}


function normalizeRequiredString(
  value,
  label
) {

  if (
    typeof value !==
      'string' ||
    !value.trim()
  ) {

    throw new TypeError(
      `${label} must be a non-empty string`
    )
  }


  return value.trim()
}

/*
 * ------------------------------------------------------------
 * BPMNSM Identity Origin
 *
 * Identifies the source context in which an external identity is
 * meaningful. The origin has its own canonical BPMNSM identity;
 * platform, system and repository references are independent
 * optional dimensions of that source context.
 *
 * This abstraction deliberately does not contain the external
 * object identifier itself. That value belongs to ExternalIdentity.
 *
 * This abstraction is intentionally independent from:
 *
 * - ExternalIdentity attachment
 * - platform adapter resolution
 * - BusinessContext / ApplicationSystem realization
 * - repository persistence
 * - BPMN serialization
 * - UI
 * ------------------------------------------------------------
 */


export function createIdentityOrigin({
  id,
  platformRef,
  systemRef,
  repositoryRef
} = {}) {

  if (
    typeof id !==
      'string' ||
    !id.trim()
  ) {

    throw new Error(
      'IdentityOrigin requires a non-empty id'
    )
  }


  const normalizedPlatformRef =
    normalizeOptionalRef(
      platformRef,
      'platformRef'
    )


  const normalizedSystemRef =
    normalizeOptionalRef(
      systemRef,
      'systemRef'
    )


  const normalizedRepositoryRef =
    normalizeOptionalRef(
      repositoryRef,
      'repositoryRef'
    )


  if (
    !normalizedPlatformRef &&
    !normalizedSystemRef &&
    !normalizedRepositoryRef
  ) {

    throw new Error(
      'IdentityOrigin requires at least one origin dimension'
    )
  }


  return Object.freeze({

    id:
      id.trim(),

    ...(
      normalizedPlatformRef
        ? {
            platformRef:
              normalizedPlatformRef
          }
        : {}
    ),

    ...(
      normalizedSystemRef
        ? {
            systemRef:
              normalizedSystemRef
          }
        : {}
    ),

    ...(
      normalizedRepositoryRef
        ? {
            repositoryRef:
              normalizedRepositoryRef
          }
        : {}
    )
  })
}


function normalizeOptionalRef(
  value,
  propertyName
) {

  if (
    value === undefined ||
    value === null
  ) {

    return null
  }


  if (
    typeof value !==
      'string' ||
    !value.trim()
  ) {

    throw new Error(
      `IdentityOrigin ${propertyName} must be a non-empty string when supplied`
    )
  }


  return value.trim()
}

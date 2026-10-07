import {
  createIdentityOrigin
} from './identity-origin.js'


export function createIdentityOriginStore() {

  const identityOrigins =
    new Map()


  function addIdentityOrigin(
    identityOrigin
  ) {

    const normalizedOrigin =
      createIdentityOrigin(
        identityOrigin
      )

    if (
      identityOrigins.has(
        normalizedOrigin.id
      )
    ) {

      throw new Error(
        `IdentityOrigin already exists: ${normalizedOrigin.id}`
      )
    }

    identityOrigins.set(
      normalizedOrigin.id,
      normalizedOrigin
    )

    return normalizedOrigin
  }


  function getIdentityOrigin(
    identityOriginId
  ) {

    if (
      typeof identityOriginId !== 'string' ||
      !identityOriginId.trim()
    ) {

      throw new Error(
        'IdentityOriginStore requires a non-empty IdentityOrigin id'
      )
    }

    return (
      identityOrigins.get(
        identityOriginId.trim()
      ) || null
    )
  }


  function getIdentityOrigins() {

    return Array.from(
      identityOrigins.values()
    )
  }


  function clear() {

    identityOrigins.clear()
  }


  return {
    addIdentityOrigin,
    getIdentityOrigin,
    getIdentityOrigins,
    clear
  }
}

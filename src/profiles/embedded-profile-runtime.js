import {
  loadProfile
} from './profile-loader.js'

import {
  createProfileRuntime
} from './profile-runtime.js'

import {
  createSchemaAdapterRegistry
} from '../schemas/schema-adapter-registry.js'

import {
  loadProfileSchemas
} from '../schemas/profile-schema-loader.js'


/*
 * ------------------------------------------------------------
 * BPMNSM Embedded Profile Runtime
 *
 * Builds a Profile Runtime exclusively from resources already
 * available in memory.
 *
 * It performs no I/O:
 *
 *   - no fetch
 *   - no filesystem access
 *   - no Git/GitHub/GitLab access
 *
 * This makes it suitable for:
 *
 *   - standalone single-file distributions
 *   - resources embedded by Vite
 *   - tests
 *   - any host capable of supplying source strings
 *
 * Transport remains outside this module.
 * ------------------------------------------------------------
 */


export async function createEmbeddedProfileRuntime({
  profileSource,
  sources = {},
  adapters = []
} = {}) {

  if (
    profileSource ===
      undefined ||
    profileSource ===
      null
  ) {

    throw new Error(
      'Embedded profile runtime requires profileSource'
    )
  }


  if (
    !sources ||
    typeof sources !==
      'object' ||
    Array.isArray(
      sources
    )
  ) {

    throw new Error(
      'Embedded profile runtime requires sources to be an object'
    )
  }


  if (
    !Array.isArray(
      adapters
    )
  ) {

    throw new Error(
      'Embedded profile runtime requires adapters to be an array'
    )
  }


  const profile =
    loadProfile(
      profileSource
    )


  const registry =
    createSchemaAdapterRegistry({
      adapters
    })


  const loadedSchemas =
    await loadProfileSchemas({

      profile,

      registry,

      loadSource(
        source
      ) {

        if (
          !Object.prototype
            .hasOwnProperty
            .call(
              sources,
              source
            )
        ) {

          throw new Error(
            `Embedded BPMNSM source not found: ${source}`
          )
        }


        const value =
          sources[
            source
          ]


        if (
          typeof value !==
          'string'
        ) {

          throw new Error(
            `Embedded BPMNSM source must be a string: ${source}`
          )
        }


        return value
      }
    })


  return createProfileRuntime({
    profile,
    loadedSchemas
  })
}
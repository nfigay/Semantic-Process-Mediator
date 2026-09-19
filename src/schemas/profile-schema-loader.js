/*
 * BPMNSM Profile Schema Loader
 *
 * Responsibility:
 *   - read schema declarations from a loaded BPMNSM profile
 *   - resolve the appropriate SchemaAdapter
 *   - obtain source content through an injected source loader
 *   - ask the adapter to normalize the schema
 *
 * It must NOT:
 *   - know how local files are read
 *   - know how HTTP resources are fetched
 *   - know how GitHub resources are retrieved
 *   - interpret XSD/UML/RDF/OWL itself
 */


export async function loadProfileSchemas({
  profile,
  registry,
  loadSource
} = {}) {

  if (
    !profile
  ) {

    throw new Error(
      'Profile schema loader requires a profile'
    )
  }


  if (
    !registry
  ) {

    throw new Error(
      'Profile schema loader requires a schema adapter registry'
    )
  }


  if (
    typeof loadSource !==
      'function'
  ) {

    throw new Error(
      'Profile schema loader requires loadSource()'
    )
  }


  const declarations =
    profile.schemas ||
    []


  const loadedSchemas =
    []


  for (
    const declaration
    of declarations
  ) {

    const adapter =
      registry.requireAdapter({

        technology:
          declaration.technology,

        specification:
          declaration.specification ||
          null
      })


    const source =
      await loadSource(
        declaration.source,
        declaration
      )


    if (
      typeof source !== 'string'
    ) {

      throw new Error(
        `Schema source loader must return text for ${declaration.id}`
      )
    }


    if (
      typeof adapter.canRead ===
        'function' &&
      !adapter.canRead(
        source
      )
    ) {

      throw new Error(
        `Schema adapter ${adapter.getTechnology()} cannot read schema ${declaration.id}`
      )
    }


    const schema =
      await adapter.read(
        source
      )


    loadedSchemas.push({

      declaration,

      adapter: {
        technology:
          adapter.getTechnology(),

        specification:
          adapter.getSpecification(),

        capabilities:
          typeof adapter.getCapabilities ===
            'function'
            ? adapter.getCapabilities()
            : []
      },

      schema
    })
  }


  return loadedSchemas
}
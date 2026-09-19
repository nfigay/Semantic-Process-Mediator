/*
 * BPMNSM Profile Loader
 *
 * Responsibility:
 *   - parse a BPMNSM profile
 *   - validate its minimal structural contract
 *   - return a normalized profile object
 *
 * It must NOT:
 *   - interpret external schemas
 *   - resolve schema files
 *   - modify BPMN
 *   - contain business-specific knowledge
 */


export function loadProfile(
  source
) {

  const profile =
    parseProfile(
      source
    )


  validateProfile(
    profile
  )


  return normalizeProfile(
    profile
  )
}


/*
 * ------------------------------------------------------------
 * Parse
 * ------------------------------------------------------------
 */

function parseProfile(
  source
) {

  if (
    typeof source ===
    'string'
  ) {

    try {

      return JSON.parse(
        source
      )

    } catch (
      error
    ) {

      throw new Error(
        `Invalid BPMNSM profile JSON: ${error.message}`
      )
    }
  }


  if (
    source &&
    typeof source ===
      'object' &&
    !Array.isArray(
      source
    )
  ) {

    return source
  }


  throw new Error(
    'BPMNSM profile must be a JSON string or object'
  )
}


/*
 * ------------------------------------------------------------
 * Validate
 * ------------------------------------------------------------
 */

function validateProfile(
  profile
) {

  requireObject(
    profile,
    'BPMNSM profile'
  )


  requireString(
    profile.profileVersion,
    'profileVersion'
  )


  requireString(
    profile.id,
    'id'
  )


  requireString(
    profile.name,
    'name'
  )


  validateOptionalArray(
    profile.schemas,
    'schemas'
  )


  validateOptionalArray(
    profile.types,
    'types'
  )


  validateOptionalArray(
    profile.relations,
    'relations'
  )


  validateSchemas(
    profile.schemas ||
    []
  )


  validateTypes(
    profile.types ||
    []
  )


  validateRelations(
    profile.relations ||
    []
  )


  validateUniqueIds(
    profile.schemas ||
    [],
    'schema'
  )


  validateUniqueIds(
    profile.types ||
    [],
    'type'
  )


  validateUniqueIds(
    profile.relations ||
    [],
    'relation'
  )
}


function validateSchemas(
  schemas
) {

  for (
    const schema
    of schemas
  ) {

    requireObject(
      schema,
      'schema'
    )


    requireString(
      schema.id,
      'schema.id'
    )


    requireString(
      schema.technology,
      `schema ${schema.id}.technology`
    )


    requireString(
      schema.source,
      `schema ${schema.id}.source`
    )


    optionalString(
      schema.specification,
      `schema ${schema.id}.specification`
    )


    optionalString(
      schema.namespace,
      `schema ${schema.id}.namespace`
    )
  }
}


function validateTypes(
  types
) {

  for (
    const type
    of types
  ) {

    requireObject(
      type,
      'type'
    )


    requireString(
      type.id,
      'type.id'
    )


    optionalString(
      type.label,
      `type ${type.id}.label`
    )


    optionalString(
      type.specializes,
      `type ${type.id}.specializes`
    )


    optionalString(
      type.bpmnAnchor,
      `type ${type.id}.bpmnAnchor`
    )


    optionalString(
      type.schema,
      `type ${type.id}.schema`
    )


    optionalString(
      type.schemaType,
      `type ${type.id}.schemaType`
    )


    if (
      type.representation !==
        undefined &&
      type.representation !==
        null
    ) {

      requireObject(
        type.representation,
        `type ${type.id}.representation`
      )


      optionalString(
        type.representation.master,
        `type ${type.id}.representation.master`
      )


      optionalString(
        type.representation.occurrence,
        `type ${type.id}.representation.occurrence`
      )
    }
  }
}


function validateRelations(
  relations
) {

  for (
    const relation
    of relations
  ) {

    requireObject(
      relation,
      'relation'
    )


    requireString(
      relation.id,
      'relation.id'
    )


    optionalString(
      relation.label,
      `relation ${relation.id}.label`
    )


    optionalString(
      relation.bpmnRelation,
      `relation ${relation.id}.bpmnRelation`
    )
  }
}


function validateUniqueIds(
  entries,
  kind
) {

  const ids =
    new Set()


  for (
    const entry
    of entries
  ) {

    if (
      ids.has(
        entry.id
      )
    ) {

      throw new Error(
        `Duplicate BPMNSM ${kind} id: ${entry.id}`
      )
    }


    ids.add(
      entry.id
    )
  }
}


/*
 * ------------------------------------------------------------
 * Normalize
 * ------------------------------------------------------------
 */

function normalizeProfile(
  profile
) {

  return {

    profileVersion:
      profile.profileVersion,

    id:
      profile.id,

    name:
      profile.name,

    version:
      profile.version ||
      null,

    description:
      profile.description ||
      null,

    schemas:
      cloneEntries(
        profile.schemas
      ),

    types:
      cloneEntries(
        profile.types
      ),

    relations:
      cloneEntries(
        profile.relations
      )
  }
}


function cloneEntries(
  entries
) {

  return (
    entries ||
    []
  )
    .map(
      entry =>
        cloneValue(
          entry
        )
    )
}


function cloneValue(
  value
) {

  if (
    Array.isArray(
      value
    )
  ) {

    return value.map(
      cloneValue
    )
  }


  if (
    value &&
    typeof value ===
      'object'
  ) {

    return Object.fromEntries(
      Object.entries(
        value
      )
        .map(
          ([
            key,
            child
          ]) => [
            key,
            cloneValue(
              child
            )
          ]
        )
    )
  }


  return value
}


/*
 * ------------------------------------------------------------
 * Validation helpers
 * ------------------------------------------------------------
 */

function requireString(
  value,
  name
) {

  if (
    typeof value !==
      'string' ||
    value.trim() ===
      ''
  ) {

    throw new Error(
      `BPMNSM profile requires non-empty string: ${name}`
    )
  }
}


function optionalString(
  value,
  name
) {

  if (
    value === undefined ||
    value === null
  ) {

    return
  }


  requireString(
    value,
    name
  )
}


function validateOptionalArray(
  value,
  name
) {

  if (
    value === undefined ||
    value === null
  ) {

    return
  }


  if (
    !Array.isArray(
      value
    )
  ) {

    throw new Error(
      `BPMNSM profile property ${name} must be an array`
    )
  }
}


function requireObject(
  value,
  name
) {

  if (
    !value ||
    typeof value !==
      'object' ||
    Array.isArray(
      value
    )
  ) {

    throw new Error(
      `${name} must be an object`
    )
  }
}
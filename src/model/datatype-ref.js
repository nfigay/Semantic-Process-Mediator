/*
 * ------------------------------------------------------------
 * BPMNSM DataTypeRef
 *
 * Canonical semantic reference to a datatype.
 *
 * A datatype reference is identified by its expanded QName:
 *
 *   namespace URI + local name
 *
 * XML prefixes are deliberately NOT part of the identity.
 *
 * Examples:
 *
 *   xs:string
 *   xsd:string
 *
 * may both represent:
 *
 * {
 *   namespaceUri:
 *     'http://www.w3.org/2001/XMLSchema',
 *
 *   localName:
 *     'string'
 * }
 *
 * This abstraction is intentionally independent from:
 *
 * - XSD
 * - BPMN
 * - Properties Panel
 * - Forms
 * - runtime widget selection
 *
 * It can therefore be shared by schema adapters and by BPMN
 * ItemDefinition.structureRef handling.
 * ------------------------------------------------------------
 */


export function createDataTypeRef({
  namespaceUri = null,
  localName
} = {}) {

  if (
    typeof localName !==
      'string' ||
    !localName.trim()
  ) {

    throw new Error(
      'DataTypeRef requires a non-empty localName'
    )
  }


  if (
    namespaceUri !== null &&
    typeof namespaceUri !==
      'string'
  ) {

    throw new Error(
      'DataTypeRef namespaceUri must be a string or null'
    )
  }


  return Object.freeze({

    namespaceUri:
      namespaceUri ||
      null,

    localName:
      localName.trim()
  })
}


/*
 * ------------------------------------------------------------
 * Semantic equality
 *
 * Prefixes are irrelevant.
 * ------------------------------------------------------------
 */

export function sameDataTypeRef(
  first,
  second
) {

  if (
    !first ||
    !second
  ) {

    return false
  }


  return (
    first.namespaceUri ===
      second.namespaceUri &&
    first.localName ===
      second.localName
  )
}


/*
 * ------------------------------------------------------------
 * Expanded QName representation
 *
 * Useful for diagnostics and tests.
 *
 * Example:
 *
 *   {http://www.w3.org/2001/XMLSchema}string
 * ------------------------------------------------------------
 */

export function formatDataTypeRef(
  ref
) {

  if (
    !ref
  ) {

    return null
  }


  if (
    !ref.namespaceUri
  ) {

    return ref.localName
  }


  return (
    `{${ref.namespaceUri}}${ref.localName}`
  )
}
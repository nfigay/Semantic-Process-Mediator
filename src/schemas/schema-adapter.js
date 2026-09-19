export class SchemaAdapter {

  getTechnology() {

    throw new Error(

      'SchemaAdapter.getTechnology() must be implemented'

    )

  }



  getSpecification() {

    throw new Error(

      'SchemaAdapter.getSpecification() must be implemented'

    )

  }



  getCapabilities() {

    return []

  }



  canRead() {

    return false

  }



  async read() {

    throw new Error(

      'SchemaAdapter.read() must be implemented'

    )

  }

}



export function createNormalizedSchema({

  id,

  technology,

  specification,

  source = null,

  namespaces = {},

  types = []

}) {

  return {

    id,

    technology,

    specification,

    source,

    namespaces,

    types

  }

}



export function createNormalizedType({

  id,

  name,

  kind = 'type',

  baseType = null,

  properties = [],

  source = null

}) {

  return {

    id,

    name,

    kind,

    baseType,

    properties,

    source

  }

}



export function createNormalizedProperty({

  id,

  name,

  kind = 'data',

  /*
   * Generic BPMNSM runtime category.
   *
   * Examples:
   *
   * string
   * boolean
   * integer
   * decimal
   * date
   * datetime
   * unknown
   *
   * This is deliberately NOT the semantic identity
   * of the source datatype.
   */
  datatype = null,

  /*
   * Exact lexical representation found in the source.
   *
   * Examples:
   *
   * xs:string
   * xsd:positiveInteger
   * domain:CustomerType
   */
  nativeDatatype = null,

  /*
   * Canonical semantic datatype identity.
   *
   * {
   *   namespaceUri,
   *   localName
   * }
   *
   * Prefix independent.
   */
  datatypeRef = null,

  targetType = null,

  minOccurs = 0,

  maxOccurs = 1,

  source = null

}) {

  return {

    id,

    name,

    kind,

    datatype,

    nativeDatatype,

    datatypeRef,

    targetType,

    minOccurs,

    maxOccurs,

    source

  }

}
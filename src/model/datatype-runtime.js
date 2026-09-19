/*
 * ------------------------------------------------------------
 * BPMNSM datatype runtime resolution
 *
 * DataTypeRef is the semantic datatype identity.
 *
 * This module maps that identity to the smaller datatype
 * vocabulary understood by generic BPMNSM runtime consumers.
 *
 * Important:
 *
 * Unsupported does NOT mean invalid.
 *
 * A DataTypeRef may be perfectly valid and representable even
 * when this resolver returns UNKNOWN.
 * ------------------------------------------------------------
 */


export const XSD_NAMESPACE =
  'http://www.w3.org/2001/XMLSchema'


export const RuntimeDatatype = Object.freeze({

  STRING:
    'string',

  BOOLEAN:
    'boolean',

  INTEGER:
    'integer',

  DECIMAL:
    'decimal',

  DATE:
    'date',

  DATETIME:
    'datetime',

  UNKNOWN:
    'unknown'
})


const XSD_RUNTIME_DATATYPES =
  new Map([

    [
      'string',
      RuntimeDatatype.STRING
    ],

    [
      'boolean',
      RuntimeDatatype.BOOLEAN
    ],

    [
      'byte',
      RuntimeDatatype.INTEGER
    ],

    [
      'short',
      RuntimeDatatype.INTEGER
    ],

    [
      'int',
      RuntimeDatatype.INTEGER
    ],

    [
      'integer',
      RuntimeDatatype.INTEGER
    ],

    [
      'long',
      RuntimeDatatype.INTEGER
    ],

    [
      'nonNegativeInteger',
      RuntimeDatatype.INTEGER
    ],

    [
      'positiveInteger',
      RuntimeDatatype.INTEGER
    ],

    [
      'nonPositiveInteger',
      RuntimeDatatype.INTEGER
    ],

    [
      'negativeInteger',
      RuntimeDatatype.INTEGER
    ],

    [
      'decimal',
      RuntimeDatatype.DECIMAL
    ],

    [
      'float',
      RuntimeDatatype.DECIMAL
    ],

    [
      'double',
      RuntimeDatatype.DECIMAL
    ],

    [
      'date',
      RuntimeDatatype.DATE
    ],

    [
      'dateTime',
      RuntimeDatatype.DATETIME
    ]
  ])


export function resolveRuntimeDatatype(
  datatypeRef
) {

  if (
    !datatypeRef ||
    !datatypeRef.localName
  ) {

    return RuntimeDatatype.UNKNOWN
  }


  if (
    datatypeRef.namespaceUri !==
      XSD_NAMESPACE
  ) {

    return RuntimeDatatype.UNKNOWN
  }


  return (
    XSD_RUNTIME_DATATYPES.get(
      datatypeRef.localName
    ) ||
    RuntimeDatatype.UNKNOWN
  )
}
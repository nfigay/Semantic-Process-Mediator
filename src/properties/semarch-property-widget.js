import {
  RuntimeDatatype
} from '../model/datatype-runtime.js'


/*
 * ------------------------------------------------------------
 * SemArch property widget resolution
 *
 * Widget selection depends only on the generic BPMNSM runtime
 * datatype vocabulary.
 *
 * It is deliberately independent from the datatype source:
 *
 * - XSD schema property
 * - BPMN ItemDefinition
 * - future schema technologies
 *
 * ------------------------------------------------------------
 */


export const PropertyWidget = {
  TEXT: 'text',
  BOOLEAN: 'boolean',
  INTEGER: 'integer',
  DECIMAL: 'decimal',
  DATE: 'date',
  DATETIME: 'datetime'
}


export function resolvePropertyWidget(
  datatype
) {

  switch (
    datatype
  ) {

    case RuntimeDatatype.BOOLEAN:

      return PropertyWidget.BOOLEAN


    case RuntimeDatatype.INTEGER:

      return PropertyWidget.INTEGER


    case RuntimeDatatype.DECIMAL:

      return PropertyWidget.DECIMAL


    case RuntimeDatatype.DATE:

      return PropertyWidget.DATE


    case RuntimeDatatype.DATETIME:

      return PropertyWidget.DATETIME


    case RuntimeDatatype.STRING:
    case RuntimeDatatype.UNKNOWN:
    default:

      return PropertyWidget.TEXT
  }
}
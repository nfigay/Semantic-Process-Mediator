import {
  createBusinessObject
} from './business-object.js'


/*
 * ------------------------------------------------------------
 * BPMNSM Business Object Store
 *
 * In-memory collection of canonical Business Objects.
 *
 * The store owns Business Object collection membership only.
 * It is intentionally independent from:
 *
 * - BPMN representations and occurrences
 * - BusinessObjectRepresentationStore
 * - repository persistence
 * - active Business Object selection
 * - Properties Panel
 * ------------------------------------------------------------
 */


export function createBusinessObjectStore() {

  const businessObjects =
    new Map()


  function addBusinessObject(
    businessObject
  ) {

    const normalizedBusinessObject =
      createBusinessObject(
        businessObject
      )


    if (
      businessObjects.has(
        normalizedBusinessObject.id
      )
    ) {

      throw new Error(
        `BusinessObject already exists: ${normalizedBusinessObject.id}`
      )
    }


    businessObjects.set(
      normalizedBusinessObject.id,
      normalizedBusinessObject
    )


    return normalizedBusinessObject
  }


  function getBusinessObject(
    businessObjectId
  ) {

    return (
      businessObjects.get(
        businessObjectId
      ) ||
      null
    )
  }


  function getBusinessObjects() {

    return Array.from(
      businessObjects.values()
    )
  }


  function removeBusinessObject(
    businessObjectId
  ) {

    const businessObject =
      getBusinessObject(
        businessObjectId
      )


    if (
      !businessObject
    ) {

      return null
    }


    businessObjects.delete(
      businessObjectId
    )


    return businessObject
  }


  function clear() {

    businessObjects.clear()
  }


  return {

    addBusinessObject,

    getBusinessObject,

    getBusinessObjects,

    removeBusinessObject,

    clear

  }
}

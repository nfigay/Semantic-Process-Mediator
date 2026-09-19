export function createBusinessObjectRepresentationActions({
  businessObjectStore,
  businessObjectRepresentationStore,
  onChanged
} = {}) {

  if (
    !businessObjectStore
  ) {

    throw new Error(
      'Business Object representation actions require a Business Object store'
    )
  }


  if (
    !businessObjectRepresentationStore
  ) {

    throw new Error(
      'Business Object representation actions require a Business Object representation store'
    )
  }


  function attachBusinessObject(
    businessObjectId,
    representationId
  ) {

    const businessObject =
      businessObjectStore.getBusinessObject(
        businessObjectId
      )


    if (
      !businessObject
    ) {

      throw new Error(
        `Unknown BusinessObject: ${businessObjectId}`
      )
    }


    const attached =
      businessObjectRepresentationStore.attach({
        businessObjectId:
          businessObject.id,

        representationId
      })


    onChanged?.()


    return attached
  }


  function detachBusinessObject(
    businessObjectId,
    representationId
  ) {

    const detached =
      businessObjectRepresentationStore.detach({
        businessObjectId,
        representationId
      })


    if (detached) {
      onChanged?.()
    }


    return detached
  }


  function getBusinessObjectsByRepresentationId(
    representationId
  ) {

    return businessObjectRepresentationStore
      .getBusinessObjectRepresentationsByRepresentationId(
        representationId
      )
      .map(
        representation =>
          businessObjectStore.getBusinessObject(
            representation.businessObjectId
          )
      )
      .filter(Boolean)
  }


  function isBusinessObjectAttached(
    businessObjectId,
    representationId
  ) {

    return businessObjectRepresentationStore
      .getRepresentations(
        businessObjectId
      )
      .some(
        representation =>
          representation.representationId ===
            representationId
      )
  }


  return {
    attachBusinessObject,
    detachBusinessObject,
    getBusinessObjectsByRepresentationId,
    isBusinessObjectAttached
  }
}

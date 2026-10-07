export function createBusinessObjectRepresentationActions({
  businessObjectStore,
  businessObjectRepresentationStore,
  activeRepository,
  onChanged
} = {}) {

  if (
    !activeRepository &&
    !businessObjectStore
  ) {

    throw new Error(
      'Business Object representation actions require a Business Object store or activeRepository'
    )
  }


  if (
    !activeRepository &&
    !businessObjectRepresentationStore
  ) {

    throw new Error(
      'Business Object representation actions require a Business Object representation store or activeRepository'
    )
  }


  function resolveBusinessModelState() {

    const repository =
      activeRepository
        ?.get?.() ||
      null


    return {
      businessObjectStore:
        repository
          ?.businessObjectStore ||
        businessObjectStore ||
        null,

      businessObjectRepresentationStore:
        repository
          ?.businessObjectRepresentationStore ||
        businessObjectRepresentationStore ||
        null
    }
  }


  function attachBusinessObject(
    businessObjectId,
    representationId
  ) {

    const {
      businessObjectStore:
        resolvedBusinessObjectStore,
      businessObjectRepresentationStore:
        resolvedRepresentationStore
    } =
      resolveBusinessModelState()


    const businessObject =
      resolvedBusinessObjectStore.getBusinessObject(
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
      resolvedRepresentationStore.attach({
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

    const {
      businessObjectRepresentationStore:
        resolvedRepresentationStore
    } =
      resolveBusinessModelState()


    const detached =
      resolvedRepresentationStore.detach({
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

    const {
      businessObjectStore:
        resolvedBusinessObjectStore,
      businessObjectRepresentationStore:
        resolvedRepresentationStore
    } =
      resolveBusinessModelState()


    return resolvedRepresentationStore
      .getBusinessObjectRepresentationsByRepresentationId(
        representationId
      )
      .map(
        representation =>
          resolvedBusinessObjectStore.getBusinessObject(
            representation.businessObjectId
          )
      )
      .filter(Boolean)
  }


  function isBusinessObjectAttached(
    businessObjectId,
    representationId
  ) {

    const {
      businessObjectRepresentationStore:
        resolvedRepresentationStore
    } =
      resolveBusinessModelState()


    return resolvedRepresentationStore
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

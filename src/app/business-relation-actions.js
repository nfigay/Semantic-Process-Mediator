export function createBusinessRelationActions({
  businessObjectStore,
  businessRelationStore,
  activeRepository,
  onChanged
} = {}) {

  if (
    !activeRepository &&
    !businessObjectStore
  ) {
    throw new Error(
      'Business Relation actions require a Business Object store or activeRepository'
    )
  }

  if (
    !activeRepository &&
    !businessRelationStore
  ) {
    throw new Error(
      'Business Relation actions require a Business Relation store or activeRepository'
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

      businessRelationStore:
        repository
          ?.businessRelationStore ||
        businessRelationStore ||
        null
    }
  }

  function requireBusinessObject(
    businessObjectStore,
    businessObjectId
  ) {

    const businessObject =
      businessObjectStore.getBusinessObject(
        businessObjectId
      )

    if (!businessObject) {
      throw new Error(
        `Unknown BusinessObject: ${businessObjectId}`
      )
    }

    return businessObject
  }

  function notifyChanged(
    businessRelationStore
  ) {
    onChanged?.(
      businessRelationStore.getBusinessRelations()
    )
  }

  function addBusinessRelation(
    businessRelation
  ) {

    const {
      businessObjectStore:
        resolvedBusinessObjectStore,
      businessRelationStore:
        resolvedBusinessRelationStore
    } =
      resolveBusinessModelState()


    requireBusinessObject(
      resolvedBusinessObjectStore,
      businessRelation?.sourceBusinessObjectId
    )

    requireBusinessObject(
      resolvedBusinessObjectStore,
      businessRelation?.targetBusinessObjectId
    )

    const added =
      resolvedBusinessRelationStore.addBusinessRelation(
        businessRelation
      )

    notifyChanged(
      resolvedBusinessRelationStore
    )

    return added
  }

  function removeBusinessRelation(
    businessRelation
  ) {

    const {
      businessRelationStore:
        resolvedBusinessRelationStore
    } =
      resolveBusinessModelState()


    const removed =
      resolvedBusinessRelationStore.removeBusinessRelation(
        businessRelation
      )

    if (removed) {
      notifyChanged(
        resolvedBusinessRelationStore
      )
    }

    return removed
  }

  return {
    addBusinessRelation,
    removeBusinessRelation
  }
}

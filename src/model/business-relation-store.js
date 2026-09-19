import {
  createBusinessRelation
} from './business-relation.js'

export function createBusinessRelationStore() {

  const relations =
    new Map()

  function normalizeBusinessRelation(
    businessRelation
  ) {
    return createBusinessRelation(
      businessRelation
    )
  }

  function relationKey(
    businessRelation
  ) {

    const normalizedRelation =
      normalizeBusinessRelation(
        businessRelation
      )

    return {
      normalizedRelation,

      key: [
        normalizedRelation.sourceBusinessObjectId,
        normalizedRelation.targetBusinessObjectId,
        normalizedRelation.relationType
      ].join('::')
    }
  }

  function addBusinessRelation(
    businessRelation
  ) {

    const {
      normalizedRelation,
      key
    } =
      relationKey(
        businessRelation
      )

    if (relations.has(key)) {
      throw new Error(
        `BusinessRelation already exists: ${key}`
      )
    }

    relations.set(
      key,
      normalizedRelation
    )

    return normalizedRelation
  }

  function getBusinessRelation(
    businessRelation
  ) {

    const {
      key
    } =
      relationKey(
        businessRelation
      )

    return relations.get(key) || null
  }

  function getBusinessRelations() {
    return Array.from(
      relations.values()
    )
  }

  function removeBusinessRelation(
    businessRelation
  ) {

    const {
      key
    } =
      relationKey(
        businessRelation
      )

    const relation =
      relations.get(key) || null

    if (!relation) {
      return null
    }

    relations.delete(key)

    return relation
  }

  function clear() {
    relations.clear()
  }

  return {
    addBusinessRelation,
    getBusinessRelation,
    getBusinessRelations,
    removeBusinessRelation,
    clear
  }
}

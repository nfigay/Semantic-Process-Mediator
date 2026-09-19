import {
  findTypeBindingsBySchemaType
} from '../schemas/schema-binding.js'

import {
  createSemArchPropertyDescriptors
} from './semarch-property-descriptors.js'


export function findMigratableLegacyDataProperty({
  dataProperties = [],
  propertyRef,
  businessObjectId,
  cocId
} = {}) {

  if (
    !propertyRef ||
    !businessObjectId ||
    !cocId
  ) {

    return null
  }


  const matchingDataProperties =
    dataProperties.filter(
      dataProperty =>
        dataProperty?.$type ===
          'semarch:DataProperty' &&
        dataProperty?.propertyRef ===
          propertyRef
    )


  const hasQualifiedDataProperty =
    matchingDataProperties.some(
      dataProperty =>
        dataProperty
          ?.businessObjectRef ===
            businessObjectId &&
        dataProperty
          ?.cocRef ===
            cocId
    )


  if (
    hasQualifiedDataProperty
  ) {

    return null
  }


  const legacyDataProperties =
    matchingDataProperties.filter(
      dataProperty =>
        !dataProperty
          ?.businessObjectRef &&
        !dataProperty
          ?.cocRef
    )


  return legacyDataProperties.length === 1
    ? legacyDataProperties[ 0 ]
    : null
}


export function findMigratableLegacyObjectProperty({
  objectProperties = [],
  propertyRef,
  businessObjectId,
  cocId
} = {}) {

  if (
    !propertyRef ||
    !businessObjectId ||
    !cocId
  ) {

    return null
  }


  const matchingObjectProperties =
    objectProperties.filter(
      objectProperty =>
        objectProperty?.$type ===
          'semarch:ObjectProperty' &&
        objectProperty?.propertyRef ===
          propertyRef
    )


  const hasQualifiedObjectProperty =
    matchingObjectProperties.some(
      objectProperty =>
        objectProperty
          ?.businessObjectRef ===
            businessObjectId &&
        objectProperty
          ?.cocRef ===
            cocId
    )


  if (
    hasQualifiedObjectProperty
  ) {

    return null
  }


  const legacyObjectProperties =
    matchingObjectProperties.filter(
      objectProperty =>
        !objectProperty
          ?.businessObjectRef &&
        !objectProperty
          ?.cocRef
    )


  return legacyObjectProperties.length === 1
    ? legacyObjectProperties[ 0 ]
    : null
}


export function resolveBusinessObjectContextualProperties({
  businessObject,
  profileRuntime,
  businessView = null,
  cocId = null,
  dataProperties = [],
  objectProperties = []
} = {}) {

  const descriptors =
    createSemArchPropertyDescriptors({

      profileRuntime,

      semanticTypeRefs:
        businessObject?.typeRefs || [],

      dataProperties,

      businessView,

      businessObjectId:
        businessObject?.id ||
        null,

      cocId
    })


  if (
    !businessObject?.id ||
    !cocId
  ) {

    return descriptors
  }


  const objectPropertiesByPropertyRef =
    new Map(
      objectProperties
        .filter(
          objectProperty =>
            objectProperty
              ?.businessObjectRef ===
                businessObject.id &&
            objectProperty
              ?.cocRef ===
                cocId
        )
        .map(
          objectProperty => [
            objectProperty.propertyRef,
            objectProperty
          ]
        )
    )


  return descriptors.map(
    descriptor =>
      descriptor
        ?.property
        ?.kind ===
          'object'
        ? {
            ...descriptor,
            objectProperty:
              objectPropertiesByPropertyRef
                .get(
                  descriptor.propertyRef
                ) ||
              null
          }
        : descriptor
  )
}


export function resolveBusinessObjectsForTargetType({
  targetType,
  profileRuntime,
  businessObjects = []
} = {}) {

  if (
    !targetType ||
    typeof profileRuntime?.getTypeBindings !==
      'function'
  ) {

    return []
  }


  const semanticTypes =
    new Set(
      findTypeBindingsBySchemaType(
        profileRuntime.getTypeBindings(),
        targetType
      ).map(
        binding =>
          binding.semanticType
      )
    )


  if (
    semanticTypes.size === 0
  ) {

    return []
  }


  return businessObjects.filter(
    businessObject =>
      (businessObject?.typeRefs || [])
        .some(
          typeRef =>
            semanticTypes.has(
              typeRef
            )
        )
  )
}

export function resolveBusinessObjectNavigationTargets({
  descriptors = [],
  businessObjects = []
} = {}) {

  const businessObjectsById =
    new Map(
      businessObjects
        .filter(
          businessObject =>
            businessObject?.id
        )
        .map(
          businessObject => [
            businessObject.id,
            businessObject
          ]
        )
    )


  return descriptors
    .filter(
      descriptor =>
        descriptor
          ?.property
          ?.kind ===
          'object' &&
        descriptor
          ?.objectProperty
          ?.targetBusinessObjectRef
    )
    .map(
      descriptor => ({
        descriptor,
        businessObject:
          businessObjectsById.get(
            descriptor
              .objectProperty
              .targetBusinessObjectRef
          ) ||
          null
      })
    )
    .filter(
      navigationTarget =>
        navigationTarget.businessObject
    )
}

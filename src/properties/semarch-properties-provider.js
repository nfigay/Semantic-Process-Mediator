import {
  CheckboxEntry,
  CollapsibleEntry,
  HeaderButton,
  NumberFieldEntry,
  SelectEntry,
  TextFieldEntry,
  isCheckboxEntryEdited,
  isNumberFieldEntryEdited,
  isSelectEntryEdited,
  isTextFieldEntryEdited
} from '@bpmn-io/properties-panel'

import {
  useService
} from 'bpmn-js-properties-panel'

import {
  createSemArchPropertyDescriptors
} from './semarch-property-descriptors.js'

import {
  findMigratableLegacyDataProperty,
  findMigratableLegacyObjectProperty,
  resolveBusinessObjectContextualProperties,
  resolveBusinessObjectNavigationTargets,
  resolveBusinessObjectsForTargetType
} from './business-object-contextual-properties.js'

import {
  PropertyWidget,
  resolvePropertyWidget
} from './semarch-property-widget.js'


const LOW_PRIORITY = 500


/*
 * ------------------------------------------------------------
 * BPMN objects
 * ------------------------------------------------------------
 */

function getBusinessObject(
  element
) {

  return element?.businessObject || null
}


/*
 * ------------------------------------------------------------
 * MODEL resolution
 *
 * The selected graphical/contextual BPMN object is not always
 * the object carrying intrinsic semantic properties.
 *
 * DataObjectReference
 *   -> dataObjectRef
 *   -> DataObject
 *
 * DataStoreReference
 *   -> dataStoreRef
 *   -> DataStore
 * ------------------------------------------------------------
 */

function getSemanticObject(
  businessObject
) {

  if (
    businessObject?.$type ===
      'bpmn:DataObjectReference' &&
    businessObject.dataObjectRef
  ) {

    return businessObject.dataObjectRef
  }


  if (
    businessObject?.$type ===
      'bpmn:DataStoreReference' &&
    businessObject.dataStoreRef
  ) {

    return businessObject.dataStoreRef
  }


  return businessObject
}


/*
 * ------------------------------------------------------------
 * SemArch extensions
 * ------------------------------------------------------------
 */

function getExtensionValues(
  businessObject,
  type
) {

  const extensionElements =
    businessObject
      ?.extensionElements

  const values =
    extensionElements
      ?.values ||
    []


  return values.filter(
    value =>
      value.$type === type
  )
}


function getSemanticTypes(
  businessObject
) {

  return getExtensionValues(
    businessObject,
    'semarch:SemanticType'
  )
}


function getDataProperties(
  businessObject
) {

  return getExtensionValues(
    businessObject,
    'semarch:DataProperty'
  )
}


function getObjectProperties(
  businessObject
) {

  return getExtensionValues(
    businessObject,
    'semarch:ObjectProperty'
  )
}


/*
 * ------------------------------------------------------------
 * Runtime helpers
 * ------------------------------------------------------------
 */

function getSemanticTypeRefs(
  semanticTypes
) {

  return semanticTypes
    .map(
      semanticType =>
        semanticType.ref
    )
    .filter(
      Boolean
    )
}


function createSemanticTypeLabel(
  profileRuntime,
  semanticType
) {

  const semanticTypeRef =
    semanticType?.ref ||
    null


  if (
    !semanticTypeRef
  ) {

    return 'Semantic type'
  }


  if (
    !profileRuntime ||
    typeof profileRuntime.getType !==
      'function'
  ) {

    return 'Semantic type'
  }


  const type =
    profileRuntime.getType(
      semanticTypeRef
    )


  return (
    type?.label ||
    'Semantic type'
  )
}


function createPropertyLabel(
  descriptor
) {

  const property =
    descriptor?.property ||
    null


  if (
    property?.label
  ) {

    return property.label
  }


  if (
    property?.name
  ) {

    return humanizeName(
      property.name
    )
  }


  return (
    descriptor?.propertyRef ||
    'Data property'
  )
}


function humanizeName(
  value
) {

  if (
    !value
  ) {

    return ''
  }


  const normalized =
    String(
      value
    )
      .replace(
        /([a-z0-9])([A-Z])/g,
        '$1 $2'
      )
      .replace(
        /[_-]+/g,
        ' '
      )
      .trim()


  if (
    !normalized
  ) {

    return ''
  }


  return (
    normalized.charAt(0).toUpperCase() +
    normalized.slice(1)
  )
}


/*
 * ------------------------------------------------------------
 * Semantic Type entry
 * ------------------------------------------------------------
 */

function getCompatibleSemanticTypes(
  profileRuntime,
  semanticObject
) {

  if (
    !profileRuntime ||
    typeof profileRuntime.getTypes !==
      'function' ||
    !semanticObject?.$type
  ) {

    return []
  }


  return profileRuntime
    .getTypes()
    .filter(
      type => {

        const masterType =
          type?.representation
            ?.master ||
          null


        if (
          masterType
        ) {

          return (
            masterType ===
            semanticObject.$type
          )
        }


        return (
          type?.bpmnAnchor ===
          semanticObject.$type
        )
      }
    )
}


function updateSemanticType({
  element,
  semanticObject,
  semanticType,
  semanticTypeRef,
  modeling,
  moddle
}) {

  if (
    !semanticTypeRef
  ) {

    return
  }


  if (
    semanticType
  ) {

    modeling.updateModdleProperties(

      element,

      semanticType,

      {
        ref:
          semanticTypeRef
      }
    )


    return
  }


  const createdSemanticType =
    moddle.create(
      'semarch:SemanticType',
      {
        ref:
          semanticTypeRef
      }
    )


  let extensionElements =
    semanticObject.extensionElements


  if (
    !extensionElements
  ) {

    extensionElements =
      moddle.create(
        'bpmn:ExtensionElements',
        {
          values:
            []
        }
      )


    modeling.updateModdleProperties(

      element,

      semanticObject,

      {
        extensionElements
      }
    )
  }


  modeling.updateModdleProperties(

    element,

    extensionElements,

    {
      values: [
        ...(
          extensionElements.values ||
          []
        ),
        createdSemanticType
      ]
    }
  )
}


function SemanticTypeEntry({
  id,
  element,
  semanticObject,
  semanticType = null,
  compatibleTypes = [],
  label
}) {

  return {
    id,

    component:
      SemanticTypeField,

    isEdited:
      isSelectEntryEdited,

    element,

    semanticObject,

    semanticType,

    compatibleTypes,

    label
  }
}


function SemanticTypeField(
  props
) {

  const {
    id,
    element,
    semanticObject,
    semanticType,
    compatibleTypes,
    label
  } = props


  const modeling =
    useService(
      'modeling'
    )


  const moddle =
    useService(
      'moddle'
    )


  return SelectEntry({

    id,

    element,

    label:
      label ||
      'Semantic type',

    getValue() {

      return semanticType?.ref || ''
    },

    setValue(
      value
    ) {

      updateSemanticType({

        element,

        semanticObject,

        semanticType,

        semanticTypeRef:
          value,

        modeling,

        moddle
      })
    },

    getOptions() {

      return [
        {
          label:
            'Select semantic type',
          value:
            ''
        },
        ...compatibleTypes.map(
          type => ({
            label:
              type.label ||
              type.id,
            value:
              type.id
          })
        )
      ]
    }
  })
}


/*
 * ------------------------------------------------------------
 * BPMN master name
 *
 * For a linked DataObjectReference / DataStoreReference, the
 * business name belongs to the semantic master. The occurrence
 * keeps its own BPMN id and contextual state.
 * ------------------------------------------------------------
 */

function MasterNameEntry({
  id,
  element,
  semanticObject,
  label
}) {

  return {
    id,

    component:
      MasterNameField,

    isEdited:
      isTextFieldEntryEdited,

    element,

    semanticObject,

    label
  }
}


function MasterNameField(
  props
) {

  const {
    id,
    element,
    semanticObject,
    label
  } = props


  const debounce =
    useService(
      'debounceInput'
    )


  const modeling =
    useService(
      'modeling'
    )


  return TextFieldEntry({

    id,

    element,

    label:
      label ||
      'Name',

    getValue() {

      return (
        semanticObject
          ?.name ||
        ''
      )
    },

    setValue(
      value
    ) {

      modeling.updateModdleProperties(

        element,

        semanticObject,

        {
          name:
            serializeDataPropertyValue(
              value
            )
        }
      )
    },

    debounce
  })
}


function replaceOccurrenceNameEntry({
  groups,
  element,
  semanticObject
}) {

  return groups.map(
    group => {

      if (
        group?.id !==
          'general'
      ) {

        return group
      }


      const entries =
        group.entries ||
        []


      return {
        ...group,

        entries:
          entries.map(
            entry => {

              if (
                entry?.id !==
                  'name'
              ) {

                return entry
              }


              return MasterNameEntry({

                id:
                  'name',

                element,

                semanticObject,

                label:
                  'Name'
              })
            }
          )
      }
    }
  )
}


/*
 * ------------------------------------------------------------
 * BPMN master identity
 *
 * Structural information only. The master id is displayed in
 * the SemArch group for linked occurrences. No setter is
 * provided: the BPMN master identity is not edited here.
 * ------------------------------------------------------------
 */

function MasterIdEntry({
  id,
  element,
  semanticObject,
  label
}) {

  return {
    id,

    component:
      MasterIdField,

    element,

    semanticObject,

    label
  }
}


function MasterIdField(
  props
) {

  const {
    id,
    element,
    semanticObject,
    label
  } = props


  const debounce =
    useService(
      'debounceInput'
    )


  return TextFieldEntry({

    id,

    element,

    label:
      label ||
      'Master ID',

    getValue() {

      return (
        semanticObject
          ?.id ||
        ''
      )
    },

    setValue() {
    },

    debounce,

    disabled:
      false
  })
}


/*
 * ------------------------------------------------------------
 * Business Object representation
 *
 * Business Object links are runtime application state. They do
 * not mutate BPMN or SemArch extension elements. The selected
 * DataStoreReference resolves to its native DataStore master,
 * whose BPMN id is used as representationId.
 * ------------------------------------------------------------
 */
function BusinessObjectIdEntry({
  id,
  element,
  businessObject,
  representationId,
  businessObjectRepresentationActions,
  onBusinessObjectsChanged,
  entries = [],
  label
}) {

  return {
    id,
    component:
      BusinessObjectIdField,
    element,
    businessObject,
    representationId,
    businessObjectRepresentationActions,
    onBusinessObjectsChanged,
    entries,
    label
  }
}


function BusinessObjectIdField(
  props
) {

  const {
    id,
    element,
    businessObject,
    representationId,
    businessObjectRepresentationActions,
    onBusinessObjectsChanged,
    entries,
    label
  } = props

  return CollapsibleEntry({
    id,
    element,
    label:
      businessObject?.id ||
      label ||
      'Business Object',
    entries,
    remove() {
      businessObjectRepresentationActions
        ?.detachBusinessObject?.(
          businessObject?.id,
          representationId
        )

      onBusinessObjectsChanged?.()
    }
  })
}


function AddBusinessObjectEntry({
  id,
  element,
  representationId,
  businessObjects,
  businessObjectRepresentationActions,
  onBusinessObjectsChanged,
  label
}) {

  return {
    id,
    component:
      AddBusinessObjectField,
    isEdited:
      isSelectEntryEdited,
    element,
    representationId,
    businessObjects,
    businessObjectRepresentationActions,
    onBusinessObjectsChanged,
    label
  }
}


function AddBusinessObjectField(
  props
) {

  const {
    id,
    element,
    representationId,
    businessObjects,
    businessObjectRepresentationActions,
    onBusinessObjectsChanged,
    label
  } = props

  return SelectEntry({
    id,
    element,
    label:
      label ||
      'Add Business Object',
    getValue() {
      return ''
    },
    setValue(
      value
    ) {
      if (
        !value
      ) {
        return
      }

      businessObjectRepresentationActions
        ?.attachBusinessObject?.(
          value,
          representationId
        )

      onBusinessObjectsChanged?.()
    },
    getOptions() {
      return [
        {
          label:
            'Select Business Object',
          value:
            ''
        },
        ...businessObjects.map(
          businessObject => ({
            label:
              businessObject.id,
            value:
              businessObject.id
          })
        )
      ]
    }
  })
}


/*
 * ------------------------------------------------------------
 * BPMN master link
 *
 * A DataObjectReference / DataStoreReference may intentionally
 * have no master. Expose that structural choice explicitly.
 * ------------------------------------------------------------
 */

function MasterLinkedEntry({
  id,
  element,
  linked,
  label
}) {

  return {
    id,

    component:
      MasterLinkedField,

    element,

    linked,

    label
  }
}


function MasterLinkedField(
  props
) {

  const {
    id,
    element,
    linked,
    label
  } = props


  const debounce =
    useService(
      'debounceInput'
    )


  return TextFieldEntry({

    id,

    element,

    label:
      label ||
      'Linked',

    getValue() {

      return linked
        ? 'Yes'
        : 'No'
    },

    setValue() {
    },

    debounce,

    disabled:
      true
  })
}


/*
 * ------------------------------------------------------------
 * BPMN occurrence state
 *
 * State belongs to the selected contextual occurrence, not to
 * the semantic master carrying intrinsic SemArch properties.
 * ------------------------------------------------------------
 */

function isStatefulOccurrence(
  businessObject
) {

  return (
    businessObject?.$type ===
      'bpmn:DataObjectReference' ||
    businessObject?.$type ===
      'bpmn:DataStoreReference'
  )
}


function OccurrenceStateEntry({
  id,
  element,
  occurrence,
  label
}) {

  return {
    id,

    component:
      OccurrenceStateField,

    isEdited:
      isTextFieldEntryEdited,

    element,

    occurrence,

    label
  }
}


function OccurrenceStateField(
  props
) {

  const {
    id,
    element,
    occurrence,
    label
  } = props


  const debounce =
    useService(
      'debounceInput'
    )


  const modeling =
    useService(
      'modeling'
    )


  const moddle =
    useService(
      'moddle'
    )


  return TextFieldEntry({

    id,

    element,

    label:
      label ||
      'State',

    getValue() {

      return (
        occurrence
          ?.dataState
          ?.name ||
        ''
      )
    },

    setValue(
      value
    ) {

      const serializedValue =
        serializeDataPropertyValue(
          value
        )


      if (
        occurrence.dataState
      ) {

        modeling.updateModdleProperties(

          element,

          occurrence.dataState,

          {
            name:
              serializedValue
          }
        )


        return
      }


      if (
        serializedValue ===
          undefined
      ) {

        return
      }


      const dataState =
        moddle.create(
          'bpmn:DataState',
          {
            name:
              serializedValue
          }
        )


      modeling.updateModdleProperties(

        element,

        occurrence,

        {
          dataState
        }
      )
    },

    debounce
  })
}


/*
 * ------------------------------------------------------------
 * Data Property value handling
 * ------------------------------------------------------------
 */

function getDataPropertyValue(
  descriptor
) {

  return (
    descriptor
      .dataProperty
      ?.value ||
    ''
  )
}


function serializeDataPropertyValue(
  value
) {

  if (
    value === '' ||
    value === null ||
    value === undefined
  ) {

    return undefined
  }


  return String(
    value
  )
}


function getBooleanValue(
  descriptor
) {

  return (
    getDataPropertyValue(
      descriptor
    ) ===
    'true'
  )
}


function serializeBooleanValue(
  value
) {

  return value
    ? 'true'
    : 'false'
}


/*
 * ------------------------------------------------------------
 * Data Property persistence
 * ------------------------------------------------------------
 */

function updateDataPropertyValue({
  element,
  semanticObject,
  descriptor,
  businessObjectId = null,
  cocId = null,
  value,
  modeling,
  moddle
}) {

  const existingDataProperty =
    descriptor.dataProperty


  const migratableLegacyDataProperty =
    descriptor.migratableLegacyDataProperty


  /*
   * ----------------------------------------------------------
   * Migratable historical property
   * ----------------------------------------------------------
   */

  if (
    !existingDataProperty &&
    migratableLegacyDataProperty &&
    businessObjectId &&
    cocId
  ) {

    modeling.updateModdleProperties(

      element,

      migratableLegacyDataProperty,

      {
        businessObjectRef:
          businessObjectId,

        cocRef:
          cocId,

        value:
          value
      }
    )


    return
  }


  /*
   * ----------------------------------------------------------
   * Existing property
   * ----------------------------------------------------------
   */

  if (
    existingDataProperty
  ) {

    modeling.updateModdleProperties(

      element,

      existingDataProperty,

      {
        value:
          value
      }
    )


    return
  }


  /*
   * ----------------------------------------------------------
   * Property not yet serialized
   *
   * Do not create an extension for an empty value.
   * ----------------------------------------------------------
   */

  if (
    value === undefined
  ) {

    return
  }


  /*
   * ----------------------------------------------------------
   * Create semarch:DataProperty
   * ----------------------------------------------------------
   */

  const dataProperty =
    moddle.create(
      'semarch:DataProperty',
      {
        propertyRef:
          descriptor.propertyRef,

        schemaRef:
          descriptor
            .schemaType
            ?.namespace ||
          null,

        ...(
          businessObjectId
            ? {
                businessObjectRef:
                  businessObjectId
              }
            : {}
        ),

        ...(
          cocId
            ? {
                cocRef:
                  cocId
              }
            : {}
        ),

        value
      }
    )


  /*
   * ----------------------------------------------------------
   * Ensure extensionElements exists on the semantic MODEL
   * object.
   * ----------------------------------------------------------
   */

  let extensionElements =
    semanticObject.extensionElements


  if (
    !extensionElements
  ) {

    extensionElements =
      moddle.create(
        'bpmn:ExtensionElements',
        {
          values:
            []
        }
      )


    modeling.updateModdleProperties(

      element,

      semanticObject,

      {
        extensionElements
      }
    )
  }


  /*
   * ----------------------------------------------------------
   * Append through bpmn-js modeling.
   *
   * Serialization remains BPMN extensionElements and the
   * operation stays inside the bpmn-js commandStack.
   * ----------------------------------------------------------
   */

  const values =
    [
      ...(
        extensionElements.values ||
        []
      ),
      dataProperty
    ]


  modeling.updateModdleProperties(

    element,

    extensionElements,

    {
      values
    }
  )
}


/*
 * ------------------------------------------------------------
 * Object Property persistence
 * ------------------------------------------------------------
 */

function updateObjectPropertyTarget({
  element,
  semanticObject,
  descriptor,
  businessObjectId,
  cocId,
  objectProperty = null,
  migratableLegacyObjectProperty = null,
  targetBusinessObjectRef,
  modeling,
  moddle
}) {

  if (
    objectProperty
  ) {

    modeling.updateModdleProperties(
      element,
      objectProperty,
      {
        targetBusinessObjectRef
      }
    )

    return
  }


  if (
    migratableLegacyObjectProperty &&
    businessObjectId &&
    cocId
  ) {

    modeling.updateModdleProperties(
      element,
      migratableLegacyObjectProperty,
      {
        businessObjectRef:
          businessObjectId,

        cocRef:
          cocId,

        targetBusinessObjectRef
      }
    )

    return
  }


  if (
    !targetBusinessObjectRef ||
    !businessObjectId ||
    !cocId
  ) {

    return
  }


  const createdObjectProperty =
    moddle.create(
      'semarch:ObjectProperty',
      {
        propertyRef:
          descriptor.propertyRef,

        schemaRef:
          descriptor
            .schemaType
            ?.namespace ||
          null,

        businessObjectRef:
          businessObjectId,

        cocRef:
          cocId,

        targetBusinessObjectRef
      }
    )


  let extensionElements =
    semanticObject.extensionElements


  if (
    !extensionElements
  ) {

    extensionElements =
      moddle.create(
        'bpmn:ExtensionElements',
        {
          values:
            []
        }
      )


    modeling.updateModdleProperties(
      element,
      semanticObject,
      {
        extensionElements
      }
    )
  }


  const values = [
    ...(
      extensionElements.values ||
      []
    ),
    createdObjectProperty
  ]


  modeling.updateModdleProperties(
    element,
    extensionElements,
    {
      values
    }
  )
}


/*
 * ------------------------------------------------------------
 * Data Property entry
 * ------------------------------------------------------------
 */

function isDataPropertyDescriptor(
  descriptor
) {

  return (
    descriptor
      ?.property
      ?.kind !==
    'object'
  )
}


function ObjectPropertyEntry({
  id,
  element,
  semanticObject,
  descriptor,
  businessObjects = [],
  businessObjectId,
  cocId,
  objectProperty = null,
  migratableLegacyObjectProperty = null,
  label
}) {

  return {
    id,

    component:
      ObjectPropertyField,

    isEdited:
      isSelectEntryEdited,

    element,

    semanticObject,

    descriptor,

    businessObjects,

    businessObjectId,

    cocId,

    objectProperty,

    migratableLegacyObjectProperty,

    label
  }
}


function ObjectPropertyNavigationEntry({
  id,
  element,
  businessObject,
  businessObjectNavigationActions
}) {

  return {
    id,
    component:
      ObjectPropertyNavigationField,
    element,
    businessObject,
    businessObjectNavigationActions
  }
}


function ObjectPropertyNavigationField(
  props
) {

  const {
    businessObject,
    businessObjectNavigationActions
  } = props


  return HeaderButton({
    onClick() {
      businessObjectNavigationActions
        ?.navigate?.(
          businessObject
        )
    },
    children:
      `Open ${businessObject.id}`
  })
}


function ObjectPropertyField(
  props
) {

  const {
    id,
    element,
    semanticObject,
    descriptor,
    businessObjects,
    businessObjectId,
    cocId,
    objectProperty,
    migratableLegacyObjectProperty,
    label
  } = props


  const modeling =
    useService(
      'modeling'
    )


  const moddle =
    useService(
      'moddle'
    )


  return SelectEntry({

    id,

    element,

    label:
      label ||
      descriptor.propertyRef ||
      'Object property',

    getValue() {

      return (
        objectProperty
          ?.targetBusinessObjectRef ||
        ''
      )
    },

    setValue(
      targetBusinessObjectRef
    ) {

      updateObjectPropertyTarget({
        element,
        semanticObject,
        descriptor,
        businessObjectId,
        cocId,
        objectProperty,
        migratableLegacyObjectProperty,
        targetBusinessObjectRef,
        modeling,
        moddle
      })
    },

    getOptions() {

      return [
        {
          label:
            'Select Business Object',
          value:
            ''
        },
        ...businessObjects.map(
          businessObject => ({
            label:
              businessObject.id,
            value:
              businessObject.id
          })
        )
      ]
    },

    disabled:
      false
  })
}


function DataPropertyEntry({
  id,
  element,
  semanticObject,
  descriptor,
  label,
  businessObjectId = null,
  cocId = null,
  migratableLegacyDataProperty = null
}) {

  const widget =
    resolvePropertyWidget(
      descriptor
        ?.property
        ?.datatype
    )


  return {
    id,

    component:
      DataPropertyField,

    isEdited:
      getDataPropertyEditedPredicate(
        widget
      ),

    element,

    semanticObject,

    descriptor,

    migratableLegacyDataProperty,

    label,

    businessObjectId,

    cocId,

    widget
  }
}


function getDataPropertyEditedPredicate(
  widget
) {

  switch (
    widget
  ) {

    case PropertyWidget.BOOLEAN:

      return isCheckboxEntryEdited


    case PropertyWidget.INTEGER:
    case PropertyWidget.DECIMAL:

      return isNumberFieldEntryEdited


    case PropertyWidget.DATE:
    case PropertyWidget.DATETIME:
    case PropertyWidget.TEXT:
    default:

      return isTextFieldEntryEdited
  }
}


function DataPropertyField(
  props
) {

  const {
    id,
    element,
    semanticObject,
    descriptor,
    migratableLegacyDataProperty,
    label,
    businessObjectId,
    cocId,
    widget
  } = props


  const debounce =
    useService(
      'debounceInput'
    )


  const modeling =
    useService(
      'modeling'
    )


  const moddle =
    useService(
      'moddle'
    )


  const entryLabel =
    label ||
    descriptor.propertyRef ||
    'Data property'


  function setSerializedValue(
    value
  ) {

    updateDataPropertyValue({

      element,

      semanticObject,

      descriptor: {
        ...descriptor,
        migratableLegacyDataProperty
      },

      businessObjectId,

      cocId,

      value,

      modeling,

      moddle
    })
  }


  /*
   * ----------------------------------------------------------
   * Boolean
   * ----------------------------------------------------------
   */

  if (
    widget ===
      PropertyWidget.BOOLEAN
  ) {

    return CheckboxEntry({

      id,

      element,

      label:
        entryLabel,

      getValue() {

        return getBooleanValue(
          descriptor
        )
      },

      setValue(
        value
      ) {

        setSerializedValue(
          serializeBooleanValue(
            value
          )
        )
      }
    })
  }


  /*
   * ----------------------------------------------------------
   * Integer / Decimal
   *
   * NumberFieldEntry provides the native numeric UI.
   * The instance value is still serialized as String because
   * semarch:DataProperty.value is an XML attribute.
   * ----------------------------------------------------------
   */

  if (
    widget ===
      PropertyWidget.INTEGER ||
    widget ===
      PropertyWidget.DECIMAL
  ) {

    return NumberFieldEntry({

      id,

      element,

      label:
        entryLabel,

      getValue() {

        return getDataPropertyValue(
          descriptor
        )
      },

      setValue(
        value
      ) {

        setSerializedValue(
          serializeDataPropertyValue(
            value
          )
        )
      },

      debounce
    })
  }


  /*
   * ----------------------------------------------------------
   * Text / Date / DateTime / fallback
   *
   * The installed properties panel exposes no dedicated date
   * entry. Dates therefore remain native TextFieldEntry values
   * until a generic date strategy is introduced.
   * ----------------------------------------------------------
   */

  return TextFieldEntry({

    id,

    element,

    label:
      entryLabel,

    getValue() {

      return getDataPropertyValue(
        descriptor
      )
    },

    setValue(
      value
    ) {

      setSerializedValue(
        serializeDataPropertyValue(
          value
        )
      )
    },

    debounce
  })
}


/*
 * ------------------------------------------------------------
 * Provider
 * ------------------------------------------------------------
 */

export class SemArchPropertiesProvider {

  constructor(
    propertiesPanel,
    activeProfileRuntime,
    activeBusinessView,
    businessObjectStore,
    businessObjectRepresentationActions,
    eventBus,
    readRepositoryContext,
    businessObjectNavigationActions
  ) {

    this.activeProfileRuntime =
      activeProfileRuntime ||
      null

    this.activeBusinessView =
      activeBusinessView ||
      null

    this.businessObjectStore =
      businessObjectStore ||
      null

    this.businessObjectRepresentationActions =
      businessObjectRepresentationActions ||
      null

    this.eventBus =
      eventBus ||
      null


    this.readRepositoryContext =
      readRepositoryContext ||
      null

    this.businessObjectNavigationActions =
      businessObjectNavigationActions ||
      null


    propertiesPanel.registerProvider(
      LOW_PRIORITY,
      this
    )
  }


  getProfileRuntime() {

    return (
      this.activeProfileRuntime
        ?.get?.() ||
      null
    )
  }


  getBusinessView() {

    return (
      this.activeBusinessView
        ?.get?.() ||
      null
    )
  }


  getCocId() {

    return (
      this.readRepositoryContext
        ?.()
        ?.cocOwner ||
      null
    )
  }


  getGroups(
    element
  ) {

    return groups => {

      let resultGroups =
        groups


      const profileRuntime =
        this.getProfileRuntime()

      const businessView =
        this.getBusinessView()


      const cocId =
        this.getCocId()


      /*
       * CONTEXT
       *
       * Object actually selected on the BPMN canvas.
       */

      const selectedBusinessObject =
        getBusinessObject(
          element
        )


      if (
        !selectedBusinessObject
      ) {

        return resultGroups
      }


      /*
       * MODEL
       *
       * Object carrying intrinsic semantic properties.
       */

      const semanticObject =
        getSemanticObject(
          selectedBusinessObject
        )


      if (
        !semanticObject
      ) {

        return resultGroups
      }


      const compatibleTypes =
        getCompatibleSemanticTypes(
          profileRuntime,
          semanticObject
        )


      const semanticTypes =
        getSemanticTypes(
          semanticObject
        )


      const dataProperties =
        getDataProperties(
          semanticObject
        )


      const objectProperties =
        getObjectProperties(
          semanticObject
        )


      const semanticTypeRefs =
        getSemanticTypeRefs(
          semanticTypes
        )


      const propertyDescriptors =
        createSemArchPropertyDescriptors({

          profileRuntime:
            profileRuntime,

          semanticTypeRefs,

          dataProperties,

          businessView
        })


      const statefulOccurrence =
        isStatefulOccurrence(
          selectedBusinessObject
        )


      if (
        statefulOccurrence &&
        semanticObject !==
          selectedBusinessObject
      ) {

        resultGroups =
          replaceOccurrenceNameEntry({

            groups:
              resultGroups,

            element,

            semanticObject
          })
      }


      if (
        semanticTypes.length === 0 &&
        propertyDescriptors.length === 0 &&
        compatibleTypes.length === 0 &&
        !statefulOccurrence
      ) {

        return resultGroups
      }


      const entries =
        []


      if (
        statefulOccurrence
      ) {

        const linkedMaster =
          semanticObject !==
            selectedBusinessObject


        const masterEntries = [
          MasterLinkedEntry({

            id:
              'semarch-master-linked',

            element,

            linked:
              linkedMaster,

            label:
              'Linked'
          })
        ]


        if (
          linkedMaster
        ) {

          masterEntries.push(
            MasterIdEntry({

              id:
                'semarch-master-id',

              element,

              semanticObject,

              label:
                'ID'
            })
          )
        }


        if (
          linkedMaster &&
          semanticObject?.$type ===
            'bpmn:DataStore' &&
          semanticObject?.id &&
          this.businessObjectStore &&
          this.businessObjectRepresentationActions
        ) {

          const businessObjects =
            this.businessObjectStore
              .getBusinessObjects()

          const attachedBusinessObjects =
            businessObjects.filter(
              businessObject =>
                this.businessObjectRepresentationActions
                  .isBusinessObjectAttached(
                    businessObject.id,
                    semanticObject.id
                  )
            )

          const availableBusinessObjects =
            businessObjects.filter(
              businessObject =>
                !this.businessObjectRepresentationActions
                  .isBusinessObjectAttached(
                    businessObject.id,
                    semanticObject.id
                  )
            )

          attachedBusinessObjects.forEach(
            (
              businessObject,
              index
            ) => {

              const contextualDescriptors =
                resolveBusinessObjectContextualProperties({
                  businessObject,
                  profileRuntime,
                  businessView,
                  cocId,
                  dataProperties,
                  objectProperties
                })

              const contextualEntries =
                contextualDescriptors.flatMap(
                  (
                    descriptor,
                    descriptorIndex
                  ) => {

                    if (
                      descriptor
                        ?.property
                        ?.kind ===
                      'object'
                    ) {

                      const targetBusinessObjects =
                        resolveBusinessObjectsForTargetType({
                          targetType:
                            descriptor
                              .property
                              .targetType,
                          profileRuntime,
                          businessObjects
                        })


                      const migratableLegacyObjectProperty =
                        findMigratableLegacyObjectProperty({
                          objectProperties,
                          propertyRef:
                            descriptor.propertyRef,
                          businessObjectId:
                            businessObject.id,
                          cocId
                        })


                      const navigationTarget =
                        resolveBusinessObjectNavigationTargets({
                          descriptors: [
                            descriptor
                          ],
                          businessObjects
                        })[0]
                          ?.businessObject ||
                        null


                      const objectPropertyEntry =
                        ObjectPropertyEntry({
                          id:
                            `semarch-business-object-${index}-object-property-${descriptorIndex}`,
                          element,
                          semanticObject,
                          descriptor,
                          businessObjects:
                            targetBusinessObjects,
                          businessObjectId:
                            businessObject.id,
                          cocId,
                          objectProperty:
                            descriptor
                              .objectProperty,
                          migratableLegacyObjectProperty,
                          label:
                            createPropertyLabel(
                              descriptor
                            )
                        })


                      if (
                        !navigationTarget ||
                        !this.businessObjectNavigationActions
                      ) {

                        return [
                          objectPropertyEntry
                        ]
                      }


                      return [
                        objectPropertyEntry,
                        ObjectPropertyNavigationEntry({
                          id:
                            `semarch-business-object-${index}-object-property-${descriptorIndex}-navigate`,
                          element,
                          businessObject:
                            navigationTarget,
                          businessObjectNavigationActions:
                            this.businessObjectNavigationActions
                        })
                      ]
                    }


                    const migratableLegacyDataProperty =
                      findMigratableLegacyDataProperty({
                        dataProperties,
                        propertyRef:
                          descriptor.propertyRef,
                        businessObjectId:
                          businessObject.id,
                        cocId
                      })


                    return [
                      DataPropertyEntry({
                        id:
                          `semarch-business-object-${index}-data-property-${descriptorIndex}`,
                        element,
                        semanticObject,
                        descriptor,
                        migratableLegacyDataProperty,
                        businessObjectId:
                          businessObject.id,
                        cocId,
                        label:
                          createPropertyLabel(
                            descriptor
                          )
                      })
                    ]
                  }
                )

              masterEntries.push(
                BusinessObjectIdEntry({
                  id:
                    `semarch-business-object-${index}`,
                  element,
                  businessObject,
                  representationId:
                    semanticObject.id,
                  businessObjectRepresentationActions:
                    this.businessObjectRepresentationActions,
                  onBusinessObjectsChanged:
                    () => this.eventBus?.fire?.(
                      'propertiesPanel.providersChanged'
                    ),
                  entries:
                    contextualEntries,
                  label:
                    'Business Object'
                })
              )
            }
          )

          if (
            availableBusinessObjects.length > 0
          ) {

            masterEntries.push(
              AddBusinessObjectEntry({
                id:
                  'semarch-business-object-new',
                element,
                representationId:
                  semanticObject.id,
                businessObjects:
                  availableBusinessObjects,
                businessObjectRepresentationActions:
                  this.businessObjectRepresentationActions,
                onBusinessObjectsChanged:
                  () => this.eventBus?.fire?.(
                    'propertiesPanel.providersChanged'
                  ),
                label:
                  'Add Business Object'
              })
            )
          }
        }


        resultGroups.push({

          id:
            'semarch-master',

          label:
            'Master',

          entries:
            masterEntries
        })


        entries.push(
          OccurrenceStateEntry({

            id:
              'semarch-occurrence-state',

            element,

            occurrence:
              selectedBusinessObject,

            label:
              'State'
          })
        )
      }

      const assignedSemanticTypeRefs =
        new Set(
          semanticTypeRefs
        )


      const availableCompatibleTypes =
        compatibleTypes.filter(
          type =>
            !assignedSemanticTypeRefs.has(
              type?.id
            )
        )


      if (
        availableCompatibleTypes.length > 0
      ) {

        entries.push(
          SemanticTypeEntry({

            id:
              'semarch-semantic-type-new',

            element,

            semanticObject,

            compatibleTypes:
              availableCompatibleTypes,

            label:
              'Semantic type'
          })
        )
      }


      semanticTypes.forEach(
        (
          semanticType,
          index
        ) => {

          entries.push(
            SemanticTypeEntry({

              id:
                `semarch-semantic-type-${index}`,

              element,

              semanticObject,

              semanticType,

              compatibleTypes,

              label:
                createSemanticTypeLabel(
                  profileRuntime,
                  semanticType
                )
            })
          )
        }
      )


      propertyDescriptors
        .filter(
          isDataPropertyDescriptor
        )
        .forEach(
        (
          descriptor,
          index
        ) => {

          entries.push(
            DataPropertyEntry({

              id:
                `semarch-data-property-${index}`,

              element,

              semanticObject,

              descriptor,

              label:
                createPropertyLabel(
                  descriptor
                )
            })
          )
        }
      )


      resultGroups.push({

        id:
          'semarch',

        label:
          'SemArch',

        entries
      })


      return resultGroups
    }
  }
}


SemArchPropertiesProvider.$inject = [
  'propertiesPanel',
  'activeProfileRuntime',
  'activeBusinessView',
  'businessObjectStore',
  'businessObjectRepresentationActions',
  'eventBus',
  'readRepositoryContext',
  'businessObjectNavigationActions'
]


export default {

  __init__: [
    'semarchPropertiesProvider'
  ],

  semarchPropertiesProvider: [
    'type',
    SemArchPropertiesProvider
  ]
}

import {
  beforeEach,
  describe,
  expect,
  test,
  vi
} from 'vitest'


const {
  checkboxEntry,
  headerButton,
  numberFieldEntry,
  selectEntry,
  textFieldEntry,
  createDescriptors,
  useService,
  updateModdleProperties,
  moddleCreate
} = vi.hoisted(
  () => ({
    checkboxEntry:
      vi.fn(
        props =>
          props
      ),

    headerButton:
      vi.fn(
        props =>
          props
      ),

    numberFieldEntry:
      vi.fn(
        props =>
          props
      ),

    selectEntry:
      vi.fn(
        props =>
          props
      ),

    textFieldEntry:
      vi.fn(
        props =>
          props
      ),

    createDescriptors:
      vi.fn(),

    useService:
      vi.fn(),

    updateModdleProperties:
      vi.fn(),

    moddleCreate:
      vi.fn()
  })
)


vi.mock(
  '@bpmn-io/properties-panel',
  () => ({
    CheckboxEntry:
      checkboxEntry,

    HeaderButton:
      headerButton,

    NumberFieldEntry:
      numberFieldEntry,

    SelectEntry:
      selectEntry,

    TextFieldEntry:
      textFieldEntry,

    isCheckboxEntryEdited:
      vi.fn(),

    isNumberFieldEntryEdited:
      vi.fn(),

    isSelectEntryEdited:
      vi.fn(),

    isTextFieldEntryEdited:
      vi.fn()
  })
)


vi.mock(
  'bpmn-js-properties-panel',
  () => ({
    useService
  })
)


vi.mock(
  './semarch-property-descriptors.js',
  () => ({
    createSemArchPropertyDescriptors:
      createDescriptors
  })
)


import {
  SemArchPropertiesProvider
} from './semarch-properties-provider.js'

import {
  PropertyWidget
} from './semarch-property-widget.js'

import {
  createActiveProfileRuntime
} from '../profiles/active-profile-runtime.js'


describe(
  'SemArch properties provider',
  () => {

    beforeEach(
      () => {

        vi.clearAllMocks()


        useService.mockImplementation(
          serviceName => {

            switch (
              serviceName
            ) {

              case 'debounceInput':

                return (
                  value =>
                    value
                )


              case 'modeling':

                return {
                  updateModdleProperties
                }


              case 'moddle':

                return {
                  create:
                    moddleCreate
                }


              default:

                return null
            }
          }
        )
      }
    )


    test(
      'renders a boolean schema property with CheckboxEntry',
      () => {

        const descriptor = {

          propertyRef:
            'urn:test#TestType.approved',

          schemaType: {
            namespace:
              'urn:test'
          },

          property: {
            id:
              'urn:test#TestType.approved',

            name:
              'approved',

            datatype:
              'boolean'
          },

          dataProperty: {
            $type:
              'semarch:DataProperty',

            propertyRef:
              'urn:test#TestType.approved',

            value:
              'true'
          }
        }


        createDescriptors
          .mockReturnValue([
            descriptor
          ])


        let registeredProvider =
          null


        const propertiesPanel = {

          registerProvider(
            priority,
            provider
          ) {

            registeredProvider =
              provider
          }
        }


        const profileRuntime = {}


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime(
              profileRuntime
            )
          )


        expect(
          registeredProvider
        )
          .toBe(
            provider
          )


        const businessObject = {

          $type:
            'bpmn:DataObject',

          extensionElements: {
            values: [
              {
                $type:
                  'semarch:ObjectProperty',
                propertyRef:
                  'urn:test#Deliverable.customer',
                businessObjectRef:
                  'BO-DELIVERABLE-1',
                cocRef:
                  'coc-a',
                targetBusinessObjectRef:
                  'BO-CUSTOMER-2'
              }
            ]
          }
        }


        const element = {

          businessObject
        }


        const getGroups =
          provider.getGroups(
            element
          )


        const groups =
          getGroups(
            []
          )


        expect(
          groups
        )
          .toHaveLength(
            1
          )


        const semArchGroup =
          groups[0]


        expect(
          semArchGroup.id
        )
          .toBe(
            'semarch'
          )


        expect(
          semArchGroup.entries
        )
          .toHaveLength(
            1
          )


        const entry =
          semArchGroup.entries[0]


        expect(
          entry.widget
        )
          .toBe(
            PropertyWidget.BOOLEAN
          )


        const renderedEntry =
          entry.component(
            entry
          )


        expect(
          checkboxEntry
        )
          .toHaveBeenCalledTimes(
            1
          )


        expect(
          numberFieldEntry
        )
          .not
          .toHaveBeenCalled()


        expect(
          textFieldEntry
        )
          .not
          .toHaveBeenCalled()


        expect(
          renderedEntry.getValue()
        )
          .toBe(
            true
          )
      }
    )


    test(
      'serializes a boolean checkbox change through bpmn-js modeling',
      () => {

        const existingDataProperty = {

          $type:
            'semarch:DataProperty',

          propertyRef:
            'urn:test#TestType.approved',

          value:
            'true'
        }


        const descriptor = {

          propertyRef:
            'urn:test#TestType.approved',

          schemaType: {
            namespace:
              'urn:test'
          },

          property: {
            id:
              'urn:test#TestType.approved',

            name:
              'approved',

            datatype:
              'boolean'
          },

          dataProperty:
            existingDataProperty
        }


        createDescriptors
          .mockReturnValue([
            descriptor
          ])


        const propertiesPanel = {

          registerProvider() {
          }
        }


        const profileRuntime = {}


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime(
              profileRuntime
            )
          )


        const businessObject = {

          $type:
            'bpmn:DataObject',

          extensionElements: {
            values: [
              existingDataProperty
            ]
          }
        }


        const element = {

          businessObject
        }


        const groups =
          provider
            .getGroups(
              element
            )(
              []
            )


        const entry =
          groups[0]
            .entries[0]


        expect(
          entry.widget
        )
          .toBe(
            PropertyWidget.BOOLEAN
          )


        const renderedEntry =
          entry.component(
            entry
          )


        renderedEntry.setValue(
          false
        )


        expect(
          updateModdleProperties
        )
          .toHaveBeenCalledTimes(
            1
          )


        expect(
          updateModdleProperties
        )
          .toHaveBeenCalledWith(

            element,

            existingDataProperty,

            {
              value:
                'false'
            }
          )


        expect(
          moddleCreate
        )
          .not
          .toHaveBeenCalled()
      }
    )


    test(
      'creates a boolean DataProperty and ExtensionElements when absent',
      () => {

        const descriptor = {

          propertyRef:
            'urn:test#TestType.approved',

          schemaType: {
            namespace:
              'urn:test'
          },

          property: {
            id:
              'urn:test#TestType.approved',

            name:
              'approved',

            datatype:
              'boolean'
          },

          dataProperty:
            null
        }


        createDescriptors
          .mockReturnValue([
            descriptor
          ])


        const createdDataProperty = {

          $type:
            'semarch:DataProperty',

          propertyRef:
            'urn:test#TestType.approved',

          schemaRef:
            'urn:test',

          value:
            'true'
        }


        const createdExtensionElements = {

          $type:
            'bpmn:ExtensionElements',

          values: []
        }


        moddleCreate.mockImplementation(
          (
            type,
            properties
          ) => {

            if (
              type ===
                'semarch:DataProperty'
            ) {

              return {
                $type:
                  type,

                ...properties
              }
            }


            if (
              type ===
                'bpmn:ExtensionElements'
            ) {

              return {
                $type:
                  type,

                ...properties
              }
            }


            return null
          }
        )


        const propertiesPanel = {

          registerProvider() {
          }
        }


        const profileRuntime = {}


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime(
              profileRuntime
            )
          )


        const businessObject = {

          $type:
            'bpmn:DataObject'
        }


        const element = {

          businessObject
        }


        const groups =
          provider
            .getGroups(
              element
            )(
              []
            )


        const entry =
          groups[0]
            .entries[0]


        expect(
          entry.widget
        )
          .toBe(
            PropertyWidget.BOOLEAN
          )


        const renderedEntry =
          entry.component(
            entry
          )


        /*
         * Simulate the first value entered for a property that
         * does not yet exist in the BPMN model.
         */

        renderedEntry.setValue(
          true
        )


        /*
         * First create the semantic DataProperty.
         */

        expect(
          moddleCreate
        )
          .toHaveBeenNthCalledWith(

            1,

            'semarch:DataProperty',

            {
              propertyRef:
                'urn:test#TestType.approved',

              schemaRef:
                'urn:test',

              value:
                'true'
            }
          )


        /*
         * Since the semantic BPMN object has no ExtensionElements,
         * create the standard BPMN container too.
         */

        expect(
          moddleCreate
        )
          .toHaveBeenNthCalledWith(

            2,

            'bpmn:ExtensionElements',

            {
              values: []
            }
          )


        expect(
          moddleCreate
        )
          .toHaveBeenCalledTimes(
            2
          )


        /*
         * Recover the actual objects returned by moddle.create().
         */

        const dataProperty =
          moddleCreate
            .mock
            .results[0]
            .value


        const extensionElements =
          moddleCreate
            .mock
            .results[1]
            .value


        expect(
          dataProperty
        )
          .toEqual(
            createdDataProperty
          )


        expect(
          extensionElements
        )
          .toEqual(
            createdExtensionElements
          )


        /*
         * Attach ExtensionElements to the semantic BPMN object.
         */

        expect(
          updateModdleProperties
        )
          .toHaveBeenNthCalledWith(

            1,

            element,

            businessObject,

            {
              extensionElements
            }
          )


        /*
         * Then append the new DataProperty through bpmn-js
         * modeling so the operation remains on the command stack.
         */

        expect(
          updateModdleProperties
        )
          .toHaveBeenNthCalledWith(

            2,

            element,

            extensionElements,

            {
              values: [
                dataProperty
              ]
            }
          )


        expect(
          updateModdleProperties
        )
          .toHaveBeenCalledTimes(
            2
          )
      }
    )


    test(
      'resolves DataObjectReference semantic properties from its master DataObject',
      () => {

        createDescriptors
          .mockReturnValue([])


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime({})
          )


        const semanticType = {
          $type:
            'semarch:SemanticType',

          ref:
            'test:Deliverable'
        }


        const dataProperty = {
          $type:
            'semarch:DataProperty',

          propertyRef:
            'urn:test#DeliverableType.domain',

          value:
            'SYS'
        }


        const master = {
          $type:
            'bpmn:DataObject',

          extensionElements: {
            values: [
              semanticType,
              dataProperty
            ]
          }
        }


        const occurrence = {
          $type:
            'bpmn:DataObjectReference',

          dataObjectRef:
            master
        }


        provider
          .getGroups({
            businessObject:
              occurrence
          })([])


        expect(
          createDescriptors
        )
          .toHaveBeenLastCalledWith(
            expect.objectContaining({
              semanticTypeRefs: [
                'test:Deliverable'
              ],
              dataProperties: [
                dataProperty
              ]
            })
          )
      }
    )


    test(
      'resolves two DataStoreReference occurrences to the same master DataStore and writes the master',
      () => {

        const propertyRef =
          'urn:test#DeliverableType.domain'


        const semanticType = {
          $type:
            'semarch:SemanticType',

          ref:
            'test:Deliverable'
        }


        const existingDataProperty = {
          $type:
            'semarch:DataProperty',

          propertyRef,

          value:
            'SYS'
        }


        const master = {
          $type:
            'bpmn:DataStore',

          extensionElements: {
            values: [
              semanticType,
              existingDataProperty
            ]
          }
        }


        const occurrenceA = {
          $type:
            'bpmn:DataStoreReference',

          dataStoreRef:
            master
        }


        const occurrenceB = {
          $type:
            'bpmn:DataStoreReference',

          dataStoreRef:
            master
        }


        const descriptor = {
          propertyRef,

          schemaType: {
            namespace:
              'urn:test'
          },

          property: {
            id:
              propertyRef,

            name:
              'domain',

            datatype:
              'string'
          },

          dataProperty:
            existingDataProperty
        }


        createDescriptors
          .mockReturnValue([
            descriptor
          ])


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime({})
          )


        const elementA = {
          businessObject:
            occurrenceA
        }


        const groupsA =
          provider
            .getGroups(
              elementA
            )([])


        expect(
          createDescriptors
        )
          .toHaveBeenLastCalledWith(
            expect.objectContaining({
              semanticTypeRefs: [
                'test:Deliverable'
              ],
              dataProperties: [
                existingDataProperty
              ]
            })
          )


        const elementB = {
          businessObject:
            occurrenceB
        }


        provider
          .getGroups(
            elementB
          )([])


        expect(
          createDescriptors
        )
          .toHaveBeenLastCalledWith(
            expect.objectContaining({
              semanticTypeRefs: [
                'test:Deliverable'
              ],
              dataProperties: [
                existingDataProperty
              ]
            })
          )


        const entry =
          groupsA
            .find(
              group =>
                group.id ===
                  'semarch'
            )
            .entries
            .find(
              candidate =>
                candidate.descriptor ===
                  descriptor
            )


        expect(entry)
          .toBeDefined()


        const renderedEntry =
          entry.component(
            entry
          )


        renderedEntry.setValue(
          'AIRFRAME'
        )


        expect(
          updateModdleProperties
        )
          .toHaveBeenCalledWith(
            elementA,
            existingDataProperty,
            {
              value:
                'AIRFRAME'
            }
          )


        expect(
          occurrenceA.extensionElements
        )
          .toBeUndefined()

        expect(
          occurrenceB.extensionElements
        )
          .toBeUndefined()

        expect(
          master.extensionElements.values
        )
          .toContain(
            existingDataProperty
          )
      }
    )


    test(
      'uses the currently active profile runtime without recreating the provider',
      () => {

        const propertiesPanel = {
          registerProvider() {
          }
        }


        const runtimeA = {
          id: 'A'
        }


        const runtimeB = {
          id: 'B'
        }


        const activeProfileRuntime =
          createActiveProfileRuntime(
            runtimeA
          )


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            activeProfileRuntime
          )


        const element = {
          businessObject: {
            $type: 'bpmn:DataObject',
            extensionElements: {
              values: []
            }
          }
        }


        provider
          .getGroups(
            element
          )(
            []
          )


        expect(
          createDescriptors
        )
          .toHaveBeenLastCalledWith(
            expect.objectContaining({
              profileRuntime:
                runtimeA
            })
          )


        activeProfileRuntime.set(
          runtimeB
        )


        provider
          .getGroups(
            element
          )(
            []
          )


        expect(
          createDescriptors
        )
          .toHaveBeenLastCalledWith(
            expect.objectContaining({
              profileRuntime:
                runtimeB
            })
          )
      }
    )


    test(
      'reads the current RepositoryContext CoC when resolving an attached Business Object without recreating the provider',
      () => {

        createDescriptors
          .mockReturnValue([])


        const propertiesPanel = {
          registerProvider() {
          }
        }


        let repositoryContext = {
          cocOwner:
            'coc-a'
        }


        const businessObject = {
          id:
            'BO-1',
          typeRefs: [
            'test:Deliverable'
          ]
        }


        const businessObjectStore = {
          getBusinessObjects() {
            return [
              businessObject
            ]
          }
        }


        const businessObjectRepresentationActions = {
          isBusinessObjectAttached(
            businessObjectId,
            representationId
          ) {
            return (
              businessObjectId ===
                'BO-1' &&
              representationId ===
                'DataStore_1'
            )
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime({}),
            null,
            businessObjectStore,
            businessObjectRepresentationActions,
            null,
            () => repositoryContext
          )


        const element = {
          businessObject: {
            $type:
              'bpmn:DataStoreReference',
            dataStoreRef: {
              $type:
                'bpmn:DataStore',
              id:
                'DataStore_1',
              extensionElements: {
                values: []
              }
            }
          }
        }


        provider
          .getGroups(
            element
          )([])


        expect(
          createDescriptors
        )
          .toHaveBeenLastCalledWith(
            expect.objectContaining({
              cocId:
                'coc-a'
            })
          )


        repositoryContext = {
          cocOwner:
            'coc-b'
        }


        provider
          .getGroups(
            element
          )([])


        expect(
          createDescriptors
        )
          .toHaveBeenLastCalledWith(
            expect.objectContaining({
              cocId:
                'coc-b'
            })
          )
      }
    )


    test(
      'writes an attached Business Object contextual value with Business Object and CoC ownership discriminants',
      () => {

        const descriptor = {
          propertyRef:
            'urn:test#Deliverable.status',
          schemaType: {
            namespace:
              'urn:test'
          },
          property: {
            id:
              'urn:test#Deliverable.status',
            name:
              'status',
            datatype:
              'string'
          },
          dataProperty:
            null
        }


        createDescriptors
          .mockImplementation(
            ({
              semanticTypeRefs = []
            } = {}) =>
              semanticTypeRefs.includes(
                'test:Deliverable'
              )
                ? [ descriptor ]
                : []
          )


        moddleCreate.mockImplementation(
          (
            type,
            properties
          ) => ({
            $type:
              type,
            ...properties
          })
        )


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const businessObject = {
          id:
            'BO-1',
          typeRefs: [
            'test:Deliverable'
          ]
        }


        const businessObjectStore = {
          getBusinessObjects() {
            return [
              businessObject
            ]
          }
        }


        const businessObjectRepresentationActions = {
          isBusinessObjectAttached(
            businessObjectId,
            representationId
          ) {
            return (
              businessObjectId ===
                'BO-1' &&
              representationId ===
                'DataStore_1'
            )
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime({}),
            null,
            businessObjectStore,
            businessObjectRepresentationActions,
            null,
            () => ({
              cocOwner:
                'coc-a'
            })
          )


        const semanticObject = {
          $type:
            'bpmn:DataStore',
          id:
            'DataStore_1',
          extensionElements: {
            values: []
          }
        }


        const element = {
          businessObject: {
            $type:
              'bpmn:DataStoreReference',
            dataStoreRef:
              semanticObject
          }
        }


        const groups =
          provider
            .getGroups(
              element
            )([])


        expect(
          createDescriptors
        )
          .toHaveBeenCalledWith(
            expect.objectContaining({
              semanticTypeRefs: [
                'test:Deliverable'
              ],
              cocId:
                'coc-a'
            })
          )


        const masterGroup =
          groups.find(
            group =>
              group.id ===
                'semarch-master'
          )


        const businessObjectEntry =
          masterGroup.entries.find(
            entry =>
              entry.id ===
                'semarch-business-object-0'
          )


        const contextualEntry =
          businessObjectEntry.entries[0]


        expect(
          contextualEntry
            .businessObjectId
        )
          .toBe(
            'BO-1'
          )


        expect(
          contextualEntry
            .cocId
        )
          .toBe(
            'coc-a'
          )


        const renderedEntry =
          contextualEntry.component(
            contextualEntry
          )


        renderedEntry.setValue(
          'approved'
        )


        expect(
          moddleCreate
        )
          .toHaveBeenNthCalledWith(
            1,
            'semarch:DataProperty',
            {
              propertyRef:
                'urn:test#Deliverable.status',
              schemaRef:
                'urn:test',
              businessObjectRef:
                'BO-1',
              cocRef:
                'coc-a',
              value:
                'approved'
            }
          )


        const createdDataProperty =
          moddleCreate
            .mock
            .results[0]
            .value


        expect(
          createdDataProperty
            .businessObjectRef
        )
          .toBe(
            'BO-1'
          )


        expect(
          createdDataProperty
            .cocRef
        )
          .toBe(
            'coc-a'
          )


        expect(
          updateModdleProperties
        )
          .toHaveBeenCalledWith(
            element,
            semanticObject.extensionElements,
            {
              values: [
                createdDataProperty
              ]
            }
          )
      }
    )

    test(
      'qualifies the unique legacy DataProperty in place when editing a contextual value',
      () => {

        const legacyDataProperty = {
          $type: 'semarch:DataProperty',
          propertyRef: 'urn:test#Deliverable.status',
          schemaRef: 'urn:test',
          value: 'historical-value'
        }

        const descriptor = {
          propertyRef: 'urn:test#Deliverable.status',
          schemaType: {
            namespace: 'urn:test'
          },
          property: {
            id: 'urn:test#Deliverable.status',
            name: 'status',
            datatype: 'string'
          },
          dataProperty: null
        }

        createDescriptors
          .mockImplementation(
            ({
              semanticTypeRefs = []
            } = {}) =>
              semanticTypeRefs.includes(
                'test:Deliverable'
              )
                ? [ descriptor ]
                : []
          )

        const propertiesPanel = {
          registerProvider() {
          }
        }

        const businessObject = {
          id: 'BO-1',
          typeRefs: [
            'test:Deliverable'
          ]
        }

        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime({}),
            null,
            {
              getBusinessObjects() {
                return [
                  businessObject
                ]
              }
            },
            {
              isBusinessObjectAttached(
                businessObjectId,
                representationId
              ) {
                return (
                  businessObjectId === 'BO-1' &&
                  representationId === 'DataStore_1'
                )
              }
            },
            null,
            () => ({
              cocOwner: 'coc-a'
            })
          )

        const semanticObject = {
          $type: 'bpmn:DataStore',
          id: 'DataStore_1',
          extensionElements: {
            values: [
              legacyDataProperty
            ]
          }
        }

        const element = {
          businessObject: {
            $type: 'bpmn:DataStoreReference',
            dataStoreRef: semanticObject
          }
        }

        const groups =
          provider
            .getGroups(
              element
            )([])

        const contextualEntry =
          groups
            .find(
              group =>
                group.id === 'semarch-master'
            )
            .entries
            .find(
              entry =>
                entry.id === 'semarch-business-object-0'
            )
            .entries[0]

        contextualEntry
          .component(
            contextualEntry
          )
          .setValue(
            'approved'
          )

        expect(
          updateModdleProperties
        )
          .toHaveBeenCalledWith(
            element,
            legacyDataProperty,
            {
              businessObjectRef:
                'BO-1',
              cocRef:
                'coc-a',
              value:
                'approved'
            }
          )

        expect(
          moddleCreate
        )
          .not
          .toHaveBeenCalledWith(
            'semarch:DataProperty',
            expect.anything()
          )

        expect(
          semanticObject
            .extensionElements
            .values
        )
          .toEqual([
            legacyDataProperty
          ])
      }
    )


    test(
      'updates only the selected Business Object and CoC qualified DataProperty',
      () => {

        const selectedDataProperty = {
          $type: 'semarch:DataProperty',
          propertyRef: 'urn:test#Deliverable.status',
          schemaRef: 'urn:test',
          businessObjectRef: 'BO-1',
          cocRef: 'coc-a',
          value: 'draft'
        }

        const otherCocDataProperty = {
          ...selectedDataProperty,
          cocRef: 'coc-b',
          value: 'coc-b-value'
        }

        const otherBusinessObjectDataProperty = {
          ...selectedDataProperty,
          businessObjectRef: 'BO-2',
          value: 'other-bo-value'
        }

        const descriptor = {
          propertyRef: 'urn:test#Deliverable.status',
          schemaType: {
            namespace: 'urn:test'
          },
          property: {
            id: 'urn:test#Deliverable.status',
            name: 'status',
            datatype: 'string'
          },
          dataProperty: selectedDataProperty
        }

        createDescriptors
          .mockImplementation(
            ({
              semanticTypeRefs = []
            } = {}) =>
              semanticTypeRefs.includes(
                'test:Deliverable'
              )
                ? [ descriptor ]
                : []
          )

        const propertiesPanel = {
          registerProvider() {
          }
        }

        const businessObject = {
          id: 'BO-1',
          typeRefs: [
            'test:Deliverable'
          ]
        }

        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime({}),
            null,
            {
              getBusinessObjects() {
                return [
                  businessObject
                ]
              }
            },
            {
              isBusinessObjectAttached(
                businessObjectId,
                representationId
              ) {
                return (
                  businessObjectId === 'BO-1' &&
                  representationId === 'DataStore_1'
                )
              }
            },
            null,
            () => ({
              cocOwner: 'coc-a'
            })
          )

        const semanticObject = {
          $type: 'bpmn:DataStore',
          id: 'DataStore_1',
          extensionElements: {
            values: [
              selectedDataProperty,
              otherCocDataProperty,
              otherBusinessObjectDataProperty
            ]
          }
        }

        const element = {
          businessObject: {
            $type: 'bpmn:DataStoreReference',
            dataStoreRef: semanticObject
          }
        }

        const groups =
          provider
            .getGroups(
              element
            )([])

        const contextualEntry =
          groups
            .find(
              group =>
                group.id === 'semarch-master'
            )
            .entries
            .find(
              entry =>
                entry.id === 'semarch-business-object-0'
            )
            .entries[0]

        contextualEntry
          .component(
            contextualEntry
          )
          .setValue(
            'approved'
          )

        expect(
          updateModdleProperties
        )
          .toHaveBeenCalledWith(
            element,
            selectedDataProperty,
            {
              value: 'approved'
            }
          )

        expect(
          updateModdleProperties
        )
          .not
          .toHaveBeenCalledWith(
            element,
            otherCocDataProperty,
            expect.anything()
          )

        expect(
          updateModdleProperties
        )
          .not
          .toHaveBeenCalledWith(
            element,
            otherBusinessObjectDataProperty,
            expect.anything()
          )

        expect(
          otherCocDataProperty.value
        )
          .toBe(
            'coc-b-value'
          )

        expect(
          otherBusinessObjectDataProperty.value
        )
          .toBe(
            'other-bo-value'
          )
      }
    )


    test(
      'offers only profile semantic types compatible with a blank DataObject',
      () => {

        createDescriptors
          .mockReturnValue([])


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const profileRuntime = {

          getTypes() {

            return [
              {
                id:
                  'test:Document',
                label:
                  'Test Document',
                bpmnAnchor:
                  'bpmn:DataObject',
                representation: {
                  master:
                    'bpmn:DataObject',
                  occurrence:
                    'bpmn:DataObjectReference'
                }
              },
              {
                id:
                  'test:Deliverable',
                label:
                  'Test Deliverable',
                bpmnAnchor:
                  'bpmn:DataStore',
                representation: {
                  master:
                    'bpmn:DataStore',
                  occurrence:
                    'bpmn:DataStoreReference'
                }
              }
            ]
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime(
              profileRuntime
            )
          )


        const element = {
          businessObject: {
            $type:
              'bpmn:DataObject'
          }
        }


        const groups =
          provider
            .getGroups(
              element
            )([])


        expect(groups)
          .toHaveLength(1)

        expect(
          groups[0].entries
        ).toHaveLength(1)


        const entry =
          groups[0].entries[0]

        const renderedEntry =
          entry.component(
            entry
          )


        expect(
          selectEntry
        ).toHaveBeenCalledTimes(1)

        expect(
          renderedEntry.getOptions()
        ).toEqual([
          {
            label:
              'Select semantic type',
            value:
              ''
          },
          {
            label:
              'Test Document',
            value:
              'test:Document'
          }
        ])
      }
    )


    test(
      'creates SemanticType and ExtensionElements on a blank semantic master',
      () => {

        createDescriptors
          .mockReturnValue([])


        moddleCreate.mockImplementation(
          (
            type,
            properties
          ) => ({
            $type:
              type,
            ...properties
          })
        )


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const profileRuntime = {

          getTypes() {

            return [
              {
                id:
                  'test:Document',
                label:
                  'Test Document',
                bpmnAnchor:
                  'bpmn:DataObject',
                representation: {
                  master:
                    'bpmn:DataObject',
                  occurrence:
                    'bpmn:DataObjectReference'
                }
              }
            ]
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime(
              profileRuntime
            )
          )


        const master = {
          $type:
            'bpmn:DataObject'
        }


        const element = {
          businessObject:
            master
        }


        const entry =
          provider
            .getGroups(
              element
            )([])[0]
            .entries[0]


        entry
          .component(
            entry
          )
          .setValue(
            'test:Document'
          )


        expect(
          moddleCreate
        ).toHaveBeenNthCalledWith(
          1,
          'semarch:SemanticType',
          {
            ref:
              'test:Document'
          }
        )

        expect(
          moddleCreate
        ).toHaveBeenNthCalledWith(
          2,
          'bpmn:ExtensionElements',
          {
            values: []
          }
        )


        const semanticType =
          moddleCreate
            .mock
            .results[0]
            .value

        const extensionElements =
          moddleCreate
            .mock
            .results[1]
            .value


        expect(
          updateModdleProperties
        ).toHaveBeenNthCalledWith(
          1,
          element,
          master,
          {
            extensionElements
          }
        )

        expect(
          updateModdleProperties
        ).toHaveBeenNthCalledWith(
          2,
          element,
          extensionElements,
          {
            values: [
              semanticType
            ]
          }
        )
      }
    )


    test(
      'adds another compatible semantic type without offering an already assigned type',
      () => {

        createDescriptors
          .mockReturnValue([])


        moddleCreate.mockImplementation(
          (
            type,
            properties
          ) => ({
            $type:
              type,
            ...properties
          })
        )


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const profileRuntime = {

          getTypes() {

            return [
              {
                id:
                  'test:DocumentA',
                label:
                  'Test Document A',
                representation: {
                  master:
                    'bpmn:DataObject'
                }
              },
              {
                id:
                  'test:DocumentB',
                label:
                  'Test Document B',
                representation: {
                  master:
                    'bpmn:DataObject'
                }
              }
            ]
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime(
              profileRuntime
            )
          )


        const existingSemanticType = {
          $type:
            'semarch:SemanticType',
          ref:
            'test:DocumentA'
        }


        const extensionElements = {
          values: [
            existingSemanticType
          ]
        }


        const master = {
          $type:
            'bpmn:DataObject',
          extensionElements
        }


        const element = {
          businessObject:
            master
        }


        const entries =
          provider
            .getGroups(
              element
            )([])[0]
            .entries


        expect(
          entries.map(
            entry =>
              entry.id
          )
        ).toEqual([
          'semarch-semantic-type-new',
          'semarch-semantic-type-0'
        ])


        const addEntry =
          entries.find(
            entry =>
              entry.id ===
                'semarch-semantic-type-new'
          )


        const renderedEntry =
          addEntry.component(
            addEntry
          )


        expect(
          renderedEntry
            .getOptions()
            .map(
              option =>
                option.value
            )
        ).toEqual([
          '',
          'test:DocumentB'
        ])


        renderedEntry.setValue(
          'test:DocumentB'
        )


        expect(
          moddleCreate
        ).toHaveBeenCalledWith(
          'semarch:SemanticType',
          {
            ref:
              'test:DocumentB'
          }
        )


        const createdSemanticType =
          moddleCreate
            .mock
            .results[0]
            .value


        expect(
          updateModdleProperties
        ).toHaveBeenCalledWith(
          element,
          extensionElements,
          {
            values: [
              existingSemanticType,
              createdSemanticType
            ]
          }
        )
      }
    )


    test(
      'assigns a semantic type from DataObjectReference to its DataObject master',
      () => {

        createDescriptors
          .mockReturnValue([])


        moddleCreate.mockImplementation(
          (
            type,
            properties
          ) => ({
            $type:
              type,
            ...properties
          })
        )


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const profileRuntime = {

          getTypes() {

            return [
              {
                id:
                  'test:Document',
                label:
                  'Test Document',
                representation: {
                  master:
                    'bpmn:DataObject',
                  occurrence:
                    'bpmn:DataObjectReference'
                }
              }
            ]
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime(
              profileRuntime
            )
          )


        const master = {
          $type:
            'bpmn:DataObject'
        }


        const occurrence = {
          $type:
            'bpmn:DataObjectReference',
          dataObjectRef:
            master
        }


        const element = {
          businessObject:
            occurrence
        }


        const entry =
          provider
            .getGroups(
              element
            )([])
            .find(
              group =>
                group.id ===
                  'semarch'
            )
            .entries
            .find(
              candidate =>
                candidate.id ===
                  'semarch-semantic-type-new'
            )


        expect(entry)
          .toBeDefined()


        expect(
          entry.semanticObject
        ).toBe(
          master
        )


        entry
          .component(
            entry
          )
          .setValue(
            'test:Document'
          )


        expect(
          updateModdleProperties
        ).toHaveBeenCalledWith(
          element,
          master,
          expect.objectContaining({
            extensionElements:
              expect.any(Object)
          })
        )

        expect(
          occurrence.extensionElements
        ).toBeUndefined()
      }
    )


    test(
      'does not offer DataObject semantic types on a blank DataStoreReference master',
      () => {

        createDescriptors
          .mockReturnValue([])


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const profileRuntime = {

          getTypes() {

            return [
              {
                id:
                  'test:Document',
                label:
                  'Test Document',
                representation: {
                  master:
                    'bpmn:DataObject',
                  occurrence:
                    'bpmn:DataObjectReference'
                }
              }
            ]
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime(
              profileRuntime
            )
          )


        const master = {
          $type:
            'bpmn:DataStore'
        }


        const occurrence = {
          $type:
            'bpmn:DataStoreReference',
          dataStoreRef:
            master
        }


        const groups =
          provider
            .getGroups({
              businessObject:
                occurrence
            })([])


        expect(groups)
          .toHaveLength(2)

        const masterGroup =
          groups.find(
            group =>
              group.id ===
                'semarch-master'
          )

        const semarchGroup =
          groups.find(
            group =>
              group.id ===
                'semarch'
          )

        expect(
          masterGroup.entries.map(
            entry =>
              entry.id
          )
        ).toEqual([
          'semarch-master-linked',
          'semarch-master-id'
        ])

        expect(
          semarchGroup.entries.map(
            entry =>
              entry.id
          )
        ).toEqual([
          'semarch-occurrence-state'
        ])

        const linkedEntry =
          masterGroup.entries.find(
            entry =>
              entry.id ===
                'semarch-master-linked'
          )

        expect(
          linkedEntry
            .component(
              linkedEntry
            )
            .getValue()
        ).toBe(
          'Yes'
        )

        const masterIdEntry =
          masterGroup.entries.find(
            entry =>
              entry.id ===
                'semarch-master-id'
          )

        expect(
          masterIdEntry
            .component(
              masterIdEntry
            )
            .getValue()
        ).toBe(
          ''
        )

        expect(
          selectEntry
        ).not.toHaveBeenCalled()
      }
    )


    test(
      'shows an explicit unlinked Master group for a standalone DataStoreReference',
      () => {

        createDescriptors
          .mockReturnValue([])


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime({})
          )


        const occurrence = {
          $type:
            'bpmn:DataStoreReference',
          id:
            'DataStoreReference_Standalone',
          name:
            'Local object'
        }


        const nativeNameEntry = {
          id:
            'name'
        }


        const groups =
          provider
            .getGroups({
              businessObject:
                occurrence
            })([
              {
                id:
                  'general',
                entries: [
                  nativeNameEntry,
                  {
                    id:
                      'id'
                  }
                ]
              }
            ])


        const generalGroup =
          groups.find(
            group =>
              group.id ===
                'general'
          )

        const masterGroup =
          groups.find(
            group =>
              group.id ===
                'semarch-master'
          )

        const semarchGroup =
          groups.find(
            group =>
              group.id ===
                'semarch'
          )


        expect(
          generalGroup.entries.find(
            entry =>
              entry.id ===
                'name'
          )
        ).toBe(
          nativeNameEntry
        )

        expect(
          masterGroup.label
        ).toBe(
          'Master'
        )

        expect(
          masterGroup.entries.map(
            entry =>
              entry.id
          )
        ).toEqual([
          'semarch-master-linked'
        ])

        const linkedEntry =
          masterGroup.entries[0]

        const renderedLinkedEntry =
          linkedEntry.component(
            linkedEntry
          )

        expect(
          renderedLinkedEntry.getValue()
        ).toBe(
          'No'
        )

        expect(
          renderedLinkedEntry.disabled
        ).toBe(
          true
        )

        expect(
          semarchGroup.entries.map(
            entry =>
              entry.id
          )
        ).toEqual([
          'semarch-occurrence-state'
        ])
      }
    )


    test(
      'refreshes compatible semantic type options from the active runtime without recreating the provider',
      () => {

        createDescriptors
          .mockReturnValue([])


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const runtimeA = {
          getTypes() {
            return [
              {
                id:
                  'test:DocumentA',
                representation: {
                  master:
                    'bpmn:DataObject'
                }
              }
            ]
          }
        }


        const runtimeB = {
          getTypes() {
            return [
              {
                id:
                  'test:DocumentB',
                representation: {
                  master:
                    'bpmn:DataObject'
                }
              }
            ]
          }
        }


        const activeProfileRuntime =
          createActiveProfileRuntime(
            runtimeA
          )


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            activeProfileRuntime
          )


        const element = {
          businessObject: {
            $type:
              'bpmn:DataObject'
          }
        }


        const entryA =
          provider
            .getGroups(
              element
            )([])[0]
            .entries[0]


        expect(
          entryA
            .component(
              entryA
            )
            .getOptions()
            .map(
              option =>
                option.value
            )
        ).toEqual([
          '',
          'test:DocumentA'
        ])


        activeProfileRuntime.set(
          runtimeB
        )


        const entryB =
          provider
            .getGroups(
              element
            )([])[0]
            .entries[0]


        expect(
          entryB
            .component(
              entryB
            )
            .getOptions()
            .map(
              option =>
                option.value
            )
        ).toEqual([
          '',
          'test:DocumentB'
        ])
      }
    )


    test(
      'renders and updates native BPMN state on a DataStoreReference occurrence',
      () => {

        createDescriptors
          .mockReturnValue([])


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime({})
          )


        const dataState = {
          $type:
            'bpmn:DataState',
          name:
            'Draft'
        }


        const master = {
          $type:
            'bpmn:DataStore'
        }


        const occurrence = {
          $type:
            'bpmn:DataStoreReference',
          dataStoreRef:
            master,
          dataState
        }


        const element = {
          businessObject:
            occurrence
        }


        const groups =
          provider
            .getGroups(
              element
            )([])


        expect(groups)
          .toHaveLength(2)


        const stateEntry =
          groups
            .find(
              group =>
                group.id ===
                  'semarch'
            )
            .entries
            .find(
            entry =>
              entry.id ===
                'semarch-occurrence-state'
          )


        expect(stateEntry)
          .toBeDefined()


        const renderedEntry =
          stateEntry.component(
            stateEntry
          )


        expect(
          renderedEntry.getValue()
        ).toBe(
          'Draft'
        )


        renderedEntry.setValue(
          'Approved'
        )


        expect(
          updateModdleProperties
        ).toHaveBeenCalledWith(
          element,
          dataState,
          {
            name:
              'Approved'
          }
        )


        expect(
          master.dataState
        ).toBeUndefined()
      }
    )


    test(
      'creates native BPMN DataState on a DataObjectReference occurrence when absent',
      () => {

        createDescriptors
          .mockReturnValue([])


        moddleCreate.mockImplementation(
          (
            type,
            properties
          ) => ({
            $type:
              type,
            ...properties
          })
        )


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime({})
          )


        const master = {
          $type:
            'bpmn:DataObject'
        }


        const occurrence = {
          $type:
            'bpmn:DataObjectReference',
          dataObjectRef:
            master
        }


        const element = {
          businessObject:
            occurrence
        }


        const stateEntry =
          provider
            .getGroups(
              element
            )([])
            .find(
              group =>
                group.id ===
                  'semarch'
            )
            .entries
            .find(
              entry =>
                entry.id ===
                  'semarch-occurrence-state'
            )


        stateEntry
          .component(
            stateEntry
          )
          .setValue(
            'Reviewed'
          )


        expect(
          moddleCreate
        ).toHaveBeenCalledWith(
          'bpmn:DataState',
          {
            name:
              'Reviewed'
          }
        )


        const dataState =
          moddleCreate
            .mock
            .results[0]
            .value


        expect(
          updateModdleProperties
        ).toHaveBeenCalledWith(
          element,
          occurrence,
          {
            dataState
          }
        )


        expect(
          master.dataState
        ).toBeUndefined()

        expect(
          occurrence.extensionElements
        ).toBeUndefined()
      }
    )


    test(
      'does not create DataState for an empty occurrence state',
      () => {

        createDescriptors
          .mockReturnValue([])


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime({})
          )


        const occurrence = {
          $type:
            'bpmn:DataStoreReference',
          dataStoreRef: {
            $type:
              'bpmn:DataStore'
          }
        }


        const element = {
          businessObject:
            occurrence
        }


        const stateEntry =
          provider
            .getGroups(
              element
            )([])
            .find(
              group =>
                group.id ===
                  'semarch'
            )
            .entries
            .find(
              entry =>
                entry.id ===
                  'semarch-occurrence-state'
            )


        stateEntry
          .component(
            stateEntry
          )
          .setValue(
            ''
          )


        expect(
          moddleCreate
        ).not.toHaveBeenCalled()

        expect(
          updateModdleProperties
        ).not.toHaveBeenCalled()
      }
    )


    test(
      'replaces native General Name with the linked DataStore master name',
      () => {

        createDescriptors
          .mockReturnValue([])


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime({})
          )


        const master = {
          $type:
            'bpmn:DataStore',
          id:
            'DataStore_Master',
          name:
            'System Specification'
        }


        const occurrence = {
          $type:
            'bpmn:DataStoreReference',
          id:
            'DataStoreReference_1',
          name:
            'Legacy occurrence label',
          dataStoreRef:
            master
        }


        const element = {
          businessObject:
            occurrence
        }


        const nativeNameEntry = {
          id:
            'name',
          component:
            vi.fn()
        }


        const nativeIdEntry = {
          id:
            'id'
        }


        const groups =
          provider
            .getGroups(
              element
            )([
              {
                id:
                  'general',
                label:
                  'General',
                entries: [
                  nativeNameEntry,
                  nativeIdEntry
                ]
              }
            ])


        const generalGroup =
          groups.find(
            group =>
              group.id ===
                'general'
          )


        const nameEntry =
          generalGroup.entries.find(
            entry =>
              entry.id ===
                'name'
          )


        expect(nameEntry)
          .toBeDefined()

        expect(nameEntry)
          .not
          .toBe(
            nativeNameEntry
          )

        expect(
          generalGroup.entries.find(
            entry =>
              entry.id ===
                'id'
          )
        ).toBe(
          nativeIdEntry
        )


        const renderedEntry =
          nameEntry.component(
            nameEntry
          )


        expect(
          renderedEntry.getValue()
        ).toBe(
          'System Specification'
        )


        renderedEntry.setValue(
          'Updated Specification'
        )


        expect(
          updateModdleProperties
        ).toHaveBeenCalledWith(
          element,
          master,
          {
            name:
              'Updated Specification'
          }
        )


        expect(
          occurrence.name
        ).toBe(
          'Legacy occurrence label'
        )
      }
    )


    test(
      'replaces native General Name with the linked DataObject master name',
      () => {

        createDescriptors
          .mockReturnValue([])


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime({})
          )


        const master = {
          $type:
            'bpmn:DataObject',
          name:
            'Master Document'
        }


        const occurrence = {
          $type:
            'bpmn:DataObjectReference',
          name:
            'Contextual BPMN label',
          dataObjectRef:
            master
        }


        const element = {
          businessObject:
            occurrence
        }


        const nativeNameEntry = {
          id:
            'name'
        }


        const groups =
          provider
            .getGroups(
              element
            )([
              {
                id:
                  'general',
                entries: [
                  nativeNameEntry,
                  {
                    id:
                      'id'
                  }
                ]
              }
            ])


        const nameEntry =
          groups
            .find(
              group =>
                group.id ===
                  'general'
            )
            .entries
            .find(
              entry =>
                entry.id ===
                  'name'
            )


        const renderedEntry =
          nameEntry.component(
            nameEntry
          )


        expect(
          renderedEntry.getValue()
        ).toBe(
          'Master Document'
        )


        renderedEntry.setValue(
          'Updated Master Document'
        )


        expect(
          updateModdleProperties
        ).toHaveBeenCalledWith(
          element,
          master,
          {
            name:
              'Updated Master Document'
          }
        )


        expect(
          occurrence.name
        ).toBe(
          'Contextual BPMN label'
        )
      }
    )


    test(
      'keeps native General Name unchanged for a semantic master',
      () => {

        createDescriptors
          .mockReturnValue([])


        const propertiesPanel = {
          registerProvider() {
          }
        }


        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime({})
          )


        const master = {
          $type:
            'bpmn:DataStore'
        }


        const nativeNameEntry = {
          id:
            'name'
        }


        const inputGroups = [
          {
            id:
              'general',
            entries: [
              nativeNameEntry,
              {
                id:
                  'id'
              }
            ]
          }
        ]


        const groups =
          provider
            .getGroups({
              businessObject:
                master
            })(
              inputGroups
            )


        expect(groups)
          .toBe(
            inputGroups
          )

        expect(
          groups[0].entries[0]
        ).toBe(
          nativeNameEntry
        )
      }
    )


    test(
      'registers after the native BPMN provider and transforms its General Name entry',
      () => {

        createDescriptors
          .mockReturnValue([])


        let semArchPriority =
          null

        let semArchProvider =
          null


        const propertiesPanel = {

          registerProvider(
            priority,
            provider
          ) {

            semArchPriority =
              priority

            semArchProvider =
              provider
          }
        }


        new SemArchPropertiesProvider(
          propertiesPanel,
          createActiveProfileRuntime({})
        )


        expect(
          semArchPriority
        ).toBe(
          500
        )


        const master = {
          $type:
            'bpmn:DataStore',
          name:
            'Master Deliverable'
        }


        const occurrence = {
          $type:
            'bpmn:DataStoreReference',
          name:
            'Occurrence label',
          dataStoreRef:
            master
        }


        const element = {
          businessObject:
            occurrence
        }


        const nativeNameEntry = {
          id:
            'name',
          component:
            vi.fn()
        }


        const nativeProvider = {

          getGroups() {

            return groups =>
              groups.concat([
                {
                  id:
                    'general',
                  label:
                    'General',
                  entries: [
                    nativeNameEntry,
                    {
                      id:
                        'id'
                    }
                  ]
                }
              ])
          }
        }


        /*
         * diagram-js EventBus invokes the native provider (priority 1000)
         * before SemArch (priority 500). The properties panel then reduces
         * providers in that collected order.
         */

        const groups =
          [
            nativeProvider,
            semArchProvider
          ].reduce(
            (
              currentGroups,
              provider
            ) =>
              provider
                .getGroups(
                  element
                )(
                  currentGroups
                ),
            []
          )


        const generalGroup =
          groups.find(
            group =>
              group.id ===
                'general'
          )


        const nameEntry =
          generalGroup.entries.find(
            entry =>
              entry.id ===
                'name'
          )


        expect(nameEntry)
          .not
          .toBe(
            nativeNameEntry
          )


        const renderedEntry =
          nameEntry.component(
            nameEntry
          )


        expect(
          renderedEntry.getValue()
        ).toBe(
          'Master Deliverable'
        )


        renderedEntry.setValue(
          'Updated Master Deliverable'
        )


        expect(
          updateModdleProperties
        ).toHaveBeenCalledWith(
          element,
          master,
          {
            name:
              'Updated Master Deliverable'
          }
        )
      }
    )


    test(
      'does not expose an object schema property through the generic DataProperty pipeline',
      () => {

        const dataDescriptor = {
          propertyRef:
            'urn:test#TestType.name',
          property: {
            kind:
              'data',
            datatype:
              'string'
          }
        }

        const objectDescriptor = {
          propertyRef:
            'urn:test#TestType.customer',
          property: {
            kind:
              'object',
            targetType:
              'urn:test#CustomerType',
            datatype:
              null
          }
        }

        createDescriptors
          .mockReturnValue([
            dataDescriptor,
            objectDescriptor
          ])

        const propertiesPanel = {
          registerProvider() {
          }
        }

        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            createActiveProfileRuntime({})
          )

        const groups =
          provider
            .getGroups({
              businessObject: {
                $type:
                  'bpmn:DataObject',
                extensionElements: {
                  values: []
                }
              }
            })([])

        const semArchGroup =
          groups.find(
            group =>
              group.id ===
                'semarch'
          )

        const dataEntries =
          semArchGroup.entries.filter(
            entry =>
              entry.id.startsWith(
                'semarch-data-property-'
              )
          )

        expect(
          dataEntries
        ).toHaveLength(
          1
        )

        expect(
          dataEntries[0].descriptor
        ).toBe(
          dataDescriptor
        )

        expect(
          dataEntries.some(
            entry =>
              entry.descriptor ===
                objectDescriptor
          )
        ).toBe(
          false
        )
      }
    )


    test(
      'updates the selected qualified ObjectProperty target from the contextual Business Object entry',
      () => {

        const dataDescriptor = {
          propertyRef:
            'urn:test#Deliverable.status',
          property: {
            kind:
              'data',
            datatype:
              'string'
          }
        }

        const objectDescriptor = {
          propertyRef:
            'urn:test#Deliverable.customer',
          property: {
            kind:
              'object',
            targetType:
              'urn:test#CustomerType',
            datatype:
              null
          }
        }

        createDescriptors
          .mockImplementation(
            ({
              semanticTypeRefs = []
            } = {}) =>
              semanticTypeRefs.includes(
                'test:Deliverable'
              )
                ? [
                    dataDescriptor,
                    objectDescriptor
                  ]
                : []
          )

        const deliverable = {
          id:
            'BO-DELIVERABLE-1',
          typeRefs: [
            'test:Deliverable'
          ]
        }

        const firstCustomer = {
          id:
            'BO-CUSTOMER-1',
          typeRefs: [
            'test:Customer'
          ]
        }

        const order = {
          id:
            'BO-ORDER-1',
          typeRefs: [
            'test:Order'
          ]
        }

        const secondCustomer = {
          id:
            'BO-CUSTOMER-2',
          typeRefs: [
            'test:CustomerAlias',
            'test:Audited'
          ]
        }

        const profileRuntime = {
          getTypeBindings() {
            return [
              {
                semanticType:
                  'test:Customer',
                schemaType:
                  'urn:test#CustomerType'
              },
              {
                semanticType:
                  'test:CustomerAlias',
                schemaType:
                  'urn:test#CustomerType'
              },
              {
                semanticType:
                  'test:Order',
                schemaType:
                  'urn:test#OrderType'
              }
            ]
          }
        }

        const provider =
          new SemArchPropertiesProvider(
            {
              registerProvider() {
              }
            },
            createActiveProfileRuntime(
              profileRuntime
            ),
            null,
            {
              getBusinessObjects() {
                return [
                  deliverable,
                  firstCustomer,
                  order,
                  secondCustomer
                ]
              }
            },
            {
              isBusinessObjectAttached(
                businessObjectId,
                representationId
              ) {
                return (
                  businessObjectId ===
                    'BO-DELIVERABLE-1' &&
                  representationId ===
                    'DataStore_1'
                )
              }
            },
            null,
            () => ({
              cocOwner:
                'coc-a'
            })
          )

        const semanticObject = {
          $type:
            'bpmn:DataStore',
          id:
            'DataStore_1',
          extensionElements: {
            values: [
              {
                $type:
                  'semarch:ObjectProperty',
                propertyRef:
                  'urn:test#Deliverable.customer',
                businessObjectRef:
                  'BO-DELIVERABLE-1',
                cocRef:
                  'coc-a',
                targetBusinessObjectRef:
                  'BO-CUSTOMER-2'
              }
            ]
          }
        }

        const groups =
          provider
            .getGroups({
              businessObject: {
                $type:
                  'bpmn:DataStoreReference',
                dataStoreRef:
                  semanticObject
              }
            })([])

        const masterGroup =
          groups.find(
            group =>
              group.id ===
                'semarch-master'
          )

        const businessObjectEntry =
          masterGroup.entries.find(
            entry =>
              entry.id ===
                'semarch-business-object-0'
          )

        expect(
          businessObjectEntry.entries
        ).toHaveLength(
          2
        )

        const dataEntry =
          businessObjectEntry.entries.find(
            entry =>
              entry.descriptor ===
                dataDescriptor
          )

        const objectEntry =
          businessObjectEntry.entries.find(
            entry =>
              entry.descriptor
                ?.propertyRef ===
                  objectDescriptor
                    .propertyRef &&
              entry.descriptor
                ?.property
                ?.kind ===
                  'object'
          )

        expect(
          dataEntry.id
        ).toContain(
          'data-property'
        )

        expect(
          objectEntry.id
        ).toContain(
          'object-property'
        )

        const renderedObjectEntry =
          objectEntry.component(
            objectEntry
          )

        expect(
          renderedObjectEntry.getOptions()
        ).toEqual([
          {
            label:
              'Select Business Object',
            value:
              ''
          },
          {
            label:
              'BO-CUSTOMER-1',
            value:
              'BO-CUSTOMER-1'
          },
          {
            label:
              'BO-CUSTOMER-2',
            value:
              'BO-CUSTOMER-2'
          }
        ])

        expect(
          renderedObjectEntry.getValue()
        ).toBe(
          'BO-CUSTOMER-2'
        )

        expect(
          renderedObjectEntry.disabled
        ).toBe(
          false
        )

        const selectedObjectProperty =
          semanticObject
            .extensionElements
            .values[0]

        renderedObjectEntry.setValue(
          'BO-CUSTOMER-1'
        )

        expect(
          moddleCreate
        ).not.toHaveBeenCalled()

        expect(
          updateModdleProperties
        ).toHaveBeenCalledWith(
          expect.anything(),
          selectedObjectProperty,
          {
            targetBusinessObjectRef:
              'BO-CUSTOMER-1'
          }
        )
      }
    )


    test(
      'qualifies the unique legacy ObjectProperty in place when editing a contextual relation',
      () => {

        const legacyObjectProperty = {
          $type:
            'semarch:ObjectProperty',
          propertyRef:
            'urn:test#Deliverable.customer',
          schemaRef:
            'urn:test',
          targetBusinessObjectRef:
            'BO-CUSTOMER-1'
        }

        const objectDescriptor = {
          propertyRef:
            'urn:test#Deliverable.customer',
          schemaType: {
            namespace:
              'urn:test'
          },
          property: {
            kind:
              'object',
            targetType:
              'urn:test#CustomerType'
          }
        }

        createDescriptors
          .mockImplementation(
            ({
              semanticTypeRefs = []
            } = {}) =>
              semanticTypeRefs.includes(
                'test:Deliverable'
              )
                ? [ objectDescriptor ]
                : []
          )

        const deliverable = {
          id:
            'BO-DELIVERABLE-1',
          typeRefs: [
            'test:Deliverable'
          ]
        }

        const customer1 = {
          id:
            'BO-CUSTOMER-1',
          typeRefs: [
            'test:Customer'
          ]
        }

        const customer2 = {
          id:
            'BO-CUSTOMER-2',
          typeRefs: [
            'test:Customer'
          ]
        }

        const profileRuntime = {
          getTypeBindings() {
            return [
              {
                semanticType:
                  'test:Customer',
                schemaType:
                  'urn:test#CustomerType'
              }
            ]
          }
        }

        const provider =
          new SemArchPropertiesProvider(
            {
              registerProvider() {
              }
            },
            createActiveProfileRuntime(
              profileRuntime
            ),
            null,
            {
              getBusinessObjects() {
                return [
                  deliverable,
                  customer1,
                  customer2
                ]
              }
            },
            {
              isBusinessObjectAttached(
                businessObjectId,
                representationId
              ) {
                return (
                  businessObjectId ===
                    'BO-DELIVERABLE-1' &&
                  representationId ===
                    'DataStore_1'
                )
              }
            },
            null,
            () => ({
              cocOwner:
                'coc-a'
            })
          )

        const semanticObject = {
          $type:
            'bpmn:DataStore',
          id:
            'DataStore_1',
          extensionElements: {
            values: [
              legacyObjectProperty
            ]
          }
        }

        const element = {
          businessObject: {
            $type:
              'bpmn:DataStoreReference',
            dataStoreRef:
              semanticObject
          }
        }

        const groups =
          provider
            .getGroups(
              element
            )([])

        const contextualEntry =
          groups
            .find(
              group =>
                group.id ===
                  'semarch-master'
            )
            .entries
            .find(
              entry =>
                entry.id ===
                  'semarch-business-object-0'
            )
            .entries[0]

        expect(
          contextualEntry
            .component(
              contextualEntry
            )
            .getValue()
        ).toBe(
          ''
        )

        contextualEntry
          .component(
            contextualEntry
          )
          .setValue(
            'BO-CUSTOMER-2'
          )

        expect(
          updateModdleProperties
        ).toHaveBeenCalledWith(
          element,
          legacyObjectProperty,
          {
            businessObjectRef:
              'BO-DELIVERABLE-1',
            cocRef:
              'coc-a',
            targetBusinessObjectRef:
              'BO-CUSTOMER-2'
          }
        )

        expect(
          moddleCreate
        ).not.toHaveBeenCalledWith(
          'semarch:ObjectProperty',
          expect.anything()
        )

        expect(
          semanticObject
            .extensionElements
            .values
        ).toEqual([
          legacyObjectProperty
        ])
      }
    )


    test(
      'creates a qualified ObjectProperty for an attached Business Object contextual relation',
      () => {

        const objectDescriptor = {
          propertyRef:
            'urn:test#Deliverable.customer',
          schemaType: {
            namespace:
              'urn:test'
          },
          property: {
            kind:
              'object',
            targetType:
              'urn:test#CustomerType'
          }
        }

        createDescriptors
          .mockImplementation(
            ({
              semanticTypeRefs = []
            } = {}) =>
              semanticTypeRefs.includes(
                'test:Deliverable'
              )
                ? [
                    objectDescriptor
                  ]
                : []
          )

        moddleCreate.mockImplementation(
          (
            type,
            properties
          ) => ({
            $type:
              type,
            ...properties
          })
        )

        const deliverable = {
          id:
            'BO-DELIVERABLE-1',
          typeRefs: [
            'test:Deliverable'
          ]
        }

        const customer = {
          id:
            'BO-CUSTOMER-1',
          typeRefs: [
            'test:Customer'
          ]
        }

        const profileRuntime = {
          getTypeBindings() {
            return [
              {
                semanticType:
                  'test:Customer',
                schemaType:
                  'urn:test#CustomerType'
              }
            ]
          }
        }

        const provider =
          new SemArchPropertiesProvider(
            {
              registerProvider() {
              }
            },
            createActiveProfileRuntime(
              profileRuntime
            ),
            null,
            {
              getBusinessObjects() {
                return [
                  deliverable,
                  customer
                ]
              }
            },
            {
              isBusinessObjectAttached(
                businessObjectId,
                representationId
              ) {
                return (
                  businessObjectId ===
                    'BO-DELIVERABLE-1' &&
                  representationId ===
                    'DataStore_1'
                )
              }
            },
            null,
            () => ({
              cocOwner:
                'coc-a'
            })
          )

        const semanticObject = {
          $type:
            'bpmn:DataStore',
          id:
            'DataStore_1',
          extensionElements: {
            values: []
          }
        }

        const element = {
          businessObject: {
            $type:
              'bpmn:DataStoreReference',
            dataStoreRef:
              semanticObject
          }
        }

        const groups =
          provider
            .getGroups(
              element
            )([])

        const contextualEntry =
          groups
            .find(
              group =>
                group.id ===
                  'semarch-master'
            )
            .entries
            .find(
              entry =>
                entry.id ===
                  'semarch-business-object-0'
            )
            .entries[0]

        contextualEntry
          .component(
            contextualEntry
          )
          .setValue(
            'BO-CUSTOMER-1'
          )

        expect(
          moddleCreate
        ).toHaveBeenCalledWith(
          'semarch:ObjectProperty',
          {
            propertyRef:
              'urn:test#Deliverable.customer',
            schemaRef:
              'urn:test',
            businessObjectRef:
              'BO-DELIVERABLE-1',
            cocRef:
              'coc-a',
            targetBusinessObjectRef:
              'BO-CUSTOMER-1'
          }
        )

        const createdObjectProperty =
          moddleCreate
            .mock
            .results[0]
            .value

        expect(
          updateModdleProperties
        ).toHaveBeenCalledWith(
          element,
          semanticObject.extensionElements,
          {
            values: [
              createdObjectProperty
            ]
          }
        )
      }
    )

  }
)


describe(
  'ObjectProperty navigation',
  () => {

    test(
      'navigates from a persisted contextual ObjectProperty to its canonical Business Object',
      () => {

        const objectDescriptor = {
          propertyRef:
            'urn:test#Deliverable.customer',
          schemaType: {
            namespace:
              'urn:test'
          },
          property: {
            kind:
              'object',
            targetType:
              'urn:test#CustomerType'
          }
        }

        createDescriptors
          .mockImplementation(
            ({
              semanticTypeRefs = []
            } = {}) =>
              semanticTypeRefs.includes(
                'test:Deliverable'
              )
                ? [ objectDescriptor ]
                : []
          )

        const deliverable = {
          id:
            'BO-DELIVERABLE-1',
          typeRefs: [
            'test:Deliverable'
          ]
        }

        const customer = {
          id:
            'BO-CUSTOMER-1',
          typeRefs: [
            'test:Customer'
          ]
        }

        const navigate =
          vi.fn()

        const provider =
          new SemArchPropertiesProvider(
            {
              registerProvider() {
              }
            },
            createActiveProfileRuntime({
              getTypeBindings() {
                return [
                  {
                    semanticType:
                      'test:Customer',
                    schemaType:
                      'urn:test#CustomerType'
                  }
                ]
              }
            }),
            null,
            {
              getBusinessObjects() {
                return [
                  deliverable,
                  customer
                ]
              }
            },
            {
              isBusinessObjectAttached(
                businessObjectId,
                representationId
              ) {
                return (
                  businessObjectId ===
                    deliverable.id &&
                  representationId ===
                    'DataStore_1'
                )
              }
            },
            null,
            () => ({
              cocOwner:
                'coc-a'
            }),
            {
              navigate
            }
          )

        const semanticObject = {
          $type:
            'bpmn:DataStore',
          id:
            'DataStore_1',
          extensionElements: {
            values: [
              {
                $type:
                  'semarch:ObjectProperty',
                propertyRef:
                  objectDescriptor.propertyRef,
                schemaRef:
                  'urn:test',
                businessObjectRef:
                  deliverable.id,
                cocRef:
                  'coc-a',
                targetBusinessObjectRef:
                  customer.id
              }
            ]
          }
        }

        const groups =
          provider
            .getGroups({
              businessObject: {
                $type:
                  'bpmn:DataStoreReference',
                dataStoreRef:
                  semanticObject
              }
            })([])

        const entries =
          groups
            .find(
              group =>
                group.id ===
                  'semarch-master'
            )
            .entries
            .find(
              entry =>
                entry.id ===
                  'semarch-business-object-0'
            )
            .entries

        expect(
          entries.map(
            entry =>
              entry.id
          )
        ).toEqual([
          'semarch-business-object-0-object-property-0',
          'semarch-business-object-0-object-property-0-navigate'
        ])

        const navigationEntry =
          entries[1]

        const button =
          navigationEntry.component(
            navigationEntry
          )

        expect(
          button.children
        ).toBe(
          'Open BO-CUSTOMER-1'
        )

        button.onClick()

        expect(
          navigate
        ).toHaveBeenCalledTimes(
          1
        )

        expect(
          navigate
        ).toHaveBeenCalledWith(
          customer
        )
      }
    )
  }
)

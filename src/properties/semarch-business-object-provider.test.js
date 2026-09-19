import {
  describe,
  expect,
  test,
  vi
} from 'vitest'


const {
  collapsibleEntry,
  selectEntry,
  textFieldEntry,
  createDescriptors,
  updateModdleProperties,
  useService
} = vi.hoisted(
  () => ({
    collapsibleEntry:
      vi.fn(
        props => props
      ),
    selectEntry:
      vi.fn(
        props => props
      ),
    textFieldEntry:
      vi.fn(
        props => props
      ),
    createDescriptors:
      vi.fn(
        () => []
      ),
    updateModdleProperties:
      vi.fn(),
    useService:
      vi.fn(
        serviceName => {
          if (
            serviceName === 'debounceInput'
          ) {
            return value => value
          }

          if (
            serviceName === 'modeling'
          ) {
            return {
              updateModdleProperties
            }
          }

          return null
        }
      )
  })
)


vi.mock(
  '@bpmn-io/properties-panel',
  () => ({
    CheckboxEntry:
      vi.fn(),
    CollapsibleEntry:
      collapsibleEntry,
    NumberFieldEntry:
      vi.fn(),
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


describe(
  'SemArch Business Object properties provider',
  () => {

    test(
      'shows attached Business Objects and adds an available Business Object to the DataStore master',
      () => {

        const businessObjects = [
          {
            id: 'BO-1',
            typeRefs: [
              'PAF_Deliverable'
            ]
          },
          {
            id: 'BO-2',
            typeRefs: [
              'PAF_Deliverable'
            ]
          }
        ]

        const businessObjectStore = {
          getBusinessObjects() {
            return businessObjects
          }
        }

        const attachBusinessObject =
          vi.fn()

        const detachBusinessObject =
          vi.fn()

        const businessObjectRepresentationActions = {
          isBusinessObjectAttached(
            businessObjectId,
            representationId
          ) {
            return (
              businessObjectId === 'BO-1' &&
              representationId === 'DataStore_1'
            )
          },
          attachBusinessObject,
          detachBusinessObject
        }

        const propertiesPanel = {
          registerProvider() {
          }
        }

        const eventBus = {
          fire:
            vi.fn()
        }

        const provider =
          new SemArchPropertiesProvider(
            propertiesPanel,
            {
              get() {
                return {
                  getTypes() {
                    return []
                  }
                }
              }
            },
            {
              get() {
                return null
              }
            },
            businessObjectStore,
            businessObjectRepresentationActions,
            eventBus
          )

        const master = {
          $type:
            'bpmn:DataStore',
          id:
            'DataStore_1'
        }

        const occurrence = {
          $type:
            'bpmn:DataStoreReference',
          dataStoreRef:
            master
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

        const masterGroup =
          groups.find(
            group =>
              group.id ===
                'semarch-master'
          )

        const attachedEntry =
          masterGroup.entries.find(
            entry =>
              entry.id ===
                'semarch-business-object-0'
          )

        const attachedField =
          attachedEntry.component(
            attachedEntry
          )

        expect(
          attachedField.label
        ).toBe(
          'BO-1'
        )

        expect(
          attachedField.entries
        ).toEqual(
          []
        )

        attachedField.remove()

        expect(
          detachBusinessObject
        ).toHaveBeenCalledWith(
          'BO-1',
          'DataStore_1'
        )

        expect(
          eventBus.fire
        ).toHaveBeenCalledWith(
          'propertiesPanel.providersChanged'
        )

        eventBus.fire.mockClear()

        const addEntry =
          masterGroup.entries.find(
            entry =>
              entry.id ===
                'semarch-business-object-new'
          )

        const addField =
          addEntry.component(
            addEntry
          )

        expect(
          addField.getOptions()
        ).toEqual([
          {
            label:
              'Select Business Object',
            value:
              ''
          },
          {
            label:
              'BO-2',
            value:
              'BO-2'
          }
        ])

        addField.setValue(
          'BO-2'
        )

        expect(
          attachBusinessObject
        ).toHaveBeenCalledWith(
          'BO-2',
          'DataStore_1'
        )

        expect(
          eventBus.fire
        ).toHaveBeenCalledWith(
          'propertiesPanel.providersChanged'
        )
      }
    )


    test(
      'resolves contextual Data Properties independently for two Business Objects attached to the same DataStore representation',
      () => {

        const dataProperty = {
          $type:
            'semarch:DataProperty',
          propertyRef:
            'demo:sharedProperty',
          value:
            'shared-value'
        }

        const businessObjects = [
          {
            id: 'BO-1',
            typeRefs: [
              'demo:TypeA'
            ]
          },
          {
            id: 'BO-2',
            typeRefs: [
              'demo:TypeB'
            ]
          }
        ]

        const profileRuntime = {
          getTypes() {
            return []
          }
        }

        createDescriptors.mockImplementation(
          ({
            semanticTypeRefs,
            dataProperties
          }) => {

            if (
              semanticTypeRefs.length === 0
            ) {
              return []
            }

            return [
              {
                propertyRef:
                  `${semanticTypeRefs[0]}:property`,
                property: {
                  name:
                    `${semanticTypeRefs[0]} property`,
                  datatype:
                    'string'
                },
                dataProperty:
                  dataProperties[0] || null
              }
            ]
          }
        )

        const provider =
          new SemArchPropertiesProvider(
            {
              registerProvider() {
              }
            },
            {
              get() {
                return profileRuntime
              }
            },
            {
              get() {
                return null
              }
            },
            {
              getBusinessObjects() {
                return businessObjects
              }
            },
            {
              isBusinessObjectAttached(
                businessObjectId,
                representationId
              ) {
                return (
                  representationId === 'DataStore_1' &&
                  (
                    businessObjectId === 'BO-1' ||
                    businessObjectId === 'BO-2'
                  )
                )
              }
            }
          )

        const master = {
          $type:
            'bpmn:DataStore',
          id:
            'DataStore_1',
          extensionElements: {
            values: [
              dataProperty
            ]
          }
        }

        const element = {
          businessObject: {
            $type:
              'bpmn:DataStoreReference',
            dataStoreRef:
              master
          }
        }

        const groups =
          provider
            .getGroups(
              element
            )([])

        const masterGroup =
          groups.find(
            group =>
              group.id ===
                'semarch-master'
          )

        const businessObjectEntries =
          masterGroup.entries.filter(
            entry =>
              entry.id.startsWith(
                'semarch-business-object-'
              ) &&
              entry.id !==
                'semarch-business-object-new'
          )

        expect(
          businessObjectEntries
        ).toHaveLength(
          2
        )

        const firstField =
          businessObjectEntries[0]
            .component(
              businessObjectEntries[0]
            )

        const secondField =
          businessObjectEntries[1]
            .component(
              businessObjectEntries[1]
            )

        expect(
          firstField.label
        ).toBe(
          'BO-1'
        )

        expect(
          secondField.label
        ).toBe(
          'BO-2'
        )

        expect(
          firstField.entries
        ).toHaveLength(
          1
        )

        expect(
          secondField.entries
        ).toHaveLength(
          1
        )

        expect(
          firstField.entries[0]
            .descriptor.propertyRef
        ).toBe(
          'demo:TypeA:property'
        )

        expect(
          secondField.entries[0]
            .descriptor.propertyRef
        ).toBe(
          'demo:TypeB:property'
        )

        expect(
          firstField.entries[0]
            .descriptor.dataProperty
        ).toBe(
          dataProperty
        )

        expect(
          secondField.entries[0]
            .descriptor.dataProperty
        ).toBe(
          dataProperty
        )

        const firstPropertyField =
          firstField.entries[0]
            .component(
              firstField.entries[0]
            )

        expect(
          firstPropertyField.getValue()
        ).toBe(
          'shared-value'
        )

        firstPropertyField.setValue(
          'updated-from-bo-1'
        )

        expect(
          updateModdleProperties
        ).toHaveBeenCalledWith(
          element,
          dataProperty,
          {
            value:
              'updated-from-bo-1'
          }
        )

        expect(
          firstField.entries[0]
            .descriptor.dataProperty
        ).toBe(
          secondField.entries[0]
            .descriptor.dataProperty
        )

        expect(
          master.extensionElements.values
        ).toEqual([
          dataProperty
        ])

        expect(
          createDescriptors
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            profileRuntime,
            semanticTypeRefs: [
              'demo:TypeA'
            ],
            dataProperties: [
              dataProperty
            ],
            businessView:
              null
          })
        )

        expect(
          createDescriptors
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            profileRuntime,
            semanticTypeRefs: [
              'demo:TypeB'
            ],
            dataProperties: [
              dataProperty
            ],
            businessView:
              null
          })
        )

        expect(
          businessObjects
        ).toEqual([
          {
            id: 'BO-1',
            typeRefs: [
              'demo:TypeA'
            ]
          },
          {
            id: 'BO-2',
            typeRefs: [
              'demo:TypeB'
            ]
          }
        ])
      }
    )


    test(
      'does not expose Business Object controls for an unlinked DataStoreReference',
      () => {

        const provider =
          new SemArchPropertiesProvider(
            {
              registerProvider() {
              }
            },
            {
              get() {
                return {
                  getTypes() {
                    return []
                  }
                }
              }
            },
            null,
            {
              getBusinessObjects() {
                return [
                  {
                    id: 'BO-1',
                    typeRefs: [
                      'PAF_Deliverable'
                    ]
                  }
                ]
              }
            },
            {
              isBusinessObjectAttached() {
                return false
              }
            }
          )

        const groups =
          provider
            .getGroups({
              businessObject: {
                $type:
                  'bpmn:DataStoreReference'
              }
            })([])

        const masterGroup =
          groups.find(
            group =>
              group.id ===
                'semarch-master'
          )

        expect(
          masterGroup.entries.some(
            entry =>
              entry.id.startsWith(
                'semarch-business-object'
              )
          )
        ).toBe(
          false
        )
      }
    )
  }
)

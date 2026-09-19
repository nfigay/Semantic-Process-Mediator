import {
  describe,
  expect,
  test
} from 'vitest'

import {
  createBusinessObject
} from '../model/business-object.js'

import {
  createBusinessObjectStore
} from '../model/business-object-store.js'

import {
  createBusinessObjectRepresentationStore
} from '../model/business-object-representation-store.js'

import {
  createBusinessObjectRepresentationActions
} from '../app/business-object-representation-actions.js'

import {
  resolveEmbeddedProfileRuntime
} from '../profiles/embedded-profile-resolver.js'

import {
  createProfileRuntime
} from '../profiles/profile-runtime.js'

import {
  activateCocProfileRuntime
} from '../profiles/coc-profile-runtime-activation.js'

import {
  createActiveProfileRuntime
} from '../profiles/active-profile-runtime.js'

import {
  normalizeBusinessView
} from '../configuration/business-view.js'

import {
  XsdSchemaAdapter
} from '../schemas/xsd-schema-adapter.js'

import {
  findMigratableLegacyDataProperty,
  findMigratableLegacyObjectProperty,
  resolveBusinessObjectContextualProperties,
  resolveBusinessObjectNavigationTargets,
  resolveBusinessObjectsForTargetType
} from './business-object-contextual-properties.js'


const EXPERIMENTAL_A_NAMESPACE =
  'urn:semarch:test:coc-experimental-a'

const EXPERIMENTAL_B_NAMESPACE =
  'urn:semarch:test:coc-experimental-b'

const EXPERIMENTAL_A_BUSINESS_ID_PROPERTY =
  `${EXPERIMENTAL_A_NAMESPACE}#DeliverableType.businessId`

const EXPERIMENTAL_A_PROPERTY =
  `${EXPERIMENTAL_A_NAMESPACE}#DeliverableType.propertyA`

const EXPERIMENTAL_B_BUSINESS_ID_PROPERTY =
  `${EXPERIMENTAL_B_NAMESPACE}#DeliverableType.businessId`

const EXPERIMENTAL_B_PROPERTY =
  `${EXPERIMENTAL_B_NAMESPACE}#DeliverableType.propertyB`


describe(
  'Business Object derived contextual properties',
  () => {


    test(
      'resolves two representations of the same Business Object to the same contextual properties',
      async () => {

        const businessObjectStore =
          createBusinessObjectStore()

        const businessObjectRepresentationStore =
          createBusinessObjectRepresentationStore()

        const representationActions =
          createBusinessObjectRepresentationActions({
            businessObjectStore,
            businessObjectRepresentationStore
          })

        const businessObject =
          businessObjectStore.addBusinessObject({
            id: 'BO-1',
            typeRefs: [ 'demo:Deliverable' ]
          })

        representationActions.attachBusinessObject(
          businessObject.id,
          'Representation-A'
        )

        representationActions.attachBusinessObject(
          businessObject.id,
          'Representation-B'
        )

        const profileRuntime =
          await resolveEmbeddedProfileRuntime({
            profileRef: 'experimental-a'
          })

        const contextualDataProperty = {
          $type: 'semarch:DataProperty',
          propertyRef: EXPERIMENTAL_A_PROPERTY,
          schemaRef: EXPERIMENTAL_A_NAMESPACE,
          businessObjectRef: businessObject.id,
          cocRef: 'coc-a',
          value: 'shared-contextual-value'
        }

        const resolveFromRepresentation =
          representationId => {

            const resolvedBusinessObjects =
              representationActions
                .getBusinessObjectsByRepresentationId(
                  representationId
                )

            expect(resolvedBusinessObjects).toHaveLength(1)
            expect(resolvedBusinessObjects[ 0 ]).toBe(businessObject)

            return resolveBusinessObjectContextualProperties({
              businessObject:
                resolvedBusinessObjects[ 0 ],
              profileRuntime,
              cocId: 'coc-a',
              dataProperties: [
                contextualDataProperty
              ]
            })
          }

        const descriptorsA =
          resolveFromRepresentation(
            'Representation-A'
          )

        const descriptorsB =
          resolveFromRepresentation(
            'Representation-B'
          )

        expect(
          descriptorsA.map(
            descriptor =>
              descriptor.propertyRef
          )
        ).toEqual(
          descriptorsB.map(
            descriptor =>
              descriptor.propertyRef
          )
        )

        const contextualDescriptorA =
          descriptorsA.find(
            descriptor =>
              descriptor.propertyRef ===
                EXPERIMENTAL_A_PROPERTY
          )

        const contextualDescriptorB =
          descriptorsB.find(
            descriptor =>
              descriptor.propertyRef ===
                EXPERIMENTAL_A_PROPERTY
          )

        expect(
          contextualDescriptorA.dataProperty
        ).toBe(
          contextualDataProperty
        )

        expect(
          contextualDescriptorB.dataProperty
        ).toBe(
          contextualDataProperty
        )

        expect(
          businessObjectStore.getBusinessObjects()
        ).toEqual([
          businessObject
        ])

        expect(
          businessObjectRepresentationStore
            .getRepresentations(
              businessObject.id
            )
        ).toEqual([
          {
            businessObjectId: 'BO-1',
            representationId: 'Representation-A'
          },
          {
            businessObjectId: 'BO-1',
            representationId: 'Representation-B'
          }
        ])
      }
    )

    test(
      'derives different properties for the same canonical Business Object under two profile runtimes',
      async () => {

        const businessObject =
          createBusinessObject({

            id:
              'BO-1',

            typeRefs: [
              'demo:Deliverable'
            ]
          })


        const profileRuntimeA =
          await resolveEmbeddedProfileRuntime({
            profileRef:
              'experimental-a'
          })


        const profileRuntimeB =
          await resolveEmbeddedProfileRuntime({
            profileRef:
              'experimental-b'
          })


        const descriptorsA =
          resolveBusinessObjectContextualProperties({

            businessObject,

            profileRuntime:
              profileRuntimeA
          })


        const descriptorsB =
          resolveBusinessObjectContextualProperties({

            businessObject,

            profileRuntime:
              profileRuntimeB
          })


        expect(
          descriptorsA.map(
            descriptor =>
              descriptor.propertyRef
          )
        ).toEqual([
          EXPERIMENTAL_A_BUSINESS_ID_PROPERTY,
          EXPERIMENTAL_A_PROPERTY
        ])


        expect(
          descriptorsB.map(
            descriptor =>
              descriptor.propertyRef
          )
        ).toEqual([
          EXPERIMENTAL_B_BUSINESS_ID_PROPERTY,
          EXPERIMENTAL_B_PROPERTY
        ])


        expect(
          descriptorsA.some(
            descriptor =>
              descriptor.propertyRef ===
                EXPERIMENTAL_B_PROPERTY
          )
        ).toBe(
          false
        )


        expect(
          descriptorsB.some(
            descriptor =>
              descriptor.propertyRef ===
                EXPERIMENTAL_A_PROPERTY
          )
        ).toBe(
          false
        )


        expect(
          businessObject
        ).toEqual({
          id:
            'BO-1',

          typeRefs: [
            'demo:Deliverable'
          ]
        })
      }
    )


    test(
      'projects contextual properties for a canonical Business Object through a Business View',
      async () => {

        const businessObject =
          createBusinessObject({

            id:
              'BO-1',

            typeRefs: [
              'demo:Deliverable'
            ]
          })


        const profileRuntime =
          await resolveEmbeddedProfileRuntime({
            profileRef:
              'experimental-a'
          })


        const businessView =
          normalizeBusinessView({

            id:
              'experimental-a-business-id',

            version:
              '1.0',

            stakeholderRef:
              'CoC_Experimental_A',

            projections: [
              {
                typeRef:
                  'demo:Deliverable',

                propertyRefs: [
                  EXPERIMENTAL_A_BUSINESS_ID_PROPERTY
                ]
              }
            ]
          })


        const descriptors =
          resolveBusinessObjectContextualProperties({

            businessObject,

            profileRuntime,

            businessView
          })


        expect(
          descriptors.map(
            descriptor =>
              descriptor.propertyRef
          )
        ).toEqual([
          EXPERIMENTAL_A_BUSINESS_ID_PROPERTY
        ])


        expect(
          businessObject
        ).toEqual({
          id:
            'BO-1',

          typeRefs: [
            'demo:Deliverable'
          ]
        })
      }
    )


    test(
      'resolves the last DataProperty when two existing properties share the same propertyRef',
      async () => {

        const businessObject =
          createBusinessObject({

            id:
              'BO-1',

            typeRefs: [
              'demo:Deliverable'
            ]
          })


        const profileRuntime =
          await resolveEmbeddedProfileRuntime({
            profileRef:
              'experimental-a'
          })


        const firstDataProperty = {
          $type:
            'semarch:DataProperty',

          propertyRef:
            EXPERIMENTAL_A_PROPERTY,

          schemaRef:
            EXPERIMENTAL_A_NAMESPACE,

          value:
            'first-context-value'
        }


        const secondDataProperty = {
          $type:
            'semarch:DataProperty',

          propertyRef:
            EXPERIMENTAL_A_PROPERTY,

          schemaRef:
            EXPERIMENTAL_A_NAMESPACE,

          value:
            'second-context-value'
        }


        const descriptors =
          resolveBusinessObjectContextualProperties({

            businessObject,

            profileRuntime,

            dataProperties: [
              firstDataProperty,
              secondDataProperty
            ]
          })


        const descriptor =
          descriptors.find(
            candidate =>
              candidate.propertyRef ===
                EXPERIMENTAL_A_PROPERTY
          )


        expect(
          descriptor
        ).toBeDefined()


        expect(
          descriptor.dataProperty
        ).toBe(
          secondDataProperty
        )


        expect(
          descriptor.dataProperty
        ).not.toBe(
          firstDataProperty
        )


        expect(
          descriptor.dataProperty.value
        ).toBe(
          'second-context-value'
        )


        expect(
          businessObject
        ).toEqual({
          id:
            'BO-1',

          typeRefs: [
            'demo:Deliverable'
          ]
        })
      }
    )


    test(
      'addresses contextual DataProperty by canonical Business Object, CoC and propertyRef without legacy fallback',
      async () => {

        const businessObject =
          createBusinessObject({
            id: 'BO-1',
            typeRefs: [ 'demo:Deliverable' ]
          })

        const profileRuntime =
          await resolveEmbeddedProfileRuntime({
            profileRef: 'experimental-a'
          })

        const historicalDataProperty = {
          $type: 'semarch:DataProperty',
          propertyRef: EXPERIMENTAL_A_PROPERTY,
          schemaRef: EXPERIMENTAL_A_NAMESPACE,
          value: 'historical-value'
        }

        const cocADataProperty = {
          $type: 'semarch:DataProperty',
          propertyRef: EXPERIMENTAL_A_PROPERTY,
          schemaRef: EXPERIMENTAL_A_NAMESPACE,
          businessObjectRef: 'BO-1',
          cocRef: 'coc-a',
          value: 'coc-a-value'
        }

        const cocBDataProperty = {
          $type: 'semarch:DataProperty',
          propertyRef: EXPERIMENTAL_A_PROPERTY,
          schemaRef: EXPERIMENTAL_A_NAMESPACE,
          businessObjectRef: 'BO-1',
          cocRef: 'coc-b',
          value: 'coc-b-value'
        }

        const otherBusinessObjectDataProperty = {
          $type: 'semarch:DataProperty',
          propertyRef: EXPERIMENTAL_A_PROPERTY,
          schemaRef: EXPERIMENTAL_A_NAMESPACE,
          businessObjectRef: 'BO-2',
          cocRef: 'coc-a',
          value: 'other-bo-value'
        }

        const dataProperties = [
          historicalDataProperty,
          cocADataProperty,
          cocBDataProperty,
          otherBusinessObjectDataProperty
        ]

        const resolveFor =
          cocId =>
            resolveBusinessObjectContextualProperties({
              businessObject,
              profileRuntime,
              cocId,
              dataProperties
            })

        const findDescriptor =
          descriptors =>
            descriptors.find(
              candidate =>
                candidate.propertyRef ===
                  EXPERIMENTAL_A_PROPERTY
            )

        expect(findDescriptor(resolveFor('coc-a')).dataProperty)
          .toBe(cocADataProperty)

        expect(findDescriptor(resolveFor('coc-b')).dataProperty)
          .toBe(cocBDataProperty)

        expect(findDescriptor(resolveFor('coc-missing')).dataProperty)
          .toBeNull()

        expect(findDescriptor(resolveFor('coc-missing')).dataProperty)
          .not.toBe(historicalDataProperty)

        expect(businessObject)
          .toEqual({
            id: 'BO-1',
            typeRefs: [ 'demo:Deliverable' ]
          })
      }
    )


    test(
      'joins an existing contextual DataProperty to the selected canonical Business Object descriptor without mutating the Business Object',
      async () => {

        const businessObject =
          createBusinessObject({

            id:
              'BO-1',

            typeRefs: [
              'demo:Deliverable'
            ]
          })


        const profileRuntime =
          await resolveEmbeddedProfileRuntime({
            profileRef:
              'experimental-a'
          })


        const dataProperty = {
          $type:
            'semarch:DataProperty',

          propertyRef:
            EXPERIMENTAL_A_PROPERTY,

          schemaRef:
            EXPERIMENTAL_A_NAMESPACE,

          value:
            'representation-context-value'
        }


        const descriptors =
          resolveBusinessObjectContextualProperties({

            businessObject,

            profileRuntime,

            dataProperties: [
              dataProperty
            ]
          })


        const descriptor =
          descriptors.find(
            candidate =>
              candidate.propertyRef ===
                EXPERIMENTAL_A_PROPERTY
          )


        expect(
          descriptor
        ).toBeDefined()


        expect(
          descriptor.dataProperty
        ).toBe(
          dataProperty
        )


        expect(
          descriptor.dataProperty.value
        ).toBe(
          'representation-context-value'
        )


        expect(
          businessObject
        ).toEqual({
          id:
            'BO-1',

          typeRefs: [
            'demo:Deliverable'
          ]
        })
      }
    )

    test(
      'resolves canonical Business Objects whose semantic type bindings match an object property targetType',
      () => {

        const targetType =
          'urn:bpmnsm:test:object-target#CustomerType'

        const profileRuntime =
          createProfileRuntime({
            profile: {
              types: [
                {
                  id:
                    'demo:Customer',
                  schemaType:
                    targetType
                },
                {
                  id:
                    'demo:CustomerAlias',
                  schemaType:
                    targetType
                },
                {
                  id:
                    'demo:Order',
                  schemaType:
                    'urn:bpmnsm:test:object-target#OrderType'
                }
              ]
            }
          })


        const firstCustomer =
          createBusinessObject({
            id:
              'BO-CUSTOMER-1',
            typeRefs: [
              'demo:Customer'
            ]
          })

        const secondCustomer =
          createBusinessObject({
            id:
              'BO-CUSTOMER-2',
            typeRefs: [
              'demo:CustomerAlias',
              'demo:Audited'
            ]
          })

        const order =
          createBusinessObject({
            id:
              'BO-ORDER-1',
            typeRefs: [
              'demo:Order'
            ]
          })


        expect(
          resolveBusinessObjectsForTargetType({
            targetType,
            profileRuntime,
            businessObjects: [
              firstCustomer,
              order,
              secondCustomer
            ]
          })
        ).toEqual([
          firstCustomer,
          secondCustomer
        ])


        expect(
          resolveBusinessObjectsForTargetType({
            targetType:
              'urn:bpmnsm:test:object-target#UnboundType',
            profileRuntime,
            businessObjects: [
              firstCustomer,
              order,
              secondCustomer
            ]
          })
        ).toEqual([])
      }
    )


    test(
      'addresses contextual ObjectProperty by canonical Business Object, CoC and propertyRef without legacy fallback',
      async () => {

        const namespace =
          'urn:bpmnsm:test:object-target'

        const propertyRef =
          `${namespace}#DeliverableType.customer`

        const targetType =
          `${namespace}#CustomerType`

        const businessObject =
          createBusinessObject({
            id:
              'BO-1',
            typeRefs: [
              'demo:Deliverable'
            ]
          })

        const source = `
<xs:schema
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:domain="${namespace}"
  targetNamespace="${namespace}">

  <xs:complexType name="CustomerType">
    <xs:sequence />
  </xs:complexType>

  <xs:complexType name="DeliverableType">
    <xs:sequence>
      <xs:element
        name="customer"
        type="domain:CustomerType" />
    </xs:sequence>
  </xs:complexType>

</xs:schema>
`

        const schema =
          await new XsdSchemaAdapter().read(
            source
          )

        const profileRuntime =
          createProfileRuntime({
            profile: {
              types: [
                {
                  id:
                    'demo:Deliverable',
                  schemaType:
                    `${namespace}#DeliverableType`
                }
              ]
            },
            loadedSchemas: [
              schema
            ]
          })

        const historicalObjectProperty = {
          $type:
            'semarch:ObjectProperty',
          propertyRef,
          targetBusinessObjectRef:
            'BO-HISTORICAL'
        }

        const cocAObjectProperty = {
          $type:
            'semarch:ObjectProperty',
          propertyRef,
          businessObjectRef:
            'BO-1',
          cocRef:
            'coc-a',
          targetBusinessObjectRef:
            'BO-CUSTOMER-A'
        }

        const cocBObjectProperty = {
          $type:
            'semarch:ObjectProperty',
          propertyRef,
          businessObjectRef:
            'BO-1',
          cocRef:
            'coc-b',
          targetBusinessObjectRef:
            'BO-CUSTOMER-B'
        }

        const otherBusinessObjectProperty = {
          $type:
            'semarch:ObjectProperty',
          propertyRef,
          businessObjectRef:
            'BO-2',
          cocRef:
            'coc-a',
          targetBusinessObjectRef:
            'BO-OTHER'
        }

        const objectProperties = [
          historicalObjectProperty,
          cocAObjectProperty,
          cocBObjectProperty,
          otherBusinessObjectProperty
        ]

        const resolveFor =
          cocId =>
            resolveBusinessObjectContextualProperties({
              businessObject,
              profileRuntime,
              cocId,
              objectProperties
            })

        const findDescriptor =
          descriptors =>
            descriptors.find(
              candidate =>
                candidate.propertyRef ===
                  propertyRef
            )

        expect(
          findDescriptor(
            resolveFor(
              'coc-a'
            )
          ).objectProperty
        ).toBe(
          cocAObjectProperty
        )

        expect(
          findDescriptor(
            resolveFor(
              'coc-b'
            )
          ).objectProperty
        ).toBe(
          cocBObjectProperty
        )

        expect(
          findDescriptor(
            resolveFor(
              'coc-missing'
            )
          ).objectProperty
        ).toBeNull()

        expect(
          findDescriptor(
            resolveFor(
              'coc-missing'
            )
          ).objectProperty
        ).not.toBe(
          historicalObjectProperty
        )
      }
    )

  }
)


describe(
  'Legacy DataProperty migration eligibility',
  () => {

    const propertyRef =
      'urn:semarch:test#DeliverableType.status'

    const businessObjectId =
      'BO-1'

    const cocId =
      'CoC-A'


    function legacyDataProperty(
      overrides = {}
    ) {

      return {
        $type:
          'semarch:DataProperty',
        propertyRef,
        schemaRef:
          'urn:semarch:test',
        value:
          'historical-value',
        ...overrides
      }
    }


    test(
      'returns the unique fully unqualified legacy DataProperty',
      () => {

        const candidate =
          legacyDataProperty()


        expect(
          findMigratableLegacyDataProperty({
            dataProperties: [
              candidate
            ],
            propertyRef,
            businessObjectId,
            cocId
          })
        ).toBe(
          candidate
        )
      }
    )


    test(
      'returns null when no legacy DataProperty matches',
      () => {

        expect(
          findMigratableLegacyDataProperty({
            dataProperties: [],
            propertyRef,
            businessObjectId,
            cocId
          })
        ).toBeNull()
      }
    )


    test(
      'returns null when multiple fully unqualified legacy DataProperties are ambiguous',
      () => {

        expect(
          findMigratableLegacyDataProperty({
            dataProperties: [
              legacyDataProperty({
                value:
                  'first'
              }),
              legacyDataProperty({
                value:
                  'second'
              })
            ],
            propertyRef,
            businessObjectId,
            cocId
          })
        ).toBeNull()
      }
    )


    test(
      'returns null when the exact Business Object and CoC already owns the property',
      () => {

        expect(
          findMigratableLegacyDataProperty({
            dataProperties: [
              legacyDataProperty(),
              legacyDataProperty({
                businessObjectRef:
                  businessObjectId,
                cocRef:
                  cocId,
                value:
                  'qualified-value'
              })
            ],
            propertyRef,
            businessObjectId,
            cocId
          })
        ).toBeNull()
      }
    )


    test(
      'does not let another Business Object or CoC qualification block the unique legacy candidate',
      () => {

        const candidate =
          legacyDataProperty()


        expect(
          findMigratableLegacyDataProperty({
            dataProperties: [
              candidate,
              legacyDataProperty({
                businessObjectRef:
                  businessObjectId,
                cocRef:
                  'CoC-B'
              }),
              legacyDataProperty({
                businessObjectRef:
                  'BO-2',
                cocRef:
                  cocId
              })
            ],
            propertyRef,
            businessObjectId,
            cocId
          })
        ).toBe(
          candidate
        )
      }
    )


    test(
      'excludes partially qualified DataProperties from legacy candidates',
      () => {

        expect(
          findMigratableLegacyDataProperty({
            dataProperties: [
              legacyDataProperty({
                businessObjectRef:
                  businessObjectId
              }),
              legacyDataProperty({
                cocRef:
                  cocId
              })
            ],
            propertyRef,
            businessObjectId,
            cocId
          })
        ).toBeNull()
      }
    )


    test(
      'requires both target Business Object and CoC identities',
      () => {

        const candidate =
          legacyDataProperty()


        expect(
          findMigratableLegacyDataProperty({
            dataProperties: [
              candidate
            ],
            propertyRef,
            businessObjectId,
            cocId:
              null
          })
        ).toBeNull()


        expect(
          findMigratableLegacyDataProperty({
            dataProperties: [
              candidate
            ],
            propertyRef,
            businessObjectId:
              null,
            cocId
          })
        ).toBeNull()
      }
    )


    test(
      'ignores DataProperties for another propertyRef',
      () => {

        const candidate =
          legacyDataProperty()


        expect(
          findMigratableLegacyDataProperty({
            dataProperties: [
              legacyDataProperty({
                propertyRef:
                  'urn:semarch:test#DeliverableType.other'
              }),
              candidate
            ],
            propertyRef,
            businessObjectId,
            cocId
          })
        ).toBe(
          candidate
        )
      }
    )
  }
)

describe(
  'Legacy ObjectProperty migration eligibility',
  () => {

    const propertyRef =
      'urn:semarch:test#DeliverableType.customer'

    const businessObjectId =
      'BO-1'

    const cocId =
      'CoC-A'


    function legacyObjectProperty(
      overrides = {}
    ) {

      return {
        $type:
          'semarch:ObjectProperty',
        propertyRef,
        schemaRef:
          'urn:semarch:test',
        targetBusinessObjectRef:
          'BO-CUSTOMER-1',
        ...overrides
      }
    }


    test(
      'returns the unique fully unqualified legacy ObjectProperty',
      () => {

        const candidate =
          legacyObjectProperty()

        expect(
          findMigratableLegacyObjectProperty({
            objectProperties: [ candidate ],
            propertyRef,
            businessObjectId,
            cocId
          })
        ).toBe(candidate)
      }
    )


    test(
      'returns null when no legacy ObjectProperty matches',
      () => {

        expect(
          findMigratableLegacyObjectProperty({
            objectProperties: [],
            propertyRef,
            businessObjectId,
            cocId
          })
        ).toBeNull()
      }
    )


    test(
      'returns null when multiple fully unqualified legacy ObjectProperties are ambiguous',
      () => {

        expect(
          findMigratableLegacyObjectProperty({
            objectProperties: [
              legacyObjectProperty({
                targetBusinessObjectRef:
                  'BO-CUSTOMER-1'
              }),
              legacyObjectProperty({
                targetBusinessObjectRef:
                  'BO-CUSTOMER-2'
              })
            ],
            propertyRef,
            businessObjectId,
            cocId
          })
        ).toBeNull()
      }
    )


    test(
      'returns null when the exact Business Object and CoC already owns the relation',
      () => {

        expect(
          findMigratableLegacyObjectProperty({
            objectProperties: [
              legacyObjectProperty(),
              legacyObjectProperty({
                businessObjectRef:
                  businessObjectId,
                cocRef:
                  cocId
              })
            ],
            propertyRef,
            businessObjectId,
            cocId
          })
        ).toBeNull()
      }
    )


    test(
      'does not let another Business Object or CoC qualification block the unique legacy relation',
      () => {

        const candidate =
          legacyObjectProperty()

        expect(
          findMigratableLegacyObjectProperty({
            objectProperties: [
              candidate,
              legacyObjectProperty({
                businessObjectRef:
                  businessObjectId,
                cocRef:
                  'CoC-B'
              }),
              legacyObjectProperty({
                businessObjectRef:
                  'BO-2',
                cocRef:
                  cocId
              })
            ],
            propertyRef,
            businessObjectId,
            cocId
          })
        ).toBe(candidate)
      }
    )


    test(
      'excludes partially qualified ObjectProperties from legacy candidates',
      () => {

        expect(
          findMigratableLegacyObjectProperty({
            objectProperties: [
              legacyObjectProperty({
                businessObjectRef:
                  businessObjectId
              }),
              legacyObjectProperty({
                cocRef:
                  cocId
              })
            ],
            propertyRef,
            businessObjectId,
            cocId
          })
        ).toBeNull()
      }
    )


    test(
      'requires both target Business Object and CoC identities for ObjectProperty migration',
      () => {

        const candidate =
          legacyObjectProperty()

        expect(
          findMigratableLegacyObjectProperty({
            objectProperties: [ candidate ],
            propertyRef,
            businessObjectId,
            cocId: null
          })
        ).toBeNull()

        expect(
          findMigratableLegacyObjectProperty({
            objectProperties: [ candidate ],
            propertyRef,
            businessObjectId: null,
            cocId
          })
        ).toBeNull()
      }
    )


    test(
      'ignores ObjectProperties for another propertyRef',
      () => {

        const candidate =
          legacyObjectProperty()

        expect(
          findMigratableLegacyObjectProperty({
            objectProperties: [
              legacyObjectProperty({
                propertyRef:
                  'urn:semarch:test#DeliverableType.other'
              }),
              candidate
            ],
            propertyRef,
            businessObjectId,
            cocId
          })
        ).toBe(candidate)
      }
    )
  }
)


describe(
  'Contextual Business Object graph navigation',
  () => {

    test(
      'resolves a contextual ObjectProperty target to the canonical Business Object',
      () => {

        const sourceBusinessObject =
          createBusinessObject({
            id: 'BO-SOURCE',
            typeRefs: [ 'demo:Source' ]
          })

        const targetBusinessObject =
          createBusinessObject({
            id: 'BO-TARGET',
            typeRefs: [ 'demo:Target' ]
          })

        const descriptor = {
          propertyRef:
            'urn:semarch:test#SourceType.target',
          property: {
            kind: 'object',
            targetType:
              'urn:semarch:test#TargetType'
          },
          objectProperty: {
            $type: 'semarch:ObjectProperty',
            propertyRef:
              'urn:semarch:test#SourceType.target',
            businessObjectRef:
              sourceBusinessObject.id,
            cocRef: 'coc-a',
            targetBusinessObjectRef:
              targetBusinessObject.id
          }
        }

        const navigationTargets =
          resolveBusinessObjectNavigationTargets({
            descriptors: [ descriptor ],
            businessObjects: [
              sourceBusinessObject,
              targetBusinessObject
            ]
          })

        expect(navigationTargets).toEqual([
          {
            descriptor,
            businessObject:
              targetBusinessObject
          }
        ])
      }
    )


    test(
      'ignores data properties, unresolved targets and object descriptors without a persisted relation',
      () => {

        const targetBusinessObject =
          createBusinessObject({
            id: 'BO-TARGET',
            typeRefs: [ 'demo:Target' ]
          })

        expect(
          resolveBusinessObjectNavigationTargets({
            descriptors: [
              {
                propertyRef: 'data',
                property: { kind: 'data' }
              },
              {
                propertyRef: 'missing-relation',
                property: { kind: 'object' },
                objectProperty: null
              },
              {
                propertyRef: 'missing-target',
                property: { kind: 'object' },
                objectProperty: {
                  targetBusinessObjectRef:
                    'BO-MISSING'
                }
              }
            ],
            businessObjects: [
              targetBusinessObject
            ]
          })
        ).toEqual([])
      }
    )
  }
)

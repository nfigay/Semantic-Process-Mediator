import {
  describe,
  expect,
  it
} from 'vitest'

import {
  BpmnModdle
} from 'bpmn-moddle'

import semarchModdle from '../extensions/semarch.json'

import {
  createBusinessObjectStore
} from './business-object-store.js'

import {
  createBusinessObjectRepresentationStore
} from './business-object-representation-store.js'

import {
  resolveBusinessObjectNavigationTargets
} from '../properties/business-object-contextual-properties.js'

import {
  createBusinessRelationStore
} from './business-relation-store.js'


describe('E14 — relation métier minimale', () => {

  it('E14-01 — conserve deux BusinessObjects indépendants', () => {

    const store =
      createBusinessObjectStore()

    const a =
      store.addBusinessObject({
        id: 'E14-A',
        typeRefs: [
          'example:BusinessObjectTypeA'
        ]
      })

    const b =
      store.addBusinessObject({
        id: 'E14-B',
        typeRefs: [
          'example:BusinessObjectTypeB'
        ]
      })

    expect(a.id).toBe('E14-A')
    expect(b.id).toBe('E14-B')
    expect(a.id).not.toBe(b.id)
    expect(a).not.toBe(b)

    expect(store.getBusinessObjects())
      .toEqual([a, b])
  })


  it('E14-02 — permet deux BO sur une même représentation', () => {

    const businessObjectStore =
      createBusinessObjectStore()

    const representationStore =
      createBusinessObjectRepresentationStore()

    const a =
      businessObjectStore.addBusinessObject({
        id: 'E14-A',
        typeRefs: [
          'example:BusinessObjectTypeA'
        ]
      })

    const b =
      businessObjectStore.addBusinessObject({
        id: 'E14-B',
        typeRefs: [
          'example:BusinessObjectTypeB'
        ]
      })

    representationStore.attach({
      businessObjectId: a.id,
      representationId: 'E14-R'
    })

    representationStore.attach({
      businessObjectId: b.id,
      representationId: 'E14-R'
    })

    expect(
      representationStore
        .getBusinessObjectRepresentationsByRepresentationId(
          'E14-R'
        )
    ).toEqual([
      {
        businessObjectId: 'E14-A',
        representationId: 'E14-R'
      },
      {
        businessObjectId: 'E14-B',
        representationId: 'E14-R'
      }
    ])

    expect(a.id).not.toBe(b.id)
    expect(a.typeRefs).not.toEqual(b.typeRefs)
  })


  it('E14-03 — rend observable une relation orientée A -> B avec le mécanisme existant', () => {

    const businessObjectStore =
      createBusinessObjectStore()

    const a =
      businessObjectStore.addBusinessObject({
        id: 'E14-A',
        typeRefs: [
          'example:BusinessObjectTypeA'
        ]
      })

    const b =
      businessObjectStore.addBusinessObject({
        id: 'E14-B',
        typeRefs: [
          'example:BusinessObjectTypeB'
        ]
      })

    const descriptors = [
      {
        propertyRef:
          'example:relatedBusinessObject',

        property: {
          kind: 'object'
        },

        objectProperty: {
          $type:
            'semarch:ObjectProperty',

          propertyRef:
            'example:relatedBusinessObject',

          businessObjectRef:
            a.id,

          targetBusinessObjectRef:
            b.id
        }
      }
    ]

    const navigationTargets =
      resolveBusinessObjectNavigationTargets({
        descriptors,

        businessObjects:
          businessObjectStore
            .getBusinessObjects()
      })

    expect(navigationTargets)
      .toHaveLength(1)

    expect(
      navigationTargets[0].businessObject
    ).toBe(b)

    expect(
      navigationTargets[0]
        .descriptor
        .objectProperty
        .businessObjectRef
    ).toBe(a.id)

    expect(
      navigationTargets[0]
        .descriptor
        .objectProperty
        .targetBusinessObjectRef
    ).toBe(b.id)

    expect(
      navigationTargets.some(
        target =>
          target.businessObject.id === a.id
      )
    ).toBe(false)
  })


  it('E14-04 — représente une relation métier autonome A -> B', () => {

    const businessObjectStore =
      createBusinessObjectStore()

    const relationStore =
      createBusinessRelationStore()

    const a =
      businessObjectStore.addBusinessObject({
        id: 'E14-A',
        typeRefs: [
          'example:BusinessObjectTypeA'
        ]
      })

    const b =
      businessObjectStore.addBusinessObject({
        id: 'E14-B',
        typeRefs: [
          'example:BusinessObjectTypeB'
        ]
      })

    const relation =
      relationStore.addBusinessRelation({
        sourceBusinessObjectId:
          a.id,

        targetBusinessObjectId:
          b.id,

        relationType:
          'example:relatedTo'
      })

    expect(relation).toEqual({
      sourceBusinessObjectId:
        'E14-A',

      targetBusinessObjectId:
        'E14-B',

      relationType:
        'example:relatedTo'
    })

    expect(
      relationStore.getBusinessRelation({
        sourceBusinessObjectId:
          a.id,

        targetBusinessObjectId:
          b.id,

        relationType:
          'example:relatedTo'
      })
    ).toEqual(relation)

    expect(
      relationStore.getBusinessRelation({
        sourceBusinessObjectId:
          b.id,

        targetBusinessObjectId:
          a.id,

        relationType:
          'example:relatedTo'
      })
    ).toBeNull()
  })


  it('E14-04b — normalise, adresse et retire une BusinessRelation de manière cohérente', () => {

    const relationStore =
      createBusinessRelationStore()

    const relation =
      relationStore.addBusinessRelation({
        sourceBusinessObjectId:
          ' E14-A ',

        targetBusinessObjectId:
          ' E14-B ',

        relationType:
          ' example:relatedTo '
      })

    expect(relation).toEqual({
      sourceBusinessObjectId:
        'E14-A',

      targetBusinessObjectId:
        'E14-B',

      relationType:
        'example:relatedTo'
    })

    expect(
      relationStore.getBusinessRelation({
        sourceBusinessObjectId:
          ' E14-A ',

        targetBusinessObjectId:
          ' E14-B ',

        relationType:
          ' example:relatedTo '
      })
    ).toBe(relation)

    expect(() =>
      relationStore.addBusinessRelation({
        sourceBusinessObjectId:
          'E14-A',

        targetBusinessObjectId:
          'E14-B',

        relationType:
          'example:relatedTo'
      })
    ).toThrow(
      'BusinessRelation already exists: E14-A::E14-B::example:relatedTo'
    )

    expect(
      relationStore.removeBusinessRelation({
        sourceBusinessObjectId:
          ' E14-A ',

        targetBusinessObjectId:
          ' E14-B ',

        relationType:
          ' example:relatedTo '
      })
    ).toBe(relation)

    expect(
      relationStore.getBusinessRelations()
    ).toEqual([])
  })


  it('E14-05 — persiste et restaure une BusinessRelation via semarch:ObjectProperty et BPMN XML', async () => {

    const firstModdle =
      new BpmnModdle({
        semarch: semarchModdle
      })

    const businessRelation = {
      sourceBusinessObjectId:
        'E14-A',

      targetBusinessObjectId:
        'E14-B',

      relationType:
        'example:relatedTo'
    }

    const objectProperty =
      firstModdle.create(
        'semarch:ObjectProperty',
        {
          propertyRef:
            businessRelation.relationType,

          businessObjectRef:
            businessRelation.sourceBusinessObjectId,

          targetBusinessObjectRef:
            businessRelation.targetBusinessObjectId
        }
      )

    const extensionElements =
      firstModdle.create(
        'bpmn:ExtensionElements',
        {
          values: [
            objectProperty
          ]
        }
      )

    const process =
      firstModdle.create(
        'bpmn:Process',
        {
          id: 'E14-Process',
          extensionElements
        }
      )

    const definitions =
      firstModdle.create(
        'bpmn:Definitions',
        {
          id: 'E14-Definitions',
          targetNamespace:
            'urn:bpmnsm:e14',
          rootElements: [
            process
          ]
        }
      )

    const {
      xml
    } =
      await firstModdle.toXML(
        definitions,
        {
          format: true
        }
      )

    expect(xml)
      .toContain(
        'propertyRef="example:relatedTo"'
      )

    expect(xml)
      .toContain(
        'businessObjectRef="E14-A"'
      )

    expect(xml)
      .toContain(
        'targetBusinessObjectRef="E14-B"'
      )

    const secondModdle =
      new BpmnModdle({
        semarch: semarchModdle
      })

    const {
      rootElement:
        restoredDefinitions
    } =
      await secondModdle.fromXML(xml)

    const restoredProcess =
      restoredDefinitions
        .rootElements
        .find(
          element =>
            element.$type ===
              'bpmn:Process' &&
            element.id ===
              'E14-Process'
        )

    expect(restoredProcess)
      .toBeTruthy()

    const restoredObjectProperty =
      restoredProcess
        .extensionElements
        .values
        .find(
          value =>
            value.$type ===
              'semarch:ObjectProperty'
        )

    expect(restoredObjectProperty)
      .toBeTruthy()

    const restoredRelation = {
      sourceBusinessObjectId:
        restoredObjectProperty
          .businessObjectRef,

      targetBusinessObjectId:
        restoredObjectProperty
          .targetBusinessObjectRef,

      relationType:
        restoredObjectProperty
          .propertyRef
    }

    expect(restoredRelation)
      .toEqual(businessRelation)

    expect(
      restoredRelation
        .sourceBusinessObjectId
    ).toBe('E14-A')

    expect(
      restoredRelation
        .targetBusinessObjectId
    ).toBe('E14-B')

    expect(
      restoredRelation
        .relationType
    ).toBe('example:relatedTo')

    expect(
      restoredRelation
        .sourceBusinessObjectId
    ).not.toBe(
      restoredRelation
        .targetBusinessObjectId
    )
  })

})

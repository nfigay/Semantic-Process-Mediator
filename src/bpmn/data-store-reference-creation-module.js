/*
 * Completes editor-created bpmn:DataStoreReference elements with
 * their native BPMN bpmn:DataStore root element.
 *
 * This module is structural only. It does not create SemArch
 * semantics, state data, or a multi-CoC Master Object.
 */

import CommandInterceptor
  from 'diagram-js/lib/command/CommandInterceptor'

import {
  add as collectionAdd,
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections'


function getBusinessObject(
  element
) {

  return element?.businessObject ||
    (
      element?.$type
        ? element
        : null
    )
}


class DataStoreReferenceCreation
  extends CommandInterceptor {

  constructor(
    eventBus,
    bpmnjs,
    bpmnFactory
  ) {

    super(
      eventBus
    )


    this.executed(
      'shape.create',
      context => {

        const businessObject =
          getBusinessObject(
            context?.shape
          )


        if (
          businessObject?.$type !==
            'bpmn:DataStoreReference'
        ) {

          return
        }


        if (
          businessObject.dataStoreRef &&
          !context
            ?.semarchCreatedDataStore
        ) {

          return
        }


        let dataStore =
          context
            ?.semarchCreatedDataStore


        if (
          !dataStore
        ) {

          dataStore =
            bpmnFactory.create(
              'bpmn:DataStore'
            )

          context
            .semarchCreatedDataStore =
              dataStore
        }


        businessObject.dataStoreRef =
          dataStore


        const rootElements =
          bpmnjs
            .getDefinitions()
            .get(
              'rootElements'
            )


        if (
          !rootElements.includes(
            dataStore
          )
        ) {

          collectionAdd(
            rootElements,
            dataStore
          )
        }
      },
      true
    )


    this.reverted(
      'shape.create',
      context => {

        const dataStore =
          context
            ?.semarchCreatedDataStore


        if (
          !dataStore
        ) {

          return
        }


        const businessObject =
          getBusinessObject(
            context?.shape
          )


        if (
          businessObject
            ?.dataStoreRef ===
              dataStore
        ) {

          businessObject.dataStoreRef =
            undefined
        }


        collectionRemove(
          bpmnjs
            .getDefinitions()
            .get(
              'rootElements'
            ),
          dataStore
        )
      },
      true
    )
  }
}


DataStoreReferenceCreation.$inject = [
  'eventBus',
  'bpmnjs',
  'bpmnFactory'
]


export default {
  __init__: [
    'semarchDataStoreReferenceCreation'
  ],

  semarchDataStoreReferenceCreation: [
    'type',
    DataStoreReferenceCreation
  ]
}

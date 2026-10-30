/*
 * Adds a Context Pad action that creates another
 * DataObjectReference or DataStoreReference occurrence for the same
 * corresponding native BPMN master.
 *
 * This module is structural only. It does not copy SemArch
 * semantics, state data, or create a multi-CoC Master Object.
 */

const OCCURRENCE_DISTANCE = 50


class DataStoreOccurrenceContextPadProvider {

  constructor(
    contextPad,
    create,
    modeling,
    elementFactory,
    bpmnFactory,
    translate,
    eventBus
  ) {

    this._create =
      create

    this._modeling =
      modeling

    this._elementFactory =
      elementFactory

    this._bpmnFactory =
      bpmnFactory

    this._translate =
      translate


    // bpmn-js CreateDataObjectBehavior creates a new master at priority 1000.
    // Restore the explicitly reused master before shape.create executes,
    // so the BPMN updater sees the intended reference (also on undo/redo).
    eventBus?.on?.('commandStack.shape.create.preExecute', 900, event => {
      const shape = event?.context?.shape
      const master = shape?.__bpmnsmReusedDataObjectMaster
      if (master && shape.businessObject?.$type === 'bpmn:DataObjectReference') {
        shape.businessObject.dataObjectRef = master
      }
    })

    contextPad.registerProvider(
      this
    )
  }


  getContextPadEntries(
    element
  ) {

    const businessObject =
      element?.businessObject


    const type = businessObject?.$type
    const referenceKey = type === 'bpmn:DataObjectReference'
      ? 'dataObjectRef'
      : type === 'bpmn:DataStoreReference'
        ? 'dataStoreRef'
        : null

    if (!referenceKey || !businessObject[referenceKey]) {
      return {}
    }


    const createOccurrenceShape = () => {

      const occurrence =
        this._bpmnFactory.create(
          type,
          {
            [referenceKey]: businessObject[referenceKey]
          }
        )


      const shape = this._elementFactory.createShape({
        type:
          type,

        businessObject:
          occurrence
      })

      // Marker is diagram-js runtime-only, never a moddle/XML property.
      if (referenceKey === 'dataObjectRef') {
        shape.__bpmnsmReusedDataObjectMaster = businessObject[referenceKey]
      }
      return shape
    }


    const createOccurrence = (
      event,
      source
    ) => {

      const shape =
        createOccurrenceShape()


      this._create.start(
        event,
        shape,
        {
          source
        }
      )
    }


    const createOccurrenceImmediately = (
      event,
      source
    ) => {

      const shape =
        createOccurrenceShape()

      const position = {
        x:
          source.x +
          source.width +
          OCCURRENCE_DISTANCE +
          shape.width / 2,

        y:
          source.y +
          source.height / 2
      }


      this._modeling.createShape(
        shape,
        position,
        source.parent
      )
    }


    return {
      [type === 'bpmn:DataStoreReference' ? 'semarch-create-data-store-occurrence' : 'semarch-create-data-object-occurrence']: {
        group:
          'model',

        html:
          `<div class="entry ${type === 'bpmn:DataObjectReference' ? 'bpmn-icon-data-object' : 'bpmn-icon-data-store'}" draggable="true" style="position: relative;"><span aria-hidden="true" style="position: absolute; right: -1px; bottom: -1px; font-family: sans-serif; font-size: 12px; font-weight: bold; line-height: 12px;">+</span></div>`,

        title:
          this._translate(
            'Create another occurrence'
          ),

        action: {
          click:
            createOccurrenceImmediately,

          dragstart:
            createOccurrence
        }
      }
    }
  }
}


DataStoreOccurrenceContextPadProvider.$inject = [
  'contextPad',
  'create',
  'modeling',
  'elementFactory',
  'bpmnFactory',
  'translate',
  'eventBus'
]


export default {
  __init__: [
    'semarchDataStoreOccurrenceContextPadProvider'
  ],

  semarchDataStoreOccurrenceContextPadProvider: [
    'type',
    DataStoreOccurrenceContextPadProvider
  ]
}

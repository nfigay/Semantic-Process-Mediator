/*
 * ------------------------------------------------------------
 * SemArch Stable GUID Creation Module
 * ------------------------------------------------------------
 *
 * Assigns a persistent SemArch stableGuid when supported BPMN
 * semantic elements are created inside the SemArch editor.
 *
 * Important:
 * - imported BPMN elements are not modified
 * - an existing stableGuid is never replaced
 * - BPMN IDs are never modified
 * - platform-specific identifiers are not handled here
 * - a Process created together with a Participant is handled
 *   through the Participant processRef
 *
 * The automatic-generation scope is defined by
 * identity-policy.js.
 * ------------------------------------------------------------
 */

import { createGuid } from './guid-generator.js'
import { shouldGenerateStableGuid } from './identity-policy.js'

function getBusinessObject(element) {
  if (!element) {
    return null
  }

  if (element.businessObject) {
    return element.businessObject
  }

  if (element.$type) {
    return element
  }

  return null
}

function findSemArchMeta(businessObject) {
  return businessObject
    ?.extensionElements
    ?.values
    ?.find(
      value =>
        value.$type === 'semarch:Meta'
    )
    || null
}

function ensureStableGuid({
  businessObject,
  moddle
}) {
  if (
    !businessObject ||
    !shouldGenerateStableGuid(businessObject)
  ) {
    return null
  }

  const existingMeta =
    findSemArchMeta(businessObject)

  if (existingMeta?.stableGuid) {
    return existingMeta.stableGuid
  }

  const stableGuid =
    createGuid()

  if (existingMeta) {
    existingMeta.stableGuid =
      stableGuid

    return stableGuid
  }

  let extensionElements =
    businessObject.extensionElements

  if (!extensionElements) {
    extensionElements =
      moddle.create(
        'bpmn:ExtensionElements',
        {
          values: []
        }
      )

    businessObject.extensionElements =
      extensionElements
  }

  const meta =
    moddle.create(
      'semarch:Meta',
      {
        stableGuid
      }
    )

  extensionElements.values.push(
    meta
  )

  return stableGuid
}

function processElement({
  element,
  moddle
}) {
  const businessObject =
    getBusinessObject(element)

  if (!businessObject) {
    return null
  }

  const stableGuid =
    ensureStableGuid({
      businessObject,
      moddle
    })

  /*
   * When bpmn-js creates a new white-box Participant,
   * the corresponding Process already exists as processRef
   * during shape.create.postExecute.
   *
   * Treat that Process as part of the same native creation
   * operation. Imported Participants never pass through this
   * creation event, so imported Processes remain untouched.
   */
  if (
    businessObject.$type ===
      'bpmn:Participant' &&
    businessObject.processRef
  ) {
    ensureStableGuid({
      businessObject:
        businessObject.processRef,

      moddle
    })
  }

  return stableGuid
}

function processElements({
  elements,
  moddle
}) {
  if (!Array.isArray(elements)) {
    return
  }

  elements.forEach(
    element =>
      processElement({
        element,
        moddle
      })
  )
}

class StableGuidCreation {
  constructor(
    eventBus,
    moddle
  ) {
    eventBus.on(
      'commandStack.shape.create.postExecute',
      event => {
        processElement({
          element:
            event.context?.shape,

          moddle
        })
      }
    )

    eventBus.on(
      'commandStack.elements.create.postExecute',
      event => {
        processElements({
          elements:
            event.context?.elements,

          moddle
        })
      }
    )

    eventBus.on(
      'commandStack.canvas.updateRoot.postExecute',
      event => {
        processElement({
          element:
            event.context?.newRoot,

          moddle
        })
      }
    )
  }
}

StableGuidCreation.$inject = [
  'eventBus',
  'moddle'
]

export default {
  __init__: [
    'semarchStableGuidCreation'
  ],

  semarchStableGuidCreation: [
    'type',
    StableGuidCreation
  ]
}
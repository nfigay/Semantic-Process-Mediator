import {
  normalizeGuid
} from '../identity/guid-generator.js'


export function registerBpmnDocument({
  modeler,
  repositoryModel,
  repositoryDocument,
  containerId
} = {}) {

  if (
    !modeler ||
    !repositoryModel ||
    !repositoryDocument
  ) {

    throw new Error(
      'registerBpmnDocument requires modeler, repositoryModel and repositoryDocument'
    )
  }


  const definitions =
    modeler.getDefinitions()


  if (
    !definitions
  ) {

    return []
  }


  const rootElements =
    definitions.rootElements ||
    []


  const participantProcessIds =
    collectParticipantProcessIds(
      rootElements
    )


  const diagramIndex =
    collectDiagramIndex(
      definitions
    )


  const diagrammedElementIds =
    new Set(
      diagramIndex.keys()
    )


  const registeredComponents =
    []


  /*
   * ------------------------------------------------------------
   * Pass 1
   *
   * Register root BPMN semantic components:
   *
   * - Process
   * - Collaboration
   * ------------------------------------------------------------
   */

  for (
    const rootElement
    of rootElements
  ) {

    const componentType =
      resolveRootComponentType(
        rootElement
      )


    if (
      !componentType
    ) {

      continue
    }


    const bpmnId =
      rootElement.id


    if (
      !bpmnId
    ) {

      continue
    }


    const componentId =
      createRuntimeComponentId(
        repositoryDocument.id,
        bpmnId
      )


    let component =
      repositoryModel.getComponent(
        componentId
      )


    if (
      !component
    ) {

      const identity =
        readSemArchIdentity(
          rootElement
        )


      const directDiagramIds =
        getDirectDiagramIds(
          diagramIndex,
          bpmnId
        )


      component =
        repositoryModel.addComponent({

          id:
            componentId,

          type:
            componentType,

          name:
            rootElement.name ||
            bpmnId,

          documentId:
            repositoryDocument.id,

          stableGuid:
            identity.stableGuid,

          externalIds:
            identity.externalIds,

          metadata: {

            bpmnId,

            /*
             * Backward-compatible flag.
             */

            hasDirectDiagram:
              directDiagramIds.length >
              0,

            /*
             * Runtime BPMN-DI projection.
             */

            directDiagramIds
          }
        })
    }


    if (
      containerId &&
      shouldExposeInContainer({

        rootElement,

        participantProcessIds,

        diagrammedElementIds
      })
    ) {

      ensureReference({

        repositoryModel,

        id:
          [
            'ref',
            containerId,
            componentId
          ].join(':'),

        sourceId:
          containerId,

        targetId:
          componentId,

        type:
          'contains',

        metadata:
          createProjectionMetadata(
            repositoryDocument.id
          )
      })
    }


    registeredComponents.push(
      component
    )
  }


  /*
   * ------------------------------------------------------------
   * Pass 2
   *
   * Register Participants and their native BPMN relationships.
   * ------------------------------------------------------------
   */

  for (
    const rootElement
    of rootElements
  ) {

    if (
      rootElement.$type !==
      'bpmn:Collaboration'
    ) {

      continue
    }


    registerCollaborationParticipants({

      collaboration:
        rootElement,

      definitions,

      repositoryModel,

      repositoryDocument
    })
  }


  return registeredComponents
}


/*
 * ------------------------------------------------------------
 * Runtime repository identity
 * ------------------------------------------------------------
 */

function createRuntimeComponentId(
  documentId,
  bpmnId
) {

  return (
    `${documentId}::${bpmnId}`
  )
}


/*
 * ------------------------------------------------------------
 * SemArch persistent identity
 * ------------------------------------------------------------
 */

function readSemArchIdentity(
  bpmnElement
) {

  const extensionElements =
    bpmnElement?.extensionElements


  const values =
    extensionElements?.values ||
    []


  const meta =
    values.find(
      value =>
        value?.$type ===
        'semarch:Meta'
    )


  if (
    !meta
  ) {

    return {

      stableGuid:
        null,

      externalIds:
        {}
    }
  }


  const rawStableGuid =
    meta.stableGuid ||
    meta.$attrs?.stableGuid ||
    meta.$attrs?.['semarch:stableGuid'] ||
    null


  return {

    stableGuid:
      normalizeGuid(
        rawStableGuid
      ),

    externalIds:
      {}
  }
}


/*
 * ------------------------------------------------------------
 * Projection metadata
 * ------------------------------------------------------------
 */

function createProjectionMetadata(
  documentId
) {

  return {

    projection:
      'bpmn',

    documentId
  }
}


/*
 * ------------------------------------------------------------
 * CoC exposure
 * ------------------------------------------------------------
 */

function shouldExposeInContainer({
  rootElement,
  participantProcessIds,
  diagrammedElementIds
}) {

  switch (
    rootElement.$type
  ) {

    case 'bpmn:Collaboration':

      return true


    case 'bpmn:Process':

      if (
        diagrammedElementIds.has(
          rootElement.id
        )
      ) {

        return true
      }


      if (
        participantProcessIds.has(
          rootElement.id
        )
      ) {

        return false
      }


      return true


    default:

      return false
  }
}


/*
 * ------------------------------------------------------------
 * Participant -> Process analysis
 * ------------------------------------------------------------
 */

function collectParticipantProcessIds(
  rootElements
) {

  const processIds =
    new Set()


  for (
    const rootElement
    of rootElements
  ) {

    if (
      rootElement.$type !==
      'bpmn:Collaboration'
    ) {

      continue
    }


    const participants =
      rootElement.participants ||
      []


    for (
      const participant
      of participants
    ) {

      const processRef =
        participant.processRef


      if (
        processRef?.id
      ) {

        processIds.add(
          processRef.id
        )
      }
    }
  }


  return processIds
}


/*
 * ------------------------------------------------------------
 * BPMN-DI direct diagram index
 * ------------------------------------------------------------
 */

function collectDiagramIndex(
  definitions
) {

  const diagramIndex =
    new Map()


  const diagrams =
    definitions.diagrams ||
    []


  for (
    const diagram
    of diagrams
  ) {

    const bpmnElement =
      diagram.plane?.bpmnElement


    if (
      !bpmnElement?.id ||
      !diagram.id
    ) {

      continue
    }


    let diagramIds =
      diagramIndex.get(
        bpmnElement.id
      )


    if (
      !diagramIds
    ) {

      diagramIds =
        []

      diagramIndex.set(
        bpmnElement.id,
        diagramIds
      )
    }


    diagramIds.push(
      diagram.id
    )
  }


  return diagramIndex
}


function getDirectDiagramIds(
  diagramIndex,
  bpmnId
) {

  return [
    ...(
      diagramIndex.get(
        bpmnId
      ) ||
      []
    )
  ]
}


/*
 * ------------------------------------------------------------
 * Contextual Participant views
 *
 * A contextual representation is derived from:
 *
 * - Collaboration
 * - Participant
 * - Participant.processRef
 * - Process semantic contents
 * - BPMN-DI plane elements
 *
 * No geometry is inspected.
 * ------------------------------------------------------------
 */

function collectParticipantDiagramViews({
  definitions,
  collaboration,
  participant
}) {

  const diagrams =
    definitions.diagrams ||
    []


  const process =
    participant.processRef


  if (
    !process?.id
  ) {

    return []
  }


  const processElementIds =
    collectProcessElementIds(
      process
    )


  const views =
    []


  for (
    const diagram
    of diagrams
  ) {

    const plane =
      diagram.plane


    if (
      !diagram.id ||
      !plane ||
      plane.bpmnElement?.id !==
        collaboration.id
    ) {

      continue
    }


    const representedElementIds =
      collectPlaneElementIds(
        plane
      )


    const representedProcessElementIds =
      [
        ...processElementIds
      ].filter(
        elementId =>
          representedElementIds.has(
            elementId
          )
      )


    views.push({

      diagramId:
        diagram.id,

      planeId:
        plane.id ||
        null,

      collaborationBpmnId:
        collaboration.id,

      representation:
        representedProcessElementIds
          .length >
        0
          ? 'white-box'
          : 'opaque',

      representedProcessElementIds
    })
  }


  return views
}


/*
 * ------------------------------------------------------------
 * Process semantic contents
 *
 * We deliberately collect semantic containment, not graphical
 * containment.
 *
 * The Process itself is excluded: its presence as a plane root
 * or reference does not prove that its internal behavior is
 * represented.
 *
 * References such as sourceRef, targetRef and flowNodeRef are
 * not traversed.
 * ------------------------------------------------------------
 */

function collectProcessElementIds(
  process
) {

  const elementIds =
    new Set()


  const visited =
    new Set()


  collectContainedElements(
    process.flowElements,
    elementIds,
    visited
  )


  collectContainedElements(
    process.laneSets,
    elementIds,
    visited
  )


  return elementIds
}


function collectContainedElements(
  elements,
  elementIds,
  visited
) {

  for (
    const element
    of elements ||
    []
  ) {

    if (
      !element ||
      visited.has(
        element
      )
    ) {

      continue
    }


    visited.add(
      element
    )


    if (
      element.id
    ) {

      elementIds.add(
        element.id
      )
    }


    /*
     * Flow elements nested inside SubProcesses.
     */

    collectContainedElements(
      element.flowElements,
      elementIds,
      visited
    )


    /*
     * LaneSets belonging to Process/SubProcess.
     */

    collectContainedElements(
      element.laneSets,
      elementIds,
      visited
    )


    /*
     * Lanes belonging to a LaneSet.
     */

    collectContainedElements(
      element.lanes,
      elementIds,
      visited
    )


    /*
     * Nested lanes.
     */

    if (
      element.childLaneSet
    ) {

      collectContainedElements(
        element.childLaneSet.lanes,
        elementIds,
        visited
      )
    }
  }
}


/*
 * ------------------------------------------------------------
 * BPMN-DI plane contents
 *
 * BPMNShape and BPMNEdge both reference semantic BPMN
 * elements through bpmnElement.
 *
 * We only inspect those references.
 * ------------------------------------------------------------
 */

function collectPlaneElementIds(
  plane
) {

  const elementIds =
    new Set()


  const planeElements =
    plane.planeElement ||
    []


  for (
    const planeElement
    of planeElements
  ) {

    const bpmnElement =
      planeElement?.bpmnElement


    if (
      bpmnElement?.id
    ) {

      elementIds.add(
        bpmnElement.id
      )
    }
  }


  return elementIds
}


/*
 * ------------------------------------------------------------
 * Collaboration participants
 * ------------------------------------------------------------
 */

function registerCollaborationParticipants({
  collaboration,
  definitions,
  repositoryModel,
  repositoryDocument
}) {

  const participants =
    collaboration.participants ||
    []


  const collaborationComponentId =
    createRuntimeComponentId(
      repositoryDocument.id,
      collaboration.id
    )


  for (
    const participant
    of participants
  ) {

    if (
      !participant.id
    ) {

      continue
    }


    const participantComponentId =
      createRuntimeComponentId(
        repositoryDocument.id,
        participant.id
      )


    let participantComponent =
      repositoryModel.getComponent(
        participantComponentId
      )


    if (
      !participantComponent
    ) {

      const identity =
        readSemArchIdentity(
          participant
        )


      const diagramViews =
        collectParticipantDiagramViews({

          definitions,

          collaboration,

          participant
        })


      participantComponent =
        repositoryModel.addComponent({

          id:
            participantComponentId,

          type:
            'participant',

          name:
            participant.name ||
            participant.id,

          documentId:
            repositoryDocument.id,

          stableGuid:
            identity.stableGuid,

          externalIds:
            identity.externalIds,

          metadata: {

            bpmnId:
              participant.id,

            /*
             * Semantic state:
             *
             * true means the Participant has no processRef.
             */

            blackBox:
              !participant.processRef,

            /*
             * Runtime BPMN-DI projection.
             *
             * For a Participant with processRef:
             *
             * opaque
             *   = Process associated, but no internal Process
             *     element represented in this Collaboration
             *     diagram.
             *
             * white-box
             *   = at least one internal Process element is
             *     represented in this Collaboration diagram.
             *
             * A Participant without processRef has no
             * contextual Process view.
             */

            diagramViews
          }
        })
    }


    /*
     * Collaboration -> Participant
     */

    ensureReference({

      repositoryModel,

      id:
        [
          'ref',
          collaborationComponentId,
          participantComponentId
        ].join(':'),

      sourceId:
        collaborationComponentId,

      targetId:
        participantComponentId,

      type:
        'participant',

      metadata:
        createProjectionMetadata(
          repositoryDocument.id
        )
    })


    /*
     * Participant -> Process
     *
     * Optional in BPMN.
     *
     * No Process is invented for a Participant without
     * processRef.
     */

    const processRef =
      participant.processRef


    if (
      !processRef?.id
    ) {

      continue
    }


    const processComponentId =
      createRuntimeComponentId(
        repositoryDocument.id,
        processRef.id
      )


    ensureReference({

      repositoryModel,

      id:
        [
          'ref',
          participantComponentId,
          processComponentId
        ].join(':'),

      sourceId:
        participantComponentId,

      targetId:
        processComponentId,

      type:
        'processRef',

      metadata:
        createProjectionMetadata(
          repositoryDocument.id
        )
    })
  }
}


/*
 * ------------------------------------------------------------
 * Root BPMN classification
 * ------------------------------------------------------------
 */

function resolveRootComponentType(
  rootElement
) {

  switch (
    rootElement.$type
  ) {

    case 'bpmn:Process':
      return 'process'


    case 'bpmn:Collaboration':
      return 'collaboration'


    default:
      return null
  }
}


/*
 * ------------------------------------------------------------
 * Reference helper
 * ------------------------------------------------------------
 */

function ensureReference({
  repositoryModel,
  id,
  sourceId,
  targetId,
  type,
  role = null,
  metadata = {}
}) {

  const existingReference =
    repositoryModel.getReference(
      id
    )


  if (
    existingReference
  ) {

    return existingReference
  }


  return repositoryModel.addReference({

    id,

    sourceId,

    targetId,

    type,

    role,

    metadata
  })
}
export function resolveRepositoryView({
  repositoryModel,
  componentId = null,
  referenceId = null
} = {}) {

  if (!repositoryModel) {
    throw new Error(
      'resolveRepositoryView requires repositoryModel'
    )
  }


  /*
   * Contextual selection
   */

  if (referenceId) {

    const reference =
      repositoryModel.getReference?.(
        referenceId
      )

    if (!reference) {
      return createUnresolvedResult({
        reason:
          'reference-not-found',
        referenceId
      })
    }


    if (
      reference.type ===
      'participant'
    ) {

      return resolveParticipantReference({
        repositoryModel,
        reference
      })
    }


    if (
      reference.type ===
      'processRef'
    ) {

      return resolveProcessReference({
        repositoryModel,
        reference
      })
    }


    return createUnresolvedResult({
      reason:
        'unsupported-reference-type',
      referenceId:
        reference.id
    })
  }


  /*
   * Component selection
   */

  if (componentId) {

    const component =
      repositoryModel.getComponent?.(
        componentId
      )

    if (!component) {
      return createUnresolvedResult({
        reason:
          'component-not-found',
        componentId
      })
    }


    switch (component.type) {

      case 'process':

        return resolveProcess({
          repositoryModel,
          component
        })


      case 'collaboration':

        return resolveCollaboration({
          component
        })


      case 'participant':

        return resolveParticipant({
          repositoryModel,
          component
        })


      default:

        return {

          status:
            'resolved',

          selectionKind:
            'component',

          semanticTarget:
            component,

          documentId:
            component.documentId ||
            null,

          context:
            null,

          diagramTarget:
            null,

          graphicalTarget:
            null,

          contextualViews:
            [],

          displayMode:
            'document'
        }
    }
  }


  return createUnresolvedResult({
    reason:
      'empty-selection'
  })
}


/*
 * ------------------------------------------------------------
 * Process
 * ------------------------------------------------------------
 */

function resolveProcess({
  repositoryModel,
  component
}) {

  const processRefReferences =
    repositoryModel
      .getIncomingReferences?.(
        component.id
      )
      ?.filter(
        reference =>
          reference.type ===
          'processRef'
      ) ||
    []


  const contextualViews =
    processRefReferences
      .map(
        processRefReference =>
          createProcessContext(
            repositoryModel,
            processRefReference
          )
      )
      .filter(
        context =>
          context !==
          null
      )


  const bpmnId =
    getBpmnId(
      component
    )


  const diagramTarget =
    createDirectDiagramTarget(
      component
    )


  return {

    status:
      'resolved',

    selectionKind:
      'process',

    semanticTarget:
      component,

    documentId:
      component.documentId ||
      null,

    context:
      null,

    diagramTarget,

    graphicalTarget:
      diagramTarget
        ? {
            preferredElementId:
              bpmnId
          }
        : null,

    contextualViews,

    displayMode:
      'process'
  }
}


/*
 * ------------------------------------------------------------
 * Collaboration
 * ------------------------------------------------------------
 */

function resolveCollaboration({
  component
}) {

  const bpmnId =
    getBpmnId(
      component
    )


  const diagramTarget =
    createDirectDiagramTarget(
      component
    )


  return {

    status:
      'resolved',

    selectionKind:
      'collaboration',

    semanticTarget:
      component,

    documentId:
      component.documentId ||
      null,

    context:
      null,

    diagramTarget,

    graphicalTarget:
      diagramTarget
        ? {
            preferredElementId:
              bpmnId
          }
        : null,

    contextualViews:
      [],

    displayMode:
      'collaboration'
  }
}


/*
 * ------------------------------------------------------------
 * Participant component
 * ------------------------------------------------------------
 */

function resolveParticipant({
  repositoryModel,
  component
}) {

  const context =
    createParticipantContextFromComponent(
      repositoryModel,
      component
    )


  return {

    status:
      'resolved',

    selectionKind:
      'participant',

    semanticTarget:
      component,

    documentId:
      component.documentId ||
      null,

    context,

    diagramTarget:
      createContextDiagramTarget(
        context
      ),

    graphicalTarget: {

      preferredElementId:
        getBpmnId(
          component
        )
    },

    contextualViews:
      [],

    displayMode:
      'participant-context'
  }
}


/*
 * ------------------------------------------------------------
 * Collaboration -> Participant
 * ------------------------------------------------------------
 */

function resolveParticipantReference({
  repositoryModel,
  reference
}) {

  const participant =
    repositoryModel
      .getComponent?.(
        reference.targetId
      ) ||
    null


  const collaboration =
    repositoryModel
      .getComponent?.(
        reference.sourceId
      ) ||
    null


  if (
    !participant
  ) {

    return createUnresolvedResult({

      reason:
        'participant-not-found',

      referenceId:
        reference.id,

      componentId:
        reference.targetId
    })
  }


  const context =
    createParticipantContextFromComponent(
      repositoryModel,
      participant,
      collaboration
    )


  return {

    status:
      'resolved',

    selectionKind:
      'participant',

    semanticTarget:
      participant,

    documentId:
      participant.documentId ||
      collaboration?.documentId ||
      null,

    context,

    diagramTarget:
      createContextDiagramTarget(
        context
      ),

    graphicalTarget: {

      preferredElementId:
        getBpmnId(
          participant
        )
    },

    contextualViews:
      [],

    displayMode:
      'participant-context'
  }
}


/*
 * ------------------------------------------------------------
 * Participant -> Process
 *
 * The semantic target is the Process.
 *
 * The graphical focus remains the Participant because the
 * selected repository path carries a Collaboration context.
 * ------------------------------------------------------------
 */

function resolveProcessReference({
  repositoryModel,
  reference
}) {

  const participant =
    repositoryModel
      .getComponent?.(
        reference.sourceId
      ) ||
    null


  const process =
    repositoryModel
      .getComponent?.(
        reference.targetId
      ) ||
    null


  if (
    !process
  ) {

    return createUnresolvedResult({

      reason:
        'process-not-found',

      referenceId:
        reference.id,

      componentId:
        reference.targetId
    })
  }


  const context =
    participant
      ? createParticipantContextFromComponent(
          repositoryModel,
          participant
        )
      : null


  return {

    status:
      'resolved',

    selectionKind:
      'process-context',

    semanticTarget:
      process,

    documentId:
      process.documentId ||
      participant?.documentId ||
      null,

    context,

    diagramTarget:
      createContextDiagramTarget(
        context
      ),

    graphicalTarget:
      context?.participantBpmnId
        ? {
            preferredElementId:
              context.participantBpmnId
          }
        : null,

    contextualViews:
      context
        ? [
            context
          ]
        : [],

    displayMode:
      'participant-context'
  }
}


/*
 * ------------------------------------------------------------
 * Process context
 * ------------------------------------------------------------
 */

function createProcessContext(
  repositoryModel,
  processRefReference
) {

  const participant =
    repositoryModel
      .getComponent?.(
        processRefReference.sourceId
      ) ||
    null


  if (
    !participant
  ) {

    return null
  }


  return createParticipantContextFromComponent(
    repositoryModel,
    participant
  )
}


/*
 * ------------------------------------------------------------
 * Participant context
 *
 * Repository relationships give us:
 *
 * Collaboration
 *   -> Participant
 *        -> Process
 *
 * Participant runtime metadata gives us the BPMN-DI views in
 * which that Participant's Process is represented.
 *
 * No BPMN-DI analysis is repeated here.
 * ------------------------------------------------------------
 */

function createParticipantContextFromComponent(
  repositoryModel,
  participant,
  knownCollaboration = null
) {

  if (
    !participant
  ) {

    return null
  }


  const participantReference =
    repositoryModel
      .getIncomingReferences?.(
        participant.id
      )
      ?.find(
        reference =>
          reference.type ===
          'participant'
      ) ||
    null


  const collaboration =
    knownCollaboration ||
    (
      participantReference
        ? repositoryModel
            .getComponent?.(
              participantReference.sourceId
            )
        : null
    ) ||
    null


  const processRefReference =
    repositoryModel
      .getOutgoingReferences?.(
        participant.id
      )
      ?.find(
        reference =>
          reference.type ===
          'processRef'
      ) ||
    null


  const process =
    processRefReference
      ? repositoryModel
          .getComponent?.(
            processRefReference.targetId
          ) ||
        null
      : null


  const collaborationDiagramIds =
    getDirectDiagramIds(
      collaboration
    )


  const diagramViews =
    getParticipantDiagramViews(
      participant,
      collaboration
    )


  return {

    participantReferenceId:
      participantReference?.id ||
      null,

    processReferenceId:
      processRefReference?.id ||
      null,

    collaborationId:
      collaboration?.id ||
      participantReference?.sourceId ||
      null,

    collaborationBpmnId:
      getBpmnId(
        collaboration
      ),

    collaborationName:
      collaboration?.name ||
      null,

    collaborationDiagramIds,

    participantId:
      participant.id,

    participantBpmnId:
      getBpmnId(
        participant
      ),

    participantName:
      participant.name ||
      null,

    blackBox:
      participant.metadata?.blackBox ===
      true,

    processId:
      process?.id ||
      processRefReference?.targetId ||
      null,

    processBpmnId:
      getBpmnId(
        process
      ),

    processName:
      process?.name ||
      null,

    resolvedProcess:
      process !==
      null,

    /*
     * Exact contextual BPMN-DI representations.
     *
     * Each item belongs to this Participant and this
     * Collaboration.
     */

    diagramViews
  }
}


/*
 * ------------------------------------------------------------
 * Participant BPMN-DI views
 *
 * The registration layer already derived these views from
 * BPMN Model + BPMN-DI.
 *
 * The resolver only filters and copies them.
 * ------------------------------------------------------------
 */

function getParticipantDiagramViews(
  participant,
  collaboration
) {

  const diagramViews =
    participant?.metadata
      ?.diagramViews


  if (
    !Array.isArray(
      diagramViews
    )
  ) {

    return []
  }


  const collaborationBpmnId =
    getBpmnId(
      collaboration
    )


  return diagramViews
    .filter(
      view =>
        !collaborationBpmnId ||
        view?.collaborationBpmnId ===
          collaborationBpmnId
    )
    .map(
      view => ({

        ...view,

        representedProcessElementIds:
          Array.isArray(
            view
              ?.representedProcessElementIds
          )
            ? [
                ...view
                  .representedProcessElementIds
              ]
            : []
      })
    )
}


/*
 * ------------------------------------------------------------
 * Contextual BPMN-DI target
 *
 * Policy:
 *
 * - exactly one contextual view:
 *     select that exact BPMNDiagram
 *
 * - multiple contextual views:
 *     do not choose one arbitrarily
 *
 * - no contextual view:
 *     preserve the Collaboration diagram fallback
 *
 * Multiple BPMNDiagram objects may share the same semantic
 * Collaboration root. In that case the root is not sufficient
 * to identify the intended view.
 * ------------------------------------------------------------
 */

function createContextDiagramTarget(
  context
) {

  if (
    !context?.collaborationBpmnId
  ) {

    return null
  }


  const diagramViews =
    Array.isArray(
      context.diagramViews
    )
      ? context.diagramViews
      : []


  /*
   * One exact contextual representation:
   * navigation is unambiguous.
   */

  if (
    diagramViews.length ===
    1
  ) {

    const contextualView =
      diagramViews[0]


    return {

      diagramId:
        contextualView.diagramId ||
        null,

      preferredRootElementId:
        context.collaborationBpmnId,

      representation:
        contextualView.representation ||
        null
    }
  }


  /*
   * More than one exact contextual representation:
   * choosing diagramViews[0] would make XML order an implicit
   * navigation policy.
   *
   * The caller must ask the user which view to open.
   */

  if (
    diagramViews.length >
    1
  ) {

    return null
  }


  /*
   * Compatibility fallback for contexts for which no
   * participant-specific diagram view was projected.
   */

  const collaborationDiagramIds =
    Array.isArray(
      context.collaborationDiagramIds
    )
      ? context.collaborationDiagramIds
      : []


  /*
   * A single Collaboration diagram remains unambiguous.
   */

  if (
    collaborationDiagramIds.length ===
    1
  ) {

    return {

      diagramId:
        collaborationDiagramIds[0],

      preferredRootElementId:
        context.collaborationBpmnId,

      representation:
        null
    }
  }


  /*
   * Multiple Collaboration diagrams are ambiguous for exactly
   * the same reason as multiple contextual diagramViews.
   */

  if (
    collaborationDiagramIds.length >
    1
  ) {

    return null
  }


  /*
   * Legacy fallback when no exact BPMNDiagram id is available.
   */

  return {

    diagramId:
      null,

    preferredRootElementId:
      context.collaborationBpmnId,

    representation:
      null
  }
}


/*
 * ------------------------------------------------------------
 * Direct BPMN-DI target
 * ------------------------------------------------------------
 */

function createDirectDiagramTarget(
  component
) {

  const bpmnId =
    getBpmnId(
      component
    )


  if (
    !bpmnId
  ) {

    return null
  }


  const directDiagramIds =
    getDirectDiagramIds(
      component
    )


  if (
    directDiagramIds.length >
    0
  ) {

    return {

      diagramId:
        directDiagramIds[0],

      preferredRootElementId:
        bpmnId
    }
  }


  /*
   * Temporary compatibility with components projected before
   * directDiagramIds existed.
   */

  if (
    component?.metadata
      ?.hasDirectDiagram ===
    true
  ) {

    return {

      diagramId:
        null,

      preferredRootElementId:
        bpmnId
    }
  }


  return null
}


/*
 * ------------------------------------------------------------
 * Direct diagram ids
 * ------------------------------------------------------------
 */

function getDirectDiagramIds(
  component
) {

  const diagramIds =
    component?.metadata
      ?.directDiagramIds


  if (
    !Array.isArray(
      diagramIds
    )
  ) {

    return []
  }


  return [
    ...diagramIds
  ]
}


/*
 * ------------------------------------------------------------
 * BPMN semantic identity
 * ------------------------------------------------------------
 */

function getBpmnId(
  component
) {

  return (
    component?.metadata?.bpmnId ||
    null
  )
}


/*
 * ------------------------------------------------------------
 * Unresolved result
 * ------------------------------------------------------------
 */

function createUnresolvedResult(
  details = {}
) {

  return {

    status:
      'unresolved',

    selectionKind:
      null,

    semanticTarget:
      null,

    documentId:
      null,

    context:
      null,

    diagramTarget:
      null,

    graphicalTarget:
      null,

    contextualViews:
      [],

    displayMode:
      'none',

    ...details
  }
}
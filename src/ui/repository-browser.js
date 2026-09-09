import {
  w2sidebar
} from 'w2ui'


export function createRepositoryBrowser({
  store,
  repositoryModel,
  container,
  onSelect,
  onContainerSelect
} = {}) {

  if (
    !container
  ) {

    throw new Error(
      'Repository browser requires a container'
    )
  }


  const sidebarName =
    `repository_sidebar_${
      Math.random()
        .toString(36)
        .slice(2)
    }`


  let sidebar =
    null


  /*
   * ------------------------------------------------------------
   * Node IDs
   * ------------------------------------------------------------
   */

  function containerNodeId(
    containerId
  ) {

    return `coc:${containerId}`
  }


  function categoryNodeId(
    containerId,
    category
  ) {

    return (
      `category:${containerId}:${category}`
    )
  }


  function componentNodeId(
    componentId
  ) {

    return `component:${componentId}`
  }


  function documentNodeId(
    documentId
  ) {

    return `document:${documentId}`
  }


  function unresolvedNodeId(
    referenceId
  ) {

    return `unresolved:${referenceId}`
  }


  function participantCategoryNodeId(
    collaborationId
  ) {

    return (
      `participants:${collaborationId}`
    )
  }


  function participantNodeId(
    participantId
  ) {

    return (
      `participant:${participantId}`
    )
  }


  function processReferenceNodeId(
    referenceId
  ) {

    return (
      `process-ref:${referenceId}`
    )
  }


  /*
   * ------------------------------------------------------------
   * Repository tree projection
   * ------------------------------------------------------------
   */

  function buildNodes() {

    const nodes =
      []


    const containers =
      repositoryModel
        ?.getContainers?.() ||
      []


    for (
      const repositoryContainer
      of containers
    ) {

      nodes.push(
        buildContainerNode(
          repositoryContainer
        )
      )
    }


    const unassignedDocuments =
      getUnassignedDocuments()


    if (
      unassignedDocuments.length >
      0
    ) {

      nodes.push({

        id:
          'group:unassigned',

        text:
          'Unassigned BPMN',

        group:
          true,

        expanded:
          true,

        nodes:
          unassignedDocuments
            .sort(
              compareByText
            )
            .map(
              buildDocumentNode
            )
      })
    }


    return nodes
  }


  /*
   * ------------------------------------------------------------
   * CoC projection
   * ------------------------------------------------------------
   */

  function buildContainerNode(
    repositoryContainer
  ) {

    const children =
      repositoryModel
        ?.getChildren?.(
          repositoryContainer.id
        ) ||
      []


    const processes =
      []


    const collaborations =
      []


    const otherComponents =
      []


    const unresolved =
      []


    for (
      const child
      of children
    ) {

      if (
        !child.resolved ||
        !child.component
      ) {

        unresolved.push(
          child
        )

        continue
      }


      switch (
        child.component.type
      ) {

        case 'process':

          processes.push(
            child
          )

          break


        case 'collaboration':

          collaborations.push(
            child
          )

          break


        default:

          otherComponents.push(
            child
          )

          break
      }
    }


    const categoryNodes =
      []


    if (
      processes.length >
      0
    ) {

      categoryNodes.push(
        buildCategoryNode({

          containerId:
            repositoryContainer.id,

          category:
            'processes',

          text:
            'Processes',

          children:
            processes
        })
      )
    }


    if (
      collaborations.length >
      0
    ) {

      categoryNodes.push(
        buildCategoryNode({

          containerId:
            repositoryContainer.id,

          category:
            'collaborations',

          text:
            'Collaborations',

          children:
            collaborations
        })
      )
    }


    if (
      otherComponents.length >
      0
    ) {

      categoryNodes.push(
        buildCategoryNode({

          containerId:
            repositoryContainer.id,

          category:
            'other',

          text:
            'Other Components',

          children:
            otherComponents
        })
      )
    }


    if (
      unresolved.length >
      0
    ) {

      categoryNodes.push(
        buildUnresolvedCategoryNode({

          containerId:
            repositoryContainer.id,

          children:
            unresolved
        })
      )
    }


    return {

      id:
        containerNodeId(
          repositoryContainer.id
        ),

      text:
        repositoryContainer.name ||
        repositoryContainer.id,

      icon:
        'w2ui-icon-folder',

      expanded:
        true,

      repositoryKind:
        'container',

      repositoryId:
        repositoryContainer.id,

      nodes:
        categoryNodes
    }
  }


  /*
   * ------------------------------------------------------------
   * Category nodes
   * ------------------------------------------------------------
   */

  function buildCategoryNode({
    containerId,
    category,
    text,
    children
  }) {

    return {

      id:
        categoryNodeId(
          containerId,
          category
        ),

      text,

      icon:
        'w2ui-icon-folder',

      expanded:
        true,

      repositoryKind:
        'category',

      nodes:
        children
          .slice()
          .sort(
            compareChildren
          )
          .map(
            buildComponentNode
          )
    }
  }


  function buildUnresolvedCategoryNode({
    containerId,
    children
  }) {

    return {

      id:
        categoryNodeId(
          containerId,
          'unresolved'
        ),

      text:
        'Unresolved References',

      icon:
        'w2ui-icon-folder',

      expanded:
        true,

      repositoryKind:
        'category',

      nodes:
        children
          .slice()
          .sort(
            compareUnresolvedChildren
          )
          .map(
            buildUnresolvedNode
          )
    }
  }


  /*
   * ------------------------------------------------------------
   * Component nodes
   * ------------------------------------------------------------
   */

  function buildComponentNode(
    child
  ) {

    const component =
      child.component


    const node = {

      id:
        componentNodeId(
          component.id
        ),

      text:
        component.name ||
        component.id,

      icon:
        getComponentIcon(
          component.type
        ),

      repositoryKind:
        'component',

      repositoryId:
        component.id
    }


    if (
      component.type ===
      'collaboration'
    ) {

      const participants =
        getParticipants(
          component.id
        )


      if (
        participants.length >
        0
      ) {

        node.expanded =
          true


        node.nodes = [

          buildParticipantCategoryNode(
            component,
            participants
          )
        ]
      }
    }


    return node
  }


  /*
   * ------------------------------------------------------------
   * Participants
   * ------------------------------------------------------------
   */

  function getParticipants(
    collaborationId
  ) {

    const references =
      repositoryModel
        ?.getOutgoingReferences?.(
          collaborationId
        ) ||
      []


    return references
      .filter(
        reference =>
          reference.type ===
          'participant'
      )
      .map(
        reference => {

          const participant =
            repositoryModel
              ?.getComponent?.(
                reference.targetId
              )


          return {
            reference,
            participant
          }
        }
      )
      .filter(
        entry =>
          entry.participant
      )
      .sort(
        compareParticipants
      )
  }


  function buildParticipantCategoryNode(
    collaboration,
    participants
  ) {

    return {

      id:
        participantCategoryNodeId(
          collaboration.id
        ),

      text:
        'Participants',

      icon:
        'w2ui-icon-folder',

      expanded:
        true,

      repositoryKind:
        'category',

      nodes:
        participants.map(
          buildParticipantNode
        )
    }
  }


  function buildParticipantNode(
    entry
  ) {

    const participant =
      entry.participant


    const node = {

      id:
        participantNodeId(
          participant.id
        ),

      text:
        participant.name ||
        participant.metadata
          ?.bpmnId ||
        participant.id,

      icon:
        'w2ui-icon-file',

      repositoryKind:
        'participant',

      repositoryId:
        participant.id
    }


    const processEntry =
      getParticipantProcess(
        participant.id
      )


    if (
      processEntry
    ) {

      node.expanded =
        true


      node.nodes = [

        buildProcessReferenceNode(
          processEntry
        )
      ]
    }


    return node
  }


  /*
   * ------------------------------------------------------------
   * Participant -> Process
   *
   * This is a contextual tree entry.
   *
   * The Process is not promoted to an intrinsic CoC Process.
   * The node preserves the processRef through which the Process
   * is reached.
   * ------------------------------------------------------------
   */

  function getParticipantProcess(
    participantId
  ) {

    const processReference =
      repositoryModel
        ?.getOutgoingReferences?.(
          participantId
        )
        ?.find(
          reference =>
            reference.type ===
            'processRef'
        ) ||
      null


    if (
      !processReference
    ) {

      return null
    }


    const process =
      repositoryModel
        ?.getComponent?.(
          processReference.targetId
        ) ||
      null


    return {

      reference:
        processReference,

      process
    }
  }


  function buildProcessReferenceNode(
    entry
  ) {

    const reference =
      entry.reference


    const process =
      entry.process


    return {

      id:
        processReferenceNodeId(
          reference.id
        ),

      text:
        process?.name ||
        process?.metadata
          ?.bpmnId ||
        reference.targetId,

      icon:
        'w2ui-icon-file',

      repositoryKind:
        'process-reference',

      repositoryId:
        reference.id,

      processComponentId:
        reference.targetId,

      resolved:
        process !==
        null
    }
  }


  function compareParticipants(
    left,
    right
  ) {

    const leftText =
      left.participant?.name ||
      left.participant?.metadata
        ?.bpmnId ||
      ''


    const rightText =
      right.participant?.name ||
      right.participant?.metadata
        ?.bpmnId ||
      ''


    return leftText.localeCompare(
      rightText
    )
  }


  function buildUnresolvedNode(
    child
  ) {

    const reference =
      child.reference


    return {

      id:
        unresolvedNodeId(
          reference.id
        ),

      text:
        reference.targetId,

      icon:
        'w2ui-icon-info',

      repositoryKind:
        'unresolved',

      repositoryId:
        reference.id
    }
  }


  function getComponentIcon(
    type
  ) {

    switch (
      type
    ) {

      case 'collaboration':
        return 'w2ui-icon-columns'

      case 'process':
        return 'w2ui-icon-file'

      case 'participant':
        return 'w2ui-icon-file'

      default:
        return 'w2ui-icon-file'
    }
  }


  /*
   * ------------------------------------------------------------
   * Physical BPMN documents
   * ------------------------------------------------------------
   */

  function buildDocumentNode(
    repositoryDocument
  ) {

    return {

      id:
        documentNodeId(
          repositoryDocument.id
        ),

      text:
        repositoryDocument.fileName ||
        repositoryDocument.id,

      icon:
        'w2ui-icon-file',

      repositoryKind:
        'document',

      repositoryId:
        repositoryDocument.id
    }
  }


  function getUnassignedDocuments() {

    const documents =
      store
        ?.getDocuments?.() ||
      []


    const components =
      repositoryModel
        ?.getComponents?.() ||
      []


    const assignedDocumentIds =
      new Set(

        components
          .map(
            component =>
              component.documentId
          )
          .filter(
            Boolean
          )
      )


    return documents.filter(
      repositoryDocument =>
        !assignedDocumentIds.has(
          repositoryDocument.id
        )
    )
  }


  /*
   * ------------------------------------------------------------
   * Sorting
   * ------------------------------------------------------------
   */

  function compareChildren(
    left,
    right
  ) {

    const leftText =
      left.component?.name ||
      left.component?.id ||
      ''


    const rightText =
      right.component?.name ||
      right.component?.id ||
      ''


    return leftText.localeCompare(
      rightText
    )
  }


  function compareUnresolvedChildren(
    left,
    right
  ) {

    const leftText =
      left.reference?.targetId ||
      ''


    const rightText =
      right.reference?.targetId ||
      ''


    return leftText.localeCompare(
      rightText
    )
  }


  function compareByText(
    left,
    right
  ) {

    const leftText =
      left.fileName ||
      left.id ||
      ''


    const rightText =
      right.fileName ||
      right.id ||
      ''


    return leftText.localeCompare(
      rightText
    )
  }


  /*
   * ------------------------------------------------------------
   * Sidebar creation
   * ------------------------------------------------------------
   */

  function createSidebar() {

    sidebar =
      new w2sidebar({

        name:
          sidebarName,

        flatButton:
          false,

        nodes:
          buildNodes(),

        onClick(
          event
        ) {

          handleClick(
            event.target
          )
        }
      })


    sidebar.render(
      container
    )
  }


  /*
   * ------------------------------------------------------------
   * Click handling
   * ------------------------------------------------------------
   */

  function handleClick(
    nodeId
  ) {

    const node =
      sidebar.get(
        nodeId
      )


    if (
      !node
    ) {

      return
    }


    switch (
      node.repositoryKind
    ) {

      case 'container':

        selectContainer(
          node.repositoryId,
          false
        )

        break


      case 'component':

        selectComponent(
          node.repositoryId,
          false
        )

        break


      case 'participant':

        selectParticipant(
          node.repositoryId,
          false
        )

        break


      case 'process-reference':

        selectProcessReference(
          node.repositoryId,
          false
        )

        break


      case 'document':

        selectDocument(
          node.repositoryId,
          false
        )

        break


      default:

        break
    }
  }


  /*
   * ------------------------------------------------------------
   * Semantic selection
   * ------------------------------------------------------------
   */

  function selectContainer(
    containerId,
    selectSidebar = true
  ) {

    const repositoryContainer =
      repositoryModel
        ?.getContainer?.(
          containerId
        )


    if (
      !repositoryContainer
    ) {

      return null
    }


    if (
      selectSidebar
    ) {

      render()


      sidebar.select(
        containerNodeId(
          containerId
        )
      )
    }


    onContainerSelect?.(
      repositoryContainer
    )


    return repositoryContainer
  }


  function selectComponent(
    componentId,
    selectSidebar = true
  ) {

    const component =
      repositoryModel
        ?.getComponent?.(
          componentId
        )


    if (
      !component
    ) {

      return null
    }


    if (
      selectSidebar
    ) {

      render()


      sidebar.select(
        componentNodeId(
          componentId
        )
      )
    }


    const repositoryDocument =
      component.documentId
        ? store
            ?.getDocument?.(
              component.documentId
            )
        : null


    if (
      repositoryDocument
    ) {

      store
        ?.setActiveDocument?.(
          repositoryDocument.id
        )


      onSelect?.(
        repositoryDocument,
        component,
        {
          kind:
            'component',

          componentId:
            component.id,

          bpmnElementId:
            component.metadata
              ?.bpmnId ||
            null
        }
      )
    }


    return component
  }


  /*
   * ------------------------------------------------------------
   * Participant selection
   * ------------------------------------------------------------
   */

  function selectParticipant(
    participantComponentId,
    selectSidebar = true
  ) {

    const participant =
      repositoryModel
        ?.getComponent?.(
          participantComponentId
        )


    if (
      !participant ||
      participant.type !==
      'participant'
    ) {

      return null
    }


    const repositoryDocument =
      participant.documentId
        ? store
            ?.getDocument?.(
              participant.documentId
            )
        : null


    if (
      !repositoryDocument
    ) {

      return null
    }


    if (
      selectSidebar
    ) {

      render()


      sidebar.select(
        participantNodeId(
          participant.id
        )
      )
    }


    store
      ?.setActiveDocument?.(
        repositoryDocument.id
      )


    const processReference =
      repositoryModel
        ?.getOutgoingReferences?.(
          participant.id
        )
        ?.find(
          reference =>
            reference.type ===
            'processRef'
        ) ||
      null


    onSelect?.(
      repositoryDocument,
      participant,
      {
        kind:
          'participant',

        participantComponentId:
          participant.id,

        participantId:
          participant.metadata
            ?.bpmnId ||
          null,

        processComponentId:
          processReference
            ?.targetId ||
          null,

        blackBox:
          !processReference
      }
    )


    return participant
  }


  /*
   * ------------------------------------------------------------
   * Process reference selection
   *
   * This represents:
   *
   * Participant -> processRef -> Process
   *
   * The reference is preserved in the selection so that the
   * application can distinguish this contextual Process
   * selection from an intrinsic Process selection.
   * ------------------------------------------------------------
   */

  function selectProcessReference(
    referenceId,
    selectSidebar = true
  ) {

    const reference =
      repositoryModel
        ?.getReference?.(
          referenceId
        )


    if (
      !reference ||
      reference.type !==
      'processRef'
    ) {

      return null
    }


    const participant =
      repositoryModel
        ?.getComponent?.(
          reference.sourceId
        ) ||
      null


    const process =
      repositoryModel
        ?.getComponent?.(
          reference.targetId
        ) ||
      null


    const documentId =
      process?.documentId ||
      participant?.documentId ||
      null


    const repositoryDocument =
      documentId
        ? store
            ?.getDocument?.(
              documentId
            )
        : null


    if (
      !repositoryDocument
    ) {

      return null
    }


    if (
      selectSidebar
    ) {

      render()


      sidebar.select(
        processReferenceNodeId(
          reference.id
        )
      )
    }


    store
      ?.setActiveDocument?.(
        repositoryDocument.id
      )


    onSelect?.(
      repositoryDocument,
      process,
      {
        kind:
          'reference',

        referenceId:
          reference.id,

        processComponentId:
          reference.targetId,

        participantComponentId:
          reference.sourceId
      }
    )


    return reference
  }


  /*
   * ------------------------------------------------------------
   * Physical document selection
   * ------------------------------------------------------------
   */

  function selectDocument(
    documentId,
    selectSidebar = true
  ) {

    const repositoryDocument =
      store
        ?.getDocument?.(
          documentId
        )


    if (
      !repositoryDocument
    ) {

      return null
    }


    store
      ?.setActiveDocument?.(
        documentId
      )


    if (
      selectSidebar
    ) {

      render()


      sidebar.select(
        documentNodeId(
          documentId
        )
      )
    }


    onSelect?.(
      repositoryDocument,
      null,
      {
        kind:
          'document',

        documentId:
          repositoryDocument.id
      }
    )


    return repositoryDocument
  }


  /*
   * ------------------------------------------------------------
   * Refresh
   * ------------------------------------------------------------
   */

  function render() {

  if (
    !sidebar
  ) {

    return
  }


  const selected =
    sidebar.selected


  const rootNodeIds =
    (
      sidebar.nodes ||
      []
    )
      .map(
        node =>
          node.id
      )


  for (
    const rootNodeId
    of rootNodeIds
  ) {

    sidebar.remove(
      rootNodeId
    )
  }


  sidebar.add(
    buildNodes()
  )


  if (
    selected &&
    sidebar.get(
      selected
    )
  ) {

    sidebar.select(
      selected
    )
  }
}

  /*
   * ------------------------------------------------------------
   * Initial render
   * ------------------------------------------------------------
   */

  createSidebar()


  /*
   * ------------------------------------------------------------
   * Public API
   * ------------------------------------------------------------
   */

  return {

    render,

    selectContainer,

    selectComponent,

    selectParticipant,

    selectProcessReference,

    selectDocument,

    sidebar,

    destroy() {

      if (
        sidebar
      ) {

        sidebar.destroy()

        sidebar =
          null
      }
    }
  }
}
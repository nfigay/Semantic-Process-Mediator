import {
  w2sidebar
} from 'w2ui'

import {
  createEnvironmentProjection
} from '../repository/environment-projection.js'


/*
 * ------------------------------------------------------------
 * BPMNSM Environment Browser
 *
 * Responsibility:
 *
 *   RepositoryModel
 *        +
 *   RepositoryDocumentStore
 *        ↓
 *   createEnvironmentProjection()
 *        ↓
 *   w2sidebar
 *
 * The sidebar is only a UI projection.
 *
 * It is not the semantic source of truth.
 *
 * Root structure:
 *
 *   Environment
 *   ├── Repositories
 *   ├── CoCs
 *   ├── Collaborations
 *   ├── Processes
 *   └── ArchiMate
 *
 * Root categories are landing zones for semantic objects that
 * do not currently have a more-specific resolved parent.
 *
 * BPMN documents are not represented as physical document nodes.
 *
 * Standalone ArchiMate documents are represented explicitly
 * because they are native Environment documents that do not have
 * BPMN RepositoryModel components.
 *
 * A Process may occur several times in the tree when several
 * genuine Collaboration contexts reference the same Process.
 *
 * UI occurrence identity is therefore distinct from semantic
 * component identity.
 * ------------------------------------------------------------
 */


export function createRepositoryBrowser({
  store,
  repositoryModel,
  container,
  repositories = [],
  projectionProfile = null,
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


  if (
    !repositoryModel
  ) {

    throw new Error(
      'Repository browser requires a repositoryModel'
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


  function environmentNodeId() {

    return 'environment'
  }


  function rootCategoryNodeId(
    category
  ) {

    return `environment:${category}`
  }


  function repositoryNodeId(
    repositoryId
  ) {

    return `repository:${repositoryId}`
  }


  function documentNodeId(
    documentId,
    context = 'root'
  ) {

    return (
      `document:${context}:${documentId}`
    )
  }


  function containerNodeId(
    containerId,
    context = 'root'
  ) {

    return (
      `coc:${context}:${containerId}`
    )
  }


  function componentNodeId(
    componentId,
    context = 'root'
  ) {

    return (
      `component:${context}:${componentId}`
    )
  }


  function participantCategoryNodeId(
    collaborationId,
    context = 'root'
  ) {

    return (
      `participants:${context}:${collaborationId}`
    )
  }


  function participantNodeId(
    participantId,
    context = 'root'
  ) {

    return (
      `participant:${context}:${participantId}`
    )
  }


  function processReferenceNodeId(
    referenceId,
    context = 'root'
  ) {

    return (
      `process-ref:${context}:${referenceId}`
    )
  }


  function unresolvedCategoryNodeId(
    containerId,
    context = 'root'
  ) {

    return (
      `unresolved-category:${context}:${containerId}`
    )
  }


  function unresolvedNodeId(
    referenceId,
    context = 'root'
  ) {

    return (
      `unresolved:${context}:${referenceId}`
    )
  }


  /*
   * ------------------------------------------------------------
   * Environment projection
   * ------------------------------------------------------------
   */


  function getEnvironmentProjection() {

    return createEnvironmentProjection({
      repositoryModel,
      repositories,
      documents:
        store
          ?.getDocuments?.() ||
        [],
      ...(
        projectionProfile
          ? {
              projectionProfile
            }
          : {}
      )
    })
  }


  function buildNodes() {

    const projection =
      getEnvironmentProjection()


    return [
      {
        id:
          environmentNodeId(),

        text:
          'Environment',

        icon:
          'w2ui-icon-folder',

        expanded:
          true,

        repositoryKind:
          'environment',

        nodes: [
          buildRepositoriesRoot(
            projection.repositories
          ),

          buildCocsRoot(
            projection.cocs
          ),

          buildCollaborationsRoot(
            projection.collaborations
          ),

          buildProcessesRoot(
            projection.processes
          ),

          buildArchimateRoot(
            projection.archimate
          )
        ]
      }
    ]
  }


  /*
   * ------------------------------------------------------------
   * Environment root categories
   * ------------------------------------------------------------
   */


  function buildRepositoriesRoot(
    repositoryEntries
  ) {

    return {

      id:
        rootCategoryNodeId(
          'repositories'
        ),

      text:
        'Repositories',

      icon:
        'w2ui-icon-folder',

      expanded:
        true,

      repositoryKind:
        'environment-category',

      nodes:
        repositoryEntries.map(
          buildRepositoryNode
        )
    }
  }


  function buildCocsRoot(
    cocEntries
  ) {

    return {

      id:
        rootCategoryNodeId(
          'cocs'
        ),

      text:
        'CoCs',

      icon:
        'w2ui-icon-folder',

      expanded:
        true,

      repositoryKind:
        'environment-category',

      nodes:
        cocEntries.map(
          cocEntry =>
            buildCocNode(
              cocEntry,
              'root'
            )
        )
    }
  }


  function buildCollaborationsRoot(
    collaborationEntries
  ) {

    return {

      id:
        rootCategoryNodeId(
          'collaborations'
        ),

      text:
        'Collaborations',

      icon:
        'w2ui-icon-folder',

      expanded:
        true,

      repositoryKind:
        'environment-category',

      nodes:
        collaborationEntries.map(
          collaborationEntry =>
            buildCollaborationNode(
              collaborationEntry,
              'root'
            )
        )
    }
  }


  function buildProcessesRoot(
    processes
  ) {

    return {

      id:
        rootCategoryNodeId(
          'processes'
        ),

      text:
        'Processes',

      icon:
        'w2ui-icon-folder',

      expanded:
        true,

      repositoryKind:
        'environment-category',

      nodes:
        processes.map(
          process =>
            buildProcessComponentNode(
              process,
              'root'
            )
        )
    }
  }


  function buildArchimateRoot(
    documents
  ) {

    return {

      id:
        rootCategoryNodeId(
          'archimate'
        ),

      text:
        'ArchiMate',

      icon:
        'w2ui-icon-folder',

      expanded:
        true,

      repositoryKind:
        'environment-category',

      nodes:
        documents.map(
          document =>
            buildArchimateDocumentNode(
              document,
              'root'
            )
        )
    }
  }


  function buildArchimateDocumentNode(
    document,
    context
  ) {

    return {

      id:
        documentNodeId(
          document.id,
          context
        ),

      text:
        document.fileName ||
        document.id,

      icon:
        'w2ui-icon-file',

      repositoryKind:
        'document',

      repositoryId:
        document.id,

      documentKind:
        'archimate'
    }
  }


  /*
   * ------------------------------------------------------------
   * Repository
   * ------------------------------------------------------------
   */


  function buildRepositoryNode(
    repositoryEntry
  ) {

    const repository =
      repositoryEntry.repository


    const context =
      `repository:${repository.id}`


    return {

      id:
        repositoryNodeId(
          repository.id
        ),

      text:
        repository.name ||
        repository.id,

      icon:
        'w2ui-icon-folder',

      expanded:
        true,

      repositoryKind:
        'repository',

      repositoryId:
        repository.id,

      nodes:
        repositoryEntry.cocs.map(
          cocEntry =>
            buildCocNode(
              cocEntry,
              context
            )
        )
    }
  }


  /*
   * ------------------------------------------------------------
   * CoC
   * ------------------------------------------------------------
   */


  function buildCocNode(
    cocEntry,
    parentContext
  ) {

    const repositoryContainer =
      cocEntry.container


    const context =
      `${parentContext}:coc:${repositoryContainer.id}`


    const nodes =
      []


    if (
      cocEntry.collaborations.length >
      0
    ) {

      nodes.push({

        id:
          `${context}:collaborations`,

        text:
          'Collaborations',

        icon:
          'w2ui-icon-folder',

        expanded:
          true,

        repositoryKind:
          'environment-category',

        nodes:
          cocEntry.collaborations.map(
            collaborationEntry =>
              buildCollaborationNode(
                collaborationEntry,
                context
              )
          )
      })
    }


    if (
      cocEntry.processes.length >
      0
    ) {

      nodes.push({

        id:
          `${context}:processes`,

        text:
          'Processes',

        icon:
          'w2ui-icon-folder',

        expanded:
          true,

        repositoryKind:
          'environment-category',

        nodes:
          cocEntry.processes.map(
            process =>
              buildProcessComponentNode(
                process,
                context
              )
          )
      })
    }


    if (
      cocEntry.unresolved.length >
      0
    ) {

      nodes.push(
        buildUnresolvedCategoryNode(
          cocEntry,
          context
        )
      )
    }


    return {

      id:
        containerNodeId(
          repositoryContainer.id,
          parentContext
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

      nodes
    }
  }


  /*
   * ------------------------------------------------------------
   * Collaboration
   * ------------------------------------------------------------
   */


  function buildCollaborationNode(
    collaborationEntry,
    parentContext
  ) {

    const collaboration =
      collaborationEntry.collaboration


    const context =
      `${parentContext}:collaboration:${collaboration.id}`


    const node = {

      id:
        componentNodeId(
          collaboration.id,
          parentContext
        ),

      text:
        collaboration.name ||
        collaboration.metadata
          ?.bpmnId ||
        collaboration.id,

      icon:
        getComponentIcon(
          collaboration.type
        ),

      expanded:
        true,

      repositoryKind:
        'component',

      repositoryId:
        collaboration.id,

      nodes:
        []
    }


    const participantEntries =
      buildParticipantEntries(
        collaborationEntry.processes
      )


    if (
      participantEntries.length >
      0
    ) {

      node.nodes.push(
        buildParticipantCategoryNode(
          collaboration,
          participantEntries,
          context
        )
      )
    }


    return node
  }


  /*
   * ------------------------------------------------------------
   * Participants
   *
   * createEnvironmentProjection() exposes Process occurrences.
   *
   * Each occurrence also preserves:
   *
   *   participant
   *   participantReference
   *   processReference
   *   process
   *   resolved
   *   blackBox
   *
   * The browser uses those occurrences to preserve the existing
   * Participant -> Process contextual navigation.
   * ------------------------------------------------------------
   */


  function buildParticipantEntries(
    processOccurrences
  ) {

    const entriesByParticipantId =
      new Map()


    for (
      const occurrence
      of processOccurrences
    ) {

      const participant =
        occurrence.participant


      if (
        !participant
      ) {

        continue
      }


      if (
        !entriesByParticipantId.has(
          participant.id
        )
      ) {

        entriesByParticipantId.set(
          participant.id,
          {
            participant,
            participantReference:
              occurrence.participantReference ||
              null,
            processOccurrences:
              []
          }
        )
      }


      entriesByParticipantId
        .get(
          participant.id
        )
        .processOccurrences
        .push(
          occurrence
        )
    }


    return Array
      .from(
        entriesByParticipantId.values()
      )
      .sort(
        compareParticipantEntries
      )
  }


  function buildParticipantCategoryNode(
    collaboration,
    participantEntries,
    context
  ) {

    return {

      id:
        participantCategoryNodeId(
          collaboration.id,
          context
        ),

      text:
        'Participants',

      icon:
        'w2ui-icon-folder',

      expanded:
        true,

      repositoryKind:
        'environment-category',

      nodes:
        participantEntries.map(
          participantEntry =>
            buildParticipantNode(
              participantEntry,
              context
            )
        )
    }
  }


  function buildParticipantNode(
    entry,
    context
  ) {

    const participant =
      entry.participant


    const participantContext =
      `${context}:participant:${participant.id}`


    const node = {

      id:
        participantNodeId(
          participant.id,
          context
        ),

      text:
        participant.name ||
        participant.metadata
          ?.bpmnId ||
        participant.id,

      icon:
        'w2ui-icon-file',

      expanded:
        true,

      repositoryKind:
        'participant',

      repositoryId:
        participant.id,

      nodes:
        []
    }


    for (
      const occurrence
      of entry.processOccurrences
    ) {

      if (
        occurrence.blackBox
      ) {

        continue
      }


      if (
        !occurrence.processReference
      ) {

        continue
      }


      node.nodes.push(
        buildProcessReferenceNode(
          occurrence,
          participantContext
        )
      )
    }


    return node
  }


  /*
   * ------------------------------------------------------------
   * Participant -> processRef -> Process
   *
   * This remains a contextual tree occurrence.
   *
   * The semantic Process may be the same Process represented
   * under another Collaboration.
   * ------------------------------------------------------------
   */


  function buildProcessReferenceNode(
    occurrence,
    context
  ) {

    const reference =
      occurrence.processReference


    const process =
      occurrence.process


    return {

      id:
        processReferenceNodeId(
          reference.id,
          context
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
        occurrence.resolved
    }
  }


  /*
   * ------------------------------------------------------------
   * Process
   * ------------------------------------------------------------
   */


  function buildProcessComponentNode(
    process,
    context
  ) {

    return {

      id:
        componentNodeId(
          process.id,
          context
        ),

      text:
        process.name ||
        process.metadata
          ?.bpmnId ||
        process.id,

      icon:
        getComponentIcon(
          process.type
        ),

      repositoryKind:
        'component',

      repositoryId:
        process.id
    }
  }


  /*
   * ------------------------------------------------------------
   * Unresolved CoC memberships
   * ------------------------------------------------------------
   */


  function buildUnresolvedCategoryNode(
    cocEntry,
    context
  ) {

    return {

      id:
        unresolvedCategoryNodeId(
          cocEntry.container.id,
          context
        ),

      text:
        'Unresolved References',

      icon:
        'w2ui-icon-folder',

      expanded:
        true,

      repositoryKind:
        'environment-category',

      nodes:
        cocEntry.unresolved.map(
          child =>
            buildUnresolvedNode(
              child,
              context
            )
        )
    }
  }


  function buildUnresolvedNode(
    child,
    context
  ) {

    const reference =
      child.reference


    return {

      id:
        unresolvedNodeId(
          reference.id,
          context
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


  /*
   * ------------------------------------------------------------
   * Icons
   * ------------------------------------------------------------
   */


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
   * Sorting
   * ------------------------------------------------------------
   */


  function compareParticipantEntries(
    left,
    right
  ) {

    const leftText =
      left.participant?.name ||
      left.participant?.metadata
        ?.bpmnId ||
      left.participant?.id ||
      ''


    const rightText =
      right.participant?.name ||
      right.participant?.metadata
        ?.bpmnId ||
      right.participant?.id ||
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
   * Find rendered occurrence
   *
   * A semantic object can occur more than once in the Environment
   * tree. Programmatic selection therefore searches the rendered
   * tree for an occurrence carrying the semantic repositoryId.
   * ------------------------------------------------------------
   */


  function findNodeId(
    predicate
  ) {

    if (
      !sidebar
    ) {

      return null
    }


    function visit(
      nodes
    ) {

      for (
        const node
        of nodes || []
      ) {

        if (
          predicate(
            node
          )
        ) {

          return node.id
        }


        const childResult =
          visit(
            node.nodes
          )


        if (
          childResult
        ) {

          return childResult
        }
      }


      return null
    }


    return visit(
      sidebar.nodes
    )
  }


  function findSemanticNodeId(
    repositoryKind,
    repositoryId
  ) {

    return findNodeId(
      node =>
        node.repositoryKind ===
          repositoryKind &&
        node.repositoryId ===
          repositoryId
    )
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


      const nodeId =
        findSemanticNodeId(
          'container',
          containerId
        )


      if (
        nodeId
      ) {

        sidebar.select(
          nodeId
        )
      }
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


      const nodeId =
        findSemanticNodeId(
          'component',
          componentId
        )


      if (
        nodeId
      ) {

        sidebar.select(
          nodeId
        )
      }
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


      const nodeId =
        findSemanticNodeId(
          'participant',
          participant.id
        )


      if (
        nodeId
      ) {

        sidebar.select(
          nodeId
        )
      }
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
   *   Participant -> processRef -> Process
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


      const nodeId =
        findSemanticNodeId(
          'process-reference',
          reference.id
        )


      if (
        nodeId
      ) {

        sidebar.select(
          nodeId
        )
      }
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
   *
   * BPMN documents are deliberately not displayed as Environment
   * tree nodes.
   *
   * Standalone ArchiMate documents are displayed as document
   * occurrences under the ArchiMate root category.
   *
   * The public method also remains available to the application
   * layer for programmatic document selection.
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


      const nodeId =
        findSemanticNodeId(
          'document',
          documentId
        )


      if (
        nodeId
      ) {

        sidebar.select(
          nodeId
        )
      }
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


    const selectedNode =
      selected
        ? sidebar.get(
            selected
          )
        : null


    const selectedSemanticIdentity =
      selectedNode
        ? {
            repositoryKind:
              selectedNode.repositoryKind,

            repositoryId:
              selectedNode.repositoryId
          }
        : null


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

      return
    }


    if (
      selectedSemanticIdentity
        ?.repositoryKind &&
      selectedSemanticIdentity
        ?.repositoryId
    ) {

      const replacementNodeId =
        findSemanticNodeId(
          selectedSemanticIdentity
            .repositoryKind,
          selectedSemanticIdentity
            .repositoryId
        )


      if (
        replacementNodeId
      ) {

        sidebar.select(
          replacementNodeId
        )
      }
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

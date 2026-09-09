import {
  w2sidebar
} from 'w2ui'


export function createDiagramBrowser({
  container,
  getViewIndex,
  onSelect
} = {}) {

  if (
    !container
  ) {

    throw new Error(
      'Diagram browser requires a container'
    )
  }


  const sidebarName =
    `diagram_sidebar_${
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

  function subjectNodeId(
    bpmnElementId
  ) {

    return (
      `diagram-subject:${bpmnElementId}`
    )
  }


  function diagramNodeId(
    diagramId
  ) {

    return (
      `diagram:${diagramId}`
    )
  }


  /*
   * ------------------------------------------------------------
   * Tree projection
   *
   * Diagram Browser is deliberately derived from BPMN-DI.
   *
   * It does not read:
   *
   * - RepositoryModel
   * - Repository Browser
   * - graphical element geometry
   *
   * A root node represents the semantic subject of one or more
   * BPMNDiagram views:
   *
   *   BPMNDiagram
   *       -> BPMNPlane
   *           -> bpmnElement
   * ------------------------------------------------------------
   */

  function buildNodes() {

    const viewIndex =
      getViewIndex?.() ||
      null


    if (
      !viewIndex
    ) {

      return []
    }


    const subjects =
      viewIndex
        .getSubjects?.() ||
      []


    return subjects
      .slice()
      .sort(
        compareSubjects
      )
      .map(
        buildSubjectNode
      )
  }


  /*
   * ------------------------------------------------------------
   * Subject nodes
   * ------------------------------------------------------------
   */

  function buildSubjectNode(
    subject
  ) {

    const views =
      Array.isArray(
        subject.views
      )
        ? subject.views
        : []


    return {

      id:
        subjectNodeId(
          subject.bpmnId
        ),

      text:
        subject.name ||
        subject.bpmnId ||
        '(Unnamed BPMN subject)',

      icon:
        getSubjectIcon(
          subject.type
        ),

      expanded:
        true,

      diagramBrowserKind:
        'subject',

      bpmnElementId:
        subject.bpmnId ||
        null,

      bpmnElementType:
        subject.type ||
        null,

      nodes:
        views
          .slice()
          .sort(
            compareViews
          )
          .map(
            buildDiagramNode
          )
    }
  }


  /*
   * ------------------------------------------------------------
   * BPMNDiagram nodes
   * ------------------------------------------------------------
   */

  function buildDiagramNode(
    view
  ) {

    return {

      id:
        diagramNodeId(
          view.diagramId
        ),

      text:
        view.diagramName ||
        view.diagramId ||
        '(Unnamed BPMN diagram)',

      icon:
        'w2ui-icon-file',

      diagramBrowserKind:
        'diagram',

      diagramId:
        view.diagramId ||
        null,

      subjectBpmnElementId:
        view.subject
          ?.bpmnId ||
        null
    }
  }


  /*
   * ------------------------------------------------------------
   * Icons
   * ------------------------------------------------------------
   */

  function getSubjectIcon(
    type
  ) {

    switch (
      type
    ) {

      case 'bpmn:Collaboration':
        return 'w2ui-icon-columns'

      case 'bpmn:Process':
        return 'w2ui-icon-file'

      default:
        return 'w2ui-icon-folder'
    }
  }


  /*
   * ------------------------------------------------------------
   * Sorting
   * ------------------------------------------------------------
   */

  function compareSubjects(
    left,
    right
  ) {

    const leftText =
      left.name ||
      left.bpmnId ||
      ''


    const rightText =
      right.name ||
      right.bpmnId ||
      ''


    return leftText.localeCompare(
      rightText
    )
  }


  function compareViews(
    left,
    right
  ) {

    const leftText =
      left.diagramName ||
      left.diagramId ||
      ''


    const rightText =
      right.diagramName ||
      right.diagramId ||
      ''


    return leftText.localeCompare(
      rightText
    )
  }


  /*
   * ------------------------------------------------------------
   * Sidebar
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
   *
   * Subject nodes are grouping/navigation nodes only.
   *
   * Only a BPMNDiagram leaf represents an exact graphical view
   * that can be opened.
   * ------------------------------------------------------------
   */

  function handleClick(
    nodeId
  ) {

    const node =
      sidebar?.get(
        nodeId
      )


    if (
      !node ||
      node.diagramBrowserKind !==
        'diagram' ||
      !node.diagramId
    ) {

      return
    }


    const viewIndex =
      getViewIndex?.() ||
      null


    const view =
      viewIndex
        ?.getView?.(
          node.diagramId
        ) ||
      null


    if (
      !view
    ) {

      return
    }


    onSelect?.(
      view
    )
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
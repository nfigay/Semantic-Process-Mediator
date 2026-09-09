export function createBpmnViewsExtract(
  definitions
) {

  const diagrams =
    Array.isArray(
      definitions?.diagrams
    )
      ? definitions.diagrams
      : []


  return [
    'SemArch Extract',
    'Type: BPMN Views',
    'Description: BPMN-DI diagrams, planes, shapes and edges — not the BPMN semantic model, Repository Graph or UI Tree',
    '',
    '',
    ...formatSummary(
      diagrams
    ),
    '',
    '',
    ...formatDetails(
      diagrams
    )
  ].join('\n')
}


/*
 * ------------------------------------------------------------
 * Summary
 *
 * Human-readable view organized by BPMNDiagram.
 *
 * This section shows which semantic BPMN elements are
 * represented in each graphical BPMN-DI view.
 *
 * It does not infer Repository components or contexts.
 * ------------------------------------------------------------
 */

function formatSummary(
  diagrams
) {

  const lines = [

    'BPMN VIEWS — SUMMARY',
    '====================',
    '',
    `DIAGRAMS (${diagrams.length})`,
    ''

  ]


  if (
    diagrams.length ===
    0
  ) {

    lines.push(
      '(none)'
    )

    return lines
  }


  for (
    let diagramIndex = 0;
    diagramIndex < diagrams.length;
    diagramIndex += 1
  ) {

    const diagram =
      diagrams[
        diagramIndex
      ]


    const plane =
      diagram?.plane ||
      null


    const planeElements =
      getPlaneElements(
        plane
      )


    const shapes =
      planeElements.filter(
        element =>
          element?.$type ===
          'bpmndi:BPMNShape'
      )


    const edges =
      planeElements.filter(
        element =>
          element?.$type ===
          'bpmndi:BPMNEdge'
      )


    lines.push(
      `[DIAGRAM] ${getDiagramDisplayName(
        diagram
      )}`
    )


    lines.push(
      `  diagramId: ${formatValue(
        diagram?.id
      )}`
    )


    if (
      plane
    ) {

      lines.push(
        `  plane → ${formatSemanticReference(
          plane.bpmnElement
        )}`
      )

    } else {

      lines.push(
        '  plane → null'
      )
    }


    lines.push(
      ''
    )


    lines.push(
      `  Shapes (${shapes.length})`
    )


    appendSummaryElements(
      lines,
      shapes,
      'shape'
    )


    lines.push(
      ''
    )


    lines.push(
      `  Edges (${edges.length})`
    )


    appendSummaryElements(
      lines,
      edges,
      'edge'
    )


    if (
      diagramIndex <
      diagrams.length - 1
    ) {

      lines.push(
        '',
        ''
      )
    }
  }


  return lines
}


/*
 * ------------------------------------------------------------
 * Details
 *
 * Technical BPMN-DI inventory.
 *
 * BPMNDiagram
 *   -> BPMNPlane
 *      -> BPMNShape
 *      -> BPMNEdge
 * ------------------------------------------------------------
 */

function formatDetails(
  diagrams
) {

  const lines = [

    'BPMN VIEWS — DETAILS',
    '====================',
    '',
    `Diagrams: ${diagrams.length}`,
    ''

  ]


  if (
    diagrams.length ===
    0
  ) {

    lines.push(
      '(none)'
    )

    return lines
  }


  for (
    let diagramIndex = 0;
    diagramIndex < diagrams.length;
    diagramIndex += 1
  ) {

    const diagram =
      diagrams[
        diagramIndex
      ]


    appendDiagramDetails(
      lines,
      diagram
    )


    if (
      diagramIndex <
      diagrams.length - 1
    ) {

      lines.push(
        '',
        ''
      )
    }
  }


  return lines
}


/*
 * ------------------------------------------------------------
 * Summary elements
 * ------------------------------------------------------------
 */

function appendSummaryElements(
  lines,
  elements,
  kind
) {

  if (
    elements.length ===
    0
  ) {

    lines.push(
      '  └─ (none)'
    )

    return
  }


  for (
    let index = 0;
    index < elements.length;
    index += 1
  ) {

    const element =
      elements[
        index
      ]


    const isLast =
      index ===
      elements.length - 1


    const branch =
      isLast
        ? '└─'
        : '├─'


    const semanticElement =
      element?.bpmnElement ||
      null


    lines.push(
      `  ${branch} ${getDiElementDisplayName(
        element,
        kind
      )} → ${formatSemanticReference(
        semanticElement
      )}`
    )
  }
}


/*
 * ------------------------------------------------------------
 * Diagram details
 * ------------------------------------------------------------
 */

function appendDiagramDetails(
  lines,
  diagram
) {

  const plane =
    diagram?.plane ||
    null


  const planeElements =
    getPlaneElements(
      plane
    )


  const shapes =
    planeElements.filter(
      element =>
        element?.$type ===
        'bpmndi:BPMNShape'
    )


  const edges =
    planeElements.filter(
      element =>
        element?.$type ===
        'bpmndi:BPMNEdge'
    )


  const otherElements =
    planeElements.filter(
      element =>
        element?.$type !==
          'bpmndi:BPMNShape' &&
        element?.$type !==
          'bpmndi:BPMNEdge'
    )


  lines.push(
    `[DIAGRAM] ${getDiagramDisplayName(
      diagram
    )}`
  )


  lines.push(
    `  id: ${formatValue(
      diagram?.id
    )}`
  )


  if (
    diagram?.name
  ) {

    lines.push(
      `  name: ${diagram.name}`
    )
  }


  if (
    !plane
  ) {

    lines.push(
      '  plane: null'
    )

    return
  }


  lines.push(
    '  plane:'
  )


  lines.push(
    `    id: ${formatValue(
      plane.id
    )}`
  )


  lines.push(
    `    bpmnElement: ${formatSemanticReference(
      plane.bpmnElement
    )}`
  )


  lines.push(
    `    planeElements: ${planeElements.length}`
  )


  lines.push(
    ''
  )


  lines.push(
    `  SHAPES (${shapes.length})`
  )


  if (
    shapes.length ===
    0
  ) {

    lines.push(
      '    (none)'

    )

  } else {

    for (
      const shape
      of shapes
    ) {

      appendShapeDetails(
        lines,
        shape
      )
    }
  }


  lines.push(
    ''
  )


  lines.push(
    `  EDGES (${edges.length})`
  )


  if (
    edges.length ===
    0
  ) {

    lines.push(
      '    (none)'

    )

  } else {

    for (
      const edge
      of edges
    ) {

      appendEdgeDetails(
        lines,
        edge
      )
    }
  }


  if (
    otherElements.length >
    0
  ) {

    lines.push(
      ''
    )


    lines.push(
      `  OTHER DI ELEMENTS (${otherElements.length})`
    )


    for (
      const element
      of otherElements
    ) {

      appendOtherDiElementDetails(
        lines,
        element
      )
    }
  }
}


/*
 * ------------------------------------------------------------
 * Shape details
 * ------------------------------------------------------------
 */

function appendShapeDetails(
  lines,
  shape
) {

  lines.push(
    `    [SHAPE] ${getDiElementDisplayName(
      shape,
      'shape'
    )}`
  )


  lines.push(
    `      id: ${formatValue(
      shape?.id
    )}`
  )


  lines.push(
    `      bpmnElement: ${formatSemanticReference(
      shape?.bpmnElement
    )}`
  )


  if (
    shape?.isHorizontal !==
    undefined
  ) {

    lines.push(
      `      isHorizontal: ${formatValue(
        shape.isHorizontal
      )}`
    )
  }


  if (
    shape?.isExpanded !==
    undefined
  ) {

    lines.push(
      `      isExpanded: ${formatValue(
        shape.isExpanded
      )}`
    )
  }


  if (
    shape?.isMarkerVisible !==
    undefined
  ) {

    lines.push(
      `      isMarkerVisible: ${formatValue(
        shape.isMarkerVisible
      )}`
    )
  }


  if (
    shape?.participantBandKind
  ) {

    lines.push(
      `      participantBandKind: ${formatValue(
        shape.participantBandKind
      )}`
    )
  }


  appendBounds(
    lines,
    shape?.bounds
  )


  if (
    shape?.label
  ) {

    appendLabel(
      lines,
      shape.label
    )
  }
}


/*
 * ------------------------------------------------------------
 * Edge details
 * ------------------------------------------------------------
 */

function appendEdgeDetails(
  lines,
  edge
) {

  lines.push(
    `    [EDGE] ${getDiElementDisplayName(
      edge,
      'edge'
    )}`
  )


  lines.push(
    `      id: ${formatValue(
      edge?.id
    )}`
  )


  lines.push(
    `      bpmnElement: ${formatSemanticReference(
      edge?.bpmnElement
    )}`
  )


  const waypoints =
    Array.isArray(
      edge?.waypoint
    )
      ? edge.waypoint
      : []


  lines.push(
    `      waypoints: ${waypoints.length}`
  )


  for (
    let index = 0;
    index < waypoints.length;
    index += 1
  ) {

    const waypoint =
      waypoints[
        index
      ]


    lines.push(
      `        ${index + 1}: x=${formatNumber(
        waypoint?.x
      )}, y=${formatNumber(
        waypoint?.y
      )}`
    )
  }


  if (
    edge?.messageVisibleKind
  ) {

    lines.push(
      `      messageVisibleKind: ${formatValue(
        edge.messageVisibleKind
      )}`
    )
  }


  if (
    edge?.label
  ) {

    appendLabel(
      lines,
      edge.label
    )
  }
}


/*
 * ------------------------------------------------------------
 * Other DI elements
 * ------------------------------------------------------------
 */

function appendOtherDiElementDetails(
  lines,
  element
) {

  lines.push(
    `    [${formatDiType(
      element?.$type
    )}] ${formatValue(
      element?.id
    )}`
  )


  if (
    element?.bpmnElement
  ) {

    lines.push(
      `      bpmnElement: ${formatSemanticReference(
        element.bpmnElement
      )}`
    )
  }
}


/*
 * ------------------------------------------------------------
 * Bounds / labels
 * ------------------------------------------------------------
 */

function appendBounds(
  lines,
  bounds
) {

  if (
    !bounds
  ) {

    lines.push(
      '      bounds: null'
    )

    return
  }


  lines.push(
    `      bounds: x=${formatNumber(
      bounds.x
    )}, y=${formatNumber(
      bounds.y
    )}, width=${formatNumber(
      bounds.width
    )}, height=${formatNumber(
      bounds.height
    )}`
  )
}


function appendLabel(
  lines,
  label
) {

  lines.push(
    `      labelId: ${formatValue(
      label?.id
    )}`
  )


  if (
    label?.bounds
  ) {

    lines.push(
      `      labelBounds: x=${formatNumber(
        label.bounds.x
      )}, y=${formatNumber(
        label.bounds.y
      )}, width=${formatNumber(
        label.bounds.width
      )}, height=${formatNumber(
        label.bounds.height
      )}`
    )
  }
}


/*
 * ------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------
 */

function getPlaneElements(
  plane
) {

  return Array.isArray(
    plane?.planeElement
  )
    ? plane.planeElement
    : []
}


function getDiagramDisplayName(
  diagram
) {

  if (
    diagram?.name
  ) {

    return diagram.name
  }


  if (
    diagram
      ?.plane
      ?.bpmnElement
      ?.name
  ) {

    return diagram
      .plane
      .bpmnElement
      .name
  }


  if (
    diagram
      ?.plane
      ?.bpmnElement
      ?.id
  ) {

    return diagram
      .plane
      .bpmnElement
      .id
  }


  if (
    diagram?.id
  ) {

    return diagram.id
  }


  return '(unnamed diagram)'
}


function getDiElementDisplayName(
  diElement,
  kind
) {

  const semanticElement =
    diElement?.bpmnElement ||
    null


  if (
    semanticElement?.name
  ) {

    return semanticElement.name
  }


  if (
    semanticElement?.id
  ) {

    return semanticElement.id
  }


  if (
    diElement?.id
  ) {

    return diElement.id
  }


  return kind ===
    'edge'
      ? '(unnamed edge)'
      : '(unnamed shape)'
}


function formatSemanticReference(
  element
) {

  if (
    !element
  ) {

    return 'null'
  }


  const type =
    formatBpmnType(
      element.$type
    )


  if (
    element.name &&
    element.id
  ) {

    return `${element.name} [${element.id}] (${type})`
  }


  if (
    element.id
  ) {

    return `${element.id} (${type})`
  }


  if (
    element.name
  ) {

    return `${element.name} (${type})`
  }


  return type
}


function formatBpmnType(
  type
) {

  if (
    !type
  ) {

    return 'UNKNOWN'
  }


  return String(
    type
  )
    .replace(
      /^bpmn:/,
      ''
    )
}


function formatDiType(
  type
) {

  if (
    !type
  ) {

    return 'UNKNOWN'
  }


  return String(
    type
  )
    .replace(
      /^bpmndi:/,
      ''
    )
    .toUpperCase()
}


function formatNumber(
  value
) {

  if (
    value ===
    undefined ||
    value ===
    null
  ) {

    return 'null'
  }


  return String(
    value
  )
}


function formatValue(
  value
) {

  if (
    value ===
    undefined
  ) {

    return 'undefined'
  }


  if (
    value ===
    null
  ) {

    return 'null'
  }


  if (
    typeof value ===
    'boolean'
  ) {

    return value
      ? 'true'
      : 'false'
  }


  return String(
    value
  )
}
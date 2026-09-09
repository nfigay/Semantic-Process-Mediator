export function createBpmnModelExtract(
  definitions
) {

  const rootElements =
    Array.isArray(
      definitions?.rootElements
    )
      ? definitions.rootElements
      : []


  const processes =
    rootElements.filter(
      element =>
        element?.$type ===
        'bpmn:Process'
    )


  const collaborations =
    rootElements.filter(
      element =>
        element?.$type ===
        'bpmn:Collaboration'
    )


  const otherRootElements =
    rootElements.filter(
      element =>
        element?.$type !==
          'bpmn:Process' &&
        element?.$type !==
          'bpmn:Collaboration'
    )


  return [
    'SemArch Extract',
    'Type: BPMN Model',
    'Description: BPMN semantic model from definitions.rootElements — not the Repository Graph, UI Tree or BPMN-DI',
    '',
    '',
    ...formatSummary(
      collaborations,
      processes
    ),
    '',
    '',
    ...formatDetails(
      rootElements,
      processes,
      collaborations,
      otherRootElements
    )
  ].join('\n')
}


/*
 * ------------------------------------------------------------
 * Summary
 *
 * Human-readable contextual view.
 *
 * Collaborations are deliberately shown first.
 * A Process may therefore appear several times through
 * different Participant.processRef relations.
 *
 * This does not duplicate the semantic Process.
 * ------------------------------------------------------------
 */

function formatSummary(
  collaborations,
  processes
) {

  const lines = [

    'BPMN MODEL — SUMMARY',
    '====================',
    '',
    'COLLABORATIONS',
    '--------------',
    ''

  ]


  const sortedCollaborations =
    sortByNameAndId(
      collaborations
    )


  if (
    sortedCollaborations.length ===
    0
  ) {

    lines.push(
      '(none)'
    )

  } else {

    for (
      let collaborationIndex = 0;
      collaborationIndex <
        sortedCollaborations.length;
      collaborationIndex += 1
    ) {

      const collaboration =
        sortedCollaborations[
          collaborationIndex
        ]


      lines.push(
        formatNamedElement(
          collaboration
        )
      )


      const participants =
        sortByNameAndId(
          collaboration.participants ||
          []
        )


      if (
        participants.length ===
        0
      ) {

        lines.push(
          '└─ (no participants)'
        )

      } else {

        for (
          let participantIndex = 0;
          participantIndex <
            participants.length;
          participantIndex += 1
        ) {

          const participant =
            participants[
              participantIndex
            ]


          const isLast =
            participantIndex ===
            participants.length - 1


          const branch =
            isLast
              ? '└─'
              : '├─'


          const continuation =
            isLast
              ? '   '
              : '│  '


          lines.push(
            `${branch} ${formatNamedElement(
              participant
            )}`
          )


          if (
            participant.processRef
          ) {

            lines.push(
              `${continuation}└─ processRef → ${formatNamedElement(
                participant.processRef
              )}`
            )

          } else {

            lines.push(
              `${continuation}└─ BLACK BOX`
            )
          }
        }
      }


      if (
        collaborationIndex <
        sortedCollaborations.length - 1
      ) {

        lines.push(
          ''
        )
      }
    }
  }


  lines.push(
    '',
    '',
    'STANDALONE PROCESSES',
    '--------------------',
    ''
  )


  const referencedProcessIds =
    collectReferencedProcessIds(
      collaborations
    )


  const standaloneProcesses =
    sortByNameAndId(
      processes.filter(
        process =>
          !referencedProcessIds.has(
            process.id
          )
      )
    )


  if (
    standaloneProcesses.length ===
    0
  ) {

    lines.push(
      '(none)'

    )

  } else {

    for (
      const process
      of standaloneProcesses
    ) {

      lines.push(
        `- ${formatNamedElement(
          process
        )}`
      )
    }
  }


  return lines
}


/*
 * ------------------------------------------------------------
 * Details
 *
 * Technical semantic inventory.
 *
 * This section follows actual BPMN rootElements.
 * It does not duplicate Processes because of processRef.
 * ------------------------------------------------------------
 */

function formatDetails(
  rootElements,
  processes,
  collaborations,
  otherRootElements
) {

  const lines = [

    'BPMN MODEL — DETAILS',
    '====================',
    '',
    `Root elements: ${rootElements.length}`,
    `Processes: ${processes.length}`,
    `Collaborations: ${collaborations.length}`,
    `Other root elements: ${otherRootElements.length}`,
    '',
    '',
    'PROCESSES',
    '---------',
    ''

  ]


  const sortedProcesses =
    sortByNameAndId(
      processes
    )


  if (
    sortedProcesses.length ===
    0
  ) {

    lines.push(
      '(none)'
    )

  } else {

    for (
      let index = 0;
      index <
        sortedProcesses.length;
      index += 1
    ) {

      appendProcessDetails(
        lines,
        sortedProcesses[
          index
        ]
      )


      if (
        index <
        sortedProcesses.length - 1
      ) {

        lines.push(
          ''
        )
      }
    }
  }


  lines.push(
    '',
    '',
    'COLLABORATIONS',
    '--------------',
    ''
  )


  const sortedCollaborations =
    sortByNameAndId(
      collaborations
    )


  if (
    sortedCollaborations.length ===
    0
  ) {

    lines.push(
      '(none)'
    )

  } else {

    for (
      let index = 0;
      index <
        sortedCollaborations.length;
      index += 1
    ) {

      appendCollaborationDetails(
        lines,
        sortedCollaborations[
          index
        ]
      )


      if (
        index <
        sortedCollaborations.length - 1
      ) {

        lines.push(
          ''
        )
      }
    }
  }


  lines.push(
    '',
    '',
    'OTHER ROOT ELEMENTS',
    '-------------------',
    ''
  )


  const sortedOtherRootElements =
    sortByTypeAndId(
      otherRootElements
    )


  if (
    sortedOtherRootElements.length ===
    0
  ) {

    lines.push(
      '(none)'
    )

  } else {

    for (
      let index = 0;
      index <
        sortedOtherRootElements.length;
      index += 1
    ) {

      appendGenericRootElementDetails(
        lines,
        sortedOtherRootElements[
          index
        ]
      )


      if (
        index <
        sortedOtherRootElements.length - 1
      ) {

        lines.push(
          ''
        )
      }
    }
  }


  return lines
}


/*
 * ------------------------------------------------------------
 * Process details
 * ------------------------------------------------------------
 */

function appendProcessDetails(
  lines,
  process
) {

  lines.push(
    `[PROCESS] ${getDisplayName(
      process
    )}`
  )

  lines.push(
    `  id: ${formatValue(
      process.id
    )}`
  )

  lines.push(
    `  isExecutable: ${formatValue(
      process.isExecutable
    )}`
  )


  if (
    process.processType
  ) {

    lines.push(
      `  processType: ${formatValue(
        process.processType
      )}`
    )
  }


  appendSemArchExtensions(
    lines,
    process,
    '  '
  )


  const laneSets =
    Array.isArray(
      process.laneSets
    )
      ? process.laneSets
      : []


  lines.push(
    `  laneSets: ${laneSets.length}`
  )


  appendLaneSets(
    lines,
    laneSets
  )


  const flowElements =
    Array.isArray(
      process.flowElements
    )
      ? process.flowElements
      : []


  lines.push(
    `  flowElements: ${flowElements.length}`
  )


  if (
    flowElements.length ===
    0
  ) {

    return
  }


  for (
    const flowElement
    of flowElements
  ) {

    appendFlowElement(
      lines,
      flowElement
    )
  }
}


/*
 * ------------------------------------------------------------
 * Collaboration details
 * ------------------------------------------------------------
 */

function appendCollaborationDetails(
  lines,
  collaboration
) {

  lines.push(
    `[COLLABORATION] ${getDisplayName(
      collaboration
    )}`
  )

  lines.push(
    `  id: ${formatValue(
      collaboration.id
    )}`
  )


  appendSemArchExtensions(
    lines,
    collaboration,
    '  '
  )


  const participants =
    sortByNameAndId(
      collaboration.participants ||
      []
    )


  lines.push(
    `  participants: ${participants.length}`
  )


  for (
    const participant
    of participants
  ) {

    lines.push(
      `  [PARTICIPANT] ${getDisplayName(
        participant
      )}`
    )

    lines.push(
      `    id: ${formatValue(
        participant.id
      )}`
    )


    if (
      participant.processRef
    ) {

      lines.push(
        `    processRef: ${formatReference(
          participant.processRef
        )}`
      )

    } else {

      lines.push(
        '    processRef: null (BLACK BOX)'
      )
    }


    appendSemArchExtensions(
      lines,
      participant,
      '    '
    )
  }


  const messageFlows =
    Array.isArray(
      collaboration.messageFlows
    )
      ? collaboration.messageFlows
      : []


  lines.push(
    `  messageFlows: ${messageFlows.length}`
  )


  for (
    const messageFlow
    of messageFlows
  ) {

    lines.push(
      `  [MESSAGE FLOW] ${getDisplayName(
        messageFlow
      )}`
    )

    lines.push(
      `    id: ${formatValue(
        messageFlow.id
      )}`
    )

    lines.push(
      `    sourceRef: ${formatReference(
        messageFlow.sourceRef
      )}`
    )

    lines.push(
      `    targetRef: ${formatReference(
        messageFlow.targetRef
      )}`
    )


    if (
      messageFlow.messageRef
    ) {

      lines.push(
        `    messageRef: ${formatReference(
          messageFlow.messageRef
        )}`
      )
    }
  }
}


/*
 * ------------------------------------------------------------
 * Flow elements
 *
 * We expose the most useful semantic relations without
 * recursively dumping the entire moddle object graph.
 * ------------------------------------------------------------
 */

function appendFlowElement(
  lines,
  flowElement
) {

  lines.push(
    `    [${formatBpmnType(
      flowElement?.$type
    )}] ${getDisplayName(
      flowElement
    )}`
  )

  lines.push(
    `      id: ${formatValue(
      flowElement?.id
    )}`
  )


  if (
    flowElement?.sourceRef
  ) {

    lines.push(
      `      sourceRef: ${formatReference(
        flowElement.sourceRef
      )}`
    )
  }


  if (
    flowElement?.targetRef
  ) {

    lines.push(
      `      targetRef: ${formatReference(
        flowElement.targetRef
      )}`
    )
  }


  if (
    flowElement?.calledElement
  ) {

    lines.push(
      `      calledElement: ${formatReference(
        flowElement.calledElement
      )}`
    )
  }


  if (
    flowElement?.messageRef
  ) {

    lines.push(
      `      messageRef: ${formatReference(
        flowElement.messageRef
      )}`
    )
  }


  if (
    flowElement?.attachedToRef
  ) {

    lines.push(
      `      attachedToRef: ${formatReference(
        flowElement.attachedToRef
      )}`
    )
  }


  if (
    flowElement?.default
  ) {

    lines.push(
      `      default: ${formatReference(
        flowElement.default
      )}`
    )
  }


  appendSemArchExtensions(
    lines,
    flowElement,
    '      '
  )
}


/*
 * ------------------------------------------------------------
 * Lanes
 *
 * A Lane is deliberately shown as a Lane.
 * It is never interpreted as a Process.
 * ------------------------------------------------------------
 */

function appendLaneSets(
  lines,
  laneSets
) {

  for (
    const laneSet
    of laneSets
  ) {

    lines.push(
      `  [LANE SET] ${getDisplayName(
        laneSet
      )}`
    )

    lines.push(
      `    id: ${formatValue(
        laneSet.id
      )}`
    )


    appendLanes(
      lines,
      laneSet.lanes ||
      [],
      '    '
    )
  }
}


function appendLanes(
  lines,
  lanes,
  indent
) {

  for (
    const lane
    of lanes
  ) {

    lines.push(
      `${indent}[LANE] ${getDisplayName(
        lane
      )}`
    )

    lines.push(
      `${indent}  id: ${formatValue(
        lane.id
      )}`
    )


    const flowNodeRefs =
      Array.isArray(
        lane.flowNodeRef
      )
        ? lane.flowNodeRef
        : []


    if (
      flowNodeRefs.length >
      0
    ) {

      lines.push(
        `${indent}  flowNodeRef: ${flowNodeRefs
          .map(
            formatReference
          )
          .join(', ')}`
      )
    }


    const childLaneSet =
      lane.childLaneSet


    if (
      childLaneSet
    ) {

      lines.push(
        `${indent}  [CHILD LANE SET] ${getDisplayName(
          childLaneSet
        )}`
      )


      appendLanes(
        lines,
        childLaneSet.lanes ||
        [],
        `${indent}    `
      )
    }
  }
}


/*
 * ------------------------------------------------------------
 * Other BPMN root elements
 *
 * Messages, Signals, Errors, Relationships, etc. remain
 * visible instead of silently disappearing from the extract.
 * ------------------------------------------------------------
 */

function appendGenericRootElementDetails(
  lines,
  rootElement
) {

  lines.push(
    `[${formatBpmnType(
      rootElement?.$type
    )}] ${getDisplayName(
      rootElement
    )}`
  )

  lines.push(
    `  id: ${formatValue(
      rootElement?.id
    )}`
  )


  if (
    rootElement?.type
  ) {

    lines.push(
      `  type: ${formatValue(
        rootElement.type
      )}`
    )
  }


  if (
    rootElement?.direction
  ) {

    lines.push(
      `  direction: ${formatValue(
        rootElement.direction
      )}`
    )
  }


  appendReferenceArray(
    lines,
    'sources',
    rootElement?.sources
  )


  appendReferenceArray(
    lines,
    'targets',
    rootElement?.targets
  )


  appendSemArchExtensions(
    lines,
    rootElement,
    '  '
  )
}


function appendReferenceArray(
  lines,
  label,
  values
) {

  if (
    !Array.isArray(
      values
    ) ||
    values.length ===
      0
  ) {

    return
  }


  lines.push(
    `  ${label}: ${values
      .map(
        formatReference
      )
      .join(', ')}`
  )
}


/*
 * ------------------------------------------------------------
 * SemArch extensionElements
 *
 * These extensions are part of the BPMN XML semantic model,
 * so they legitimately belong in BPMN Model.
 *
 * We expose their scalar properties only. We do not recursively
 * dump moddle infrastructure.
 * ------------------------------------------------------------
 */

function appendSemArchExtensions(
  lines,
  businessObject,
  indent
) {

  const values =
    businessObject
      ?.extensionElements
      ?.values


  if (
    !Array.isArray(
      values
    )
  ) {

    return
  }


  const semArchValues =
    values.filter(
      value =>
        String(
          value?.$type ||
          ''
        ).startsWith(
          'semarch:'
        )
    )


  for (
    const extension
    of semArchValues
  ) {

    lines.push(
      `${indent}[${extension.$type}]`
    )


    const properties =
      Object.entries(
        extension
      )
        .filter(
          ([
            key,
            value
          ]) =>
            !key.startsWith(
              '$'
            ) &&
            key !==
              'extensionElements' &&
            isScalarValue(
              value
            )
        )
        .sort(
          (
            [ keyA ],
            [ keyB ]
          ) =>
            keyA.localeCompare(
              keyB
            )
        )


    for (
      const [
        key,
        value
      ]
      of properties
    ) {

      lines.push(
        `${indent}  ${key}: ${formatValue(
          value
        )}`
      )
    }
  }
}


/*
 * ------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------
 */

function collectReferencedProcessIds(
  collaborations
) {

  const ids =
    new Set()


  for (
    const collaboration
    of collaborations
  ) {

    for (
      const participant
      of collaboration.participants ||
      []
    ) {

      if (
        participant
          ?.processRef
          ?.id
      ) {

        ids.add(
          participant.processRef.id
        )
      }
    }
  }


  return ids
}


function formatNamedElement(
  element
) {

  const name =
    getDisplayName(
      element
    )


  if (
    element?.id
  ) {

    return `${name} [${element.id}]`
  }


  return name
}


function getDisplayName(
  element
) {

  if (
    element?.name
  ) {

    return element.name
  }


  if (
    element?.id
  ) {

    return element.id
  }


  return '(unnamed)'
}


function formatReference(
  reference
) {

  if (
    reference ===
    null ||
    reference ===
    undefined
  ) {

    return 'null'
  }


  if (
    typeof reference ===
    'string'
  ) {

    return reference
  }


  if (
    reference.id
  ) {

    if (
      reference.name
    ) {

      return `${reference.name} [${reference.id}]`
    }


    return reference.id
  }


  return String(
    reference
  )
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
    .replace(
      /([a-z0-9])([A-Z])/g,
      '$1 $2'
    )
    .toUpperCase()
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


function isScalarValue(
  value
) {

  return (
    value ===
      null ||
    typeof value ===
      'string' ||
    typeof value ===
      'number' ||
    typeof value ===
      'boolean'
  )
}


/*
 * ------------------------------------------------------------
 * Stable ordering
 * ------------------------------------------------------------
 */

function sortByNameAndId(
  elements
) {

  return [
    ...elements
  ].sort(
    (
      elementA,
      elementB
    ) => {

      const nameComparison =
        String(
          elementA?.name ||
          ''
        ).localeCompare(
          String(
            elementB?.name ||
            ''
          )
        )


      if (
        nameComparison !==
        0
      ) {

        return nameComparison
      }


      return String(
        elementA?.id ||
        ''
      ).localeCompare(
        String(
          elementB?.id ||
          ''
        )
      )
    }
  )
}


function sortByTypeAndId(
  elements
) {

  return [
    ...elements
  ].sort(
    (
      elementA,
      elementB
    ) => {

      const typeComparison =
        String(
          elementA?.$type ||
          ''
        ).localeCompare(
          String(
            elementB?.$type ||
            ''
          )
        )


      if (
        typeComparison !==
        0
      ) {

        return typeComparison
      }


      return String(
        elementA?.id ||
        ''
      ).localeCompare(
        String(
          elementB?.id ||
          ''
        )
      )
    }
  )
}
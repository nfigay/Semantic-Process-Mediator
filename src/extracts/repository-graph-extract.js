export function createRepositoryGraphExtract(
  repositoryModel
) {

  const containers =
    repositoryModel
      ?.getContainers?.() ||
    []


  const components =
    repositoryModel
      ?.getComponents?.() ||
    []


  const references =
    repositoryModel
      ?.getReferences?.() ||
    []


  return [
    'SemArch Extract',
    'Type: Repository Graph',
    'Description: SemArch repository nodes and references — not the UI Tree or BPMN model',
    '',
    '',
    ...formatContainers(
      containers
    ),
    '',
    '',
    ...formatComponents(
      components
    ),
    '',
    '',
    ...formatReferences(
      references,
      repositoryModel
    )
  ].join('\n')
}


/*
 * ------------------------------------------------------------
 * Containers
 * ------------------------------------------------------------
 */

function formatContainers(
  containers
) {

  const sorted =
    sortById(
      containers
    )


  const lines = [

    'CONTAINERS',
    '==========',
    ''

  ]


  if (
    sorted.length ===
    0
  ) {

    lines.push(
      '(none)'
    )


    return lines
  }


  for (
    const container
    of sorted
  ) {

    lines.push(
      `[COC] ${container.name || container.id}`
    )

    lines.push(
      `  repositoryId: ${container.id}`
    )


    appendMetadata(
      lines,
      container.metadata,
      '  '
    )


    lines.push(
      ''
    )
  }


  removeTrailingEmptyLine(
    lines
  )


  return lines
}


/*
 * ------------------------------------------------------------
 * Components
 * ------------------------------------------------------------
 */

function formatComponents(
  components
) {

  const sorted =
    sortComponents(
      components
    )


  const lines = [

    'COMPONENTS',
    '==========',
    ''

  ]


  if (
    sorted.length ===
    0
  ) {

    lines.push(
      '(none)'
    )


    return lines
  }


  for (
    const component
    of sorted
  ) {

    lines.push(
      `[${formatTypeLabel(
        component.type
      )}] ${component.name || component.id}`
    )


    lines.push(
      `  repositoryId: ${component.id}`
    )


    const bpmnId =
      component
        .metadata
        ?.bpmnId


    if (
      bpmnId
    ) {

      lines.push(
        `  bpmnId: ${bpmnId}`
      )
    }


    if (
      component.documentId
    ) {

      lines.push(
        `  document: ${component.documentId}`
      )
    }


    lines.push(
      `  stableGuid: ${component.stableGuid || '—'}`
    )


    appendKnownComponentMetadata(
      lines,
      component
    )


    appendExternalIds(
      lines,
      component.externalIds
    )


    appendAdditionalMetadata(
      lines,
      component.metadata,
      [
        'bpmnId',
        'hasDirectDiagram',
        'blackBox'
      ]
    )


    lines.push(
      ''
    )
  }


  removeTrailingEmptyLine(
    lines
  )


  return lines
}


/*
 * ------------------------------------------------------------
 * References
 * ------------------------------------------------------------
 */

function formatReferences(
  references,
  repositoryModel
) {

  const sorted =
    sortReferences(
      references
    )


  const lines = [

    'REFERENCES',
    '==========',
    ''

  ]


  if (
    sorted.length ===
    0
  ) {

    lines.push(
      '(none)'
    )


    return lines
  }


  for (
    const reference
    of sorted
  ) {

    const source =
      resolveRepositoryEntity(
        repositoryModel,
        reference.sourceId
      )


    const target =
      resolveRepositoryEntity(
        repositoryModel,
        reference.targetId
      )


    const resolved =
      Boolean(
        source &&
        target
      )


    lines.push(
      `[${reference.type}]${
        resolved
          ? ''
          : ' [UNRESOLVED]'
      }`
    )


    lines.push(
      `  ${getEntityDisplayName(
        source,
        reference.sourceId
      )}`
    )


    lines.push(
      `  └──> ${getEntityDisplayName(
        target,
        reference.targetId
      )}`
    )


    lines.push(
      `       ${reference.sourceId} -> ${reference.targetId}`
    )


    lines.push(
      `       referenceId: ${reference.id}`
    )


    if (
      reference.role
    ) {

      lines.push(
        `       role: ${reference.role}`
      )
    }


    if (
      !source
    ) {

      lines.push(
        '       unresolvedSource: true'
      )
    }


    if (
      !target
    ) {

      lines.push(
        '       unresolvedTarget: true'
      )
    }


    appendReferenceMetadata(
      lines,
      reference.metadata
    )


    lines.push(
      ''
    )
  }


  removeTrailingEmptyLine(
    lines
  )


  return lines
}


/*
 * ------------------------------------------------------------
 * Component metadata
 * ------------------------------------------------------------
 */

function appendKnownComponentMetadata(
  lines,
  component
) {

  const metadata =
    component.metadata ||
    {}


  if (
    Object.prototype.hasOwnProperty.call(
      metadata,
      'hasDirectDiagram'
    )
  ) {

    lines.push(
      `  directDiagram: ${
        metadata.hasDirectDiagram
          ? 'yes'
          : 'no'
      }`
    )
  }


  if (
    Object.prototype.hasOwnProperty.call(
      metadata,
      'blackBox'
    )
  ) {

    lines.push(
      `  blackBox: ${
        metadata.blackBox
          ? 'yes'
          : 'no'
      }`
    )
  }
}


function appendExternalIds(
  lines,
  externalIds
) {

  if (
    !externalIds ||
    typeof externalIds !==
      'object'
  ) {

    return
  }


  const entries =
    Object.entries(
      externalIds
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


  if (
    entries.length ===
    0
  ) {

    return
  }


  lines.push(
    '  externalIds:'
  )


  for (
    const [
      platformId,
      value
    ]
    of entries
  ) {

    lines.push(
      `    ${platformId}: ${formatValue(
        value
      )}`
    )
  }
}


function appendAdditionalMetadata(
  lines,
  metadata,
  excludedKeys
) {

  if (
    !metadata ||
    typeof metadata !==
      'object'
  ) {

    return
  }


  const entries =
    Object.entries(
      metadata
    )
      .filter(
        ([ key ]) =>
          !excludedKeys.includes(
            key
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


  if (
    entries.length ===
    0
  ) {

    return
  }


  lines.push(
    '  metadata:'
  )


  for (
    const [
      key,
      value
    ]
    of entries
  ) {

    lines.push(
      `    ${key}: ${formatValue(
        value
      )}`
    )
  }
}


/*
 * ------------------------------------------------------------
 * Container metadata
 * ------------------------------------------------------------
 */

function appendMetadata(
  lines,
  metadata,
  indent
) {

  if (
    !metadata ||
    typeof metadata !==
      'object'
  ) {

    return
  }


  const entries =
    Object.entries(
      metadata
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
    of entries
  ) {

    lines.push(
      `${indent}${key}: ${formatValue(
        value
      )}`
    )
  }
}


/*
 * ------------------------------------------------------------
 * Reference metadata
 * ------------------------------------------------------------
 */

function appendReferenceMetadata(
  lines,
  metadata
) {

  if (
    !metadata ||
    typeof metadata !==
      'object'
  ) {

    return
  }


  const entries =
    Object.entries(
      metadata
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


  if (
    entries.length ===
    0
  ) {

    return
  }


  lines.push(
    '       metadata:'
  )


  for (
    const [
      key,
      value
    ]
    of entries
  ) {

    lines.push(
      `         ${key}: ${formatValue(
        value
      )}`
    )
  }
}


/*
 * ------------------------------------------------------------
 * Repository entity resolution
 *
 * Used only to display human-readable names.
 *
 * It does not change or reinterpret the Repository Graph.
 * ------------------------------------------------------------
 */

function resolveRepositoryEntity(
  repositoryModel,
  entityId
) {

  if (
    !entityId
  ) {

    return null
  }


  return (
    repositoryModel
      ?.getContainer?.(
        entityId
      ) ||
    repositoryModel
      ?.getComponent?.(
        entityId
      ) ||
    null
  )
}


function getEntityDisplayName(
  entity,
  fallbackId
) {

  if (
    entity?.name
  ) {

    return entity.name
  }


  return `??? ${fallbackId}`
}


/*
 * ------------------------------------------------------------
 * Formatting
 * ------------------------------------------------------------
 */

function formatTypeLabel(
  type
) {

  return String(
    type ||
    'component'
  ).toUpperCase()
}


function formatValue(
  value
) {

  if (
    value ===
    null
  ) {

    return 'null'
  }


  if (
    value ===
    undefined
  ) {

    return 'undefined'
  }


  if (
    typeof value ===
    'string'
  ) {

    return value
  }


  if (
    typeof value ===
      'object'
  ) {

    try {

      return JSON.stringify(
        value
      )

    } catch {

      return String(
        value
      )
    }
  }


  return String(
    value
  )
}


/*
 * ------------------------------------------------------------
 * Stable ordering
 *
 * Deterministic extracts are easier to compare before / after
 * repository modifications.
 * ------------------------------------------------------------
 */

function sortById(
  entities
) {

  return [
    ...entities
  ].sort(
    (
      entityA,
      entityB
    ) =>
      String(
        entityA?.id ||
        ''
      ).localeCompare(
        String(
          entityB?.id ||
          ''
        )
      )
  )
}


function sortComponents(
  components
) {

  return [
    ...components
  ].sort(
    (
      componentA,
      componentB
    ) => {

      const typeComparison =
        String(
          componentA?.type ||
          ''
        ).localeCompare(
          String(
            componentB?.type ||
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
        componentA?.name ||
        componentA?.id ||
        ''
      ).localeCompare(
        String(
          componentB?.name ||
          componentB?.id ||
          ''
        )
      )
    }
  )
}


function sortReferences(
  references
) {

  return [
    ...references
  ].sort(
    (
      referenceA,
      referenceB
    ) => {

      const typeComparison =
        String(
          referenceA?.type ||
          ''
        ).localeCompare(
          String(
            referenceB?.type ||
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
        referenceA?.id ||
        ''
      ).localeCompare(
        String(
          referenceB?.id ||
          ''
        )
      )
    }
  )
}


function removeTrailingEmptyLine(
  lines
) {

  if (
    lines[
      lines.length - 1
    ] ===
    ''
  ) {

    lines.pop()
  }
}
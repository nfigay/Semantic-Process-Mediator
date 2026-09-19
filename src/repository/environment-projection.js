/*
 * BPMNSM Environment Projection
 *
 * Responsibility:
 *
 *   RepositoryModel
 *        +
 *   optional Repository descriptions
 *        +
 *   optional Environment documents
 *        +
 *   ProjectionProfile
 *        ↓
 *   semantic Environment projection
 *
 * The projection is derived runtime state.
 *
 * It does not mutate RepositoryModel and it does not represent
 * BPMN containment.
 *
 * Root categories are:
 *
 *   Repositories
 *   CoCs
 *   Collaborations
 *   Processes
 *   ArchiMate
 *
 * Placement rule for the current CoC projection profile:
 *
 *   Repository
 *     → Repositories
 *
 *   CoC
 *     → Repository when explicitly attached to one
 *     → otherwise CoCs
 *
 *   Collaboration
 *     → CoC when explicitly attached to one
 *     → otherwise Collaborations when allowed by the active profile
 *
 *   Process
 *     → Collaboration when reached through the reference path
 *       declared by the active profile
 *       and contextualization is enabled by the active profile
 *     → direct CoC membership may remain visible or be hidden
 *       according to the active profile
 *     → otherwise Processes when allowed by the active profile
 *
 *   ArchiMate document
 *     → ArchiMate while it is standalone in the Environment
 *
 * A Process may legitimately occur under several Collaborations.
 * These are contextual occurrences of the same runtime component.
 */


import {
  cocProjectionProfile
} from './projection-profiles/coc-projection-profile.js'

import {
  flatProjectionProfile
} from './projection-profiles/flat-projection-profile.js'


export function createEnvironmentProjection({
  repositoryModel,
  repositories = [],
  documents = [],
  projectionProfile =
    cocProjectionProfile
} = {}) {

  if (
    !repositoryModel
  ) {

    throw new Error(
      'Environment projection requires a repositoryModel'
    )
  }


  assertSupportedProjectionProfile(
    projectionProfile
  )


  const rootComponentTypes =
    new Set(
      projectionProfile
        .rootComponentTypes ||
      []
    )


  const contextualizeProcessesUnderCollaborations =
    projectionProfile
      .contextualizeProcessesUnderCollaborations ===
    true


  const collaborationProcessContext =
    projectionProfile
      .collaborationProcessContext ||
    {}


  const preferCollaborationContextOverDirectCocMembership =
    projectionProfile
      .preferCollaborationContextOverDirectCocMembership ===
    true


  const containers =
    repositoryModel
      .getContainers?.() ||
    []


  const components =
    repositoryModel
      .getComponents?.() ||
    []


  const references =
    repositoryModel
      .getReferences?.() ||
    []


  const environmentDocuments =
    Array.isArray(
      documents
    )
      ? documents
      : []


  const containerById =
    new Map(
      containers.map(
        container => [
          container.id,
          container
        ]
      )
    )


  const componentById =
    new Map(
      components.map(
        component => [
          component.id,
          component
        ]
      )
    )


  const outgoingReferences =
    indexReferencesBySource(
      references
    )


  /*
   * ------------------------------------------------------------
   * Repository -> CoC
   * ------------------------------------------------------------
   */

  const repositoryCocIds =
    new Set()


  const repositoryEntries =
    repositories
      .map(
        repository => {

          const cocIds =
            normalizeIds(
              repository.cocIds
            )


          const cocs =
            cocIds
              .map(
                cocId =>
                  containerById.get(
                    cocId
                  ) ||
                  null
              )
              .filter(
                Boolean
              )
              .map(
                container =>
                  buildCocEntry({
                    container,
                    repositoryModel,
                    componentById,
                    outgoingReferences,
                    contextualizeProcessesUnderCollaborations,
                    collaborationProcessContext,
                    preferCollaborationContextOverDirectCocMembership
                  })
              )


          for (
            const coc
            of cocs
          ) {

            repositoryCocIds.add(
              coc.container.id
            )
          }


          return {

            repository: {
              ...repository
            },

            cocs:
              sortEntries(
                cocs,
                entry =>
                  entry.container
              )
          }
        }
      )


  /*
   * ------------------------------------------------------------
   * CoCs without Repository
   * ------------------------------------------------------------
   */

  const rootCocs =
    containers
      .filter(
        container =>
          !repositoryCocIds.has(
            container.id
          )
      )
      .map(
        container =>
          buildCocEntry({
            container,
            repositoryModel,
            componentById,
            outgoingReferences,
            contextualizeProcessesUnderCollaborations,
            collaborationProcessContext,
            preferCollaborationContextOverDirectCocMembership
          })
      )


  /*
   * ------------------------------------------------------------
   * Components already attached to a CoC
   * ------------------------------------------------------------
   */

  const cocComponentIds =
    new Set()


  for (
    const container
    of containers
  ) {

    const children =
      repositoryModel
        .getChildren?.(
          container.id
        ) ||
      []


    for (
      const child
      of children
    ) {

      if (
        child.resolved &&
        child.component?.id
      ) {

        cocComponentIds.add(
          child.component.id
        )
      }
    }
  }


  /*
   * ------------------------------------------------------------
   * Processes contextualized by Collaborations
   * ------------------------------------------------------------
   */

  const contextualProcessIds =
    new Set()


  if (
    contextualizeProcessesUnderCollaborations
  ) {

    for (
      const component
      of components
    ) {

      if (
        component.type !==
        'collaboration'
      ) {

        continue
      }


      const processOccurrences =
        getCollaborationProcessOccurrences({
          collaboration:
            component,

          componentById,
          outgoingReferences,
          collaborationProcessContext
        })


      for (
        const occurrence
        of processOccurrences
      ) {

        if (
          occurrence.process?.id
        ) {

          contextualProcessIds.add(
            occurrence.process.id
          )
        }
      }
    }
  }


  /*
   * ------------------------------------------------------------
   * Root Collaborations
   * ------------------------------------------------------------
   */

  const rootCollaborations =
    rootComponentTypes.has(
      'collaboration'
    )
      ? components
          .filter(
            component =>
              component.type ===
                'collaboration' &&
              !cocComponentIds.has(
                component.id
              )
          )
          .map(
            collaboration =>
              buildCollaborationEntry({
                collaboration,
                componentById,
                outgoingReferences,
                contextualizeProcessesUnderCollaborations,
                collaborationProcessContext
              })
          )
      : []


  /*
   * ------------------------------------------------------------
   * Root Processes
   * ------------------------------------------------------------
   */

  const rootProcesses =
    rootComponentTypes.has(
      'process'
    )
      ? components
          .filter(
            component =>
              component.type ===
                'process' &&
              !cocComponentIds.has(
                component.id
              ) &&
              !contextualProcessIds.has(
                component.id
              )
          )
      : []


  /*
   * ------------------------------------------------------------
   * Standalone ArchiMate documents
   * ------------------------------------------------------------
   */

  const rootArchimateDocuments =
    environmentDocuments
      .filter(
        document =>
          document?.kind ===
          'archimate'
      )


  /*
   * ------------------------------------------------------------
   * Public projection
   * ------------------------------------------------------------
   */

  return {

    repositories:
      sortEntries(
        repositoryEntries,
        entry =>
          entry.repository
      ),

    cocs:
      sortEntries(
        rootCocs,
        entry =>
          entry.container
      ),

    collaborations:
      sortEntries(
        rootCollaborations,
        entry =>
          entry.collaboration
      ),

    processes:
      sortEntities(
        rootProcesses
      ),

    archimate:
      sortDocuments(
        rootArchimateDocuments
      )
  }
}


/*
 * --------------------------------------------------------------
 * Projection Profile
 * --------------------------------------------------------------
 */

function assertSupportedProjectionProfile(
  projectionProfile
) {

  const profileId =
    projectionProfile?.id ||
    'unknown'


  const supportedProfileIds =
    new Set([
      cocProjectionProfile.id,
      flatProjectionProfile.id
    ])


  if (
    !supportedProfileIds.has(
      profileId
    )
  ) {

    throw new Error(
      `Unsupported Environment projection profile: ${profileId}`
    )
  }
}


/*
 * --------------------------------------------------------------
 * CoC projection
 * --------------------------------------------------------------
 */

function buildCocEntry({
  container,
  repositoryModel,
  componentById,
  outgoingReferences,
  contextualizeProcessesUnderCollaborations,
  collaborationProcessContext,
  preferCollaborationContextOverDirectCocMembership
}) {

  const children =
    repositoryModel
      .getChildren?.(
        container.id
      ) ||
    []


  const collaborations =
    []


  const directProcesses =
    []


  const unresolved =
    []


  const contextualProcessIds =
    new Set()


  /*
   * First pass:
   *
   * build Collaborations and determine which Processes are
   * represented contextually under them.
   */

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


    if (
      child.component.type !==
      'collaboration'
    ) {

      continue
    }


    const collaboration =
      buildCollaborationEntry({

        collaboration:
          child.component,

        componentById,
        outgoingReferences,
        contextualizeProcessesUnderCollaborations,
        collaborationProcessContext
      })


    collaborations.push(
      collaboration
    )


    for (
      const occurrence
      of collaboration.processes
    ) {

      if (
        occurrence.process?.id
      ) {

        contextualProcessIds.add(
          occurrence.process.id
        )
      }
    }
  }


  /*
   * Second pass:
   *
   * Direct CoC membership remains visible unless the active
   * projection profile gives precedence to a more-specific
   * Collaboration context.
   */

  for (
    const child
    of children
  ) {

    if (
      !child.resolved ||
      !child.component
    ) {

      continue
    }


    if (
      child.component.type !==
      'process'
    ) {

      continue
    }


    if (
      preferCollaborationContextOverDirectCocMembership &&
      contextualProcessIds.has(
        child.component.id
      )
    ) {

      continue
    }


    directProcesses.push(
      child.component
    )
  }


  return {

    container,

    collaborations:
      sortEntries(
        collaborations,
        entry =>
          entry.collaboration
      ),

    processes:
      sortEntities(
        directProcesses
      ),

    unresolved:
      unresolved
        .slice()
        .sort(
          compareUnresolved
        )
  }
}


/*
 * --------------------------------------------------------------
 * Collaboration projection
 * --------------------------------------------------------------
 */

function buildCollaborationEntry({
  collaboration,
  componentById,
  outgoingReferences,
  contextualizeProcessesUnderCollaborations,
  collaborationProcessContext
}) {

  return {

    collaboration,

    processes:
      contextualizeProcessesUnderCollaborations
        ? getCollaborationProcessOccurrences({
            collaboration,
            componentById,
            outgoingReferences,
            collaborationProcessContext
          })
        : []
  }
}


/*
 * --------------------------------------------------------------
 * Collaboration -> Participant -> Process
 * --------------------------------------------------------------
 */

function getCollaborationProcessOccurrences({
  collaboration,
  componentById,
  outgoingReferences,
  collaborationProcessContext
}) {

  const participantReferenceType =
    collaborationProcessContext
      ?.participantReferenceType


  const processReferenceType =
    collaborationProcessContext
      ?.processReferenceType


  const participantReferences =
    (
      outgoingReferences.get(
        collaboration.id
      ) ||
      []
    )
      .filter(
        reference =>
          reference.type ===
          participantReferenceType
      )


  const occurrences =
    []


  for (
    const participantReference
    of participantReferences
  ) {

    const participant =
      componentById.get(
        participantReference.targetId
      ) ||
      null


    if (
      !participant
    ) {

      continue
    }


    const processReferences =
      (
        outgoingReferences.get(
          participant.id
        ) ||
        []
      )
        .filter(
          reference =>
            reference.type ===
            processReferenceType
        )


    if (
      processReferences.length ===
      0
    ) {

      occurrences.push({

        participant,

        participantReference,

        processReference:
          null,

        process:
          null,

        resolved:
          true,

        blackBox:
          true
      })


      continue
    }


    for (
      const processReference
      of processReferences
    ) {

      const process =
        componentById.get(
          processReference.targetId
        ) ||
        null


      occurrences.push({

        participant,

        participantReference,

        processReference,

        process,

        resolved:
          process !==
          null,

        blackBox:
          false
      })
    }
  }


  return occurrences.sort(
    compareProcessOccurrences
  )
}


/*
 * --------------------------------------------------------------
 * Reference indexes
 * --------------------------------------------------------------
 */

function indexReferencesBySource(
  references
) {

  const result =
    new Map()


  for (
    const reference
    of references
  ) {

    if (
      !result.has(
        reference.sourceId
      )
    ) {

      result.set(
        reference.sourceId,
        []
      )
    }


    result
      .get(
        reference.sourceId
      )
      .push(
        reference
      )
  }


  return result
}


/*
 * --------------------------------------------------------------
 * Sorting
 * --------------------------------------------------------------
 */

function sortEntities(
  entities
) {

  return entities
    .slice()
    .sort(
      compareEntities
    )
}


function sortDocuments(
  documents
) {

  return documents
    .slice()
    .sort(
      compareDocuments
    )
}


function sortEntries(
  entries,
  getEntity
) {

  return entries
    .slice()
    .sort(
      (
        left,
        right
      ) =>
        compareEntities(
          getEntity(
            left
          ),
          getEntity(
            right
          )
        )
    )
}


function compareEntities(
  left,
  right
) {

  return entityLabel(
    left
  ).localeCompare(
    entityLabel(
      right
    )
  )
}


function compareDocuments(
  left,
  right
) {

  return documentLabel(
    left
  ).localeCompare(
    documentLabel(
      right
    )
  )
}


function compareProcessOccurrences(
  left,
  right
) {

  const leftLabel =
    entityLabel(
      left.process
    ) ||
    entityLabel(
      left.participant
    )


  const rightLabel =
    entityLabel(
      right.process
    ) ||
    entityLabel(
      right.participant
    )


  return leftLabel.localeCompare(
    rightLabel
  )
}


function compareUnresolved(
  left,
  right
) {

  const leftId =
    left.reference
      ?.targetId ||
    ''


  const rightId =
    right.reference
      ?.targetId ||
    ''


  return leftId.localeCompare(
    rightId
  )
}


function entityLabel(
  entity
) {

  return (
    entity?.name ||
    entity?.id ||
    ''
  )
}


function documentLabel(
  document
) {

  return (
    document?.fileName ||
    document?.id ||
    ''
  )
}


/*
 * --------------------------------------------------------------
 * Helpers
 * --------------------------------------------------------------
 */

function normalizeIds(
  values
) {

  if (
    !Array.isArray(
      values
    )
  ) {

    return []
  }


  return values.filter(
    Boolean
  )
}
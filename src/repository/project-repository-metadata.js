/*
 * ------------------------------------------------------------
 * SemArch Repository Metadata Projection
 * ------------------------------------------------------------
 *
 * Projects repository metadata serialized in BPMN
 * Definitions.extensionElements into the runtime
 * RepositoryModel.
 *
 * Responsibilities:
 *
 * - project semarch:CoC as repository containers
 * - project semarch:Membership as repository references
 * - resolve Membership.componentRef from the serialized BPMN
 *   id to the runtime RepositoryModel component id
 *
 * BPMN components themselves are NOT created here.
 *
 * They must already have been projected by
 * registerBpmnDocument().
 *
 * Unresolved memberships are deliberately not projected yet.
 * Their identity semantics will be handled in a separate
 * experiment.
 * ------------------------------------------------------------
 */


export function projectRepositoryMetadata({
  modeler,
  repositoryModel
} = {}) {

  if (
    !modeler ||
    !repositoryModel
  ) {

    throw new Error(
      'projectRepositoryMetadata requires modeler and repositoryModel'
    )
  }


  const definitions =
    modeler.getDefinitions()


  const extensionValues =
    definitions
      ?.extensionElements
      ?.values ||
    []


  /*
   * ------------------------------------------------------------
   * Repository context
   * ------------------------------------------------------------
   */

  const repositoryContext =
    extensionValues.find(
      value =>
        value.$type ===
        'semarch:RepositoryContext'
    ) ||
    null


  /*
   * ------------------------------------------------------------
   * Centres de Compétence
   * ------------------------------------------------------------
   */

  const cocElements =
    extensionValues.filter(
      value =>
        value.$type ===
        'semarch:CoC'
    )


  const containers = []


  for (
    const coc
    of cocElements
  ) {

    if (
      !coc.id
    ) {

      continue
    }


    const existingContainer =
      repositoryModel.getContainer(
        coc.id
      )


    if (
      existingContainer
    ) {

      containers.push(
        existingContainer
      )

      continue
    }


    const container =
      repositoryModel.addContainer({
        id:
          coc.id,

        name:
          coc.name ||
          coc.id,

        metadata: {
          projection:
            'semarch-repository'
        }
      })


    containers.push(
      container
    )
  }


  /*
   * ------------------------------------------------------------
   * BPMN component lookup
   *
   * Membership.componentRef contains a serialized BPMN id.
   *
   * RepositoryModel references, however, use runtime component
   * ids.
   *
   * registerBpmnDocument() preserves the bridge in:
   *
   *   component.metadata.bpmnId
   * ------------------------------------------------------------
   */

  const componentsByBpmnId =
    new Map()


  for (
    const component
    of repositoryModel.getComponents()
  ) {

    const bpmnId =
      component.metadata?.bpmnId


    if (
      !bpmnId
    ) {

      continue
    }


    /*
     * For this first experiment, ambiguous BPMN ids are not
     * silently resolved.
     *
     * A repository serialization should provide an unambiguous
     * target for Membership.componentRef.
     */

    if (
      componentsByBpmnId.has(
        bpmnId
      )
    ) {

      componentsByBpmnId.set(
        bpmnId,
        null
      )

      continue
    }


    componentsByBpmnId.set(
      bpmnId,
      component
    )
  }


  /*
   * ------------------------------------------------------------
   * Memberships
   * ------------------------------------------------------------
   */

  const membershipElements =
    extensionValues.filter(
      value =>
        value.$type ===
        'semarch:Membership'
    )


  const references = []

  const unresolvedMemberships = []


  for (
    const membership
    of membershipElements
  ) {

    const cocRef =
      membership.cocRef

    const componentRef =
      membership.componentRef


    if (
      !cocRef ||
      !componentRef
    ) {

      unresolvedMemberships.push({
        membership,
        reason:
          'missing-reference'
      })

      continue
    }


    const container =
      repositoryModel.getContainer(
        cocRef
      )


    if (
      !container
    ) {

      unresolvedMemberships.push({
        membership,
        reason:
          'coc-not-found'
      })

      continue
    }


    const component =
      componentsByBpmnId.get(
        componentRef
      )


    if (
      component === null
    ) {

      unresolvedMemberships.push({
        membership,
        reason:
          'ambiguous-component'
      })

      continue
    }


    if (
      !component
    ) {

      unresolvedMemberships.push({
        membership,
        reason:
          'component-not-found'
      })

      continue
    }


    const referenceId =
      `repository-membership:${cocRef}:${componentRef}`


    const existingReference =
      repositoryModel.getReference(
        referenceId
      )


    if (
      existingReference
    ) {

      references.push(
        existingReference
      )

      continue
    }


    const reference =
      repositoryModel.addReference({
        id:
          referenceId,

        type:
          'contains',

        sourceId:
          container.id,

        targetId:
          component.id,

        metadata: {
          projection:
            'semarch-repository',

          cocRef,

          componentRef
        }
      })


    references.push(
      reference
    )
  }


  /*
   * ------------------------------------------------------------
   * Diagnostic result
   * ------------------------------------------------------------
   */

  return {

    repositoryContext: {
      repositoryId:
        repositoryContext?.repositoryId ||
        null,

      mode:
        repositoryContext?.mode ||
        null
    },

    containers,

    references,

    unresolvedMemberships
  }
}
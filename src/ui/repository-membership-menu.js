export function createRepositoryMembershipMenu({
  sidebar,
  repositoryModel,
  onAssignProcessToContainer,
  onUnassignProcessFromContainer
} = {}) {

  if (
    !sidebar
  ) {

    throw new Error(
      'Repository membership menu requires a sidebar'
    )
  }


  if (
    !repositoryModel
  ) {

    throw new Error(
      'Repository membership menu requires a repository model'
    )
  }


  /*
   * ------------------------------------------------------------
   * Repository context resolution
   * ------------------------------------------------------------
   */

  function resolveContext(
    node
  ) {

    if (
      !node
    ) {

      return null
    }


    switch (
      node.repositoryKind
    ) {

      case 'process-reference':

        return resolveProcessReferenceContext(
          node
        )


      case 'component':

        return resolveProcessComponentContext(
          node
        )


      default:

        return null
    }
  }


  /*
   * ------------------------------------------------------------
   * Contextual Process
   *
   * UI Tree:
   *
   * Collaboration
   *   -> Participant
   *      -> Process
   *
   * Repository Graph:
   *
   * CoC
   *   --contains--> Collaboration
   *   --participant--> Participant
   *   --processRef--> Process
   * ------------------------------------------------------------
   */

  function resolveProcessReferenceContext(
    node
  ) {

    const processReference =
      repositoryModel.getReference(
        node.repositoryId
      )


    if (
      !processReference ||
      processReference.type !==
        'processRef'
    ) {

      return null
    }


    const process =
      repositoryModel.getComponent(
        processReference.targetId
      )


    if (
      !process ||
      process.type !==
        'process'
    ) {

      return null
    }


    const participantId =
      processReference.sourceId


    const participantReferences =
      repositoryModel
        .getIncomingReferences(
          participantId
        )
        .filter(
          reference =>
            reference.type ===
            'participant'
        )


    const containerIds =
      new Set()


    for (
      const participantReference
      of participantReferences
    ) {

      const collaborationId =
        participantReference.sourceId


      const containerReferences =
        repositoryModel
          .getIncomingReferences(
            collaborationId
          )
          .filter(
            reference =>
              reference.type ===
              'contains' &&
              repositoryModel.getContainer(
                reference.sourceId
              )
          )


      for (
        const containerReference
        of containerReferences
      ) {

        containerIds.add(
          containerReference.sourceId
        )
      }
    }


    /*
     * For this first UI action we require
     * one unambiguous CoC context.
     *
     * If a contextual Process can be reached
     * from several CoCs, SemArch must not guess.
     */
    if (
      containerIds.size !==
      1
    ) {

      return null
    }


    const [
      containerId
    ] =
      containerIds


    return {
      kind:
        'contextual-process',

      containerId,

      processId:
        process.id,

      processReferenceId:
        processReference.id
    }
  }


  /*
   * ------------------------------------------------------------
   * Process component membership
   * ------------------------------------------------------------
   */

  function resolveProcessComponentContext(
    node
  ) {

    const process =
      repositoryModel.getComponent(
        node.repositoryId
      )


    if (
      !process ||
      process.type !==
        'process'
    ) {

      return null
    }


    const memberships =
      repositoryModel
        .getIncomingReferences(
          process.id
        )
        .filter(
          reference =>
            reference.type ===
              'contains' &&
            repositoryModel.getContainer(
              reference.sourceId
            )
        )


    /*
     * The current Repository Browser has one
     * component node ID per Process.
     *
     * Until multi-CoC occurrences are made
     * explicit in the tree, do not guess when
     * several CoCs contain the same Process.
     */
    if (
      memberships.length !==
      1
    ) {

      return null
    }


    const membership =
      memberships[0]


    return {
      kind:
        'process-membership',

      containerId:
        membership.sourceId,

      processId:
        process.id,

      membershipReference:
        membership
    }
  }


  /*
   * ------------------------------------------------------------
   * Context menu projection
   * ------------------------------------------------------------
   */

  function buildMenu(
    context
  ) {

    if (
      !context
    ) {

      return []
    }


    if (
      context.kind ===
      'contextual-process'
    ) {

      const existingMembership =
        findMembership(
          context.containerId,
          context.processId
        )


      if (
        existingMembership
      ) {

        return []
      }


      return [
        {
          id:
            'add-process-to-coc',

          text:
            'Add Process to CoC'
        }
      ]
    }


    if (
      context.kind ===
        'process-membership' &&
      context.membershipReference
        ?.metadata
        ?.origin ===
        'semarch-manual'
    ) {

      return [
        {
          id:
            'remove-process-from-coc',

          text:
            'Remove Process from CoC'
        }
      ]
    }


    return []
  }


  function findMembership(
    containerId,
    processId
  ) {

    return (
      repositoryModel
        .getOutgoingReferences(
          containerId
        )
        .find(
          reference =>
            reference.type ===
              'contains' &&
            reference.targetId ===
              processId
        ) ||
      null
    )
  }


  /*
   * ------------------------------------------------------------
   * w2ui events
   * ------------------------------------------------------------
   */

  let activeContext =
    null


  function handleContextMenu(
    event
  ) {

    const node =
      sidebar.get(
        event.target
      )


    activeContext =
      resolveContext(
        node
      )


    sidebar.menu =
      buildMenu(
        activeContext
      )


    if (
      sidebar.menu.length ===
      0
    ) {

      event.preventDefault?.()
    }
  }


  function handleMenuClick(
    event
  ) {

    if (
      !activeContext
    ) {

      return
    }


    const menuItemId =
      resolveMenuItemId(
        event
      )


    switch (
      menuItemId
    ) {

      case 'add-process-to-coc':

        onAssignProcessToContainer?.({
          containerId:
            activeContext.containerId,

          processId:
            activeContext.processId
        })

        break


      case 'remove-process-from-coc':

        onUnassignProcessFromContainer?.({
          containerId:
            activeContext.containerId,

          processId:
            activeContext.processId
        })

        break


      default:

        break
    }
  }


  function resolveMenuItemId(
    event
  ) {

    const directId =
      event?.detail
        ?.menuItem
        ?.id ||
      event?.detail
        ?.item
        ?.id ||
      event?.detail
        ?.subItem
        ?.id ||
      null


    if (
      directId
    ) {

      return directId
    }


    const menuIndex =
      event?.detail
        ?.menuIndex ??
      event?.detail
        ?.index ??
      null


    if (
      Number.isInteger(
        menuIndex
      )
    ) {

      return (
        sidebar.menu
          ?.[menuIndex]
          ?.id ||
        null
      )
    }


    return null
  }


  /*
   * ------------------------------------------------------------
   * Registration
   * ------------------------------------------------------------
   */

  sidebar.on(
    'contextMenu',
    handleContextMenu
  )


  sidebar.on(
    'menuClick',
    handleMenuClick
  )


  /*
   * ------------------------------------------------------------
   * Public API
   * ------------------------------------------------------------
   */

  return {

    resolveContext,

    destroy() {

      sidebar.off(
        'contextMenu',
        handleContextMenu
      )


      sidebar.off(
        'menuClick',
        handleMenuClick
      )


      sidebar.menu =
        []


      activeContext =
        null
    }
  }
}
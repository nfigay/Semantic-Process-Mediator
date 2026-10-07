export function createRepositoryMembershipMenu({
  sidebar,
  repositoryModel,
  activeRepository,
  onAssignProcessToContainer,
  onUnassignProcessFromContainer,
  getAssignableContainers =
    () => [],
  getAdditionalMenuItems =
    () => [],
  onAdditionalMenuClick =
    () => false
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

  function resolveRepositoryModel() {

    return (
      activeRepository
        ?.get
        ?.()
        ?.model ||
      repositoryModel
    )
  }


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

    const currentRepositoryModel =
      resolveRepositoryModel()


    const processReference =
      currentRepositoryModel.getReference(
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
      currentRepositoryModel.getComponent(
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
      currentRepositoryModel
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
        currentRepositoryModel
          .getIncomingReferences(
            collaborationId
          )
          .filter(
            reference =>
              reference.type ===
              'contains' &&
              currentRepositoryModel.getContainer(
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

    const currentRepositoryModel =
      resolveRepositoryModel()


    const process =
      currentRepositoryModel.getComponent(
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
      currentRepositoryModel
        .getIncomingReferences(
          process.id
        )
        .filter(
          reference =>
            reference.type ===
              'contains' &&
            currentRepositoryModel.getContainer(
              reference.sourceId
            )
        )


    return {
      kind:
        'process-component',

      processId:
        process.id,

      memberships
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
      'process-component'
    ) {

      const memberships =
        context.memberships || []

      const existingContainerIds =
        new Set(
          memberships.map(
            membership =>
              membership.sourceId
          )
        )

      return [
        ...(getAssignableContainers() || [])
          .filter(
            container =>
              container?.id &&
              !existingContainerIds.has(
                container.id
              )
          )
          .map(
            container => ({
              id:
                `assign-process-to-coc:${container.id}`,

              text:
                `Assign to CoC: ${container.name || container.id}`
            })
          ),

        ...memberships
          .filter(
            membership =>
              membership.metadata?.origin ===
                'semarch-manual'
          )
          .map(
            membership => ({
              id:
                `remove-process-from-coc:${membership.sourceId}`,

              text:
                `Remove from CoC: ${
                  resolveRepositoryModel()
                    .getContainer(
                      membership.sourceId
                    )?.name ||
                  membership.sourceId
                }`
            })
          )
      ]
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


    sidebar.menu = [
      ...buildMenu(
        activeContext
      ),
      ...(
        getAdditionalMenuItems(
          event.target
        ) || []
      )
    ]


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
      onAdditionalMenuClick(
        event
      )
    ) {

      return
    }


    if (
      !activeContext
    ) {

      return
    }


    const menuItemId =
      resolveMenuItemId(
        event
      )


    if (
      activeContext.kind ===
        'process-component' &&
      menuItemId?.startsWith(
        'assign-process-to-coc:'
      )
    ) {

      onAssignProcessToContainer?.({
        containerId:
          menuItemId.slice(
            'assign-process-to-coc:'.length
          ),
        processId:
          activeContext.processId
      })

      return
    }


    if (
      activeContext.kind ===
        'process-component' &&
      menuItemId?.startsWith(
        'remove-process-from-coc:'
      )
    ) {

      onUnassignProcessFromContainer?.({
        containerId:
          menuItemId.slice(
            'remove-process-from-coc:'.length
          ),
        processId:
          activeContext.processId
      })

      return
    }


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
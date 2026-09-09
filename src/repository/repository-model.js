export function createRepositoryModel() {

  const containers =
    new Map()


  const components =
    new Map()


  const references =
    new Map()


  function addContainer(
    container
  ) {

    validateEntity(
      container,
      'Repository container'
    )


    if (
      containers.has(
        container.id
      )
    ) {

      throw new Error(
        `Repository container already exists: ${container.id}`
      )
    }


    const storedContainer = {

      id:
        container.id,

      type:
        'coc',

      name:
        container.name ||
        container.id,

      metadata: {
        ...(
          container.metadata ||
          {}
        )
      }

    }


    containers.set(
      storedContainer.id,
      storedContainer
    )


    return storedContainer
  }


  function addComponent(
    component
  ) {

    validateEntity(
      component,
      'Repository component'
    )


    if (
      components.has(
        component.id
      )
    ) {

      throw new Error(
        `Repository component already exists: ${component.id}`
      )
    }


    const storedComponent = {

      id:
        component.id,

      type:
        component.type ||
        'process',

      name:
        component.name ||
        component.id,

      documentId:
        component.documentId ||
        null,

      stableGuid:
        component.stableGuid ||
        null,

      externalIds:
        cloneExternalIds(
          component.externalIds
        ),

      metadata: {
        ...(
          component.metadata ||
          {}
        )
      }

    }


    components.set(
      storedComponent.id,
      storedComponent
    )


    return storedComponent
  }


  function addReference(
    reference
  ) {

    validateEntity(
      reference,
      'Repository reference'
    )


    if (
      references.has(
        reference.id
      )
    ) {

      throw new Error(
        `Repository reference already exists: ${reference.id}`
      )
    }


    if (
      !reference.sourceId
    ) {

      throw new Error(
        'Repository reference requires a sourceId'
      )
    }


    if (
      !reference.targetId
    ) {

      throw new Error(
        'Repository reference requires a targetId'
      )
    }


    const storedReference = {

      id:
        reference.id,

      type:
        reference.type ||
        'contains',

      sourceId:
        reference.sourceId,

      targetId:
        reference.targetId,

      role:
        reference.role ||
        null,

      metadata: {
        ...(
          reference.metadata ||
          {}
        )
      }

    }


    references.set(
      storedReference.id,
      storedReference
    )


    return storedReference
  }


  function getContainer(
    containerId
  ) {

    return (
      containers.get(
        containerId
      ) ||
      null
    )
  }


  function getComponent(
    componentId
  ) {

    return (
      components.get(
        componentId
      ) ||
      null
    )
  }


  function getReference(
    referenceId
  ) {

    return (
      references.get(
        referenceId
      ) ||
      null
    )
  }


  function getContainers() {

    return Array.from(
      containers.values()
    )
  }


  function getComponents() {

    return Array.from(
      components.values()
    )
  }


  function getReferences() {

    return Array.from(
      references.values()
    )
  }


  function getChildren(
    containerId
  ) {

    return getOutgoingReferences(
      containerId
    )
      .map(
        reference => {

          const component =
            getComponent(
              reference.targetId
            )


          return {

            reference,

            component,

            resolved:
              component !==
              null

          }
        }
      )
  }


  function getOutgoingReferences(
    sourceId
  ) {

    return getReferences()
      .filter(
        reference =>
          reference.sourceId ===
          sourceId
      )
  }


  function getIncomingReferences(
    targetId
  ) {

    return getReferences()
      .filter(
        reference =>
          reference.targetId ===
          targetId
      )
  }


  /*
   * ------------------------------------------------------------
   * Remove reference
   * ------------------------------------------------------------
   */

  function removeReference(
    referenceId
  ) {

    return references.delete(
      referenceId
    )
  }


  /*
   * ------------------------------------------------------------
   * Remove component
   *
   * References are deliberately preserved.
   *
   * A repository reference is an independent object and may
   * legitimately become unresolved when one of its endpoints
   * is absent from the current repository projection.
   *
   * Projection-specific cleanup belongs to the code managing
   * that projection, not to the generic RepositoryModel.
   * ------------------------------------------------------------
   */

  function removeComponent(
    componentId
  ) {

    return components.delete(
      componentId
    )
  }


  function clear() {

    containers.clear()

    components.clear()

    references.clear()
  }


  function validateEntity(
    entity,
    label
  ) {

    if (
      !entity ||
      !entity.id
    ) {

      throw new Error(
        `${label} requires an id`
      )
    }
  }


  function cloneExternalIds(
    externalIds
  ) {

    if (
      !externalIds ||
      typeof externalIds !==
        'object'
    ) {

      return {}
    }


    return Object.fromEntries(
      Object.entries(
        externalIds
      )
        .map(
          ([
            platformId,
            value
          ]) => {

            if (
              value &&
              typeof value ===
                'object' &&
              !Array.isArray(
                value
              )
            ) {

              return [
                platformId,
                {
                  ...value
                }
              ]
            }


            return [
              platformId,
              value
            ]
          }
        )
    )
  }


  return {

    addContainer,

    addComponent,

    addReference,

    getContainer,

    getComponent,

    getReference,

    getContainers,

    getComponents,

    getReferences,

    getChildren,

    getOutgoingReferences,

    getIncomingReferences,

    removeComponent,

    removeReference,

    clear

  }
}
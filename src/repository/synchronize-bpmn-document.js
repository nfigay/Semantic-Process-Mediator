import {
  registerBpmnDocument
} from './register-bpmn-document.js'


export function synchronizeBpmnDocument({
  modeler,
  repositoryModel,
  repositoryDocument,
  containerId
} = {}) {

  if (
    !modeler ||
    !repositoryModel ||
    !repositoryDocument
  ) {

    throw new Error(
      'synchronizeBpmnDocument requires modeler, repositoryModel and repositoryDocument'
    )
  }


  /*
   * ------------------------------------------------------------
   * Identify the current runtime projection of this BPMN
   * document.
   * ------------------------------------------------------------
   */

  const componentIds =
    repositoryModel
      .getComponents()
      .filter(
        component =>
          component.documentId ===
          repositoryDocument.id
      )
      .map(
        component =>
          component.id
      )


  /*
   * ------------------------------------------------------------
   * Remove references owned by this BPMN projection.
   *
   * Reference semantics are deliberately irrelevant here.
   *
   * Ownership is explicitly described by metadata:
   *
   *   projection = bpmn
   *   documentId = <repository document id>
   *
   * Repository references that do not belong to this
   * projection are preserved, even when they become unresolved.
   * ------------------------------------------------------------
   */

  const projectionReferenceIds =
    repositoryModel
      .getReferences()
      .filter(
        reference =>
          reference.metadata?.projection ===
            'bpmn' &&
          reference.metadata?.documentId ===
            repositoryDocument.id
      )
      .map(
        reference =>
          reference.id
      )


  for (
    const referenceId
    of projectionReferenceIds
  ) {

    repositoryModel.removeReference(
      referenceId
    )
  }


  /*
   * ------------------------------------------------------------
   * Remove the previous runtime components.
   *
   * RepositoryModel.removeComponent() deliberately preserves
   * references.
   * ------------------------------------------------------------
   */

  for (
    const componentId
    of componentIds
  ) {

    repositoryModel.removeComponent(
      componentId
    )
  }


  /*
   * ------------------------------------------------------------
   * Rebuild the runtime projection from the BPMN semantic model
   * currently loaded in bpmn-js.
   * ------------------------------------------------------------
   */

  return registerBpmnDocument({

    modeler,

    repositoryModel,

    repositoryDocument,

    containerId
  })
}
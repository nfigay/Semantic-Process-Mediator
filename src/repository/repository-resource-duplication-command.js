import {
  duplicateAndProjectRepositoryResource
} from './repository-resource-duplication-projection.js'

import {
  copyRepositoryResourceToFolder
} from './repository-resource-physical-copy.js'


export function createRepositoryResourceDuplicationCommand({
  repositoryScopeStore,
  activeRepository,
  createDocumentId,
  diagramActions,
  modeler,
  renderRepositoryBrowser = () => {}
} = {}) {

  return async function duplicateActiveRepositoryResource({
    sourceDocumentId,
    targetRepositoryId
  } = {}) {

    const sourceRepository =
      activeRepository?.get?.()

    if (!sourceRepository) {
      throw new Error(
        'Resource duplication requires an active source'
      )
    }

    const targetRepository =
      repositoryScopeStore
        ?.getRepository?.(
          targetRepositoryId
        )

    if (!targetRepository) {
      throw new Error(
        `Resource duplication target does not exist: ${targetRepositoryId}`
      )
    }

    if (
      targetRepository.id ===
        sourceRepository.id
    ) {
      throw new Error(
        'Resource duplication requires distinct source and target Sources'
      )
    }

    if (
      targetRepository.workspace
        ?.mode === 'memory'
    ) {
      throw new Error(
        'Resource duplication target must be a user Source'
      )
    }

    const sourceDocument =
      sourceRepository.documents
        .getDocument(sourceDocumentId)

    if (!sourceDocument) {
      throw new Error(
        `Repository source document not found: ${sourceDocumentId}`
      )
    }

    const logicalConflict =
      targetRepository.documents
        .getDocuments()
        .find(
          document =>
            document.fileName ===
            sourceDocument.fileName
        ) ||
      null

    if (logicalConflict) {
      return {
        status: 'conflict',
        path: sourceDocument.fileName,
        sourceDocument,
        targetDocument: logicalConflict,
        projectedBpmnDocuments: [],
        projectedBpmnComponents: []
      }
    }

    const physicalCopy =
      await copyRepositoryResourceToFolder({
        targetRepository,
        repositoryPath:
          sourceDocument.fileName,
        content:
          sourceDocument.content
      })

    if (
      physicalCopy.status ===
        'conflict'
    ) {
      return {
        status: 'conflict',
        path: sourceDocument.fileName,
        sourceDocument,
        targetDocument: null,
        targetFileHandle:
          physicalCopy.fileHandle,
        projectedBpmnDocuments: [],
        projectedBpmnComponents: []
      }
    }

    const result =
      await duplicateAndProjectRepositoryResource({
        sourceRepository,
        targetRepository,
        sourceDocumentId,
        createDocumentId,
        diagramActions,
        modeler
      })

    if (
      result.status ===
        'copied'
    ) {
      targetRepository.workspace
        .fileHandles.set(
          result.targetDocument.id,
          physicalCopy.fileHandle
        )

      const inventory =
        targetRepository.workspace.resourceInventory ||
        (targetRepository.workspace.resourceInventory = [])

      if (!inventory.some(resource => resource.path === sourceDocument.fileName)) {
        inventory.push({ path: sourceDocument.fileName })
      }

      renderRepositoryBrowser()
    }

    return {
      ...result,
      targetFileHandle:
        physicalCopy.fileHandle
    }
  }
}

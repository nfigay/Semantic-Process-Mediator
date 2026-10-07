import {
  materializeRepositoryResources
} from './repository-resource-materializer.js'


export function duplicateRepositoryResource({
  sourceRepository,
  targetRepository,
  sourceDocumentId,
  createDocumentId
} = {}) {

  requireRepository(
    sourceRepository,
    'source'
  )

  requireRepository(
    targetRepository,
    'target'
  )


  if (
    sourceRepository ===
      targetRepository ||
    sourceRepository.id ===
      targetRepository.id
  ) {

    throw new Error(
      'Repository resource duplication requires distinct source and target repositories'
    )
  }


  if (
    typeof sourceDocumentId !==
      'string' ||
    sourceDocumentId.length ===
      0
  ) {

    throw new Error(
      'Repository resource duplication requires sourceDocumentId'
    )
  }


  const sourceDocument =
    sourceRepository.documents
      .getDocument(
        sourceDocumentId
      )


  if (
    !sourceDocument
  ) {

    throw new Error(
      `Repository source document not found: ${sourceDocumentId}`
    )
  }


  const conflictingDocument =
    targetRepository.documents
      .getDocuments()
      .find(
        document =>
          document.fileName ===
          sourceDocument.fileName
      ) ||
    null


  if (
    conflictingDocument
  ) {

    return {
      status:
        'conflict',
      path:
        sourceDocument.fileName,
      sourceDocument,
      targetDocument:
        conflictingDocument
    }
  }


  const [targetDocument] =
    materializeRepositoryResources({
      resources: [{
        path:
          sourceDocument.fileName,
        content:
          sourceDocument.content
      }],
      repositoryDocumentStore:
        targetRepository.documents,
      createDocumentId
    })


  if (
    !targetDocument
  ) {

    throw new Error(
      `Repository resource cannot be materialized: ${sourceDocument.fileName}`
    )
  }


  return {
    status:
      'copied',
    path:
      sourceDocument.fileName,
    sourceDocument,
    targetDocument
  }
}


function requireRepository(
  repository,
  role
) {

  if (
    !repository ||
    !repository.documents ||
    typeof repository.documents.getDocument !==
      'function' ||
    typeof repository.documents.getDocuments !==
      'function' ||
    typeof repository.documents.addDocument !==
      'function'
  ) {

    throw new Error(
      `Repository resource duplication requires ${role} repository`
    )
  }
}

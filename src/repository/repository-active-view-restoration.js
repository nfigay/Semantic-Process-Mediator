export async function restoreRepositoryActiveView({
  repository,
  diagramActions,
  showArchimate
} = {}) {

  const documents =
    repository
      ?.documents ||
    null


  if (
    !documents ||
    typeof documents.getActiveDocument !==
      'function'
  ) {

    return null
  }


  const repositoryDocument =
    documents.getActiveDocument()


  if (
    !repositoryDocument
  ) {

    return null
  }


  if (
    repositoryDocument.kind ===
      'archimate'
  ) {

    if (
      typeof showArchimate !==
        'function'
    ) {

      throw new Error(
        'restoreRepositoryActiveView requires showArchimate for an ArchiMate document'
      )
    }


    await showArchimate({
      xml:
        repositoryDocument.content,

      documentId:
        repositoryDocument.id
    })


    return {
      kind:
        'archimate',

      documentId:
        repositoryDocument.id
    }
  }


  if (
    repositoryDocument.kind ===
      'bpmn'
  ) {

    if (
      typeof diagramActions?.loadDiagram !==
        'function'
    ) {

      throw new Error(
        'restoreRepositoryActiveView requires diagramActions.loadDiagram for a BPMN document'
      )
    }


    await diagramActions.loadDiagram(
      repositoryDocument.content
    )


    return {
      kind:
        'bpmn',

      documentId:
        repositoryDocument.id
    }
  }


  return null
}

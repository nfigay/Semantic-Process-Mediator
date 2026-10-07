export function createArchimateDocumentPersistence({
  repositoryDocumentStore,
  activeRepository
} = {}) {

  if (
    !activeRepository &&
    !repositoryDocumentStore
  ) {

    throw new Error(
      'createArchimateDocumentPersistence requires activeRepository or repositoryDocumentStore'
    )
  }


  function resolveRepositoryState() {

    const repository =
      activeRepository
        ?.get?.() ||
      null


    return {
      repository,

      repositoryDocumentStore:
        repository?.documents ||
        repositoryDocumentStore ||
        null
    }
  }


  async function persist({
    adapter,
    documentId
  } = {}) {

    if (
      !adapter ||
      typeof adapter.saveXML !==
        'function' ||
      !documentId
    ) {

      return null
    }


    const {
      repository:
        repositoryAtSaveStart,

      repositoryDocumentStore:
        activeRepositoryDocumentStore
    } =
      resolveRepositoryState()


    if (
      !activeRepositoryDocumentStore
    ) {

      return null
    }


    const repositoryDocument =
      activeRepositoryDocumentStore
        .getDocument(
          documentId
        )


    if (
      !repositoryDocument
    ) {

      return null
    }


    try {

      const result =
        await adapter.saveXML({
          format:
            true
        })


      if (
        activeRepository &&
        activeRepository.get() !==
          repositoryAtSaveStart
      ) {

        return null
      }


      const currentRepositoryDocument =
        activeRepositoryDocumentStore
          .getDocument(
            documentId
          )


      if (
        !currentRepositoryDocument
      ) {

        return null
      }


      return activeRepositoryDocumentStore
        .updateDocument(
          documentId,
          {
            content:
              result.xml,

            dirty:
              true
          }
        )

    } catch (
      error
    ) {

      console.error(
        'Unable to persist edited ArchiMate document:',
        error
      )


      return null
    }
  }


  return {
    persist
  }
}

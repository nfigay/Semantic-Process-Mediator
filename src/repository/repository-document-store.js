export function createRepositoryDocumentStore() {

  const documents =
    new Map()


  let activeDocumentId =
    null


  function addDocument(
    document
  ) {

    if (
      !document ||
      !document.id
    ) {

      throw new Error(
        'Repository document requires an id'
      )
    }


    if (
      documents.has(
        document.id
      )
    ) {

      throw new Error(
        `Repository document already exists: ${document.id}`
      )
    }


    const storedDocument = {

      id:
        document.id,

      fileName:
        document.fileName ||
        `${document.id}.bpmn`,

      kind:
        document.kind ||
        'process',

      xml:
        document.xml ||
        '',

      dirty:
        document.dirty ===
        true

    }


    documents.set(
      storedDocument.id,
      storedDocument
    )


    return storedDocument
  }


  function getDocument(
    documentId
  ) {

    return (
      documents.get(
        documentId
      ) ||
      null
    )
  }


  function getDocuments() {

    return Array.from(
      documents.values()
    )
  }


  function updateDocument(
    documentId,
    changes = {}
  ) {

    const document =
      getDocument(
        documentId
      )


    if (
      !document
    ) {

      throw new Error(
        `Repository document not found: ${documentId}`
      )
    }


    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        'fileName'
      )
    ) {

      document.fileName =
        changes.fileName
    }


    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        'kind'
      )
    ) {

      document.kind =
        changes.kind
    }


    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        'xml'
      )
    ) {

      document.xml =
        changes.xml
    }


    if (
      Object.prototype.hasOwnProperty.call(
        changes,
        'dirty'
      )
    ) {

      document.dirty =
        changes.dirty ===
        true
    }


    return document
  }


  function setActiveDocument(
    documentId
  ) {

    if (
      documentId ===
      null
    ) {

      activeDocumentId =
        null

      return null
    }


    if (
      !documents.has(
        documentId
      )
    ) {

      throw new Error(
        `Repository document not found: ${documentId}`
      )
    }


    activeDocumentId =
      documentId


    return getActiveDocument()
  }


  function getActiveDocument() {

    if (
      !activeDocumentId
    ) {

      return null
    }


    return getDocument(
      activeDocumentId
    )
  }


  function removeDocument(
    documentId
  ) {

    const document =
      getDocument(
        documentId
      )


    if (
      !document
    ) {

      return null
    }


    documents.delete(
      documentId
    )


    if (
      activeDocumentId ===
      documentId
    ) {

      activeDocumentId =
        null
    }


    return document
  }


  function clear() {

    documents.clear()


    activeDocumentId =
      null
  }


  return {

    addDocument,

    getDocument,

    getDocuments,

    updateDocument,

    setActiveDocument,

    getActiveDocument,

    removeDocument,

    clear

  }
}
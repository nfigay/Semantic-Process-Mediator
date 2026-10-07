import {
  registerBpmnDocument
} from '../../repository/register-bpmn-document.js'

import {
  prepareSparxEaBpmnImport
} from './preprocessing/prepare-import.js'


function resolveRepositoryBpmnFileName(
  fileName
) {

  if (
    typeof fileName !==
      'string' ||
    !fileName.trim()
  ) {

    return fileName
  }


  const normalizedFileName =
    fileName.trim()


  if (
    /\.xml$/i.test(
      normalizedFileName
    )
  ) {

    return normalizedFileName.replace(
      /\.xml$/i,
      '.bpmn'
    )
  }


  return normalizedFileName
}


export async function importSparxEaBpmn({
  bpmnXml,
  xmiXml,
  fileName,
  repository,
  diagramActions,
  modeler,
  repositoryBrowser,
  documentId,
  nativeNotePolicy = {}
} = {}) {

  if (
    !repository ||
    !diagramActions ||
    !modeler ||
    !repositoryBrowser
  ) {

    throw new Error(
      'importSparxEaBpmn requires repository, diagramActions, modeler and repositoryBrowser'
    )
  }


  if (
    !documentId
  ) {

    throw new Error(
      'importSparxEaBpmn requires documentId'
    )
  }


  const prepared =
    prepareSparxEaBpmnImport({
      bpmnXml,
      xmiXml,
      nativeNotePolicy
    })


  if (prepared.publicationPolicyRequired.nativeNotes.length > 0) {
    return {
      prepared,
      requiresPublicationPolicy: true,
      repositoryDocument: null,
      components: []
    }
  }


  const repositoryDocument =
    repository.documents
      .addDocument({

        id:
          documentId,

        fileName:
          resolveRepositoryBpmnFileName(
            fileName
          ),

        kind:
          'bpmn',

        content:
          prepared.normalizedBpmnXml,

        dirty:
          repository.workspace.mode !==
            'memory'
      })


  await diagramActions.loadDiagram(
    prepared.normalizedBpmnXml
  )


  const components =
    registerBpmnDocument({

      modeler,

      repositoryModel:
        repository.model,

      repositoryDocument
    })


  repositoryBrowser.render()


  return {
    prepared,
    requiresPublicationPolicy: false,
    repositoryDocument,
    components
  }
}

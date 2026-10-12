import { registerBpmnDocument } from '../../repository/register-bpmn-document.js'
export async function importSparxEaXmi({ bpmnXml, fileName, documentId, repository, diagramActions, modeler, repositoryBrowser }) {
  if (!bpmnXml || !documentId || !repository || !diagramActions || !modeler || !repositoryBrowser) throw new Error('Missing EA import inputs')
  const normalizedName = (fileName || 'EA-import.xmi').replace(/\.(xmi|xml)$/i, '.bpmn')
  // Validate modeler compatibility before adding the document to the repository.
  await diagramActions.loadDiagram(bpmnXml)
  const repositoryDocument = repository.documents.addDocument({ id: documentId, fileName: normalizedName, kind: 'bpmn', content: bpmnXml, dirty: repository.workspace.mode !== 'memory' })
  const components = registerBpmnDocument({ modeler, repositoryModel: repository.model, repositoryDocument })
  repositoryBrowser.render()
  return { repositoryDocument, components }
}

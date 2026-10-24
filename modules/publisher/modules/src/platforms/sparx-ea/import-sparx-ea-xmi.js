import { registerBpmnDocument } from "../../repository/register-bpmn-document.js";
//#region src/platforms/sparx-ea/import-sparx-ea-xmi.js
async function importSparxEaXmi({ bpmnXml, fileName, documentId, repository, diagramActions, modeler, repositoryBrowser }) {
	if (!bpmnXml || !documentId || !repository || !diagramActions || !modeler || !repositoryBrowser) throw new Error("Missing EA import inputs");
	const normalizedName = (fileName || "EA-import.xmi").replace(/\.(xmi|xml)$/i, ".bpmn");
	const previous = repository.documents.getActiveDocument();
	repository.documents.setActiveDocument(null);
	try {
		await diagramActions.loadDiagram(bpmnXml);
	} catch (error) {
		repository.documents.setActiveDocument(previous?.id ?? null);
		throw error;
	}
	const repositoryDocument = repository.documents.addDocument({
		id: documentId,
		fileName: normalizedName,
		kind: "bpmn",
		content: bpmnXml,
		dirty: repository.workspace.mode !== "memory"
	});
	repository.documents.setActiveDocument(repositoryDocument.id);
	const components = registerBpmnDocument({
		modeler,
		repositoryModel: repository.model,
		repositoryDocument
	});
	repositoryBrowser.render();
	return {
		repositoryDocument,
		components
	};
}
//#endregion
export { importSparxEaXmi };

//# sourceMappingURL=import-sparx-ea-xmi.js.map
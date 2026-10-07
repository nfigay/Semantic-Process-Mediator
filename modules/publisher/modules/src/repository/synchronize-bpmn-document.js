import { registerBpmnDocument } from "./register-bpmn-document.js";
//#region src/repository/synchronize-bpmn-document.js
function synchronizeBpmnDocument({ modeler, repositoryModel, repositoryDocument, containerId } = {}) {
	if (!modeler || !repositoryModel || !repositoryDocument) throw new Error("synchronizeBpmnDocument requires modeler, repositoryModel and repositoryDocument");
	const componentIds = repositoryModel.getComponents().filter((component) => component.documentId === repositoryDocument.id).map((component) => component.id);
	const projectionReferenceIds = repositoryModel.getReferences().filter((reference) => reference.metadata?.projection === "bpmn" && reference.metadata?.documentId === repositoryDocument.id).map((reference) => reference.id);
	for (const referenceId of projectionReferenceIds) repositoryModel.removeReference(referenceId);
	for (const componentId of componentIds) repositoryModel.removeComponent(componentId);
	return registerBpmnDocument({
		modeler,
		repositoryModel,
		repositoryDocument,
		containerId
	});
}
//#endregion
export { synchronizeBpmnDocument };

//# sourceMappingURL=synchronize-bpmn-document.js.map
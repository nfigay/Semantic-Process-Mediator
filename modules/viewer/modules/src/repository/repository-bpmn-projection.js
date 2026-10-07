import { registerBpmnDocument } from "./register-bpmn-document.js";
import { projectBusinessObjectRepresentations } from "../extensions/business-objects.js";
//#region src/repository/repository-bpmn-projection.js
async function projectRepositoryBpmnDocuments({ repositoryDocuments, repositoryDocumentStore, diagramActions, modeler, repositoryModel, businessObjectStore, businessObjectRepresentationStore, registerDocument = registerBpmnDocument, projectRepresentations = projectBusinessObjectRepresentations } = {}) {
	if (!Array.isArray(repositoryDocuments) || !repositoryDocumentStore || typeof repositoryDocumentStore.setActiveDocument !== "function" || !diagramActions || typeof diagramActions.loadDiagram !== "function" || !modeler || !repositoryModel || typeof registerDocument !== "function") throw new Error("projectRepositoryBpmnDocuments requires repositoryDocuments, repositoryDocumentStore, diagramActions, modeler and repositoryModel");
	const projectedBpmnDocuments = repositoryDocuments.filter((document) => document.kind === "bpmn");
	const projectedBpmnComponents = [];
	for (const projectedBpmnDocument of projectedBpmnDocuments) {
		repositoryDocumentStore.setActiveDocument(projectedBpmnDocument.id);
		await diagramActions.loadDiagram(projectedBpmnDocument.content);
		projectedBpmnComponents.push(...registerDocument({
			modeler,
			repositoryModel,
			repositoryDocument: projectedBpmnDocument
		}));
		if (businessObjectStore && businessObjectRepresentationStore) projectRepresentations({
			modeler,
			businessObjectStore,
			businessObjectRepresentationStore,
			repositoryDocument: projectedBpmnDocument
		});
	}
	return {
		projectedBpmnDocuments,
		projectedBpmnComponents
	};
}
//#endregion
export { projectRepositoryBpmnDocuments };

//# sourceMappingURL=repository-bpmn-projection.js.map
import { duplicateRepositoryResource } from "./repository-resource-duplication.js";
import { projectRepositoryBpmnDocuments } from "./repository-bpmn-projection.js";
//#region src/repository/repository-resource-duplication-projection.js
async function duplicateAndProjectRepositoryResource({ sourceRepository, targetRepository, sourceDocumentId, createDocumentId, diagramActions, modeler } = {}) {
	const duplication = duplicateRepositoryResource({
		sourceRepository,
		targetRepository,
		sourceDocumentId,
		createDocumentId
	});
	if (duplication.status !== "copied" || duplication.targetDocument.kind !== "bpmn") return {
		...duplication,
		projectedBpmnDocuments: [],
		projectedBpmnComponents: []
	};
	const projection = await projectRepositoryBpmnDocuments({
		repositoryDocuments: [duplication.targetDocument],
		repositoryDocumentStore: targetRepository.documents,
		diagramActions,
		modeler,
		repositoryModel: targetRepository.model,
		businessObjectStore: targetRepository.businessObjectStore,
		businessObjectRepresentationStore: targetRepository.businessObjectRepresentationStore
	});
	return {
		...duplication,
		...projection
	};
}
//#endregion
export { duplicateAndProjectRepositoryResource };

//# sourceMappingURL=repository-resource-duplication-projection.js.map
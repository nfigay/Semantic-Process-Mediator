import { resolveRepositoryResourceKind } from "./repository-resource-kind-resolver.js";
//#region src/repository/repository-resource-materializer.js
function materializeRepositoryResources({ resources, repositoryDocumentStore, createDocumentId }) {
	if (!Array.isArray(resources)) throw new Error("Repository resources must be an array");
	if (!repositoryDocumentStore || typeof repositoryDocumentStore.addDocument !== "function") throw new Error("Repository document store must expose addDocument()");
	if (typeof createDocumentId !== "function") throw new Error("Repository resource materialization requires createDocumentId()");
	const repositoryDocuments = [];
	for (const resource of resources) {
		const kind = resolveRepositoryResourceKind(resource?.path);
		if (kind === "unknown") continue;
		const repositoryDocument = repositoryDocumentStore.addDocument({
			id: createDocumentId(),
			fileName: resource.path,
			kind,
			content: resource.content,
			dirty: false
		});
		repositoryDocuments.push(repositoryDocument);
	}
	return repositoryDocuments;
}
//#endregion
export { materializeRepositoryResources };

//# sourceMappingURL=repository-resource-materializer.js.map
import { synchronizeBpmnDocument } from "./synchronize-bpmn-document.js";
//#region src/repository/repository-editor-sync.js
function createRepositoryEditorSync({ modeler, repositoryDocumentStore, repositoryModel, activeRepository, repositoryBrowser, containerId } = {}) {
	if (!modeler || !repositoryBrowser || !activeRepository && (!repositoryDocumentStore || !repositoryModel)) throw new Error("createRepositoryEditorSync requires modeler, repositoryBrowser and either activeRepository or repositoryDocumentStore + repositoryModel");
	const eventBus = modeler.get("eventBus");
	function resolveRepositoryState() {
		const repository = activeRepository?.get?.() || null;
		return {
			repository,
			repositoryDocumentStore: repository?.documents || repositoryDocumentStore,
			repositoryModel: repository?.model || repositoryModel
		};
	}
	function synchronize() {
		const { repositoryDocumentStore: activeRepositoryDocumentStore, repositoryModel: activeRepositoryModel } = resolveRepositoryState();
		if (!activeRepositoryDocumentStore || !activeRepositoryModel) return;
		const repositoryDocument = activeRepositoryDocumentStore.getActiveDocument();
		if (!repositoryDocument) return;
		synchronizeBpmnDocument({
			modeler,
			repositoryModel: activeRepositoryModel,
			repositoryDocument,
			containerId
		});
		repositoryBrowser.render();
	}
	async function persist() {
		const { repository: repositoryAtSaveStart, repositoryDocumentStore: activeRepositoryDocumentStore } = resolveRepositoryState();
		if (!activeRepositoryDocumentStore) return null;
		const repositoryDocument = activeRepositoryDocumentStore.getActiveDocument();
		if (!repositoryDocument) return null;
		try {
			const result = await modeler.saveXML({ format: true });
			if (activeRepository && activeRepository.get() !== repositoryAtSaveStart) return null;
			const activeRepositoryDocument = activeRepositoryDocumentStore.getActiveDocument();
			if (!activeRepositoryDocument || activeRepositoryDocument.id !== repositoryDocument.id) return null;
			return activeRepositoryDocumentStore.updateDocument(repositoryDocument.id, {
				content: result.xml,
				dirty: true
			});
		} catch (err) {
			console.error("Unable to persist edited BPMN document:", err);
			return null;
		}
	}
	function onCommandStackChanged() {
		synchronize();
		persist();
	}
	eventBus.on("commandStack.changed", onCommandStackChanged);
	function destroy() {
		eventBus.off("commandStack.changed", onCommandStackChanged);
	}
	return {
		synchronize,
		persist,
		destroy
	};
}
//#endregion
export { createRepositoryEditorSync };

//# sourceMappingURL=repository-editor-sync.js.map
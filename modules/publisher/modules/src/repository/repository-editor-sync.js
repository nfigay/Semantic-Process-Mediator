import { synchronizeBpmnDocument } from "./synchronize-bpmn-document.js";
//#region src/repository/repository-editor-sync.js
function createRepositoryEditorSync({ modeler, repositoryDocumentStore, repositoryModel, repositoryBrowser, containerId } = {}) {
	if (!modeler || !repositoryDocumentStore || !repositoryModel || !repositoryBrowser) throw new Error("createRepositoryEditorSync requires modeler, repositoryDocumentStore, repositoryModel and repositoryBrowser");
	const eventBus = modeler.get("eventBus");
	function synchronize() {
		const repositoryDocument = repositoryDocumentStore.getActiveDocument();
		if (!repositoryDocument) return;
		synchronizeBpmnDocument({
			modeler,
			repositoryModel,
			repositoryDocument,
			containerId
		});
		repositoryBrowser.render();
	}
	async function persist() {
		const repositoryDocument = repositoryDocumentStore.getActiveDocument();
		if (!repositoryDocument) return null;
		try {
			const result = await modeler.saveXML({ format: true });
			const activeRepositoryDocument = repositoryDocumentStore.getActiveDocument();
			if (!activeRepositoryDocument || activeRepositoryDocument.id !== repositoryDocument.id) return null;
			return repositoryDocumentStore.updateDocument(repositoryDocument.id, {
				xml: result.xml,
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

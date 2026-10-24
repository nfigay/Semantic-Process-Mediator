import { synchronizeBpmnDocument } from "./synchronize-bpmn-document.js";
import { require_lib } from "../../git/Semantic-Process-Mediator/node_modules/@xmldom/xmldom/lib/index.js";
//#region src/repository/repository-editor-sync.js
var import_lib = require_lib();
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
	let pendingPersistence = Promise.resolve();
	function enqueuePersistence() {
		const operation = pendingPersistence.then(() => persist());
		pendingPersistence = operation.then(() => null, () => null);
		return operation;
	}
	function definitionsId(xml) {
		try {
			const root = new import_lib.DOMParser().parseFromString(xml, "application/xml")?.documentElement;
			return root?.localName === "definitions" && root.namespaceURI === "http://www.omg.org/spec/BPMN/20100524/MODEL" ? root.getAttribute("id") || null : null;
		} catch {
			return null;
		}
	}
	async function flushForSnapshot() {
		await pendingPersistence;
		const { repository, repositoryDocumentStore: store } = resolveRepositoryState();
		if (!store) return false;
		const all = store.getDocuments();
		const active = store.getActiveDocument();
		if (!active) return all.length === 0;
		if (active.kind !== "bpmn") return false;
		const canvasId = modeler.getDefinitions()?.id || null;
		const owningId = definitionsId(active.content);
		if (!canvasId || !owningId || owningId !== canvasId) return false;
		const matching = all.filter((doc) => doc.kind === "bpmn" && definitionsId(doc.content) === canvasId);
		if (matching.length !== 1 || matching[0].id !== active.id) return false;
		if (!await enqueuePersistence() || activeRepository && activeRepository.get() !== repository) return false;
		return store.getActiveDocument()?.id === active.id;
	}
	function onCommandStackChanged() {
		synchronize();
		enqueuePersistence();
	}
	eventBus.on("commandStack.changed", onCommandStackChanged);
	function destroy() {
		eventBus.off("commandStack.changed", onCommandStackChanged);
	}
	return {
		synchronize,
		persist,
		flushForSnapshot,
		destroy
	};
}
//#endregion
export { createRepositoryEditorSync };

//# sourceMappingURL=repository-editor-sync.js.map
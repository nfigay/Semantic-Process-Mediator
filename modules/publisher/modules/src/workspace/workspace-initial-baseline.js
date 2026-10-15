//#region src/workspace/workspace-initial-baseline.js
/** Capture only after an explicit, successful initial BPMN import. */
async function captureInitialWorkspaceCanvas({ repository, modeler, eventBus } = {}) {
	const docs = repository?.documents?.getDocuments?.();
	if (!Array.isArray(docs) || docs.length !== 0 || repository.documents.getActiveDocument?.()) return {
		ok: false,
		reason: "REPOSITORY_NOT_EMPTY"
	};
	if (typeof modeler?.saveXML !== "function" || typeof modeler?.get !== "function") return {
		ok: false,
		reason: "MODELER_UNAVAILABLE"
	};
	const commandStack = modeler.get("commandStack");
	if (typeof commandStack?.canUndo !== "function" || commandStack.canUndo()) return {
		ok: false,
		reason: "COMMAND_STACK_NOT_CLEAN"
	};
	const { xml } = await modeler.saveXML({ format: true });
	if (!xml || typeof xml !== "string") return {
		ok: false,
		reason: "SERIALIZATION_INVALID"
	};
	let valid = true;
	if (typeof eventBus?.on !== "function") return {
		ok: false,
		reason: "EVENT_BUS_UNAVAILABLE"
	};
	eventBus.on("import.done", () => {
		valid = false;
	});
	return {
		ok: true,
		repository,
		getXml: (current) => valid && current === repository ? xml : null
	};
}
//#endregion
export { captureInitialWorkspaceCanvas };

//# sourceMappingURL=workspace-initial-baseline.js.map
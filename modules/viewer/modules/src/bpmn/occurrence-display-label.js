//#region src/bpmn/occurrence-display-label.js
/** Presentation-only label; never persist the derived value in BPMN name. */
function getOccurrenceDisplayLabel(bo) {
	const explicit = typeof bo?.name === "string" ? bo.name.trim() : "";
	if (!["bpmn:DataObjectReference", "bpmn:DataStoreReference"].includes(bo?.$type)) return bo?.name || "";
	if (explicit) return explicit;
	const master = bo.$type === "bpmn:DataObjectReference" ? bo.dataObjectRef : bo.dataStoreRef;
	const name = typeof master?.name === "string" ? master.name.trim() : "";
	const state = typeof bo.dataState?.name === "string" ? bo.dataState.name.trim() : "";
	return state ? name ? `${name} [${state}]` : `[${state}]` : name;
}
//#endregion
export { getOccurrenceDisplayLabel };

//# sourceMappingURL=occurrence-display-label.js.map
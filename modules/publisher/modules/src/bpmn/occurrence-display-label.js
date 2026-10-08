//#region src/bpmn/occurrence-display-label.js
/** Presentation-only label. Never write this value to BPMN name. */
function getOccurrenceDisplayLabel(businessObject) {
	const name = businessObject?.name || "";
	if (!["bpmn:DataObjectReference", "bpmn:DataStoreReference"].includes(businessObject?.$type)) return name;
	const state = businessObject?.dataState?.name || "";
	return state ? name ? `${name} [${state}]` : `[${state}]` : name;
}
//#endregion
export { getOccurrenceDisplayLabel };

//# sourceMappingURL=occurrence-display-label.js.map
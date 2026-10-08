import { getOccurrenceDisplayLabel } from "./occurrence-display-label.js";
//#region src/bpmn/occurrence-label-refresh.js
var TYPES = /* @__PURE__ */ new Set(["bpmn:DataObjectReference", "bpmn:DataStoreReference"]);
/** Refresh presentation after a BPMN command, without writing computed labels to BPMN. */
function OccurrenceLabelRefresh(eventBus, elementRegistry, graphicsFactory, selection) {
	const refresh = () => {
		const elements = elementRegistry.filter((element) => TYPES.has(element?.businessObject?.$type));
		for (const element of elements) {
			const label = element.label || elementRegistry.get(element.id + "_label");
			if (label) graphicsFactory.update("shape", label);
		}
		const selected = selection.get()?.[0];
		const bo = selected?.businessObject;
		if (!bo || !TYPES.has(bo.$type)) return;
		const value = getOccurrenceDisplayLabel(bo);
		eventBus.fire("bpmnsm.occurrenceDisplayLabel.changed", {
			element: selected,
			value
		});
	};
	eventBus.on("commandStack.changed", 500, refresh);
	eventBus.on("selection.changed", 500, refresh);
}
OccurrenceLabelRefresh.$inject = [
	"eventBus",
	"elementRegistry",
	"graphicsFactory",
	"selection"
];
var occurrence_label_refresh_default = {
	__init__: ["occurrenceLabelRefresh"],
	occurrenceLabelRefresh: ["type", OccurrenceLabelRefresh]
};
//#endregion
export { OccurrenceLabelRefresh, occurrence_label_refresh_default as default };

//# sourceMappingURL=occurrence-label-refresh.js.map
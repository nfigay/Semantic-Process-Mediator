import { getOccurrenceDisplayLabel } from "./occurrence-display-label.js";
//#region src/bpmn/occurrence-properties-header.js
var TYPES = /* @__PURE__ */ new Set(["bpmn:DataObjectReference", "bpmn:DataStoreReference"]);
/**
* Presentation-only adapter for the installed native properties header.
* Does not modify BPMN business objects or editable properties fields.
*/
function OccurrencePropertiesHeader(eventBus, selection) {
	const parent = document.querySelector("#bpmn-props");
	if (!parent) return;
	const update = () => {
		const selected = selection.get()?.[0];
		const businessObject = (selected?.labelTarget || selected)?.businessObject;
		if (!businessObject || !TYPES.has(businessObject.$type)) return;
		const header = parent.querySelector(".bio-properties-panel-header-label");
		if (!header) return;
		const label = getOccurrenceDisplayLabel(businessObject);
		if (header.textContent !== label) header.textContent = label;
	};
	let pending = false;
	const schedule = () => {
		if (pending) return;
		pending = true;
		queueMicrotask(() => {
			pending = false;
			update();
		});
	};
	const observer = new MutationObserver(schedule);
	observer.observe(parent, {
		childList: true,
		subtree: true,
		characterData: true
	});
	eventBus.on("selection.changed", -1e3, schedule);
	eventBus.on("commandStack.changed", -1e3, schedule);
	eventBus.on("bpmnsm.occurrenceDisplayLabel.changed", -1e3, schedule);
	eventBus.on("diagram.destroy", () => observer.disconnect());
	schedule();
}
OccurrencePropertiesHeader.$inject = ["eventBus", "selection"];
var occurrence_properties_header_default = {
	__init__: ["occurrencePropertiesHeader"],
	occurrencePropertiesHeader: ["type", OccurrencePropertiesHeader]
};
//#endregion
export { OccurrencePropertiesHeader, occurrence_properties_header_default as default };

//# sourceMappingURL=occurrence-properties-header.js.map
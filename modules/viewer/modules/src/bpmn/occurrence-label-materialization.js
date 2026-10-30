import { getOccurrenceDisplayLabel } from "./occurrence-display-label.js";
import { getExternalLabelMid } from "../../git/Semantic-Process-Mediator/node_modules/bpmn-js/lib/util/LabelUtil.js";
//#region src/bpmn/occurrence-label-materialization.js
var TYPES = /* @__PURE__ */ new Set(["bpmn:DataObjectReference", "bpmn:DataStoreReference"]);
var isOccurrence = (element) => !element?.labelTarget && TYPES.has(element?.businessObject?.$type);
/**
* Adapt the native external label lifecycle to derived master/dataState text.
* The value is presentation-only: never call updateLabel with derived text.
*/
function OccurrenceLabelMaterialization(eventBus, elementRegistry, modeling, textRenderer) {
	let adapting = false;
	function labelFor(element) {
		return element.label || elementRegistry.get(element.id + "_label");
	}
	function synchronize(element) {
		if (adapting || !isOccurrence(element) || !element.parent) return;
		const value = getOccurrenceDisplayLabel(element.businessObject);
		if (!value) return;
		const label = labelFor(element);
		const nativeMid = getExternalLabelMid(element);
		const center = {
			x: nativeMid.x,
			y: nativeMid.y + 7
		};
		const measurementWidth = Math.max(400, label?.width || 0);
		const bounds = textRenderer.getExternalLabelBounds({
			x: center.x - measurementWidth / 2,
			y: center.y - 10,
			width: measurementWidth,
			height: 20
		}, value);
		if (!bounds) return;
		const anchoredBounds = {
			x: center.x - bounds.width / 2,
			y: center.y - bounds.height / 2,
			width: bounds.width,
			height: bounds.height
		};
		adapting = true;
		try {
			if (!label) modeling.createLabel(element, {
				x: center.x,
				y: center.y
			}, {
				id: element.id + "_label",
				width: anchoredBounds.width,
				height: anchoredBounds.height,
				businessObject: element.businessObject
			});
			else if (label.x !== anchoredBounds.x || label.y !== anchoredBounds.y || label.width !== anchoredBounds.width || label.height !== anchoredBounds.height) modeling.resizeShape(label, anchoredBounds, {
				width: 0,
				height: 0
			});
		} finally {
			adapting = false;
		}
	}
	function relevantOccurrences(context) {
		const element = context?.element?.labelTarget || context?.element;
		element?.businessObject;
		if (!context || !element) return [];
		if (isOccurrence(element)) return [element];
		const updated = context.moddleElement;
		if (!updated || !Object.prototype.hasOwnProperty.call(context.properties || {}, "name")) return [];
		return elementRegistry.filter((candidate) => {
			if (!isOccurrence(candidate)) return false;
			const reference = candidate.businessObject;
			return reference.dataObjectRef === updated || reference.dataStoreRef === updated || reference.dataState === updated;
		});
	}
	eventBus.on("commandStack.element.updateLabel.preExecute", 1500, (event) => {
		const context = event?.context;
		const bo = (context?.element?.labelTarget || context?.element)?.businessObject;
		if (!TYPES.has(bo?.$type) || typeof context.newLabel !== "string" || context.newLabel.trim()) return;
		if (!getOccurrenceDisplayLabel({
			...bo,
			name: ""
		})) return;
		context.hints = {
			...context.hints || {},
			removeShape: false
		};
	});
	eventBus.on("commandStack.element.updateModdleProperties.postExecuted", 400, (event) => {
		for (const element of relevantOccurrences(event?.context)) synchronize(element);
	});
	eventBus.on("commandStack.element.updateLabel.postExecuted", 400, (event) => {
		const context = event?.context;
		if (context?.newLabel == null && context?.hints?.removeShape === false) return;
		synchronize(context?.element?.labelTarget || context?.element);
	});
	eventBus.on("commandStack.shape.create.postExecuted", 400, (event) => {
		synchronize(event?.context?.shape);
	});
	eventBus.on("import.done", 400, (event) => {
		if (event?.error) return;
		for (const element of elementRegistry.filter(isOccurrence)) synchronize(element);
	});
}
OccurrenceLabelMaterialization.$inject = [
	"eventBus",
	"elementRegistry",
	"modeling",
	"textRenderer"
];
var occurrence_label_materialization_default = {
	__init__: ["occurrenceLabelMaterialization"],
	occurrenceLabelMaterialization: ["type", OccurrenceLabelMaterialization]
};
//#endregion
export { OccurrenceLabelMaterialization, occurrence_label_materialization_default as default };

//# sourceMappingURL=occurrence-label-materialization.js.map
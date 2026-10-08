import { getOccurrenceDisplayLabel } from "./occurrence-display-label.js";
import { append, classes } from "../../node_modules/tiny-svg/dist/index.js";
import BaseRenderer from "../../node_modules/diagram-js/lib/draw/BaseRenderer.js";
//#region src/bpmn/occurrence-label-renderer.js
/**
* Intercepts only external label shapes of stateful occurrences.
* All BPMN symbols and other labels stay with the native renderer.
*/
function OccurrenceLabelRenderer(eventBus, bpmnRenderer, textRenderer) {
	BaseRenderer.call(this, eventBus, 1600);
	this._bpmnRenderer = bpmnRenderer;
	this._textRenderer = textRenderer;
}
OccurrenceLabelRenderer.$inject = [
	"eventBus",
	"bpmnRenderer",
	"textRenderer"
];
OccurrenceLabelRenderer.prototype = Object.create(BaseRenderer.prototype);
OccurrenceLabelRenderer.prototype.constructor = OccurrenceLabelRenderer;
OccurrenceLabelRenderer.prototype.canRender = function(element) {
	const target = element?.labelTarget;
	return Boolean(element?.labelTarget) && ["bpmn:DataObjectReference", "bpmn:DataStoreReference"].includes(target?.businessObject?.$type) && Boolean(target.businessObject.dataState?.name);
};
OccurrenceLabelRenderer.prototype.drawShape = function(parentGfx, element, attrs = {}) {
	const label = getOccurrenceDisplayLabel(element.labelTarget.businessObject);
	const box = {
		width: element.width,
		height: element.height,
		x: element.width / 2,
		y: element.height / 2
	};
	const text = this._textRenderer.createText(label, {
		box,
		style: this._textRenderer.getExternalStyle(),
		...attrs
	});
	classes(text).add("djs-label");
	append(parentGfx, text);
	return text;
};
var occurrence_label_renderer_default = {
	__init__: ["occurrenceLabelRenderer"],
	occurrenceLabelRenderer: ["type", OccurrenceLabelRenderer]
};
//#endregion
export { OccurrenceLabelRenderer, occurrence_label_renderer_default as default };

//# sourceMappingURL=occurrence-label-renderer.js.map
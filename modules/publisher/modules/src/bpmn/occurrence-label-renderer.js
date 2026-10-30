import { getOccurrenceDisplayLabel } from "./occurrence-display-label.js";
import BaseRenderer from "../../git/Semantic-Process-Mediator/node_modules/diagram-js/lib/draw/BaseRenderer.js";
import { append, classes } from "../../git/Semantic-Process-Mediator/node_modules/tiny-svg/dist/index.js";
//#region src/bpmn/occurrence-label-renderer.js
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
	return Boolean(element?.labelTarget) && ["bpmn:DataObjectReference", "bpmn:DataStoreReference"].includes(element.labelTarget?.businessObject?.$type) && Boolean(getOccurrenceDisplayLabel(element.labelTarget.businessObject));
};
OccurrenceLabelRenderer.prototype.drawShape = function(parentGfx, element, attrs = {}) {
	const label = getOccurrenceDisplayLabel(element.labelTarget.businessObject);
	const text = this._textRenderer.createText(label, {
		box: {
			width: element.width,
			height: element.height,
			x: element.width / 2,
			y: element.height / 2
		},
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
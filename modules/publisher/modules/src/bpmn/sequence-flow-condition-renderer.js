import BaseRenderer from "../../node_modules/diagram-js/lib/draw/BaseRenderer.js";
import { append, attr, create } from "../../node_modules/tiny-svg/dist/index.js";
//#region src/bpmn/sequence-flow-condition-renderer.js
function getSequenceFlowCondition(bo) {
	return bo?.$type === "bpmn:SequenceFlow" ? String(bo.conditionExpression?.body || "").trim() : "";
}
function SequenceFlowConditionRenderer(eventBus, bpmnRenderer) {
	BaseRenderer.call(this, eventBus, 1700);
	this._bpmnRenderer = bpmnRenderer;
}
SequenceFlowConditionRenderer.$inject = ["eventBus", "bpmnRenderer"];
SequenceFlowConditionRenderer.prototype = Object.create(BaseRenderer.prototype);
SequenceFlowConditionRenderer.prototype.constructor = SequenceFlowConditionRenderer;
SequenceFlowConditionRenderer.prototype.canRender = function(element) {
	return element?.type === "bpmn:SequenceFlow" && Boolean(getSequenceFlowCondition(element.businessObject));
};
SequenceFlowConditionRenderer.prototype.drawConnection = function(parentGfx, element, attrs) {
	const gfx = this._bpmnRenderer.drawConnection(parentGfx, element, attrs);
	const points = element.waypoints || [];
	if (points.length < 2) return gfx;
	const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
	let remaining = lengths.reduce((a, b) => a + b, 0) / 2;
	let x = points[0].x, y = points[0].y;
	for (let i = 0; i < lengths.length; i++) {
		if (remaining <= lengths[i]) {
			const t = lengths[i] ? remaining / lengths[i] : 0;
			x = points[i].x + t * (points[i + 1].x - points[i].x);
			y = points[i].y + t * (points[i + 1].y - points[i].y);
			break;
		}
		remaining -= lengths[i];
	}
	const label = create("text");
	attr(label, {
		x,
		y: y - 7,
		"text-anchor": "middle",
		"font-family": "Arial, sans-serif",
		"font-size": 12,
		fill: "#222",
		class: "bpmns-condition-label",
		"pointer-events": "none"
	});
	label.textContent = getSequenceFlowCondition(element.businessObject);
	append(parentGfx, label);
	return gfx;
};
var sequence_flow_condition_renderer_default = {
	__init__: ["sequenceFlowConditionRenderer"],
	sequenceFlowConditionRenderer: ["type", SequenceFlowConditionRenderer]
};
//#endregion
export { SequenceFlowConditionRenderer, sequence_flow_condition_renderer_default as default, getSequenceFlowCondition };

//# sourceMappingURL=sequence-flow-condition-renderer.js.map
//#region src/bpmn/ea-import/coverage-core.mjs
/** Portable DOM-based EA-to-BPMN message-flow identity audit. No Node APIs. */
var EA_NS = "http://www.sparxsystems.com/profiles/BPMN2.0/1.5";
var BPMN_NS = "http://www.omg.org/spec/BPMN/20100524/MODEL";
var XMI_NS = "http://www.omg.org/spec/XMI/20131001";
var list = (doc, ns, local) => Array.from(doc.getElementsByTagNameNS(ns, local));
var xmiId = (el) => el.getAttributeNS(XMI_NS, "id") || el.getAttribute("xmi:id") || "";
var freq = (values) => {
	const m = /* @__PURE__ */ new Map();
	for (const v of values) m.set(v, (m.get(v) || 0) + 1);
	return m;
};
var duplicates = (values) => [...freq(values)].filter(([, n]) => n > 1).map(([id]) => id);
function verifyDocuments(ea, bpmn) {
	if (!ea?.documentElement || !bpmn?.documentElement) throw new Error("Expected parsed XML documents");
	const stereotypes = list(ea, EA_NS, "MessageFlow");
	const controlFlows = Array.from(ea.getElementsByTagName("*")).filter((e) => e.getAttribute("xmi:type") === "uml:ControlFlow" || e.getAttributeNS(XMI_NS, "type") === "uml:ControlFlow");
	const controlById = new Map(controlFlows.map((e) => [xmiId(e), e]));
	const sourceLinks = stereotypes.map((s) => ({
		stereotypeId: xmiId(s),
		controlId: s.getAttribute("base_ControlFlow") || ""
	}));
	const missingControls = sourceLinks.filter((s) => !controlById.has(s.controlId));
	const duplicatedSourceControls = duplicates(sourceLinks.map((s) => s.controlId).filter(Boolean));
	const expected = new Set(sourceLinks.filter((s) => controlById.has(s.controlId)).map((s) => `EA_${s.controlId}`));
	const flows = list(bpmn, BPMN_NS, "messageFlow");
	const actual = flows.map((f) => f.getAttribute("id") || "");
	const actualSet = new Set(actual);
	const allIds = Array.from(bpmn.getElementsByTagName("*")).map((e) => e.getAttribute("id")).filter(Boolean);
	const idSet = new Set(allIds);
	const missingIds = flows.filter((f) => !f.getAttribute("id")).length;
	const missing = [...expected].filter((id) => !actualSet.has(id));
	const extra = [...actualSet].filter((id) => id && !expected.has(id));
	const brokenEndpoints = flows.filter((f) => !idSet.has(f.getAttribute("sourceRef")) || !idSet.has(f.getAttribute("targetRef"))).map((f) => f.getAttribute("id"));
	const duplicateBpmnIds = duplicates(allIds);
	const duplicateControlIds = duplicates(controlFlows.map(xmiId).filter(Boolean));
	return {
		ok: !missingControls.length && !duplicatedSourceControls.length && !duplicateControlIds.length && stereotypes.length === expected.size && expected.size === flows.length && !missing.length && !extra.length && !brokenEndpoints.length && !duplicateBpmnIds.length && !missingIds,
		eaMessageFlows: stereotypes.length,
		eaControlFlows: controlFlows.length,
		expectedUniqueFlows: expected.size,
		bpmnMessageFlows: flows.length,
		missingControls,
		duplicatedSourceControls,
		duplicateControlIds,
		missing,
		extra,
		brokenEndpoints,
		duplicateBpmnIds,
		missingIds
	};
}
//#endregion
export { verifyDocuments };

//# sourceMappingURL=coverage-core.js.map
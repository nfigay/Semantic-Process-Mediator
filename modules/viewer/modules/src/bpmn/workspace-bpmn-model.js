import { require_lib } from "../../node_modules/@xmldom/xmldom/lib/index.js";
//#region src/bpmn/workspace-bpmn-model.js
var import_lib = require_lib();
var ID_PATTERN = /^[A-Za-z_][A-Za-z0-9_.-]*$/;
var NS = "http://www.omg.org/spec/BPMN/20100524/MODEL";
function validateBpmnIdentifier(id) {
	const value = String(id || "").trim();
	if (!ID_PATTERN.test(value)) throw new Error("BPMN identifier must begin with a letter or underscore and contain only letters, digits, _, . or -");
	return value;
}
function readBpmnIdentity(xml) {
	if (typeof xml !== "string" || !xml.trim()) throw new Error("Missing BPMN XML");
	const errors = [];
	const root = new import_lib.DOMParser({ onError: (_level, message) => errors.push(message) }).parseFromString(xml, "application/xml")?.documentElement;
	if (errors.length || root?.localName !== "definitions" || root?.namespaceURI !== NS) throw new Error("Invalid BPMN definitions XML");
	const ids = /* @__PURE__ */ new Set();
	function walk(node) {
		if (node.nodeType !== 1) return;
		if (node.namespaceURI === NS && [
			"definitions",
			"process",
			"collaboration"
		].includes(node.localName)) {
			const id = node.getAttribute("id");
			if (!id) throw new Error("Missing BPMN identity on " + node.localName);
			ids.add(id);
		}
		for (let child = node.firstChild; child; child = child.nextSibling) walk(child);
	}
	walk(root);
	return ids;
}
function findBpmnIdentityConflict(xml, documents) {
	const incoming = readBpmnIdentity(xml);
	for (const document of documents || []) {
		if (document.kind !== "bpmn") continue;
		const current = readBpmnIdentity(document.content || document.xml);
		for (const id of incoming) if (current.has(id)) return {
			id,
			documentId: document.id
		};
	}
	return null;
}
function createEmptyBpmnModel({ kind, id }) {
	if (!["process", "collaboration"].includes(kind)) throw new Error("Unsupported BPMN model kind");
	const modelId = validateBpmnIdentifier(id);
	const definitionsId = "Definitions_" + modelId;
	const diagramId = "BPMNDiagram_" + modelId;
	const planeId = "BPMNPlane_" + modelId;
	return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="${definitionsId}" targetNamespace="http://bpmnsm.org/workspace">
  <bpmn:${kind === "process" ? "process" : "collaboration"} id="${modelId}"${kind === "process" ? " isExecutable=\"false\"" : ""} />
  <bpmndi:BPMNDiagram id="${diagramId}">
    <bpmndi:BPMNPlane id="${planeId}" bpmnElement="${modelId}" />
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
}
//#endregion
export { createEmptyBpmnModel, findBpmnIdentityConflict, readBpmnIdentity, validateBpmnIdentifier };

//# sourceMappingURL=workspace-bpmn-model.js.map
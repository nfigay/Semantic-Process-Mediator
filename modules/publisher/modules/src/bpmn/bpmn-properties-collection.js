import { uniqueBpmnId } from "./bpmn-io-structure.js";
//#region src/bpmn/bpmn-properties-collection.js
/** BPMN Property collection: structural edits through the modeling command stack. */
function supportsBpmnProperties(moddle, type) {
	return Boolean(type && moddle?.getType(type)?.$descriptor?.propertiesByName?.properties?.isMany);
}
function bpmnProperties(element) {
	return element?.businessObject?.get("properties") || [];
}
function addBpmnProperty(element, modeling, factory, registry) {
	const property = factory.create("bpmn:Property", {
		id: uniqueBpmnId("Property", registry),
		name: "Property"
	});
	modeling.updateProperties(element, { properties: [...bpmnProperties(element), property] });
	return property;
}
function renameBpmnProperty(element, property, name, modeling) {
	if (!bpmnProperties(element).includes(property)) throw new Error("Property does not belong to selected element");
	modeling.updateModdleProperties(element, property, { name });
}
/** Walk containment only; references must never become traversal edges. */
function referencesProperty(root, property, visited) {
	if (!root || typeof root !== "object" || visited.has(root)) return false;
	visited.add(root);
	if (Array.isArray(root)) return root.some((item) => referencesProperty(item, property, visited));
	const descriptors = root.$descriptor?.properties || [];
	for (const descriptor of descriptors) {
		if (descriptor.isVirtual) continue;
		const value = root.get?.(descriptor.name) ?? root[descriptor.name];
		if (descriptor.isReference) {
			if ((Array.isArray(value) ? value : [value]).some((ref) => ref === property || typeof ref === "string" && ref === property.id)) return true;
		} else if (value && typeof value === "object" && referencesProperty(value, property, visited)) return true;
	}
	return false;
}
function modelRoots(element, registry) {
	const roots = [];
	let current = element?.businessObject;
	const seen = /* @__PURE__ */ new Set();
	while (current?.$parent && !seen.has(current)) {
		seen.add(current);
		current = current.$parent;
	}
	if (current) roots.push(current);
	for (const entry of registry?.getAll?.() || []) if (entry?.businessObject) roots.push(entry.businessObject);
	return roots;
}
function isBpmnPropertyReferenced(element, property, registry) {
	const visited = /* @__PURE__ */ new Set();
	return modelRoots(element, registry).some((root) => referencesProperty(root, property, visited));
}
function removeBpmnProperty(element, property, modeling, registry) {
	const existing = bpmnProperties(element);
	if (!existing.includes(property)) return false;
	if (isBpmnPropertyReferenced(element, property, registry)) throw new Error("Property is referenced by another BPMN element");
	modeling.updateProperties(element, { properties: existing.filter((candidate) => candidate !== property) });
	return true;
}
//#endregion
export { addBpmnProperty, bpmnProperties, isBpmnPropertyReferenced, removeBpmnProperty, renameBpmnProperty, supportsBpmnProperties };

//# sourceMappingURL=bpmn-properties-collection.js.map
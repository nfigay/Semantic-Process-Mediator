import { uniqueBpmnId } from "./bpmn-io-structure.js";
//#region src/bpmn/bpmn-io-sets.js
/** PROP-007D: model-based InputSet / OutputSet management. */
var spec = (kind) => {
	if (kind === "input") return {
		sets: "inputSets",
		items: "dataInputs",
		refs: "dataInputRefs",
		type: "bpmn:InputSet",
		prefix: "InputSet"
	};
	if (kind === "output") return {
		sets: "outputSets",
		items: "dataOutputs",
		refs: "dataOutputRefs",
		type: "bpmn:OutputSet",
		prefix: "OutputSet"
	};
	throw new Error("Invalid IO set kind");
};
function ioSets(element, kind) {
	const { sets } = spec(kind);
	return element.businessObject.ioSpecification?.get(sets) || [];
}
function addIoSet(element, kind, modeling, factory, registry) {
	const { sets, type, prefix } = spec(kind);
	const io = element.businessObject.ioSpecification;
	if (!io) throw new Error("Create an input/output before adding a set");
	const set = factory.create(type, { id: uniqueBpmnId(prefix, registry) });
	modeling.updateModdleProperties(element, io, { [sets]: [...ioSets(element, kind), set] });
	return set;
}
function removeIoSet(element, kind, set, modeling) {
	const { sets } = spec(kind);
	const io = element.businessObject.ioSpecification;
	if (!io) return false;
	const existing = ioSets(element, kind);
	if (!existing.includes(set)) return false;
	if (existing.length <= 1) throw new Error("At least one IO set must remain");
	modeling.updateModdleProperties(element, io, { [sets]: existing.filter((candidate) => candidate !== set) });
	return true;
}
function setIoSetMembership(element, kind, set, item, checked, modeling) {
	const { items, refs } = spec(kind);
	const io = element.businessObject.ioSpecification;
	if (!io || !ioSets(element, kind).includes(set) || !(io.get(items) || []).includes(item)) throw new Error("IO set or item is not part of the selected specification");
	const previous = set.get(refs) || [];
	const next = checked ? previous.includes(item) ? previous : [...previous, item] : previous.filter((candidate) => candidate !== item);
	if (next.length !== previous.length) modeling.updateModdleProperties(element, set, { [refs]: next });
}
function ioSetMembership(set, kind, item) {
	return (set.get(spec(kind).refs) || []).includes(item);
}
//#endregion
export { addIoSet, ioSetMembership, ioSets, removeIoSet, setIoSetMembership };

//# sourceMappingURL=bpmn-io-sets.js.map
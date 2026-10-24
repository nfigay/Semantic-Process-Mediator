import { createElement as k } from "../../git/Semantic-Process-Mediator/node_modules/preact/dist/preact.module.js";
import { CheckboxEntry, isCheckboxEntryEdited as isEdited$9 } from "../../git/Semantic-Process-Mediator/node_modules/@bpmn-io/properties-panel/dist/index.esm.js";
import { useService } from "../../git/Semantic-Process-Mediator/node_modules/bpmn-js-properties-panel/dist/index.esm.js";
import { addIoSet, ioSetMembership, ioSets, removeIoSet, setIoSetMembership } from "./bpmn-io-sets.js";
//#region src/bpmn/bpmn-io-sets-panel.js
function MembershipEntry({ element, id, kind, set, item }) {
	const modeling = useService("modeling");
	return CheckboxEntry({
		element,
		id,
		label: `${item.name || item.id} (${item.id})`,
		getValue: () => ioSetMembership(set, kind, item),
		setValue: (checked) => setIoSetMembership(element, kind, set, item, checked, modeling)
	});
}
function IoSetsEntry({ element }) {
	const modeling = useService("modeling");
	const factory = useService("bpmnFactory");
	const registry = useService("elementRegistry");
	const io = element.businessObject.ioSpecification;
	if (!io) return k("div", null, "Add a data input or output to create an IO specification.");
	return k("div", { class: "bpmns-io-sets" }, ...["input", "output"].map((kind) => {
		const items = io.get(kind === "input" ? "dataInputs" : "dataOutputs") || [];
		const sets = ioSets(element, kind);
		return k("section", { key: kind }, k("strong", null, kind === "input" ? "Input sets" : "Output sets"), ...sets.map((set) => k("div", { key: set.id }, k("span", null, set.name || set.id), k("button", {
			type: "button",
			disabled: sets.length <= 1,
			title: sets.length <= 1 ? "At least one set must remain" : "Remove set",
			onClick: () => removeIoSet(element, kind, set, modeling)
		}, "Remove set"), ...items.map((item) => k(MembershipEntry, {
			key: `${set.id}-${item.id}`,
			element,
			kind,
			set,
			item,
			id: `bpmns-io-membership-${set.id}-${item.id}`
		})))), k("button", {
			type: "button",
			onClick: () => addIoSet(element, kind, modeling, factory, registry)
		}, kind === "input" ? "Add input set" : "Add output set"));
	}));
}
function appendIoSetsGroup(groups, element) {
	if (!element?.businessObject?.ioSpecification || groups.some((group) => group.id === "bpmns-io-sets")) return groups;
	return [...groups, {
		id: "bpmns-io-sets",
		label: "BPMN input / output sets",
		entries: [{
			id: "bpmns-io-sets-entry",
			element,
			component: IoSetsEntry,
			isEdited: isEdited$9
		}]
	}];
}
//#endregion
export { appendIoSetsGroup };

//# sourceMappingURL=bpmn-io-sets-panel.js.map
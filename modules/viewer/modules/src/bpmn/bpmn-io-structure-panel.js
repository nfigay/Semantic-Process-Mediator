import { createElement as k } from "../../node_modules/preact/dist/preact.module.js";
import { TextFieldEntry as TextfieldEntry, isTextFieldEntryEdited as isEdited } from "../../node_modules/@bpmn-io/properties-panel/dist/index.esm.js";
import { useService } from "../../node_modules/bpmn-js-properties-panel/dist/index.esm.js";
import { addIoItem, ioItemIsReferenced, removeIoItem, renameIoItem, supportsIoSpecification } from "./bpmn-io-structure.js";
import { appendBpmnPropertiesGroup } from "./bpmn-properties-collection-panel.js";
import { appendDataAssociationsGroup } from "./bpmn-data-associations-panel.js";
import { appendIoSetsGroup } from "./bpmn-io-sets-panel.js";
//#region src/bpmn/bpmn-io-structure-panel.js
function IoNameEntry({ element, id, item }) {
	const modeling = useService("modeling");
	const debounce = useService("debounceInput");
	return TextfieldEntry({
		element,
		id,
		label: item.id || "Name",
		getValue: () => item.name || "",
		setValue: (value) => renameIoItem(element, item, value, modeling),
		debounce
	});
}
function IoStructureEntry({ element }) {
	const modeling = useService("modeling");
	const factory = useService("bpmnFactory");
	const registry = useService("elementRegistry");
	const io = element.businessObject.ioSpecification;
	const children = [];
	for (const [kind, key] of [["input", "dataInputs"], ["output", "dataOutputs"]]) {
		const items = io?.get(key) || [];
		children.push(k("div", {
			key: kind,
			class: "bpmns-io-kind"
		}, k("strong", null, kind === "input" ? "Data inputs" : "Data outputs"), ...items.map((item) => {
			const referenced = ioItemIsReferenced(element, kind, item);
			return k("div", {
				key: item.id,
				class: "bpmns-io-item"
			}, k(IoNameEntry, {
				element,
				item,
				id: `bpmns-io-name-${item.id}`
			}), k("button", {
				type: "button",
				disabled: referenced,
				title: referenced ? "Referenced by a data association; remove the association first" : "Remove",
				onClick: () => removeIoItem(element, kind, item, modeling)
			}, "Remove"));
		}), k("button", {
			type: "button",
			onClick: () => addIoItem(element, kind, modeling, factory, registry)
		}, kind === "input" ? "Add data input" : "Add data output")));
	}
	return k("div", { class: "bpmns-io-structure" }, ...children);
}
function appendIoStructureGroup(groups, element, moddle) {
	const type = element?.businessObject?.$type;
	if (!supportsIoSpecification(moddle, type)) return appendBpmnPropertiesGroup(groups, element, moddle);
	if (groups.some((group) => group.id === "bpmns-io-structure")) return groups;
	return appendBpmnPropertiesGroup(appendDataAssociationsGroup(appendIoSetsGroup([...groups, {
		id: "bpmns-io-structure",
		label: "BPMN input / output specification",
		entries: [{
			id: "bpmns-io-structure-entry",
			element,
			component: IoStructureEntry,
			isEdited
		}]
	}], element), element), element, moddle);
}
//#endregion
export { appendIoStructureGroup };

//# sourceMappingURL=bpmn-io-structure-panel.js.map
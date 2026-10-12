import { createElement as k } from "../../node_modules/preact/dist/preact.module.js";
import { TextFieldEntry as TextfieldEntry, isTextFieldEntryEdited as isEdited } from "../../node_modules/@bpmn-io/properties-panel/dist/index.esm.js";
import { useService } from "../../node_modules/bpmn-js-properties-panel/dist/index.esm.js";
import { addBpmnProperty, bpmnProperties, isBpmnPropertyReferenced, removeBpmnProperty, renameBpmnProperty, supportsBpmnProperties } from "./bpmn-properties-collection.js";
//#region src/bpmn/bpmn-properties-collection-panel.js
function PropertyNameEntry({ element, property, id }) {
	const modeling = useService("modeling");
	const debounce = useService("debounceInput");
	return TextfieldEntry({
		element,
		id,
		label: property.id,
		getValue: () => property.name || "",
		setValue: (value) => renameBpmnProperty(element, property, value, modeling),
		debounce
	});
}
function PropertiesCollectionEntry({ element }) {
	const modeling = useService("modeling");
	const factory = useService("bpmnFactory");
	const registry = useService("elementRegistry");
	return k("div", { class: "bpmns-properties-collection" }, ...bpmnProperties(element).map((property) => {
		const referenced = isBpmnPropertyReferenced(element, property, registry);
		return k("div", { key: property.id }, k(PropertyNameEntry, {
			element,
			property,
			id: `bpmns-property-${property.id}`
		}), k("button", {
			type: "button",
			disabled: referenced,
			title: referenced ? "Referenced by a data association" : "Remove property",
			onClick: () => removeBpmnProperty(element, property, modeling, registry)
		}, "Remove"));
	}), k("button", {
		type: "button",
		onClick: () => addBpmnProperty(element, modeling, factory, registry)
	}, "Add property"));
}
function appendBpmnPropertiesGroup(groups, element, moddle) {
	if (!supportsBpmnProperties(moddle, element?.businessObject?.$type)) return groups;
	if (groups.some((group) => group.id === "bpmns-properties-collection")) return groups;
	return [...groups, {
		id: "bpmns-properties-collection",
		label: "BPMN properties",
		entries: [{
			id: "bpmns-properties-collection-entry",
			element,
			component: PropertiesCollectionEntry,
			isEdited
		}]
	}];
}
//#endregion
export { appendBpmnPropertiesGroup };

//# sourceMappingURL=bpmn-properties-collection-panel.js.map
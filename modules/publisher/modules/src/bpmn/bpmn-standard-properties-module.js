import { createElement as k } from "../../git/Semantic-Process-Mediator/node_modules/preact/dist/preact.module.js";
import { CheckboxEntry, SelectEntry, TextFieldEntry as TextfieldEntry, isCheckboxEntryEdited as isEdited$9, isSelectEntryEdited as isEdited$3, isTextFieldEntryEdited as isEdited } from "../../git/Semantic-Process-Mediator/node_modules/@bpmn-io/properties-panel/dist/index.esm.js";
import { useService } from "../../git/Semantic-Process-Mediator/node_modules/bpmn-js-properties-panel/dist/index.esm.js";
import { appendIoStructureGroup } from "./bpmn-io-structure-panel.js";
import { decorateNativeEntries } from "./bpmn-native-inheritance.js";
import { inheritedPropertyLabel } from "./bpmn-property-inheritance.js";
import { collectScalarProperties, scalarValueToModdle } from "./bpmn-standard-scalar.js";
import { propertyCoverage } from "./bpmn-standard-coverage.js";
//#region src/bpmn/bpmn-standard-properties-module.js
/** Unified BPMN standard extensions; native bpmn.io provider remains authoritative. */
var originComponentCache = /* @__PURE__ */ new WeakMap();
function withOrigin(Component, origin) {
	let byOrigin = originComponentCache.get(Component);
	if (!byOrigin) {
		byOrigin = /* @__PURE__ */ new Map();
		originComponentCache.set(Component, byOrigin);
	}
	if (byOrigin.has(origin)) return byOrigin.get(origin);
	function NativeWithOrigin(props) {
		return k("div", { class: "bpmns-native-inheritance" }, k(Component, props), k("small", {
			class: "bpmns-native-inheritance-origin",
			style: {
				display: "block",
				fontSize: "11px",
				opacity: "0.75",
				marginTop: "2px"
			}
		}, origin));
	}
	byOrigin.set(origin, NativeWithOrigin);
	return NativeWithOrigin;
}
var STANDARD_ENTRIES = [{
	type: "bpmn:SequenceFlow",
	property: "conditionExpression"
}];
function ConditionEntry({ element, id }) {
	const modeling = useService("modeling");
	const bpmnFactory = useService("bpmnFactory");
	const debounce = useService("debounceInput");
	const bo = element.businessObject;
	return TextfieldEntry({
		element,
		id,
		label: "Condition Expression",
		getValue: () => bo.conditionExpression?.body || "",
		setValue: (value) => {
			const expression = bo.conditionExpression;
			if (expression) modeling.updateModdleProperties(element, expression, { body: value || void 0 });
			else if (value) modeling.updateProperties(element, { conditionExpression: bpmnFactory.create("bpmn:FormalExpression", { body: value }) });
		},
		debounce
	});
}
function makeScalarEntry(property, kind, label, enumValues) {
	return function ScalarEntry({ element, id }) {
		const modeling = useService("modeling");
		const debounce = useService("debounceInput");
		const bo = element.businessObject;
		const getValue = () => bo.get ? bo.get(property.name) : bo[property.name];
		const setValue = (value) => {
			const normalized = scalarValueToModdle(kind, value);
			if (normalized === null) return;
			modeling.updateProperties(element, { [property.name]: normalized });
		};
		if (kind === "Boolean") return CheckboxEntry({
			element,
			id,
			label,
			getValue: () => Boolean(getValue()),
			setValue
		});
		if (kind === "Enum") return SelectEntry({
			element,
			id,
			label,
			getValue: () => getValue() || "",
			setValue,
			getOptions: () => [{
				value: "",
				label: ""
			}, ...enumValues.map((value) => ({
				value,
				label: value
			}))]
		});
		return TextfieldEntry({
			element,
			id,
			label,
			getValue: () => String(getValue() ?? ""),
			setValue,
			debounce
		});
	};
}
function BpmnStandardProperties(propertiesPanel, moddle) {
	this.moddle = moddle;
	propertiesPanel.registerProvider(600, this);
}
BpmnStandardProperties.$inject = ["propertiesPanel", "moddle"];
BpmnStandardProperties.prototype.getGroups = function(element) {
	return (groups) => {
		const type = element?.businessObject?.$type;
		if (!type) return groups;
		const next = decorateNativeEntries([...groups], this.moddle, type, inheritedPropertyLabel, withOrigin);
		if (STANDARD_ENTRIES.some((item) => item.type === type && item.property === "conditionExpression") && !next.some((g) => g.entries?.some((e) => e.id === "bpmns-condition-expression"))) next.push({
			id: "bpmns-condition",
			label: "Flow Condition",
			entries: [{
				id: "bpmns-condition-expression",
				element,
				component: ConditionEntry,
				isEdited,
				semanticProperty: "conditionExpression",
				inheritedLabel: inheritedPropertyLabel(this.moddle, type, "conditionExpression")
			}]
		});
		const entries = [];
		for (const { property, kind, options: values, status } of propertyCoverage(this.moddle, type, next, collectScalarProperties)) {
			if (status !== "GENERATED") continue;
			const inherited = inheritedPropertyLabel(this.moddle, type, property.name);
			const label = `${property.name}${inherited ? ` ${inherited}` : ""}`;
			entries.push({
				id: `bpmns-standard-${property.name}`,
				element,
				semanticProperty: property.name,
				component: makeScalarEntry(property, kind, label, values),
				isEdited: kind === "Boolean" ? isEdited$9 : kind === "Enum" ? isEdited$3 : isEdited
			});
		}
		if (entries.length) next.push({
			id: "bpmns-standard-scalars",
			label: "BPMN standard attributes",
			entries
		});
		return appendIoStructureGroup(next, element, this.moddle);
	};
};
var bpmn_standard_properties_module_default = {
	__init__: ["bpmnStandardProperties"],
	bpmnStandardProperties: ["type", BpmnStandardProperties]
};
//#endregion
export { BpmnStandardProperties, bpmn_standard_properties_module_default as default, withOrigin };

//# sourceMappingURL=bpmn-standard-properties-module.js.map
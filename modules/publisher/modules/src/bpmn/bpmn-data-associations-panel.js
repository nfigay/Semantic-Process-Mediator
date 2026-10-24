import { createElement as k } from "../../git/Semantic-Process-Mediator/node_modules/preact/dist/preact.module.js";
import { CheckboxEntry, SelectEntry, TextFieldEntry as TextfieldEntry, isSelectEntryEdited as isEdited$3 } from "../../git/Semantic-Process-Mediator/node_modules/@bpmn-io/properties-panel/dist/index.esm.js";
import { useService } from "../../git/Semantic-Process-Mediator/node_modules/bpmn-js-properties-panel/dist/index.esm.js";
import { addAssociationAssignment, addDataAssociation, associationCandidates, dataAssociations, removeAssociationAssignment, removeDataAssociation, setAssignmentExpression, setAssociationSourceMembership, setDataAssociationRef } from "./bpmn-data-associations.js";
//#region src/bpmn/bpmn-data-associations-panel.js
function ReferenceEntry({ element, id, kind, association, role }) {
	const modeling = useService("modeling");
	const registry = useService("elementRegistry");
	const local = element.businessObject.ioSpecification?.get(kind === "input" ? "dataInputs" : "dataOutputs") || [];
	const candidates = role === (kind === "input" ? "target" : "source") ? local : associationCandidates(element, kind, registry).filter((item) => !local.includes(item));
	return SelectEntry({
		element,
		id,
		label: `${role === "source" ? "Source" : "Target"} BPMN object`,
		getValue: () => (role === "source" ? association.sourceRef?.[0] : association.targetRef)?.id || "",
		getOptions: () => [{
			value: "",
			label: "(none)"
		}, ...candidates.map((item) => ({
			value: item.id,
			label: `${item.name || item.id} (${item.id})`
		}))],
		setValue: (value) => setDataAssociationRef(element, kind, association, role, candidates.find((item) => item.id === value), modeling, registry)
	});
}
function SourceMembershipEntry({ element, id, kind, association, reference }) {
	const modeling = useService("modeling");
	const registry = useService("elementRegistry");
	return CheckboxEntry({
		element,
		id,
		label: `${reference.name || reference.id} (${reference.id})`,
		getValue: () => (association.sourceRef || []).includes(reference),
		setValue: (value) => setAssociationSourceMembership(element, kind, association, reference, Boolean(value), modeling, registry)
	});
}
function ExpressionEntry({ element, id, kind, association, assignment, side }) {
	const modeling = useService("modeling");
	const factory = useService("bpmnFactory");
	const debounce = useService("debounceInput");
	return TextfieldEntry({
		element,
		id,
		label: side === "from" ? "From expression" : "To expression",
		getValue: () => assignment[side]?.body || "",
		setValue: (value) => setAssignmentExpression(element, kind, association, assignment, side, value, modeling, factory),
		debounce
	});
}
function AssociationsEntry({ element }) {
	const modeling = useService("modeling");
	const factory = useService("bpmnFactory");
	const registry = useService("elementRegistry");
	return k("div", { class: "bpmns-data-associations" }, ...["input", "output"].map((kind) => k("section", { key: kind }, k("strong", null, kind === "input" ? "Data input associations" : "Data output associations"), ...dataAssociations(element, kind).map((association) => {
		const local = element.businessObject.ioSpecification?.get(kind === "input" ? "dataInputs" : "dataOutputs") || [];
		const candidates = kind === "output" ? local : associationCandidates(element, kind, registry).filter((item) => !local.includes(item));
		const selected = association.sourceRef || [];
		const sources = [...new Set([...candidates, ...selected].filter(Boolean))];
		return k("div", { key: association.id }, k("span", null, association.id), k("strong", null, "Sources (multiple allowed)"), ...sources.map((reference) => k(SourceMembershipEntry, {
			key: reference.id,
			element,
			kind,
			association,
			reference,
			id: `bpmns-assoc-${association.id}-source-${reference.id}`
		})), k(ReferenceEntry, {
			element,
			kind,
			association,
			role: "target",
			id: `bpmns-assoc-${association.id}-target`
		}), k("strong", null, "Assignments"), ...(association.assignment || []).map((assignment, index) => k("div", { key: index }, k(ExpressionEntry, {
			element,
			kind,
			association,
			assignment,
			side: "from",
			id: `bpmns-assoc-${association.id}-assignment-${index}-from`
		}), k(ExpressionEntry, {
			element,
			kind,
			association,
			assignment,
			side: "to",
			id: `bpmns-assoc-${association.id}-assignment-${index}-to`
		}), k("button", {
			type: "button",
			onClick: () => removeAssociationAssignment(element, kind, association, assignment, modeling)
		}, "Remove assignment"))), k("button", {
			type: "button",
			onClick: () => addAssociationAssignment(element, kind, association, modeling, factory)
		}, "Add assignment"), k("button", {
			type: "button",
			onClick: () => removeDataAssociation(element, kind, association, modeling)
		}, "Remove association"));
	}), k("button", {
		type: "button",
		disabled: !(element.businessObject.ioSpecification?.get(kind === "input" ? "dataInputs" : "dataOutputs") || []).length,
		onClick: () => addDataAssociation(element, kind, modeling, factory, registry)
	}, `Add ${kind} association`))));
}
function appendDataAssociationsGroup(groups, element) {
	if (!element?.businessObject?.ioSpecification || groups.some((group) => group.id === "bpmns-data-associations")) return groups;
	return [...groups, {
		id: "bpmns-data-associations",
		label: "BPMN data associations",
		entries: [{
			id: "bpmns-data-associations-entry",
			element,
			component: AssociationsEntry,
			isEdited: isEdited$3
		}]
	}];
}
//#endregion
export { appendDataAssociationsGroup };

//# sourceMappingURL=bpmn-data-associations-panel.js.map
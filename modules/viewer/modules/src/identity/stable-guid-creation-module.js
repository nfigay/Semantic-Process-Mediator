import { createGuid } from "./guid-generator.js";
import { shouldGenerateStableGuid } from "./identity-policy.js";
//#region src/identity/stable-guid-creation-module.js
function getBusinessObject(element) {
	if (!element) return null;
	if (element.businessObject) return element.businessObject;
	if (element.$type) return element;
	return null;
}
function findSemArchMeta(businessObject) {
	return businessObject?.extensionElements?.values?.find((value) => value.$type === "semarch:Meta") || null;
}
function ensureStableGuid({ businessObject, moddle }) {
	if (!businessObject || !shouldGenerateStableGuid(businessObject)) return null;
	const existingMeta = findSemArchMeta(businessObject);
	if (existingMeta?.stableGuid) return existingMeta.stableGuid;
	const stableGuid = createGuid();
	if (existingMeta) {
		existingMeta.stableGuid = stableGuid;
		return stableGuid;
	}
	let extensionElements = businessObject.extensionElements;
	if (!extensionElements) {
		extensionElements = moddle.create("bpmn:ExtensionElements", { values: [] });
		businessObject.extensionElements = extensionElements;
	}
	const meta = moddle.create("semarch:Meta", { stableGuid });
	extensionElements.values.push(meta);
	return stableGuid;
}
function processElement({ element, moddle }) {
	const businessObject = getBusinessObject(element);
	if (!businessObject) return null;
	const stableGuid = ensureStableGuid({
		businessObject,
		moddle
	});
	if (businessObject.$type === "bpmn:Participant" && businessObject.processRef) ensureStableGuid({
		businessObject: businessObject.processRef,
		moddle
	});
	return stableGuid;
}
function processElements({ elements, moddle }) {
	if (!Array.isArray(elements)) return;
	elements.forEach((element) => processElement({
		element,
		moddle
	}));
}
var StableGuidCreation = class {
	constructor(eventBus, moddle) {
		eventBus.on("commandStack.shape.create.postExecute", (event) => {
			processElement({
				element: event.context?.shape,
				moddle
			});
		});
		eventBus.on("commandStack.elements.create.postExecute", (event) => {
			processElements({
				elements: event.context?.elements,
				moddle
			});
		});
		eventBus.on("commandStack.canvas.updateRoot.postExecute", (event) => {
			processElement({
				element: event.context?.newRoot,
				moddle
			});
		});
	}
};
StableGuidCreation.$inject = ["eventBus", "moddle"];
var stable_guid_creation_module_default = {
	__init__: ["semarchStableGuidCreation"],
	semarchStableGuidCreation: ["type", StableGuidCreation]
};
//#endregion
export { stable_guid_creation_module_default as default };

//# sourceMappingURL=stable-guid-creation-module.js.map
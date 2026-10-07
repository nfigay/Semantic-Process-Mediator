import { createBusinessObject } from "../model/business-object.js";
//#region src/extensions/business-objects.js
function getBusinessObjects(modeler) {
	return (modeler.getDefinitions()?.extensionElements?.values || []).filter((value) => value.$type === "semarch:BusinessObject").map((value) => createBusinessObject({
		id: value.id,
		typeRefs: (value.typeRefs || []).map((type) => type.typeRef)
	}));
}
function setBusinessObjects(modeler, businessObjects) {
	const moddle = modeler.get("moddle");
	const definitions = modeler.getDefinitions();
	const normalizedBusinessObjects = businessObjects.map((businessObject) => createBusinessObject(businessObject));
	if (!definitions.extensionElements) definitions.extensionElements = moddle.create("bpmn:ExtensionElements", { values: [] });
	const preservedValues = (definitions.extensionElements.values || []).filter((value) => value.$type !== "semarch:BusinessObject");
	const serializedBusinessObjects = normalizedBusinessObjects.map((businessObject) => moddle.create("semarch:BusinessObject", {
		id: businessObject.id,
		typeRefs: businessObject.typeRefs.map((typeRef) => moddle.create("semarch:BusinessObjectType", { typeRef }))
	}));
	definitions.extensionElements.values = [...preservedValues, ...serializedBusinessObjects];
	return normalizedBusinessObjects;
}
function projectBusinessObjects({ modeler, businessObjectStore } = {}) {
	if (!modeler || !businessObjectStore) throw new Error("projectBusinessObjects requires modeler and businessObjectStore");
	const businessObjects = getBusinessObjects(modeler);
	for (const businessObject of businessObjects) businessObjectStore.addBusinessObject(businessObject);
	return businessObjects;
}
function getBusinessObjectRepresentations(modeler) {
	return (modeler.getDefinitions()?.extensionElements?.values || []).filter((value) => value.$type === "semarch:BusinessObjectRepresentation").map((value) => ({
		businessObjectId: value.businessObjectRef,
		representationId: value.representationRef
	}));
}
function setBusinessObjectRepresentations(modeler, representations) {
	const moddle = modeler.get("moddle");
	const definitions = modeler.getDefinitions();
	if (!definitions.extensionElements) definitions.extensionElements = moddle.create("bpmn:ExtensionElements", { values: [] });
	const preservedValues = (definitions.extensionElements.values || []).filter((value) => value.$type !== "semarch:BusinessObjectRepresentation");
	const serializedRepresentations = representations.map((representation) => moddle.create("semarch:BusinessObjectRepresentation", {
		businessObjectRef: representation.businessObjectId,
		representationRef: representation.representationId
	}));
	definitions.extensionElements.values = [...preservedValues, ...serializedRepresentations];
	return representations;
}
function projectBusinessObjectRepresentations({ modeler, businessObjectStore, businessObjectRepresentationStore } = {}) {
	if (!modeler || !businessObjectStore || !businessObjectRepresentationStore) throw new Error("projectBusinessObjectRepresentations requires modeler, Business Object store and representation store");
	const representations = getBusinessObjectRepresentations(modeler);
	for (const representation of representations) {
		if (!businessObjectStore.getBusinessObject(representation.businessObjectId)) continue;
		businessObjectRepresentationStore.attach(representation);
	}
	return representations;
}
//#endregion
export { getBusinessObjectRepresentations, getBusinessObjects, projectBusinessObjectRepresentations, projectBusinessObjects, setBusinessObjectRepresentations, setBusinessObjects };

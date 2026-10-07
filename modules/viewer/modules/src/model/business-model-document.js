import { createBusinessModelResource } from "./business-model-resource.js";
//#region src/model/business-model-document.js
function projectBusinessModelDocument(resource) {
	requireResource(resource);
	return Object.freeze({
		identityOrigins: Object.freeze([...resource.getIdentityOrigins()]),
		businessObjects: Object.freeze([...resource.getBusinessObjects()]),
		businessRelations: Object.freeze([...resource.getBusinessRelations()]),
		businessObjectExternalIdentities: Object.freeze([...resource.getBusinessObjectExternalIdentities()])
	});
}
function createBusinessModelResourceFromDocument(document) {
	const normalizedDocument = normalizeDocument(document);
	const resource = createBusinessModelResource();
	for (const origin of normalizedDocument.identityOrigins) resource.addIdentityOrigin(origin);
	for (const businessObject of normalizedDocument.businessObjects) resource.addBusinessObject(businessObject);
	for (const businessRelation of normalizedDocument.businessRelations) resource.addBusinessRelation(businessRelation);
	for (const externalIdentity of normalizedDocument.businessObjectExternalIdentities) resource.attachExternalIdentity(externalIdentity);
	return resource;
}
function requireResource(resource) {
	if (!resource || [
		"getIdentityOrigins",
		"getBusinessObjects",
		"getBusinessRelations",
		"getBusinessObjectExternalIdentities"
	].some((method) => typeof resource[method] !== "function")) throw new Error("projectBusinessModelDocument requires a BusinessModelResource");
}
function normalizeDocument(document) {
	if (!document || typeof document !== "object") throw new Error("BusinessModelDocument requires an object");
	return {
		identityOrigins: requireCollection(document, "identityOrigins"),
		businessObjects: requireCollection(document, "businessObjects"),
		businessRelations: requireCollection(document, "businessRelations"),
		businessObjectExternalIdentities: requireCollection(document, "businessObjectExternalIdentities")
	};
}
function requireCollection(document, propertyName) {
	if (!Array.isArray(document[propertyName])) throw new Error(`BusinessModelDocument requires ${propertyName}[]`);
	return document[propertyName];
}
//#endregion
export { createBusinessModelResourceFromDocument, projectBusinessModelDocument };

//# sourceMappingURL=business-model-document.js.map
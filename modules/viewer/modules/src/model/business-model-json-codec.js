import { createBusinessModelResourceFromDocument, projectBusinessModelDocument } from "./business-model-document.js";
function parseBusinessModelDocumentJson(source) {
	if (typeof source !== "string") throw new Error("Business Model JSON source must be a string");
	let parsed;
	try {
		parsed = JSON.parse(source);
	} catch (error) {
		throw new Error(`Invalid Business Model JSON: ${error.message}`);
	}
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Business Model JSON requires an object");
	if (typeof parsed.formatVersion !== "string" || !parsed.formatVersion.trim()) throw new Error("Business Model JSON requires formatVersion");
	if (parsed.formatVersion !== "1") throw new Error(`Unsupported Business Model JSON formatVersion: ${parsed.formatVersion}`);
	return normalizeBusinessModelDocument({
		identityOrigins: parsed.identityOrigins,
		businessObjects: parsed.businessObjects,
		businessRelations: parsed.businessRelations,
		businessObjectExternalIdentities: parsed.businessObjectExternalIdentities
	});
}
function normalizeBusinessModelDocument(document) {
	const resource = createBusinessModelResourceFromDocument(document);
	return projectBusinessModelDocument(resource);
}
//#endregion
export { parseBusinessModelDocumentJson };

//# sourceMappingURL=business-model-json-codec.js.map
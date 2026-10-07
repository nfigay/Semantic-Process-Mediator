//#region src/model/business-object-representation.js
function createBusinessObjectRepresentation({ businessObjectId, representationId, documentId } = {}) {
	if (typeof businessObjectId !== "string" || !businessObjectId.trim()) throw new Error("BusinessObjectRepresentation requires a non-empty businessObjectId");
	if (typeof representationId !== "string" || !representationId.trim()) throw new Error("BusinessObjectRepresentation requires a non-empty representationId");
	if (documentId !== void 0 && (typeof documentId !== "string" || !documentId.trim())) throw new Error("BusinessObjectRepresentation requires documentId to be a non-empty string when provided");
	return Object.freeze({
		businessObjectId: businessObjectId.trim(),
		representationId: representationId.trim(),
		...documentId === void 0 ? {} : { documentId: documentId.trim() }
	});
}
//#endregion
export { createBusinessObjectRepresentation };

//# sourceMappingURL=business-object-representation.js.map
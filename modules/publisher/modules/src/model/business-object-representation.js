//#region src/model/business-object-representation.js
function createBusinessObjectRepresentation({ businessObjectId, representationId } = {}) {
	if (typeof businessObjectId !== "string" || !businessObjectId.trim()) throw new Error("BusinessObjectRepresentation requires a non-empty businessObjectId");
	if (typeof representationId !== "string" || !representationId.trim()) throw new Error("BusinessObjectRepresentation requires a non-empty representationId");
	return Object.freeze({
		businessObjectId: businessObjectId.trim(),
		representationId: representationId.trim()
	});
}
//#endregion
export { createBusinessObjectRepresentation };

//# sourceMappingURL=business-object-representation.js.map
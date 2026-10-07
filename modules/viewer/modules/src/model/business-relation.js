//#region src/model/business-relation.js
function createBusinessRelation({ sourceBusinessObjectId, targetBusinessObjectId, relationType } = {}) {
	if (typeof sourceBusinessObjectId !== "string" || !sourceBusinessObjectId.trim()) throw new Error("BusinessRelation requires a non-empty sourceBusinessObjectId");
	if (typeof targetBusinessObjectId !== "string" || !targetBusinessObjectId.trim()) throw new Error("BusinessRelation requires a non-empty targetBusinessObjectId");
	if (typeof relationType !== "string" || !relationType.trim()) throw new Error("BusinessRelation requires a non-empty relationType");
	return Object.freeze({
		sourceBusinessObjectId: sourceBusinessObjectId.trim(),
		targetBusinessObjectId: targetBusinessObjectId.trim(),
		relationType: relationType.trim()
	});
}
//#endregion
export { createBusinessRelation };

//# sourceMappingURL=business-relation.js.map
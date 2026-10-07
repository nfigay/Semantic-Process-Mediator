//#region src/model/business-object-type-resolver.js
function businessObjectHasSemanticType(businessObject, semanticTypeRef) {
	if (!semanticTypeRef) return false;
	return businessObject?.typeRefs?.includes(semanticTypeRef) || false;
}
//#endregion
export { businessObjectHasSemanticType };

//# sourceMappingURL=business-object-type-resolver.js.map
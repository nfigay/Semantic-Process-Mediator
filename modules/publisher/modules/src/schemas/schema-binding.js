//#region src/schemas/schema-binding.js
function createTypeBinding({ semanticType, schemaType, bpmnAnchor = null }) {
	if (!semanticType) throw new Error("TypeBinding requires semanticType");
	if (!schemaType) throw new Error("TypeBinding requires schemaType");
	return {
		semanticType,
		schemaType,
		bpmnAnchor
	};
}
function findTypeBinding(bindings, semanticType) {
	return bindings.find((binding) => binding.semanticType === semanticType) || null;
}
function findTypeBindingsBySchemaType(bindings, schemaType) {
	if (!schemaType) return [];
	return bindings.filter((binding) => binding.schemaType === schemaType);
}
//#endregion
export { createTypeBinding, findTypeBinding, findTypeBindingsBySchemaType };

//# sourceMappingURL=schema-binding.js.map
import { findTypeBinding } from "./schema-binding.js";
//#region src/schemas/schema-property-resolver.js
function findSchemaType(schemas, schemaTypeId) {
	if (!Array.isArray(schemas) || !schemaTypeId) return null;
	for (const schema of schemas) {
		const type = (schema?.types || []).find((candidate) => candidate.id === schemaTypeId);
		if (type) return {
			schema,
			type
		};
	}
	return null;
}
function findSchemaProperty(type, propertyId) {
	if (!type || !propertyId) return null;
	return (type.properties || []).find((property) => property.id === propertyId) || null;
}
function resolveSchemaProperty({ schemas = [], bindings = [], semanticTypes = [], propertyRef = null } = {}) {
	if (!propertyRef) return null;
	for (const semanticType of semanticTypes) {
		const semanticTypeRef = typeof semanticType === "string" ? semanticType : semanticType?.ref;
		if (!semanticTypeRef) continue;
		const binding = findTypeBinding(bindings, semanticTypeRef);
		if (!binding) continue;
		const resolvedType = findSchemaType(schemas, binding.schemaType);
		if (!resolvedType) continue;
		const property = findSchemaProperty(resolvedType.type, propertyRef);
		if (!property) continue;
		return {
			semanticType: semanticTypeRef,
			binding,
			schema: resolvedType.schema,
			type: resolvedType.type,
			property
		};
	}
	return null;
}
//#endregion
export { findSchemaProperty, findSchemaType, resolveSchemaProperty };

//#region src/properties/semarch-property-descriptors.js
function indexExistingProperties(dataProperties, businessObjectId = null, cocId = null) {
	const index = /* @__PURE__ */ new Map();
	const contextualAddressing = Boolean(businessObjectId && cocId);
	for (const dataProperty of dataProperties || []) {
		const propertyRef = dataProperty?.propertyRef || null;
		if (!propertyRef) continue;
		if (contextualAddressing && (dataProperty?.businessObjectRef !== businessObjectId || dataProperty?.cocRef !== cocId)) continue;
		index.set(propertyRef, dataProperty);
	}
	return index;
}
function findSchemaType(schemas, schemaTypeId) {
	if (!schemaTypeId) return null;
	for (const schema of schemas || []) for (const type of schema?.types || []) if (type.id === schemaTypeId) return {
		schema,
		type
	};
	return null;
}
function collectEffectiveProperties(schemas, schemaType, visited = /* @__PURE__ */ new Set()) {
	if (!schemaType) return [];
	const typeId = schemaType.id || null;
	if (typeId && visited.has(typeId)) return [];
	const nextVisited = new Set(visited);
	if (typeId) nextVisited.add(typeId);
	const properties = [];
	if (schemaType.baseType) {
		const base = findSchemaType(schemas, schemaType.baseType);
		if (base?.type) properties.push(...collectEffectiveProperties(schemas, base.type, nextVisited));
	}
	properties.push(...schemaType.properties || []);
	return properties;
}
function getProjectedPropertyRefs(businessView, semanticType) {
	if (!businessView) return null;
	const propertyRefs = /* @__PURE__ */ new Set();
	for (const projection of businessView.projections || []) {
		if (projection?.typeRef !== semanticType) continue;
		for (const propertyRef of projection.propertyRefs || []) propertyRefs.add(propertyRef);
	}
	return propertyRefs;
}
function collectSchemaProperties(profileRuntime, semanticTypeRefs, businessView) {
	if (!profileRuntime || typeof profileRuntime.getTypeBinding !== "function" || typeof profileRuntime.getSchemas !== "function") return [];
	const schemas = profileRuntime.getSchemas();
	const descriptors = [];
	for (const semanticType of semanticTypeRefs || []) {
		const binding = profileRuntime.getTypeBinding(semanticType);
		if (!binding?.schemaType) continue;
		const resolvedSchemaType = findSchemaType(schemas, binding.schemaType);
		if (!resolvedSchemaType) continue;
		const { schema, type: schemaType } = resolvedSchemaType;
		const projectedPropertyRefs = getProjectedPropertyRefs(businessView, semanticType);
		const properties = collectEffectiveProperties(schemas, schemaType);
		for (const property of properties) {
			if (projectedPropertyRefs && !projectedPropertyRefs.has(property?.id)) continue;
			descriptors.push({
				semanticType,
				schema,
				schemaType,
				property
			});
		}
	}
	return descriptors;
}
function createSemArchPropertyDescriptors({ profileRuntime, semanticTypeRefs = [], dataProperties = [], businessView = null, businessObjectId = null, cocId = null } = {}) {
	const existingIndex = indexExistingProperties(dataProperties, businessObjectId, cocId);
	const schemaProperties = collectSchemaProperties(profileRuntime, semanticTypeRefs, businessView);
	const descriptors = [];
	const seen = /* @__PURE__ */ new Set();
	for (const schemaEntry of schemaProperties) {
		const property = schemaEntry.property;
		const propertyRef = property?.id || null;
		if (!propertyRef || seen.has(propertyRef)) continue;
		seen.add(propertyRef);
		descriptors.push({
			propertyRef,
			semanticType: schemaEntry.semanticType,
			schema: schemaEntry.schema,
			schemaType: schemaEntry.schemaType,
			property,
			dataProperty: existingIndex.get(propertyRef) || null
		});
	}
	for (const dataProperty of dataProperties || []) {
		const propertyRef = dataProperty?.propertyRef || null;
		if (!propertyRef || seen.has(propertyRef)) continue;
		seen.add(propertyRef);
		descriptors.push({
			propertyRef,
			semanticType: null,
			schema: null,
			schemaType: null,
			property: null,
			dataProperty
		});
	}
	return descriptors;
}
//#endregion
export { createSemArchPropertyDescriptors };

//# sourceMappingURL=semarch-property-descriptors.js.map
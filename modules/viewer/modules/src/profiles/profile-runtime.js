import { createTypeBinding } from "../schemas/schema-binding.js";
import { resolveSchemaProperty } from "../schemas/schema-property-resolver.js";
//#region src/profiles/profile-runtime.js
function createProfileRuntime({ profile, loadedSchemas = [] } = {}) {
	if (!profile) throw new Error("Profile runtime requires a profile");
	const schemas = loadedSchemas.map((entry) => entry?.schema || entry);
	const typeBindings = createBindingsFromProfile(profile);
	function getTypes() {
		return [...profile.types || []];
	}
	function getType(semanticType) {
		if (!semanticType) return null;
		return (profile.types || []).find((type) => type.id === semanticType) || null;
	}
	function getTypeBindings() {
		return [...typeBindings];
	}
	function getTypeBinding(semanticType) {
		return typeBindings.find((binding) => binding.semanticType === semanticType) || null;
	}
	function getSchemas() {
		return [...schemas];
	}
	function resolveProperty({ semanticTypes = [], propertyRef = null } = {}) {
		return resolveSchemaProperty({
			schemas,
			bindings: typeBindings,
			semanticTypes,
			propertyRef
		});
	}
	return {
		profile,
		getTypes,
		getType,
		getTypeBindings,
		getTypeBinding,
		getSchemas,
		resolveProperty
	};
}
function createBindingsFromProfile(profile) {
	const bindings = [];
	for (const type of profile?.types || []) {
		if (!type.schemaType) continue;
		bindings.push(createTypeBinding({
			semanticType: type.id,
			schemaType: type.schemaType,
			bpmnAnchor: type.bpmnAnchor || null
		}));
	}
	return bindings;
}
//#endregion
export { createBindingsFromProfile, createProfileRuntime };

//#region src/schemas/schema-adapter.js
var SchemaAdapter = class {
	getTechnology() {
		throw new Error("SchemaAdapter.getTechnology() must be implemented");
	}
	getSpecification() {
		throw new Error("SchemaAdapter.getSpecification() must be implemented");
	}
	getCapabilities() {
		return [];
	}
	canRead() {
		return false;
	}
	async read() {
		throw new Error("SchemaAdapter.read() must be implemented");
	}
};
function createNormalizedSchema({ id, technology, specification, source = null, namespaces = {}, types = [] }) {
	return {
		id,
		technology,
		specification,
		source,
		namespaces,
		types
	};
}
function createNormalizedType({ id, name, kind = "type", baseType = null, properties = [], source = null }) {
	return {
		id,
		name,
		kind,
		baseType,
		properties,
		source
	};
}
function createNormalizedProperty({ id, name, kind = "data", datatype = null, nativeDatatype = null, datatypeRef = null, targetType = null, minOccurs = 0, maxOccurs = 1, source = null }) {
	return {
		id,
		name,
		kind,
		datatype,
		nativeDatatype,
		datatypeRef,
		targetType,
		minOccurs,
		maxOccurs,
		source
	};
}
//#endregion
export { SchemaAdapter, createNormalizedProperty, createNormalizedSchema, createNormalizedType };

//#region src/bpmn/bpmn-standard-scalar.js
/** Bulk scalar classification based on the effective moddle descriptor. */
var PRIMITIVES = /* @__PURE__ */ new Set([
	"String",
	"Integer",
	"Real",
	"Boolean"
]);
var RESERVED = /* @__PURE__ */ new Set([
	"id",
	"name",
	"documentation",
	"extensionElements",
	"extensionDefinitions"
]);
var NON_EDITABLE = /* @__PURE__ */ new Set([
	"incoming",
	"outgoing",
	"sourceRef",
	"targetRef",
	"laneSet",
	"flowElements",
	"flowNodeRef",
	"categoryValueRef"
]);
function classifyScalar(property, moddle) {
	if (!property || property.isMany || property.isReference || property.isVirtual || property.isDerived || property.isReadOnly) return null;
	if (RESERVED.has(property.name) || NON_EDITABLE.has(property.name)) return null;
	if (PRIMITIVES.has(property.type)) return property.type;
	try {
		const descriptor = moddle.getType(property.type)?.$descriptor;
		if (descriptor?.isEnum || descriptor?.literals) return "Enum";
	} catch {}
	return null;
}
function collectScalarProperties(moddle, type) {
	try {
		return ((moddle.getType(type)?.$descriptor)?.properties || []).map((property) => ({
			property,
			kind: classifyScalar(property, moddle)
		})).filter(({ kind }) => Boolean(kind));
	} catch {
		return [];
	}
}
function scalarValueToModdle(kind, value) {
	if (kind === "Boolean") return Boolean(value);
	if (value === "" || value === void 0 || value === null) return void 0;
	if (kind === "Integer" || kind === "Real") {
		const parsed = Number(value);
		if (!Number.isFinite(parsed) || kind === "Integer" && !Number.isInteger(parsed)) return null;
		return parsed;
	}
	return String(value);
}
//#endregion
export { classifyScalar, collectScalarProperties, scalarValueToModdle };

//# sourceMappingURL=bpmn-standard-scalar.js.map
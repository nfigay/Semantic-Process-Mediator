//#region src/bpmn/bpmn-property-inheritance.js
/**
* Resolve the declaring class from the live bpmn-moddle type descriptor.
* This is a bulk operation: no property-by-property inheritance table.
*/
function inheritedPropertyLabel(moddle, typeName, propertyName) {
	if (!moddle || !typeName || !propertyName) return null;
	try {
		const owner = ((moddle.getType(typeName)?.$descriptor)?.propertiesByName?.[propertyName])?.definedBy?.name;
		const selected = typeName.split(":").pop();
		if (!owner || owner.split(":").pop() === selected) return null;
		return `(${owner} · inherited)`;
	} catch {
		return null;
	}
}
//#endregion
export { inheritedPropertyLabel };

//# sourceMappingURL=bpmn-property-inheritance.js.map
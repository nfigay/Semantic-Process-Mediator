//#region src/model/datatype-runtime.js
var XSD_NAMESPACE = "http://www.w3.org/2001/XMLSchema";
var RuntimeDatatype = Object.freeze({
	STRING: "string",
	BOOLEAN: "boolean",
	INTEGER: "integer",
	DECIMAL: "decimal",
	DATE: "date",
	DATETIME: "datetime",
	UNKNOWN: "unknown"
});
var XSD_RUNTIME_DATATYPES = /* @__PURE__ */ new Map([
	["string", RuntimeDatatype.STRING],
	["boolean", RuntimeDatatype.BOOLEAN],
	["byte", RuntimeDatatype.INTEGER],
	["short", RuntimeDatatype.INTEGER],
	["int", RuntimeDatatype.INTEGER],
	["integer", RuntimeDatatype.INTEGER],
	["long", RuntimeDatatype.INTEGER],
	["nonNegativeInteger", RuntimeDatatype.INTEGER],
	["positiveInteger", RuntimeDatatype.INTEGER],
	["nonPositiveInteger", RuntimeDatatype.INTEGER],
	["negativeInteger", RuntimeDatatype.INTEGER],
	["decimal", RuntimeDatatype.DECIMAL],
	["float", RuntimeDatatype.DECIMAL],
	["double", RuntimeDatatype.DECIMAL],
	["date", RuntimeDatatype.DATE],
	["dateTime", RuntimeDatatype.DATETIME]
]);
function resolveRuntimeDatatype(datatypeRef) {
	if (!datatypeRef || !datatypeRef.localName) return RuntimeDatatype.UNKNOWN;
	if (datatypeRef.namespaceUri !== "http://www.w3.org/2001/XMLSchema") return RuntimeDatatype.UNKNOWN;
	return XSD_RUNTIME_DATATYPES.get(datatypeRef.localName) || RuntimeDatatype.UNKNOWN;
}
//#endregion
export { RuntimeDatatype, XSD_NAMESPACE, resolveRuntimeDatatype };

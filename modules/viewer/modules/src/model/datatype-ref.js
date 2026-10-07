//#region src/model/datatype-ref.js
function createDataTypeRef({ namespaceUri = null, localName } = {}) {
	if (typeof localName !== "string" || !localName.trim()) throw new Error("DataTypeRef requires a non-empty localName");
	if (namespaceUri !== null && typeof namespaceUri !== "string") throw new Error("DataTypeRef namespaceUri must be a string or null");
	return Object.freeze({
		namespaceUri: namespaceUri || null,
		localName: localName.trim()
	});
}
//#endregion
export { createDataTypeRef };

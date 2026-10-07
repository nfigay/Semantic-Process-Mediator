//#region src/model/business-object.js
function createBusinessObject({ id, typeRefs } = {}) {
	if (typeof id !== "string" || !id.trim()) throw new Error("BusinessObject requires a non-empty id");
	if (!Array.isArray(typeRefs) || typeRefs.length === 0) throw new Error("BusinessObject requires at least one typeRef");
	const normalizedTypeRefs = typeRefs.map((typeRef) => {
		if (typeof typeRef !== "string" || !typeRef.trim()) throw new Error("BusinessObject typeRefs must contain non-empty strings");
		return typeRef.trim();
	});
	return Object.freeze({
		id: id.trim(),
		typeRefs: Object.freeze(normalizedTypeRefs)
	});
}
//#endregion
export { createBusinessObject };

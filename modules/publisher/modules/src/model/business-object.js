//#region src/model/business-object.js
function createBusinessObject({ id, name, typeRefs } = {}) {
	if (typeof id !== "string" || !id.trim()) throw new Error("BusinessObject requires a non-empty id");
	if (!Array.isArray(typeRefs) || typeRefs.length === 0) throw new Error("BusinessObject requires at least one typeRef");
	const normalizedTypeRefs = typeRefs.map((typeRef) => {
		if (typeof typeRef !== "string" || !typeRef.trim()) throw new Error("BusinessObject typeRefs must contain non-empty strings");
		return typeRef.trim();
	});
	const normalizedName = typeof name === "string" && name.trim() ? name.trim() : null;
	return Object.freeze({
		id: id.trim(),
		...normalizedName ? { name: normalizedName } : {},
		typeRefs: Object.freeze(normalizedTypeRefs)
	});
}
//#endregion
export { createBusinessObject };

//# sourceMappingURL=business-object.js.map
//#region src/model/external-identity.js
function createExternalIdentity({ value, originRef } = {}) {
	if (typeof value !== "string" || value.length === 0) throw new Error("ExternalIdentity requires a non-empty value");
	if (typeof originRef !== "string" || !originRef.trim()) throw new Error("ExternalIdentity requires a non-empty originRef");
	return Object.freeze({
		value,
		originRef: originRef.trim()
	});
}
//#endregion
export { createExternalIdentity };

//# sourceMappingURL=external-identity.js.map
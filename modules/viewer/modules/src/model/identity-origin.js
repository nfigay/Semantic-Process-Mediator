//#region src/model/identity-origin.js
function createIdentityOrigin({ id, platformRef, systemRef, repositoryRef } = {}) {
	if (typeof id !== "string" || !id.trim()) throw new Error("IdentityOrigin requires a non-empty id");
	const normalizedPlatformRef = normalizeOptionalRef(platformRef, "platformRef");
	const normalizedSystemRef = normalizeOptionalRef(systemRef, "systemRef");
	const normalizedRepositoryRef = normalizeOptionalRef(repositoryRef, "repositoryRef");
	if (!normalizedPlatformRef && !normalizedSystemRef && !normalizedRepositoryRef) throw new Error("IdentityOrigin requires at least one origin dimension");
	return Object.freeze({
		id: id.trim(),
		...normalizedPlatformRef ? { platformRef: normalizedPlatformRef } : {},
		...normalizedSystemRef ? { systemRef: normalizedSystemRef } : {},
		...normalizedRepositoryRef ? { repositoryRef: normalizedRepositoryRef } : {}
	});
}
function normalizeOptionalRef(value, propertyName) {
	if (value === void 0 || value === null) return null;
	if (typeof value !== "string" || !value.trim()) throw new Error(`IdentityOrigin ${propertyName} must be a non-empty string when supplied`);
	return value.trim();
}
//#endregion
export { createIdentityOrigin };

//# sourceMappingURL=identity-origin.js.map
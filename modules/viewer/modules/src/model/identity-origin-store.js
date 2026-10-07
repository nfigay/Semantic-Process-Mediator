import { createIdentityOrigin } from "./identity-origin.js";
//#region src/model/identity-origin-store.js
function createIdentityOriginStore() {
	const identityOrigins = /* @__PURE__ */ new Map();
	function addIdentityOrigin(identityOrigin) {
		const normalizedOrigin = createIdentityOrigin(identityOrigin);
		if (identityOrigins.has(normalizedOrigin.id)) throw new Error(`IdentityOrigin already exists: ${normalizedOrigin.id}`);
		identityOrigins.set(normalizedOrigin.id, normalizedOrigin);
		return normalizedOrigin;
	}
	function getIdentityOrigin(identityOriginId) {
		if (typeof identityOriginId !== "string" || !identityOriginId.trim()) throw new Error("IdentityOriginStore requires a non-empty IdentityOrigin id");
		return identityOrigins.get(identityOriginId.trim()) || null;
	}
	function getIdentityOrigins() {
		return Array.from(identityOrigins.values());
	}
	function clear() {
		identityOrigins.clear();
	}
	return {
		addIdentityOrigin,
		getIdentityOrigin,
		getIdentityOrigins,
		clear
	};
}
//#endregion
export { createIdentityOriginStore };

//# sourceMappingURL=identity-origin-store.js.map
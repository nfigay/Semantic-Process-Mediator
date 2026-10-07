import { createExternalIdentity } from "./external-identity.js";
//#region src/model/business-object-external-identity-store.js
function createBusinessObjectExternalIdentityStore() {
	const identitiesByBusinessObject = /* @__PURE__ */ new Map();
	function attach({ businessObjectId, value, originRef } = {}) {
		const normalizedBusinessObjectId = normalizeBusinessObjectId(businessObjectId);
		const externalIdentity = createExternalIdentity({
			value,
			originRef
		});
		let identities = identitiesByBusinessObject.get(normalizedBusinessObjectId);
		if (!identities) {
			identities = /* @__PURE__ */ new Map();
			identitiesByBusinessObject.set(normalizedBusinessObjectId, identities);
		}
		const key = createExternalIdentityKey(externalIdentity);
		const link = Object.freeze({
			businessObjectId: normalizedBusinessObjectId,
			...externalIdentity
		});
		identities.set(key, link);
		return link;
	}
	function detach({ businessObjectId, value, originRef } = {}) {
		const normalizedBusinessObjectId = normalizeBusinessObjectId(businessObjectId);
		const externalIdentity = createExternalIdentity({
			value,
			originRef
		});
		const identities = identitiesByBusinessObject.get(normalizedBusinessObjectId);
		if (!identities) return null;
		const key = createExternalIdentityKey(externalIdentity);
		const detached = identities.get(key) || null;
		if (!detached) return null;
		identities.delete(key);
		if (identities.size === 0) identitiesByBusinessObject.delete(normalizedBusinessObjectId);
		return detached;
	}
	function getExternalIdentities(businessObjectId) {
		const normalizedBusinessObjectId = normalizeBusinessObjectId(businessObjectId);
		const identities = identitiesByBusinessObject.get(normalizedBusinessObjectId);
		if (!identities) return [];
		return Array.from(identities.values());
	}
	function getBusinessObjectExternalIdentities() {
		return Array.from(identitiesByBusinessObject.values()).flatMap((identities) => Array.from(identities.values()));
	}
	function clear() {
		identitiesByBusinessObject.clear();
	}
	return {
		attach,
		detach,
		getExternalIdentities,
		getBusinessObjectExternalIdentities,
		clear
	};
}
function normalizeBusinessObjectId(businessObjectId) {
	if (typeof businessObjectId !== "string" || !businessObjectId.trim()) throw new Error("BusinessObjectExternalIdentityStore requires a non-empty businessObjectId");
	return businessObjectId.trim();
}
function createExternalIdentityKey({ originRef, value }) {
	return JSON.stringify([originRef, value]);
}
//#endregion
export { createBusinessObjectExternalIdentityStore };

//# sourceMappingURL=business-object-external-identity-store.js.map
import { createBusinessObjectStore } from "./business-object-store.js";
import { createBusinessRelationStore } from "./business-relation-store.js";
import { createIdentityOrigin } from "./identity-origin.js";
import { createBusinessObjectExternalIdentityStore } from "./business-object-external-identity-store.js";
//#region src/model/business-model-resource.js
function createBusinessModelResource() {
	const businessObjectStore = createBusinessObjectStore();
	const businessRelationStore = createBusinessRelationStore();
	const externalIdentityStore = createBusinessObjectExternalIdentityStore();
	const identityOrigins = /* @__PURE__ */ new Map();
	function addIdentityOrigin(identityOrigin) {
		const normalizedOrigin = createIdentityOrigin(identityOrigin);
		if (identityOrigins.has(normalizedOrigin.id)) throw new Error(`IdentityOrigin already exists: ${normalizedOrigin.id}`);
		identityOrigins.set(normalizedOrigin.id, normalizedOrigin);
		return normalizedOrigin;
	}
	function getIdentityOrigin(identityOriginId) {
		if (typeof identityOriginId !== "string" || !identityOriginId.trim()) throw new Error("BusinessModelResource requires a non-empty IdentityOrigin id");
		return identityOrigins.get(identityOriginId.trim()) || null;
	}
	function getIdentityOrigins() {
		return Array.from(identityOrigins.values());
	}
	function clear() {
		businessObjectStore.clear();
		businessRelationStore.clear();
		externalIdentityStore.clear();
		identityOrigins.clear();
	}
	return {
		addBusinessObject: businessObjectStore.addBusinessObject,
		getBusinessObject: businessObjectStore.getBusinessObject,
		getBusinessObjects: businessObjectStore.getBusinessObjects,
		addBusinessRelation: businessRelationStore.addBusinessRelation,
		getBusinessRelation: businessRelationStore.getBusinessRelation,
		getBusinessRelations: businessRelationStore.getBusinessRelations,
		addIdentityOrigin,
		getIdentityOrigin,
		getIdentityOrigins,
		attachExternalIdentity: externalIdentityStore.attach,
		detachExternalIdentity: externalIdentityStore.detach,
		getExternalIdentities: externalIdentityStore.getExternalIdentities,
		getBusinessObjectExternalIdentities: externalIdentityStore.getBusinessObjectExternalIdentities,
		clear
	};
}
//#endregion
export { createBusinessModelResource };

//# sourceMappingURL=business-model-resource.js.map
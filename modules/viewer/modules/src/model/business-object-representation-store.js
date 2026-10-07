import { createBusinessObjectRepresentation } from "./business-object-representation.js";
//#region src/model/business-object-representation-store.js
function createBusinessObjectRepresentationStore() {
	const representationsByBusinessObject = /* @__PURE__ */ new Map();
	function attach(representation) {
		const normalizedRepresentation = createBusinessObjectRepresentation(representation);
		let representations = representationsByBusinessObject.get(normalizedRepresentation.businessObjectId);
		if (!representations) {
			representations = /* @__PURE__ */ new Map();
			representationsByBusinessObject.set(normalizedRepresentation.businessObjectId, representations);
		}
		const representationKey = normalizedRepresentation.documentId ? `${normalizedRepresentation.documentId}\u0000${normalizedRepresentation.representationId}` : normalizedRepresentation.representationId;
		representations.set(representationKey, normalizedRepresentation);
		return normalizedRepresentation;
	}
	function detach({ businessObjectId, representationId, documentId } = {}) {
		const normalizedRepresentation = createBusinessObjectRepresentation({
			businessObjectId,
			representationId,
			documentId
		});
		const representations = representationsByBusinessObject.get(normalizedRepresentation.businessObjectId);
		if (!representations) return null;
		const representationKey = normalizedRepresentation.documentId ? `${normalizedRepresentation.documentId}\u0000${normalizedRepresentation.representationId}` : normalizedRepresentation.representationId;
		const detached = representations.get(representationKey) || null;
		if (!detached) return null;
		representations.delete(representationKey);
		if (representations.size === 0) representationsByBusinessObject.delete(normalizedRepresentation.businessObjectId);
		return detached;
	}
	function getRepresentations(businessObjectId) {
		if (typeof businessObjectId !== "string" || !businessObjectId.trim()) throw new Error("BusinessObjectRepresentationStore requires a non-empty businessObjectId");
		const representations = representationsByBusinessObject.get(businessObjectId.trim());
		if (!representations) return [];
		return Array.from(representations.values());
	}
	function getBusinessObjectRepresentations() {
		return Array.from(representationsByBusinessObject.values()).flatMap((representations) => Array.from(representations.values()));
	}
	function getBusinessObjectRepresentationsByRepresentationId(representationId) {
		if (typeof representationId !== "string" || !representationId.trim()) throw new Error("BusinessObjectRepresentationStore requires a non-empty representationId");
		const normalizedRepresentationId = representationId.trim();
		return getBusinessObjectRepresentations().filter((representation) => representation.representationId === normalizedRepresentationId);
	}
	function clear() {
		representationsByBusinessObject.clear();
	}
	return {
		attach,
		detach,
		getRepresentations,
		getBusinessObjectRepresentations,
		getBusinessObjectRepresentationsByRepresentationId,
		clear
	};
}
//#endregion
export { createBusinessObjectRepresentationStore };

//# sourceMappingURL=business-object-representation-store.js.map
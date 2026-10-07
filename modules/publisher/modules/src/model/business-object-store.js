import { createBusinessObject } from "./business-object.js";
//#region src/model/business-object-store.js
function createBusinessObjectStore() {
	const businessObjects = /* @__PURE__ */ new Map();
	function addBusinessObject(businessObject) {
		const normalizedBusinessObject = createBusinessObject(businessObject);
		if (businessObjects.has(normalizedBusinessObject.id)) throw new Error(`BusinessObject already exists: ${normalizedBusinessObject.id}`);
		businessObjects.set(normalizedBusinessObject.id, normalizedBusinessObject);
		return normalizedBusinessObject;
	}
	function getBusinessObject(businessObjectId) {
		return businessObjects.get(businessObjectId) || null;
	}
	function getBusinessObjects() {
		return Array.from(businessObjects.values());
	}
	function removeBusinessObject(businessObjectId) {
		const businessObject = getBusinessObject(businessObjectId);
		if (!businessObject) return null;
		businessObjects.delete(businessObjectId);
		return businessObject;
	}
	function clear() {
		businessObjects.clear();
	}
	return {
		addBusinessObject,
		getBusinessObject,
		getBusinessObjects,
		removeBusinessObject,
		clear
	};
}
//#endregion
export { createBusinessObjectStore };

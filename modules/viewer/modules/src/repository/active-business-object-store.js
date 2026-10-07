//#region src/repository/active-business-object-store.js
function createActiveBusinessObjectStore({ activeRepository } = {}) {
	if (!activeRepository) throw new Error("Active Business Object store requires activeRepository");
	function resolveStore() {
		const store = activeRepository?.get?.()?.businessObjectStore || null;
		if (!store) throw new Error("Active Repository does not provide a Business Object store");
		return store;
	}
	function addBusinessObject(businessObject) {
		return resolveStore().addBusinessObject(businessObject);
	}
	function getBusinessObject(businessObjectId) {
		return resolveStore().getBusinessObject(businessObjectId);
	}
	function getBusinessObjects() {
		return resolveStore().getBusinessObjects();
	}
	function removeBusinessObject(businessObjectId) {
		return resolveStore().removeBusinessObject(businessObjectId);
	}
	function clear() {
		return resolveStore().clear();
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
export { createActiveBusinessObjectStore };

//# sourceMappingURL=active-business-object-store.js.map
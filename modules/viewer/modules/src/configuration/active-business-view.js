//#region src/configuration/active-business-view.js
function createActiveBusinessView(initialBusinessView = null) {
	let businessView = initialBusinessView || null;
	function get() {
		return businessView;
	}
	function set(nextBusinessView) {
		businessView = nextBusinessView || null;
		return businessView;
	}
	return {
		get,
		set
	};
}
//#endregion
export { createActiveBusinessView };

//# sourceMappingURL=active-business-view.js.map
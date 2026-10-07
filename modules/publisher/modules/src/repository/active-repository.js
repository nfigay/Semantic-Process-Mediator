//#region src/repository/active-repository.js
function createActiveRepository(initialRepository = null) {
	let repository = initialRepository || null;
	function get() {
		return repository;
	}
	function set(nextRepository) {
		repository = nextRepository || null;
		return repository;
	}
	return {
		get,
		set
	};
}
//#endregion
export { createActiveRepository };

//# sourceMappingURL=active-repository.js.map
//#region src/repository/repository-scope-transition.js
function createRepositoryScopeTransition({ repositoryScopeStore, activeRepository } = {}) {
	if (!repositoryScopeStore || typeof repositoryScopeStore.createRepository !== "function" || typeof repositoryScopeStore.removeRepository !== "function") throw new Error("Repository scope transition requires repositoryScopeStore");
	if (!activeRepository || typeof activeRepository.set !== "function") throw new Error("Repository scope transition requires activeRepository");
	async function prepareAndActivate({ repositoryId, prepare } = {}) {
		if (typeof prepare !== "function") throw new Error("Repository scope transition requires prepare()");
		const repository = repositoryScopeStore.createRepository(repositoryId);
		try {
			await prepare(repository);
			activeRepository.set(repository);
			return repository;
		} catch (error) {
			repositoryScopeStore.removeRepository(repositoryId);
			throw error;
		}
	}
	return { prepareAndActivate };
}
//#endregion
export { createRepositoryScopeTransition };

//# sourceMappingURL=repository-scope-transition.js.map
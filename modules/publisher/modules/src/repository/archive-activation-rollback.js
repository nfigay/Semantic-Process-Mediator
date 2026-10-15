//#region src/repository/archive-activation-rollback.js
async function activateArchiveWithRollback({ activeRepository, repositoryScopeStore, repositoryScopeTransition, repositoryId, prepare, project, rollback } = {}) {
	if (!activeRepository?.get || !repositoryScopeStore?.removeRepository || !repositoryScopeTransition?.prepareAndActivate || typeof prepare !== "function" || typeof project !== "function" || typeof rollback !== "function" || !repositoryId) throw new Error("Archive activation requires transition and rollback dependencies");
	const previousRepository = activeRepository.get();
	const repository = await repositoryScopeTransition.prepareAndActivate({
		repositoryId,
		prepare
	});
	try {
		return {
			repository,
			projection: await project(repository)
		};
	} catch (error) {
		try {
			if (!previousRepository || previousRepository.id === repositoryId) throw new Error("Previous Repository cannot be restored");
			if (!await rollback(previousRepository) || activeRepository.get() !== previousRepository) throw new Error("Rollback did not restore the previous Repository");
			repositoryScopeStore.removeRepository(repositoryId);
		} catch (rollbackError) {
			Object.defineProperty(error, "rollbackError", {
				value: rollbackError,
				configurable: true
			});
		}
		throw error;
	}
}
//#endregion
export { activateArchiveWithRollback };

//# sourceMappingURL=archive-activation-rollback.js.map
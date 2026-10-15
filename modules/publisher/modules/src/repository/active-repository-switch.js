import { restoreRepositoryActiveView } from "./repository-active-view-restoration.js";
//#region src/repository/active-repository-switch.js
async function switchActiveRepository({ repositoryId, repositoryScopeStore, activeRepository, diagramActions, showArchimate, clearEmptyView, renderRepositoryBrowser, refreshBusinessModelExplorer } = {}) {
	const repository = repositoryScopeStore?.getRepository?.(repositoryId) || null;
	if (!repository) return null;
	const previousRepository = activeRepository.get();
	activeRepository.set(repository);
	try {
		await restoreRepositoryActiveView({
			repository,
			diagramActions,
			showArchimate,
			clearEmptyView
		});
		await renderRepositoryBrowser?.();
		await refreshBusinessModelExplorer?.();
	} catch (error) {
		activeRepository.set(previousRepository);
		if (previousRepository && previousRepository !== repository) try {
			await restoreRepositoryActiveView({
				repository: previousRepository,
				diagramActions,
				showArchimate,
				clearEmptyView
			});
			await renderRepositoryBrowser?.();
			await refreshBusinessModelExplorer?.();
		} catch (rollbackError) {
			Object.defineProperty(error, "rollbackError", {
				value: rollbackError,
				configurable: true
			});
		}
		throw error;
	}
	return repository;
}
//#endregion
export { switchActiveRepository };

//# sourceMappingURL=active-repository-switch.js.map
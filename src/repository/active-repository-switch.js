import {
  restoreRepositoryActiveView
} from './repository-active-view-restoration.js'


export async function switchActiveRepository({
  repositoryId,
  repositoryScopeStore,
  activeRepository,
  diagramActions,
  showArchimate,
  clearEmptyView,
  renderRepositoryBrowser,
  refreshBusinessModelExplorer
} = {}) {

  const repository =
    repositoryScopeStore
      ?.getRepository?.(
        repositoryId
      ) ||
    null


  if (
    !repository
  ) {

    return null
  }


  const previousRepository = activeRepository.get()

  activeRepository.set(repository)

  try {
    await restoreRepositoryActiveView({
      repository,
      diagramActions,
      showArchimate,
      clearEmptyView
    })

    // A rendering exception and an explorer refresh exception must both
    // be treated as failed Repository transitions.
    await renderRepositoryBrowser?.()
    await refreshBusinessModelExplorer?.()
  } catch (error) {
    activeRepository.set(previousRepository)

    if (previousRepository && previousRepository !== repository) {
      try {
        await restoreRepositoryActiveView({
          repository: previousRepository,
          diagramActions,
          showArchimate,
          clearEmptyView
        })
        await renderRepositoryBrowser?.()
        await refreshBusinessModelExplorer?.()
      } catch (rollbackError) {
        // Do not replace the original failure with the rollback failure.
        Object.defineProperty(error, 'rollbackError', {
          value: rollbackError,
          configurable: true
        })
      }
    }

    throw error
  }

  return repository
}

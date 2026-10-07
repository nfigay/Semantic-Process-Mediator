import {
  restoreRepositoryActiveView
} from './repository-active-view-restoration.js'


export async function switchActiveRepository({
  repositoryId,
  repositoryScopeStore,
  activeRepository,
  diagramActions,
  showArchimate,
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


  activeRepository.set(
    repository
  )


  await restoreRepositoryActiveView({
    repository,
    diagramActions,
    showArchimate
  })


  renderRepositoryBrowser?.()

  refreshBusinessModelExplorer?.()


  return repository
}

// A failed post-activation projection must never silently leave B active.
export async function activateArchiveWithRollback({
  activeRepository, repositoryScopeStore, repositoryScopeTransition,
  repositoryId, prepare, project, rollback
} = {}) {
  if (!activeRepository?.get || !repositoryScopeStore?.removeRepository ||
      !repositoryScopeTransition?.prepareAndActivate ||
      typeof prepare !== 'function' || typeof project !== 'function' ||
      typeof rollback !== 'function' || !repositoryId) {
    throw new Error('Archive activation requires transition and rollback dependencies')
  }
  const previousRepository = activeRepository.get()
  // The existing transition removes a failed candidate during preparation.
  const repository = await repositoryScopeTransition.prepareAndActivate({ repositoryId, prepare })
  try {
    const projection = await project(repository)
    return { repository, projection }
  } catch (error) {
    try {
      if (!previousRepository || previousRepository.id === repositoryId) {
        throw new Error('Previous Repository cannot be restored')
      }
      const restored = await rollback(previousRepository)
      if (!restored || activeRepository.get() !== previousRepository) {
        throw new Error('Rollback did not restore the previous Repository')
      }
      repositoryScopeStore.removeRepository(repositoryId)
    } catch (rollbackError) {
      Object.defineProperty(error, 'rollbackError', {
        value: rollbackError, configurable: true
      })
      // Preserve the candidate when rollback fails, for diagnosis.
    }
    throw error
  }
}

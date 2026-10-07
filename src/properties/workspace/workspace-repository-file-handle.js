/*
 * Resolve a RepositoryDocument.fileName inside an active Direct Folder
 * Workspace without allowing the repository path to escape that folder.
 *
 * Repository paths are portable, slash-separated relative paths. Existing
 * directories/files are reused; create=true materializes missing path
 * segments through the File System Access API.
 */

export function normalizeWorkspaceRepositoryPath(
  repositoryPath
) {

  if (
    typeof repositoryPath !== 'string' ||
    !repositoryPath.trim()
  ) {
    throw new Error(
      'Repository path must be a non-empty relative path'
    )
  }


  if (
    repositoryPath.startsWith('/') ||
    repositoryPath.includes('\\') ||
    repositoryPath.includes('\0')
  ) {
    throw new Error(
      `Unsafe Repository path: ${repositoryPath}`
    )
  }


  const segments =
    repositoryPath.split('/')


  if (
    segments.some(
      segment =>
        !segment ||
        segment === '.' ||
        segment === '..'
    )
  ) {
    throw new Error(
      `Unsafe Repository path: ${repositoryPath}`
    )
  }


  return segments
}


export async function resolveWorkspaceRepositoryFileHandle({
  directoryHandle,
  repositoryPath,
  create = false
}) {

  if (
    !directoryHandle ||
    typeof directoryHandle.getFileHandle !== 'function' ||
    typeof directoryHandle.getDirectoryHandle !== 'function'
  ) {
    throw new Error(
      'Direct Folder Workspace requires a directory handle'
    )
  }


  const segments =
    normalizeWorkspaceRepositoryPath(
      repositoryPath
    )


  const fileName =
    segments.at(-1)

  let parentHandle =
    directoryHandle


  for (
    const directoryName
    of segments.slice(0, -1)
  ) {
    parentHandle =
      await parentHandle.getDirectoryHandle(
        directoryName,
        { create }
      )
  }


  return parentHandle.getFileHandle(
    fileName,
    { create }
  )
}

import {
  WORKSPACE_METADATA_PATH,
  createWorkspaceState,
  createWorkspaceMetadata,
  readWorkspaceMetadata,
  applyWorkspaceMetadata,
  readRepositoryFolderResources,
  resolveWorkspaceRepositoryFileHandle,
  materializeRepositoryResources,
  createRepositoryWorkspaceArchive,
  readRepositoryWorkspaceArchive
} from './workspace-runtime.js'

function downloadBytes(bytes, fileName) {
  const blob = new Blob([bytes], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function archiveName(name) {
  const stem = String(name || 'BPMNSM Workspace').trim().replace(/[^a-z0-9._-]+/gi, '-') || 'BPMNSM-Workspace'
  return `${stem}.zip`
}

function isDirectWorkspacePermissionDenied(error) {
  return error?.name === 'NotAllowedError'
}

function isDirectWorkspaceCancelled(error) {
  return error?.name === 'AbortError'
}

function handleDirectWorkspaceError(error) {
  if (isDirectWorkspaceCancelled(error)) return null
  if (!isDirectWorkspacePermissionDenied(error)) throw error

  window.sessionStorage?.setItem(
    'bpmnsm.directWorkspaceDenied',
    '1'
  )

  window.alert(
    'Direct Workspace Folder access is not authorized in this browser context.\n\n' +
    'Use Open Workspace Archive… / Save Workspace Archive… instead.'
  )

  window.location.reload()
  return null
}

export function createWorkspaceActions({
  repositoryDocumentStore,
  repositoryBrowser,
  createDocumentId,
  loadBpmn,
  showArchimate,
  getRepository = null,
  activateArchive = null,
  authorizeArchiveActivation = null
}) {
  const workspace = getRepository ? null : createWorkspaceState()

  function resolveWorkspace() {
    if (!getRepository) return { workspace, repositoryDocumentStore }
    const repository = getRepository()
    if (!repository?.workspace || !repository?.documents) {
      throw new Error('No active Workspace Repository is available')
    }
    return { workspace: repository.workspace, repositoryDocumentStore: repository.documents }
  }

  function ensureMetadata(workspace) {
    const now = new Date().toISOString()
    workspace.workspaceId ||= globalThis.crypto?.randomUUID?.() || `workspace-${Date.now()}`
    workspace.createdAt ||= now
    workspace.savedAt = now
    workspace.snapshotIteration = Math.max(1, Number(workspace.snapshotIteration || 0) + 1)
    return createWorkspaceMetadata({
      workspaceId: workspace.workspaceId,
      createdAt: workspace.createdAt,
      savedAt: workspace.savedAt,
      name: workspace.name,
      description: workspace.description || '',
      snapshotIteration: workspace.snapshotIteration
    })
  }

  async function activateResources(resources, { directoryHandle = null, fileHandles = new Map(), mode = 'archive', fallbackName = null } = {}) {
    const { workspace, repositoryDocumentStore } = resolveWorkspace()
    const metadata = readWorkspaceMetadata(resources)
    const modelResources = resources.filter(resource => resource.path !== WORKSPACE_METADATA_PATH)

    repositoryDocumentStore.clear()
    const documents = materializeRepositoryResources({
      resources: modelResources,
      repositoryDocumentStore,
      createDocumentId
    })

    workspace.mode = mode
    workspace.directoryHandle = directoryHandle
    workspace.fileHandles = fileHandles
    workspace.resourceInventory = resources.map(resource => resource.path)
    if (metadata) applyWorkspaceMetadata(workspace, metadata)
    else if (fallbackName) workspace.name = fallbackName

    const first = documents[0] || null
    if (first) {
      repositoryDocumentStore.setActiveDocument(first.id)
      if (first.kind === 'archimate') await showArchimate({ xml: first.content, documentId: first.id })
      else await loadBpmn(first.content)
    }
    repositoryBrowser.render()
    return documents
  }

  async function openFolder() {
    if (typeof window.showDirectoryPicker !== 'function') throw new Error('Workspace folder access is unavailable in this browser')

    try {
      const directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
      const { resources, fileHandles } = await readRepositoryFolderResources(directoryHandle)
      return activateResources(resources, { directoryHandle, fileHandles, mode: 'folder', fallbackName: directoryHandle.name })
    } catch (error) {
      return handleDirectWorkspaceError(error)
    }
  }

  async function saveFolder() {
    const { workspace, repositoryDocumentStore } = resolveWorkspace()
    if (!workspace.directoryHandle) throw new Error('No Workspace Folder is active')
    for (const document of repositoryDocumentStore.getDocuments()) {
      const handle = await resolveWorkspaceRepositoryFileHandle({
        directoryHandle: workspace.directoryHandle,
        repositoryPath: document.fileName,
        create: true
      })
      const writable = await handle.createWritable()
      await writable.write(document.content || '')
      await writable.close()
      const physicalFile = await handle.getFile()
      const physicalContent = await physicalFile.text()
      if (physicalContent !== (document.content || '')) {
        throw new Error('Physical workspace content does not match RepositoryDocument content after save')
      }
      repositoryDocumentStore.updateDocument(document.id, { dirty: false })
    }
    const metadata = ensureMetadata(workspace)
    const metadataHandle = await resolveWorkspaceRepositoryFileHandle({
      directoryHandle: workspace.directoryHandle,
      repositoryPath: WORKSPACE_METADATA_PATH,
      create: true
    })
    const writable = await metadataHandle.createWritable()
    await writable.write(`${JSON.stringify(metadata, null, 2)}\n`)
    await writable.close()
    repositoryBrowser.render()
  }

  // Save As only accepts an empty destination: no pre-existing entry can be overwritten.
  // Association and logical metadata are committed after physical readback succeeds.
  async function saveAsFolder() {
    if (typeof window?.showDirectoryPicker !== 'function') {
      throw new Error('Workspace folder access is unavailable in this browser')
    }
    const directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
    if (!directoryHandle) return false
    if (typeof directoryHandle.values !== 'function') {
      throw new Error('The selected Workspace Folder cannot be inspected')
    }
    for await (const _entry of directoryHandle.values()) {
      throw new Error('Choose an empty folder to avoid overwriting existing files')
    }

    const { workspace, repositoryDocumentStore } = resolveWorkspace()
    const documents = repositoryDocumentStore.getDocuments()
    const paths = new Set([WORKSPACE_METADATA_PATH.toLowerCase()])
    for (const document of documents) {
      const path = String(document.fileName || '')
      const segments = path.split('/')
      if (!path || segments.some(segment => !segment || segment === '.' || segment === '..' || segment === '.bpmnsm')) {
        throw new Error('A Workspace document has an unsafe file path')
      }
      const key = path.toLowerCase()
      if (paths.has(key)) throw new Error('Workspace documents contain conflicting file paths')
      paths.add(key)
    }

    const draft = { ...workspace }
    const metadata = ensureMetadata(draft)
    const writes = documents.map(document => ({ path: document.fileName, content: document.content || '' }))
    writes.push({ path: WORKSPACE_METADATA_PATH, content: `${JSON.stringify(metadata, null, 2)}\n` })
    for (const file of writes) {
      const handle = await resolveWorkspaceRepositoryFileHandle({
        directoryHandle, repositoryPath: file.path, create: true
      })
      const writable = await handle.createWritable()
      await writable.write(file.content)
      await writable.close()
      if (await (await handle.getFile()).text() !== file.content) {
        throw new Error('Physical Workspace Folder verification failed')
      }
    }
    // Keep the previous logical association unchanged on write/readback failure.
    Object.assign(workspace, {
      mode: 'folder', directoryHandle, fileHandles: new Map(),
      resourceInventory: writes.map(file => file.path),
      workspaceId: draft.workspaceId, createdAt: draft.createdAt,
      savedAt: draft.savedAt, snapshotIteration: draft.snapshotIteration
    })
    for (const document of documents) repositoryDocumentStore.updateDocument(document.id, { dirty: false })
    repositoryBrowser.render()
    return true
  }

  function saveArchive() {
    const { workspace, repositoryDocumentStore } = resolveWorkspace()
    const metadata = ensureMetadata(workspace)
    const documents = repositoryDocumentStore.getDocuments().map(document => ({
      fileName: document.fileName,
      content: document.content || '',
      dirty: document.dirty
    }))
    const bytes = createRepositoryWorkspaceArchive(documents, { includeClean: true, workspaceMetadata: metadata })
    downloadBytes(bytes, archiveName(workspace.name))
  }

  function openArchive() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.zip,application/zip'
    input.addEventListener('change', async () => {
      try {
        const file = input.files?.[0]
        if (!file) return
        const resources = readRepositoryWorkspaceArchive(new Uint8Array(await file.arrayBuffer()))
        const fallbackName = file.name.replace(/\.zip$/i, '')
        // Archive must be parsed before asking permission, and the active
        // Repository must not be changed until authorization is granted.
        if (authorizeArchiveActivation) {
          const decision = await authorizeArchiveActivation()
          if (decision?.authorized !== true) return
        }
        if (activateArchive) {
          await activateArchive(resources, { fallbackName })
        } else {
          await activateResources(resources, { mode: 'archive', fallbackName })
        }
      } catch (error) {
        try {
          console.error('[Workspace Archive Open Failed]', error)
        } catch {
          // Terminal UI reporting must not create another rejection.
        }
      }
    }, { once: true })
    input.click()
  }

  function rename() {
    const { workspace } = resolveWorkspace()
    const value = window.prompt('Workspace name', workspace.name)
    if (typeof value === 'string' && value.trim()) workspace.name = value.trim()
  }

  function manifest() {
    const { workspace } = resolveWorkspace()
    window.alert(JSON.stringify({
      mode: workspace.mode,
      name: workspace.name,
      workspaceId: workspace.workspaceId,
      createdAt: workspace.createdAt,
      savedAt: workspace.savedAt,
      snapshotIteration: workspace.snapshotIteration,
      resources: workspace.resourceInventory
    }, null, 2))
  }

  return { get workspace() { return resolveWorkspace().workspace }, openFolder, openArchive, saveFolder, saveAsFolder, saveArchive, rename, manifest }
}

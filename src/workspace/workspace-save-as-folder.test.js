import { afterEach, describe, expect, it, vi } from 'vitest'
import { createWorkspaceActions } from './workspace-actions.js'

const originalWindow = globalThis.window

afterEach(() => {
  if (originalWindow === undefined) delete globalThis.window
  else globalThis.window = originalWindow
  vi.restoreAllMocks()
})

function fakeFolder({ failReadback = false, occupied = false } = {}) {
  const files = new Map()
  const directory = (name = 'chosen') => ({
    name,
    kind: 'directory',
    async *values() { if (occupied) yield { name: 'existing.txt', kind: 'file' } },
    async getDirectoryHandle(part) { return directory(part) },
    async getFileHandle(part) {
      const entry = {
        data: '',
        async createWritable() {
          return { write: async value => { entry.data = value }, close: async () => {} }
        },
        async getFile() {
          return { text: async () => failReadback ? 'corrupted' : entry.data }
        }
      }
      files.set(part, entry)
      return entry
    }
  })
  return { handle: directory(), files }
}

function fixture(folder) {
  const documents = [{ id: 'doc1', fileName: 'Process.bpmn', content: '<xml/>', dirty: true }]
  const updateDocument = vi.fn()
  const workspace = {
    mode: 'archive', workspaceId: 'ws-1', name: 'Workspace', description: 'Details',
    createdAt: '2026-10-14T00:00:00.000Z', savedAt: '2026-10-14T00:00:00.000Z',
    snapshotIteration: 2, directoryHandle: null
  }
  const render = vi.fn()
  globalThis.window = { showDirectoryPicker: vi.fn().mockResolvedValue(folder.handle) }
  const actions = createWorkspaceActions({
    getRepository: () => ({ workspace, documents: { getDocuments: () => documents, updateDocument } }),
    repositoryBrowser: { render }, createDocumentId: () => 'doc1',
    loadBpmn: async () => {}, showArchimate: async () => {}
  })
  return { actions, workspace, updateDocument, render }
}

describe('Save Workspace As Folder', () => {
  it('writes and verifies before associating the destination', async () => {
    const f = fixture(fakeFolder())
    await expect(f.actions.saveAsFolder()).resolves.toBe(true)
    expect(f.workspace.mode).toBe('folder')
    expect(f.workspace.workspaceId).toBe('ws-1')
    expect(f.workspace.description).toBe('Details')
    expect(f.workspace.snapshotIteration).toBe(3)
    expect(f.updateDocument).toHaveBeenCalledWith('doc1', { dirty: false })
    expect(f.render).toHaveBeenCalledTimes(1)
  })
  it('does not write or associate a non-empty folder', async () => {
    const folder = fakeFolder({ occupied: true })
    const f = fixture(folder)
    await expect(f.actions.saveAsFolder()).rejects.toThrow('empty folder')
    expect(folder.files.size).toBe(0)
    expect(f.workspace.mode).toBe('archive')
    expect(f.updateDocument).not.toHaveBeenCalled()
  })
  it('does not change logical state after failed physical verification', async () => {
    const f = fixture(fakeFolder({ failReadback: true }))
    await expect(f.actions.saveAsFolder()).rejects.toThrow('verification failed')
    expect(f.workspace.mode).toBe('archive')
    expect(f.workspace.snapshotIteration).toBe(2)
    expect(f.updateDocument).not.toHaveBeenCalled()
  })
})

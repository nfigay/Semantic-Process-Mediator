import { afterEach, describe, expect, it, vi } from 'vitest';
import { createWorkspaceActions } from './workspace-actions.js';
import { createRepositoryWorkspaceArchive } from './workspace-runtime.js';
import { createRepositoryDocumentStore } from '../repository/repository-document-store.js';

async function settleCall(call) {
  try { return { status: 'fulfilled', value: await call() }; }
  catch (reason) { return { status: 'rejected', reason }; }
}

function arrange() {
  let change;
  const input = {
    files: [],
    addEventListener: vi.fn((name, callback) => {
      if (name === 'change') change = callback;
    }),
    click: vi.fn(),
  };
  vi.stubGlobal('document', { createElement: vi.fn(() => input) });
  const alert = vi.fn();
  vi.stubGlobal('window', { alert });
  const store = createRepositoryDocumentStore();
  const old = store.addDocument({
    id: 'old', fileName: 'old.bpmn', kind: 'bpmn',
    content: '<old/>', dirty: true,
  });
  store.setActiveDocument(old.id);
  const render = vi.fn();
  const loadBpmn = vi.fn().mockResolvedValue(undefined);
  const showArchimate = vi.fn().mockResolvedValue(undefined);
  const logger = vi.spyOn(console, 'error').mockImplementation(() => {});
  const actions = createWorkspaceActions({
    repositoryDocumentStore: store,
    repositoryBrowser: { render },
    createDocumentId: () => 'imported',
    loadBpmn, showArchimate,
  });
  const beforeDocuments = structuredClone(store.getDocuments());
  const beforeWorkspace = structuredClone(actions.workspace);
  actions.openArchive();
  const bytes = createRepositoryWorkspaceArchive([{
    fileName: 'sample.bpmn', content: '<definitions/>', dirty: false,
  }], { includeClean: true });
  const file = { name: 'sample.zip', arrayBuffer: vi.fn(async () => bytes.buffer) };
  input.files = [file];
  return {
    input, change, file, bytes, actions, store, old, render,
    loadBpmn, showArchimate, alert, logger,
    beforeDocuments, beforeWorkspace,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('CODEX-05A real openArchive event / real archive materialization', () => {
  it('completes archive loading with exact XML and one final render', async () => {
    const h = arrange();
    const result = await settleCall(h.change);
    expect(result.status).toBe('fulfilled');
    expect(h.file.arrayBuffer).toHaveBeenCalledTimes(1);
    expect(h.loadBpmn).toHaveBeenCalledExactlyOnceWith('<definitions/>');
    expect(h.showArchimate).not.toHaveBeenCalled();
    expect(h.render).toHaveBeenCalledTimes(1);
    expect(h.store.getDocument('old')).toBeNull();
    expect(h.store.getActiveDocument()?.id).toBe('imported');
    expect(h.actions.workspace.mode).toBe('archive');
    expect(h.actions.workspace.name).toBe('sample');
    expect(h.actions.workspace.resourceInventory).toEqual(['sample.bpmn']);
    expect(h.alert).not.toHaveBeenCalled();
    expect(h.logger).not.toHaveBeenCalled();
  });

  it('consumes read failure before import without materializing or replacing documents', async () => {
    const h = arrange();
    const sentinel = new Error('file read rejected');
    h.file.arrayBuffer.mockRejectedValue(sentinel);
    const result = await settleCall(h.change);
    expect.soft(result.status).toBe('fulfilled');
    expect.soft(h.logger).toHaveBeenCalledExactlyOnceWith('[Workspace Archive Open Failed]', sentinel);
    expect.soft(h.loadBpmn).not.toHaveBeenCalled();
    expect.soft(h.render).not.toHaveBeenCalled();
    expect.soft(h.store.getDocuments()).toEqual(h.beforeDocuments);
    expect.soft(h.store.getDocument('old')).toBe(h.old);
    expect.soft(h.actions.workspace).toEqual(h.beforeWorkspace);
    expect.soft(h.alert).not.toHaveBeenCalled();
  });

  it('consumes load rejection after materialization without pretending rollback', async () => {
    const h = arrange();
    const sentinel = new Error('load rejected');
    h.loadBpmn.mockImplementation(() => {
      h.alert('Unable to import BPMN diagram');
      return Promise.reject(sentinel);
    });
    const result = await settleCall(h.change);
    expect.soft(result.status).toBe('fulfilled');
    expect.soft(h.logger).toHaveBeenCalledExactlyOnceWith('[Workspace Archive Open Failed]', sentinel);
    expect.soft(h.loadBpmn).toHaveBeenCalledExactlyOnceWith('<definitions/>');
    expect.soft(h.render).not.toHaveBeenCalled();
    expect.soft(h.store.getDocument('old')).toBeNull();
    expect.soft(h.store.getDocument('imported')).toMatchObject({
      id: 'imported', fileName: 'sample.bpmn', content: '<definitions/>', dirty: false,
    });
    expect.soft(h.store.getActiveDocument()?.id).toBe('imported');
    expect.soft(h.actions.workspace.mode).toBe('archive');
    expect.soft(h.actions.workspace.name).toBe('sample');
    expect.soft(h.alert).toHaveBeenCalledTimes(1);
  });

  it('does not let failed terminal logging escape the archive event', async () => {
    const h = arrange();
    h.file.arrayBuffer.mockRejectedValue(new Error('read rejected'));
    h.logger.mockImplementation(() => { throw new Error('logger'); });
    const result = await settleCall(h.change);
    expect(result.status).toBe('fulfilled');
    expect(h.loadBpmn).not.toHaveBeenCalled();
  });
});

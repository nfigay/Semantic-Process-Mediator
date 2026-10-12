// @vitest-environment jsdom
// Candidate only. createApp and its callbacks stay real; constructor dependencies
// capture the callbacks, never replace handleRepositorySelection.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRepositoryScopeStore } from '../repository/repository-scope-store.js';
import { createActiveRepository } from '../repository/active-repository.js';

const h = vi.hoisted(() => ({
  repositoryOptions: null, contextOptions: null, diagramOptions: null,
  dialogOptions: null, modeler: null, layout: null,
  diagramRender: vi.fn(), central: vi.fn(), props: null,
  resolvedView: null,
}));
vi.mock('../ui/layout.js', () => ({ createLayout: vi.fn(() => h.layout) }));
vi.mock('../ui/toolbar.js', () => ({ createToolbar: vi.fn(() => ({})) }));
vi.mock('../ui/lint-panel.js', () => ({
  createLintPanel: vi.fn(), createLintRenderer: vi.fn(() => vi.fn()),
}));
vi.mock('../ui/read-only-properties-panel.js', () => ({
  createReadOnlyPropertiesPanel: vi.fn(() => ({})),
}));
vi.mock('../ui/diagram-properties-panel.js', () => ({
  createDiagramPropertiesPanel: vi.fn(() => h.props),
}));
vi.mock('../ui/visual-properties-panel.js', () => ({
  createVisualPropertiesPanel: vi.fn(() => ({ show: vi.fn(), hide: vi.fn() })),
}));
vi.mock('../bpmn/create-bpmn-engine.js', () => ({
  createBpmnEngine: vi.fn(() => h.modeler),
}));
vi.mock('../ui/repository-browser.js', () => ({
  createRepositoryBrowser: vi.fn(options => {
    h.repositoryOptions = options;
    return {
      sidebar: {}, setView: vi.fn(), render: vi.fn(),
      getSearchQuery: vi.fn(() => ''), setSearchQuery: vi.fn(),
    };
  }),
}));
vi.mock('../ui/workspace-contexts-browser.js', () => ({
  createWorkspaceContextsBrowser: vi.fn(options => {
    h.contextOptions = options;
    return {
      render: vi.fn(), getSearchQuery: vi.fn(() => ''), setSearchQuery: vi.fn(),
    };
  }),
}));
vi.mock('../ui/workspace-tree-search.js', () => ({
  createWorkspaceTreeSearch: vi.fn(() => ({ setContext: vi.fn() })),
}));
vi.mock('../ui/diagram-browser.js', () => ({
  createDiagramBrowser: vi.fn(options => {
    h.diagramOptions = options;
    return { render: h.diagramRender };
  }),
}));
vi.mock('../ui/repository-view-dialog.js', () => ({
  openRepositoryViewDialog: vi.fn(options => { h.dialogOptions = options; }),
}));
vi.mock('../ui/repository-membership-menu.js', () => ({
  createRepositoryMembershipMenu: vi.fn(() => ({})),
}));
vi.mock('../repository/repository-editor-sync.js', () => ({
  createRepositoryEditorSync: vi.fn(() => ({})),
}));
vi.mock('../linting/semarch-linter.js', () => ({
  SemArchLinter: class { run = vi.fn(); },
}));
vi.mock('../linting/lint-result-store.js', () => ({
  createLintResultStore: vi.fn(() => ({ set: vi.fn() })),
}));
vi.mock('../linting/bpmnlint-panel-bridge.js', () => ({
  createBpmnlintPanelBridge: vi.fn(() => ({})),
}));
vi.mock('../archimate/archimate-adapter.js', () => ({
  ArchimateAdapter: class {},
}));
vi.mock('../ui/views/archimate-view.js', () => ({
  createArchimateView: vi.fn(options => ({ id: options.id })),
}));
vi.mock('../repository/resolve-repository-view.js', () => ({
  resolveRepositoryView: vi.fn(() => h.resolvedView),
}));

import { createApp } from './create-app.js';

async function settleCall(call) {
  try { return { status: 'fulfilled', value: await call() }; }
  catch (reason) { return { status: 'rejected', reason }; }
}

beforeEach(() => {
  vi.clearAllMocks();
  h.repositoryOptions = null;
  h.contextOptions = null;
  h.diagramOptions = null;
  h.dialogOptions = null;
  h.resolvedView = null;
  h.central.mockReset().mockResolvedValue(undefined);
  h.props = {
    showBpmnProperties: vi.fn(),
    showDiagram: vi.fn(),
    showBusinessObject: vi.fn(),
  };
  const right = document.createElement('div');
  h.layout = {
    el: vi.fn(() => right),
    CENTRAL_REPRESENTATION: { BPMN: 'bpmn', ARCHIMATE: 'archimate' },
    setCentralRepresentation: h.central,
    bpmnLayout: { on: vi.fn(), resize: vi.fn() },
    on: vi.fn(),
    // Do not fire navigation/resize/import.done events during mounting.
    onNavigationChange: vi.fn(),
    onRepositoryNavigationChange: vi.fn(),
    onModelNavigationChange: vi.fn(),
  };
  const canvas = { getRootElement: vi.fn(() => ({ id: 'Process' })) };
  const selection = { select: vi.fn(), get: vi.fn(() => []) };
  const registry = { get: vi.fn(() => ({ id: 'element' })) };
  h.modeler = {
    on: vi.fn(),
    getDefinitions: vi.fn(() => ({
      diagrams: [{ id: 'Diagram', plane: { bpmnElement: { id: 'Process' } } }],
    })),
    open: vi.fn().mockResolvedValue(undefined),
    get: vi.fn(name => {
      const services = { canvas, selection, elementRegistry: registry };
      if (!(name in services)) throw new Error('Unexpected service: ' + name);
      return services[name];
    }),
  };
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal('alert', vi.fn());
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function arrange({ rejectDocument = null, rejectSource = null, rejectRepository = null } = {}) {
  const scopes = createRepositoryScopeStore();
  const repository = scopes.createRepository('target');
  const existing = repository.documents.addDocument({
    id: 'old', fileName: 'old.bpmn', kind: 'bpmn', content: '<old/>', dirty: true,
  });
  repository.documents.setActiveDocument(existing.id);
  const document = repository.documents.addDocument({
    id: 'selected', fileName: 'selected.bpmn', kind: 'bpmn', content: '<selected/>',
  });
  const component = repository.model.addComponent({
    id: 'component', documentId: document.id, type: 'process',
  });
  const onDocument = vi.fn(async () => {
    if (rejectDocument) {
      alert('Unable to import BPMN diagram');
      throw rejectDocument;
    }
  });
  const onSource = vi.fn(async () => {
    if (rejectSource) throw rejectSource;
    return repository;
  });
  const onRepository = vi.fn(async () => {
    if (rejectRepository) throw rejectRepository;
    return repository;
  });
  const app = createApp({
    repository,
    activeRepository: createActiveRepository(repository),
    actions: { onRepositoryDocumentSelected: onDocument },
    onSourceSelect: onSource,
    onRepositorySelect: onRepository,
  });
  return { repository, existing, document, component, app, onDocument, onSource, onRepository };
}

describe('CODEX-05A createApp — actual callbacks captured at UI constructors', () => {
  it.each(['source', 'repository'])(
    'forwards %s success arguments without inventing a returned value contract',
    async kind => {
      const a = arrange();
      const callback = kind === 'source'
        ? h.repositoryOptions.onSourceSelect
        : h.repositoryOptions.onRepositorySelect;
      const dependency = kind === 'source' ? a.onSource : a.onRepository;
      const result = await settleCall(() => callback('target'));
      expect(result.status).toBe('fulfilled');
      expect(dependency).toHaveBeenCalledExactlyOnceWith('target');
      expect(alert).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    },
  );

  it.each(['source', 'repository'])(
    'consumes %s rejection and terminal logging failure',
    async kind => {
      const sentinel = new Error('selection rejected');
      const a = arrange({
        rejectSource: kind === 'source' ? sentinel : null,
        rejectRepository: kind === 'repository' ? sentinel : null,
      });
      const callback = kind === 'source'
        ? h.repositoryOptions.onSourceSelect
        : h.repositoryOptions.onRepositorySelect;
      const result = await settleCall(() => callback('target'));
      expect.soft(result.status).toBe('fulfilled');
      expect.soft(console.error).toHaveBeenCalledWith(
        kind === 'source' ? '[Source Selection Failed]' : '[Repository Selection Failed]',
        sentinel,
      );
      expect.soft(alert).not.toHaveBeenCalled();
      console.error.mockImplementation(() => { throw new Error('logger'); });
      const again = await settleCall(() => callback('target'));
      expect.soft(again.status).toBe('fulfilled');
      expect.soft(a.repository.documents.getActiveDocument()).toBe(a.existing);
    },
  );

  it.each(['repository', 'context'])(
    'stops %s selection after load rejection and preserves earlier selection state',
    async kind => {
      const sentinel = new Error('XML sentinel');
      const a = arrange({ rejectDocument: sentinel });
      const selection = kind === 'context'
        ? { repositoryComponentId: a.component.id }
        : { kind: 'document', documentId: a.document.id };
      const result = await settleCall(() => kind === 'context'
        ? h.contextOptions.onSelect(selection)
        : h.repositoryOptions.onSelect(a.document, a.component, selection));
      expect.soft(result.status).toBe('fulfilled');
      expect.soft(a.onDocument).toHaveBeenCalledExactlyOnceWith(a.document, a.component, selection);
      expect.soft(h.diagramRender).not.toHaveBeenCalled();
      expect.soft(h.modeler.open).not.toHaveBeenCalled();
      expect.soft(h.modeler.getDefinitions).not.toHaveBeenCalled();
      expect.soft(a.repository.documents.getDocument('old')).toBe(a.existing);
      expect.soft(a.repository.documents.getActiveDocument()).toBe(
        kind === 'context' ? a.document : a.existing,
      );
      expect.soft(alert).toHaveBeenCalledTimes(1);
      expect.soft(console.error).toHaveBeenCalledWith(
        kind === 'context'
          ? '[Workspace Context Selection Failed]'
          : '[Repository Document Selection Failed]',
        sentinel,
      );
    },
  );

  it('renders downstream after successful document load and forwards selection', async () => {
    const a = arrange();
    const selection = { kind: 'document', documentId: a.document.id };
    const result = await settleCall(
      () => h.repositoryOptions.onSelect(a.document, a.component, selection),
    );
    expect(result.status).toBe('fulfilled');
    expect(a.onDocument).toHaveBeenCalledExactlyOnceWith(a.document, a.component, selection);
    expect(h.diagramRender).toHaveBeenCalledTimes(1);
    expect(a.onDocument.mock.invocationCallOrder[0])
      .toBeLessThan(h.diagramRender.mock.invocationCallOrder[0]);
    expect(alert).not.toHaveBeenCalled();
  });

  it('also consumes immediate navigation errors after successful document load', async () => {
    const a = arrange();
    h.resolvedView = {
      status: 'resolved',
      diagramTarget: { diagramId: 'Diagram' },
      graphicalTarget: { preferredElementId: 'element' },
    };
    const sentinel = new Error('navigation rejected');
    h.modeler.open.mockRejectedValue(sentinel);
    const result = await settleCall(() => h.repositoryOptions.onSelect(
      a.document, a.component, { kind: 'component', componentId: a.component.id },
    ));
    expect.soft(result.status).toBe('fulfilled');
    expect.soft(a.onDocument).toHaveBeenCalledTimes(1);
    expect.soft(h.diagramRender).toHaveBeenCalledTimes(1); // already rendered before open()
    expect.soft(h.modeler.open).toHaveBeenCalledTimes(1);
    expect.soft(h.modeler.get('selection').select).not.toHaveBeenCalled();
    expect.soft(console.error).toHaveBeenCalledWith(
      '[Repository Document Selection Failed]', sentinel,
    );
    expect.soft(alert).not.toHaveBeenCalled();
  });

  it('also consumes ArchiMate central-view rejection without invoking BPMN load', async () => {
    const a = arrange();
    const sentinel = new Error('ArchiMate view rejected');
    h.central.mockRejectedValue(sentinel);
    const archimate = { id: 'archimate', kind: 'archimate', content: '<archimate/>' };
    const result = await settleCall(() => h.repositoryOptions.onSelect(archimate, null, null));
    expect.soft(result.status).toBe('fulfilled');
    expect.soft(a.onDocument).not.toHaveBeenCalled();
    expect.soft(h.central).toHaveBeenCalledWith('archimate', {
      view: { id: 'archimate:archimate' },
    });
    expect.soft(h.diagramRender).not.toHaveBeenCalled();
    expect.soft(console.error).toHaveBeenCalledWith(
      '[Repository Document Selection Failed]', sentinel,
    );
    expect.soft(alert).not.toHaveBeenCalled();
  });

  it('completes context success with the earlier active-document selection retained', async () => {
    const a = arrange();
    const selection = { repositoryComponentId: a.component.id };
    const result = await settleCall(() => h.contextOptions.onSelect(selection));
    expect(result.status).toBe('fulfilled');
    expect(a.onDocument).toHaveBeenCalledExactlyOnceWith(a.document, a.component, selection);
    expect(a.repository.documents.getActiveDocument()).toBe(a.document);
    expect(h.diagramRender).toHaveBeenCalledTimes(1);
    expect(alert).not.toHaveBeenCalled();
  });

  it.each(['repository', 'context'])(
    'keeps %s selection terminal if reporting throws',
    async kind => {
      const a = arrange({ rejectDocument: new Error('XML sentinel') });
      console.error.mockImplementation(() => { throw new Error('logger'); });
      const result = await settleCall(() => kind === 'context'
        ? h.contextOptions.onSelect({ repositoryComponentId: a.component.id })
        : h.repositoryOptions.onSelect(a.document, a.component, { kind: 'document' }));
      expect.soft(result.status).toBe('fulfilled');
      expect.soft(h.diagramRender).not.toHaveBeenCalled();
      expect.soft(alert).toHaveBeenCalledTimes(1);
    },
  );

  it('characterizes the unchanged gap for a later view-dialog callback', async () => {
    const a = arrange();
    h.resolvedView = {
      status: 'resolved',
      context: { diagramViews: [{ diagramId: 'Diagram' }, { diagramId: 'Other' }] },
    };
    await h.repositoryOptions.onSelect(
      a.document, a.component, { kind: 'component', componentId: a.component.id },
    );
    expect(typeof h.dialogOptions?.onSelect).toBe('function');
    const sentinel = new Error('later navigation rejected');
    h.modeler.open.mockRejectedValue(sentinel);
    const result = await settleCall(
      () => h.dialogOptions.onSelect({ diagramId: 'Diagram' }),
    );
    expect(result.status).toBe('rejected');
    expect(result.reason).toBe(sentinel);
    // Outer selection already completed; no claim of global UI rejection handling.
  });
});

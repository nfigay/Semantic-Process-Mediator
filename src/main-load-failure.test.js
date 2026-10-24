// @vitest-environment jsdom
// Real main module and real .yes callbacks; isolated execution demonstrated.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  options: null, confirmed: null, app: null, priorSemarchApp: undefined,
  events: [],
  alert: vi.fn(),
  importXML: vi.fn(),
  zoom: vi.fn(),
  palette: vi.fn(),
  readContext: vi.fn(),
  applyContext: vi.fn(),
  lint: vi.fn(),
  getStatus: vi.fn(),
}));

vi.mock("./app/repository-context-actions.js", () => ({ createRepositoryContextActions: vi.fn(() => ({ read: h.readContext, applyLintContext: h.applyContext })) }));
vi.mock("./app/method-validation-actions.js", () => ({ createMethodValidationActions: vi.fn(() => ({})) }));
vi.mock("./app/method-status-actions.js", () => ({ createMethodStatusActions: vi.fn(() => ({ getStatus: h.getStatus })) }));
vi.mock("./app/create-app.js", () => ({ createApp: vi.fn(options => { h.options = options; return h.app; }) }));
vi.mock("./repository/repository-folder-resources.js", () => ({ readRepositoryFolderResources: vi.fn() }));
vi.mock("./repository/repository-resource-duplication-command.js", () => ({ createRepositoryResourceDuplicationCommand: vi.fn() }));
vi.mock("./repository/repository-workspace-archive.js", () => ({ readRepositoryWorkspaceArchive: vi.fn(), readWorkspaceMetadata: vi.fn(), createWorkspaceMetadata: vi.fn(), createRepositoryWorkspaceArchive: vi.fn(), WORKSPACE_METADATA_PATH: vi.fn() }));
vi.mock("./repository/repository-resource-materializer.js", () => ({ materializeRepositoryResources: vi.fn() }));
vi.mock("./repository/repository-business-model-activation.js", () => ({ activateRepositoryBusinessModel: vi.fn() }));
vi.mock("./repository/repository-bpmn-projection.js", () => ({ projectRepositoryBpmnDocuments: vi.fn() }));
vi.mock("./repository/repository-resource-kind-resolver.js", () => ({ resolveRepositoryResourceKind: vi.fn() }));
vi.mock("./app/install-beforeunload-protection.js", () => ({ installBeforeUnloadProtection: vi.fn() }));
vi.mock("./profiles/embedded-profile-resolver.js", () => ({ resolveEmbeddedProfileRuntime: vi.fn(async () => ({})) }));
vi.mock("./configuration/engineering-coc-configuration.js", () => ({ engineeringCocConfiguration: vi.fn() }));
vi.mock("./configuration/avionics-coc-configuration.js", () => ({ avionicsCocConfiguration: vi.fn() }));
vi.mock("./configuration/experimental-a-coc-configuration.js", () => ({ experimentalACocConfiguration: vi.fn() }));
vi.mock("./configuration/experimental-b-coc-configuration.js", () => ({ experimentalBCocConfiguration: vi.fn() }));
vi.mock("./profiles/coc-profile-runtime-activation.js", () => ({ activateCocProfileRuntime: vi.fn() }));
vi.mock("./configuration/publication-configuration-resolver.js", () => ({ resolvePublicationConfiguration: vi.fn(() => ({})) }));
vi.mock("./configuration/avionics-business-view.js", () => ({ avionicsBusinessView: vi.fn() }));
vi.mock("./configuration/stakeholder-business-view-selection.js", () => ({ resolveStakeholderBusinessViewRef: vi.fn() }));
vi.mock("./configuration/business-view-resolver.js", () => ({ resolveBusinessView: vi.fn() }));
vi.mock("./ui/file-input.js", () => ({ createFileInput: vi.fn(() => ({ open: vi.fn(), setOnLoad: vi.fn() })) }));
vi.mock("./platforms/sparx-ea/import-sparx-ea-xmi.js", () => ({ importSparxEaXmi: vi.fn() }));
vi.mock("./bpmn/ea-import/ea-browser-converter.mjs", () => ({ convertEaFile: vi.fn() }));
vi.mock("./bpmn/ea-import/ea-runtime-loader.mjs", () => ({ loadEaSaxonRuntime: vi.fn(), eaSefUrl: vi.fn() }));
vi.mock("./ui/dialogs/sparx-ea-import-dialog.js", () => ({ openSparxEaImportDialog: vi.fn(), setSparxEaImportStatus: vi.fn(), setSparxEaXmiSelection: vi.fn() }));
vi.mock("./ui/dialogs/repository-context-dialog.js", () => ({ openRepositoryContextDialog: vi.fn() }));
vi.mock("./ui/dialogs/business-object-dialog.js", () => ({ openBusinessObjectDialog: vi.fn() }));
vi.mock("./ui/dialogs/business-objects-browser-dialog.js", () => ({ openBusinessObjectsBrowserDialog: vi.fn() }));
vi.mock("./properties/business-object-contextual-properties.js", () => ({ resolveBusinessObjectContextualProperties: vi.fn() }));
vi.mock("./ui/method-status-badge.js", () => ({ renderMethodStatus: vi.fn(), bindMethodStatusBadge: vi.fn() }));
vi.mock("./publication/bpmn-publication.js", () => ({ publishBpmnXml: vi.fn() }));
vi.mock("./bpmn/bpmn-view-index.js", () => ({ createBpmnViewIndex: vi.fn() }));
vi.mock("./repository/register-bpmn-document.js", () => ({ registerBpmnDocument: vi.fn() }));
vi.mock("./repository/project-repository-metadata.js", () => ({ projectRepositoryMetadata: vi.fn() }));
vi.mock("./extensions/business-objects.js", () => ({ projectBusinessObjects: vi.fn(), setBusinessObjects: vi.fn(), projectBusinessObjectRepresentations: vi.fn(), setBusinessObjectRepresentations: vi.fn() }));
vi.mock("w2ui/w2ui-2.0.es6.js", () => ({ w2alert: h.alert, w2confirm: vi.fn(() => ({ yes(callback) { h.confirmed = callback; } })) }));
vi.mock("./properties/workspace/workspace-folder-access.js", () => ({ resolveWorkspaceFolderAccess: vi.fn(), classifyWorkspaceFolderAccessError: vi.fn() }));
vi.mock("./properties/workspace/workspace-repository-file-handle.js", () => ({ resolveWorkspaceRepositoryFileHandle: vi.fn() }));
vi.mock("./extensions/repository-context.js", () => ({ getRepositoryContext: vi.fn(), setRepositoryContext: vi.fn() }));
vi.mock("./extensions/method-configuration.js", () => ({ getMethodConfiguration: vi.fn(), setMethodConfiguration: vi.fn() }));
vi.mock("./ui/palette.js", () => ({ extractPalette: h.palette }));
vi.mock("./workspace/workspace-actions.js", () => ({ createWorkspaceActions: vi.fn() }));
vi.mock("w2ui/w2ui-2.0.min.css", () => ({}));
vi.mock("bpmn-js/dist/assets/bpmn-js.css", () => ({}));
vi.mock("bpmn-js/dist/assets/diagram-js.css", () => ({}));
vi.mock("bpmn-js/dist/assets/bpmn-font/css/bpmn.css", () => ({}));
vi.mock("@bpmn-io/properties-panel/assets/properties-panel.css", () => ({}));

async function settleCall(call) {
  try { return { status: 'fulfilled', value: await call() }; }
  catch (reason) { return { status: 'rejected', reason }; }
}

beforeEach(async () => {
  h.priorSemarchApp = window.semarchApp;
  vi.resetModules();
  vi.clearAllMocks();
  h.options = null;
  h.confirmed = null;
  h.events.length = 0;
  h.importXML.mockImplementation(async () => { h.events.push('import'); });
  h.zoom.mockImplementation(() => h.events.push('zoom'));
  h.palette.mockImplementation(() => h.events.push('palette'));
  h.readContext.mockImplementation(() => {
    h.events.push('context');
    return { cocOwner: 'owner', maturity: 'L3' };
  });
  h.applyContext.mockImplementation(() => h.events.push('apply'));
  h.lint.mockImplementation(() => h.events.push('lint'));
  h.getStatus.mockImplementation(() => {
    h.events.push('status');
    return { status: 'NOT_VALIDATED' };
  });
  const services = { canvas: { zoom: h.zoom }, activeProfileRuntime: null };
  const modeler = {
    importXML: h.importXML,
    get: vi.fn(name => {
      if (!(name in services)) throw new Error('Unexpected startup service: ' + name);
      return services[name];
    }),
  };
  h.app = {
    // Match the real layout compatibility contract used by startup.
    layout: { setModelActive: vi.fn() },
    modeler,
    linter: { run: h.lint },
    repositoryBrowser: { render: vi.fn() },
    showArchimate: vi.fn(),
    mode: 'editor',
  };
  // These fields are supplied by the createApp dependency, not reconstructed
  // main logic. They are the same real stores passed by main during creation.
  const factory = await import('./app/create-app.js');
  factory.createApp.mockImplementation(options => {
    h.options = options;
    Object.assign(h.app, {
      repositoryDocumentStore: options.repository.documents,
      repositoryModel: options.repository.model,
      businessObjectStore: options.repository.businessObjectStore,
      businessObjectRepresentationStore:
        options.repository.businessObjectRepresentationStore,
    });
    return h.app;
  });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  await import('./main.js');
  // main.js awaits the initial diagram load before its module import resolves.
  // Discard startup observations, retaining callback-only assertions.
  h.events.length = 0;
  h.importXML.mockClear();
  h.zoom.mockClear();
  h.getStatus.mockClear();
});

afterEach(() => {
  if (h.priorSemarchApp === undefined) delete window.semarchApp;
  else window.semarchApp = h.priorSemarchApp;
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('CODEX-05A main — callbacks actually supplied to w2confirm.yes', () => {
  it.each(['onNew'])(
    '%s completes success through the actual diagram composition',
    async action => {
      h.options.actions[action]();
      expect(typeof h.confirmed).toBe('function');
      const result = await settleCall(h.confirmed);
      expect(result.status).toBe('fulfilled');
      const { EMPTY_DIAGRAM } = await import('./bpmn/starter-bpmn.js');
      expect(h.importXML).toHaveBeenCalledExactlyOnceWith(EMPTY_DIAGRAM);
      expect(h.events).toEqual(['import', 'zoom', 'palette', 'context', 'apply', 'lint', 'status']);
      expect(h.getStatus).toHaveBeenCalledTimes(1);
      expect(h.alert).not.toHaveBeenCalled();
    },
  );

  it.each(['onNew'])(
    '%s consumes XML rejection without updating status or adding an alert',
    async action => {
      const sentinel = new Error('XML sentinel');
      h.importXML.mockImplementation(async () => {
        h.events.push('import');
        throw sentinel;
      });
      h.options.actions[action]();
      const result = await settleCall(h.confirmed);
      expect.soft(result.status).toBe('fulfilled');
      expect.soft(h.events).toEqual(['import']);
      expect.soft(h.getStatus).not.toHaveBeenCalled();
      expect.soft(h.zoom).not.toHaveBeenCalled();
      expect.soft(h.alert).toHaveBeenCalledExactlyOnceWith('Unable to import BPMN diagram');
    },
  );

  it.each(['onNew'])(
    '%s remains terminal when console.error itself throws',
    async action => {
      h.importXML.mockRejectedValue(new Error('XML sentinel'));
      console.error.mockImplementation(() => { throw new Error('logger sentinel'); });
      h.options.actions[action]();
      const result = await settleCall(h.confirmed);
      expect.soft(result.status).toBe('fulfilled');
      expect.soft(h.getStatus).not.toHaveBeenCalled();
      expect.soft(h.zoom).not.toHaveBeenCalled();
      expect.soft(h.alert).not.toHaveBeenCalled();
    },
  );
});

import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  importSparxEaXmi,
} from '../../platforms/sparx-ea/import-sparx-ea-xmi.js';

import {
  createDiagramActions,
} from '../../app/diagram-actions.js';

import {
  importBpmn,
} from '../../bpmn/io.js';

import {
  createRepositoryScopeStore,
} from '../../repository/repository-scope-store.js';

const XML = [
  '<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"',
  ' id="Definitions_import" targetNamespace="urn:codex-04">',
  '<process id="Process_import" name="Imported process"/>',
  '</definitions>',
].join('');

const DOCUMENT_ID = 'doc-import';
const COMPONENT_ID = `${DOCUMENT_ID}::Process_import`;

function snapshot(repository) {
  return structuredClone({
    documents: repository.documents.getDocuments(),
    activeDocument: repository.documents.getActiveDocument(),
    containers: repository.model.getContainers(),
    components: repository.model.getComponents(),
    references: repository.model.getReferences(),
    businessObjects:
      repository.businessObjectStore.getBusinessObjects(),
    representations:
      repository.businessObjectRepresentationStore
        .getBusinessObjectRepresentations(),
    relations:
      repository.businessRelationStore.getBusinessRelations(),
    origins:
      repository.identityOriginStore.getIdentityOrigins(),
    externalIdentities:
      repository.businessObjectExternalIdentityStore
        .getBusinessObjectExternalIdentities(),
    repositoryContext: repository.repositoryContext,
    workspace: repository.workspace,
  });
}

async function settle(promise) {
  try {
    return { status: 'fulfilled', value: await promise };
  } catch (reason) {
    return { status: 'rejected', reason };
  }
}

function arrange({ mode = 'memory', rejection = null } = {}) {
  const scopes = createRepositoryScopeStore();
  const repository = scopes.createRepository('target');
  const otherRepository = scopes.createRepository('other');

  repository.workspace.mode = mode;
  repository.repositoryContext = {
    cocOwner: 'existing-owner',
    maturity: 'L2',
  };

  const existingDocument = repository.documents.addDocument({
    id: 'doc-existing',
    fileName: 'existing.bpmn',
    kind: 'bpmn',
    content: '<existing/>',
    dirty: true,
  });

  repository.documents.setActiveDocument(existingDocument.id);

  const existingContainer = repository.model.addContainer({
    id: 'container-existing',
    name: 'Existing container',
    metadata: { preserved: true },
  });

  const existingComponent = repository.model.addComponent({
    id: 'component-existing',
    type: 'process',
    name: 'Existing process',
    documentId: existingDocument.id,
    metadata: { preserved: true },
  });

  const existingReference = repository.model.addReference({
    id: 'reference-existing',
    sourceId: existingContainer.id,
    targetId: existingComponent.id,
    type: 'contains',
    metadata: { preserved: true },
  });

  otherRepository.documents.addDocument({
    id: 'other-document',
    content: '<other/>',
    dirty: false,
  });

  const before = snapshot(repository);
  const otherBefore = snapshot(otherRepository);

  // Default spies call the original implementations.
  const addDocument = vi.spyOn(
    repository.documents,
    'addDocument',
  );
  const addComponent = vi.spyOn(
    repository.model,
    'addComponent',
  );
  const addReference = vi.spyOn(
    repository.model,
    'addReference',
  );

  const events = [];
  const context = { cocOwner: 'owner', maturity: 'L3' };
  const layout = {};

  const process = {
    $type: 'bpmn:Process',
    id: 'Process_import',
    name: 'Imported process',
    flowElements: [],
  };

  const definitions = {
    rootElements: [process],
    diagrams: [{
      id: 'Diagram_import',
      plane: {
        id: 'Plane_import',
        bpmnElement: process,
        planeElement: [],
      },
    }],
  };

  const zoom = vi.fn(() => events.push('zoom'));
  const modeler = {
    importXML: vi.fn(async () => {
      events.push('importXML');
      if (rejection) throw rejection;
      return { warnings: [] };
    }),
    get: vi.fn(() => {
      events.push('canvas');
      return { zoom };
    }),
    getDefinitions: vi.fn(() => {
      events.push('definitions');
      return definitions;
    }),
  };

  const extractPalette = vi.fn(
    () => events.push('palette'),
  );
  const readRepositoryContext = vi.fn(() => {
    events.push('context');
    return context;
  });
  const applyLintContext = vi.fn(
    () => events.push('lint-context'),
  );
  const linter = {
    run: vi.fn(() => events.push('lint')),
    setCoc: vi.fn(),
    setProfile: vi.fn(),
  };
  const alert = vi.fn(() => events.push('alert'));
  const consoleError = vi.spyOn(console, 'error')
    .mockImplementation(() => {});

  let renderedState = null;
  const repositoryBrowser = {
    render: vi.fn(() => {
      events.push('render');
      renderedState = snapshot(repository);
    }),
  };

  const diagramActions = createDiagramActions({
    modeler,
    layout,
    linter,
    importBpmn,
    extractPalette,
    readRepositoryContext,
    applyLintContext,
    alert,
  });

  return {
    repository,
    otherRepository,
    before,
    otherBefore,
    existingDocument,
    existingContainer,
    existingComponent,
    existingReference,
    addDocument,
    addComponent,
    addReference,
    events,
    context,
    layout,
    modeler,
    zoom,
    extractPalette,
    readRepositoryContext,
    applyLintContext,
    linter,
    alert,
    consoleError,
    repositoryBrowser,
    diagramActions,
    renderedState: () => renderedState,
  };
}

function startImport(harness, fileName) {
  return importSparxEaXmi({
    bpmnXml: XML,
    fileName,
    documentId: DOCUMENT_ID,
    repository: harness.repository,
    diagramActions: harness.diagramActions,
    modeler: harness.modeler,
    repositoryBrowser: harness.repositoryBrowser,
  });
}

function expectExistingPreserved(harness, after) {
  expect.soft(after.documents.filter(
    document => document.id !== DOCUMENT_ID,
  )).toEqual(harness.before.documents);

  expect.soft(after.components.filter(
    component => component.id !== COMPONENT_ID,
  )).toEqual(harness.before.components);

  for (const key of [
    'activeDocument',
    'containers',
    'references',
    'businessObjects',
    'representations',
    'relations',
    'origins',
    'externalIdentities',
    'repositoryContext',
    'workspace',
  ]) {
    expect.soft(after[key], key).toEqual(harness.before[key]);
  }

  expect.soft(
    harness.repository.documents.getDocument('doc-existing'),
  ).toBe(harness.existingDocument);

  expect.soft(
    harness.repository.model.getComponent('component-existing'),
  ).toBe(harness.existingComponent);

  expect.soft(snapshot(harness.otherRepository))
    .toEqual(harness.otherBefore);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CODEX-04 — Sparx EA XMI import rejection', () => {
  it('propagates importXML rejection without Repository publication', async () => {
    const rejection = new Error('CODEX-04 importXML sentinel');
    const harness = arrange({ rejection });

    // Observe settlement and final state before making assertions.
    const outcome = await settle(startImport(harness, 'failed.xmi'));
    const after = snapshot(harness.repository);
    const observedEvents = [...harness.events];

    expect.soft(outcome.status).toBe('rejected');
    expect.soft(outcome.reason).toBe(rejection);

    expect.soft(harness.modeler.importXML)
      .toHaveBeenCalledExactlyOnceWith(XML);

    expect.soft(harness.addDocument).not.toHaveBeenCalled();
    expect.soft(harness.addComponent).not.toHaveBeenCalled();
    expect.soft(harness.addReference).not.toHaveBeenCalled();
    expect.soft(harness.modeler.getDefinitions)
      .not.toHaveBeenCalled();
    expect.soft(harness.repositoryBrowser.render)
      .not.toHaveBeenCalled();

    expect.soft(harness.modeler.get).not.toHaveBeenCalled();
    expect.soft(harness.zoom).not.toHaveBeenCalled();
    expect.soft(harness.extractPalette).not.toHaveBeenCalled();
    expect.soft(harness.readRepositoryContext)
      .not.toHaveBeenCalled();
    expect.soft(harness.applyLintContext).not.toHaveBeenCalled();
    expect.soft(harness.linter.run).not.toHaveBeenCalled();
    expect.soft(harness.linter.setCoc).not.toHaveBeenCalled();
    expect.soft(harness.linter.setProfile).not.toHaveBeenCalled();

    expect.soft(after).toEqual(harness.before);
    expect.soft(observedEvents.filter(
      event => !['importXML', 'alert'].includes(event),
    )).toEqual([]);

    expectExistingPreserved(harness, after);
  });

  it.each([
    ['memory', 'example.XMI', 'example.bpmn', false],
    ['directory', 'example.xml', 'example.bpmn', true],
    ['memory', undefined, 'EA-import.bpmn', false],
  ])(
    'publishes after successful import: %s / %s',
    async (mode, fileName, expectedName, expectedDirty) => {
      const harness = arrange({ mode });

      const outcome = await settle(startImport(harness, fileName));
      const after = snapshot(harness.repository);
      const document = harness.repository.documents
        .getDocument(DOCUMENT_ID);
      const component = harness.repository.model
        .getComponent(COMPONENT_ID);

      expect.soft(outcome.status).toBe('fulfilled');
      expect.soft(document).toEqual({
        id: DOCUMENT_ID,
        fileName: expectedName,
        kind: 'bpmn',
        content: XML,
        dirty: expectedDirty,
      });

      expect.soft(component).toEqual({
        id: COMPONENT_ID,
        type: 'process',
        name: 'Imported process',
        documentId: DOCUMENT_ID,
        stableGuid: null,
        externalIds: {},
        metadata: {
          bpmnId: 'Process_import',
          hasDirectDiagram: true,
          directDiagramIds: ['Diagram_import'],
        },
      });

      expect.soft(outcome.value?.repositoryDocument).toBe(document);
      expect.soft(outcome.value?.components).toEqual([component]);
      expect.soft(outcome.value?.components?.[0]).toBe(component);

      expect.soft(harness.modeler.importXML)
        .toHaveBeenCalledExactlyOnceWith(XML);
      expect.soft(harness.modeler.get)
        .toHaveBeenCalledExactlyOnceWith('canvas');
      expect.soft(harness.zoom)
        .toHaveBeenCalledExactlyOnceWith('fit-viewport');
      expect.soft(harness.extractPalette)
        .toHaveBeenCalledExactlyOnceWith({ layout: harness.layout });
      expect.soft(harness.readRepositoryContext)
        .toHaveBeenCalledTimes(1);
      expect.soft(harness.applyLintContext)
        .toHaveBeenCalledExactlyOnceWith(harness.context);
      expect.soft(harness.linter.run).toHaveBeenCalledTimes(1);
      expect.soft(harness.linter.setCoc).not.toHaveBeenCalled();
      expect.soft(harness.linter.setProfile).not.toHaveBeenCalled();
      expect.soft(harness.alert).not.toHaveBeenCalled();
      expect.soft(harness.consoleError).not.toHaveBeenCalled();

      expect.soft(harness.addDocument).toHaveBeenCalledTimes(1);
      expect.soft(harness.addComponent).toHaveBeenCalledTimes(1);
      expect.soft(harness.addReference).not.toHaveBeenCalled();
      expect.soft(harness.modeler.getDefinitions)
        .toHaveBeenCalledTimes(1);
      expect.soft(harness.repositoryBrowser.render)
        .toHaveBeenCalledTimes(1);

      const order = [
        harness.linter.run,
        harness.addDocument,
        harness.modeler.getDefinitions,
        harness.addComponent,
        harness.repositoryBrowser.render,
      ].map(spy => spy.mock.invocationCallOrder[0]);

      expect.soft(order.every(Number.isInteger)).toBe(true);
      expect.soft(order.every(
        (value, index) => index === 0 || order[index - 1] < value,
      )).toBe(true);

      expect.soft(harness.events).toEqual([
        'importXML',
        'canvas',
        'zoom',
        'palette',
        'context',
        'lint-context',
        'lint',
        'definitions',
        'render',
      ]);

      expect.soft(harness.renderedState()).toEqual(after);
      expect.soft(after.documents).toHaveLength(2);
      expect.soft(after.components).toHaveLength(2);
      expectExistingPreserved(harness, after);
    },
  );
});

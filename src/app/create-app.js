import {
  createLayout
} from '../ui/layout.js'

import {
  createLintPanel,
  createLintRenderer
} from '../ui/lint-panel.js'

import {
  createDiagramPropertiesPanel
} from '../ui/diagram-properties-panel.js'

import {
  createVisualPropertiesPanel
} from '../ui/visual-properties-panel.js'

import {
  createRepositoryBrowser
} from '../ui/repository-browser.js'

import {
  createWorkspaceTreeSearch
} from '../ui/workspace-tree-search.js'

import {
  createWorkspaceContextsBrowser
} from '../ui/workspace-contexts-browser.js'

import {
  createDiagramBrowser
} from '../ui/diagram-browser.js'

import {
  createResourceView
} from '../ui/views/resource-view.js'

import {
  openRepositoryViewDialog
} from '../ui/repository-view-dialog.js'

import {
  createRepositoryMembershipMenu
} from '../ui/repository-membership-menu.js'

import {
  createBpmnEngine
} from '../bpmn/create-bpmn-engine.js'

import {
  applyBpmnCapabilities
} from '../bpmn/apply-bpmn-capabilities.js'

import {
  createBpmnViewIndex
} from '../bpmn/bpmn-view-index.js'

import {
  SemArchLinter
} from '../linting/semarch-linter.js'

import {
  createBpmnlintPanelBridge
} from '../linting/bpmnlint-panel-bridge.js'

import {
  createLintResultStore
} from '../linting/lint-result-store.js'

import {
  createToolbar
} from '../ui/toolbar.js'

import {
  resolveWorkspaceFolderAccess
} from '../properties/workspace/workspace-folder-access.js'

import {
  createBusinessModelExplorerView
} from '../ui/business-model/business-model-explorer-view.js'

import {
  createRepositoryDocumentStore
} from '../repository/repository-document-store.js'

import {
  createRepositoryModel
} from '../repository/repository-model.js'

import {
  createBusinessObjectStore
} from '../model/business-object-store.js'

import {
  createActiveBusinessObjectStore
} from '../repository/active-business-object-store.js'

import {
  createBusinessObjectRepresentationStore
} from '../model/business-object-representation-store.js'

import {
  createTechnicalIntrospection
} from '../technical/technical-introspection.js'

import {
  createTechnicalInspector
} from '../ui/technical-inspector.js'

import {
  createBusinessRelationStore
} from '../model/business-relation-store.js'

import {
  createIdentityOriginStore
} from '../model/identity-origin-store.js'

import {
  createBusinessObjectExternalIdentityStore
} from '../model/business-object-external-identity-store.js'

import {
  createRepositoryEditorSync
} from '../repository/repository-editor-sync.js'

import {
  createArchimateDocumentPersistence
} from '../repository/archimate-document-persistence.js'

import {
  resolveRepositoryView
} from '../repository/resolve-repository-view.js'

import {
  createUiTreeExtract
} from '../extracts/ui-tree-extract.js'

import {
  createRepositoryGraphExtract
} from '../extracts/repository-graph-extract.js'

import {
  createBpmnModelExtract
} from '../extracts/bpmn-model-extract.js'

import {
  createBpmnViewsExtract
} from '../extracts/bpmn-views-extract.js'

import {
  createBusinessObjectRepresentationActions
} from './business-object-representation-actions.js'

import {
  createBusinessRelationActions
} from './business-relation-actions.js'

import {
  createRepositoryMembershipActions
} from './repository-membership-actions.js'

import {
  normalizeAppMode,
  isViewerMode
} from './app-mode.js'

import {
  ArchimateAdapter
} from '../archimate/archimate-adapter.js'

import {
  createArchimateView
} from '../ui/views/archimate-view.js'

import {
  normalizeCocConfiguration
} from '../configuration/coc-configuration.js'

import {
  normalizePublicationConfiguration
} from '../configuration/publication-configuration.js'


export function createApp({
  actions = {},
  cocConfiguration = null,
  mode = 'editor',
  profileRuntime = null,
  businessTypeCatalog = null,
  businessView = null,
  readRepositoryContext = null,
  projectionProfile = null,
  publicationConfiguration = null,
  repository = null,
  activeRepository = null,
  getRepositories = null,
  getSources = null,
  getCocs = null,
  onRepositorySelect = null,
  onSourceSelect = null,
  onDuplicateResourceRequest = null,
  onDeriveResourceRequest = null
} = {}) {

  const appMode =
    normalizeAppMode(
      mode
    )


  const normalizedCocConfiguration =
    cocConfiguration
      ? normalizeCocConfiguration(
          cocConfiguration
        )
      : null


  const normalizedPublicationConfiguration =
    publicationConfiguration
      ? normalizePublicationConfiguration(
          publicationConfiguration
        )
      : null


  /*
   * ------------------------------------------------------------
   * Repository session
   * ------------------------------------------------------------
   */

  const repositoryDocumentStore =
    repository
      ? repository.documents
      : createRepositoryDocumentStore()


  const repositoryModel =
    repository
      ? repository.model
      : createRepositoryModel()


  const businessObjectStore =
    repository
      ? repository.businessObjectStore
      : createBusinessObjectStore()


  const activeBusinessObjectStore =
    activeRepository
      ? createActiveBusinessObjectStore({
          activeRepository
        })
      : businessObjectStore


  const businessObjectRepresentationStore =
    repository
      ? repository.businessObjectRepresentationStore
      : createBusinessObjectRepresentationStore()


  const technicalIntrospection =
    createTechnicalIntrospection({
      repositoryDocumentStore,
      businessObjectStore,
      businessObjectRepresentationStore,
      activeRepository
    })


  const technicalInspector =
    createTechnicalInspector({
      technicalIntrospection
    })


  const businessRelationStore =
    repository
      ? repository.businessRelationStore
      : createBusinessRelationStore()


  const identityOriginStore =
    repository
      ? repository.identityOriginStore
      : createIdentityOriginStore()


  const businessObjectExternalIdentityStore =
    repository
      ? repository.businessObjectExternalIdentityStore
      : createBusinessObjectExternalIdentityStore()


  const archimateDocumentPersistence =
    createArchimateDocumentPersistence({
      repositoryDocumentStore,
      activeRepository
    })


  technicalIntrospection.addSource({
    id: 'businessRelations',
    label: 'Business Relations',
    read: () =>
      (
        activeRepository?.get?.()?.businessRelationStore ||
        businessRelationStore
      ).getBusinessRelations()
  })

  technicalIntrospection.addSource({
    id: 'identityOrigins',
    label: 'Identity Origins',
    read: () =>
      (
        activeRepository?.get?.()?.identityOriginStore ||
        identityOriginStore
      ).getIdentityOrigins()
  })

  technicalIntrospection.addSource({
    id: 'businessObjectExternalIdentities',
    label: 'Business Object External Identities',
    read: () =>
      (
        activeRepository?.get?.()?.businessObjectExternalIdentityStore ||
        businessObjectExternalIdentityStore
      ).getBusinessObjectExternalIdentities()
  })


  const businessObjectRepresentationActions =
    createBusinessObjectRepresentationActions({
      businessObjectStore,
      businessObjectRepresentationStore,
      activeRepository,
      onChanged:
        actions.onBusinessObjectRepresentationsChanged
    })


  const businessRelationActions =
    createBusinessRelationActions({
      businessObjectStore,
      businessRelationStore,
      activeRepository,
      onChanged:
        actions.onBusinessRelationsChanged
    })


  const businessObjectNavigationActions = {

    navigate(
      businessObject
    ) {

      actions
        .onNavigateBusinessObject
        ?.(
          businessObject
        )
    }
  }


  /*
   * ------------------------------------------------------------
   * Browser references
   * ------------------------------------------------------------
   */

  let repositoryBrowser =
    null


  let contextsBrowser =
    null


  let diagramBrowser =
    null


  let repositoryDiagramBrowser =
    null


  /*
   * ------------------------------------------------------------
   * Extract delivery
   * ------------------------------------------------------------
   */

  async function deliverExtract(
    text,
    fileName,
    label
  ) {

    console.log(
      text
    )


    try {

      await navigator
        .clipboard
        .writeText(
          text
        )


      console.info(
        `SemArch ${label} extract copied to clipboard.`
      )

    } catch {

      console.info(
        `SemArch ${label} extract could not be copied to clipboard.`
      )
    }


    const blob =
      new Blob(
        [
          text
        ],
        {
          type:
            'text/plain;charset=utf-8'
        }
      )


    const url =
      URL.createObjectURL(
        blob
      )


    const link =
      document.createElement(
        'a'
      )


    link.href =
      url


    link.download =
      fileName


    document.body.appendChild(
      link
    )


    link.click()


    document.body.removeChild(
      link
    )


    URL.revokeObjectURL(
      url
    )


    console.info(
      `SemArch ${label} extract downloaded as ${fileName}.`
    )


    return text
  }


  /*
   * ------------------------------------------------------------
   * UI Tree extract
   * ------------------------------------------------------------
   */

  async function extractUiTree() {

    const nodes =
      repositoryBrowser
        ?.sidebar
        ?.nodes ||
      []


    const text =
      createUiTreeExtract(
        nodes
      )


    return deliverExtract(
      text,
      'semarch-ui-tree.txt',
      'UI Tree'
    )
  }


  /*
   * ------------------------------------------------------------
   * Repository Graph extract
   * ------------------------------------------------------------
   */

  async function extractRepositoryGraph() {

    const text =
      createRepositoryGraphExtract(
        resolveActiveRepositoryModel()
      )


    return deliverExtract(
      text,
      'semarch-repository-graph.txt',
      'Repository Graph'
    )
  }


  /*
   * ------------------------------------------------------------
   * BPMN Model extract
   * ------------------------------------------------------------
   */

  async function extractBpmnModel() {

    const definitions =
      modeler.getDefinitions()


    const text =
      createBpmnModelExtract(
        definitions
      )


    return deliverExtract(
      text,
      'semarch-bpmn-model.txt',
      'BPMN Model'
    )
  }


  /*
   * ------------------------------------------------------------
   * BPMN Views extract
   * ------------------------------------------------------------
   */

  async function extractBpmnViews() {

    const definitions =
      modeler.getDefinitions()


    const text =
      createBpmnViewsExtract(
        definitions
      )


    return deliverExtract(
      text,
      'semarch-bpmn-views.txt',
      'BPMN Views'
    )
  }


  /*
   * ------------------------------------------------------------
   * Toolbar
   * ------------------------------------------------------------
   */

  const toolbar =
    createToolbar({

      mode:
        appMode,

      capabilities: {
        ...(normalizedPublicationConfiguration?.capabilities || {}),
        directWorkspace:
          resolveWorkspaceFolderAccess({
            configured:
              normalizedPublicationConfiguration?.capabilities?.workspaceFolderAccess || 'auto',
            showDirectoryPicker:
              typeof window !== 'undefined'
                ? window.showDirectoryPicker
                : undefined
          }).effective
      },

      onNewBpmnModel:
        actions.onNewBpmnModel || actions.onNew,

      onNewArchimate:
        actions.onNewArchimate,

      onNewBusinessObject:
        async (...args) => {
          const result = await actions.onNewBusinessObject?.(...args)
          contextsBrowser?.render?.()
          return result
        },

      onBrowseBusinessObjects:
        actions.onBrowseBusinessObjects,

      onTechnicalInspector:
        technicalInspector.open,

      onSourcesTabVisibilityChange:
        visible => layout.setSourcesTabVisible?.(visible),

      onImport:
        actions.onImport,

      onImportSparxEa:
        actions.onImportSparxEa,

      onImportArchimate:
        actions.onImportArchimate,

      onOpenBpmn:
        actions.onOpenBpmn,

      onNewRepository:
        actions.onNewRepository,

      onOpenRepository:
        actions.onOpenRepository,

      onOpenWorkspaceArchive:
        actions.onOpenWorkspaceArchive,

      onLocalWorkspaceProof:
        actions.onLocalWorkspaceProof,

      onLocalWorkspaceInventory:
        actions.onLocalWorkspaceInventory,

      onSaveLocalWorkspace:
        actions.onSaveLocalWorkspace,

      onSaveWorkspaceArchive:
        actions.onSaveWorkspaceArchive,

      onRenameWorkspace:
        actions.onRenameWorkspace,

      onWorkspaceManifest:
        actions.onWorkspaceManifest,

      onAssembleRepository:
        actions.onAssembleRepository,

      onExportXml:
        actions.onExportXml,

      onExportSvg:
        actions.onExportSvg,

      onFit:
        actions.onFit,

      onContext:
        actions.onContext,

      onLint:
        actions.onLint,

      onValidate:
        actions.onValidate,

      onExtractUiTree:
        extractUiTree,

      onExtractRepositoryGraph:
        extractRepositoryGraph,

      onExtractBpmnModel:
        extractBpmnModel,

      onExtractBpmnViews:
        extractBpmnViews
    })


  console.info(
    '[BPMNSM EA RUNTIME PROBE]',
    JSON.stringify({
      mode: appMode,
      workspace: toolbar.items
        ?.find(item => item.id === 'workspace')
        ?.items
        ?.map(item => ({
          id: item.id ?? null,
          text: item.text ?? null,
          type: item.type ?? null
        }))
    }, null, 2)
  )


  /*
   * ------------------------------------------------------------
   * Application layout
   * ------------------------------------------------------------
   */

  const layout =
    createLayout({

      toolbar,

      mode:
        appMode
    })


  /*
   * ------------------------------------------------------------
   * ArchiMate central view
   *
   * A8.4a: create one ArchiMateView per requested document.
   *
   * Representation type remains ARCHIMATE.
   * View identity distinguishes document instances.
   *
   * The view depends on the BPMNSM ArchimateAdapter boundary,
   * never directly on archimate-js / diagram-js services.
   * ------------------------------------------------------------
   */

  async function showArchimate({
    xml = null,
    documentId = null
  } = {}) {

    const viewId =
      documentId
        ? `archimate:${documentId}`
        : 'archimate'


    const archimateView =
      createArchimateView({

        id:
          viewId,

        createAdapter({
          container
        }) {

          return new ArchimateAdapter({
            container
          })
        },

        xml,

        onModelChanged({
          adapter
        }) {

          if (
            !documentId
          ) {

            return
          }


          void archimateDocumentPersistence
            .persist({
              adapter,

              documentId
            })
        }
      })


    await layout
      .setCentralRepresentation(
        layout
          .CENTRAL_REPRESENTATION
          .ARCHIMATE,
        {
          view:
            archimateView
        }
      )


    return archimateView
  }


  /*
   * ------------------------------------------------------------
   * Properties surfaces
   *
   * BPMN properties:
   *   Process, Collaboration, Participant, Task, ...
   *
   * Diagram properties:
   *   BPMNDiagram / BPMN-DI View
   *
   * Only one surface is visible at a time.
   * ------------------------------------------------------------
   */

  layout
    .el(
      'right'
    )
    .innerHTML =
      `
        <div
          id="properties-surfaces"
          style="
            width:100%;
            height:100%;
            position:relative;
            overflow:hidden;
            display:flex;
            flex-direction:column;
          "
        >

          <div
            id="bpmn-props"
            style="
              width:100%;
              flex:1 1 auto;
              min-height:0;
              overflow:hidden;
            "
          ></div>

          <div
            id="visual-props"
            style="
              display:none;
              width:100%;
              height:100%;
              min-height:0;
              overflow:auto;
            "
          ></div>

          <div
            id="diagram-props"
            style="
              display:none;
              width:100%;
              height:100%;
              overflow:auto;
            "
          ></div>

        </div>
      `


  const bpmnPropertiesContainer =
    layout
      .el(
        'right'
      )
      .querySelector(
        '#bpmn-props'
      )


  const diagramPropertiesContainer =
    layout
      .el(
        'right'
      )
      .querySelector(
        '#diagram-props'
      )


  const visualPropertiesContainer =
    layout
      .el(
        'right'
      )
      .querySelector(
        '#visual-props'
      )


  createLintPanel(
    layout
  )


  /*
   * ------------------------------------------------------------
   * BPMN engine
   * ------------------------------------------------------------
   */

  const modeler =
    createBpmnEngine({

      mode:
        appMode,

      container:
        '#bpmn-canvas',

      propertiesPanel:
        '#bpmn-props',

      profileRuntime,

      businessTypeCatalog,

      businessView,

      readRepositoryContext,

      businessObjectStore:
        activeBusinessObjectStore,

      businessObjectRepresentationActions,

      businessObjectNavigationActions
    })


  /*
   * ------------------------------------------------------------
   * Repository membership actions
   * ------------------------------------------------------------
   *
   * Membership persistence needs the initialized BPMN modeler.
   * Keep this construction after createBpmnEngine() to avoid the
   * modeler temporal-dead-zone during createApp().
   */

  const repositoryMembershipActions =
    createRepositoryMembershipActions({
      repositoryModel,
      activeRepository,
      modeler
    })


  /*
   * ------------------------------------------------------------
   * Business Model Explorer
   * ------------------------------------------------------------
   */

  const businessModelExplorerView =
    createBusinessModelExplorerView({
      modeler,
      businessObjectStore:
        activeBusinessObjectStore,
      businessObjectRepresentationStore,
      businessRelationStore,
      activeRepository,
      onNewBusinessObject:
        async (...args) => {
          const result = await actions.onNewBusinessObject?.(...args)
          contextsBrowser?.render?.()
          return result
        },
      onNavigateBusinessObject:
        businessObjectNavigationActions.navigate
    })


  async function openBusinessModelExplorer() {
    return layout.setCentralRepresentation(
      layout.CENTRAL_REPRESENTATION.BUSINESS_MODEL,
      {
        view: businessModelExplorerView
      }
    )
  }




  /*
   * ------------------------------------------------------------
   * BPMN View Index
   * ------------------------------------------------------------
   */

  function getProjectedDiagrams() {

    const components =
      resolveActiveRepositoryModel()
        ?.getComponents?.() || []


    return components.flatMap(component => {

      if (
        component?.type !== 'process' &&
        component?.type !== 'collaboration'
      ) {
        return []
      }


      const diagramIds =
        Array.isArray(component?.metadata?.directDiagramIds)
          ? component.metadata.directDiagramIds
          : []


      return diagramIds.map(diagramId => ({
        documentId: component.documentId || null,
        diagramId,
        diagramName: diagramId,
        subject: {
          bpmnId: component?.metadata?.bpmnId || null,
          type: component.type === 'process'
            ? 'bpmn:Process'
            : 'bpmn:Collaboration',
          name: component.name || component?.metadata?.bpmnId || null
        }
      }))
    })
  }


  /*
   * ------------------------------------------------------------
   * Normal BPMN properties
   * ------------------------------------------------------------
   */

  const bpmnCapabilities =
    applyBpmnCapabilities({
      modeler,
      editable: !isViewerMode(appMode),
      propertiesPanel: '#bpmn-props'
    })


  /*
   * ------------------------------------------------------------
   * BPMNDiagram properties
   * ------------------------------------------------------------
   */

  const diagramPropertiesPanel =
    createDiagramPropertiesPanel({

      container:
        diagramPropertiesContainer,

      bpmnPropertiesContainer
    })


  const visualPropertiesPanel =
    !isViewerMode(appMode)
      ? createVisualPropertiesPanel({
          container:
            visualPropertiesContainer,
          modeler,
          editable: true
        })
      : null


  /*
   * ------------------------------------------------------------
   * BPMN graphical selection
   * ------------------------------------------------------------
   */

  function selectBpmnElement(
    bpmnElementId
  ) {

    if (
      !bpmnElementId
    ) {

      return null
    }


    const elementRegistry =
      modeler.get(
        'elementRegistry'
      )


    const selection =
      modeler.get(
        'selection'
      )


    const element =
      elementRegistry.get(
        bpmnElementId
      )


    if (
      !element
    ) {

      return null
    }


    selection.select(
      element
    )


    return element
  }


  /*
   * Any explicit canvas selection returns Properties to the
   * normal BPMN semantic/contextual surface.
   */

  modeler.on(
    'selection.changed',
    event => {

      const selection =
        event?.newSelection ||
        []


      if (
        selection.length >
        0
      ) {

        diagramPropertiesPanel
          .showBpmnProperties()
      }


      if (
        layout.modelNavigationTabs?.active ===
        'diagrams'
      ) {

        visualPropertiesPanel
          ?.show(selection)
      } else {

        visualPropertiesPanel
          ?.hide()
      }
    }
  )


  /*
   * ------------------------------------------------------------
   * BPMN diagram navigation
   *
   * diagramId is authoritative whenever supplied.
   * ------------------------------------------------------------
   */

  async function openBpmnDiagram(
    diagramTarget = null
  ) {

    if (
      !diagramTarget
    ) {

      return null
    }


    const {
      diagramId = null,
      preferredRootElementId = null
    } = diagramTarget


    if (
      !diagramId &&
      !preferredRootElementId
    ) {

      return null
    }


    const definitions =
      modeler.getDefinitions?.()


    const diagrams =
      definitions?.diagrams ||
      []


    /*
     * Exact BPMNDiagram selection.
     */

    if (
      diagramId
    ) {

      const exactDiagram =
        diagrams.find(
          candidate =>
            candidate.id ===
            diagramId
        ) ||
        null


      if (
        !exactDiagram
      ) {

        return null
      }


      await modeler.open(
        exactDiagram
      )


      return (
        modeler
          .get(
            'canvas'
          )
          .getRootElement() ||
        null
      )
    }


    /*
     * Compatibility fallback by BPMNPlane subject.
     */

    const canvas =
      modeler.get(
        'canvas'
      )


    const currentRootElement =
      canvas.getRootElement()


    if (
      currentRootElement?.id ===
      preferredRootElementId
    ) {

      return currentRootElement
    }


    const diagram =
      diagrams.find(
        candidate =>
          candidate
            .plane
            ?.bpmnElement
            ?.id ===
          preferredRootElementId
      ) ||
      null


    if (
      !diagram
    ) {

      return null
    }


    await modeler.open(
      diagram
    )


    return (
      modeler
        .get(
          'canvas'
        )
        .getRootElement() ||
      null
    )
  }


  /*
   * ------------------------------------------------------------
   * Exact BPMNDiagram lookup
   * ------------------------------------------------------------
   */

  function getBpmnDiagram(
    diagramId
  ) {

    if (
      !diagramId
    ) {

      return null
    }


    const definitions =
      modeler.getDefinitions?.()


    const diagrams =
      definitions?.diagrams ||
      []


    return (
      diagrams.find(
        diagram =>
          diagram.id ===
          diagramId
      ) ||
      null
    )
  }


  /*
   * ------------------------------------------------------------
   * Diagram Browser -> BPMN navigation
   *
   * The BPMNDiagram itself becomes the Properties target.
   *
   * Its BPMNPlane subject remains a relation of the View; it is
   * not substituted for the Diagram selection.
   * ------------------------------------------------------------
   */

  async function handleDiagramSelection(
    view
  ) {

    if (
      !view?.diagramId ||
      !view?.documentId
    ) {
      return
    }


    const documents =
      activeRepository?.get?.()?.documents ||
      repositoryDocumentStore


    const repositoryDocument =
      documents?.getDocument?.(
        view.documentId
      ) || null


    if (!repositoryDocument) {
      return
    }


    documents.setActiveDocument?.(
      repositoryDocument.id
    )


    await actions
      .onRepositoryDocumentSelected?.(
        repositoryDocument,
        null,
        null
      )


    await openBpmnDiagram({
      diagramId: view.diagramId,
      preferredRootElementId:
        view.subject?.bpmnId || null
    })


    const selection =
      modeler.get(
        'selection'
      )

    selection.select(
      null
    )


    const diagram =
      getBpmnDiagram(
        view.diagramId
      )


    diagramPropertiesPanel
      .showDiagram(
        diagram
      )
  }


  /*
   * ------------------------------------------------------------
   * Repository selection resolution
   * ------------------------------------------------------------
   */

  function resolveActiveRepositoryModel() {

    return (
      activeRepository
        ?.get
        ?.()
        ?.model ||
      repositoryModel
    )
  }


  function resolveSelectionView(
    component,
    repositorySelection
  ) {

    if (
      !repositorySelection
    ) {

      return null
    }


    switch (
      repositorySelection.kind
    ) {

      case 'participant':

        return resolveRepositoryView({

          repositoryModel:
            resolveActiveRepositoryModel(),

          componentId:
            repositorySelection
              .participantComponentId
        })


      case 'component':

        return resolveRepositoryView({

          repositoryModel:
            resolveActiveRepositoryModel(),

          componentId:
            component?.id ||
            repositorySelection
              .componentId ||
            null
        })


      case 'reference':

        return resolveRepositoryView({

          repositoryModel:
            resolveActiveRepositoryModel(),

          referenceId:
            repositorySelection
              .referenceId
        })


      default:

        return null
    }
  }


  /*
   * ------------------------------------------------------------
   * Single contextual Process resolution
   * ------------------------------------------------------------
   */

  function resolveSingleContextualView(
    resolvedView
  ) {

    if (
      !resolvedView ||
      resolvedView.diagramTarget
    ) {

      return resolvedView
    }


    const contextualViews =
      Array.isArray(
        resolvedView.contextualViews
      )
        ? resolvedView.contextualViews
        : []


    if (
      contextualViews.length !==
      1
    ) {

      return resolvedView
    }


    const processReferenceId =
      contextualViews[0]
        ?.processReferenceId ||
      null


    if (
      !processReferenceId
    ) {

      return resolvedView
    }


    const contextualView =
      resolveRepositoryView({

        repositoryModel:
          resolveActiveRepositoryModel(),

        referenceId:
          processReferenceId
      })


    if (
      !contextualView ||
      contextualView.status !==
        'resolved'
    ) {

      return resolvedView
    }


    return contextualView
  }


  /*
   * ------------------------------------------------------------
   * Repository -> BPMN navigation
   * ------------------------------------------------------------
   */

  async function handleRepositorySelection(
    repositoryDocument,
    component,
    repositorySelection
  ) {

    /*
     * A selected Environment document may belong to a
     * representation language other than BPMN.
     *
     * Dispatch before entering the BPMN-specific navigation chain.
     */

    if (
      repositoryDocument?.kind ===
        'archimate'
    ) {

      await showArchimate({
        xml:
          repositoryDocument.content,

        documentId:
          repositoryDocument.id
      })


      return
    }


    /*
     * BPMN repository selection makes a BPMN semantic or contextual
     * object the Properties target.
     */

    diagramPropertiesPanel
      .showBpmnProperties()


    await actions
      .onRepositoryDocumentSelected?.(
        repositoryDocument,
        component,
        repositorySelection
      )


    /*
     * Repository navigation may have loaded another physical
     * BPMN document.
     */

    diagramBrowser?.render()


    let resolvedView =
      resolveSelectionView(
        component,
        repositorySelection
      )


    if (
      !resolvedView ||
      resolvedView.status !==
        'resolved'
    ) {

      return
    }


    resolvedView =
      resolveSingleContextualView(
        resolvedView
      )


    const diagramTarget =
      resolvedView
        .diagramTarget ||
      null


    const preferredElementId =
      resolvedView
        .graphicalTarget
        ?.preferredElementId ||
      null


    if (
      diagramTarget
    ) {

      await openBpmnDiagram(
        diagramTarget
      )


      selectBpmnElement(
        preferredElementId
      )


      return
    }


    const contextualDiagramViews =
      Array.isArray(
        resolvedView
          .context
          ?.diagramViews
      )
        ? resolvedView
            .context
            .diagramViews
        : []


    if (
      contextualDiagramViews.length >
      1
    ) {

      openRepositoryViewDialog({

        views:
          contextualDiagramViews,

        title:
          'Choose BPMN View',

        onSelect:
          async selectedView => {

            await openBpmnDiagram({

              diagramId:
                selectedView
                  .diagramId,

              preferredRootElementId:
                resolvedView
                  .context
                  ?.collaborationBpmnId ||
                null
            })


            selectBpmnElement(
              preferredElementId
            )
          }
      })


      return
    }


    await openBpmnDiagram(
      diagramTarget
    )


    selectBpmnElement(
      preferredElementId
    )
  }


  /*
   * ------------------------------------------------------------
   * Repository Browser
   * ------------------------------------------------------------
   */

  contextsBrowser =
    createWorkspaceContextsBrowser({
      container:
        layout.contextsBrowserContainer,
      businessObjectStore:
        activeBusinessObjectStore,
      repositoryModel,
      activeRepository,
      projectionProfile,
      onSelect:
        async selection => {
          const repositoryComponentId =
            selection?.repositoryComponentId || null

          if (!repositoryComponentId) {
            return
          }

          const activeModel =
            resolveActiveRepositoryModel()
          const component =
            activeModel?.getComponent?.(
              repositoryComponentId
            ) || null
          const documents =
            activeRepository?.get?.()?.documents ||
            repositoryDocumentStore
          const repositoryDocument =
            component?.documentId
              ? documents?.getDocument?.(
                  component.documentId
                ) || null
              : null

          if (!repositoryDocument) {
            return
          }

          documents.setActiveDocument?.(
            repositoryDocument.id
          )

          await handleRepositorySelection(
            repositoryDocument,
            component,
            selection
          )
        }
    })


  repositoryBrowser =
    createRepositoryBrowser({

      store:
        repositoryDocumentStore,

      repositoryModel,

      activeRepository,

      getRepositories,

      getSources,

      onRepositorySelect,

      onSourceSelect,

      onResourceSelect: ({ sourceId, resource }) => {
        layout.setCentralRepresentation?.(
          layout.CENTRAL_REPRESENTATION.RESOURCE,
          { view: createResourceView({ sourceId, resource }) }
        )
      },

      onDuplicateResourceRequest,

      onDeriveResourceRequest,

      projectionProfile,

      container:
        layout.repositoryBrowserContainer,

      onSelect:
        handleRepositorySelection,

      onContainerSelect:
        repositoryContainer => {

          console.info(
            'Repository container selected:',
            repositoryContainer
          )
        }
    })


  // The lower Models pane opens on the semantic model hierarchy.
  // Sources remains a distinct projection selected by its own tab.
  repositoryBrowser.setView('models')


  const contextsTreeSearch =
    createWorkspaceTreeSearch({
      container:
        layout.contextsTreeSearchContainer,
      initialQuery:
        contextsBrowser.getSearchQuery(),
      onQueryChange:
        query => contextsBrowser.setSearchQuery(query)
    })


  let workspaceTreeSearch = null


  layout.onRepositoryNavigationChange?.(
    navigation => {
      if (navigation === 'contexts') {
        contextsBrowser.render()
      }

      if (navigation === 'diagrams') {
        repositoryDiagramBrowser?.render?.()
      }
    }
  )


  layout.onModelNavigationChange?.(
    navigation => {

      if (
        navigation !==
        'diagrams'
      ) {

        visualPropertiesPanel
          ?.hide()
      }


      if (navigation === 'models') {
        repositoryBrowser.setView('models')
        workspaceTreeSearch?.setContext?.('models')
        return
      }

      if (navigation === 'sources') {
        repositoryBrowser.setView('sources')
        workspaceTreeSearch?.setContext?.('sources')
        layout.setCentralRepresentation?.(
          layout.CENTRAL_REPRESENTATION.RESOURCE,
          { view: createResourceView() }
        )
        return
      }

      if (navigation === 'diagrams') {
        diagramBrowser?.render?.()

        const selection =
          modeler
            .get('selection')
            ?.get?.() ||
          []

        visualPropertiesPanel
          ?.show(selection)
      }
    }
  )


  workspaceTreeSearch = createWorkspaceTreeSearch({

    container:
      layout.workspaceTreeSearchContainer,

    initialQuery:
      repositoryBrowser.getSearchQuery(),

    onQueryChange:
      query => {

        repositoryBrowser.setSearchQuery(
          query
        )
      }
  })


  /*
   * ------------------------------------------------------------
   * Diagram Browser
   * ------------------------------------------------------------
   */

  repositoryDiagramBrowser =
    createDiagramBrowser({

      container:
        layout.repositoryDiagramBrowserContainer,

      getProjectedDiagrams:
        getProjectedDiagrams,

      getArchimateDocuments:
        () => (
          activeRepository?.get?.()?.documents || repositoryDocumentStore
        )?.getDocuments?.().filter(document => document.kind === 'archimate') || [],

      getRootLabel:
        () => {
          const repository = activeRepository?.get?.() || null
          return repository?.name || repository?.id || 'Repository'
        },

      onSelect:
        handleDiagramSelection,

      onSelectArchimate:
        document => showArchimate({
          xml: document.content,
          documentId: document.id
        })
    })


  diagramBrowser =
    createDiagramBrowser({

      container:
        layout.diagramBrowserContainer,

      getProjectedDiagrams:
        getProjectedDiagrams,

      getArchimateDocuments:
        () => (
          activeRepository?.get?.()?.documents || repositoryDocumentStore
        )?.getDocuments?.().filter(document => document.kind === 'archimate') || [],

      onSelect:
        handleDiagramSelection,

      onSelectArchimate:
        document => showArchimate({
          xml: document.content,
          documentId: document.id
        })
    })


  /*
   * ------------------------------------------------------------
   * Diagram Browser synchronization
   * ------------------------------------------------------------
   */

  modeler.on(
    'import.done',
    () => {

      layout.setCentralRepresentation?.(
        layout
          .CENTRAL_REPRESENTATION
          .BPMN
      )


      diagramBrowser.render()
      repositoryDiagramBrowser?.render?.()
    }
  )


  /*
   * ------------------------------------------------------------
   * Repository membership menu
   * ------------------------------------------------------------
   */

  const repositoryMembershipMenu =
    createRepositoryMembershipMenu({

      sidebar:
        repositoryBrowser.sidebar,

      repositoryModel,

      activeRepository,

      getAssignableContainers:
        () => getCocs?.() || [],

      getAdditionalMenuItems(
        nodeId
      ) {

        const item =
          repositoryBrowser
            .getResourceDuplicationMenuItem(
              nodeId
            )

        const items = []

        if (item) {
          items.push(item)
          items.push({
            id: 'derive-to-referential',
            text: 'Integrate / derive into Referential…',
            icon: 'w2ui-icon-plus'
          })
        }

        return items
      },

      onAdditionalMenuClick(
        event
      ) {

        const menuItemId =
          event.detail?.menuItem?.id

        if (menuItemId === 'duplicate-resource') {
          repositoryBrowser
            .requestResourceDuplication(
              event.target
            )
          return true
        }

        if (menuItemId === 'derive-to-referential') {
          repositoryBrowser
            .requestResourceDerivation(
              event.target
            )
          return true
        }

        return false
      },

      onAssignProcessToContainer({
        containerId,
        processId
      }) {

        const currentRepositoryModel =
          activeRepository
            ?.get?.()
            ?.model ||
          repositoryModel

        if (
          !currentRepositoryModel
            .getContainer(
              containerId
            )
        ) {

          const coc =
            (getCocs?.() || [])
              .find(
                candidate =>
                  candidate.id ===
                    containerId
              )

          if (coc) {
            currentRepositoryModel
              .addContainer({
                id: coc.id,
                type: 'coc',
                name: coc.name || coc.id,
                metadata: {
                  origin:
                    'business-object-coc'
                }
              })
          }
        }

        repositoryMembershipActions
          .assignProcessToContainer(
            containerId,
            processId
          )


        repositoryBrowser.render()
        contextsBrowser.render()
      },

      onUnassignProcessFromContainer({
        containerId,
        processId
      }) {

        repositoryMembershipActions
          .unassignProcessFromContainer(
            containerId,
            processId
          )


        repositoryBrowser.render()
        contextsBrowser.render()
      }
    })


  /*
   * ------------------------------------------------------------
   * Repository editor synchronization
   * ------------------------------------------------------------
   */

  const repositoryEditorSync =
    isViewerMode(
      appMode
    )
      ? null
      : createRepositoryEditorSync({

          modeler,

          repositoryDocumentStore,

          repositoryModel,

          activeRepository,

          repositoryBrowser
        })


  /*
   * ------------------------------------------------------------
   * Lint rendering
   * ------------------------------------------------------------
   */

  const renderLintResults =
    createLintRenderer(
      modeler
    )


  const lintResultStore =
    createLintResultStore({

      onResult:
        renderLintResults
    })


  const linter =
    new SemArchLinter(
      modeler,
      issues => {

        lintResultStore.set(
          'semarch',
          issues
        )
      }
    )


  const bpmnlintPanelBridge =
    createBpmnlintPanelBridge({

      modeler,

      onResult:
        issues => {

        lintResultStore.set(
          'bpmnlint',
          issues
        )
      }
    })


  /*
   * ------------------------------------------------------------
   * Resize
   * ------------------------------------------------------------
   */

  function resizeBpmnCanvas() {

    setTimeout(
      () => {

        try {

          modeler
            .get(
              'canvas'
            )
            .resized()

        } catch {

          /*
           * Canvas may not yet be completely initialized.
           */
        }

      },
      50
    )
  }


  layout.on(
    'resize',
    () => {

      try {

        layout
          .bpmnLayout
          .resize()

      } catch {

        // Nested layout not ready yet.
      }


      resizeBpmnCanvas()
    }
  )


  layout
    .bpmnLayout
    .on(
      'resize',
      () => {

        resizeBpmnCanvas()
      }
    )


  /*
   * ------------------------------------------------------------
   * Public API
   * ------------------------------------------------------------
   */

  return {

    layout,

    toolbar,

    bpmnLayout:
      layout.bpmnLayout,

    businessModelExplorerView,

    openBusinessModelExplorer,

    modeler,

    linter,

    lintResultStore,

    bpmnlintPanelBridge,

    diagramPropertiesPanel,

    repositoryDocumentStore,

    repositoryModel,

    businessObjectStore:
      activeBusinessObjectStore,

    businessObjectRepresentationStore,

    technicalIntrospection,

    technicalInspector,

    businessRelationStore,

    identityOriginStore,

    businessObjectExternalIdentityStore,

    businessObjectRepresentationActions,

    businessRelationActions,

    repositoryBrowser,

    contextsBrowser,

    diagramBrowser,

    repositoryMembershipActions,

    repositoryMembershipMenu,

    repositoryEditorSync,

    extractUiTree,

    extractRepositoryGraph,

    extractBpmnModel,

    extractBpmnViews,

    showArchimate,

    cocConfiguration:
      normalizedCocConfiguration,

    mode:
      appMode
  }
}

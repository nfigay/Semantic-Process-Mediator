import {
  createLayout
} from '../ui/layout.js'

import {
  createLintPanel,
  createLintRenderer
} from '../ui/lint-panel.js'

import {
  createReadOnlyPropertiesPanel
} from '../ui/read-only-properties-panel.js'

import {
  createDiagramPropertiesPanel
} from '../ui/diagram-properties-panel.js'

import {
  createRepositoryBrowser
} from '../ui/repository-browser.js'

import {
  createDiagramBrowser
} from '../ui/diagram-browser.js'

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
  createRepositoryDocumentStore
} from '../repository/repository-document-store.js'

import {
  createRepositoryModel
} from '../repository/repository-model.js'

import {
  createRepositoryEditorSync
} from '../repository/repository-editor-sync.js'

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
  createRepositoryMembershipActions
} from './repository-membership-actions.js'

import {
  normalizeAppMode,
  isViewerMode
} from './app-mode.js'


export function createApp({
  actions = {},
  lintProfile = 'L2',
  mode = 'editor'
} = {}) {

  const appMode =
    normalizeAppMode(
      mode
    )


  /*
   * ------------------------------------------------------------
   * Repository session
   * ------------------------------------------------------------
   */

  const repositoryDocumentStore =
    createRepositoryDocumentStore()


  const repositoryModel =
    createRepositoryModel()


  repositoryModel.addContainer({

    id:
      'CoC_Avionics',

    name:
      'Avionics',

    metadata: {

      methodology:
        'avionics-standard',

      maturity:
        'L2'
    }
  })


  /*
   * ------------------------------------------------------------
   * Repository membership actions
   * ------------------------------------------------------------
   */

  const repositoryMembershipActions =
    createRepositoryMembershipActions({
      repositoryModel
    })


  /*
   * ------------------------------------------------------------
   * Browser references
   * ------------------------------------------------------------
   */

  let repositoryBrowser =
    null


  let diagramBrowser =
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
        repositoryModel
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

      onNew:
        actions.onNew,

      onImport:
        actions.onImport,

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
          "
        >

          <div
            id="bpmn-props"
            style="
              width:100%;
              height:100%;
              overflow:hidden;
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
        '#bpmn-props'
    })


  /*
   * ------------------------------------------------------------
   * BPMN View Index
   * ------------------------------------------------------------
   */

  function getBpmnViewIndex() {

    const definitions =
      modeler.getDefinitions?.()


    return createBpmnViewIndex(
      definitions
    )
  }


  /*
   * ------------------------------------------------------------
   * Normal BPMN properties
   * ------------------------------------------------------------
   */

  const readOnlyPropertiesPanel =
    isViewerMode(
      appMode
    )
      ? createReadOnlyPropertiesPanel({

          modeler,

          container:
            '#bpmn-props'

        })
      : null


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
      !view?.diagramId
    ) {

      return
    }


    await openBpmnDiagram({

      diagramId:
        view.diagramId,

      preferredRootElementId:
        view.subject
          ?.bpmnId ||
        null
    })


    const selection =
      modeler.get(
        'selection'
      )


    /*
     * Do not keep a stale graphical selection from the previous
     * BPMNDiagram. The Diagram itself is now the active
     * Properties target.
     */

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

          repositoryModel,

          componentId:
            repositorySelection
              .participantComponentId
        })


      case 'component':

        return resolveRepositoryView({

          repositoryModel,

          componentId:
            component?.id ||
            repositorySelection
              .componentId ||
            null
        })


      case 'reference':

        return resolveRepositoryView({

          repositoryModel,

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

        repositoryModel,

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
     * Repository selection once again makes a BPMN semantic or
     * contextual object the Properties target.
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

  repositoryBrowser =
    createRepositoryBrowser({

      store:
        repositoryDocumentStore,

      repositoryModel,

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


  /*
   * ------------------------------------------------------------
   * Diagram Browser
   * ------------------------------------------------------------
   */

  diagramBrowser =
    createDiagramBrowser({

      container:
        layout.diagramBrowserContainer,

      getViewIndex:
        getBpmnViewIndex,

      onSelect:
        handleDiagramSelection
    })


  /*
   * ------------------------------------------------------------
   * Diagram Browser synchronization
   * ------------------------------------------------------------
   */

  modeler.on(
    'import.done',
    () => {

      diagramBrowser.render()
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

      onAssignProcessToContainer({
        containerId,
        processId
      }) {

        repositoryMembershipActions
          .assignProcessToContainer(
            containerId,
            processId
          )


        repositoryBrowser.render()
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

          repositoryBrowser,

          containerId:
            'CoC_Avionics'
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


  linter.setProfile(
    lintProfile
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

    bpmnLayout:
      layout.bpmnLayout,

    modeler,

    linter,

    lintResultStore,

    bpmnlintPanelBridge,

    readOnlyPropertiesPanel,

    diagramPropertiesPanel,

    repositoryDocumentStore,

    repositoryModel,

    repositoryBrowser,

    diagramBrowser,

    repositoryMembershipActions,

    repositoryMembershipMenu,

    repositoryEditorSync,

    extractUiTree,

    extractRepositoryGraph,

    extractBpmnModel,

    extractBpmnViews,

    mode:
      appMode
  }
}
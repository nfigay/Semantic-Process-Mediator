import {
  w2layout
} from 'w2ui'

import {
  createCentralViewHost
} from './central-view-host.js'

import {
  createWelcomeView
} from './views/welcome-view.js'


export function createLayout({
  toolbar,
  mode = 'editor'
} = {}) {

  const isViewer =
    mode ===
    'viewer'


  /*
   * ------------------------------------------------------------
   * Main application layout
   *
   * left   -> Environment / navigation
   * main   -> BPMN nested layout
   * right  -> Properties
   * bottom -> Lint
   *
   * At cold start:
   *
   * - Environment remains visible
   * - central workspace shows WelcomeView
   * - Properties is hidden
   * - Lint remains visible
   * ------------------------------------------------------------
   */

  const layout =
    new w2layout({

      box:
        '#app',

      name:
        'main-layout',

      panels: [

        {
          type:
            'top',

          size:
            40,

          resizable:
            false,

          style:
            'background:#1E3A5F;' +
            'color:#fff;',

          toolbar
        },


        {
          type:
            'left',

          size:
            260,

          minSize:
            180,

          resizable:
            true,

          style:
            'background:#F4F6F9;' +
            'border-right:1px solid #D4DCE6;' +
            'overflow:hidden;' +
            'padding:0;'
        },


        {
          type:
            'main',

          style:
            'background:#fff;' +
            'overflow:hidden;'
        },


        {
          type:
            'right',

          size:
            320,

          minSize:
            220,

          resizable:
            true,

          hidden:
            true,

          style:
            'background:#F9FAFB;' +
            'border-left:1px solid #D4DCE6;' +
            'overflow:hidden;'
        },


        {
          type:
            'bottom',

          size:
            130,

          minSize:
            70,

          resizable:
            true,

          style:
            'background:#F4F6F9;' +
            'border-top:1px solid #D4DCE6;' +
            'overflow:hidden;'
        }

      ]
    })


  /*
   * ------------------------------------------------------------
   * Navigation
   * ------------------------------------------------------------
   */

  layout
    .el(
      'left'
    )
    .innerHTML =
      `
        <div
          id="navigation-panel"
          style="
            width:100%;
            height:100%;

            display:flex;
            flex-direction:column;

            overflow:hidden;
          "
        >

          <div
            id="navigation-tabs"
            style="
              flex:0 0 34px;

              display:flex;

              border-bottom:1px solid #D4DCE6;

              background:#E9EDF2;
            "
          >

            <button
              id="navigation-repository"
              type="button"
              style="
                flex:1;

                border:0;
                border-right:1px solid #D4DCE6;

                background:#FFFFFF;

                cursor:pointer;
              "
            >
              Environment
            </button>


            <button
              id="navigation-diagrams"
              type="button"
              style="
                flex:1;

                border:0;

                background:#E9EDF2;

                cursor:pointer;
              "
            >
              Diagrams
            </button>

          </div>


          <div
            id="navigation-content"
            style="
              flex:1 1 auto;
              min-height:0;

              position:relative;

              overflow:hidden;
            "
          >

            <div
              id="repository-browser"
              style="
                width:100%;
                height:100%;

                overflow:hidden;
              "
            ></div>


            <div
              id="diagram-browser"
              style="
                display:none;

                width:100%;
                height:100%;

                overflow:hidden;
              "
            ></div>

          </div>

        </div>
      `


  /*
   * ------------------------------------------------------------
   * Stable navigation elements
   * ------------------------------------------------------------
   */

  const leftPanel =
    layout.el(
      'left'
    )


  layout.repositoryBrowserContainer =
    leftPanel.querySelector(
      '#repository-browser'
    )


  layout.diagramBrowserContainer =
    leftPanel.querySelector(
      '#diagram-browser'
    )


  const repositoryButton =
    leftPanel.querySelector(
      '#navigation-repository'
    )


  const diagramsButton =
    leftPanel.querySelector(
      '#navigation-diagrams'
    )


  /*
   * ------------------------------------------------------------
   * Navigation mode
   * ------------------------------------------------------------
   */

  function showNavigation(
    navigation
  ) {

    const showRepository =
      navigation ===
      'repository'


    layout
      .repositoryBrowserContainer
      .style
      .display =
        showRepository
          ? 'block'
          : 'none'


    layout
      .diagramBrowserContainer
      .style
      .display =
        showRepository
          ? 'none'
          : 'block'


    repositoryButton
      .style
      .background =
        showRepository
          ? '#FFFFFF'
          : '#E9EDF2'


    diagramsButton
      .style
      .background =
        showRepository
          ? '#E9EDF2'
          : '#FFFFFF'
  }


  repositoryButton.addEventListener(
    'click',
    () => {

      showNavigation(
        'repository'
      )
    }
  )


  diagramsButton.addEventListener(
    'click',
    () => {

      showNavigation(
        'diagrams'
      )
    }
  )


  layout.showNavigation =
    showNavigation


  /*
   * ------------------------------------------------------------
   * Container for nested BPMN W2UI layout
   * ------------------------------------------------------------
   */

  layout
    .el(
      'main'
    )
    .innerHTML =
      `
        <div
          id="bpmn-layout"
          style="
            width:100%;
            height:100%;

            overflow:hidden;
          "
        ></div>
      `


  /*
   * ------------------------------------------------------------
   * Nested BPMN layout
   *
   * left -> BPMN palette
   * main -> central workspace
   *
   * IMPORTANT:
   *
   * Do not apply position:relative to W2UI panel content.
   * W2UI owns panel geometry.
   *
   * Palette starts hidden because BPMN is not the initial
   * central representation.
   * ------------------------------------------------------------
   */

  const bpmnLayout =
    new w2layout({

      box:
        '#bpmn-layout',

      name:
        'bpmn-layout',

      padding:
        0,

      panels: [

        {
          type:
            'left',

          size:
            52,

          minSize:
            52,

          resizable:
            false,

          hidden:
            true,

          style:
            'background:#F4F6F9;' +
            'border-right:1px solid #D4DCE6;' +
            'overflow:hidden;' +
            'padding:0;'
        },


        {
          type:
            'main',

          style:
            'background:#fff;' +
            'overflow:hidden;'
        }

      ]
    })


  /*
   * ------------------------------------------------------------
   * Central workspace
   *
   * W2UI owns panel geometry.
   *
   * We fill the generated main panel using:
   *
   *   position:absolute;
   *   inset:0;
   *
   * on our own child only.
   *
   * Structure:
   *
   * bpmnLayout.main
   * └── #bpmn-workspace
   *     ├── #bpmn-canvas
   *     └── #central-view-host
   *
   * IMPORTANT:
   *
   * #bpmn-canvas is NEVER display:none.
   *
   * bpmn-js must retain a real measurable canvas even while
   * another central representation is displayed.
   *
   * CentralViewHost covers the BPMN canvas for non-BPMN
   * central representations.
   * ------------------------------------------------------------
   */

  bpmnLayout
    .el(
      'main'
    )
    .innerHTML =
      `
        <div
          id="bpmn-workspace"
          style="
            position:absolute;
            inset:0;

            overflow:hidden;

            background:#FFFFFF;
          "
        >

          <div
            id="bpmn-canvas"
            style="
              position:absolute;
              inset:0;

              overflow:hidden;

              background:#FFFFFF;
            "
          ></div>


          <div
            id="central-view-host"
            style="
              position:absolute;
              inset:0;

              z-index:100;

              overflow:auto;

              background:#FFFFFF;
            "
          ></div>

        </div>
      `


  /*
   * ------------------------------------------------------------
   * BPMN palette
   * ------------------------------------------------------------
   */

  if (
    !isViewer
  ) {

    bpmnLayout
      .el(
        'left'
      )
      .innerHTML =
        `
          <div
            id="bpmn-palette"
            style="
              width:100%;
              height:100%;

              overflow:hidden;
            "
          ></div>
        `
  }


  layout.bpmnLayout =
    bpmnLayout


  /*
   * ------------------------------------------------------------
   * Stable central workspace elements
   * ------------------------------------------------------------
   */

  const bpmnMainPanel =
    bpmnLayout.el(
      'main'
    )


  const centralViewContainer =
    bpmnMainPanel.querySelector(
      '#central-view-host'
    )


  /*
   * ------------------------------------------------------------
   * Central View Host
   * ------------------------------------------------------------
   */

  const centralViewHost =
    createCentralViewHost({
      container:
        centralViewContainer
    })


  /*
   * ------------------------------------------------------------
   * Welcome View
   *
   * Welcome and Toolbar deliberately share the same command
   * dispatcher.
   * ------------------------------------------------------------
   */

  const welcomeView =
    createWelcomeView({

      mode,

      onNewProcess() {

        toolbar
          ?.invoke?.(
            'new-process'
          )
      },

      onOpenRepository() {

        toolbar
          ?.invoke?.(
            'open-repository'
          )
      },

      onImportBpmn() {

        toolbar
          ?.invoke?.(
            'import-environment'
          )
      }
    })


  layout.centralViewHost =
    centralViewHost


  layout.welcomeView =
    welcomeView


  /*
   * ------------------------------------------------------------
   * Toolbar BPMN-model-dependent state
   * ------------------------------------------------------------
   */

  function setToolbarModelState(
    active
  ) {

    const toolbarInstance =
      layout
        .get(
          'top'
        )
        ?.toolbar


    if (
      !toolbarInstance
    ) {

      return
    }


    for (
      const itemId
      of (
        toolbar
          ?.modelCommandIds ||
        []
      )
    ) {

      if (
        active
      ) {

        toolbarInstance.enable(
          itemId
        )

      } else {

        toolbarInstance.disable(
          itemId
        )
      }
    }
  }


  /*
   * ------------------------------------------------------------
   * Central representation state
   *
   * welcome
   *
   *   Environment       visible
   *   BPMN canvas       mounted and measurable
   *   CentralViewHost   visible with WelcomeView
   *   Lint              visible
   *   Properties        hidden
   *   BPMN palette      hidden
   *   BPMN commands     disabled
   *
   * bpmn
   *
   *   Environment       visible
   *   BPMN canvas       visible
   *   CentralViewHost   hidden
   *   Lint              visible
   *   Properties        visible
   *   BPMN palette      visible in editor
   *   BPMN commands     enabled
   *
   * archimate
   *
   *   Environment       visible
   *   BPMN canvas       mounted behind CentralViewHost
   *   CentralViewHost   visible with supplied ArchiMateView
   *   Lint              visible
   *   Properties        hidden
   *   BPMN palette      hidden
   *   BPMN commands     disabled
   * ------------------------------------------------------------
   */

  const CENTRAL_REPRESENTATION = {
    WELCOME:
      'welcome',

    BPMN:
      'bpmn',

    ARCHIMATE:
      'archimate'
  }


  let centralRepresentation =
    CENTRAL_REPRESENTATION
      .WELCOME


  function showCentralViewContainer() {

    if (
      !centralViewContainer
    ) {

      return
    }


    centralViewContainer
      .style
      .display =
        'block'
  }


  function hideCentralViewContainer() {

    if (
      !centralViewContainer
    ) {

      return
    }


    centralViewContainer
      .style
      .display =
        'none'
  }


  async function showWelcome() {

    showCentralViewContainer()


    if (
      !centralViewHost.isActive(
        welcomeView.id
      )
    ) {

      await centralViewHost.show(
        welcomeView
      )
    }
  }


  async function showHostedView(
    view
  ) {

    if (
      !view ||
      !view.id
    ) {

      throw new Error(
        'Central representation requires a view with an id'
      )
    }


    showCentralViewContainer()


    if (
      !centralViewHost.isActive(
        view.id
      )
    ) {

      await centralViewHost.show(
        view
      )
    }
  }


  function updateCentralRepresentationChrome(
    representation
  ) {

    const bpmnActive =
      representation ===
      CENTRAL_REPRESENTATION
        .BPMN


    if (
      bpmnActive
    ) {

      layout.show(
        'right',
        true
      )


      if (
        !isViewer
      ) {

        bpmnLayout.show(
          'left',
          true
        )
      }

    } else {

      layout.hide(
        'right',
        true
      )


      if (
        !isViewer
      ) {

        bpmnLayout.hide(
          'left',
          true
        )
      }
    }


    setToolbarModelState(
      bpmnActive
    )
  }


  function resizeCentralWorkspace() {

    window.setTimeout(
      () => {

        try {

          layout.resize()

        } catch {

          // Main layout may still be settling.
        }


        try {

          bpmnLayout.resize()

        } catch {

          // Nested layout may still be settling.
        }


        try {

          window.semarchApp
            ?.modeler
            ?.get(
              'canvas'
            )
            ?.resized?.()

        } catch {

          // BPMN engine may not yet be available.
        }

      },
      0
    )
  }


  async function setCentralRepresentation(
    representation,
    {
      view = null
    } = {}
  ) {

    if (
      !Object.values(
        CENTRAL_REPRESENTATION
      )
        .includes(
          representation
        )
    ) {

      throw new Error(
        `Unsupported central representation: ${representation}`
      )
    }


    switch (
      representation
    ) {

      case CENTRAL_REPRESENTATION
        .WELCOME:

        await showWelcome()

        break


      case CENTRAL_REPRESENTATION
        .BPMN:

        hideCentralViewContainer()

        break


      case CENTRAL_REPRESENTATION
        .ARCHIMATE:

        await showHostedView(
          view
        )

        break
    }


    centralRepresentation =
      representation


    updateCentralRepresentationChrome(
      centralRepresentation
    )


    resizeCentralWorkspace()


    return centralRepresentation
  }


  function getCentralRepresentation() {

    return centralRepresentation
  }


  /*
   * ------------------------------------------------------------
   * Compatibility API
   *
   * Existing BPMN callers still use setModelActive(boolean).
   * Keep that contract during A7.5a.
   *
   * A later increment may migrate those callers and remove this
   * compatibility layer once the explicit representation API is
   * demonstrated.
   * ------------------------------------------------------------
   */

  function setModelActive(
    active
  ) {

    return setCentralRepresentation(
      active
        ? CENTRAL_REPRESENTATION
            .BPMN
        : CENTRAL_REPRESENTATION
            .WELCOME
    )
  }


  function hasActiveModel() {

    return (
      centralRepresentation !==
      CENTRAL_REPRESENTATION
        .WELCOME
    )
  }


  layout.CENTRAL_REPRESENTATION =
    CENTRAL_REPRESENTATION


  layout.setCentralRepresentation =
    setCentralRepresentation


  layout.getCentralRepresentation =
    getCentralRepresentation


  layout.setModelActive =
    setModelActive


  layout.hasActiveModel =
    hasActiveModel


  /*
   * ------------------------------------------------------------
   * Cold start
   *
   * Do not create or load a BPMN or ArchiMate model implicitly.
   *
   * WelcomeView is the initial central representation.
   *
   * The BPMN canvas nevertheless remains mounted behind it.
   * ------------------------------------------------------------
   */

  setToolbarModelState(
    false
  )


  setCentralRepresentation(
    CENTRAL_REPRESENTATION
      .WELCOME
  )


  return layout
}
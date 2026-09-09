import {
  w2layout
} from 'w2ui'


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
   * left   -> Navigation
   * main   -> BPMN nested layout
   * right  -> Properties
   * bottom -> Lint
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
              Repository
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
   * Container for the nested BPMN layout
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
            isViewer,

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
   * BPMN canvas
   * ------------------------------------------------------------
   */

  bpmnLayout
    .el(
      'main'
    )
    .innerHTML =
      `
        <div
          id="bpmn-canvas"
          style="
            width:100%;
            height:100%;
            position:relative;
            overflow:hidden;
          "
        ></div>
      `


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


  return layout
}
export function createToolbar({
  mode = 'editor',
  onNew,
  onImport,
  onExportXml,
  onExportSvg,
  onFit,
  onContext,
  onLint,
  onValidate,
  onExtractUiTree,
  onExtractRepositoryGraph,
  onExtractBpmnModel,
  onExtractBpmnViews
}) {

  const isViewer =
    mode ===
    'viewer'


  const items = [

    {
      type: 'html',
      id: 'title',

      html: `
        <span style="
          font-family:'Syne',sans-serif;
          font-weight:700;
          font-size:11px;
          letter-spacing:.1em;
          text-transform:uppercase;
          color:#fff;
          padding:0 8px;
        ">
          Semantic Process Mediator
        </span>
      `
    },


    {
      type: 'break'
    }

  ]


  if (
    !isViewer
  ) {

    items.push(

      {
        type: 'button',
        id: 'btn-new',
        text: 'New'
      }

    )
  }


  items.push(

    {
      type: 'button',
      id: 'btn-import',
      text: 'Import…'
    },


    {
      type: 'break'
    },


    {
      type: 'button',
      id: 'btn-export-xml',
      text: 'Export XML'
    },


    {
      type: 'button',
      id: 'btn-export-svg',
      text: 'Export SVG'
    },


    {
      type: 'break'
    },


    {
      type: 'button',
      id: 'btn-fit',
      text: 'Fit'
    },


    {
      type: 'break'
    }

  )


  if (
    !isViewer
  ) {

    items.push(

      {
        type: 'button',
        id: 'btn-context',
        text: '⚙ CoC Context'
      }

    )
  }


  items.push(

    {
      type: 'button',
      id: 'btn-lint',
      text: '⚡ Lint'
    }

  )


  if (
    !isViewer
  ) {

    items.push(

      {
        type: 'button',
        id: 'btn-validate',
        text: '✓ Validate'
      }

    )
  }


  items.push(

    {
      type: 'menu',
      id: 'utilities',
      text: 'Utilities',

      items: [

        {
          id: 'extracts',
          text: 'Extracts',

          items: [

            {
              id: 'extract-ui-tree',
              text: 'UI Tree'
            },

            {
              id: 'extract-repository-graph',
              text: 'Repository Graph'
            },

            {
              id: 'extract-bpmn-model',
              text: 'BPMN Model'
            },

            {
              id: 'extract-bpmn-views',
              text: 'BPMN Views'
            }

          ]
        }

      ]
    }

  )


  items.push(

    {
      type: 'html',
      id: 'method-status',

      html: `
        <span
          id="method-status-badge"
          data-status="NOT_VALIDATED"

          style="
            display:inline-block;

            margin-left:8px;
            padding:4px 10px;

            font-family:monospace;
            font-size:10px;
            font-weight:700;

            letter-spacing:.05em;

            color:#ffffff;
            background:#444444;

            border-radius:4px;

            white-space:nowrap;
          "
        >
          NOT VALIDATED
        </span>
      `
    },


    {
      type: 'spacer'
    },


    {
      type: 'html',
      id: 'badge',

      html: `
        <span
          id="lint-badge"

          style="
            display:none;

            font-family:monospace;
            font-size:11px;

            background:rgba(
              255,
              255,
              255,
              .12
            );

            color:#fff;

            padding:2px 10px;

            border-radius:20px;
          "
        >
        </span>
      `
    }

  )


  return {

    items,


    onClick(event) {

      const target =
        event.target


      switch (
        target
      ) {

        case 'btn-new':

          if (
            !isViewer
          ) {

            onNew?.()
          }

          break


        case 'btn-import':

          onImport?.()

          break


        case 'btn-export-xml':

          onExportXml?.()

          break


        case 'btn-export-svg':

          onExportSvg?.()

          break


        case 'btn-fit':

          onFit?.()

          break


        case 'btn-context':

          if (
            !isViewer
          ) {

            onContext?.()
          }

          break


        case 'btn-lint':

          onLint?.()

          break


        case 'btn-validate':

          if (
            !isViewer
          ) {

            onValidate?.()
          }

          break


        case 'utilities:extract-ui-tree':
        case 'extract-ui-tree':

          onExtractUiTree?.()

          break


        case 'utilities:extract-repository-graph':
        case 'extract-repository-graph':

          onExtractRepositoryGraph?.()

          break


        case 'utilities:extract-bpmn-model':
        case 'extract-bpmn-model':

          onExtractBpmnModel?.()

          break


        case 'utilities:extract-bpmn-views':
        case 'extract-bpmn-views':

          onExtractBpmnViews?.()

          break
      }
    }
  }
}
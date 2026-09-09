import {
  createRepositoryContextActions
} from './app/repository-context-actions.js'

import {
  createDiagramActions
} from './app/diagram-actions.js'

import {
  createMethodValidationActions
} from './app/method-validation-actions.js'

import {
  createMethodStatusActions
} from './app/method-status-actions.js'

import {
  createApp
} from './app/create-app.js'

import {
  createFileInput
} from './ui/file-input.js'

import {
  openRepositoryContextDialog
} from './ui/dialogs/repository-context-dialog.js'

import {
  renderMethodStatus,
  bindMethodStatusBadge
} from './ui/method-status-badge.js'

import {
  importBpmn,
  exportBpmnXml,
  exportBpmnSvg,
  download
} from './bpmn/io.js'

import {
  EMPTY_DIAGRAM
} from './bpmn/starter-bpmn.js'

import {
  createBpmnViewIndex
} from './bpmn/bpmn-view-index.js'

import {
  registerBpmnDocument
} from './repository/register-bpmn-document.js'

import {
  w2alert,
  w2confirm
} from 'w2ui/w2ui-2.0.es6.js'

import 'w2ui/w2ui-2.0.min.css'

import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import '@bpmn-io/properties-panel/assets/properties-panel.css'

import cocRegistry
  from './extensions/coc-registry.json'

import {
  getRepositoryContext,
  setRepositoryContext
} from './extensions/repository-context.js'

import {
  getMethodConfiguration,
  setMethodConfiguration
} from './extensions/method-configuration.js'

import {
  extractPalette
} from './ui/palette.js'


const fileInput =
  createFileInput()


let repositoryContextActions
let methodValidationActions
let methodStatusActions
let diagramActions


function updateMethodStatus() {

  if (!methodStatusActions) {
    return
  }


  const result =
    methodStatusActions.getStatus()


  console.log(
    '[Method Status]',
    result
  )


  renderMethodStatus(
    result
  )


  return result
}


const app =
  createApp({

    mode:
      'editor',

    actions: {

      onNew() {

        w2confirm(
          'Create a new diagram? Unsaved changes will be lost.'
        ).yes(
          async () => {

            await diagramActions.loadDiagram(
              EMPTY_DIAGRAM
            )

            updateMethodStatus()
          }
        )
      },


      onImport() {
        fileInput.open()
      },


      onExportXml() {
        diagramActions.exportXML()
      },


      onExportSvg() {
        diagramActions.exportSVG()
      },


      onFit() {

        modeler
          .get('canvas')
          .zoom(
            'fit-viewport'
          )
      },


      onContext() {
        repositoryContextActions.open()
      },


      onLint() {
        linter.run()
      },


      onValidate() {

        const result =
          methodValidationActions.validate()


        console.log(
          '[Method Validation]',
          result
        )


        /*
         * Validation may change the stored
         * MethodConfiguration.
         */

        updateMethodStatus()


        if (
          result.status ===
          'FAILED'
        ) {

          const errorCount =
            result.issues.filter(
              issue =>
                issue.severity ===
                'error'
            ).length


          w2alert(
            `
              <div style="
                padding:8px 4px;
                text-align:left;
                font-size:13px;
                line-height:1.5;
              ">

                <div style="
                  margin-bottom:10px;
                ">
                  <b>${errorCount}</b>
                  validation error${errorCount !== 1 ? 's' : ''} detected.
                </div>

                <div>
                  The model has not been validated.
                </div>

                <div style="
                  margin-top:6px;
                ">
                  The previous MethodConfiguration has been preserved.
                </div>

              </div>
            `,
            '✗ Validation failed'
          )

          return
        }


        const configuration =
          result.configuration


        w2alert(
          `
            <div style="
              display:grid;
              grid-template-columns:110px 1fr;
              gap:8px 16px;
              padding:8px 4px;
              text-align:left;
              font-size:13px;
              line-height:1.4;
            ">

              <div style="font-weight:600;">
                Profile
              </div>
              <div>
                ${configuration.profileId}
              </div>

              <div style="font-weight:600;">
                Version
              </div>
              <div>
                ${configuration.profileVersion}
              </div>

              <div style="font-weight:600;">
                CoC
              </div>
              <div>
                ${configuration.cocOwner || 'None'}
              </div>

              <div style="font-weight:600;">
                Maturity
              </div>
              <div>
                ${configuration.maturity}
              </div>

              <div style="font-weight:600;">
                Validated
              </div>
              <div>
                ${configuration.validatedAt}
              </div>

            </div>
          `,
          '✓ Model validated'
        )
      },


      async onRepositoryDocumentSelected(
        repositoryDocument
      ) {

        if (
          !repositoryDocument
        ) {

          return
        }


        await diagramActions.loadDiagram(
          repositoryDocument.xml
        )


        console.log(
          '[Repository Document Selected]',
          repositoryDocument
        )


        updateMethodStatus()
      }
    },

    lintProfile:
      'L2'
  })


const {
  layout,
  modeler,
  linter,
  repositoryDocumentStore,
  repositoryModel,
  repositoryBrowser,
  mode
} = app


window.semarchApp =
  app


console.log(
  '[SemArch App Mode]',
  mode
)


let importedDocumentSequence =
  0


function createImportedDocumentId() {

  importedDocumentSequence +=
    1


  return (
    `imported-${importedDocumentSequence}`
  )
}


repositoryContextActions =
  createRepositoryContextActions({
    modeler,
    linter,
    cocRegistry,

    openDialog:
      openRepositoryContextDialog,

    getContext:
      getRepositoryContext,

    setContext:
      setRepositoryContext,

    /*
     * RepositoryContext changed:
     * immediately recalculate whether
     * the previous validation is still current.
     */

    onContextChanged() {
      updateMethodStatus()
    }
  })


methodValidationActions =
  createMethodValidationActions({
    modeler,
    linter,

    readRepositoryContext:
      repositoryContextActions.read,

    setMethodConfiguration
  })


methodStatusActions =
  createMethodStatusActions({
    modeler,

    readRepositoryContext:
      repositoryContextActions.read,

    getMethodConfiguration
  })


diagramActions =
  createDiagramActions({
    modeler,
    layout,
    linter,

    importBpmn,
    exportBpmnXml,
    exportBpmnSvg,
    download,

    extractPalette,

    readRepositoryContext:
      repositoryContextActions.read,

    applyLintContext:
      repositoryContextActions.applyLintContext,

    alert:
      w2alert
  })


fileInput.setOnLoad(
  async (
    xml,
    file
  ) => {

    const documentId =
      createImportedDocumentId()


    const repositoryDocument =
      repositoryDocumentStore
        .addDocument({

          id:
            documentId,

          fileName:
            file.name,

          kind:
            'bpmn',

          xml,

          dirty:
            false
        })


    /*
     * Load the BPMN first.
     *
     * bpmn-js parses the XML and gives us access
     * to definitions.rootElements.
     */

    await diagramActions.loadDiagram(
      xml
    )


    /*
     * Build a read-only runtime index of BPMN-DI
     * views from the definitions parsed by bpmn-js.
     *
     * This does not modify the RepositoryModel.
     * It is currently diagnostic only.
     */

    const definitions =
      modeler.getDefinitions()


    const bpmnViewIndex =
      createBpmnViewIndex(
        definitions
      )


    console.log(
      '[BPMN View Index]',
      bpmnViewIndex.getViews()
    )


    console.table(
      bpmnViewIndex
        .getViews()
        .map(
          view => ({
            subjectId:
              view.subject?.bpmnId ||
              null,

            subjectType:
              view.subject?.type ||
              null,

            subjectName:
              view.subject?.name ||
              null,

            diagramId:
              view.diagramId,

            diagramName:
              view.diagramName
          })
        )
    )


    console.log(
      '[BPMN View Subjects]',
      bpmnViewIndex.getSubjects()
    )


    /*
     * Project the BPMN semantic root elements
     * into the runtime repository model.
     *
     * For this first iteration every detected
     * Process / Collaboration is attached to
     * the demonstration CoC.
     */

    const components =
      registerBpmnDocument({

        modeler,

        repositoryModel,

        repositoryDocument,

        containerId:
          'CoC_Avionics'
      })


    /*
     * RepositoryModel has changed.
     * Rebuild the w2ui repository tree.
     *
     * Do not select a repository component here.
     *
     * Import establishes the BPMN document and its
     * repository projection. It is not a repository
     * navigation request.
     *
     * In particular, a component may have several
     * contextual BPMNDiagram views. Choosing one of
     * those views belongs to an explicit repository
     * navigation initiated by the user.
     */

    repositoryBrowser.render()


    console.log(
      '[Repository Document Imported]',
      repositoryDocument
    )


    console.log(
      '[Repository Components Registered]',
      components
    )
  }
)


bindMethodStatusBadge(
  result => {

    if (!result) {
      return
    }


    if (
      result.status ===
      'NOT_VALIDATED'
    ) {

      w2alert(
        `
          <div style="
            padding:8px 4px;
            text-align:left;
            font-size:13px;
            line-height:1.5;
          ">
            This model has not yet been
            validated against a methodological
            configuration.
          </div>
        `,
        'Method status — Not validated'
      )

      return
    }


    if (
      result.status ===
      'CURRENT'
    ) {

      const configuration =
        result.storedConfiguration


      w2alert(
        `
          <div style="
            display:grid;
            grid-template-columns:110px 1fr;
            gap:8px 16px;
            padding:8px 4px;
            text-align:left;
            font-size:13px;
            line-height:1.4;
          ">

            <div style="font-weight:600;">
              Profile
            </div>
            <div>
              ${configuration.profileId}
            </div>

            <div style="font-weight:600;">
              Version
            </div>
            <div>
              ${configuration.profileVersion}
            </div>

            <div style="font-weight:600;">
              CoC
            </div>
            <div>
              ${configuration.cocOwner || 'None'}
            </div>

            <div style="font-weight:600;">
              Maturity
            </div>
            <div>
              ${configuration.maturity}
            </div>

            <div style="font-weight:600;">
              Validated
            </div>
            <div>
              ${configuration.validatedAt}
            </div>

          </div>
        `,
        'Method status — Current'
      )

      return
    }


    if (
      result.status ===
      'OUTDATED'
    ) {

      const rows =
        result.differences
          .map(
            difference => `
              <div style="font-weight:600;">
                ${difference.field}
              </div>

              <div>
                ${difference.previous ?? '—'}
              </div>

              <div>
                →
              </div>

              <div>
                ${difference.current ?? '—'}
              </div>
            `
          )
          .join('')


      w2alert(
        `
          <div style="
            padding:8px 4px;
            text-align:left;
            font-size:13px;
          ">

            <div style="
              margin-bottom:12px;
              line-height:1.5;
            ">
              The model was validated with a
              different methodological configuration.
            </div>

            <div style="
              display:grid;
              grid-template-columns:
                110px
                minmax(80px,1fr)
                20px
                minmax(80px,1fr);
              gap:8px 10px;
              align-items:center;
            ">

              <div style="font-weight:600;">
                Property
              </div>

              <div style="font-weight:600;">
                Validated
              </div>

              <div></div>

              <div style="font-weight:600;">
                Current
              </div>

              ${rows}

            </div>

          </div>
        `,
        'Method status — Outdated'
      )
    }
  }
)


await diagramActions.loadDiagram(
  EMPTY_DIAGRAM
)


updateMethodStatus()
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
  resolveEmbeddedProfileRuntime
} from './profiles/embedded-profile-resolver.js'

import {
  engineeringCocConfiguration
} from './configuration/engineering-coc-configuration.js'

import {
  avionicsCocConfiguration
} from './configuration/avionics-coc-configuration.js'

import {
  experimentalACocConfiguration
} from './configuration/experimental-a-coc-configuration.js'

import {
  experimentalBCocConfiguration
} from './configuration/experimental-b-coc-configuration.js'

import {
  activateCocProfileRuntime
} from './profiles/coc-profile-runtime-activation.js'

import {
  resolvePublicationConfiguration
} from './configuration/publication-configuration-resolver.js'

import {
  avionicsBusinessView
} from './configuration/avionics-business-view.js'

import {
  resolveStakeholderBusinessViewRef
} from './configuration/stakeholder-business-view-selection.js'

import {
  resolveBusinessView
} from './configuration/business-view-resolver.js'

import {
  createFileInput
} from './ui/file-input.js'

import {
  openRepositoryContextDialog
} from './ui/dialogs/repository-context-dialog.js'

import {
  openBusinessObjectDialog
} from './ui/dialogs/business-object-dialog.js'

import {
  openBusinessObjectsBrowserDialog
} from './ui/dialogs/business-objects-browser-dialog.js'

import {
  resolveBusinessObjectContextualProperties
} from './properties/business-object-contextual-properties.js'

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
  publishBpmnXml
} from './publication/bpmn-publication.js'


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
  projectRepositoryMetadata
} from './repository/project-repository-metadata.js'

import {
  projectBusinessObjects,
  setBusinessObjects,
  projectBusinessObjectRepresentations,
  setBusinessObjectRepresentations
} from './extensions/business-objects.js'

import {
  w2alert,
  w2confirm
} from 'w2ui/w2ui-2.0.es6.js'

import 'w2ui/w2ui-2.0.min.css'

import 'bpmn-js/dist/assets/bpmn-js.css'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import '@bpmn-io/properties-panel/assets/properties-panel.css'

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


const importFileInput =
  createFileInput({
    id:
      'bpmn-import-file-input'
  })


const viewerBpmnFileInput =
  createFileInput({
    id:
      'bpmn-viewer-open-file-input'
  })


const archimateImportFileInput =
  createFileInput({
    id:
      'archimate-import-file-input',

    accept:
      '.archimate,.xml'
  })


const repositoryFileInput =
  createFileInput({
    id:
      'repository-open-file-input'
  })


let repositoryContextActions
let methodValidationActions
let methodStatusActions
let diagramActions


function updateMethodStatus() {

  if (
    !methodStatusActions
  ) {

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


const cocConfigurations = [
  engineeringCocConfiguration,
  avionicsCocConfiguration,
  experimentalACocConfiguration,
  experimentalBCocConfiguration
]


const businessViews = [
  avionicsBusinessView
]


const stakeholderBusinessViewSelections = [
  {
    stakeholderRef:
      'CoC_Avionics',

    businessViewRef:
      'avionics'
  }
]


/*
 * ------------------------------------------------------------
 * Embedded BPMNSM profile runtime
 * ------------------------------------------------------------
 */

const profileRuntime =
  await resolveEmbeddedProfileRuntime({
    profileRef:
      engineeringCocConfiguration.profileRef
  })


const publicationConfiguration =
  resolvePublicationConfiguration({
    publicationRef:
      engineeringCocConfiguration.publicationRef
  })


let app =
  null


function showBusinessObject(
  businessObject
) {

  const activeProfileRuntime =
    app.modeler.get(
      'activeProfileRuntime'
    )


  const activeBusinessView =
    app.modeler.get(
      'activeBusinessView'
    )


  const repositoryContext =
    repositoryContextActions
      ?.read?.() ||
    {}


  const descriptors =
    resolveBusinessObjectContextualProperties({
      businessObject,
      profileRuntime:
        activeProfileRuntime.get(),
      businessView:
        activeBusinessView.get(),
      cocId:
        repositoryContext
          ?.cocOwner ||
        null
    })


  app
    .diagramPropertiesPanel
    .showBusinessObject({
      businessObject,
      descriptors
    })
}


app =
  createApp({

    mode:
      'editor',

    profileRuntime,

    readRepositoryContext:
      getRepositoryContext,

    cocConfiguration:
      engineeringCocConfiguration,

    publicationConfiguration,

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


      onNewBusinessObject() {

        openBusinessObjectDialog({

          onSave(
            businessObject
          ) {

            const addedBusinessObject =
              app
                .businessObjectStore
                .addBusinessObject(
                  businessObject
                )


            try {

              setBusinessObjects(
                modeler,
                app
                  .businessObjectStore
                  .getBusinessObjects()
              )

            } catch (
              error
            ) {

              app
                .businessObjectStore
                .removeBusinessObject(
                  addedBusinessObject.id
                )

              throw error
            }


            return addedBusinessObject
          }
        })
      },


      onNavigateBusinessObject(
        businessObject
      ) {

        showBusinessObject(
          businessObject
        )
      },


      onBrowseBusinessObjects() {

        openBusinessObjectsBrowserDialog({
          modeler:
            app.modeler,
          businessObjectStore:
            app.businessObjectStore,
          businessObjectRepresentationStore:
            app.businessObjectRepresentationStore,

          onSelectBusinessObject(
            businessObject
          ) {

            showBusinessObject(
              businessObject
            )
          }
        })
      },


      onBusinessObjectRepresentationsChanged() {

        setBusinessObjectRepresentations(
          app.modeler,
          app
            .businessObjectRepresentationStore
            .getBusinessObjectRepresentations()
        )
      },


      async onNewArchimate() {

        const documentId =
          createCreatedDocumentId()


        const archimateView =
          await app.showArchimate({
            documentId
          })


        const adapter =
          archimateView
            ?.getAdapter?.()


        if (
          !adapter
        ) {

          throw new Error(
            'New ArchiMate model has no active adapter'
          )
        }


        const saveResult =
          await adapter.saveXML({
            format:
              true
          })


        const xml =
          typeof saveResult ===
            'string'
            ? saveResult
            : saveResult?.xml


        if (
          !xml
        ) {

          throw new Error(
            'New ArchiMate model could not be serialized'
          )
        }


        const repositoryDocument =
          repositoryDocumentStore
            .addDocument({

              id:
                documentId,

              fileName:
                `Untitled-${createdDocumentSequence}.archimate`,

              kind:
                'archimate',

              xml,

              dirty:
                false
            })


        repositoryDocumentStore
          .setActiveDocument(
            repositoryDocument.id
          )


        repositoryBrowser.render()


        console.log(
          '[ArchiMate Document Created]',
          repositoryDocument
        )
      },


      onImport() {

        importFileInput.open()
      },


      onImportArchimate() {

        archimateImportFileInput.open()
      },


      onOpenBpmn() {

        viewerBpmnFileInput.open()
      },


      onOpenRepository() {

        repositoryFileInput.open()
      },


      onExportXml() {

        diagramActions.exportXML()
      },


      onExportSvg() {

        diagramActions.exportSVG()
      },


      onFit() {

        modeler
          .get(
            'canvas'
          )
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
    }
  })


const {
  layout,
  modeler,
  linter,
  repositoryDocumentStore,
  repositoryModel,
  businessObjectStore,
  businessObjectRepresentationStore,
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


let createdDocumentSequence =
  0


function createImportedDocumentId() {

  importedDocumentSequence +=
    1


  return (
    `imported-${importedDocumentSequence}`
  )
}


function createCreatedDocumentId() {

  createdDocumentSequence +=
    1


  return (
    `created-${createdDocumentSequence}`
  )
}


/*
 * ------------------------------------------------------------
 * Repository context actions
 * ------------------------------------------------------------
 */

repositoryContextActions =
  createRepositoryContextActions({

    modeler,

    linter,

    cocs:
      cocConfigurations,

    openDialog:
      openRepositoryContextDialog,

    getContext:
      getRepositoryContext,

    setContext:
      setRepositoryContext,

    defaultMaturity:
      engineeringCocConfiguration.defaultMaturity,

    onContextChanged(
      values
    ) {

      activateCocProfileRuntime({

        cocId:
          values?.cocOwner,

        cocConfigurations,

        resolveProfileRuntime:
          resolveEmbeddedProfileRuntime,

        activeProfileRuntime:
          modeler.get(
            'activeProfileRuntime'
          )
      })
        .then(
          result => {

            console.log(
              '[Active CoC Profile Runtime]',
              result
            )


            const businessViewRef =
              resolveStakeholderBusinessViewRef({

                selections:
                  stakeholderBusinessViewSelections,

                stakeholderRef:
                  values?.cocOwner
              })


            const businessView =
              resolveBusinessView({

                businessViews,

                businessViewRef
              })


            modeler
              .get(
                'activeBusinessView'
              )
              .set(
                businessView
              )


            console.log(
              '[Active Business View]',
              businessView
            )


            /*
             * The active runtime and Business View changed without changing
             * the selected BPMN element.
             *
             * Ask the Properties Panel to recompute provider
             * groups for its current selection. The SemArch
             * provider will then read the new runtime through
             * ActiveProfileRuntime.
             */
            modeler
              .get(
                'eventBus'
              )
              .fire(
                'propertiesPanel.providersChanged'
              )


            updateMethodStatus()
          }
        )
        .catch(
          error => {

            console.error(
              '[Active CoC Profile Runtime Failed]',
              error
            )


            updateMethodStatus()
          }
        )
    }
  })


/*
 * ------------------------------------------------------------
 * Method validation
 * ------------------------------------------------------------
 */

methodValidationActions =
  createMethodValidationActions({

    modeler,

    linter,

    readRepositoryContext:
      repositoryContextActions.read,

    setMethodConfiguration,

    defaultMaturity:
      engineeringCocConfiguration.defaultMaturity
  })


/*
 * ------------------------------------------------------------
 * Method status
 * ------------------------------------------------------------
 */

methodStatusActions =
  createMethodStatusActions({

    modeler,

    readRepositoryContext:
      repositoryContextActions.read,

    getMethodConfiguration,

    defaultMaturity:
      engineeringCocConfiguration.defaultMaturity
  })


/*
 * ------------------------------------------------------------
 * Diagram actions
 * ------------------------------------------------------------
 */

diagramActions =
  createDiagramActions({

    modeler,

    layout,

    linter,

    importBpmn,

    exportBpmnXml,

    exportBpmnSvg,

    publishBpmnXml,

    profileRuntime:
      modeler.get(
        'activeProfileRuntime',
        false
      ),

    download,

    extractPalette,

    readRepositoryContext:
      repositoryContextActions.read,

    applyLintContext:
      repositoryContextActions.applyLintContext,

    alert:
      w2alert
  })


/*
 * ------------------------------------------------------------
 * Open published BPMN in Viewer
 * ------------------------------------------------------------
 *
 * This is a direct document-opening path.
 *
 * It deliberately does not:
 *
 * - import the BPMN into the runtime repository environment
 * - register repository components
 * - project repository metadata
 * - resolve a publication profile
 * - publish or transform the BPMN again
 * ------------------------------------------------------------
 */

viewerBpmnFileInput.setOnLoad(
  async (
    xml,
    file
  ) => {

    try {

      await diagramActions.loadDiagram(
        xml
      )

    } catch (
      error
    ) {

      console.error(
        '[Open BPMN Failed]',
        error
      )

      return
    }


    console.log(
      '[BPMN Opened]',
      {
        fileName:
          file.name
      }
    )


    updateMethodStatus()
  }
)


/*
 * ------------------------------------------------------------
 * Import BPMN into Environment
 * ------------------------------------------------------------
 */

importFileInput.setOnLoad(
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


    await diagramActions.loadDiagram(
      xml
    )


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


    const components =
      registerBpmnDocument({

        modeler,

        repositoryModel,

        repositoryDocument
      })


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


/*
 * ------------------------------------------------------------
 * Import ArchiMate into Environment
 * ------------------------------------------------------------
 *
 * The native ArchiMate XML is preserved as the source document.
 *
 * Importing an ArchiMate document does not:
 *
 * - register BPMN components
 * - project BPMNSM repository metadata
 * - transform the source XML into BPMN
 * ------------------------------------------------------------
 */

archimateImportFileInput.setOnLoad(
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
            'archimate',

          xml,

          dirty:
            false
        })


    repositoryDocumentStore
      .setActiveDocument(
        repositoryDocument.id
      )


    await app.showArchimate({
      xml,
      documentId
    })


    repositoryBrowser.render()


    console.log(
      '[ArchiMate Document Imported]',
      repositoryDocument
    )
  }
)


/*
 * ------------------------------------------------------------
 * Open Repository
 * ------------------------------------------------------------
 *
 * A repository is serialized as BPMN.
 *
 * Opening a repository differs from importing a BPMN document:
 *
 * - the selected BPMN becomes the current canonical repository
 * - the previous runtime repository session is replaced
 * - BPMN components are projected without an implicit CoC
 * - CoCs and memberships are reconstructed from SemArch
 *   repository metadata serialized in Definitions extensions
 * ------------------------------------------------------------
 */

repositoryFileInput.setOnLoad(
  async (
    xml,
    file
  ) => {

    /*
     * Parse/load first.
     *
     * If the BPMN is invalid, the existing runtime repository
     * remains intact.
     */

    try {

      await diagramActions.loadDiagram(
        xml
      )

    } catch (
      error
    ) {

      console.error(
        '[Open Repository Failed]',
        error
      )

      return
    }


    /*
     * The XML is valid and loaded.
     *
     * The previous runtime repository may now be replaced.
     */

    repositoryDocumentStore.clear()

    repositoryModel.clear()

    businessObjectStore.clear()

    businessObjectRepresentationStore.clear()


    const repositoryDocument =
      repositoryDocumentStore
        .addDocument({

          id:
            'repository',

          fileName:
            file.name,

          kind:
            'bpmn',

          xml,

          dirty:
            false
        })


    repositoryDocumentStore
      .setActiveDocument(
        repositoryDocument.id
      )


    /*
     * First project native BPMN components.
     *
     * There is deliberately no containerId here.
     *
     * Repository membership must come from the serialized
     * semarch:Membership elements.
     */

    const components =
      registerBpmnDocument({

        modeler,

        repositoryModel,

        repositoryDocument
      })


    /*
     * Then project the repository metadata:
     *
     * RepositoryContext
     * CoC
     * Membership
     */

    const repositoryProjection =
      projectRepositoryMetadata({

        modeler,

        repositoryModel
      })


    projectBusinessObjects({

      modeler,

      businessObjectStore
    })


    projectBusinessObjectRepresentations({
      modeler,
      businessObjectStore,
      businessObjectRepresentationStore
    })


    repositoryBrowser.render()


    updateMethodStatus()


    console.log(
      '[Repository Opened]',
      {

        repositoryDocument,

        repositoryContext:
          repositoryProjection
            .repositoryContext,

        components:

          repositoryModel
            .getComponents(),

        containers:

          repositoryModel
            .getContainers(),

        references:

          repositoryModel
            .getReferences(),

        unresolvedMemberships:

          repositoryProjection
            .unresolvedMemberships
      }
    )


    console.log(
      '[Repository Components Registered]',
      components
    )
  }
)


/*
 * ------------------------------------------------------------
 * Method status badge
 * ------------------------------------------------------------
 */

bindMethodStatusBadge(
  result => {

    if (
      !result
    ) {

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

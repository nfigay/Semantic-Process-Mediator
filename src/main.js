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
  createRepositoryScopeStore
} from './repository/repository-scope-store.js'

import {
  createActiveRepository
} from './repository/active-repository.js'

import {
  switchActiveRepository
} from './repository/active-repository-switch.js'

import {
  createRepositoryScopeTransition
} from './repository/repository-scope-transition.js'

import {
  readRepositoryFolderResources
} from './repository/repository-folder-resources.js'

import {
  createRepositoryResourceDuplicationCommand
} from './repository/repository-resource-duplication-command.js'

import {
  readRepositoryWorkspaceArchive,
  readWorkspaceMetadata,
  WORKSPACE_METADATA_PATH
} from './repository/repository-workspace-archive.js'

import {
  materializeRepositoryResources
} from './repository/repository-resource-materializer.js'

import {
  activateRepositoryBusinessModel
} from './repository/repository-business-model-activation.js'

import {
  projectRepositoryBpmnDocuments
} from './repository/repository-bpmn-projection.js'

import {
  resolveRepositoryResourceKind
} from './repository/repository-resource-kind-resolver.js'

import {
  installBeforeUnloadProtection
} from './app/install-beforeunload-protection.js'

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
  importSparxEaBpmn
} from './platforms/sparx-ea/import-sparx-ea-bpmn.js'

import {
  openSparxEaImportDialog,
  setSparxEaBpmnSelection,
  setSparxEaPreprocessingReport,
  setSparxEaXmiSelection
} from './ui/dialogs/sparx-ea-import-dialog.js'

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

import {
  resolveWorkspaceFolderAccess,
  classifyWorkspaceFolderAccessError
} from './properties/workspace/workspace-folder-access.js'

import {
  resolveWorkspaceRepositoryFileHandle
} from './properties/workspace/workspace-repository-file-handle.js'

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

import {
  createWorkspaceActions
} from './workspace/workspace-actions.js'


installBeforeUnloadProtection()


const importFileInput =
  createFileInput({
    id:
      'bpmn-import-file-input'
  })


const sparxEaBpmnFileInput =
  createFileInput({
    id:
      'sparx-ea-bpmn-import-file-input',
    accept:
      '.bpmn,.xml'
  })


const sparxEaXmiFileInput =
  createFileInput({
    id:
      'sparx-ea-xmi-import-file-input',
    accept:
      '.xml,.xmi'
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


const workspaceArchiveFileInput =
  createFileInput({
    id:
      'workspace-archive-open-file-input',

    accept:
      '.zip',

    readAs:
      'array-buffer'
  })


let repositoryContextActions
let methodValidationActions
let methodStatusActions
let diagramActions

let pendingSparxEaBpmnImport =
  null
let workspaceActions


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


function resolveActiveRepository() {

  return activeRepository.get()
}


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



function resolveApplicationMode() {

  const configuredMode =
    document
      .querySelector(
        'meta[name="bpmnsm-app-mode"]'
      )
      ?.getAttribute(
        'content'
      )


  return configuredMode ===
    'viewer'
    ? 'viewer'
    : 'editor'
}


const repositoryScopeStore =
  createRepositoryScopeStore()


const runtimeRepository =
  repositoryScopeStore
    .createRepository(
      'runtime'
    )


const activeRepository =
  createActiveRepository(
    runtimeRepository
  )


const repositoryScopeTransition =
  createRepositoryScopeTransition({
    repositoryScopeStore,
    activeRepository
  })


function getEnvironmentSources() {

  return repositoryScopeStore
    .getRepositories()
    .filter(
      repository =>
        repository.workspace
          ?.mode !== 'memory'
    )
    .map(
      repository => ({
        id: repository.id,
        name:
          repository.workspace
            ?.name ||
          repository.id,
        mode:
          repository.workspace
            ?.mode ||
          null,
        resources:
          repository.workspace
            ?.resourceInventory ||
          []
      })
    )
}


app =
  createApp({

    repository:
      runtimeRepository,

    activeRepository,

    getSources:
      getEnvironmentSources,

    getRepositories:
      () =>
        repositoryScopeStore
          .getRepositories(),

    onSourceSelect:
      async repositoryId =>
        switchActiveRepository({
          repositoryId,
          repositoryScopeStore,
          activeRepository,
          diagramActions,
          showArchimate:
            options =>
              app.showArchimate(
                options
              ),
          renderRepositoryBrowser:
            () =>
              app.repositoryBrowser
                .render(),
          refreshBusinessModelExplorer:
            () =>
              app
                .businessModelExplorerView
                ?.refresh?.()
        }),

    onRepositorySelect:
      async repositoryId =>
        switchActiveRepository({
          repositoryId,
          repositoryScopeStore,
          activeRepository,
          diagramActions,
          showArchimate:
            options =>
              app.showArchimate(
                options
              ),
          renderRepositoryBrowser:
            () =>
              app.repositoryBrowser
                .render(),
          refreshBusinessModelExplorer:
            () =>
              app
                .businessModelExplorerView
                ?.refresh?.()
        }),

    mode:
      resolveApplicationMode(),

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


      onNewBpmnModel() {
        w2confirm(
          'Create a new BPMN model? Unsaved changes will be lost.'
        ).yes(
          async () => {
            await diagramActions.loadDiagram(EMPTY_DIAGRAM)
            updateMethodStatus()
          }
        )
      },

      async onOpenWorkspaceFolder() {

        const workspaceFolderAccess =
          resolveWorkspaceFolderAccess({
            configured:
              'auto',
            showDirectoryPicker:
              window.showDirectoryPicker
          })


        if (!workspaceFolderAccess.effective) {

          w2alert(
            'Direct folder access is unavailable in this browser or policy context. Use Open Workspace Archive instead; after editing, Save Workspace Archive downloads the Repository as a portable ZIP.'
          )

          return
        }


        try {

          const directoryHandle =
            await window.showDirectoryPicker({
              mode:
                'readwrite'
            })


          const {
            resources,
            fileHandles
          } =
            await readRepositoryFolderResources(
              directoryHandle
            )


          const workspaceMetadata =
            readWorkspaceMetadata(resources)


          const workspaceResources =
            resources.filter(
              resource =>
                resource.path !== WORKSPACE_METADATA_PATH
            )


          const paths =
            workspaceResources.map(
              resource =>
                resource.path
            )


          const resourceInventory =
            workspaceResources.map(
              resource => ({
                path:
                  resource.path,
                kind:
                  resolveRepositoryResourceKind(
                    resource.path
                  ),
                size:
                  Number.isFinite(resource.size)
                    ? resource.size
                    : new Blob([resource.content ?? '']).size
              })
            )


          let preparedRepositoryDocuments =
            []

          let preparedBusinessModelState =
            null


          const repository =
            await repositoryScopeTransition
              .prepareAndActivate({
                repositoryId:
                  createRuntimeRepositoryId(),

                async prepare(
                  candidateRepository
                ) {

                  preparedRepositoryDocuments =
                    materializeRepositoryResources({
                      resources:
                        workspaceResources,
                      repositoryDocumentStore:
                        candidateRepository.documents,
                      createDocumentId:
                        createImportedDocumentId
                    })


                  preparedBusinessModelState =
                    activateRepositoryBusinessModel({
                      repositoryDocuments:
                        preparedRepositoryDocuments,
                      businessObjectStore:
                        candidateRepository.businessObjectStore,
                      businessRelationStore:
                        candidateRepository.businessRelationStore,
                      identityOriginStore:
                        candidateRepository.identityOriginStore,
                      businessObjectExternalIdentityStore:
                        candidateRepository.businessObjectExternalIdentityStore
                    })


                  candidateRepository.workspace.mode =
                    'folder'

                  candidateRepository.workspace.directoryHandle =
                    directoryHandle

                  candidateRepository.workspace.name =
                    directoryHandle.name

                  applyWorkspaceMetadata(
                    candidateRepository.workspace,
                    workspaceMetadata
                  )

                  candidateRepository.workspace.resourceInventory =
                    resourceInventory

                  candidateRepository.workspace.loadedBusinessModelState =
                    preparedBusinessModelState


                  for (
                    const repositoryDocument
                    of preparedRepositoryDocuments
                  ) {

                    const fileHandle =
                      fileHandles.get(
                        repositoryDocument.fileName
                      )

                    if (fileHandle) {

                      candidateRepository.workspace.fileHandles.set(
                        repositoryDocument.id,
                        fileHandle
                      )
                    }
                  }
                }
              })


          refreshWorkspaceIdentityUi()

          if (!workspaceMetadata) {
            renameActiveWorkspace()
          }


          if (
            repository.workspace
              .loadedBusinessModelState
          ) {

            app
              .businessModelExplorerView
              ?.refresh?.()


            app
              .contextsBrowser
              ?.render?.()
          }


          const {
            projectedBpmnDocuments,
            projectedBpmnComponents
          } =
            await projectRepositoryBpmnDocuments({
              repositoryDocuments:
                preparedRepositoryDocuments,
              repositoryDocumentStore:
                repository.documents,
              diagramActions,
              modeler,
              repositoryModel:
                repository.model,
              businessObjectStore:
                repository.businessObjectStore,
              businessObjectRepresentationStore:
                repository.businessObjectRepresentationStore
            })


          repositoryBrowser.render()


          console.log(
            '[Local Workspace Inventory Succeeded]',
            {
              repositoryId:
                repository.id,
              directoryName:
                directoryHandle.name,
              fileCount:
                paths.length,
              paths,
              resources:
                resourceInventory,
              loadedBusinessModelState:
                repository.workspace
                  .loadedBusinessModelState,
              loadedBusinessObjects:
                repository.businessObjectStore
                  .getBusinessObjects(),
              loadedBusinessRelations:
                repository.businessRelationStore
                  .getBusinessRelations(),
              repositoryDocuments:
                preparedRepositoryDocuments,
              projectedBpmnDocuments,
              projectedBpmnComponents
            }
          )


          w2alert(
            `Local Workspace inventory succeeded in "${directoryHandle.name}": ` +
            `${paths.length} file(s). See the browser console for relative paths.`
          )

        } catch (
          error
        ) {

          console.error(
            '[Local Workspace Inventory Failed]',
            error
          )


          const accessReason =
            classifyWorkspaceFolderAccessError(
              error
            )


          w2alert(
            accessReason === 'runtime-denied'
              ? 'Direct folder access was denied by the browser or environment policy. The current Repository was not replaced. Use Open Workspace Archive instead.'
              : accessReason === 'user-cancelled'
                ? 'Open Workspace Folder was cancelled. The current Repository was not replaced.'
                : `Local Workspace inventory failed: ${error?.message || error}`
          )
        }
      },

      onOpenWorkspaceArchive() {
        return workspaceActions?.openArchive()
      },

      onSaveWorkspaceFolder() {
        return workspaceActions?.saveFolder()
      },

      async onSaveLocalWorkspace() {

        const repository =
          resolveActiveRepository()


        const workspace =
          repository.workspace


        const repositoryDocumentStore =
          repository.documents


        const dirtyDocuments =
          repositoryDocumentStore
            .getDocuments()
            .filter(
              document =>
                document.dirty ===
                true
            )


        const saved =
          []

        const failed =
          []


        for (
          const repositoryDocument
          of dirtyDocuments
        ) {

          let fileHandle =
            workspace.fileHandles.get(
              repositoryDocument.id
            )


          try {

            if (
              !fileHandle &&
              workspace.mode === 'folder' &&
              workspace.directoryHandle
            ) {

              fileHandle =
                await resolveWorkspaceRepositoryFileHandle({
                  directoryHandle:
                    workspace.directoryHandle,
                  repositoryPath:
                    repositoryDocument.fileName,
                  create:
                    true
                })

              workspace.fileHandles.set(
                repositoryDocument.id,
                fileHandle
              )
            }


            if (!fileHandle) {
              throw new Error(
                'not backed by the active Local Workspace'
              )
            }


            const writable =
              await fileHandle.createWritable()

            await writable.write(
              repositoryDocument.content
            )

            await writable.close()


            const physicalFile =
              await fileHandle.getFile()

            const physicalContent =
              await physicalFile.text()


            if (
              physicalContent !==
              repositoryDocument.content
            ) {

              throw new Error(
                'Physical workspace content does not match RepositoryDocument content after save'
              )
            }


            repositoryDocumentStore
              .updateDocument(
                repositoryDocument.id,
                {
                  dirty:
                    false
                }
              )


            saved.push({
              documentId:
                repositoryDocument.id,
              fileName:
                repositoryDocument.fileName,
              kind:
                repositoryDocument.kind,
              dirty:
                repositoryDocument.dirty,
              contentMatchesPhysicalFile:
                true
            })

          } catch (
            error
          ) {

            failed.push({
              documentId:
                repositoryDocument.id,
              fileName:
                repositoryDocument.fileName,
              reason:
                error?.message ||
                String(error)
            })
          }
        }


        try {

          const workspaceMetadata =
            ensureWorkspaceMetadata(
              workspace
            )

          const metadataFileHandle =
            await resolveWorkspaceRepositoryFileHandle({
              directoryHandle:
                workspace.directoryHandle,
              repositoryPath:
                WORKSPACE_METADATA_PATH,
              create:
                true
            })

          const metadataWritable =
            await metadataFileHandle.createWritable()

          await metadataWritable.write(
            JSON.stringify(
              workspaceMetadata,
              null,
              2
            ) + '\n'
          )

          await metadataWritable.close()

        } catch (
          error
        ) {

          failed.push({
            documentId:
              null,
            fileName:
              WORKSPACE_METADATA_PATH,
            reason:
              error?.message ||
              String(error)
          })
        }


        const result = {
          dirtyDocumentCount:
            dirtyDocuments.length,
          saved,
          failed
        }


        if (
          failed.length ===
          0
        ) {

          console.log(
            '[Local Workspace Save Succeeded]',
            result
          )

          w2alert(
            `Saved ${saved.length} repository document(s) to the Local Workspace.`
          )

          return
        }


        console.error(
          '[Local Workspace Save Partially Failed]',
          result
        )

        w2alert(
          `Local Workspace save completed with ${failed.length} failure(s) and ${saved.length} successful save(s).`
        )
      },

      onSaveWorkspaceArchive() {

        const repository =
          resolveActiveRepository()


        const repositoryDocuments =
          repository.documents
            .getDocuments()


        const workspaceName =
          repository.workspace?.name?.trim?.() ||
          'bpmnsm-workspace'

        repository.workspace.name =
          workspaceName


        const workspaceMetadata =
          ensureWorkspaceMetadata(
            repository.workspace
          )


        const archive =
          createRepositoryWorkspaceArchive(
            repositoryDocuments,
            {
              includeClean:
                true,
              workspaceMetadata
            }
          )


        const archiveFileName =
          createWorkspaceArchiveFileName(
            workspaceName,
            workspaceMetadata.snapshotIteration
          )


        refreshWorkspaceIdentityUi()


        download(
          archive,
          archiveFileName,
          'application/zip'
        )


        w2alert(
          `Workspace "${workspaceName}" snapshot iteration ${workspaceMetadata.snapshotIteration} prepared at ${workspaceMetadata.savedAt}. ` +
          `Download requested as "${archiveFileName}". The browser controls the final download location and filename ` +
          'and may append (1), (2), etc. to avoid overwriting an existing file. That browser suffix is not a BPMNSM snapshot iteration; verify the manifest when several copies exist.'
        )
      },

      onRenameWorkspace() {
        return workspaceActions?.rename()
      },

      onWorkspaceManifest() {
        return workspaceActions?.manifest()
      },

      onImport() {

        w2confirm(
          'Import adds this BPMN document to the active Repository. Existing repository documents are preserved. The imported source will be included when you save the active Workspace.'
        ).yes(() => importFileInput.open())
      },


      onImportSparxEa() {

        pendingSparxEaBpmnImport =
          null


        openSparxEaImportDialog({

          onSelectBpmn() {

            sparxEaBpmnFileInput.open()
          },

          onSelectXmi() {

            sparxEaXmiFileInput.open()
          },

          async onApplyNativeNotePolicy(nativeNotePolicy) {

            await completeSparxEaImportWithPolicy(nativeNotePolicy)
          }
        })
      },


      onImportArchimate() {

        w2confirm(
          'Import adds this ArchiMate document to the active Repository. Existing repository documents are preserved. The imported source will be included when you save the active Workspace.'
        ).yes(() => archimateImportFileInput.open())
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
          repositoryDocument.content
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


workspaceActions =
  createWorkspaceActions({
    repositoryDocumentStore,
    repositoryBrowser,
    createDocumentId: createImportedDocumentId,
    loadBpmn: xml => diagramActions.loadDiagram(xml),
    showArchimate: options => app.showArchimate(options)
  })


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


const duplicateActiveRepositoryResource =
  createRepositoryResourceDuplicationCommand({
    repositoryScopeStore,
    activeRepository,
    createDocumentId:
      createImportedDocumentId,
    diagramActions,
    modeler,
    renderRepositoryBrowser:
      () =>
        app.repositoryBrowser
          .render()
  })


app.duplicateActiveRepositoryResource =
  duplicateActiveRepositoryResource



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

workspaceArchiveFileInput.setOnLoad(
  async (
    arrayBuffer,
    file
  ) => {

    try {

      const resources =
        readRepositoryWorkspaceArchive(
          new Uint8Array(
            arrayBuffer
          )
        )


      const workspaceMetadata =
        readWorkspaceMetadata(resources)


      const workspaceResources =
        resources.filter(
          resource =>
            resource.path !== WORKSPACE_METADATA_PATH
        )


      let preparedRepositoryDocuments =
        []


      const repository =
        await repositoryScopeTransition
          .prepareAndActivate({
            repositoryId:
              createRuntimeRepositoryId(),

            async prepare(
              candidateRepository
            ) {

              preparedRepositoryDocuments =
                materializeRepositoryResources({
                  resources:
                    workspaceResources,
                  repositoryDocumentStore:
                    candidateRepository.documents,
                  createDocumentId:
                    createImportedDocumentId
                })


              const preparedBusinessModelState =
                activateRepositoryBusinessModel({
                  repositoryDocuments:
                    preparedRepositoryDocuments,
                  businessObjectStore:
                    candidateRepository.businessObjectStore,
                  businessRelationStore:
                    candidateRepository.businessRelationStore,
                  identityOriginStore:
                    candidateRepository.identityOriginStore,
                  businessObjectExternalIdentityStore:
                    candidateRepository.businessObjectExternalIdentityStore
                })


              candidateRepository.workspace.mode =
                'archive'

              candidateRepository.workspace.directoryHandle =
                null

              candidateRepository.workspace.name =
                file.name


              if (workspaceMetadata) {
                candidateRepository.workspace.workspaceId =
                  workspaceMetadata.workspaceId

                candidateRepository.workspace.createdAt =
                  workspaceMetadata.createdAt

                candidateRepository.workspace.savedAt =
                  workspaceMetadata.savedAt

                candidateRepository.workspace.snapshotIteration =
                  workspaceMetadata.snapshotIteration || 1

                if (
                  typeof workspaceMetadata.name === 'string' &&
                  workspaceMetadata.name.trim()
                ) {
                  candidateRepository.workspace.name =
                    workspaceMetadata.name.trim()
                }
              }


              candidateRepository.workspace.resourceInventory =
                workspaceResources.map(resource => ({
                  path:
                    resource.path,

                  kind:
                    resolveRepositoryResourceKind(
                      resource.path
                    ),

                  size:
                    Number.isFinite(resource.size)
                      ? resource.size
                      : new Blob([
                          resource.content ?? ''
                        ]).size
                }))


              candidateRepository.workspace.loadedBusinessModelState =
                preparedBusinessModelState
            }
          })


      if (
        repository.workspace
          .loadedBusinessModelState
      ) {

        app
          .businessModelExplorerView
          ?.refresh?.()


        app
          .contextsBrowser
          ?.render?.()
      }


      const {
        projectedBpmnDocuments,
        projectedBpmnComponents
      } =
        await projectRepositoryBpmnDocuments({
          repositoryDocuments:
            preparedRepositoryDocuments,

          repositoryDocumentStore:
            repository.documents,

          diagramActions,

          modeler,

          repositoryModel:
            repository.model,

          businessObjectStore:
            repository.businessObjectStore,

          businessObjectRepresentationStore:
            repository.businessObjectRepresentationStore
        })


      repositoryBrowser.render()


      console.log(
        '[Workspace Archive Opened]',
        {
          repositoryId:
            repository.id,

          fileName:
            file.name,

          resourceCount:
            resources.length,

          repositoryDocumentCount:
            preparedRepositoryDocuments.length,

          projectedBpmnDocuments,

          projectedBpmnComponents
        }
      )

    } catch (
      error
    ) {

      console.error(
        '[Workspace Archive Open Failed]',
        error
      )


      w2alert(
        `Workspace Archive open failed: ${error?.message || error}`
      )
    }
  }
)


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

    const repository =
      resolveActiveRepository()


    const workspace =
      repository.workspace


    const documentId =
      createImportedDocumentId()


    const repositoryDocument =
      repository.documents
        .addDocument({

          id:
            documentId,

          fileName:
            file.name,

          kind:
            'bpmn',

          content:
            xml,

          dirty:
            workspace.mode !== 'memory'
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

        repositoryModel:
          repository.model,

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
 * Import Sparx EA BPMN into Environment
 * ------------------------------------------------------------
 *
 * The native EA BPMN export and supporting XMI are treated as
 * source evidence. Only normalized BPMN enters the Repository.
 * ------------------------------------------------------------
 */

sparxEaBpmnFileInput.setOnLoad(
  async (
    bpmnXml,
    file
  ) => {

    pendingSparxEaBpmnImport = {
      bpmnXml,
      file
    }


    setSparxEaBpmnSelection(
      file
    )
  }
)


async function completeSparxEaImportWithPolicy(nativeNotePolicy = {}) {

  const pending =
    pendingSparxEaBpmnImport


  if (
    !pending?.bpmnXml ||
    !pending?.xmiXml
  ) {

    throw new Error(
      'Sparx EA BPMN import requires both BPMN and supporting XMI sources'
    )
  }


  const repository =
    resolveActiveRepository()


  const result =
    await importSparxEaBpmn({

      bpmnXml:
        pending.bpmnXml,

      xmiXml:
        pending.xmiXml,

      fileName:
        pending.file.name,

      repository,

      diagramActions,

      modeler,

      repositoryBrowser,

      documentId:
        pending.documentId,

      nativeNotePolicy
    })


  const prepared =
    result.prepared


  setSparxEaPreprocessingReport(
    prepared
  )


  if (
    result.requiresPublicationPolicy
  ) {

    console.log(
      '[Sparx EA BPMN Publication Policy Required]',
      {
        repairs: prepared.repairs,
        unresolvedIssues: prepared.unresolvedIssues,
        warnings: prepared.warnings,
        publicationPolicyRequired: prepared.publicationPolicyRequired,
        provenance: prepared.provenance
      }
    )

    return
  }


  pendingSparxEaBpmnImport =
    null


  console.log(
    '[Sparx EA BPMN Imported]',
    {
      repositoryDocument:
        result.repositoryDocument,

      components:
        result.components,

      repairs:
        prepared.repairs,

      unresolvedIssues:
        prepared.unresolvedIssues,

      warnings:
        prepared.warnings,

      publicationPolicyRequired:
        prepared.publicationPolicyRequired,

      publicationPolicyApplied:
        prepared.publicationPolicyApplied,

      provenance:
        prepared.provenance
    }
  )
}


sparxEaXmiFileInput.setOnLoad(
  async (
    xmiXml,
    file
  ) => {

    const pending =
      pendingSparxEaBpmnImport


    if (
      !pending
    ) {

      throw new Error(
        'Sparx EA BPMN import requires a BPMN source before supporting XMI'
      )
    }


    setSparxEaXmiSelection(
      file
    )


    pending.xmiXml =
      xmiXml

    pending.documentId =
      createImportedDocumentId()


    await completeSparxEaImportWithPolicy()
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

    const repository =
      resolveActiveRepository()


    const workspace =
      repository.workspace


    const documentId =
      createImportedDocumentId()


    const repositoryDocument =
      repository.documents
        .addDocument({

          id:
            documentId,

          fileName:
            file.name,

          kind:
            'archimate',

          content:
            xml,

          dirty:
            workspace.mode !== 'memory'
        })


    repository.documents
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
     * If the BPMN is invalid, the current active Repository
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
     * Create and activate a new autonomous Repository.
     * The previously active Repository remains registered
     * in the workspace scope and can be selected again.
     */

    const repository =
      await repositoryScopeTransition
        .prepareAndActivate({
          repositoryId:
            createRuntimeRepositoryId(),

          prepare() {}
        })


    const repositoryDocument =
      repository.documents
        .addDocument({

          id:
            'repository',

          fileName:
            file.name,

          kind:
            'bpmn',

          content:
            xml,

          dirty:
            false
        })


    repository.documents
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

        repositoryModel:
          repository.model,

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

        repositoryModel:
          repository.model
      })


    projectBusinessObjects({

      modeler,

      businessObjectStore:
        repository.businessObjectStore
    })


    projectBusinessObjectRepresentations({
      modeler,
      businessObjectStore:
        repository.businessObjectStore,
      businessObjectRepresentationStore:
        repository.businessObjectRepresentationStore,
      repositoryDocument
    })


    projectBusinessRelations({
      modeler,
      businessObjectStore:
        repository.businessObjectStore,
      businessRelationStore:
        repository.businessRelationStore
    })


    repositoryBrowser.render()


    updateMethodStatus()


    console.log(
      '[Repository Opened]',
      {
        repositoryId:
          repository.id,

        repositoryDocument,

        repositoryContext:
          repositoryProjection
            .repositoryContext,

        components:
          repository.model
            .getComponents(),

        containers:
          repository.model
            .getContainers(),

        references:
          repository.model
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

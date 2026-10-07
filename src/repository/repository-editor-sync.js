/*
 * ------------------------------------------------------------
 * SemArch Repository Editor Synchronization
 * ------------------------------------------------------------
 *
 * Keeps the runtime repository projection and the stored BPMN
 * XML synchronized with the BPMN model currently edited in
 * bpmn-js.
 *
 * Responsibilities:
 *
 * - rebuild the runtime RepositoryModel projection
 * - refresh the repository browser
 * - persist the current BPMN XML in RepositoryDocument
 * - mark the edited document as dirty
 *
 * Imported BPMN identity is never generated here.
 * ------------------------------------------------------------
 */

import {
  synchronizeBpmnDocument
} from './synchronize-bpmn-document.js'


export function createRepositoryEditorSync({
  modeler,
  repositoryDocumentStore,
  repositoryModel,
  activeRepository,
  repositoryBrowser,
  containerId
} = {}) {

  if (
    !modeler ||
    !repositoryBrowser ||
    (
      !activeRepository &&
      (
        !repositoryDocumentStore ||
        !repositoryModel
      )
    )
  ) {

    throw new Error(
      'createRepositoryEditorSync requires modeler, repositoryBrowser and either activeRepository or repositoryDocumentStore + repositoryModel'
    )
  }


  const eventBus =
    modeler.get(
      'eventBus'
    )


  function resolveRepositoryState() {

    const repository =
      activeRepository
        ?.get?.() ||
      null


    return {
      repository,

      repositoryDocumentStore:
        repository?.documents ||
        repositoryDocumentStore,

      repositoryModel:
        repository?.model ||
        repositoryModel
    }
  }


  /*
   * ------------------------------------------------------------
   * Runtime repository projection
   * ------------------------------------------------------------
   */

  function synchronize() {

    const {
      repositoryDocumentStore:
        activeRepositoryDocumentStore,
      repositoryModel:
        activeRepositoryModel
    } =
      resolveRepositoryState()


    if (
      !activeRepositoryDocumentStore ||
      !activeRepositoryModel
    ) {

      return
    }


    const repositoryDocument =
      activeRepositoryDocumentStore
        .getActiveDocument()


    if (
      !repositoryDocument
    ) {

      return
    }


    synchronizeBpmnDocument({

      modeler,

      repositoryModel:
        activeRepositoryModel,

      repositoryDocument,

      containerId
    })


    repositoryBrowser.render()
  }


  /*
   * ------------------------------------------------------------
   * BPMN XML persistence
   * ------------------------------------------------------------
   */

  async function persist() {

    const {
      repository:
        repositoryAtSaveStart,
      repositoryDocumentStore:
        activeRepositoryDocumentStore
    } =
      resolveRepositoryState()


    if (
      !activeRepositoryDocumentStore
    ) {

      return null
    }


    const repositoryDocument =
      activeRepositoryDocumentStore
        .getActiveDocument()


    if (
      !repositoryDocument
    ) {

      return null
    }


    try {

      const result =
        await modeler.saveXML({
          format: true
        })


      /*
       * The active document may theoretically change while
       * saveXML is running.
       *
       * Persist the result only if the same repository document
       * is still active.
       */

      if (
        activeRepository &&
        activeRepository.get() !==
          repositoryAtSaveStart
      ) {

        return null
      }


      const activeRepositoryDocument =
        activeRepositoryDocumentStore
          .getActiveDocument()


      if (
        !activeRepositoryDocument ||
        activeRepositoryDocument.id !==
          repositoryDocument.id
      ) {

        return null
      }


      return activeRepositoryDocumentStore
        .updateDocument(
          repositoryDocument.id,
          {
            content:
              result.xml,

            dirty:
              true
          }
        )

    } catch (err) {

      console.error(
        'Unable to persist edited BPMN document:',
        err
      )


      return null
    }
  }


  /*
   * ------------------------------------------------------------
   * bpmn-js command stack
   * ------------------------------------------------------------
   */

  function onCommandStackChanged() {

    synchronize()


    /*
     * XML serialization is asynchronous.
     *
     * The command-stack event itself must not wait for it.
     */

    void persist()
  }


  eventBus.on(
    'commandStack.changed',
    onCommandStackChanged
  )


  /*
   * ------------------------------------------------------------
   * Lifecycle
   * ------------------------------------------------------------
   */

  function destroy() {

    eventBus.off(
      'commandStack.changed',
      onCommandStackChanged
    )
  }


  return {
    synchronize,
    persist,
    destroy
  }
}
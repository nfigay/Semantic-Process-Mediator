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
  repositoryBrowser,
  containerId
} = {}) {

  if (
    !modeler ||
    !repositoryDocumentStore ||
    !repositoryModel ||
    !repositoryBrowser
  ) {

    throw new Error(
      'createRepositoryEditorSync requires modeler, repositoryDocumentStore, repositoryModel and repositoryBrowser'
    )
  }


  const eventBus =
    modeler.get(
      'eventBus'
    )


  /*
   * ------------------------------------------------------------
   * Runtime repository projection
   * ------------------------------------------------------------
   */

  function synchronize() {

    const repositoryDocument =
      repositoryDocumentStore
        .getActiveDocument()


    if (
      !repositoryDocument
    ) {

      return
    }


    synchronizeBpmnDocument({

      modeler,

      repositoryModel,

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

    const repositoryDocument =
      repositoryDocumentStore
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

      const activeRepositoryDocument =
        repositoryDocumentStore
          .getActiveDocument()


      if (
        !activeRepositoryDocument ||
        activeRepositoryDocument.id !==
          repositoryDocument.id
      ) {

        return null
      }


      return repositoryDocumentStore
        .updateDocument(
          repositoryDocument.id,
          {
            xml:
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
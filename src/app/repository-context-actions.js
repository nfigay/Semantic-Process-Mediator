export function createRepositoryContextActions({
  modeler,
  linter,
  cocRegistry,
  openDialog,
  getContext,
  setContext,

  onContextChanged
}) {

  function read() {

    try {
      return getContext(
        modeler
      )
    } catch {
      return {}
    }
  }


  function applyLintContext(
    context = {}
  ) {

    linter.setCoc(
      context.cocOwner ||
      null
    )

    linter.setProfile(
      context.maturity ||
      'L1'
    )
  }


  function save(values) {

    try {

      /*
       * Persist the new repository context
       * into the BPMN definitions.
       */
      setContext(
        modeler,
        values
      )


      /*
       * Apply the new context to
       * the active lint configuration.
       */
      applyLintContext(
        values
      )


      /*
       * Re-run linting with the
       * new CoC / maturity.
       */
      linter.run()


      /*
       * Notify the application that
       * the methodological context changed.
       *
       * MethodConfiguration is NOT modified here.
       */
      onContextChanged?.(
        values
      )

    } catch (err) {

      console.error(
        'saveRepositoryContext error:',
        err
      )
    }
  }


  function open() {

    openDialog({

      context:
        read(),

      cocs:
        cocRegistry.cocs,

      onSave(values) {
        save(
          values
        )
      }
    })
  }


  return {
    read,
    save,
    open,
    applyLintContext
  }
}
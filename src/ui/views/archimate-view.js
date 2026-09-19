export function createArchimateView({
  id = 'archimate',
  createAdapter,
  xml = null,
  onModelChanged = null
} = {}) {

  if (
    !id
  ) {

    throw new Error(
      'ArchiMateView requires an id'
    )
  }


  if (
    typeof createAdapter !==
    'function'
  ) {

    throw new Error(
      'ArchiMateView requires createAdapter'
    )
  }


  let adapter =
    null


  let unsubscribeModelChanged =
    null


  const html =
    `
      <div
        data-archimate-view
        style="
          position:absolute;
          inset:0;

          overflow:hidden;

          background:#FFFFFF;
        "
      >
        <div
          data-archimate-canvas
          style="
            position:absolute;
            inset:0;

            overflow:hidden;

            background:#FFFFFF;
          "
        ></div>
      </div>
    `


  async function onActivate({
    container
  } = {}) {

    if (
      !container
    ) {

      return
    }


    const canvasContainer =
      container.querySelector(
        '[data-archimate-canvas]'
      )


    if (
      !canvasContainer
    ) {

      throw new Error(
        'ArchiMateView canvas container not found'
      )
    }


    adapter =
      createAdapter({
        container:
          canvasContainer
      })


    if (
      xml !==
        null &&
      xml !==
        undefined
    ) {

      await adapter.importXML(
        xml
      )

    } else {

      await adapter.createNewModel()
    }


    if (
      typeof onModelChanged ===
        'function' &&
      typeof adapter.onModelChanged ===
        'function'
    ) {

      unsubscribeModelChanged =
        adapter.onModelChanged(
          () => {
            onModelChanged({
              adapter
            })
          }
        )
    }
  }


  function onDeactivate() {

    if (
      unsubscribeModelChanged
    ) {

      unsubscribeModelChanged()

      unsubscribeModelChanged =
        null
    }


    if (
      adapter
    ) {

      adapter.destroy()

      adapter =
        null
    }
  }


  function getAdapter() {

    return adapter
  }


  return {

    id,

    title:
      'ArchiMate',

    html,

    onActivate,

    onDeactivate,

    getAdapter
  }
}

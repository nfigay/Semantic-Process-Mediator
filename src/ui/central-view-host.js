export function createCentralViewHost({
  container
} = {}) {

  if (
    !container
  ) {

    throw new Error(
      'CentralViewHost requires a container'
    )
  }


  let activeView =
    null


  async function show(
    view
  ) {

    if (
      !view ||
      !view.id
    ) {

      throw new Error(
        'CentralViewHost requires a view with an id'
      )
    }


    if (
      activeView
        ?.onDeactivate
    ) {

      await activeView.onDeactivate({
        container
      })
    }


    container.innerHTML =
      view.html || ''


    activeView =
      view


    if (
      activeView.onActivate
    ) {

      await activeView.onActivate({
        container
      })
    }


    return activeView
  }


  async function clear() {

    if (
      activeView
        ?.onDeactivate
    ) {

      await activeView.onDeactivate({
        container
      })
    }


    container.innerHTML =
      ''


    activeView =
      null
  }


  function getActiveView() {

    return activeView
  }


  function isActive(
    viewId
  ) {

    return (
      activeView
        ?.id ===
      viewId
    )
  }


  return {

    show,

    clear,

    getActiveView,

    isActive
  }
}
export function installBeforeUnloadProtection(
  target = window
) {

  function handleBeforeUnload(
    event
  ) {

    event.preventDefault()

    /*
     * Modern browsers control the confirmation
     * message displayed to the user.
     */
    event.returnValue = ''
  }


  target.addEventListener(
    'beforeunload',
    handleBeforeUnload
  )


  return {

    destroy() {

      target.removeEventListener(
        'beforeunload',
        handleBeforeUnload
      )
    }
  }
}

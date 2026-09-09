export function extractPalette() {

  /*
   * Palette generated natively by bpmn-js.
   */
  const palette =
    document.querySelector(
      '#bpmn-canvas .djs-palette'
    )


  /*
   * In Viewer mode there is no bpmn-js palette.
   *
   * This is normal and must not trigger an
   * endless requestAnimationFrame loop.
   */
  if (
    !palette
  ) {

    return false
  }


  /*
   * Dedicated palette panel created by
   * the nested BPMN w2layout.
   */
  const container =
    document.getElementById(
      'bpmn-palette'
    )


  if (
    !container
  ) {

    return false
  }


  container.innerHTML =
    ''


  container.appendChild(
    palette
  )


  Object.assign(
    palette.style,
    {

      position:
        'relative',

      left:
        '0',

      top:
        '0',

      width:
        '100%',

      height:
        '100%',

      border:
        'none',

      borderRadius:
        '0',

      boxShadow:
        'none',

      background:
        'transparent'

    }
  )


  return true
}
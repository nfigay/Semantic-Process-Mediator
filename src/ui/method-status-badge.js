let currentStatusResult = null
let clickHandler = null


const STATUS_PRESENTATION = {

  NOT_VALIDATED: {
    label:
      'NOT VALIDATED',

    background:
      '#666666',

    color:
      '#ffffff',

    title:
      'Model has not been methodologically validated'
  },


  CURRENT: {
    label:
      'CURRENT',

    background:
      '#2e7d32',

    color:
      '#ffffff',

    title:
      'Model is validated with the current methodological configuration'
  },


  OUTDATED: {
    label:
      'OUTDATED',

    background:
      '#c77800',

    color:
      '#ffffff',

    title:
      'Model was validated with a different methodological configuration'
  }

}


export function renderMethodStatus(
  result
) {

  const element =
    document.getElementById(
      'method-status-badge'
    )


  if (!element) {
    return
  }


  currentStatusResult =
    result || null


  const status =
    result?.status ||
    'NOT_VALIDATED'


  const presentation =
    STATUS_PRESENTATION[
      status
    ] ||
    STATUS_PRESENTATION
      .NOT_VALIDATED


  element.textContent =
    presentation.label


  element.dataset.status =
    status


  element.style.background =
    presentation.background


  element.style.color =
    presentation.color


  element.style.cursor =
    'pointer'


  element.title =
    `${presentation.title}. Click for details.`
}


export function bindMethodStatusBadge(
  onClick
) {

  clickHandler =
    onClick


  document.addEventListener(
    'click',
    event => {

      const badge =
        event.target.closest?.(
          '#method-status-badge'
        )


      if (!badge) {
        return
      }


      clickHandler?.(
        currentStatusResult
      )
    }
  )
}
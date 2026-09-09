import { w2popup } from 'w2ui/w2ui-2.0.es6.js'


export function openRepositoryViewDialog({
  views = [],
  title = 'Choose BPMN View',
  onSelect
} = {}) {

  const availableViews =
    Array.isArray(
      views
    )
      ? views.filter(
          view =>
            view?.diagramId
        )
      : []


  if (
    availableViews.length ===
    0
  ) {

    return null
  }


  /*
   * One exact view does not require a dialog.
   */

  if (
    availableViews.length ===
    1
  ) {

    onSelect?.(
      availableViews[0]
    )

    return availableViews[0]
  }


  const buttons =
    availableViews
      .map(
        (view, index) => {

          const label =
            getViewLabel(
              view
            )

          const representation =
            view.representation ||
            null


          return `
            <button
              type="button"
              class="w2ui-btn"
              data-semarch-view-index="${index}"
              style="
                display:block;
                width:100%;
                box-sizing:border-box;
                margin:0 0 8px 0;
                padding:10px 12px;
                text-align:left;
              "
            >
              <div
                style="
                  font-weight:600;
                "
              >
                ${escapeHtml(
                  label
                )}
              </div>

              ${
                representation
                  ? `
                    <div
                      style="
                        margin-top:4px;
                        font-size:11px;
                        opacity:.7;
                      "
                    >
                      ${escapeHtml(
                        representation
                      )}
                    </div>
                  `
                  : ''
              }
            </button>
          `
        }
      )
      .join('')


  w2popup.open({

    title,

    width:
      520,

    height:
      Math.min(
        180 +
          availableViews.length *
            60,
        520
      ),

    body: `
      <div
        style="
          padding:16px;
          font-family:'DM Sans',sans-serif;
          font-size:13px;
          height:100%;
          box-sizing:border-box;
          overflow:auto;
        "
      >

        <div
          style="
            margin-bottom:12px;
            color:#4A6580;
          "
        >
          Several BPMN views are available for this repository context.
          Choose the view to open.
        </div>

        ${buttons}

      </div>
    `,

    buttons: `
      <button
        class="w2ui-btn"
        id="btn-cancel-repository-view"
      >
        Cancel
      </button>
    `,

    onOpen(event) {

      event.done(() => {

        /*
         * ------------------------------------------------------------
         * Cancel
         * ------------------------------------------------------------
         */

        document
          .getElementById(
            'btn-cancel-repository-view'
          )
          ?.addEventListener(
            'click',
            () => {

              w2popup.close()
            }
          )


        /*
         * ------------------------------------------------------------
         * View selection
         * ------------------------------------------------------------
         */

        document
          .querySelectorAll(
            '[data-semarch-view-index]'
          )
          .forEach(
            button => {

              button.addEventListener(
                'click',
                () => {

                  const index =
                    Number(
                      button.getAttribute(
                        'data-semarch-view-index'
                      )
                    )


                  const selectedView =
                    availableViews[
                      index
                    ] ||
                    null


                  if (
                    !selectedView
                  ) {

                    return
                  }


                  onSelect?.(
                    selectedView
                  )


                  w2popup.close()
                }
              )
            }
          )
      })
    }
  })


  return null
}


function getViewLabel(
  view
) {

  return (
    view.diagramName ||
    view.name ||
    view.diagramId ||
    'BPMN View'
  )
}


function escapeHtml(
  value
) {

  return String(
    value ?? ''
  )
    .replaceAll(
      '&',
      '&amp;'
    )
    .replaceAll(
      '<',
      '&lt;'
    )
    .replaceAll(
      '>',
      '&gt;'
    )
    .replaceAll(
      '"',
      '&quot;'
    )
    .replaceAll(
      "'",
      '&#039;'
    )
}
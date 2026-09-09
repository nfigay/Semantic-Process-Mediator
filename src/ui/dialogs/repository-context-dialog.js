import { w2popup } from 'w2ui/w2ui-2.0.es6.js'

export function openRepositoryContextDialog({
  context = {},
  cocs = [],
  onSave
}) {

  function buildCocOptions() {

    return cocs
      .map(
        coc =>
          `<option value="${coc.id}">${coc.name}</option>`
      )
      .join('')
  }


  w2popup.open({

    title:
      '⚙ CoC Context — Repository Settings',

    width:
      560,

    height:
      420,

    body: `
      <div style="padding:16px;font-family:'DM Sans',sans-serif;font-size:13px;">

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">

          <div>
            <label
              style="
                display:block;
                font-size:11px;
                font-weight:600;
                color:#4A6580;
                margin-bottom:4px;
                text-transform:uppercase;
                letter-spacing:.06em;
              "
            >
              Centre of Competence
            </label>

            <select
              id="ctx-coc"
              style="
                width:100%;
                padding:6px 8px;
                border:1px solid #D4DCE6;
                border-radius:4px;
                font-size:13px;
                background:#fff;
              "
            >
              <option value="">— select CoC —</option>
              ${buildCocOptions()}
            </select>
          </div>


          <div>
            <label
              style="
                display:block;
                font-size:11px;
                font-weight:600;
                color:#4A6580;
                margin-bottom:4px;
                text-transform:uppercase;
                letter-spacing:.06em;
              "
            >
              Maturity Level
            </label>

            <select
              id="ctx-maturity"
              style="
                width:100%;
                padding:6px 8px;
                border:1px solid #D4DCE6;
                border-radius:4px;
                font-size:13px;
                background:#fff;
              "
            >
              <option value="L1">L1 — Drawing (informal)</option>
              <option value="L2">L2 — Modelling (structured)</option>
              <option value="L3">L3 — Executable (workflow-ready)</option>
              <option value="L4">L4 — Simulation (analytical)</option>
            </select>
          </div>


          <div>
            <label
              style="
                display:block;
                font-size:11px;
                font-weight:600;
                color:#4A6580;
                margin-bottom:4px;
                text-transform:uppercase;
                letter-spacing:.06em;
              "
            >
              Organisation
            </label>

            <input
              id="ctx-org"
              type="text"
              placeholder="Airbus D&S"
              value="${context.organization || ''}"
              style="
                width:100%;
                padding:6px 8px;
                border:1px solid #D4DCE6;
                border-radius:4px;
                font-size:13px;
                box-sizing:border-box;
              "
            />
          </div>


          <div>
            <label
              style="
                display:block;
                font-size:11px;
                font-weight:600;
                color:#4A6580;
                margin-bottom:4px;
                text-transform:uppercase;
                letter-spacing:.06em;
              "
            >
              Target Platform
            </label>

            <select
              id="ctx-platform"
              style="
                width:100%;
                padding:6px 8px;
                border:1px solid #D4DCE6;
                border-radius:4px;
                font-size:13px;
                background:#fff;
              "
            >
              <option value="Standalone">
                Standalone / BPMN.io
              </option>

              <option value="ARIS">
                ARIS (BMS)
              </option>

              <option value="EA">
                Enterprise Architect (CoC)
              </option>

              <option value="Camunda">
                Camunda / Zeebe (executable)
              </option>
            </select>
          </div>


          <div>
            <label
              style="
                display:block;
                font-size:11px;
                font-weight:600;
                color:#4A6580;
                margin-bottom:4px;
                text-transform:uppercase;
                letter-spacing:.06em;
              "
            >
              Reference Standard
            </label>

            <input
              id="ctx-std"
              type="text"
              placeholder="DO-178C / ECSS-Q-ST-80 / ISO 9001"
              value="${context.stdRef || ''}"
              style="
                width:100%;
                padding:6px 8px;
                border:1px solid #D4DCE6;
                border-radius:4px;
                font-size:13px;
                box-sizing:border-box;
              "
            />
          </div>


          <div>
            <label
              style="
                display:block;
                font-size:11px;
                font-weight:600;
                color:#4A6580;
                margin-bottom:4px;
                text-transform:uppercase;
                letter-spacing:.06em;
              "
            >
              Programme / Contract
            </label>

            <input
              id="ctx-program"
              type="text"
              placeholder="ESA-2024-XXX / Internal"
              value="${context.programContext || ''}"
              style="
                width:100%;
                padding:6px 8px;
                border:1px solid #D4DCE6;
                border-radius:4px;
                font-size:13px;
                box-sizing:border-box;
              "
            />
          </div>

        </div>


        <div
          style="
            margin-top:12px;
            padding:8px 12px;
            background:#EEF4FB;
            border-left:3px solid #2E6DA4;
            border-radius:0 4px 4px 0;
            font-size:11px;
            color:#4A6580;
            line-height:1.4;
          "
        >
          This context is serialised into the BPMN file as

          <code
            style="
              font-family:monospace;
              background:#D8E8F4;
              padding:1px 4px;
              border-radius:2px;
            "
          >
            semarch:RepositoryContext
          </code>.
        </div>

      </div>
    `,

    buttons: `
      <button
        class="w2ui-btn"
        id="btn-cancel-context"
      >
        Cancel
      </button>

      <button
        class="w2ui-btn w2ui-btn-blue"
        id="btn-save-context"
      >
        Save Context
      </button>
    `,

    onOpen(event) {

      event.done(() => {

        const maturitySelect =
          document.getElementById(
            'ctx-maturity'
          )

        const platformSelect =
          document.getElementById(
            'ctx-platform'
          )

        const cocSelect =
          document.getElementById(
            'ctx-coc'
          )


        // -------------------------------------------------------------------
        // Restore current RepositoryContext
        // -------------------------------------------------------------------

        if (
          maturitySelect &&
          context.maturity
        ) {

          maturitySelect.value =
            context.maturity
        }


        if (
          platformSelect &&
          context.targetPlatform
        ) {

          platformSelect.value =
            context.targetPlatform
        }


        if (
          cocSelect &&
          context.cocOwner
        ) {

          cocSelect.value =
            context.cocOwner
        }


        // -------------------------------------------------------------------
        // CoC selection
        //
        // A CoC may provide useful defaults for:
        //   - organisation
        //   - standard
        //   - target platform
        //
        // Maturity is intentionally NOT changed here.
        //
        // CoC and maturity are independent methodological dimensions.
        // -------------------------------------------------------------------

        cocSelect?.addEventListener(
          'change',
          () => {

            const coc =
              cocs.find(
                item =>
                  item.id ===
                  cocSelect.value
              )


            if (!coc) {
              return
            }


            const orgInput =
              document.getElementById(
                'ctx-org'
              )

            const stdInput =
              document.getElementById(
                'ctx-std'
              )

            const platformInput =
              document.getElementById(
                'ctx-platform'
              )


            if (orgInput) {

              orgInput.value =
                coc.organization || ''
            }


            if (stdInput) {

              stdInput.value =
                coc.stdRef || ''
            }


            if (platformInput) {

              platformInput.value =
                coc.targetPlatform ||
                'Standalone'
            }
          }
        )


        // -------------------------------------------------------------------
        // Cancel
        // -------------------------------------------------------------------

        document
          .getElementById(
            'btn-cancel-context'
          )
          ?.addEventListener(
            'click',
            () => {

              w2popup.close()
            }
          )


        // -------------------------------------------------------------------
        // Save
        // -------------------------------------------------------------------

        document
          .getElementById(
            'btn-save-context'
          )
          ?.addEventListener(
            'click',
            () => {

              const values = {

                cocOwner:
                  document
                    .getElementById(
                      'ctx-coc'
                    )
                    .value,

                organization:
                  document
                    .getElementById(
                      'ctx-org'
                    )
                    .value,

                maturity:
                  document
                    .getElementById(
                      'ctx-maturity'
                    )
                    .value,

                stdRef:
                  document
                    .getElementById(
                      'ctx-std'
                    )
                    .value,

                targetPlatform:
                  document
                    .getElementById(
                      'ctx-platform'
                    )
                    .value,

                programContext:
                  document
                    .getElementById(
                      'ctx-program'
                    )
                    .value,

                repositoryVersion:
                  context.repositoryVersion ||
                  '1.0',

                lastReview:
                  new Date()
                    .toISOString()
                    .split('T')[0]
              }


              onSave?.(
                values
              )


              w2popup.close()
            }
          )
      })
    }
  })
}
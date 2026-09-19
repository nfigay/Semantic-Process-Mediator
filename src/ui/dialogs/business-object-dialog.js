import { w2popup } from 'w2ui/w2ui-2.0.es6.js'


export function openBusinessObjectDialog({
  onSave
} = {}) {

  w2popup.open({

    title:
      'New Business Object',

    width:
      520,

    height:
      300,

    body: `
      <div style="padding:16px;font-family:'DM Sans',sans-serif;font-size:13px;">

        <div style="margin-bottom:14px;">
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
            Business Object ID
          </label>

          <input
            id="business-object-id"
            type="text"
            placeholder="BO_Example"
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


        <div style="margin-bottom:14px;">
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
            Type refs
          </label>

          <input
            id="business-object-type-refs"
            type="text"
            placeholder="PAF_Deliverable, eng:Specification"
            style="
              width:100%;
              padding:6px 8px;
              border:1px solid #D4DCE6;
              border-radius:4px;
              font-size:13px;
              box-sizing:border-box;
            "
          />

          <div
            style="
              margin-top:5px;
              font-size:11px;
              color:#6B7C8F;
            "
          >
            Enter one or more semantic type references separated by commas.
          </div>
        </div>


        <div
          id="business-object-error"
          style="
            min-height:18px;
            margin-bottom:10px;
            font-size:12px;
            color:#A33;
          "
        ></div>


        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button
            id="btn-cancel-business-object"
            class="w2ui-btn"
          >
            Cancel
          </button>

          <button
            id="btn-save-business-object"
            class="w2ui-btn w2ui-btn-blue"
          >
            Create
          </button>
        </div>

      </div>
    `,

    onOpen(event) {

      event.onComplete =
        () => {

          document
            .getElementById(
              'btn-cancel-business-object'
            )
            ?.addEventListener(
              'click',
              () => {

                w2popup.close()
              }
            )


          document
            .getElementById(
              'btn-save-business-object'
            )
            ?.addEventListener(
              'click',
              () => {

                const id =
                  document
                    .getElementById(
                      'business-object-id'
                    )
                    ?.value ||
                  ''


                const typeRefs =
                  (
                    document
                      .getElementById(
                        'business-object-type-refs'
                      )
                      ?.value ||
                    ''
                  )
                    .split(',')
                    .map(
                      typeRef =>
                        typeRef.trim()
                    )
                    .filter(Boolean)


                const errorElement =
                  document
                    .getElementById(
                      'business-object-error'
                    )


                try {

                  onSave?.({
                    id,
                    typeRefs
                  })


                  w2popup.close()

                } catch (
                  error
                ) {

                  if (
                    errorElement
                  ) {

                    errorElement.textContent =
                      error?.message ||
                      'Business Object could not be created'
                  }
                }
              }
            )
        }
    }
  })
}

import { w2popup } from 'w2ui'

export function openNewBpmnModelDialog({ onSubmit } = {}) {
  w2popup.open({
    title: 'New BPMN model', width: 480, height: 300,
    body: `<form id="bpmnsm-new-bpmn" style="padding:18px;display:grid;gap:12px;font-size:13px">
      <label for="bpmnsm-bpmn-kind">Model type</label>
      <select id="bpmnsm-bpmn-kind" class="w2ui-input"><option value="process">Process</option><option value="collaboration">Collaboration</option></select>
      <label for="bpmnsm-bpmn-id">BPMN identifier</label>
      <input id="bpmnsm-bpmn-id" class="w2ui-input" required maxlength="180" placeholder="Process_1" />
      <p id="bpmnsm-bpmn-error" role="alert" style="color:#b91c1c"></p></form>`,
    buttons: `<button type="button" class="w2ui-btn" id="bpmnsm-bpmn-cancel">Cancel</button><button type="button" class="w2ui-btn" id="bpmnsm-bpmn-create">Create</button>`,
    onOpen(event) {
      event.done(() => {
        const id = document.getElementById('bpmnsm-bpmn-id')
        const kind = document.getElementById('bpmnsm-bpmn-kind')
        const error = document.getElementById('bpmnsm-bpmn-error')
        const button = document.getElementById('bpmnsm-bpmn-create')
        document.getElementById('bpmnsm-bpmn-cancel')?.addEventListener('click', () => w2popup.close())
        async function submit(event) {
          event?.preventDefault?.()
          button.disabled = true
          try {
            await onSubmit?.({ kind: kind.value, id: id.value.trim() })
            w2popup.close()
          } catch (e) {
            error.textContent = e?.message || 'Cannot create BPMN model'
            button.disabled = false
          }
        }
        button.addEventListener('click', submit)
        document.getElementById('bpmnsm-new-bpmn').addEventListener('submit', submit)
        id.focus()
      })
    }
  })
}

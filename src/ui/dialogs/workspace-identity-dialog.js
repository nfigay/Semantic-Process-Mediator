import { w2popup } from 'w2ui'

export function openWorkspaceIdentityDialog({
  mode = 'new', name = '', description = '', onSubmit, onCompleted
} = {}) {
  const rename = mode === 'rename'
  w2popup.open({
    title: rename ? 'Rename Workspace' : 'New Workspace',
    width: 520, height: 325,
    body: `<form id="bpmnsm-workspace-identity" style="padding:18px;display:grid;gap:10px;font-size:13px">
      <label for="bpmnsm-workspace-name">Name</label>
      <input id="bpmnsm-workspace-name" maxlength="200" required class="w2ui-input" />
      <label for="bpmnsm-workspace-description">Description</label>
      <textarea id="bpmnsm-workspace-description" maxlength="4000" rows="4" class="w2ui-input"></textarea>
      <p id="bpmnsm-workspace-error" role="alert" style="color:#b91c1c"></p>
    </form>`,
    buttons: `<button type="button" class="w2ui-btn" id="bpmnsm-workspace-cancel">Cancel</button>
      <button type="button" class="w2ui-btn" id="bpmnsm-workspace-submit">${rename ? 'Save' : 'Create'}</button>`,
    onOpen(event) {
      event.done(() => {
        const nameInput = document.getElementById('bpmnsm-workspace-name')
        const descriptionInput = document.getElementById('bpmnsm-workspace-description')
        const errorLabel = document.getElementById('bpmnsm-workspace-error')
        const submit = document.getElementById('bpmnsm-workspace-submit')
        nameInput.value = name
        descriptionInput.value = description
        document.getElementById('bpmnsm-workspace-cancel')?.addEventListener('click', () => w2popup.close())
        async function save(event) {
          event?.preventDefault?.()
          const newName = nameInput.value.trim()
          if (!newName) { errorLabel.textContent = 'Workspace name is required.'; return }
          submit.disabled = true
          try {
            await onSubmit?.({ name: newName, description: descriptionInput.value.trim() })
            w2popup.close()
            onCompleted?.()
          } catch (error) {
            errorLabel.textContent = error?.message || 'Workspace operation failed.'
            submit.disabled = false
          }
        }
        submit?.addEventListener('click', save)
        document.getElementById('bpmnsm-workspace-identity')?.addEventListener('submit', save)
        nameInput.focus()
      })
    }
  })
}

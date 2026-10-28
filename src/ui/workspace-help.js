// Bundled documentation: no remote fetch, iframe or external stylesheet.
export function showWorkspaceHelp({ restricted = false } = {}) {
  document.getElementById('bpmnsm-workspace-help')?.remove()
  const dialog = document.createElement('dialog')
  dialog.id = 'bpmnsm-workspace-help'
  dialog.setAttribute('aria-label', restricted ? 'Folder access is restricted' : 'Working with Workspaces')
  dialog.style.cssText = 'box-sizing:border-box;width:min(760px,calc(100% - 24px));max-height:85vh;overflow:auto;padding:0;border:1px solid #cad5e2;border-radius:12px;background:#fff;color:#17263a;box-shadow:0 20px 70px #0005;font:14px/1.6 system-ui, sans-serif;'

  // Fixed, locally authored HTML. No user-controlled strings are interpolated.
  dialog.innerHTML = `
    <article style="padding:28px 32px;max-width:72ch;margin:auto">
      <header style="border-bottom:1px solid #dce3eb;padding-bottom:16px;margin-bottom:20px">
        <p style="margin:0;color:#52657d;font-size:12px;letter-spacing:.08em;text-transform:uppercase">BPMNSM · User guide</p>
        <h1 style="font-size:25px;line-height:1.25;margin:8px 0">${restricted ? 'Folder access is restricted' : 'Working with Workspaces'}</h1>
        <p style="margin:0;color:#45566b">Manage BPMN models using portable archives or, when permitted, a local folder.</p>
      </header>
      ${restricted ? `<section aria-label="Restricted environment" style="border-left:4px solid #bd7a24;background:#fff7eb;padding:12px 16px;margin-bottom:22px">
        <strong>Direct folder access is not allowed.</strong>
        <p style="margin:6px 0">Your browser or organization blocked folder editing. Your current Workspace has not been replaced. Folder commands are hidden for this session.</p>
        <p style="margin:6px 0 0">Continue with <strong>Open Workspace Archive</strong> and <strong>Save Workspace Archive</strong>.</p>
      </section>` : ''}
      <section><h2 style="font-size:18px;margin:22px 0 8px">1. What is a Workspace?</h2>
        <p>A Workspace contains your BPMN models and related resources. An <strong>Archive</strong> is a portable ZIP snapshot. A <strong>Folder</strong> is a directory opened for direct editing when browser security permits it.</p>
      </section>
      <section><h2 style="font-size:18px;margin:22px 0 8px">2. Open and work</h2>
        <ol style="padding-left:22px"><li>Choose <strong>Open Workspace Archive</strong> and select your ZIP.</li>
        <li>Explore and edit BPMN models inside BPMNSM.</li>
        <li>Use <strong>Save Workspace Archive</strong> or <strong>Save Workspace As Archive</strong> to download a new ZIP.</li></ol>
      </section>
      <section><h2 style="font-size:18px;margin:22px 0 8px">3. Keep your changes</h2>
        <p><strong>A ZIP download does not overwrite the ZIP you opened.</strong> Locate the new file in your browser downloads and keep it as your current snapshot. Reopen it to check that your models were preserved.</p>
        <p>A download request alone is not proof that the ZIP was saved: verify that the downloaded file exists.</p>
      </section>
      <section><h2 style="font-size:18px;margin:22px 0 8px">4. Restricted environments</h2>
        <p>Some organizations allow file selection and downloads but block direct file-system writes. In this case, use ZIP archives. Folder commands are hidden after BPMNSM detects a security refusal; cancelling a picker does not count as a refusal.</p>
      </section>
      <footer style="border-top:1px solid #dce3eb;margin-top:24px;padding-top:16px;display:flex;justify-content:flex-end">
        <button type="button" data-workspace-help-close style="padding:8px 18px;border:1px solid #b2bfd0;border-radius:7px;background:#f6f8fb;color:#17263a;cursor:pointer">Close guide</button>
      </footer>
    </article>`
  dialog.querySelector('[data-workspace-help-close]').addEventListener('click', () => dialog.close())
  dialog.addEventListener('close', () => dialog.remove(), { once: true })
  document.body.appendChild(dialog)
  if (typeof dialog.showModal === 'function') dialog.showModal()
  else dialog.setAttribute('open', '')
  dialog.querySelector('[data-workspace-help-close]').focus()
}

/** Practical editor landing page; the historical welcome-view.js stays untouched. */
export function createWorkspaceWelcomeView({
  onNewWorkspace,
  onOpenWorkspaceArchive,
  onNewProcess,
  onImportBpmn
} = {}) {
  const button = (action, text, primary = false) => `
    <button type="button" data-welcome-action="${action}" style="padding:11px 18px;border-radius:7px;border:1px solid #a8b7c8;background:${primary ? '#1e3a5f' : '#fff'};color:${primary ? '#fff' : '#1e3a5f'};font-weight:650;cursor:pointer">${text}</button>`
  const html = `
    <main style="height:100%;box-sizing:border-box;overflow:auto;background:#f4f7fb;color:#24354b;font:14px/1.65 system-ui,-apple-system,sans-serif">
      <article style="max-width:1020px;margin:0 auto;padding:48px 32px 72px">
        <header style="border-bottom:1px solid #d6dfea;padding-bottom:26px;margin-bottom:32px">
          <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#55708f;font-weight:700;margin:0 0 12px">BPMN Semantic Mediator · Editor</p>
          <h1 style="font-size:36px;line-height:1.2;color:#1e3a5f;margin:0 0 14px">Welcome to BPMN Semantic Mediator</h1>
          <p style="font-size:17px;max-width:760px;color:#54677d;margin:0">Manage BPMN models in a Workspace, and save a portable archive to continue your work in another session.</p>
        </header>
        <section aria-labelledby="start-title">
          <h2 id="start-title" style="font-size:23px;color:#1e3a5f;margin:0 0 14px">How to start with BPMN Semantic Mediator Workspaces</h2>
          <p style="margin:0 0 20px">A Workspace groups your BPMN models and their repository context. Start a new Workspace or resume from an existing ZIP archive.</p>
          <div style="display:flex;flex-wrap:wrap;gap:12px;margin:0 0 28px">
            ${button('new-workspace', 'Create Workspace', true)}
            ${button('open-workspace-archive', 'Open Workspace Archive…')}
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px">
            ${[['01','Create a Workspace','Establish the working context for your models.'],['02','Create or import BPMN','Add processes to the active Repository.'],['03','Save a ZIP archive','Download a portable snapshot of your Workspace.'],['04','Resume your work','Open the saved archive in a later session.']].map(([n,h,p]) => `<section style="background:white;border:1px solid #d7e1ed;border-radius:10px;padding:20px"><div style="font-size:12px;font-weight:750;color:#587697;margin-bottom:8px">${n}</div><h3 style="font-size:16px;color:#1e3a5f;margin:0 0 8px">${h}</h3><p style="font-size:13px;color:#56677d;margin:0">${p}</p></section>`).join('')}
          </div>
        </section>
        <section style="background:#e9f1f9;border-left:4px solid #507ca6;padding:18px 22px;border-radius:5px;margin-top:34px" aria-labelledby="restrict-title">
          <h2 id="restrict-title" style="font-size:17px;margin:0 0 8px;color:#1e3a5f">Working in a restricted browser</h2>
          <p style="margin:0">Some browsers or organization policies prevent direct folder access. Workspace ZIP archives remain available: open an archive, edit your models, then use <strong>Save Workspace As Archive</strong> to download a new copy. A download does not overwrite an existing ZIP, and the browser cannot guarantee a file has been retained on disk.</p>
        </section>
        <section style="margin-top:32px;border-top:1px solid #d6dfea;padding-top:24px" aria-labelledby="models-title">
          <h2 id="models-title" style="font-size:19px;color:#1e3a5f;margin:0 0 10px">Working with BPMN models</h2>
          <p>Once a Workspace is active, create a process or import a BPMN model. Your changes are included in the next Workspace archive snapshot.</p>
          <div style="display:flex;flex-wrap:wrap;gap:12px">${button('new-process','New Process')}${button('import-bpmn','Import BPMN…')}</div>
        </section>
      </article>
    </main>`
  function onActivate({ container } = {}) {
    if (!container) return
    for (const [action, callback] of [
      ['new-workspace', onNewWorkspace],
      ['open-workspace-archive', onOpenWorkspaceArchive],
      ['new-process', onNewProcess],
      ['import-bpmn', onImportBpmn]
    ]) {
      if (typeof callback === 'function') {
        container.querySelector(`[data-welcome-action="${action}"]`)?.addEventListener('click', callback)
      }
    }
  }
  return { id: 'welcome', title: 'Welcome', html, onActivate }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function extensionOf(name) {
  const index = String(name || '').lastIndexOf('.')
  return index > 0 ? String(name).slice(index + 1) : ''
}

function formatSize(size) {
  return Number.isFinite(size) ? `${size} bytes` : 'Unknown'
}

export function createResourceView({ sourceId, resource } = {}) {
  const path = resource?.path || ''
  const selected = Boolean(path)
  const name = path.split('/').filter(Boolean).at(-1) || path || 'Sources'
  const extension = extensionOf(name)

  return {
    id: `resource:${sourceId || 'source'}:${path}`,
    html: `
      <section style="padding:28px 32px;font-family:sans-serif;color:#1E3A5F;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748B;">Resource</div>
        <h1 style="margin:8px 0 24px;font-size:22px;">${escapeHtml(name)}</h1>
        ${selected ? '' : '<p style="font-size:13px;color:#64748B;">Select a file in the Sources tree to inspect its physical metadata.</p>'}
        <dl style="${selected ? 'display:grid;' : 'display:none;'}grid-template-columns:120px 1fr;gap:10px 18px;margin:0;font-size:13px;">
          <dt style="font-weight:700;">Name</dt><dd style="margin:0;">${escapeHtml(name)}</dd>
          <dt style="font-weight:700;">Extension</dt><dd style="margin:0;">${escapeHtml(extension || '—')}</dd>
          <dt style="font-weight:700;">Size</dt><dd style="margin:0;">${escapeHtml(formatSize(resource?.size))}</dd>
        </dl>
      </section>
    `
  }
}

// Verified physical file persistence for Workspace Archives. No overwrite of non-empty files.
export async function writeNewWorkspaceArchive({ picker, suggestedName, archive, validate }) {
  if (typeof picker !== 'function') throw new Error('Archive file saving is unavailable in this browser')
  if (!(archive instanceof Uint8Array)) throw new Error('Workspace Archive must contain ZIP bytes')
  const handle = await picker({ suggestedName, types: [{ description: 'Workspace Archive', accept: { 'application/zip': ['.zip'] } }] })
  if (!handle) return null
  const existing = await handle.getFile()
  if (existing.size !== 0) throw new Error('Choose a new or empty Archive file; replacing existing files is not supported')
  const writable = await handle.createWritable()
  try {
    await writable.write(archive)
    await writable.close()
  } catch (error) {
    try { await writable.abort?.() } catch { /* preserve primary failure */ }
    throw error
  }
  const stored = new Uint8Array(await (await handle.getFile()).arrayBuffer())
  if (stored.length !== archive.length || stored.some((byte, index) => byte !== archive[index])) {
    throw new Error('Physical Workspace Archive readback does not match the snapshot')
  }
  if (validate) validate(stored)
  return handle
}

import { afterEach, describe, expect, it, vi } from 'vitest'
import { writeNewWorkspaceArchive } from './workspace-archive-file-save.js'
function fakeHandle(initial = new Uint8Array(0), corrupt = false) {
  let data = initial
  const createWritable = vi.fn(async () => ({
    async write(value) { data = new Uint8Array(value) },
    async close() {}
  }))
  return {
    createWritable,
    async getFile() { return { size: data.length, async arrayBuffer() {
      return (corrupt ? new Uint8Array([1, 9]) : data).buffer
    } } }
  }
}
describe('Save As Archive physical receipt', () => {
  it('refuses an occupied destination without requesting write access', async () => {
    const handle = fakeHandle(new Uint8Array([1]))
    await expect(writeNewWorkspaceArchive({ picker: async () => handle, archive: new Uint8Array([2]) })).rejects.toThrow(/replacing existing/)
    expect(handle.createWritable).not.toHaveBeenCalled()
  })
  it('writes and reads back identical ZIP bytes', async () => {
    const handle = fakeHandle()
    const archive = new Uint8Array([80, 75, 3, 4])
    expect(await writeNewWorkspaceArchive({ picker: async () => handle, archive, validate: vi.fn() })).toBe(handle)
    expect(handle.createWritable).toHaveBeenCalledOnce()
  })
  it('rejects corrupted readback without issuing a receipt', async () => {
    const handle = fakeHandle(new Uint8Array(), true)
    await expect(writeNewWorkspaceArchive({ picker: async () => handle, archive: new Uint8Array([80, 75]) })).rejects.toThrow(/readback/)
  })
})

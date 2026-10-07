export const WORKSPACE_METADATA_PATH = '.bpmnsm/workspace.json'

export const WORKSPACE_METADATA_FORMAT = 'bpmnsm-workspace'

export const WORKSPACE_METADATA_FORMAT_VERSION = 2

const LEGACY_WORKSPACE_METADATA_FORMAT_VERSION = 1

export function createWorkspaceMetadata({
  workspaceId,
  createdAt,
  savedAt,
  name = null,
  snapshotIteration = 1
}) {
  return {
    format: WORKSPACE_METADATA_FORMAT,
    formatVersion: WORKSPACE_METADATA_FORMAT_VERSION,
    workspaceId,
    createdAt,
    savedAt,
    name,
    snapshotIteration
  }
}

export function readWorkspaceMetadata(resources) {
  const resource = resources.find(
    candidate => candidate.path === WORKSPACE_METADATA_PATH
  )

  if (!resource) {
    return null
  }

  const metadata = JSON.parse(resource.content)

  if (
    metadata.format !== WORKSPACE_METADATA_FORMAT ||
    ![LEGACY_WORKSPACE_METADATA_FORMAT_VERSION, WORKSPACE_METADATA_FORMAT_VERSION].includes(metadata.formatVersion) ||
    typeof metadata.workspaceId !== 'string' ||
    typeof metadata.createdAt !== 'string' ||
    typeof metadata.savedAt !== 'string' ||
    (metadata.snapshotIteration != null &&
      (!Number.isInteger(metadata.snapshotIteration) || metadata.snapshotIteration < 1)) ||
    (metadata.formatVersion === LEGACY_WORKSPACE_METADATA_FORMAT_VERSION &&
      metadata.workspaceVersion != null &&
      (!Number.isInteger(metadata.workspaceVersion) || metadata.workspaceVersion < 1))
  ) {
    throw new Error('Invalid BPMNSM Workspace metadata')
  }

  const snapshotIteration =
    metadata.snapshotIteration ||
    metadata.workspaceVersion ||
    1

  const { workspaceVersion: _legacyWorkspaceVersion, ...rest } = metadata

  return {
    ...rest,
    formatVersion: WORKSPACE_METADATA_FORMAT_VERSION,
    snapshotIteration
  }
}

function crc32(bytes) {
  let crc = 0xffffffff

  for (const byte of bytes) {
    crc ^= byte

    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }

  return (crc ^ 0xffffffff) >>> 0
}

function writeUint16(view, offset, value) {
  view.setUint16(offset, value, true)
}

function writeUint32(view, offset, value) {
  view.setUint32(offset, value, true)
}

function encodeEntry(document, encoder) {
  const name = encoder.encode(document.fileName)
  const content = encoder.encode(document.content)

  return {
    name,
    content,
    crc: crc32(content)
  }
}

export function createRepositoryWorkspaceArchive(
  documents,
  { includeClean = false, workspaceMetadata = null } = {}
) {
  const encoder = new TextEncoder()
  const entries = documents
    .filter(
      document =>
        includeClean ||
        document.dirty === true
    )
    .map(document => encodeEntry(document, encoder))

  if (workspaceMetadata) {
    entries.push(
      encodeEntry(
        {
          fileName: WORKSPACE_METADATA_PATH,
          content: JSON.stringify(workspaceMetadata, null, 2) + '\n'
        },
        encoder
      )
    )
  }

  let localSize = 0
  let centralSize = 0

  for (const entry of entries) {
    localSize += 30 + entry.name.length + entry.content.length
    centralSize += 46 + entry.name.length
  }

  const bytes = new Uint8Array(localSize + centralSize + 22)
  const view = new DataView(bytes.buffer)
  let offset = 0
  const centralRecords = []

  for (const entry of entries) {
    const localOffset = offset

    writeUint32(view, offset, 0x04034b50)
    writeUint16(view, offset + 4, 20)
    writeUint16(view, offset + 6, 0x0800)
    writeUint16(view, offset + 8, 0)
    writeUint16(view, offset + 10, 0)
    writeUint16(view, offset + 12, 0)
    writeUint32(view, offset + 14, entry.crc)
    writeUint32(view, offset + 18, entry.content.length)
    writeUint32(view, offset + 22, entry.content.length)
    writeUint16(view, offset + 26, entry.name.length)
    writeUint16(view, offset + 28, 0)
    offset += 30

    bytes.set(entry.name, offset)
    offset += entry.name.length
    bytes.set(entry.content, offset)
    offset += entry.content.length

    centralRecords.push({
      entry,
      localOffset
    })
  }

  const centralOffset = offset

  for (const { entry, localOffset } of centralRecords) {
    writeUint32(view, offset, 0x02014b50)
    writeUint16(view, offset + 4, 20)
    writeUint16(view, offset + 6, 20)
    writeUint16(view, offset + 8, 0x0800)
    writeUint16(view, offset + 10, 0)
    writeUint16(view, offset + 12, 0)
    writeUint16(view, offset + 14, 0)
    writeUint32(view, offset + 16, entry.crc)
    writeUint32(view, offset + 20, entry.content.length)
    writeUint32(view, offset + 24, entry.content.length)
    writeUint16(view, offset + 28, entry.name.length)
    writeUint16(view, offset + 30, 0)
    writeUint16(view, offset + 32, 0)
    writeUint16(view, offset + 34, 0)
    writeUint16(view, offset + 36, 0)
    writeUint32(view, offset + 38, 0)
    writeUint32(view, offset + 42, localOffset)
    offset += 46

    bytes.set(entry.name, offset)
    offset += entry.name.length
  }

  writeUint32(view, offset, 0x06054b50)
  writeUint16(view, offset + 4, 0)
  writeUint16(view, offset + 6, 0)
  writeUint16(view, offset + 8, entries.length)
  writeUint16(view, offset + 10, entries.length)
  writeUint32(view, offset + 12, centralSize)
  writeUint32(view, offset + 16, centralOffset)
  writeUint16(view, offset + 20, 0)

  return bytes
}

function requireAvailable(bytes, offset, length, label) {
  if (offset + length > bytes.length) {
    throw new Error(`Invalid BPMNSM workspace archive: truncated ${label}`)
  }
}

export function readRepositoryWorkspaceArchive(archive) {
  if (!(archive instanceof Uint8Array)) {
    throw new Error('BPMNSM workspace archive must be a Uint8Array')
  }

  const view = new DataView(
    archive.buffer,
    archive.byteOffset,
    archive.byteLength
  )
  const decoder = new TextDecoder('utf-8', { fatal: true })
  const resources = []
  let offset = 0

  while (offset + 4 <= archive.length) {
    const signature = view.getUint32(offset, true)

    if (signature !== 0x04034b50) {
      break
    }

    requireAvailable(archive, offset, 30, 'local file header')

    const flags = view.getUint16(offset + 6, true)
    const method = view.getUint16(offset + 8, true)
    const expectedCrc = view.getUint32(offset + 14, true)
    const compressedSize = view.getUint32(offset + 18, true)
    const uncompressedSize = view.getUint32(offset + 22, true)
    const nameLength = view.getUint16(offset + 26, true)
    const extraLength = view.getUint16(offset + 28, true)

    if ((flags & 0x0008) !== 0) {
      throw new Error('Unsupported BPMNSM workspace archive: data descriptors are not supported')
    }

    if (method !== 0) {
      throw new Error(`Unsupported BPMNSM workspace archive compression method: ${method}`)
    }

    if (compressedSize !== uncompressedSize) {
      throw new Error('Invalid BPMNSM workspace archive: stored entry sizes differ')
    }

    const nameStart = offset + 30
    const contentStart = nameStart + nameLength + extraLength
    const contentEnd = contentStart + compressedSize

    requireAvailable(archive, nameStart, nameLength + extraLength, 'entry name')
    requireAvailable(archive, contentStart, compressedSize, 'entry content')

    const nameBytes = archive.slice(nameStart, nameStart + nameLength)
    const contentBytes = archive.slice(contentStart, contentEnd)
    const path = decoder.decode(nameBytes)

    if (!path || path.endsWith('/')) {
      throw new Error('Unsupported BPMNSM workspace archive: directory or empty entries are not supported')
    }

    if (crc32(contentBytes) !== expectedCrc) {
      throw new Error(`Invalid BPMNSM workspace archive: CRC mismatch for ${path}`)
    }

    resources.push({
      path,
      content: decoder.decode(contentBytes)
    })

    offset = contentEnd
  }

  if (resources.length === 0 && archive.length !== 22) {
    throw new Error('Invalid BPMNSM workspace archive: no stored file entries found')
  }

  requireAvailable(archive, offset, 4, 'central directory')

  if (
    view.getUint32(offset, true) !== 0x02014b50 &&
    view.getUint32(offset, true) !== 0x06054b50
  ) {
    throw new Error('Invalid BPMNSM workspace archive: central directory not found')
  }

  return resources
}

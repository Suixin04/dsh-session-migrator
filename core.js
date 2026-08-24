import { randomUUID } from 'node:crypto'
import { readFile, readdir, stat } from 'node:fs/promises'
import { extname, join, relative, resolve, sep } from 'node:path'
import { unzipSync } from 'fflate'
import { Session, SessionId, decodeStorageRecord } from '@deepseek-ai/dsh-session'

export const MAX_ARCHIVE_BYTES = 512 * 1024 * 1024
export const MAX_ENTRY_COUNT = 10_000
export const MAX_JSONL_BYTES = 256 * 1024 * 1024

const MEDIA_TYPES = new Map([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.gif', 'image/gif'],
])

function abort(signal) {
  signal?.throwIfAborted()
}

function normalizeArchivePath(path) {
  const normalized = path.replaceAll('\\', '/')
  if (normalized.startsWith('/') || normalized.split('/').some((part) => part === '..')) {
    throw new Error(`Unsafe archive entry path: ${path}`)
  }
  return normalized.replace(/^\.\//, '')
}

function decodeUtf8(bytes, label) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch (error) {
    throw new Error(`${label} is not valid UTF-8`, { cause: error })
  }
}

export function parseSessionArtifact(content, label = 'session.jsonl') {
  if (Buffer.byteLength(content, 'utf8') > MAX_JSONL_BYTES) {
    throw new Error(`${label} exceeds the ${MAX_JSONL_BYTES} byte import limit`)
  }
  const lines = content.split(/\r?\n/).filter((line) => line.length > 0)
  if (lines.length === 0) throw new Error(`${label} is empty`)

  let header
  try {
    header = JSON.parse(lines[0])
  } catch (error) {
    throw new Error(`${label} has an invalid Session header`, { cause: error })
  }
  if (header?.type !== 'session' || typeof header.id !== 'string' || header.id.length === 0) {
    throw new Error(`${label} does not begin with a DeepSeek Harness Session header`)
  }

  const events = []
  for (let index = 1; index < lines.length; index += 1) {
    let record
    try {
      record = JSON.parse(lines[index])
      events.push(...decodeStorageRecord(record))
    } catch (error) {
      throw new Error(`${label}:${index + 1} contains an invalid storage record`, { cause: error })
    }
  }
  return { header, events, label }
}

async function collectDirectoryEntries(root, signal) {
  const entries = new Map()
  async function visit(directory) {
    abort(signal)
    for (const item of await readdir(directory, { withFileTypes: true })) {
      abort(signal)
      const absolute = join(directory, item.name)
      if (item.isSymbolicLink()) throw new Error(`Archive directory cannot contain symlinks: ${absolute}`)
      if (item.isDirectory()) {
        await visit(absolute)
      } else if (item.isFile()) {
        if (entries.size >= MAX_ENTRY_COUNT) throw new Error(`Archive contains more than ${MAX_ENTRY_COUNT} files`)
        const key = normalizeArchivePath(relative(root, absolute).split(sep).join('/'))
        const info = await stat(absolute)
        if (info.size > MAX_JSONL_BYTES && key.endsWith('.jsonl')) {
          throw new Error(`${key} exceeds the JSONL import limit`)
        }
        entries.set(key, new Uint8Array(await readFile(absolute)))
      }
    }
  }
  await visit(root)
  return entries
}

function unzipArchive(bytes, label) {
  let unpacked
  try {
    unpacked = unzipSync(bytes)
  } catch (error) {
    throw new Error(`Cannot read Session ZIP: ${label}`, { cause: error })
  }
  const entries = new Map()
  let totalBytes = 0
  for (const [rawPath, data] of Object.entries(unpacked)) {
    if (entries.size >= MAX_ENTRY_COUNT) throw new Error(`Archive contains more than ${MAX_ENTRY_COUNT} files`)
    const path = normalizeArchivePath(rawPath)
    totalBytes += data.byteLength
    if (totalBytes > MAX_ARCHIVE_BYTES) throw new Error(`Expanded archive exceeds the ${MAX_ARCHIVE_BYTES} byte limit`)
    if (data.byteLength > MAX_JSONL_BYTES && path.endsWith('.jsonl')) throw new Error(`${path} exceeds the JSONL import limit`)
    if (entries.has(path)) throw new Error(`Duplicate archive entry: ${path}`)
    entries.set(path, data)
  }
  return entries
}

async function readArchiveEntries(sourcePath, signal) {
  abort(signal)
  const absolute = resolve(sourcePath)
  const info = await stat(absolute)
  if (info.isDirectory()) return { sourcePath: absolute, entries: await collectDirectoryEntries(absolute, signal) }
  if (!info.isFile()) throw new Error(`Import source is not a file or directory: ${absolute}`)
  if (info.size > MAX_ARCHIVE_BYTES) throw new Error(`Import source exceeds the ${MAX_ARCHIVE_BYTES} byte limit`)

  const bytes = new Uint8Array(await readFile(absolute))
  abort(signal)
  if (extname(absolute).toLowerCase() === '.zip') return { sourcePath: absolute, entries: unzipArchive(bytes, absolute) }
  return { sourcePath: absolute, entries: new Map([['session.jsonl', bytes]]) }
}

export function readMigrationArchiveBytes(bytes, filename = 'session.zip') {
  if (!(bytes instanceof Uint8Array)) throw new TypeError('Archive upload must be Uint8Array')
  if (bytes.byteLength > MAX_ARCHIVE_BYTES) throw new Error(`Import source exceeds the ${MAX_ARCHIVE_BYTES} byte limit`)
  const entries = filename.toLowerCase().endsWith('.zip')
    ? unzipArchive(bytes, filename)
    : new Map([['session.jsonl', bytes]])
  return parseMigrationEntries({ sourcePath: filename, entries })
}

function sessionEntryRank(path) {
  if (path === 'session.jsonl') return 0
  if (/^subagents\/[^/]+\/session\.jsonl$/.test(path)) return 1
  return 2
}

function parseMigrationEntries(archive) {
  if (!archive.entries.has('session.jsonl')) {
    const roots = [...archive.entries.keys()].filter((path) => /(^|\/)session\.jsonl$/.test(path) && !path.includes('/subagents/'))
    if (roots.length === 1 && roots[0].includes('/')) {
      const prefix = roots[0].slice(0, -'session.jsonl'.length)
      archive = {
        ...archive,
        entries: new Map([...archive.entries].filter(([path]) => path.startsWith(prefix)).map(([path, data]) => [path.slice(prefix.length), data])),
      }
    }
  }
  const sessionEntries = [...archive.entries]
    .filter(([path]) => path === 'session.jsonl' || /^subagents\/[^/]+\/session\.jsonl$/.test(path))
    .sort(([left], [right]) => sessionEntryRank(left) - sessionEntryRank(right) || left.localeCompare(right))

  if (!sessionEntries.some(([path]) => path === 'session.jsonl')) {
    throw new Error('The import source does not contain a root session.jsonl')
  }

  const parsedSessions = sessionEntries.map(([path, bytes]) => parseSessionArtifact(decodeUtf8(bytes, path), path))
  const ids = new Set()
  for (const item of parsedSessions) {
    if (ids.has(item.header.id)) throw new Error(`Duplicate Session id in archive: ${item.header.id}`)
    ids.add(item.header.id)
  }

  const root = parsedSessions.find((item) => item.label === 'session.jsonl')
  const pending = parsedSessions.filter((item) => item !== root)
  const sessions = [root]
  const importedIds = new Set([root.header.id])
  while (pending.length > 0) {
    const index = pending.findIndex((item) => importedIds.has(item.header.parentSession))
    if (index < 0) {
      throw new Error(`Archive has orphaned or cyclic descendant Sessions: ${pending.map((item) => item.header.id).join(', ')}`)
    }
    const [child] = pending.splice(index, 1)
    if (typeof child.header.parentSession !== 'string') {
      throw new Error(`Descendant Session ${child.header.id} has no parentSession`)
    }
    sessions.push(child)
    importedIds.add(child.header.id)
  }

  const media = new Map()
  for (const [path, bytes] of archive.entries) {
    const match = /^media\/([^/]+)(\.[A-Za-z0-9]+)$/.exec(path)
    if (!match) continue
    const mediaType = MEDIA_TYPES.get(match[2].toLowerCase())
    if (!mediaType) throw new Error(`Unsupported media entry: ${path}`)
    media.set(match[1], { path, mediaType, data: bytes })
  }

  return { sourcePath: archive.sourcePath, sessions, media }
}

export async function readMigrationArchive(sourcePath, signal) {
  return parseMigrationEntries(await readArchiveEntries(sourcePath, signal))
}

function collectAttachmentRefs(value, output, seen = new Set()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return
  seen.add(value)
  if (!Array.isArray(value) && value.type === 'image' && value.attachment && typeof value.attachment === 'object') {
    const ref = value.attachment
    if (typeof ref.attachmentId === 'string' && typeof ref.mediaType === 'string') output.set(ref.attachmentId, ref)
  }
  if (Array.isArray(value)) {
    for (const item of value) collectAttachmentRefs(item, output, seen)
  } else {
    for (const item of Object.values(value)) collectAttachmentRefs(item, output, seen)
  }
}

function remapEventSessionReferences(value, idMap) {
  if (Array.isArray(value)) return value.map((item) => remapEventSessionReferences(item, idMap))
  if (value === null || typeof value !== 'object') return value
  const output = {}
  for (const [key, item] of Object.entries(value)) {
    if (key === 'senderSessionId' && typeof item === 'string' && idMap.has(item)) output[key] = idMap.get(item)
    else output[key] = remapEventSessionReferences(item, idMap)
  }
  if (output.kind === 'session-reference' && Array.isArray(output.references)) {
    output.references = output.references.map((reference) => {
      if (reference && typeof reference === 'object' && typeof reference.sessionId === 'string' && idMap.has(reference.sessionId)) {
        return { ...reference, sessionId: idMap.get(reference.sessionId) }
      }
      return reference
    })
  }
  return output
}

export function createSessionIdMap(archive, clone) {
  return new Map(archive.sessions.map((item) => [
    item.header.id,
    clone ? `session-${randomUUID()}` : item.header.id,
  ]))
}

export function validateMigration(archive, workspacePath, idMap = createSessionIdMap(archive, false)) {
  if (typeof workspacePath !== 'string' || workspacePath.length === 0) throw new Error('A target workspace path is required')
  const validated = []
  for (const item of archive.sessions) {
    const mappedId = idMap.get(item.header.id)
    if (!mappedId) throw new Error(`Session id map is missing ${item.header.id}`)
    const header = {
      ...item.header,
      id: mappedId,
      cwd: workspacePath,
      ...(typeof item.header.parentSession === 'string'
        ? { parentSession: idMap.get(item.header.parentSession) ?? item.header.parentSession }
        : {}),
    }
    const events = remapEventSessionReferences(item.events, idMap)
    const id = SessionId(mappedId)
    Session.create(id, events, header)
    validated.push({ ...item, id, header, events, originalId: item.header.id })
  }
  return validated
}

async function importAttachments(archive, attachments, signal, onProgress) {
  const refs = new Map()
  for (const session of archive.sessions) collectAttachmentRefs(session.events, refs)
  if (refs.size === 0) return 0
  if (!attachments) throw new Error('Archive references media, but no attachment store is mounted')

  let imported = 0
  for (const [attachmentId, ref] of refs) {
    abort(signal)
    const media = archive.media.get(attachmentId)
    if (!media) throw new Error(`Archive is missing media for attachment ${attachmentId}`)
    if (media.mediaType !== ref.mediaType) throw new Error(`Media type mismatch for attachment ${attachmentId}`)
    const saved = await attachments.saveImage({ data: media.data, mediaType: media.mediaType, ...(ref.name ? { name: ref.name } : {}) })
    if (String(saved.attachmentId) !== attachmentId) {
      throw new Error(`Attachment identity changed during import: expected ${attachmentId}, got ${saved.attachmentId}`)
    }
    imported += 1
    onProgress?.({ stage: 'attachments', completed: imported, total: refs.size })
  }
  return imported
}

export async function importMigration({ archive, workspacePath, sessionPersistence, workspaceRegistry, attachments, signal, cloneOnConflict = true, onProgress }) {
  abort(signal)
  const workspace = await workspaceRegistry.create(workspacePath)
  const canonicalPath = workspace.path
  const existing = new Set((await sessionPersistence.list(signal)).map((header) => String(header.id)))
  const sourceConflicts = archive.sessions.filter((item) => existing.has(String(item.header.id))).map((item) => String(item.header.id))
  if (sourceConflicts.length > 0 && !cloneOnConflict) {
    throw new Error(`Session already exists on this device: ${sourceConflicts.join(', ')}`)
  }
  const cloned = sourceConflicts.length > 0
  const idMap = createSessionIdMap(archive, cloned)
  const sessions = validateMigration(archive, canonicalPath, idMap)
  onProgress?.({ stage: 'validated', completed: sessions.length, total: sessions.length })

  const attachmentCount = await importAttachments(archive, attachments, signal, onProgress)
  const imported = []
  for (const item of sessions) {
    abort(signal)
    await sessionPersistence.create(item.header)
    if (item.events.length > 0) await sessionPersistence.append(item.id, item.events)
    await workspace.attachSession(item.id)
    imported.push(String(item.id))
    onProgress?.({ stage: 'sessions', completed: imported.length, total: sessions.length })
  }

  return {
    rootSessionId: String(sessions[0].id),
    originalRootSessionId: archive.sessions[0].header.id,
    sessionIds: imported,
    workspaceId: String(workspace.id),
    workspacePath: canonicalPath,
    attachmentCount,
    cloned,
    idMap: Object.fromEntries(idMap),
  }
}

export function parseImportCommand(rawInput) {
  const text = rawInput.trim()
  if (!text) throw new Error('Usage: /session-import <archive.zip|directory|session.jsonl> [--workspace <path>]')
  const tokens = []
  let token = ''
  let quote = null
  let escaped = false
  for (const char of text) {
    if (escaped) {
      token += char
      escaped = false
    } else if (char === '\\') {
      escaped = true
    } else if (quote) {
      if (char === quote) quote = null
      else token += char
    } else if (char === '"' || char === "'") {
      quote = char
    } else if (/\s/.test(char)) {
      if (token) tokens.push(token), token = ''
    } else token += char
  }
  if (escaped || quote) throw new Error('Unterminated quote or escape in import command')
  if (token) tokens.push(token)

  let sourcePath
  let workspacePath
  for (let index = 0; index < tokens.length; index += 1) {
    const value = tokens[index]
    if (value === '--workspace' || value === '-w') {
      workspacePath = tokens[++index]
      if (!workspacePath) throw new Error(`${value} requires a path`)
    } else if (value.startsWith('-')) {
      throw new Error(`Unknown option: ${value}`)
    } else if (sourcePath === undefined) sourcePath = value
    else throw new Error(`Unexpected argument: ${value}`)
  }
  if (!sourcePath) throw new Error('An exported Session ZIP, directory, or JSONL path is required')
  return { sourcePath, workspacePath }
}

export function displayImportResult(result) {
  return [
    `Imported ${result.sessionIds.length} Session${result.sessionIds.length === 1 ? '' : 's'} into ${result.workspacePath}.`,
    `Root Session: ${result.rootSessionId}`,
    result.cloned ? `Conflict detected; imported as a cloned Session tree (source: ${result.originalRootSessionId}).` : 'Original Session IDs preserved.',
    `Attachments: ${result.attachmentCount}`,
    'Reload the page if the imported Session does not appear immediately.',
  ].join('\n')
}

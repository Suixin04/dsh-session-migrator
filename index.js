import {
  MAX_ARCHIVE_BYTES,
  displayImportResult,
  importMigration,
  parseImportCommand,
  readMigrationArchive,
  readMigrationArchiveBytes,
} from './core.js'

export const name = 'session-migrator'
export const inject = ['commands', 'sessionPersistence', 'workspaceRegistry', 'webServer']

function json(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  })
  res.end(body)
}

async function readBody(req) {
  const declared = Number(req.headers['content-length'])
  if (Number.isFinite(declared) && declared > MAX_ARCHIVE_BYTES) throw new Error('Upload is too large')
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_ARCHIVE_BYTES) throw new Error('Upload is too large')
    chunks.push(chunk)
  }
  if (size === 0) throw new Error('Upload is empty')
  return new Uint8Array(Buffer.concat(chunks, size))
}

async function importArchive(ctx, archive, workspacePath, signal, onProgress) {
  return importMigration({
    archive,
    workspacePath,
    sessionPersistence: ctx.sessionPersistence,
    workspaceRegistry: ctx.workspaceRegistry,
    attachments: ctx.get('attachments'),
    signal,
    cloneOnConflict: true,
    onProgress,
  })
}

export function apply(ctx) {
  ctx.commands.register({
    name: 'session-import',
    description: 'import an exported Session ZIP into a workspace',
    input: { hint: '<archive> [--workspace <path>]' },
    recordInput: false,
    handler: async (invocation) => {
      try {
        const parsed = parseImportCommand(invocation.rawInput)
        const workspacePath = parsed.workspacePath ?? invocation.agent.session.header.cwd
        if (!workspacePath) return { kind: 'error', text: 'This Session has no workspace. Add --workspace <existing-directory>.' }
        const archive = await readMigrationArchive(parsed.sourcePath, invocation.signal)
        return { kind: 'success', text: displayImportResult(await importArchive(ctx, archive, workspacePath, invocation.signal)) }
      } catch (error) {
        return { kind: 'error', text: error instanceof Error ? error.message : String(error) }
      }
    },
  })

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/api/session.import',
    handler: async (req, res) => {
      if (req.method !== 'POST') {
        res.setHeader('allow', 'POST')
        return json(res, 405, { ok: false, error: 'Method not allowed' })
      }
      const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
      const workspaceId = requestUrl.searchParams.get('workspaceId')
      if (!workspaceId) return json(res, 400, { ok: false, error: 'workspaceId is required' })
      const workspace = ctx.workspaceRegistry.list().find((item) => String(item.id) === workspaceId)
      if (!workspace) return json(res, 404, { ok: false, error: 'Target workspace was not found' })
      const controller = new AbortController()
      req.on('aborted', () => controller.abort())
      const streamProgress = requestUrl.searchParams.get('progress') === 'true'
      const send = streamProgress
        ? (message) => { if (!res.writableEnded) res.write(`${JSON.stringify(message)}\n`) }
        : undefined
      if (streamProgress) res.writeHead(200, {
        'content-type': 'application/x-ndjson; charset=utf-8',
        'cache-control': 'no-store',
        'x-accel-buffering': 'no',
      })
      try {
        let filename = 'session.zip'
        try { filename = decodeURIComponent(String(req.headers['x-dsh-filename'] ?? filename)) } catch {}
        const body = await readBody(req)
        send?.({ type: 'progress', stage: 'parsing', percent: 64 })
        if (streamProgress) await new Promise((resolve) => setImmediate(resolve))
        const archive = readMigrationArchiveBytes(body, filename)
        const result = await importArchive(ctx, archive, workspace.path, controller.signal, (progress) => {
          if (progress.stage === 'validated') send?.({ type: 'progress', ...progress, percent: 72 })
          else if (progress.stage === 'attachments') send?.({ type: 'progress', ...progress, percent: 72 + Math.round((progress.completed / progress.total) * 8) })
          else if (progress.stage === 'sessions') send?.({ type: 'progress', ...progress, percent: 80 + Math.round((progress.completed / progress.total) * 19) })
        })
        if (streamProgress) {
          send({ type: 'result', result })
          return res.end()
        }
        return json(res, 200, { ok: true, result })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (streamProgress) {
          send({ type: 'error', error: message })
          return res.end()
        }
        return json(res, 400, { ok: false, error: message })
      }
    },
  }))
}

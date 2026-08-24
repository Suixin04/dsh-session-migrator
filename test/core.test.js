import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  importMigration,
  parseImportCommand,
  parseSessionArtifact,
  createSessionIdMap,
  readMigrationArchive,
  validateMigration,
} from '../core.js'

const fixture = join(
  process.cwd(),
  '..',
  'dsh-session-session-38e37b00-809a-4ccf-a1ea-b8938ffb92ed',
)

test('parses quoted import command and workspace option', () => {
  assert.deepEqual(
    parseImportCommand('"/tmp/my export.zip" --workspace "/tmp/project path"'),
    { sourcePath: '/tmp/my export.zip', workspacePath: '/tmp/project path' },
  )
})

test('rejects malformed JSONL headers', () => {
  assert.throws(() => parseSessionArtifact('{"type":"other"}\n'), /Session header/)
})

test('reads and validates the current exported Session directory', async () => {
  const archive = await readMigrationArchive(fixture)
  assert.equal(archive.sessions[0].header.id, 'session-38e37b00-809a-4ccf-a1ea-b8938ffb92ed')
  assert.ok(archive.sessions.length > 1)
  const sessions = validateMigration(archive, '/Users/suixin/Codefield')
  assert.equal(sessions.length, archive.sessions.length)
  assert.equal(sessions[0].header.cwd, '/Users/suixin/Codefield')
})

test('clones conflicting Session trees and rewrites lineage/provenance references', async () => {
  const archive = await readMigrationArchive(fixture)
  const idMap = createSessionIdMap(archive, true)
  const sessions = validateMigration(archive, '/Users/suixin/Codefield', idMap)
  assert.notEqual(String(sessions[0].id), archive.sessions[0].header.id)
  for (const session of sessions.slice(1)) {
    assert.equal(session.header.parentSession, idMap.get(archive.sessions.find((item) => item.header.id === session.originalId).header.parentSession))
  }
  const provenance = sessions.flatMap((session) => session.events).find((event) => JSON.stringify(event).includes('senderSessionId'))
  assert.ok(provenance)
  const serialized = JSON.stringify(provenance)
  for (const [oldId, newId] of idMap) {
    if (serialized.includes(newId)) assert.ok(!serialized.includes(`\"senderSessionId\":\"${oldId}\"`))
  }
})

test('imports the current export through persistence and workspace APIs', async () => {
  const archive = await readMigrationArchive(fixture)
  const calls = []
  const sessionPersistence = {
    async list() { return [] },
    async create(header) { calls.push(['create', String(header.id), header.cwd]) },
    async append(id, events) { calls.push(['append', String(id), events.length]) },
  }
  const workspace = {
    id: 'workspace-test',
    path: '/Users/suixin/Codefield',
    async attachSession(id) { calls.push(['attach', String(id)]) },
  }
  const workspaceRegistry = {
    async create(path) {
      assert.equal(path, '/Users/suixin/Codefield')
      return workspace
    },
  }
  const progress = []
  const warmed = []
  const projectionCache = {
    async putSoft(id, identity, rows, what) { warmed.push({ id, identity, rows, what }) },
  }
  const sessionProjections = {
    restore(checkpoint, events, baseSeq) {
      const title = events.findLast((event) => event.type === 'session/title')
      return { snapshot: { asOfSeq: events.at(-1)?.seq ?? -1, values: {} }, checkpoint: { title: { ver: 1, seq: events.at(-1)?.seq ?? -1, val: title?.data.title ?? null } } }
    },
  }
  const result = await importMigration({ archive, workspacePath: workspace.path, sessionPersistence, workspaceRegistry, onProgress: (event) => progress.push(event), projectionCache, sessionProjections })
  assert.equal(result.sessionIds.length, archive.sessions.length)
  assert.equal(progress[0].stage, 'validated')
  assert.deepEqual(progress.at(-1), { stage: 'sessions', completed: archive.sessions.length, total: archive.sessions.length })
  assert.ok(warmed.length > 0)
  for (const entry of warmed) {
    assert.ok(result.sessionIds.includes(entry.id))
    assert.equal(entry.identity.cwd, workspace.path)
    assert.equal(entry.identity.createdAt !== undefined, true)
    assert.equal(entry.what, 'session import warm-up')
  }
  assert.ok(warmed.some((entry) => typeof entry.rows.title.val === 'string'))
  assert.ok(warmed.every((entry) => 'title' in entry.rows))
  assert.equal(calls.filter(([kind]) => kind === 'create').length, archive.sessions.length)
  assert.equal(calls.filter(([kind]) => kind === 'append').length, archive.sessions.length)
  assert.equal(calls.filter(([kind]) => kind === 'attach').length, archive.sessions.length)

  const conflictPersistence = {
    ...sessionPersistence,
    async list() { return [{ id: archive.sessions[0].header.id }] },
  }
  const cloned = await importMigration({ archive, workspacePath: workspace.path, sessionPersistence: conflictPersistence, workspaceRegistry })
  assert.equal(cloned.cloned, true)
  assert.notEqual(cloned.rootSessionId, archive.sessions[0].header.id)

  const failingCache = {
    async putSoft() { throw new Error('cache unavailable') },
  }
  const degraded = await importMigration({ archive, workspacePath: workspace.path, sessionPersistence: conflictPersistence, workspaceRegistry, projectionCache: failingCache, sessionProjections })
  assert.equal(degraded.sessionIds.length, archive.sessions.length)
})

test('reads a standalone JSONL export', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dsh-session-migrator-'))
  const path = join(directory, 'copy.jsonl')
  await writeFile(path, '{"type":"session","version":0,"id":"session-test","createdAt":1,"cwd":"/tmp","delegationDepth":0,"agentPreset":"standard"}\n')
  const archive = await readMigrationArchive(path)
  assert.equal(archive.sessions.length, 1)
  assert.equal(archive.sessions[0].header.id, 'session-test')
})

import React, { useEffect, useRef, useState } from 'react'
import { zipSync } from 'fflate'

const NS = 'sessionMigrator'
const dictionaries = {
  'zh-CN': {
    title: '导入 Session',
    button: '导入会话',
    hint: '拖入 Session ZIP、session.jsonl 或导出文件夹',
    choose: '选择文件',
    chooseFolder: '选择文件夹',
    cancel: '取消',
    importing: '正在解析并导入…',
    target: '拖到目标工作区',
    dropHere: '释放到此工作区',
    success: '导入成功',
    clone: '检测到重复 Session，已自动创建副本。',
    original: '已保留原 Session ID。',
    open: '打开导入的会话',
    close: '关闭',
  },
  en: {
    title: 'Import Session',
    button: 'Import session',
    hint: 'Drop a Session ZIP, session.jsonl, or exported folder',
    choose: 'Choose file',
    chooseFolder: 'Choose folder',
    cancel: 'Cancel',
    importing: 'Parsing and importing…',
    target: 'Drop onto a target workspace',
    dropHere: 'Drop into this workspace',
    success: 'Import complete',
    clone: 'A duplicate was detected and imported as a cloned Session tree.',
    original: 'Original Session IDs were preserved.',
    open: 'Open imported Session',
    close: 'Close',
  },
}

const css = `
.dsm-button{height:32px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 10px;cursor:pointer;font:inherit;font-size:13px}.dsm-button:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsm-overlay{position:fixed;inset:0;z-index:2147483000;background:color-mix(in srgb,var(--dsw-alias-bg-mask,rgba(0,0,0,.62)) 82%,transparent);display:flex;align-items:center;justify-content:center;padding:24px}.dsm-panel{width:min(720px,calc(100vw - 48px));max-height:calc(100vh - 48px);overflow:auto;background:var(--dsw-alias-bg-layer-1,#181818);color:var(--dsw-alias-label-primary,#fff);border:1px solid var(--dsw-alias-border-l2,#444);border-radius:16px;box-shadow:0 24px 80px rgba(0,0,0,.35);padding:20px}.dsm-head{display:flex;align-items:center;justify-content:space-between;gap:16px}.dsm-head h2{font-size:18px;margin:0}.dsm-hint{margin:8px 0 18px;color:var(--dsw-alias-label-secondary,#aaa);font-size:13px}.dsm-actions{display:flex;gap:8px;flex-wrap:wrap}.dsm-targets{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.dsm-target{min-height:86px;text-align:left;border:1px dashed var(--dsw-alias-border-l1,#666);background:var(--dsw-alias-bg-layer-2,#222);color:inherit;border-radius:12px;padding:12px;cursor:pointer}.dsm-target:hover,.dsm-target[data-over=true]{border-color:var(--dsw-alias-state-business-primary,#4f8cff);background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#4f8cff) 12%,var(--dsw-alias-bg-layer-2,#222))}.dsm-target strong,.dsm-target span{display:block}.dsm-target span{margin-top:5px;color:var(--dsw-alias-label-tertiary,#888);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dsm-status{padding:20px 0;text-align:center}.dsm-error{color:var(--dsw-alias-state-error-primary,#ff6b6b);white-space:pre-wrap}.dsm-success{color:var(--dsw-alias-label-primary,#fff)}
`

function injectCss() {
  if (document.querySelector('style[data-plugin-css="dsh-session-migrator"]')) return
  const style = document.createElement('style')
  style.dataset.pluginCss = 'dsh-session-migrator'
  style.textContent = css
  document.head.appendChild(style)
}

function hostBase() {
  return location.origin && location.origin !== 'null' ? location.origin : 'http://dsh.internal'
}

async function entryFiles(entry, prefix = '') {
  if (entry.isFile) return [[prefix + entry.name, await new Promise((resolve, reject) => entry.file(resolve, reject))]]
  if (!entry.isDirectory) return []
  const reader = entry.createReader()
  const children = []
  while (true) {
    const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject))
    if (!batch.length) break
    children.push(...batch)
  }
  const output = []
  for (const child of children) output.push(...await entryFiles(child, `${prefix}${entry.name}/`))
  return output
}

async function filesFromDataTransfer(transfer) {
  const entries = [...transfer.items].map((item) => item.webkitGetAsEntry?.()).filter(Boolean)
  if (entries.some((entry) => entry.isDirectory)) {
    const pairs = []
    for (const entry of entries) pairs.push(...await entryFiles(entry))
    return pairs
  }
  return [...transfer.files].map((file) => [file.webkitRelativePath || file.name, file])
}

async function archiveFromPairs(pairs) {
  if (pairs.length === 1 && /\.(zip|jsonl)$/i.test(pairs[0][1].name)) return pairs[0][1]
  const entries = {}
  for (const [path, file] of pairs) entries[path.replaceAll('\\', '/')] = new Uint8Array(await file.arrayBuffer())
  return new File([zipSync(entries, { level: 6 })], 'dsh-session-folder.zip', { type: 'application/zip' })
}

async function upload(file, workspaceId) {
  const url = new URL('/api/session.import', hostBase())
  url.searchParams.set('workspaceId', workspaceId)
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/octet-stream', 'x-dsh-filename': encodeURIComponent(file.name) },
    body: file,
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || `Import failed (${response.status})`)
  return payload.result
}

function ImportApp({ ctx, wide = true, useWorkspaces }) {
  const [open, setOpen] = useState(false)
  const [pairs, setPairs] = useState(null)
  const [phase, setPhase] = useState('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [over, setOver] = useState(null)
  const fileRef = useRef(null)
  const folderRef = useRef(null)
  const workspaces = useWorkspaces((state) => state.items)

  useEffect(() => {
    const enter = (event) => {
      if ([...event.dataTransfer?.types || []].includes('Files')) setOpen(true)
    }
    const overEvent = (event) => {
      if ([...event.dataTransfer?.types || []].includes('Files')) event.preventDefault()
    }
    const drop = async (event) => {
      if (![...event.dataTransfer?.types || []].includes('Files')) return
      event.preventDefault()
      try { setPairs(await filesFromDataTransfer(event.dataTransfer)); setOpen(true); setError('') }
      catch (reason) { setError(String(reason)); setOpen(true) }
    }
    document.addEventListener('dragenter', enter)
    document.addEventListener('dragover', overEvent)
    document.addEventListener('drop', drop)
    return () => { document.removeEventListener('dragenter', enter); document.removeEventListener('dragover', overEvent); document.removeEventListener('drop', drop) }
  }, [])

  const pickFiles = (list) => {
    const next = [...list].map((file) => [file.webkitRelativePath || file.name, file])
    if (next.length) { setPairs(next); setOpen(true); setError(''); setResult(null) }
  }
  const importTo = async (workspaceId, sourcePairs = pairs) => {
    if (!sourcePairs?.length) { setError('请先选择或拖入 Session 导出文件。'); return }
    setPhase('importing'); setError('')
    try {
      const imported = await upload(await archiveFromPairs(sourcePairs), workspaceId)
      setResult(imported); setPhase('done')
      await Promise.allSettled([ctx.sessions.refresh?.(), ctx.workspaces.refresh?.()])
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); setPhase('idle') }
  }

  return <>
    <button className="dsm-button" title="Import Session" onClick={() => setOpen(true)}>{wide ? '导入会话' : '⇩'}</button>
    <input ref={fileRef} hidden type="file" accept=".zip,.jsonl,application/zip" onChange={(event) => pickFiles(event.target.files)} />
    <input ref={folderRef} hidden type="file" webkitdirectory="" directory="" multiple onChange={(event) => pickFiles(event.target.files)} />
    {open && <div className="dsm-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && phase !== 'importing') setOpen(false) }}>
      <div className="dsm-panel">
        <div className="dsm-head"><h2>导入 Session</h2><button className="dsm-button" disabled={phase === 'importing'} onClick={() => setOpen(false)}>关闭</button></div>
        <p className="dsm-hint">拖入 Session ZIP、session.jsonl 或完整导出文件夹，然后选择目标工作区。重复 Session 会自动克隆，不会覆盖已有会话。</p>
        <div className="dsm-actions"><button className="dsm-button" onClick={() => fileRef.current?.click()}>选择 ZIP / JSONL</button><button className="dsm-button" onClick={() => folderRef.current?.click()}>选择导出文件夹</button></div>
        <p className="dsm-hint">{pairs?.length ? `已选择 ${pairs.length} 个文件` : '尚未选择文件'}</p>
        {phase === 'importing' ? <div className="dsm-status">正在解析并导入…</div> : result ? <div className="dsm-status dsm-success"><strong>导入成功</strong><p>{result.cloned ? '检测到重复 Session，已自动创建副本。' : '已保留原 Session ID。'}</p><p>{result.sessionIds.length} 个 Session · 根会话 {result.rootSessionId}</p><button className="dsm-button" onClick={() => { ctx.sessions.open(result.rootSessionId); setOpen(false) }}>打开导入的会话</button></div> : <div className="dsm-targets">{workspaces.map((workspace) => <button key={workspace.workspaceId} className="dsm-target" data-over={over === workspace.workspaceId} onDragOver={(event) => { event.preventDefault(); setOver(workspace.workspaceId) }} onDragLeave={() => setOver(null)} onDrop={async (event) => { event.preventDefault(); event.stopPropagation(); const dropped = await filesFromDataTransfer(event.dataTransfer); setPairs(dropped); await importTo(workspace.workspaceId, dropped) }} onClick={() => importTo(workspace.workspaceId)}><strong>{workspace.title}</strong><span>{workspace.path}</span><span>释放到此工作区</span></button>)}</div>}
        {error && <p className="dsm-error">{error}</p>}
      </div>
    </div>}
  </>
}

export const inject = ['slots', 'locale', 'sessions', 'workspaces']
export function apply(ctx) {
  injectCss()
  for (const [locale, dict] of Object.entries(dictionaries)) ctx.effect(() => ctx.locale.register(NS, locale, dict))
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({ name: 'sidebar.footer.action', id: 'session-migrator', order: 50, inject: () => ({ ctx }) }, ImportApp))
}

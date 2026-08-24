import React, { useEffect, useRef, useState } from 'react'
import { zipSync } from 'fflate'

const NS = 'sessionMigrator'
const dictionaries = {
  zh: {
    title: '导入会话',
    button: '导入会话',
    buttonTitle: '导入 DeepSeek Harness 会话',
    close: '关闭',
    intro: '拖入会话 ZIP、session.jsonl 或完整导出文件夹，然后选择目标工作区。重复会话会自动克隆，不会覆盖已有数据。',
    chooseArchive: '选择 ZIP / JSONL',
    chooseFolder: '选择导出文件夹',
    selected: '已选择 {n} 个文件',
    noneSelected: '尚未选择文件',
    missingSource: '请先选择或拖入会话导出文件。',
    importing: '正在解析并导入…',
    progressReading: '正在读取文件…',
    progressPacking: '正在打包导出文件夹…',
    progressUploading: '正在上传到 Harness…',
    progressParsing: '正在解析会话日志…',
    progressValidating: '正在校验会话树…',
    progressAttachments: '正在恢复附件（{done}/{total}）…',
    progressSessions: '正在写入会话（{done}/{total}）…',
    dropHere: '释放到此工作区',
    success: '导入成功',
    clone: '检测到重复会话，已自动创建副本。',
    original: '已保留原会话 ID。',
    summary: '共导入 {n} 个会话 · 根会话 {id}',
    open: '打开导入的会话',
    uploadFailed: '导入失败（HTTP {status}）',
  },
  en: {
    title: 'Import sessions',
    button: 'Import sessions',
    buttonTitle: 'Import DeepSeek Harness sessions',
    close: 'Close',
    intro: 'Drop a session ZIP, session.jsonl, or a complete export folder, then choose the target workspace. Duplicate sessions are cloned automatically and never overwrite existing data.',
    chooseArchive: 'Choose ZIP / JSONL',
    chooseFolder: 'Choose export folder',
    selected: '{n} files selected',
    noneSelected: 'No files selected',
    missingSource: 'Choose or drop a session export first.',
    importing: 'Parsing and importing…',
    progressReading: 'Reading files…',
    progressPacking: 'Packing the export folder…',
    progressUploading: 'Uploading to Harness…',
    progressParsing: 'Parsing session logs…',
    progressValidating: 'Validating the session tree…',
    progressAttachments: 'Restoring attachments ({done}/{total})…',
    progressSessions: 'Writing sessions ({done}/{total})…',
    dropHere: 'Drop into this workspace',
    success: 'Import complete',
    clone: 'A duplicate was detected and imported as a cloned session tree.',
    original: 'Original session IDs were preserved.',
    summary: '{n} sessions imported · Root session {id}',
    open: 'Open imported session',
    uploadFailed: 'Import failed (HTTP {status})',
  },
}

const css = `
.dsm-button{height:32px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 10px;cursor:pointer;font:inherit;font-size:13px}.dsm-button:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsm-overlay{position:fixed;inset:0;z-index:2147483000;background:color-mix(in srgb,var(--dsw-alias-bg-mask,rgba(0,0,0,.62)) 82%,transparent);display:flex;align-items:center;justify-content:center;padding:24px}.dsm-panel{width:min(720px,calc(100vw - 48px));max-height:calc(100vh - 48px);overflow:auto;background:var(--dsw-alias-bg-layer-1,#181818);color:var(--dsw-alias-label-primary,#fff);border:1px solid var(--dsw-alias-border-l2,#444);border-radius:16px;box-shadow:0 24px 80px rgba(0,0,0,.35);padding:20px}.dsm-head{display:flex;align-items:center;justify-content:space-between;gap:16px}.dsm-head h2{font-size:18px;margin:0}.dsm-hint{margin:8px 0 18px;color:var(--dsw-alias-label-secondary,#aaa);font-size:13px}.dsm-actions{display:flex;gap:8px;flex-wrap:wrap}.dsm-targets{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.dsm-target{min-height:86px;text-align:left;border:1px dashed var(--dsw-alias-border-l1,#666);background:var(--dsw-alias-bg-layer-2,#222);color:inherit;border-radius:12px;padding:12px;cursor:pointer}.dsm-target:hover,.dsm-target[data-over=true]{border-color:var(--dsw-alias-state-business-primary,#4f8cff);background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#4f8cff) 12%,var(--dsw-alias-bg-layer-2,#222))}.dsm-target strong,.dsm-target span{display:block}.dsm-target span{margin-top:5px;color:var(--dsw-alias-label-tertiary,#888);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dsm-status{padding:20px 0;text-align:center}.dsm-progress{width:min(460px,100%);margin:18px auto 0;text-align:left}.dsm-progressLabel{display:flex;justify-content:space-between;gap:16px;margin-bottom:8px;color:var(--dsw-alias-label-secondary,#aaa);font-size:13px}.dsm-progressTrack{height:8px;overflow:hidden;border-radius:999px;background:var(--dsw-alias-bg-layer-3,#303030)}.dsm-progressFill{height:100%;border-radius:inherit;background:var(--dsw-alias-state-business-primary,#3478f6);transition:width .18s ease}.dsm-error{color:var(--dsw-alias-state-error-primary,#ff6b6b);white-space:pre-wrap}.dsm-success{color:var(--dsw-alias-label-primary,#fff)}
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

function isMigrationTransfer(transfer) {
  if (!transfer || ![...transfer.types].includes('Files')) return false
  const entries = [...transfer.items].map((item) => item.webkitGetAsEntry?.()).filter(Boolean)
  if (entries.some((entry) => entry.isDirectory)) return true
  if (entries.length > 0 && entries.every((entry) => entry.isFile && /\.(zip|jsonl)$/i.test(entry.name))) return true
  const names = [...transfer.files].map((file) => file.name)
  return names.length > 0 && names.every((name) => /\.(zip|jsonl)$/i.test(name))
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

async function archiveFromPairs(pairs, onProgress) {
  if (pairs.length === 1 && /\.(zip|jsonl)$/i.test(pairs[0][1].name)) return pairs[0][1]
  const entries = {}
  for (let index = 0; index < pairs.length; index += 1) {
    const [path, file] = pairs[index]
    entries[path.replaceAll('\\', '/')] = new Uint8Array(await file.arrayBuffer())
    onProgress?.({ stage: 'reading', percent: Math.round(((index + 1) / pairs.length) * 25) })
  }
  onProgress?.({ stage: 'packing', percent: 30 })
  return new File([zipSync(entries, { level: 6 })], 'dsh-session-folder.zip', { type: 'application/zip' })
}

function upload(file, workspaceId, t, onProgress) {
  return new Promise((resolve, reject) => {
    const url = new URL('/api/session.import', hostBase())
    url.searchParams.set('workspaceId', workspaceId)
    url.searchParams.set('progress', 'true')
    const request = new XMLHttpRequest()
    let consumed = 0
    let finalResult
    request.open('POST', url)
    request.setRequestHeader('content-type', 'application/octet-stream')
    request.setRequestHeader('x-dsh-filename', encodeURIComponent(file.name))
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.({ stage: 'uploading', percent: 30 + Math.round((event.loaded / event.total) * 30) })
    }
    request.onprogress = () => {
      const complete = request.responseText.slice(consumed).split('\n')
      consumed = request.responseText.length - complete.at(-1).length
      for (const line of complete.slice(0, -1)) {
        if (!line) continue
        try {
          const message = JSON.parse(line)
          if (message.type === 'progress') onProgress?.(message)
          else if (message.type === 'result') finalResult = message.result
          else if (message.type === 'error') reject(new Error(message.error))
        } catch (reason) {
          reject(reason)
        }
      }
    }
    request.onerror = () => reject(new Error(t('uploadFailed', { status: request.status || 0 })))
    request.onload = () => {
      request.onprogress()
      if (request.status >= 200 && request.status < 300 && finalResult) resolve(finalResult)
      else if (!finalResult) reject(new Error(t('uploadFailed', { status: request.status })))
    }
    request.send(file)
  })
}

function ImportApp({ ctx, wide = true, useWorkspaces, t }) {
  const [open, setOpen] = useState(false)
  const [pairs, setPairs] = useState(null)
  const [phase, setPhase] = useState('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [over, setOver] = useState(null)
  const [progress, setProgress] = useState({ stage: 'reading', percent: 0 })
  const fileRef = useRef(null)
  const folderRef = useRef(null)
  const workspaces = useWorkspaces((state) => state.items)

  const reset = () => {
    setPairs(null)
    setPhase('idle')
    setError('')
    setResult(null)
    setOver(null)
    setProgress({ stage: 'reading', percent: 0 })
    if (fileRef.current) fileRef.current.value = ''
    if (folderRef.current) folderRef.current.value = ''
  }
  const openDialog = () => { reset(); setOpen(true) }
  const closeDialog = () => { setOpen(false); reset() }

  const pickFiles = (list) => {
    const next = [...list].map((file) => [file.webkitRelativePath || file.name, file])
    if (next.length) { setPairs(next); setOpen(true); setError(''); setResult(null) }
  }
  const updateProgress = (next) => setProgress((current) => ({ ...current, ...next, percent: Math.max(current.percent, next.percent ?? current.percent) }))
  const importTo = async (workspaceId, sourcePairs = pairs) => {
    if (!sourcePairs?.length) { setError(t('missingSource')); return }
    setPhase('importing'); setError(''); setResult(null); setOver(null)
    setProgress({ stage: 'reading', percent: 2 })
    try {
      const archive = await archiveFromPairs(sourcePairs, updateProgress)
      const imported = await upload(archive, workspaceId, t, updateProgress)
      setProgress({ stage: 'sessions', percent: 100, completed: imported.sessionIds.length, total: imported.sessionIds.length })
      setResult(imported); setPhase('done')
      await Promise.allSettled([ctx.sessions.refresh?.(), ctx.workspaces.refresh?.()])
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); setPhase('idle') }
  }

  useEffect(() => {
    const claim = (event) => {
      if (!isMigrationTransfer(event.dataTransfer)) return false
      event.preventDefault()
      event.stopImmediatePropagation()
      return true
    }
    const targetAt = (event) => event.target?.closest?.('.dsm-target') ?? document.elementFromPoint(event.clientX, event.clientY)?.closest?.('.dsm-target')
    const enter = (event) => {
      if (!claim(event)) return
      event.dataTransfer.dropEffect = 'copy'
      setOpen(true)
      setOver(targetAt(event)?.dataset.workspaceId ?? null)
    }
    const overEvent = (event) => {
      if (!claim(event)) return
      event.dataTransfer.dropEffect = 'copy'
      setOver(targetAt(event)?.dataset.workspaceId ?? null)
    }
    const leave = (event) => {
      if (!claim(event)) return
      const leftViewport = event.clientX <= 0 || event.clientY <= 0 || event.clientX >= window.innerWidth || event.clientY >= window.innerHeight
      if (leftViewport || !targetAt(event)) setOver(null)
    }
    const drop = async (event) => {
      if (!claim(event)) return
      const target = targetAt(event)
      window.dispatchEvent(new Event('dragend'))
      setOver(null)
      try {
        const dropped = await filesFromDataTransfer(event.dataTransfer)
        setPairs(dropped); setOpen(true); setError(''); setResult(null)
        if (target?.dataset.workspaceId) await importTo(target.dataset.workspaceId, dropped)
      } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); setOpen(true) }
    }
    document.addEventListener('dragenter', enter, true)
    document.addEventListener('dragover', overEvent, true)
    document.addEventListener('dragleave', leave, true)
    document.addEventListener('drop', drop, true)
    return () => {
      document.removeEventListener('dragenter', enter, true)
      document.removeEventListener('dragover', overEvent, true)
      document.removeEventListener('dragleave', leave, true)
      document.removeEventListener('drop', drop, true)
    }
  }, [pairs, t])

  const progressKey = progress.stage === 'reading' ? 'progressReading'
    : progress.stage === 'packing' ? 'progressPacking'
      : progress.stage === 'uploading' ? 'progressUploading'
        : progress.stage === 'parsing' ? 'progressParsing'
          : progress.stage === 'validated' ? 'progressValidating'
            : progress.stage === 'attachments' ? 'progressAttachments'
              : progress.stage === 'sessions' ? 'progressSessions'
                : 'importing'
  const progressText = t(progressKey, { done: progress.completed ?? 0, total: progress.total ?? 0 })

  return <>
    <button className="dsm-button" title={t('buttonTitle')} onClick={openDialog}>{wide ? t('button') : '⇩'}</button>
    <input ref={fileRef} hidden type="file" accept=".zip,.jsonl,application/zip" onChange={(event) => pickFiles(event.target.files)} />
    <input ref={folderRef} hidden type="file" webkitdirectory="" directory="" multiple onChange={(event) => pickFiles(event.target.files)} />
    {open && <div className="dsm-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && phase !== 'importing') closeDialog() }}>
      <div className="dsm-panel" role="dialog" aria-modal="true" aria-label={t('title')}>
        <div className="dsm-head"><h2>{t('title')}</h2><button className="dsm-button" disabled={phase === 'importing'} onClick={closeDialog}>{t('close')}</button></div>
        <p className="dsm-hint">{t('intro')}</p>
        <div className="dsm-actions"><button className="dsm-button" disabled={phase === 'importing'} onClick={() => fileRef.current?.click()}>{t('chooseArchive')}</button><button className="dsm-button" disabled={phase === 'importing'} onClick={() => folderRef.current?.click()}>{t('chooseFolder')}</button></div>
        <p className="dsm-hint">{pairs?.length ? t('selected', { n: pairs.length }) : t('noneSelected')}</p>
        {phase === 'importing' ? <div className="dsm-status"><strong>{t('importing')}</strong><div className="dsm-progress"><div className="dsm-progressLabel"><span>{progressText}</span><span>{progress.percent}%</span></div><div className="dsm-progressTrack"><div className="dsm-progressFill" style={{ width: `${progress.percent}%` }} /></div></div></div> : result ? <div className="dsm-status dsm-success"><strong>{t('success')}</strong><p>{result.cloned ? t('clone') : t('original')}</p><p>{t('summary', { n: result.sessionIds.length, id: result.rootSessionId })}</p><button className="dsm-button" onClick={() => { ctx.sessions.open(result.rootSessionId); closeDialog() }}>{t('open')}</button></div> : <div className="dsm-targets">{workspaces.map((workspace) => <button key={workspace.workspaceId} data-workspace-id={workspace.workspaceId} className="dsm-target" data-over={over === workspace.workspaceId} onDragEnter={(event) => { event.preventDefault(); setOver(workspace.workspaceId) }} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; setOver(workspace.workspaceId) }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOver(null) }} onClick={() => importTo(workspace.workspaceId)}><strong>{workspace.title}</strong><span>{workspace.path}</span><span>{t('dropHere')}</span></button>)}</div>}
        {error && <p className="dsm-error">{error}</p>}
      </div>
    </div>}
  </>
}

export const inject = ['slots', 'locale', 'sessions', 'workspaces']
export function apply(ctx) {
  injectCss()
  ctx.effect(() => ctx.locale.register(NS, dictionaries))
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({ name: 'sidebar.footer.action', id: 'session-migrator', order: 50, locale: NS, inject: () => ({ ctx }) }, ImportApp))
}

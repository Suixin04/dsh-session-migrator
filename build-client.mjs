import { build } from 'esbuild'
import { readFile, writeFile } from 'node:fs/promises'

const outfile = new URL('./.client-bundle.cjs', import.meta.url)
await build({
  entryPoints: [new URL('./client-src.js', import.meta.url).pathname],
  outfile: outfile.pathname,
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2022'],
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  external: ['react', 'react/jsx-runtime'],
  logLevel: 'warning',
})
const body = await readFile(outfile, 'utf8')
const wrapped = `window.__ModuleLoader__.load({\n  id: "dsh-session-migrator",\n  factory: (require) => {\n    var module = { exports: {} };\n    var exports = module.exports;\n${body.split('\n').map((line) => line ? `    ${line}` : '').join('\n')}\n    return module.exports;\n  }\n});\n`
await writeFile(new URL('./client.js', import.meta.url), wrapped)

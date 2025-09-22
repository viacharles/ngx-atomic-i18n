#!/usr/bin/env node
// i18n-build.mjs
// Convert TS/JSON under one or more "i18n" directories into flat JSON files per language.
// - Accepts --src and --out (single or multiple). If multiple, counts must match.
// - Scans each --src recursively, finds folders named "i18n", processes files inside.
// - .ts files are bundled with esbuild to .mjs, dynamically imported, and written as JSON.
// - .json files are copied through.
// - Optional flags: --cwd, --clean, --strict, --lang=en,zh-Hant

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { pathToFileURL } from 'node:url'
import minimist from 'minimist'
import { buildSync } from 'esbuild'

function fail (msg, code = 1) {
  console.error(msg)
  process.exit(code)
}
function ensureDir (p) {
  fs.mkdirSync(p, { recursive: true })
}
function isDir (p) {
  try {
    return fs.statSync(p).isDirectory()
  } catch {
    return false
  }
}
function readDir (p) {
  try {
    return fs.readdirSync(p, { withFileTypes: true })
  } catch {
    return []
  }
}

function uniq (arr) {
  return Array.from(new Set(arr))
}

function parseArgs () {
  const argv = minimist(process.argv.slice(2), {
    string: ['src', 'out', 'cwd', 'lang'],
    boolean: ['clean', 'strict'],
    default: { cwd: process.cwd(), clean: false, strict: false }
  })

  const toArray = v => (v == null ? [] : Array.isArray(v) ? v : [v])

  const srcs = toArray(argv.src)
  const outs = toArray(argv.out)
  const langs = uniq(toArray(argv.lang).filter(Boolean))

  if (srcs.length === 0 || outs.length === 0) {
    fail(
      '[i18n-build] --src and --out are required (can be repeated for multiple mappings).'
    )
  }
  if (outs.length !== 1 && outs.length !== srcs.length) {
    fail(
      '[i18n-build] If multiple --src are provided, either supply a single --out or one --out per --src.'
    )
  }

  const cwd = path.resolve(argv.cwd)
  const pairs = srcs.map((src, i) => ({
    srcRoot: path.resolve(cwd, src),
    outRoot: path.resolve(cwd, outs.length === 1 ? outs[0] : outs[i])
  }))

  return { pairs, langs, cwd, clean: !!argv.clean, strict: !!argv.strict }
}

function listI18nDirs (rootDir) {
  const result = []
  ;(function walk (dir) {
    if (!isDir(dir)) return
    for (const entry of readDir(dir)) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'i18n') {
          result.push(full)
          // keep walking, nested i18n supported
          walk(full)
        } else {
          walk(full)
        }
      }
    }
  })(rootDir)
  return result
}

function cleanOutput (outRoot) {
  if (!fs.existsSync(outRoot)) return
  for (const entry of fs.readdirSync(outRoot)) {
    fs.rmSync(path.join(outRoot, entry), { recursive: true, force: true })
  }
}

function shouldSkipByLang (file, langs) {
  if (!langs.length) return false // no filter
  const base = path.basename(file)
  const name = base.replace(/\.(ts|json)$/i, '')
  return !langs.includes(name)
}

function compileTsToModule (tsFile) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-build-'))
  const outMjs = path.join(
    tmpDir,
    path.basename(tsFile).replace(/\.ts$/i, '.mjs')
  )
  buildSync({
    entryPoints: [tsFile],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: outMjs,
    sourcemap: false
  })
  return outMjs
}

async function processI18nDir (i18nDir, outRoot, langs, strict) {
  const namespace = path.basename(i18nDir)
  const outNsDir = path.join(outRoot, namespace)
  ensureDir(outNsDir)

  for (const entry of readDir(i18nDir)) {
    if (!entry.isFile()) continue
    const file = path.join(i18nDir, entry.name)

    if (!/\.ts$|\.json$/i.test(file)) continue
    if (shouldSkipByLang(file, langs)) continue

    const lang = path.basename(file).replace(/\.(ts|json)$/i, '')
    const outFile = path.join(outNsDir, `${lang}.json`)

    if (file.endsWith('.json')) {
      // pass-through copy
      ensureDir(path.dirname(outFile))
      fs.copyFileSync(file, outFile)
      console.log(
        `[i18n-build] copied ${path.relative(process.cwd(), outFile)}`
      )
      continue
    }

    // TS → ESM → JSON
    let modPath
    try {
      modPath = compileTsToModule(file)
      const mod = await import(pathToFileURL(modPath).href)
      if (!('default' in mod)) {
        if (strict)
          fail(
            `[i18n-build] ${file} has no default export. Use "export default { ... }".`
          )
        console.warn(
          `[i18n-build] warn: ${file} has no default export, skipping.`
        )
        continue
      }
      const json = JSON.stringify(mod.default, null, 2) + '\n'
      ensureDir(path.dirname(outFile))
      fs.writeFileSync(outFile, json)
      console.log(`[i18n-build] wrote ${path.relative(process.cwd(), outFile)}`)
    } catch (e) {
      console.error(`[i18n-build] error: failed to compile ${file}`, e)
      if (strict) process.exit(1)
    } finally {
      if (modPath) {
        try {
          fs.rmSync(path.dirname(modPath), { recursive: true, force: true })
        } catch {}
      }
    }
  }
}

async function main () {
  const { pairs, langs, clean, strict } = parseArgs()

  for (const { srcRoot, outRoot } of pairs) {
    if (!fs.existsSync(srcRoot)) {
      console.warn(`[i18n-build] src not found: ${srcRoot}, skipping.`)
      continue
    }
    if (clean) {
      console.log(`[i18n-build] cleaning ${outRoot}`)
      cleanOutput(outRoot)
    }
    const i18nDirs = listI18nDirs(srcRoot)
    if (!i18nDirs.length) {
      console.log(`[i18n-build] no "i18n" dirs under ${srcRoot}, skipping.`)
      continue
    }
    for (const dir of i18nDirs) {
      await processI18nDir(dir, outRoot, langs, strict)
    }
  }
  console.log('[i18n-build] ✅ done.')
}

main().catch(e => {
  console.error('[i18n-build] unexpected error:', e)
  process.exit(1)
})

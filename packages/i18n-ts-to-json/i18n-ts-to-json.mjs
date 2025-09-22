#!/usr/bin/env node
// i18n-ts-to-json.mjs
// Node >=18, ESM
// 功能：將任意 <src>/**/i18n/** 下的 .ts/.json 轉成 <out>/<namespace>/<lang>.json
// - 集中式：.../i18n/<namespace>/<lang>.ts|json  → ns = 子資料夾名稱
// - 分散式：.../<namespace>/i18n/<lang>.ts|json  → ns = i18n 的父資料夾
// 參數： --src=... [--src=...] --out=... [--out=...] --watch --clean --strict --lang=en --lang=zh-Hant [--cwd=...]

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { pathToFileURL } from 'node:url'
import minimist from 'minimist'
import chokidar from 'chokidar'
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
function isLangFile (file) {
  return /\.(ts|json)$/i.test(file)
}

function parseArgs () {
  const argv = minimist(process.argv.slice(2), {
    string: ['src', 'out', 'cwd', 'lang'],
    boolean: ['clean', 'strict', 'watch'],
    default: { cwd: process.cwd(), clean: false, strict: false, watch: false }
  })
  const toArr = v => (v == null ? [] : Array.isArray(v) ? v : [v])

  const srcs = toArr(argv.src)
  const outs = toArr(argv.out)
  const langs = uniq(toArr(argv.lang).filter(Boolean))

  if (!srcs.length || !outs.length)
    fail('[i18n-ts-to-json] --src and --out are required (can repeat).')
  if (outs.length !== 1 && outs.length !== srcs.length) {
    fail(
      '[i18n-ts-to-json] Provide one --out for all --src, or one --out per --src.'
    )
  }

  const cwd = path.resolve(argv.cwd)
  const pairs = srcs.map((src, i) => ({
    srcRoot: path.resolve(cwd, src),
    outRoot: path.resolve(cwd, outs.length === 1 ? outs[0] : outs[i])
  }))

  return {
    pairs,
    langs,
    clean: !!argv.clean,
    strict: !!argv.strict,
    watch: !!argv.watch
  }
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
          // 支援巢狀 i18n
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

function hasLangFiles (dir) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .some(e => e.isFile() && isLangFile(e.name))
  } catch {
    return false
  }
}

function listLangFiles (dir, langsFilter) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries
    .filter(e => e.isFile() && isLangFile(e.name))
    .map(e => path.join(dir, e.name))
    .filter(f => {
      if (!langsFilter || !langsFilter.length) return true
      const lang = path.basename(f).replace(/\.(ts|json)$/i, '')
      return langsFilter.includes(lang)
    })
}

// --- 集/散通用：將單一來源檔轉出為 JSON ---
async function convertOne (srcFile, outFile, strict) {
  if (srcFile.endsWith('.json')) {
    ensureDir(path.dirname(outFile))
    fs.copyFileSync(srcFile, outFile)
    console.log(
      `[i18n-ts-to-json] copied  ${path.relative(process.cwd(), outFile)}`
    )
    return
  }

  let modPath
  try {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-ts-to-json-'))
    modPath = path.join(
      tmpDir,
      path.basename(srcFile).replace(/\.ts$/i, '.mjs')
    )
    buildSync({
      entryPoints: [srcFile],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile: modPath,
      sourcemap: false
    })
    const mod = await import(pathToFileURL(modPath).href)
    if (!('default' in mod)) {
      if (strict)
        fail(
          `[i18n-ts-to-json] ${srcFile} has no default export. Use "export default { ... }".`
        )
      console.warn(
        `[i18n-ts-to-json] warn: ${srcFile} has no default export, skipping.`
      )
      return
    }
    const json = JSON.stringify(mod.default, null, 2) + '\n'
    ensureDir(path.dirname(outFile))
    fs.writeFileSync(outFile, json)
    console.log(
      `[i18n-ts-to-json] wrote   ${path.relative(process.cwd(), outFile)}`
    )
  } catch (e) {
    console.error(`[i18n-ts-to-json] error: failed to compile ${srcFile}`, e)
    if (strict) process.exit(1)
  } finally {
    if (modPath) {
      try {
        fs.rmSync(path.dirname(modPath), { recursive: true, force: true })
      } catch {}
    }
  }
}

// --- 集/散判斷並處理整個 i18n 資料夾 ---
async function processI18nDir (i18nDir, outRoot, langs, strict) {
  // 分散式：i18n 夾本身就有語言檔 -> ns = 父資料夾名
  if (hasLangFiles(i18nDir)) {
    const namespace = path.basename(path.dirname(i18nDir))
    const outNsDir = path.join(outRoot, namespace)
    ensureDir(outNsDir)

    const files = listLangFiles(i18nDir, langs)
    for (const file of files) {
      const lang = path.basename(file).replace(/\.(ts|json)$/i, '')
      const outFile = path.join(outNsDir, `${lang}.json`)
      await convertOne(file, outFile, strict)
    }
    return
  }

  // 集中式：i18n/<namespace>/<lang>...
  const subdirs = fs
    .readdirSync(i18nDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => path.join(i18nDir, e.name))

  for (const nsDir of subdirs) {
    if (!hasLangFiles(nsDir)) continue
    const namespace = path.basename(nsDir)
    const outNsDir = path.join(outRoot, namespace)
    ensureDir(outNsDir)

    const files = listLangFiles(nsDir, langs)
    for (const file of files) {
      const lang = path.basename(file).replace(/\.(ts|json)$/i, '')
      const outFile = path.join(outNsDir, `${lang}.json`)
      await convertOne(file, outFile, strict)
    }
  }
}

// --- 找最近的 i18n 夾（用於增量） ---
function findNearestI18nDir (filePath) {
  let cur = path.dirname(filePath)
  while (cur && cur !== path.dirname(cur)) {
    if (path.basename(cur) === 'i18n') return cur
    cur = path.dirname(cur)
  }
  return null
}

// --- 由檔案路徑推導 out 檔（用於 unlink 單檔時刪除對應輸出） ---
function computeOutFileForSource (srcFile, outRoot) {
  // 若 src = .../<namespace>/i18n/<lang>.(ts|json)（分散式）
  const i18nDir = findNearestI18nDir(srcFile)
  if (!i18nDir) return null
  const lang = path.basename(srcFile).replace(/\.(ts|json)$/i, '')
  // 分散式判斷：i18n 夾本身就有語言檔
  if (hasLangFiles(i18nDir)) {
    const namespace = path.basename(path.dirname(i18nDir))
    return path.join(outRoot, namespace, `${lang}.json`)
  }
  // 集中式：.../i18n/<namespace>/<lang>.(ts|json)
  const nsDir = path.dirname(srcFile) // 指到 <namespace>
  const namespace = path.basename(nsDir)
  return path.join(outRoot, namespace, `${lang}.json`)
}

// --- 全量一次 ---
async function buildOnce (pairs, langs, clean, strict) {
  for (const { srcRoot, outRoot } of pairs) {
    if (!fs.existsSync(srcRoot)) {
      console.warn(`[i18n-ts-to-json] src not found: ${srcRoot}, skipping.`)
      continue
    }
    if (clean) {
      console.log(`[i18n-ts-to-json] cleaning ${outRoot}`)
      cleanOutput(outRoot)
    }
    const i18nDirs = listI18nDirs(srcRoot)
    if (!i18nDirs.length) {
      console.log(
        `[i18n-ts-to-json] no "i18n" dirs under ${srcRoot}, skipping.`
      )
      continue
    }
    for (const dir of i18nDirs) {
      await processI18nDir(dir, outRoot, langs, strict)
    }
  }
}

// --- Watch：檔案/資料夾事件 + 單檔防抖 + 全域 switchLatest 批次 ---
function createWatcher (pairs, langs, strict) {
  // srcRoot -> outRoot
  const map = new Map()
  for (const p of pairs) map.set(p.srcRoot, p.outRoot)

  const watchers = []
  const dirtyDirs = new Set()
  let debounceTimer = null
  let building = false
  let queued = false
  const DEBOUNCE_MS = 300

  const schedule = () => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(runBatch, DEBOUNCE_MS)
  }

  const runBatch = async () => {
    if (building) {
      queued = true
      return
    }
    building = true
    try {
      const dirs = Array.from(dirtyDirs)
      dirtyDirs.clear()

      // 依 srcRoot 分組（不同 outRoot）
      const bySrc = new Map()
      for (const dir of dirs) {
        const srcRoot = [...map.keys()].find(sr => dir.startsWith(sr))
        if (!srcRoot) continue
        if (!bySrc.has(srcRoot)) bySrc.set(srcRoot, [])
        bySrc.get(srcRoot).push(dir)
      }

      for (const [srcRoot, group] of bySrc.entries()) {
        const outRoot = map.get(srcRoot)
        for (const i18nDir of group) {
          console.log(`[i18n-ts-to-json] rebuild (incremental): ${i18nDir}`)
          await processI18nDir(i18nDir, outRoot, langs, strict)
        }
      }
      console.log('[i18n-ts-to-json] ✅ incremental build done.')
    } catch (e) {
      console.error('[i18n-ts-to-json] incremental build failed:', e)
    } finally {
      building = false
      if (queued) {
        queued = false
        runBatch()
      }
    }
  }

  const onFsEvent = fileOrDirPath => {
    const i18nDir = findNearestI18nDir(fileOrDirPath)
    if (!i18nDir) return
    dirtyDirs.add(i18nDir)
    schedule()
  }

  const onUnlinkFile = filePath => {
    // 刪除對應輸出
    const srcRoot = [...map.keys()].find(sr => filePath.startsWith(sr))
    if (!srcRoot) return
    const outRoot = map.get(srcRoot)
    const outFile = computeOutFileForSource(filePath, outRoot)
    if (outFile && fs.existsSync(outFile)) {
      fs.rmSync(outFile, { force: true })
      console.log(
        `[i18n-ts-to-json] removed ${path.relative(process.cwd(), outFile)}`
      )
    }
    // 仍標記目錄（例如集中式下語言被刪改名）
    onFsEvent(filePath)
  }

  for (const { srcRoot, outRoot } of pairs) {
    const pattern = path.join(srcRoot, '**', 'i18n', '**', '*.{ts,json}')
    const watcher = chokidar.watch(pattern, {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 50 }, // 單檔防抖
      ignored: p => p.startsWith(outRoot) // 忽略輸出，避免自觸發
    })

    watcher
      .on('add', onFsEvent)
      .on('change', onFsEvent)
      .on('unlink', onUnlinkFile)
      .on('addDir', onFsEvent)
      .on('unlinkDir', onFsEvent)
      .on('error', err =>
        console.error('[i18n-ts-to-json] watcher error:', err)
      )

    watchers.push(watcher)
  }

  console.log(
    '[i18n-ts-to-json] watching changes in source i18n (outputs ignored)…'
  )
  return watchers
}

// --- 主流程 ---
async function main () {
  const { pairs, langs, clean, strict, watch } = parseArgs()

  await buildOnce(pairs, langs, clean, strict)
  if (!watch) {
    console.log('[i18n-ts-to-json] ✅ done.')
    return
  }
  createWatcher(pairs, langs, strict)
}

main().catch(e => {
  console.error('[i18n-ts-to-json] unexpected error:', e)
  process.exit(1)
})

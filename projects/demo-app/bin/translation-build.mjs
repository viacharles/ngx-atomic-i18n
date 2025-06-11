console.log('>>> Running UPDATED translation-build.mjs');

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import esbuild from 'esbuild';

const args = process.argv.slice(2);
const srcArg = args.find(arg => arg.startsWith('--src='));
const outArg = args.find(arg => arg.startsWith('--out='));

const angularJsonPath = path.resolve('angular.json');
let defaultSrc = 'src';
let defaultOut = path.join('src', 'assets', 'i18n');


if (fs.existsSync(angularJsonPath)) {
  try {
    const angularConfig = JSON.parse(fs.readFileSync(angularJsonPath, 'utf-8'));
    const projects = angularConfig.projects || {};
    const projectNames = Object.keys(projects);

    // 如果明確有 projects 資料夾，才使用多專案路徑
    const isWorkspace = projectNames.some(p => fs.existsSync(path.join('projects', p)));

    if (projectNames.length === 1 && isWorkspace) {
      const single = projectNames[0];
      defaultSrc = path.join('projects', single, 'src');
      defaultOut = path.join('projects', single, 'src', 'assets', 'i18n');
    }
  } catch (e) {
    console.warn('[i18n] Warning: Failed to parse angular.json:', e);
  }
}

const sourceRoot = srcArg ? srcArg.split('=')[1] : defaultSrc;
const outputRoot = outArg ? outArg.split('=')[1] : defaultOut;

console.log('[i18n] Cleaning only i18n dirs under:', outputRoot);
console.log('[i18n] Source:', sourceRoot);
console.log('[i18n] Output:', outputRoot);

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      walk(filepath, filelist);
    } else {
      filelist.push(filepath);
    }
  }
  return filelist;
}

function cleanOutputDirs(outputRoot) {
  if (!fs.existsSync(outputRoot)) return;
  const entries = fs.readdirSync(outputRoot);
  for (const entry of entries) {
    const fullPath = path.join(outputRoot, entry);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
}

function compileTsFile(inputPath, outputPath) {
  esbuild.buildSync({
    entryPoints: [inputPath],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: outputPath,
  });
}

async function compileDir(i18nDir, outputRoot, sourceRoot) {
  console.log('[i18n] Compiling dir:', i18nDir);
  const files = fs.readdirSync(i18nDir);
  for (const file of files) {
    const filePath = path.join(i18nDir, file);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const lang = path.basename(file, path.extname(file));
    const namespace = path.basename(path.dirname(i18nDir));
    const outDir = path.join(outputRoot, namespace);
    const outFile = path.join(outDir, `${lang}.json`);

    fs.mkdirSync(outDir, { recursive: true });

    if (file.endsWith('.ts')) {
      const tempOutJs = filePath.replace(/\.ts$/, '.mjs');
      compileTsFile(filePath, tempOutJs);
      try {
        const mod = await import(pathToFileURL(tempOutJs).href);
        const jsonContent = JSON.stringify(mod.default, null, 2);
        fs.writeFileSync(outFile, jsonContent);
        fs.unlinkSync(tempOutJs);
        console.log(`✓ Compiled ${filePath} -> ${outFile}`);
      } catch (err) {
        console.error(`[i18n] Failed to import ${filePath}:`, err);
      }
    } else if (file.endsWith('.json')) {
      fs.copyFileSync(filePath, outFile);
      console.log(`✓ Copied ${filePath} -> ${outFile}`);
    }
  }
}

function findI18nDirs(rootDir) {
  const result = [];

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (!entry.isDirectory()) continue;

      if (entry.name === 'i18n') {
        // 檢查這個 i18n 資料夾底下是否含有 ts/json 檔
        const files = fs.readdirSync(fullPath);
        const hasTranslationFiles = files.some(f => f.endsWith('.ts') || f.endsWith('.json'));

        if (hasTranslationFiles) {
          result.push(fullPath);
        } else {
          // 否則還是要繼續往下找（因為可能有 nested i18n）
          walk(fullPath);
        }
      } else {
        walk(fullPath);
      }
    }
  }

  walk(rootDir);
  return result;
}

(async function main() {
  cleanOutputDirs(outputRoot);
  const i18nDirs = findI18nDirs(sourceRoot);
  console.log('[i18n] Found i18n directories:', i18nDirs);
  for (const dir of i18nDirs) {
    await compileDir(dir, outputRoot, sourceRoot);
  }
  console.log('[i18n] ✅ All translations compiled.');
})();

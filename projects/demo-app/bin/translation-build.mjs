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
  if (fs.existsSync(outputRoot)) {
    console.log(`[i18n] Cleaning output directory: ${outputRoot}`);
    fs.rmSync(outputRoot, { recursive: true, force: true });
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

// This new function will recursively search for i18n directories and process them.
async function processTranslations(dir, outputRoot) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules and the output assets directory to avoid infinite loops
    if (entry.isDirectory() && (entry.name === 'node_modules' || fullPath === outputRoot || entry.name === 'assets')) {
      continue;
    }

    // If we find an i18n directory, process its namespaces
    if (entry.isDirectory() && entry.name === 'i18n') {
      console.log(`[i18n] Found i18n source directory: ${fullPath}`);
      const namespaces = fs.readdirSync(fullPath, { withFileTypes: true })
        .filter(ns => ns.isDirectory())
        .map(ns => ns.name);

      for (const namespace of namespaces) {
        const namespaceDir = path.join(fullPath, namespace);
        const langFiles = fs.readdirSync(namespaceDir).filter(f => f.endsWith('.ts') || f.endsWith('.json'));

        for (const langFile of langFiles) {
          const langFilePath = path.join(namespaceDir, langFile);
          if (!fs.statSync(langFilePath).isFile()) continue;

          const lang = path.basename(langFile, path.extname(langFile));
          const outDir = path.join(outputRoot, namespace);
          const outFile = path.join(outDir, `${lang}.json`);
          fs.mkdirSync(outDir, { recursive: true });

          if (langFile.endsWith('.ts')) {
            const tempOutJs = langFilePath.replace(/\.ts$/, '.mjs');
            compileTsFile(langFilePath, tempOutJs);
            try {
              const mod = await import(pathToFileURL(tempOutJs).href);
              fs.writeFileSync(outFile, JSON.stringify(mod.default, null, 2));
              fs.unlinkSync(tempOutJs);
              console.log(`✓ Compiled ${langFilePath} -> ${outFile}`);
            } catch (err) {
              console.error(`[i18n] Failed to import ${langFilePath}:`, err);
            }
          } else if (langFile.endsWith('.json')) {
            fs.copyFileSync(langFilePath, outFile);
            console.log(`✓ Copied ${langFilePath} -> ${outFile}`);
          }
        }
      }
      // Once an i18n dir is processed, we don't need to look for nested i18n dirs inside it.
      continue;
    }

    if (entry.isDirectory()) {
      await processTranslations(fullPath, outputRoot);
    }
  }
}

(async function main() {
  cleanOutputDirs(outputRoot);
  console.log(`[i18n] Starting translation scan from: ${sourceRoot}`);
  await processTranslations(sourceRoot, outputRoot);
  console.log('[i18n] ✅ All translations compiled.');
})();

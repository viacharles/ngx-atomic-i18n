#!/usr/bin/env node
// i18n-init.mjs

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

console.log('[i18n:init] Running translation-init.mjs');

function failAndExit(msg) {
  console.error(msg);
  process.exit(1);
}

function loadJson(filePath, errMsg) {
  if (!fs.existsSync(filePath)) failAndExit(errMsg);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeIfNotExist(filePath, content) {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, content);
}

function patchPackageJsonScripts(pkgJson, mode, projects) {
  for (const [name, config] of projects) {
    const isSingle = name === Object.keys(projects)[0] && config.root === '';
    const prebuildKey = `i18n-init${isSingle ? '' : `:${name}`}`;
    const startKey = `start${isSingle ? '' : `:${name}`}`;

    const src = isSingle ? 'src' : `projects/${name}/src`;
    const out = isSingle ? 'src/assets/i18n' : `projects/${name}/src/assets/i18n`;
    const scriptPath = isSingle ? `node ./bin/translation-build.mjs` : `node projects/${name}/bin/translation-build.mjs`;

    if (mode === 'ts-to-json') {
      pkgJson.scripts[prebuildKey] = `${scriptPath} --src=${src} --out=${out}`;
      pkgJson.scripts[startKey] = `npm run ${prebuildKey} && ng serve${isSingle ? '' : ` ${name}`}`;
    } else {
      // Classic mode: just serve; no prebuild needed
      pkgJson.scripts[prebuildKey] = 'echo "No build step needed for JSON-only mode."';
      pkgJson.scripts[startKey] = `ng serve${isSingle ? '' : ` ${name}`}`;
    }
  }
}

async function main() {
  const angularJsonPath = path.resolve('angular.json');
  const angularConfig = loadJson(angularJsonPath, '[i18n:init] angular.json not found.');
  const projects = angularConfig.projects || {};
  const appProjects = Object.entries(projects).filter(([_, config]) => config.projectType === 'application');

  const pkgPath = path.resolve('package.json');
  const pkgJson = loadJson(pkgPath, '[i18n:init] package.json not found.');
  pkgJson.scripts = pkgJson.scripts || {};

  // Prompt for translation resource mode
  const { i18nMode } = await inquirer.prompt([{
    type: 'list',
    name: 'i18nMode',
    message: 'How do you want to manage your translation resources?',
    choices: [
      {
        name: 'Classic: Place JSON files in src/assets/i18n (compatible with ngx-translate/i18next)',
        value: 'json-only'
      },
      {
        name: 'Advanced: Author translation resources in TypeScript and auto-convert to JSON before build (recommended for type-safety, large projects, or advanced workflows)',
        value: 'ts-to-json'
      }
    ],
    default: 'json-only'
  }]);

  // Patch package.json scripts
  patchPackageJsonScripts(pkgJson, i18nMode, appProjects);
  writeJson(pkgPath, pkgJson);

  // Create sample translation files/folders
  if (i18nMode === 'json-only') {
    // Ensure default JSON files exist
    const assetsDir = path.resolve('src/assets/i18n');
    ensureDir(assetsDir);
    writeIfNotExist(path.join(assetsDir, 'en.json'), `{\n  "hello": "Hello, world!"\n}`);
    writeIfNotExist(path.join(assetsDir, 'zh-Hant.json'), `{\n  "hello": "你好，世界！"\n}`);
    console.log('[i18n:init] ✅ Sample JSON translation files created at src/assets/i18n/');
  } else if (i18nMode === 'ts-to-json') {
    // Ensure TypeScript resource folder and stub
    const i18nSrcDir = path.resolve('src/i18n/en');
    ensureDir(i18nSrcDir);
    writeIfNotExist(
      path.join(i18nSrcDir, 'index.ts'),
      `// Example translation resource (TypeScript)
export default {
  hello: "Hello, world!"
} as const;
`
    );
    // Also ensure translation-build.mjs stub
    const buildScriptPath = path.resolve('bin/translation-build.mjs');
    if (!fs.existsSync(buildScriptPath)) {
      ensureDir(path.dirname(buildScriptPath));
      writeIfNotExist(buildScriptPath,
`// translation-build.mjs
// This script should convert src/i18n/en/index.ts to src/assets/i18n/en.json, etc.
// [You must implement the actual TS→JSON logic or plug in your own tooling.]
console.log('[translation-build] You must implement the TS-to-JSON conversion logic!');
process.exit(1);
`);
    }
    console.log('[i18n:init] ✅ Sample TypeScript translation file created at src/i18n/en/index.ts');
    console.log('[i18n:init] ⚠️  translation-build.mjs stub created at bin/translation-build.mjs. Implement your own TS→JSON logic!');
  }

  console.log('[i18n:init] ✅ package.json updated with i18n scripts.');
  console.log('[i18n:init] 🚀 i18n initialization complete!');
}

main();

import fs from 'fs';
import path from 'path';

console.log('[i18n:init] Running translation-init.mjs');

const angularJsonPath = path.resolve('angular.json');
if (!fs.existsSync(angularJsonPath)) {
  console.error('[i18n:init] angular.json not found.');
  process.exit(1);
}

const angularConfig = JSON.parse(fs.readFileSync(angularJsonPath, 'utf-8'));
const projects = angularConfig.projects || {};
const appProjects = Object.entries(projects).filter(([_, config]) => config.projectType === 'application');

const pkgPath = path.resolve('package.json');
if (!fs.existsSync(pkgPath)) {
  console.error('[i18n:init] package.json not found.');
  process.exit(1);
}

const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
pkgJson.scripts = pkgJson.scripts || {};

for (const [name, config] of appProjects) {
  const isSingle = name === Object.keys(projects)[0] && config.root === '';
  const prebuildKey = `prebuild${isSingle ? '' : `:${name}`}`;
  const startKey = `start${isSingle ? '' : `:${name}`}`;

  const src = isSingle ? 'src' : `projects/${name}/src`;
  const out = isSingle ? 'src/assets/i18n' : `projects/${name}/src/assets/i18n`;
  const scriptPath = isSingle ? `node ./bin/translation-build.mjs` : `node projects/${name}/bin/translation-build.mjs`;

  pkgJson.scripts[prebuildKey] = `${scriptPath} --src=${src} --out=${out}`;
  pkgJson.scripts[startKey] = `npm run ${prebuildKey} && ng serve${isSingle ? '' : ` ${name}`}`;
}

fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2));
console.log('[i18n:init] ✅ package.json updated with prebuild/start scripts.');

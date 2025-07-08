import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { execSync } from 'child_process';

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

function patchPackageJsonScripts(pkgJson, projects) {
  for (const [name, config] of projects) {
    const isSingle = name === Object.keys(projects)[0] && config.root === '';
    const prebuildKey = `i18n-init${isSingle ? '' : `:${name}`}`;
    const startKey = `start${isSingle ? '' : `:${name}`}`;

    const src = isSingle ? 'src' : `projects/${name}/src`;
    const out = isSingle ? 'src/assets/i18n' : `projects/${name}/src/assets/i18n`;
    const scriptPath = isSingle ? `node ./bin/translation-build.mjs` : `node projects/${name}/bin/translation-build.mjs`;

    pkgJson.scripts[prebuildKey] = `${scriptPath} --src=${src} --out=${out}`;
    pkgJson.scripts[startKey] = `npm run ${prebuildKey} && ng serve${isSingle ? '' : ` ${name}`}`;
  }
}

function patchUserConfigTs(parserType) {
  const userConfigPath = path.resolve('src/lib/user-config.ts');
  let userConfigContent = '';
  if (fs.existsSync(userConfigPath)) {
    userConfigContent = fs.readFileSync(userConfigPath, 'utf-8');
    // patch parserType 行
    if (userConfigContent.match(/parserType:/)) {
      userConfigContent = userConfigContent.replace(/parserType:\s*['"`][^'"`]+['"`]/, `parserType: '${parserType}'`);
    } else {
      userConfigContent = userConfigContent.replace(
        /(export\s+const\s+userTranslationConfig\s*:\s*Partial<TranslationConfig>\s*=\s*{)/,
        `$1\n  parserType: '${parserType}',`
      );
    }
  } else {
    userConfigContent =
      `import type { TranslationConfig } from './translate.type';

export const userTranslationConfig: Partial<TranslationConfig> = {
  parserType: '${parserType}',
};
`;
  }
  fs.writeFileSync(userConfigPath, userConfigContent);
  console.log(`[i18n:init] ✅ parserType set to '${parserType}' in src/lib/user-config.ts`);
}

async function main() {
  const angularJsonPath = path.resolve('angular.json');
  const angularConfig = loadJson(angularJsonPath, '[i18n:init] angular.json not found.');

  const projects = angularConfig.projects || {};
  const appProjects = Object.entries(projects).filter(([_, config]) => config.projectType === 'application');

  const pkgPath = path.resolve('package.json');
  const pkgJson = loadJson(pkgPath, '[i18n:init] package.json not found.');
  pkgJson.scripts = pkgJson.scripts || {};

  patchPackageJsonScripts(pkgJson, appProjects);
  writeJson(pkgPath, pkgJson);

  const { parserType } = await inquirer.prompt([{
    type: 'list',
    name: 'parserType',
    message: 'Which translation parser do you want to use?',
    choices: [
      { name: 'Lite (built-in, fastest)', value: 'lite' },
      { name: 'Full (ICU support, requires intl-messageformat)', value: 'intl' }
    ],
    default: 'lite'
  }]);

  if (parserType === 'intl') {
    try {
      execSync('npm install intl-messageformat', { stdio: 'inherit' });
      console.log('[i18n:init] ✅ intl-messageformat installed.');
    } catch (err) {
      failAndExit('[i18n:init] ❌ Failed to install intl-messageformat: ' + err);
    }
  }

  patchUserConfigTs(parserType);

  console.log('[i18n:init] ✅ package.json updated with prebuild/start scripts.');
}

main();
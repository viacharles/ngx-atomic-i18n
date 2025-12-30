# emit-i18n-json-assets

A Node.js CLI (Node >= 18, ESM) that scans your project for `i18n` folders and converts translation sources (`.ts` / `.json`) into **JSON assets** with this output structure: <out>/<namespace>/<lang>.json

It supports both common layouts:

- **Centralized**: `.../i18n/<namespace>/<lang>.ts|json`
- **Decentralized**: `.../<namespace>/i18n/<lang>.ts|json`

> Note: The tool logs use the prefix `[i18n-build]` (legacy label). The command name is `emit-i18n-json-assets`.

---

## Install

### As a dev dependency (recommended)

```bash
npm i -D emit-i18n-json-assets

Then run via:
npx emit-i18n-json-assets --src=src --out=src/assets/i18n
or in package.json scripts:

{
  "scripts": {
    "i18n:build": "emit-i18n-json-assets --src=src --out=src/assets/i18n",
    "i18n:watch": "emit-i18n-json-assets --src=src --out=src/assets/i18n --watch"
  }
}

Quick Start
Convert all translation sources under src/**/i18n/** into JSON assets:
emit-i18n-json-assets --src=src --out=src/assets/i18n

Only output certain languages:
emit-i18n-json-assets --src=src --out=src/assets/i18n --lang=en --lang=zh-Hant

Clean output folder first:
emit-i18n-json-assets --src=src --out=src/assets/i18n --clean

Watch mode (incremental rebuild):
emit-i18n-json-assets --src=src --out=src/assets/i18n --watch

CLI Options

Required

--src=<path>
Source root to scan. Can be repeated.
--out=<path>
Output root. Provide one --out for all --src, or provide one per --src.

Optional

--cwd=<path>
Working directory used to resolve --src / --out (default: current process cwd).
--lang=<lang>
Filter languages. Can be repeated.

Example: --lang=en --lang=zh-Hant
If omitted, all detected language files are processed.

--clean
Remove existing content in --out before building.
--watch
Watch filesystem changes and rebuild incrementally.
--strict
Exit with error on failures (e.g. TS file without default export, compile errors).

Supported Source Layouts

1) Centralized layout
src/
  i18n/
    auth/
      en.ts
      zh-Hant.ts
    common/
      en.json
      zh-Hant.json

namespace = auth, common
lang = file name without extension (en, zh-Hant)
Output:
<out>/auth/en.json
<out>/auth/zh-Hant.json
<out>/common/en.json
<out>/common/zh-Hant.json

2) Decentralized layout
src/
  auth/
    i18n/
      en.ts
      zh-Hant.ts
  common/
    i18n/
      en.json
      zh-Hant.json

namespace = folder name that contains the i18n folder (auth, common)
lang = file name without extension
Output is the same:

<out>/auth/en.json
<out>/auth/zh-Hant.json
<out>/common/en.json
<out>/common/zh-Hant.json

TS translation file format
For .ts files, the tool bundles them with esbuild and imports the output module.
Your TS translation file must export a default object:

export default {
  hello: "Hello",
  bye: "Bye"
};

If a TS file has no default export:
--strict => the CLI exits with an error
otherwise => it prints a warning and skips that file
For .json files, it will be copied as-is.
Multiple src / out examples
One --out for multiple --src:
emit-i18n-json-assets \
  --src=projects/app-a/src \
  --src=projects/app-b/src \
  --out=dist/browser/assets/i18n

One --out per --src:
emit-i18n-json-assets \
  --src=projects/app-a/src --out=projects/app-a/src/assets/i18n \
  --src=projects/app-b/src --out=projects/app-b/src/assets/i18n
Watch Mode Notes
The watcher listens to:
**/i18n/**/*.{ts,json}
Output paths are ignored to prevent self-trigger loops.
Incremental builds debounce changes and batch rebuild per affected i18n directory.
Gotchas (read this before you blame the universe)
Because TS files are bundled with esbuild, keep translation sources simple:
Prefer plain objects (no environment-dependent runtime)
Avoid imports that rely on tsconfig path aliases unless you’re sure esbuild can resolve them in your setup
On compile failure:
--strict => exit non-zero
otherwise => warn and continue

License MIT
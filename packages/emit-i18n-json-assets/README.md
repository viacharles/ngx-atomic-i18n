# emit-i18n-json-assets

> CLI to generate JSON i18n assets from your Angular source code.

![logo](https://raw.githubusercontent.com/viacharles/ngx-atomic-i18n/master/docs/images/favicon-16x16.png) Demo & Tutorial: [https://i18n-demo.viacharles.net/](https://i18n-demo.viacharles.net/)

## What it does

`emit-i18n-json-assets` scans your project source and emits JSON translation files
into an assets folder, ready for runtime loading.

## Install

```bash
npm i -D emit-i18n-json-assets
```

## Usage

```bash
emit-i18n-json-assets --src=projects/your-app/src/app --out=projects/your-app/src/assets/i18n
```

## Options

- `--src` (required) Source root to scan (usually `src/app`)
- `--out` (required) Output directory for generated JSON files

## Example script

```json
{
  "scripts": {
    "i18n:emit": "emit-i18n-json-assets --src=projects/ngx-i18n-demo/src/app --out=projects/ngx-i18n-demo/src/assets/i18n"
  }
}
```

## Notes

- Run this before `ng build` so the assets are available for CSR/SSR/SSG.
- The output structure mirrors your i18n namespaces in code.

<!-- Optional: logo (use absolute URL if you want it to show on npm) -->
[![ngx-atomic-i18n screenshot](https://raw.githubusercontent.com/viacharles/ngx-atomic-i18n/master/docs/images/index-screen.png)](https://i18n-demo.viacharles.net/)

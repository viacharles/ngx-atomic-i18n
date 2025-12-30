import zh_Hant from "./zh-Hant";

const en: typeof zh_Hant = {
  intro: {
    title: "Introduction",
    des:
      'A tool built to manage translation resources with TypeScript.\n' +
      'It searches the entire project for folders named "i18n", then converts all <namespace>/i18n/<lang>.ts files into JSON and saves them under the corresponding assets path: assets/i18n/<namespace>/<lang>.json.',
    advantage: {
      title: "Advantages",
      des:
        "1. Type-safe: if a key is missing, TypeScript will tell you which key is missing. Anyone who has used this knows how helpful it is!\n" +
        "2. During development, translation resources live inside the namespace (feature) folder, which fits the standalone and microservice-style concept and is easy to manage."
    },
    weakpoint: {
      title: "Drawbacks",
      "des-1":
        "1. It doesn't manage translations directly as JSON. So if you only modify the TS files, the translation UI won't reflect changes immediately—you must run this CLI command to regenerate the JSON.\n",
      "des-2":
        "2. You can only use the package's default paths.\n" +
        "The TS translation resource path is restricted to i18n/<lang>.ts inside each feature (namespace) folder.\n" +
        "The JSON translation resources are restricted to assets/i18n/<namespace>/<lang>.json.",
      example: `<project-root>
└─ projects/
    └─ project-A/
        └─ src/
            ├─ app/
            │   └─ features/
            │        └─ feature-A/
            │            └─ i18n/
            │                ├─ en.ts
            │                └─ zh-Hant.ts
            │
            └─ assets/
                └─ i18n/
                    └─ feature-A/
                        ├─ en.json
                        └─ zh-Hant.json

Mapping:
- i18n/<lang>.ts → assets/i18n/<namespace>/<lang>.json
- namespace = feature-A`
    }
  },
  "路徑範例": "Path Example",
  setup: {
    title: "Installation",
    example: `// Install command
npm install -D emit-i18n-json-assets

// Example in package.json > scripts
"scripts": {
  "emit-i18n-json-assets": "emit-i18n-json-assets --src=projects/project-A/src/app --out=projects/project-A/src/assets/i18n"
}`
  },
  parameters: {
    title: "Parameter Description",
    src: {
      title: "--src",
      des: "Specifies the source path of the TypeScript translation resources."
    },
    out: {
      title: "--out",
      des: "Specifies the output path for the JSON translation resources."
    }
  }
}

export default en;

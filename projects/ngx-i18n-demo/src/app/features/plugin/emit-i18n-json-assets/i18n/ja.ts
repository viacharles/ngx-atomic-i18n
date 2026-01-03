import en from "./en";

const ja: typeof en = {
  intro: {
    title: '紹介',
    des:
      'TypeScript で翻訳リソースを管理するためのツールです。\n' +
      'プロジェクト内の "i18n" フォルダを検索し、<namespace>/i18n/<lang>.ts を JSON に変換して assets/i18n/<namespace>/<lang>.json に保存します。',
    advantage: {
      title: 'メリット',
      des:
        '1. 型安全：キーが欠けていれば TypeScript が教えてくれます。使った人なら便利さが分かります！\n' +
        '2. 開発中は翻訳リソースが namespace（feature）配下に置かれるため、standalone やマイクロサービス的な構成に合っていて管理しやすいです。'
    },
    weakpoint: {
      title: 'デメリット',
      'des-1':
        '1. JSON を直接管理しないため、TS だけを変更すると画面に即反映されません。JSON を再生成するためにこの CLI を実行する必要があります。\n',
      'des-2':
        '2. パッケージの既定パスしか使えません。\n' +
        'TS の翻訳リソースは各 feature（namespace）フォルダ内の i18n/<lang>.ts に限定されます。\n' +
        'JSON の翻訳リソースは assets/i18n/<namespace>/<lang>.json に限定されます。',
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

対応関係:
- i18n/<lang>.ts → assets/i18n/<namespace>/<lang>.json
- namespace = feature-A`
    }
  },
  '路徑範例': 'パス例',
  setup: {
    title: 'インストール',
    example: `// インストールコマンド
npm install -D emit-i18n-json-assets

// package.json > scripts の例
"scripts": {
  "emit-i18n-json-assets": "emit-i18n-json-assets --src=projects/project-A/src/app --out=projects/project-A/src/assets/i18n"
}`
  },
  parameters: {
    title: 'パラメータ説明',
    src: {
      title: '--src',
      des: 'TypeScript 翻訳リソースのソースパスを指定します。'
    },
    out: {
      title: '--out',
      des: 'JSON 翻訳リソースの出力パスを指定します。'
    }
  }
};

export default ja;

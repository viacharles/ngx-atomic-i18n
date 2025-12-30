const zh_Hant = {
  intro: {
    title: '介紹',
    des: '想用 ts 來管理翻譯資源而做的工具。\n它會全專案搜尋"i18n"資料夾，將裡面的<namespace>/i18n/<lang>.ts文件都轉成 json 存進 assets 裡對應的路徑 assets/i18n/<namespace>/</lang>.json。',
    advantage: { title: '優點', des: '1. 有型別安全，少 key 的話 ts 自動跟你說少哪個 key，用過的人就知道好用!\n2. 開發時翻譯資源是放在namespace(feature)資料夾裡，符合standalone，微服務概念，方便管理。' },
    weakpoint: {
      title: '缺點',
      "des-1": '1. 不是直接用 json 管理，所以只是修改 ts 的話，翻譯資源畫面無法即時反應變更，要執行此 CLI 指令才能更新 json。\n',
      "des-2": "只能用套件的預設路徑。\nts 翻譯資源儲存路徑限制是每個 feature(namespace) 資料夾裡的 i18n/<lang>.ts。\n json 翻譯資源則是限制在 assets/i18n/<namespace>/<lang>.json。",
      "example": `<project-root>
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
  "路徑範例": "路徑範例",
  setup: {
    title: '安裝',
    example: `// 安裝指令
npm install -D emit-i18n-json-assets

// 在 package.json > script 範例
"scripts": {
  "emit-i18n-json-assets": "emit-i18n-json-assets --src=projects/project-A/src/app --out=projects/project-A/src/assets/i18n"
}`
  },
  parameters: {
    title: '參數說明',
    src: {
      title: '--src',
      des: '指定 ts 翻譯資源的來源路徑'
    },
    out: {
      title: '--out',
      des: '指定 json 翻譯資源的輸出路徑'
    }
  }
}

export default zh_Hant;

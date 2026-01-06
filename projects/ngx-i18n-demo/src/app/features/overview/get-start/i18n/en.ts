import zh_TW from "./zh-Hant";

const en: typeof zh_TW = {
  '介紹': 'Overview',
  ' 最簡單 / 最高效 達成 Lazy load 的 Angular 翻譯套件': ' The simplest and most efficient Angular translation library with lazy loading',
  '需求': 'Requirements',
  '需求-1': 'Angular 16+ (peerDependencies have no third-party dependencies)',
  'des-dialog-需求': '1. Angular 16+ (with new features such as standalone and signals). 2. Does not depend on other third-party packages.',
  'des-dialog-極簡設定': "Configure once at bootstrap with\nprovideTranslationInit({ supportedLangs: ['en', 'zh-Hant'] }),\nthen add provideTranslation('namespace') on your pages/components and you’re ready to go.",
  'des-dialog-頁面作為翻譯根': "Mark a page component with\nprovideTranslation('namespace', true)\nand all child components will automatically fall back to this page’s namespace when their own namespace doesn’t define the key.",
  'des-dialog-lazy-load': "Each namespace is loaded on demand. When a component with\nprovideTranslation('namespace') is rendered for the first time, the library fetches only the required language resources.",
  'des-dialog-效能最佳化': "1. You can use preloadNamespaces() to pre-load translation resources before the initial page render in CSR, preventing delays during the first load.\n2. An internal cache is used to avoid redundant downloading. The same combination of language, namespace, and optional build version ($\text{lang} + \text{namespace} + (\text{buildVersion})$) will only be loaded once and the result shared.\n3. Formatter caching is employed to reduce the repeated execution of ICU message formatting and string lookups.\n4.Build version support (buildVersion) is included to invalidate the cache when a new version is deployed, thereby preventing the use of outdated translations.\n5. use signal.",
  'des-dialog-不閃key': 'Before a namespace finishes loading, the UI renders empty strings instead of raw keys. \nOnce loading completes, it shows the translated text or the configured fallback.',
  '說明': 'Details',
  '優點': 'Benefits',
  '預設 lazy load': 'Lazy load by default',
  '動態切換語系': 'Switch languages dynamically',
  '極簡設定': 'Minimal setup',
  '支援 CSR/SSR/SSG': 'Supports CSR/SSR/SSG',
  '頁面作為翻譯根': "Page-level translation root with automatic fallback",
  '體積最小化': 'Minimized bundle size',
  '效能最佳化': 'Optimized performance',
  '不閃 key': 'No key-flashing',
  '開始使用': 'Get started in 10 minutes',
  '安裝': 'Install',
  '請在專案根目錄下 CLI 指令，下載安裝本套件:': 'Run the CLI command at the project root to install:',
  'CLI 安裝指令': 'CLI install command',
  '初始設定': 'Initial setup',
  '選擇專案類型，生成初始設定指引 :': 'Select your project type to generate the setup guide:',
  '網站渲染方式': 'Rendering mode',
  '專案架構': 'Project architecture',
  '應用程式啟動模式': 'Application bootstrap mode',
  'CSR 單專案：使用預設 /assets/i18n 載入路徑。': 'CSR single app: use the default /assets/i18n load path.',
  '在': 'update',
  '上設置': 'to configure',
  '存放翻譯資源': 'Store translation assets',

  getStart: {
    storageNote: 'File Type: json\nStorage Path: assets/i18n,\nGlobal Resource Default Name: common \nStorage Folder Structure Sample is as follows:',
    sourceArchitecture: `src/
└── app/
│   └── feature/
│   │   └── get-start/ get-start.component // Loads translations for 'assets/i18n/get-start' using provideTranslation('get-start')
│   │       └── get-start-child/ get-start-child.component // By enabling enablePageFallback, the translation will fall back to the parent component’s get-start value along the injection tree.(1)
│   └── shared/
│       └── header/ header.component // Loads translations for 'assets/i18n/header' using provideTranslation('header')
└── assets/
    └── i18n/ // Flat storage within the i18n folder
        ├── common/ // Default global keywords (e.g., global common strings)
        │   ├── en.json
        │   └── zh-Hant.json
        ├── header/ // Translations for the 'header' component
        │   ├── en.json
        │   └── zh-Hant.json
        └── get-start/ // Translations for the 'get-start' component
            ├── en.json
            └── zh-Hant.json`,
    config: {
      supportedLangHint: 'Use the language code from each filename (e.g., en.json -> en, zh-Hant.json -> zh-Hant)',
      loader: {
        label: 'Loader settings',
        client: 'Client-side load settings',
        baseUrlMonorepo: 'In a monorepo, start paths from the /projects folder (next to package.json)',
        server: 'Server-side load settings',
        baseDirMonorepo: 'Translation root should be the monorepo root (same level as package.json)',
        assetMonorepo: 'Assets path for monorepo builds',
        baseDirSingle: 'Translation root should be the project root (same level as package.json)',
        assetSingle: 'Assets path for single-project builds',
        clientDefaultPath: 'Client-side uses the default assets/i18n path',
      }
    },
    jsonArchitecture: `// Translation Data
    assets/i18n/get-start/zh-Hant.json
    {
    "title": "Main Title",
    "section1": {
      "title": "Title for Section 1",
      "subTitle": "Subtitle for Section 1"
    },
    "footer": {
      "title": "Footer Title",
      "subTitle": "Footer Subtitle"
    }
  }

  // HTML Usage Example
  get-start.html
  <h1>{{ 'title' | t }}</h1>
  <h2>{{ 'section1.title' | t }}</h2>
  <h3>{{ 'section1.subTitle' | t }}</h3>

  // ts Usage Example
  get-start.ts
  mainTitle = translateService.t('title');
  `,
    lazyLoad: {
      compComp: `// The standalone component provides its namespace directly
@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  providers: [
    provideTranslation('header'),  // The name must match the folder name.
  ],
})
export class HeaderComponent { }`,
      moduleComp: `// Traditional NgModule component using @Component.providers
@Component({
  selector: 'app-get-start',
  templateUrl: './get-start.component.html',
  providers: [
    provideTranslation('get-start'),  // The name must match the folder name.
  ],
})
export class GetStartComponent { }`,
      moduleModule: `// Provide the namespace at module level to share across components
@NgModule({
  declarations: [GetStartComponent],
  providers: [
    provideTranslation('get-start'),  // The name must match the folder name.
  ],
})
export class GetStartModule { }`
    }
  },
  '使用方法': 'Instructions',
  '翻譯資源資料夾範例': 'Sample translation folder',
  '載入翻譯資源': 'Load translation assets',
  '從何處載入翻譯': 'Lazy-load strategy',
  '載入設置範例': 'Loader setup example',
  'CSR (一般選這個)': 'CSR (Generally chosen)',
  SSR: 'SSR',
  SSG: 'SSG',
  '一般獨立專案': 'Standard Standalone Project',
  'Standalone (元件)': 'Standalone (Component)',
  'NgModule (元件)': 'NgModule (Component)',
  'NgModule (模組)': 'NgModule (Module)'
};

export default en;

const zh_TW = {
  '介紹': '介紹',
  ' 最簡單 / 最高效 達成 Lazy load 的 Angular 翻譯套件': ' 最簡單 / 最高效 達成 Lazy load 的 Angular 翻譯套件',
  '需求': '需求',
  'Angular 16+ (無 peerDependencies)': 'Angular 16+ (無 peerDependencies)',
  '說明': '說明',
  '優點': '優點',
  '預設 lazy load': '預設 lazy load',
  '動態切換語系': '動態切換語系',
  '極簡設定': '極簡設定',
  '支援 CSR/SSR/SSG': '支援 CSR/SSR/SSG',
  '可設定沿用父元件的翻譯資源': '可設定沿用父元件的翻譯資源',
  '體積最小化': '體積最小化',
  '效能最佳化': '效能最佳化',
  '不閃 key': '不閃 key',
  '開始使用': '開始使用',
  '安裝': '安裝',
  '請在專案根目錄下 CLI 指令，下載安裝本套件:': '請在專案根目錄下 CLI 指令，下載安裝本套件:',
  'CLI 安裝指令': 'CLI 安裝指令',
  '初始設定': '初始設定',
  '選擇專案類型，生成初始設定指引 :': '選擇專案類型，生成初始設定指引 :',
  '網站渲染方式': '網站渲染方式',
  '專案架構': '專案架構',
  '應用程式啟動模式': '應用程式啟動模式',
  'CSR 單專案：使用預設 /assets/i18n 載入路徑。': 'CSR 單專案：使用預設 /assets/i18n 載入路徑。',
  '在': '在',
  '上設置': '上設置',
  '存放翻譯資源': '存放翻譯資源',
  getStart: {
    storageNote: '檔案類型: json\n存放路徑: assets/i18n，\n全域資源預設名稱: common \n存放的資料夾架構範例如下:',
    sourceArchitecture: `src/
└── app/
│   └── feature/
│   │   └── get-start/ get-start.component // 用 provideTranslation('get-start') 載入 assets/i18n/get-start 的翻譯
│   │       └── get-start-child/ get-start-child.component // 可透過設定 enablePageFallback，延 inject tree 使用父層 get-start 的翻譯(1)
│   └── shared/
│       └── header/ header.component // 用 provideTranslation('header') 載入 assets/i18n/header 的翻譯
└── assets/
    └── i18n/ // 扁平存放於 i18n 資料夾
        ├── common/ // 預設全域關鍵字
        │   ├── en.json
        │   └── zh-Hant.json
        ├── header/ // 元件 header 的翻譯
        │   ├── en.json
        │   └── zh-Hant.json
        └── get-start/ // 元件 get-start 的翻譯
            ├── en.json
            └── zh-Hant.json`,
    config: {
      supportedLangHint: '用到的語言的檔案名稱 (例如：en.json 的 en、zh-Hant.json 的 zh-Hant)',
      loader: {
        label: '載入相關設定',
        client: 'client 端載入相關設定',
        baseUrlMonorepo: 'monorepo 架構下，根路徑從資料夾 projects 開始 (與 package.json 同層)',
        server: 'server 端載入相關設定',
        baseDirMonorepo: '載入翻譯時的根路徑需為整個 Monorepo 的根目錄（與 package.json 同位置）',
        assetMonorepo: 'monorepo 架構下的 assets 位置',
        baseDirSingle: '載入翻譯時的根路徑需為專案的根目錄（與 package.json 同位置）',
        assetSingle: 'assets 的位置',
        clientDefaultPath: 'client 端都用預設路徑 assets/i18n',
      }
    },
    jsonArchitecture: `
    // 翻譯資料
    assets/i18n/get-start/zh-Hant.json
  {
    title: "大標題",
    section1: {
      title: "第一段標題",
      subTitle: "第一段副標題"
    },
    footer: {
      title: "結尾標題",
      subTitle: "結尾副標題"
    }
  }

  // html 使用範例
  get-start.html
  <h1>{{ 'title' | t }}</h1>
  <h2>{{ 'section1.title' | t }}</h2>
  <h3>{{ 'section1.subTitle' | t }}</h3>

  // ts 使用範例
  get-start.ts
  mainTitle = translateService.t('title');
  `,
    lazyLoad: {
      compComp: `// Standalone 元件直接在 providers 設定對應 namespace
@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  providers: [
    provideTranslation('header'), // 名稱必須與資料夾名稱相同
  ],
})
export class HeaderComponent { }`,
      moduleComp: `// 傳統 NgModule 元件一樣可以在 @Component.providers 設定
@Component({
  selector: 'app-get-start',
  templateUrl: './get-start.component.html',
  providers: [
    provideTranslation('get-start'), // 名稱必須與資料夾名稱相同
  ],
})
export class GetStartComponent { }`,
      moduleModule: `// 或者將 namespace provider 放在模組，讓此模組底下的元件共用
@NgModule({
  declarations: [GetStartComponent],
  providers: [
    provideTranslation('get-start'), // 名稱必須與資料夾名稱相同
  ],
})
export class GetStartModule { }`
    }
  },
  '使用方法': '使用方法',
  '翻譯資源資料夾範例': '翻譯資源資料夾範例',
  '載入翻譯資源': '載入翻譯資源',
  '從何處載入翻譯': '從何處載入翻譯',
  '載入設置範例': '載入設置範例',
  'CSR (一般選這個)': 'CSR (一般選這個)',
  SSR: 'SSR',
  SSG: 'SSG',
  '一般獨立專案': '一般獨立專案',
  'Standalone (元件)': 'Standalone (元件)',
  'NgModule (元件)': 'NgModule (元件)',
  'NgModule (模組)': 'NgModule (模組)',
};


export default zh_TW;

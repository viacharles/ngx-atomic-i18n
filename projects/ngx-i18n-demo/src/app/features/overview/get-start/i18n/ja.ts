import en from "./en";

const ja: typeof en = {
  '介紹': '概要',
  ' 最簡單 / 最高效 達成 Lazy load 的 Angular 翻譯套件': '最もシンプルかつ高効率に Lazy load を実現する Angular 翻訳ライブラリ',
  '需求': '要件',
  '需求-1': 'Angular 16+（peerDependencies に第三者依存なし）',
  'des-dialog-需求': '1. Angular 16+（standalone や signals などの新機能を含む）。2. 他のサードパーティ依存なし。',
  'des-dialog-極簡設定': "ブートストラップで一度設定するだけ：\nprovideTranslationInit({ supportedLangs: ['en', 'zh-Hant'] }),\nあとはページ/コンポーネントに provideTranslation('namespace') を追加すれば使えます。",
  'des-dialog-頁面作為翻譯根': "ページコンポーネントに\nprovideTranslation('namespace', true)\nを付けると、子コンポーネントは自分の namespace に key がない場合、自動でこのページの namespace にフォールバックします。",
  'des-dialog-lazy-load': "各 namespace は必要になった時に読み込みます。provideTranslation('namespace') を持つコンポーネントが初めて描画される際に、必要な言語リソースだけを取得します。",
  'des-dialog-效能最佳化': "1. CSR では preloadNamespaces() を使って初回描画前に翻訳を先読みでき、初回遅延を防げます。\n2. 内部キャッシュで重複ダウンロードを回避します。同じ言語・namespace・任意の buildVersion の組み合わせは一度だけ読み込まれ、結果を共有します。\n3. ICU メッセージ整形と文字列参照の繰り返しを減らすため、フォーマッタをキャッシュします。\n4. buildVersion を使って新しいバージョン配布時にキャッシュを無効化し、古い翻訳の使用を防ぎます。\n5. signal を使用します。",
  'des-dialog-不閃key': 'namespace の読み込みが終わるまで、UI は生の key ではなく空文字を表示します。\n読み込み完了後は翻訳文または設定済みのフォールバックを表示します。',
  '說明': '詳細',
  '優點': 'メリット',
  '預設 lazy load': 'デフォルトで Lazy load',
  '動態切換語系': '言語を動的に切り替え',
  '極簡設定': '最小限の設定',
  '支援 CSR/SSR/SSG': 'CSR/SSR/SSG 対応',
  '頁面作為翻譯根': 'ページを翻訳ルートにして自動フォールバック',
  '體積最小化': 'バンドルサイズ最小化',
  '效能最佳化': 'パフォーマンス最適化',
  '不閃 key': 'キーのチラつきなし',
  '開始使用': 'はじめに',
  '安裝': 'インストール',
  '請在專案根目錄下 CLI 指令，下載安裝本套件:': 'プロジェクトルートで CLI を実行してインストールします：',
  'CLI 安裝指令': 'CLI インストールコマンド',
  '初始設定': '初期設定',
  '選擇專案類型，生成初始設定指引 :': 'プロジェクト種別を選ぶと初期設定ガイドを生成します：',
  '網站渲染方式': 'レンダリング方式',
  '專案架構': 'プロジェクト構成',
  '應用程式啟動模式': 'アプリ起動方式',
  'CSR 單專案：使用預設 /assets/i18n 載入路徑。': 'CSR 単一プロジェクト：既定の /assets/i18n を読み込みパスに使用。',
  '在': 'で',
  '上設置': 'を設定',
  '存放翻譯資源': '翻訳リソースを配置',

  getStart: {
    storageNote: 'ファイル形式: json\n保存パス: assets/i18n,\nグローバル既定名: common\n保存フォルダ構成例:',
    sourceArchitecture: `src/
└── app/
│   └── feature/
│   │   └── get-start/ get-start.component // provideTranslation('get-start') で 'assets/i18n/get-start' の翻訳を読み込み
│   │       └── get-start-child/ get-start-child.component // enablePageFallback を有効にすると、翻訳は注入ツリー上の親コンポーネント get-start にフォールバックします。(1)
│   └── shared/
│       └── header/ header.component // provideTranslation('header') で 'assets/i18n/header' の翻訳を読み込み
└── assets/
    └── i18n/ // i18n フォルダ内のフラット構成
        ├── common/ // 既定のグローバル用キーワード（例：共通文字列）
        │   ├── en.json
        │   └── zh-Hant.json
        ├── header/ // 'header' コンポーネントの翻訳
        │   ├── en.json
        │   └── zh-Hant.json
        └── get-start/ // 'get-start' コンポーネントの翻訳
            ├── en.json
            └── zh-Hant.json`,
    config: {
      supportedLangHint: '各ファイル名の言語コードを使用（例: en.json -> en, zh-Hant.json -> zh-Hant）',
      loader: {
        label: 'Loader 設定',
        client: 'クライアント側の読み込み設定',
        baseUrlMonorepo: 'モノレポでは /projects 配下（package.json と同階層）からパスを指定',
        server: 'サーバー側の読み込み設定',
        baseDirMonorepo: '翻訳ルートはモノレポのルート（package.json と同階層）',
        assetMonorepo: 'モノレポビルド時の assets パス',
        baseDirSingle: '翻訳ルートはプロジェクトルート（package.json と同階層）',
        assetSingle: '単一プロジェクトの assets パス',
        clientDefaultPath: 'クライアント側は既定の assets/i18n パスを使用',
      }
    },
    jsonArchitecture: `// 翻訳データ
    assets/i18n/get-start/zh-Hant.json
    {
    title: "Main Title",
    section1: {
      title: "Title for Section 1",
      subTitle: "Subtitle for Section 1"
    },
    footer: {
      title: "Footer Title",
      subTitle: "Footer Subtitle"
    }
  }

  // HTML の使用例
  get-start.html
  <h1>{{ 'title' | t }}</h1>
  <h2>{{ 'section1.title' | t }}</h2>
  <h3>{{ 'section1.subTitle' | t }}</h3>

  // ts の使用例
  get-start.ts
  mainTitle = translateService.t('title');
  `,
    lazyLoad: {
      compComp: `// standalone コンポーネントで namespace を直接提供
@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  providers: [
    provideTranslation('header'),  // 名前はフォルダ名と一致する必要があります。
  ],
})
export class HeaderComponent { }`,
      moduleComp: `// 伝統的な NgModule コンポーネントで @Component.providers を使用
@Component({
  selector: 'app-get-start',
  templateUrl: './get-start.component.html',
  providers: [
    provideTranslation('get-start'),  // 名前はフォルダ名と一致する必要があります。
  ],
})
export class GetStartComponent { }`,
      moduleModule: `// モジュールレベルで namespace を提供してコンポーネント間で共有
@NgModule({
  declarations: [GetStartComponent],
  providers: [
    provideTranslation('get-start'),  // 名前はフォルダ名と一致する必要があります。
  ],
})
export class GetStartModule { }`
    }
  },
  '使用方法': '使い方',
  '翻譯資源資料夾範例': '翻訳リソースフォルダ例',
  '載入翻譯資源': '翻訳リソースの読み込み',
  '從何處載入翻譯': '翻訳の読み込み元',
  '載入設置範例': '読み込み設定例',
  'CSR (一般選這個)': 'CSR（通常はこれ）',
  SSR: 'SSR',
  SSG: 'SSG',
  '一般獨立專案': '一般の単一プロジェクト',
  'Standalone (元件)': 'Standalone（コンポーネント）',
  'NgModule (元件)': 'NgModule（コンポーネント）',
  'NgModule (模組)': 'NgModule（モジュール）'
};

export default ja;

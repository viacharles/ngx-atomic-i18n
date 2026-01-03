import en from "./en";

const ja: typeof en = {
  '＊ 符號表示重要常用功能': '＊ 重要でよく使う機能を示します',
  '設定配置': '設定',
  '全部參數': '全パラメータ',
  '語系與namespace': '言語と namespace',
  '必填': '必須',
  '預設': '既定',
  '預設:': '既定:',
  'supportedLangs-des': '対応言語コードの一覧。\n要求言語の検証に使用。\n翻訳ファイル名と一致する必要があります（en.json => en; ja.json => ja）。',
  'supportedLangs-ex': "例: ['en', 'zh-Hant', 'ja'] はこの3言語が利用可能という意味。",
  '候補語系。比對不到語系時用這個。': '一致する言語が見つからない場合に使うフォールバック言語。',
  'fallbackLang-ex': "例: 'en' は未知の言語を英語にフォールバック。",
  'enablePageFallback-des': '祖先コンポーネントの翻訳リソースを再利用できます。\nページレベルで定義した翻訳を、select や table などの入れ子コンポーネントでも使えるようにします。\nこの機能を有効にするには、ページコンポーネントの translationProvider() の第2引数を true に設定します。',
  'fallbackNamespace-des': 'グローバル namespace / フォールバック namespace。\n現在の namespace で key が見つからない場合に使用。',
  'fallbackNamespace-ex': "例: 'common' を指定すると全コンポーネントで再利用できます。",
  'supportedLangs-des-1': '言語検出の順序。supportedLangs で検証されます。\n',
  'supportedLangs-des-2': " - （ブラウザのみ）localStorage の 'lang'.\n",
  'supportedLangs-des-3': ' - （ブラウザのみ）パスの先頭セグメント（例: /zh-Hant/...）。\n',
  'supportedLangs-des-4': ' - （ブラウザのみ）navigator.language の優先言語。\n',
  'supportedLangs-des-5': ' - provideTranslationInit からの ',
  'supportedLangs-des-6': ' パラメータ。\n',
  'supportedLangs-des-7': ' SSR 専用。server.ts で CLIENT_REQUEST_LANG トークンにリクエストヘッダーの Accept-Language を設定して記録します。\n',
  ' - provideTranslationInit 的 ': ' - provideTranslationInit からの ',
  ' 參數。': ' パラメータ。\n',
  'customInitialLang-des': 'langDetectionOrder の戦略の一つ。\nカスタム言語ソースを定義します。',
  'customInitialLang-ex': "例: () => (navigator.language?.startsWith('zh') ? 'zh-Hant' : 'en') は、評価時にブラウザの優先言語を使用します。",
  'langDetectionOrder-ex-button': 'clientRequest - server.ts 例',
  'langDetectionOrder-ex': `
  import { APP_BASE_HREF } from '@angular/common';
  import { CommonEngine } from '@angular/ssr';
  server.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;
  const acceptLangHeader = Array.isArray(headers['accept-language']) // get accept-language
    ? headers['accept-language'][0]
    : headers['accept-language'];
  const requestLang = typeof acceptLangHeader === 'string'
    ? acceptLangHeader.split(',')[0]?.trim() ?? null
    : null;
  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: '\${protocol}://\${headers.host}\${originalUrl}',
      publicPath: browserDistFolder,
      providers: [
        { provide: APP_BASE_HREF, useValue: baseUrl },
        { provide: CLIENT_REQUEST_LANG, useValue: requestLang }, // via CLIENT_REQUEST_LANG token
      ],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});`,
  '翻譯資源與路徑': '翻訳リソースとパス',
  '範例:': '例:',
  '請選擇專案架構': 'プロジェクト構成を選択',
  'assets 裡存放翻譯資料的母資料夾位置，可放多個依序查詢。\n對應': 'assets 内の翻訳ルート。複数指定すると順に検索します。\n対応するのは',
  "裡的關鍵字 '{{root}}'。": "内の '{{root}}' トークン。",
  'i18nRoots-ex': "例: ['i18n/features', 'i18n'] はこれらのフォルダを検索し、{{root}}{{lang}}{{namespace}} のような pathTemplates を適用して 'i18n/features/<lang>/<namespace>.json' などを探します。",
  '路徑html。{{root}} 一定放第一個，代表 i18nRoots，{{lang}} {{namespace}} 則代表接在 i18nRoots 路徑之後的資料夾結構，可自由調整資料夾階層。\n記得最後一個要加上副檔名。\n 支援複數路徑候選。\n': 'パステンプレート。{{root}} は i18nRoots を指し、{{lang}} と {{namespace}} はその後のフォルダ構成を表します。\n末尾には拡張子が必須です。\n複数の候補パスに対応します。\n',
  ' - 對應 i18nRoots\n': ' - i18nRoots に対応\n',
  ' - 從 provideTranslation(namespace) 中得到\n': ' - provideTranslation(namespace) から提供\n',
  ' - 從 setLang(lang) 中得到': ' - setLang(lang) から取得',
  '行為': '挙動',
  '翻譯還沒生效時的顯示行為。': '翻訳が有効になる前の表示。',
  ' - 顯示 key': ' - key を表示',
  ' - 顯示 空字串': ' - 空文字を表示',
  ' - 丟錯': ' - エラーを投げる。開発時のみ。画面が停止します。',
  '預載': '事前読み込み',
  '啟動時預載的 namespace 名稱列表，預設不預載。': '起動時に pre-load する namespace 一覧。既定はなし。',
  'preloadNamespaces-ex': "例: ['common', 'landing', 'dashboard'] を起動時に pre-load。",
  'Cache': 'キャッシュ',
  '版本字串會加進 cache key， 在 Loader 裡用於解 cache。預設不帶版本。': 'バージョン文字列は cache key に追加され、Loader 側でキャッシュ無効化に使われます。既定はなし。',
  'Loader': 'Loader',
  '套件會偵測目前環境自己決定使用 http loader 或 fs loader。': 'ライブラリが実行環境を検出し、HTTP loader か FS loader を自動で選びます。',
  '可自訂 Http loader。\n會自動在 CSR 模式下使用。\n預設建立內建的 HttpTranslationLoader。\n使用 httpOptions 裡設定的路徑(baseUrl + i18nRoots + pathTemplates)下載翻譯資源。': 'HTTP loader をカスタム可能。\nCSR では自動で使用されます。\n既定は内蔵の HttpTranslationLoader を作成します。\nhttpOptions に設定したパス（baseUrl + i18nRoots + pathTemplates）で翻訳をダウンロードします。',
  'csrLoader-ex': '例: (http) => new CustomHttpLoader(http, ...) で既定の HTTP loader を置き換える。',
  '內建的 csrLoader 的相關設定': '組み込み csrLoader の設定',
  '內建 csrLoader 用。\n下載翻譯檔的 base URL，也可指向外部下載位置， 或自訂根路徑。\n後面接 pathTemplates，組合成一個完整路徑。': '組み込み csrLoader 用。\n翻訳ファイルの base URL（CDN やカスタムルートも可）。\npathTemplates と組み合わせて完全な URL を作成します。',
  'SSR/SSG 模式下自訂檔案系統 loader。\n預設建立內建的 FsTranslationLoader。': 'SSR/SSG 向けのファイルシステム loader をカスタム。\n既定は内蔵の FsTranslationLoader。',
  '內建的 ssrLoader 的相關設定': '組み込み ssrLoader の設定',
  '內建 ssrLoader 用。\n檔案系統 loader 解析翻譯檔時的專案根目錄，預設為目前工作目錄。': '組み込み ssrLoader 用。\n翻訳ファイルを解決するプロジェクトルート。既定は process.cwd()。',
  '內建 ssrLoader 用。\nSSR/SSG 時相對於 baseDir 的資源資料夾，記得開發與正式環境需自動切換。': '組み込み ssrLoader 用。\nSSR/SSG 時の baseDir からの assets フォルダ。開発/本番で自動切り替えが必要です。',
  'resolvePaths-des': '組み込み SSR Loader 用。\nカスタム候補パスのセットを返します。\nroot は i18nRoots を回してパラメータを組み立てます。',
  '${baseDir}/${assetPath}/${root}/${lang}/${namespace}.json': '${baseDir}/${assetPath}/${root}/${lang}/${namespace}.json',
  '${baseDir}/${assetPath}/${root}/${namespace}/${lang}.json': '${baseDir}/${assetPath}/${root}/${namespace}/${lang}.json',
  '強制 loader 運作於 CSR 或 SSR，預設依平台自動切換。': 'loader を CSR または SSR に強制。既定はプラットフォーム判定で自動切替。',
  'Log': 'ログ',
  'forceMode-default': '自動（PLATFORM_ID に基づいて CSR / SSR を判定）',
  '控制是否輸出偵錯資訊，預設在開發模式為 true、正式模式為 false。': 'デバッグ出力の切替。既定は開発 true、本番 false。',

  // form
  '一般獨立專案': '一般の単一プロジェクト',

  // ex

  translationAssetsEx_1: `一般的なプロジェクト例:
1-1. フラット - namespace（feature / common）フォルダで分ける
<Project root>
└── src
    └── assets
        └── i18n
            ├── feature-a
            │     ├── en.json
            │     └── zh-Hant.json
            ├── feature-b
            │     ├── en.json
            │     └── zh-Hant.json
            └── common
                  ├── en.json
                  └── zh-Hant.json
設定例:
i18nRoots: ['i18n']
pathTemplates: ['{{root}}/{{namespace}}/{{lang}}.json']
説明: root は assets/i18n、namespace はフォルダ名、lang はファイル名。

1-2. フラット - lang フォルダで分ける
    └── assets
        └── i18n
            ├── en
            │    ├── feature-a.json
            │    ├── feature-b.json
            │.   └── common.json
            └── zh-Hant
                 ├── en.json
                 └── zh-Hant.json

設定例:
i18nRoots: ['i18n']
pathTemplates: ['{{root}}/{{lang}}/{{namespace}}.json']
説明: root は assets/i18n、lang はフォルダ名、namespace はファイル名。

2. ネスト
<Project root>
└── src
    └── assets
        └── translations
            ├── features
            │   ├── feature-a
            │   └── feature-b
            └── global
                ├── common
                └── main-menu
設定例:
i18nRoots: ['translations/features', 'translations/global']
pathTemplates: ['{{root}}/{{namespace}}/{{lang}}.json']
説明: 複数の root を指定でき、loader は順番に試します。`,
  translationAssetsEx_2: `モノレポでは翻訳アセットは各サブプロジェクト配下に置くのが一般的です。例:
<root folder>
└── <parent folder of sub-projects>
    ├── admin-app/src/assets/i18n
    └── store-app/src/assets/i18n
設定例:
i18nRoots: ['projects/admin-app/src/assets/i18n', 'projects/store-app/src/assets/i18n']
pathTemplates: ['{{root}}/{{namespace}}/{{lang}}.json']
説明: root で各アプリの i18n パスを直接指定し、pathTemplates を再利用できます。
`
};

export default ja;

import en from "./en";

const ko: typeof en = {
  '＊ 符號表示重要常用功能': '＊ 중요하고 자주 쓰는 기능을 표시합니다',
  '設定配置': '설정',
  '全部參數': '전체 파라미터',
  '語系與namespace': '언어와 namespace',
  '必填': '필수',
  '預設': '기본값',
  '預設:': '기본값:',
  'supportedLangs-des': '지원 언어 코드 목록입니다.\n요청된 언어를 검증하는 데 사용됩니다.\n번역 파일명과 일치해야 합니다(en.json => en; ja.json => ja).',
  'supportedLangs-ex': "예: ['en', 'zh-Hant', 'ja'] 는 이 3개 언어를 지원한다는 뜻.",
  '候補語系。比對不到語系時用這個。': '일치하는 언어가 없을 때 사용하는 폴백 언어.',
  'fallbackLang-ex': "예: 'en' 은 알 수 없는 언어를 영어로 폴백.",
  'enablePageFallback-des': '상위 컴포넌트의 번역 리소스를 재사용할 수 있습니다.\n페이지 레벨 컴포넌트에서 정의한 번역을 select, table 같은 하위 컴포넌트에서 활용할 수 있습니다.\n이 기능을 사용하려면 페이지 컴포넌트의 translationProvider() 두 번째 인자를 true로 설정합니다.',
  'fallbackNamespace-des': '글로벌 namespace / 폴백 namespace.\n현재 namespace에 key가 없을 때 사용됩니다.',
  'fallbackNamespace-ex': "예: 'common' 을 지정하면 모든 컴포넌트에서 재사용 가능.",
  'supportedLangs-des-1': '언어를 찾는 순서입니다. supportedLangs로 검증됩니다.\n',
  'supportedLangs-des-2': " - (브라우저 전용) localStorage 키 'lang'.\n",
  'supportedLangs-des-3': ' - (브라우저 전용) 첫 번째 경로 세그먼트 예: /zh-Hant/...\n',
  'supportedLangs-des-4': ' - (브라우저 전용) navigator.language 선호도.\n',
  'supportedLangs-des-5': ' - provideTranslationInit 의 ',
  'supportedLangs-des-6': ' 파라미터.\n',
  'supportedLangs-des-7': ' SSR 전용. server.ts에서 CLIENT_REQUEST_LANG 토큰으로 요청 헤더의 Accept-Language를 기록합니다.\n',
  ' - provideTranslationInit 的 ': ' - provideTranslationInit 의 ',
  ' 參數。': ' 파라미터.\n',
  'customInitialLang-des': 'langDetectionOrder 전략 중 하나.\n커스텀 언어 소스를 정의합니다.',
  'customInitialLang-ex': "예: () => (navigator.language?.startsWith('zh') ? 'zh-Hant' : 'en') 는 customInitialLang 평가 시 브라우저 선호 언어를 사용합니다.",
  'langDetectionOrder-ex-button': 'clientRequest - server.ts 예시',
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
  '翻譯資源與路徑': '번역 리소스와 경로',
  '範例:': '예:',
  '請選擇專案架構': '프로젝트 구조 선택',
  'assets 裡存放翻譯資料的母資料夾位置，可放多個依序查詢。\n對應': 'assets 안의 번역 루트 폴더 위치. 여러 개를 지정하면 순서대로 검색합니다.\n대응하는 것은',
  "裡的關鍵字 '{{root}}'。": "안의 '{{root}}' 토큰.",
  'i18nRoots-ex': "예: ['i18n/features', 'i18n'] 는 이 폴더들을 검사하고 {{root}}{{lang}}{{namespace}} 같은 pathTemplates를 적용해 'i18n/features/<lang>/<namespace>.json' 등을 찾습니다.",
  '路徑html。{{root}} 一定放第一個，代表 i18nRoots，{{lang}} {{namespace}} 則代表接在 i18nRoots 路徑之後的資料夾結構，可自由調整資料夾階層。\n記得最後一個要加上副檔名。\n 支援複數路徑候選。\n': '경로 템플릿입니다. {{root}} 는 i18nRoots를 가리키고, {{lang}} 와 {{namespace}} 는 그 뒤의 폴더 구조를 나타냅니다.\n확장자는 반드시 포함해야 합니다.\n여러 후보 경로를 지원합니다.\n',
  ' - 對應 i18nRoots\n': ' - i18nRoots에 대응\n',
  ' - 從 provideTranslation(namespace) 中得到\n': ' - provideTranslation(namespace)에서 제공\n',
  ' - 從 setLang(lang) 中得到': ' - setLang(lang)에서 가져옴',
  '行為': '동작',
  '翻譯還沒生效時的顯示行為。': '번역이 준비되기 전 표시 방식.',
  ' - 顯示 key': ' - key 표시',
  ' - 顯示 空字串': ' - 빈 문자열 표시',
  ' - 丟錯': ' - 에러 발생. 개발 모드에서만 사용, 화면이 멈춥니다.',
  '預載': '사전 로드',
  '啟動時預載的 namespace 名稱列表，預設不預載。': '앱 시작 시 미리 로드할 namespace 목록. 기본은 미로드.',
  'preloadNamespaces-ex': "예: ['common', 'landing', 'dashboard'] 를 시작 시 미리 로드.",
  'Cache': '캐시',
  '版本字串會加進 cache key， 在 Loader 裡用於解 cache。預設不帶版本。': '버전 문자열은 cache key에 추가되어 Loader에서 캐시 무효화에 사용됩니다. 기본은 없음.',
  'Loader': 'Loader',
  '套件會偵測目前環境自己決定使用 http loader 或 fs loader。': '라이브러리가 런타임 환경을 감지해 HTTP loader 또는 FS loader를 자동 선택합니다.',
  '可自訂 Http loader。\n會自動在 CSR 模式下使用。\n預設建立內建的 HttpTranslationLoader。\n使用 httpOptions 裡設定的路徑(baseUrl + i18nRoots + pathTemplates)下載翻譯資源。': 'HTTP loader를 커스텀할 수 있습니다.\nCSR 모드에서 자동으로 사용됩니다.\n기본은 내장 HttpTranslationLoader를 생성합니다.\nhttpOptions에 설정한 경로(baseUrl + i18nRoots + pathTemplates)로 번역 리소스를 다운로드합니다.',
  'csrLoader-ex': '예: (http) => new CustomHttpLoader(http, ...) 로 기본 HTTP loader를 대체.',
  '內建的 csrLoader 的相關設定': '내장 csrLoader 관련 설정',
  '內建 csrLoader 用。\n下載翻譯檔的 base URL，也可指向外部下載位置， 或自訂根路徑。\n後面接 pathTemplates，組合成一個完整路徑。': '내장 csrLoader용.\n번역 파일의 base URL(외부 CDN 또는 커스텀 루트 가능).\npathTemplates와 결합해 전체 URL을 구성합니다.',
  'SSR/SSG 模式下自訂檔案系統 loader。\n預設建立內建的 FsTranslationLoader。': 'SSR/SSG 모드에서 파일 시스템 loader를 커스텀합니다.\n기본은 내장 FsTranslationLoader.',
  '內建的 ssrLoader 的相關設定': '내장 ssrLoader 관련 설정',
  '內建 ssrLoader 用。\n檔案系統 loader 解析翻譯檔時的專案根目錄，預設為目前工作目錄。': '내장 ssrLoader용.\n번역 파일을 해석할 프로젝트 루트. 기본은 process.cwd().',
  '內建 ssrLoader 用。\nSSR/SSG 時相對於 baseDir 的資源資料夾，記得開發與正式環境需自動切換。': '내장 ssrLoader용.\nSSR/SSG에서 baseDir 기준 assets 폴더. 개발/운영 경로 자동 전환이 필요합니다.',
  'resolvePaths-des': '내장 SSR Loader용.\n커스텀 후보 경로 목록을 반환합니다.\nroot는 i18nRoots를 순회하며 파라미터를 구성합니다.',
  '${baseDir}/${assetPath}/${root}/${lang}/${namespace}.json': '${baseDir}/${assetPath}/${root}/${lang}/${namespace}.json',
  '${baseDir}/${assetPath}/${root}/${namespace}/${lang}.json': '${baseDir}/${assetPath}/${root}/${namespace}/${lang}.json',
  '強制 loader 運作於 CSR 或 SSR，預設依平台自動切換。': 'loader를 CSR 또는 SSR로 강제 실행. 기본은 플랫폼 자동 전환.',
  'Log': '로그',
  'forceMode-default': '자동(PLATFORM_ID 기준으로 CSR / SSR 판별)',
  '控制是否輸出偵錯資訊，預設在開發模式為 true、正式模式為 false。': '디버그 로그 출력 여부. 기본은 개발 true, 운영 false.',

  // form
  '一般獨立專案': '일반 단일 프로젝트',

  // ex

  translationAssetsEx_1: `일반적인 프로젝트 예:
1-1. 플랫 - namespace(feature / common) 폴더로 구분
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
설정 예:
i18nRoots: ['i18n']
pathTemplates: ['{{root}}/{{namespace}}/{{lang}}.json']
설명: root는 assets/i18n, namespace는 폴더명, lang은 파일명입니다.

1-2. 플랫 - lang 폴더로 구분
    └── assets
        └── i18n
            ├── en
            │    ├── feature-a.json
            │    ├── feature-b.json
            │.   └── common.json
            └── zh-Hant
                 ├── en.json
                 └── zh-Hant.json

설정 예:
i18nRoots: ['i18n']
pathTemplates: ['{{root}}/{{lang}}/{{namespace}}.json']
설명: root는 assets/i18n, lang은 폴더명, namespace는 파일명입니다.

2. 중첩
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
설정 예:
i18nRoots: ['translations/features', 'translations/global']
pathTemplates: ['{{root}}/{{namespace}}/{{lang}}.json']
설명: 여러 root를 지정할 수 있고, loader는 순서대로 시도합니다.`,
  translationAssetsEx_2: `모노레포에서는 번역 assets를 각 서브프로젝트 아래에 두는 것이 일반적입니다. 예:
<root folder>
└── <parent folder of sub-projects>
    ├── admin-app/src/assets/i18n
    └── store-app/src/assets/i18n
설정 예:
i18nRoots: ['projects/admin-app/src/assets/i18n', 'projects/store-app/src/assets/i18n']
pathTemplates: ['{{root}}/{{namespace}}/{{lang}}.json']
설명: root로 각 앱의 i18n 경로를 직접 지정하고, pathTemplates를 재사용할 수 있습니다.
`
};

export default ko;

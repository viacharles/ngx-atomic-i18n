import en from "./en";

const ko: typeof en = {
  '介紹': '개요',
  ' 最簡單 / 最高效 達成 Lazy load 的 Angular 翻譯套件': '가장 간단하고 효율적인 Lazy load Angular 번역 라이브러리',
  '需求': '요구사항',
  '需求-1': 'Angular 16+ (peerDependencies에 타 서드파티 의존 없음)',
  'des-dialog-需求': '1. Angular 16+ (standalone, signals 등 신기능 포함). 2. 다른 서드파티 의존 없음.',
  'des-dialog-極簡設定': "부트스트랩에서 한 번만 설정:\nprovideTranslationInit({ supportedLangs: ['en', 'zh-Hant'] }),\n그 다음 페이지/컴포넌트에 provideTranslation('namespace')를 추가하면 됩니다.",
  'des-dialog-頁面作為翻譯根': "페이지 컴포넌트에\nprovideTranslation('namespace', true)\n를 설정하면, 자식 컴포넌트가 자신의 namespace에서 키를 찾지 못할 때 자동으로 이 페이지 namespace로 폴백합니다.",
  'des-dialog-lazy-load': "각 namespace는 필요할 때 로드됩니다. provideTranslation('namespace')가 있는 컴포넌트가 처음 렌더링될 때 해당 언어 리소스만 가져옵니다.",
  'des-dialog-效能最佳化': "1. CSR에서는 preloadNamespaces()로 초기 렌더 전에 번역 리소스를 미리 로드해 첫 로딩 지연을 줄일 수 있습니다.\n2. 내부 캐시로 중복 다운로드를 방지합니다. 동일한 언어 + namespace + (buildVersion) 조합은 한 번만 로드되고 결과를 공유합니다.\n3. ICU 포맷팅과 문자열 조회를 반복하지 않도록 포맷터 캐시를 사용합니다.\n4. buildVersion 지원으로 새 버전 배포 시 캐시를 무효화해 오래된 번역 사용을 막습니다.\n5. signal 사용.",
  'des-dialog-不閃key': 'namespace 로딩 전에는 UI가 key 대신 빈 문자열을 표시합니다.\n로딩 완료 후에는 번역 또는 설정된 폴백을 표시합니다.',
  '說明': '설명',
  '優點': '장점',
  '預設 lazy load': '기본 Lazy load',
  '動態切換語系': '언어를 동적으로 전환',
  '極簡設定': '초간단 설정',
  '支援 CSR/SSR/SSG': 'CSR/SSR/SSG 지원',
  '頁面作為翻譯根': '페이지를 번역 루트로 사용',
  '體積最小化': '번들 크기 최소화',
  '效能最佳化': '성능 최적화',
  '不閃 key': '키 깜빡임 없음',
  '開始使用': '시작하기',
  '安裝': '설치',
  '請在專案根目錄下 CLI 指令，下載安裝本套件:': '프로젝트 루트에서 CLI 명령으로 설치하세요:',
  'CLI 安裝指令': 'CLI 설치 명령',
  '初始設定': '초기 설정',
  '選擇專案類型，生成初始設定指引 :': '프로젝트 유형을 선택하면 초기 설정 가이드를 생성합니다:',
  '網站渲染方式': '렌더링 방식',
  '專案架構': '프로젝트 구조',
  '應用程式啟動模式': '앱 부트스트랩 방식',
  'CSR 單專案：使用預設 /assets/i18n 載入路徑。': 'CSR 단일 프로젝트: 기본 /assets/i18n 로드 경로 사용.',
  '在': '에서',
  '上設置': '설정',
  '存放翻譯資源': '번역 리소스 저장',

  getStart: {
    storageNote: '파일 형식: json\n저장 경로: assets/i18n,\n전역 리소스 기본 이름: common \n저장 폴더 구조 예시는 다음과 같습니다:',
    sourceArchitecture: `src/
└── app/
│   └── feature/
│   │   └── get-start/ get-start.component // provideTranslation('get-start')로 'assets/i18n/get-start' 번역 로드
│   │       └── get-start-child/ get-start-child.component // enablePageFallback을 켜면, 번역이 주입 트리의 부모 get-start 값으로 폴백됩니다.(1)
│   └── shared/
│       └── header/ header.component // provideTranslation('header')로 'assets/i18n/header' 번역 로드
└── assets/
    └── i18n/ // i18n 폴더 내 평면 구조
        ├── common/ // 전역 기본 키워드(예: 공통 문자열)
        │   ├── en.json
        │   └── zh-Hant.json
        ├── header/ // 'header' 컴포넌트 번역
        │   ├── en.json
        │   └── zh-Hant.json
        └── get-start/ // 'get-start' 컴포넌트 번역
            ├── en.json
            └── zh-Hant.json`,
    config: {
      supportedLangHint: '파일명에서 언어 코드를 사용하세요(예: en.json -> en, zh-Hant.json -> zh-Hant)',
      loader: {
        label: 'Loader 설정',
        client: '클라이언트 로드 설정',
        baseUrlMonorepo: '모노레포에서는 /projects 폴더부터 경로를 시작( package.json 옆 )',
        server: '서버 로드 설정',
        baseDirMonorepo: '번역 루트는 모노레포 루트( package.json 과 동일 레벨 )',
        assetMonorepo: '모노레포 빌드용 assets 경로',
        baseDirSingle: '번역 루트는 프로젝트 루트( package.json 과 동일 레벨 )',
        assetSingle: '단일 프로젝트 assets 경로',
        clientDefaultPath: '클라이언트는 기본 assets/i18n 경로 사용',
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

  // HTML 사용 예
  get-start.html
  <h1>{{ 'title' | t }}</h1>
  <h2>{{ 'section1.title' | t }}</h2>
  <h3>{{ 'section1.subTitle' | t }}</h3>

  // ts 사용 예
  get-start.ts
  mainTitle = translateService.t('title');
  `,
    lazyLoad: {
      compComp: `// standalone 컴포넌트가 namespace를 직접 제공
@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  providers: [
    provideTranslation('header'),  // 이름은 폴더명과 같아야 합니다.
  ],
})
export class HeaderComponent { }`,
      moduleComp: `// 전통적인 NgModule 컴포넌트에서 @Component.providers 사용
@Component({
  selector: 'app-get-start',
  templateUrl: './get-start.component.html',
  providers: [
    provideTranslation('get-start'),  // 이름은 폴더명과 같아야 합니다.
  ],
})
export class GetStartComponent { }`,
      moduleModule: `// 모듈 레벨에서 namespace를 제공해 컴포넌트 간 공유
@NgModule({
  declarations: [GetStartComponent],
  providers: [
    provideTranslation('get-start'),  // 이름은 폴더명과 같아야 합니다.
  ],
})
export class GetStartModule { }`
    }
  },
  '使用方法': '사용 방법',
  '翻譯資源資料夾範例': '번역 리소스 폴더 예시',
  '載入翻譯資源': '번역 리소스 로드',
  '從何處載入翻譯': '번역 로드 경로',
  '載入設置範例': '로드 설정 예시',
  'CSR (一般選這個)': 'CSR (보통 이걸 선택)',
  SSR: 'SSR',
  SSG: 'SSG',
  '一般獨立專案': '일반 단일 프로젝트',
  'Standalone (元件)': 'Standalone (컴포넌트)',
  'NgModule (元件)': 'NgModule (컴포넌트)',
  'NgModule (模組)': 'NgModule (모듈)'
};

export default ko;

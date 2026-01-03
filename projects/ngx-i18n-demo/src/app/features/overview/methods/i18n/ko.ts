import en from "./en";

const ko: typeof en = {
  '＊ 符號表示重要常用功能': '＊ 중요하고 자주 쓰는 기능을 표시합니다. 나머지는 생략해도 됩니다.',
  'pipe-t-1': '가장 가까운 namespace가 자동으로 사용됩니다.\n같은 서비스에도 적용됩니다',
  'lang-des':
    '현재 언어를 signal로 제공합니다.\nObservable 대신 signal을 쓰고 싶은 컴포넌트의 리액티브 바인딩에 사용합니다.\ncurrentLang과 onLangChange와 항상 동기화됩니다.',

  'currentLang-des':
    '현재 활성 언어 코드.\n언어의 스냅샷 값으로, 명령형 로직에 유용합니다.\nlang()과 같지만 일반 TypeScript에서 쓰기 편합니다.',
  'currentLang-ex': "예: 'en', 'zh-Hant', 'ja'.",

  'supportedLangs-des':
    '호스트 설정에서 해석된 지원 언어 코드 목록입니다.\n요청된 언어를 검증하고 알 수 없는 로케일을 로드하지 않도록 합니다.',
  'supportedLangs-ex': "예: ['en', 'zh-Hant', 'ja'].",

  'readySignal-des':
    "namespace 준비 상태를 나타내는 signal.\n현재 namespace의 번역 리소스가 현재 언어(및 build version)로 로드되면 true가 됩니다.\n\n일반적인 사용법:\n",
  'readySignal-i-1': '템플릿을 *ngIf="translation.readySignal()" 로 가드',

  'ready-des':
    'readySignal의 boolean 래퍼.\n현재 namespace가 현재 언어로 완전히 로드되면 true를 반환합니다.',

  'onLangChange-des':
    '언어 signal의 Observable 버전.\nsignal 대신 RxJS를 사용하는 경우를 위해 제공합니다.',
  'onLangChange-emit': 'emit:',
  'onLangChange-emit-1':
    'setLang()이 성공할 때마다 새 언어 코드가 emit됩니다.',
  'onLangChange-usage': '일반적인 사용법:',
  'onLangChange-usage-1':
    'signal을 쓰지 않는 서비스/레거시 코드에서 언어 변경에 반응해야 할 때 subscribe합니다.',

  'setLang-des':
    '활성 언어를 전환하고 하위 갱신 로직을 트리거합니다.\n또한 다음이 발생합니다:\n- lang signal 업데이트\n- currentLang 변경\n- onLangChange emit.\n\n호출자는 supportedLangs에 포함된 언어를 전달해야 합니다.',
  'setLang-ex': "예:\nsetLang('en')\nsetLang('zh-Hant').",

  't-des':
    "translate 동작을 수행합니다.\n현재 namespace 안에서 지정된 key의 번역 문자열을 찾습니다.\nparams를 전달하면 ICU 포맷으로 치환되며, 키 누락 시 사전 설정된 폴백 동작이 적용됩니다.",
  't-behavior': '동작:',
  't-behavior-i-1':
    '1. namespace가 준비되지 않으면 빈 문자열을 반환하고, debug가 켜져 있으면 경고를 출력합니다.',
  't-behavior-i-2':
    '2-0. enablePageFallback이 켜져 있으면 페이지 스코프 번역을 폴백으로 사용합니다.',
  't-behavior-i-3':
    '2-1. 현재 namespace에 key가 없으면 설정된 fallback/글로벌 namespace에서 찾습니다.',
  't-behavior-i-4':
    "3. 그래도 없으면 missingTranslationBehavior('show-key' | 'empty' | 'throw-error' | 사용자 문자열)에 따릅니다.",
  't-ex':
    "예:\nt('welcome.title')\nt('user.greeting', { name: 'Alice' }).",

  'addResourceBundle-des':
    '코어에 전체 리소스 번들을 등록하는 패스스루 헬퍼입니다.\n실행 중 번역을 주입해야 하는 경우(API나 기능 모듈 등)에 유용합니다.',

  'addResources-des':
    '기존 번들에 여러 번역 엔트리를 추가합니다.\n전체 번들을 교체하지 않고 namespace를 증분 확장할 때 사용합니다.',

  'addResource-des':
    '단일 번역 엔트리를 추가하거나 덮어씁니다.\n일회성 오버라이드나 테스트 설정에 자주 사용됩니다.',

  'hasResourceBundle-des':
    '지정한 언어/namespace(및 build version)에 번들이 이미 로드됐는지 확인합니다.\n중복 로드를 피하거나 커스텀 preload를 구현할 때 유용합니다.',

  'getResource-des':
    '코어 리소스 스토어에서 단일 원본 번역 값을 가져옵니다.\n반환값은 포맷된 결과가 아니라 ICU 문자열 같은 원본 값입니다.\n고급 사용 사례나 디버깅 용도에 적합합니다.',

  'getResourceBundle-des':
    '지정한 언어/namespace의 전체 번들을 가져옵니다.\n로드된 번역을 저수준으로 확인하거나 도구를 만들 때 사용합니다.',

  'removeResourceBundle-des':
    '코어 스토어에서 번들을 제거합니다.\n메모리 해제 또는 지정 언어/namespace 재로드 강제에 사용할 수 있습니다.',

  'preloadNamespaces-des':
    '설정된 loader로 namespace를 미리 로드합니다.\n네비게이션 전에 공통 namespace를 먼저 로드해 첫 렌더의 빈 표시를 줄이는 데 유용합니다.',
  'preloadNamespaces-ex':
    "예:\npreloadNamespaces(['common', 'main-menu']).",
};

export default ko;

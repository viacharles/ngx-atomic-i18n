import en from "./en";

const ko: typeof en = {
  // 語言
  '中文 (ZH)': '중국어 (ZH)',
  '英文 (EN)': '영어 (EN)',
  '日文 (JA)': '일본어 (JA)',
  '韓文 (KO)': '한국어 (KO)',
  '西班牙文 (ES)': '스페인어 (ES)',
  // menu
  overview: '개요',
  'operational-testing': '운영 테스트',
  'getting-started': '시작하기',
  'methods-api': '메서드',
  'init-configuration-options': '초기 설정 - provideTranslationInit()',
  'comp-configuration-options': '컴포넌트 설정 - provideTranslation()',
  formatting: '포맷팅',

  // button
  '說明': '설명',
  '展開': '펼치기',
  '收合': '접기',
  '複製': '복사',
  '已複製': '복사됨',

  // namespace
  'common': '전역(폴백)',
  'select': '선택 필드(원자 컴포넌트)',
  'get-start': '시작하기(페이지)',
  'formatter': '포맷팅(페이지)',
  'comp-configuration': '컴포넌트 설정 - provideTranslation() (페이지)',
  'init-configuration': '초기 설정 - provideTranslationInit() (페이지)',
  'methods': '메서드(페이지)',
  'emit-i18n-json-assets': 'emit-i18n-json-assets (페이지)',
  'source-dialog': 'source-dialog(원자 컴포넌트)',

  // toast
  '載入翻譯': '언어 - {{lang}} - Namespace - {{namespace}} - 로드됨',
  '刪除翻譯': '언어 - {{lang}} - Namespace - {{namespace}} - 삭제됨'
};

export default ko;

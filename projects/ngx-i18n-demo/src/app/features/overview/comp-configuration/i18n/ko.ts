import en from "./en";

const ko: typeof en = {
  '＊ 符號表示重要常用功能': '＊ 중요하고 자주 쓰는 기능을 표시합니다',
  '全部參數': '전체 파라미터',
  'namespace-des': "이 컴포넌트의 번역 리소스 코드명(예: 'getting-started').\n이 값으로 TranslationService가 로드할 namespace와 키 조회 위치가 결정됩니다.\n해당 feature 폴더 이름과 반드시一致해야 합니다.(예: 번역 리소스가 header/en.json에 있다면, header 컴포넌트의 providers에 provideTranslation('header')를 설정해야 합니다.)",
  '頁層級': '페이지 레벨',
  'isPage-des': "하위 컴포넌트의 번역 폴백이 됩니다. 자식에서 키를 찾지 못하면 여기서 찾고, 여기에도 없으면 글로벌 namespace('common')에서 찾습니다.\n이 기능은 데이터 기반 UI(예: Data-Driven Tables, Data-Driven Forms 등)를 위한 설계입니다.\n깊은 컴포넌트 트리에서도 해당 페이지 레벨 번역을 안정적으로 사용할 수 있게 합니다."
};

export default ko;

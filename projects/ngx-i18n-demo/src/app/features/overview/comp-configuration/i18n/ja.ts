import en from "./en";

const ja: typeof en = {
  '＊ 符號表示重要常用功能': '＊ 重要でよく使う機能を示します',
  '全部參數': '全パラメータ',
  'namespace-des': "このコンポーネントの翻訳リソースのコード名（例: 'getting-started'）。\nこの値で TranslationService が読み込む namespace とキーの参照先が決まります。\n対応する feature フォルダ名と一致する必要があります。（例: 翻訳が header/en.json にあるなら、header コンポーネントは providers に provideTranslation('header') を設定する必要があります。）",
  '頁層級': 'ページレベル',
  'isPage-des': "子コンポーネントの翻訳フォールバックになります。子で見つからないキーはここから取得し、それでも見つからなければグローバル namespace（'common'）を探します。\nこの機能は Data-Driven Tables / Data-Driven Forms などのデータ駆動 UI のために設計されています。\n深い階層のコンポーネントでも、対応するページレベルの翻訳にアクセスできるようにするのが目的です。"
};

export default ja;

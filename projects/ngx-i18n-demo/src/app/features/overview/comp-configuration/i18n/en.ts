import zh_TW from "./zh-Hant";

const en: typeof zh_TW = {
  '＊ 符號表示重要常用功能': '＊ Indicates important and commonly used features',
  "全部參數": "All parameters",
  "namespace-des": "The code name for this component's translation resources (e.g., 'getting-started').\nThis value instructs the TranslationService which namespace to load and where to look up the translation keys.\nIt must be identical to the corresponding feature's folder name. (For example, if the translation resource is located at header/en.json, the corresponding component, header, must set provideTranslation('header') in its providers array.)",
  "頁層級": "Page level",
  "isPage-des": "This becomes the translation fallback for all child components. Missing translation keys not found in the child components will be retrieved from here, and only if the key is still not found here will the system look for it in the global namespace ('common').\nThis functionality is designed for scenarios involving data- driven UIs, such as Data-Driven Tables, Data - Driven Forms, and similar structures.\nThe purpose is to allow these deeply nested components to successfully access and consume the translations provided by their respective page - level component."
}

export default en;

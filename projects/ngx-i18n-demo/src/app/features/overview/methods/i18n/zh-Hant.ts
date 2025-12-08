const zh_TW = {
  '＊ 符號表示重要常用功能': '＊ 符號表示重要常用功能，其他的不看沒關係。',
  'lang-des':
    '以 signal 表示目前啟用中的語言。\n會與 currentLang 和 onLangChange 保持同步。',
  'currentLang-des':
    '目前啟用中的語言代碼。\n效果等同於呼叫 lang()。',
  'currentLang-ex': "例如：'en'、'zh-Hant'、'ja'。",

  'supportedLangs-des':
    '從設定解析而來的支援語言代碼清單。\n用來驗證被要求的語言是否受支援，避免載入未知的語系。',
  'supportedLangs-ex': "例如：['en', 'zh-Hant', 'ja']。",

  'readySignal-des':
    '表示命名空間載入狀態是否完成的 signal。\n當目前命名空間對應語言的翻譯資源載入完成後，會變為 true。\n\n常見用法：\n',
  'readySignal-i-1': '在樣板中使用 @if(translation.readySignal()){...} 來等有資料後才顯示。',

  'ready-des':
    'readySignal 的便利包裝（boolean 版本）。\n當目前命名空間在該語言下已完全載入時，會回傳 true。',

  'onLangChange-des':
    '語言 signal 的 observable 版本。\n提供給仍然依賴 RxJS、尚未改用 signal 的程式碼使用。',
  'onLangChange-emit': '會發出（emit）：',
  'onLangChange-emit-1':
    '每次成功呼叫 setLang() 時，發出新的語言代碼。',

  'onLangChange-usage': '常見用法：',
  'onLangChange-usage-1':
    '在不支援 signal 的 service 或舊有程式碼中訂閱，用來在語言變更時觸發對應邏輯。',

  'setLang-des':
    '切換目前啟用的語言，並觸發後續相關的更新流程。\n同時會：\n- 更新 lang signal\n- 更新 currentLang\n- 讓 onLangChange 發出新值。\n\n必須自行確保傳入的語言有包含在 supportedLangs 中。',
  'setLang-ex': "例如：\nsetLang('en')\nsetLang('zh-Hant')。",

  't-des':
    "執行'翻譯'這個動作。\n在此 service 所屬的命名空間中，解析指定 key 對應的翻譯字串，\n如果有傳入 params 參數，則會進行 ICU 格式化，同時套用預先設定的缺字行為",
  't-behavior': '行為說明：',
  't-behavior-i-1':
    '1. 若命名空間尚未就緒，則回傳空字串，且在開啟 debug 時輸出警告訊息。',
  't-behavior-i-2':
    '2-0. 若有開啟 enablePageFallback，會將設定為 page 的元件翻譯資源當作 fallback。',
  't-behavior-i-3':
    '2-1. 如果在目前命名空間都找不到該 key，會嘗試設定中的 fallback / global 命名空間來找翻譯。',
  't-behavior-i-4':
    "3. 如果仍然找不到，則依照 missingTranslationBehavior（'show-key'、'empty'、'throw-error' 或自訂字串）來決定回傳值。",
  't-ex':
    "例如：\nt('welcome.title')\nt('user.greeting', { name: 'Alice' })。",

  'addResourceBundle-des':
    '代理呼叫核心服務，用來註冊整個翻譯資源包（resource bundle）。\n適合在執行階段動態注入翻譯，例如從 API 或特定 feature 模組載入。',

  'addResources-des':
    '向既有的資源包中加入多筆翻譯條目。\n用於在不取代整個資源包的前提下，漸進式擴充某個命名空間。',

  'addResource-des':
    '在核心資源儲存中新增或覆寫單一翻譯條目。\n通常用於一次性的覆寫或測試情境。',

  'hasResourceBundle-des':
    '檢查指定語言與命名空間的資源包是否已載入。\n可用來避免重複載入，或在自訂預先載入（preload）邏輯中使用。',

  'getResource-des':
    '從核心資源儲存中取得單一原始翻譯值。\n回傳的是未經格式化的內容（例如 ICU 字串），而不是格式化後的結果。\n主要用在進階場景或除錯用途。',

  'getResourceBundle-des':
    '取得指定語言與命名空間對應的整個資源包物件。\n方便對已載入的翻譯做低階檢查，或提供給自訂工具使用。',

  'removeResourceBundle-des':
    '從核心儲存中移除一個資源包。\n可用於釋放記憶體，或強制在之後重新載入該語言／命名空間。',

  'preloadNamespaces-des':
    '使用目前設定的 loader，預先載入一個或多個命名空間。\n適合在導覽前先載入常用命名空間，降低畫面首次出現空白內容的機率。',
  'preloadNamespaces-ex':
    "例如：\npreloadNamespaces(['common', 'main-menu'])。",
};

export default zh_TW;

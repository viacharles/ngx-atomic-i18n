import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ConfigurationText {
  normalStructurePath = `一般專案的範例如下:
1-1. 扁平 - 用 namespace (feature 或 common) 資料夾區分
<專案根目錄>
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
設定範例:
i18nRoots: ['i18n']
pathTemplates: ['{{root}}/{{namespace}}/{{lang}}.json']
說明: root 代表 assets/i18n，namespace 為資料夾名稱，lang 為檔名。

1-2. 扁平 - 用 lang 資料夾區分
    └── assets
        └── i18n
            ├── en
            │    ├── feature-a.json
            │    ├── feature-b.json
            │.   └── common.json
            └── zh-Hant
                 ├── en.json
                 └── zh-Hant.json

設定範例:
i18nRoots: ['i18n']
pathTemplates: ['{{root}}/{{lang}}/{{namespace}}.json']
說明: root 代表 assets/i18n，lang 為資料夾名稱， namespace為檔名。

2. 巢狀
<專案根目錄>
└── src
    └── assets
        └── translations
            ├── features
            │   ├── feature-a
            │   └── feature-b
            └── global
                ├── common
                └── main-menu
設定範例:
i18nRoots: ['translations/features', 'translations/global']
pathTemplates: ['{{root}}/{{namespace}}/{{lang}}.json']
說明: 同時提供多個 root，loader 會依序嘗試。`;

  monorepoStructurePath = `在 Monorepo 專案的話，翻譯資源通常放在每個子專案底下，例如:
<根資料夾>
└── <子專案群的母資料夾>
    ├── admin-app/src/assets/i18n
    └── store-app/src/assets/i18n
設定範例:
i18nRoots: ['projects/admin-app/src/assets/i18n', 'projects/store-app/src/assets/i18n']
pathTemplates: ['{{root}}/{{namespace}}/{{lang}}.json']
說明: root 直接寫各 app 的 i18n 路徑即可，pathTemplates 也能重複利用。`;
}

import en from "./en";

const es: typeof en = {
  '介紹': 'Resumen',
  ' 最簡單 / 最高效 達成 Lazy load 的 Angular 翻譯套件': 'La biblioteca de traducción Angular más simple y eficiente con lazy load',
  '需求': 'Requisitos',
  '需求-1': 'Angular 16+ (sin dependencias de terceros en peerDependencies)',
  'des-dialog-需求': '1. Angular 16+ (con nuevas funciones como standalone y signals). 2. No depende de paquetes de terceros.',
  'des-dialog-極簡設定': "Configura una vez al iniciar:\nprovideTranslationInit({ supportedLangs: ['en', 'zh-Hant'] }),\nluego añade provideTranslation('namespace') en tus páginas/componentes y listo.",
  'des-dialog-頁面作為翻譯根': "Marca un componente de página con\nprovideTranslation('namespace', true)\ny los componentes hijos harán fallback automáticamente al namespace de esta página cuando no tengan la key.",
  'des-dialog-lazy-load': "Cada namespace se carga bajo demanda. Cuando un componente con\nprovideTranslation('namespace') se renderiza por primera vez, la librería solo descarga los recursos del idioma necesario.",
  'des-dialog-效能最佳化': "1. En CSR puedes usar preloadNamespaces() para precargar recursos antes del primer render y evitar retrasos iniciales.\n2. Un caché interno evita descargas duplicadas. La misma combinación de idioma, namespace y build version opcional ($\\text{lang} + \\text{namespace} + (\\text{buildVersion})$) se carga una sola vez y se comparte.\n3. Se cachean los formateadores para reducir ejecuciones repetidas de formato ICU y búsquedas de strings.\n4. Soporte de buildVersion para invalidar el caché cuando se despliega una nueva versión, evitando traducciones obsoletas.\n5. Usa signal.",
  'des-dialog-不閃key': 'Antes de que un namespace termine de cargar, la UI muestra cadenas vacías en vez de keys.\nCuando termina, se muestran las traducciones o el fallback configurado.',
  '說明': 'Detalles',
  '優點': 'Ventajas',
  '預設 lazy load': 'Lazy load por defecto',
  '動態切換語系': 'Cambiar idioma dinámicamente',
  '極簡設定': 'Configuración mínima',
  '支援 CSR/SSR/SSG': 'Soporta CSR/SSR/SSG',
  '頁面作為翻譯根': 'Página como raíz de traducción con fallback automático',
  '體積最小化': 'Tamaño de bundle mínimo',
  '效能最佳化': 'Rendimiento optimizado',
  '不閃 key': 'Sin parpadeo de keys',
  '開始使用': 'Empezar',
  '安裝': 'Instalación',
  '請在專案根目錄下 CLI 指令，下載安裝本套件:': 'Ejecuta el comando CLI en la raíz del proyecto para instalar:',
  'CLI 安裝指令': 'Comando de instalación CLI',
  '初始設定': 'Configuración inicial',
  '選擇專案類型，生成初始設定指引 :': 'Selecciona el tipo de proyecto para generar la guía de configuración inicial:',
  '網站渲染方式': 'Modo de renderizado',
  '專案架構': 'Arquitectura del proyecto',
  '應用程式啟動模式': 'Modo de arranque de la aplicación',
  'CSR 單專案：使用預設 /assets/i18n 載入路徑。': 'CSR proyecto único: usa la ruta de carga predeterminada /assets/i18n.',
  '在': 'en',
  '上設置': 'configura',
  '存放翻譯資源': 'Almacenar recursos de traducción',

  getStart: {
    storageNote: 'Tipo de archivo: json\nRuta de almacenamiento: assets/i18n,\nNombre global por defecto: common \nEjemplo de estructura de carpetas:',
    sourceArchitecture: `src/
└── app/
│   └── feature/
│   │   └── get-start/ get-start.component // Carga traducciones de 'assets/i18n/get-start' usando provideTranslation('get-start')
│   │       └── get-start-child/ get-start-child.component // Al habilitar enablePageFallback, la traducción hace fallback al valor get-start del componente padre en el árbol de inyección.(1)
│   └── shared/
│       └── header/ header.component // Carga traducciones de 'assets/i18n/header' usando provideTranslation('header')
└── assets/
    └── i18n/ // Estructura plana dentro de i18n
        ├── common/ // Palabras clave globales por defecto (p. ej., cadenas comunes)
        │   ├── en.json
        │   └── zh-Hant.json
        ├── header/ // Traducciones del componente 'header'
        │   ├── en.json
        │   └── zh-Hant.json
        └── get-start/ // Traducciones del componente 'get-start'
            ├── en.json
            └── zh-Hant.json`,
    config: {
      supportedLangHint: 'Usa el código de idioma de cada archivo (p. ej., en.json -> en, zh-Hant.json -> zh-Hant)',
      loader: {
        label: 'Configuración del loader',
        client: 'Configuración de carga en cliente',
        baseUrlMonorepo: 'En un monorepo, inicia las rutas desde /projects (junto a package.json)',
        server: 'Configuración de carga en servidor',
        baseDirMonorepo: 'La raíz de traducciones debe ser la raíz del monorepo (mismo nivel que package.json)',
        assetMonorepo: 'Ruta de assets para builds de monorepo',
        baseDirSingle: 'La raíz de traducciones debe ser la raíz del proyecto (mismo nivel que package.json)',
        assetSingle: 'Ruta de assets para proyectos únicos',
        clientDefaultPath: 'El cliente usa la ruta por defecto assets/i18n',
      }
    },
    jsonArchitecture: `// Datos de traducción
    assets/i18n/get-start/zh-Hant.json
    {
    title: "Main Title",
    section1: {
      title: "Title for Section 1",
      subTitle: "Subtitle for Section 1"
    },
    footer: {
      title: "Footer Title",
      subTitle: "Footer Subtitle"
    }
  }

  // Ejemplo de uso en HTML
  get-start.html
  <h1>{{ 'title' | t }}</h1>
  <h2>{{ 'section1.title' | t }}</h2>
  <h3>{{ 'section1.subTitle' | t }}</h3>

  // Ejemplo de uso en ts
  get-start.ts
  mainTitle = translateService.t('title');
  `,
    lazyLoad: {
      compComp: `// El componente standalone provee su namespace directamente
@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  providers: [
    provideTranslation('header'),  // El nombre debe coincidir con la carpeta.
  ],
})
export class HeaderComponent { }`,
      moduleComp: `// Componente tradicional de NgModule usando @Component.providers
@Component({
  selector: 'app-get-start',
  templateUrl: './get-start.component.html',
  providers: [
    provideTranslation('get-start'),  // El nombre debe coincidir con la carpeta.
  ],
})
export class GetStartComponent { }`,
      moduleModule: `// Proveer el namespace a nivel módulo para compartir entre componentes
@NgModule({
  declarations: [GetStartComponent],
  providers: [
    provideTranslation('get-start'),  // El nombre debe coincidir con la carpeta.
  ],
})
export class GetStartModule { }`
    }
  },
  '使用方法': 'Uso',
  '翻譯資源資料夾範例': 'Ejemplo de carpeta de traducciones',
  '載入翻譯資源': 'Cargar recursos de traducción',
  '從何處載入翻譯': 'Estrategia de carga',
  '載入設置範例': 'Ejemplo de configuración de carga',
  'CSR (一般選這個)': 'CSR (normalmente se elige este)',
  SSR: 'SSR',
  SSG: 'SSG',
  '一般獨立專案': 'Proyecto independiente',
  'Standalone (元件)': 'Standalone (Componente)',
  'NgModule (元件)': 'NgModule (Componente)',
  'NgModule (模組)': 'NgModule (Módulo)'
};

export default es;

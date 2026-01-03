import en from "./en";

const es: typeof en = {
  '＊ 符號表示重要常用功能': '＊ Indica funciones importantes y de uso frecuente',
  '全部參數': 'Todos los parámetros',
  'namespace-des': "El nombre en clave de los recursos de traducción de este componente (p. ej., 'getting-started').\nEste valor le indica a TranslationService qué namespace cargar y dónde buscar las keys.\nDebe ser idéntico al nombre de la carpeta feature correspondiente. (Por ejemplo, si el recurso está en header/en.json, el componente header debe establecer provideTranslation('header') en providers.)",
  '頁層級': 'Nivel de página',
  'isPage-des': "Se convierte en el fallback de traducción para todos los componentes hijos. Las keys que falten en los hijos se obtendrán desde aquí y, solo si tampoco existen aquí, el sistema buscará en el namespace global ('common').\nEsta funcionalidad está pensada para UIs basadas en datos, como Data-Driven Tables, Data-Driven Forms y similares.\nEl objetivo es que componentes profundamente anidados puedan acceder a las traducciones del componente de página correspondiente."
};

export default es;

import en from "./en";

const es: typeof en = {
  intro: {
    title: 'Introducción',
    des:
      'Una herramienta creada para gestionar recursos de traducción con TypeScript.\n' +
      'Busca en todo el proyecto carpetas llamadas "i18n" y convierte todos los archivos <namespace>/i18n/<lang>.ts a JSON, guardándolos en assets/i18n/<namespace>/<lang>.json.',
    advantage: {
      title: 'Ventajas',
      des:
        '1. Tipado seguro: si falta una key, TypeScript te lo indica. ¡Quien lo usa sabe lo útil que es!\n' +
        '2. Durante el desarrollo, los recursos viven dentro del namespace (feature), lo que encaja con el enfoque standalone/microservicios y facilita la gestión.'
    },
    weakpoint: {
      title: 'Desventajas',
      'des-1':
        '1. No se gestionan traducciones directamente como JSON. Si solo modificas TS, la UI no reflejará los cambios al instante; debes ejecutar este CLI para regenerar el JSON.\n',
      'des-2':
        '2. Solo puedes usar las rutas por defecto del paquete.\n' +
        'La ruta de recursos TS se restringe a i18n/<lang>.ts dentro de cada carpeta feature (namespace).\n' +
        'Los recursos JSON se restringen a assets/i18n/<namespace>/<lang>.json.',
      example: `<project-root>
└─ projects/
    └─ project-A/
        └─ src/
            ├─ app/
            │   └─ features/
            │        └─ feature-A/
            │            └─ i18n/
            │                ├─ en.ts
            │                └─ zh-Hant.ts
            │
            └─ assets/
                └─ i18n/
                    └─ feature-A/
                        ├─ en.json
                        └─ zh-Hant.json

Relación:
- i18n/<lang>.ts → assets/i18n/<namespace>/<lang>.json
- namespace = feature-A`
    }
  },
  '路徑範例': 'Ejemplo de ruta',
  setup: {
    title: 'Instalación',
    example: `// Comando de instalación
npm install -D emit-i18n-json-assets

// Ejemplo en package.json > scripts
"scripts": {
  "emit-i18n-json-assets": "emit-i18n-json-assets --src=projects/project-A/src/app --out=projects/project-A/src/assets/i18n"
}`
  },
  parameters: {
    title: 'Descripción de parámetros',
    src: {
      title: '--src',
      des: 'Especifica la ruta fuente de los recursos TS.'
    },
    out: {
      title: '--out',
      des: 'Especifica la ruta de salida de los recursos JSON.'
    }
  }
};

export default es;

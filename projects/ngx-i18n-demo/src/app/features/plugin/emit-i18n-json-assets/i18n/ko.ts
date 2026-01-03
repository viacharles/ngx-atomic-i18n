import en from "./en";

const ko: typeof en = {
  intro: {
    title: '소개',
    des:
      'TypeScript로 번역 리소스를 관리하기 위한 도구입니다.\n' +
      '프로젝트 전체에서 "i18n" 폴더를 찾아 <namespace>/i18n/<lang>.ts 파일을 JSON으로 변환한 뒤 assets/i18n/<namespace>/<lang>.json 경로에 저장합니다.',
    advantage: {
      title: '장점',
      des:
        '1. 타입 안전: 키가 누락되면 TypeScript가 어떤 키가 없는지 알려줍니다. 써본 사람은 다 압니다!\n' +
        '2. 개발 중 번역 리소스가 namespace(feature) 폴더 안에 있어 standalone/마이크로서비스 구조에 잘 맞고 관리가 쉽습니다.'
    },
    weakpoint: {
      title: '단점',
      'des-1':
        '1. JSON을 직접 관리하지 않습니다. TS만 수정하면 번역 화면에 즉시 반영되지 않으며, 이 CLI를 실행해 JSON을 다시 생성해야 합니다.\n',
      'des-2':
        '2. 패키지의 기본 경로만 사용할 수 있습니다.\n' +
        'TS 번역 리소스 경로는 각 feature(namespace) 폴더의 i18n/<lang>.ts로 제한됩니다.\n' +
        'JSON 번역 리소스는 assets/i18n/<namespace>/<lang>.json으로 제한됩니다.',
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

대응 관계:
- i18n/<lang>.ts → assets/i18n/<namespace>/<lang>.json
- namespace = feature-A`
    }
  },
  '路徑範例': '경로 예시',
  setup: {
    title: '설치',
    example: `// 설치 명령
npm install -D emit-i18n-json-assets

// package.json > scripts 예시
"scripts": {
  "emit-i18n-json-assets": "emit-i18n-json-assets --src=projects/project-A/src/app --out=projects/project-A/src/assets/i18n"
}`
  },
  parameters: {
    title: '파라미터 설명',
    src: {
      title: '--src',
      des: 'TypeScript 번역 리소스의 소스 경로를 지정합니다.'
    },
    out: {
      title: '--out',
      des: 'JSON 번역 리소스의 출력 경로를 지정합니다.'
    }
  }
};

export default ko;

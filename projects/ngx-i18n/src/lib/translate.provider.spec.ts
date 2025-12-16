jest.mock('@angular/core', () => {
  const actual = jest.requireActual('@angular/core');
  return {
    ...actual,
    isDevMode: jest.fn(),
  };
});
import { APP_INITIALIZER, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { provideTranslationInit, provideTranslationLoader, provideTranslation } from './translate.provider';
import { TranslationService } from './translation.service';
import { TestBed } from '@angular/core/testing';
import { TRANSLATION_LOADER, TRANSLATION_NAMESPACE, TRANSLATION_CONFIG, CLIENT_REQUEST_LANG, PAGE_TRANSLATION_ROOT } from './translate.token';
import { HttpTranslationLoader } from './translation.loader.csr';
import { FsTranslationLoader } from './translation.loader.ssr';
import { provideHttpClient } from '@angular/common/http';
import * as core from '@angular/core';
import { TranslationConfig } from './translate.type';

const createTransferStateStub = () => {
  const state: Record<string, any> = {};
  return {
    get: jest.fn((key: any, fallback: any) => {
      const k = key?.key ?? key;
      return k in state ? state[k] : fallback;
    }),
    set: jest.fn((key: any, value: any) => {
      const k = key?.key ?? key;
      state[k] = value;
    })
  } as any;
};

const extractConfig = (providers: any[], opts?: { platformId?: Object, transferState?: any, clientRequestLang?: string | null }) => {
  const flatProviders = providers.flat ? providers.flat() : providers;
  const configProvider = flatProviders.find((p: any) => p && p.provide === TRANSLATION_CONFIG);
  if (!configProvider) return null;
  if (configProvider.useValue) return configProvider.useValue;
  return (configProvider.useFactory as any)(
    opts?.platformId ?? 'browser',
    opts?.transferState ?? null,
    opts?.clientRequestLang ?? null,
  );
};

describe('provideTranslationInit', () => {
  it('should log debug enabled when debug is true', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => { });
    provideTranslationInit({ debug: true });
    expect(spy).toHaveBeenCalledWith('[ngx-i18n] Debug logging is enabled.');
    spy.mockRestore();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return providers with correct config', async () => {
    const providers = provideTranslationInit({ supportedLangs: ['en', 'zh-Hant'], customInitialLang: () => 'zh-Hant', preloadNamespaces: ['ns1', 'ns2'] });
    const config = extractConfig(providers);
    expect(config).toBeTruthy();
    expect(config?.supportedLangs).toContain('zh-Hant');
  });

  it('should call preloadNamespaces and setLang in APP_INITIALIZER', async () => {
    const preloadNamespaces = ['ns1', 'ns2'];
    const mockService = {
      preloadNamespaces: jest.fn().mockResolvedValue(undefined),
      setLang: jest.fn(),
      currentLang: 'en',
    } as any as TranslationService;
    const providers = provideTranslationInit({ supportedLangs: ['en'], preloadNamespaces });
    const flatProviders = providers.flat ? providers.flat() : providers;
    const appInitProvider = flatProviders.find((p: any) => p && p.provide === APP_INITIALIZER);
    expect(appInitProvider).toBeTruthy();
    const factory = appInitProvider.useFactory;
    await factory(mockService)();
    expect(mockService.preloadNamespaces).toHaveBeenCalledWith(preloadNamespaces, 'en');
    expect(mockService.setLang).toHaveBeenCalledWith('en');
  });

  it('should handle no preloadNamespaces', async () => {
    const mockService = {
      preloadNamespaces: jest.fn().mockResolvedValue(undefined),
      setLang: jest.fn(),
      currentLang: 'en',
    } as any as TranslationService;
    const providers = provideTranslationInit({ supportedLangs: ['en'] });
    const flatProviders = providers.flat ? providers.flat() : providers;
    const appInitProvider = flatProviders.find((p: any) => p && p.provide === APP_INITIALIZER);
    expect(appInitProvider).toBeTruthy();
    const factory = appInitProvider.useFactory;
    await factory(mockService)();
    expect(mockService.preloadNamespaces).not.toHaveBeenCalled();
    expect(mockService.setLang).toHaveBeenCalledWith('en');
  });

  it('should use default config when no userConfig provided', () => {
    const providers = provideTranslationInit();
    const config = extractConfig(providers);
    expect(config).toBeTruthy();
    expect(config?.supportedLangs).toEqual(['en']);
    expect(config?.fallbackNamespace).toBe('common');
    expect(config?.fallbackLang).toBe('en');
    expect(config?.i18nRoots).toEqual(['i18n']);
    expect(config?.missingTranslationBehavior).toBe('show-key');
    expect(config?.langDetectionOrder).toEqual(['url', 'clientRequest', 'localStorage', 'browser', 'customLang', 'fallback']);
  });

  it('should merge userConfig with default config', () => {
    const userConfig = {
      supportedLangs: ['en', 'zh'],
      fallbackNamespace: 'custom',
      missingTranslationBehavior: 'empty' as const
    };
    const providers = provideTranslationInit(userConfig);
    const config = extractConfig(providers);
    expect(config?.supportedLangs).toEqual(['en', 'zh']);
    expect(config?.fallbackNamespace).toBe('custom');
    expect(config?.missingTranslationBehavior).toBe('empty');
    expect(config?.fallbackLang).toBe('en');
    expect(config?.i18nRoots).toEqual(['i18n']);
  });

  it('should call detectPreferredLang and use its result', () => {
    const providers = provideTranslationInit({ supportedLangs: ['en', 'zh-Hant'] });
    const config = extractConfig(providers);
    expect(config).toBeTruthy();
    expect(typeof config?.customLang).toBe('string');
    expect(config?.customLang).toBe('en');
  });

  it('SSR + dev mode → assetPath = "src/assets" (no override)', () => {
    (core.isDevMode as jest.Mock).mockReturnValue(true);
    try {
      const providers = provideTranslationLoader({ loader: {} });
      const factory = (providers[0] as any).useFactory as (platformId: Object) => unknown;
      const loader = factory('server') as unknown as FsTranslationLoader;
      expect(loader).toBeInstanceOf(FsTranslationLoader);
      const opts = (loader as any).fsOptions ?? (loader as any)['fsOptions'];
      expect(opts.assetPath).toBe('src/assets');
    } finally {
      (core.isDevMode as jest.Mock).mockReset();
    }
  });

  it('SSR + prod mode → assetPath = "dist/browser/assets" (no override)', () => {
    (core.isDevMode as jest.Mock).mockReturnValue(false);
    try {
      const providers = provideTranslationLoader({ loader: {} });
      const factory = (providers[0] as any).useFactory as (platformId: Object) => unknown;
      const loader = factory('server') as unknown as FsTranslationLoader;
      expect(loader).toBeInstanceOf(FsTranslationLoader);
      const opts = (loader as any).fsOptions ?? (loader as any)['fsOptions'];
      expect(opts.assetPath).toBe('dist/browser/assets');
    } finally {
      (core.isDevMode as jest.Mock).mockReset();
    }
  });

  it('SSR + fsOptions.assetPath override → use override regardless of dev/prod', () => {
    (core.isDevMode as jest.Mock).mockReturnValue(true);
    try {
      const providers = provideTranslationLoader({
        loader: { fsOptions: { assetPath: '/custom/assets' } },
      });
      const factory = (providers[0] as any).useFactory as (platformId: Object) => unknown;
      const loader = factory('server') as unknown as FsTranslationLoader;
      expect(loader).toBeInstanceOf(FsTranslationLoader);
      const opts = (loader as any).fsOptions ?? (loader as any)['fsOptions'];
      expect(opts.assetPath).toBe('/custom/assets');
    } finally {
      (core.isDevMode as jest.Mock).mockReset();
    }
  });

  it('should produce customLang as detected string when custom initial hints are provided', () => {
    const userConfig = {
      supportedLangs: ['en', 'zh'],
      customLang: () => 'zh'
    };
    const providers = provideTranslationInit(userConfig);
    const config = extractConfig(providers);
    expect(typeof config?.customLang).toBe('string');
  });

  it('should handle different supportedLangs configurations', () => {
    const userConfig = {
      supportedLangs: ['zh', 'en'],
      fallbackLang: 'zh'
    };
    const providers = provideTranslationInit(userConfig);
    const config = extractConfig(providers);
    expect(config?.supportedLangs).toEqual(['zh', 'en']);
    expect(config?.fallbackLang).toBe('zh');
  });

  it('should handle custom langDetectionOrder', () => {
    const userConfig = {
      langDetectionOrder: ['fallback', 'customLang'] as TranslationConfig['langDetectionOrder']
    };
    const providers = provideTranslationInit(userConfig);
    const config = extractConfig(providers);
    expect(config?.langDetectionOrder).toEqual(['fallback', 'customLang']);
  });

  it('should handle custom missingTranslationBehavior', () => {
    const userConfig = {
      missingTranslationBehavior: 'throw' as const
    };
    const providers = provideTranslationInit(userConfig);
    const config = extractConfig(providers);
    expect(config?.missingTranslationBehavior).toBe('throw');
  });

  it('should handle custom i18nRoots', () => {
    const userConfig = {
      i18nRoots: ['custom-i18n', 'assets/i18n']
    };
    const providers = provideTranslationInit(userConfig);
    const config = extractConfig(providers);
    expect(config?.i18nRoots).toEqual(['custom-i18n', 'assets/i18n']);
  });

  it('should handle empty userConfig', () => {
    const providers = provideTranslationInit({});
    const config = extractConfig(providers);
    expect(config?.supportedLangs).toEqual(['en']);
    expect(config?.fallbackLang).toBe('en');
    expect(config?.fallbackNamespace).toBe('common');
  });

  it('should handle null userConfig', () => {
    const providers = provideTranslationInit(null as any);
    const config = extractConfig(providers);
    expect(config?.supportedLangs).toEqual(['en']);
    expect(config?.fallbackLang).toBe('en');
    expect(config?.fallbackNamespace).toBe('common');
  });
});

describe('provideTranslation', () => {
  it('should provide TranslationService and namespace for single namespace', () => {
    const providers = provideTranslation('home');
    const flatProviders = providers.flat ? providers.flat() : providers;
    const namespaceProvider = flatProviders.find((p: any) => p && p.provide === TRANSLATION_NAMESPACE);
    const serviceProvider = flatProviders.find((p: any) => p && (p.provide === TranslationService)) ?? flatProviders.find((p: any) => p === TranslationService);
    expect(namespaceProvider).toBeTruthy();
    expect(namespaceProvider.useValue).toBe('home');
    expect(serviceProvider).toBeTruthy();
    expect(serviceProvider === TranslationService || serviceProvider?.useClass === TranslationService).toBe(true);
  });

  it('should provide TranslationService and namespace for multiple namespaces', () => {
    const providers = provideTranslation(['home', 'auth']);
    const flatProviders = providers.flat ? providers.flat() : providers;
    const namespaceProvider = flatProviders.find((p: any) => p && p.provide === TRANSLATION_NAMESPACE);
    const serviceProvider = flatProviders.find((p: any) => p && (p.provide === TranslationService)) ?? flatProviders.find((p: any) => p === TranslationService);
    expect(namespaceProvider).toBeTruthy();
    expect(namespaceProvider.useValue).toEqual(['home', 'auth']);
    expect(serviceProvider).toBeTruthy();
    expect(serviceProvider === TranslationService || serviceProvider?.useClass === TranslationService).toBe(true);
  });

  it('should mark provider as page when isPage is true', () => {
    const providers = provideTranslation('home', true);
    const rootProvider = providers.find((p: any) => p && p.provide === PAGE_TRANSLATION_ROOT);
    expect(rootProvider?.useValue).toBe(true);
  });
});

describe('provideTranslationLoader (CSR)', () => {
  it('should use HttpTranslationLoader in CSR forceMode', async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        ...provideTranslationLoader({ loader: { forceMode: 'csr' } }),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();
    const loader = TestBed.inject<any>(TRANSLATION_LOADER);
    expect(loader).toBeInstanceOf(HttpTranslationLoader);
  });

  it('should use HttpTranslationLoader with custom httpOptions', async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        ...provideTranslationLoader({
          loader: {
            forceMode: 'csr',
            httpOptions: {
              baseUrl: '/custom/assets',
              pathTemplates: 'custom/i18n/{{namespace}}/{{lang}}.json'
            }
          }
        }),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    const loader = TestBed.inject<any>(TRANSLATION_LOADER);
    expect(loader).toBeInstanceOf(HttpTranslationLoader);
  });
});

describe('provideTranslationLoader (SSR)', () => {
  it('should use FsTranslationLoader in SSR forceMode', async () => {
    await TestBed.configureTestingModule({
      providers: [
        ...provideTranslationLoader({ loader: { forceMode: 'ssr' } }),
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    const loader = TestBed.inject<any>(TRANSLATION_LOADER);
    expect(loader).toBeInstanceOf(FsTranslationLoader);
  });

  it('should use FsTranslationLoader with default options when no fsOptions provided', async () => {
    await TestBed.configureTestingModule({
      providers: [
        ...provideTranslationLoader({ loader: { forceMode: 'ssr' } }),
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();
    const loader = TestBed.inject<any>(TRANSLATION_LOADER);
    expect(loader).toBeInstanceOf(FsTranslationLoader);
  });
});

describe('provideTranslationLoader (custom loader)', () => {
  it('should use custom csrLoader when provided', async () => {
    const customCsrLoader = jest.fn().mockReturnValue({ __mock: true });
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        ...provideTranslationLoader({
          loader: {
            forceMode: 'csr',
            csrLoader: customCsrLoader
          }
        }),
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    const loader = TestBed.inject<any>(TRANSLATION_LOADER);
    expect(loader.__mock).toBe(true);
  });

  it('should use custom ssrLoader when provided', async () => {
    const customSsrLoader = jest.fn().mockReturnValue({ __mock: true });
    await TestBed.configureTestingModule({
      providers: [
        ...provideTranslationLoader({
          loader: {
            forceMode: 'ssr',
            ssrLoader: customSsrLoader
          }
        }),
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();
    const loader = TestBed.inject<any>(TRANSLATION_LOADER);
    expect(loader.__mock).toBe(true);
  });
});

describe('provideTranslationLoader (fsOptions)', () => {
  it('should pass custom options to FsTranslationLoader', async () => {
    await TestBed.configureTestingModule({
      providers: [
        ...provideTranslationLoader({
          forceMode: 'ssr',
          fsOptions: {
            baseDir: '/custom/base',
            assetPath: 'my-assets',
            pathTemplates: ['custom/path/{{namespace}}/{{lang}}.json'],
            resolvePaths: jest.fn().mockReturnValue(['/test/path']),
            fsModule: { readFileSync: jest.fn(), statSync: jest.fn() }
          }
        }),
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    const loader = TestBed.inject<any>(TRANSLATION_LOADER);
    expect(loader).toBeInstanceOf(FsTranslationLoader);
  });

  it('should use default pathTemplates when not provided', async () => {
    await TestBed.configureTestingModule({
      providers: [
        ...provideTranslationLoader({
          forceMode: 'ssr',
          fsOptions: {
            baseDir: '/custom/base',
            assetPath: 'my-assets'
          }
        }),
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    const loader = TestBed.inject<any>(TRANSLATION_LOADER);
    expect(loader).toBeInstanceOf(FsTranslationLoader);
  });

  it('should handle process.cwd() fallback for baseDir', async () => {
    const originalCwd = process.cwd;
    process.cwd = jest.fn().mockReturnValue('/mock/cwd');

    await TestBed.configureTestingModule({
      providers: [
        ...provideTranslationLoader({
          forceMode: 'ssr'
        }),
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    const loader = TestBed.inject<any>(TRANSLATION_LOADER);
    expect(loader).toBeInstanceOf(FsTranslationLoader);

    process.cwd = originalCwd;
  });

  it('should handle process not defined for baseDir', async () => {
    const originalProcess = global.process;
    delete (global as any).process;

    await TestBed.configureTestingModule({
      providers: [
        ...provideTranslationLoader({
          forceMode: 'ssr'
        }),
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    const loader = TestBed.inject<any>(TRANSLATION_LOADER);
    expect(loader).toBeInstanceOf(FsTranslationLoader);

    global.process = originalProcess;
  });

  it('should handle isDevMode for assetPath', async () => {
    const originalIsDevMode = require('@angular/core').isDevMode;
    jest.doMock('@angular/core', () => ({
      ...jest.requireActual('@angular/core'),
      isDevMode: () => false
    }));

    await TestBed.configureTestingModule({
      providers: [
        ...provideTranslationLoader({
          forceMode: 'ssr'
        }),
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    const loader = TestBed.inject<any>(TRANSLATION_LOADER);
    expect(loader).toBeInstanceOf(FsTranslationLoader);

    jest.dontMock('@angular/core');
  });
});

describe('provideTranslationLoader (edge cases)', () => {
  it('should handle undefined options', () => {
    const providers = provideTranslationLoader();
    expect(providers).toBeDefined();
    expect(Array.isArray(providers)).toBe(true);
  });

  it('should handle empty options object', () => {
    const providers = provideTranslationLoader({});
    expect(providers).toBeDefined();
    expect(Array.isArray(providers)).toBe(true);
  });

  it('should test default initialLang function execution', () => {
    let capturedConfig: any;
    const spyDetectPreferredLang = jest.spyOn(require('./translate.util'), 'detectPreferredLang')
      .mockImplementation((config: any) => {
        capturedConfig = config;
        if (typeof config.customLang === 'function') {
          return config.customLang();
        }
        return config.fallbackLang;
      });

    const providers = provideTranslationInit();
    const config = extractConfig(providers, { platformId: 'browser', transferState: null, clientRequestLang: null });
    expect(spyDetectPreferredLang).toHaveBeenCalled();
    expect(typeof capturedConfig.customLang).toBe('undefined');
    expect(config?.customLang).toBe('en');

    spyDetectPreferredLang.mockRestore();
  });

  it('should carry clientRequestLang via TransferState on SSR', () => {
    const transfer = createTransferStateStub();
    const providers = provideTranslationInit({ supportedLangs: ['en', 'zh-Hant'] });
    const result = extractConfig(providers, { platformId: 'server', transferState: transfer, clientRequestLang: 'zh-Hant' });
    expect(result.clientRequestLang).toBe('zh-Hant');
    expect(transfer.set).toHaveBeenCalled();
  });

  it('should read clientRequestLang from TransferState on CSR', () => {
    const transfer = createTransferStateStub();
    const key = makeStateKey<string | null>('NGX_I18N_CLIENT_REQUEST_LANG');
    transfer.set(key, 'en');
    const providers = provideTranslationInit({ supportedLangs: ['en', 'zh-Hant'] });
    const result = extractConfig(providers, { platformId: 'browser', transferState: transfer, clientRequestLang: null });
    expect(result.clientRequestLang).toBe('en');
  });
});

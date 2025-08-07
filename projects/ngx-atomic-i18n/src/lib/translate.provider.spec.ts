import { APP_INITIALIZER, PLATFORM_ID } from '@angular/core';
import { provideTranslationInit, provideTranslationLoader } from './translate.provider';
import { TranslationService } from './translation.service';
import { TestBed } from '@angular/core/testing';
import { TRANSLATION_LOADER } from './translate.token';
import { HttpTranslationLoader } from './translation.loader.csr';
import { FsTranslationLoader } from './translation.loader.ssr';
import { provideHttpClient } from '@angular/common/http';

describe('provideTranslationInit', () => {
  it('should return providers with correct config', async () => {
    const providers = provideTranslationInit({ supportedLangs: ['en', 'zh-Hant'], initialLang: () => 'zh-Hant', preloadNamespaces: ['ns1', 'ns2'] });
    const flatProviders = providers.flat ? providers.flat() : providers;
    const configProvider = flatProviders.find((p: any) => p && p.provide && p.provide.toString().includes('TRANSLATION_CONFIG'));
    expect(configProvider).toBeTruthy();
    expect(configProvider && configProvider.useValue.supportedLangs).toContain('zh-Hant');
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
    // 改成用嚴格等號
    const appInitProvider = flatProviders.find((p: any) => p && p.provide === APP_INITIALIZER);
    expect(appInitProvider).toBeTruthy();
    // 執行 useFactory
    const factory = appInitProvider.useFactory;
    await factory(mockService)();
    expect(mockService.preloadNamespaces).toHaveBeenCalledWith(preloadNamespaces, 'en');
    expect(mockService.setLang).toHaveBeenCalledWith('en');
  });

});

describe('provideTranslationLoader (CSR)', () => {
  it('should use HttpTranslationLoader in CSR mode', async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        ...provideTranslationLoader(), // no override
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    const loader = TestBed.inject<any>(TRANSLATION_LOADER);
    expect(loader).toBeInstanceOf(HttpTranslationLoader);
  });
});

describe('provideTranslationLoader (SSR)', () => {
  it('should use FsTranslationLoader in SSR mode', async () => {
    await TestBed.configureTestingModule({
      providers: [
        ...provideTranslationLoader(),
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
          force: 'csr',
          csrLoader: customCsrLoader
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
          force: 'ssr',
          ssrLoader: customSsrLoader
        }),
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    const loader = TestBed.inject<any>(TRANSLATION_LOADER);
    expect(loader.__mock).toBe(true);
  });
});

describe('provideTranslationLoader (loaderOptions)', () => {
  it('should pass basePath and assetPath to FsTranslationLoader', async () => {
    const spy = jest.spyOn(FsTranslationLoader.prototype, 'constructor' as any);

    await TestBed.configureTestingModule({
      providers: [
        ...provideTranslationLoader({
          force: 'ssr',
          loaderOptions: {
            basePath: '/custom/base',
            assetPath: 'my-assets'
          }
        }),
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    }).compileComponents();

    const loader = TestBed.inject<any>(TRANSLATION_LOADER);
    expect(loader).toBeInstanceOf(FsTranslationLoader);
    // bonus: 若想確認路徑有設定可直接測試 private 欄位
    expect((loader as any).basePath).toBe('/custom/base');
    expect((loader as any).assetPath).toBe('my-assets');
  });
});



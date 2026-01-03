/**
 * @jest-environment node
 */
import 'jest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TranslationCoreService } from './translation-core.service';
import { ICU_FORMATTER_TOKEN, TRANSLATION_CONFIG, TRANSLATION_LOADER } from './translate.token';
import { TranslationConfig } from './translate.type';

describe('TranslationCoreService (node env)', () => {
  it('should skip localStorage when window is undefined', () => {
    const configMock: TranslationConfig = {
      supportedLangs: ['en', 'zh-Hant'],
      fallbackLang: 'en',
      customLang: () => 'en',
      i18nRoots: ['i18n'],
      pathTemplates: ['{{root}}/{{namespace}}/{{lang}}.json'],
      fallbackNamespace: 'common',
      missingTranslationBehavior: 'show-key',
      langDetectionOrder: ['localStorage', 'url', 'browser', 'customLang', 'fallback'],
      enablePageFallback: false,
      debug: false,
    };
    const loaderMock = {
      load: jest.fn().mockResolvedValue({ hello: 'world' })
    };
    const setItemSpy = jest.fn();
    Object.defineProperty(global, 'localStorage', {
      value: {
        setItem: setItemSpy,
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      configurable: true,
    });

    const injector = createEnvironmentInjector([
      { provide: TRANSLATION_CONFIG, useValue: configMock },
      { provide: TRANSLATION_LOADER, useValue: loaderMock },
      { provide: ICU_FORMATTER_TOKEN, useValue: null },
    ], null as any);
    let service: TranslationCoreService | undefined;
    runInInjectionContext(injector, () => {
      service = new TranslationCoreService();
    });

    service?.setLang('zh-Hant');

    expect(setItemSpy).not.toHaveBeenCalled();
    injector.destroy();
  });
});

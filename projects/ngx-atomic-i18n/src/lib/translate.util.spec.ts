import {
  detectPreferredLang,
  parseICU,
  flattenTranslations,
  toObservable,
  deepMerge,
  filterNewKeysDeep,
  getNested,
  detectBuildVersion
} from './translate.util';
import { TranslationConfig } from './translate.type';
import { EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

describe('translate.util (pure functions)', () => {
  describe('detectPreferredLang', () => {
    it('should return customLang if supported and langDetectionOrder is customLang', () => {
      const config: TranslationConfig = {
        supportedLangs: ['en', 'zh-Hant'],
        fallbackLang: 'en',
        i18nRoots: ['i18n'],
        fallbackNamespace: 'common',
        customLang: () => 'zh-Hant',
        langDetectionOrder: ['customLang', 'localStorage', 'url', 'browser', 'fallback'],
      };
      localStorage.clear()
      expect(detectPreferredLang(config)).toBe('zh-Hant');
    });
    it('should fallback to fallbackLang if no match', () => {
      const config: TranslationConfig = {
        supportedLangs: ['en'],
        fallbackLang: 'en',
        i18nRoots: ['i18n'],
        fallbackNamespace: 'common',
        customLang: () => 'fr',
        langDetectionOrder: ['localStorage', 'url', 'browser', 'customLang', 'fallback'],
      };
      expect(detectPreferredLang(config)).toBe('en');
    });
    it('should return fallbackLang if found lang is not supported', () => {
      const config: TranslationConfig = {
        supportedLangs: ['en'],
        fallbackLang: 'en',
        i18nRoots: ['i18n'],
        fallbackNamespace: 'common',
        customLang: () => 'fr',
        langDetectionOrder: ['customLang'],
      };
      // lang=fr, supportedLangs=['en']，會進入 if，但不 return，所以最後走到 return fallbackLang
      expect(detectPreferredLang(config)).toBe('en');
    });
    it('should detect language from localStorage', () => {
      const originalLocalStorage = global.localStorage;
      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: jest.fn().mockReturnValue('en'),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        configurable: true,
      });
      const config: TranslationConfig = {
        supportedLangs: ['en', 'zh-Hant'],
        fallbackLang: 'en',
        i18nRoots: ['i18n'],
        fallbackNamespace: 'common',
        customLang: () => 'zh-Hant',
        langDetectionOrder: ['localStorage', 'customLang'],
      };
      expect(detectPreferredLang(config)).toBe('en');
      if (originalLocalStorage !== undefined) {
        Object.defineProperty(global, 'localStorage', { value: originalLocalStorage, configurable: true });
      } else {
        delete (global as any).localStorage;
      }
    });
    it('should detect language from url', () => {
      const originalPathname = window.location.pathname;
      window.history.pushState({}, '', '/zh-Hant/foo/bar');
      const config: TranslationConfig = {
        supportedLangs: ['en', 'zh-Hant'],
        fallbackLang: 'en',
        i18nRoots: ['i18n'],
        fallbackNamespace: 'common',
        customLang: () => 'en',
        langDetectionOrder: ['url', 'customLang'],
      };
      expect(detectPreferredLang(config)).toBe('zh-Hant');
      window.history.pushState({}, '', originalPathname || '/');
    });
    it('should detect language from browser', () => {
      Object.defineProperty(global, 'navigator', {
        value: { language: 'zh-Hant-TW' },
        configurable: true,
      });
      const config: TranslationConfig = {
        supportedLangs: ['en', 'zh-Hant'],
        fallbackLang: 'en',
        i18nRoots: ['i18n'],
        fallbackNamespace: 'common',
        customLang: () => 'en',
        langDetectionOrder: ['browser', 'customLang'],
      };
      expect(detectPreferredLang(config)).toBe('zh-Hant');
      delete (global as any).navigator;
    });
    it('should detect language from customLang', () => {
      const config: TranslationConfig = {
        supportedLangs: ['en', 'zh-Hant'],
        fallbackLang: 'en',
        i18nRoots: ['i18n'],
        fallbackNamespace: 'common',
        customLang: () => 'zh-Hant',
        langDetectionOrder: ['customLang', 'fallback'],
      };
      expect(detectPreferredLang(config)).toBe('zh-Hant');
    });

    it('should detect language from clientRequest when provided', () => {
      const config: TranslationConfig = {
        supportedLangs: ['en', 'zh-Hant'],
        fallbackLang: 'en',
        i18nRoots: ['i18n'],
        fallbackNamespace: 'common',
        clientRequestLang: 'zh-Hant',
        langDetectionOrder: ['clientRequest', 'fallback'],
      };
      expect(detectPreferredLang(config)).toBe('zh-Hant');
    });

    it('should return fallback when order is empty', () => {
      const config: TranslationConfig = {
        supportedLangs: ['en'],
        fallbackLang: 'en',
        i18nRoots: ['i18n'],
        fallbackNamespace: 'common',
        langDetectionOrder: [],
      };
      expect(detectPreferredLang(config)).toBe('en');
    });

    it('should return raw fallbackLang when normalization fails', () => {
      const config: TranslationConfig = {
        supportedLangs: ['en'],
        fallbackLang: 'fr',
        i18nRoots: ['i18n'],
        fallbackNamespace: 'common',
        langDetectionOrder: [],
      };
      expect(detectPreferredLang(config)).toBe('fr');
    });
  });

  describe('parseICU', () => {
    it('should interpolate params', () => {
      expect(parseICU('Hello {{name}}!', { name: '世界' })).toBe('Hello 世界!');
    });
    it('should handle plural', () => {
      const template = '{count, plural, one {1 apple} other {# apples}}';
      expect(parseICU(template, { count: 1 })).toBe('1 apple');
      expect(parseICU(template, { count: 5 })).toBe('5 apples');
    });
    it('should handle select', () => {
      const template = '{gender, select, male {He} female {She} other {They}}';
      expect(parseICU(template, { gender: 'male' })).toBe('He');
      expect(parseICU(template, { gender: 'female' })).toBe('She');
      expect(parseICU(template, { gender: 'other' })).toBe('They');
    });
    it('should return template if no params', () => {
      expect(parseICU('No params')).toBe('No params');
    });
    it('should handle extractBlock not found', () => {
      // 觸發 extractBlock return ['', i]
      const template = '{a, select,}';
      expect(parseICU(template, { a: 'other' })).toBe('{a, select,}');
    });
    it('should handle extractOptions with no {', () => {
      // 觸發 extractOptions 的 continue
      const template = '{a, select, male He female She other They}';
      expect(parseICU(template, { a: 'male' })).toContain('He');
    });
    it('should handle resolveICU with no match', () => {
      // 觸發 resolveICU 的 if (!match)
      const template = '{a, unknown, ...}';
      expect(parseICU(template, { a: 'x' })).toContain('{a, unknown, ...}');
    });
    it('should handle nested ICU', () => {
      const template = '{count, plural, one {1 apple} other {{count} apples}}';
      expect(parseICU(template, { count: 2 })).toBe('2 apples');
    });

    it('should continue when block is empty', () => {
      // 這行會觸發 line97-98
      expect(parseICU('Test {}', {})).toBe('Test {}');
    });
    it('should skip empty block even when params provided', () => {
      expect(parseICU('Hello {} world', { x: 1 })).toBe('Hello  world');
    });
    it('should return rest string when block is not closed', () => {
      // 應該回傳原始未關閉的 block
      expect(parseICU('{abc', { abc: 1 })).toBe('{abc');
    });
    it('should interpolate params in deeply nested ICU', () => {
      const template = '{count, plural, one {{name} has one apple} other {{name} has # apples}}';
      expect(parseICU(template, { count: 2, name: 'Tom' })).toBe('Tom has 2 apples');
    });
  });

  describe('flattenTranslations', () => {
    it('should flatten nested objects', () => {
      const obj = { a: { b: { c: 'd' } }, e: 'f' };
      expect(flattenTranslations(obj)).toEqual({ 'a.b.c': 'd', e: 'f' });
    });
    it('should handle array values as string', () => {
      const obj = { list: [1, 2, 3] };
      expect(flattenTranslations(obj)).toEqual({ 'list': '1,2,3' });
    });
  });

  describe('deepMerge', () => {
    it('should deeply merge objects', () => {
      const a = { a: 1, b: { c: 2 } };
      const b = { b: { d: 3 } };
      expect(deepMerge(a, b)).toEqual({ a: 1, b: { c: 2, d: 3 } });
    });
  });

  describe('filterNewKeysDeep', () => {
    it('should filter only new keys', () => {
      const bundle = { a: 1, b: { c: 2, d: 3 } };
      const existing = { a: 1, b: { c: 2 } };
      expect(filterNewKeysDeep(bundle, existing)).toEqual({ b: { d: 3 } });
    });
  });

  describe('getNested', () => {
    it('should get nested value by path', () => {
      const obj = { a: { b: { c: 'd' } } };
      expect(getNested(obj, 'a.b.c')).toBe('d');
    });
    it('should return undefined for missing path', () => {
      const obj = { a: { b: { c: 'd' } } };
      expect(getNested(obj, 'a.b.x')).toBeUndefined();
    });
  });
});

describe('translate.util (injection context)', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    injector = TestBed.inject(EnvironmentInjector);
  });

  describe('toObservable', () => {
    it('should emit signal value', fakeAsync(() => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      runInInjectionContext(injector, () => {
        const s = signal(1);
        const obs = toObservable(s);
        const values: number[] = [];
        const sub = obs.subscribe(v => {
          values.push(v);
        });
        s.set(2);
        tick();
        expect(values).toEqual([1, 2]);
        sub.unsubscribe();
      });
      warnSpy.mockRestore();
    }));
  });
})

describe('translate.util', () => {
  describe('detectPreferredLang (extra branches)', () => {
    it('should log and return browser lang if supported', () => {
      const config: TranslationConfig = {
        supportedLangs: ['zh'],
        fallbackLang: 'en',
        i18nRoots: ['i18n'],
        fallbackNamespace: 'common',
        customLang: () => 'en',
        langDetectionOrder: ['browser'],
      };
      const origNavigator = global.navigator;
      Object.defineProperty(global, 'navigator', {
        value: { language: 'zh-TW' },
        configurable: true,
      });
      expect(detectPreferredLang(config)).toBe('zh');
      Object.defineProperty(global, 'navigator', { value: origNavigator, configurable: true });
    });
    it('should return fallbackLang if nothing matched', () => {
      const config: TranslationConfig = {
        supportedLangs: ['en'],
        fallbackLang: 'en',
        i18nRoots: ['i18n'],
        fallbackNamespace: 'common',
        customLang: () => 'fr',
        langDetectionOrder: ['customLang', 'fallback'],
      };
      expect(detectPreferredLang(config)).toBe('en');
    });
  });
});

describe('detectPreferredLang (SSR scenarios)', () => {
  it('should handle localStorage in SSR environment (window undefined)', () => {
    const originalWindow = global.window;
    delete (global as any).window;

    const config: TranslationConfig = {
      supportedLangs: ['en', 'zh-Hant'],
      fallbackLang: 'en',
      i18nRoots: ['i18n'],
      fallbackNamespace: 'common',
      langDetectionOrder: ['localStorage', 'fallback'],
    };

    expect(detectPreferredLang(config)).toBe('en');

    if (originalWindow) {
      (global as any).window = originalWindow;
    }
  });

  it('should handle url detection in SSR environment (window undefined)', () => {
    const originalWindow = global.window;
    delete (global as any).window;

    const config: TranslationConfig = {
      supportedLangs: ['en', 'zh-Hant'],
      fallbackLang: 'en',
      i18nRoots: ['i18n'],
      fallbackNamespace: 'common',
      langDetectionOrder: ['url', 'fallback'],
    };

    expect(detectPreferredLang(config)).toBe('en');

    if (originalWindow) {
      (global as any).window = originalWindow;
    }
  });

  it('should handle browser detection when navigator is undefined', () => {
    const originalNavigator = (globalThis as any).navigator;
    delete (globalThis as any).navigator;

    const config: TranslationConfig = {
      supportedLangs: ['en', 'zh-Hant'],
      fallbackLang: 'en',
      i18nRoots: ['i18n'],
      fallbackNamespace: 'common',
      langDetectionOrder: ['browser', 'fallback'],
    };

    expect(detectPreferredLang(config)).toBe('en');

    if (originalNavigator) {
      (globalThis as any).navigator = originalNavigator;
    }
  });

  it('should handle browser detection when language is empty string', () => {
    const originalNavigator = (globalThis as any).navigator;
    (globalThis as any).navigator = { language: '' };

    const config: TranslationConfig = {
      supportedLangs: ['en', 'zh-Hant'],
      fallbackLang: 'en',
      i18nRoots: ['i18n'],
      fallbackNamespace: 'common',
      langDetectionOrder: ['browser', 'fallback'],
    };

    expect(detectPreferredLang(config)).toBe('en');

    if (originalNavigator) {
      (globalThis as any).navigator = originalNavigator;
    }
  });

  it('should handle customLang as string instead of function', () => {
    const config: TranslationConfig = {
      supportedLangs: ['en', 'zh-Hant'],
      fallbackLang: 'en',
      i18nRoots: ['i18n'],
      fallbackNamespace: 'common',
      customLang: 'zh-Hant' as any, // 測試字串情況
      langDetectionOrder: ['customLang', 'fallback'],
    };

    expect(detectPreferredLang(config)).toBe('zh-Hant');
  });

  it('should handle customLang as undefined', () => {
    const config: TranslationConfig = {
      supportedLangs: ['en', 'zh-Hant'],
      fallbackLang: 'en',
      i18nRoots: ['i18n'],
      fallbackNamespace: 'common',
      customLang: undefined,
      langDetectionOrder: ['customLang', 'fallback'],
    };

    expect(detectPreferredLang(config)).toBe('en');
  });
});

describe('parseICU (edge cases)', () => {
  it('should handle missing parameter in template replacement', () => {
    const template = 'Hello {{name}} and {{missing}}!';
    expect(parseICU(template, { name: 'World' })).toBe('Hello World and !');
  });

  it('should handle missing variable in ICU expression', () => {
    const template = '{missing, plural, one {1 item} other {# items}}';
    expect(parseICU(template, {})).toBe('{missing, plural, one {1 item} other {# items}}');
  });

    it('should handle parameter replacement in nested ICU with missing params', () => {
      const template = '{count, plural, one {{name} has one} other {{missing} has #}}';
      expect(parseICU(template, { count: 2, name: 'Tom' })).toBe(' has 2');
    });
    it('should handle missing count but non-empty params', () => {
      const template = '{count, plural, one {1 item} other {# items}}';
      expect(parseICU(template, { other: 1 })).toBe(' items');
    });

  it('should handle exact value match in select', () => {
    const template = '{value, select, =5 {exactly five} other {not five}}';
    expect(parseICU(template, { value: '5' })).toBe('exactly five');
  });

  it('should handle no selected option found', () => {
    const template = '{gender, select, male {He} female {She}}';
    expect(parseICU(template, { gender: 'unknown' })).toBe('{gender, select, male {He} female {She}}');
  });
});

describe('toObservable (error cases)', () => {
  it('should throw error when called outside injection context', () => {
    const s = signal(1);
    expect(() => toObservable(s)).toThrow('NG0203');
  });

});

describe('toArray', () => {
  it('should return array as is when input is array', () => {
    const { tempToArray } = require('./translate.util');
    expect(tempToArray(['a', 'b'])).toEqual(['a', 'b']);
  });

  it('should wrap string in array', () => {
    const { tempToArray } = require('./translate.util');
    expect(tempToArray('single')).toEqual(['single']);
  });

  it('should return undefined for falsy values', () => {
    const { tempToArray } = require('./translate.util');
    expect(tempToArray(null)).toBeUndefined();
    expect(tempToArray(undefined)).toBeUndefined();
    expect(tempToArray('')).toBeUndefined();
  });
});

describe('detectBuildVersion', () => {
  it('should return version when script src matches pattern', () => {
    const original = (document as any).scripts;
    Object.defineProperty(document as any, 'scripts', {
      value: [
        { src: 'https://cdn/app/polyfills.12345678.hash.js' },
        { src: 'https://cdn/app/main.abcdef12.bundle.js' },
      ],
      configurable: true,
    });
    expect(detectBuildVersion()).toBe('12345678');
    if (original !== undefined) {
      Object.defineProperty(document as any, 'scripts', { value: original, configurable: true });
    } else {
      delete (document as any).scripts;
    }
  });

  it('should return null when no matching scripts', () => {
    const original = (document as any).scripts;
    Object.defineProperty(document as any, 'scripts', {
      value: [{ src: 'https://cdn/other.js' }], configurable: true,
    });
    expect(detectBuildVersion()).toBeNull();
    if (original !== undefined) {
      Object.defineProperty(document as any, 'scripts', { value: original, configurable: true });
    } else {
      delete (document as any).scripts;
    }
  });

  it('should return null when scripts is missing', () => {
    const original = (document as any).scripts;
    Object.defineProperty(document as any, 'scripts', { value: undefined, configurable: true });
    expect(detectBuildVersion()).toBeNull();
    if (original !== undefined) {
      Object.defineProperty(document as any, 'scripts', { value: original, configurable: true });
    } else {
      delete (document as any).scripts;
    }
  });

  it('should return null when accessing scripts throws (catch branch)', () => {
    const original = (document as any).scripts;
    Object.defineProperty(document as any, 'scripts', {
      get() { throw new Error('boom'); },
      configurable: true,
    });
    expect(detectBuildVersion()).toBeNull();
    if (original !== undefined) {
      Object.defineProperty(document as any, 'scripts', { value: original, configurable: true });
    } else {
      delete (document as any).scripts;
    }
  });
});

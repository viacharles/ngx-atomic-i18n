import {
    detectPreferredLang,
    parseICU,
    flattenTranslations,
    toObservable,
    deepMerge,
    filterNewKeysDeep,
    getNested
} from './translate.util';
import { TranslationConfig } from './translate.type';
import { signal } from '@angular/core';

describe('translate.util', () => {
    describe('detectPreferredLang', () => {
        it('should return initialLang if supported', () => {
            const config: TranslationConfig = {
                supportedLangs: ['en', 'zh-Hant'],
                fallbackLang: 'en',
                i18nRoots: ['i18n'],
                fallbackNamespace: 'common',
                initialLang: () => 'zh-Hant',
            };
            expect(detectPreferredLang(config)).toBe('zh-Hant');
        });
        it('should fallback to fallbackLang if no match', () => {
            const config: TranslationConfig = {
                supportedLangs: ['en'],
                fallbackLang: 'en',
                i18nRoots: ['i18n'],
                fallbackNamespace: 'common',
                initialLang: () => 'fr',
            };
            expect(detectPreferredLang(config)).toBe('en');
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
    });

    describe('flattenTranslations', () => {
        it('should flatten nested objects', () => {
            const obj = { a: { b: { c: 'd' } }, e: 'f' };
            expect(flattenTranslations(obj)).toEqual({ 'a.b.c': 'd', e: 'f' });
        });
    });

    describe('toObservable', () => {
        it('should emit signal value', (done) => {
            const s = signal(1);
            const obs = toObservable(s);
            const values: number[] = [];
            const sub = obs.subscribe(v => {
                values.push(v);
                if (values.length === 2) {
                    expect(values).toEqual([1, 2]);
                    sub.unsubscribe();
                    done();
                }
            });
            s.set(2);
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
            expect(filterNewKeysDeep(bundle, existing)).toEqual({ b: { c: 2, d: 3 } });
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
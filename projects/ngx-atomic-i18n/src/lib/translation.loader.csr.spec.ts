import 'jest';
import { HttpTranslationLoader } from './translation.loader.csr';
import { of, throwError } from 'rxjs';

describe('HttpTranslationLoader', () => {
  let loader: HttpTranslationLoader;
  let httpMock: any;

  beforeEach(() => {
    httpMock = {
      get: jest.fn()
    };
    loader = new HttpTranslationLoader(httpMock);
    jest.clearAllMocks();
  });

  it('should load translation from first available root', async () => {
    // 第一個 root 就找到
    httpMock.get.mockReturnValueOnce(of({ hello: 'world' }));
    const result = await loader.load(['root1', 'root2'], 'ns', 'en');
    expect(result).toEqual({ hello: 'world' });
  });

  it('should load translation from second root if first fails', async () => {
    // 第一個 root 失敗，第二個 root 成功
    httpMock.get
      .mockImplementationOnce(() => throwError(() => new Error('not found')))
      .mockImplementationOnce(() => of({ hi: 'earth' }));
    const result = await loader.load(['root1', 'root2'], 'ns', 'en');
    expect(result).toEqual({ hi: 'earth' });
  });

  it('should throw if no translation found', async () => {
    // 全部 root 都失敗
    httpMock.get.mockImplementation(() => ({
      subscribe: (_cb: any, errCb: any) => { errCb(new Error('not found')); return { unsubscribe() { } }; }
    }));
    // @ts-ignore
    await expect(loader.load(['root1', 'root2'], 'ns', 'en')).rejects.toThrow('[i18n] ns.json for en not found in any i18nRoot');
  });

  it('should handle empty i18nRoots array', async () => {
    // Test line 13: const roots = toArray(i18nRoots) ?? [];
    httpMock.get.mockImplementation(() => ({
      subscribe: (_cb: any, errCb: any) => { errCb(new Error('not found')); return { unsubscribe() { } }; }
    }));
    await expect(loader.load([], 'ns', 'en')).rejects.toThrow('[i18n] ns.json for en not found in any i18nRoot');
  });

  it('should handle null i18nRoots to test toArray fallback', async () => {
    // Test line 13: const roots = toArray(i18nRoots) ?? [];
    // This tests the ?? [] fallback when toArray returns undefined
    httpMock.get.mockImplementation(() => ({
      subscribe: (_cb: any, errCb: any) => { errCb(new Error('not found')); return { unsubscribe() { } }; }
    }));
    await expect(loader.load(null as any, 'ns', 'en')).rejects.toThrow('[i18n] ns.json for en not found in any i18nRoot');
  });

  it('should handle different baseUrl formats', async () => {
    // Test lines 16-18: URL construction logic
    httpMock.get.mockReturnValueOnce(of({ hello: 'world' }));

    // Test with https URL
    const httpsLoader = new HttpTranslationLoader(httpMock, { httpBaseUrl: 'https://example.com/assets' });
    const result1 = await httpsLoader.load(['root1'], 'ns', 'en');
    expect(result1).toEqual({ hello: 'world' });

    // Test with relative path without leading slash
    httpMock.get.mockReturnValueOnce(of({ hello: 'world2' }));
    const relativeLoader = new HttpTranslationLoader(httpMock, { httpBaseUrl: 'assets' });
    const result2 = await relativeLoader.load(['root1'], 'ns', 'en');
    expect(result2).toEqual({ hello: 'world2' });
  });

  it('should cache successful template and reorder for next requests', async () => {
    // Test line 21: template caching logic
    const customLoader = new HttpTranslationLoader(httpMock, {
      pathTemplates: ['template1/{{namespace}}/{{lang}}.json', 'template2/{{namespace}}/{{lang}}.json']
    });

    // First request fails with template1, succeeds with template2
    httpMock.get
      .mockImplementationOnce(() => throwError(() => new Error('not found')))
      .mockImplementationOnce(() => of({ hello: 'cached' }));

    const result1 = await customLoader.load(['root1'], 'ns', 'en');
    expect(result1).toEqual({ hello: 'cached' });

    // Second request should try template2 first (cached template)
    httpMock.get.mockReturnValueOnce(of({ hello: 'from cache order' }));
    const result2 = await customLoader.load(['root1'], 'ns', 'en');
    expect(result2).toEqual({ hello: 'from cache order' });
  });
});

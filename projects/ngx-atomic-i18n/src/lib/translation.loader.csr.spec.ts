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
    httpMock.get.mockReturnValueOnce(of({ hello: 'world' }));
    const result = await loader.load(['root1', 'root2'], 'ns', 'en');
    expect(result).toEqual({ hello: 'world' });
  });

  it('should load translation from second root if first fails', async () => {
    httpMock.get
      .mockImplementationOnce(() => throwError(() => new Error('not found')))
      .mockImplementationOnce(() => of({ hi: 'earth' }));
    const result = await loader.load(['root1', 'root2'], 'ns', 'en');
    expect(result).toEqual({ hi: 'earth' });
  });

  it('should throw if no translation found', async () => {
    httpMock.get.mockImplementation(() => ({
      subscribe: (_cb: any, errCb: any) => { errCb(new Error('not found')); return { unsubscribe() { } }; }
    }));
    // @ts-ignore
    await expect(loader.load(['root1', 'root2'], 'ns', 'en')).rejects.toThrow('[i18n] ns.json for en not found in any i18nRoot');
  });

  it('should handle empty i18nRoots array', async () => {
    httpMock.get.mockImplementation(() => ({
      subscribe: (_cb: any, errCb: any) => { errCb(new Error('not found')); return { unsubscribe() { } }; }
    }));
    await expect(loader.load([], 'ns', 'en')).rejects.toThrow('[i18n] ns.json for en not found in any i18nRoot');
  });

  it('should handle null i18nRoots to test toArray fallback', async () => {
    httpMock.get.mockImplementation(() => ({
      subscribe: (_cb: any, errCb: any) => { errCb(new Error('not found')); return { unsubscribe() { } }; }
    }));
    await expect(loader.load(null as any, 'ns', 'en')).rejects.toThrow('[i18n] ns.json for en not found in any i18nRoot');
  });

  it('should handle different baseUrl formats', async () => {
    httpMock.get.mockReturnValueOnce(of({ hello: 'world' }));

    const httpsLoader = new HttpTranslationLoader(httpMock, { httpBaseUrl: 'https://example.com/assets' });
    const result1 = await httpsLoader.load(['root1'], 'ns', 'en');
    expect(result1).toEqual({ hello: 'world' });

    httpMock.get.mockReturnValueOnce(of({ hello: 'world2' }));
    const relativeLoader = new HttpTranslationLoader(httpMock, { httpBaseUrl: 'assets' });
    const result2 = await relativeLoader.load(['root1'], 'ns', 'en');
    expect(result2).toEqual({ hello: 'world2' });
  });

  it('should cache successful template and reorder for next requests', async () => {
    const customLoader = new HttpTranslationLoader(httpMock, {
      pathTemplates: ['template1/{{namespace}}/{{lang}}.json', 'template2/{{namespace}}/{{lang}}.json']
    });

    httpMock.get
      .mockImplementationOnce(() => throwError(() => new Error('not found')))
      .mockImplementationOnce(() => of({ hello: 'cached' }));

    const result1 = await customLoader.load(['root1'], 'ns', 'en');
    expect(result1).toEqual({ hello: 'cached' });

    httpMock.get.mockReturnValueOnce(of({ hello: 'from cache order' }));
    const result2 = await customLoader.load(['root1'], 'ns', 'en');
    expect(result2).toEqual({ hello: 'from cache order' });
  });
});

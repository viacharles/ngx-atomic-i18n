import 'jest';
import { HttpTranslationLoader } from './translation.loader.csr';
import { defaultConfig } from './translate.provider';
import { of, throwError } from 'rxjs';
import { detectBuildVersion } from './translate.util';
jest.mock('./translate.util', () => {
  const actual = jest.requireActual('./translate.util');
  return { ...actual, detectBuildVersion: jest.fn(() => 'vh1') };
});

describe('HttpTranslationLoader', () => {
  let loader: HttpTranslationLoader;
  let httpMock: any;

  beforeEach(() => {
    httpMock = {
      get: jest.fn()
    };
    loader = new HttpTranslationLoader(httpMock, {}, defaultConfig.pathTemplates);
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

    const httpsLoader = new HttpTranslationLoader(httpMock, { baseUrl: 'https://example.com/assets' }, defaultConfig.pathTemplates);
    const result1 = await httpsLoader.load(['root1'], 'ns', 'en');
    expect(result1).toEqual({ hello: 'world' });

    httpMock.get.mockReturnValueOnce(of({ hello: 'world2' }));
    const relativeLoader = new HttpTranslationLoader(httpMock, { baseUrl: 'assets' }, defaultConfig.pathTemplates);
    const result2 = await relativeLoader.load(['root1'], 'ns', 'en');
    expect(result2).toEqual({ hello: 'world2' });
  });

  it('should append build version as query string when available', async () => {
    // first call returns success
    httpMock.get.mockReturnValueOnce(of({ ok: true }));
    const result = await loader.load(['root1'], 'ns', 'en');
    expect(result).toEqual({ ok: true });
    // verify that the request URL contains ?v=vh1
    const calledUrl = (httpMock.get.mock.calls[0][0]) as string;
    expect(calledUrl.includes('v=vh1')).toBe(true);
  });

  it('should append &v when URL already has query parameters', async () => {
    httpMock.get.mockReturnValueOnce(of({ ok: true }));
    const custom = new HttpTranslationLoader(httpMock, {
      pathTemplates: 'i18n/{{namespace}}/{{lang}}.json?foo=1'
    }, 'i18n/{{namespace}}/{{lang}}.json?foo=1');
    const result = await custom.load(['root1'], 'ns', 'en');
    expect(result).toEqual({ ok: true });
    const calledUrl = (httpMock.get.mock.calls[0][0]) as string;
    expect(calledUrl).toContain('&v=vh1');
  });

  it('should use default pathTemplates when none provided', async () => {
    httpMock.get.mockReturnValueOnce(of({ ok: true }));
    const loader = new HttpTranslationLoader(httpMock, {}, defaultConfig.pathTemplates as any);
    const result = await loader.load(['root1'], 'ns', 'en');
    expect(result).toEqual({ ok: true });
    const calledUrl = (httpMock.get.mock.calls[0][0]) as string;
    expect(calledUrl).toContain('ns/en.json');
    expect(calledUrl).toContain('v=');
  });

  it('should use cached template order on subsequent calls', async () => {
    httpMock.get
      .mockReturnValueOnce(of({ ok: true }))
      .mockReturnValueOnce(of({ ok: true }));
    const loader = new HttpTranslationLoader(httpMock, undefined as any, ['t1/{{namespace}}/{{lang}}.json', 't2/{{namespace}}/{{lang}}.json']);
    await loader.load(['root1'], 'ns', 'en');
    await loader.load(['root1'], 'ns', 'en');
    const first = (httpMock.get.mock.calls[0][0]) as string;
    const second = (httpMock.get.mock.calls[1][0]) as string;
    expect(first).toContain('t1');
    expect(second).toContain('t1');
  });

  it('should append version when cached template already has query', async () => {
    httpMock.get.mockReturnValueOnce(of({ ok: true }));
    const loader = new HttpTranslationLoader(httpMock, undefined as any, ['t1/{{namespace}}/{{lang}}.json?foo=1']);
    (loader as any).pathTemplateCache = 't1/{{namespace}}/{{lang}}.json?foo=1';
    await loader.load(['root1'], 'ns', 'en');
    const calledUrl = (httpMock.get.mock.calls[0][0]) as string;
    expect(calledUrl).toContain('&v=');
  });

  it('should use cached template branch explicitly', async () => {
    httpMock.get.mockReturnValueOnce(of({ ok: true }));
    const loader = new HttpTranslationLoader(httpMock, undefined as any, ['t1/{{namespace}}/{{lang}}.json']);
    (loader as any).pathTemplateCache = 't1/{{namespace}}/{{lang}}.json';
    await loader.load(['root1'], 'ns', 'en');
    expect(httpMock.get).toHaveBeenCalled();
  });

  it('should not append version when detectBuildVersion returns null', async () => {
    (detectBuildVersion as unknown as jest.Mock).mockReturnValueOnce(null);
    httpMock.get.mockReturnValueOnce(of({ ok: true }));
    const result = await loader.load(['root1'], 'ns', 'en');
    expect(result).toEqual({ ok: true });
    const calledUrl = (httpMock.get.mock.calls[0][0]) as string;
    expect(calledUrl.includes('v=')).toBe(false);
  });

  it('should cache successful template and reorder for next requests', async () => {
    const customLoader = new HttpTranslationLoader(httpMock, {
      pathTemplates: ['template1/{{namespace}}/{{lang}}.json']
    }, ['template1/{{namespace}}/{{lang}}.json']);

    httpMock.get.mockReturnValueOnce(of({ hello: 'cached' }));

    const result1 = await customLoader.load(['root1'], 'ns', 'en');
    expect(result1).toEqual({ hello: 'cached' });

    httpMock.get.mockReturnValueOnce(of({ hello: 'cached-again' }));
    const result2 = await customLoader.load(['root1'], 'ns', 'en');
    expect(result2).toEqual({ hello: 'cached-again' });
  });
});

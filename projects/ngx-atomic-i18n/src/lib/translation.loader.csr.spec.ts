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
}); 
import 'jest';
import { HttpTranslationLoader } from './translation.loader.csr';

describe('HttpTranslationLoader', () => {
    let loader: HttpTranslationLoader;
    let httpMock: any;

    beforeEach(() => {
        httpMock = {
            get: jest.fn()
        };
        loader = new HttpTranslationLoader(httpMock);
    });

    it('should load translation from first available root', async () => {
        httpMock.get.mockReturnValueOnce({ toPromise: () => Promise.resolve({ hello: 'world' }) });
        httpMock.get.mockReturnValueOnce({ toPromise: () => Promise.resolve({}) });
        // 模擬 RxJS firstValueFrom 行為
        httpMock.get.mockReturnValueOnce({ subscribe: (cb: any) => cb({ hello: 'world' }) });
        const result = await loader.load(['root1', 'root2'], 'ns', 'en');
        expect(result).toBeDefined();
    });

    it('should throw if no translation found', async () => {
        httpMock.get.mockImplementation(() => { throw new Error('not found'); });
        await expect(loader.load(['root1'], 'ns', 'en')).rejects.toThrow();
    });
}); 
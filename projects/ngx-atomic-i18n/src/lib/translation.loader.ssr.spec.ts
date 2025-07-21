import 'jest';
import { FsTranslationLoader } from './translation.loader.ssr';

describe('FsTranslationLoader', () => {
    let loader: FsTranslationLoader;

    beforeEach(() => {
        loader = new FsTranslationLoader();
    });

    it('should throw if translation file not found', async () => {
        await expect(loader.load(['not-exist'], 'ns', 'en')).rejects.toThrow();
    });
}); 
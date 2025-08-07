import 'jest';
import { FsModuleLike, FsTranslationLoader } from './translation.loader.ssr';
import { TestBed } from '@angular/core/testing';
import { TRANSLATION_LOADER } from './translate.token';
import { vol } from 'memfs';

describe('FsTranslationLoader', () => {
  const basePath = '/mock';
  const assetPath = '/dist/browser/assets';
  const mockFs: FsModuleLike = {
    readFileSync(path: string, encoding: 'utf8') {
      return vol.readFileSync(path, encoding).toString();
    }
  };
  beforeAll(() => {
    vol.fromJSON({
      [basePath + assetPath + '/i18n/en/common.json']: JSON.stringify({ hello: 'Hello from fs!' })
    });
  });

  afterAll(() => {
    vol.reset(); // ✅ 清空虛擬檔案系統
  });

  it('should load translation file from fs', async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: TRANSLATION_LOADER,
          useValue: new FsTranslationLoader(basePath, assetPath, mockFs)
        }
      ]
    }).compileComponents();

    const loader = TestBed.inject(TRANSLATION_LOADER);
    const result = await loader.load(['i18n'], 'common', 'en');

    expect(result).toEqual({ hello: 'Hello from fs!' });
  });

  it('should throw error if translation file not found in any i18nRoot', async () => {
    const loader = new FsTranslationLoader(basePath, assetPath, mockFs);
    await expect(loader.load(['nonexistentRoot'], 'common', 'en'))
      .rejects
      .toThrow('[SSR i18n] common.json for en not found in any i18nRoot');
  });

  it('should fallback to node:fs when fsModule not provided', async () => {
    // 使用 real fs 模組寫入檔案
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const tmp = await import('node:os');
    const tmpDir = await fs.mkdtemp(path.join(tmp.tmpdir(), 'test-i18n-'));

    const testFilePath = path.join(tmpDir, 'dist/browser/assets/i18n/en/common.json');
    await fs.mkdir(path.dirname(testFilePath), { recursive: true });
    await fs.writeFile(testFilePath, JSON.stringify({ hello: 'real fs fallback' }), 'utf8');

    const loader = new FsTranslationLoader(tmpDir);
    const result = await loader.load(['i18n'], 'common', 'en');
    expect(result).toEqual({ hello: 'real fs fallback' });
  });

  it('should skip missing root and succeed with fallback root', async () => {
    const loader = new FsTranslationLoader(basePath, assetPath, mockFs);
    const fallbackRoot = 'i18nFallback';

    // 加一個 fallback root 中的檔案
    vol.fromJSON({
      [`${basePath + assetPath}/${fallbackRoot}/en/common.json`]: JSON.stringify({ hello: 'from fallback' })
    });

    const result = await loader.load(['nonexistentRoot', fallbackRoot], 'common', 'en');
    expect(result).toEqual({ hello: 'from fallback' });
  });

  it('should use process.cwd() when basePath is not provided', async () => {
    const loader = new FsTranslationLoader(undefined, assetPath, mockFs);
    expect((loader as any).basePath).toBe(process.cwd());
  });
});

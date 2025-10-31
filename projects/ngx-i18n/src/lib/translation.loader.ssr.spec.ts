import 'jest';
import { FsTranslationLoader } from './translation.loader.ssr';
import { TestBed } from '@angular/core/testing';
import { TRANSLATION_LOADER } from './translate.token';
import { vol } from 'memfs';
import { FsModuleLike } from './translate.type';

// Mock window to simulate Node.js environment
const originalWindow = global.window;
beforeAll(() => {
  delete (global as any).window;
});

afterEach(() => {
  jest.resetModules();
  jest.unmock('node:path');
  jest.unmock('node:fs');
})

afterAll(() => {
  global.window = originalWindow;
});

describe('FsTranslationLoader', () => {
  const fsBaseDir = '/mock';
  const assetPath = '/dist/browser/assets';
  const mockFs: FsModuleLike = {
    readFileSync(path: string, encoding: 'utf8') {
      return vol.readFileSync(path, encoding).toString();
    },
    statSync(path: string) {
      return vol.statSync(path);
    },
  };

  beforeEach(() => {
    vol.reset();
    vol.fromJSON({
      [fsBaseDir + assetPath + '/i18n/en/common.json']: JSON.stringify({ hello: 'Hello from fs!' }),
      [fsBaseDir + assetPath + '/i18n/zh/common.json']: JSON.stringify({ hello: '你好！' }),
      [fsBaseDir + assetPath + '/i18n/en/auth.json']: JSON.stringify({ login: 'Login', logout: 'Logout' }),
      [fsBaseDir + assetPath + '/i18n/en/home.json']: JSON.stringify({ welcome: 'Welcome home!' })
    });
  });

  afterEach(() => {
    vol.reset();
  });

  it('should load translation file from fs', async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: TRANSLATION_LOADER,
          useValue: new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs)
        }
      ]
    }).compileComponents();

    const loader = TestBed.inject(TRANSLATION_LOADER);
    const result = await loader.load(['i18n'], 'common', 'en');

    expect(result).toEqual({ hello: 'Hello from fs!' });
  });

  it('should load translation file with different language', async () => {
    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);
    const result = await loader.load(['i18n'], 'common', 'zh');
    expect(result).toEqual({ hello: '你好！' });
  });

  it('should load translation file with different namespace', async () => {
    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);
    const result = await loader.load(['i18n'], 'auth', 'en');
    expect(result).toEqual({ login: 'Login', logout: 'Logout' });
  });

  it('should handle string i18nRoots parameter', async () => {
    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);
    const result = await loader.load('i18n', 'common', 'en');
    expect(result).toEqual({ hello: 'Hello from fs!' });
  });

  it('should throw error if translation file not found in any i18nRoot', async () => {
    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);
    await expect(loader.load(['nonexistentRoot'], 'common', 'en'))
      .rejects
      .toThrow('[SSR i18n] common.json for en not found in any i18nRoot');
  });

  it('should throw error if translation file not found with string i18nRoots', async () => {
    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);
    await expect(loader.load('nonexistentRoot', 'common', 'en'))
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

    const loader = new FsTranslationLoader({ fsBaseDir: tmpDir });
    const result = await loader.load(['i18n'], 'common', 'en');
    expect(result).toEqual({ hello: 'real fs fallback' });

    // Cleanup
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('should skip missing root and succeed with fallback root', async () => {
    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);
    const fallbackRoot = 'i18nFallback';

    // 加一個 fallback root 中的檔案
    vol.fromJSON({
      [`${fsBaseDir + assetPath}/${fallbackRoot}/en/common.json`]: JSON.stringify({ hello: 'from fallback' })
    });

    const result = await loader.load(['nonexistentRoot', fallbackRoot], 'common', 'en');
    expect(result).toEqual({ hello: 'from fallback' });
  });

  it('should use process.cwd() when fsBaseDir is not provided', async () => {
    const cwd = process.cwd();
    vol.fromJSON({
      [`${cwd}/dist/browser/assets/i18n/en/common.json`]: JSON.stringify({ hello: 'Hello from fs!' })
    });
    const loader = new FsTranslationLoader({ assetPath }, mockFs);
    const result = await loader.load(['i18n'], 'common', 'en');
    expect(result).toEqual({ hello: 'Hello from fs!' });

  });

  it('should use custom assetPath when provided', async () => {
    const customAssetPath = '/custom/assets';
    vol.fromJSON({
      [`${fsBaseDir}${customAssetPath}/i18n/en/common.json`]: JSON.stringify({ hello: 'custom path' })
    });

    const loader = new FsTranslationLoader({ fsBaseDir, assetPath: customAssetPath }, mockFs);
    const result = await loader.load(['i18n'], 'common', 'en');
    expect(result).toEqual({ hello: 'custom path' });
  });

  it('should use custom pathTemplates when provided', async () => {
    const customTemplates = ['custom/{{lang}}/{{namespace}}.json'];
    vol.fromJSON({
      [`${fsBaseDir}${assetPath}/custom/en/common.json`]: JSON.stringify({ hello: 'custom template' })
    });

    const loader = new FsTranslationLoader({
      fsBaseDir,
      assetPath,
      pathTemplates: customTemplates
    }, mockFs);

    const result = await loader.load(['custom'], 'common', 'en');
    expect(result).toEqual({ hello: 'custom template' });
  });

  it('should use custom resolvePaths when provided', async () => {
    const customResolvePaths = jest.fn().mockReturnValue(['/custom/path/file.json']);
    vol.fromJSON({
      '/custom/path/file.json': JSON.stringify({ hello: 'custom resolve' })
    });

    const loader = new FsTranslationLoader({
      fsBaseDir,
      assetPath,
      resolvePaths: customResolvePaths
    }, mockFs);

    const result = await loader.load(['i18n'], 'common', 'en');
    expect(result).toEqual({ hello: 'custom resolve' });
    expect(customResolvePaths).toHaveBeenCalledWith({
      fsBaseDir,
      assetPath: 'dist/browser/assets',
      root: 'i18n',
      lang: 'en',
      namespace: 'common'
    });
  });

  it('should handle custom fsModule', async () => {
    const customFs: FsModuleLike = {
      readFileSync: jest.fn().mockReturnValue(JSON.stringify({ hello: 'custom fs' })),
      statSync: jest.fn().mockReturnValue({ mtimeMs: Date.now() })
    };

    const loader = new FsTranslationLoader({
      fsBaseDir,
      assetPath,
      fsModule: customFs
    });

    const result = await loader.load(['i18n'], 'common', 'en');
    expect(result).toEqual({ hello: 'custom fs' });
    expect(customFs.readFileSync).toHaveBeenCalled();
  });

  it('should handle customFs constructor parameter', async () => {
    const customFs: FsModuleLike = {
      readFileSync: jest.fn().mockReturnValue(JSON.stringify({ hello: 'constructor fs' })),
      statSync: jest.fn().mockReturnValue({ mtimeMs: Date.now() })
    };

    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, customFs);
    const result = await loader.load(['i18n'], 'common', 'en');
    expect(result).toEqual({ hello: 'constructor fs' });
    expect(customFs.readFileSync).toHaveBeenCalled();
  });



  it('should handle path.default.join fallback', async () => {
    return new Promise<void>((resolve, reject) => {
      jest.isolateModules(async () => {
        try {
          jest.doMock('node:path', () => ({
            default: { join: (...parts: any[]) => parts.join('/') }
          }), { virtual: true });
          const { FsTranslationLoader } = await import('./translation.loader.ssr');
          const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);
          const result = await loader.load(['i18n'], 'common', 'en');
          expect(result).toEqual({ hello: 'Hello from fs!' });
          resolve();
        } catch (error) {
          reject(error)
        }
      })
    })
  });

  it('should derive mtimeMs from stat.mtime.getTime when mtimeMs is absent', async () => {
    // 覆寫 statSync：移除 mtimeMs，僅提供 mtime 與 size
    const fsMtimeOnly: FsModuleLike = {
      readFileSync: mockFs.readFileSync,
      statSync: (p: string) => {
        const st: any = vol.statSync(p);
        return { mtime: new Date(st.mtimeMs), size: st.size };
      },
    };

    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, fsMtimeOnly);

    // 第一次讀取：命中新檔內容
    const r1 = await loader.load(['i18n'], 'common', 'en');
    expect(r1).toEqual({ hello: 'Hello from fs!' });

    // 修改檔案內容，並確保 mtime 會前進（memfs 解析度可能較粗）
    const target = fsBaseDir + assetPath + '/i18n/en/common.json';
    vol.writeFileSync(target, JSON.stringify({ hello: 'Modified content!' }), { encoding: 'utf8' });
    await new Promise((r) => setTimeout(r, 5));       // 給 fs 一點時間更新時間戳
    if (typeof (vol as any).utimesSync === 'function') {
      (vol as any).utimesSync(target, new Date(), new Date());
    }

    // 第二次讀取：應該 miss cache、回傳新內容（覆蓋 mtimeMs 分支）
    const r2 = await loader.load(['i18n'], 'common', 'en');
    expect(r2).toEqual({ hello: 'Modified content!' });
  });

  it('should fall back to 0 when neither mtimeMs nor mtime is present', async () => {
    // 覆寫 statSync：移除 mtimeMs 與 mtime，僅保留 size
    const fsNoTimes: FsModuleLike = {
      readFileSync: mockFs.readFileSync,
      statSync: (p: string) => {
        const st: any = vol.statSync(p);
        return { size: st.size };
      },
    };

    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, fsNoTimes);

    // 能正常讀到內容即可（覆蓋 "?? 0" 的回退邏輯）
    const res = await loader.load(['i18n'], 'common', 'en');
    expect(res).toEqual({ hello: 'Hello from fs!' });
  });

  it('should handle path.join fallback', async () => {
    return new Promise<void>((resolve, reject) => {
      jest.isolateModules(async () => {
        try {
          jest.doMock('node:path', () => ({
            join: (...parts: any[]) => parts.join('/')
          }), { virtual: true });
          const { FsTranslationLoader } = await import('./translation.loader.ssr');
          const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);
          const res = await loader.load(['i18n'], 'common', 'en');
          expect(res).toEqual({ hello: 'Hello from fs!' });
          resolve();
        } catch (error) {
          reject(error)
        }
      })

    })
  });

  it('should handle process not defined for fsBaseDir', async () => {
    const g = globalThis as any;
    const desc = Object.getOwnPropertyDescriptor(globalThis, 'process');
    vol.fromJSON({
      ['/dist/browser/assets/i18n/en/common.json']: JSON.stringify({ hello: 'Hello from fs!' })
    });
    try {
      if (desc?.configurable) {
        Object.defineProperty(globalThis, 'process', { value: undefined, configurable: true, writable: true });

      } else if (desc?.writable) {
        g.process = undefined;
      } else { }
      const loader = new FsTranslationLoader({ assetPath }, mockFs);
      const result = await loader.load(['i18n'], 'common', 'en');
      expect(result).toBeDefined();
    } finally {
      if (desc) {
        Object.defineProperty(globalThis, 'process', desc);
      } else {
        delete g.process;
      }
    }
  });

  it('should handle assetPath fallback', async () => {
    vol.fromJSON({
      [`${fsBaseDir}/dist/browser/assets/i18n/en/common.json`]: JSON.stringify({ hello: 'default asset path' })
    });

    const loader = new FsTranslationLoader({ fsBaseDir }, mockFs);
    const result = await loader.load(['i18n'], 'common', 'en');
    expect(result).toEqual({ hello: 'default asset path' });
  });

  it('should handle pathTemplates fallback', async () => {
    vol.fromJSON({
      [`${fsBaseDir}${assetPath}/i18n/en/common.json`]: JSON.stringify({ hello: 'default templates' })
    });

    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);
    const result = await loader.load(['i18n'], 'common', 'en');
    expect(result).toEqual({ hello: 'default templates' });
  });

  it('should handle cache hit', async () => {
    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);

    // First load to populate cache
    const result1 = await loader.load(['i18n'], 'common', 'en');
    expect(result1).toEqual({ hello: 'Hello from fs!' });

    // Second load should use cache
    const result2 = await loader.load(['i18n'], 'common', 'en');
    expect(result2).toEqual({ hello: 'Hello from fs!' });
  });

  it('should handle cache miss when file is modified', async () => {
    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);

    // First load
    const result1 = await loader.load(['i18n'], 'common', 'en');
    expect(result1).toEqual({ hello: 'Hello from fs!' });

    // Modify file
    vol.fromJSON({
      [fsBaseDir + assetPath + '/i18n/en/common.json']: JSON.stringify({ hello: 'Modified content!' })
    });

    // Second load should get new content
    const result2 = await loader.load(['i18n'], 'common', 'en');
    expect(result2).toEqual({ hello: 'Modified content!' });
  });

  it('should handle multiple roots with fallback', async () => {
    vol.fromJSON({
      [`${fsBaseDir}${assetPath}/root1/en/common.json`]: JSON.stringify({ hello: 'root1' }),
      [`${fsBaseDir}${assetPath}/root2/en/common.json`]: JSON.stringify({ hello: 'root2' })
    });

    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);

    // Should find in first root
    const result1 = await loader.load(['root1', 'root2'], 'common', 'en');
    expect(result1).toEqual({ hello: 'root1' });

    // Should find in second root when first is missing
    const result2 = await loader.load(['missing', 'root2'], 'common', 'en');
    expect(result2).toEqual({ hello: 'root2' });
  });

  it('should handle JSON parse errors gracefully', async () => {
    vol.fromJSON({
      [fsBaseDir + assetPath + '/i18n/en/common.json']: 'invalid json content'
    });

    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);

    // Should skip invalid JSON and try next candidate
    await expect(loader.load(['i18n'], 'common', 'en'))
      .rejects
      .toThrow('[SSR i18n] common.json for en not found in any i18nRoot');
  });

  it('should handle fs.statSync errors gracefully', async () => {
    const mockFsWithError: FsModuleLike = {
      readFileSync: mockFs.readFileSync,
      statSync: jest.fn().mockImplementation(() => {
        throw new Error('File not found');
      })
    };

    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFsWithError);

    // Should skip files with stat errors and try next candidate
    await expect(loader.load(['i18n'], 'common', 'en'))
      .rejects
      .toThrow('[SSR i18n] common.json for en not found in any i18nRoot');
  });

  it('should handle fs.readFileSync errors gracefully', async () => {
    const mockFsWithError: FsModuleLike = {
      readFileSync: jest.fn().mockImplementation(() => {
        throw new Error('Cannot read file');
      }),
      statSync: mockFs.statSync
    };

    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFsWithError);

    // Should skip files with read errors and try next candidate
    await expect(loader.load(['i18n'], 'common', 'en'))
      .rejects
      .toThrow('[SSR i18n] common.json for en not found in any i18nRoot');
  });


  it('should handle both path and fs import failures (no fallback fs)', async () => {
    await new Promise<void>((resolve, reject) => {
      jest.isolateModules(async () => {
        try {
          jest.doMock('node:path', () => { throw new Error('Module not found'); }, { virtual: true });
          jest.doMock('node:fs', () => { throw new Error('FS module not found'); }, { virtual: true });
          const { FsTranslationLoader } = await import('./translation.loader.ssr');

          const loader = new FsTranslationLoader({ fsBaseDir, assetPath }); // <-- 不要傳 mockFs
          await expect(loader.load(['i18n'], 'common', 'en'))
            .rejects.toThrow('[SSR i18n] common.json for en not found in any i18nRoot');

          resolve();
        } catch (e) { reject(e); }
      });
    });
  });
  it('should still load via customFs when both node:path and node:fs fail', async () => {
    await new Promise<void>((resolve, reject) => {
      jest.isolateModules(async () => {
        try {
          jest.doMock('node:path', () => { throw new Error('Module not found'); }, { virtual: true });
          jest.doMock('node:fs', () => { throw new Error('FS module not found'); }, { virtual: true });
          const { FsTranslationLoader } = await import('./translation.loader.ssr');

          // 這裡保留 mockFs，且 memfs 有檔案
          const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);
          await expect(loader.load(['i18n'], 'common', 'en'))
            .resolves.toEqual({ hello: 'Hello from fs!' });

          resolve();
        } catch (e) { reject(e); }
      });
    });
  });

  it('should handle empty i18nRoots array', async () => {
    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);

    await expect(loader.load([], 'common', 'en'))
      .rejects
      .toThrow('[SSR i18n] common.json for en not found in any i18nRoot');
  });

  it('should handle empty string i18nRoots', async () => {
    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFs);

    await expect(loader.load('', 'common', 'en'))
      .rejects
      .toThrow('[SSR i18n] common.json for en not found in any i18nRoot');
  });

  it('should handle constructor with no options', () => {
    const loader = new FsTranslationLoader();
    expect(loader).toBeInstanceOf(FsTranslationLoader);
  });

  it('should handle constructor with empty options', () => {
    const loader = new FsTranslationLoader({});
    expect(loader).toBeInstanceOf(FsTranslationLoader);
  });

  it('should handle constructor with customFs only', () => {
    const loader = new FsTranslationLoader(undefined, mockFs);
    expect(loader).toBeInstanceOf(FsTranslationLoader);
  });

  it('should return cached data when mtime matches', async () => {
    const mtime = 12345;
    const cachedData = { hello: 'cached' };

    const mockFsWithSameMtime: FsModuleLike = {
      readFileSync: jest.fn().mockReturnValue(JSON.stringify(cachedData)),
      statSync: jest.fn().mockReturnValue({ mtimeMs: mtime })
    };

    const loader = new FsTranslationLoader({ fsBaseDir, assetPath }, mockFsWithSameMtime);

    // First load to populate cache
    const result1 = await loader.load(['i18n'], 'common', 'en');
    expect(result1).toEqual(cachedData);

    // Second load should return cached data (same mtime) - this tests line 45
    const result2 = await loader.load(['i18n'], 'common', 'en');
    expect(result2).toEqual(cachedData);

    // readFileSync should only be called once (first time)
    expect(mockFsWithSameMtime.readFileSync).toHaveBeenCalledTimes(1);
    expect(mockFsWithSameMtime.statSync).toHaveBeenCalledTimes(2);
  });
});

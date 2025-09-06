import {
  FsModuleLike,
  TempToken as t,
  type CacheEntry,
  type FsLoaderOptions,
  type TranslationLoader,
  type Translations,
} from './translate.type';
import { stripLeadingSep, toArray } from './translate.util';

export class FsTranslationLoader implements TranslationLoader {
  private cache = new Map<string, CacheEntry>();

  /**
   * @param opts.fsModule 產品/框架級的 fs 注入點（優先度次於 customFs，先於動態 import）
   * @param customFs     測試/臨時注入的最高優先 fs（建構子第二參數）
   */
  constructor(private opts: FsLoaderOptions = {}, private customFs?: FsModuleLike) { }

  async load(i18nRoots: string[] | string, namespace: string, lang: string): Promise<Translations> {
    const roots = (Array.isArray(i18nRoots) ? i18nRoots : [i18nRoots]).map(stripLeadingSep);

    // 1) 嘗試取得 path 與 fs，但不要假設一定成功
    const pathMod = await this.importSafely('node:path');
    const fsImported = await this.importSafely('node:fs'); // 同步 fs

    const fsLike: FsModuleLike | undefined =
      this.pickFs(this.customFs) ?? this.pickFs(this.opts.fsModule) ?? this.pickFs(fsImported);

    // 4) fsBaseDir / assetPath（assetPath 統一去前導斜線）
    const fsBaseDir = this.opts.fsBaseDir ?? (globalThis.process?.cwd?.() ?? '/');
    const assetPathRaw = this.opts.assetPath ?? 'dist/browser/assets';
    const assetPath = stripLeadingSep(assetPathRaw);

    // 5) 路徑樣板（預設兩種常見結構）
    const templates =
      toArray(this.opts.pathTemplates) ??
      [`${t.Root}/${t.Lang}/${t.Namespace}.json`, `${t.Root}/${t.Namespace}/${t.Lang}.json`];

    // 6) 逐 root、逐 candidate 嘗試
    for (const root of roots) {
      const candidatePaths =
        this.opts.resolvePaths?.({
          fsBaseDir,
          assetPath, // 注意：已標準化（無前導斜線）
          root,
          lang,
          namespace,
        }) ??
        templates.map((temp) =>
          this.safeJoin(
            pathMod,
            fsBaseDir,
            assetPath,
            temp.replace(t.Root, root).replace(t.Lang, lang).replace(t.Namespace, namespace),
          ),
        );

      for (const absolutePath of candidatePaths) {
        try {
          // 若沒有可用 fs，就略過（讓流程走到最後丟 not found）
          if (!fsLike?.statSync || !fsLike?.readFileSync) continue;

          const stat = fsLike.statSync(absolutePath);
          const mtimeMs =
            typeof stat.mtimeMs === 'number'
              ? stat.mtimeMs
              : stat.mtime?.getTime?.() ?? 0;
          const size = typeof stat.size === 'number' ? stat.size : 0;
          const sign = (mtimeMs | 0) * 1000003 + (size | 0);

          const cached = this.cache.get(absolutePath);
          if (cached && cached.mtimeMs === sign) {
            return cached.data;
          }

          const raw = fsLike.readFileSync(absolutePath, 'utf8');
          const json = JSON.parse(raw) as Translations;

          this.cache.set(absolutePath, { mtimeMs: sign, data: json });
          return json;
        } catch {
          // 找不到／讀取失敗／JSON 解析失敗：嘗試下一個 candidate
        }
      }
    }

    throw new Error(`[SSR i18n] ${namespace}.json for ${lang} not found in any i18nRoot`);
  }

  /** 動態匯入但不拋錯，失敗回傳 undefined */
  private async importSafely(specifier: string): Promise<any | undefined> {
    const isNode = typeof process !== 'undefined' && !!process?.versions?.node;
    if (!isNode) return undefined;
    try {
      if (specifier === 'node:path') {
        return await import('node:path'); // ← 字面量，Vite 可分析
      } else {
        return await import('node:fs');   // ← 字面量，Vite 可分析
      }
    } catch {
      return undefined;
    }
  }

  private pickFs(x: any): FsModuleLike | undefined {
    return x && typeof x.readFileSync === 'function' && typeof x.statSync === 'function'
      ? (x as FsModuleLike)
      : undefined;
  }

  private safeJoin(pathMod: any, ...parts: any[]): string {
    return (pathMod?.join ??
      pathMod?.default?.join ??
      ((...parts: any[]) => parts.join('/')))(...parts);
  }
}

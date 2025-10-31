import {
  FsModuleLike,
  TempToken as t,
  type CacheEntry,
  type FsLoaderOptions,
  type TranslationLoader,
  type Translations,
} from './translate.type';
import { stripLeadingSep, toArray } from './translate.util';

/** File-system backed loader used during SSR to read translation JSON from disk. */
export class FsTranslationLoader implements TranslationLoader {
  private cache = new Map<string, CacheEntry>();

  /**
   * @param opts      Loader configuration resolved from `TranslationLoaderOptions`.
   * @param customFs  Optional fs-like abstraction injected explicitly (tests or adapters).
   */
  constructor(private opts: FsLoaderOptions = {}, private customFs?: FsModuleLike) {}

  /** Locates and reads the namespace file for SSR, caching by mtime and size. */
  async load(i18nRoots: string[] | string, namespace: string, lang: string): Promise<Translations> {
    const roots = (Array.isArray(i18nRoots) ? i18nRoots : [i18nRoots]).map(stripLeadingSep);

    const pathMod = await this.importSafely('node:path');
    const fsImported = await this.importSafely('node:fs');

    const fsLike: FsModuleLike | undefined =
      this.pickFs(this.customFs) ?? this.pickFs(this.opts.fsModule) ?? this.pickFs(fsImported);

    const fsBaseDir = this.opts.fsBaseDir ?? (globalThis.process?.cwd?.() ?? '/');
    const assetPathRaw = this.opts.assetPath ?? 'dist/browser/assets';
    const assetPath = stripLeadingSep(assetPathRaw);

    const templates =
      toArray(this.opts.pathTemplates) ??
      [`${t.Root}/${t.Lang}/${t.Namespace}.json`, `${t.Root}/${t.Namespace}/${t.Lang}.json`];

    for (const root of roots) {
      const candidatePaths =
        this.opts.resolvePaths?.({
          fsBaseDir,
          assetPath,
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
          // Continue probing other candidate files until a match is found.
        }
      }
    }

    throw new Error(`[SSR i18n] ${namespace}.json for ${lang} not found in any i18nRoot`);
  }

  /** Attempts to import a Node built-in without throwing when unavailable (e.g. CSR). */
  private async importSafely(specifier: string): Promise<any | undefined> {
    const isNode = typeof process !== 'undefined' && !!process?.versions?.node;
    if (!isNode) return undefined;
    try {
      if (specifier === 'node:path') {
        return await import('node:path'); // Static specifier keeps bundlers happy.
      } else {
        return await import('node:fs');
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

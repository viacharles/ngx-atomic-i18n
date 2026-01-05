
import { computed, Signal, signal, WritableSignal } from "@angular/core";
import { TranslationService } from "ngx-atomic-i18n";

export class GetStartText {
  initConfig: WritableSignal<string> = signal('');
  readonly initConfigCode: Signal<string> = computed(() => this.initConfig());
  installCLI = `
    npm install ngx-atomic-i18n
    `;
  sourceLoadProvider = signal('');
  supportedLangText = 'getStart.config.supportedLangHint';
  sourceArchitecture = signal('getStart.sourceArchitecture');
  lazyLoad = {
    CompComp: 'getStart.lazyLoad.compComp',
    ModuleComp: 'getStart.lazyLoad.moduleComp',
    ModuleModule: 'getStart.lazyLoad.moduleModule'
  }

  constructor(
    private translationService: TranslationService
  ) { }


  getConfigModule(isCSR: boolean, isMonorepo: boolean): string {
    const needsIsDevMode = !isCSR;
    const loaderBlock = this.buildLoaderConfig('      ', isCSR, isMonorepo);
    const loaderSection = loaderBlock ? `${loaderBlock}\n` : '';
    return `${needsIsDevMode ? `import { isDevMode } from '@angular/core';` : ``}
import { provideTranslationInit } from 'ngx-atomic-i18n';

@NgModule({
  providers: [
    HttpClient(), // must have
    provideTranslationInit({
      supportedLangs: ['en', 'zh-Hant'], // ${this.translationService.t(this.supportedLangText)}
${loaderSection}    }),
  ],
})
`;
  }

  getConfigStandalone(isCSR: boolean, isMonorepo: boolean): string {
    const needsIsDevMode = !isCSR;
    const loaderBlock = this.buildLoaderConfig('      ', isCSR, isMonorepo);
    const loaderSection = loaderBlock ? `${loaderBlock}\n` : '';
    return `${needsIsDevMode ? `import { ApplicationConfig, isDevMode } from '@angular/core';` : `import { ApplicationConfig } from '@angular/core';`}
import { provideTranslationInit } from 'ngx-atomic-i18n';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(), // must have
    provideTranslationInit({
      supportedLangs: ['en', 'zh-Hant'], // ${this.translationService.t(this.supportedLangText)}
${loaderSection}    }),
  ],
};
`;
  }

  buildLoaderConfig(indent = '      ', isCSR: boolean, isMonorepo: boolean): string {
    const lines: string[] = [];
    const loaderLabel = this.translationService.t('getStart.config.loader.label');
    const clientComment = this.translationService.t('getStart.config.loader.client');
    const clientBaseUrl = this.translationService.t('getStart.config.loader.baseUrlMonorepo');
    const serverComment = this.translationService.t('getStart.config.loader.server');
    const baseDirMonorepo = this.translationService.t('getStart.config.loader.baseDirMonorepo');
    const assetMonorepo = this.translationService.t('getStart.config.loader.assetMonorepo');
    const baseDirSingle = this.translationService.t('getStart.config.loader.baseDirSingle');
    const assetSingle = this.translationService.t('getStart.config.loader.assetSingle');
    const clientDefaultPath = this.translationService.t('getStart.config.loader.clientDefaultPath');

    if (isCSR) {
      if (isMonorepo) {
        lines.push(`${indent}loader: { // ${loaderLabel}`);
        lines.push(`${indent}  httpOptions: { // ${clientComment}`);
        lines.push(`${indent}    baseUrl: '/projects/<Your App Name>/assets', // ${clientBaseUrl}`);
        lines.push(`${indent}  },`);
        lines.push(`${indent}},`);
      }
      return lines.join('\n');
    }

    // SSR / SSG
    lines.push(`${indent}loader: { // ${loaderLabel}`);
    lines.push(`${indent}  fsOptions: { // ${serverComment}`);
    if (isMonorepo) {
      lines.push(`${indent}    baseDir: process.cwd(), // ${baseDirMonorepo}`);
      lines.push(`${indent}    assetPath: isDevMode() ? 'projects/<Your App Name>/src/assets' : 'dist/projects/<Your App Name>/browser/assets', // ${assetMonorepo}`);
    } else {
      lines.push(`${indent}    baseDir: process.cwd(), // ${baseDirSingle}`);
      lines.push(`${indent}    assetPath: isDevMode() ? 'src/assets' : 'dist/browser/assets', // ${assetSingle}`);
    }
    lines.push(`${indent}  },`);
    if (isMonorepo) {
      lines.push(`${indent}  httpOptions: { // ${clientComment}`);
      lines.push(`${indent}    baseUrl: '/projects/<Your App Name>/assets', // ${clientBaseUrl}`);
      lines.push(`${indent}    // ${clientDefaultPath}`);
      lines.push(`${indent}  },`);
    }
    lines.push(`${indent}},`);
    return lines.join('\n');
  }
}

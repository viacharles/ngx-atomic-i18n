
export enum RenderType {
  'CSR (一般選這個)' = 'CSR',
  SSR = 'SSR',
  SSG = 'SSG'
}
export enum ProjectArchitectureType {
  一般獨立專案 = 'Regular Project',
  Monorepo = 'Monorepo',
}
export enum AppBootstrapMode {
  'Standalone (app.config.ts)' = 'Standalone',
  'NgModule (app.module.ts)' = 'NgModule',
}
export enum LazyLoadType {
  'Standalone (元件)' = 'Standalone',
  'NgModule (元件)' = 'ngModule Component',
  'NgModule (模組)' = 'ngModule Module'
}

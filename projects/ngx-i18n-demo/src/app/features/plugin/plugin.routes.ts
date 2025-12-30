import { Routes } from '@angular/router';
import { PluginPaths } from '../../shared/enums/routes.enum';

export const PluginRoutes: Routes = [
  {
    path: '',
    redirectTo: PluginPaths.EmitI18nJsonAssets,
    pathMatch: 'full',
  },
  {
    path: PluginPaths.EmitI18nJsonAssets,
    loadComponent: () => import('./emit-i18n-json-assets/emit-i18n-json-assets.component').then(m => m.EmitI18nJsonAssetsComponent),
    title: PluginPaths.EmitI18nJsonAssets,
  },
];

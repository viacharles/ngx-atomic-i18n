import { Routes } from '@angular/router';
import { PluginPaths } from '../../shared/enums/routes.enum';

export const PluginRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./ts-to-json/ts-to-json.component').then(m => m.TsToJsonComponent),
  },
  {
    path: PluginPaths.TsToJson,
    loadComponent: () => import('./ts-to-json/ts-to-json.component').then(m => m.TsToJsonComponent),
    title: PluginPaths.TsToJson,
  },
];

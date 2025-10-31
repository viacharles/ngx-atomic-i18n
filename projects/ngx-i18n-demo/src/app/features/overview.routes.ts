import { Routes } from '@angular/router';
import { OverviewPaths } from '../shared/enums/routes.enum';
import { enumToName } from '@demo2-shared/systems/router-system/router.util';

export const OverviewRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./overview/get-start/get-start.component').then(m => m.GetStartComponent),

  },
  {
    path: OverviewPaths.GettingStarted,
    loadComponent: () => import('./overview/get-start/get-start.component').then(m => m.GetStartComponent),
    title: enumToName(OverviewPaths.GettingStarted),
  },
  {
    path: OverviewPaths.Api,
    loadComponent: () => import('./overview/api/api.component').then(m => m.ApiComponent),
    title: enumToName(OverviewPaths.Api),
  },
  {
    path: OverviewPaths.ConfigurationOptions,
    loadComponent: () => import('./overview/get-start/get-start.component').then(m => m.GetStartComponent),
    title: enumToName(OverviewPaths.ConfigurationOptions),
  },
  {
    path: OverviewPaths.Formatting,
    loadComponent: () => import('./overview/get-start/get-start.component').then(m => m.GetStartComponent),
    title: enumToName(OverviewPaths.Formatting),
  },
];

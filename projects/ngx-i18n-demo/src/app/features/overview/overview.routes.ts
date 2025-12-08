import { Routes } from '@angular/router';
import { OverviewPaths } from '../../shared/enums/routes.enum';

export const OverviewRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./get-start/get-start.component').then(m => m.GetStartComponent),
  },
  {
    path: OverviewPaths.GettingStarted,
    loadComponent: () => import('./get-start/get-start.component').then(m => m.GetStartComponent),
    title: OverviewPaths.GettingStarted,
  },
  {
    path: OverviewPaths.Methods,
    loadComponent: () => import('./methods/methods.component').then(m => m.MethodsComponent),
    title: OverviewPaths.Methods,
  },
  {
    path: OverviewPaths.ConfigurationOptions,
    loadComponent: () => import('./configuration/configuration.component').then(m => m.ConfigurationComponent),
    title: OverviewPaths.ConfigurationOptions,
  },
  {
    path: OverviewPaths.Formatting,
    loadComponent: () => import('./get-start/get-start.component').then(m => m.GetStartComponent),
    title: OverviewPaths.Formatting,
  },
];

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
    path: OverviewPaths.InitConfigurationOptions,
    loadComponent: () => import('./init-configuration/init-configuration.component').then(m => m.InitConfigurationComponent),
    title: OverviewPaths.InitConfigurationOptions,
  },
  {
    path: OverviewPaths.CompConfigurationOptions,
    loadComponent: () => import('./comp-configuration/comp-configuration.component').then(m => m.CompConfigurationComponent),
    title: OverviewPaths.CompConfigurationOptions,
  },
  {
    path: OverviewPaths.Formatting,
    loadComponent: () => import('./formatter/formatter.component').then(m => m.FormatterComponent),
    title: OverviewPaths.Formatting,
  },
];

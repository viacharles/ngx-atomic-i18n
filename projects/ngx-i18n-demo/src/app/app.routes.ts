import { Routes } from '@angular/router';
import { FeaturePaths, OverviewPaths } from './shared/enums/routes.enum';
import { OverviewRoutes } from './features/overview/overview.routes';
import { PluginRoutes } from './features/plugin/plugin.routes';
import { parsToPath } from '@demo2-shared/systems/router-system/router.util';


export const appRoutes: Routes = [
  {
    path: ':lang', redirectTo: `:lang/${parsToPath([FeaturePaths.Overview, OverviewPaths.GettingStarted])}`, pathMatch: 'full'
  },
  {
    path: ':lang',
    children: [
      {
        path: FeaturePaths.Overview,
        loadChildren: () => import('./features/overview/overview.routes').then(m => m.OverviewRoutes),
        data: {
          childrenRoutes: OverviewRoutes
        }
      },
      {
        path: FeaturePaths.Plugin,
        loadChildren: () => import('./features/plugin/plugin.routes').then(m => m.PluginRoutes),
        data: {
          childrenRoutes: PluginRoutes
        }
      }
    ]
  }
];

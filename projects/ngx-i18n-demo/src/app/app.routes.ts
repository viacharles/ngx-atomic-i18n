import { Routes } from '@angular/router';
import { FeaturePaths, OverviewPaths } from './shared/enums/routes.enum';
import { parsToPath } from '@demo2-shared/systems/router-system/router.util';
import { OverviewRoutes } from './features/overview.routes';


export const appRoutes: Routes = [
  {
    path: '', redirectTo: parsToPath([FeaturePaths.Overview, OverviewPaths.GettingStarted]), pathMatch: 'full'
  },
  {
    path: FeaturePaths.Overview,
    loadChildren: () => import('./features/overview.routes').then(m => m.OverviewRoutes),
    data: {
      childrenRoutes: OverviewRoutes
    }
  }
];

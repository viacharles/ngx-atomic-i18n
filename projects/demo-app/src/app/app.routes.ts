import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: 'setting', pathMatch: 'full' },
    {
        path: 'setting',
        loadComponent: () => import('./features/setting/setting.component').then(m => m.SettingComponent)
    },
    {
        path: 'about',
        loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
    },
    {
        path: 'lazy',
        loadChildren: () => import('./features/lazy/lazy.routes').then(m => m.LAZY_ROUTES)
    },
    {
        path: 'test',
        loadComponent: () => import('./features/test/test.component').then(m => m.TestComponent)
    }
];

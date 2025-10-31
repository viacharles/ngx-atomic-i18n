import { ModulePath } from './route.enum';

export let ModulePathMap = new Map([
  [ModulePath.Insight, { path: ModulePath.Insight, name: '數據', icon: 'icon-muscle-hand', bg: 'gradient-1' }],
  [ModulePath.Reserve, { path: ModulePath.Reserve, name: '預約', icon: 'icon-schedule1', bg: 'gradient-2' }],
  [ModulePath.Assets, { path: ModulePath.Assets, name: '療程', icon: 'icon-medical-equipment', bg: 'gradient-3' }],
]);


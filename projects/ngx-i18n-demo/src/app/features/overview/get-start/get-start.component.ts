import { Component } from '@angular/core';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { TranslationPipe } from 'ngx-i18n';
import { CodeBlockComponent } from 'projects/demo-app/src/app/shared/components/code-block/code-block.component';
import { appRoutes } from '../../../app.routes';
import { enumToName } from '@demo2-shared/systems/router-system/router.util';

export interface NavItem {
  path: string;
  fullPath: string;
  label: string;
  isParent: boolean;
  children?: NavItem[];
}

@Component({
  selector: 'app-get-start',
  standalone: true,
  imports: [CodeBlockComponent, TranslationPipe],
  templateUrl: './get-start.component.html',
  styleUrl: './get-start.component.scss'
})
export class GetStartComponent {
  installCLI = `
  # npm
  npm install -g @atomic-reactor/cli;
  # yarn
  yarn global add @atomic-reactor/cli;
  # pnpm
  pnpm add -g @atomic-reactor/cli;
  `;
  initConfig = ``;
  constructor(
    private activateRoute: ActivatedRoute,
    private router: Router
  ) {
    console.log('aa-activateRoute', this.activateRoute)
    console.log('aa-router', this.router)
    console.log('aa-appRoutes', appRoutes[1].loadChildren?.toString())
  }

  private buildNavTree(routes: Routes, parentPath: string = ''): NavItem[] {
    const navTree: NavItem[] = [];
    for (const route of routes) {
      if (route.redirectTo || route.path === '' || route.path === '**') {
        continue;
      }
      const hasChildren = !!(route.children || route.loadChildren);
      const shouldDisplay = !!route.path;
      if (shouldDisplay) {
        const fullPath = parentPath + '/' + route.path;
        const label = route.title || enumToName(String(route.path) as string);
        const navItem: NavItem = {
          path: route.path!,
          fullPath: fullPath.replace('//', '/'),
          label: label as string,
          isParent: hasChildren,
        }
        if (route.children) {
          navItem.children = this.buildNavTree(route.children, navItem.fullPath);
        }
        if (route.loadChildren) {
          navItem.children = this.buildNavTree(route.data?.['childrenRoutes'], navItem.fullPath)
        }
      }
    };
    return navTree;
  }
}

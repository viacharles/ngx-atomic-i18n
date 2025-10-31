import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, Routes } from '@angular/router';
import { enumToName } from '@demo2-shared/systems/router-system/router.util';
import { appRoutes } from 'projects/ngx-i18n-demo/src/app/app.routes';
import { RouterService } from 'projects/ngx-i18n-demo/src/core/services/router.service';
export interface NavItem {
  path: string;
  fullPath: string;
  label: string;
  isParent: boolean;
  children?: NavItem[];
}
@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss'
})
export class SideNavComponent implements OnInit {
  navItems = this.buildNavTree(appRoutes);
  constructor(
    private router$: RouterService,
    public activateRoute: ActivatedRoute,
    public router: Router
  ) { }
  ngOnInit(): void {
    this.router$.endUrl$.subscribe(url => {
      console.log('Current URL:', url);
    });
  }

  toPage(path: string): void {
    this.router.navigateByUrl(path);
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
        navTree.push(navItem)
      }
    };
    return navTree;
  }
}

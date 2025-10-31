import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { ModulePathMap } from '@mini:shared/systems/router-system/route.map';

@Component({
  selector: 'app-foot-navigation',
  standalone: true,
  imports: [],
  templateUrl: './foot-navigation.component.html',
  styleUrl: './foot-navigation.component.scss',
})
export class FootNavigationComponent {
  // navigations = Array.from(ModulePathMap.values());
  router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  isActive(path: string): boolean {
    return this.router.url.includes(path);
  }

  toPage(path: string): void {
    this.router.navigate([path], { relativeTo: this.activatedRoute });
  }
}

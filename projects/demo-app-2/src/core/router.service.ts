import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { LayoutService } from '@mini:shared/services/layout.service';
import { DialogService } from '@mini:shared/systems/dialog-system/dialog.service';
import { CustomRoute } from '@mini:shared/systems/router-system/route.type';
import { BehaviorSubject, filter, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  private _startUrlSubject = new BehaviorSubject<string>('/');
  private _endUrlSubject = new BehaviorSubject<string>('/');
  startUrl$ = this._startUrlSubject.asObservable();
  endUrl$ = this._endUrlSubject.asObservable();

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly dialog$: DialogService,
    private readonly layout$: LayoutService,
  ) {
    this.router.events
      .pipe(
        tap((event) => {
          if (event instanceof NavigationStart) {
            this._startUrlSubject.next((event as NavigationStart).url);
          }
        }),
        filter((event) => event instanceof NavigationEnd),
        map((event) => (event as NavigationEnd).urlAfterRedirects),
      )
      .subscribe((event) => {
        this._endUrlSubject.next(event);
        this.dialog$.closeAll();

        let current = this.activatedRoute;
        while (current.firstChild) {
          current = current.firstChild;
        }
        const isSinglePage = current.routeConfig && (current.routeConfig as CustomRoute).isSinglePage;
        this.layout$.isSinglePageSig.set(!!isSinglePage);
        // this.layout$.setIsSinglePageIfChange(!!isSinglePage);
      });
  }
}

import { inject, Injectable } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, filter, map, tap } from 'rxjs';
import { DialogService } from '../../app/shared/systems/dialog-system/dialog.service';

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  private readonly router = inject(Router);
  private _startUrlSubject = new BehaviorSubject<string>(this.router.url);
  private _endUrlSubject = new BehaviorSubject<string>(this.router.url);
  startUrl$ = this._startUrlSubject.asObservable();
  endUrl$ = this._endUrlSubject.asObservable();

  constructor(
    private readonly dialog$: DialogService,
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
      });
  }
}

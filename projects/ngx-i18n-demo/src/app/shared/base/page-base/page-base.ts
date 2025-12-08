import { isPlatformBrowser } from '@angular/common';
import { Directive, effect, ElementRef, inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AnchorListService } from '@demo2-shared/systems/anchor-list/anchor-list.service';
import { TranslationService } from 'ngx-i18n';
import { timer, Subscription } from 'rxjs';

@Directive()
export abstract class PageBase implements OnInit, OnDestroy {
  anchorService = inject(AnchorListService);
  router = inject(Router);
  translationService = inject(TranslationService);
  readonly platformId = inject(PLATFORM_ID);
  readonly isBrowser = isPlatformBrowser(this.platformId);


  @ViewChild('pageElem') pageElem?: ElementRef<HTMLElement>;

  subscription = new Subscription();

  constructor() {
    effect(() => {
      if (this.translationService.readySignal()) {
        timer(0).subscribe(() => {
          this.anchorService.list = this.anchorService.getList(this.pageElem?.nativeElement);
        })
      }
    })
  }

  ngOnInit(): void {
    this.subscription.add(
      this.translationService.onLangChange.subscribe(lang => {
        timer(0).subscribe(() => {
          this.anchorService.list = this.anchorService.getList(this.pageElem?.nativeElement)
        })
      })
    )
    this.onInit();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  protected onInit(): void { }
}

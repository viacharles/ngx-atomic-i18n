import { ViewPortService } from '../../../../../../core/services/view-port.service';
import { AfterViewInit, Component, inject, signal, WritableSignal } from '@angular/core';
import { Option } from 'projects/ngx-i18n-demo/src/app/shared/interfaces/common.interface';
import { timer } from 'rxjs';
import { DialogModel } from '../../dialog.model';
import { DIALOG_DATA } from '../../dialog.token';
import { DropdownData } from '../../dialog.type';
import { SCREEN_WIDTH } from 'projects/ngx-i18n-demo/src/app/shared/enums/common.enum';
import { NgStyle } from '@angular/common';
import { TranslationPipe } from 'ngx-i18n';

@Component({
  selector: 'app-dropdown-dialog',
  imports: [NgStyle, TranslationPipe],
  standalone: true,
  templateUrl: './dropdown-dialog.component.html',
  styleUrl: './dropdown-dialog.component.scss',
})
export class DropdownDialogComponent implements AfterViewInit {
  data = inject<DropdownData>(DIALOG_DATA);
  ref = inject(DialogModel<Option>);

  /** Config */
  readonly defaultMinHeight = 300;
  readonly defaultMinWidth = 150;
  readonly defaultMargin = 8;
  readonly mobilePanel = (finalMinHeight: number) =>
  ({
    top: 'auto',
    left: '0px',
    right: '0px',
    bottom: '0px',
    width: '100vw',
    maxHeight: `min(40vh, ${this.defaultMinHeight}px)`,
    minHeight: `${finalMinHeight}px`
  })



  show = false;
  isMobile = false;
  isAboveAnchor = false;

  panelStyle: WritableSignal<Partial<CSSStyleDeclaration>> = signal({});

  constructor(
    public readonly viewPortService: ViewPortService
  ) { }


  ngAfterViewInit(): void {
    // 延遲顯示，避免動畫起始位置錯誤
    timer(0).subscribe(() => { this.show = true });
    this.isMobile = this.detectMobile();
    this.reposition();
  }

  select(option: Option): void {
    this.ref.close(option)
  }

  private detectMobile(): boolean {
    return this.viewPortService.isCoarseSig() || this.viewPortService.lessThan(SCREEN_WIDTH.xmedium);
  }

  private reposition(): void {
    const finalMinHeight = this.data.minHeight ?? this.defaultMinHeight;
    const margin = this.data.margin ?? this.defaultMargin;
    if (!this.data.anchorEl || !(this.data.anchorEl instanceof HTMLElement)) {
      // 沒有錨點就用 mobile 樣式
      this.isMobile = true;
    }
    if (this.isMobile) {
      this.panelStyle.set(this.mobilePanel(finalMinHeight));
      return;
    }
    const anchorRect = this.data.anchorEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - anchorRect.bottom - margin;
    const spaceAbove = anchorRect.top - margin;
    if (spaceBelow < finalMinHeight && spaceAbove < finalMinHeight) {
      this.isMobile = true;
      this.panelStyle.set(this.mobilePanel(finalMinHeight));
      return;
    }
    // 寬度至少跟錨點同寬，並且不超出畫面
    const panelWidth = Math.max(anchorRect.width, this.defaultMinWidth);
    const finalPanelWidth = Math.min(panelWidth, viewportWidth - margin * 2);
    const left = Math.max(margin, Math.min(anchorRect.left, viewportWidth - margin - finalPanelWidth));
    if (spaceBelow >= finalMinHeight) {
      // 下方空間足夠(比預設最小高度高)：
      // 從 anchor 下緣長出，max-height = spaceBelow (內容超過才會出現 scroll)
      this.panelStyle.set({
        top: `${Math.round(anchorRect.bottom + margin)}px`,
        left: `${Math.round(left)}px`,
        width: `${Math.round(finalPanelWidth)}px`,
        height: 'fit-content',
        maxHeight: `${Math.floor(spaceBelow)}px`,
      });
    } else {
      // 下方空間不足(比預設最小高度少)：
      // 改從 anchor 上緣長出
      this.isAboveAnchor = true;
      const finalBottom = (viewportHeight - anchorRect.top) + margin;
      this.panelStyle.set({
        left: `${Math.round(left)}px`,
        width: `${Math.round(finalPanelWidth)}px`,
        bottom: `${Math.ceil(finalBottom)}px`,
        height: 'fit-content',
      })
    }
  }
}

import { Component, inject, input } from '@angular/core';
import { AnchorListItem } from '../../anchor-list.type';
import { AnchorListService } from '../../anchor-list.service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-anchor-list-item',
  standalone: true,
  imports: [AnchorListItemComponent, RouterLink],
  templateUrl: './anchor-list-item.component.html',
  styleUrl: './anchor-list-item.component.scss'
})
export class AnchorListItemComponent {
  anchorListService = inject(AnchorListService);
  item = input<AnchorListItem>({ title: '', list: [], id: '' });
  /** 作為錨點位置的前綴用 */
  prefix = input<string>('');
  /** 是子項 */
  isSub = input<boolean>(true);
}

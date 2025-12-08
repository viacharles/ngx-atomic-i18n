import { Component } from '@angular/core';
import { AnchorListService } from './anchor-list.service';
import { AnchorListItemComponent } from './components/anchor-list-item/anchor-list-item.component';

@Component({
  selector: 'app-anchor-list',
  standalone: true,
  imports: [AnchorListItemComponent],
  templateUrl: './anchor-list.component.html',
  styleUrl: './anchor-list.component.scss'
})
export class AnchorListComponent {
  constructor(public anchorService: AnchorListService) { }
}

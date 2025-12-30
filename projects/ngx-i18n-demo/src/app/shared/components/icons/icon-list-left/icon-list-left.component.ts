import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-list-left',
  standalone: true,
  imports: [],
  templateUrl: './icon-list-left.component.html',
  styleUrl: './icon-list-left.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconListLeftComponent {
  sizeRem = input(1.5);
}

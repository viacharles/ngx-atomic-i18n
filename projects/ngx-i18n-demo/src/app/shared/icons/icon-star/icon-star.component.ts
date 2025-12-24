import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-star',
  standalone: true,
  imports: [],
  templateUrl: './icon-star.component.html',
  styleUrl: './icon-star.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconStarComponent {
  sizeRem = input(1.5);
}

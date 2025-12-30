import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-moon',
  standalone: true,
  imports: [],
  templateUrl: './icon-moon.component.html',
  styleUrl: './icon-moon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconMoonComponent {
  sizeRem = input(1.5);
}

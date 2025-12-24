import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-sun',
  standalone: true,
  imports: [],
  templateUrl: './icon-sun.component.html',
  styleUrl: './icon-sun.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconSunComponent {
  sizeRem = input(1.5);
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-menu',
  standalone: true,
  imports: [],
  templateUrl: './icon-menu.component.html',
  styleUrl: './icon-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconMenuComponent {
  sizeRem = input(1.5);
}

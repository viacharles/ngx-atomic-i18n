import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-screen',
  standalone: true,
  imports: [],
  templateUrl: './icon-screen.component.html',
  styleUrl: './icon-screen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconScreenComponent {
  sizeRem = input(1.5);
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-github',
  standalone: true,
  imports: [],
  templateUrl: './icon-github.component.html',
  styleUrl: './icon-github.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconGithubComponent {
  sizeRem = input(1.5);
}

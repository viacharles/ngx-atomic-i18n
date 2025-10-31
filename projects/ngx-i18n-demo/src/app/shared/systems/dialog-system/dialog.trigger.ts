import { animate, style, transition, trigger } from '@angular/animations';
export enum DialogTriggerStatus {
  SlideInOutFromRight = 'slideInOutFromRight',
}
export const slideInOutFromRight = [
  transition(`${DialogTriggerStatus.SlideInOutFromRight} => void`, [
    animate('100ms ease-in', style({ transform: 'translateX(100%)', opacity: 1 })),
  ]),
  transition(`void => ${DialogTriggerStatus.SlideInOutFromRight}`, [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('100ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
];

export const dialogtrigger = trigger('dialogTrigger', [...slideInOutFromRight]);

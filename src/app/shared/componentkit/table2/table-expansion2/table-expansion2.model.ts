import { animate, state, style, transition, trigger } from "@angular/animations";

export const expandAnimation = trigger('expandAnimation', [
  state('collapsed', style({ height: '0px', opacity: 0 })),
  state('expanded', style({ height: '*', opacity: 1 })),
  transition('collapsed <=> expanded', animate('200ms ease-in-out'))
]);

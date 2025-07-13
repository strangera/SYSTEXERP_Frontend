import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { NgIf, NgClass, NgFor } from '@angular/common';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu-item',
  templateUrl: './app-menu-item.component.html',
  styleUrl: './app-menu-item.component.scss',
  animations: [
    trigger('children', [
      state('collapsed', style({ height: '0' })),
      state('expanded', style({ height: '*' })),
      transition('collapsed <=> expanded', animate('100ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ]),
  ],
  standalone: true,
  imports: [NgIf, NgClass, NgFor, RouterLink]
})
export class AppMenuItemComponent {
  @Input() item: MenuItem = [];

  toggleActive(item: MenuItem) {
    item.expanded = !item.expanded;
  }
}

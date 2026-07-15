import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { PrimeTemplate } from 'primeng/api';
import { Button, ButtonDirective } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { Ripple } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TableCaptionComponent } from './table-caption/table-caption.component';
import { TableExpansionComponent } from './table-expansion/table-expansion.component';
import { TableInputComponent } from './table-input/table-input.component';

// 將所有需要的模組/元件/指令導出為一個常數陣列
export const COMMON_IMPORTS = [
  NgIf,
  DividerModule,
  TableModule,
  PrimeTemplate,
  TooltipModule,
  Button,
  NgClass,
  ButtonDirective,
  NgFor,
  Ripple,
  NgStyle,
  SkeletonModule,

  TableExpansionComponent,
  TableCaptionComponent,
  TableInputComponent,
];
export { TableCaptionComponent, TableExpansionComponent, TableInputComponent };

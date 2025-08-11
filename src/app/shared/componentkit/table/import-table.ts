import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { Button, ButtonDirective } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { Ripple } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
// 自定義的元件，也一同放在這裡
import { TableExpansionComponent } from './table-expansion/table-expansion.component';
import { TableExportComponent } from './table-export/table-export.component';
import { TableFooterComponent } from './table-footer/table-footer.component';

// 將所有需要的模組/元件/指令導出為一個常數陣列
export const COMMON_IMPORTS = [
  NgIf,
  DividerModule,
  TableModule,
  PrimeTemplate,
  MultiSelectModule,
  TooltipModule,
  FormsModule,
  Button, // 注意：Button 和 ButtonDirective 通常會被 ButtonModule 涵蓋
  NgClass,
  ButtonDirective, // 注意：Button 和 ButtonDirective 通常會被 ButtonModule 涵蓋
  FileUploadModule,
  DropdownModule,
  NgFor,
  Ripple, // Ripple 是一個指令
  InputTextModule,
  InputNumberModule,
  CalendarModule,
  CheckboxModule,
  NgStyle,
  SkeletonModule,
  TableExpansionComponent, // 自定義元件
  TableExportComponent,    // 自定義元件
  TableFooterComponent,
  AutoCompleteModule,
];

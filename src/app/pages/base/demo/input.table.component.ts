import { AfterViewInit, Component, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { TabViewModule } from 'primeng/tabview';
import { ExampleInputComponent } from './example-input/example-input.component';
import { ExampleDropdownComponent } from './example-dropdown/example-dropdown.component';
import { ExampleCalendarComponent } from './example-calendar/example-calendar.component';
import { ExampleTableComponent } from './example-table/example-table.component';
import { ExampleTableBruceComponent } from './example-table-bruce/example-table-bruce.component';
import { ExampleUploadComponent } from './example-upload/example-upload.component';
import { ExampleAutocompleteComponent } from './example-autocomplete/example-autocomplete.component';
import { ExampleMultiComponent } from './example-multi/example-multi.component';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { COMMON_IMPORTS } from './demo-imports';
import { ExampleTempleteComponent } from './example-templete/example-templete.component';
@Component({
  selector: 'app-input.table',
  templateUrl: './input.table.component.html',
  standalone: true,
  imports: [
    COMMON_IMPORTS,
    TabViewModule,
    CardModule,
    CommonModule,
  ],
})
export class InputTableComponent implements AfterViewInit {
  @ViewChildren('container', { read: ViewContainerRef }) containers!: QueryList<ViewContainerRef>;
  tabs: { title: string; component: any; class: string }[] = [
    { title: '輸入框', component: ExampleInputComponent, class: 'text-900' },
    { title: '單選', component: ExampleDropdownComponent, class: 'text-900' },
    { title: '多選', component: ExampleMultiComponent, class: 'text-900' },
    { title: '日曆', component: ExampleCalendarComponent, class: 'text-900' },
    { title: '表格', component: ExampleTableComponent, class: 'text-900' },
    { title: '表格(Bruce)', component: ExampleTableBruceComponent, class: 'text-900' },
    { title: '上傳相關', component: ExampleUploadComponent, class: 'text-900' },
    { title: '自動填入', component: ExampleAutocompleteComponent, class: 'text-900' },
    { title: 'HTML編輯器', component: EditorTextComponent, class: 'text-900' },
    { title: '查詢頁面模板', component: ExampleTempleteComponent, class: 'text-red-500' },
  ];
  ngAfterViewInit() {
    this.loadTabs();
  }
  loadTabs() {
    this.containers.forEach((vcRef, index) => {
      vcRef.clear();
      vcRef.createComponent(this.tabs[index].component);
    });
  }
}

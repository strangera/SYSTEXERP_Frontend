import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, QueryList, ViewChildren, ViewContainerRef } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { COMMON_IMPORTS } from './demo-imports';
import { ExampleCalendarComponent } from './example-calendar/example-calendar.component';
import { ExampleDropdownComponent } from './example-dropdown/example-dropdown.component';
import { ExampleInputComponent } from './example-input/example-input.component';
import { ExampleMultiComponent } from './example-multi/example-multi.component';
import { ExampleUploadComponent } from './example-upload/example-upload.component';
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
    { title: '上傳相關', component: ExampleUploadComponent, class: 'text-900' },
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

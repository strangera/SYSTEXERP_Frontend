import { Component, } from '@angular/core';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';

@Component({
  selector: 'app-dynamictabview',
  templateUrl: './dynamictabview.component.html',
  styleUrl: './dynamictabview.component.scss'
})
export class DynamictabviewComponent {
  componentMap: any = {
    '公告': DashboardComponent,
  };
  tabs: any[] = [];

  ngOnInit() {
    this.onAddTab({ title: '公告' });
  }

  onAddTab(item: any) {
    console.log(item);
    const component = this.componentMap[item.title as string];
    const title = item.label;
    console.log(component);
    if (component) {
      this.tabs.push({ title, component });
    }
  }

  removeTab(index: number) {
    this.tabs.splice(index, 1);
  }
}

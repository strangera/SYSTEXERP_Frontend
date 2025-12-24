import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls57120',
  templateUrl: './tls57120.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, CalendarComponent, CalendarRangeComponent, InputNumberComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class TLS57120Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    displayMode: [],
    stockDate: [],
    warehouseCode: [],
    brandCode: [],
    displayCount: [],
    startdatetime: [],
    enddatetime: [],
  });
  displayModeOptions: any[] = [];
  warehouseOptions: any[] = [];
  brandCodeOptions: any[] = [];
  data: any[] = [];
  columns: any[] = [
    { field: 'brand', header: '品牌', visible: true },
    { field: 'endingQuantity', header: '期末數量', visible: true },
    { field: 'endingCost', header: '期末成本', visible: true },
    { field: 'inventoryQuantity', header: '庫存數量', visible: true },
    { field: 'inventoryCost', header: '庫存成本', visible: true },
    { field: 'costRatio', header: '成本佔比', visible: true },
  ];
  constructor(
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57120');
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => { });
  }
}

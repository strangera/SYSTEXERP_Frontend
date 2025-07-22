import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '@shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls27020',
  templateUrl: './tls27020.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputTextComponent, TableComponent, TranslateModule]
})
export class TLS27020Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    saleDate: [],  // 銷售日期
    barcode: [],  // 條碼
    cashRegisterNumber: [],  // 收銀機號
    magneticCardNumber: [],  // 磁卡編號
    amount: [],  // 金額
  });
  totalRecords = 0;
  data: any[] = [];
  columns: Column[] = [
    { field: 'saleDate', header: '銷售日期', visible: true },
    { field: 'code', header: '條碼', visible: true },
    { field: 'cashRegisterCode', header: '收銀機代碼', visible: true },
    { field: 'magneticCardCode', header: '磁卡編號', visible: true },
    { field: 'counterCode', header: '專櫃編號', visible: true },
    { field: 'amount', header: '實收金額', visible: true },
    { field: 'creator', header: '建立者', visible: true },
  ];

  constructor(
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27020', 'TLS/TLS27020cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}

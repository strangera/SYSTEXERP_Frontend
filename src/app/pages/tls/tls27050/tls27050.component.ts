import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentToolTypeService } from '../../../service/basic/payment-tool-type.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '@shared/componentkit/table/table.model';

@Component({
  selector: 'app-tls27050',
  templateUrl: './tls27050.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class TLS27050Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    saleDate: [, [Validators.required]], // 銷售日期
    paymentToolType: [], // 支付工具別
  });
  totalRecords = 0;
  data: any[] = [
  ];
  columns: Column[] = [
    { field: 'paymentType', header: '支付別', visible: true },
    { field: 'barcodeNumber', header: 'Barcode NO.', visible: true },
    { field: 'cashRegisterStatus', header: '收銀機狀況', visible: true },
    { field: 'amount', header: '金額', visible: true },
  ];
  paymentToolTypeOptions: any[] = [];
  constructor(
    private paymentToolTypeService: PaymentToolTypeService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27050', 'TLS/TLS27050cru', this.queryForm, (form) => this.onSubmit(form));
    this.paymentToolTypeService.getPaymentToolTypes().subscribe(data => {
      this.paymentToolTypeOptions = data;
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
    });
  }
}

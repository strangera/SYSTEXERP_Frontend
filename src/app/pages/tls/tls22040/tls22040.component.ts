import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { yesterday } from '@shared/models/system/query-form.model';

// interface TLS22040 {
//   id: 0,
//   Role_No: "string",
//   Role_Name: "string",
//   Description: "string",
//   CRT_Date: "2025-06-18T15:37:00.263Z",
//   CRT_USR_No: "string",
//   CRT_USR_Name: "string",
//   UPD_Date: "2025-06-18T15:37:00.263Z",
//   UPD_USR_No: "string",
//   UPD_USR_Name: "string"
// }

@Component({
    selector: 'app-tls22040',
    templateUrl: './tls22040.component.html',
    standalone: true,
    imports: [
        MenubarComponent,
        AccordionModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarRangeQuickComponent,
        ButtonComponent,
        TableComponent,
        TranslateModule,
    ],
})

export class TLS22040Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    tlt_bdate_start: [yesterday, Validators.required],
    tlt_bdate_end: [yesterday, Validators.required],
      ...createPaginationConfig([{ field: 'paymentTool', order: 1 }])
  });
  // selectedItems: SalesRecord[] = [];

  data: any[] = [];
  columns: Column[] = [
    { field: 'salesDate', header: 'IMS應上送筆數-銷售日期', visible: true },
    { field: 'invoiceTypeIMS', header: 'IMS應上送筆數-發票類型', visible: true },
    { field: 'invoiceAmountIMS', header: 'IMS應上送筆數-發票金額', visible: true },
    { field: 'invoiceCountIMS', header: 'IMS應上送筆數-發票筆數', visible: true },
    { field: 'creationTimeIMS', header: 'IMS應上送筆數-建立時間', visible: true },
    { field: 'fileDate', header: 'Turnkey上送資訊-產檔日期', visible: true },
    { field: 'invoiceTypeTurnkey', header: 'Turnkey上送資訊-發票類型', visible: true },
    { field: 'invoiceCountTurnkey', header: 'Turnkey上送資訊-發票筆數', visible: true }
  ];

  constructor() {
    super()
  }

  ngOnInit(): void {
    this.initializePage('TLS22040', undefined, this.queryForm, this.onSubmit.bind(this));
  }


  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.data = [
        {
          salesDate: '2025/06/01',
          invoiceTypeIMS: '一般稅額',
          invoiceAmountIMS: 120000,
          invoiceCountIMS: 45,
          creationTimeIMS: '2025/06/02 08:15:30',
          fileDate: '2025/06/02',
          invoiceTypeTurnkey: '一般稅額',
          invoiceCountTurnkey: 45
        },
        {
          salesDate: '2025/06/02',
          invoiceTypeIMS: '特種稅額',
          invoiceAmountIMS: 85000,
          invoiceCountIMS: 30,
          creationTimeIMS: '2025/06/03 09:10:12',
          fileDate: '2025/06/03',
          invoiceTypeTurnkey: '特種稅額',
          invoiceCountTurnkey: 30
        },
        {
          salesDate: '2025/06/03',
          invoiceTypeIMS: '免稅',
          invoiceAmountIMS: 53000,
          invoiceCountIMS: 20,
          creationTimeIMS: '2025/06/04 07:48:55',
          fileDate: '2025/06/04',
          invoiceTypeTurnkey: '免稅',
          invoiceCountTurnkey: 20
        }
      ];
      this.loading = false;
      this.messageService.blockUi();

    });
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
}

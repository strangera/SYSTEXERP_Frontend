import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FIN15090Service } from '../../../service/api/fin/fin15090.service';
import { BusinessIdService } from '../../../service/basic/business-id.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { query } from '@angular/animations';
import { QueryYearMonthComponent } from '@shared/componentkit/query-year-month/query-year-month.component';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-fin15090',
  templateUrl: './fin15090.component.html',
  styleUrls: ['./fin15090.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    QueryYearMonthComponent,
    ButtonComponent,
    TranslateModule,
    MultiSelectComponent,
    CommonModule,
    CheckboxModule
  ],
})
export class FIN15090Component extends BasicQueryPageComponent<any> {
  form = {
    agency: '財政部台北市國稅局',
    sender: '南紡流通事業',
    contactPhone: '06-2366222',
    faxPhone: '06-2388111',
    contact: 'tes0001',
    period: '108年02月',
    fileName: '53472035.txt',
    taxId: '708902233',
    businessName: '南紡流通事業',
    amounts: {
      s101: 44663876,
      s107: 40992896,
      s111: 0,
      s114: 30420,
      s115: 11230944
    },
    mediaType: { tape: false, disk: true, cd: true }
  };
  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  businessIdOptions: any[] = [];



  queryForm = this.formBuilder.group({
    DeclareYM: [null, Validators.required], // 申報年月
    Business_ID: [null, Validators.required], // 稅籍編號
    ...createPaginationConfig,
  });


  columns = [
    { field: 'SEQ', header: '序號', visible: true },
    { field: 'UNI_NO', header: '統一編號', visible: true },
    { field: 'BUSINESS_NAME', header: '營業人名稱', visible: true },
    { field: 'BUSINESS_ID', header: '稅籍編號', visible: true },
    { field: 'ADDRESS', header: '營業地址', visible: true },
    { field: 'INVOICE_COUNT', header: '使用發票份數', visible: true },
    { field: 'SALE_AMOUNT', header: '應稅(銷售額)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TAX_AMOUNT', header: '應稅(稅額)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'ZERO_RATE_AMOUNT', header: '零稅率銷售額', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'DUTY_FREE_AMOUNT', header: '免稅銷售額', visible: true, style: 'text-right', format: this.moneyFormat },
  ];
columnGroup = [];
  constructor(
    private fin15090Service: FIN15090Service,
    private businessIdService: BusinessIdService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'FIN15090',
      '/fin/fin15090cru',
      this.queryForm,
      () => this.onSubmit()
    );

    this.businessIdService.getBusinessIdList().subscribe((data) => {
      this.businessIdOptions = data;
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const formValue = this.queryForm.value;

    const payload = {
      DeclareYM: formValue.DeclareYM,
      Business_ID: formValue.Business_ID,
    };

    this.loading = true;
    this.messageService.blockUi();

    this.fin15090Service.queryFIN15090({ request: payload }).subscribe({
      next: (res) => {
        this.data = res?.Data ?? [];
        this.totalRecords = res?.TotalCount ?? this.data.length;

        this.queryStateService.setQueryState(this.ProgNo, payload);
        this.messageService.successBubble('查詢成功');
      },
      error: () => {
        this.messageService.errorBubble('查詢失敗');
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }
}

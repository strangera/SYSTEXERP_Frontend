import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FIN15080Service } from '../../../service/api/fin/fin15080.service';
import { BusinessIdService } from '../../../service/basic/business-id.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';

@Component({
  selector: 'app-fin15080',
  templateUrl: './fin15080.component.html',
  styleUrls: ['./fin15080.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarComponent,
    DropdownComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    MultiSelectComponent
  ],
})
export class FIN15080Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    DeclareYM: [null, Validators.required], // 申報年月
    Business_ID: [null, Validators.required], // 稅籍編號
    ...createPaginationConfig,
  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  businessIdOptions: any[] = [];

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

  constructor(
    private fin15080Service: FIN15080Service,
    private businessIdService: BusinessIdService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'FIN15080',
      '/fin/fin15080cru',
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

    this.fin15080Service.queryFIN15080({ request: payload }).subscribe({
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

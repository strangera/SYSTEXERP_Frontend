import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

// Component Kit
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

// Services
import { TLS2C040Service } from '../../../service/api/tls/tls2c040.service';
import { SubpoenaTypeService } from '../../../service/basic/subpoena-type.service';
import { SubpoenaStatusService } from '../../../service/basic/subpoena-status.service';
import { ValidationService } from '../../../shared/service/validation.service';

@Component({
  selector: 'app-tls2c040',
  templateUrl: './tls2c040.component.html',
  styleUrl: './tls2c040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    CalendarRangeComponent,
    InputNumberComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS2C040Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    subpoenaType: [[] as number[]], // 傳票總類
    startdate: [new Date('2024-01-01')], // 傳票開始日期
    enddate: [new Date('2024-01-31')],   // 傳票結束日期
    subpoenaStatus: [[] as number[]], // 傳票狀態
    serialnumber: ['', [Validators.maxLength(12), this.validationService.numberValidator]], // 結帳單號
    usagecount: [, [Validators.required]], // 次數限制
    ...createPaginationConfig,
  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];

  subpoenaTypeOptions: any[] = [];
  subpoenaStatusOptions: any[] = [];

  columns = [
    { field: 'contactPerson', header: '應收(付)明細暫存資料', visible: true },
    { field: 'contactDate', header: '傳票編號', visible: true },
    { field: 'UID', header: '傳票種類', visible: true },
    { field: 'industryType', header: '傳票日期', visible: true },
    { field: 'category', header: '傳票狀態', visible: true },
    { field: 'version', header: '傳票摘要', visible: true },
    { field: 'rentNumber', header: '結帳單號', visible: true },
  ];

  constructor(
    private subpoenaTypeService: SubpoenaTypeService,
    private subpoenaStatusService: SubpoenaStatusService,
    private tls2c040Service: TLS2C040Service,
    public validationService: ValidationService,
  ) {
    super();
  }

  override ngOnInit(): void {
    this.initializePage(
      'TLS2C040',
      '/tls/tls2c040cru',
      this.queryForm,
      (form) => this.onSubmit()
    );

    this.subpoenaTypeService.getSystemTypes().subscribe(data => {
      this.subpoenaTypeOptions = data;
    });

    this.subpoenaStatusService.getSystemTypes().subscribe(data => {
      this.subpoenaStatusOptions = data;
    });
  }

  onSubmit(): void {
    this.handleSubmit(this.queryForm, () => {
      const formValue = this.queryForm.value;

      const payload = {
        subpoenaType: formValue.subpoenaType,
        startdate: formValue.startdate,
        enddate: formValue.enddate,
        subpoenaStatus: formValue.subpoenaStatus,
        serialnumber: formValue.serialnumber?.trim() || '',
        usagecount: formValue.usagecount,

      };

      this.tls2c040Service.queryTLS2C040({ request: payload }).subscribe({
        next: (res) => {
          this.data = res?.Data ?? [];
          this.totalRecords = res?.TotalCount ?? this.data.length;

          this.queryStateService.setQueryState(this.ProgNo, payload);
          
        },
        error: () => {
          this.messageService.errorBubble('查詢失敗');
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
      });
    });
  }
}

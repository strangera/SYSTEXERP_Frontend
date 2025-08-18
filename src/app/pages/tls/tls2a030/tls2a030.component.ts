import { Component } from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { LocationOptionsService } from '../../../service/api/dropdownservice/location-options.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { TLS2A030Service } from '../../../service/api/tls/tls2a030.service';
import { HttpClient } from '@angular/common/http';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { TranslateModule } from '@ngx-translate/core';
import { yesterday } from '@shared/models/system/query-form.model';

@Component({
  selector: 'app-tls2a030',
  templateUrl: './tls2a030.component.html',
  styleUrls: ['./tls2a030.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    DropdownRangeComponent,
    ButtonComponent,
    TableComponent,
    TranslateModule,
  ],
})
export class TLS2A030Component extends BasicQueryPageComponent<any> {
  queryForm = this.formBuilder.group({
    SaleDateStart: [yesterday, Validators.required],
    SaleDateEnd: [yesterday, Validators.required],
    ECR_No_Start: [null as string | null],
    ECR_No_End: [null as string | null],
    ...createPaginationConfig,
  });

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  ECRNoOptions: any[] = [];

  columns = [
    { field: 'PAY_NAME', header: '支付工具', visible: true },
    {
      field: 'OVER_PayAmt',
      header: '實際淨欠總額 (A)',
      visible: true,
      format: this.moneyFormat,
      style: 'text-right'
    },
    {
      field: 'PreAudit_OVER_PayAmt',
      header: '審核前淨欠總額 (B)',
      visible: true,
      format: this.moneyFormat,
      style: 'text-right'
    },
    {
      field: 'Actual_ReceivedAmt',
      header: '實收總額 (C)',
      visible: true,
      format: this.moneyFormat,
      style: 'text-right'
    },
    {
      field: 'BOOK_PayAmt',
      header: '系統帳 (D)',
      visible: true,
      format: this.moneyFormat,
      style: 'text-right'
    },
    {
      field: 'Compare_CD',
      header: '(C) 與 (D) 比較',
      format: (v: boolean) => (v ? `Y` : `N`),
      visible: true,

    },
    {
      field: 'Compare_AB',
      header: '(A) 與 (B) 比較',
      format: (v: boolean) => (v ? `Y` : `N`),
      visible: true,

    },
  ];

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0'; // ✅ 使用美式格式
  }

  constructor(
    private locationOptionsService: LocationOptionsService,
    private ECRNoService: ECRNoService,
    private tls2a030Service: TLS2A030Service,
    private http: HttpClient,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'TLS2A030',
      '/tls/tls2A030cru',
      this.queryForm,
      (form) => this.onSubmit(),
    );
    this.ECRNoService.getECRNo().subscribe(
      (data) => (this.ECRNoOptions = data),
    );
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const formValue = this.queryForm.value;

    const payload = {
      SaleDateStart:
        formValue.SaleDateStart instanceof Date
          ? formValue.SaleDateStart.toISOString()
          : null,
      SaleDateEnd:
        formValue.SaleDateEnd instanceof Date
          ? formValue.SaleDateEnd.toISOString()
          : null,
      ECR_No_Start: formValue.ECR_No_Start?.trim() || '',
      ECR_No_End: formValue.ECR_No_End?.trim() || '',
    };

    this.loading = true;
    this.messageService.blockUi();

    this.tls2a030Service.queryTLS2A030({ request: payload }).subscribe({
      next: (res) => {
        this.data = res?.Data ?? [];
        this.totalRecords = res?.TotalCount ?? this.data.length;

        // 如果只要記錄查詢條件，也可以只存 payload
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
}

import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS23070Service } from '../../../service/api/tls/tls23070.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, takeUntil, timeout, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { ColumnLabelService } from '../../../service/basic/column-label.service';

@Component({
  selector: 'app-tls23070',
  templateUrl: './tls23070.component.html',
  styleUrls: ['./tls23070.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    TableComponent,
  ],
})
export class TLS23070Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords = 0;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ✅ 陣列欄位用 control<any[]>([])，避免 never[] 型別問題
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    tlt_no: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    ...createPaginationConfig([{ field: 'tlt_no', order: 1 }]),
  });

  CounterOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  WhetherOptions: any[] = [];
  OrganizationCodeOptions: any[] = []; // ✅ 不要 ['']

  constructor(
    private tls23070Service: TLS23070Service,
    private counterNameService: CounterNameService,
    private floorService: FloorService,
    private tls11010Service: Tls11010Service,
    private columnLabelService: ColumnLabelService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23070', 'tls/tls23070', this.queryForm, (form) => this.onSubmit(form));

    // ✅ 下拉資料全加 takeUntil，避免 memory leak
    this.counterNameService
      .getCounters()

      .subscribe((res) => {
        this.CounterOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });

    this.floorService
      .getFloors()

      .subscribe((data) => (this.floorOptions = data));

    this.tls11010Service
      .getBuildingOptions()

      .subscribe((data) => (this.BUILDING_NO_Options = data));

    this.tls11010Service
      .getOrgOptions()

      .subscribe((res) => {
        this.OrganizationCodeOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.value as any;

      // 直接在這裡組 payload
      const payload: any = {
        ...val,
        TXN_DateStart: this.toIso(val?.TXN_DateStart),
        TXN_DateEnd: this.toIso(val?.TXN_DateEnd),
        // 分頁/排序（createPaginationConfig 已放在 form）
        pageSize: val?.pageSize,
        pageIndex: val?.pageIndex,
        SortBy: val?.SortBy,
        OrderBy: val?.OrderBy,
        Offset: val?.Offset,
      };

      // 清理空值/空陣列，避免干擾後端繫結
      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === '' || v === null || v === undefined) delete payload[k];
        if (Array.isArray(v) && v.length === 0) delete payload[k];
      });

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23070Service.queryTLS23070(payload).subscribe({
        next: (res) => {
          const raw = res?.Data ?? [];
          this.data = Array.isArray(raw) ? raw : [];
          this.totalRecords =
            typeof res?.TotalCount === 'number'
              ? res.TotalCount
              : this.data.length;
        },
        error: (err) => {
          console.error('TLS23070 查詢失敗', err);
          this.messageService?.errorBubble?.('查詢失敗，請稍後再試');
        },
        complete: () => {
          this.loading = false;
          this.messageService?.unblockUi();
        },
      });
    });
  }

  // 轉本地 ISO 字串 yyyy-MM-ddTHH:mm:ss（去掉時區偏移）
  private toIso(val: any): string | undefined {
    if (!val) return undefined;
    const d = typeof val === 'string' ? new Date(val) : (val as Date);
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  get columns() {
    const fixedCols = [
      { field: 'tlt_no', header: '專櫃編號', visible: true },
      { field: 'tlt_name', header: '櫃位名稱', visible: true },
      {
        field: 'TXN_Date',
        header: '銷售日期',
        visible: true,
        format: (val: string) => {
          const date = new Date(val);
          return isNaN(date.getTime())
            ? val
            : `${date.getFullYear()}/${(date.getMonth() + 1)
                .toString()
                .padStart(
                  2,
                  '0',
                )}/${date.getDate().toString().padStart(2, '0')}`;
        },
      },
      { field: 'ECR_No', header: '收銀機號', visible: true },
    ];

    const dynamicCols = [
      'TXN_TotPayAmt',
      'TXN_PayAmt10',
      'TXN_PayAmt41',
      'TXN_PayAmt42',
      'TXN_PayAmt12',
      'TXN_PayAmt81',
      'TXN_PayAmt43',
      'TXN_PayAmt44',
      'TXN_PayAmt14',
      'TXN_PayAmt82',
      'TXN_PayAmt52',
      'TXN_PayAmt20',
      'TXN_PayAmt62',
      'TXN_PayAmt77',
      'TXN_PayAmt71',
      'TXN_PayAmt30',
      'TXN_PayAmt73',
      'TXN_PayAmt72',
      'TXN_PayAmt74',
      'TXN_PayAmt75',
      'TXN_PayAmt76',
      'TXN_PayAmt24',
      'TXN_PayAmt25',
      'TXN_PayAmt07',
      'TXN_PayAmt55',
      'TXN_PayAmt83',
      'TXN_PayAmt78',
      'TXN_PayAmt79',
      'TXN_PayAmt21',
      'TXN_PayAmt53',
      'TXN_PayAmt56',
      'TXN_PayAmt57',
      'TXN_PayAmt58',
      'TXN_PayAmt59',
      'TXN_PayAmt60',
      'TXN_PayAmt22',
      'TXN_PayAmt23',
      'PreSale_Received',
      'PreSale_Checkout',
      'TXN_OverAmt',
      'TXN_ReturnAmt',
      'TXN_ExchangeAmt',
      'TXN_CancelAmt',
      'TXN_AgentAmt',
    ];

    return [
      ...fixedCols,
      ...dynamicCols.map((field) => ({
        field,
        header: this.columnLabelService.getLabel(field),
        visible: true,
        style: 'text-right',
        format: this.moneyFormat.bind(this),
      })),
    ];
  }
}

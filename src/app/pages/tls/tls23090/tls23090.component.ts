import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { TLS23090Service } from '../../../service/api/tls/tls23090.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { InstallmentPeriodService } from '../../../service/basic/installment-period.service';
import { AcquiringBankService } from '../../../service/basic/acquiring-bank.service';
import { ConnectionStatusService } from '../../../service/basic/connection-status.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, takeUntil, timeout, catchError } from 'rxjs/operators';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls23090',
  templateUrl: './tls23090.component.html',
  styleUrls: ['./tls23090.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputTextComponent,
    InputTextModule,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    TranslateModule,
    TableComponent,
  ],
})
export class TLS23090Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords = 0;
  
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [],
    tlt_no: [],
    CRD_Type: [],
    CRD_No: [],
    TXN_PayAmt: [null],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],
    IPeriod: [],
    AcqBank: [],
    ConnStatus: [],
    IsHaveTERM_No: [null],
    ...createPaginationConfig([{ field: 'TXN_Date', order: 1 }]),
  });
  cardTypeOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];
  WhetherOptions: any[] = [];
  installmentPeriodOptions: any[] = [];
  acquiringBankOptions: any[] = [];
  connectionStatusOptions: any[] = [];



  constructor(
    private cardTypeService: CardTypeService,
    private tls23090Service: TLS23090Service,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private whetherService: WhetherService,
    private installmentPeriodService: InstallmentPeriodService,
    private acquiringBankService: AcquiringBankService,
    private connectionStatusService: ConnectionStatusService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23090', 'tls/tls23090', this.queryForm, (form) => this.onSubmit(form));

    this.cardTypeService
      .getCardType().subscribe((data) => (this.cardTypeOptions = data));
    this.floorService
      .getFloors().subscribe((data) => (this.floorOptions = data));
    this.whetherService
      .getWhetherOptions().subscribe((data) => (this.WhetherOptions = data));
    this.tls11010Service
      .getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
    this.tls11010Service
      .getOrgOptions().subscribe((res) => {
        this.OrganizationCodeOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });
    this.ECRNoService.getECRNo().subscribe((res) => {
        this.ECRNoOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });
    this.counterNameService
      .getCounters().subscribe((res) => {
        this.CounterOptions =
          res?.map((x: any) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });
    this.installmentPeriodService
      .getInstallmentPeriods().subscribe((data) => (this.installmentPeriodOptions = data));
    this.acquiringBankService
      .getAcquiringBanks().subscribe((data) => (this.acquiringBankOptions = data));
    this.connectionStatusService
      .getConnectionStatusOptions().subscribe((data) => (this.connectionStatusOptions = data));
  }
  formatDate(val: string): string {
    const date = new Date(val);
    return isNaN(date.getTime())
      ? val
      : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  }

  
  // 送出查詢（無 doQuery / buildPayload）
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.value as any;

      // 本地 ISO(yyyy-MM-ddTHH:mm:ss) — 去掉時區偏移
      const toIso = (x: any) => {
        if (!x) return undefined;
        const d = typeof x === 'string' ? new Date(x) : (x as Date);
        if (isNaN(d.getTime())) return undefined;
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 19);
      };

      // 直接在這裡組 payload（保留分頁/排序；可帶上報表模式）
      const payload: any = {
        ...val,
        TXN_DateStart: toIso(val?.TXN_DateStart),
        TXN_DateEnd: toIso(val?.TXN_DateEnd),
        pageSize: val?.pageSize,
        pageIndex: val?.pageIndex,
        SortBy: val?.SortBy,
        OrderBy: val?.OrderBy,
        Offset: val?.Offset,
        
      };

      // 數值型欄位的保險轉型（避免空字串傳下去）
      if ((val?.TXN_PayAmt ?? '') !== '') {
        payload.TXN_PayAmt = Number(val.TXN_PayAmt);
      } else {
        delete payload.TXN_PayAmt;
      }

      // 移除空字串 / null / undefined / 空陣列
      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === '' || v === null || v === undefined) delete payload[k];
        if (Array.isArray(v) && v.length === 0) delete payload[k];
      });

      // 呼叫 API
      this.loading = true;
      this.messageService?.blockUi();

      this.tls23090Service.queryTLS23090(payload).subscribe({
        next: (res) => {
          const raw = res?.Data ?? [];
          this.data = Array.isArray(raw) ? raw : [];
          this.totalRecords =
            typeof res?.TotalCount === 'number'
              ? res.TotalCount
              : this.data.length; // ✅ 沒有 res.total
        },
        error: (err) => {
          console.error('TLS23090 查詢失敗', err);
          this.messageService?.errorBubble?.('查詢失敗，請稍後再試');
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
          this.messageService?.unblockUi();
        },
      });
    });
  }
  columns = [
    { field: 'TXN_Date', header: '銷售日期', format: this.formatDate },
    { field: 'ECR_No', header: '收銀機號' },
    { field: 'TXN_No', header: '交易序號' },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
    { field: 'CRD_Type', header: '信用卡卡別' },
    { field: 'CRD_No', header: '信用卡卡號' },
    {
      field: 'TXN_PayAmt',
      header: '金額',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0',
    },
    {
      field: 'TXN_Bonus',
      header: '紅利',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0',
    },
    { field: 'TXN_Installment', header: '分期' },
    { field: 'TXN_PeriodType', header: '分期期別' },
    { field: 'TXN_Periods', header: '分期期數' },
    {
      field: 'TXN_DownPayAmt',
      header: '頭期款分期金額',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0',
    },
    {
      field: 'TXN_MonthlyAmt',
      header: '每期分期金額',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0',
    },
  ];
}

import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS23040Service } from '../../../service/api/tls/tls23040.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { timeout, catchError, debounceTime, takeUntil } from 'rxjs/operators';
import { of, Subject, Subscription } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { PaymentDetail, DiscountDetail, InvoiceDetail } from './tls23040.model';
import { TableComponent } from '@shared/componentkit/table/table.component';

@Component({
  selector: 'app-tls23040',
  templateUrl: './tls23040.component.html',
  styleUrls: ['./tls23040.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
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
export class TLS23040Component extends BasicQueryPageComponent<any> {


  totalRecords = 0;
  data: any[] = [];


  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ✅ 陣列欄位用 control<any[]>([])，避免 never[]；ECR_No 建議也用陣列，UI 預設「無選項」即可
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [null], // ✅ 初始為 null（不會出現預設選項）
    TXN_No_Start: [null],
    TXN_No_End: [null],
    TLT_No: [[]],
    TXN_Status: [[]],
    TXN_FlagStatus: [[]],
    TXN_PkngUID: [''],
    TXN_MemCard: [''],
    TXN_GUIBegNo: [''],
    tlt_building: [''],
    tlt_floor: [[]],
    org_id: [[]],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  statusFlagOptions: any[] = [];
  TXN_SubtypeOptions: any[] = [];
  txnStatusOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  WhetherOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private tls23040Service: TLS23040Service,
    private statusFlagService: StatusFlagService,
    private TXN_SubtypeService: TXN_SubtypeService,
    private txnStatusService: TxnStatusService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
   this.initializePage('TLS23040', 'tls/tls23040cru', this.queryForm, (form) => this.onSubmit(form));



    // ✅ 下拉資料：一律加 takeUntil
    this.statusFlagService.getStatusFlags()
      
      .subscribe(data => this.statusFlagOptions = data);

    this.TXN_SubtypeService.getTXNSubtype()
      
      .subscribe(data => this.TXN_SubtypeOptions = data);

    this.txnStatusService.getTxnStatusOptions()
      
      .subscribe(data => this.txnStatusOptions = data);

    this.floorService.getFloors()
      
      .subscribe(data => this.floorOptions = data);

    this.tls11010Service.getBuildingOptions()
      
      .subscribe(data => this.BUILDING_NO_Options = data);

    this.tls11010Service.getOrgOptions()
      
      .subscribe(res => {
        this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });

    this.ECRNoService.getECRNo()
      
      .subscribe(res => {
        this.ECRNoOptions = (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });

    this.counterNameService.getCounters()
      
      .subscribe(res => {
        this.CounterOptions = (res ?? []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });
  }

  // 送出查詢
onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => this.doQuery());
}

// 查詢主流程
private doQuery(): void {
  const payload = this.buildPayload(this.queryForm.value);
  this.loading = true;
  this.messageService?.blockUi();

  this.tls23040Service.queryTLS23040(payload).subscribe({
next: (res) => {
  const raw = res?.Data ?? [];
  this.data = Array.isArray(raw) ? raw : [];
  this.totalRecords = typeof res?.TotalCount === 'number'
    ? res.TotalCount
    : this.data.length;   // ✅ 移除 res?.total
},
    error: (err) => {
      console.error('TLS23040 查詢失敗', err);
      this.messageService?.errorBubble?.('查詢失敗，請稍後再試');
    },
    complete: () => {
      this.loading = false;
      this.messageService?.unblockUi();
    }
  });
}

// 日期轉後端要的 yyyy-MM-ddTHH:mm:ss（以本地時間為準，去掉時區偏移）
private toIso(val: any): string | undefined {
  if (!val) return undefined;
  const d = typeof val === 'string' ? new Date(val) : (val as Date);
  if (isNaN(d.getTime())) return undefined;
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 19);
}

// 組 payload 並清除空值/空陣列，保留分頁與排序欄位
private buildPayload(val: any) {
  const o: any = {
    ...val,
    TXN_DateStart: this.toIso(val?.TXN_DateStart),
    TXN_DateEnd:   this.toIso(val?.TXN_DateEnd),
    TXN_No_Start:  (val?.TXN_No_Start ?? '') !== '' ? Number(val.TXN_No_Start) : undefined,
    TXN_No_End:    (val?.TXN_No_End ?? '')   !== '' ? Number(val.TXN_No_End)   : undefined,
  };

  // 移除空字串 / null / undefined / 空陣列，避免干擾後端繫結
  Object.keys(o).forEach((k) => {
    const v = o[k];
    if (v === '' || v === null || v === undefined) delete o[k];
    if (Array.isArray(v) && v.length === 0) delete o[k];
  });

  // 分頁/排序照原值帶出（你的 table.model 已提供）
  return {
    ...o,
    pageSize:  o.pageSize,
    pageIndex: o.pageIndex,
    SortBy:    o.SortBy,
    OrderBy:   o.OrderBy,
    Offset:    o.Offset,
  };
}


  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

   columns= [
          {
            field: 'TXN_Date',
            header: '銷售日期',
            visible: true,
            format: (val: string) => {
              const d = new Date(val);
              return isNaN(d.getTime())
                ? val
                : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
            },
          },
          { field: 'ECR_No', header: '收銀機號', visible: true },
          { field: 'TXN_No', header: '交易序號', visible: true },
          { field: 'tlt_no', header: '專櫃編號', visible: true },
          {
            field: 'tlt_name',
            header: '櫃位名稱',
            visible: true,
            style: 'text-left',
          },
          { field: 'gui_track', header: '發票起號(字軌)', visible: true },
          { field: 'GUIBegNo', header: '發票起始號碼', visible: true },
          { field: 'GUIEndNo', header: '發票結束號碼', visible: true },
          {
            field: 'TXN_TotGUI',
            header: '發票金額',
            visible: true,
            style: 'text-right',
            format: (val: number) => val?.toLocaleString('en-US') || '0',
          },
          {
            field: 'TXN_TotSaleAmt',
            header: '業績金額',
            visible: true,
            style: 'text-right',
            format: (val: number) => val?.toLocaleString('en-US') || '0',
          },
          {
            field: 'TXN_Status',
            header: '交易型態',
            visible: true,
            format: (val: any) =>
              this.getLabelFromOptions(val, this.txnStatusOptions),
          },
          {
            field: 'TXN_TaxFreeCertNo',
            header: '外交官免稅卡號',
            visible: true,
          },
          { field: 'USR_No', header: '收銀員', visible: true },
          { field: 'TXN_PkngUID', header: '停車卡號', visible: true },
          {
            field: 'ORG_TXN_Date',
            header: '原交易日期',
            visible: true,
            format: (val: string) => {
              const d = new Date(val);
              return isNaN(d.getTime())
                ? val
                : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
            },
          },
          { field: 'ORG_ECR_No', header: '原收銀機號', visible: true },
          { field: 'ORG_TXN_No', header: '原交易序號', visible: true },
          { field: 'TXN_MemCard', header: '會員卡號', visible: true },
          {
            field: 'TXN_TotPayScoreAmt',
            header: '會員積點折抵',
            visible: true,
            style: 'text-right',
            format: (val: number) => val?.toLocaleString('en-US') || '0',
          },
        ];
}

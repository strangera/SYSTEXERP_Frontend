import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { RegionService } from '../../../service/basic/region-code.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TLS23130Service } from '../../../service/api/tls/tls23130.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { CardTypeService } from '../../../service/basic/card-type.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { BigCategoryCodeService } from '../../../service/basic/big-category-code.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, takeUntil, timeout, catchError, map } from 'rxjs/operators';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { DropDownListService, IBankRequest } from '@service/utility/dropDownList.service';

@Component({
  selector: 'app-tls23130',
  templateUrl: './tls23130.component.html',
  styleUrls: ['./tls23130.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    DropdownComponent,
    MultiSelectComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    TableComponent,
  ],
})
export class TLS23130Component extends BasicQueryPageComponent<any> {
  
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  data: any[] = [];
  totalRecords = 0;

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    BNK_No: [],
    tlt_building: [],
    tlt_floor: [],
    org_id: [],

    ...createPaginationConfig([{ field: 'TA.tlt_no', order: 1 }]),
  });

  organizationOptions: any[] = [];
  regionOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  whetherOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  cardTypeOptions: any[] = [];
  CounterOptions: any[] = [];
  bus_typeOptions: any[] = [];

  constructor(
    private tls23130Service: TLS23130Service,
    private regionService: RegionService,
    private cardTypeService: CardTypeService,
    private businessTypeCodeService: BusinessTypeCodeService,
    private organizationNumberService: OrganizationNumberService,
    private whetherService: WhetherService,
    private floorService: FloorService,
    private counterNameService: CounterNameService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private tls11010Service: Tls11010Service,
    private dropDownListService:DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23130', 'tls/tls23130', this.queryForm, (form) => this.onSubmit(form));
    // this.cardTypeService
    //   .getCardType().subscribe((data) => (this.cardTypeOptions = data));
    this.organizationNumberService
      .getOrganizationNumbers().subscribe((data) => (this.organizationOptions = data));
    this.regionService      .getRegionOptions().subscribe((data) => (this.regionOptions = data));
    this.floorService
      .getFloors().subscribe((data) => (this.floorOptions = data));
    this.bigCategoryCodeService
      .getSystemTypes().subscribe((res) => {
        this.bus_typeOptions =
          res?.map((x) => ({
            label: x.label,
            formLabel: x.label,
            value: x.value,
          })) || [];
      });
    this.whetherService
      .getWhetherOptions().subscribe((data) => (this.whetherOptions = data));
    this.tls11010Service
      .getBuildingOptions().subscribe((data) => (this.BUILDING_NO_Options = data));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions =
        res?.map((x) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.counterNameService
      .getCounters().subscribe((res) => {
        this.CounterOptions =
          res?.map((x) => ({
            label: x.label,
            formLabel: `${x.value} - ${x.label}`,
            value: x.value,
          })) || [];
      });
      // 小工具：從物件取第一個存在的鍵值
const pick = (obj: any, keys: string[], fallback = '') =>
  keys.find(k => obj?.[k] != null && obj?.[k] !== '')
    ? obj[keys.find(k => obj?.[k] != null && obj?.[k] !== '') as string]
    : fallback;

this.dropDownListService
  .queryAPS1001_DropDownList({ SearchKeyword: '' } as IBankRequest) // ✅ 用對型別，補上必填鍵
  .pipe(
    map(res => Array.isArray(res?.Data) ? (res.Data as any[]) : []),
    map(list => list.map(x => {
      const v = String(pick(x, ['value','Value','id','Id','ID','code','Code','no','No','BankNo','BNK_No']));
      const l = String(pick(x, ['label','Label','text','Text','name','Name','desc','Desc','BankName'], v));
      return { label: l, value: v, formLabel: `${v} - ${l}` };
    })),
    catchError(err => {
      console.error('queryAPS1001_DropDownList 失敗', err);
      this.messageService?.errorBubble?.('銀行下拉資料讀取失敗');
      return of([] as any[]);
    })
  )
  .subscribe(opts => this.cardTypeOptions = opts);
  }

onSubmit(form: FormGroup): void {
  this.handleSubmit(form, () => {
    const val = this.queryForm.getRawValue() as any;

    // pageIndex/pageSize -> Offset（0-based）
    const offset =
      Number.isFinite(val?.pageIndex) && Number.isFinite(val?.pageSize)
        ? Math.max(0, (val.pageIndex - 1) * val.pageSize)
        : undefined;

    // SortMeta[] -> "field ASC,DESC"
    const orderBy =
      Array.isArray(val?.SortBy) && val.SortBy.length
        ? val.SortBy.map((s: any) => `${s.field} ${s.order === 1 ? 'ASC' : 'DESC'}`).join(',')
        : undefined;

    // 本地 ISO(yyyy-MM-ddTHH:mm:ss) — 去掉時區偏移
    const toIso = (x: any) => {
      if (!x) return undefined;
      const d = typeof x === 'string' ? new Date(x) : (x as Date);
      if (isNaN(d.getTime())) return undefined;
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19);
    };

    // 組 payload（保留分頁/排序）
    const payload: any = {
      TXN_DateStart: toIso(val?.TXN_DateStart),
      TXN_DateEnd:   toIso(val?.TXN_DateEnd),
      BNK_No:        val?.BNK_No,
      tlt_building:  val?.tlt_building,
      tlt_floor:     val?.tlt_floor,
      org_id:        val?.org_id,
      pageSize:      val?.pageSize,
      pageIndex:     val?.pageIndex,
      SortBy:        val?.SortBy,
      ...(offset  !== undefined ? { Offset:  offset } : {}),
      ...(orderBy ? { OrderBy: orderBy } : {}),
    };

    // 清除空值/空陣列
    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === '' || v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
    });

    this.loading = true;
    this.messageService?.blockUi();

    this.tls23130Service.queryTLS23130(payload).subscribe({
      next: (res: any) => {
        // 後端回傳的 Data：[{ CRD_No, TXN_No, tlt_no, tlt_name, TXN_PayAmt, TXN_Date, TXN_Time, TERM_No, EDC_InstHeadAmt, EDC_InstEachAmt, ... }]
        const src = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);

        // 轉成表格 columns 需要的鍵
        this.data = src.map((r: any) => ({
          cardNumber:          r?.CRD_No ?? '',
          transactionSequence: r?.TXN_No ?? '',
          // 機號/名稱：用「機號 / 櫃位名稱」，也可改成 `${r?.tlt_no} / ${r?.tlt_name}`
          machineNumber:       [r?.TERM_No, r?.tlt_name].filter(Boolean).join(' / '),

          amount:              r?.TXN_PayAmt ?? 0,
          TXN_Date:            r?.TXN_Date ?? '',
          TXN_GUINo:           r?.TXN_GUINo ?? '',
          TXN_Time:            r?.TXN_Time ?? '',

          // 分期數（回傳未提供，先留空；若後端有 EDC_InstPeriod 就改這裡）
          installmentPeriod:   r?.EDC_InstPeriod ?? '',

          initialPayment:      r?.EDC_InstHeadAmt ?? 0,
          monthlyPayment:      r?.EDC_InstEachAmt ?? 0,
        }));

        this.totalRecords =
          typeof res?.TotalCount === 'number' ? res.TotalCount : this.data.length;

        // 若要用總額：const total = res?.Data?.[0]?.TotalPayAmt;
      },
      error: (err) => {
        console.error('TLS23130 查詢失敗', err);
        this.messageService?.errorBubble?.('查詢失敗，請稍後再試');
        this.loading = false;
        this.messageService?.unblockUi();
      },
      complete: () => {
        this.loading = false;
        this.messageService?.unblockUi();
      },
    });
  });
}


    moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }
    columns = [
      { field: 'cardNumber', header: '卡號', visible: true },
      { field: 'transactionSequence', header: '交易序號', visible: true },
      { field: 'machineNumber', header: '機號/名稱', visible: true },
      { field: 'amount', header: '金額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_Date', header: '日期', visible: true },
      { field: 'TXN_GUINo', header: '發票號碼', visible: true },
      { field: 'TXN_Time', header: '交易時間', visible: true },
      { field: 'installmentPeriod', header: '分期數', visible: true },
      { field: 'initialPayment', header: '頭期', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'monthlyPayment', header: '每期', visible: true, style: 'text-right', format: this.moneyFormat }
    ];
  
}

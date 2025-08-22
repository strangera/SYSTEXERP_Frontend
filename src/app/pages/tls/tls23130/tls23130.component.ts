import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
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
      BNK_No:        [[], [Validators.required]],   // ✅ 多選 + 必填
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

this.tls23130Service
  .queryAPS1001_DropDownList({ SearchKeyword: '' })
  .pipe(
    map(res => (Array.isArray(res?.Data) ? res.Data : [])),
    map(list =>
      list.map((x: any) => {
        const v = String(x.No ?? x.BNK_No ?? '');
        const l = String(x.Name ?? x.BankName ?? '');
        return { label: `${v} - ${l}`, value: v, formLabel: `${v} - ${l}` };
      })
    ),
    catchError(err => {
      console.error('queryAPS1001_DropDownList 失敗', err);
      this.messageService?.errorBubble?.('銀行下拉資料讀取失敗');
      return of([] as any[]);
    })
  )
// … 前略 …
.subscribe(opts => {
  this.cardTypeOptions = opts;
  if (opts.length > 0) {
    const first = opts[0].value;
    // ✅ 先轉 unknown 再轉目標型別，解掉 TS2352
    (this.queryForm.get('BNK_No') as unknown as FormControl<string[]>)
      .setValue([first]);
    this.queryForm.get('BNK_No')!.updateValueAndValidity({ onlySelf: true });
  }
});
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

   const payload: any = {
  TXN_DateStart: toIso(val?.TXN_DateStart),
  TXN_DateEnd:   toIso(val?.TXN_DateEnd),
  BNK_No:        Array.isArray(val?.BNK_No) ? val.BNK_No.filter(Boolean) : undefined, // ✅ 多選
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
        // 先把外層 Data 正規化成陣列
        const src = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);

        // 攤平每筆的 tLS23130_Details（注意原始鍵名大小寫）
        const details = src.flatMap((x: any) =>
          Array.isArray(x?.['tLS23130_Details']) ? x['tLS23130_Details'] : []
        );

        // ✅ 直接把 details 餵給表格
        this.data = details;

        // 總筆數：優先用後端回傳，否則用 details 長度
        this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : details.length;

        // （可選）若你也要顯示總金額，可順便算一下：
        // this.totalPayAmt = src.reduce((s: number, x: any) => s + (Number(x?.TotalPayAmt) || 0), 0);
      },
      error: (err) => {
        
        
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


  formatYMD = (val: unknown): string => {
  if (val == null) return '';
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  }
  const s = String(val);
  // 直接抓 YYYY-MM-DD，避免時區位移
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}/${m[2]}/${m[3]}`;

  const dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    const y = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${y}/${mm}/${dd}`;
  }
  return s;
};  
  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }
  
  formatISOToHHMMSS = (val: string): string => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  const ss = String(d.getSeconds()).padStart(2,'0');
  return `${hh}:${mm}:${ss}`;
};
    columns = [
      { field: 'CRD_No', header: '卡號', visible: true },
      { field: 'TXN_No', header: '交易序號', visible: true },
      { field: 'tlt_no', header: '專櫃編號', visible: true },
      { field: 'tlt_name', header: '櫃位名稱', visible: true },
      { field: 'TXN_PayAmt', header: '金額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_Date', header: '銷售日期', visible: true , format: this.formatYMD},
      { field: 'TXN_GUINo', header: '發票號碼', visible: true },
      { field: 'TXN_Time', header: '銷售時間', visible: true , format: this.formatISOToHHMMSS},
      { field: 'TERM_No', header: '分期數', visible: true },
      { field: 'EDC_InstHeadAmt', header: '頭期', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'EDC_InstEachAmt', header: '每期', visible: true, style: 'text-right', format: this.moneyFormat }
    ];
  
}

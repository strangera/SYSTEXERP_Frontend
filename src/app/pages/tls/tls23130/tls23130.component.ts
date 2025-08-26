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
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';
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
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { DropDownListService } from '@service/utility/dropDownList.service';

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

  // ---- 排序狀態 ----
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [
    { field: 'BNK_No', order: 1 }, // 銀行代號
  ];
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd:   [this.yesterday, [Validators.required]],

    // ✅ 單選：string（必填）
    BNK_No: this.formBuilder.control<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tlt_building: [],
    tlt_floor:    [],
    org_id:       [],
    ...createPaginationConfig([{ field: 'BNK_No', order: 1 }]),
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
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23130', 'tls/tls23130', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));

    this.organizationNumberService.getOrganizationNumbers().subscribe(data => this.organizationOptions = data);
    this.regionService.getRegionOptions().subscribe(data => this.regionOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.bigCategoryCodeService.getSystemTypes().subscribe(res => {
      this.bus_typeOptions = res?.map((x) => ({
        label: x.label,
        formLabel: x.label,
        value: x.value,
      })) || [];
    });
    this.whetherService.getWhetherOptions().subscribe(data => this.whetherOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = res?.map((x) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
    });
    this.counterNameService.getCounters().subscribe(res => {
      this.CounterOptions = res?.map((x) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      })) || [];
    });

    // 銀行下拉（單選字串）— 預設帶入第一筆
    this.tls23130Service
      .queryAPS1001_DropDownList({ SearchKeyword: '' })
      .pipe(
        map(res => (Array.isArray(res?.Data) ? res.Data : [])),
        map(list => list.map((x: any) => {
          const v = String(x.No ?? x.BNK_No ?? '');
          const l = String(x.Name ?? x.BankName ?? '');
          return { label: `${v} - ${l}`, value: v, formLabel: `${v} - ${l}` };
        })),
        catchError(err => {
          console.error('queryAPS1001_DropDownList 失敗', err);
          this.messageService?.errorBubble?.('銀行下拉資料讀取失敗');
          return of([] as any[]);
        })
      )
      .subscribe(opts => {
        this.cardTypeOptions = opts;
        if (opts.length > 0) {
          const first = opts[0].value as string;
          const ctrl = this.queryForm.get('BNK_No') as FormControl<string>;
          ctrl.setValue(first);
          ctrl.updateValueAndValidity({ onlySelf: true });
        }
      });
  }

  override onLazyLoadData(event: LazyLoadEvent, form: FormGroup): void {
    const currSort = JSON.stringify(form.value?.SortBy ?? []);
    const nextSort = JSON.stringify(event.SortBy ?? []);
    const nextPageIndex = currSort !== nextSort ? 1 : (event.pageIndex ?? form.value.pageIndex ?? 1);

    form.patchValue({
      pageIndex: nextPageIndex,
      pageSize : event.pageSize ?? form.value.pageSize,
      SortBy   : event.SortBy ?? form.value.SortBy,
    }, { emitEvent: false });

    this.sortMeta = (event.SortBy ?? []).map(s => ({ ...s }));

    const sig = JSON.stringify({
      pageIndex: form.value.pageIndex,
      pageSize : form.value.pageSize,
      SortBy   : form.value.SortBy,
    });
    if (sig === this.lastQuerySig) return;
    this.lastQuerySig = sig;

    if (this.lazyTimer) clearTimeout(this.lazyTimer);
    this.lazyTimer = setTimeout(() => this.onSubmit(form), 0);
  }

  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      const offset =
        Number.isFinite(val?.pageIndex) && Number.isFinite(val?.pageSize)
          ? Math.max(0, (val.pageIndex - 1) * val.pageSize)
          : undefined;

      const sortByArr = Array.isArray(val?.SortBy) && val.SortBy.length
        ? val.SortBy
        : (this.sortMeta.length ? this.sortMeta : this.defaultSort);

      const toIso = (x: any) => {
        if (!x) return undefined;
        const d = typeof x === 'string' ? new Date(x) : (x as Date);
        if (isNaN(d.getTime())) return undefined;
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 19);
      };

      // ✅ BNK_No 改為字串送出（不包陣列）
      const bnkNoStr: string | undefined =
        typeof val?.BNK_No === 'string' && val.BNK_No !== '' ? val.BNK_No : undefined;

      const payload: any = {
        TXN_DateStart: toIso(val?.TXN_DateStart),
        TXN_DateEnd:   toIso(val?.TXN_DateEnd),
        BNK_No:        bnkNoStr,         // 👈 這裡是 string
        tlt_building:  val?.tlt_building,
        tlt_floor:     val?.tlt_floor,
        org_id:        val?.org_id,
        pageSize:      val?.pageSize,
        pageIndex:     val?.pageIndex,
        SortBy:        sortByArr,
        Offset:        offset ?? 0,
        OrderBy:       "",               // ✅ 固定都傳空字串
      };

      // ⚠️ 不刪除 OrderBy；其它空值移除
      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (k === 'OrderBy') return;
        if (v === '' || v === null || v === undefined) delete payload[k];
        if (Array.isArray(v) && v.length === 0) delete payload[k];
      });

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23130Service.queryTLS23130(payload).subscribe({
        next: (res: any) => {
          const src = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);
          const details = src.flatMap((x: any) =>
            Array.isArray(x?.['tLS23130_Details']) ? x['tLS23130_Details'] : []
          );

          this.data = details;
          this.totalRecords = typeof res?.TotalCount === 'number' ? res.TotalCount : details.length;
        },
        error: () => {
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

  // 格式器
  formatYMD = (val: unknown): string => {
    if (val == null) return '';
    if (val instanceof Date && !isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}/${m}/${d}`;
    }
    const s = String(val);
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
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: this.formatYMD },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'TXN_Time', header: '銷售時間', visible: true, format: this.formatISOToHHMMSS },
    { field: 'TERM_No', header: '分期數', visible: true },
    { field: 'EDC_InstHeadAmt', header: '頭期', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'EDC_InstEachAmt', header: '每期', visible: true, style: 'text-right', format: this.moneyFormat }
  ];
}

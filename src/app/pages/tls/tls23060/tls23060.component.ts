import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, LazyLoadEvent } from '../../../shared/componentkit/table/table.model';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { TLS23060Service } from '../../../service/api/tls/tls23060.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TypeService } from '../../../service/basic/type.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { Table2Component } from '@shared/componentkit/table2/table2.component';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-tls23060',
  templateUrl: './tls23060.component.html',
  styleUrls: ['./tls23060.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    RadiobuttonComponent,
    MultiSelectComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    Table2Component,
  ],
})
export class TLS23060Component extends BasicQueryPageComponent<any> {
  data: any[] = [];
  totalRecords = 0;

  // 表尾總計 / 群組小計（由後端 totals + 前端彙整）
  detailTotals: Record<string, number> = {};
  detailSubtotals: Record<string, Record<string, number>> = {};
  // 欄位對應（表尾）
  detailTotalFieldMap: Record<string, string> = {
    TXN_TotPayAmt: 'totalPayAmt',
    TXN_PayAmt10: 'totalPayAmt10',
    TXN_PayAmt41: 'totalPayAmt41',
    TXN_PayAmt42: 'totalPayAmt42',
    TXN_PayAmt12: 'totalPayAmt12',
    TXN_PayAmt81: 'totalPayAmt81',
    TXN_PayAmt43: 'totalPayAmt43',
    TXN_PayAmt44: 'totalPayAmt44',
    TXN_PayAmt14: 'totalPayAmt14',
    TXN_PayAmt82: 'totalPayAmt82',
    TXN_PayAmt52: 'totalPayAmt52',
    TXN_PayAmt20: 'totalPayAmt20',
    TXN_PayAmt62: 'totalPayAmt62',
    TXN_PayAmt77: 'totalPayAmt77',
    TXN_PayAmt71: 'totalPayAmt71',
    TXN_PayAmt30: 'totalPayAmt30',
    TXN_PayAmt73: 'totalPayAmt73',
    TXN_PayAmt72: 'totalPayAmt72',
    TXN_PayAmt74: 'totalPayAmt74',
    TXN_PayAmt75: 'totalPayAmt75',
    TXN_PayAmt76: 'totalPayAmt76',
    TXN_PayAmt24: 'totalPayAmt24',
    TXN_PayAmt25: 'totalPayAmt25',
    TXN_PayAmt07: 'totalPayAmt07',
    TXN_PayAmt55: 'totalPayAmt55',
    TXN_PayAmt83: 'totalPayAmt83',
    TXN_PayAmt78: 'totalPayAmt78',
    TXN_PayAmt79: 'totalPayAmt79',
    TXN_PayAmt21: 'totalPayAmt21',
    TXN_PayAmt53: 'totalPayAmt53',
    TXN_PayAmt56: 'totalPayAmt56',
    TXN_PayAmt57: 'totalPayAmt57',
    TXN_PayAmt58: 'totalPayAmt58',
    TXN_PayAmt59: 'totalPayAmt59',
    TXN_PayAmt60: 'totalPayAmt60',
    TXN_PayAmt22: 'totalPayAmt22',
    TXN_PayAmt23: 'totalPayAmt23',
    TXN_PrePayAmt: 'totalPrePayAmt',
    TXN_OverAmt: 'totalOverAmt',
    TXN_ReturnAmt: 'totalReturnAmt',
    TXN_CancelAmt: 'totalCancelAmt',
  };
  // 欄位對應（群組小計）
  detailSubtotalFieldMap: Record<string, string> = {
    TXN_TotPayAmt: 'Subtotal_TXN_TotPayAmt',
    TXN_PayAmt10: 'Subtotal_TXN_PayAmt10',
    TXN_PayAmt41: 'Subtotal_TXN_PayAmt41',
    TXN_PayAmt42: 'Subtotal_TXN_PayAmt42',
    TXN_PayAmt12: 'Subtotal_TXN_PayAmt12',
    TXN_PayAmt81: 'Subtotal_TXN_PayAmt81',
    TXN_PayAmt43: 'Subtotal_TXN_PayAmt43',
    TXN_PayAmt44: 'Subtotal_TXN_PayAmt44',
    TXN_PayAmt14: 'Subtotal_TXN_PayAmt14',
    TXN_PayAmt82: 'Subtotal_TXN_PayAmt82',
    TXN_PayAmt52: 'Subtotal_TXN_PayAmt52',
    TXN_PayAmt20: 'Subtotal_TXN_PayAmt20',
    TXN_PayAmt62: 'Subtotal_TXN_PayAmt62',
    TXN_PayAmt77: 'Subtotal_TXN_PayAmt77',
    TXN_PayAmt71: 'Subtotal_TXN_PayAmt71',
    TXN_PayAmt30: 'Subtotal_TXN_PayAmt30',
    TXN_PayAmt73: 'Subtotal_TXN_PayAmt73',
    TXN_PayAmt72: 'Subtotal_TXN_PayAmt72',
    TXN_PayAmt74: 'Subtotal_TXN_PayAmt74',
    TXN_PayAmt75: 'Subtotal_TXN_PayAmt75',
    TXN_PayAmt76: 'Subtotal_TXN_PayAmt76',
    TXN_PayAmt24: 'Subtotal_TXN_PayAmt24',
    TXN_PayAmt25: 'Subtotal_TXN_PayAmt25',
    TXN_PayAmt07: 'Subtotal_TXN_PayAmt07',
    TXN_PayAmt55: 'Subtotal_TXN_PayAmt55',
    TXN_PayAmt83: 'Subtotal_TXN_PayAmt83',
    TXN_PayAmt78: 'Subtotal_TXN_PayAmt78',
    TXN_PayAmt79: 'Subtotal_TXN_PayAmt79',
    TXN_PayAmt21: 'Subtotal_TXN_PayAmt21',
    TXN_PayAmt53: 'Subtotal_TXN_PayAmt53',
    TXN_PayAmt56: 'Subtotal_TXN_PayAmt56',
    TXN_PayAmt57: 'Subtotal_TXN_PayAmt57',
    TXN_PayAmt58: 'Subtotal_TXN_PayAmt58',
    TXN_PayAmt59: 'Subtotal_TXN_PayAmt59',
    TXN_PayAmt60: 'Subtotal_TXN_PayAmt60',
    TXN_PayAmt22: 'Subtotal_TXN_PayAmt22',
    TXN_PayAmt23: 'Subtotal_TXN_PayAmt23',
    TXN_PrePayAmt: 'Subtotal_TXN_PrePayAmt',
    TXN_OverAmt: 'Subtotal_TXN_OverAmt',
    TXN_ReturnAmt: 'Subtotal_TXN_ReturnAmt',
    TXN_CancelAmt: 'Subtotal_TXN_CancelAmt',
  };

  // 排序（不傳 OrderBy；只保留 SortBy 陣列供前端或後端需要時使用）
  sortMeta: any[] = [];
  readonly defaultSort: any[] = [{ field: 'ECR_No', order: 1 }];
  private lastQuerySig: string | null = null;
  private lazyTimer: any = null;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ✅ 陣列型欄位使用預設空陣列
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd:   [this.yesterday, [Validators.required]],
    rece_yn:       [null],
    ECR_No:        [],
    tlt_no:        [],
    tlt_building:  [],
    tlt_floor:     [],
    org_id:        [],
    ...createPaginationConfig([{ field: 'ECR_No', order: 1 }]),
  });

  WhetherOptions: any[] = [];
  typeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private tls23060Service: TLS23060Service,
    private typeService: TypeService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
    private whetherService: WhetherService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23060', 'tls/tls23060', this.queryForm, (form) => this.onSubmit(form));
    this.sortMeta = this.defaultSort.map(s => ({ ...s }));

    this.whetherService.getWhetherOptions().subscribe(data => this.WhetherOptions = data);
    this.typeService.getTypeOptions().subscribe(data => this.typeOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);

    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.tls11010Service.getOrgOptions().subscribe(data => {
      this.OrganizationCodeOptions = (data ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.ECRNoService.getECRNo().subscribe(data => {
      this.ECRNoOptions = (data ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.counterNameService.getCounters().subscribe(data => {
      this.CounterOptions = (data ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

  /** 表格 lazy 事件（同步分頁/排序；避免重複觸發查詢） */
  override onLazyLoadData(event: LazyLoadEvent, form: FormGroup): void {
    const currSort = JSON.stringify(form.value?.SortBy ?? []);
    const nextSort = event.SortBy ?? this.defaultSort;
    const nextPageIndex =
      currSort !== JSON.stringify(nextSort)
        ? 1
        : (event.pageIndex ?? form.value.pageIndex ?? 1);

    form.patchValue(
      {
        pageIndex: nextPageIndex,
        pageSize: event.pageSize ?? form.value.pageSize,
        SortBy: nextSort,
      },
      { emitEvent: false },
    );
    this.sortMeta = (nextSort ?? []).map(s => ({ ...s }));

    const sig = JSON.stringify({
      pageIndex: form.value.pageIndex,
      pageSize: form.value.pageSize,
      SortBy: form.value.SortBy,
    });
    if (sig === this.lastQuerySig) return;
    this.lastQuerySig = sig;

    if (this.lazyTimer) clearTimeout(this.lazyTimer);
    this.lazyTimer = setTimeout(() => this.onSubmit(form), 0);
  }

  // 送出查詢
  onSubmit(form: FormGroup): void {
    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;

      const payload: any = {
        TXN_DateStart: this.toIso(val?.TXN_DateStart, false),
        TXN_DateEnd:   this.toIso(val?.TXN_DateEnd, true),
        rece_yn:       val?.rece_yn ?? undefined,
        ECR_No:        Array.isArray(val?.ECR_No) && val.ECR_No.length ? val.ECR_No : undefined,
        tlt_no:        Array.isArray(val?.tlt_no) && val.tlt_no.length ? val.tlt_no : undefined,
        tlt_building:  val?.tlt_building ?? undefined,
        tlt_floor:     Array.isArray(val?.tlt_floor) && val.tlt_floor.length ? val.tlt_floor : undefined,
        org_id:        Array.isArray(val?.org_id) && val.org_id.length ? val.org_id : undefined,

        // ✅ 只保留分頁/排序；不傳 Offset / OrderBy
        pageSize : val?.pageSize,
        pageIndex: val?.pageIndex,
        SortBy   : Array.isArray(val?.SortBy) ? val.SortBy : this.defaultSort,
      };

      // 清掉空值/空陣列
      Object.keys(payload).forEach(k => {
        const v = payload[k];
        if (v === '' || v === null || v === undefined) delete payload[k];
        if (Array.isArray(v) && v.length === 0) delete payload[k];
      });

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23060Service.queryTLS23060(payload).pipe(
        finalize(() => {
          this.loading = false;
          this.messageService?.unblockUi();
        })
      ).subscribe({
        next: (res: any) => {
          const data = res?.Data;
          const wrapper = Array.isArray(data) ? data[0] : data;

          const details =
            wrapper?.tLS23060Details ??
            wrapper?.TLS23060Details ??
            wrapper?.tls23060Details ??
            [];

          // 明細資料 + rowKey
          this.data = (Array.isArray(details) ? details : []).map((r: any, i: number) => ({
            ...r,
            _rowKey: `${r?.ECR_No ?? ''}|${r?.tlt_no ?? ''}|${i}`,
          }));

          // 總筆數
          this.totalRecords =
            typeof res?.TotalCount === 'number'
              ? res.TotalCount
              : this.data.length;

          // ===== 表尾總計（取 wrapper totals） =====
          this.detailTotals = {
            totalPayAmt:   Number(wrapper?.totalPayAmt ?? 0),
            totalPayAmt10: Number(wrapper?.totalPayAmt10 ?? 0),
            totalPayAmt41: Number(wrapper?.totalPayAmt41 ?? 0),
            totalPayAmt42: Number(wrapper?.totalPayAmt42 ?? 0),
            totalPayAmt12: Number(wrapper?.totalPayAmt12 ?? 0),
            totalPayAmt81: Number(wrapper?.totalPayAmt81 ?? 0),
            totalPayAmt43: Number(wrapper?.totalPayAmt43 ?? 0),
            totalPayAmt44: Number(wrapper?.totalPayAmt44 ?? 0),
            totalPayAmt14: Number(wrapper?.totalPayAmt14 ?? 0),
            totalPayAmt82: Number(wrapper?.totalPayAmt82 ?? 0),
            totalPayAmt52: Number(wrapper?.totalPayAmt52 ?? 0),
            totalPayAmt20: Number(wrapper?.totalPayAmt20 ?? 0),
            totalPayAmt62: Number(wrapper?.totalPayAmt62 ?? 0),
            totalPayAmt77: Number(wrapper?.totalPayAmt77 ?? 0),
            totalPayAmt71: Number(wrapper?.totalPayAmt71 ?? 0),
            totalPayAmt30: Number(wrapper?.totalPayAmt30 ?? 0),
            totalPayAmt73: Number(wrapper?.totalPayAmt73 ?? 0),
            totalPayAmt72: Number(wrapper?.totalPayAmt72 ?? 0),
            totalPayAmt74: Number(wrapper?.totalPayAmt74 ?? 0),
            totalPayAmt75: Number(wrapper?.totalPayAmt75 ?? 0),
            totalPayAmt76: Number(wrapper?.totalPayAmt76 ?? 0),
            totalPayAmt24: Number(wrapper?.totalPayAmt24 ?? 0),
            totalPayAmt25: Number(wrapper?.totalPayAmt25 ?? 0),
            totalPayAmt07: Number(wrapper?.totalPayAmt07 ?? 0),
            totalPayAmt55: Number(wrapper?.totalPayAmt55 ?? 0),
            totalPayAmt83: Number(wrapper?.totalPayAmt83 ?? 0),
            totalPayAmt78: Number(wrapper?.totalPayAmt78 ?? 0),
            totalPayAmt79: Number(wrapper?.totalPayAmt79 ?? 0),
            totalPayAmt21: Number(wrapper?.totalPayAmt21 ?? 0),
            totalPayAmt53: Number(wrapper?.totalPayAmt53 ?? 0),
            totalPayAmt56: Number(wrapper?.totalPayAmt56 ?? 0),
            totalPayAmt57: Number(wrapper?.totalPayAmt57 ?? 0),
            totalPayAmt58: Number(wrapper?.totalPayAmt58 ?? 0),
            totalPayAmt59: Number(wrapper?.totalPayAmt59 ?? 0),
            totalPayAmt60: Number(wrapper?.totalPayAmt60 ?? 0),
            totalPayAmt22: Number(wrapper?.totalPayAmt22 ?? 0),
            totalPayAmt23: Number(wrapper?.totalPayAmt23 ?? 0),
            totalPrePayAmt: Number(wrapper?.totalPrePayAmt ?? 0),
            totalOverAmt:   Number(wrapper?.totalOverAmt ?? 0),
            totalReturnAmt: Number(wrapper?.totalReturnAmt ?? 0),
            totalCancelAmt: Number(wrapper?.totalCancelAmt ?? 0),
          };

          // ===== 群組小計（依 ECR_No 彙整） =====
          const groupMap: Record<string, Record<string, number>> = {};
          const moneyFields = [
            'TXN_TotPayAmt',
            'TXN_PayAmt10','TXN_PayAmt41','TXN_PayAmt42','TXN_PayAmt12','TXN_PayAmt81',
            'TXN_PayAmt43','TXN_PayAmt44','TXN_PayAmt14','TXN_PayAmt82','TXN_PayAmt52',
            'TXN_PayAmt20','TXN_PayAmt62','TXN_PayAmt77','TXN_PayAmt71','TXN_PayAmt30',
            'TXN_PayAmt73','TXN_PayAmt72','TXN_PayAmt74','TXN_PayAmt75','TXN_PayAmt76',
            'TXN_PayAmt24','TXN_PayAmt25','TXN_PayAmt07','TXN_PayAmt55','TXN_PayAmt83',
            'TXN_PayAmt78','TXN_PayAmt79','TXN_PayAmt21','TXN_PayAmt53','TXN_PayAmt56',
            'TXN_PayAmt57','TXN_PayAmt58','TXN_PayAmt59','TXN_PayAmt60','TXN_PayAmt22',
            'TXN_PayAmt23',
            'TXN_PrePayAmt','TXN_OverAmt','TXN_ReturnAmt','TXN_CancelAmt',
          ];

          for (const row of (Array.isArray(details) ? details : [])) {
            const g = String(row?.ECR_No ?? 'UNKNOWN');
            const bucket = (groupMap[g] = groupMap[g] || {} as Record<string, number>);
            for (const f of moneyFields) {
              const k = `Subtotal_${f}`;           // 👈 中括號鍵，避免 TS4111
              const n = Number(row?.[f] ?? 0);
              bucket[k] = (bucket[k] || 0) + n;
            }
          }
          this.detailSubtotals = groupMap;
        },
        error: (err) => {
          console.error('TLS23060 查詢失敗', err);
          this.data = [];
          this.totalRecords = 0;
          this.detailTotals = {};
          this.detailSubtotals = {};
        }
      });
    });
  }

  /** 轉換日期：本地時間 ISO 去時區偏移；endOfDay=true -> 23:59:59.999 */
  private toIso(val: any, endOfDay = false): string | undefined {
    if (!val) return undefined;
    const d = typeof val === 'string' ? new Date(val) : (val as Date);
    if (isNaN(d.getTime())) return undefined;
    if (endOfDay) d.setHours(23, 59, 59, 999);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);
  }

  // 金額格式
  moneyFormat = (value: number): string =>
    value != null ? Number(value || 0).toLocaleString('en-US') : '0';

  // 欄位
  columns = [
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },

    // ✅ 先放總金額
    { field: 'TXN_TotPayAmt', header: '總金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PayAmt10', header: '現金', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt41', header: '聯信連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt42', header: '聯信離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt12', header: '聯信紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt81', header: '中信-停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt43', header: '中信連線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt44', header: '中信離線', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt14', header: '中信紅利', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt82', header: '一卡通-停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt52', header: '一卡通', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt20', header: '禮券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt62', header: '商品提貨單', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt77', header: '感熱紙抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt71', header: '商品抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt74', header: '活動券(自營)', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt75', header: '折價券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt76', header: '現抵', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt24', header: '禮券餘代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt25', header: '提貨單餘代卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt07', header: '會員折抵', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt55', header: 'LINE Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt78', header: 'APP抵用券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt79', header: 'APP提貨單', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt21', header: 'APP禮券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt53', header: '悠遊卡', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt57', header: '台灣Pay', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt58', header: '南紡錢包', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt59', header: '即享券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt60', header: '喜客券', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt22', header: '外來提貨單-高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_PayAmt23', header: '外來禮券-高夢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

    { field: 'TXN_PrePayAmt', header: '預售訂金', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_OverAmt', header: '溢收', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_ReturnAmt', header: '退貨', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
    { field: 'TXN_CancelAmt', header: '作廢', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
  ];
}

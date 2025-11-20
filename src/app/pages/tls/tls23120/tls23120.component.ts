/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnDestroy } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, map, Subject, takeUntil, finalize } from 'rxjs';

import { RegionService } from '../../../service/basic/region-code.service';
import { FloorService } from '../../../service/basic/floor.service';
import { BusinessTypeCodeService } from '../../../service/basic/business-type-code-service.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { TLS23120Service } from '../../../service/api/tls/tls23120.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { BigCategoryCodeService } from '../../../service/basic/big-category-code.service';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { RadioButtonModule } from 'primeng/radiobutton';

type FilterMode = 'location' | 'busType' | 'org' | 'counter';

// 排序（若日後 app-table-report 需要用，可保留型別）
type SortOrder = 1 | -1;
interface SortMeta { field: string; order: SortOrder }

@Component({
  selector: 'app-tls23120',
  templateUrl: './tls23120.component.html',
  styleUrls: ['./tls23120.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RadioButtonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    RadiobuttonComponent,
    InputTextModule,
    ButtonComponent,
    TranslateModule,
    CalendarComponent,
    DropdownComponent,
    // TableReportComponent, // ✅ 使用 app-table-report
  ],
})
export class TLS23120Component
  extends BasicQueryPageComponent<any>
  implements OnDestroy {
  private readonly QUERY_KEY = this.ProgNo || 'TLS23120';

  private destroy$ = new Subject<void>();

  // ---- 排序狀態（如有需要保留）----
  sortMeta: SortMeta[] = [];
  readonly defaultSort: SortMeta[] = [
    { field: 'TLT_NO', order: 1 as const },
  ];

  data: any[] = [];
  totalRecords = 0;

  // 匯出/報表共用
  btnLoading = false;
  historyRequestBody: any | null = null;

  private pendingNavigateAfterQuery = false;

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ---- 表單 ----
  queryForm = this.formBuilder.group({
    TXN_Date: [this.yesterday, [Validators.required]],

    // UI 模式（僅控制啟用/顯示）
    filterMode: ['counter' as FilterMode],

    // 四組查詢條件（僅 counter 模式才驗證 TLT_No 必填）
    TLT_No: [null as string | null],
    bus_type: [],                  // 大分類
    ShowBusType: true,
    tlt_building: [],              // 館別
    area_no: [[] as string[]],     // 區域（多選）
    tlt_floor: [[] as string[]],   // 楼層（多選）
    org_id: [],                    // 組織
  });

  // ---- 下拉選項 ----
  organizationOptions: any[] = [];
  bus_typeOptions: any[] = [];
  businessTypeCodeOptions: any[] = [];
  floorOptions: any[] = [];
  regionOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  OrganizationCodeOptions: any[] = [];
  CounterOptions: any[] = [];
  WhetherOptions = [
    { label: '是', value: true },
    { label: '否', value: false },
  ];

  constructor(
    private tls23120Service: TLS23120Service,
    private businessTypeCodeService: BusinessTypeCodeService,
    private organizationNumberService: OrganizationNumberService,
    private counterNameService: CounterNameService,
    private bigCategoryCodeService: BigCategoryCodeService,
    private floorService: FloorService,
    private regionService: RegionService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.restoreQueryForm();
    this.initializePage('TLS23120', 'tls/tls23120cru', this.queryForm, (form) => this.onSubmit(form));

    // 初始化 sortMeta
    this.sortMeta = this.defaultSort.map(s => ({ ...s }));

    // 選項載入
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => this.organizationOptions = data);
    this.regionService.getRegionOptions().subscribe(data => this.regionOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getBuildingOptions().subscribe(data => this.BUILDING_NO_Options = data);
    this.businessTypeCodeService.getBusinessTypeCodes().subscribe(data => this.businessTypeCodeOptions = data);
    this.bigCategoryCodeService.getSystemTypes().subscribe(data => this.bus_typeOptions = data);
    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = (res ?? []).map(x => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
    this.counterNameService.getCounters().subscribe(res => {
      this.CounterOptions = (res ?? []).map(x => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    // 顯示大分類 → 控制欄位顯示
    this.syncBusTypeColumns(!!this.queryForm.controls.ShowBusType.value);
    this.queryForm.controls.ShowBusType.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(250),
        map(v => JSON.stringify(v)),
        distinctUntilChanged()
      )
      .subscribe(v => this.syncBusTypeColumns(!!v));

    // Radio 切換：僅在 counter 模式套 required；其他模式移除驗證與錯誤
    const modeCtrl = this.queryForm.controls['filterMode'];
    this.applyFilterMode((modeCtrl.value as FilterMode) ?? 'counter');
    modeCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => this.applyFilterMode(((value ?? 'counter') as FilterMode)));
  }

  ngOnDestroy(): void {
    this.saveQueryForm();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== 提交（固定 pageSize=30；PageSize=30）— TXN_Date 改 DateOnly =====
  onSubmit(form: FormGroup): void {
    this.saveQueryForm();

    this.handleSubmit(form, () => {
      const val = this.queryForm.getRawValue() as any;
      const fm = this.queryForm.controls.filterMode.value as FilterMode;

      const payload: any = {
        TXN_Date: this.toDateOnly(val?.TXN_Date),

        TLT_No: (fm === 'counter') ? (val?.TLT_No ?? null) : null,
        tlt_building: (fm === 'location') ? (val?.tlt_building ?? null) : null,
        area_no: (fm === 'location') ? (Array.isArray(val?.area_no) ? val.area_no : null) : null,
        tlt_floor: (fm === 'location') ? (Array.isArray(val?.tlt_floor) ? val.tlt_floor : null) : null,
        bus_type: (fm === 'busType') ? (val?.bus_type ?? null) : null,
        org_id: (fm === 'org') ? (val?.org_id ?? null) : null,

        ShowBusType: val?.ShowBusType ?? null,

        // ✅ 固定分頁大小 30（大小寫都帶）
        pageIndex: 1,
        PageIndex: 1,
        pageSize: 30,
        PageSize: 30,

        SortBy: this.sortMeta,
      };

      // 清除空值
      Object.keys(payload).forEach((k) => {
        const v = payload[k];
        if (v === '' || v === null || v === undefined) delete payload[k];
        if (Array.isArray(v) && v.length === 0) delete payload[k];
      });

      // 提供給 app-table-report 的 lastQueryBody
      this.historyRequestBody = { ...payload };

      this.loading = true;
      this.messageService?.blockUi();

      this.tls23120Service.queryTLS23120(payload).pipe(
        finalize(() => {
          this.loading = false;
          this.messageService?.unblockUi();
        })
      ).subscribe({
        next: (res: any) => {
          const details = this.extractDetails(res);
          this.data = details.map((r: any, i: number) => {
            const row = this.normalizeRow(r);
            return { ...row, _rowKey: `${row?.TLT_NO ?? ''}|${row?.TXN_DATE ?? ''}|${i}` };
          });

          this.totalRecords =
            (typeof res?.TotalCount === 'number' && res.TotalCount >= 0)
              ? res.TotalCount
              : this.data.length;

          if (this.pendingNavigateAfterQuery) {
            this.pendingNavigateAfterQuery = false;
            if (!this.data?.length) {
              this.messageService?.warnBubble?.('查無資料');
              return;
            }
            const formRaw = this.queryForm.getRawValue() as any;
            this.router.navigate(['/account/tls/tls23120cru'], {
              state: {
                data: this.data,
                queryFormValue: formRaw,
                pageSize: 30, // 固定 30
              },
            });
          }
        },
        error: () => {
          this.pendingNavigateAfterQuery = false;
          this.data = [];
          this.totalRecords = 0;
        },
      });
    });
  }

  // ===== 提供給 app-table-report 的查詢函式（固定 pageSize=30；回傳 GrandTotal）— 也轉 DateOnly =====
  public queryTLS23120ForReport = (body: any) =>
    this.tls23120Service.queryTLS23120({
      ...(body || {}),
      TXN_Date: this.toDateOnly(body?.TXN_Date ?? this.queryForm.value?.TXN_Date),
      pageSize: 30,
      PageSize: 30
    }).pipe(
      map((res: any) => {
        const rows = this.extractDetails(res).map((r: any, i: number) => {
          const row = this.normalizeRow(r);
          return { ...row, _rowKey: `${row?.TLT_NO ?? ''}|${row?.TXN_DATE ?? ''}|${i}` };
        });

        const totalCount = (typeof res?.TotalCount === 'number' && res.TotalCount >= 0)
          ? res.TotalCount
          : rows.length;

        const grand = this.computeGrandTotals(rows);

        return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
      })
    );

  // ===== 將回傳格式攤平成明細列（新版 API）=====
  private extractDetails(res: any): any[] {
    const out: any[] = [];
    const dataArr = Array.isArray(res?.Data) ? res.Data : (res?.Data ? [res.Data] : []);

    for (const item of dataArr) {
      const subTotalsArr = Array.isArray(item?.SubTotals) ? item.SubTotals : [];
      for (const sub of subTotalsArr) {
        const list =
          sub?.tLS23120Details ??
          sub?.TLS23120Details ??
          sub?.tls23120Details ??
          [];
        if (!Array.isArray(list)) continue;

        for (const d of list) {
          // 將父層/小計層欄位灌入明細行，讓列表/群組/匯出可使用
          out.push({
            ...d,
            // 由小計層
            TLT_ID: sub?.TLT_ID ?? d?.TLT_ID ?? null,
            // 由父層（每筆 Data 的共同欄位）
            bus_type: item?.bus_type ?? d?.bus_type ?? null,
            bus_type_name: item?.bus_type_name ?? d?.bus_type_name ?? null,
            sad_date: item?.sad_date ?? d?.sad_date ?? null,   // 供 TXN_DATE 正規化
            TLT_NO: item?.TLT_NO ?? d?.TLT_NO ?? null,
            tlt_name: item?.tlt_name ?? d?.tlt_name ?? null,
            floor_desc: item?.floor_desc ?? d?.floor_desc ?? null,
            area_no: item?.area_no ?? d?.area_no ?? null,

            total_count: item?.total_count ?? d?.total_count ?? 0,
            return_qty: item?.return_qty ?? d?.return_qty ?? 0,
            return_amt: item?.return_amt ?? d?.return_amt ?? 0,
          });
        }
      }
    }
    return out;
  }

  // 欄位名稱歸一（讓既有 columns 不用改）
  private normalizeRow(r: any) {
    return {
      ...r,
      FLOOR_NO: r?.FLOOR_NO ?? r?.floor_desc ?? null,
      AREA_NO: r?.AREA_NO ?? r?.area_no ?? null,
      TXN_DATE: r?.TXN_DATE ?? r?.sad_date ?? null, // 新增：把 sad_date 映射成 TXN_DATE
    };
  }

  // 動態顯示/隱藏大分類欄位（僅影響 UI）
  private syncBusTypeColumns(show: boolean): void {
    const target = new Set(['bus_type', 'bus_type_name']);
    this.columns = this.columns.map(col =>
      target.has(col.field) ? { ...col, visible: !!show } : col
    );
  }

  // 依 Radio 模式啟用/停用欄位 + 動態驗證
  private applyFilterMode(mode: FilterMode): void {
    const setGroup = (names: string[], enabled: boolean) => {
      names.forEach(n => {
        const c = this.queryForm.get(n);
        if (!c) return;
        if (enabled) {
          c.enable({ emitEvent: false });
        } else {
          const next = Array.isArray(c.value) ? [] : undefined;
          c.reset(next, { emitEvent: false });
          c.disable({ emitEvent: false });
        }
      });
    };

    const location = ['tlt_building', 'area_no', 'tlt_floor'];
    const busType = ['bus_type'];
    const org = ['org_id'];
    const counter = ['TLT_No'];

    setGroup(location, mode === 'location');
    setGroup(busType, mode === 'busType');
    setGroup(org, mode === 'org');
    setGroup(counter, mode === 'counter');

    // 僅在 counter 模式時讓 TLT_No 有 required 驗證
    const tlt = this.queryForm.get('TLT_No');
    if (tlt) {
      if (mode === 'counter') {
        tlt.addValidators(Validators.required);
      } else {
        tlt.removeValidators(Validators.required);
        tlt.setErrors(null);
      }
      tlt.updateValueAndValidity({ emitEvent: false });
    }

    this.queryForm.updateValueAndValidity({ emitEvent: false });
  }

  // 顯示格式工具
  formatDateTimeYMDHM(val: string | Date): string {
    if (!val) return '';
    const d = typeof val === 'string' ? new Date(val) : val;
    if (isNaN(d.getTime())) return String(val ?? '');
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  }
  moneyFormat = (value: any): string =>
    value != null && value !== ''
      ? Number(value || 0).toLocaleString('en-US')
      : '0';

  onQueryAndOpen(): void {
    if (this.loading) return;
    this.pendingNavigateAfterQuery = true;
    this.onSubmit(this.queryForm);
  }

  /** 對 columns 中 isTotal=true 的欄位進行加總，供 app-table-report 的 GrandTotal 使用 */
  private computeGrandTotals(rows: any[]): Record<string, number> {
    const totalFields = this.columns.filter(c => c.isTotal).map(c => c.field as string);
    const out: Record<string, number> = {};
    for (const f of totalFields) out[f] = 0;
    for (const r of rows) {
      for (const f of totalFields) {
        const v = Number(r?.[f] ?? 0);
        if (Number.isFinite(v)) out[f] += v;
      }
    }
    return out;
  }

  // Query 狀態保存/還原
  private reviveDate(x: any) {
    if (!x) return x;
    const d = new Date(x);
    return isNaN(d.getTime()) ? x : d;
  }
  private restoreQueryForm(): void {
    try {
      const saved = this.queryStateService.getQueryStateValue(this.QUERY_KEY);
      if (saved) {
        if (saved.TXN_Date) saved.TXN_Date = this.reviveDate(saved.TXN_Date);
        this.queryForm.patchValue(saved, { emitEvent: false });
      }
    } catch { /* ignore */ }
  }
  private saveQueryForm(): void {
    try {
      const v = this.queryForm.getRawValue();
      this.queryStateService.setQueryState(this.QUERY_KEY, v);
    } catch { /* ignore */ }
  }

  // ===== 欄位設定（加上 isTotal） =====
  columns = [
    { field: 'TXN_DATE', header: '銷售日期', visible: true, format: this.formatDateTimeYMDHM.bind(this) },
    { field: 'TLT_NO', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true },
    { field: 'bus_type', header: '大分類編號', visible: true },
    { field: 'bus_type_name', header: '大分類名稱', visible: true },
    { field: 'FLOOR_NO', header: '樓層', visible: true },
    { field: 'TLT_ID', header: '抽成類別', visible: true },

    { field: 'total_count', header: '總交易筆數', visible: true, isTotal: true, style: 'text-right' },
    { field: 'return_qty', header: '退貨件數', visible: true, isTotal: true, style: 'text-right' },
    { field: 'return_amt', header: '退貨金額', visible: true, isTotal: true, style: 'text-right', format: this.moneyFormat },

    { field: 'AREA_NO', header: '區域', visible: true },
    { field: 'SYS_Name', header: '區分', visible: true },

    { field: 'sad_sale_qty', header: '銷貨筆數', visible: true, isTotal: true, style: 'text-right' },
    { field: 'sad_sale_namt', header: '淨銷貨', visible: true, isTotal: true, style: 'text-right', format: this.moneyFormat },
    { field: 'sad_sale_tax', header: '營業稅', visible: true, isTotal: true, style: 'text-right', format: this.moneyFormat },
    { field: 'sad_sale_amt', header: '銷貨金額', visible: true, isTotal: true, style: 'text-right', format: this.moneyFormat },

    { field: 'sad_preorder_qty', header: '預售筆數', visible: true, isTotal: true, style: 'text-right' },
    { field: 'sad_preorder_amt', header: '預售金額', visible: true, isTotal: true, style: 'text-right', format: this.moneyFormat },

    { field: 'sad_settle_qty', header: '結帳筆數', visible: true, isTotal: true, style: 'text-right' },
    { field: 'sad_settle_amt', header: '結帳金額', visible: true, isTotal: true, style: 'text-right', format: this.moneyFormat },
  ];

  /** 只回 YYYY-MM-dd（本地時區） */
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}

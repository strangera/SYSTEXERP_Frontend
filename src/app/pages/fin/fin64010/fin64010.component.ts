/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

import { TableComponent } from '../../../others/component/table/table.component';
import { Column, createPaginationConfig } from '../../../others/component/table/table.model';

import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';

import {
  ApiResponse,
  Aps1002DropdownItem,
  Fin64010Service,
  QueryFIN64010Request,
  QueryFIN64010Row,
  SortItem,
} from '../../../service/api/fin/fin64010.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { InputTextRangeComponent } from '@shared/components/input-text-range/input-text-range.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

import { Fin26010Service } from '../../../service/api/fin/fin26010.service';

@UntilDestroy()
@Component({
  selector: 'app-fin64010',
  templateUrl: './fin64010.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AccordionModule,
    ButtonModule,

    MenubarComponent,
    ButtonComponent,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeComponent,
    InputTextRangeComponent,
    MultiSelectComponent,

    TableComponent,
  ],
})
export class FIN64010Component extends BasicQueryPageComponent<any> implements AfterViewInit {
  data: QueryFIN64010Row[] = [];
  totalRecords = 0;
  lastQueryBody: any = null;

  readonly defaultSort: SortItem[] = [{ field: 'CheckNo', order: 1 }];
  private _currentSortBy: SortItem[] = this.defaultSort;

  columns: Column[] = [
    // { field: 'RowNo', header: '序號' },

    { field: 'CheckNo', header: '票據號碼' },

    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠客名稱' },

    { field: 'BNK_No', header: '全省銀行代號' },
    { field: 'BNK_Name', header: '銀行名稱' },

    {
      field: 'CHK_ColleDate',
      header: '託收日期',
      format: (v: any) => this.formatDate(v),
    },

    { field: 'AccNo', header: '科目代號' },
    { field: 'AccName', header: '科目名稱' },

    // { field: 'BNK_AccNo', header: '公司銀行科目代號' },
    // { field: 'BNK_AccName', header: '公司銀行科目名稱' },

    {
      field: 'CHK_ReceDate',
      header: '收票日期',
      format: (v: any) => this.formatDate(v),
    },

    { field: 'Sales_Id', header: '收票業務員代碼' },

    { field: 'RCV_No', header: '收款單號' },

    {
      field: 'CHK_ExpireDate',
      header: '到期日',
      format: (v: any) => this.formatDate(v),
    },

    {
      field: 'CHK_CashDate',
      header: '兌現日',
      format: (v: any) => this.formatDate(v),
    },

    {
      field: 'CHK_Amt',
      header: '票面金額',
      format: (v: any) => this.moneyFormat(v),
    },

    // { field: 'CHK_Type', header: '票據種類' },
    { field: 'CHK_Type_Name', header: '票據種類' },

    // { field: 'Ticket_YN', header: '是否客票' },
    { field: 'Ticket_YN_Name', header: '是否客票' },

    { field: 'CHK_Comment', header: '備註' },

    { field: 'ORG_ID', header: '組織代號' },
    { field: 'Org_Name', header: '組織名稱' },

    // { field: 'Tran_Status', header: '狀態' },
    { field: 'Tran_Status_Name', header: '狀態' },

    // { field: 'CHK_Status', header: '票據狀態' },
    { field: 'CHK_Status_Name', header: '票據狀態' },

    { field: 'VouNo', header: '傳票號碼' },
  ];

  // 下拉 options
  vendorOptions: any[] = [];
  bankNoOptions: any[] = [];       // 銀行代號(多選) value=BNK_No
  companyAccOptions: any[] = [];   // 公司銀行科目(多選)：BNK_DepositAccNo
  salesOptions: any[] = [];        // 業務員(多選)
  orgOptions: any[] = [];
  projectOptions: any[] = [];

  chkTypeOptions = [
    { value: '1', label: '支票' },
    { value: '2', label: '本票' },
    { value: '3', label: '匯票' },
  ];

  ticketYNOptions = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  tranStatusOptions = [
    { value: '0', label: '建立' },
    { value: '1', label: '確認' },
    { value: '2', label: '拋轉' },
  ];

  chkStatusOptions = [
    { value: '0', label: '作廢' },
    { value: '1', label: '未異動' },
    { value: '2', label: '託收' },
    { value: '3', label: '兌現' },
    { value: '4', label: '撤票' },
    { value: '5', label: '退票' },
    { value: 'R', label: '僅記錄' },
  ];

  /** ✅ 查詢表單：欄位命名直接對齊後端 Request */
  queryForm = this.formBuilder.group({
    ChkNo: ['' as string],
    VenNo: ['' as string],

    BankNoList: [[] as string[]],        // 多選(前端陣列) → 送出 join(',')
    CustBankAccNo: ['' as string],

    ColleDateFrom: [null as Date | null],
    ColleDateTo: [null as Date | null],

    CompanyAccNoList: [[] as string[]],  // 多選(前端陣列) → 送出 join(',')
    CompNo: ['' as string],

    ReceDateFrom: [null as Date | null],
    ReceDateTo: [null as Date | null],

    SalesIdList: [[] as string[]],       // 多選(前端陣列) → 送出 join(',')
    RcvNo: ['' as string],

    ExpireDateFrom: [null as Date | null],
    ExpireDateTo: [null as Date | null],

    PreDateFrom: [null as Date | null],
    PreDateTo: [null as Date | null],

    PayDateFrom: [null as Date | null],
    PayDateTo: [null as Date | null],

    AmtFrom: [null as number | string | null],
    AmtTo: [null as number | string | null],

    ChkType: ['' as string],
    TicketYN: ['' as string],

    Comment: ['' as string],
    OrgId: ['' as string],
    ProjectNo: ['' as string],

    ChkTitle: ['' as string],

    TranStatus: ['' as string],
    ChkStatus: ['' as string],

    VouNo: ['' as string],

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private fin64010Service: Fin64010Service,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService,
    private fin26010Service: Fin26010Service,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    // ✅ 路由請依你專案實際路由：這裡統一用 fin/fin64010-cru
    this.initializePage('FIN64010', 'fin/fin64010cru', this.queryForm, (form) => this.onSubmit(form));

    // 1) 銀行代號(多選) - 你目前用 queryAps1001，這裡沿用：value=No, label=No-Name
    this.dropdownApiService.queryAps1001({ SearchKeyword: '' })
      .pipe(untilDestroyed(this))
      .subscribe((response: any) => {
        const list = Array.isArray(response) ? response : (Array.isArray(response?.Data) ? response.Data : []);
        this.bankNoOptions = list.map((x: any) => ({
          value: String(x.No ?? ''),
          label: `${x.No ?? ''} - ${x.Name ?? ''}`,
          raw: x,
        })).filter((x: any) => x.value);
      });
    //收票業務員代碼 下拉選單
    this.fin64010Service.queryARS1001_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res: any) => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.salesOptions = rows
          .map((x: any) => ({
            label: `${x.No} - ${x.Name}`,
            value: x.No,
          }))
          .filter((x: any) => x.value);
      });
    // 2) 組織
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.orgOptions = rows.map((x: any) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No,
        }));
      });

    // 3) 活動
    this.dropDownListService.queryTALPORDERM_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.projectOptions = rows.map((x: any) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No,
        }));
      });

    // 4) 廠客
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.vendorOptions = rows.map((x: any) => ({
          label: `${x.VEN_No} - ${x.Name}`,
          value: x.VEN_No,
        }));
      });

    // 5) 公司銀行科目代號(多選) APS1002.BNK_DepositAccNo，且你之前需求：排除 BNK_AccType='1'
    this.fin64010Service.queryAPS1002_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<Aps1002DropdownItem[]>) => {
          const list = Array.isArray(res?.Data) ? res.Data : [];

          this.companyAccOptions = list
            .filter((x: any) => String(x?.BNK_AccType ?? '') !== '1')
            .map((x: any) => ({
              label: `${x.BNK_DepositAccNo} - ${x.ACCCNAME ?? ''}`,
              value: x.BNK_DepositAccNo,
              raw: x,
            }))
            .filter((x: any) => x.value);
        },
        error: () => {
          this.companyAccOptions = [];
        },
      });



    // 還原查詢條件
    const fromCru = !!(history.state && history.state['fromCru']);

    if (fromCru) {
      const saved = this.queryStateService.getQueryStateValue('FIN64010');
      if (saved?.formValue) {
        this.queryForm.patchValue(saved.formValue, { emitEvent: false });
        this._currentSortBy = saved.currentSortBy ?? this.defaultSort;
        this.lastQueryBody = saved.lastQueryBody ?? null;

        Promise.resolve().then(() => this.onSubmit(this.queryForm)); // 需要就保留
      }
    } else {
      // ✅ 從其他頁回來：回到預設條件（並清掉上次的還原狀態）
      this.queryStateService.clearQueryState('FIN64010');

      // 你要的「預設條件」是什麼，就在這裡定義
      // 目前你的預設就是全空 + 預設排序/分頁
      this.onClear(this.queryForm);

      // 如果你不想 onClear 觸發任何東西，且只想 reset form：
      // this.queryForm.reset({ ...你的預設值..., ...createPaginationConfig(this.defaultSort) }, { emitEvent:false });
    }
  }

  moneyFormat(value: any): string {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    return n.toLocaleString('en-US');
  }

  private formatDate(val: any): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  }

  private toYmd(d: Date | string | null | undefined): string | undefined {
    if (!d) return undefined;
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return undefined;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter((x) => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }
  private parseMoneyToNumber(v: any): number | undefined {
    if (v == null) return undefined;

    // 已經是 number
    if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;

    // 字串：去掉逗號與空白
    const s = String(v).trim().replace(/,/g, '');
    if (!s) return undefined;

    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  }

  private buildQueryPayload(raw: any): QueryFIN64010Request {
    const pageIndex = Number.isFinite(raw?.pageIndex) && raw.pageIndex >= 1 ? raw.pageIndex : 1;
    const pageSize = Number.isFinite(raw?.pageSize) && raw.pageSize > 0 ? raw.pageSize : 30;
    const sort = this.normalizeSort(raw?.SortBy, this.defaultSort);

    const payload: QueryFIN64010Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      ChkNo: (raw?.ChkNo ?? '').trim() || undefined,
      VenNo: (raw?.VenNo ?? '').trim() || undefined,

      BankNoList: Array.isArray(raw?.BankNoList) && raw.BankNoList.length
        ? raw.BankNoList.join(',')
        : undefined,
      CustBankAccNo: (raw?.CustBankAccNo ?? '').trim() || undefined,

      ColleDateFrom: this.toYmd(raw?.ColleDateFrom),
      ColleDateTo: this.toYmd(raw?.ColleDateTo),

      CompanyAccNoList: Array.isArray(raw?.CompanyAccNoList) && raw.CompanyAccNoList.length ? raw.CompanyAccNoList.join(',') : undefined,
      CompNo: (raw?.CompNo ?? '').trim() || undefined,

      ReceDateFrom: this.toYmd(raw?.ReceDateFrom),
      ReceDateTo: this.toYmd(raw?.ReceDateTo),

      SalesIdList: Array.isArray(raw?.SalesIdList) && raw.SalesIdList.length ? raw.SalesIdList.join(',') : undefined,
      RcvNo: (raw?.RcvNo ?? '').trim() || undefined,

      ExpireDateFrom: this.toYmd(raw?.ExpireDateFrom),
      ExpireDateTo: this.toYmd(raw?.ExpireDateTo),

      PreDateFrom: this.toYmd(raw?.PreDateFrom),
      PreDateTo: this.toYmd(raw?.PreDateTo),

      PayDateFrom: this.toYmd(raw?.PayDateFrom),
      PayDateTo: this.toYmd(raw?.PayDateTo),

      AmtFrom: this.parseMoneyToNumber(raw?.AmtFrom),
      AmtTo: this.parseMoneyToNumber(raw?.AmtTo),


      ChkType: (raw?.ChkType ?? '').trim() || undefined,
      TicketYN: (raw?.TicketYN ?? '').trim() || undefined,

      Comment: (raw?.Comment ?? '').trim() || undefined,

      OrgId: (raw?.OrgId ?? '').trim() || undefined,
      ProjectNo: (raw?.ProjectNo ?? '').trim() || undefined,

      ChkTitle: (raw?.ChkTitle ?? '').trim() || undefined,

      TranStatus: (raw?.TranStatus ?? '').trim() || undefined,
      ChkStatus: (raw?.ChkStatus ?? '').trim() || undefined,

      VouNo: (raw?.VouNo ?? '').trim() || undefined,
    };

    // 清掉空值
    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
      if (typeof v === 'number' && !Number.isFinite(v)) delete (payload as any)[k]; // ✅ NaN/Infinity
    });

    return payload;
  }

  private parseQueryResponse(res: any): { rows: QueryFIN64010Row[]; total: number } {
    const rows = Array.isArray(res?.Data) ? (res.Data as QueryFIN64010Row[]) : [];
    const total = Number(res?.TotalCount ?? rows.length) || rows.length;
    return { rows, total };
  }

  public queryFIN64010ForReport = (body: any) =>
    this.fin64010Service.queryFIN64010(this.buildQueryPayload(body || {})).pipe(
      map((res: ApiResponse<any>) => {
        const parsed = this.parseQueryResponse(res);
        return { Data: parsed.rows, TotalCount: parsed.total, GrandTotal: null };
      })
    );

  onSubmit(frm: any) {
    this.submitted = true;

    const raw = this.queryForm.getRawValue();
    const payload = this.buildQueryPayload({ ...raw, pageIndex: 1 });

    this.loading = true;
    this.data = [];
    this.totalRecords = 0;

    this.fin64010Service.queryFIN64010(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          this.data = parsed.rows;
          this.totalRecords = parsed.total;

          this.lastQueryBody = { ...payload };
          this._currentSortBy = payload.SortBy ?? this.defaultSort;

          this.loading = false;
          this.saveQueryState();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('FIN64010 query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private saveQueryState(): void {
    this.queryStateService.setQueryState('FIN64010', {
      formValue: this.queryForm.getRawValue(),
      currentSortBy: this._currentSortBy,
      lastQueryBody: this.lastQueryBody,
    });
  }

  onClear(frm: any) {
    frm.reset({
      ChkNo: '',
      VenNo: '',
      BankNoList: [],
      CustBankAccNo: '',

      ColleDateFrom: null,
      ColleDateTo: null,

      CompanyAccNoList: [],
      CompNo: '',

      ReceDateFrom: null,
      ReceDateTo: null,

      SalesIdList: [],
      RcvNo: '',

      ExpireDateFrom: null,
      ExpireDateTo: null,

      PreDateFrom: null,
      PreDateTo: null,

      PayDateFrom: null,
      PayDateTo: null,

      AmtFrom: null,
      AmtTo: null,

      ChkType: '',
      TicketYN: '',

      Comment: '',
      OrgId: '',
      ProjectNo: '',
      ChkTitle: '',

      TranStatus: '',
      ChkStatus: '',
      VouNo: '',

      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.lastQueryBody = null;
  }

  /** 點明細 */
  override onEdit(row: QueryFIN64010Row) {
    const id = Number((row as any)?.ID ?? (row as any)?.Id ?? (row as any)?.id);
    if (!Number.isFinite(id) || id <= 0) return;

    this.saveQueryState();
    this.router.navigate([`account/${this.cruPage.toLowerCase()}`], {
      queryParams: { Id: id }, // ✅ 統一用 Id
      state: {
        crudstatus: CRUDStatus.Edit,
        rowdata: row, // ✅ 把整列也帶過去，CRU 可用來補欄位
        fromRoute: this.router.url,
      },
    });
  }

  override onDetail(row: QueryFIN64010Row) {
    const id = Number((row as any)?.ID ?? (row as any)?.Id ?? (row as any)?.id);
    if (!Number.isFinite(id) || id <= 0) return;

    this.saveQueryState();
    this.router.navigate([`account/${this.cruPage.toLowerCase()}`], {
      queryParams: { Id: id },
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: row,
        fromRoute: this.router.url,
      },
    });
  }


  override onLazyLoadData(e: any) {
    const raw = this.queryForm.getRawValue();
    const payload = this.buildQueryPayload({
      ...raw,
      pageIndex: e?.pageIndex,
      pageSize: e?.pageSize,
      SortBy: e?.SortBy,
    });

    this.loading = true;
    this.fin64010Service.queryFIN64010(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          this.data = parsed.rows;
          this.totalRecords = parsed.total;
          this.lastQueryBody = { ...payload };
          this._currentSortBy = payload.SortBy ?? this.defaultSort;
          this.loading = false;
          this.saveQueryState();
          this.cdr.detectChanges();
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  @ViewChild('finTable') finTable!: TableComponent;

  ngAfterViewInit(): void {
    setTimeout(() => {
      try { (this.finTable as any).IsPrint = true; } catch { }
      const dt: any = (this.finTable as any).dt;
      if (dt?.onLazyLoad) {
        dt.onLazyLoad.pipe(untilDestroyed(this)).subscribe((e: any) => {
          const pageSize = Number(e?.rows ?? 30);
          const first = Number(e?.first ?? 0);
          const pageIndex = Math.floor(first / pageSize) + 1;
          this.fireQueryByPage(pageIndex, pageSize, e?.multiSortMeta);
        });
      }
    });
  }

  private readonly _allowSortFields = new Set(this.columns.map(c => c.field).filter(Boolean) as string[]);

  private fireQueryByPage(pageIndex: number, pageSize: number, sortMeta?: any) {
    const raw = this.queryForm.getRawValue();

    let sortBy: SortItem[] | undefined;
    if (Array.isArray(sortMeta) && sortMeta.length) {
      const filtered = sortMeta
        .filter((s: any) => this._allowSortFields.has(String(s?.field)))
        .map((s: any) => ({ field: String(s.field), order: Number(s.order) || 1 }));
      if (filtered.length) sortBy = filtered;
    }
    if (!sortBy || !sortBy.length) sortBy = this._currentSortBy?.length ? this._currentSortBy : this.defaultSort;

    const payload = this.buildQueryPayload({ ...raw, pageIndex, pageSize, SortBy: sortBy });
    this._currentSortBy = payload.SortBy ?? this.defaultSort;

    this.loading = true;
    this.fin64010Service.queryFIN64010(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          this.data = parsed.rows;
          this.totalRecords = parsed.total;
          this.lastQueryBody = { ...payload };
          this.loading = false;
          this.saveQueryState();
          this.cdr.detectChanges();
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }
  isEditDisabled = (rowData: any): boolean => {
    // 已拋傳票
    const isPosted = String(rowData?.Tran_Status ?? '') === '2';

    // 已兌現
    const isCash = String(rowData?.CHK_Status ?? '') === '3';

    // 已退票
    const isBounce = String(rowData?.CHK_Status ?? '') === '5';

    return isPosted || isCash || isBounce;
  };
}

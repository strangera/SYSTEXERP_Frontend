/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import {
  ApiResponse,
  Fin64010Service,
  QueryFIN64010Request,
  QueryFIN64010Row,
  SortItem,
} from '../../../service/api/fin/fin64010.service';

import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import {
  Aps1002BankDropDownRow,
  Fin26010Service
} from '../../../service/api/fin/fin26010.service';

@UntilDestroy()
@Component({
  selector: 'app-fin64010',
  templateUrl: './fin64010.component.html',
  styleUrls: ['./fin64010.component.scss'],
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

  readonly defaultSort: SortItem[] = [{ field: 'CHK_No', order: 1 }];
  private _currentSortBy: SortItem[] = this.defaultSort;

  columns: Column[] = [
    { field: 'CHK_No', header: '票據號碼' },
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠商名稱' },

    { field: 'BNK_No', header: '票面銀行代號' },
    { field: 'BNK_Name', header: '票面銀行名稱' },

    { field: 'CHK_ColleDate', header: '託收日', format: (v: any) => this.formatDate(v) },

    { field: 'AccNo', header: '科目代號' },
    { field: 'AccName', header: '科目名稱' },

    { field: 'BNK_AccNo', header: '公司銀行科目代號' },
    { field: 'BNK_AccName', header: '託收銀行名稱' },

    { field: 'CHK_ReceDate', header: '收票日', format: (v: any) => this.formatDate(v) },
    { field: 'Sales_Id', header: '收票業務員' },

    { field: 'RCV_No', header: '收款單號' },

    { field: 'CHK_ExpireDate', header: '到期日', format: (v: any) => this.formatDate(v) },
    { field: 'CHK_CashDate', header: '兌現日', format: (v: any) => this.formatDate(v) },

    { field: 'CHK_Amt', header: '票面金額', format: (v: any) => this.moneyFormat(v) },

    { field: 'CHK_Type_Name', header: '票據種類' },
    { field: 'Ticket_YN_Name', header: '是否客票' },

    { field: 'CHK_Comment', header: '備註' },

    { field: 'ORG_ID', header: '組織代號' },
    { field: 'Org_Name', header: '組織名稱' },

    { field: 'Tran_Status_Name', header: '狀態' },
    { field: 'CHK_Status_Name', header: '票據狀態' },

    { field: 'VouNo', header: '傳票號碼' },
  ];

  // 下拉 options
  vendorOptions: any[] = [];
  bankKeyOptions: any[] = [];      // 票面銀行(多選)：value=BNK_No+BNK_BranchNo
  companyAccOptions: any[] = [];   // 公司銀行科目(多選)：value=BNK_DepositAccNo
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
  ];

  queryForm = this.formBuilder.group({
    chkNo: ['' as string],
    venNo: ['' as string],

    bankKeyList: [[] as string[]],        // 多選
    custBankAccNo: ['' as string],

    colleDateFrom: [null as Date | null],
    colleDateTo: [null as Date | null],

    companyAccNoList: [[] as string[]],   // 多選(APS1002.BNK_DepositAccNo)
    compNo: ['' as string],

    receDateFrom: [null as Date | null],
    receDateTo: [null as Date | null],

    salesIdList: [[] as string[]],        // 多選
    rcvNo: ['' as string],

    expireDateFrom: [null as Date | null],
    expireDateTo: [null as Date | null],

    preDateFrom: [null as Date | null],
    preDateTo: [null as Date | null],

    cashDateFrom: [null as Date | null],
    cashDateTo: [null as Date | null],

    amtFrom: [null as number | null],
    amtTo: [null as number | null],

    chkType: ['' as string],
    ticketYN: ['' as string],

    comment: ['' as string],
    orgId: ['' as string],
    projectNo: ['' as string],

    chkTitle: ['' as string],

    tranStatus: ['' as string],
    chkStatus: ['' as string],

    vouNo: ['' as string],

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
    this.initializePage('FIN64010', 'fin/fin64010cru', this.queryForm, (form) => this.onSubmit(form));

    // 1) 組織
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.orgOptions = (res?.Data ?? []).map((x: any) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No,
        }));
      });

    // 2) 活動
    this.dropDownListService.queryTALPORDERM_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.projectOptions = rows.map((x: any) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No,
        }));
      });

    // 3) 廠客
    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.vendorOptions = rows.map((x: any) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No,
        }));
      });
          this.dropdownApiService.queryAps1001({ "SearchKeyword": "" }).pipe(untilDestroyed(this)).subscribe((response) => {
            const list = Array.isArray(response) ? response : [];
            this.bankKeyOptions = list.map((item: any) => ({
              value: item.No, // 全省銀行 代碼
             
              label: item.No + '-' + item.Name, // 代號+名稱
            }));
            console.log('全省銀行代碼:', this.bankKeyOptions);
          });

    /**
     * 4) 票面銀行代號(多選)：
     *    你規格是：BNK_No+BNK_BranchNo (全省銀行代號) → APS1004(分行) → APS1001(銀行名)
     *    這裡先用 dropdownApiService 取（實際 endpoint 你若不同再替換）
     */
    // TODO: 請依你實際 API 名稱替換


    /**
     * 5) 公司銀行科目(多選)：APS1002.BNK_DepositAccNo
     *    這裡先用 dropdownApiService 取（實際 endpoint 你若不同再替換）
     */

        this.fin26010Service
          .queryAPS1002DropDownList()
          .pipe(untilDestroyed(this))
          .subscribe({
            next: (res: ApiResponse<Aps1002BankDropDownRow[]>) => {
              const list = Array.isArray(res?.Data) ? res.Data : [];
              this.companyAccOptions = list.map((x) => ({
                label: `${x.BNK_DepositAccNo}-${x.BNK_BRANCHNAME}`,
                value: x.BNK_DepositAccNo,
                raw: x,
              }));
            },
            error: (err) => {
              console.error('載入銀行代號下拉失敗', err);
              this.companyAccOptions = [];
            },
          });
    

    /**
     * 6) 收票業務員(多選)：Sales_Id
     *    若你有 ARS1001 下拉，就接這裡
     */
    // TODO: 請依你實際 API 名稱替換
    if ((this.dropDownListService as any)?.queryARS1001_Sales_DropDownList) {
      (this.dropDownListService as any).queryARS1001_Sales_DropDownList()
        .pipe(untilDestroyed(this))
        .subscribe((res: any) => {
          const rows = Array.isArray(res?.Data) ? res.Data : [];
          this.salesOptions = rows.map((x: any) => ({
            value: String(x.No ?? x.Sales_Id ?? ''),
            label: `${x.No ?? x.Sales_Id} - ${x.Name ?? x.User_Name ?? ''}`,
            raw: x,
          })).filter((x: any) => x.value);
        });
    }

    // 還原查詢條件
    const saved = this.queryStateService.getQueryStateValue('FIN64010');
    if (saved?.formValue) {
      this.queryForm.patchValue(saved.formValue, { emitEvent: false });
      this._currentSortBy = saved.currentSortBy ?? this.defaultSort;
      this.lastQueryBody = saved.lastQueryBody ?? null;

      Promise.resolve().then(() => this.onSubmit(this.queryForm));
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

  private buildQueryPayload(base: any): QueryFIN64010Request {
    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1;
    const pageSize =
      Number.isFinite(base?.pageSize) && base?.pageSize > 0 ? base.pageSize : 30;

    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const payload: QueryFIN64010Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      ChkNo: (base?.chkNo ?? '').trim() || undefined,
      VenNo: (base?.venNo ?? '').trim() || undefined,

      BankNoList: Array.isArray(base?.bankKeyList) && base.bankKeyList.length ? base.bankKeyList.join(',') : undefined,
      CustBankAccNo: (base?.custBankAccNo ?? '').trim() || undefined,

      ColleDateFrom: this.toYmd(base?.colleDateFrom),
      ColleDateTo: this.toYmd(base?.colleDateTo),

      CompanyAccNoList: Array.isArray(base?.companyAccNoList) && base.companyAccNoList.length ? base.companyAccNoList.join(',') : undefined,
      CompNo: (base?.compNo ?? '').trim() || undefined,

      ReceDateFrom: this.toYmd(base?.receDateFrom),
      ReceDateTo: this.toYmd(base?.receDateTo),

      SalesIdList: Array.isArray(base?.salesIdList) && base.salesIdList.length ? base.salesIdList.join(',') : undefined,

      RcvNo: (base?.rcvNo ?? '').trim() || undefined,

      ExpireDateFrom: this.toYmd(base?.expireDateFrom),
      ExpireDateTo: this.toYmd(base?.expireDateTo),

      PreDateFrom: this.toYmd(base?.preDateFrom),
      PreDateTo: this.toYmd(base?.preDateTo),

      CashDateFrom: this.toYmd(base?.cashDateFrom),
      CashDateTo: this.toYmd(base?.cashDateTo),

      AmtFrom: base?.amtFrom == null || base?.amtFrom === '' ? undefined : Number(base.amtFrom),
      AmtTo: base?.amtTo == null || base?.amtTo === '' ? undefined : Number(base.amtTo),

      ChkType: (base?.chkType ?? '').trim() || undefined,
      TicketYN: (base?.ticketYN ?? '').trim() || undefined,

      Comment: (base?.comment ?? '').trim() || undefined,

      OrgId: (base?.orgId ?? '').trim() || undefined,
      ProjectNo: (base?.projectNo ?? '').trim() || undefined,

      ChkTitle: (base?.chkTitle ?? '').trim() || undefined,

      TranStatus: (base?.tranStatus ?? '').trim() || undefined,
      ChkStatus: (base?.chkStatus ?? '').trim() || undefined,

      VouNo: (base?.vouNo ?? '').trim() || undefined,
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  private parseQueryResponse(res: any): { rows: QueryFIN64010Row[]; total: number } {
    const data = res?.Data;

    if (Array.isArray(data)) {
      const total = Number(res?.TotalCount ?? res?.totalCount ?? data.length) || data.length;
      return { rows: data, total };
    }

    if (data && typeof data === 'object') {
      const innerArr =
        (Array.isArray(data?.Data) && data.Data) ||
        (Array.isArray(data?.Items) && data.Items) ||
        (Array.isArray(data?.List) && data.List) ||
        null;

      if (innerArr) {
        const total =
          Number(data?.TotalCount ?? res?.TotalCount ?? innerArr.length) || innerArr.length;
        return { rows: innerArr, total };
      }

      const maybeRow: QueryFIN64010Row = { ...(data as any) };
      const total = Number(res?.TotalCount ?? data?.TotalCount ?? 1) || 1;
      return { rows: [maybeRow], total };
    }

    return { rows: [], total: 0 };
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
    const payload = this.buildQueryPayload(raw);
    payload.PageIndex = 1;

    this.loading = true;
    this.data = [];
    this.totalRecords = 0;

    this.fin64010Service
      .queryFIN64010(payload)
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
      chkNo: '',
      venNo: '',
      bankKeyList: [],
      custBankAccNo: '',

      colleDateFrom: null,
      colleDateTo: null,

      companyAccNoList: [],
      compNo: '',

      receDateFrom: null,
      receDateTo: null,

      salesIdList: [],
      rcvNo: '',

      expireDateFrom: null,
      expireDateTo: null,

      preDateFrom: null,
      preDateTo: null,

      cashDateFrom: null,
      cashDateTo: null,

      amtFrom: null,
      amtTo: null,

      chkType: '',
      ticketYN: '',

      comment: '',
      orgId: '',
      projectNo: '',

      chkTitle: '',

      tranStatus: '',
      chkStatus: '',

      vouNo: '',

      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.lastQueryBody = null;
  }

  /** 點明細 */
  override onDetail(row: QueryFIN64010Row) {
    const id = Number(row?.ID);
    if (!Number.isFinite(id)) return;

    this.saveQueryState();
    this.router.navigate([`account/${this.cruPage.toLowerCase()}`], {
      queryParams: { Id: id },
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: row,
        fromRoute: this.router.url,
        queryConditions: { Id: id },
      },
    });
  }

  /** 點編輯 */
  override onEdit(row: QueryFIN64010Row) {
    const id = Number(row?.ID);
    if (!Number.isFinite(id)) return;

    this.saveQueryState();
    this.router.navigate([`account/${this.cruPage.toLowerCase()}`], {
      queryParams: { Id: id },
      state: {
        crudstatus: CRUDStatus.Edit,
        rowdata: row,
        fromRoute: this.router.url,
        queryConditions: { Id: id },
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
    this.fin64010Service
      .queryFIN64010(payload)
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

  @ViewChild('finTable') finTable!: TableComponent;

  ngAfterViewInit(): void {
    setTimeout(() => {
      try {
        (this.finTable as any).IsPrint = true;
      } catch {}

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

  private readonly _allowSortFields = new Set(
    this.columns.map(c => c.field).filter(Boolean) as string[]
  );

  private fireQueryByPage(pageIndex: number, pageSize: number, sortMeta?: any) {
    const raw = this.queryForm.getRawValue();

    let sortBy: SortItem[] | undefined;

    if (Array.isArray(sortMeta) && sortMeta.length) {
      const filtered = sortMeta
        .filter((s: any) => this._allowSortFields.has(String(s?.field)))
        .map((s: any) => ({ field: String(s.field), order: Number(s.order) || 1 }));
      if (filtered.length) sortBy = filtered;
    }

    if (!sortBy || !sortBy.length) {
      sortBy = this._currentSortBy?.length ? this._currentSortBy : this.defaultSort;
    }

    const payload = this.buildQueryPayload({
      ...raw,
      pageIndex,
      pageSize,
      SortBy: sortBy,
    });

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
}

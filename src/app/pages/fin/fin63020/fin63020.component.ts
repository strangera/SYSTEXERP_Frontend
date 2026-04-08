/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';

import { FIN55050Service } from '../../../service/api/fin/fin55050.service';
import { Aps1002BankDropDownRow, Fin26010Service } from '../../../service/api/fin/fin26010.service';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

import {
  ApiResponse,
  Fin63020Service,
  QueryFIN63020Request,
  SortItem,
} from '../../../service/api/fin/fin63020.service';

// ✅ 使用 app-table-report
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

export interface QueryFIN63020Row {
  CanPickupYn?: string;
  CheckNo?: string;
  VendorNo?: string;
  VEN_Name?: string;

  CompanyAccNo?: string;
  CompanyAccName?: string;

  IssueDate?: string | null;
  ExpireDate?: string | null;
  PayDate?: string | null;

  CheckAmount?: number | null;
  CheckTitle?: string;

  NoEndorseYn?: string;
  Remark?: string;

  OrgId?: string;
  Org_Name?: string;

  CheckStatus?: string;    // 代碼或文字
  StatusFlag?: string;     // 代碼或文字

  PickupStatus?: string;   // 代碼或文字
  PickupDate?: string | null;

  VoucherNoIssued?: string | null;
  VoucherNoPaid?: string | null;

  [key: string]: any;
}

@UntilDestroy()
@Component({
  selector: 'app-fin63020',
  templateUrl: './fin63020.component.html',
  styleUrls: ['./fin63020.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    AccordionModule,
    ButtonModule,
    DialogModule,
    InputTextComponent,
    DropdownComponent,
    CalendarRangeComponent,
    CalendarComponent,
    InputNumberRangeComponent,
    ButtonComponent,
    TableReportComponent,
  ],
})
export class FIN63020Component extends BasicQueryPageComponent<any> implements AfterViewInit {
  /* ----------------- 列表狀態 ----------------- */
  data: QueryFIN63020Row[] = [];
  totalRecords = 0;

  // ✅ table-report selection 是 Input+Output，不是 [(...)]
  selectedItems: QueryFIN63020Row[] = [];

  lastQueryBody: any = null;
  btnLoading = false;

  /** ✅ dialog */
  pickupDialogVisible = false;

  /** ✅ dialog form */
  pickupForm = this.formBuilder.group({
    PickName: ['', [Validators.required, Validators.maxLength(20)]],
    PickupDate: [new Date() as Date | null, Validators.required],
  });

  readonly defaultSort: SortItem[] = [{ field: 'CheckNo', order: 1 }];
  private _currentSortBy: SortItem[] = this.defaultSort;

  /** ✅ 勾選條件：PickupStatus === '0' 才能勾選 */
  isRowSelectable = (row: QueryFIN63020Row) => this.isPickup0(row?.PickupStatus);

  /** ✅ 讓查詢頁「編輯按鈕不顯示」（需要 table-report 支援 editHidden） */
  editHidden = (row: QueryFIN63020Row): boolean => {
    const pickupStatus = String(row?.PickupStatus ?? '').trim();
    const checkStatus = String(row?.CheckStatus ?? '').trim();
    const statusFlag = String(row?.StatusFlag ?? '').trim();

    if (!this.isPickup0(pickupStatus)) return true;  // 已領/郵寄
    // if (this.isCashed(checkStatus)) return true;     // 兌現
    if (this.isPosted(statusFlag)) return true;      // 拋轉（你要禁編就保留）
    return false;
  };

  /** ✅ 同步禁用（避免不支援 editHidden 的情況也能擋住） */
  editDisabled = (row: QueryFIN63020Row): boolean => {
    return this.editHidden(row);
  };

  // ====== 顯示轉換 ======
  private yesNoText(v: any): string {
    const s = String(v ?? '').toUpperCase();
    if (s === 'Y') return '是';
    if (s === 'N') return '否';
    return s;
  }

  private statusFlagText(v: any): string {
    const s = String(v ?? '');
    if (s === '1') return '確認';
    if (s === '2') return '拋轉';
    return s;
  }

  private checkStatusText(v: any): string {
    const s = String(v ?? '');
    if (s === '2') return '到期';
    if (s === '3') return '兌現';
    if (s === '0') return '作廢';
    if (s === '1') return '未異動';
    if (s === '4') return '撤票';
    if (s === '5') return '退票';
    return s;
  }

  private pickupStatusText(v: any): string {
    const s = String(v ?? '');
    if (s === '0') return '未領';
    if (s === '1') return '已領';
    if (s === '2') return '郵寄';
    return s;
  }

  moneyFormat(value: any): string {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    return n.toLocaleString('en-US');
  }

  /** ✅ columns：table-report 用 ReportColumn */
  columns: ReportColumn[] = [
    { field: 'CheckNo', header: '票據號碼' },
    { field: 'VendorNo', header: '廠客代號' },
    { field: 'VEN_Name', header: '廠商名稱' },

    { field: 'CompanyAccNo', header: '科目代號' },
    { field: 'CompanyAccName', header: '科目名稱' },

    { field: 'IssueDate', header: '開票日', format: (v: any) => this.formatDate(v) },
    { field: 'ExpireDate', header: '到期日', format: (v: any) => this.formatDate(v) },
    { field: 'PayDate', header: '兌現日', format: (v: any) => this.formatDate(v) },

    { field: 'CheckAmount', header: '票面金額', format: (v: any) => this.moneyFormat(v) },
    { field: 'CheckTitle', header: '票據抬頭' },

    { field: 'NoEndorseYn', header: '票據禁止背書轉讓', format: (v: any) => this.yesNoText(v) },
    { field: 'Remark', header: '備註' },

    { field: 'OrgId', header: '組織代號' },
    { field: 'Org_Name', header: '組織名稱' },

    { field: 'StatusFlag', header: '狀態', format: (v: any) => this.statusFlagText(v) },
    { field: 'CheckStatus', header: '票據狀態', format: (v: any) => this.checkStatusText(v) },

    { field: 'PickupStatus', header: '領取狀態', format: (v: any) => this.pickupStatusText(v) },
    { field: 'PickupDate', header: '領取日期', format: (v: any) => this.formatDate(v) },

    { field: 'VoucherNoIssued', header: '傳票號碼' },
    { field: 'VoucherNoPaid', header: '兌現傳票號碼' },
  ];

  /* ----------------- 下拉 options ----------------- */
  VendorNoOptions: any[] = [];
  BankCodeOptions: any[] = [];

  endorsementProhibitedOptions: any[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  billStatusOptions: any[] = [
    { value: '0', label: '作廢' },
    { value: '1', label: '未異動' },
    { value: '3', label: '兌現' },
    { value: '4', label: '撤票' },
  ];

  statusOptions: any[] = [
    { value: '1', label: '確認' },
    { value: '2', label: '拋轉' },
  ];

  pickupTypeOptions: any[] = [
    { value: '0', label: '未領' },
    { value: '1', label: '已領' },
    { value: '2', label: '郵寄' },
  ];

  organizationCodeOptions: any[] = [];
  eventCodeOptions: any[] = [];
  targetCodeOptions: any[] = [];

  /* ----------------- 查詢表單 ----------------- */
  queryForm = this.formBuilder.group({
    billNumber: ['' as string],
    vendorCode: ['' as string],
    bankAccountCode: ['' as string],

    issueDateStart: [null as Date | null],
    issueDateEnd: [null as Date | null],

    dueDateStart: [null as Date | null],
    dueDateEnd: [null as Date | null],

    cashDateStart: [null as Date | null],
    cashDateEnd: [null as Date | null],

    amountStart: [null as number | null],
    amountEnd: [null as number | null],

    billTitle: ['' as string],
    endorsementProhibited: ['' as string],
    remarks: ['' as string],

    organizationCode: ['' as string],
    eventCode: ['' as string],

    billStatus: ['' as string],
    status: ['' as string],

    pickupType: ['' as string],
    pickupDateStart: [null as Date | null],
    pickupDateEnd: [null as Date | null],

    pamNo: ['' as string],
    apCheckAccNo: ['' as string],
    voucherNumber: ['' as string],

    partyTypeNo: ['' as string],
    reconKey: ['' as string],

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private fin63020Service: Fin63020Service,
    private dropDownListService: DropDownListService,
    private dropdownApiService: DropdownApiService,
    private fin26010Service: Fin26010Service,
    private fin55050Service: FIN55050Service,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  override ngOnInit(): void {
    this.initializePage('FIN63020', 'fin/fin63020cru', this.queryForm, (form) =>
      this.onSubmit(form)
    );

    const fromCru = !!(history.state && history.state['fromCru'] === true);

    if (fromCru) {
      const saved = this.queryStateService.getQueryStateValue('FIN63020');
      if (saved?.formValue) {
        this.queryForm.patchValue(saved.formValue, { emitEvent: false });
        this._currentSortBy = saved.currentSortBy ?? this.defaultSort;
        this.lastQueryBody = saved.lastQueryBody ?? null;
        Promise.resolve().then(() => this.onSubmit(this.queryForm));
      }
    } else {
      this.onClear(this.queryForm);
      this.queryStateService.clearQueryState?.('FIN63020');
      this.lastQueryBody = null;
      this._currentSortBy = this.defaultSort;
    }

    // 組織
    this.dropDownListService
      .querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.organizationCodeOptions = (res?.Data ?? []).map((item: any) => ({
          ...item,
          value: item.No,
          label: `${item.No} - ${item.Name}`,
        }));
      });

    // 活動
    this.dropDownListService
      .queryTALPORDERM_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.eventCodeOptions = rows.map((x: any) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No,
        }));
      });

    // 對象代碼
    this.fin55050Service
      .queryGLS1016_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((response) => {
        this.targetCodeOptions =
          response.Data?.map((item: any) => ({
            label: `${item.No} - ${item.Name}`,
            value: item.No,
          })) ?? [];
      });

    // 公司銀行科目（APS1002）
    this.fin26010Service
      .queryAPS1002DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<Aps1002BankDropDownRow[]>) => {
          const list = Array.isArray(res?.Data) ? res.Data : [];
          this.BankCodeOptions = list
            .slice()
            .sort((a, b) => String(a.BNK_id).localeCompare(String(b.BNK_id)))
            .map((x) => ({
              label: `${x.BNK_id}-${x.BNK_AccName}`,
              value: x.BNK_id,
              raw: x,
            }));
        },
        error: () => {
          this.BankCodeOptions = [];
        },
      });

    // 廠客代號（POS2013）
    this.dropDownListService
      .queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.VendorNoOptions = rows.map((x: any) => ({
          label: `${x.VEN_No} - ${x.Name}`,
          value: x.VEN_No,
        }));
      });
  }

  ngAfterViewInit(): void {
    // app-table-report 自己處理 lazy / scroll / sort，
    // FIN63020 不需要像 app-table 那樣去抓 dt.onLazyLoad
  }

  /** ✅ table-report：同步 selection */
  onSelectionChange(rows: QueryFIN63020Row[]): void {
    this.selectedItems = Array.isArray(rows) ? rows : [];
  }
  onSelectAllChange(_checked: boolean): void {
    // table-report 內部已處理可選條件與 selectedItems
    // 這裡保留 hook，若你要額外處理可加
  }

  /** ✅ 點明細 */
  override onDetail(row: QueryFIN63020Row) {
    const chkNo = String(row?.CheckNo ?? '').trim();
    if (!chkNo) return;

    this.saveQueryState();
    this.router.navigate([`account/${this.cruPage.toLowerCase()}`], {
      queryParams: { ChkNo: chkNo },
      state: {
        crudstatus: CRUDStatus.Read,
        rowdata: row,
        fromRoute: this.router.url,
        queryConditions: { ChkNo: chkNo },
      },
    });
  }

  /** ✅ 點編輯 */
  override onEdit(row: QueryFIN63020Row) {
    if (this.editHidden(row)) return;

    const chkNo = String(row?.CheckNo ?? '').trim();
    if (!chkNo) return;

    this.saveQueryState();
    this.router.navigate([`account/${this.cruPage.toLowerCase()}`], {
      queryParams: { ChkNo: chkNo },
      state: {
        crudstatus: CRUDStatus.Edit,
        rowdata: row,
        fromRoute: this.router.url,
        queryConditions: { ChkNo: chkNo },
      },
    });
  }

  /** ✅ 支票領取：有勾選才開 dialog */
  onPickup(): void {
    const chkNoList = this.getSelectedChkNoList();
    if (!chkNoList.length) {
      this.messageService.errorBubble('請先勾選「領取狀態=未領(0)」的資料');
      return;
    }

    this.pickupForm.reset({ PickName: '', PickupDate: new Date() });
    this.pickupDialogVisible = true;
    this.cdr.detectChanges();
  }

  /** ✅ Dialog 送出 */
  onPickupConfirm(): void {
    this.pickupForm.markAllAsTouched();
    if (this.pickupForm.invalid) return;

    const chkNoList = this.getSelectedChkNoList();
    if (!chkNoList.length) {
      this.messageService.errorBubble('請先勾選「領取狀態=未領(0)」的資料');
      return;
    }

    const pickName = String(this.pickupForm.value.PickName ?? '').trim();
    const pickupDate = this.toYmd(this.pickupForm.value.PickupDate as any);

    this.btnLoading = true;

    this.fin63020Service
      .updateFIN63020Detail({
        PickName: pickName,
        PickupDate: pickupDate,
        ChkNoList: chkNoList,
      } as any)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: any) => {
          if (res?.IsSuccess === false) {
            this.messageService.errorBubble(res?.Message ?? '支票領取失敗');
            return;
          }

          this.messageService.successBubble('支票領取成功');
          this.pickupDialogVisible = false;

          this.data = this.data.map((r) => {
            const no = String(r?.CheckNo ?? '').trim();
            if (chkNoList.includes(no)) {
              return { ...r, PickupStatus: '1', PickupDate: pickupDate };
            }
            return r;
          });

          this.selectedItems = [];
          this.cdr.detectChanges();
        },
        error: () => this.messageService.errorBubble('支票領取失敗'),
        complete: () => {
          this.btnLoading = false;
          this.cdr.detectChanges();
          this.onSubmit(this.queryForm);
        },
      });
  }

  onPickupCancel(): void {
    this.pickupDialogVisible = false;
  }

  private getSelectedChkNoList(): string[] {
    const list = Array.isArray(this.selectedItems) ? this.selectedItems : [];
    return list
      .filter((r) => this.isRowSelectable(r))
      .map((r) => String(r?.CheckNo ?? '').trim())
      .filter(Boolean);
  }

  // ---------- 查詢 ----------
  private formatDate(val: any): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getDate()
    ).padStart(2, '0')}`;
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

  private buildQueryPayload(base: any): QueryFIN63020Request {
    const pageIndex = Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1;
    const pageSize = Number.isFinite(base?.pageSize) && base?.pageSize > 0 ? base.pageSize : 30;
    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const payload: QueryFIN63020Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      ChkNo: (base?.billNumber ?? '').trim() || undefined,
      VenNo: (base?.vendorCode ?? '').trim() || undefined,

      CompanyAccNo: String(base?.bankAccountCode ?? '').trim() || undefined,

      IssueDateFrom: this.toYmd(base?.issueDateStart),
      IssueDateTo: this.toYmd(base?.issueDateEnd),
      ExpireDateFrom: this.toYmd(base?.dueDateStart),
      ExpireDateTo: this.toYmd(base?.dueDateEnd),
      PayDateFrom: this.toYmd(base?.cashDateStart),
      PayDateTo: this.toYmd(base?.cashDateEnd),

      AmtFrom: base?.amountStart == null || base?.amountStart === '' ? undefined : Number(base.amountStart),
      AmtTo: base?.amountEnd == null || base?.amountEnd === '' ? undefined : Number(base.amountEnd),

      ChkTitle: (base?.billTitle ?? '').trim() || undefined,
      VenCtrlYN: (base?.endorsementProhibited ?? '').trim() || undefined,
      Comment: (base?.remarks ?? '').trim() || undefined,

      OrgId: (base?.organizationCode ?? '').trim() || undefined,
      ProjectNo: (base?.eventCode ?? '').trim() || undefined,

      CheckStatus: (base?.billStatus ?? '').trim() || undefined,
      Status: (base?.status ?? '').trim() || undefined,

      PickupType: (base?.pickupType ?? '').trim() || undefined,
      PickupDateFrom: this.toYmd(base?.pickupDateStart),
      PickupDateTo: this.toYmd(base?.pickupDateEnd),

      PamNo: (base?.pamNo ?? '').trim() || undefined,
      ApCheckAccNo: (base?.apCheckAccNo ?? '').trim() || undefined,
      VoucherNo: (base?.voucherNumber ?? '').trim() || undefined,

      PartyTypeNo: (base?.partyTypeNo ?? '').trim() || undefined,
      ReconKey: (base?.reconKey ?? '').trim() || undefined,
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  private parseQueryResponse(res: any): { rows: QueryFIN63020Row[]; total: number } {
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
        const total = Number(data?.TotalCount ?? res?.TotalCount ?? innerArr.length) || innerArr.length;
        return { rows: innerArr, total };
      }

      const maybeRow: QueryFIN63020Row = { ...(data as any) };
      const total = Number(res?.TotalCount ?? data?.TotalCount ?? 1) || 1;
      return { rows: [maybeRow], total };
    }

    return { rows: [], total: 0 };
  }

  /** ✅ 給 app-table-report lazy/scroll 用 */
  public queryFIN63020ForReport = (body: any) =>
    this.fin63020Service.queryFIN63020(this.buildQueryPayload(body || {})).pipe(
      map((res: ApiResponse<any>) => {
        const parsed = this.parseQueryResponse(res);
        return { Data: parsed.rows, TotalCount: parsed.total, GrandTotal: null };
      })
    );

  onSubmit(frm: any) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const raw = this.queryForm.getRawValue();
    const payload = this.buildQueryPayload(raw);
    payload.PageIndex = 1;

    this.loading = true;
    this.data = [];
    this.selectedItems = [];
    this.totalRecords = 0;

    this.fin63020Service
      .queryFIN63020(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          this.data = parsed.rows;
          this.totalRecords = parsed.total;
          this.lastQueryBody = { ...payload, pageIndex: payload.PageIndex, pageSize: payload.PageSize }; // ✅ table-report 常用 pageIndex/pageSize
          this._currentSortBy = payload.SortBy ?? this.defaultSort;
          this.loading = false;
          this.cdr.detectChanges();
          this.saveQueryState();
        },
        error: (err: any) => {
          console.error('FIN63020 query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private saveQueryState(): void {
    this.queryStateService.setQueryState('FIN63020', {
      formValue: this.queryForm.getRawValue(),
      currentSortBy: this._currentSortBy,
      lastQueryBody: this.lastQueryBody,
    });
  }

  onClear(frm: any) {
    frm.reset({
      billNumber: '',
      vendorCode: '',
      bankAccountCode: '',

      issueDateStart: null,
      issueDateEnd: null,
      dueDateStart: null,
      dueDateEnd: null,
      cashDateStart: null,
      cashDateEnd: null,

      amountStart: null,
      amountEnd: null,

      billTitle: '',
      endorsementProhibited: '',
      remarks: '',

      organizationCode: '',
      eventCode: '',

      billStatus: '',
      status: '',

      pickupType: '',
      pickupDateStart: null,
      pickupDateEnd: null,

      pamNo: '',
      apCheckAccNo: '',
      voucherNumber: '',

      partyTypeNo: '',
      reconKey: '',

      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.selectedItems = [];
    this.lastQueryBody = null;
  }

  // ========= 匯出 =========
  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) return `download${defaultExtension}`;

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        const decoded = decodeURIComponent(encodedFilename.replace(/^UTF-8''/, ''));
        return decoded;
      } catch {
        return encodedFilename;
      }
    }

    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch && filenameMatch.length > 1) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }

  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;

    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  onExportPDF() {
    if (!this.lastQueryBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }

    const exportBody = { ...this.lastQueryBody };
    delete exportBody.pageIndex;
    delete exportBody.pageSize;
    delete exportBody.PageIndex;
    delete exportBody.PageSize;
    delete exportBody.Offset;
    delete exportBody.OrderBy;

    this.btnLoading = true;

    this.fin63020Service
      .exportFIN63020PDF(exportBody)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.pdf'),
        error: () => this.messageService.errorBubble('匯出失敗'),
        complete: () => (this.btnLoading = false),
      });
  }

  onExportXLSX() {
    if (!this.lastQueryBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }

    const exportBody = { ...this.lastQueryBody };
    delete exportBody.pageIndex;
    delete exportBody.pageSize;
    delete exportBody.PageIndex;
    delete exportBody.PageSize;
    delete exportBody.Offset;
    delete exportBody.OrderBy;

    this.btnLoading = true;

    this.fin63020Service
      .exportFIN63020Excel(exportBody)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (resp) => this.handleFileExport(resp, '.xlsx'),
        error: () => this.messageService.errorBubble('匯出失敗'),
        complete: () => (this.btnLoading = false),
      });
  }

  // ---------- 狀態判斷（支援代碼 & 文字） ----------
  private isPickup0(v: any): boolean {
    const s = String(v ?? '').trim();
    return s === '0' || s === '未領';
  }
  private isCashed(v: any): boolean {
    const s = String(v ?? '').trim();
    return s === '3' || s === '兌現';
  }
  private isPosted(v: any): boolean {
    const s = String(v ?? '').trim();
    return s === '2' || s === '拋轉';
  }
}

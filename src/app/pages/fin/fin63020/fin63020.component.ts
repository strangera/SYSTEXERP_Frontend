/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';

import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

// ✅ app-table（你貼的 TableComponent）
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column } from '../../../shared/componentkit/table/table.model';

// Base
import {
  Aps1002BankDropDownRow,
  Fin26010Service
} from '../../../service/api/fin/fin26010.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// Service
import { HttpResponse } from '@angular/common/http';
import { ViewChild } from '@angular/core';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import {
  ApiResponse,
  Fin63020Service,
  QueryFIN63020Request,
  SortItem,
} from '../../../service/api/fin/fin63020.service';
export interface QueryFIN63020Row {
  CanPickupYn?: string; // 只是顯示用：可勾選=空白，不可勾選=X
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

  CheckStatus?: string;
  StatusFlag?: string;

  PickupStatus?: string; // 0 未領 / 1 已領 / 2 郵寄
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

    TableComponent,
  ],
})
export class FIN63020Component extends BasicQueryPageComponent<any> {
  /* ----------------- 列表狀態 ----------------- */
  data: QueryFIN63020Row[] = [];
  totalRecords = 0;
  selectedItems: QueryFIN63020Row[] = [];
  lastQueryBody: any = null;

  btnLoading = false;

  /** ✅ dialog */
  pickupDialogVisible = false;

  /** ✅ dialog form */
  pickupForm = this.formBuilder.group({
    PickName: ['', [Validators.required, Validators.maxLength(20)]],
    PickupDate: [new Date() as Date | null, Validators.required], // 預設今天
  });

  readonly defaultSort: SortItem[] = [{ field: 'CheckNo', order: 1 }];

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

  /** ✅ 勾選條件：PickupStatus === '0' 才能勾選 */
  isRowSelectable = (row: QueryFIN63020Row) => String(row?.PickupStatus ?? '') === '0';

  /** ✅ columns：加一欄 CanPickupYn 顯示 X（不可勾選） */
  columns: Column[] = [


    {
      field: 'CheckNo',
      header: '票據號碼',
    },
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

  organizationCodeOptions: any[] = [
    { value: 'ALL', label: '全公司' },
    { value: 'AUDIT', label: '稽核室' },
  ];

  eventCodeOptions: any[] = [
    { value: '001', label: '001' },
    { value: '002', label: '002' },
  ];

  targetCodeOptions: any[] = [
    { value: 'TNN', label: '臺南紡織股份有限公司' },
    { value: 'UNI', label: '統一企業股份有限公司' },
  ];

  /* ----------------- 查詢表單 ----------------- */
  queryForm = this.formBuilder.group({
    billNumber: ['' as string],
    vendorCode: ['' as string],
    bankAccountCode: ['' as string, Validators.required],

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
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN63020', 'fin/fin63020cru', this.queryForm, (form) =>
      this.onSubmit(form)
    );

    // 公司銀行科目代號（Aps1001）

    this.fin26010Service
      .queryAPS1002DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<Aps1002BankDropDownRow[]>) => {
          const list = Array.isArray(res?.Data) ? res.Data : [];
          this.BankCodeOptions = list.map((x) => ({
            label: `${x.BNK_DepositAccNo}-${x.BNK_BRANCHNAME}`,
            value: x.BNK_DepositAccNo,
            raw: x,
          }));
        },
        error: (err) => {
          console.error('載入銀行代號下拉失敗', err);
          this.BankCodeOptions = [];
        },
      });

    // 廠客代號（POS2013_DropDownList）
    this.dropDownListService
      .queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.VendorNoOptions = rows.map((x: any) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No,
        }));
      });

    // ✅ 預載假資料測試（你要的 3 筆）

  }

  /** ✅ 點明細 */
  /** ✅ 點明細（進 CRU） */
  /** ✅ 點明細 */
  override onDetail(row: QueryFIN63020Row) {
    const chkNo = String(row?.CheckNo ?? '').trim();
    if (!chkNo) return;

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
    const chkNo = String(row?.CheckNo ?? '').trim();
    if (!chkNo) return;

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


  /** ✅ 按「支票領取」：有勾選才開 dialog */
  onPickup(): void {
    const chkNoList = this.getSelectedChkNoList();
    if (!chkNoList.length) {
      this.messageService.errorBubble('請先勾選「領取狀態=未領(0)」的資料');
      return;
    }

    // reset dialog form（日期預設今天）
    this.pickupForm.reset({
      PickName: '',
      PickupDate: new Date(),
    });

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

    // ✅ 你 service 若已經有這支：updateFIN63020Detail(body)
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

          // ✅ 前端立即更新(把被領取的改成已領 + 日期)
          this.data = this.data.map((r) => {
            const no = String(r?.CheckNo ?? '').trim();
            if (chkNoList.includes(no)) {
              return { ...r, PickupStatus: '1', PickupDate: pickupDate };
            }
            return r;
          });

          // 清勾選
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

  /** ✅ 只抓「可勾選」(PickupStatus=0) 的 CheckNo */
  private getSelectedChkNoList(): string[] {
    const list = Array.isArray(this.selectedItems) ? this.selectedItems : [];
    return list
      .filter((r) => this.isRowSelectable(r))
      .map((r) => String(r?.CheckNo ?? '').trim())
      .filter(Boolean);
  }

  /* ----------------- 下面查詢邏輯保留你的，略微調整 parse & mock ----------------- */



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
    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1;
    const pageSize =
      Number.isFinite(base?.pageSize) && base?.pageSize > 0 ? base.pageSize : 30;

    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const payload: QueryFIN63020Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      ChkNo: (base?.billNumber ?? '').trim() || undefined,
      VenNo: (base?.vendorCode ?? '').trim() || undefined,

      CompanyAccNo: String(base?.bankAccountCode ?? '').trim(),

      IssueDateFrom: this.toYmd(base?.issueDateStart),
      IssueDateTo: this.toYmd(base?.issueDateEnd),
      ExpireDateFrom: this.toYmd(base?.dueDateStart),
      ExpireDateTo: this.toYmd(base?.dueDateEnd),
      PayDateFrom: this.toYmd(base?.cashDateStart),
      PayDateTo: this.toYmd(base?.cashDateEnd),

      AmtFrom:
        base?.amountStart == null || base?.amountStart === ''
          ? undefined
          : Number(base.amountStart),
      AmtTo:
        base?.amountEnd == null || base?.amountEnd === ''
          ? undefined
          : Number(base.amountEnd),

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
        const total =
          Number(data?.TotalCount ?? res?.TotalCount ?? innerArr.length) || innerArr.length;
        return { rows: innerArr, total };
      }

      const maybeRow: QueryFIN63020Row = { ...(data as any) };
      const total = Number(res?.TotalCount ?? data?.TotalCount ?? 1) || 1;
      return { rows: [maybeRow], total };
    }

    return { rows: [], total: 0 };
  }

  /** ✅ 你的 queryFunction 先保留（但本頁改用 app-table 可不需要） */
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
          this.lastQueryBody = { ...payload };
          this._currentSortBy = payload.SortBy ?? this.defaultSort;
          this.loading = false;
          this.cdr.detectChanges();
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
  // ========= 匯出 =========
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
  override onLazyLoadData(e: any) {
    // e = { pageIndex, pageSize, SortBy }
    const raw = this.queryForm.getRawValue();
    const payload = this.buildQueryPayload({
      ...raw,
      pageIndex: e?.pageIndex,
      pageSize: e?.pageSize,
      SortBy: e?.SortBy,
    });

    this.loading = true;
    this.fin63020Service
      .queryFIN63020(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          this.data = parsed.rows;
          this.totalRecords = parsed.total;
          this.lastQueryBody = { ...payload };
          this.loading = false;
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
      } catch { }

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
  private _currentSortBy: SortItem[] = this.defaultSort;

  private readonly _allowSortFields = new Set(
    this.columns.map(c => c.field).filter(Boolean) as string[]
  );

  private fireQueryByPage(pageIndex: number, pageSize: number, sortMeta?: any) {
    const raw = this.queryForm.getRawValue();

    // 1) 轉 sortMeta -> SortItem，但只接受 columns 裡存在的欄位
    let sortBy: SortItem[] | undefined;

    if (Array.isArray(sortMeta) && sortMeta.length) {
      const filtered = sortMeta
        .filter((s: any) => this._allowSortFields.has(String(s?.field)))
        .map((s: any) => ({ field: String(s.field), order: Number(s.order) || 1 }));

      if (filtered.length) sortBy = filtered;
    }

    // 2) 如果 table 給了奇怪的 ID，就沿用上一個 sort（避免跳掉）
    if (!sortBy || !sortBy.length) {
      sortBy = this._currentSortBy?.length ? this._currentSortBy : this.defaultSort;
    }

    const payload = this.buildQueryPayload({
      ...raw,
      pageIndex,
      pageSize,
      SortBy: sortBy,
    });

    // 3) 記住本次 sort，下一頁沿用
    this._currentSortBy = payload.SortBy ?? this.defaultSort;

    this.loading = true;
    this.fin63020Service.queryFIN63020(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          this.data = parsed.rows;
          this.totalRecords = parsed.total;
          this.lastQueryBody = { ...payload };
          this.loading = false;
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

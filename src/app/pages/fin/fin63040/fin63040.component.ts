/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

// ✅ app-table
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// Base
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';

// 下拉：公司銀行科目代號（你 FIN63020 用的）
import {
  Fin26010Service,
  Aps1002BankDropDownRow,
} from '../../../service/api/fin/fin26010.service';

// API：FIN63040
import {
  ApiResponse,
  Fin63040Service,
  QueryFIN63040Request,
  QueryFIN63040Row,
  SortItem,
} from '../../../service/api/fin/fin63040.service';
import { HttpResponse } from '@angular/common/http';

@UntilDestroy()
@Component({
  selector: 'app-fin63040',
  templateUrl: './fin63040.component.html',
  styleUrls: ['./fin63040.component.scss'],
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

    DropdownComponent,
    CalendarRangeComponent,
    CalendarComponent,
    InputTextComponent,
    ButtonComponent,

    TableComponent,
  ],
})
export class FIN63040Component extends BasicQueryPageComponent<any> {
  override ProgNo = 'FIN63040';

  /* ----------------- 列表狀態 ----------------- */
  data: QueryFIN63040Row[] = [];
  totalRecords = 0;
  selectedItems: QueryFIN63040Row[] = [];
  lastQueryBody: any = null;

  
  btnLoading = false;

  readonly defaultSort: SortItem[] = [{ field: 'CheckNo', order: 1 }];

  /* ----------------- 下拉 options ----------------- */
  BankCodeOptions: any[] = []; // 公司銀行科目代號

  /* ----------------- dialog：支票兌現 ----------------- */
  cashDialogVisible = false;

  cashForm = this.formBuilder.group({
    PayDate: [new Date() as Date | null, Validators.required], // 預設今天
  });

  /* ----------------- 顯示轉換 ----------------- */
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

  /* ----------------- 勾選條件 ----------------- */
  /**
   * ✅ 依你的欄位：CanPickupYn = 可兌現(Y/N)
   * - 可勾：Y
   * - 不可勾：其他（N、空白…）
   */
  isRowSelectable = (row: QueryFIN63040Row) =>
    String(row?.CanPickupYn ?? '').toUpperCase() === 'Y';

  /* ----------------- columns（配合 app-table） ----------------- */
  columns: Column[] = [
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

    { field: 'VoucherNoIssued', header: '傳票號碼(開票)' },
    { field: 'VoucherNoPaid', header: '傳票號碼(兌現)' },
  ];

  /* ----------------- 查詢表單 ----------------- */
  queryForm = this.formBuilder.group({
    CompanyAccNo: ['' as string, Validators.required],
    ChkNo: ['' as string],

    PayDateFrom: [null as Date | null],
    PayDateTo: [null as Date | null],

    ExpireDateFrom: [null as Date | null],
    ExpireDateTo: [null as Date | null],

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private fin63040Service: Fin63040Service,
    private fin26010Service: Fin26010Service,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    // ✅ 讓 base 有 cruPage / router 狀態（照 FIN63020 pattern）
    this.initializePage('FIN63040', 'fin/fin63040cru', this.queryForm, (form) =>
      this.onSubmit(form)
    );

    // 公司銀行科目代號下拉
    this.fin26010Service
      .queryAPS1002DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<Aps1002BankDropDownRow[]>) => {
          const list = Array.isArray(res?.Data) ? res.Data : [];
          this.BankCodeOptions = list.map((x) => ({
            label: `${x.BNK_No}-${x.BNK_BRANCHNAME}`,
            value: x.BNK_DepositAccNo,
            raw: x,
          }));
        },
        error: (err) => {
          console.error('載入銀行代號下拉失敗', err);
          this.BankCodeOptions = [];
        },
      });
  }

  /* ----------------- 查詢 ----------------- */
  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter((x) => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }

  private buildQueryPayload(base: any): QueryFIN63040Request {
    const pageIndex =
      Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1;
    const pageSize =
      Number.isFinite(base?.pageSize) && base?.pageSize > 0 ? base.pageSize : 30;

    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const payload: QueryFIN63040Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      CompanyAccNo: String(base?.CompanyAccNo ?? '').trim(),
      ChkNo: (base?.ChkNo ?? '').trim() || undefined,

      PayDateFrom: this.toYmd(base?.PayDateFrom),
      PayDateTo: this.toYmd(base?.PayDateTo),
      ExpireDateFrom: this.toYmd(base?.ExpireDateFrom),
      ExpireDateTo: this.toYmd(base?.ExpireDateTo),
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  private parseQueryResponse(res: any): { rows: QueryFIN63040Row[]; total: number } {
    const data = res?.Data;

    // 1) 後端回 array
    if (Array.isArray(data)) {
      const total = Number(res?.TotalCount ?? res?.totalCount ?? data.length) || data.length;
      return { rows: data, total };
    }

    // 2) 後端回 object（你 swagger 範例就是 object）
    if (data && typeof data === 'object') {
      // 常見包法：Data.Data / Data.Items / Data.List
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

      // 單筆 object 當一筆 row
      const maybeRow: QueryFIN63040Row = { ...(data as any) };
      const total = Number(res?.TotalCount ?? data?.TotalCount ?? 1) || 1;
      return { rows: [maybeRow], total };
    }

    return { rows: [], total: 0 };
  }

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

    this.fin63040Service
      .queryFIN63040(payload)
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
        error: (err: any) => {
          console.error('FIN63040 query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  onClear(frm: any) {
    frm.reset({
      CompanyAccNo: '',
      ChkNo: '',
      PayDateFrom: null,
      PayDateTo: null,
      ExpireDateFrom: null,
      ExpireDateTo: null,
      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.selectedItems = [];
    this.lastQueryBody = null;
  }

  /* ----------------- 進 CRU ----------------- */
  override onDetail(row: QueryFIN63040Row) {
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

  override onEdit(row: QueryFIN63040Row) {
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

  /* ----------------- ✅ 支票兌現 ----------------- */
  onCash(): void {
    const chkNoList = this.getSelectedChkNoList();
    if (!chkNoList.length) {
      this.messageService.errorBubble('請先勾選「可兌現=Y」的資料');
      return;
    }

    this.cashForm.reset({
      PayDate: new Date(),
    });

    this.cashDialogVisible = true;
    this.cdr.detectChanges();
  }

  onCashConfirm(): void {
    this.cashForm.markAllAsTouched();
    if (this.cashForm.invalid) return;

    const chkNoList = this.getSelectedChkNoList();
    if (!chkNoList.length) {
      this.messageService.errorBubble('請先勾選「可兌現=Y」的資料');
      return;
    }

    const payDate = this.toYmd(this.cashForm.value.PayDate as any);
    if (!payDate) {
      this.messageService.errorBubble('請輸入兌現日');
      return;
    }

    this.btnLoading = true;

    this.fin63040Service
      .updateFIN63040Detail({
        PayDate: payDate,
        ChkNoList: chkNoList,
      } as any)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: any) => {
          if (res?.IsSuccess === false) {
            this.messageService.errorBubble(res?.Message ?? '支票兌現失敗');
            return;
          }

          this.messageService.successBubble('支票兌現成功');
          this.cashDialogVisible = false;

          // ✅ 前端立即更新：把兌現日塞回去（其他狀態若後端會改，建議你再重查一次）
          this.data = this.data.map((r) => {
            const no = String(r?.CheckNo ?? '').trim();
            if (chkNoList.includes(no)) {
              return { ...r, PayDate: payDate, CheckStatus: '3' };
            }
            return r;
          });

          this.selectedItems = [];
          this.cdr.detectChanges();
        },
        error: () => this.messageService.errorBubble('支票兌現失敗'),
        complete: () => {
          this.btnLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  onCashCancel(): void {
    this.cashDialogVisible = false;
  }

  private getSelectedChkNoList(): string[] {
    const list = Array.isArray(this.selectedItems) ? this.selectedItems : [];
    return list
      .filter((r) => this.isRowSelectable(r))
      .map((r) => String(r?.CheckNo ?? '').trim())
      .filter(Boolean);
  }

  /** （保留給報表或 table-report 用） */
  public queryFIN63040ForReport = (body: any) =>
    this.fin63040Service.queryFIN63040(this.buildQueryPayload(body || {})).pipe(
      map((res: ApiResponse<any>) => {
        const parsed = this.parseQueryResponse(res);
        return { Data: parsed.rows, TotalCount: parsed.total, GrandTotal: null };
      })
    );
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

  this.fin63040Service
    .exportFIN63040PDF(exportBody)
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

  this.fin63040Service
    .exportFIN63040Excel(exportBody)
    .pipe(untilDestroyed(this))
    .subscribe({
      next: (resp) => this.handleFileExport(resp, '.xlsx'),
      error: () => this.messageService.errorBubble('匯出失敗'),
      complete: () => (this.btnLoading = false),
    });
}

}

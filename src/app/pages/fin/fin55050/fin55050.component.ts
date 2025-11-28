/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';

import {
  ExportFIN55050Payload,
  FIN55050Detail,
  FIN55050Service
} from '../../../service/api/fin/fin55050.service';

import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableSubheaderComponent } from '@shared/componentkit/table/table-subheader/table-subheader.component';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';

export interface FIN55050Data {
  AccNo: string;
  AccCName: string;
  VouDate: string;
  _Details: FIN55050Detail[];
}
export interface GroupedFIN55050Detail extends FIN55050Detail {
  AccNo: string;
  AccCName: string;
  VouDate: string;
}

@Component({
  selector: 'app-fin55050',
  templateUrl: './fin55050.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TranslateModule,
    CalendarRangeComponent,
    RadiobuttonComponent,
    CheckboxModule,
    MultiSelectComponent,
    TableSubheaderComponent,
    InputTextRangeComponent,
    DropdownRangeComponent,
    DropdownComponent
  ]
})
export class FIN55050Component extends BasicQueryPageComponent<FIN55050Detail> implements OnInit {

  constructor(
    private fin55050Service: FIN55050Service,
    private dropDownListService: DropDownListService,
  ) {
    super();
  }

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  /** 匯出 loading 共用旗標 */
  PDFBtnLoading = false;
  XLSXBtnLoading = false;

  /** 記住上一次查詢的 payload（供匯出使用） */
  private lastQueryBody: any | null = null;

  queryForm = this.formBuilder.group({
    DateFrom: [this.yesterday, Validators.required],
    DateTo: [this.yesterday, Validators.required],
    // DateFrom: [new Date(2024, 9, 1), Validators.required],
    // DateTo: [new Date(2024, 9, 1), Validators.required],
    OrgIdList: [null],
    AccNoFrom: [null],
    AccNoTo: [null],
    VendorFrom: [null],
    VendorTo: [null],
    PTAFrom: [null],
    PTATo: [null],
    Target: [null],
    Project: [null],
    Notes: [null],
    VoucherType: [null],
    VouStatusList: [null],
    IsTarget: [null],
    ReportMode: ['1'],
    ...createPaginationConfig([])
  });

  data: GroupedFIN55050Detail[] = [];
  selectedItems: GroupedFIN55050Detail[] = [];
  totalRecords = 0;

  columns: Column[] = [
    { field: 'VouNo', header: '傳票號碼', visible: true, type: 'detail' },
    { field: 'Ven_Name', header: '廠商代號/簡稱', visible: true },
    { field: 'VouStatus', header: '狀態', visible: true },
    { field: 'ORG_ID', header: '部門', visible: true },
    { field: 'Org_Name', header: '部門名稱', visible: true },
    { field: 'ProjectNo', header: '活動', visible: true },
    { field: 'PTA', header: '立沖代號', visible: true },
    { field: 'NoteDesc', header: '摘要', visible: true },
    { field: 'AccAmt_D', header: '借方金額', visible: true, format: formatAmount },
    { field: 'AccAmt_C', header: '貸方金額', visible: true, format: formatAmount },
    { field: 'OpeningBal', header: '餘額', visible: true, format: formatAmount },
  ];

  //#region 下拉
  OrgIdListOptions: any[] = [];
  AccNoListOptions: any[] = [];
  VendorNoListOptions: any[] = [];
  VouStatusListOptions: any[] = [
    { label: '作廢', value: '0' },
    { label: '建立', value: '1' },
    { label: '確認', value: '2' },
    { label: '過帳', value: '3' },
  ];
  TargetNoListOptions: any[] = [];
  VouTypeListOptions: any[] = [];
  //#endregion

  ngOnInit(): void {
    this.initializePage('FIN55050', 'account/fin/fin55050cru', this.queryForm, (form) => this.onSubmit(form));
    // ✅ 預先把 ProgNo 寫入一次，避免你從其它地方直開 CRU
    try { localStorage.setItem('FIN55050_CRU_PROGNO', 'FIN55050'); } catch { }

    this.loadOptions();

    const saved = this.queryStateService.getQueryStateValue(this.ProgNo);
    if (saved) {
      this.queryForm.patchValue(this.coerceDates(saved), { emitEvent: false });
      this.lastQueryBody = saved;
    }

    this.queryForm.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.queryStateService.setQueryState(this.ProgNo, this.queryForm.getRawValue());
      });
  }

  private coerceDates(raw: any) {
    const fix = (v: any) => {
      if (!v) return v;
      if (v instanceof Date) return v;
      const d = new Date(v);
      return isNaN(d.getTime()) ? v : d;
    };
    return {
      ...raw,
      DateFrom: fix(raw?.DateFrom),
      DateTo: fix(raw?.DateTo),
    };
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.fin55050Service.queryFIN55050(form.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((response) => {
          // 直接展平成清單供列表顯示
          this.data = this.restructureData(response.Data);
          this.totalRecords = response.TotalCount ?? this.data.length;

          // 記住本次查詢（匯出用）
          this.lastQueryBody = form.getRawValue();

          // 保存查詢狀態
          this.queryStateService.setQueryState(this.ProgNo, this.lastQueryBody);
        });
    });
  }

  override onLazyLoadData(event: any, form: FormGroup) {
    form.patchValue({
      pageSize: event?.pageSize,
      pageIndex: event?.pageIndex,
      SortBy: event?.SortBy
    }, { emitEvent: false });

    this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());
  }

  /** 清單 → 明細（CRU）：使用 localStorage 交接資料 */
  override onDetail(row: GroupedFIN55050Detail) {
    const vouNo = row?.VouNo;
    if (!vouNo) {
      this.messageService?.warnBubble?.('無法開啟，缺少傳票號碼。');
      return;
    }

    // 儲存交接資料到 localStorage（含 ProgNo）
    try {
      const handoff = {
        vouNo,
        fromRoute: window.location.pathname,
        ts: Date.now(),
      };
      localStorage.setItem('FIN55050_CRU_HANDOFF', JSON.stringify(handoff));
      localStorage.setItem('FIN55050_CRU_PROGNO', 'FIN55050'); // ✅ 存 ProgNo
      console.log('[FIN55050] 已儲存 handoff:', handoff);
    } catch (err) {
      console.error('[FIN55050] handoff save failed:', err);
      this.messageService?.warnBubble?.('寫入交接資料失敗。');
    }

    // 開新分頁
    window.open('/account/fin/fin55050cru', '_blank', 'noopener');
  }

  loadOptions() {
    this.dropDownListService.querySYS3100_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.OrgIdListOptions = res.Data.map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));

    this.dropDownListService.queryGLS1005_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.AccNoListOptions = res.Data.map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));

    this.dropDownListService.queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => this.VendorNoListOptions = res.Data.map((x: any) => ({ label: `${x.VEN_No} - ${x.Name}`, value: x.VEN_No })));

    this.fin55050Service.queryGLS1016_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.TargetNoListOptions = response.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });

    this.fin55050Service.queryGLS1010_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(response => {
        this.VouTypeListOptions = response.Data?.map((item: any) => ({
          label: `${item.No} - ${item.Name}`,
          value: item.No,
        })) ?? [];
      });
  }

  /** 從巢狀資料展平成清單 */
  restructureData(data: FIN55050Data[]): GroupedFIN55050Detail[] {
    const grouped: GroupedFIN55050Detail[] = [];
    (data ?? []).forEach(parent => {
      (parent._Details ?? []).forEach(detail => {
        grouped.push({
          ...detail,
          AccNo: parent.AccNo,
          AccCName: parent.AccCName,
          VouDate: parent.VouDate
        });
      });
    });
    return grouped;
  }

  // ========= 匯出 =========
  onExportPDF() {
    if ((this.data?.length ?? 0) === 0) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');
    const payload = this.buildExportBody();
    if (!payload) return;

    this.PDFBtnLoading = true;
    this.fin55050Service.exportFIN55050PDF(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.PDFBtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', '分類帳'),
        error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
      });
  }

  onExportXLSX() {
    if ((this.data?.length ?? 0) === 0) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');
    const payload = this.buildExportBody();
    if (!payload) return;

    this.XLSXBtnLoading = true;
    this.fin55050Service.exportFIN55050Excel(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.XLSXBtnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.xlsx', '分類帳'),
        error: () => this.messageService?.warnBubble?.('匯出 Excel 失敗。'),
      });
  }

  /** 產生匯出 payload（不再使用 VOUDATE_*） */
  private buildExportBody(): ExportFIN55050Payload | null {
    const raw = this.lastQueryBody ?? this.queryForm.getRawValue();

    const from = this.toDateOnly(raw?.DateFrom);
    const to = this.toDateOnly(raw?.DateTo);
    if (!from || !to) {
      this.messageService?.warnBubble?.('請先選擇「日期起、日期迄」再匯出。');
      return null;
    }

    const payload: ExportFIN55050Payload = {
      SortBy: this.sanitizeSortBy(raw?.SortBy ?? []),
      DateFrom: from,
      DateTo: to,
      OrgIdList: this.ensureArr(raw?.OrgIdList),
      AccNoFrom: raw?.AccNoFrom ?? '',
      AccNoTo: raw?.AccNoTo ?? '',
      VendorFrom: raw?.VendorFrom ?? '',
      VendorTo: raw?.VendorTo ?? '',
      PTAFrom: raw?.PTAFrom ?? '',
      PTATo: raw?.PTATo ?? '',
      Target: raw?.Target ?? '',
      Project: raw?.Project ?? '',
      Notes: raw?.Notes ?? '',
      VoucherType: raw?.VoucherType ?? '',
      VouStatusList: this.ensureArr(raw?.VouStatusList),
      IsTarget: raw?.IsTarget ?? '',
      ReportMode: raw?.ReportMode ?? '',
    };
    return payload;
  }

  // ========= 本地工具 =========
  private toDateOnly(d: any): string | null {
    if (!d) return null;
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const da = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  }

  private sanitizeSortBy(sort: any[]): { field: string; order: number }[] {
    if (!Array.isArray(sort)) return [];
    return sort
      .filter(s => s && s.field)
      .map(s => ({ field: String(s.field), order: Number(s.order ?? 1) }));
  }

  private ensureArr<T = string>(val: any): T[] {
    if (val == null) return [];
    return Array.isArray(val) ? val : [val];
  }

  private handleFileExport(resp: any, ext: '.pdf' | '.xlsx', baseName: string) {
    const blob = resp?.body instanceof Blob ? resp.body : resp;
    const fileName = `${baseName}_${new Date().getTime()}${ext}`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}

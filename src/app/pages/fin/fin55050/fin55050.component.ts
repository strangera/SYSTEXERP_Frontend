/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import {
  FIN55050Service,
  FIN55050Detail,
  ExportFIN55050Payload
} from '../../../service/api/fin/fin55050.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableSubheaderComponent } from '@shared/componentkit/table/table-subheader/table-subheader.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { Router } from '@angular/router';

// 巢狀資料型別（父含 _Details）
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

// Store
import { FIN55050Store } from './fin55050.store';

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
  ]
})
export class FIN55050Component extends BasicQueryPageComponent<FIN55050Detail> implements OnInit {
  // === 修正 router 注入衝突 ===


  constructor(

    private fin55050Service: FIN55050Service,
    private dropDownListService: DropDownListService,
    private fin55050Store: FIN55050Store
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
  btnLoading = false;

  /** 記住上一次查詢的 payload（供匯出使用） */
  private lastQueryBody: any | null = null;

  queryForm = this.formBuilder.group({
    DateFrom: [this.yesterday, Validators.required],
    DateTo: [this.yesterday, Validators.required],
    OrgIdList: [null],
    AccNoList: [null],
    VendorNoList: [null],
    PTAFrom: [null],
    PTATo: [null],
    TargetNoList: [null],
    Notes: [null],
    VouTypeList: [null],
    VouStatusList: [null],
    IsTarget: ['Y', Validators.required],
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
    // 正確明細路由
    this.initializePage('FIN55050', 'account/fin/fin55050cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      this.fin55050Service.queryFIN55050(form.getRawValue())
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe((response) => {
          // 存完整（含 _Details）到 Store
          this.fin55050Store.setResponse(response.Data);

          // 扁平化給清單
          this.data = this.restructureData(response.Data);
          this.totalRecords = response.TotalCount ?? this.data.length;

          // 記住本次查詢（匯出用）
          this.lastQueryBody = form.getRawValue();

          // 保存查詢狀態（你的共用）
          this.queryStateService.setQueryState(this.ProgNo, this.lastQueryBody);
        });
    });
  }

  /** 清單 → 明細 */
  override onDetail(row: GroupedFIN55050Detail) {
    const vouNo = row?.VouNo;
    if (!vouNo) return;
    this.router.navigate(['account/fin/fin55050cru'], { state: { vouNo } });
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
      .subscribe(res => this.VendorNoListOptions = res.Data.map((x: any) => ({ label: `${x.No} - ${x.Name}`, value: x.No })));
  
  this.fin55050Service.queryGLS1016_DropDownList()
    .pipe(untilDestroyed(this))
    .subscribe(response => {
      this.TargetNoListOptions = response.Data?.map((item: any) => ({
        label: `${item.No} - ${item.Name}`,
        value: item.No,
      })) ?? [];
    });

  // ✅ 傳票型態（VoucherKindOptions）→ 改呼叫 fin55050Service（POST、無 body）
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
     console.log('ExportPDF clicked');
    if ((this.data?.length ?? 0) === 0) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');
    const payload = this.buildExportBody();
    if (!payload) return;

    this.btnLoading = true;
    this.fin55050Service.exportFIN55050PDF(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.pdf', '分類帳'),
        error: () => this.messageService?.warnBubble?.('匯出 PDF 失敗。'),
      });
  }

  onExportXLSX() {
    if ((this.data?.length ?? 0) === 0) return this.messageService?.warnBubble?.('目前沒有資料可匯出。');
    const payload = this.buildExportBody();
    if (!payload) return;

    this.btnLoading = true;
    this.fin55050Service.exportFIN55050Excel(payload)
      .pipe(untilDestroyed(this), finalize(() => (this.btnLoading = false)))
      .subscribe({
        next: (r) => this.handleFileExport(r, '.xlsx', '分類帳'),
        error: () => this.messageService?.warnBubble?.('匯出 Excel 失敗。'),
      });
  }

  /** 產生匯出 payload（不再使用 VOUDATE_*） */
  private buildExportBody(): ExportFIN55050Payload | null {
    const raw = this.lastQueryBody ?? this.queryForm.getRawValue();

    const from = this.toDateOnly(raw?.DateFrom);
    const to   = this.toDateOnly(raw?.DateTo);
    if (!from || !to) {
      this.messageService?.warnBubble?.('請先選擇「日期起、日期迄」再匯出。');
      return null;
    }

    const payload: ExportFIN55050Payload = {
      SortBy: this.sanitizeSortBy(raw?.SortBy ?? []),
      DateFrom: from,
      DateTo: to,
      OrgIdList: this.ensureArr(raw?.OrgIdList),
      AccNoList: this.ensureArr(raw?.AccNoList),
      VendorNoList: this.ensureArr(raw?.VendorNoList),
      PTAFrom: raw?.PTAFrom ?? '',
      PTATo: raw?.PTATo ?? '',
      TargetNoList: this.ensureArr(raw?.TargetNoList),
      Notes: raw?.Notes ?? '',
      VouTypeList: this.ensureArr(raw?.VouTypeList),
      VouStatusList: this.ensureArr(raw?.VouStatusList),
      IsTarget: raw?.IsTarget ?? '',
    };
    return payload;
  }

  // ========= 本地工具（避免依賴基底內部成員） =========
  private toDateOnly(d: any): string | null {
    if (!d) return null;
    const dt = (d instanceof Date) ? d : new Date(d);
    if (isNaN(dt.getTime())) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const da = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
    // 若後端要 yyyymmdd 可改成: return `${y}${m}${da}`;
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

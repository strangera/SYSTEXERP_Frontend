/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ButtonModule } from 'primeng/button';

import { finalize, map } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

// 注意：這裡引用你專案內的 service 介面型別
import { Cpm13020Service, QueryCPM13020Request, SortMeta as ApiSortMeta } from '../../../service/api/cpm/cmp13020.service';
// 以及 PrimeNG SortMeta（app-table-report/prime table 會用到）
import type { SortMeta as PSortMeta } from 'primeng/api';
import { DropDownListService } from '@service/utility/dropDownList.service';

@UntilDestroy()
@Component({
  selector: 'app-cpm13020',
  templateUrl: './cpm13020.component.html',
  styleUrls: ['./cpm13020.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MenubarComponent,
    AccordionModule,
    CalendarRangeQuickComponent,
    InputTextComponent,
    DropdownComponent,
    ButtonComponent,
    RadioButtonModule,
    TranslateModule,
    ButtonModule,
    TableReportComponent,
  ],
})
export class CPM13020Component extends BasicQueryPageComponent<any> implements OnInit {
  /** ALL=全館彙總 / POS=機台彙總 */
  reportMode: 'ALL' | 'POS' = 'ALL';

  // 資料/總筆數
  rows: any[] = [];
  totalRecords = 0;

  // 匯出（目前後端尚未提供匯出 API，先保留 UI 開關）
  btnLoading = false;
  historyRequestBody: QueryCPM13020Request | null = null;
paymentTypeOptions: Array<{ label: string; value: string; Name: string; No: string; PAY_Type: string }> = [];
  // 單選付款別（依後端 LIKE @PAY_No 的設計）
  payOptions = [
    { value: '', label: '（全部）' },
    { value: '07', label: '會員折抵' },
    { value: '10', label: '現金' },
    { value: '20', label: '禮券' },
    { value: '30', label: '貴賓提貨單' },
    { value: '41', label: '聯信連線' },
    { value: '43', label: '中信連線' },
    { value: '52', label: '一卡通' },
    { value: '55', label: 'LINEPay' },
    { value: '62', label: '商品提貨單' },
    { value: '71', label: '商品抵用券' },
    { value: '72', label: '外來提貨單(抵用券)' },
    { value: '73', label: '外來禮券(抵用券)' },
    { value: '76', label: '現抵' },
    { value: '78', label: 'APP抵用券' },
    { value: '81', label: '中信-停車場' },
    { value: '82', label: '一卡通-停車場' },
    { value: '83', label: 'LINEPay-停車場' },
  ];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // 與 QueryBase 對齊：交給後端分頁/排序
  queryForm = this.formBuilder.group({
    TXN_BDate: [this.yesterday, [Validators.required]],
    TXN_EDate: [this.yesterday, [Validators.required]],
    PAY_No: [''],                // 單選，空字串=全部
    parkingCode: ['', [Validators.maxLength(20)]], // 目前不送到後端（保留 UI）
    ...createPaginationConfig([{ field: 'PAY_No', order: 1 }]), // 這裡的 order 為 number（PrimeNG 型別）
    pageSize: [30],
  });

  // 欄位（與後端 Response 對應）
  columnsAll = [
    { field: 'TLT_No', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    // { field: 'PAY_No', header: '付款編號', visible: true },
    { field: 'PAY_Name', header: '支付別', visible: true, style: 'text-left' },
    { field: 'TXN_PayAmt', header: '停車收入', visible: true, style: 'text-right', format: (v: number) => this.money(v), isTotal: true },
 
    { field: 'TXN_PayAmt_Rate', header: '收入佔比(%)', visible: true, style: 'text-right', format: (v: number) => this.percent(v) },
       { field: 'TXN_CustCnt', header: '交易筆數', visible: true, style: 'text-right', isTotal: true },
  ];

  columnsPos = [
    { field: 'building_desc', header: '館別', visible: true },
    { field: 'floor_desc', header: '樓層', visible: true },
    { field: 'ECR_No', header: '繳費機編號', visible: true },
    // { field: 'PAY_No', header: '付款編號', visible: true },
    { field: 'PAY_Name', header: '支付別', visible: true, style: 'text-left' },
    { field: 'TXN_PayAmt', header: '停車收入', visible: true, style: 'text-right', format: (v: number) => this.money(v), isTotal: true },
   
    { field: 'TXN_PayAmt_Rate', header: '收入佔比(%)', visible: true, style: 'text-right', format: (v: number) => this.percent(v) },
     { field: 'TXN_CustCnt', header: '交易筆數', visible: true, style: 'text-right', isTotal: true },
  ];

  constructor(
    private cpm13020Service: Cpm13020Service,
     private dropDownListService: DropDownListService,
  ) {
    super();
  }

  ngOnInit(): void {
    // funInfo / blockUi 等來自基底的 inject()
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    this.initializePage('CPM13020', 'cpm/cpm13020', this.queryForm, (form) => this.onSubmit(form));
        this.dropDownListService.queryPOS1006_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        const rows = Array.isArray(res?.Data) ? res.Data : [];
        this.paymentTypeOptions = rows.map((x: any) => ({
          label: `${x.No ?? ''}-${x.Name ?? ''}`,
          value: x.No ?? '',
          Name: x.Name ?? '',
          No: x.No ?? '',
          PAY_Type: x.PAY_Type ?? '',
        }));
      });
  }

  // === PrimeNG SortMeta -> API SortMeta（order: 1 | -1）===
  private normalizeSortMeta(meta: unknown): ApiSortMeta[] {
    const arr = Array.isArray(meta) ? (meta as PSortMeta[]) : [];
    return arr
      .filter(s => !!s && !!s.field)
      .map<ApiSortMeta>(s => ({
        field: String(s.field),
        order: (s.order as number) === -1 ? -1 : 1, // 預設 1
      }));
  }

  // 送出：交由後端分頁/排序
  onSubmit = (frm: FormGroup) => {
    this.handleSubmit(frm, () => {
      const val = this.queryForm.getRawValue();

      // 先把 PAY_No 算好，避免 ?? 與 || 優先序錯誤
      const payNoRaw = val?.PAY_No;
      const payNo: string | undefined = (payNoRaw && String(payNoRaw).length > 0) ? String(payNoRaw) : undefined;

      const payload: QueryCPM13020Request = {
        TXN_BDate: this.toDateOnly(val?.TXN_BDate),
        TXN_EDate: this.toDateOnly(val?.TXN_EDate),
        PAY_No: payNo, // 空就不送
        pageIndex: Number(val?.pageIndex ?? 1),
        pageSize: Number(val?.pageSize ?? 30),
        SortBy: this.normalizeSortMeta(val?.SortBy),
      };

      this.historyRequestBody = { ...payload };
      this.loading = true;

      const call$ = this.reportMode === 'ALL'
        ? this.cpm13020Service.queryAll(payload)
        : this.cpm13020Service.queryPos(payload);

      call$
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe({
          next: (resp) => {
            const list = Array.isArray(resp?.Data) ? resp.Data : [];
            this.rows = list;
            this.totalRecords = Number(resp?.TotalCount ?? list.length ?? 0);
          },
          error: () => {
            this.rows = [];
            this.totalRecords = 0;
          },
        });
    });
  };

  // <app-table-report> 查詢（直接打後端分頁）
  public queryAllForReport = (body: any) => {
    const rawPay = (body?.PAY_No ?? this.queryForm.value?.PAY_No);
    const payNo: string | undefined =
      (rawPay && String(rawPay).length > 0) ? String(rawPay) : undefined;

    return this.cpm13020Service.queryAll({
      TXN_BDate: this.toDateOnly(body?.TXN_BDate ?? this.queryForm.value?.TXN_BDate),
      TXN_EDate: this.toDateOnly(body?.TXN_EDate ?? this.queryForm.value?.TXN_EDate),
      PAY_No: payNo,
      pageIndex: Number(body?.pageIndex ?? this.queryForm.value?.pageIndex ?? 1),
      pageSize: Number(body?.pageSize ?? this.queryForm.value?.pageSize ?? 30),
      SortBy: this.normalizeSortMeta(body?.SortBy ?? this.queryForm.value?.SortBy),
    }).pipe(map((res: any) => ({
      Data: Array.isArray(res?.Data) ? res.Data : [],
      TotalCount: Number(res?.TotalCount ?? 0),
      GrandTotal: null,
    })));
  };

  public queryPosForReport = (body: any) => {
    const rawPay = (body?.PAY_No ?? this.queryForm.value?.PAY_No);
    const payNo: string | undefined =
      (rawPay && String(rawPay).length > 0) ? String(rawPay) : undefined;

    return this.cpm13020Service.queryPos({
      TXN_BDate: this.toDateOnly(body?.TXN_BDate ?? this.queryForm.value?.TXN_BDate),
      TXN_EDate: this.toDateOnly(body?.TXN_EDate ?? this.queryForm.value?.TXN_EDate),
      PAY_No: payNo,
      pageIndex: Number(body?.pageIndex ?? this.queryForm.value?.pageIndex ?? 1),
      pageSize: Number(body?.pageSize ?? this.queryForm.value?.pageSize ?? 30),
      SortBy: this.normalizeSortMeta(body?.SortBy ?? this.queryForm.value?.SortBy),
    }).pipe(map((res: any) => ({
      Data: Array.isArray(res?.Data) ? res.Data : [],
      TotalCount: Number(res?.TotalCount ?? 0),
      GrandTotal: null,
    })));
  };

  // 匯出（若之後後端提供路由，再打開）
  onExportPDF() { this.messageService?.warnBubble?.('尚未提供匯出 API。'); }
  onExportXLSX() { this.messageService?.warnBubble?.('尚未提供匯出 API。'); }

  // 工具
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  money(v: number): string { return Number(v ?? 0).toLocaleString('en-US'); }
  percent(v: number): string { const n = Number(v ?? 0); return isFinite(n) ? n.toFixed(2) : '0.00'; }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { map, finalize } from 'rxjs/operators';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { TLS23040Service } from '../../../service/api/tls/tls23040.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';

@Component({
  selector: 'app-tls23040',
  templateUrl: './tls23040.component.html',
  styleUrls: ['./tls23040.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeQuickComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    // DropdownComponent,
    InputTextComponent,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    TranslateModule,
    ButtonModule,
    TableReportComponent,
  ],
})
export class TLS23040Component extends BasicQueryPageComponent<any> {
  // === 視圖切換 ===
  viewMode: 'invoice' | 'payment' | 'discount' = 'invoice';

  // === 三組資料 ===
  invoiceRows: any[] = [];
  paymentRows: any[] = [];
  discountRows: any[] = [];

  // 總計（各視圖）
  private invoiceTotals: { TotalGUI: number; TotalSaleAmt: number } | null = null;
  private paymentTotals: { TotalPayAmt: number } | null = null;
  private discountTotals: { TotalSalePrc: number; TotalNet: number; TotalTax: number } | null = null;

  // 畫面繫結
  get activeRows() {
    return this.viewMode === 'payment' ? this.paymentRows :
           this.viewMode === 'discount' ? this.discountRows :
           this.invoiceRows;
  }
  get activeColumns() {
    return this.viewMode === 'payment' ? this.paymentColumns :
           this.viewMode === 'discount' ? this.discountColumns :
           this.invoiceColumns;
  }

  activeFooter: Record<string, number> | undefined = undefined;
  totalRecords = 0;

  // 匯出控制
  btnLoading = false;
  historyRequestBody: any | null = null;

  // 控制項
  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd: [this.yesterday, [Validators.required]],
    ECR_No: [],
    TXN_No_Start: [null],
    TXN_No_End: [null],
    TLT_No: [],
    TXN_Status: [],
    TXN_FlagStatus: [],
    TXN_PkngUID: [''],
    TXN_MemCard: [''],
    TXN_GUIBegNo: [''],
    tlt_building: [''],
    tlt_floor: [],
    org_id: [],
    ...createPaginationConfig([
      { field: 'tlt_no', order: 1 }, 
      { field: 'TXN_Date', order: 1 },
      { field: 'ECR_No', order: 1 },
      { field: 'TXN_No', order: 1 },
    ]),
  });

  // 下拉
  statusFlagOptions: any[] = [];
  txnStatusOptions: any[] = [
    { value: '1', label: '正常交易' },
    { value: '2', label: '作廢' },
    { value: '3', label: '退貨' },
  ];
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private tls23040Service: TLS23040Service,
    private statusFlagService: StatusFlagService,
    private floorService: FloorService,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23040', 'tls/tls23040cru', this.queryForm, (form) => this.onSubmit(form));
 this.queryForm.patchValue({ pageSize: 30 }, { emitEvent: false }); // ← 加這行
    this.statusFlagService.getStatusFlags().subscribe((d) => (this.statusFlagOptions = d));
    this.floorService.getFloors().subscribe((d) => (this.floorOptions = d));
    this.tls11010Service.getBuildingOptions().subscribe((d) => (this.BUILDING_NO_Options = d));

    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = (res ?? []).map((x: any) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });
  }

  // 共用工具
  private toIso(x: any) {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  }
  private ensureArr(v: any) { return Array.isArray(v) ? v : v == null || v === '' ? [] : [v]; }
  private toNumOrUndef(v: any) { return v == null || v === '' || isNaN(Number(v)) ? undefined : Number(v); }
  private formatDate(val: string): string {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const yyyy = d.getFullYear(), mm = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  }
  private formatNumber(val: number): string { return Number(val ?? 0).toLocaleString('en-US'); }
  private getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  // === 查詢（送出）===
  onSubmit(form: FormGroup): void {
    const raw = this.queryForm.getRawValue() as any;
    const payload: any = {
      TXN_DateStart: this.toIso(raw?.TXN_DateStart ?? this.yesterday),
      TXN_DateEnd:   this.toIso(raw?.TXN_DateEnd   ?? this.yesterday),

      ...(this.ensureArr(raw?.ECR_No).length         ? { ECR_No: this.ensureArr(raw?.ECR_No) }             : {}),
      ...(this.ensureArr(raw?.TLT_No).length         ? { TLT_No: this.ensureArr(raw?.TLT_No) }             : {}),
      ...(this.ensureArr(raw?.TXN_Status).length     ? { TXN_Status: this.ensureArr(raw?.TXN_Status) }     : {}),
      ...(this.ensureArr(raw?.TXN_FlagStatus).length ? { TXN_FlagStatus: this.ensureArr(raw?.TXN_FlagStatus) } : {}),
      ...(this.ensureArr(raw?.tlt_floor).length      ? { tlt_floor: this.ensureArr(raw?.tlt_floor) }       : {}),
      ...(this.ensureArr(raw?.org_id).length         ? { org_id: this.ensureArr(raw?.org_id) }             : {}),

      ...(raw?.tlt_building ? { tlt_building: raw.tlt_building } : {}),
      ...(raw?.TXN_PkngUID  ? { TXN_PkngUID:  raw.TXN_PkngUID  } : {}),
      ...(raw?.TXN_MemCard  ? { TXN_MemCard:  raw.TXN_MemCard  } : {}),
      ...(raw?.TXN_GUIBegNo ? { TXN_GUIBegNo: raw.TXN_GUIBegNo } : {}),

      ...(this.toNumOrUndef(raw?.TXN_No_Start) != null ? { TXN_No_Start: this.toNumOrUndef(raw?.TXN_No_Start) } : {}),
      ...(this.toNumOrUndef(raw?.TXN_No_End)   != null ? { TXN_No_End:   this.toNumOrUndef(raw?.TXN_No_End)   } : {}),

      pageIndex: Number(raw?.pageIndex) || 1,
      pageSize:  Number(raw?.pageSize)  || 30,
      SortBy:    Array.isArray(raw?.SortBy) && raw.SortBy.length ? raw.SortBy : [
        { field: 'tlt_no', order: 1 },
        { field: 'TXN_Date', order: 1 },
        { field: 'ECR_No', order: 1 },
        { field: 'TXN_No', order: 1 },
      ],
    };

    this.historyRequestBody = { ...payload };
    this.loading = true;
    this.messageService?.blockUi();

    // 先取一頁，填入三組 rows 與總計，讓畫面立即顯示
    this.tls23040Service.queryTLS23040(payload).subscribe({
      next: (res: any) => {
        const packs: any[] = Array.isArray(res?.Data) ? res.Data : [];

        // 發票
        const inv = packs.flatMap(p => Array.isArray(p?.invoice?.InvoiceDetail) ? p.invoice.InvoiceDetail : [])
          .map((r: any, i: number) => {
            const isNormal = String(r?.TXN_StatusName ?? '') === '正常交易';
            return {
              ...r,
              ORG_TXN_Date: isNormal ? '' : (r?.ORG_TXN_Date ?? ''),
              ORG_ECR_No:   isNormal ? '' : (r?.ORG_ECR_No   ?? ''),
              ORG_TXN_No:   isNormal ? '' : (r?.ORG_TXN_No   ?? ''),
              _rowKey: `inv|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
            };
          });
        this.invoiceRows = inv;
        this.invoiceTotals = {
          TotalGUI:     packs.reduce((s, p) => s + Number(p?.invoice?.TotalGUI     ?? 0), 0),
          TotalSaleAmt: packs.reduce((s, p) => s + Number(p?.invoice?.TotalSaleAmt ?? 0), 0),
        };

        // 付款
        const pay = packs.flatMap(p => Array.isArray(p?.payment?.PaymentDetail) ? p.payment.PaymentDetail : [])
          .map((r: any, i: number) => ({
            ...r,
            _rowKey: `pay|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
          }));
        this.paymentRows = pay;
        this.paymentTotals = {
          TotalPayAmt: packs.reduce((s, p) => s + Number(p?.payment?.TotalPayAmt ?? 0), 0),
        };

        // 折扣
        const disc = packs.flatMap(p => Array.isArray(p?.discount?.DiscountDetail) ? p.discount.DiscountDetail : [])
          .map((r: any, i: number) => ({
            ...r,
            _rowKey: `disc|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
          }));
        this.discountRows = disc;
        this.discountTotals = {
          TotalSalePrc: packs.reduce((s, p) => s + Number(p?.discount?.TotalSalePrc ?? 0), 0),
          TotalNet:     packs.reduce((s, p) => s + Number(p?.discount?.TotalNet     ?? 0), 0),
          TotalTax:     packs.reduce((s, p) => s + Number(p?.discount?.TotalTax     ?? 0), 0),
        };

        this.totalRecords = Number(res?.TotalCount ?? this.activeRows.length ?? 0);
        this.updateActiveFooter();
      },
      error: () => {
        this.invoiceRows = this.paymentRows = this.discountRows = [];
        this.invoiceTotals = this.paymentTotals = this.discountTotals = null;
        this.totalRecords = 0;
        this.activeFooter = undefined;
      },
      complete: () => {
        this.loading = false;
        this.messageService?.unblockUi();
      },
    });
  }

  // 切換檢視：更新總計列與筆數（資料沿用，不立即重打 API）
  onViewChange() {
    this.totalRecords = this.activeRows.length;
    this.updateActiveFooter();
  }

  // 提供給 app-table-report 的查詢函式（支援排序/分頁）
  public queryTLS23040ForReport = (body: any) =>
      this.tls23040Service.queryTLS23040({ ...body, pageSize: 30 }).pipe(
      map((res: any) => {
        const packs: any[] = Array.isArray(res?.Data) ? res.Data : [];

        let rows: any[] = [];
        let grand: Record<string, number> = {};

        if (this.viewMode === 'invoice') {
          rows = packs.flatMap(p => Array.isArray(p?.invoice?.InvoiceDetail) ? p.invoice.InvoiceDetail : [])
            .map((r: any, i: number) => {
              const isNormal = String(r?.TXN_StatusName ?? '') === '正常交易';
              return {
                ...r,
                ORG_TXN_Date: isNormal ? '' : (r?.ORG_TXN_Date ?? ''),
                ORG_ECR_No:   isNormal ? '' : (r?.ORG_ECR_No   ?? ''),
                ORG_TXN_No:   isNormal ? '' : (r?.ORG_TXN_No   ?? ''),
                _rowKey: `inv|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}`,
              };
            });
          grand = {
            TXN_TotGUI:     packs.reduce((s, p) => s + Number(p?.invoice?.TotalGUI     ?? 0), 0),
            TXN_TotSaleAmt: packs.reduce((s, p) => s + Number(p?.invoice?.TotalSaleAmt ?? 0), 0),
          };
        } else if (this.viewMode === 'payment') {
          rows = packs.flatMap(p => Array.isArray(p?.payment?.PaymentDetail) ? p.payment.PaymentDetail : [])
            .map((r: any, i: number) => ({ ...r, _rowKey: `pay|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}` }));
          grand = {
            TXN_PayAmt: packs.reduce((s, p) => s + Number(p?.payment?.TotalPayAmt ?? 0), 0),
          };
        } else {
          rows = packs.flatMap(p => Array.isArray(p?.discount?.DiscountDetail) ? p.discount.DiscountDetail : [])
            .map((r: any, i: number) => ({ ...r, _rowKey: `disc|${r.TXN_Date ?? ''}|${r.ECR_No ?? ''}|${r.TXN_No ?? ''}|${i}` }));
          grand = {
            PLU_SalePrc: packs.reduce((s, p) => s + Number(p?.discount?.TotalSalePrc ?? 0), 0),
            TXN_Net:     packs.reduce((s, p) => s + Number(p?.discount?.TotalNet     ?? 0), 0),
            TXN_Tax:     packs.reduce((s, p) => s + Number(p?.discount?.TotalTax     ?? 0), 0),
          };
        }

        // 也同步到畫面 footer（立即可見）
        this.activeFooter = { ...grand };
        const totalCount = Number(res?.TotalCount ?? rows.length ?? 0);
        return { Data: rows, TotalCount: totalCount, GrandTotal: grand };
      })
    );

  // 匯出（沿用：發票報表）
  onExportPDF() {
    if (!this.historyRequestBody) return this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
    if (this.invoiceRows.length === 0) return this.messageService?.warnBubble?.('目前沒有發票明細可匯出。');
    this.btnLoading = true;
    this.tls23040Service
      .exportTLS23040PDF(this.historyRequestBody)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (r: HttpResponse<Blob>) => this.handleFileExport(r, '.pdf') });
  }
  onExportXLSX() {
    if (!this.historyRequestBody) return this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
    if (this.invoiceRows.length === 0) return this.messageService?.warnBubble?.('目前沒有發票明細可匯出。');
    this.btnLoading = true;
    this.tls23040Service
      .exportTLS23040Excel(this.historyRequestBody)
      .pipe(finalize(() => (this.btnLoading = false)))
      .subscribe({ next: (r: HttpResponse<Blob>) => this.handleFileExport(r, '.xlsx') });
  }
  private handleFileExport(response: HttpResponse<Blob>, ext: string): void {
    const cd = response.headers.get('Content-Disposition');
    const name = this.getFilenameFromHeader(cd, ext);
    const blob = response.body;
    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService?.warnBubble?.('沒有找到符合條件的資料，無法生成報表。');
    }
  }
  private getFilenameFromHeader(cd: string | null, def: string): string {
    if (!cd) return `download${def}`;
    const star = /filename\*=([^;]+)/.exec(cd);
    if (star?.[1]) { try { return decodeURIComponent(star[1].replace(/^UTF-8''/, '')); } catch { return star[1]; } }
    const m = /filename="([^"]+)"/.exec(cd);
    if (m?.[1]) { try { return decodeURIComponent(m[1].replace(/\+/g, ' ')); } catch { return m[1]; } }
    return `download${def}`;
  }
  private padTxnNo(v: any): string {
  const s = String(v ?? '').trim();
  return s ? s.padStart(6, '0') : '';
}


  // === 欄位設定 ===
  invoiceColumns = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: (v: string) => this.formatDate(v) },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true , format: (v:any) => this.padTxnNo(v) },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'gui_track', header: '發票起始號碼(字軌)', visible: true },
    { field: 'GUIBegNo', header: '發票起始號碼', visible: true },
    { field: 'GUIEndNo', header: '發票結束號碼', visible: true },
    { field: 'TXN_TotGUI', header: '發票金額', visible: true, isTotal: true, style: 'text-right', format: (n: number) => this.formatNumber(n) , isSubTotal: true },
    { field: 'TXN_TotSaleAmt', header: '業績金額', visible: true, isTotal: true, style: 'text-right', format: (n: number) => this.formatNumber(n), isSubTotal: true  },
    { field: 'TXN_StatusName', header: '交易型態', visible: true, format: (val: any) => this.getLabelFromOptions(val, this.txnStatusOptions) },
    { field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號', visible: true },
    { field: 'USR_No', header: '收銀員', visible: true },
    { field: 'TXN_PkngUID', header: '停車卡號', visible: true },
    { field: 'ORG_TXN_Date', header: '原交易日期', visible: true, format: (v: string) => this.formatDate(v) },
    { field: 'ORG_ECR_No', header: '原收銀機號', visible: true },
    { field: 'ORG_TXN_No', header: '原交易序號', visible: true , format: (v:any) => this.padTxnNo(v) },
    { field: 'TXN_MemCard', header: '會員卡號', visible: true },
    { field: 'TXN_TotPayScoreAmt', header: '會員積點折抵', visible: true, style: 'text-right', format: (n: number) => this.formatNumber(n) },
  ];

  paymentColumns = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: (v: string) => this.formatDate(v) },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true , format: (v:any) => this.padTxnNo(v) },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'PAY_NO', header: '付款別代號', visible: true },
    { field: 'PAY_NAME', header: '付款別', visible: true },
    { field: 'TXN_PayAmt', header: '金額', visible: true, isTotal: true, style: 'text-right', format: (n: number) => this.formatNumber(n), isSubTotal: true  },
    { field: 'CRD_Name', header: '信用卡別', visible: true },
    { field: 'CRD_No', header: '信用卡卡號/條碼', visible: true, style: 'text-right' },
    { field: 'TERM_No', header: '分期', visible: true },
  ];

  discountColumns = [
    { field: 'TXN_Date', header: '銷售日期', visible: true, format: (v: string) => this.formatDate(v) },
    { field: 'ECR_No', header: '收銀機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true , format: (v:any) => this.padTxnNo(v) },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'TXN_SaleAmt', header: '單項售價', visible: true, isTotal: true, style: 'text-right', format: (n: number) => this.formatNumber(n), isSubTotal: true  },
    { field: 'TXN_Net', header: '未稅(免稅)金額', visible: true, isTotal: true, style: 'text-right', format: (n: number) => this.formatNumber(n), isSubTotal: true  },
    { field: 'TXN_Tax', header: '稅額', visible: true, isTotal: true, style: 'text-right', format: (n: number) => this.formatNumber(n), isSubTotal: true  },
    { field: 'tlt_id_desc', header: '商品抽成類別', visible: true },
    { field: 'PRM_TXN_discode', header: '原折扣', visible: true },
    { field: 'TXN_DiscName', header: '歸屬折扣名稱', visible: true },
    { field: 'PLU_TaxTypeName', header: '稅別', visible: true },
    { field: 'PLU_No', header: '報帳條碼', visible: true },
    { field: 'TXN_StatusName', header: '狀態', visible: true },
  ];

  // 依視圖更新總計列
  private updateActiveFooter() {
    if (this.viewMode === 'invoice') {
      this.activeFooter = this.invoiceTotals
        ? { TXN_TotGUI: this.invoiceTotals.TotalGUI, TXN_TotSaleAmt: this.invoiceTotals.TotalSaleAmt }
        : undefined;
    } else if (this.viewMode === 'payment') {
      this.activeFooter = this.paymentTotals
        ? { TXN_PayAmt: this.paymentTotals.TotalPayAmt }
        : undefined;
    } else {
      this.activeFooter = this.discountTotals
        ? { TXN_SaleAmt: this.discountTotals.TotalSalePrc, TXN_Net: this.discountTotals.TotalNet, TXN_Tax: this.discountTotals.TotalTax }
        : undefined;
    }
  }
}

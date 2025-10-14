/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import {
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';

import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { CarrierTypeService } from '../../../service/basic/carrier-type.service';
import {
  TLS23010Data,
  TLS23010Service,
  TLS23010OtherData,
} from '../../../service/api/tls/tls23010.service';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { FloorService } from '../../../service/basic/floor.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CashierService } from '../../../service/basic/cashier.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TranslateModule } from '@ngx-translate/core';
import { map, finalize, tap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { ButtonModule } from 'primeng/button';
import { HttpResponse } from '@angular/common/http';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';

@UntilDestroy()
// 型態別報表
@Component({
  selector: 'app-tls23010',
  templateUrl: './tls23010.component.html',
  styleUrls: ['./tls23010.component.scss'],
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
    InputTextComponent,
    DropdownComponent,
    InputTextModule,
    ButtonComponent,
    DialogModule,
    RadioButtonModule,
    TranslateModule,
    ButtonModule,
    CheckboxModule,
    TableReportComponent, // ✅ 使用報表 table
  ],
})
export class TLS23010Component
  extends BasicQueryPageComponent<any>
  implements OnInit
{
  // ===== state =====
  pdfSummary: string[] = [];
  data: any[] = [];
  summaryData: any[] = [];
  totalRecords = 0;
  
  // ===== 匯出 =====
  btnLoading = false;
  historyRequestBody: any | null = null;

  // ===== 排序（重點）=====
  sortMeta: any[] = [];
readonly defaultSort: any[] = [
  { field: 'TXN_Date', order: 1 },
  { field: 'tlt_no',   order: 1 },  // 以專櫃編號群組
  { field: 'ECR_No',   order: 1 },
  { field: 'TXN_No',   order: 1 },
];

  readonly yesterday: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return d;
  })();

  // ===== 表單 =====
  queryForm = this.formBuilder.group({
    TXN_DateStart: [this.yesterday, [Validators.required]],
    TXN_DateEnd:   [this.yesterday, [Validators.required]],
    ECR_No: [[]],
    TXN_No_Start: [null],
    TXN_No_End:   [null],
    TLT_No: [[]],
    TXN_GUIBegNo: [,[Validators.maxLength(8),Validators.minLength(8)]],
    TXN_GUIEndNo: [],
    TXN_Status: [[]],
    TXN_FlagStatus: [[]],
    USR_No: [''],
    TXN_PreOrderNo: [''],
    TXN_PkngUID: [''],
    TXN_MemCard: [''],
    TXN_Uniform: [''],
    TXN_GUILoveCode: [''],
    TXN_GUI_CarrType: [[]],
    TXN_GUIVehicle: [''],
    rece_yn: [''],
    cash_yn: [''],
    tlt_building: [''],
    tlt_floor: [[]],
    org_id: [[]],
    TXN_Subtype: [''],
     showSummary: [false],

    // ✅ 預設排序（與 defaultSort 一致）
    ...createPaginationConfig([
    { field: 'TXN_Date', order: 1 },
    { field: 'tlt_no',   order: 1 }, // ✅ 同步
    { field: 'ECR_No',   order: 1 },
    { field: 'TXN_No',   order: 1 },
    ]),
    pageSize: [30],  // ✅ 一律 30
  });

  // 下拉選單
  BUILDING_NO_Options: any[] = [];
  floorOptions: any[] = [];
  OrganizationCodeOptions: any[] = [];
  TXN_SubtypeOptions: any[] = [];
  statusFlagOptions: any[] = [];
  whetherOptions: any[] = [];
  carrierTypeOptions: any[] = [];
  txnStatusOptions: any[] = [
    { value: '1', label: '正常交易' },
    { value: '2', label: '作廢' },
    { value: '3', label: '退貨' },
  ];
  cashierOptions: any[] = [];
  ECRNoOptions: any[] = [];
  CounterOptions: any[] = [];

  constructor(
    private tls23010Service: TLS23010Service,
    private statusFlagService: StatusFlagService,
    private whetherService: WhetherService,
    private TXN_SubtypeSvc: TXN_SubtypeService,
    private carrierTypeService: CarrierTypeService,
    private tls11010Service: Tls11010Service,
    private floorService: FloorService,
    private txnStatusService: TxnStatusService,
    private counterNameService: CounterNameService,
    private ECRNoService: ECRNoService,
    private cashierService: CashierService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS23010', 'tls/tls23010', this.queryForm, (form) => this.onSubmit(form));
    this.totalRecords = 0;
   

    // ✅ 初始化排序狀態並同步到表單
    this.sortMeta = this.defaultSort.map(x => ({ ...x }));
    this.queryForm.patchValue({ SortBy: this.sortMeta, pageSize: 30 }, { emitEvent: false });

    // 載入選項
    this.floorService.getFloors().subscribe((data) => (this.floorOptions = data));
    this.statusFlagService.getStatusFlags().subscribe((data) => (this.statusFlagOptions = data));
    this.whetherService.getWhetherOptions().subscribe((data) => (this.whetherOptions = data));
    this.TXN_SubtypeSvc.getTXNSubtype().subscribe((data) => (this.TXN_SubtypeOptions = data));
    this.carrierTypeService.getCarrierType().subscribe((data) => (this.carrierTypeOptions = data));
    this.tls11010Service.getBuildingOptions().subscribe((res) => (this.BUILDING_NO_Options = res));
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
    this.cashierService.getCashierOptions().subscribe((res) => {
      this.cashierOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) || [];
    });
  }

  // ========= 查詢（明細 / 彙總） =========
onSubmit(frm: FormGroup) {
  this.handleSubmit(frm, () => {
    const val = this.queryForm.getRawValue() as any;
    const isSummary = !!this.queryForm.get('showSummary')?.value; // ✅ 用表單欄位

    // 日期轉 ISO(yyyy-MM-ddTHH:mm:ss)
    const toIso = (x: any, endOfDay = false) => {
      if (!x) return undefined;
      const d = typeof x === 'string' ? new Date(x) : (x as Date);
      if (isNaN(d.getTime())) return undefined;
      if (endOfDay) d.setHours(23, 59, 59, 999);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 19);
    };

    // ======== 分頁/排序（固定 pageSize:30）========
    const pageSize  = 30;
    const pageIndex = Number.isFinite(val?.pageIndex) ? Number(val.pageIndex) : 1;

    const sortByArr = (Array.isArray(val?.SortBy) && val.SortBy.length
      ? val.SortBy
      : (this.sortMeta.length ? this.sortMeta : this.defaultSort)
    ).map((s: any) => ({ ...s }));

    // ======== 組 payload ========
    const payload: any = {
      ...val,
      TXN_DateStart: toIso(val?.TXN_DateStart, false),
      TXN_DateEnd:   toIso(val?.TXN_DateEnd,   true),
    };

    // 不把 showSummary 傳給後端
    delete payload.showSummary; // ✅ 關鍵

    if (!isSummary) {
      Object.assign(payload, { pageSize, pageIndex, SortBy: sortByArr });
    } else {
      Object.assign(payload, { SortBy: sortByArr });
      // 彙總通常後端不吃分頁；保險起見也移除
      delete payload.pageIndex;
      delete payload.pageSize;
    }

    // 清空空值（保留 0/false）
    Object.keys(payload).forEach((k) => {
      const v = payload[k];
      if (v === null || v === undefined) delete payload[k];
      if (Array.isArray(v) && v.length === 0) delete payload[k];
      if (typeof v === 'string' && v.trim() === '') delete payload[k];
    });

    // 匯出沿用同一包參數
    this.historyRequestBody = { ...payload };

    this.loading = true;

    if (isSummary) {
      this.tls23010Service
        .queryTLS23010Summary(payload)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (resp) => {
            const dataArr = Array.isArray(resp?.Data) ? resp.Data : [];
            const head = dataArr[0] ?? {};
            const details =
              Array.isArray(head?.tLS23010Summary_Details) ? head.tLS23010Summary_Details :
              Array.isArray(head?.TLS23010Summary_Details) ? head.TLS23010Summary_Details :
              [];

            this.summaryData  = details.map((row: any) => ({ ...row }));
            this.data         = [];
            this.totalRecords = this.summaryData.length;

            this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
          },
          error: () => {
            this.summaryData  = [];
            this.totalRecords = 0;
          },
        });
    } else {
      this.tls23010Service
        .queryTLS23010(payload)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (resp) => {
            const queryData = Array.isArray(resp?.Data?.QueryData)
              ? resp.Data.QueryData
              : Array.isArray(resp?.Data) ? resp.Data : [];

            this.data = queryData.map((row: any) => ({
              ...row,
              id: `${row.SYS_StoreNo}_${row.TXN_Date}_${row.ECR_No}_${row.TXN_No}`,
            }));

            this.detailTotals = this.coerceTotals(resp?.Data?.TotalSummary);
            this.summaryData   = [];
            this.totalRecords  = Number(resp?.TotalCount ?? this.data.length ?? 0);

            this.updatePdfSummary(); // 內部會依 showSummary 決定顯示內容
            this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
          },
          error: () => {
            this.data          = [];
            this.totalRecords  = 0;
            this.pdfSummary    = [];
          },
        });
    }
  });
}

  onToggleSummary() {
  this.queryForm.patchValue({ pageIndex: 1, pageSize: 30 }, { emitEvent: false });
  this.onSubmit(this.queryForm);
}

  // ========= 提供給 <app-table-report> 的查詢封裝（明細） =========
  public queryTLS23010ForReport = (body: any) =>
    this.tls23010Service.queryTLS23010(body).pipe(
      map((res: any) => ({
        Data: Array.isArray(res?.Data?.QueryData)
          ? res.Data.QueryData
          : (Array.isArray(res?.Data) ? res.Data : []),
        TotalCount: Number(res?.TotalCount ?? res?.Data?.TotalCount ?? 0),
        GrandTotal: res?.Data?.TotalSummary ?? null,
      }))
    );

  // ========= 提供給 <app-table-report> 的查詢封裝（彙總，切 30 筆分頁） =========
  public queryTLS23010SummaryForReport = (body: any) =>
    this.tls23010Service.queryTLS23010Summary(body).pipe(
      map((resp: any) => {
        const dataArr = Array.isArray(resp?.Data) ? resp.Data : [];
        const head = dataArr[0] ?? {};
        const all =
          Array.isArray(head?.tLS23010Summary_Details) ? head.tLS23010Summary_Details :
          Array.isArray(head?.TLS23010Summary_Details) ? head.TLS23010Summary_Details :
          [];
        const pageIndex = Number(body?.pageIndex ?? 1);
        const pageSize  = Number(body?.pageSize  ?? 30);
        const slice = all.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
        return { Data: slice, TotalCount: all.length, GrandTotal: null };
      })
    );

  // ========= 展開列：載入明細 =========
  loadDetails = (row: TLS23010Data) => {
    const body = {
      SYS_StoreNo: row.SYS_StoreNo,
      TXN_Date: row.TXN_Date,
      ECR_No: row.ECR_No,
      TXN_No: row.TXN_No,
    };
    return this.tls23010Service.queryTLS23010Detail(body).pipe(
      map((list: any[]) => ({ Data: list ?? [] }))
    );
  };

  // ========= 匯出 =========
  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    // 匯出不帶分頁
    const exportBody = { ...this.historyRequestBody };
    delete exportBody.pageIndex;
    delete exportBody.pageSize;
    delete exportBody.PageIndex;
    delete exportBody.PageSize;
    delete exportBody.Offset;
    delete exportBody.OrderBy;

    this.btnLoading = true;

const isSummary = !!this.queryForm.get('showSummary')?.value;
const obs = isSummary
  ? this.tls23010Service.exportTLS23010SummaryPDF(exportBody)
  : this.tls23010Service.exportTLS23010PDF(exportBody);
  }

  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService?.warnBubble?.('請先執行查詢以產生報表。');
      return;
    }
    // 匯出不帶分頁
    const exportBody = { ...this.historyRequestBody };
    delete exportBody.pageIndex;
    delete exportBody.pageSize;
    delete exportBody.PageIndex;
    delete exportBody.PageSize;
    delete exportBody.Offset;
    delete exportBody.OrderBy;

    this.btnLoading = true;

const isSummary = !!this.queryForm.get('showSummary')?.value;
const obs = isSummary
  ? this.tls23010Service.exportTLS23010SummaryExcel(exportBody)
  : this.tls23010Service.exportTLS23010Excel(exportBody);
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


  // ========= 小工具 =========
  private coerceTotals(src: any): Record<string, number> {
    const out: Record<string, number> = {};
    if (!src) return out;
    for (const k of Object.keys(src)) {
      const v = (src as any)[k];
      out[k] = typeof v === 'number' ? v : Number(v) || 0;
    }
    return out;
  }

  formatISOToHHMMSS = (val: string): string => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    const ss = String(d.getSeconds()).padStart(2,'0');
    return `${hh}:${mm}:${ss}`;
  };

  getYesNoLabel(value: any): string {
    return value === 'Y' ? '是' : value === 'N' ? '否' : value;
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  formatDateTimeYMDHM(val: string | Date): string {
    if (!val) return '';
    const d = typeof val === 'string' ? new Date(val) : val;
    if (isNaN(d.getTime())) return String(val ?? '');
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  }

  formatYMD = (val: unknown): string => {
    if (val == null) return '';
    if (val instanceof Date && !isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const d = String(val.getDate()).padStart(2, '0');
      return `${y}/${m}/${d}`;
    }
    const s = String(val);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}/${m[2]}/${m[3]}`;
    const dt = new Date(s);
    if (!isNaN(dt.getTime())) {
      const y = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return `${y}/${mm}/${dd}`;
    }
    return s;
  };

  nyToYesNo = (val: unknown): string => {
    const v = String(val ?? '').replace(/^[\s\u00A0\u3000]+|[\s\u00A0\u3000]+$/g, '').toUpperCase();
    if (v === 'Y' || v === 'TRUE' || v === '1') return '是';
    if (v === 'N' || v === 'FALSE' || v === '0') return '否';
    return '';
  };

  // footer/空白 顯示處理
  pToYesNoSafe = (val: unknown): string => {
    const v = String(val ?? '').trim().toUpperCase();
    if (!v) return '';
    return v === 'P' ? '是' : '否';
  };

  nullpToYesNoSafe = (val: unknown): string => {
    const v = String(val ?? '').trim().toUpperCase();
    if (!v) return '';
    if (v === 'Y') return '是';
    if (v === 'N') return '否';
    return '是';
  };

private getSum(field: string): number {
  const isSummary = !!this.queryForm?.get('showSummary')?.value; // ✅ 改用表單欄位

  if (!isSummary) {
    const mapped = this.detailTotalFieldMap?.[field];
    if (mapped != null && typeof this.detailTotals?.[mapped] === 'number') {
      return this.detailTotals[mapped] ?? 0;
    }
    return (this.data ?? []).reduce((s, r) => s + (Number(r?.[field]) || 0), 0);
  }

  // 彙總模式：直接從 summaryData 累加（若未來有 summary 的 total map，再在這裡優先取用）
  return (this.summaryData ?? []).reduce((s, r) => s + (Number(r?.[field]) || 0), 0);
}


  private buildSummaryFromLocal(): void {
    const A = this.getSum('TXN_TotGUI');
    const B = this.getSum('TXN_TotPayAmt');
    const C = this.getSum('TXN_TotOver');
    const D = this.getSum('TXN_Deposit');
    const E = this.getSum('TXN_DepositSettle');
    const F = this.getSum('TXN_DepositUsed');
    const G = this.getSum('TXN_TotDisc');
    const H = this.getSum('TXN_PresaleSettle') || this.getSum('TXN_TaxFreeCertNo');

    const discountValue = A + B - C + E - G + H;
    const paymentValue  = A + B + D - F;

    this.pdfSummary = [
      `(A)發票金額 =\t${A.toLocaleString()}`,
      `(B)已開發票的支付工具 =\t${B.toLocaleString()}`,
      `(C)已開發票的支付工具溢收 =\t${C.toLocaleString()}`,
      `(D)訂金 =\t${D.toLocaleString()}`,
      `(E)訂金結帳全額 =\t${E.toLocaleString()}`,
      `(F)訂金結帳的訂金 =\t${F.toLocaleString()}`,
      `(G)預售 =\t${G.toLocaleString()}`,
      `(H)預售結帳金額 =\t${H.toLocaleString()}`,
      '====================================================',
      `折扣別(專櫃業績) = (A)+(B)-(C)+(E)-(G)+(H) =\t${discountValue.toLocaleString()}`,
      `付款別(支付工具) = (A)+(B)+(D)-(F) =\t${paymentValue.toLocaleString()}`,
    ];
  }

private updatePdfSummary(): void {
  const isSummary = !!this.queryForm.get('showSummary')?.value; // ✅

  if (isSummary) {
    const totalAmt = this.getSum('TXN_TotSaleAmt');
    const totalTxn = this.getSum('TotalTxn');
    this.pdfSummary = [
      `總金額合計 = ${Number(totalAmt || 0).toLocaleString()}`,
      `總交易筆數合計 = ${Number(totalTxn || 0).toLocaleString()}`,
      '=============================',
      `平均每筆金額 = ${totalTxn > 0 ? (totalAmt / totalTxn).toFixed(2) : '0.00'}`,
    ];
    return;
  }

    const req = this.historyRequestBody || null;
    if (!req) {
      this.buildSummaryFromLocal();
      return;
    }

    this.tls23010Service.queryOtherData(req).subscribe({
      next: (data: TLS23010OtherData | null) => {
        if (!data) {
          this.buildSummaryFromLocal();
          return;
        }

        const A = Number(data.A ?? 0);
        const B = Number(data.B ?? 0);
        const C = Number(data.C ?? 0);
        const D = Number(data.D ?? 0);
        const E = Number(data.E ?? 0);
        const F = Number(data.F ?? 0);
        const G = Number(data.G ?? 0);
        const H = Number(data.H ?? 0);

        const discountValue = Number.isFinite(Number(data.tlt_AchAmt))
          ? Number(data.tlt_AchAmt)
          : (A + B - C + E - G + H);

        const paymentValue = Number.isFinite(Number(data.pay_AchAmt))
          ? Number(data.pay_AchAmt)
          : (A + B + D - F);

        this.pdfSummary = [
          `(A)發票金額 =\t${A.toLocaleString()}`,
          `(B)已開發票的支付工具 =\t${B.toLocaleString()}`,
          `(C)已開發票的支付工具溢收 =\t${C.toLocaleString()}`,
          `(D)訂金 =\t${D.toLocaleString()}`,
          `(E)訂金結帳全額 =\t${E.toLocaleString()}`,
          `(F)訂金結帳的訂金 =\t${F.toLocaleString()}`,
          `(G)預售 =\t${G.toLocaleString()}`,
          `(H)預售結帳金額 =\t${H.toLocaleString()}`,
          '====================================================',
          `折扣別(專櫃業績) = (A)+(B)-(C)+(E)-(G)+(H) =\t${discountValue.toLocaleString()}`,
          `付款別(支付工具) = (A)+(B)+(D)-(F) =\t${paymentValue.toLocaleString()}`,
        ];
      },
      error: () => this.buildSummaryFromLocal(),
    });
  }

  buildFooterFromTotals(): Record<string, any> | undefined {
    if (!this.detailTotals) return undefined;
    return {
      TXN_TotGUI:     this.detailTotals['Total_TXN_TotGUI'] ?? 0,
      TXN_TotSaleAmt: this.detailTotals['Total_TXN_TotSaleAmt'] ?? 0,
      TXN_TotOver:    this.detailTotals['Total_TXN_TotOver'] ?? 0,
      TXN_TotDisc:    this.detailTotals['Total_TXN_TotDisc'] ?? 0,
      TXN_PayAmt:     this.detailTotals['Total_TXN_PayAmt'] ?? 0,
    };
  }
  private padTxnNo(v: any): string {
  const s = String(v ?? '').trim();
  return s ? s.padStart(6, '0') : '';
}


  // ========= 欄位 =========
columns = [
  { field: 'TXN_Date',       header: '銷售日期',  visible: true, format: this.formatYMD },
  { field: 'ECR_No',         header: '收銀機號',  visible: true },
  { field: 'TXN_No',         header: '交易序號',  visible: true, style: 'text-right' },

  { field: 'tlt_no',         header: '專櫃編號',  visible: true },        // ✅ 群組鍵(不需 isSubTotal)
  { field: 'tlt_name',       header: '櫃位名稱',  visible: true, style: 'text-left' },

  { field: 'TXN_Uniform',    header: '統一編號',  visible: true },
  { field: 'gui_track',      header: '字軌',      visible: true },
  { field: 'GUIBegNo',       header: '發票起始號碼', visible: true },
  { field: 'GUIEndNo',       header: '發票結束號碼', visible: true },

  // ✅ 金額欄位：同時支援小計與總計
  { field: 'TXN_TotGUI',     header: '發票金額',    visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
  { field: 'TXN_TotSaleAmt', header: '銷售金額',    visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
  { field: 'TXN_TotOver',    header: '溢收金額',    visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

  { field: 'TXN_VIP',        header: '外交官零稅',  visible: true, format: this.nyToYesNo },
  { field: 'TXN_Mode',       header: '事後登錄',    visible: true, format: this.pToYesNoSafe, noTotal: true },
  { field: 'TXN_PreOrder',   header: '預售',        visible: true, format: this.nullpToYesNoSafe, noTotal: true },

  { field: 'TXN_StatusName', header: '交易型態',    visible: true },
  { field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號', visible: true },

  { field: 'TXN_Time',       header: '交易時間',    visible: true, format: this.formatISOToHHMMSS },
  { field: 'USR_No',         header: '收銀員',      visible: true, style: 'text-left' },
  { field: 'TXN_PreOrderNo', header: '預售/訂金單號', visible: true },

  { field: 'ORG_TXN_Date',   header: '原交易日期',  visible: true, format: this.formatYMD },
  { field: 'ORG_ECR_No',     header: '原收銀機號',  visible: true },
  { field: 'ORG_TXN_No',     header: '原交易序號',  visible: true, style: 'text-right' },

  { field: 'TXN_PkngUID',    header: '停車車牌',    visible: true },
  { field: 'TXN_MemID',      header: '會員卡號',    visible: true },

  { field: 'TXN_TotDisc',    header: '折扣/讓金額', visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },

  { field: 'GUILoveStatus',  header: '捐贈狀態',    visible: true, format: this.nyToYesNo },
  { field: 'TXN_GUILoveCode', header: '捐贈社福團體代碼', visible: true },
  { field: 'TXN_GUIRemark',  header: '防偽隨機碼',   visible: true },

  { field: 'TXN_GUI_CarrType', header: '載具種類',   visible: true, format: (v: any) => this.getLabelFromOptions(v, this.carrierTypeOptions) },
  { field: 'TXN_GUIVehicle', header: '載具號碼',     visible: true },

  { field: 'TXN_PrintTimes', header: '發票列印次數', visible: true, style: 'text-right' },
  { field: 'TXN_PrintGUI',   header: '電子發票是否列印', visible: true, format: this.getYesNoLabel },

  { field: 'CRD_Name',       header: '信用卡別',    visible: true },
  { field: 'CRD_No',         header: '號碼',        visible: true },
  { field: 'TERM_No',        header: '分期期數',     visible: true, style: 'text-right' },

  // ✅ 支付金額也做小計+總計
  { field: 'TXN_PayAmt',     header: '金額',        visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true, isSubTotal: true },
];


  detailcolumns = [
    { field: 'TXN_Date',   header: '銷售日期', format: this.formatDateTimeYMDHM.bind(this) },
    { field: 'ECR_No',     header: '收銀機號' },
    { field: 'TXN_No',     header: '交易序號', style: 'text-right', format: (v:any) => this.padTxnNo(v) },
    { field: 'tlt_no',     header: '專櫃編號' },
    { field: 'tlt_name',   header: '櫃位名稱' },
    { field: 'PAY_NAME',   header: '付款別' },
    { field: 'CRD_Name',   header: '卡別' },
    { field: 'CRD_No',     header: '號碼' },
    { field: 'TERM_No',    header: '分期期數', style: 'text-right' },
    { field: 'TXN_PayAmt', header: '金額', style: 'text-right', format: this.moneyFormat ,isTotal: true},
  ];

  // ===== API 總計對映 =====
  detailTotals: Record<string, number> = {};
  detailTotalFieldMap: Record<string, string> = {
    TXN_TotGUI:     'Total_TXN_TotGUI',
    TXN_TotSaleAmt: 'Total_TXN_TotSaleAmt',
    TXN_TotOver:    'Total_TXN_TotOver',
    TXN_TotDisc:    'Total_TXN_TotDisc',
    TXN_PayAmt:     'Total_TXN_PayAmt',
  };
  summaryColumns = [
  { field: 'tlt_no',        header: '專櫃編號',        visible: true },
  { field: 'tlt_name',      header: '櫃位名稱',        visible: true, style: 'text-left' },
  { field: 'TXN_DateStart', header: '銷售日期(起)',    visible: true, format: this.formatYMD },
  { field: 'TXN_DateEnd',   header: '銷售日期(迄)',    visible: true, format: this.formatYMD },
  { field: 'TXN_TotGUI',    header: '發票金額',        visible: true, style: 'text-right', format: this.moneyFormat, isTotal: true },
];
}

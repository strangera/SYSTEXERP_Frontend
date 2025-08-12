import { Component, ViewChild } from '@angular/core';

import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

import { PdfService } from '../../../service/basic/pdf.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { CarrierTypeService } from '../../../service/basic/carrier-type.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ReportTableGroupComponent } from '../../../shared/componentkit/report-table-group/report-table-group.component';
import { NgIf, DecimalPipe } from '@angular/common';  // ⬅️ 加這行
import { TLS23010Service } from '@service/api/tls/tls23010.service';
import { finalize } from 'rxjs/operators';
import { TLS23010CacheService } from '@service/api/tls/tls23010-cache.service';
type DisplayMode = 'Detail' | 'Summary';

interface ReportColumn {
  header: string;
  field: string;
  format?: (value: any) => string | number | null;
  style?: string;
}
@Component({
  selector: 'app-tls23010-cru',
  templateUrl: './tls23010-cru.component.html',
  styleUrls: ['./tls23010-cru.component.scss'],
  standalone: true,
  imports: [NgIf, DecimalPipe, MenubarComponent, ReportTableGroupComponent],
})
export class TLS23010CRUComponent extends BasicCruPageComponent<any> {
  mergedView: boolean = true;
  data: any[] = [];
  printedAt: string = '';
  dateStart: string = '';
  dateEnd: string = '';
  pageSize: number = 1000;
  queryFormValue: any;
 private queryKey = '';

  // 來自 navigate state
  
 currentPage = 1;

  totalPage = 0;
  totalCount = 0;
  loadingMore = false;
  showGrandTotal = false;


  allPagesLoaded = false;


  dataForm = this.formBuilder.nonNullable.group({});



  pdfSummary: string[] = [];
  statusFlagOptions: any[] = [];
  txnStatusOptions: any[] = [];
  transactionSubTypeOptions: any[] = [];
  whetherOptions: any[] = [];
  carrierTypeOptions: any[] = [];
  constructor(
    private statusFlagService: StatusFlagService,
    private whetherService: WhetherService,
    private txnSubtypeService: TXN_SubtypeService,
    private carrierTypeService: CarrierTypeService,
    private tls23010Service: TLS23010Service,
    private tls23010Cache: TLS23010CacheService,
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
  const s = history.state ?? {};

  // ✅ 查詢條件（含 PageSize / PageIndex）
  this.queryFormValue = s?.queryFormValue ?? {};
  this.pageSize     = Number(s?.pageSize ?? this.queryFormValue?.PageSize ?? 1000) || 1000;
  this.currentPage  = Number(this.queryFormValue?.PageIndex ?? 1);
  this.totalCount   = Number(s?.totalCount ?? 0);
  this.totalPage    = Number(
    s?.totalPage ??
    (this.totalCount ? Math.ceil(this.totalCount / this.pageSize) : 0)
  );

  // ✅ 顯示模式與合併視圖
  this.displayMode = (s?.displayMode as 'Detail' | 'Summary') ?? 'Detail';
  this.mergedView  = this.displayMode === 'Detail'; // Summary 一律關閉合併表
      // ⭐ 生成查詢 key 並嘗試從快取還原
    this.queryKey = this.tls23010Cache.makeKey(this.queryFormValue);
    const cached = this.tls23010Cache.getState(this.queryKey);

  // ✅ 首頁資料（Query 頁帶來的第一頁）
  this.data = (Array.isArray(s?.data) ? s.data : []).map((row: any) => ({
    ...row,
    TXN_Key: `${row.TXN_Date}_${row.ECR_No}_${row.TXN_No}`,
  }));

  // ✅ 報表抬頭資訊
  this.printedAt = new Date().toLocaleString('zh-TW', { hour12: false });
  this.dateStart = this.queryFormValue?.TXN_DateStart ?? '';
  this.dateEnd   = this.queryFormValue?.TXN_DateEnd   ?? '';
  if (cached && cached.merged?.length) {
      // ✅ 命中：直接還原
      this.data       = cached.merged.map(r => ({ ...r, TXN_Key: `${r.TXN_Date}_${r.ECR_No}_${r.TXN_No}` }));
      this.currentPage = cached.currentPage ?? 1;
      this.totalCount  = cached.totalCount ?? 0;
      this.totalPage   = cached.totalPage ?? 0;

      this.printedAt = cached.printedAt ?? new Date().toLocaleString('zh-TW', { hour12: false });
      this.dateStart = cached.dateStart ?? this.queryFormValue?.TXN_DateStart ?? '';
      this.dateEnd   = cached.dateEnd   ?? this.queryFormValue?.TXN_DateEnd   ?? '';

      // 還原捲動位置
      setTimeout(() => this.restoreChildScrollTop(cached.scrollTop ?? 0), 0);
    } else {
      // ❌ 沒有快取：用首頁資料初始化，並寫入快取
      this.data = (Array.isArray(s?.data) ? s.data : []).map((row: any) => ({
        ...row,
        TXN_Key: `${row.TXN_Date}_${row.ECR_No}_${row.TXN_No}`,
      }));
      this.printedAt = new Date().toLocaleString('zh-TW', { hour12: false });
      this.dateStart = this.queryFormValue?.TXN_DateStart ?? '';
      this.dateEnd   = this.queryFormValue?.TXN_DateEnd   ?? '';

      // ⭐ 存入第 1 頁快取
      if (this.data.length) {
        this.tls23010Cache.setPage(this.queryKey, this.currentPage, this.data);
        this.tls23010Cache.setState(this.queryKey, {
          currentPage: this.currentPage,
          totalCount : this.totalCount,
          totalPage  : this.totalPage,
          printedAt  : this.printedAt,
          dateStart  : this.dateStart,
          dateEnd    : this.dateEnd,
        });
      }
    }

  // ✅ 標準頁面初始化
  this.initializePage('TLS23010', this.dataForm);

  // 下拉選項
  this.statusFlagService.getStatusFlags().subscribe(res => (this.statusFlagOptions = res));
  this.whetherService.getWhetherOptions().subscribe(res => (this.whetherOptions = res));
  this.txnSubtypeService.getTXNSubtype().subscribe(res => (this.transactionSubTypeOptions = res));
  this.carrierTypeService.getCarrierType().subscribe(res => (this.carrierTypeOptions = res));

  // ✅ 決定是否已載完全部頁（控制總計顯示用）
  this.updateAllPagesLoaded?.();

  // ✅ 更新 PDF 摘要
  this.updatePdfSummary();
  
}

  private _displayMode: 'Detail' | 'Summary' = 'Detail';

  get displayMode(): 'Detail' | 'Summary' {
    return this._displayMode;
  }

  set displayMode(value: 'Detail' | 'Summary') {
    this._displayMode = value;

    if (value === 'Summary') {
      this.mergedView = false; // ✅ Summary 模式不允許合併顯示
    }

    // ✅ 更新報表內容
    this.updatePdfSummary(); // summary 重新運算
  }

  formatDateToYMD(dateStr: string): string {
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? ''
      : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  }
  formatTimeToHHMM(timeStr: string): string {
    const date = new Date(`1970-01-01T${timeStr}`);
    if (isNaN(date.getTime())) return '';
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  getYesNoLabel(value: any): string {
    return value === 'Y' ? '是' : value === 'N' ? '否' : value;
  }

fetchDetailData = async (payload: any): Promise<any[]> => {
  const storeNo = (() => {
    try {
      const raw = localStorage.getItem('UserInfo');
      return raw ? JSON.parse(raw)?.SYS_StoreNo ?? null : null;
    } catch { return null; }
  })();

  if (!storeNo) return [];

  const req = {
    SYS_StoreNo: String(storeNo),
    TXN_Date: payload?.TXN_Date,
    ECR_No: payload?.ECR_No,
    TXN_No: payload?.TXN_No,
  };

  return new Promise(resolve => {
    // 直接打後端，不再用 state 裡的 DetailList
    this.tls23010Service.queryTLS23010Detail(req).subscribe({
      next: res => resolve(res?.Data ?? []),
      error: _ => resolve([]),
    });
  });
};

  private getSum(field: string): number {
    return this.data.reduce(
      (sum, row) => sum + (parseFloat(row[field]) || 0),
      0,
    );
  }

  private updatePdfSummary(): void {
    if (this.displayMode === 'Detail') {
      const A = this.getSum('TXN_TotSaleAmt'); // 發票金額
      const B = this.getSum('TXN_TotPayAmt'); // 已開發票的支付工具
      const C = this.getSum('TXN_TotOver'); // 已開發票的支付工具溢收
      const D = this.getSum('TXN_Deposit'); // 訂金
      const E = this.getSum('TXN_DepositSettle'); // 訂金結帳金額
      const F = this.getSum('TXN_DepositUsed'); // 訂金結帳的訂金
      const G = this.getSum('TXN_TotDisc'); // 預售 (使用折扣金額欄位)
      const H = this.getSum('TXN_TaxFreeCertNo'); // 預售結帳金額
      const discountValue = A + B - C + E - G + H;
      const paymentValue = A + B + D - F;

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
        `折扣別(專櫃業績) = (A) + (B) - (C) + (E) - (G) + (H)=\t${discountValue.toLocaleString()}`,
        `付款別(支付工具) = (A) + (B) + (D) - (F)=\t${paymentValue.toLocaleString()}`,
      ];
    } else if (this.displayMode === 'Summary') {
      const totalAmt = this.getSum('TXN_TotSaleAmt');
      const totalTxn = this.getSum('TotalTxn');

      this.pdfSummary = [
        `總金額合計 = ${totalAmt.toLocaleString()}`,
        `總交易筆數合計 = ${totalTxn.toLocaleString()}`,
        '=============================',
        `平均每筆金額 = ${totalTxn > 0 ? (totalAmt / totalTxn).toFixed(2) : '0.00'}`,
      ];
    }
  }

  get columns(): ReportColumn[] {
    switch (this.displayMode) {
      case 'Detail':
        return [
          {
            field: 'TXN_Date',
            header: '銷售日期',

            format: (val: string) => {
              const date = new Date(val);
              return isNaN(date.getTime())
                ? val
                : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
            },
          },
          { field: 'ECR_No', header: '收銀機號' },
          { field: 'TXN_No', header: '交易序號', style: 'text-right' },
          { field: 'tlt_no', header: '專櫃編號' },
          { field: 'tlt_name', header: '櫃位名稱', style: 'text-left' }, // 非 POS5006 欄位，UI 顯示用
          { field: 'TXN_Uniform', header: '統一編號' },
          { field: 'gui_track', header: '字軌' }, // 假設為字軌顯示
          { field: 'GUIBegNo', header: '起始發票號碼' },
          { field: 'GUIEndNo', header: '結束發票號碼' },
          {
            field: 'TXN_TotGUI',
            header: '發票金額',
            style: 'text-right',
            format: (val: number) => val?.toLocaleString('en-US') || '0',
          },
          {
            field: 'TXN_TotSaleAmt',
            header: '銷售金額',

            style: 'text-right',
            format: (val: number) => val?.toLocaleString('en-US') || '0',
          },
          {
            field: 'TXN_TotOver',
            header: '溢收金額',
            style: 'text-right',
            format: (val: number) => val?.toLocaleString('en-US') || '0',
          },
          {
            field: 'TXN_FlagStatus',
            header: '狀態旗標',

            format: (val: any) =>
              this.getLabelFromOptions(val, this.statusFlagOptions),
          },
          {
            field: 'TXN_Status',
            header: '交易型態',

            format: (val: any) =>
              this.getLabelFromOptions(val, this.txnStatusOptions),
          },
          {
            field: 'TXN_Subtype',
            header: '交易附屬型態',

            format: (val: any) =>
              this.getLabelFromOptions(val, this.transactionSubTypeOptions),
          },
          {
            field: 'TXN_TotPayAmt',
            header: '訂金實收',
            style: 'text-right',
            format: (val: number) => val?.toLocaleString('en-US') || '0',
          },
          { field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號' },
          {
            field: 'TXN_Time',
            header: '起始時間',
            format: this.formatTimeToHHMM.bind(this),
          },
          {
            field: 'TXN_Time',
            header: '結束時間',
            format: this.formatTimeToHHMM.bind(this),
          },
          { field: 'USR_No', header: '收銀員', style: 'text-left' },
          { field: 'TXN_PreOrderNo', header: '預售/訂金單號' },
          { field: 'ORG_TXN_Date', header: '原交易日期' },
          { field: 'ORG_ECR_No', header: '原收銀機號' },
          { field: 'ORG_TXN_No', header: '原交易序號' },
          { field: 'TXN_PkngUID', header: '停車車牌' },
          { field: 'TXN_MemID', header: '會員卡號' },
          {
            field: 'TXN_TotDisc',
            header: '折扣/讓金額',
            style: 'text-right',
            format: (val: number) => val?.toLocaleString('en-US') || '0',
          },
          {
            field: 'TXN_YN',
            header: '銷貨清單列印狀態',

            format: () => '是',
          },

          {
            field: 'TXN_DonateType',
            header: '捐贈狀態',

            format: (val: any) =>
              this.getLabelFromOptions(val, this.whetherOptions),
          },
          { field: 'TXN_GUILoveCode', header: '捐贈社福團體代碼' },
          { field: 'TXN_GUIRemark', header: '防偽隨機碼' },
          {
            field: 'TXN_GUI_CarrType',
            header: '載具種類',

            format: (val: any) =>
              this.getLabelFromOptions(val, this.carrierTypeOptions),
          },
          { field: 'TXN_GUI_CarrId', header: '共通性載具號碼' },
          {
            field: 'TXN_PrintGUI',
            header: '電子發票是否列印', //是從 **POS5006.TXN_PrintTimes** 計算出來的結果。

            format: (val: any) => this.getYesNoLabel(val),
          },
          {
            field: 'TXN_PrintGUI',
            header: '信用卡別',
          },
          {
            field: 'TXN_PrintGUI',
            header: '號碼',
          },
          {
            field: 'TXN_PrintGUI',
            header: '分期期數',
          },
          {
            field: 'TXN_PrintGUI',
            header: '金額',
          },
        ];

case 'Summary':
  return [
    {
      field: 'TXN_Date',
      header: '銷售日期',
      format: (val: string) => {
        const d = new Date(val);
        return isNaN(d.getTime()) ? val :
          `${d.getFullYear()}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')}`;
      },
    },
    { field: 'tlt_no',   header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
    {
      field: 'TXN_TotGUI',                // ⬅️ 用回應裡的欄位
      header: '發票總金額',
      style: 'text-right',
      format: this.moneyFormat,
    },
  ];

      default:
        return [{ header: '錯誤', field: '', format: () => '未知模式' }];
    }
  }
  get detailColumns(): ReportColumn[] {
    return [
      {
        field: 'TXN_Date',
        header: '銷售日期',

        format: (val: string) => {
          const date = new Date(val);
          return isNaN(date.getTime())
            ? val
            : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
        },
      },
      { field: 'ECR_No', header: '收銀機號' },
      { field: 'TXN_No', header: '交易序號', style: 'text-right' },
      { field: 'PAY_NO', header: '支付方式代號' },
      { field: 'tlt_no', header: '專櫃編號' },
      { field: 'tlt_name', header: '櫃位名稱', style: 'text-left' }, // 非 POS5006 欄位，UI 顯示用
      { field: 'PAY_NAME', header: '付款別' },
      { field: 'CRD_Type', header: '卡別' },
      { field: 'CRD_Name', header: '號碼' },
      { field: 'TERM_No', header: '分期期數', style: 'text-right' },
      {
        field: 'TXN_PayAmt',
        header: '金額',
        style: 'text-right',
        format: this.moneyFormat,
      },
    ];
  }
    private updateAllPagesLoaded(): void {
    if (this.totalPage) {
      this.allPagesLoaded = this.currentPage >= this.totalPage;
      return;
    }
    // 後端若沒回 TotalPage，用長度比對 TotalCount
    if (this.totalCount) {
      this.allPagesLoaded = this.data.length >= this.totalCount;
    }
  }


trackByRow = (_: number, row: any) => row?.TXN_Key ?? _;



// 由 reachBottom 觸發
onReachBottom(): void {
  if (!this.loadingMore && !this.showGrandTotal && this.displayMode === 'Detail') {
    this.loadNextPage();
  }
}

/** ===== 與子元件互動：讀/寫 scrollTop ===== */
// 1) 先抓子元件實例
@ViewChild(ReportTableGroupComponent) tableGroup?: any;

// 2) 取目前 scrollTop（子元件會回傳 host 的 scrollTop）
private getChildScrollTop(): number {
  try { return this.tableGroup?.getHostScrollTop?.() ?? 0; } catch { return 0; }
}

// 3) 還原 scrollTop
private restoreChildScrollTop(top: number): void {
  try { this.tableGroup?.setHostScrollTop?.(top); } catch {}
}

 // ⭐ 記住離開時的捲動位置
  ngOnDestroy(): void {
    try {
      const top = this.getChildScrollTop();
      this.tls23010Cache.setState(this.queryKey, { scrollTop: top });
    } catch {}
  }

  private loadNextPage(): void {
    if (this.loadingMore || this.showGrandTotal || this.displayMode !== 'Detail') return;

    const nextIndex = this.currentPage + 1;
    if (this.totalPage && nextIndex > this.totalPage) return;

    this.loadingMore = true;

    const prevTop = this.getChildScrollTop();

    // ⭐ 先查快取
    const cachedRows = this.tls23010Cache.getPage(this.queryKey, nextIndex);
    if (cachedRows?.length) {
      // ✅ 命中快取，不打 API
      this.data = [...this.data, ...cachedRows];
      this.currentPage = nextIndex;
      this.showGrandTotal = this.totalPage ? this.currentPage >= this.totalPage : cachedRows.length < this.pageSize;

      // 更新快取的 merged / currentPage / scroll
      this.tls23010Cache.setState(this.queryKey, {
        merged: this.data,
        currentPage: this.currentPage,
      });

      this.restoreChildScrollTop(prevTop);
      this.loadingMore = false;
      return;
    }

    // ❌ 沒命中才打 API
    const body = {
      ...(this.queryFormValue || {}),
      PageSize: this.pageSize,
      PageIndex: nextIndex,
    };

    this.tls23010Service.queryTLS23010(body, 'Detail')
      .pipe(finalize(() => (this.loadingMore = false)))
      .subscribe({
        next: (res) => {
          const rows = (res?.Data || []).map((r: any) => ({
            ...r,
            TXN_Key: `${r.TXN_Date}_${r.ECR_No}_${r.TXN_No}`,
          }));

          this.data = [...this.data, ...rows];

          if (typeof res?.TotalCount === 'number') this.totalCount = res.TotalCount;
          if (typeof res?.TotalPage  === 'number') this.totalPage  = res.TotalPage;

          this.currentPage = nextIndex;

          this.showGrandTotal = this.totalPage
            ? this.currentPage >= this.totalPage
            : rows.length < this.pageSize;

          // ⭐ 把本頁寫入快取 & 更新狀態
          this.tls23010Cache.setPage(this.queryKey, nextIndex, rows);
          this.tls23010Cache.setState(this.queryKey, {
            merged: this.data,
            currentPage: this.currentPage,
            totalCount : this.totalCount,
            totalPage  : this.totalPage,
          });

          this.restoreChildScrollTop(prevTop); // 還原視覺位置
        },
        error: () => { /* 可視需要提示 */ },
      });
  }

}

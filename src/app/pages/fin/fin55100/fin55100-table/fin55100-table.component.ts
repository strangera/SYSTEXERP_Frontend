import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

// 假設這裡定義了查詢請求的介面 (雖然在父元件 service 中，但為了型別參考保持結構)
export interface QueryFIN55100Request {
  DateFrom: string; // YYYY-MM-DD
  DateTo: string; // YYYY-MM-DD
  CmpDateFrom: string; // 比較期開始日期 YYYY-MM-DD (新增，假設為比較報表專用)
  CmpDateTo: string; // 比較期結束日期 YYYY-MM-DD (新增，假設為比較報表專用)
  // ... 其他欄位
}

export interface Fin55100Column {
  field: string;
  header: string;
  format?: (value: any, rowIndex?: number, rowData?: any) => any;
  // 新增 align 屬性
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-table-subheader-grouping',
  host: { 'table-edit-id': 'FIN55100' },
  templateUrl: 'fin55100-table.component.html',
  styleUrls: ['fin55100-table.component.scss'],
  standalone: true,
  imports: [TableModule, TagModule, NgFor, NgIf, NgClass],
})
// 實作 OnChanges 接口
export class TableSubheaderGroupingComponent implements OnInit, OnChanges {
  @Input() data: any[] = []; // 用來儲存查詢結果
  // 欄位定義改為在程式碼中初始化
  columns: Fin55100Column[] = [];
  @Input() dataKey: string | undefined; // 用來儲存查詢結果
  @Input() loading = false;
  @Input() footerData: any = {};

  // 接收 historyRequestBody
  @Input() historyRequestBody: any; // 使用假設的介面

  // 新增屬性：用於儲存分離出來的群組小計資料
  public groupedFooters: Record<string, any> = {};

  // 新增屬性：用於儲存過濾掉小計後的明細資料
  public detailData: any[] = [];

  constructor() { }

  ngOnInit() {
    this.initializeColumns(); // 初始化欄位 (會使用初始的 historyRequestBody: null)
    this.processData();
  }

  // 監聽 @Input() data 及動態標題的變化
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.processData();
    }
    // 當 historyRequestBody 變更時，重新初始化欄位
    if (changes['historyRequestBody']) {
      this.initializeColumns();
    }
  }

  // 核心邏輯：分離小計和明細資料 (保持不變)
  private processData(): void {
    this.groupedFooters = {};
    this.detailData = [];

    if (!this.data || this.data.length === 0) {
      return;
    }

    this.data.forEach(row => {
      const groupKey = row.LTYPE_NAME;
      // 判斷是否為小計行 (LTYPE_ID 不為空，但其餘 ID 欄位為空)
      if ((row.STYPE_ID === null || row.STYPE_ID === '') && (row.MTYPE_ID === null || row.MTYPE_ID === '') && (row.LTYPE_ID !== null && row.LTYPE_ID !== '')) {
        // 小計行：儲存到 groupedFooters，並以 LTYPE_NAME 作為 key
        this.groupedFooters[groupKey] = row;
      } else if (row.LTYPE_ID === null && row.MTYPE_ID === null && row.STYPE_ID === null) {
        // 總計行：由父元件的 footerData 處理，此處忽略
      } else {
        // 明細行：儲存到 detailData
        this.detailData.push(row);
      }
    });
  }

  /**
   * 將 YYYY-MM-DD 格式的日期轉換為「民國 YYY 年度 MM 月」所需的組成部分。
   * @param isoDate YYYY-MM-DD 格式的日期字串
   * @returns 包含 rocYear 和 month 的物件，如果轉換失敗則為 null
   */
  private toROCDateInfo(isoDate: string | null | undefined): { rocYear: string, month: string } | null {
    if (!isoDate) return null;
    try {
      // 使用 ISO 格式解析日期
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return null;

      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // ROC Year = Gregorian Year - 1911
      const rocYear = (year - 1911).toString(); // 不補零，讓範本可以根據需求顯示 3 或 2 位數
      const monthString = month.toString().padStart(2, '0');

      return { rocYear, month: monthString };
    } catch (e) {
      return null;
    }
  }

  /**
   * 根據 historyRequestBody 的日期參數動態產生欄位標題
   */
  private initializeColumns(): void {
    const request = this.historyRequestBody;

    // 預設標題
    let curPeriodHeader = '本期金額';
    let cmpPeriodHeader = '比較期金額';
    let curYTDHeader = '本期累計金額';
    let cmpYTDHeader = '比較期累計金額';

    if (request && request.DateFrom && request.DateTo) {
      const curFrom = this.toROCDateInfo(request.DateFrom);
      const curTo = this.toROCDateInfo(request.DateTo);

      if (curFrom && curTo) {
        // 本期金額：[年] 年度 [起月] 月 ~ [迄月] 月
        curPeriodHeader = `${curTo.rocYear} 年度 ${curFrom.month} 月 ~ ${curTo.month} 月`;
        // 本期累計金額：[年] 年度 01 月 ~ [迄月] 月
        curYTDHeader = `${curTo.rocYear} 年度 01 月 ~ ${curTo.month} 月`;
      }
    }

    if (request && request.CmpDateFrom && request.CmpDateTo) {
      const cmpFrom = this.toROCDateInfo(request.CmpDateFrom);
      const cmpTo = this.toROCDateInfo(request.CmpDateTo);

      if (cmpFrom && cmpTo) {
        // 比較期金額：[年] 年度 [起月] 月 ~ [迄月] 月
        cmpPeriodHeader = `${cmpTo.rocYear} 年度 ${cmpFrom.month} 月 ~ ${cmpTo.month} 月`;
        // 比較期累計金額：[年] 年度 01 月 ~ [迄月] 月
        cmpYTDHeader = `${cmpTo.rocYear} 年度 01 月 ~ ${cmpTo.month} 月`;
      }
    }

    // 重新定義 columns 陣列
    this.columns = [
      // 根據您的需求，只顯示科目名稱
      { field: 'STYPE_NAME', header: '科目名稱' },

      // 本期比較區間
      { field: 'Cur_Period_AMT', header: curPeriodHeader, format: formatAmount2, align: 'right' },
      { field: 'Cmp_Period_AMT', header: cmpPeriodHeader, format: formatAmount2, align: 'right' },
      { field: 'Diff_Period', header: '差異', format: formatAmount2, align: 'right' },
      { field: 'Rate_Period', header: '增減率 (%)', format: formatPercent2Decimals, align: 'right' },

      // 累計比較區間
      { field: 'Cur_YTD_AMT', header: curYTDHeader, format: formatAmount2, align: 'right' },
      { field: 'Cmp_YTD_AMT', header: cmpYTDHeader, format: formatAmount2, align: 'right' },
      { field: 'Diff_YTD', header: '差異', format: formatAmount2, align: 'right' },
      { field: 'Rate_YTD', header: '累計增減率 (%)', format: formatPercent2Decimals, align: 'right' } // 修正為較完整的標題
    ];
  }

  // 方法：在 groupfooter 模板中用來取得小計資料 (保持不變)
  getGroupFooterData(rowData: any): any {
    const groupKey = rowData.LTYPE_NAME;
    return this.groupedFooters[groupKey];
  }
}

// 格式化函式 (保持不變，且放在 component 類別外部作為共用函式)
const formatAmount2 = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') {
    return '';
  }
  const num = Number(val);
  if (isNaN(num)) {
    return String(val);
  }
  return num.toLocaleString();
};
export const formatPercent2Decimals = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') {
    return '';
  }
  const num = Number(val);
  if (isNaN(num)) {
    return String(val);
  }
  return num.toFixed(2);
};

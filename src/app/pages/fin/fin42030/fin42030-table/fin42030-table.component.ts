import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

// 假設這裡定義了查詢請求的介面 (雖然在父元件 service 中，但為了型別參考保持結構)
export interface QueryFIN42030Request {
  DateFrom: string; // YYYY-MM-DD
  DateTo: string; // YYYY-MM-DD
  CmpDateFrom: string; // 比較期開始日期 YYYY-MM-DD (新增，假設為比較報表專用)
  CmpDateTo: string; // 比較期結束日期 YYYY-MM-DD (新增，假設為比較報表專用)
  // ... 其他欄位
}

export interface Fin42030Column {
  field: string;
  header: string;
  format?: (value: any, rowIndex?: number, rowData?: any) => any;
  // 新增 align 屬性
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-table-subheader-report',
  host: { 'table-edit-id': 'FIN42030' },
  templateUrl: 'fin42030-table.component.html',
  styleUrls: ['fin42030-table.component.scss'],
  standalone: true,
  imports: [TableModule, TagModule, NgFor, NgIf, NgClass, CommonModule],
})
// 實作 OnChanges 接口
export class TableSubheaderComponent implements OnInit, OnChanges {
  @Input() data: any[] = []; // 用來儲存查詢結果
  // 欄位定義改為在程式碼中初始化
  columns: Fin42030Column[] = [];
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
  public hasSearched = false; // 是否已搜尋
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.hasSearched = true;
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
  private toROCDateInfo(isoDate: string | null | undefined): { rocYear: string, month: string, year: number } | null {
    if (!isoDate) return null;
    // 分割字串，避免 new Date() 的時區轉換問題
    const parts = isoDate.split('-');
    if (parts.length < 2) return null;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const rocYear = (year - 1911).toString();
    const monthString = month.toString().padStart(2, '0');

    return { rocYear, month: monthString, year };
  }

  /**
   * 根據 historyRequestBody 的日期參數動態產生欄位標題
   */
  private initializeColumns(): void {

    // 定義 columns 陣列 
    this.columns = [
      { field: 'subjectName', header: '科目名稱', align: 'left' },

      // 本期
      { field: 'currentAmount', header: '金額', format: formatAmount2, align: 'right' },
      { field: 'currentRatio', header: '佔比(%)', format: formatPercent2Decimals, align: 'right' },

      // 預算同期
      { field: 'budgetAmount', header: '金額', format: formatAmount2, align: 'right' },
      { field: 'budgetRatio', header: '佔比(%)', format: formatPercent2Decimals, align: 'right' },

      // 增減率
      { field: 'growthRate', header: '增減率(%)', format: formatPercent2Decimals, align: 'right' },

      // 本期累計
      { field: 'currentTotalAmount', header: '金額', format: formatAmount2, align: 'right' },
      { field: 'currentTotalRatio', header: '佔比(%)', format: formatPercent2Decimals, align: 'right' },

      // 預算累計
      { field: 'totalBudgetAmount', header: '金額', format: formatAmount2, align: 'right' },
      { field: 'totalBudgetRatio', header: '佔比(%)', format: formatPercent2Decimals, align: 'right' },

      // 增減率
      { field: 'totalGrowthRate', header: '增減率(%)', format: formatPercent2Decimals, align: 'right' }
    ];
  }

  // 定義一個陣列，列出所有需要加上上邊框的欄位名稱
  nullBorderFields: string[] = [
    'currentAmount',
    'currentRatio',
    'budgetAmount',
    'budgetRatio',
    'growthRate',
    'currentTotalAmount',
    'currentTotalRatio',
    'totalBudgetAmount',
    'totalBudgetRatio',
    'totalGrowthRate'
  ];

  // 方法：判斷是否需要在該欄位加上上邊框（當前行的所有 nullBorderFields 欄位值皆為 null，且當前欄位在 nullBorderFields 中）
  shouldShowTopBorder(rowData: any, field: string, rowIndex: number): boolean {
    if (rowIndex === 0) {
      return false;
    }

    const allNull = this.nullBorderFields.every(f => rowData?.[f] === null);
    return allNull && this.nullBorderFields.includes(field);
  }

  // 方法：判斷是否為小計行（subjectName 包含「合計」或「毛利」）
  isSummaryRow(rowData: any): boolean {
    const name = rowData?.subjectName ?? '';
    return name.includes('合計') || name.includes('毛利');
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

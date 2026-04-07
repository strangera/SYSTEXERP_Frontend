import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

// 假設這裡定義了查詢請求的介面 (雖然在父元件 service 中，但為了型別參考保持結構)
export interface QueryFIN42020Request {
  DateFrom: string; // YYYY-MM-DD
  DateTo: string; // YYYY-MM-DD
  CmpDateFrom: string; // 比較期開始日期 YYYY-MM-DD (新增，假設為比較報表專用)
  CmpDateTo: string; // 比較期結束日期 YYYY-MM-DD (新增，假設為比較報表專用)
  // ... 其他欄位
}

export interface Fin42020Column {
  field: string;
  header: string;
  format?: (value: any, rowIndex?: number, rowData?: any) => any;
  // 新增 align 屬性
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-table-subheader-report',
  host: { 'table-edit-id': 'FIN42020' },
  templateUrl: 'fin42020-table.component.html',
  styleUrls: ['fin42020-table.component.scss'],
  standalone: true,
  imports: [TableModule, TagModule, NgFor, NgIf, NgClass, CommonModule],
})
// 實作 OnChanges 接口
export class TableSubheaderComponent implements OnInit, OnChanges {
  @Input() data: any[] = []; // 用來儲存查詢結果
  // 欄位定義改為在程式碼中初始化
  columns: Fin42020Column[] = [];
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

    // 重新定義 columns 陣列 (欄位定義保持不變)
    this.columns = [
      { field: 'STYPE_NAME', header: '科目名稱', align: 'left' },

      // 本月
      { field: 'MONTH_CURRENT_AMOUNT', header: '金額', format: formatAmount2, align: 'right' },
      { field: 'MONTH_CURRENT_RATIO', header: '佔比(%)', format: formatPercent2Decimals, align: 'right' },
      { field: 'MONTH_LAST_AMOUNT', header: '金額', format: formatAmount2, align: 'right' },
      { field: 'MONTH_LAST_RATIO', header: '佔比(%)', format: formatPercent2Decimals, align: 'right' },
      { field: 'MONTH_GROWTH_RATE', header: '增減率(%)', format: formatPercent2Decimals, align: 'right' },
      { field: 'MONTH_BUDGET', header: '預算', format: formatAmount2, align: 'right' },
      { field: 'MONTH_BUDGET_RATE', header: '預算比增減率', format: formatPercent2Decimals, align: 'right' },

      // 累計
      { field: 'ACC_CURRENT_AMOUNT', header: '金額', format: formatAmount2, align: 'right' },
      { field: 'ACC_CURRENT_RATIO', header: '佔比(%)', format: formatPercent2Decimals, align: 'right' },
      { field: 'ACC_LAST_AMOUNT', header: '金額', format: formatAmount2, align: 'right' },
      { field: 'ACC_LAST_RATIO', header: '佔比(%)', format: formatPercent2Decimals, align: 'right' },
      { field: 'ACC_GROWTH_RATE', header: '增減率(%)', format: formatPercent2Decimals, align: 'right' },
      { field: 'ACC_BUDGET', header: '預算', format: formatAmount2, align: 'right' },
      { field: 'ACC_BUDGET_RATE', header: '預算比增減率', format: formatPercent2Decimals, align: 'right' },
    ];
  }

  // 定義一個陣列，列出所有需要加上上邊框的欄位名稱
  nullBorderFields: string[] = [
    'MONTH_CURRENT_AMOUNT',
    'MONTH_CURRENT_RATIO',
    'MONTH_LAST_AMOUNT',
    'MONTH_LAST_RATIO',
    'MONTH_GROWTH_RATE',
    'MONTH_BUDGET',
    'MONTH_BUDGET_RATE',
    'ACC_CURRENT_AMOUNT',
    'ACC_CURRENT_RATIO',
    'ACC_LAST_AMOUNT',
    'ACC_LAST_RATIO',
    'ACC_GROWTH_RATE',
    'ACC_BUDGET',
    'ACC_BUDGET_RATE'
  ];

  // 方法：判斷是否需要加上上邊框（當欄位名稱在 nullBorderFields 中且該欄位值為 null 時）
  shouldShowTopBorder(rowData: any, field: string): boolean {
    const allNull = this.nullBorderFields.every(f => rowData?.[f] === null);
    return allNull && this.nullBorderFields.includes(field);
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

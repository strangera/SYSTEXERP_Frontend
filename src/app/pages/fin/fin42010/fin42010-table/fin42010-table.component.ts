import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

// 假設這裡定義了查詢請求的介面 (雖然在父元件 service 中，但為了型別參考保持結構)
export interface QueryFIN42010Request {
  DateFrom: string; // YYYY-MM-DD
  DateTo: string; // YYYY-MM-DD
  CmpDateFrom: string; // 比較期開始日期 YYYY-MM-DD (新增，假設為比較報表專用)
  CmpDateTo: string; // 比較期結束日期 YYYY-MM-DD (新增，假設為比較報表專用)
  // ... 其他欄位
}

export interface Fin42010Column {
  field: string;
  header: string;
  format?: (value: any, rowIndex?: number, rowData?: any) => any;
  // 新增 align 屬性
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-table-subheader-report',
  host: { 'table-edit-id': 'FIN42010' },
  templateUrl: 'fin42010-table.component.html',
  styleUrls: ['fin42010-table.component.scss'],
  standalone: true,
  imports: [TableModule, TagModule, NgFor, NgIf, NgClass, CommonModule],
})
// 實作 OnChanges 接口
export class TableSubheaderComponent implements OnInit, OnChanges {
  @Input() data: any[] = []; // 用來儲存查詢結果
  // 欄位定義改為在程式碼中初始化
  columns: Fin42010Column[] = [];
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

  private initializeColumns(): void {

    // 重新定義 columns 陣列 (欄位定義保持不變)
    this.columns = [
      { field: 'subjectCode', header: '科目代號', align: 'left' },
      { field: 'subjectName', header: '科目名稱', align: 'left' },
      { field: 'january', header: '1月', format: formatAmount2, align: 'right' },
      { field: 'february', header: '2月', format: formatAmount2, align: 'right' },
      { field: 'march', header: '3月', format: formatAmount2, align: 'right' },
      { field: 'april', header: '4月', format: formatAmount2, align: 'right' },
      { field: 'may', header: '5月', format: formatAmount2, align: 'right' },
      { field: 'june', header: '6月', format: formatAmount2, align: 'right' },
      { field: 'july', header: '7月', format: formatAmount2, align: 'right' },
      { field: 'august', header: '8月', format: formatAmount2, align: 'right' },
      { field: 'september', header: '9月', format: formatAmount2, align: 'right' },
      { field: 'october', header: '10月', format: formatAmount2, align: 'right' },
      { field: 'november', header: '11月', format: formatAmount2, align: 'right' },
      { field: 'december', header: '12月', format: formatAmount2, align: 'right' },
      { field: 'totalBudget', header: '預算總金額', format: formatAmount2, align: 'right' },
    ];
  }

  // 定義需要加粗底線的科目名稱
  borderRows = [
    '營業成本',
    '營業費用',
    '營業外收入及支出',
    '所得稅費用'
  ];

  // 判斷是否為需要加上底線的科目名稱
  isTargetSubject(subjectName: string): boolean {
    return this.borderRows.includes(subjectName);
  }

  // 判斷科目代號是否為空
  isEmptySubjectCode(subjectCode: any): boolean {
    return subjectCode === null || subjectCode === undefined || subjectCode === '';
  }

  // 判斷是否應該顯示主要底線（2px 實線）
  shouldShowMainBottomBorder(rowData: any, field: string): boolean {
    if (field === 'subjectCode' || field === 'subjectName') {
      return false;
    }

    return (
      this.isTargetSubject(rowData.subjectName) &&
      this.isEmptySubjectCode(rowData.subjectCode)
    );
  }

  // 判斷是否應該顯示次要底線（1px 實線）
  shouldShowLightBottomBorder(rowIndex: number, field: string): boolean {
    if (field === 'subjectCode' || field === 'subjectName') {
      return false;
    }

    const prevRow = this.data[rowIndex - 1];
    if (!prevRow) {
      return false;
    }

    return (
      this.isTargetSubject(prevRow.subjectName) &&
      this.isEmptySubjectCode(prevRow.subjectCode)
    );
  }

  // 方法：在 template 中用來取得底線樣式
  getBottomBorder(rowIndex: number, rowData: any, field: string): string {
    if (this.shouldShowMainBottomBorder(rowData, field)) {
      return '2px solid #3b82f6';
    }

    if (this.shouldShowLightBottomBorder(rowIndex, field)) {
      return '1px solid #93c5fd';
    }

    return '';
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

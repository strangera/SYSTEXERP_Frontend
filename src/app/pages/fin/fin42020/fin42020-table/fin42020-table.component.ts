import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TableModule } from 'primeng/table';

export interface Fin42020Column {
  field: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  format?: (value: unknown) => string;
}

@Component({
  selector: 'app-table-subheader-report',
  host: { 'table-edit-id': 'FIN42020' },
  templateUrl: 'fin42020-table.component.html',
  styleUrls: ['fin42020-table.component.scss'],
  standalone: true,
  imports: [CommonModule, TableModule],
})
export class TableSubheaderComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];

  public columns: Fin42020Column[] = [];
  public detailData: any[] = []; // 明細資料
  public hasSearched = false; // 是否已搜尋

  // 需要加線的欄位
  private readonly lineStyleFields: string[] = [
    'CurrentAmount',
    'CurrentRatio',
    'LastYearAmount',
    'LastYearRatio',
    'GrowthRate',
    'BudgetAmount',
    'BudgetDiffAmount',
    'BudgetGrowthRate',
    'CurrentAccumAmount',
    'CurrentAccumRatio',
    'LastYearAccumAmount',
    'LastYearAccumRatio',
    'AccumGrowthRate',
    'BudgetAccumAmount',
    'BudgetAccumGrowthRate',
  ];

  ngOnInit(): void {
    this.initializeColumns();
    this.setTableData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.hasSearched = true;
      this.setTableData();
    }
  }

  private initializeColumns(): void {
    this.columns = [
      { field: 'AccountCode', header: '科目代號', align: 'left' },
      { field: 'AccountName', header: '科目名稱', align: 'left' },

      // 本月
      { field: 'CurrentAmount', header: '金額', format: formatAmount, align: 'right' },
      { field: 'CurrentRatio', header: '佔比(%)', format: formatPercent, align: 'right' },
      { field: 'LastYearAmount', header: '金額', format: formatAmount, align: 'right' },
      { field: 'LastYearRatio', header: '佔比(%)', format: formatPercent, align: 'right' },
      { field: 'GrowthRate', header: '增減率(%)', format: formatPercent, align: 'right' },
      { field: 'BudgetAmount', header: '預算', format: formatAmount, align: 'right' },
      { field: 'BudgetDiffAmount', header: '預算與本期差異', format: formatAmount, align: 'right' },
      { field: 'BudgetGrowthRate', header: '預算比增減率', format: formatPercent, align: 'right' },

      // 累計
      { field: 'CurrentAccumAmount', header: '金額', format: formatAmount, align: 'right' },
      { field: 'CurrentAccumRatio', header: '佔比(%)', format: formatPercent, align: 'right' },
      { field: 'LastYearAccumAmount', header: '金額', format: formatAmount, align: 'right' },
      { field: 'LastYearAccumRatio', header: '佔比(%)', format: formatPercent, align: 'right' },
      { field: 'AccumGrowthRate', header: '增減率(%)', format: formatPercent, align: 'right' },
      { field: 'BudgetAccumAmount', header: '預算', format: formatAmount, align: 'right' },
      { field: 'BudgetAccumGrowthRate', header: '預算比增減率', format: formatPercent, align: 'right' },
    ];
  }

  /**
 * 將父元件傳進來的 data 指定給表格實際顯示的資料來源。
 *
 * 目前沒有另外拆分 group footer 或 footer，
 * 所以直接讓 detailData 等於 data。
 */
  private setTableData(): void {
    this.detailData = this.data ?? [];
  }

  /**
 * 判斷目前這一列是否為小計 / 合計列。
 */
  // TOTAL：通常代表合計列
  // CALC ：通常代表計算列，例如營業淨利、稅前損益等
  public isSummaryRow(rowData: any): boolean {
    const rowType = rowData?.RowType;

    return (
      rowType === 'TOTAL' ||
      rowType === 'CALC' ||
      rowType === 2 ||
      rowType === 3
    );
  }

  /**
 * 取得儲存格的線條樣式。
 */
  // 主要用途：
  // 1. 一般明細列不加線
  // 2. AccountName 欄位不加線
  // 3. 只有金額 / 比率欄位才加線
  // 4. TOTAL / CALC 列的數值欄位上方加雙線
  // 5. 如果下一列是 HEADER，或目前是最後一列，才補底部單線
  public getCellLineStyle(
    rowData: any,
    field: string,
    rowIndex: number
  ): Record<string, string> {
    // 建立一個樣式物件，最後會回傳給 [ngStyle]
    const style: Record<string, string> = {};

    // 科目名稱欄位不加線
    if (field === 'AccountName') {
      return style;
    }
    // 如果不是指定要畫線的欄位，也不加線
    if (!this.lineStyleFields.includes(field)) {
      return style;
    }
    // 如果目前這列不是 TOTAL / CALC，也不加線
    if (!this.isSummaryRow(rowData)) {
      return style;
    }

    // 取得目前表格實際顯示的資料
    const dataList = this.detailData ?? [];

    // 判斷目前這列是不是最後一列
    const isLastRow = rowIndex === dataList.length - 1;

    // 取得下一列資料
    // 如果目前已經是最後一列，就沒有下一列
    const nextRow = isLastRow ? null : dataList[rowIndex + 1];

    // 取得下一列的 RowType
    const nextRowType = nextRow?.RowType;

    // 判斷下一列是否為 HEADER
    const isNextHeader =
      nextRowType === 'HEADER' ||
      nextRowType === 0;

    // TOTAL / CALC 列的數值欄位，上方加雙線
    style['border-top'] = '3px double #3b82f6';

    // 只有在以下情況才補底部單線：
    // 1. 目前是最後一列
    // 2. 下一列是 HEADER
    // 如果下一列也是 TOTAL / CALC，就不補底線，
    if (isLastRow || isNextHeader) {
      style['border-bottom'] = '1px solid #93c5fd';
    }

    return style;
  }
}

/**
 * 格式化金額。
 *
 * 功能：
 * 1. null / undefined / 空字串 顯示空白
 * 2. 可以轉成數字時，加上千分位
 * 3. 不能轉成數字時，直接顯示原值
 */
const formatAmount = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return String(value);
  }

  return num.toLocaleString();
};

/**
 * 格式化百分比。
 *
 * 功能：
 * 1. null / undefined / 空字串 顯示空白
 * 2. 可以轉成數字時，顯示到小數點第 2 位
 * 3. 不能轉成數字時，直接顯示原值
 */
const formatPercent = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const num = Number(value);

  if (Number.isNaN(num)) {
    return String(value);
  }

  return num.toFixed(2);
};
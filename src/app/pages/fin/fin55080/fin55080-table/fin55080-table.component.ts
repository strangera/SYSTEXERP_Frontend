import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'; // 增加 OnChanges, SimpleChanges
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

export interface Finfin55080Column {
  field: string;
  header: string;
  format?: (value: any, rowIndex?: number, rowData?: any) => any;
  // 新增 align 屬性
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-table-subheader-grouping',
  host: { 'table-edit-id': 'FIN55080' },
  templateUrl: 'fin55080-table.component.html',
  styleUrls: ['fin55080-table.component.scss'],
  standalone: true,
  imports: [TableModule, TagModule, NgFor, NgIf, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault],
})
// 實作 OnChanges 接口
export class TableSubheaderGroupingComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];             // 用來儲存查詢結果
  columns: Finfin55080Column[] = [
    // { field: 'LTYPE_ID', header: '大類編號' },
    // { field: 'LTYPE_NAME', header: '大類中文名稱' },
    // { field: 'MTYPE_ID', header: '類別編號' },
    // { field: 'MTYPE_NAME', header: '類別名稱' },
    // { field: 'STYPE_ID', header: '科目代號' },
    { field: 'STYPE_NAME', header: '科目名稱' },
    // { field: 'ACC_DC', header: '借貸方 D/C' },
    { field: 'STYPE_AMT', header: '本期交易金額', format: formatAmount2, align: 'right' },
    // 注意: Cur_LTYPE_SUM/YTD_LTYPE_SUM 在明細行會是空字串，在小計行會是數字或 null
    { field: 'SUM_LTYPE_AMT', header: '合計', format: formatAmount2, align: 'right' },
    { field: 'Percent_LTYPE', header: '百分比 (%)', format: formatPercent2Decimals, align: 'right' },
  ];
  @Input() dataKey: string | undefined;                  // 用來儲存查詢結果
  @Input() loading = false;
  @Input() footerData: any = {};

  // 新增屬性：用於儲存分離出來的群組小計資料
  public groupedFooters: Record<string, any> = {};

  // 新增屬性：用於儲存過濾掉小計後的明細資料
  public detailData: any[] = [];

  constructor() { }

  ngOnInit() {
    this.processData();
  }

  // 監聽 @Input() data 的變化，以便重新處理資料
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.processData();
    }
  }

  // 核心邏輯：分離小計和明細資料
  private processData(): void {
    this.groupedFooters = {};
    this.detailData = [];

    if (!this.data || this.data.length === 0) {
      return;
    }

    // 處理資料：根據 'LTYPE_NAME' 分組，並檢查 'STYPE_ID' 是否為空
    this.data.forEach(row => {
      // 假設 LTYPE_NAME 是群組的 key
      const groupKey = row.LTYPE_NAME;

      // 判斷是否為小計行 (STYPE_ID 為空)
      // 這裡假設 STYPE_ID 可能是 null, undefined, 或空字串 ''。
      if (row.STYPE_ID === null && row.MTYPE_ID === null && row.MTYPE_NAME === null) {
        // 小計行：儲存到 groupedFooters，並以 LTYPE_NAME 作為 key
        this.groupedFooters[groupKey] = row;
      } else {
        // 明細行：儲存到 detailData (p-table 將使用這個資料源)
        this.detailData.push(row);
      }
    });
  }

  // 方法：在 groupfooter 模板中用來取得小計資料
  getGroupFooterData(rowData: any): any {
    // 取得當前群組 (rowData) 的 LTYPE_NAME 作為 key
    const groupKey = rowData.LTYPE_NAME;
    return this.groupedFooters[groupKey];
  }
}
const formatAmount2 = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') return '';

  const num = Number(val);
  if (isNaN(num)) return String(val);

  // 負數處理：(1,234,567)
  if (num < 0) {
    return `(${Math.abs(num).toLocaleString()})`;
  }

  return num.toLocaleString();
};

const formatPercent2Decimals = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') return '';

  const num = Number(val);
  if (isNaN(num)) return String(val);

  // 負數處理：(25.50) 並確保兩位小數，不帶 %
  if (num < 0) {
    return `(${Math.abs(num).toFixed(2)})`;
  }

  return num.toFixed(2);
};

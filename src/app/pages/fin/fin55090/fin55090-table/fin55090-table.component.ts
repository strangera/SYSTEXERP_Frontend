import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'; // 增加 OnChanges, SimpleChanges
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

export interface Fin55090Column {
  field: string;
  header: string;
  format?: (value: any, rowIndex?: number, rowData?: any) => any;
  // 新增 align 屬性
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-table-subheader-grouping',
  host: { 'table-edit-id': 'FIN55090' },
  templateUrl: 'fin55090-table.component.html',
  styleUrls: ['fin55090-table.component.scss'],
  standalone: true,
  imports: [TableModule, TagModule, NgFor, NgIf, NgClass],
})
// 實作 OnChanges 接口
export class TableSubheaderGroupingComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];             // 用來儲存查詢結果
  columns: Fin55090Column[] = [
    // { field: 'LTYPE_ID', header: '大類編號' },
    // { field: 'LTYPE_NAME', header: '大類中文名稱' },
    // { field: 'MTYPE_ID', header: '類別編號' },
    // { field: 'MTYPE_NAME', header: '類別名稱' },
    // { field: 'STYPE_ID', header: '科目代號' },
    { field: 'STYPE_NAME', header: '科目名稱' },
    // { field: 'ACC_DC', header: '借貸方 D/C' },
    { field: 'Cur_AMT', header: '本期交易金額', format: formatAmount2, align: 'right' },
    // 注意: Cur_LTYPE_SUM/YTD_LTYPE_SUM 在明細行會是空字串，在小計行會是數字或 null
    { field: 'Cur_LTYPE_SUM', header: '合計', format: formatAmount2, align: 'right' },
    { field: 'Cur_PERCENT', header: '百分比 (%)', format: formatPercent2Decimals, align: 'right' },
    { field: 'YTD_AMT', header: '累計交易金額', format: formatAmount2, align: 'right' },
    { field: 'YTD_LTYPE_SUM', header: '累計合計', format: formatAmount2, align: 'right' },
    { field: 'YTD_PERCENT', header: '累計百分比 (%)', format: formatPercent2Decimals, align: 'right' }
  ];
  @Input() dataKey: string | undefined;                  // 用來儲存查詢結果
  @Input() loading = false;
  @Input() footerData: any = {};

  // 新增屬性：用於儲存分離出來的群組小計資料
  public groupedFooters: Record<string, any> = {};

  // 新增屬性：用於儲存過濾掉小計後的明細資料
  public detailData: any[] = [];

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

    // 定義插入邏輯：當 Key 區塊結束時，要顯示 Value 區塊的小計
    const extraMapping: Record<string, string> = {
      '營業成本': '營業毛利',
      '營業費用': '營業損益',
      '營業外收入及支出': '稅前損益'
    };

    if (!this.data || this.data.length === 0) return;

    // 1. 先把所有的小計行存入 map (方便快速查找)
    const allFooters: Record<string, any> = {};
    this.data.forEach(row => {
      if (row.STYPE_ID === null && row.MTYPE_ID === null) {
        allFooters[row.LTYPE_NAME] = row;
      }
    });

    // 2. 建立主要的 groupedFooters
    this.data.forEach(row => {
      const groupKey = row.LTYPE_NAME;

      // 判斷是否為明細行
      if (row.STYPE_ID !== null || row.MTYPE_ID !== null) {
        this.detailData.push(row);
      } else {
        // 這是小計行，存入基礎 Map
        // 邏輯：如果這個項目本身是「營業毛利」，我們不讓它單獨成為一個區塊的 footer
        // 因為它會被附屬在「營業成本」下方。
        const isExtraItem = Object.values(extraMapping).includes(groupKey);
        if (!isExtraItem) {
          // 正常的區塊小計
          const footerInfo = { main: row, extra: null };

          // 檢查是否有要掛載的「額外項」
          const targetExtraName = extraMapping[groupKey];
          if (targetExtraName && allFooters[targetExtraName]) {
            footerInfo.extra = allFooters[targetExtraName];
          }

          this.groupedFooters[groupKey] = footerInfo;
        }
      }
    });
  }

  // 方法：在 groupfooter 模板中用來取得小計資料
  getGroupFooterData(rowData: any): any {
    const groupKey = rowData.LTYPE_NAME;
    return this.groupedFooters[groupKey]; // 回傳包含 { main, extra } 的物件
  }
}
// 修改後的金額格式化
const formatAmount2 = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') {
    return '';
  }

  const num = Number(val);
  if (isNaN(num)) {
    return String(val);
  }

  // 處理負數：轉正值後加括號
  if (num < 0) {
    return `(${Math.abs(num).toLocaleString()})`;
  }

  return num.toLocaleString();
};

// 修改後的百分比格式化 (同樣建議增加負數括號)
const formatPercent2Decimals = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') {
    return '';
  }

  const num = Number(val);
  if (isNaN(num)) {
    return String(val);
  }

  const formatted = num.toFixed(2);

  // 如果百分比也需要括號：
  if (num < 0) {
    return `(${Math.abs(num).toFixed(2)})`;
  }

  return formatted;
};

import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'; // 增加 OnChanges, SimpleChanges
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { NavigationHelperService } from 'src/app/reports/services/navigation-helper.service';

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
export class TableSubheaderGroupingComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  columns: Finfin55080Column[] = [
    { field: 'STYPE_NAME', header: '科目名稱' },
    { field: 'STYPE_AMT', header: '本期交易金額', format: formatAmount2, align: 'right' },
    { field: 'SUM_LTYPE_AMT', header: '合計', format: formatAmount2, align: 'right' },
    { field: 'Percent_LTYPE', header: '百分比 (%)', format: formatPercent2Decimals, align: 'right' },
  ];
  @Input() dataKey: string | undefined;                  // 用來儲存查詢結果
  @Input() loading = false;
  @Input() footerData: any = {};
  @Input() historyRequestBody: any;
  // 新增屬性：用於儲存分離出來的群組小計資料
  public groupedFooters: Record<string, any[]> = {};
  // 新增屬性：用於儲存過濾掉小計後的明細資料
  public detailData: any[] = [];
  constructor() { } // 注入 Router
  ngOnInit() {
    this.processData();
  }

  // 監聽 @Input() data 的變化，以便重新處理資料
  public hasSearched = false; // 是否已搜尋
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.hasSearched = true;
      this.processData();
    }
  }

  // 核心邏輯：分離小計和明細資料
  private processData(): void {
    this.groupedFooters = {};
    this.detailData = [];

    if (!this.data || this.data.length === 0) return;

    this.data.forEach(row => {
      const groupKey = row.LTYPE_ID; // 建議用 ID 當 key 比較保險

      // 判斷是否為合計行 (STYPE_ID 為空)
      if (row.STYPE_ID === null && row.MTYPE_ID === null && row.MTYPE_NAME === null) {
        if (!this.groupedFooters[groupKey]) {
          this.groupedFooters[groupKey] = [];
        }
        this.groupedFooters[groupKey].push(row); // 用 push 的，不會被覆蓋
      } else {
        this.detailData.push(row);
      }
    });
  }

  // 方法：在 groupfooter 模板中用來取得小計資料
  getGroupFooterData(rowData: any): any[] {
    const groupKey = rowData.LTYPE_ID;
    return this.groupedFooters[groupKey] || [];
  }
  // 新版注入方式navHelper
  private readonly navHelper = inject(NavigationHelperService);
  onNameClick(rowData: any) {
    if (!rowData.STYPE_ID) return;
    this.navHelper.openInNewTab('/reports/fin/fin55080', {
      AccNo: rowData.STYPE_ID,
      DateFrom: this.historyRequestBody?.DateFrom,
      DateTo: this.historyRequestBody?.DateTo,
      OrgId: this.historyRequestBody?.OrgId
    });
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

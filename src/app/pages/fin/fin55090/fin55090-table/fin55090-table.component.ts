import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { NavigationHelperService } from 'src/app/reports/services/navigation-helper.service';

export interface Fin55090Column {
  field: string;
  header: string;
  format?: (value: any, rowIndex?: number, rowData?: any) => any;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-table-subheader-grouping',
  host: { 'table-edit-id': 'FIN55090' },
  templateUrl: 'fin55090-table.component.html',
  styleUrls: ['fin55090-table.component.scss'],
  standalone: true,
  imports: [TableModule, TagModule, NgFor, NgIf, NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault],
})
export class TableSubheaderGroupingComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  columns: Fin55090Column[] = [
    { field: 'STYPE_NAME', header: '科目名稱' },
    { field: 'Cur_AMT', header: '本期交易金額', format: formatAmount2, align: 'right' },
    { field: 'Cur_LTYPE_SUM', header: '合計', format: formatAmount2, align: 'right' },
    { field: 'Cur_PERCENT', header: '百分比 (%)', format: formatPercent2Decimals, align: 'right' },
    { field: 'YTD_AMT', header: '累計交易金額', format: formatAmount2, align: 'right' },
    { field: 'YTD_LTYPE_SUM', header: '累計合計', format: formatAmount2, align: 'right' },
    { field: 'YTD_PERCENT', header: '累計百分比 (%)', format: formatPercent2Decimals, align: 'right' }
  ];

  @Input() dataKey: string | undefined;
  @Input() loading = false;
  @Input() footerData: any = {};
  @Input() historyRequestBody: any; // 新增：用於接收外層傳入的查詢條件

  public groupedFooters: Record<string, any> = {};
  public detailData: any[] = [];
  public hasSearched = false;

  // 注入導頁 Helper
  private readonly navHelper = inject(NavigationHelperService);

  ngOnInit() {
    this.processData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.hasSearched = true;
      this.processData();
    }
  }

  private processData(): void {
    this.groupedFooters = {};
    this.detailData = [];
    const extraMapping: Record<string, string> = {
      '營業成本': '營業毛利',
      '營業費用': '營業損益',
      '營業外收入及支出': '稅前損益'
    };

    if (!this.data || this.data.length === 0) return;

    const allFooters: Record<string, any> = {};
    this.data.forEach(row => {
      if (row.STYPE_ID === null && row.MTYPE_ID === null) {
        allFooters[row.LTYPE_NAME] = row;
      }
    });

    this.data.forEach(row => {
      const groupKey = row.LTYPE_NAME;
      if (row.STYPE_ID !== null || row.MTYPE_ID !== null) {
        this.detailData.push(row);
      } else {
        const isExtraItem = Object.values(extraMapping).includes(groupKey);
        if (!isExtraItem) {
          const footerInfo = { main: row, extra: null };
          const targetExtraName = extraMapping[groupKey];
          if (targetExtraName && allFooters[targetExtraName]) {
            footerInfo.extra = allFooters[targetExtraName];
          }
          this.groupedFooters[groupKey] = footerInfo;
        }
      }
    });
  }

  getGroupFooterData(rowData: any): any {
    const groupKey = rowData.LTYPE_NAME;
    return this.groupedFooters[groupKey];
  }

  // 新增方法：點擊會計科目名稱跳轉
  onNameClick(rowData: any) {
    if (!rowData.STYPE_ID) return;
    this.navHelper.openInNewTab('/reports/fin/fin55080', {
      AccNo: rowData.STYPE_ID,
      DateFrom: this.historyRequestBody?.DateFrom,
      DateTo: this.historyRequestBody?.DateTo,
      OrgId: this.historyRequestBody?.OrgList?.join(',')
    });
  }
}

const formatAmount2 = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') return '';
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  if (num < 0) return `(${Math.abs(num).toLocaleString()})`;
  return num.toLocaleString();
};

const formatPercent2Decimals = (val: number | string | null | undefined): string => {
  if (val === null || val === undefined || val === '') return '';
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  if (num < 0) return `(${Math.abs(num).toFixed(2)})`;
  return num.toFixed(2);
};

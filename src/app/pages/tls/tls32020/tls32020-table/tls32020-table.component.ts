/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableCaptionComponent } from '@others/component/table/table-caption/table-caption.component';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Observable } from 'rxjs';
import { ColumnGroup, ReportColumn } from './tls32020-report-table.model';
import { TableReportUtilityService } from './tls32020-table-utility.service';

@Component({
  selector: 'app-table-report',
  standalone: true,
  imports: [SkeletonModule, TableModule, CommonModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule, TableCaptionComponent],
  templateUrl: './tls32020-table.component.html',
  styleUrls: ['./tls32020-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableReportComponent implements OnChanges {
  @ViewChild('dt') public dt!: Table;
  @Input() lastQueryBody?: any;       // 用來儲存上一次的查詢條件
  @Input({ required: true }) totalRecords = 0;        // 用來儲存總筆數
  @Input({ required: true }) data: any[] = [];        // 用來儲存查詢結果
  @Input({ required: true }) columns: ReportColumn[] = [];        // 用來儲存查詢結果
  @Input() queryFunction?: (body: any) => Observable<any>; // 用來儲存查詢函數
  virtualData: any = [];
  @Input() lazy = true;
  @Input() dataKey: string | undefined;         // 用來儲存查詢結果
  selectedColumns: ReportColumn[] = [];     // 用來儲存查詢結果
  // tableKey預設給路由名稱
  @Input() loading = false;
  // 欄位群組
  @Input() columnGroup?: ColumnGroup[];           // table 群組欄位 (第二層)
  @Input() columnTopGroup?: ColumnGroup[];        // table 最外層群組欄位 (第一層，例如：比較期/基準期/差異)
  // 管理 欄位
  @Input() footerData: any;     // (總計)頁尾資料
  @Input() groupRowsBy?: string;    // (小計)群組欄位
  groupTotals: Record<string, Record<string, number>> = {}; // 用於儲存每個群組的總計
  @Input() subTotalData: any;    // (小計)頁尾資料
  constructor(
    public readonly tableUtility: TableReportUtilityService,
    private readonly cdr: ChangeDetectorRef
  ) { }
  public hasSearched = false; // 是否已搜尋
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      if (this.lastQueryBody) {
        this.hasSearched = true;
      }
      this.virtualData = [];
      this.groupTotals = {};
      this.updateGroupTotals(this.data);
      if (this.data.length !== 0) {
        if (this.dt) { this.dt.virtualScroll = false; }
        this.cdr.detectChanges();
        if (this.data.length < (this.lastQueryBody?.pageSize || 30)) {
          this.virtualData = this.data;
          this.dt.virtualScroll = false;
          this.dt.scrollHeight = '450px';
        } else {
          this.dt.virtualScroll = true;
          this.dt.scrollHeight = '450px';
          this.virtualData = Array.from({ length: this.data.length });
          this.cdr.detectChanges();
          this.virtualData = this.data;
        }
      }
    }
  }
  trackByFn(index: number, item: any) {
    return this.dataKey && item?.[this.dataKey] || index;
  }
  getGroupHeader(groupField: string): string {
    return this.columnGroup?.find(g => g.field === groupField)?.header ?? groupField;
  }
  getTopGroupHeader(topGroupField: string): string {
    return this.columnTopGroup?.find(g => g.field === topGroupField)?.header ?? topGroupField;
  }
  hasSubtotalColumns(): boolean {
    return this.columns.some(col => col.isSubTotal && this.groupRowsBy);
  }
  isGroupLastRow(rowData: any, rowIndex: number): boolean {
    if (!this.groupRowsBy || !this.data || rowIndex === this.data.length - 1) {
      return true; // 如果沒有分組或已經是最後一筆，則視為群組結尾。
    }
    return this.tableUtility.isGroupLastRow(rowData, rowIndex, this.groupRowsBy, this.data);
  }
  getGroupSubtotal(rowData: any, col: ReportColumn): any {
    if (!this.groupRowsBy || !col.isSubTotal) {
      return '';
    }

    // 獲取用於分組的原始值
    const rawGroupValue = rowData[this.groupRowsBy];

    // 獲取用於分組的欄位定義
    const groupColumn = this.columns.find(c => c.field === this.groupRowsBy);
    const useFormatterForGroupKey = groupColumn && groupColumn.format;

    let matchKey: string;

    // ** 1. 生成用於匹配的格式化群組鍵 **
    if (useFormatterForGroupKey) {
      // 使用欄位定義中的 format 函式來產生匹配鍵
      matchKey = String(groupColumn!.format!(rawGroupValue) ?? '').trim() || 'UNKNOWN_GROUP';
    } else {
      // 退回到安全轉換
      matchKey = String(rawGroupValue ?? '').trim() || 'UNKNOWN_GROUP';
    }

    // ** 2. 優先查找外部傳入的 subTotalData **
    if (this.subTotalData && this.subTotalData.length > 0 && this.groupRowsBy) {
      // 假設 subTotalData 中的分組欄位 (item[this.groupRowsBy]) 也是原始值
      // 為了確保匹配，我們需要對 subTotalData 中的分組欄位進行相同的格式化
      const subtotalRow = this.subTotalData.find((item: any) => {
        const itemRawValue = item[this.groupRowsBy!];
        let itemMatchKey: string;

        if (useFormatterForGroupKey) {
          itemMatchKey = String(groupColumn!.format!(itemRawValue) ?? '').trim() || 'UNKNOWN_GROUP';
        } else {
          itemMatchKey = String(itemRawValue ?? '').trim() || 'UNKNOWN_GROUP';
        }
        // 使用格式化後的鍵進行比對
        return itemMatchKey === matchKey;
      });

      if (subtotalRow) {
        const subtotal = subtotalRow[col.field] ?? 0;
        // 對小計值應用格式化
        return col.format ? col.format(subtotal) : subtotal;
      }
    }

    // ** 3. 回退到前端計算的 groupTotals **
    const total = this.groupTotals[matchKey]?.[col.field] ?? 0;
    // 對小計值應用格式化
    return col.format ? col.format(total) : total;
  }
  updateGroupTotals(newData: any[]): void {
    if (!this.groupRowsBy || !this.columns.some(col => col.isSubTotal)) {
      return;
    }

    // 1. 找出作為分組依據的欄位定義
    const groupColumn = this.columns.find(col => col.field === this.groupRowsBy);
    // 檢查分組欄位是否存在且具有 format 函式
    const useFormatterForGroupKey = groupColumn && groupColumn.format;

    newData.forEach(row => {
      const rawValue = row[this.groupRowsBy!];
      let groupKey: string;

      if (useFormatterForGroupKey) {
        // 【已修正】使用欄位定義中的 format 函式來產生分組鍵
        groupKey = String(groupColumn!.format!(rawValue) ?? '').trim() || 'UNKNOWN_GROUP';
      } else {
        // 【已修正】如果沒有 format 函式或找不到欄位定義，退回到安全轉換
        groupKey = String(rawValue ?? '').trim() || 'UNKNOWN_GROUP';
      }

      // 如果 groupKey 為 'UNKNOWN_GROUP' 且原始值為 undefined/null，可以選擇跳過
      if (groupKey === 'UNKNOWN_GROUP' && (rawValue === undefined || rawValue === null)) {
        return;
      }

      // 初始化該群組的總計物件
      if (!this.groupTotals[groupKey]) {
        this.groupTotals[groupKey] = {};
      }

      // 進行增量加總
      this.columns.forEach(col => {
        if (col.isSubTotal) {
          const field = col.field;
          // 確保值是數字，如果不是則為 0
          const value = Number(row[field]) || 0;

          // 增量加總
          this.groupTotals[groupKey][field] = (this.groupTotals[groupKey][field] || 0) + value;
        }
      });
    });
  }
}

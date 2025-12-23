import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FIN55120DetailItem } from '@service/api/fin/fin55120.service';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableColumnReorderEvent, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Fin55120TableReportUtilityService } from './fin55120-table-report-utility.service';
import { ReportColumn } from './fin55120-table-report.model';

@Component({
  selector: 'app-table-report',
  standalone: true,
  imports: [SkeletonModule, TableModule, CommonModule, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule],
  templateUrl: './fin55120-table-report.component.html',
  styleUrls: ['./fin55120-table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Fin55120TableReportComponent implements OnChanges {
  @ViewChild('dt') public dt!: Table;
  @Input({ required: true }) totalRecords = 0;        // 用來儲存總筆數
  @Input({ required: true }) data: FIN55120DetailItem[] = [];        // 用來儲存查詢結果
  @Input() subData: FIN55120DetailItem[] = [];
  @Input({ required: true }) columns: ReportColumn[] = [];        // 用來儲存查詢結果
  @Input() dataKey: string | undefined;         // 用來儲存查詢結果
  // tableKey預設給路由名稱
  @Input() loading = false;
  public _loading = false;
  @Output() dataChange = new EventEmitter<FIN55120DetailItem[]>();  // 用來儲存查詢結果
  // 管理 欄位
  @Input() footerData: any;     // (總計)頁尾資料
  @Input() groupRowsBy?: string;    // (小計)群組欄位
  groupTotals: Record<string, Record<string, number>> = {}; // 用於儲存每個群組的總計
  @Input() subTotalData: any;    // (小計)頁尾資料
  constructor(
    public readonly tableUtility: Fin55120TableReportUtilityService,
  ) {
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.groupTotals = {};
      this.updateGroupTotals(this.data); // 計算當前頁面資料的小計
    }
  }
  trackByFn(index: number, item: any) {
    return this.dataKey && item?.[this.dataKey] || index;
  }
  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as ReportColumn[];
  }

  /**
 * 檢查是否有任何欄位被配置為需要小計。
 * @returns 如果至少一個欄位有 subtotalField 屬性則回傳 true。
 */
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
        const subtotal = subtotalRow[col.field];
        if (subtotal === null || subtotal === undefined) {
          return ''; // 或者回傳你想顯示的空字串
        }
        // 對小計值應用格式化
        return col.format ? col.format(subtotal) : subtotal;
      }
    }

    // ** 3. 回退到前端計算的 groupTotals **
    const total = this.groupTotals[matchKey]?.[col.field] ?? 0;
    // 對小計值應用格式化
    return col.format ? col.format(total) : total;
  }

  // 對新載入的資料進行增量計算，並更新 groupTotals。
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
          const rawVal = row[field];

          // 只有當數值真正存在時才進行加總
          if (rawVal !== null && rawVal !== undefined && rawVal !== '') {
            const value = Number(rawVal);
            if (!isNaN(value)) {
              this.groupTotals[groupKey][field] = (this.groupTotals[groupKey][field] || 0) + value;
            }
          }
        }
      });
    });
  }
}

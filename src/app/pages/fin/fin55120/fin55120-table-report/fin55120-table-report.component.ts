import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
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
export class Fin55120TableReportComponent {
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
  shouldShowClassRow(data: any[], index: number): boolean {
    if (!data || index < 0) return false;

    const currentAccNo = data[index]?.AccNo;
    if (!currentAccNo) return false;

    // 第一筆資料一定要顯示分類頭
    if (index === 0) return true;

    // 取得當前前兩碼與上一筆前兩碼
    const currentPrefix = currentAccNo.substring(0, 2);
    const prevPrefix = data[index - 1]?.AccNo?.substring(0, 2);

    // 如果這兩筆的大群組 (groupName) 不同，也要重新顯示分類頭
    const currentGroup = data[index]?.groupName;
    const prevGroup = data[index - 1]?.groupName;

    return currentPrefix !== prevPrefix || currentGroup !== prevGroup;
  }
  /**
 * 判斷是否該顯示「中類小計」 (AccNo 前兩碼分類結束)
 */
  shouldShowClassFooter(data: any[], index: number): boolean {
    if (!data || index < 0) return false;
    const currentPrefix = data[index]?.AccNo?.substring(0, 2);
    const nextPrefix = data[index + 1]?.AccNo?.substring(0, 2);
    const currentGroup = data[index]?.groupName;
    const nextGroup = data[index + 1]?.groupName;

    // 如果是最後一筆，或是下一筆的前兩碼/大群組變了，就顯示小計
    return (index === data.length - 1) || (currentPrefix !== nextPrefix) || (currentGroup !== nextGroup);
  }

  /**
   * 動態計算當前 AccNo 前兩碼分類的 Balance 總和
   */
  calculateClassBalanceTotal(data: any[], currentIndex: number): number {
    const currentPrefix = data[currentIndex]?.AccNo?.substring(0, 2);
    const currentGroup = data[currentIndex]?.groupName;

    let total = 0;
    // 往回找，直到前兩碼不同或群組不同為止
    for (let i = currentIndex; i >= 0; i--) {
      const item = data[i];
      if (item.AccNo?.substring(0, 2) === currentPrefix && item.groupName === currentGroup) {
        total += (Number(item.Balance) || 0);
      } else {
        break;
      }
    }
    return total;
  }
  /**
 * 動態計算當前 AccNo 前兩碼分類的 Pct 總和 (累加該分類所有項目的百分比)
 */
  calculateClassPctTotal(data: any[], currentIndex: number): number {
    const currentPrefix = data[currentIndex]?.AccNo?.substring(0, 2);
    const currentGroup = data[currentIndex]?.groupName;

    let total = 0;
    for (let i = currentIndex; i >= 0; i--) {
      const item = data[i];
      if (item.AccNo?.substring(0, 2) === currentPrefix && item.groupName === currentGroup) {
        // 使用 Number() 轉換，確保可以進行數學運算
        total += (Number(item.Pct) || 0);
      } else {
        break;
      }
    }
    return total;
  }

  // 新增跳窗方法
  openDetail(rowData: any) {
    if (!rowData.AccNo) return;

    // 這裡設定你想開啟的網址，例如傳遞科目代碼作為參數
    const url = `#/your-route-path?accNo=${rowData.AccNo}`;

    // 使用 window.open 開啟新分頁
    window.open(url, '_blank');
  }
}

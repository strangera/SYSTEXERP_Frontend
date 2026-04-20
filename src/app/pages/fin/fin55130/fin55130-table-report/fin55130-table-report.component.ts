import { CommonModule, DatePipe, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FIN55130DetailItem } from '@service/api/fin/fin55130.service';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableColumnReorderEvent, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Fin55130TableReportUtilityService } from './fin55130-table-report-utility.service';
import { ColumnGroup, ReportColumn } from './fin55130-table-report.model';

@Component({
  selector: 'app-table-report',
  standalone: true,
  imports: [SkeletonModule, TableModule, CommonModule, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule],
  templateUrl: './fin55130-table-report.component.html',
  styleUrls: ['./fin55130-table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Fin55130TableReportComponent {
  @ViewChild('dt') public dt!: Table;
  @Input({ required: true }) totalRecords = 0;        // 用來儲存總筆數
  @Input({ required: true }) data: FIN55130DetailItem[] = [];        // 用來儲存查詢結果
  @Input() subData: FIN55130DetailItem[] = [];
  @Input({ required: true }) columns: ReportColumn[] = [];        // 用來儲存查詢結果
  @Input() dataKey: string | undefined;         // 用來儲存查詢結果
  // tableKey預設給路由名稱
  @Input() loading = false;
  public _loading = false;
  @Output() dataChange = new EventEmitter<FIN55130DetailItem[]>();  // 用來儲存查詢結果
  // 管理 欄位
  @Input() footerData: any;     // (總計)頁尾資料
  @Input() groupRowsBy?: string;    // (小計)群組欄位
  groupTotals: Record<string, Record<string, number>> = {}; // 用於儲存每個群組的總計
  @Input() subTotalData: any;    // (小計)頁尾資料
  @Input() YM: Date | null = null;

  // 欄位群組
  @Input() columnGroup?: ColumnGroup[];           // table 群組欄位
  constructor(
    public readonly tableUtility: Fin55130TableReportUtilityService,
    private readonly location: Location,
    private readonly datePipe: DatePipe
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
    if (!this.groupRowsBy || !col.isSubTotal) return '';
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

  // 修改為泛型計算，因為你有 BaseAmt, CompareAmt, DiffAmt 要算
  calculateClassTotal(data: any[], currentIndex: number, field: string): number {
    const currentPrefix = data[currentIndex]?.AccNo?.substring(0, 2);
    const currentItemTitle = data[currentIndex]?.ItemTitle; // 這裡建議用 ItemTitle 比較準

    let total = 0;
    for (let i = currentIndex; i >= 0; i--) {
      const item = data[i];
      // 檢查前兩碼以及大類是否相同
      if (item.AccNo?.substring(0, 2) === currentPrefix && item.ItemTitle === currentItemTitle) {
        total += (Number(item[field]) || 0);
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

  /**
 * 計算分類的差異百分比小計
 * 公式：(該分類差異金額合計 / 該分類比較期金額合計) * 100
 */
  calculateClassDiffPct(data: any[], currentIndex: number): number {
    const currentClass = data[currentIndex]?.ClassNo;
    const currentGroup = data[currentIndex]?.groupNo;

    // 1. 過濾出同一中類的所有項目
    const sameClassItems = data.filter(item =>
      item.ClassNo === currentClass && item.groupNo === currentGroup
    );

    let totalCompareAmt = 0; // 改用比較期金額
    let totalDiffAmt = 0;

    // 2. 加總金額
    sameClassItems.forEach(item => {
      totalCompareAmt += (Number(item.CompareAmt) || 0); // 這裡要對應後端的 CompareAmt
      totalDiffAmt += (Number(item.DiffAmt) || 0);
    });

    // 3. 財務邏輯：如果比較期(分母)是 0，則百分比為 0，避免除以零錯誤
    if (totalCompareAmt === 0) return 0;

    // 4. 回傳計算結果 (不使用 Math.abs，保留正負號反應增減)
    return (totalDiffAmt / totalCompareAmt) * 100;
  }

  // 新增跳窗方法
  // 新增跳窗方法
  openDetail(rowData: any) {
    if (!rowData.AccNo) return;

    let dateFrom = '';
    let dateTo = '';

    if (this.YM instanceof Date) {
      // 取得該日期的年份與月份
      const year = this.YM.getFullYear();
      const month = this.YM.getMonth();

      // 1. 計算該月第一天 (yyyy-MM-01)
      const firstDay = new Date(year, month, 1);

      // 2. 計算該月最後一天
      // new Date(year, month + 1, 0) 會自動跳回該月的最後一天
      const lastDay = new Date(year, month + 1, 0);

      // 3. 使用 datePipe 格式化為 yyyy-MM-dd
      dateFrom = this.datePipe.transform(firstDay, 'yyyy-MM-dd') || '';
      dateTo = this.datePipe.transform(lastDay, 'yyyy-MM-dd') || '';
    }

    // 4. 組建查詢參數
    const params = new URLSearchParams();
    params.set('accNo', rowData.AccNo);

    if (dateFrom && dateTo) {
      params.set('dateFrom', dateFrom);
      params.set('dateTo', dateTo);
    }

    // 5. 取得完整網址並開啟
    const externalUrl = this.location.prepareExternalUrl(`/account/fin/fin55130cru?${params.toString()}`);
    const finalUrl = `${window.location.origin}${externalUrl}`;

    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  }

  // 分組標題
  getGroupHeader(groupField: string): string {
    return this.columnGroup?.find(g => g.field === groupField)?.header ?? groupField;
  }
}

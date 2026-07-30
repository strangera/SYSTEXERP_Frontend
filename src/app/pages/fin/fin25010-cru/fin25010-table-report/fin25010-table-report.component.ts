/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableCaptionComponent } from '@others/component/table/import-table';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableModule, TableSelectAllChangeEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { BasicPrintDataComponent } from 'src/app/others/componentextends/basic-print/basic-print-data.component';
import { TableReportUtilityService } from './fin25010-table-report-utility.service';
import { ReportColumn } from './fin25010-table-report.model';

@Component({
  selector: 'app-table-report',
  host: { 'table-report-id': '複製時請自行取唯一名' },
  standalone: true,
  imports: [SkeletonModule, TableModule, CommonModule, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule, TableCaptionComponent],
  templateUrl: './fin25010-table-report.component.html',
  styleUrls: ['./fin25010-table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableReportComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt') public dt!: Table;
  @Input({ required: true }) totalRecords = 0;        // 用來儲存總筆數
  @Input({ required: true }) data: any[] = [];        // 用來儲存查詢結果
  @Input({ required: true }) columns: ReportColumn[] = [];        // 用來儲存查詢結果
  virtualData: any = [];
  @Input() ItemSize = 46;
  @Input() numToleratedItems?: number;
  get computedNumToleratedItems(): number {
    return this.numToleratedItems ?? Math.ceil(1000 / this.ItemSize) * 2;
  }
  @Input() dataKey: string | undefined;         // 用來儲存查詢結果
  selectedColumns: ReportColumn[] = [];     // 用來儲存查詢結果
  // tableKey預設給路由名稱
  @Input() tableKey = 'FIN25010cru';
  @Input() loading = false;
  public _loading = false;
  // Checkbox 相關
  @Input() showCheckBox = false;
  @Input() tableHeaderCheckboxLabel?: string;
  @Input() selectedItems: any = [];
  @Output() selectionChange = new EventEmitter<any>();
  @Output() selectAllChange = new EventEmitter<boolean>();
  /** 資料點選(事件) */
  @Input() isAllSelected = false;           // 是否全選
  @Output() dataChange = new EventEmitter<any[]>();  // 用來儲存查詢結果
  @Input() customTemplates: Record<string, TemplateRef<any>> = {};/** 接收外部傳入的自定義模板物件，Key 為 field 名稱 */
  // Header 相關
  @Input() footerData: any;     // (總計)頁尾資料
  @Input() footerPercentData: any;     // (百分比)頁尾資料
  @Input() extraFooterData: any; // 額外的 footer 資料（可為 object 或 array），會顯示於 footer 區塊，不對應欄位
  @Input() groupRowsBy?: string;    // (小計)群組欄位
  @Input() subTotalLabel = '小計'; // 小計列左側標籤文字
  groupTotals: Record<string, Record<string, number>> = {}; // 用於儲存每個群組的總計
  @Input() subTotalData: any;    // (小計)頁尾資料
  @Output() selectButton = new EventEmitter<any>();    // 選擇 按鈕事件
  @Input() showSummary = true; // 是否顯示 總計欄位
  @Input() footerLabel = '總計'; // 總計列左側標籤文字
  /** 多列 footer 時，每列第一欄顯示的欄位名（如 group_name）；未設則顯示 footerLabel */
  @Input() footerLabelField?: string;
  @Input() showFooterTotal = true; // 是否顯示第一列 footer 總計資料
  @Input() allowFooterHtml = false; // 是否允許 footer 使用 HTML 內嵌呈現（預設 false，避免影響既有頁面）
  // 底層匯出
  @Input() apiUrl?: string;                         // table API URL (可選)
  @Input() reportTitle?: string;                    // 自訂報表標題
  @Input() DataKeyName?: string;                    // table 資料key名稱 (可選)
  @Input() Conditions?: any;                         // table 條件 (可選)
  @Input() PrintRemark = true;                    // 是否列印備註 (可選)
  @Input() emptyMessage = '查無資料';               // 無資料時顯示訊息 (可選)
  constructor(
    public readonly tableUtility: TableReportUtilityService,
  ) {
    super();
    this.onScroll = this.onScroll.bind(this);
  }

  /** 將 footerData 正規化為陣列，供 template 依序繪製多列 footer；單一物件時為 [footerData]。 */
  get footerRows(): any[] {
    if (this.footerData == null) return [];
    return Array.isArray(this.footerData) ? this.footerData : [this.footerData];
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.isAllSelected = false;
      this.selectedItems = [];
      this.virtualData = [];
      this.groupTotals = {};
      this.updateGroupTotals(this.data); // 計算當前頁面資料的小計
      if (this.data.length !== 0) {
        if (this.dt) {
          this.dt.virtualScroll = false;
        }
        this.cdr.detectChanges();
        const flatData = this.buildVirtualData(this.data);
        this.dt.virtualScroll = flatData.length > 30; // 超過 30 筆資料才啟用虛擬滾動
        this.virtualData = Array.from({ length: flatData.length });
        this.cdr.detectChanges();
        this.virtualData = flatData;
      }
    }
  }
  /**
   * 有分組小計時，把小計列攤平成陣列裡獨立的一筆(標記 __subtotalRow)，讓虛擬滾動
   * 「一筆資料 = 一個固定高度 <tr>」的假設成立，不會因為小計多插一個 <tr> 而回彈。
   * 小計物件複製了來源列的所有欄位(而非只給 __groupSourceRow)，是因為 p-table 沒有
   * customSort、會直接對這個陣列做內部排序：欄位值跟來源列完全相同才能在排序時「打平手」，
   * 靠 Array.sort 的穩定排序特性緊跟在來源列後面；否則小計缺欄位(undefined)比較時
   * 會被排到最後面，導致所有小計都跑到資料尾端。
   */
  private buildVirtualData(data: any[]): any[] {
    if (!this.groupRowsBy || !this.hasSubtotalColumns()) return data;
    const result: any[] = [];
    data.forEach((row, idx) => {
      row.__serial = idx + 1;
      result.push(row);
      if (this.isGroupLastRow(row, idx)) {
        result.push({ ...row, __subtotalRow: true, __groupSourceRow: row });
      }
    });
    return result;
  }
  onScroll(event: any) {
    if (this._loading) return;
    if (this.selectedItems && this.selectedItems.length > 0) {
      this.selectedItems = [...this.selectedItems];
      this.cdr.detectChanges();
    }
    this.cdr.markForCheck();
  }
  // 1. 處理單一勾選變更 (在 HTML 中對應 selectionChange)
  onSelectionChange(event: any[]) {
    this.selectedItems = [...event];
    // 如果已選數量 > 0 且等於可選總數，才亮起全選
    this.isAllSelected = this.data.length > 0 && this.selectedItems.length === this.data.length;

    this.selectionChange.emit(this.selectedItems);
    this.selectAllChange.emit(this.isAllSelected);
  }
  onSelectAllChange(event: TableSelectAllChangeEvent) {
    const checked = event.checked;
    if (checked) {
      // 如果過濾完發現根本沒資料可選，則全選按鈕不應亮起
      this.isAllSelected = this.selectedItems.length > 0;
    } else {
      this.selectedItems = [];
      this.isAllSelected = false;
    }

    this.selectionChange.emit(this.selectedItems);
    this.selectAllChange.emit(this.isAllSelected);
  }
  trackByFn(index: number, item: any) {
    return this.dataKey && item?.[this.dataKey] || index;
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
    const useFormatterForGroupKey = groupColumn?.format;

    let matchKey: string;

    // ** 1. 生成用於匹配的格式化群組鍵 **
    if (useFormatterForGroupKey) {
      // 使用欄位定義中的 format 函式來產生匹配鍵
      matchKey = String(groupColumn.format!(rawGroupValue) ?? '').trim() || 'UNKNOWN_GROUP';
    } else {
      // 退回到安全轉換
      matchKey = String(rawGroupValue ?? '').trim() || 'UNKNOWN_GROUP';
    }

    // ** 2. 優先查找外部傳入的 subTotalData **
    if (this.subTotalData && this.subTotalData.length > 0 && this.groupRowsBy) {
      // 假設 subTotalData 中的分組欄位 (item[this.groupRowsBy]) 也是原始值
      // 為了確保匹配，我們需要對 subTotalData 中的分組欄位進行相同的格式化
      const subtotalRow = this.subTotalData.find((item: any) => {
        const itemRawValue = item[this.groupRowsBy as string];
        let itemMatchKey: string;

        if (useFormatterForGroupKey) {
          itemMatchKey = String(groupColumn.format?.(itemRawValue) ?? '').trim() || 'UNKNOWN_GROUP';
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

  // 對新載入的資料進行增量計算，並更新 groupTotals。
  updateGroupTotals(newData: any[]): void {
    if (!this.groupRowsBy || !this.columns.some(col => col.isSubTotal)) {
      return;
    }

    // 1. 找出作為分組依據的欄位定義
    const groupColumn = this.columns.find(col => col.field === this.groupRowsBy);
    // 檢查分組欄位是否存在且具有 format 函式
    const useFormatterForGroupKey = groupColumn?.format;

    for (const row of newData) {
      const rawValue = row[this.groupRowsBy];
      let groupKey: string;

      if (useFormatterForGroupKey) {
        // 【已修正】使用欄位定義中的 format 函式來產生分組鍵
        groupKey = String(groupColumn.format?.(rawValue) ?? '').trim() || 'UNKNOWN_GROUP';
      } else {
        // 【已修正】如果沒有 format 函式或找不到欄位定義，退回到安全轉換
        groupKey = String(rawValue ?? '').trim() || 'UNKNOWN_GROUP';
      }

      // 如果 groupKey 為 'UNKNOWN_GROUP' 且原始值為 undefined/null，可以選擇跳過
      if (groupKey === 'UNKNOWN_GROUP' && (rawValue === undefined || rawValue === null)) {
        continue;
      }

      // 初始化該群組的總計物件
      if (!this.groupTotals[groupKey]) {
        this.groupTotals[groupKey] = {};
      }

      // 進行增量加總
      for (const col of this.columns) {
        if (col.isSubTotal) {
          const field = col.field;
          // 確保值是數字，如果不是則為 0
          const value = Number(row[field]) || 0;

          // 增量加總
          this.groupTotals[groupKey][field] = (this.groupTotals[groupKey][field] || 0) + value;
        }
      }
    }
  }
}

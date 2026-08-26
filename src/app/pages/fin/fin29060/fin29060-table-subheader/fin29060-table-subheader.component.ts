/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TableCaptionComponent } from '@others/component/table/import-table';
import { Column } from '@others/component/table/table.model';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableModule } from 'primeng/table';
import { BasicPrintDataComponent } from 'src/app/others/componentextends/basic-print/basic-print-data.component';

@Component({
  selector: 'app-fin29060-table-subheader',
  standalone: true,
  imports: [CommonModule, TableModule, SkeletonModule, TableCaptionComponent],
  templateUrl: './fin29060-table-subheader.component.html',
  styleUrl: './fin29060-table-subheader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Fin29060TableSubheaderComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt') dt!: Table;
  @Input() tableKey: string | undefined = undefined;

  @Input() columns: Column[] = [];
  @Input() data: any[] = [];
  @Output() dataChange = new EventEmitter<any[]>();
  @Input() totalRecords = 0;
  @Input() rows = 30;
  @Input() totalData: any[] = [];
  @Input() groupRowsBy = 'VendorNo';
  @Output() detailWithColValue = new EventEmitter<{ row: any, col: Column, value: any }>();
  selectedColumns: Column[] = [];
  virtualData: any[] = [];
  public _loading = false;

  // --- 動態開關 ---
  public useVirtualScroll = false;
  public dynamicScrollHeight: string | undefined = undefined;

  constructor(private readonly cd: ChangeDetectorRef) { super(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      this.selectedColumns = this.columns.filter(c => !c.hidden);
    }

    if (changes['data']) {
      this.handleTableState();
    }
  }

  /**
   * 根據資料狀態手動控制 Table 特性
   */
  private handleTableState() {
    const threshold = 30; // 資料超過 30 筆就開啟虛擬滾動與固定高度

    //由固定高度改為css限制
    if (this.data && this.data.length > threshold) {
      this.useVirtualScroll = true;
      this.dynamicScrollHeight = 'calc(100vh - 350px)'; // 或固定 '450px'，但由 CSS 限制 max-height
    } else {
      this.useVirtualScroll = false;
      this.dynamicScrollHeight = undefined;
    }
    if (this.dt && (!this.dt.multiSortMeta || this.dt.multiSortMeta.length === 0)) {
      this.dt.multiSortMeta = [
        { field: this.groupRowsBy, order: 1 }
      ];
    }
    this.cd.detectChanges();
  }

  get visibleColSpan(): number {
    return 1 + this.selectedColumns.length;
  }
  /** * 判斷是否為群組的最後一行
     * 用於在虛擬滾動模式下，手動插入小計行
     */
  isGroupLastRow(rowData: any, rowIndex: number): boolean {
    if (!this.groupRowsBy || !this.data || this.data.length === 0) return false;

    // 如果是最後一筆資料，或者是下一筆資料的群組鍵值不同，就是該組的最後一行
    const nextRow = this.data[rowIndex + 1];
    return !nextRow || nextRow[this.groupRowsBy] !== rowData[this.groupRowsBy];
  }
  /** 直接從 totalData 拿後端算好的小計 */
  getGroupSum(groupValue: any, field: string): number {
    if (!this.totalData?.length) return 0;
    const entry = this.totalData.find(td => String(td?.[this.groupRowsBy] ?? '') === String(groupValue ?? ''));
    if (!entry) return 0;

    // 處理後端拼字 PayAmy 與前端欄位 PayAmt 的差異
    const normalizedField = field === 'PayAmt' ? 'PayAmy' : field;

    // 優先找 [欄位]_Subtotal，找不到則找 [欄位]
    return Number(entry[`${normalizedField}_Subtotal`] || entry[normalizedField]) || 0;
  }

  /** 直接從 totalData 拿後端算好的總計 */
  getTotalSum(field: string): number {
    if (!this.totalData?.length) return 0;
    // 總計通常是 VendorNo 為空字串或 null 的那一筆
    const totalEntry = this.totalData.find(td => !td?.[this.groupRowsBy] || td[this.groupRowsBy] === '');
    if (!totalEntry) return 0;

    // 處理後端拼字 PayAmy 與前端欄位 PayAmt 的差異
    const normalizedField = field === 'PayAmt' ? 'PayAmy' : field;

    // 優先找 [欄位]_Total，找不到則找 [欄位]
    return Number(totalEntry[`${normalizedField}_Total`] || totalEntry[normalizedField]) || 0;
  }

  detailRow(rowData: any, col: Column, value: any) {
    this.detailWithColValue.emit({ row: rowData, col, value });
  }

  /**
   * 處理排序：強制將群組欄位放在排序第一位
   */
  onSort(event: any) {
    const sortMeta = event.multiSortMeta as any[];
    if (!sortMeta || sortMeta.length === 0) return;

    // 檢查第一個排序是否為群組欄位
    const groupIdx = sortMeta.findIndex(s => s.field === this.groupRowsBy);

    if (groupIdx !== 0) {
      // 如果群組欄位不在第一位，將其移到最前面
      let groupSort;
      if (groupIdx === -1) {
        // 如果目前排序沒包含群組欄位，手動補一個預設升冪
        groupSort = { field: this.groupRowsBy, order: 1 };
      } else {
        // 如果有在後面，把它抽出來
        groupSort = sortMeta.splice(groupIdx, 1)[0];
      }
      sortMeta.unshift(groupSort);
    }

    // 更新 Table 的排序狀態 (這會觸發前端資料重排)
    this.dt.multiSortMeta = [...sortMeta];
    this.cd.detectChanges();
  }
}
